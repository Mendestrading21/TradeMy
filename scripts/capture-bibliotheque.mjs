/**
 * Captures visuelles de l'espace BIBLIOTHÈQUE — LOT 4-F.
 *
 * DÉTERMINISME : `FIXED_NOW` unique + horloge FIGÉE (Date.now/new Date) AVANT chargement + fuseau
 * `Europe/Zurich`. États locaux déterministes seedés par scénario (clés `progress` v8 + `glossaryprefs`).
 * Les filtres/recherche/collections sont un ÉTAT LOCAL — on les atteint par de VRAIES interactions.
 *
 * PARCOURS RÉEL côté client : racine → « Reprendre » (rôle bouton) → Accueil → ONGLET « Bibliothèque »
 * (rôle tab). On vérifie la route résolue (`/TradeMy/apprendre`), l'onglet Bibliothèque réellement
 * SÉLECTIONNÉ (role=tab + aria-selected), le marqueur stable « Solide » (pilule de filtre LOT 4-F,
 * anti-build-obsolète), la signature de scénario, et l'absence de NaN/undefined/Infinity et d'étoile Unicode.
 *
 * Manifeste SÉPARÉ (ne touche ni pilote, ni Accueil, ni Révisions, ni Profil, ni Parcours). Échec sur :
 * erreur console, pageerror, mauvais écran/onglet/route, débordement, emoji/étoile Unicode, métrique
 * invalide, build obsolète, signature de scénario incorrecte, capture manquante ou parasite.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';

const OUT = process.argv[2] || join(process.cwd(), 'docs', 'lot4f-captures');
const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) { console.error('✗ dist absent. Lance d’abord `npm run build:web`.'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const FIXED_NOW = Date.UTC(2026, 0, 15, 8, 30, 0); // 09:30 Europe/Zurich
const TIMEZONE = 'Europe/Zurich';

const OBJS = ['concept.candle-anatomy::recognize', 'concept.candle-anatomy::interpret', 'concept.candle-anatomy::avoid-false-signal'];
const proven = (o) => ({ objectiveId: o, conceptId: 'concept.candle-anatomy', attempts: 6, correct: 6, sessions: 2, lastCorrect: true, review: { repetitions: 2, easiness: 2.5, intervalDays: 6, dueAt: 0 } });
const FULL_COVERAGE = Object.fromEntries(OBJS.map((o) => [o, proven(o)]));
const progress = (o) => JSON.stringify({ onboarded: true, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, learning: { conceptsExplored: [] }, skills: {}, targets: {}, ...o });
const prefs = (favorites = [], recent = []) => JSON.stringify({ favorites, recent });

const MASTERED = progress({ learning: { conceptsExplored: ['anatomie-bougie', 'marteau', 'doji'] }, targets: FULL_COVERAGE, completedSkills: ['checkpoint.read-chart'] });

// Scénario = { progress, prefs?, action?(page), signature(page) }
const SCENARIOS = {
  new: { progress: progress({}) },
  search: { progress: progress({}), action: async (p) => { await p.getByLabel('Rechercher un concept').fill('marteau'); } },
  filtered: { progress: progress({}), action: async (p) => { await p.getByText('Indicateurs · 4', { exact: true }).click(); } },
  favorites: { progress: progress({}), prefs: prefs(['marteau', 'doji', 'rsi']), action: async (p) => { await p.getByLabel('Collection').getByText('Favoris', { exact: true }).click(); } },
  recent: { progress: progress({}), prefs: prefs([], ['rsi', 'marteau', 'doji']), action: async (p) => { await p.getByLabel('Collection').getByText('Récents', { exact: true }).click(); } },
  mastered: { progress: MASTERED, action: async (p) => { await p.getByLabel('Rechercher un concept').fill('anatomie'); } },
  empty: { progress: progress({}), action: async (p) => { await p.getByLabel('Rechercher un concept').fill('zzznope'); } },
  advanced: { progress: MASTERED },
};

const MANIFEST = [
  'bibliotheque-new-320', 'bibliotheque-search-390', 'bibliotheque-filtered-390', 'bibliotheque-favorites-390',
  'bibliotheque-recent-390', 'bibliotheque-mastered-390', 'bibliotheque-empty-390', 'bibliotheque-advanced-web',
  'bibliotheque-large-text', 'bibliotheque-reduced-motion',
];
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
  await p.waitForTimeout(160);
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
      if (s.prefs) window.localStorage.setItem('patternlab.glossaryprefs.v1', s.prefs);
    } catch { /* stockage */ }
  }, seed);
  const p = await c.newPage();
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${w}px ${m.text().slice(0, 160)}`); });
  p.on('pageerror', (e) => consoleErrors.push(`${w}px PAGEERROR ${String(e).slice(0, 160)}`));
  return { c, p };
}
const pathnameOf = async (p) => new URL(p.url()).pathname.replace(/\/$/, '');

async function reachBiblioAndShot(p, name, sc, opts = {}) {
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  if ((await pathnameOf(p)) !== BASE_PATH) throw new Error(`Route racine inattendue [${name}]`);
  await p.getByRole('button', { name: 'Reprendre', exact: true }).click({ timeout: 4000 });
  await p.getByText('MISSION DU JOUR', { exact: true }).waitFor({ state: 'visible', timeout: 9000 });
  await p.getByRole('tab', { name: 'Bibliothèque' }).click({ timeout: 4000 });
  await p.getByRole('heading', { name: 'Bibliothèque' }).waitFor({ state: 'visible', timeout: 9000 });
  const resolved = await pathnameOf(p);
  if (resolved !== `${BASE_PATH}/apprendre`) throw new Error(`Route Bibliothèque inattendue: ${resolved} [${name}]`);
  const sel = await p.getByRole('tab', { name: 'Bibliothèque', selected: true }).count();
  if (sel !== 1) throw new Error(`Onglet « Bibliothèque » non sélectionné [${name}]`);
  const tabs = await p.getByRole('tab').count();
  if (tabs !== 5) throw new Error(`Navigateur d'onglets incohérent (${tabs}) [${name}]`);
  // Anti-build-obsolète : pilule d'état strict « Solide » (introuvable avant LOT 4-F).
  if (!(await p.getByText('Solide', { exact: true }).count())) throw new Error(`Marqueur LOT 4-F « Solide » absent (dist obsolète ?) [${name}]`);
  // Action de scénario (recherche / filtre / collection).
  if (sc.action) { await sc.action(p); await p.waitForTimeout(220); }
  // Aucune métrique invalide ni étoile Unicode.
  const bad = await p.evaluate(() => ({ metric: /NaN|undefined|Infinity|Invalid Date/.test(document.body.innerText), star: /[★☆]/.test(document.body.innerText) }));
  if (bad.metric) throw new Error(`Métrique invalide (NaN/undefined/Infinity) [${name}]`);
  if (bad.star) throw new Error(`Étoile Unicode ★/☆ présente [${name}]`);
  // Recherche toujours présente.
  if (!(await p.getByLabel('Rechercher un concept').count())) throw new Error(`Champ de recherche absent [${name}]`);
  // Signature de scénario (VISIBLE uniquement : les onglets inactifs restent montés dans le DOM).
  if (opts.expectText && !(await p.getByText(opts.expectText, { exact: false }).and(p.locator(':visible')).count())) throw new Error(`Signature « ${opts.expectText} » absente [${name}]`);
  if (opts.zoom) await p.evaluate((z) => { document.documentElement.style.zoom = String(z); }, opts.zoom);
  await shot(p, name);
}

