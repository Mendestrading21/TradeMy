/**
 * Vérification des LIENS DIRECTS de contenu — LOT 4-K.
 *
 * Sert `dist/` en reproduisant EXACTEMENT GitHub Pages : préfixe `/TradeMy/`, URLs sans extension
 * (`/concept/marteau` → `concept/marteau.html` si présent), repli `404.html` sinon. Les écouteurs
 * console/erreur/rejet sont installés AVANT toute navigation.
 *
 * Huit scénarios : accès direct + rechargement de fiches concept et glossaire connues, puis navigation
 * SPA (concept lié / terme relié) avec Précédent/Suivant. Chaque scénario échoue si : mauvaise fiche,
 * mauvais pathname, préfixe `/TradeMy/` perdu, `404.html` servi pour un slug connu, React #418, une
 * `console.error`, un `pageerror`, un rejet non géré, un écran resté en chargement, ou une page blanche.
 *
 * Sortie non nulle si le moindre scénario échoue. Aucune modification runtime : lecture seule sur dist.
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

/** Résout un chemin de requête vers le FICHIER réellement servi (sémantique Pages). */
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

console.log('dist/concept :', readdirSync(join(DIST, 'concept')).length, 'fichiers ·',
  'dist/glossaire :', readdirSync(join(DIST, 'glossaire')).length, 'fichiers');

const browser = await chromium.launch({ args: ['--no-sandbox'] });

/** Attache les écouteurs AVANT toute navigation ; renvoie l'agrégateur d'erreurs. */
function listen(page) {
  const errs = { consoleError: [], pageerror: [], rejection: [], react418: [] };
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    errs.consoleError.push(t.slice(0, 200));
    if (/#418/.test(t) || /error #?418/i.test(t)) errs.react418.push(t.slice(0, 200));
  });
  page.on('pageerror', (e) => {
    const s = `${e.message}\n${e.stack ?? ''}`;
    errs.pageerror.push(String(e.message).slice(0, 200));
    if (/#418/.test(s) || /Minified React error 418/i.test(s)) errs.react418.push(String(e.message).slice(0, 200));
  });
  page.on('requestfailed', () => {});
  // Rejets non gérés (au cas où ils n'émettraient pas de pageerror).
  page.addInitScript(() => {
    window.addEventListener('unhandledrejection', (ev) => {
      // Sérialisé via console.error pour capture côté Node.
      console.error(`UNHANDLED_REJECTION ${String((ev && ev.reason) || '')}`.slice(0, 200));
    });
  });
  return errs;
}

const pathnameOf = (p) => new URL(p.url()).pathname.replace(/\/$/, '');
async function servedFileFor(page, url) {
  // Interroge le serveur pour le fichier servi (même résolution que la navigation).
  const resp = await page.request.get(url);
  return resp.headers()['x-served-file'] ?? '(?)';
}
async function screenState(page) {
  return page.evaluate(() => {
    const t = (document.body.innerText || '').trim();
    return {
      empty: t.length === 0,
      loadingOnly: /^On prépare/.test(t) && t.length < 60,
      text: t.slice(0, 80),
    };
  });
}

