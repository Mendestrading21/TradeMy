/**
 * Captures visuelles de l'écran RÉVISIONS — LOT 4-C.
 *
 * DÉTERMINISME : `FIXED_NOW` unique + horloge FIGÉE (Date.now/new Date) AVANT chargement + fuseau
 * `Europe/Zurich`. États locaux déterministes seedés par capture (contenu vs à jour). Le contenu
 * visible des captures « contenu » est identique (signature normalisée ×N).
 *
 * PARCOURS RÉEL côté client : racine → « Reprendre » (rôle bouton) → Accueil → carte « Révisions »
 * (rôle bouton) → écran Révisions. NB : Révisions est un écran d'onglet MASQUÉ (canon : « Réviser
 * est intégré à l'Accueil / au Profil ») ; il n'existe donc PAS de bouton d'onglet Révisions
 * sélectionnable. La navigation est prouvée par la ROUTE réellement résolue (`/TradeMy/revisions`),
 * un marqueur STABLE, le CTA principal, et la présence du navigateur d'onglets (5 onglets, dont
 * AUCUN n'est marqué Révisions).
 *
 * Manifeste SÉPARÉ (ne touche ni au pilote ni à l'Accueil). Échec sur : erreur console, pageerror,
 * mauvais écran (route/marqueur/CTA), débordement horizontal, build obsolète, signature non
 * déterministe, capture manquante/inattendue. Publication atomique non destructive.
 *
 * Repro : `npm run build:web` puis `node scripts/capture-revisions.mjs [dossierSortie]`.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';

const OUT = process.argv[2] || join(process.cwd(), 'docs', 'lot4c-captures');
const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) {
  console.error('✗ dist absent. Lance d’abord `npm run build:web`.');
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

// Instant figé, unique : 15 janvier 2026 08:30 UTC = 09:30 Europe/Zurich.
const FIXED_NOW = Date.UTC(2026, 0, 15, 8, 30, 0);
const TIMEZONE = 'Europe/Zurich';
const DAY = 24 * 60 * 60 * 1000;

// États locaux déterministes.
const SEED_CONTENT = JSON.stringify({
  onboarded: true,
  schemaVersion: 8,
  completedSkills: ['skill.actions', 'skill.trend'],
  skills: {
    'skill.actions': { skillId: 'skill.actions', xp: 60, mastery: 0.85, confidence: 0.9, review: { repetitions: 2, easiness: 2.5, intervalDays: 1, dueAt: FIXED_NOW - DAY }, errorTags: { 'couleur-seule': 3 } },
    'skill.trend': { skillId: 'skill.trend', xp: 30, mastery: 0.4, confidence: 0.3, review: { repetitions: 1, easiness: 2.5, intervalDays: 1, dueAt: FIXED_NOW - DAY }, errorTags: {} },
  },
});
const SEED_EMPTY = JSON.stringify({
  onboarded: true,
  schemaVersion: 8,
  completedSkills: ['skill.actions'],
  skills: {
    'skill.actions': { skillId: 'skill.actions', xp: 60, mastery: 0.85, confidence: 0.9, review: { repetitions: 2, easiness: 2.5, intervalDays: 1, dueAt: FIXED_NOW + 3 * DAY }, errorTags: {} },
  },
});

const MANIFEST = ['revisions-320', 'revisions-390', 'revisions-web', 'revisions-empty', 'revisions-reduced', 'revisions-large'];
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
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(180);
  const ov = await overflow(p);
  if (ov > 0) throw new Error(`Débordement horizontal ${ov}px sur ${name}`);
  await p.screenshot({ path: join(RUN_OUT, `${name}.png`) });
  produced.add(name);
  console.log('  ✓', name);
}
async function ctx(w, h, seed, opts = {}) {
  const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, timezoneId: TIMEZONE, ...opts });
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
    window.Date = FrozenDate;
  }, FIXED_NOW);
  await c.addInitScript((s) => { try { window.localStorage.setItem('patternlab.progress.v1', s); } catch { /* stockage */ } }, seed);
  const p = await c.newPage();
  p.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${w}px ${m.text().slice(0, 160)}`); });
  p.on('pageerror', (e) => consoleErrors.push(`${w}px PAGEERROR ${String(e).slice(0, 160)}`));
  return { c, p };
}
const pathnameOf = async (p) => new URL(p.url()).pathname.replace(/\/$/, '');
const SUBTITLE = 'La répétition espacée ramène chaque compétence au bon moment pour ancrer ta mémoire.';

async function signature(p) {
  return await p.evaluate(() => document.body.innerText.split('\n').map((s) => s.trim()).filter(Boolean).join(' | '));
}

/** Va sur Révisions par le parcours RÉEL, vérifie l'écran, applique un zoom optionnel, capture. */
async function reachRevisionsAndShot(p, name, ctaName, opts = {}) {
  await p.goto(`${base}/`, { waitUntil: 'networkidle' });
  if ((await pathnameOf(p)) !== BASE_PATH) throw new Error(`Route racine inattendue [${name}]`);
  await p.getByRole('button', { name: 'Reprendre', exact: true }).click({ timeout: 4000 });
  await p.getByText('MISSION DU JOUR', { exact: true }).waitFor({ state: 'visible', timeout: 9000 });
  // Carte « Révisions » de l'Accueil (rôle bouton) → écran Révisions.
  await p.getByRole('button', { name: /Révisions/ }).first().click({ timeout: 4000 });
  await p.getByText(SUBTITLE, { exact: true }).waitFor({ state: 'visible', timeout: 9000 });
  // Route RÉELLEMENT résolue = /revisions (preuve forte de navigation, l'URL change vraiment).
  const resolved = await pathnameOf(p);
  if (resolved !== `${BASE_PATH}/revisions`) throw new Error(`Route Révisions inattendue: ${resolved} [${name}]`);
  // Navigateur d'onglets présent (5 onglets) ; Révisions est un écran masqué → aucun onglet sélectionné.
  const tabs = await p.getByRole('tab').count();
  if (tabs !== 5) throw new Error(`Navigateur d'onglets absent/incohérent (${tabs} onglets) [${name}]`);
  const selected = await p.locator('[role="tab"][aria-selected="true"]').count();
  if (selected !== 0) throw new Error(`Un onglet primaire est sélectionné à tort sur Révisions [${name}]`);
  // Anti-build-obsolète : marqueurs propres au LOT 4-C.
  if (!(await p.getByText('Progression de maîtrise', { exact: true }).count())) {
    throw new Error(`Marqueur LOT 4-C « Progression de maîtrise » absent (dist obsolète ?) [${name}]`);
  }
  // CTA principal présent (par son rôle + nom).
  if (!(await p.getByRole('button', { name: ctaName }).count())) {
    throw new Error(`CTA principal « ${ctaName} » absent [${name}]`);
  }
  if (opts.zoom) await p.evaluate((z) => { document.documentElement.style.zoom = String(z); }, opts.zoom);
  await shot(p, name);
  return signature(p);
}

