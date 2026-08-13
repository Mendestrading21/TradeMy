import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Garde-fous P0 — infrastructure (LOT 1 « Fiabilité pédagogique »).
 *
 * Trois invariants qui ne peuvent pas se tester par le code applicatif :
 *  - le déploiement ne doit jamais contourner la gate complète ;
 *  - la CI doit prouver la gate AVANT fusion, sur pull request ;
 *  - le web ne doit jamais bloquer le zoom (accessibilité WCAG 1.4.4 / 1.4.10).
 *
 * ADR-153 — un quatrième bloc gardait `scripts/capture-pilot.mjs` (déterminisme et non-destruction
 * des captures d'écran). Le grand ménage a supprimé les scripts de capture et les 22,6 Mo d'images
 * qu'ils produisaient : la preuve vivante du rendu, ce sont les tests d'intégration qui montent les
 * écrans réels. Un garde-fou sans objet a été retiré avec son objet, pas neutralisé.
 */
const ROOT = process.cwd();

describe('P0 — gate de déploiement', () => {
  it('deploy.yml exécute la gate complète (npm run check) avant de publier', () => {
    const yml = readFileSync(join(ROOT, '.github', 'workflows', 'deploy.yml'), 'utf8');
    // `npm run check` = lint · typecheck · tests · validate:content · release:check · build:web.
    expect(yml).toMatch(/run:\s*npm run check/);
  });

  it('le déploiement reste réservé à `main` (jamais déclenché par une pull request)', () => {
    const yml = readFileSync(join(ROOT, '.github', 'workflows', 'deploy.yml'), 'utf8');
    expect(yml).toMatch(/branches:\s*\[main\]/);
    expect(yml).not.toMatch(/pull_request/);
  });
});

describe('P0 — CI de pull request (preuve avant fusion)', () => {
  const yml = readFileSync(join(ROOT, '.github', 'workflows', 'ci.yml'), 'utf8');

  it('la CI se déclenche sur pull_request vers main', () => {
    expect(yml).toMatch(/pull_request:/);
    expect(yml).toMatch(/branches:\s*\[main\]/);
  });

  it('la CI exécute npm ci, la gate canonique et un contrôle git diff --check', () => {
    expect(yml).toMatch(/run:\s*npm ci/);
    expect(yml).toMatch(/npm run check/);
    expect(yml).toMatch(/git diff --check/);
  });
});

describe('P0 — accessibilité web : zoom (WCAG 1.4.4)', () => {
  it('le meta viewport ne bloque pas le zoom (ni user-scalable=no ni maximum-scale)', () => {
    const html = readFileSync(join(ROOT, 'src', 'app', '+html.tsx'), 'utf8');
    const match = html.match(/name="viewport"[^>]*content="([^"]+)"/);
    expect(match).not.toBeNull();
    const content = match![1];
    expect(content).not.toMatch(/user-scalable\s*=\s*no/i);
    expect(content).not.toMatch(/maximum-scale/i);
  });
});
