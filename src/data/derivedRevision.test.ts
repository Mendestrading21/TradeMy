import { describe, it, expect } from '@jest/globals';
import { derivedCards, derivedCardsWithoutDuplicates, ANGLE_LABEL, type RevisionAngle } from './derivedRevision';
import { buildRevisionDeck } from './revisionDeck';
import { V5_CONCEPTS } from './learningContent';

/**
 * LOT E2 — verrou de la PROFONDEUR de révision.
 *
 * Le corpus était large mais peu profond : 1,03 flashcard rédigée et 1 mini-quiz par fiche. Les
 * cartes dérivées comblent ce trou SANS inventer de contenu : chaque carte cite un champ réel de
 * la fiche (critères, confirmation, invalidation, erreur, faux signal, limite). Ce test garantit
 * que rien n'est fabriqué, que rien n'est vide, et que la matière a réellement augmenté.
 */
const VOCABULAIRE_INTERDIT = /\b(buy|sell|profit garanti|gain garanti|trade gagnant|signal sûr|liberté financière garantie)\b/i;

describe('LOT E2 — cartes de révision dérivées des champs réels', () => {
  it('chaque carte dérivée cite un contenu RÉEL de sa fiche (aucun texte inventé)', () => {
    const inventees: string[] = [];
    for (const c of V5_CONCEPTS) {
      const sources: Record<RevisionAngle, string[]> = {
        reconnaitre: c.howToRecognize,
        confirmer: c.confirmationZone ? [c.confirmationZone] : [],
        invalider: c.invalidation ? [c.invalidation] : [],
        erreur: c.commonMistakes,
        'faux-signal': c.falseSignals,
        limite: c.interpretationLimits,
      };
      for (const card of derivedCards(c)) {
        // Le dos de la carte doit provenir mot pour mot d'un champ de la fiche (à la ponctuation
        // finale et à la capitale initiale près, ajoutées par la mise en phrase).
        const noyau = card.back.replace(/\.$/, '');
        const ok = sources[card.angle].some((s) => {
          const t = s.trim().replace(/\.$/, '');
          return noyau.toLocaleLowerCase('fr-FR').includes(t.toLocaleLowerCase('fr-FR').slice(1));
        });
        if (!ok) inventees.push(`${c.slug}/${card.angle}`);
      }
    }
    expect(inventees).toEqual([]);
  });

  it('aucune carte vide, aucun titre de concept manquant, aucun angle inconnu', () => {
    for (const c of V5_CONCEPTS) {
      for (const card of derivedCards(c)) {
        expect(card.front.trim().length).toBeGreaterThan(10);
        expect(card.back.trim().length).toBeGreaterThan(3);
        expect(card.front).toContain(c.title);
        expect(ANGLE_LABEL[card.angle]).toBeTruthy();
      }
    }
  });

  it('une fiche sans invalidation documentée ne fabrique PAS de carte d’invalidation', () => {
    const sansInvalidation = V5_CONCEPTS.filter((c) => !c.invalidation);
    expect(sansInvalidation.length).toBeGreaterThan(0); // le corpus en compte réellement
    for (const c of sansInvalidation) {
      expect(derivedCards(c).some((d) => d.angle === 'invalider')).toBe(false);
    }
  });

  it('la carte RÉDIGÉE prime : son doublon dérivé est écarté', () => {
    const faux = {
      ...V5_CONCEPTS[0],
      flashcards: [{ front: `À quoi reconnaît-on : ${V5_CONCEPTS[0].title} ?`, back: 'Version rédigée.' }],
    };
    const dedup = derivedCardsWithoutDuplicates(faux);
    expect(dedup.some((d) => d.angle === 'reconnaitre')).toBe(false);
    // Les autres angles restent disponibles.
    expect(dedup.length).toBeGreaterThan(0);
  });

  it('le deck gagne réellement en profondeur, provenance tracée, sans vocabulaire interdit', () => {
    const deck = buildRevisionDeck();
    const redigees = deck.flashcards.filter((f) => f.origin === 'redigee');
    const derivees = deck.flashcards.filter((f) => f.origin === 'derivee');
    // Avant ce lot, le deck n'avait QUE les cartes rédigées (~1 par fiche).
    expect(redigees.length).toBeGreaterThanOrEqual(V5_CONCEPTS.length);
    expect(derivees.length).toBeGreaterThanOrEqual(V5_CONCEPTS.length * 3);
    expect(deck.flashcards.length).toBeGreaterThanOrEqual(redigees.length * 3);
    // Toute carte dérivée porte son angle ; aucune carte rédigée n'en porte.
    expect(derivees.every((f) => !!f.angle)).toBe(true);
    expect(redigees.every((f) => f.angle === undefined)).toBe(true);
    // Rien d'interdit ne se glisse dans la matière de révision.
    for (const f of deck.flashcards) {
      expect(`${f.front} ${f.back}`).not.toMatch(VOCABULAIRE_INTERDIT);
    }
  });

  it('chaque fiche apporte au moins 3 cartes de révision (rédigée + dérivées)', () => {
    const pauvres = V5_CONCEPTS.filter((c) => c.flashcards.length + derivedCardsWithoutDuplicates(c).length < 3)
      .map((c) => c.slug);
    expect(pauvres).toEqual([]);
  });

  it('ordre stable et déterministe (aucun hasard dans la construction du deck)', () => {
    const a = buildRevisionDeck().flashcards.map((f) => `${f.conceptSlug}|${f.front}`);
    const b = buildRevisionDeck().flashcards.map((f) => `${f.conceptSlug}|${f.front}`);
    expect(a).toEqual(b);
  });
});
