/**
 * Captures visuelles du SHELL de navigation — LOT 4-H.
 *
 * DÉTERMINISME : `FIXED_NOW` unique + horloge FIGÉE (Date.now/new Date) AVANT chargement + fuseau
 * `Europe/Zurich` + stockage seedé (`progress` v8). Parcours RÉEL côté client : racine → « Reprendre »
 * → Accueil, puis de VRAIS clics sur les cinq onglets (liens), avec vérification de la route ET de
 * l'onglet actif après chaque clic.
 *
 * Contrôles de la barre à chaque capture (repère `navigation` « Navigation principale », anti-build
 * obsolète) : EXACTEMENT cinq liens, mapping href canonique, un seul actif exposé par le NOM
 * (« … , espace actif »), aucun libellé tronqué (scrollWidth ≤ clientWidth), aucune cible < 44 px,
 * aucun débordement/chevauchement horizontal, aucun emoji/glyphe de commande, aucune valeur invalide.
 * La capture clavier vérifie qu'un lien d'onglet reçoit un focus VISIBLE.
 *
 * Manifeste SÉPARÉ (`docs/lot4h-captures/`) — ne touche à aucune capture antérieure. Remplacement
 * atomique après succès complet uniquement.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';

const OUT = process.argv[2] || join(process.cwd(), 'docs', 'lot4h-captures');
const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) { console.error('✗ dist absent. Lance d’abord `npm run build:web`.'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const FIXED_NOW = Date.UTC(2026, 0, 15, 8, 30, 0); // 09:30 Europe/Zurich
const TIMEZONE = 'Europe/Zurich';
const SEED = JSON.stringify({ onboarded: true, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, learning: { conceptsExplored: [] }, skills: {}, targets: {} });
const COMMAND_GLYPHS = /[⏮⏭◀▶←↑→↓‹›★☆]/u;

// Titre d'onglet → suffixe de route résolue (base /TradeMy).
const ROUTE_SUFFIX = { Accueil: '', Apprendre: '/parcours', Bibliothèque: '/apprendre', Laboratoire: '/laboratoire', Profil: '/profil' };

const CASES = [
  ['shell-home-320', 'Accueil', 320, 720, {}],
  ['shell-learn-320', 'Apprendre', 320, 720, {}],
  ['shell-library-320', 'Bibliothèque', 320, 720, {}],
  ['shell-lab-320', 'Laboratoire', 320, 720, {}],
  ['shell-profile-320', 'Profil', 320, 720, {}],
  ['shell-home-390', 'Accueil', 390, 844, {}],
  ['shell-lab-430', 'Laboratoire', 430, 900, {}],
  ['shell-keyboard-focus-web', 'Accueil', 1024, 768, { keyboard: true }],
  ['shell-wide-web', 'Accueil', 1440, 900, {}],
  ['shell-large-text', 'Accueil', 430, 1000, { zoom: 1.25 }],
  ['shell-reduced-motion', 'Accueil', 390, 844, { reducedMotion: true }],
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

/** Mesure/contrôle de la barre : renvoie une erreur (string) ou null. */
async function checkBar(p, activeTitle) {
  const info = await p.evaluate(() => {
    const nav = document.querySelector('[role="navigation"][aria-label="Navigation principale"]');
    if (!nav) return { ok: false, reason: 'repère navigation absent (build obsolète ?)' };
    const links = [...nav.querySelectorAll('a')];
    const rows = links.map((a) => {
      const r = a.getBoundingClientRect();
      const spans = [...a.querySelectorAll('*')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
      const lab = spans[spans.length - 1];
      return { href: a.getAttribute('href'), aria: a.getAttribute('aria-label'), x: r.x, w: Math.round(r.width), h: Math.round(r.height),
        trunc: lab ? lab.scrollWidth > lab.clientWidth + 0.5 : false, text: lab ? lab.textContent : '' };
    });
    const t = nav.textContent || '';
    return { ok: true, count: links.length, rows,
      bodyOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      emoji: /\p{Emoji_Presentation}/u.test(t), glyph: null, navText: t };
  });
  if (!info.ok) return info.reason;
  if (info.count !== 5) return `onglets = ${info.count} (attendu 5)`;
  if (info.bodyOverflow > 0) return `débordement horizontal ${info.bodyOverflow}px`;
  if (info.emoji) return 'emoji dans la barre';
  if (COMMAND_GLYPHS.test(info.navText)) return 'glyphe de commande dans la barre';
  if (/NaN|undefined|Infinity|Invalid Date/.test(info.navText)) return 'valeur invalide dans la barre';
  const sorted = [...info.rows].sort((a, b) => a.x - b.x);
  for (let i = 0; i < sorted.length; i++) {
    const r = sorted[i];
    if (r.trunc) return `libellé tronqué : « ${r.text} »`;
    if (r.h < 44 || r.w < 44) return `cible < 44 px (${r.w}×${r.h}) : « ${r.text} »`;
    if (i > 0 && r.x < sorted[i - 1].x + sorted[i - 1].w - 0.5) return `chevauchement d'onglets près de « ${r.text} »`;
  }
  const active = info.rows.filter((r) => /, espace actif$/.test(r.aria || ''));
  if (active.length !== 1) return `onglets actifs = ${active.length} (attendu 1)`;
  if (active[0].aria !== `${activeTitle}, espace actif`) return `onglet actif « ${active[0].aria} » (attendu « ${activeTitle}, espace actif »)`;
  return null;
}

async function overflow(p) {
  return p.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));
}
async function shot(p, name) {
  if (!MANIFEST_SET.has(name)) throw new Error(`Capture INATTENDUE : ${name}`);
  await p.waitForTimeout(140);
  if ((await overflow(p)) > 0) throw new Error(`Débordement horizontal sur ${name}`);
  await p.screenshot({ path: join(RUN_OUT, `${name}.png`) });
  produced.add(name);
  console.log('  ✓', name);
}

