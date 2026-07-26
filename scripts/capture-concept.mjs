/**
 * Captures visuelles de la FICHE CONCEPT — LOT 4-J.
 *
 * DÉTERMINISME : `FIXED_NOW` unique + horloge FIGÉE (Date.now/new Date) AVANT chargement + fuseau
 * `Europe/Zurich` + stockage seedé (`onboarded`, v8). Parcours RÉEL côté client : racine → « Reprendre »
 * → Accueil → onglet « Bibliothèque » (lien) → recherche → clic sur la fiche (router.push CLIENT, sans
 * rechargement) — parcours utilisateur naturel qui exerce l'écran monté dans le SPA. Depuis le LOT 4-K
 * (ADR-107), la route `/concept/[slug]` est PRÉ-RENDUE (`generateStaticParams` dérivé de `V5_CONCEPTS`)
 * et l'accès direct/rechargement n'émet plus de divergence d'hydratation #418 (vérifié par
 * `scripts/verify-direct-links.mjs`). L'état « introuvable » est atteint ici par une navigation
 * d'historique DANS le SPA déjà monté (aucun rechargement, aucune erreur).
 *
 * Contrôles à chaque capture : aucun emoji/glyphe de commande, aucune valeur invalide (NaN/undefined),
 * aucun débordement horizontal ; la capture clavier vérifie un focus VISIBLE (anneau `:focus-visible`).
 *
 * Manifeste SÉPARÉ (`docs/lot4j-captures/`) — ne touche à aucune capture antérieure. Remplacement
 * atomique après succès complet uniquement.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';

const OUT = process.argv[2] || join(process.cwd(), 'docs', 'lot4j-captures');
const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) { console.error('✗ dist absent. Lance d’abord `npm run build:web`.'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const FIXED_NOW = Date.UTC(2026, 0, 15, 8, 30, 0); // 09:30 Europe/Zurich
const TIMEZONE = 'Europe/Zurich';
const SEED = JSON.stringify({ onboarded: true, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, learning: { conceptsExplored: [] }, skills: {}, targets: {} });
const COMMAND_GLYPHS = /[⏮⏭◀▶←↑→↓‹›★☆]/u;

// name, concept (query, rowRegex), largeur, hauteur, options
const CASES = [
  ['concept-marteau-320', { q: 'Marteau', row: 'Marteau' }, 320, 900, { full: true }],
  ['concept-marteau-390', { q: 'Marteau', row: 'Marteau' }, 390, 900, { full: true }],
  ['concept-marteau-430', { q: 'Marteau', row: 'Marteau' }, 430, 950, { full: true }],
  ['concept-marteau-web-1024', { q: 'Marteau', row: 'Marteau' }, 1024, 768, { full: true }],
  ['concept-marteau-web-1440', { q: 'Marteau', row: 'Marteau' }, 1440, 900, { full: true }],
  ['concept-large-text', { q: 'Marteau', row: 'Marteau' }, 430, 1000, { full: true, zoom: 1.25 }],
  ['concept-reduced-motion', { q: 'Marteau', row: 'Marteau' }, 390, 900, { full: true, reducedMotion: true }],
  ['concept-keyboard-focus-web', { q: 'Marteau', row: 'Marteau' }, 1024, 768, { keyboard: true }],
  ['concept-second-doji', { q: 'Doji', row: 'Doji' }, 390, 900, { full: true }],
  ['concept-review-notice', { q: 'Marteau', row: 'Marteau' }, 390, 900, { region: 'top' }],
  ['concept-related', { q: 'Marteau', row: 'Marteau' }, 390, 900, { region: 'Concepts liés' }],
  ['concept-not-found', { q: 'Marteau', row: 'Marteau' }, 390, 800, { notFound: true }],
];
const MANIFEST = CASES.map((c) => c[0]);
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

async function ctx(w, h, opts = {}) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, timezoneId: TIMEZONE, ...(opts.reducedMotion ? { reducedMotion: 'reduce' } : {}) });
  await c.addInitScript((fixed) => {
    const R = Date;
    function F(...a) { if (!(this instanceof F)) return new R(fixed).toString(); return a.length ? new R(...a) : new R(fixed); }
    F.prototype = R.prototype; F.now = () => fixed; F.UTC = R.UTC; F.parse = R.parse; window.Date = F;
  }, FIXED_NOW);
  await c.addInitScript((s) => { try { window.localStorage.setItem('patternlab.progress.v1', s); } catch { /* stockage */ } }, SEED);
  const p = await c.newPage();
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${w}px ${m.text().slice(0, 160)}`); });
  p.on('pageerror', (e) => consoleErrors.push(`${w}px PAGEERROR ${String(e).slice(0, 160)}`));
  return { c, p };
}
const pathnameOf = async (p) => new URL(p.url()).pathname.replace(/\/$/, '');
const overflow = (p) => p.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));

/** Parcours client réel jusqu'à une fiche concept (aucun rechargement → aucun #418). */
async function reachConcept(p, concept, name) {
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  if ((await pathnameOf(p)) !== BASE_PATH) throw new Error(`Route racine inattendue [${name}]`);
  await p.getByRole('button', { name: 'Reprendre', exact: true }).click({ timeout: 5000 });
  await p.getByText('MISSION DU JOUR', { exact: true }).waitFor({ state: 'visible', timeout: 9000 });
  await p.getByRole('link', { name: /Bibliothèque/ }).first().click({ timeout: 5000 });
  await p.getByLabel('Rechercher un concept').fill(concept.q);
  await p.waitForTimeout(350);
  await p.getByRole('button', { name: new RegExp(concept.row) }).first().click({ timeout: 5000 });
  await p.getByText('En bref', { exact: true }).waitFor({ state: 'visible', timeout: 8000 });
  if (!/\/concept\//.test(await pathnameOf(p))) throw new Error(`Route concept inattendue [${name}] : ${await pathnameOf(p)}`);
}

/** Navigation d'historique DANS le SPA monté vers un slug inexistant (aucun rechargement). */
async function goNotFound(p) {
  await p.evaluate(() => {
    history.pushState({}, '', location.pathname.replace(/concept\/.*$/, 'concept/__introuvable-lot4j__'));
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await p.getByText('Concept introuvable', { exact: true }).waitFor({ state: 'visible', timeout: 6000 });
}

/** Focus clavier : tabule jusqu'à un bouton de la fiche et vérifie un focus VISIBLE. */
async function focusInteractive(p, name) {
  let focused = null;
  for (let i = 0; i < 40 && !focused; i++) {
    await p.keyboard.press('Tab');
    focused = await p.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      if ((el.getAttribute && el.getAttribute('role')) !== 'button') return null;
      const cs = getComputedStyle(el);
      const visible = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      return { label: el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 40), visible };
    });
  }
  if (!focused) throw new Error(`aucun bouton atteint au clavier [${name}]`);
  if (!focused.visible) throw new Error(`focus clavier NON visible sur « ${focused.label} » [${name}]`);
}

/** Contrôle du contenu affiché : renvoie une erreur (string) ou null. */
async function checkScreen(p) {
  const info = await p.evaluate(() => {
    const root = document.querySelector('#root') || document.body;
    const t = root.innerText || root.textContent || '';
    return { emoji: /\p{Emoji_Presentation}/u.test(t), text: t };
  });
  if (info.emoji) return 'emoji dans le contenu';
  if (COMMAND_GLYPHS.test(info.text)) return 'glyphe de commande dans le contenu';
  if (/NaN|undefined|Infinity|Invalid Date/.test(info.text)) return 'valeur invalide dans le contenu';
  if ((await overflow(p)) > 0) return `débordement horizontal ${await overflow(p)}px`;
  return null;
}

async function shot(p, name, opts) {
  if (!MANIFEST_SET.has(name)) throw new Error(`Capture INATTENDUE : ${name}`);
  await p.waitForTimeout(180);
  const err = await checkScreen(p);
  if (err) throw new Error(`Écran invalide [${name}] : ${err}`);
  await p.screenshot({ path: join(RUN_OUT, `${name}.png`), fullPage: Boolean(opts.full) });
  produced.add(name);
  console.log('  ✓', name);
}

async function run() {
  for (const [name, concept, w, h, opts] of CASES) {
    const { c, p } = await ctx(w, h, opts);
    await reachConcept(p, concept, name);
    if (opts.notFound) await goNotFound(p);
    if (opts.keyboard) await focusInteractive(p, name);
    // Réinitialise le ScrollView en HAUT pour un cadrage déterministe (sauf capture clavier — on garde
    // l'élément focalisé visible — et sauf capture d'une région précise, gérée juste après).
    if (!opts.keyboard && (!opts.region || opts.region === 'top')) {
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(120);
    }
    if (opts.region && opts.region !== 'top') {
      await p.evaluate((label) => {
        const el = [...document.querySelectorAll('*')].find((e) => (e.textContent || '').trim() === label);
        if (el) el.scrollIntoView({ block: 'center' });
      }, opts.region);
      await p.waitForTimeout(200);
    }
    if (opts.zoom) await p.evaluate((z) => { document.documentElement.style.zoom = String(z); }, opts.zoom);
    await shot(p, name, opts);
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
const foreignExisting = [...existingPngs].filter((n) => !MANIFEST_SET.has(n));

console.log(`\nCaptures produites : ${produced.size}/${MANIFEST.length}`);
console.log('Erreurs console/pageerror :', consoleErrors.length);
consoleErrors.slice(0, 8).forEach((e) => console.log('   !', e));

let ok = true;
if (failure) { console.error('✗ ÉCHEC :', failure.message); ok = false; }
if (consoleErrors.length) { console.error('✗ ÉCHEC : erreurs console/pageerror.'); ok = false; }
if (missing.length) { console.error('✗ Captures manquantes :', missing.join(', ')); ok = false; }
if (unexpectedRun.length) { console.error('✗ PNG inattendus :', unexpectedRun.join(', ')); ok = false; }
if (foreignExisting.length) { console.error('✗ PNG étrangers dans le dossier cible :', foreignExisting.join(', ')); ok = false; }

if (!ok) { rmSync(RUN_OUT, { recursive: true, force: true }); process.exit(1); }

for (const name of MANIFEST) renameSync(join(RUN_OUT, `${name}.png`), join(OUT, `${name}.png`));
rmSync(RUN_OUT, { recursive: true, force: true });
console.log('✓ Manifeste Fiche concept exact ; parcours client réel (0 #418) ; aucun emoji ; focus clavier visible ; 0 erreur console ; 0 débordement. Captures dans', OUT);
