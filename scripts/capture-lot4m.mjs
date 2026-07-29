/**
 * Captures visuelles du module guidé « Lire les chandeliers » — LOT 4-M (direction visuelle).
 *
 * DÉTERMINISME : horloge FIGÉE (Date) + fuseau `Europe/Zurich` + stockage de progression seedé. Les
 * routes `/monde/world.candles`, `/session/skill.candle.*` et `/session/checkpoint.candles` sont
 * pré-rendues → accès direct sans divergence d'hydratation React #418. Pour les états dérivés d'une
 * interaction (contexte, feedback correct, misconception Bobo, placement/reconstruction) l'écran RÉEL
 * est PILOTÉ (clics). Manifeste EXACT ; publication des seuls PNG gérés après succès complet ; ÉCHOUE
 * (code 1) sur erreur console/page, débordement horizontal, marqueur d'écran absent ou capture
 * manquante/inattendue. Preuves de QA — jamais embarquées dans le build.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { copyFileSync, existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';

const OUT = process.argv[2] || join(process.cwd(), 'docs', 'lot4m-captures');
const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) { console.error('✗ dist absent. Lance d’abord `npm run build:web`.'); process.exit(1); }

const FIXED_NOW = Date.UTC(2026, 0, 15, 8, 30, 0);
const TIMEZONE = 'Europe/Zurich';
const DAY = 86_400_000;
const seed = (o) => JSON.stringify({ onboarded: true, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, learning: { conceptsExplored: [] }, skills: {}, targets: {}, ...o });
const FOND_DONE = ['skill.actions', 'skill.trend', 'skill.candles', 'skill.patterns', 'checkpoint.read-chart'];
const ANAT = ['anatomie-bougie', 'unite-de-temps', 'echelle-des-prix'];
const CANDLE_IDS = ['skill.candle.pressure', 'skill.candle.rejection', 'skill.candle.indecision', 'skill.candle.reversal'];
const dueSkill = (id) => ({ skillId: id, xp: 10, mastery: 0.5, confidence: 0.5, review: { repetitions: 1, easiness: 2.5, intervalDays: 1, dueAt: FIXED_NOW - DAY }, errorTags: {} });
const CANDLE_CURRENT = seed({ completedSkills: FOND_DONE, learning: { conceptsExplored: ANAT } });
const CANDLE_AVAILABLE = seed({ completedSkills: [...FOND_DONE, ...CANDLE_IDS], learning: { conceptsExplored: ANAT } });
const CANDLE_REVIEW = seed({ completedSkills: [...FOND_DONE, 'skill.candle.pressure'], learning: { conceptsExplored: ANAT }, skills: { 'skill.candle.pressure': dueSkill('skill.candle.pressure') } });

const MANIFEST = [
  'candle-fiche-390', 'candle-fiche-320', 'candle-fiche-web', 'candle-fiche-reduced-390',
  'candle-checkpoint-available-390', 'candle-review-390',
  'candle-lesson-anatomy-390', 'candle-context-390',
  'candle-feedback-correct-390', 'candle-feedback-bobo-390',
  'candle-reconstruct-place-390', 'candle-checkpoint-390',
];
const MANIFEST_SET = new Set(MANIFEST);
const produced = new Set();
const CRITICAL_TEXT = {
  'candle-lesson-anatomy-390': [
    /APPRENDRE · étape 3 \/ 7/i,
    /^Pression et conviction$/,
    /Voir la fiche complète/i,
    /Suivant/i,
  ],
  'candle-context-390': [/Exercice\s+\d+\s*\/\s*\d+/i, /conclure/i],
  'candle-feedback-correct-390': [/Exercice\s+\d+\s*\/\s*\d+/i, /Exact/i],
  'candle-feedback-bobo-390': [/Exercice\s+\d+\s*\/\s*\d+/i, /La figure montrée est/i],
  'candle-reconstruct-place-390': [/Exercice\s+\d+\s*\/\s*\d+/i, /Valider mon niveau/i],
  'candle-checkpoint-390': [/Exercice\s+\d+\s*\/\s*\d+/i],
};

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
const browser = await chromium.launch({
  args: ['--no-sandbox', '--disable-gpu'],
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
});
const staging = mkdtempSync(join(tmpdir(), 'lot4m-'));
const consoleErrors = [];

const vis = async (p, re) => (await p.getByText(re).count().catch(() => 0)) > 0;
// Clic ROBUSTE : cible d'abord le bouton accessible (getByRole), repli sur le texte. Le rendu RN-web
// place parfois plusieurs nœuds texte « Suivant » ; le rôle bouton vise le contrôle réel.
const clickText = async (p, re, t = 1200) => {
  try { await p.getByRole('button', { name: re }).first().click({ timeout: t }); return true; } catch { /* repli */ }
  try { await p.getByText(re).first().click({ timeout: t }); return true; } catch { return false; }
};
async function overflow(p) {
  const v = await p.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));
  if (typeof v !== 'number' || Number.isNaN(v)) throw new Error('Mesure de débordement impossible');
  return v;
}
async function resetHorizontalScroll(p) {
  await p.evaluate(() => {
    window.scrollTo(0, 0);
    for (const el of document.querySelectorAll('*')) {
      if (el instanceof HTMLElement && el.scrollLeft !== 0) el.scrollLeft = 0;
    }
  });
}
async function layoutFingerprint(p) {
  return p.evaluate(() => {
    const round = (v) => Math.round(v * 2) / 2;
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
    };
    const rects = [...document.querySelectorAll('[role="button"], [dir="auto"]')]
      .filter(visible)
      .slice(0, 240)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return [round(r.left), round(r.top), round(r.right), round(r.bottom), getComputedStyle(el).transform];
      });
    const scroll = [...document.querySelectorAll('*')]
      .filter((el) => el instanceof HTMLElement && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1)
      .slice(0, 40)
      .map((el) => [el.tagName, round(el.scrollLeft), el.clientWidth, el.scrollWidth]);
    return JSON.stringify({ width: window.innerWidth, x: window.scrollX, rects, scroll });
  });
}
async function waitForStableLayout(p, name) {
  await p.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await resetHorizontalScroll(p);
  let previous = null;
  let equalSamples = 0;
  for (let i = 0; i < 16; i++) {
    await p.waitForTimeout(120);
    const current = await layoutFingerprint(p);
    if (current === previous) equalSamples += 1;
    else equalSamples = 0;
    if (equalSamples >= 1) return; // deux mesures successives identiques
    previous = current;
  }
  throw new Error(`Mise en page non stable avant ${name}`);
}
async function geometryReport(p) {
  return p.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
    };
    const describe = (el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute('role'),
        text: (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80),
        left: Math.round(r.left * 10) / 10,
        right: Math.round(r.right * 10) / 10,
        width: Math.round(r.width * 10) / 10,
        transform: getComputedStyle(el).transform,
      };
    };
    const offscreen = [...document.querySelectorAll('[role="button"], [dir="auto"], svg')]
      .filter(visible)
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.left < -0.5 || r.right > viewportWidth + 0.5 || r.width <= 0 || r.height <= 0;
      })
      .slice(0, 12)
      .map(describe);
    const overflowing = [...document.querySelectorAll('*')]
      .filter((el) => el instanceof HTMLElement && visible(el))
      .filter((el) => el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1)
      .slice(0, 12)
      .map((el) => ({
        ...describe(el),
        clientWidth: el.clientWidth,
        scrollWidth: el.scrollWidth,
        scrollLeft: Math.round(el.scrollLeft * 10) / 10,
        overflowX: getComputedStyle(el).overflowX,
      }));
    return {
      viewportWidth,
      windowScrollX: window.scrollX,
      offscreen,
      overflowing,
    };
  });
}
async function assertCriticalGeometry(p, name) {
  for (const marker of CRITICAL_TEXT[name] ?? []) {
    const locator = p.getByText(marker).first();
    if (!(await locator.count())) throw new Error(`Élément critique absent sur ${name}: ${marker}`);
    const box = await locator.boundingBox();
    if (!box || box.width <= 0 || box.height <= 0 || box.x < -0.5 || box.x + box.width > p.viewportSize().width + 0.5) {
      throw new Error(`Élément critique hors viewport sur ${name}: ${marker} ${JSON.stringify(box)}`);
    }
  }
  if (name === 'candle-lesson-anatomy-390') {
    const charts = await p.locator('svg').count();
    if (!charts) throw new Error('Graphique anatomie absent');
  }
}
async function ctx(w, h, opts = {}) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, timezoneId: TIMEZONE, ...(opts.reducedMotion ? { reducedMotion: 'reduce' } : {}) });
  await c.addInitScript((fixed) => {
    const R = Date;
    function F(...a) { if (!(this instanceof F)) return new R(fixed).toString(); return a.length ? new R(...a) : new R(fixed); }
    F.prototype = R.prototype; F.now = () => fixed; F.UTC = R.UTC; F.parse = R.parse; window.Date = F;
  }, FIXED_NOW);
  await c.addInitScript((s) => { try { window.localStorage.setItem('patternlab.progress.v1', s); } catch { /* stockage */ } }, opts.seed ?? CANDLE_CURRENT);
  const p = await c.newPage();
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${w}px ${m.text().slice(0, 150)}`); });
  p.on('pageerror', (e) => consoleErrors.push(`${w}px PAGEERROR ${String(e).slice(0, 150)}`));
  return { c, p };
}
async function nav(p, path, markerRe, screen) {
  const response = await p.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  try { await p.getByText(markerRe).first().waitFor({ timeout: 9000 }); }
  catch {
    const body = ((await p.locator('body').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim().slice(0, 240);
    throw new Error(`Écran non rendu: ${screen} (HTTP ${response?.status() ?? 'inconnu'}, marqueur absent sur ${path}, contenu: ${body || 'vide'})`);
  }
}
async function shot(p, name) {
  if (!MANIFEST_SET.has(name)) throw new Error(`Capture hors manifeste: ${name}`);
  await waitForStableLayout(p, name);
  const ov = await overflow(p);
  if (ov > 0) throw new Error(`Débordement horizontal ${ov}px sur ${name}`);
  const geometry = await geometryReport(p);
  if (geometry.windowScrollX !== 0 || geometry.offscreen.length || geometry.overflowing.length) {
    throw new Error(`Géométrie horizontale invalide sur ${name}: ${JSON.stringify(geometry)}`);
  }
  await assertCriticalGeometry(p, name);
  await p.screenshot({ path: join(staging, `${name}.png`), fullPage: true });
  produced.add(name);
  console.log('  ✓', name);
}
const PRACTICE = /Exercice\s+\d+\s*\/\s*\d+/;
async function reachPractice(p, tag) {
  for (let i = 0; i < 24; i++) {
    if (await vis(p, PRACTICE)) return;
    if (await clickText(p, /Commencer les exercices/i, 800)) { await p.waitForTimeout(500); continue; }
    await clickText(p, /Suivant/i, 800);
    await p.waitForTimeout(300);
  }
  throw new Error(`Phase pratique non atteinte [${tag}]`);
}
/** Avance d'un exercice (réponse quelconque) puis Continuer — pour ATTEINDRE un exercice plus loin. */
async function advance(p) {
  const bs = await p.getByRole('button').all();
  for (const b of bs) {
    const t = ((await b.textContent().catch(() => '')) || '').trim();
    if (!t || /continuer|voir mon|recommencer|retour|accueil|refaire|monter|descendre|◀|▶|valider|réessayer|suivant/i.test(t)) continue;
    await b.click({ timeout: 800 }).catch(() => {});
    break;
  }
  await clickText(p, /Valider mon niveau|Valider l’ordre|Valider l'ordre/i, 600);
  await p.waitForTimeout(350);
  await clickText(p, /Continuer|Voir mon résultat/i, 800);
  await p.waitForTimeout(350);
}

async function run() {
  // ── Fiche du monde 3 : états / largeurs / reduced-motion ──
  await (async () => { const { c, p } = await ctx(390, 844, { seed: CANDLE_CURRENT }); await nav(p, '/monde/world.candles', /Chandeliers japonais/, 'fiche-390'); await shot(p, 'candle-fiche-390'); await c.close(); })();
  await (async () => { const { c, p } = await ctx(320, 568, { seed: CANDLE_CURRENT }); await nav(p, '/monde/world.candles', /Chandeliers japonais/, 'fiche-320'); await shot(p, 'candle-fiche-320'); await c.close(); })();
  await (async () => { const { c, p } = await ctx(1280, 900, { seed: CANDLE_CURRENT }); await nav(p, '/monde/world.candles', /Chandeliers japonais/, 'fiche-web'); await shot(p, 'candle-fiche-web'); await c.close(); })();
  await (async () => { const { c, p } = await ctx(390, 844, { seed: CANDLE_CURRENT, reducedMotion: true }); await nav(p, '/monde/world.candles', /Chandeliers japonais/, 'fiche-reduced'); await shot(p, 'candle-fiche-reduced-390'); await c.close(); })();

  // ── Checkpoint disponible (toutes compétences faites) + état « à réviser » ──
  await (async () => {
    const { c, p } = await ctx(390, 844, { seed: CANDLE_AVAILABLE });
    await nav(p, '/monde/world.candles', /Chandeliers japonais/, 'checkpoint-available');
    if (!(await vis(p, /checkpoint/i))) throw new Error('État checkpoint disponible non visible');
    await shot(p, 'candle-checkpoint-available-390'); await c.close();
  })();
  await (async () => {
    const { c, p } = await ctx(390, 844, { seed: CANDLE_REVIEW });
    await nav(p, '/monde/world.candles', /Chandeliers japonais/, 'review');
    if (!(await vis(p, /réviser/i))) throw new Error('État « à réviser » non visible');
    await shot(p, 'candle-review-390'); await c.close();
  })();

  // ── Leçon (anatomie du marubozu) : phase Apprendre, quelques étapes vers le visuel ──
  await (async () => {
    const { c, p } = await ctx(390, 844, { seed: CANDLE_CURRENT });
    await nav(p, '/session/skill.candle.pressure', /Pression et conviction/, 'lesson');
    await clickText(p, /Suivant/i, 800); await p.waitForTimeout(300);
    await clickText(p, /Suivant/i, 800); await p.waitForTimeout(300);
    await shot(p, 'candle-lesson-anatomy-390'); await c.close();
  })();

  // ── Exercice de CONTEXTE (scénario conditionnel « Que peux-tu conclure ? ») ──
  await (async () => {
    const { c, p } = await ctx(390, 844, { seed: CANDLE_CURRENT });
    await nav(p, '/session/skill.candle.indecision', /L’indécision|L'indécision/, 'context');
    await reachPractice(p, 'context');
    let found = false;
    for (let i = 0; i < 6 && !found; i++) {
      if (await vis(p, /conclure/i)) { found = true; break; }
      await advance(p);
    }
    if (!found) throw new Error('Exercice de contexte (scénario) non atteint');
    await shot(p, 'candle-context-390'); await c.close();
  })();

  // ── Feedback CORRECT (reconnaissance réussie) ──
  await (async () => {
    const { c, p } = await ctx(390, 844, { seed: CANDLE_CURRENT });
    await nav(p, '/session/skill.candle.pressure', /Pression et conviction/, 'fb-ok');
    await reachPractice(p, 'fb-ok');
    if (!(await clickText(p, /Un marubozu/i, 1500))) throw new Error('Option correcte (marubozu) introuvable');
    await p.waitForTimeout(700);
    if (!(await vis(p, /Exact/i))) throw new Error('Feedback correct non affiché');
    await shot(p, 'candle-feedback-correct-390'); await c.close();
  })();

  // ── Feedback avec MISCONCEPTION (erreur → Bobo) ──
  await (async () => {
    const { c, p } = await ctx(390, 844, { seed: CANDLE_CURRENT });
    await nav(p, '/session/skill.candle.pressure', /Pression et conviction/, 'fb-bobo');
    await reachPractice(p, 'fb-bobo');
    if (!(await clickText(p, /Un doji/i, 1500))) throw new Error('Option erronée (doji) introuvable');
    await p.waitForTimeout(700);
    if (!(await vis(p, /La figure montrée est/i))) throw new Error('Feedback d’erreur non affiché');
    await shot(p, 'candle-feedback-bobo-390'); await c.close();
  })();

  // ── Placement / reconstruction d'un extrême OHLC (invalidation, clavier/tactile) ──
  await (async () => {
    const { c, p } = await ctx(390, 844, { seed: CANDLE_CURRENT });
    await nav(p, '/session/skill.candle.pressure', /Pression et conviction/, 'place');
    await reachPractice(p, 'place');
    let found = false;
    for (let i = 0; i < 6 && !found; i++) {
      if (await vis(p, /Valider mon niveau/i)) { found = true; break; }
      await advance(p);
    }
    if (!found) throw new Error('Exercice de placement (invalidation) non atteint');
    await shot(p, 'candle-reconstruct-place-390'); await c.close();
  })();

  // ── Revue (checkpoint propre) en pratique ──
  await (async () => {
    const { c, p } = await ctx(390, 844, { seed: CANDLE_CURRENT });
    await nav(p, '/session/checkpoint.candles', PRACTICE, 'checkpoint');
    await shot(p, 'candle-checkpoint-390'); await c.close();
  })();
}

let failure = null;
try { await run(); } catch (e) { failure = e; }
await browser.close();
server.close();

const missing = MANIFEST.filter((n) => !produced.has(n));
console.log(`\nCaptures produites : ${produced.size}/${MANIFEST.length} · erreurs console/page : ${consoleErrors.length}`);
consoleErrors.slice(0, 8).forEach((e) => console.log('   !', e));
let ok = true;
if (failure) { console.error('✗ ÉCHEC :', failure.message); ok = false; }
if (consoleErrors.length) { console.error('✗ ÉCHEC : erreurs console/page.'); ok = false; }
if (missing.length) { console.error('✗ Captures manquantes :', missing.join(', ')); ok = false; }
if (!ok) { rmSync(staging, { recursive: true, force: true }); process.exit(1); }

mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT).filter((n) => n.endsWith('.png'))) rmSync(join(OUT, f));
for (const f of readdirSync(staging)) copyFileSync(join(staging, f), join(OUT, f));
rmSync(staging, { recursive: true, force: true });
console.log(`\n✓ ${readdirSync(OUT).filter((n) => n.endsWith('.png')).length} captures écrites dans ${OUT}`);
