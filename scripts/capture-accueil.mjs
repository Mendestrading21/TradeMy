/**
 * Captures visuelles de l'écran d'ACCUEIL (onglet Accueil) — LOT 4-B.
 *
 * PARCOURS RÉEL côté client (jamais un deep-link vers `/(tabs)`) :
 *   1. on prépare un état local déterministe « déjà onboardé » (seed AsyncStorage/localStorage) ;
 *   2. on ouvre la route RACINE `/` (l'écran d'accueil racine s'hydrate correctement) ;
 *   3. on actionne « Reprendre » (navigation CLIENT vers l'onglet Accueil) ;
 *   4. on attend le marqueur STABLE « MISSION DU JOUR » ;
 *   5. on VÉRIFIE la route réellement résolue par Expo Router (`…/(tabs)`) ;
 *   6. on capture l'écran.
 * Ce chemin n'introduit AUCUNE divergence d'hydratation (l'app boote à `/`, puis route côté client).
 *
 * Manifeste SÉPARÉ des 22 captures pilote (jamais modifié ici). Le script ÉCHOUE (code 1) sur :
 * erreur console, pageerror, débordement horizontal > 0, mauvais écran (route/ marqueur), capture
 * manquante ou inattendue. Production isolée puis publication atomique des seuls PNG gérés.
 *
 * Repro : `npm run build:web` puis `node scripts/capture-accueil.mjs [dossierSortie]`.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';

const OUT = process.argv[2] || join(process.cwd(), 'docs', 'lot4b-captures');
const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) {
  console.error('✗ dist absent. Lance d’abord `npm run build:web`.');
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

// ── Manifeste EXACT des captures Accueil (sans extension) ──
const MANIFEST = ['accueil-320', 'accueil-390', 'accueil-web', 'accueil-reduced'];
const MANIFEST_SET = new Set(MANIFEST);
const produced = new Set();

let chromium;
try {
  const req = createRequire(process.env.PLAYWRIGHT_REQUIRE ?? '/opt/node22/lib/node_modules/playwright/');
  ({ chromium } = req('playwright'));
} catch {
  console.error('✗ Playwright introuvable. Installe-le (npm i -g playwright) pour reproduire les captures.');
  process.exit(1);
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.map': 'application/json' };
const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.startsWith('/TradeMy/')) p = p.slice('/TradeMy'.length);
    if (p === '/' || p === '') p = '/index.html';
    let f = normalize(join(DIST, p));
    if (!f.startsWith(DIST)) { res.writeHead(403); return res.end(); }
    if (!existsSync(f) || statSync(f).isDirectory()) {
      if (existsSync(f + '.html')) f = f + '.html';
      else f = join(DIST, '404.html');
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' });
    res.end(await readFile(f));
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/TradeMy`;
const BASE_PATH = new URL(base).pathname.replace(/\/$/, ''); // « /TradeMy »
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const RUN_OUT = mkdtempSync(join(OUT, '.capture-run-'));

const consoleErrors = [];

/** État persistant déterministe : onboardé (schéma v8), aucune compétence terminée. */
const SEED = JSON.stringify({ onboarded: true, schemaVersion: 8 });

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

