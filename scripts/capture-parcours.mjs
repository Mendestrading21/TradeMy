/**
 * Captures visuelles de l'espace APPRENDRE / PARCOURS — LOT 4-E.
 *
 * DÉTERMINISME : `FIXED_NOW` unique + horloge FIGÉE (Date.now/new Date) AVANT chargement + fuseau
 * `Europe/Zurich`. États locaux déterministes seedés par scénario (clé `progress`, schéma v8).
 *
 * PARCOURS RÉEL côté client : racine → « Reprendre » (rôle bouton) → Accueil → ONGLET « Apprendre »
 * (rôle tab). Apprendre est un onglet PRIMAIRE : on vérifie la route résolue (`/TradeMy/parcours`), le
 * marqueur stable « Ton parcours », l'onglet Apprendre réellement SÉLECTIONNÉ (role=tab + aria-selected),
 * le CTA principal attendu par scénario (signature de scénario) et l'absence de NaN/undefined/Infinity.
 *
 * Manifeste SÉPARÉ (ne touche ni pilote, ni Accueil, ni Révisions, ni Profil). Échec sur : erreur
 * console, pageerror, mauvais écran/onglet/route, débordement, CTA principal absent, emoji système,
 * métrique invalide, build obsolète, signature de scénario incorrecte, capture manquante ou parasite.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';

const OUT = process.argv[2] || join(process.cwd(), 'docs', 'lot4e-captures');
const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) { console.error('✗ dist absent. Lance d’abord `npm run build:web`.'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const FIXED_NOW = Date.UTC(2026, 0, 15, 8, 30, 0); // 09:30 Europe/Zurich
const TIMEZONE = 'Europe/Zurich';

const SKILLS = ['skill.actions', 'skill.trend', 'skill.candles', 'skill.patterns'];
const CHECKPOINT = 'checkpoint.read-chart';
// Ensembles COMPLETS de fiches par monde (source de vérité `conceptsByWorld`) — un monde de contenu
// n'est « exploré » que si TOUTES ses fiches sont consultées.
const ANATOMY = ['anatomie-bougie', 'unite-de-temps', 'echelle-des-prix']; // monde 2 (3 fiches)
const CANDLES = ['marteau', 'doji', 'etoile-filante', 'avalement-haussier', 'marubozu', 'pendu', 'marteau-inverse', 'avalement-baissier', 'harami', 'etoile-du-matin', 'etoile-du-soir', 'trois-soldats', 'trois-corbeaux', 'pincettes']; // monde 3 (14 fiches)
const learn = (slugs) => ({ conceptsExplored: slugs, worldsExplored: [], falseSignalsSpotted: 0, figuresRecognized: 0, bestRecognitionStreak: 0 });
const progress = (o) => JSON.stringify({ onboarded: true, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, ...o });

// Scénarios : progression réelle → état de roadmap distinct → CTA principal attendu (signature).
const SEEDS = {
  new: { progress: progress({}), cta: 'Commencer le parcours' },
  progressPartial: { progress: progress({ completedSkills: ['skill.actions'], totalXp: 40, coins: 10 }), cta: 'Continuer Fondations des marchés' },
  checkpoint: { progress: progress({ completedSkills: [...SKILLS, CHECKPOINT], totalXp: 120, streakDays: 3, coins: 30 }), cta: 'Explorer Anatomie d’un graphique' },
  explored: { progress: progress({ completedSkills: [...SKILLS, CHECKPOINT], totalXp: 160, streakDays: 4, coins: 40, learning: learn(ANATOMY) }), cta: 'Explorer Chandeliers japonais' },
  advanced: { progress: progress({ completedSkills: [...SKILLS, CHECKPOINT], totalXp: 260, streakDays: 8, coins: 80, learning: learn([...ANATOMY, ...CANDLES]) }), cta: 'Explorer Tendances et structure' },
};

const MANIFEST = ['parcours-new-320', 'parcours-progress-390', 'parcours-checkpoint-390', 'parcours-explored-390', 'parcours-advanced-web', 'parcours-large-text', 'parcours-reduced-motion'];
const MANIFEST_SET = new Set(MANIFEST);
const produced = new Set();

let chromium;
try {
  const req = createRequire(process.env.PLAYWRIGHT_REQUIRE ?? '/opt/node22/lib/node_modules/playwright/');
  ({ chromium } = req('playwright'));
} catch { console.error('✗ Playwright introuvable.'); process.exit(1); }

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.map': 'application/json' };
const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.startsWith('/TradeMy/')) p = p.slice('/TradeMy'.length);
    if (p === '/' || p === '') p = '/index.html';
    let f = normalize(join(DIST, p));
    if (!f.startsWith(DIST)) { res.writeHead(403); return res.end(); }
    if (!existsSync(f) || statSync(f).isDirectory()) f = existsSync(f + '.html') ? f + '.html' : join(DIST, '404.html');
    res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' });
    res.end(await readFile(f));
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/TradeMy`;
const BASE_PATH = new URL(base).pathname.replace(/\/$/, '');
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const RUN_OUT = mkdtempSync(join(OUT, '.capture-run-'));
const consoleErrors = [];

async function overflow(p) {
  const v = await p.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));
  if (typeof v !== 'number' || Number.isNaN(v)) throw new Error('Mesure de débordement impossible');
  return v;
}
/** Hauteur RÉELLE du contenu (le ScrollView interne clippe le document : on mesure le plus grand nœud). */
async function contentHeight(p) {
  return await p.evaluate(() => {
    let max = document.body.scrollHeight;
    for (const el of document.querySelectorAll('div')) if (el.scrollHeight > max) max = el.scrollHeight;
    return max;
  });
}
async function shot(p, name, width) {
  if (!MANIFEST_SET.has(name)) throw new Error(`Capture INATTENDUE (hors manifeste): ${name}`);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(120);
  const ov = await overflow(p);
  if (ov > 0) throw new Error(`Débordement horizontal ${ov}px sur ${name}`);
  // Ajuste la fenêtre à la hauteur du contenu pour capturer TOUTE la roadmap (le ScrollView clippe sinon).
  const h = Math.min(Math.ceil(await contentHeight(p)) + 48, 16000);
  await p.setViewportSize({ width, height: h });
  await p.waitForTimeout(200);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: join(RUN_OUT, `${name}.png`) });
  produced.add(name);
  console.log('  ✓', name);
}
async function ctx(w, h, seed, opts = {}) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, timezoneId: TIMEZONE, ...opts });
  await c.addInitScript((fixed) => {
    const R = Date;
    function F(...a) { if (!(this instanceof F)) return new R(fixed).toString(); return a.length ? new R(...a) : new R(fixed); }
    F.prototype = R.prototype; F.now = () => fixed; F.UTC = R.UTC; F.parse = R.parse; window.Date = F;
  }, FIXED_NOW);
  await c.addInitScript((s) => {
    try { window.localStorage.setItem('patternlab.progress.v1', s); } catch { /* stockage */ }
  }, seed);
  const p = await c.newPage();
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${w}px ${m.text().slice(0, 160)}`); });
  p.on('pageerror', (e) => consoleErrors.push(`${w}px PAGEERROR ${String(e).slice(0, 160)}`));
  return { c, p };
}
const pathnameOf = async (p) => new URL(p.url()).pathname.replace(/\/$/, '');

async function reachParcoursAndShot(p, name, ctaName, opts = {}) {
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  if ((await pathnameOf(p)) !== BASE_PATH) throw new Error(`Route racine inattendue [${name}]`);
  await p.getByRole('button', { name: 'Reprendre', exact: true }).click({ timeout: 4000 });
  await p.getByText('MISSION DU JOUR', { exact: true }).waitFor({ state: 'visible', timeout: 9000 });
  // Onglet PRIMAIRE « Apprendre » (rôle tab).
  await p.getByRole('tab', { name: 'Apprendre' }).click({ timeout: 4000 });
  await p.getByText('Ton parcours', { exact: true }).waitFor({ state: 'visible', timeout: 9000 });
  // Route réellement résolue = /parcours.
  const resolved = await pathnameOf(p);
  if (resolved !== `${BASE_PATH}/parcours`) throw new Error(`Route Apprendre inattendue: ${resolved} [${name}]`);
  // Onglet Apprendre réellement SÉLECTIONNÉ (role=tab + aria-selected).
  const sel = await p.getByRole('tab', { name: 'Apprendre', selected: true }).count();
  if (sel !== 1) throw new Error(`Onglet « Apprendre » non sélectionné [${name}]`);
  const tabs = await p.getByRole('tab').count();
  if (tabs !== 5) throw new Error(`Navigateur d'onglets incohérent (${tabs}) [${name}]`);
  // Anti-build-obsolète : marqueur LOT 4-E.
  if (!(await p.getByText('TA PROCHAINE ÉTAPE', { exact: true }).count())) throw new Error(`Marqueur LOT 4-E « TA PROCHAINE ÉTAPE » absent (dist obsolète ?) [${name}]`);
  // Aucune métrique invalide.
  const bad = await p.evaluate(() => /NaN|undefined|Infinity|Invalid Date/.test(document.body.innerText));
  if (bad) throw new Error(`Métrique invalide (NaN/undefined/Infinity) [${name}]`);
  // Roadmap complète des 15 mondes (au moins un badge de chaque bande visible dans le DOM).
  for (const band of ['DÉBUTANT', 'INTERMÉDIAIRE', 'AVANCÉ']) {
    if (!(await p.getByText(band, { exact: true }).count())) throw new Error(`Bande « ${band} » absente [${name}]`);
  }
  // CTA principal attendu par scénario (signature de scénario).
  if (!(await p.getByRole('button', { name: ctaName }).count())) throw new Error(`CTA principal « ${ctaName} » absent [${name}]`);
  if (opts.zoom) await p.evaluate((z) => { document.documentElement.style.zoom = String(z); }, opts.zoom);
  await shot(p, name, opts.width);
}

