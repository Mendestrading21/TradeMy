#!/usr/bin/env node

import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const index = join(dist, 'index.html');

if (!existsSync(index)) {
  console.error('✗ dist/index.html absent. Finaliser uniquement après l’export Expo.');
  process.exit(1);
}

// GitHub Pages renvoie 404.html pour toute URL inconnue. Les 262 routes réelles ont leur propre
// fichier pré-rendu : 404.html ne sert donc QUE les adresses inexistantes. On y place le prérendu
// de l'écran canonique `+not-found` (français, une action « Retour à l'accueil ») — le rendu client
// coïncide avec le prérendu, ce qui supprime la divergence d'hydratation React #418 (audit canon).
const notFound = join(dist, '+not-found.html');
if (!existsSync(notFound)) {
  console.error('✗ dist/+not-found.html absent — l’écran canonique `+not-found` doit être exporté.');
  process.exit(1);
}
copyFileSync(notFound, join(dist, '404.html'));

// Garde-fou pour tout mode Pages qui passerait encore par Jekyll : `_expo/` doit être servi.
writeFileSync(join(dist, '.nojekyll'), '');

console.log('✓ Fallback GitHub Pages et .nojekyll ajoutés');