async function ctx(w, h, opts = {}) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, ...opts });
  // Seed AVANT tout script de page (sur chaque navigation) → l'accueil racine lit `onboarded=true`.
  await c.addInitScript((seed) => {
    try { window.localStorage.setItem('patternlab.progress.v1', seed); } catch { /* stockage indisponible */ }
  }, SEED);
  const p = await c.newPage();
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${w}px ${m.text().slice(0, 160)}`); });
  p.on('pageerror', (e) => consoleErrors.push(`${w}px PAGEERROR ${String(e).slice(0, 160)}`));
  return { c, p };
}

const MISSION = /MISSION DU JOUR/;
const RESUME = /Reprendre/;

async function pathnameOf(p) {
  return new URL(p.url()).pathname.replace(/\/$/, '');
}

/** Ouvre `/`, actionne « Reprendre », atteint l'Accueil, vérifie la route résolue, capture. */
async function reachAccueilAndShot(p, name) {
  // 2) Route racine — l'écran d'accueil racine s'hydrate proprement.
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  if ((await pathnameOf(p)) !== BASE_PATH) {
    throw new Error(`Route racine inattendue: ${await pathnameOf(p)} (attendu ${BASE_PATH}) [${name}]`);
  }
  // L'état onboardé est bien lu → l'action « Reprendre » est présente (pas « Commencer »).
  try {
    await p.getByText(RESUME).first().waitFor({ timeout: 9000 });
  } catch {
    throw new Error(`Landing « Reprendre » absent (état onboardé non lu) [${name}]`);
  }
  // 3) Navigation CLIENT vers l'onglet Accueil.
  await p.getByText(RESUME).first().click({ timeout: 2000 });
  // 4) Marqueur STABLE de l'Accueil.
  try {
    await p.getByText(MISSION).first().waitFor({ timeout: 9000 });
  } catch {
    throw new Error(`Accueil non rendu: marqueur « MISSION DU JOUR » absent [${name}]`);
  }
  // 5) Route réellement résolue par Expo Router. Le groupe `(tabs)` N'APPARAÎT PAS dans l'URL :
  //    l'onglet Accueil vit à la racine de l'app (`/TradeMy`). On vérifie donc (a) le chemin racine
  //    résolu, ET (b) que l'on est bien DANS le navigateur d'onglets (barre d'onglets rendue —
  //    « Bibliothèque » et « Laboratoire » n'existent PAS sur la landing), pas juste un même chemin.
  const resolved = await pathnameOf(p);
  if (resolved !== BASE_PATH) {
    throw new Error(`Route résolue inattendue: obtenu ${resolved}, attendu ${BASE_PATH} [${name}]`);
  }
  for (const tab of [/Bibliothèque/, /Laboratoire/]) {
    if (!((await p.getByText(tab).count().catch(() => 0)) > 0)) {
      throw new Error(`Onglet ${tab} absent — navigateur (tabs) non résolu [${name}]`);
    }
  }
  // 6) Capture.
  await shot(p, name);
}

async function run() {
  for (const [w, h, tag, opts] of [
    [320, 720, '320', {}],
    [390, 844, '390', {}],
    [1440, 900, 'web', {}],
    [390, 844, 'reduced', { reducedMotion: 'reduce' }],
  ]) {
    const { c, p } = await ctx(w, h, opts);
    await reachAccueilAndShot(p, `accueil-${tag}`);
    await c.close();
  }
}

let failure = null;
try {
  await run();
} catch (e) {
  failure = e;
}
await browser.close();
server.close();

// ── Vérifications finales STRICTES ──
const runPngs = new Set(readdirSync(RUN_OUT).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)));
const existingPngs = new Set(readdirSync(OUT).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)));
const missing = MANIFEST.filter((n) => !produced.has(n));
const unexpectedProduced = [...produced].filter((n) => !MANIFEST_SET.has(n));
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
if (unexpectedProduced.length) { console.error('✗ Captures inattendues :', unexpectedProduced.join(', ')); ok = false; }
if (unexpectedRun.length) { console.error('✗ PNG inattendus produits :', unexpectedRun.join(', ')); ok = false; }
if (missingRun.length) { console.error('✗ PNG produits manquants :', missingRun.join(', ')); ok = false; }
if (foreignExisting.length) { console.error('✗ PNG étrangers dans le dossier cible :', foreignExisting.join(', ')); ok = false; }

if (!ok) {
  rmSync(RUN_OUT, { recursive: true, force: true });
  process.exit(1);
}

// Publication finale : remplace uniquement les noms gérés par CE manifeste, après vérifications.
for (const name of MANIFEST) {
  renameSync(join(RUN_OUT, `${name}.png`), join(OUT, `${name}.png`));
}
rmSync(RUN_OUT, { recursive: true, force: true });

const finalPngs = new Set(readdirSync(OUT).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)));
const missingFinal = MANIFEST.filter((n) => !finalPngs.has(n));
const unexpectedFinal = [...finalPngs].filter((n) => !MANIFEST_SET.has(n));
if (missingFinal.length || unexpectedFinal.length) {
  console.error('✗ Publication finale incohérente.', { missingFinal, unexpectedFinal });
  process.exit(1);
}
console.log('✓ Manifeste Accueil exact ; 0 erreur console ; 0 débordement. Captures dans', OUT);