const contentSigs = [];
async function run() {
  const CTA_CONTENT = /^Réviser — /;
  const CTA_EMPTY = 'Continuer le parcours';
  // Contenu : 320 / 390 / web(1440) / reduced / texte agrandi.
  for (const [w, h, tag, opts] of [
    [320, 720, '320', {}],
    [390, 844, '390', {}],
    [1440, 900, 'web', {}],
    [390, 844, 'reduced', { reducedMotion: 'reduce' }],
    [430, 932, 'large', { zoom: 1.25 }],
  ]) {
    const ctxOpts = opts.reducedMotion ? { reducedMotion: 'reduce' } : {};
    const { c, p } = await ctx(w, h, SEED_CONTENT, ctxOpts);
    contentSigs.push(await reachRevisionsAndShot(p, `revisions-${tag}`, CTA_CONTENT, { zoom: opts.zoom }));
    await c.close();
  }
  // État « à jour » (aucune révision due).
  {
    const { c, p } = await ctx(390, 844, SEED_EMPTY);
    await reachRevisionsAndShot(p, 'revisions-empty', CTA_EMPTY);
    // Vérifie le marqueur d'état vide (et pas le hero de contenu).
    if (!(await p.getByText('TU ES À JOUR', { exact: true }).count())) throw new Error('État vide « TU ES À JOUR » absent [empty]');
    await c.close();
  }
  // Déterminisme du contenu sur les captures « contenu » (texte visible identique).
  if (new Set(contentSigs).size !== 1) {
    throw new Error(`Contenu Révisions NON déterministe entre viewports :\n${contentSigs.join('\n---\n')}`);
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
if (!failure && contentSigs.length) console.log('Signature contenu déterministe (identique ×5) :\n  ', contentSigs[0].slice(0, 180), '…');

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
const missingFinal = MANIFEST.filter((n) => !finalPngs.has(n));
const unexpectedFinal = [...finalPngs].filter((n) => !MANIFEST_SET.has(n));
if (missingFinal.length || unexpectedFinal.length) {
  console.error('✗ Publication finale incohérente.', { missingFinal, unexpectedFinal });
  process.exit(1);
}
console.log('✓ Manifeste Révisions exact ; horloge/fuseau figés ; route + écran prouvés ; 0 erreur console ; 0 débordement. Captures dans', OUT);