async function run() {
  const CASES = [
    ['bibliotheque-new-320', 320, 1200, SCENARIOS.new, { expectText: `sur ` }],
    ['bibliotheque-search-390', 390, 1000, SCENARIOS.search, { expectText: 'correspondant' }],
    ['bibliotheque-filtered-390', 390, 1000, SCENARIOS.filtered, { expectText: 'famille Indicateurs' }],
    ['bibliotheque-favorites-390', 390, 900, SCENARIOS.favorites, { expectText: '3 concepts' }],
    ['bibliotheque-recent-390', 390, 900, SCENARIOS.recent, { expectText: '3 concepts' }],
    ['bibliotheque-mastered-390', 390, 900, SCENARIOS.mastered, { expectText: 'Maîtrisé' }],
    ['bibliotheque-empty-390', 390, 800, SCENARIOS.empty, { expectText: 'Aucun concept ne correspond' }],
    ['bibliotheque-advanced-web', 1440, 1100, SCENARIOS.advanced, { expectText: 'Maîtrisé' }],
    ['bibliotheque-large-text', 430, 1400, SCENARIOS.new, { zoom: 1.25, expectText: 'sur ' }],
    ['bibliotheque-reduced-motion', 390, 1000, SCENARIOS.new, { reducedMotion: true, expectText: 'sur ' }],
  ];
  for (const [name, w, h, sc, opts] of CASES) {
    const ctxOpts = opts.reducedMotion ? { reducedMotion: 'reduce' } : {};
    const { c, p } = await ctx(w, h, { progress: sc.progress, prefs: sc.prefs }, ctxOpts);
    await reachBiblioAndShot(p, name, sc, opts);
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
console.log('✓ Manifeste Bibliothèque exact ; horloge/fuseau figés ; onglet Bibliothèque sélectionné ; 0 erreur console ; 0 débordement. Captures dans', OUT);
