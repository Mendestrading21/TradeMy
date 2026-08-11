import type { LearningConcept } from './learningConcept';
import type { Flashcard } from '../engines/learning/types';

/**
 * LOT E2 — PROFONDEUR de révision, sans inventer une ligne de contenu.
 *
 * Constat mesuré : chaque fiche ne portait qu'UNE flashcard rédigée (1,03 en moyenne) et UN
 * mini-quiz. La révision espacée tournait donc sur très peu de matière, alors que les fiches
 * contiennent déjà — validées, versionnées, relues — les critères de reconnaissance, la zone de
 * confirmation, l'invalidation, les erreurs fréquentes, les faux signaux et les limites.
 *
 * Ce module DÉRIVE des cartes de révision de ces champs réels : aucun texte inventé, aucune
 * seconde vérité éditoriale, et la matière grandit automatiquement avec le corpus. Chaque carte
 * porte l'angle qu'elle révise (`angle`), ce qui permet de réviser une facette précise.
 *
 * Règle de non-duplication : une carte dérivée dont la question existe déjà en carte rédigée est
 * écartée — la version rédigée fait foi.
 */

/** Facette du concept révisée par une carte dérivée. */
export type RevisionAngle =
  | 'reconnaitre'
  | 'confirmer'
  | 'invalider'
  | 'erreur'
  | 'faux-signal'
  | 'limite';

export interface DerivedCard extends Flashcard {
  angle: RevisionAngle;
}

/** Libellé lisible d'un angle (aucune couleur ici : la sémantique visuelle appartient aux écrans). */
export const ANGLE_LABEL: Record<RevisionAngle, string> = {
  reconnaitre: 'Reconnaître',
  confirmer: 'Confirmer',
  invalider: 'Invalider',
  erreur: 'Erreur fréquente',
  'faux-signal': 'Faux signal',
  limite: 'Limite',
};

/** Une phrase propre : première lettre en capitale, ponctuation finale garantie. */
function phrase(s: string): string {
  const t = s.trim();
  if (!t) return t;
  const head = t.charAt(0).toLocaleUpperCase('fr-FR') + t.slice(1);
  return /[.!?…]$/.test(head) ? head : `${head}.`;
}

/**
 * Cartes de révision dérivées d'UNE fiche, dans l'ordre pédagogique : reconnaître → confirmer →
 * invalider → se méfier (erreur, faux signal, limite). Seuls les champs réellement remplis
 * produisent une carte : une fiche sans invalidation documentée n'en fabrique pas.
 */
export function derivedCards(c: LearningConcept): DerivedCard[] {
  const out: DerivedCard[] = [];
  const push = (angle: RevisionAngle, front: string, back?: string) => {
    const body = (back ?? '').trim();
    if (body) out.push({ angle, front, back: phrase(body) });
  };

  if (c.howToRecognize.length) {
    push('reconnaitre', `À quoi reconnaît-on : ${c.title} ?`, c.howToRecognize.map((h) => h.trim()).join(' · '));
  }
  push('confirmer', `Qu’est-ce qui confirme : ${c.title} ?`, c.confirmationZone);
  push('invalider', `Qu’est-ce qui invalide : ${c.title} ?`, c.invalidation);
  push('erreur', `Quelle erreur fréquente éviter avec : ${c.title} ?`, c.commonMistakes[0]);
  push('faux-signal', `Quel faux signal guette sur : ${c.title} ?`, c.falseSignals[0]);
  push('limite', `Quelle est la limite de : ${c.title} ?`, c.interpretationLimits[0]);

  return out;
}

/**
 * Cartes dérivées d'une fiche, PRIVÉES des doublons de ses cartes rédigées (comparaison sur la
 * question normalisée). La carte rédigée par un humain prime toujours.
 */
export function derivedCardsWithoutDuplicates(c: LearningConcept): DerivedCard[] {
  const norm = (s: string) => s.trim().toLocaleLowerCase('fr-FR').replace(/\s+/g, ' ');
  const written = new Set(c.flashcards.map((f) => norm(f.front)));
  return derivedCards(c).filter((d) => !written.has(norm(d.front)));
}
