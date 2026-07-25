import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verrou LOT 4-E — Apprendre / Parcours ne DÉTOURNE aucune couleur réservée :
 *  - `bullish`/`bearish` = vérité de MARCHÉ uniquement ;
 *  - `technical` = annotation graphique uniquement (plus jamais « Disponible/Guidé/Exploré/Débloqué ») ;
 *  - `advanced` = difficulté avancée réelle uniquement.
 * Les états pédagogiques emploient `success` (terminé), `mastery` (maîtrisé), `info` (disponible/exploré),
 * `primaryBright` (en cours) et `reward` (jalon RÉELLEMENT atteint — vérifié au rendu dans
 * `parcours.integration.test.tsx`).
 * (Complète la preuve de RENDU par un verrou de SOURCE.)
 */
const PARCOURS = join(process.cwd(), 'src', 'app', '(tabs)', 'parcours.tsx');
const SRC = readFileSync(PARCOURS, 'utf8');

describe('LOT 4-E — couleurs sémantiques du Parcours', () => {
  it('ne détourne ni bullish, ni bearish, ni technical, ni advanced', () => {
    expect(SRC).not.toMatch(/theme\.colors\.bullish/);
    expect(SRC).not.toMatch(/theme\.colors\.bearish/);
    expect(SRC).not.toMatch(/theme\.colors\.technical/);
    expect(SRC).not.toMatch(/theme\.colors\.advanced/);
  });

  it('emploie bien les tokens pédagogiques canoniques (success, mastery, info)', () => {
    expect(SRC).toMatch(/theme\.colors\.success/);
    expect(SRC).toMatch(/theme\.colors\.mastery/);
    expect(SRC).toMatch(/theme\.colors\.info/);
  });
});
