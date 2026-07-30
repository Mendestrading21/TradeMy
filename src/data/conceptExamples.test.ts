/**
 * LOT W2 — Garde-fous des illustrations de fiche : les exemples annotés (`chartExamples`) et les
 * comparaisons recommandées (`COMPARISON_BY_CONCEPT`) sont des ILLUSTRATIONS RÉELLES — chaque clé
 * résout vers un dataset déterministe du moteur (fin des 12 références pendantes héritées),
 * chaque légende est non vide et éducative (garde vocabulaire).
 */
import { describe, it, expect } from '@jest/globals';
import { V5_CONCEPTS } from './learningContent';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';
import { COMPARISONS, COMPARISON_BY_CONCEPT } from '../engines/visual/comparisons';

const WITH_EXAMPLES = V5_CONCEPTS.filter((c) => c.chartExamples.length > 0);

describe('Exemples annotés & comparaisons — illustrations réelles (LOT W2)', () => {
  it('CHAQUE exemple annoté résout vers un dataset déterministe du moteur (zéro clé pendante)', () => {
    for (const c of V5_CONCEPTS) {
      for (const ex of c.chartExamples) {
        expect({ concept: c.id, datasetKey: ex.datasetKey, resolved: Boolean(VISUAL_DATASETS[ex.datasetKey]) })
          .toEqual({ concept: c.id, datasetKey: ex.datasetKey, resolved: true });
      }
    }
  });

  it('le corpus reste illustré : au moins 36 fiches portent un exemple annoté, légende non vide', () => {
    expect(WITH_EXAMPLES.length).toBeGreaterThanOrEqual(36);
    for (const c of WITH_EXAMPLES) {
      for (const ex of c.chartExamples) expect(ex.caption.trim().length).toBeGreaterThan(0);
    }
  });

  it('chaque comparaison recommandée relie un concept RÉEL à une paire RÉELLE dont les deux datasets résolvent', () => {
    const ids = new Set(V5_CONCEPTS.map((c) => c.id));
    expect(Object.keys(COMPARISON_BY_CONCEPT).length).toBeGreaterThanOrEqual(6);
    for (const [conceptId, key] of Object.entries(COMPARISON_BY_CONCEPT)) {
      expect(ids.has(conceptId)).toBe(true);
      const cmp = COMPARISONS[key];
      expect(cmp).toBeDefined();
      expect(VISUAL_DATASETS[cmp.left.datasetKey]).toBeDefined();
      expect(VISUAL_DATASETS[cmp.right.datasetKey]).toBeDefined();
    }
  });

  it('aucune légende (exemples, comparaisons) ne contient BUY/SELL ni promesse de gain', () => {
    const forbidden = /\b(buy|sell|profit garanti|gain garanti|trade gagnant|signal sûr)\b/i;
    for (const c of WITH_EXAMPLES) for (const ex of c.chartExamples) expect(ex.caption).not.toMatch(forbidden);
    for (const cmp of Object.values(COMPARISONS)) {
      expect(cmp.left.caption).not.toMatch(forbidden);
      expect(cmp.right.caption).not.toMatch(forbidden);
    }
  });
});