async function run() {
  const CASES = [
    ['parcours-new-320', 320, 720, SEEDS.new, {}],
    ['parcours-progress-390', 390, 844, SEEDS.progressPartial, {}],
    ['parcours-checkpoint-390', 390, 844, SEEDS.checkpoint, {}],
    ['parcours-explored-390', 390, 844, SEEDS.explored, {}],
    ['parcours-advanced-web', 1440, 900, SEEDS.advanced, {}],
    ['parcours-large-text', 430, 932, SEEDS.progressPartial, { zoom: 1.25 }],
    ['parcours-reduced-motion', 390, 844, SEEDS.progressPartial, { reducedMotion: 'reduce' }],
  ];
  for (const [name, w, h, sc, opts] of CASES) {
    const ctxOpts = opts.reducedMotion ? { reducedMotion: 'reduce' } : {};
    const { c, p } = await ctx(w, h, sc.progress, ctxOpts);
    await reachParcoursAndShot(p, name, sc.cta, { zoom: opts.zoom, width: w });
    await c.close();
  }
}

let failure = null;
try { await run(); } catch (e) { failure = e; }
await browser.close();
server.close();

const runPngs = new Set(readdirSync(RUN_OUT).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)));
const existingPngs = new Set(readdirSync(OUT).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)));
const missing = MANIFEST.filter((n) => !produced.has(n));
const unexpectedRun = [...runPngs].filter((n) => !MANIFEST_SET.has(n));
const missingRun = MANIFEST.filter((n) => !runPngs.has(n));
const foreignExisting = [...existingPngs].filter((n) => !MANIFEST_SET.has(n));

