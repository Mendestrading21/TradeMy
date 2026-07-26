#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const deployment = JSON.parse(readFileSync(join(root, 'config/deployment.json'), 'utf8'));
const basePath = deployment.webBasePath;

if (!existsSync(join(dist, 'index.html'))) {
  console.error('✗ dist/index.html absent. Exécuter le contrôle après le build web.');
  process.exit(1);
}

for (const required of ['404.html', '.nojekyll', 'manifest.json']) {
  if (!existsSync(join(dist, required))) {
    console.error(`✗ Fichier GitHub Pages absent : dist/${required}`);
    process.exit(1);
  }
}

const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

const htmlFiles = walk(dist).filter((path) => path.endsWith('.html'));
const missing = new Set();
const stale = [];
let checkedReferences = 0;

const referenceExists = (relativePath) => {
  const candidates = [
    join(dist, relativePath),
    join(dist, `${relativePath}.html`),
    join(dist, relativePath, 'index.html'),
  ];
  return candidates.some(existsSync);
};

for (const htmlPath of htmlFiles) {
  const html = readFileSync(htmlPath, 'utf8');
  if (html.includes('/patternlab/')) stale.push(relative(dist, htmlPath));

  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const reference = match[1].split(/[?#]/, 1)[0];
    if (!reference.startsWith(`${basePath}/`)) continue;

    checkedReferences += 1;
    const relativeAsset = reference.slice(basePath.length + 1);
    if (relativeAsset === '') continue;
    if (!referenceExists(relativeAsset)) missing.add(`${relative(dist, htmlPath)} → ${reference}`);
  }
}

if (stale.length > 0 || missing.size > 0 || checkedReferences === 0) {
  for (const path of stale) console.error(`✗ Ancien chemin /patternlab/ dans ${path}`);
  for (const reference of missing) console.error(`✗ Ressource de build absente : ${reference}`);
  if (checkedReferences === 0) console.error(`✗ Aucune ressource HTML n'utilise ${basePath}/.`);
  process.exit(1);
}

// ── LOT 4-K — Liens directs de contenu : un HTML CONCRET par slug connu (pas de repli #418) ──────
// Prouve que l'export a émis un fichier par entrée `generateStaticParams` (dérivé des registres
// canoniques V5_CONCEPTS / GLOSSARY_TERMS). Échoue si `generateStaticParams` disparaît d'une route,
// si seul le template `[slug].html` existe, ou si un slug canonique témoin n'a pas son HTML.
// La complétude EXHAUSTIVE (chaque slug du registre) est verrouillée côté tests par
// `src/integration/staticParams.test.ts` ; ici on garantit l'ÉMISSION réelle au build.
const DIRECT_ROUTES = [
  { name: 'concept', source: 'src/app/concept/[slug].tsx', registry: 'V5_CONCEPTS', sentinels: ['marteau', 'doji'] },
  { name: 'glossaire', source: 'src/app/glossaire/[slug].tsx', registry: 'GLOSSARY_TERMS', sentinels: ['bull-bear', 'volatilite'] },
];
const routeProblems = [];
const routeCounts = [];
for (const route of DIRECT_ROUTES) {
  const sourcePath = join(root, route.source);
  const source = existsSync(sourcePath) ? readFileSync(sourcePath, 'utf8') : '';
  if (!/generateStaticParams/.test(source)) routeProblems.push(`${route.name} : generateStaticParams absent de ${route.source}`);
  if (!new RegExp(`\\b${route.registry}\\b`).test(source)) routeProblems.push(`${route.name} : generateStaticParams ne dérive pas de ${route.registry}`);
  const dir = join(dist, route.name);
  if (!existsSync(join(dir, '[slug].html'))) routeProblems.push(`${route.name} : template [slug].html absent`);
  const concrete = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.html') && f !== '[slug].html' && f !== 'index.html')
    : [];
  if (concrete.length === 0) routeProblems.push(`${route.name} : aucun HTML concret par slug (seul le template → #418 sur lien direct)`);
  for (const sentinel of route.sentinels) {
    if (!existsSync(join(dir, `${sentinel}.html`))) routeProblems.push(`${route.name} : slug canonique « ${sentinel} » sans HTML concret`);
  }
  routeCounts.push(`${route.name} ${concrete.length}`);
}
if (routeProblems.length > 0) {
  for (const problem of routeProblems) console.error(`✗ ${problem}`);
  process.exit(1);
}

console.log(`✓ ${htmlFiles.length} pages HTML et ${checkedReferences} références vérifiées sous ${basePath}/`);
console.log(`✓ Liens directs : ${routeCounts.join(' · ')} HTML concrets (generateStaticParams dérivé des registres canoniques)`);
