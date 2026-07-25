import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verrou LOT 4-C — Révisions ne DÉTOURNE aucune couleur réservée :
 *  - `bullish`/`bearish` = vérité de MARCHÉ (haussier/baissier), jamais une réussite pédagogique ;
 *  - `technical` = annotation graphique (cyan), jamais un statut ;
 *  - `advanced` = difficulté, jamais une simple décoration.
 * Les statuts de maîtrise emploient des tokens PÉDAGOGIQUES/informationnels
 * (`neutral`/`info`/`warning`/`success`/`mastery`) ; les erreurs emploient `feedbackIncorrect`.
 * (Complète la preuve de RENDU dans `revisions.integration.test.tsx` par un verrou de SOURCE.)
 */
const REVISIONS = join(process.cwd(), 'src', 'app', '(tabs)', 'revisions.tsx');
const SRC = readFileSync(REVISIONS, 'utf8');

describe('LOT 4-C — couleurs sémantiques de Révisions', () => {
  it('ne détourne ni bullish, ni bearish, ni technical, ni advanced', () => {
    expect(SRC).not.toMatch(/theme\.colors\.bullish/);
    expect(SRC).not.toMatch(/theme\.colors\.bearish/);
    expect(SRC).not.toMatch(/theme\.colors\.technical/);
    expect(SRC).not.toMatch(/theme\.colors\.advanced/);
  });

  it('emploie des tokens pédagogiques pour la maîtrise (success + mastery)', () => {
    expect(SRC).toMatch(/theme\.colors\.success/);
    expect(SRC).toMatch(/theme\.colors\.mastery/);
  });

  it('emploie feedbackIncorrect (et non un rouge de marché) pour les erreurs', () => {
    expect(SRC).toMatch(/theme\.colors\.feedbackIncorrect/);
  });
});