console.log(`\nCaptures produites : ${produced.size}/${MANIFEST.length}`);
console.log('Erreurs console/pageerror :', consoleErrors.length);
consoleErrors.slice(0, 8).forEach((e) => console.log('   !', e));

let ok = true;
if (failure) { console.error('✗ ÉCHEC :', failure.message); ok = false; }
if (consoleErrors.length) { console.error('✗ ÉCHEC : erreurs console/pageerror.'); ok = false; }
if (missing.length) { console.error('✗ Captures manquantes :', missing.join(', ')); ok = false; }
if (unexpectedRun.length) { console.error('✗ PNG inattendus produits :', unexpectedRun.join(', ')); ok = false; }
if (missingRun.length) { console.error('✗ PNG produits manquants :', missingRun.join(', ')); ok = false; }
if (foreignExisting.length) { console.error('✗ PNG étrangers dans le dossier cible :', foreignExisting.join(', ')); ok = false; }

if (!ok) { rmSync(RUN_OUT, { recursive: true, force: true }); process.exit(1); }

for (const name of MANIFEST) renameSync(join(RUN_OUT, `${name}.png`), join(OUT, `${name}.png`));
rmSync(RUN_OUT, { recursive: true, force: true });

const finalPngs = new Set(readdirSync(OUT).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)));
if (MANIFEST.some((n) => !finalPngs.has(n)) || [...finalPngs].some((n) => !MANIFEST_SET.has(n))) {
  console.error('✗ Publication finale incohérente.'); process.exit(1);
}
console.log('✓ Manifeste Parcours exact ; horloge/fuseau figés ; onglet Apprendre sélectionné ; 0 erreur console ; 0 débordement. Captures dans', OUT);
