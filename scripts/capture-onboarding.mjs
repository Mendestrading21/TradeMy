/**
 * Captures visuelles de l'ONBOARDING — LOT 4-I.
 *
 * DÉTERMINISME : `FIXED_NOW` unique + horloge FIGÉE (Date.now/new Date) AVANT chargement + fuseau
 * `Europe/Zurich` + stockage seedé (état NON onboardé, schéma v8). Parcours RÉEL côté client sur la
 * route `/TradeMy/onboarding` : chaque étape est atteinte par de VRAIS clics (bouton « Commencer »/
 * « Continuer », cartes d'option, diagnostic), avec vérification de l'étape courante à chaque capture.
 *
 * Contrôles à chaque capture : aucun emoji/glyphe de commande dans le contenu, aucune valeur invalide
 * (NaN/undefined/Infinity), aucun débordement horizontal, libellé d'étape « Étape n / 7 » cohérent.
 * La capture clavier vérifie qu'une carte d'option reçoit un focus VISIBLE (anneau `:focus-visible`).
 *
 * Manifeste SÉPARÉ (`docs/lot4i-captures/`) — ne touche à aucune capture antérieure. Remplacement
 * atomique après succès complet uniquement.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';

const OUT = process.argv[2] || join(process.cwd(), 'docs', 'lot4i-captures');
const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) { console.error('✗ dist absent. Lance d’abord `npm run build:web`.'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const FIXED_NOW = Date.UTC(2026, 0, 15, 8, 30, 0); // 09:30 Europe/Zurich
const TIMEZONE = 'Europe/Zurich';
const SEED = JSON.stringify({ onboarded: false, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, learning: { conceptsExplored: [] }, skills: {}, targets: {} });
const COMMAND_GLYPHS = /[⏮⏭◀▶←↑→↓‹›★☆]/u;

// Titres visibles par étape (0..6) pour ancrer chaque attente déterministe.
const STEP_HEADING = [
  'Bienvenue sur TradeMy',
  'Ton objectif principal ?',
  'Où en es-tu ?',
  'Combien de temps par jour ?',
  'Quels sujets t’intéressent ?',
  'Diagnostic éclair',
  'Ton parcours',
];

// name, étape cible, largeur, hauteur, options
const CASES = [
  ['onboarding-welcome-320', 0, 320, 860, {}],
  ['onboarding-goal-320', 1, 320, 860, {}],
  ['onboarding-level-320', 2, 320, 860, {}],
  ['onboarding-time-320', 3, 320, 860, {}],
  ['onboarding-topics-320', 4, 320, 900, {}],
  ['onboarding-diagnostic-320', 5, 320, 900, { diagRunning: true }],
  ['onboarding-result-320', 6, 320, 960, {}],
  ['onboarding-goal-390', 1, 390, 844, {}],
  ['onboarding-result-wide-web', 6, 1440, 900, {}],
  ['onboarding-large-text', 1, 430, 1000, { zoom: 1.25 }],
  ['onboarding-reduced-motion', 0, 390, 844, { reducedMotion: true }],
  ['onboarding-keyboard-focus-web', 1, 1024, 768, { keyboard: true }],
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

async function waitStep(p, n, name) {
  await p.getByText(STEP_HEADING[n], { exact: true }).first().waitFor({ state: 'visible', timeout: 9000 });
  const caption = await p.evaluate((expected) => {
    const nodes = [...document.querySelectorAll('*')].filter((e) => /Étape \d+ \/ 7/.test(e.textContent || ''));
    return nodes.length ? (nodes[nodes.length - 1].textContent || '').match(/Étape \d+ \/ 7/)?.[0] ?? '' : '';
  });
  if (caption !== `Étape ${n + 1} / 7`) throw new Error(`étape attendue ${n + 1} mais libellé « ${caption} » [${name}]`);
}

/** Clique un bouton de navigation/action par NOM accessible (exact ou sous-chaîne). */
async function clickButton(p, name, exact = true) {
  await p.getByRole('button', { name, exact }).first().click({ timeout: 6000 });
  await p.waitForTimeout(160);
}

