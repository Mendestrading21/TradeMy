/**
 * Vérification de la FICHE MONDE — LOT 4-L.
 *
 * Sert `dist/` en reproduisant EXACTEMENT GitHub Pages (préfixe `/TradeMy/`, URLs sans extension,
 * repli `404.html`). Injecte des états de progression DÉTERMINISTES via `localStorage` AVANT navigation
 * (clé `patternlab.progress.v1`), et installe les écouteurs console/erreur/rejet/#418 avant toute nav.
 *
 * Douze scénarios : monde guidé disponible (direct + rechargement), monde verrouillé, monde de contenu
 * avec concepts, monde terminé, navigations SPA Monde→Session→Retour et Monde→Concept→Retour, monde
 * inconnu via navigation SPA, puis rendu 320×568 / 390×844 / web large / reduced-motion. Chaque scénario
 * échoue si : mauvaise fiche, mauvais pathname, préfixe `/TradeMy/` perdu, `404.html` servi pour un monde
 * connu, React #418, `console.error`, `pageerror`, rejet non géré, écran resté en chargement, page
 * blanche, débordement horizontal, CTA mort, ou régression de progression (écriture au rendu/à la nav).
 *
 * Sortie non nulle si le moindre scénario échoue. Lecture seule sur dist (aucune mutation runtime).
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, statSync, readdirSync } from 'node:fs';
import { extname, join, normalize, relative } from 'node:path';
import { createRequire } from 'node:module';

const DIST = join(process.cwd(), 'dist');
if (!existsSync(DIST)) { console.error('✗ dist absent. Lance `npm run build:web`.'); process.exit(1); }

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
    res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream', 'x-served-file': relative(DIST, f) });
    res.end(await readFile(f));
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/TradeMy`;
const BASE_PATH = new URL(base).pathname.replace(/\/$/, '');
const PROGRESS_KEY = 'patternlab.progress.v1';

console.log('dist/monde :', readdirSync(join(DIST, 'monde')).length, 'fichiers');

// États de progression déterministes (clé AsyncStorage web = localStorage).
const seed = (o) => JSON.stringify({ onboarded: true, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, learning: { conceptsExplored: [] }, skills: {}, targets: {}, ...o });
const NEW = seed({});
const W1_DONE = seed({ completedSkills: ['skill.actions', 'skill.trend', 'skill.candles', 'skill.patterns', 'checkpoint.read-chart'] });

const browser = await chromium.launch({ args: ['--no-sandbox'] });

function listen(page) {
  const errs = { consoleError: [], pageerror: [], rejection: [], react418: [] };
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (t.startsWith('UNHANDLED_REJECTION')) { errs.rejection.push(t.slice(0, 200)); return; }
    errs.consoleError.push(t.slice(0, 200));
    if (/#418/.test(t) || /error #?418/i.test(t)) errs.react418.push(t.slice(0, 200));
  });
  page.on('pageerror', (e) => {
    const s = `${e.message}\n${e.stack ?? ''}`;
    errs.pageerror.push(String(e.message).slice(0, 200));
    if (/#418/.test(s) || /Minified React error 418/i.test(s)) errs.react418.push(String(e.message).slice(0, 200));
  });
  page.addInitScript(() => {
    window.addEventListener('unhandledrejection', (ev) => {
      console.error(`UNHANDLED_REJECTION ${String((ev && ev.reason) || '')}`.slice(0, 200));
    });
  });
  return errs;
}

const pathnameOf = (p) => new URL(p.url()).pathname.replace(/\/$/, '');
async function servedFileFor(page, url) {
  const resp = await page.request.get(url);
  return resp.headers()['x-served-file'] ?? '(?)';
}
async function screenState(page) {
  return page.evaluate(() => {
    const t = (document.body.innerText || '').trim();
    return {
      empty: t.length === 0,
      loadingOnly: /On ouvre le monde/.test(t) && t.length < 60,
      overflow: document.documentElement.scrollWidth - window.innerWidth > 2,
      text: t.slice(0, 120),
    };
  });
}

const results = [];
async function scenario(name, opts) {
  const { url, seedState = NEW, reload = false, expectText = [], forbidText = [], viewport = { width: 390, height: 844 }, reducedMotion, clickName, expectPath, spaTo } = opts;
  const ctx = await browser.newContext({ viewport, ...(reducedMotion ? { reducedMotion: 'reduce' } : {}) });
  await ctx.addInitScript(([key, val]) => { try { window.localStorage.setItem(key, val); } catch { /* stockage */ } }, [PROGRESS_KEY, seedState]);
  const page = await ctx.newPage();
  const errs = listen(page);
  const served = await servedFileFor(page, url);
  await page.goto(url, { waitUntil: 'networkidle' });
  if (reload) await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const problems = [];
  for (const t of expectText) {
    const seen = await page.getByText(t, { exact: false }).first().count().catch(() => 0);
    if (!seen) problems.push(`texte attendu absent : « ${t} »`);
  }
  for (const t of forbidText) {
    const seen = await page.getByText(t, { exact: false }).first().count().catch(() => 0);
    if (seen) problems.push(`texte interdit présent : « ${t} »`);
  }
  const pn = pathnameOf(page);
  const expectedPn = new URL(url).pathname.replace(/\/$/, '');
  if (pn !== expectedPn) problems.push(`pathname ${pn} ≠ ${expectedPn}`);
  if (!pn.startsWith(`${BASE_PATH}/`)) problems.push(`préfixe /TradeMy/ perdu (${pn})`);
  if (served === '404.html') problems.push('404.html servi pour un monde connu');
  const st = await screenState(page);
  if (st.empty) problems.push('page blanche');
  if (st.loadingOnly) problems.push('écran resté en chargement');
  if (st.overflow) problems.push('débordement horizontal');

  // Aucune régression de progression : le rendu ne CHANGE ni les compétences terminées ni les fiches
  // explorées. (Le provider normalise/re-sauvegarde au montage — comportement global, pas de la fiche —
  // donc on compare les champs SÉMANTIQUES, pas la sérialisation brute.)
  const persisted = await page.evaluate((k) => window.localStorage.getItem(k), PROGRESS_KEY);
  const semantic = (raw) => {
    try {
      const p = JSON.parse(raw ?? '{}');
      return JSON.stringify({ done: [...(p.completedSkills ?? [])].sort(), explored: [...(p.learning?.conceptsExplored ?? [])].sort() });
    } catch { return raw; }
  };
  if (semantic(persisted) !== semantic(seedState)) problems.push('progression modifiée par le rendu');

  // CTA → destination réelle (Monde → Session / Concept), puis retour.
  if (clickName) {
    const btn = page.getByRole('button', { name: clickName }).first();
    if (await btn.count()) {
      await btn.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(500);
      const after = pathnameOf(page);
      if (expectPath && !after.includes(expectPath)) problems.push(`CTA « ${clickName} » → ${after} (attendu ~${expectPath})`);
      await page.goBack({ waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(300);
    } else {
      problems.push(`CTA introuvable : « ${clickName} »`);
    }
  }

  // Navigation SPA vers un monde inconnu (client), sans rechargement direct.
  if (spaTo) {
    await page.evaluate((target) => {
      window.history.pushState({}, '', target);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, spaTo);
    await page.waitForTimeout(500);
  }

  if (errs.react418.length) problems.push(`React #418 ×${errs.react418.length}`);
  if (errs.consoleError.length) problems.push(`console.error ×${errs.consoleError.length}`);
  if (errs.pageerror.length) problems.push(`pageerror ×${errs.pageerror.length}`);
  if (errs.rejection.length) problems.push(`rejet ×${errs.rejection.length}`);

  results.push({ name, served, pn, ok: problems.length === 0, problems, errs });
  await ctx.close();
}

const FOUND = `${base}/monde/world.foundations`;
const ANATOMY = `${base}/monde/world.anatomy`;

// 1–2 : monde guidé disponible (direct + rechargement).
await scenario('1. direct monde guidé disponible', { url: FOUND, seedState: NEW, expectText: ['Fondations des marchés', 'Commencer la leçon', 'En cours'] });
await scenario('2. rechargement monde guidé', { url: FOUND, seedState: NEW, reload: true, expectText: ['Fondations des marchés', 'Commencer la leçon'] });
// 3 : monde verrouillé.
await scenario('3. monde verrouillé', { url: ANATOMY, seedState: NEW, expectText: ['Verrouillé'], forbidText: ['Commencer la leçon', 'Explorer les notions'] });
// 4 : monde de contenu avec concepts.
await scenario('4. monde de contenu (concepts)', { url: ANATOMY, seedState: W1_DONE, expectText: ['Notions à explorer', 'Explorer les notions'] });
// 5 : monde terminé (état avancé injecté).
await scenario('5. monde terminé', { url: FOUND, seedState: W1_DONE, expectText: ['Terminé', 'Module validé', 'Continuer vers ce monde'] });
// 6 : Monde guidé → Session → Retour.
await scenario('6. Monde → Session → retour', { url: FOUND, seedState: NEW, expectText: ['Commencer la leçon'], clickName: /Commencer la leçon/, expectPath: '/session/' });
// 7 : Monde contenu → Concept → Retour.
await scenario('7. Monde → Concept → retour', { url: ANATOMY, seedState: W1_DONE, expectText: ['Explorer les notions'], clickName: /Explorer les notions/, expectPath: '/concept/' });
// 8 : monde inconnu via navigation SPA (pas d'accès direct → repli 404).
await scenario('8. monde inconnu via SPA', { url: FOUND, seedState: NEW, spaTo: `${BASE_PATH}/monde/world.inconnu-xyz` });
// 9–11 : responsive.
await scenario('9. petit écran 320×568', { url: FOUND, seedState: NEW, viewport: { width: 320, height: 568 }, expectText: ['Fondations des marchés'] });
await scenario('10. mobile 390×844', { url: FOUND, seedState: W1_DONE, viewport: { width: 390, height: 844 }, expectText: ['Terminé'] });
await scenario('11. web large 1280×900', { url: ANATOMY, seedState: W1_DONE, viewport: { width: 1280, height: 900 }, expectText: ['Notions à explorer'] });
// 12 : reduced motion.
await scenario('12. reduced motion', { url: FOUND, seedState: NEW, reducedMotion: true, expectText: ['Fondations des marchés'] });

await browser.close();
server.close();

let total418 = 0, totalConsole = 0, totalPageerr = 0, totalReject = 0, failed = 0;
console.log('\n─── Résultats ───');
for (const r of results) {
  total418 += r.errs.react418.length;
  totalConsole += r.errs.consoleError.length;
  totalPageerr += r.errs.pageerror.length;
  totalReject += r.errs.rejection.length;
  if (!r.ok) failed++;
  console.log(`${r.ok ? '✓' : '✗'} ${r.name} — servi: ${r.served} — #418:${r.errs.react418.length} err:${r.errs.consoleError.length} pageerr:${r.errs.pageerror.length}`);
  if (!r.ok) r.problems.forEach((p) => console.log(`    · ${p}`));
  if (r.errs.consoleError[0]) console.log(`    · err: ${r.errs.consoleError[0]}`);
}
console.log(`\nTotaux — React #418: ${total418} · console.error: ${totalConsole} · pageerror: ${totalPageerr} · rejets: ${totalReject}`);
console.log(`Scénarios en échec : ${failed}/${results.length}`);
process.exit(failed === 0 && total418 === 0 && totalConsole === 0 && totalPageerr === 0 && totalReject === 0 ? 0 : 1);
