import { describe, it, expect } from '@jest/globals';
import { buildRevisionDeck } from './revisionDeck';
import { derivedCardsWithoutDuplicates } from './derivedRevision';
import { V5_CONCEPTS } from './learningContent';

const deck = buildRevisionDeck();

describe('buildRevisionDeck', () => {
  it('réunit toutes les flashcards et mini-quiz des concepts, SANS rien perdre (LOT E2)', () => {
    const attenduRedige = V5_CONCEPTS.reduce((n, c) => n + c.flashcards.length, 0);
    const attenduDerive = V5_CONCEPTS.reduce((n, c) => n + derivedCardsWithoutDuplicates(c).length, 0);
    const attenduQuiz = V5_CONCEPTS.reduce((n, c) => n + c.miniQuizzes.length, 0);
    expect(deck.conceptCount).toBe(V5_CONCEPTS.length);
    expect(deck.quizzes).toHaveLength(attenduQuiz);
    // Le deck = cartes RÉDIGÉES (aucune perdue) + cartes DÉRIVÉES des champs réels (ADR-132).
    expect(deck.flashcards.filter((f) => f.origin === 'redigee')).toHaveLength(attenduRedige);
    expect(deck.flashcards.filter((f) => f.origin === 'derivee')).toHaveLength(attenduDerive);
    expect(deck.flashcards).toHaveLength(attenduRedige + attenduDerive);
    // Chaque carte rédigée est bien présente, à l'identique.
    for (const c of V5_CONCEPTS) {
      for (const f of c.flashcards) {
        expect(deck.flashcards).toContainEqual(
          expect.objectContaining({ conceptSlug: c.slug, front: f.front, back: f.back, origin: 'redigee' }),
        );
      }
    }
    expect(deck.quizzes.length).toBeGreaterThan(0);
  });

  it('chaque carte porte son concept d’origine et un contenu valide', () => {
    for (const f of deck.flashcards) {
      expect(f.conceptSlug).toBeTruthy();
      expect(f.conceptTitle).toBeTruthy();
      expect(f.front.length).toBeGreaterThan(0);
      expect(f.back.length).toBeGreaterThan(0);
    }
    for (const q of deck.quizzes) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
      expect(q.explanation.length).toBeGreaterThan(0);
    }
  });

  it('est déterministe (ordre stable)', () => {
    expect(buildRevisionDeck(V5_CONCEPTS)).toEqual(deck);
  });

  it('chaque carte porte un signal visuel avec résumé accessible (dataset sauf rendus dédiés)', () => {
    const cards = [...deck.flashcards, ...deck.quizzes];
    // Types rendus sans dataset OHLC (rendu dédié) : le datasetKey y est optionnel.
    const noDatasetTypes = new Set(['option-payoff', 'mechanism']);
    for (const c of cards) {
      expect(c.visualSpec).toBeDefined();
      if (!noDatasetTypes.has(c.visualSpec!.type)) {
        expect(c.visualSpec!.datasetKey).toBeTruthy();
      }
      expect(c.visualSpec!.accessibilitySummary.trim().length).toBeGreaterThan(0);
    }
  });
});