async function reachTab(p, title, name) {
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  if ((await pathnameOf(p)) !== BASE_PATH) throw new Error(`Route racine inattendue [${name}]`);
  await p.getByRole('button', { name: 'Reprendre', exact: true }).click({ timeout: 4000 });
  await p.getByText('MISSION DU JOUR', { exact: true }).waitFor({ state: 'visible', timeout: 9000 });
  if (title !== 'Accueil') {
    await p.getByRole('link', { name: title, exact: true }).click({ timeout: 4000 });
    await p.waitForTimeout(200);
  }
  const resolved = await pathnameOf(p);
  const expected = `${BASE_PATH}${ROUTE_SUFFIX[title]}`;
  if (resolved !== expected) throw new Error(`Route ${title} inattendue : ${resolved} (attendu ${expected}) [${name}]`);
}

/** Focus clavier : on tabule jusqu'à un lien d'onglet et on vérifie un focus VISIBLE. */
async function focusTabLink(p, name) {
  let focusedTab = null;
  for (let i = 0; i < 40 && !focusedTab; i++) {
    await p.keyboard.press('Tab');
    focusedTab = await p.evaluate(() => {
      const el = document.activeElement;
      const nav = el && el.closest && el.closest('[role="navigation"][aria-label="Navigation principale"]');
      if (!nav || el.tagName.toLowerCase() !== 'a') return null;
      const cs = getComputedStyle(el);
      const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      // Anneau propre au composant : bordure focusRing (violetBright) sur la capsule interne.
      const ring = [...el.querySelectorAll('*')].some((n) => {
        const b = getComputedStyle(n).borderColor;
        return /167,\s*139,\s*250/.test(b); // #A78BFA
      });
      return { label: el.getAttribute('aria-label'), visible: outline || ring };
    });
  }
  if (!focusedTab) throw new Error(`Aucun lien d'onglet atteint au clavier [${name}]`);
  if (!focusedTab.visible) throw new Error(`Focus clavier NON visible sur « ${focusedTab.label} » [${name}]`);
}

async function run() {
  for (const [name, title, w, h, opts] of CASES) {
    const { c, p } = await ctx(w, h, opts);
    await reachTab(p, title, name);
    if (opts.keyboard) await focusTabLink(p, name);
    const err = await checkBar(p, title);
    if (err) throw new Error(`Barre invalide [${name}] : ${err}`);
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
console.log('✓ Manifeste Shell exact ; cinq onglets lisibles dès 320 px ; onglet actif exposé ; focus clavier visible ; 0 erreur console ; 0 débordement. Captures dans', OUT);
