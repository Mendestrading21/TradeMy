/**
 * Captures visuelles de l'écran PROFIL — LOT 4-D.
 *
 * DÉTERMINISME : `FIXED_NOW` unique + horloge FIGÉE (Date.now/new Date) AVANT chargement + fuseau
 * `Europe/Zurich`. États locaux déterministes seedés par scénario (progress + onboarding).
 *
 * PARCOURS RÉEL côté client : racine → « Reprendre » (rôle bouton) → Accueil → ONGLET « Profil »
 * (rôle tab). Profil est un onglet PRIMAIRE : on vérifie la route résolue (`/TradeMy/profil`), le
 * marqueur stable « Apprenti Trademy », l'onglet Profil réellement SÉLECTIONNÉ (role=tab +
 * aria-selected), le CTA principal attendu par scénario, et l'absence de NaN/undefined/Invalid Date.
 *
 * Manifeste SÉPARÉ (ne touche ni pilote, ni Accueil, ni Révisions). Échec sur : erreur console,
 * pageerror, mauvais écran/onglet, débordement, CTA principal absent, emoji système, métrique
 * invalide (NaN/undefined), build obsolète, signature de scénario incorrecte, capture manquante.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';

const OUT = process.argv[2] || join(process.cwd(), 'docs', 'lot4d-captures');
const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) { console.error('✗ dist absent. Lance d’abord `npm run build:web`.'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const FIXED_NOW = Date.UTC(2026, 0, 15, 8, 30, 0); // 09:30 Europe/Zurich
const TIMEZONE = 'Europe/Zurich';
const DAY = 24 * 60 * 60 * 1000;

const ONBOARDING = JSON.stringify({ schemaVersion: 1, objective: 'debuter', level: 'debutant', dailyMinutes: 5, topics: ['chandeliers'], diagnosticDone: true, diagnosticScore: 0.6, startSkillId: 'skill.actions', guide: 'toto', completedAt: '2026-01-01T09:00:00.000Z' });
const progress = (o) => JSON.stringify({ onboarded: true, schemaVersion: 8, ...o });
const learn = (n) => ({ conceptsExplored: Array.from({ length: n }, (_, i) => `c${i}`), worldsExplored: [], falseSignalsSpotted: 0, figuresRecognized: 0, bestRecognitionStreak: 0 });
const rev = (dueAt) => ({ repetitions: 2, easiness: 2.5, intervalDays: 1, dueAt });

// Scénarios : { seed:{progress, onboarding}, ctaName, marker }
const SEEDS = {
  new: { progress: progress({}), onboarding: null, cta: 'Commencer le parcours' },
  progress: {
    progress: progress({ completedSkills: ['skill.actions', 'skill.trend'], totalXp: 320, streakDays: 7, coins: 60, learning: learn(9), skills: { 'skill.actions': { skillId: 'skill.actions', xp: 90, mastery: 0.7, confidence: 0.7, review: rev(FIXED_NOW + 3 * DAY), errorTags: { 'couleur-seule': 1 } }, 'skill.trend': { skillId: 'skill.trend', xp: 70, mastery: 0.6, confidence: 0.6, review: rev(FIXED_NOW + 3 * DAY), errorTags: {} } } }),
    onboarding: ONBOARDING, cta: 'Continuer le parcours',
  },
  advanced: {
    progress: progress({ completedSkills: ['skill.actions', 'skill.trend', 'skill.candles', 'skill.patterns'], totalXp: 850, streakDays: 30, coins: 200, learning: learn(24), skills: { 'skill.actions': { skillId: 'skill.actions', xp: 200, mastery: 0.95, confidence: 0.95, review: rev(FIXED_NOW + 5 * DAY), errorTags: {} }, 'skill.candles': { skillId: 'skill.candles', xp: 180, mastery: 0.9, confidence: 0.9, review: rev(FIXED_NOW + 5 * DAY), errorTags: {} } } }),
    onboarding: ONBOARDING, cta: 'Continuer le parcours',
  },
  'revisions-due': {
    progress: progress({ completedSkills: ['skill.actions'], totalXp: 150, streakDays: 3, coins: 20, learning: learn(3), skills: { 'skill.actions': { skillId: 'skill.actions', xp: 60, mastery: 0.6, confidence: 0.6, review: rev(FIXED_NOW - DAY), errorTags: { 'couleur-seule': 2 } } } }),
    onboarding: ONBOARDING, cta: 'Réviser maintenant',
  },
  'empty-achievements': {
    progress: progress({ completedSkills: [], totalXp: 40, streakDays: 1, coins: 0, learning: learn(1), skills: { 'skill.actions': { skillId: 'skill.actions', xp: 40, mastery: 0.2, confidence: 0.1, review: rev(FIXED_NOW + 2 * DAY), errorTags: {} } } }),
    onboarding: null, cta: 'Continuer le parcours',
  },
};

const MANIFEST = ['profil-new-320', 'profil-progress-390', 'profil-advanced-web', 'profil-revisions-due', 'profil-empty-achievements', 'profil-large-text', 'profil-reduced-motion'];
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
async function shot(p, name) {
  if (!MANIFEST_SET.has(name)) throw new Error(`Capture INATTENDUE (hors manifeste): ${name}`);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(180);
  const ov = await overflow(p);
  if (ov > 0) throw new Error(`Débordement horizontal ${ov}px sur ${name}`);
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
    try {
      window.localStorage.setItem('patternlab.progress.v1', s.progress);
      if (s.onboarding) window.localStorage.setItem('patternlab.onboarding.v1', s.onboarding);
    } catch { /* stockage */ }
  }, seed);
  const p = await c.newPage();
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${w}px ${m.text().slice(0, 160)}`); });
  p.on('pageerror', (e) => consoleErrors.push(`${w}px PAGEERROR ${String(e).slice(0, 160)}`));
  return { c, p };
}
const pathnameOf = async (p) => new URL(p.url()).pathname.replace(/\/$/, '');

async function reachProfilAndShot(p, name, ctaName, opts = {}) {
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  if ((await pathnameOf(p)) !== BASE_PATH) throw new Error(`Route racine inattendue [${name}]`);
  await p.getByRole('button', { name: 'Reprendre', exact: true }).click({ timeout: 4000 });
  await p.getByText('MISSION DU JOUR', { exact: true }).waitFor({ state: 'visible', timeout: 9000 });
  // Onglet PRIMAIRE « Profil » (rôle tab).
  await p.getByRole('tab', { name: 'Profil' }).click({ timeout: 4000 });
  await p.getByText('Apprenti Trademy', { exact: true }).waitFor({ state: 'visible', timeout: 9000 });
  // Route réellement résolue = /profil.
  const resolved = await pathnameOf(p);
  if (resolved !== `${BASE_PATH}/profil`) throw new Error(`Route Profil inattendue: ${resolved} [${name}]`);
  // Onglet Profil réellement SÉLECTIONNÉ (role=tab + aria-selected).
  const sel = await p.getByRole('tab', { name: 'Profil', selected: true }).count();
  if (sel !== 1) throw new Error(`Onglet « Profil » non sélectionné [${name}]`);
  const tabs = await p.getByRole('tab').count();
  if (tabs !== 5) throw new Error(`Navigateur d'onglets incohérent (${tabs}) [${name}]`);
  // Anti-build-obsolète : marqueur LOT 4-D.
  if (!(await p.getByText('TA PROGRESSION', { exact: true }).count())) throw new Error(`Marqueur LOT 4-D « TA PROGRESSION » absent (dist obsolète ?) [${name}]`);
  // Aucune métrique invalide.
  const bad = await p.evaluate(() => /NaN|undefined|Invalid Date/.test(document.body.innerText));
  if (bad) throw new Error(`Métrique invalide (NaN/undefined/Invalid Date) [${name}]`);
  // CTA principal attendu par scénario (signature de scénario).
  if (!(await p.getByRole('button', { name: ctaName }).count())) throw new Error(`CTA principal « ${ctaName} » absent [${name}]`);
  if (opts.zoom) await p.evaluate((z) => { document.documentElement.style.zoom = String(z); }, opts.zoom);
  await shot(p, name);
}

async function run() {
  const CASES = [
    ['profil-new-320', 320, 720, SEEDS.new, {}],
    ['profil-progress-390', 390, 844, SEEDS.progress, {}],
    ['profil-advanced-web', 1440, 900, SEEDS.advanced, {}],
    ['profil-revisions-due', 390, 844, SEEDS['revisions-due'], {}],
    ['profil-empty-achievements', 390, 844, SEEDS['empty-achievements'], {}],
    ['profil-large-text', 430, 932, SEEDS.progress, { zoom: 1.25 }],
    ['profil-reduced-motion', 390, 844, SEEDS.progress, { reducedMotion: 'reduce' }],
  ];
  for (const [name, w, h, sc, opts] of CASES) {
    const ctxOpts = opts.reducedMotion ? { reducedMotion: 'reduce' } : {};
    const { c, p } = await ctx(w, h, { progress: sc.progress, onboarding: sc.onboarding }, ctxOpts);
    await reachProfilAndShot(p, name, sc.cta, { zoom: opts.zoom });
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
console.log('✓ Manifeste Profil exact ; horloge/fuseau figés ; onglet Profil sélectionné ; 0 erreur console ; 0 débordement. Captures dans', OUT);
