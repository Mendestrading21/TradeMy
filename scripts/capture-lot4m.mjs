/**
 * Captures visuelles du module guidé « Lire les chandeliers » — LOT 4-M.
 *
 * DÉTERMINISME : horloge FIGÉE (Date.now/new Date) AVANT chargement + fuseau `Europe/Zurich` + stockage
 * de progression seedé (`patternlab.progress.v1`). Les routes `/monde/world.candles` et
 * `/session/skill.candle.*` + `/session/checkpoint.candles` sont pré-rendues (generateStaticParams
 * dérivé des registres) → accès direct déterministe, sans divergence d'hydratation React #418.
 *
 * Couverture : fiche du monde 3 (module + checkpoint propre) aux largeurs 320/390/web + reduced-motion ;
 * deux sessions Chandeliers (leçon visual-first) ; la revue (checkpoint) en pratique. Contrôles par
 * capture : aucune erreur console/page, aucun débordement horizontal. Manifeste SÉPARÉ
 * (`docs/lot4m-captures/`). Remplacement atomique après succès complet uniquement. Preuves de QA.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';

const OUT = process.argv[2] || join(process.cwd(), 'docs', 'lot4m-captures');
const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) { console.error('✗ dist absent. Lance d’abord `npm run build:web`.'); process.exit(1); }

const FIXED_NOW = Date.UTC(2026, 0, 15, 8, 30, 0); // 09:30 Europe/Zurich
const TIMEZONE = 'Europe/Zurich';
const seed = (o) => JSON.stringify({ onboarded: true, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, learning: { conceptsExplored: [] }, skills: {}, targets: {}, ...o });
const NEW = seed({});
// Monde 1 terminé + monde 2 (anatomie) entièrement exploré → monde 3 (Chandeliers) « en cours ».
const CANDLE_CURRENT = seed({
  completedSkills: ['skill.actions', 'skill.trend', 'skill.candles', 'skill.patterns', 'checkpoint.read-chart'],
  learning: { conceptsExplored: ['anatomie-bougie', 'unite-de-temps', 'echelle-des-prix'] },
});

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
const staging = mkdtempSync(join(tmpdir(), 'lot4m-'));

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

async function shot(name, route, w, h, opts = {}) {
  const { c, p } = await ctx(w, h, opts);
  await p.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  await p.getByText(opts.marker, { exact: false }).first().waitFor({ state: 'visible', timeout: 9000 });
  await p.waitForTimeout(400);
  const ov = await overflow(p);
  if (ov > 0) { console.error(`✗ Débordement horizontal ${ov}px sur ${name}`); await browser.close(); server.close(); process.exit(1); }
  await p.screenshot({ path: join(staging, `${name}.png`), fullPage: true });
  console.log(`✓ ${name} (${w}×${h}) — ${route}`);
  await c.close();
}

// ── Fiche du monde 3 (module Chandeliers + checkpoint propre) : états/largeurs + reduced-motion ──
await shot('candle-fiche-390', '/monde/world.candles', 390, 844, { seed: CANDLE_CURRENT, marker: 'Chandeliers japonais' });
await shot('candle-fiche-320', '/monde/world.candles', 320, 568, { seed: CANDLE_CURRENT, marker: 'Chandeliers japonais' });
await shot('candle-fiche-web', '/monde/world.candles', 1280, 900, { seed: CANDLE_CURRENT, marker: 'Chandeliers japonais' });
await shot('candle-fiche-reduced-390', '/monde/world.candles', 390, 844, { seed: CANDLE_CURRENT, marker: 'Chandeliers japonais', reducedMotion: true });
// ── Sessions Chandeliers (phase Apprendre, leçon visual-first) ──
await shot('candle-session-pressure-390', '/session/skill.candle.pressure', 390, 844, { seed: NEW, marker: 'Marubozu' });
await shot('candle-session-pressure-320', '/session/skill.candle.pressure', 320, 568, { seed: NEW, marker: 'Marubozu' });
await shot('candle-session-pressure-web', '/session/skill.candle.pressure', 1280, 900, { seed: NEW, marker: 'Marubozu' });
await shot('candle-session-rejection-390', '/session/skill.candle.rejection', 390, 844, { seed: NEW, marker: 'marteau' });
// ── Revue (checkpoint propre) en pratique ──
await shot('candle-checkpoint-390', '/session/checkpoint.candles', 390, 844, { seed: NEW, marker: 'Exercice' });
await shot('candle-checkpoint-web', '/session/checkpoint.candles', 1280, 900, { seed: NEW, marker: 'Exercice' });

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
