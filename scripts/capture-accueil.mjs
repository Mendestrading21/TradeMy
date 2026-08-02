/**
 * Captures visuelles de l'écran d'ACCUEIL (onglet Accueil) — LOT 4-B.
 *
 * DÉTERMINISME (ce script) :
 *  - `FIXED_NOW` unique + horloge FIGÉE (Date.now() et new Date()) AVANT le chargement de l'app ;
 *  - fuseau fixé à `Europe/Zurich` ;
 *  - donc MÊME date, mission, salutation et notion du jour pour les quatre viewports — vérifié en
 *    comparant une SIGNATURE (texte visible normalisé) identique sur les quatre.
 *
 * PARCOURS RÉEL côté client (jamais un deep-link vers `/(tabs)`) :
 *  1. état local déterministe « déjà onboardé » (seed localStorage) ;
 *  2. route RACINE `/` (l'écran d'accueil racine s'hydrate correctement) ;
 *  3. bouton « Reprendre » (par son RÔLE + nom exact) → navigation CLIENT vers l'onglet Accueil ;
 *  4. marqueur STABLE « MISSION DU JOUR » EXACT et visible ;
 *  5. route résolue par Expo Router = racine `/TradeMy` (le groupe `(tabs)` n'apparaît pas dans
 *     l'URL) — donc une simple occurrence textuelle ne prouve RIEN ; on vérifie le VRAI onglet
 *     Accueil par sa SÉMANTIQUE accessible (role="tab" + aria-selected) et un autre onglet réel
 *     par rôle (pas le mot « Bibliothèque » de la carte Favoris) ;
 *  6. on vérifie le NOUVEAU nom accessible du compteur de jetons (un ancien `dist` ne peut donc pas
 *     produire une fausse preuve) ;
 *  7. capture.
 *
 * Manifeste SÉPARÉ des 22 captures pilote (jamais modifié ici). Le script ÉCHOUE (code 1) sur :
 * erreur console, pageerror, débordement horizontal, mauvais écran/route/onglet, signature non
 * déterministe, capture manquante ou inattendue. Production isolée puis publication atomique.
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

// ── Instant FIGÉ, unique et documenté : 15 janvier 2026, 08:30 UTC = 09:30 Europe/Zurich
//    (→ salutation « Bonjour »). Toutes les captures partagent cet instant + ce fuseau. ──
const FIXED_NOW = Date.UTC(2026, 0, 15, 8, 30, 0);
const TIMEZONE = 'Europe/Zurich';
const JETON_LABEL = '0 jeton d’apprentissage'; // nom accessible attendu (seed : 0 jeton)

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
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, timezoneId: TIMEZONE, ...opts });
  // (a) FIGE l'horloge AVANT tout script de page : Date.now() et new Date() renvoient FIXED_NOW ;
  //     `new Date(x)` (avec argument) garde son comportement (rotation/notion déterministes).
  await c.addInitScript((fixed) => {
    const RealDate = Date;
    function FrozenDate(...args) {
      if (!(this instanceof FrozenDate)) return new RealDate(fixed).toString();
      return args.length ? new RealDate(...args) : new RealDate(fixed);
    }
    FrozenDate.prototype = RealDate.prototype;
    FrozenDate.now = () => fixed;
    FrozenDate.UTC = RealDate.UTC;
    FrozenDate.parse = RealDate.parse;
    // @ts-ignore — override global Date pour la page
    window.Date = FrozenDate;
  }, FIXED_NOW);
  // (b) État onboardé déterministe.
  await c.addInitScript((seed) => {
    try { window.localStorage.setItem('patternlab.progress.v1', seed); } catch { /* stockage indisponible */ }
  }, SEED);
  const p = await c.newPage();
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${w}px ${m.text().slice(0, 160)}`); });
  p.on('pageerror', (e) => consoleErrors.push(`${w}px PAGEERROR ${String(e).slice(0, 160)}`));
  return { c, p };
}

const pathnameOf = async (p) => new URL(p.url()).pathname.replace(/\/$/, '');

/** Signature déterministe = texte visible normalisé (mêmes date/mission/salutation/notion). */
async function signature(p) {
  return await p.evaluate(() =>
    document.body.innerText.split('\n').map((s) => s.trim()).filter(Boolean).join(' | '),
  );
}

/** Parcours réel → Accueil, vérifications sémantiques réelles, capture. Renvoie la signature. */
async function reachAccueilAndShot(p, name) {
  // 2) Route racine — l'écran d'accueil racine s'hydrate proprement.
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  if ((await pathnameOf(p)) !== BASE_PATH) {
    throw new Error(`Route racine inattendue: ${await pathnameOf(p)} (attendu ${BASE_PATH}) [${name}]`);
  }
  // 3) « Reprendre » par son RÔLE de bouton + nom EXACT → navigation client.
  await p.getByRole('button', { name: 'Reprendre', exact: true }).click({ timeout: 4000 });
  // 4) Marqueur STABLE de l'Accueil, EXACT et visible.
  await p.getByText('MISSION DU JOUR', { exact: true }).waitFor({ state: 'visible', timeout: 9000 });
  // 5) Route résolue = racine (le groupe (tabs) n'est pas dans l'URL) ; le VRAI onglet est prouvé
  //    par la sémantique accessible, pas par une occurrence textuelle.
  const resolved = await pathnameOf(p);
  if (resolved !== BASE_PATH) throw new Error(`Route résolue inattendue: ${resolved} (attendu ${BASE_PATH}) [${name}]`);
  const accueilActif = await p.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Accueil, espace actif' }).count();
  if (accueilActif !== 1) throw new Error(`Onglet « Accueil » actif (role=tab, aria-selected) absent [${name}]`);
  const autreOnglet = await p.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Laboratoire' }).count();
  if (autreOnglet < 1) throw new Error(`Onglet « Laboratoire » (role=tab) absent — navigateur (tabs) non résolu [${name}]`);
  // 6) Nom accessible du compteur de jetons (un ancien dist ne peut pas produire de fausse preuve).
  const jeton = p.locator(`[aria-label="${JETON_LABEL}"]`);
  if ((await jeton.count()) < 1) {
    throw new Error(`Nom accessible du compteur de jetons « ${JETON_LABEL} » absent (dist obsolète ?) [${name}]`);
  }
  // 7) Capture + signature déterministe.
  await shot(p, name);
  return signature(p);
}

const sigs = [];
async function run() {
  for (const [w, h, tag, opts] of [
    [320, 720, '320', {}],
    [390, 844, '390', {}],
    [1440, 900, 'web', {}],
    [390, 844, 'reduced', { reducedMotion: 'reduce' }],
  ]) {
    const { c, p } = await ctx(w, h, opts);
    sigs.push(await reachAccueilAndShot(p, `accueil-${tag}`));
    await c.close();
  }
  // Déterminisme : même date/mission/salutation/notion du jour sur les quatre viewports.
  if (new Set(sigs).size !== 1) {
    throw new Error(`Contenu NON déterministe entre viewports :\n${sigs.join('\n---\n')}`);
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
if (!failure && sigs.length) console.log('Signature déterministe (identique ×4) :\n  ', sigs[0].slice(0, 180), '…');

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
console.log('✓ Manifeste Accueil exact ; horloge/fuseau figés ; onglet actif prouvé ; 0 erreur console ; 0 débordement. Captures dans', OUT);