/** Clique la i-ème CARTE d'option de l'étape courante (exclut les boutons de navigation/action). */
async function clickOption(p, index, name) {
  const NAV = ['Commencer', 'Continuer', 'Retour', 'Passer', 'Faire le diagnostic'];
  const ok = await p.evaluate(({ i, nav }) => {
    const btns = [...document.querySelectorAll('[role="button"]')];
    const opts = btns.filter((b) => {
      const lab = (b.getAttribute('aria-label') || b.textContent || '').trim();
      return lab && !nav.some((n) => lab.startsWith(n));
    });
    const el = opts[i];
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.click();
    return true;
  }, { i: index, nav: NAV });
  if (!ok) throw new Error(`carte d'option ${index} introuvable [${name}]`);
  await p.waitForTimeout(140);
}

/** Amène l'onboarding RÉEL jusqu'à l'étape cible avec des choix déterministes. */
async function reachStep(p, target, name, opts = {}) {
  await p.goto(`${base}/onboarding`, { waitUntil: 'networkidle' });
  if (!/\/onboarding$/.test(await pathnameOf(p))) throw new Error(`route onboarding inattendue [${name}]`);
  await waitStep(p, 0, name);
  if (target === 0) return;

  await clickButton(p, 'Commencer'); await waitStep(p, 1, name); // 0 → 1
  if (target === 1) return;

  await clickOption(p, 0, name); await clickButton(p, 'Continuer'); await waitStep(p, 2, name); // 1 → 2
  if (target === 2) return;

  await clickOption(p, 0, name); await clickButton(p, 'Continuer'); await waitStep(p, 3, name); // 2 → 3
  if (target === 3) return;

  await clickOption(p, 1, name); await clickButton(p, 'Continuer'); await waitStep(p, 4, name); // 3 → 4
  if (target === 4) return;

  // Sujets : deux sélections pour un récapitulatif riche.
  await clickOption(p, 1, name); await clickOption(p, 2, name);
  await clickButton(p, 'Continuer'); await waitStep(p, 5, name); // 4 → 5 (intro diagnostic)
  if (target === 5) {
    if (opts.diagRunning) {
      await clickButton(p, 'Faire le diagnostic', false);
      await p.getByText('Une action, c’est avant tout…', { exact: true }).first().waitFor({ state: 'visible', timeout: 6000 });
    }
    return;
  }

  // Étape 6 : diagnostic complet (première option × 3) puis « Continuer ».
  await clickButton(p, 'Faire le diagnostic', false);
  for (let q = 0; q < 3; q++) { await clickOption(p, 0, name); }
  await p.getByText('bonnes réponses', { exact: false }).first().waitFor({ state: 'visible', timeout: 6000 });
  await clickButton(p, 'Continuer'); await waitStep(p, 6, name); // done → 6
}

/** Focus clavier : tabule jusqu'à une carte/bouton d'onboarding et vérifie un focus VISIBLE. */
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

async function shot(p, name) {
  if (!MANIFEST_SET.has(name)) throw new Error(`Capture INATTENDUE : ${name}`);
  await p.waitForTimeout(160);
  const err = await checkScreen(p);
  if (err) throw new Error(`Écran invalide [${name}] : ${err}`);
  await p.screenshot({ path: join(RUN_OUT, `${name}.png`), fullPage: true });
  produced.add(name);
  console.log('  ✓', name);
}

async function run() {
  for (const [name, target, w, h, opts] of CASES) {
    const { c, p } = await ctx(w, h, opts);
    await reachStep(p, target, name, opts);
    if (opts.keyboard) await focusInteractive(p, name);
    if (opts.zoom) await p.evaluate((z) => { document.documentElement.style.zoom = String(z); }, opts.zoom);
    await shot(p, name);
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
console.log('✓ Manifeste Onboarding exact ; 7 étapes parcourues au clic réel ; aucun emoji ; focus clavier visible ; 0 erreur console ; 0 débordement. Captures dans', OUT);
