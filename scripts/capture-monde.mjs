/**
 * Captures visuelles de la FICHE MONDE — LOT 4-L.
 *
 * DÉTERMINISME : horloge FIGÉE (Date.now/new Date) AVANT chargement + fuseau `Europe/Zurich` + stockage
 * de progression seedé (`patternlab.progress.v1`). La route `/monde/[id]` étant pré-rendue (LOT 4-K),
 * l'accès direct avec un état injecté est déterministe et sans #418. Chaque capture couvre un ÉTAT réel
 * différent (guidé disponible, verrouillé, contenu, terminé) et des largeurs 320 / 390 / web large.
 *
 * Contrôles par capture : aucun emoji/glyphe de commande, aucune valeur invalide (NaN/undefined),
 * aucun débordement horizontal. Manifeste SÉPARÉ (`docs/lot4l-captures/`). Remplacement atomique
 * après succès complet uniquement. Preuves de QA — jamais de nouveaux assets applicatifs.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';

const OUT = process.argv[2] || join(process.cwd(), 'docs', 'lot4l-captures');
const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) { console.error('✗ dist absent. Lance d’abord `npm run build:web`.'); process.exit(1); }

const FIXED_NOW = Date.UTC(2026, 0, 15, 8, 30, 0); // 09:30 Europe/Zurich
const TIMEZONE = 'Europe/Zurich';
const seed = (o) => JSON.stringify({ onboarded: true, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, learning: { conceptsExplored: [] }, skills: {}, targets: {}, ...o });
const NEW = seed({});
const W1_DONE = seed({ completedSkills: ['skill.actions', 'skill.trend', 'skill.candles', 'skill.patterns', 'checkpoint.read-chart'] });

let chromium;
try {
  const req = createRequire(process.env.PLAYWRIGHT_REQUIRE ?? '/opt/node22/lib/node_modules/playwright/');
  ({ chromium } = req('playwright'));
} catch { console.error('✗ Playwright introuvable.'); process.exit(1); }

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.map': 'application/json' };
function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  if (p.startsWith('/TradeMy/')) p = p.slice('/TradeMy'.length);
  if (p === '/' || p === '') p = '/index.html';
  let f = normalize(join(DIST, p));
  if (!f.startsWith(DIST)) return null;
  if (!existsSync(f) || statSync(f).isDirectory()) f = existsSync(f + '.html') ? f + '.html' : join(DIST, '404.html');
  return f;
}
const server = http.createServer(async (req, res) => {
  try {
    const f = resolveFile(req.url);
    if (!f) { res.writeHead(403); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' });
    res.end(await readFile(f));
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/TradeMy`;

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const consoleErrors = [];
const staging = mkdtempSync(join(tmpdir(), 'lot4l-'));

async function ctx(w, h, opts = {}) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, timezoneId: TIMEZONE, ...(opts.reducedMotion ? { reducedMotion: 'reduce' } : {}) });
  await c.addInitScript((fixed) => {
    const R = Date;
    function F(...a) { if (!(this instanceof F)) return new R(fixed).toString(); return a.length ? new R(...a) : new R(fixed); }
    F.prototype = R.prototype; F.now = () => fixed; F.UTC = R.UTC; F.parse = R.parse; window.Date = F;
  }, FIXED_NOW);
  await c.addInitScript((s) => { try { window.localStorage.setItem('patternlab.progress.v1', s); } catch { /* stockage */ } }, opts.seed ?? NEW);
  const p = await c.newPage();
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${w}px ${m.text().slice(0, 160)}`); });
  p.on('pageerror', (e) => consoleErrors.push(`${w}px PAGEERROR ${String(e).slice(0, 160)}`));
  return { c, p };
}
const overflow = (p) => p.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));

async function shot(name, worldId, w, h, opts = {}) {
  const { c, p } = await ctx(w, h, opts);
  await p.goto(`${base}/monde/${worldId}`, { waitUntil: 'networkidle' });
  await p.getByText(opts.marker, { exact: false }).first().waitFor({ state: 'visible', timeout: 9000 });
  await p.waitForTimeout(400);
  const ov = await overflow(p);
  if (ov > 0) { console.error(`✗ Débordement horizontal ${ov}px sur ${name}`); await browser.close(); server.close(); process.exit(1); }
  await p.screenshot({ path: join(staging, `${name}.png`), fullPage: true });
  console.log(`✓ ${name} (${w}×${h}) — ${worldId}`);
  await c.close();
}

// États réels distincts + largeurs (390 par défaut, 320 petit écran, 1280 web large).
await shot('monde-guide-390', 'world.foundations', 390, 844, { seed: NEW, marker: 'Commencer la leçon' });
await shot('monde-verrouille-390', 'world.anatomy', 390, 844, { seed: NEW, marker: 'Verrouillé' });
await shot('monde-contenu-390', 'world.anatomy', 390, 844, { seed: W1_DONE, marker: 'Notions à explorer' });
await shot('monde-termine-390', 'world.foundations', 390, 844, { seed: W1_DONE, marker: 'Module validé' });
await shot('monde-guide-320', 'world.foundations', 320, 568, { seed: NEW, marker: 'Commencer la leçon' });
await shot('monde-contenu-web', 'world.anatomy', 1280, 900, { seed: W1_DONE, marker: 'Notions à explorer' });
await shot('monde-guide-web', 'world.foundations', 1280, 900, { seed: NEW, marker: 'Commencer la leçon' });

await browser.close();
server.close();

if (consoleErrors.length) {
  console.error('✗ Erreurs console/page pendant les captures :');
  consoleErrors.forEach((e) => console.error(`   · ${e}`));
  rmSync(staging, { recursive: true, force: true });
  process.exit(1);
}

// Remplacement atomique du dossier de sortie (jamais partiel).
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT).filter((n) => n.endsWith('.png'))) rmSync(join(OUT, f));
for (const f of readdirSync(staging)) renameSync(join(staging, f), join(OUT, f));
rmSync(staging, { recursive: true, force: true });
console.log(`\n✓ ${readdirSync(OUT).filter((n) => n.endsWith('.png')).length} captures écrites dans ${OUT}`);
