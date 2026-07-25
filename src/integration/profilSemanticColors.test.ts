import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verrou LOT 4-D — Profil ne DÉTOURNE aucune couleur réservée :
 *  - `bullish`/`bearish` = vérité de MARCHÉ uniquement (jamais la connectivité ni un état pédagogique) ;
 *  - `technical` = annotation graphique uniquement ;
 *  - `advanced` = difficulté avancée uniquement.
 * Les états positifs/pédagogiques emploient `success`/`info`/`warning`/`mastery`/`reward`.
 * (Complète la preuve de RENDU dans `profil.integration.test.tsx` par un verrou de SOURCE.)
 */
const PROFIL = join(process.cwd(), 'src', 'app', '(tabs)', 'profil.tsx');
const SRC = readFileSync(PROFIL, 'utf8');

describe('LOT 4-D — couleurs sémantiques du Profil', () => {
  it('ne détourne ni bullish, ni bearish, ni technical, ni advanced', () => {
    expect(SRC).not.toMatch(/theme\.colors\.bullish/);
    expect(SRC).not.toMatch(/theme\.colors\.bearish/);
    expect(SRC).not.toMatch(/theme\.colors\.technical/);
    expect(SRC).not.toMatch(/theme\.colors\.advanced/);
  });
});
