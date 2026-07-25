import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verrou LOT 4-G — le Laboratoire ne DÉTOURNE aucune couleur réservée, et emploie les tokens
 * pédagogiques attendus. Un atelier d'ESSAI n'est ni une récompense, ni une maîtrise, ni une
 * difficulté avancée, ni une direction de marché :
 *  - `bullish`/`bearish` = direction de MARCHÉ uniquement (aucun élément du Laboratoire ne l'est) ;
 *  - `reward` = récompense réellement obtenue (jamais un feedback d'essai) ;
 *  - `mastery` = maîtrise réelle (le Laboratoire n'en produit aucune) ;
 *  - `advanced` = difficulté avancée réelle.
 * `technical` (cyan d'annotation) reste PERMIS, mais UNIQUEMENT pour les repères graphiques
 * (lecture guidée), jamais pour la navigation ni un état de progression.
 */
const LAB = join(process.cwd(), 'src', 'app', '(tabs)', 'laboratoire.tsx');
const SRC = readFileSync(LAB, 'utf8');

describe('LOT 4-G — couleurs sémantiques du Laboratoire', () => {
  it('ne détourne ni bullish, ni bearish, ni reward, ni mastery, ni advanced', () => {
    for (const t of ['bullish', 'bearish', 'reward', 'mastery', 'advanced']) {
      expect(SRC).not.toMatch(new RegExp(`theme\\.colors\\.${t}\\b`));
    }
  });

  it('emploie des tokens de feedback DISTINCTS du marché (feedbackCorrect / feedbackIncorrect)', () => {
    expect(SRC).toMatch(/theme\.colors\.feedbackCorrect\b/);
    expect(SRC).toMatch(/theme\.colors\.feedbackIncorrect\b/);
  });

  it('emploie les tokens pédagogiques canoniques (falseSignal, warning, info, success)', () => {
    expect(SRC).toMatch(/theme\.colors\.falseSignal\b/);
    expect(SRC).toMatch(/theme\.colors\.warning\b/);
    expect(SRC).toMatch(/theme\.colors\.info\b/);
    expect(SRC).toMatch(/theme\.colors\.success\b/);
  });

  it('n’emploie `technical` que pour les repères d’annotation (jamais la navigation)', () => {
    // Le cyan d'annotation n'apparaît que dans le bloc des repères de lecture guidée (icône + libellé).
    const occurrences = SRC.match(/theme\.colors\.technical\b/g) ?? [];
    expect(occurrences.length).toBe(2);
    // Les lignes qui l'emploient concernent bien un repère (`a.label` / icône `target`), pas un onglet/route.
    const lines = SRC.split('\n').filter((l) => /theme\.colors\.technical\b/.test(l));
    for (const l of lines) {
      expect(l).not.toMatch(/route|push|chevron|tab/i);
    }
  });
});
