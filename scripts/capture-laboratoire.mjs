/**
 * Captures visuelles de l'espace LABORATOIRE — LOT 4-G.
 *
 * DÉTERMINISME : `FIXED_NOW` unique + horloge FIGÉE (Date.now/new Date) AVANT chargement + fuseau
 * `Europe/Zurich`. Le Laboratoire N'UTILISE AUCUNE progression : ses états (activité, scénario, replay,
 * placement, paramètre) sont LOCAUX et atteints par de VRAIES interactions client. On seed tout de même
 * un `progress` onboardé minimal pour que le parcours racine → « Reprendre » → Accueil fonctionne.
 *
 * PARCOURS RÉEL côté client : racine → « Reprendre » (rôle bouton) → Accueil → ONGLET « Laboratoire »
 * (rôle tab). On vérifie la route résolue (`/TradeMy/laboratoire`), l'onglet Laboratoire réellement
 * SÉLECTIONNÉ (role=tab + aria-selected), les 5 onglets, le marqueur stable « CONTINUER À APPRENDRE »
 * (anti-build-obsolète, propre au LOT 4-G), qu'UNE SEULE activité est visible (jamais deux ateliers),
 * la signature de scénario, et l'absence de NaN/undefined/Infinity, d'emoji et de glyphe de commande.
 *
 * Manifeste SÉPARÉ (ne touche aucune capture antérieure). Échec sur : erreur console, pageerror, mauvais
 * écran/onglet/route, débordement, emoji/glyphe de commande, métrique invalide, build obsolète, activité
 * multiple, signature incorrecte, capture manquante ou parasite.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';

const OUT = process.argv[2] || join(process.cwd(), 'docs', 'lot4g-captures');
const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) { console.error('✗ dist absent. Lance d’abord `npm run build:web`.'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const FIXED_NOW = Date.UTC(2026, 0, 15, 8, 30, 0); // 09:30 Europe/Zurich
const TIMEZONE = 'Europe/Zurich';
const SEED = JSON.stringify({ onboarded: true, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, learning: { conceptsExplored: [] }, skills: {}, targets: {} });

// Glyphes de commande interdits + présentation emoji.
const COMMAND_GLYPHS = /[⏮⏭◀▶←↑→↓‹›★☆]/u;

const MANIFEST = [
  'laboratoire-guided-320',
  'laboratoire-guided-masked-390',
  'laboratoire-guided-revealed-390',
  'laboratoire-support-selected-390',
  'laboratoire-support-feedback-correct-390',
  'laboratoire-support-feedback-retry-390',
  'laboratoire-volume-complete-390',
  'laboratoire-indicator-adjusted-390',
  'laboratoire-wide-web',
  'laboratoire-large-text',
  'laboratoire-reduced-motion',
];
const MANIFEST_SET = new Set(MANIFEST);
const produced = new Set();

// Actions de scénario (VRAIES interactions) + signature VISIBLE attendue.
const clickBtn = (name) => async (p) => { await p.getByRole('button', { name, exact: true }).first().click({ timeout: 5000 }); await p.waitForTimeout(180); };
async function placeSupport(p, correct) {
  await p.getByRole('button', { name: 'Tracer un support', exact: true }).first().click({ timeout: 5000 });
  const chart = p.getByLabel(/Graphique interactif/).first();
  await chart.waitFor({ state: 'visible', timeout: 8000 });
  // Le creux de référence = plus bas (bas du graphique) : cliquer bas ⇒ proche (juste) ; haut ⇒ à revoir.
  await chart.click({ position: { x: 30, y: correct ? 162 : 8 } });
  await p.waitForTimeout(160);
}

const CASES = [
  ['laboratoire-guided-320', 320, 1200, {}, { expectText: 'Où se lit la structure haussière ?' }],
  ['laboratoire-guided-masked-390', 390, 1000, {}, { expectText: 'Lis le graphique par toi-même' }],
  ['laboratoire-guided-revealed-390', 390, 1100, { action: clickBtn('Afficher les repères à observer') }, { expectText: 'Creux de plus en plus hauts' }],
  ['laboratoire-support-selected-390', 390, 1050, { action: (p) => placeSupport(p, true) }, { expectText: 'Ton niveau' }],
  ['laboratoire-support-feedback-correct-390', 390, 1150, { action: async (p) => { await placeSupport(p, true); await p.getByRole('button', { name: 'Valider mon tracé', exact: true }).click({ timeout: 5000 }); await p.waitForTimeout(200); } }, { expectText: 'Placement proche du creux de référence.' }],
  ['laboratoire-support-feedback-retry-390', 390, 1150, { action: async (p) => { await placeSupport(p, false); await p.getByRole('button', { name: 'Valider mon tracé', exact: true }).click({ timeout: 5000 }); await p.waitForTimeout(200); } }, { expectText: 'le repère se pose sur le creux le plus bas' }],
  ['laboratoire-volume-complete-390', 390, 1050, { action: async (p) => { await p.getByRole('button', { name: 'Replay volume', exact: true }).first().click({ timeout: 5000 }); await p.getByRole('button', { name: 'Tout révéler', exact: true }).click({ timeout: 5000 }); await p.waitForTimeout(200); } }, { expectText: 'Séquence entièrement révélée' }],
  ['laboratoire-indicator-adjusted-390', 390, 1100, { action: async (p) => { await p.getByRole('button', { name: 'Indicateurs', exact: true }).first().click({ timeout: 5000 }); await p.getByRole('button', { name: 'Bandes de Bollinger', exact: true }).click({ timeout: 5000 }); await p.getByRole('button', { name: '2.5', exact: true }).click({ timeout: 5000 }); await p.waitForTimeout(200); } }, { expectText: 'Écart-type (k)' }],
  ['laboratoire-wide-web', 1440, 1100, {}, { expectText: 'Où se lit la structure haussière ?' }],
  ['laboratoire-large-text', 430, 1500, { zoom: 1.25 }, { expectText: 'CONTINUER À APPRENDRE' }],
  ['laboratoire-reduced-motion', 390, 1000, { reducedMotion: true }, { expectText: 'CONTINUER À APPRENDRE' }],
];

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
async function ctx(w, h, opts = {}) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, timezoneId: TIMEZONE, ...opts });
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
const CARD_TITLES = ['Lecture guidée', 'Tracer un support', 'Replay volume', 'Indicateurs'];

async function reachLabAndShot(p, name, sc, opts = {}) {
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  if ((await pathnameOf(p)) !== BASE_PATH) throw new Error(`Route racine inattendue [${name}]`);
  await p.getByRole('button', { name: 'Reprendre', exact: true }).click({ timeout: 4000 });
  await p.getByText('MISSION DU JOUR', { exact: true }).waitFor({ state: 'visible', timeout: 9000 });
  await p.getByRole('tab', { name: 'Laboratoire' }).click({ timeout: 4000 });
  await p.getByRole('heading', { name: 'Laboratoire' }).waitFor({ state: 'visible', timeout: 9000 });
  const resolved = await pathnameOf(p);
  if (resolved !== `${BASE_PATH}/laboratoire`) throw new Error(`Route Laboratoire inattendue: ${resolved} [${name}]`);
  const sel = await p.getByRole('tab', { name: 'Laboratoire', selected: true }).count();
  if (sel !== 1) throw new Error(`Onglet « Laboratoire » non sélectionné [${name}]`);
  const tabs = await p.getByRole('tab').count();
  if (tabs !== 5) throw new Error(`Navigateur d'onglets incohérent (${tabs}) [${name}]`);

  // Action de scénario (changement d'activité / interaction) AVANT les vérifications d'état.
  if (sc.action) await sc.action(p);

  // Anti-build-obsolète : la carte « CONTINUER À APPRENDRE » n'existe qu'au LOT 4-G.
  if (!(await p.getByText('CONTINUER À APPRENDRE', { exact: true }).count())) throw new Error(`Marqueur LOT 4-G « CONTINUER À APPRENDRE » absent (dist obsolète ?) [${name}]`);
  // UNE SEULE activité visible (jamais deux ateliers montés en même temps).
  let activeVisible = 0;
  for (const t of CARD_TITLES) activeVisible += await p.getByText(t, { exact: true }).and(p.locator(':visible')).count();
  if (activeVisible !== 1) throw new Error(`Activités visibles = ${activeVisible} (attendu 1) [${name}]`);
  // Aucune métrique invalide, aucun emoji, aucun glyphe de commande — dans le SEUL écran Laboratoire.
  // Les onglets inactifs restent montés et EMPILÉS dans le DOM (ex. « Découvrir la fiche › » de
  // l'Accueil), donc ni `:visible` ni la géométrie ne les excluent. Chaque `Screen` est cependant son
  // propre conteneur de défilement (overflow-y auto) : on lit l'`innerText` du conteneur de défilement
  // qui contient le titre « Laboratoire » — c'est le contenu du LOT 4-G, à l'exclusion des autres écrans.
  const labText = await p.evaluate(() => {
    const head = [...document.querySelectorAll('[role="heading"]')].find((e) => e.textContent === 'Laboratoire');
    let n = head;
    while (n) { if (/(auto|scroll)/.test(getComputedStyle(n).overflowY)) break; n = n.parentElement; }
    return (n || head || document.body).innerText;
  });
  if (/NaN|undefined|Infinity|Invalid Date/.test(labText)) throw new Error(`Métrique invalide dans l'écran Laboratoire [${name}]`);
  if (/\p{Emoji_Presentation}/u.test(labText)) throw new Error(`Emoji dans l'écran Laboratoire [${name}]`);
  if (COMMAND_GLYPHS.test(labText)) throw new Error(`Glyphe de commande dans l'écran Laboratoire [${name}]`);
  // Signature de scénario (VISIBLE uniquement : les onglets inactifs restent montés dans le DOM).
  if (opts.expectText && !(await p.getByText(opts.expectText, { exact: false }).and(p.locator(':visible')).count())) throw new Error(`Signature « ${opts.expectText} » absente [${name}]`);
  if (opts.zoom) await p.evaluate((z) => { document.documentElement.style.zoom = String(z); }, opts.zoom);
  await shot(p, name);
}

async function run() {
  for (const [name, w, h, sc, opts] of CASES) {
    const ctxOpts = sc.reducedMotion ? { reducedMotion: 'reduce' } : {};
    const { c, p } = await ctx(w, h, ctxOpts);
    await reachLabAndShot(p, name, sc, opts);
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
console.log('✓ Manifeste Laboratoire exact ; horloge/fuseau figés ; onglet Laboratoire sélectionné ; une seule activité ; 0 erreur console ; 0 débordement. Captures dans', OUT);