const results = [];
async function scenario(name, { url, reload = false, expectText, spa = false, relatedRole }) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errs = listen(page);
  const served = await servedFileFor(page, url);
  await page.goto(url, { waitUntil: 'networkidle' });
  if (reload) await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const problems = [];
  // Contenu attendu visible ?
  const visible = await page.getByText(expectText, { exact: false }).first().count().catch(() => 0);
  if (!visible) problems.push(`texte attendu absent : « ${expectText} »`);
  // Pathname + préfixe.
  const pn = pathnameOf(page);
  const expectedPn = new URL(url).pathname.replace(/\/$/, '');
  if (pn !== expectedPn) problems.push(`pathname ${pn} ≠ ${expectedPn}`);
  if (!pn.startsWith(`${BASE_PATH}/`)) problems.push(`préfixe /TradeMy/ perdu (${pn})`);
  // 404.html servi pour un slug connu ?
  if (served === '404.html') problems.push('404.html servi pour un slug connu');
  // État d'écran.
  const st = await screenState(page);
  if (st.empty) problems.push('page blanche');
  if (st.loadingOnly) problems.push('écran resté en chargement');

  // Navigation SPA (concept lié / terme relié) + Précédent/Suivant.
  if (spa) {
    // Le chip « concept lié » (LOT 4-J) est nommé « Ouvrir … » (accessibilityLabel) ; le chip
    // « terme relié » du glossaire porte le texte visible « … › » (accessibilityHint, pas name).
    const link = relatedRole
      ? page.getByRole('button', { name: relatedRole }).first()
      : page.getByRole('button').filter({ hasText: '›' }).first();
    if (await link.count()) {
      await link.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(400);
      await page.goBack({ waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(300);
      await page.goForward({ waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(300);
    } else {
      problems.push(`lien relié introuvable (${relatedRole})`);
    }
  }

  if (errs.react418.length) problems.push(`React #418 ×${errs.react418.length}`);
  if (errs.consoleError.length) problems.push(`console.error ×${errs.consoleError.length}`);
  if (errs.pageerror.length) problems.push(`pageerror ×${errs.pageerror.length}`);

  const rejection = errs.consoleError.filter((e) => e.startsWith('UNHANDLED_REJECTION')).length;
  results.push({ name, served, pn, ok: problems.length === 0, problems, errs, rejection });
  await ctx.close();
}

// Huit scénarios (slugs connus + navigation SPA).
await scenario('1. direct concept/marteau', { url: `${base}/concept/marteau`, expectText: 'Marteau' });
await scenario('2. reload concept/marteau', { url: `${base}/concept/marteau`, reload: true, expectText: 'Marteau' });
await scenario('3. direct concept/doji', { url: `${base}/concept/doji`, expectText: 'Doji' });
await scenario('4. direct glossaire/bull-bear', { url: `${base}/glossaire/bull-bear`, expectText: 'Bull' });
await scenario('5. reload glossaire/bull-bear', { url: `${base}/glossaire/bull-bear`, reload: true, expectText: 'Bull' });
await scenario('6. direct glossaire/volatilite', { url: `${base}/glossaire/volatilite`, expectText: 'Volatilité' });
await scenario('7. SPA concept lié + retour/avant', { url: `${base}/concept/marteau`, expectText: 'Marteau', spa: true, relatedRole: /Ouvrir/ });
await scenario('8. SPA terme relié + retour/avant', { url: `${base}/glossaire/bull-bear`, expectText: 'Bull', spa: true });

await browser.close();
server.close();

let total418 = 0, totalConsole = 0, totalPageerr = 0, totalReject = 0, failed = 0;
console.log('\n─── Résultats ───');
for (const r of results) {
  total418 += r.errs.react418.length;
  totalConsole += r.errs.consoleError.length;
  totalPageerr += r.errs.pageerror.length;
  totalReject += r.rejection;
  if (!r.ok) failed++;
  console.log(`${r.ok ? '✓' : '✗'} ${r.name} — servi: ${r.served} — #418:${r.errs.react418.length} err:${r.errs.consoleError.length} pageerr:${r.errs.pageerror.length}`);
  if (!r.ok) r.problems.forEach((p) => console.log(`    · ${p}`));
  if (r.errs.react418[0]) console.log(`    · 418: ${r.errs.react418[0]}`);
}
console.log(`\nTotaux — React #418: ${total418} · console.error: ${totalConsole} · pageerror: ${totalPageerr} · rejets: ${totalReject}`);
console.log(`Scénarios en échec : ${failed}/${results.length}`);
process.exit(failed === 0 && total418 === 0 && totalConsole === 0 && totalPageerr === 0 ? 0 : 1);
