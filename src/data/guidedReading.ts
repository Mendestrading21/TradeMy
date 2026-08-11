import type { LearningConcept, Direction } from './learningConcept';

/**
 * LOT E4 — la « Lecture guidée » de la fiche, pour TOUTES les fiches qui peuvent en avoir une.
 *
 * Constat mesuré : le bloc de lecture guidée n'apparaissait que sur les 36 fiches portant un
 * exemple annoté rédigé (`chartExamples`). Les 31 autres montraient leur visuel sans un mot pour
 * dire COMMENT le lire — alors que la fiche contient déjà, validée, la matière de cette lecture :
 * son scénario éducatif (conditions) ou, à défaut, sa zone de confirmation.
 *
 * Ce module DÉRIVE la lecture guidée de ces champs réels, dans cet ordre de priorité :
 *  1. l'exemple annoté RÉDIGÉ (il fait foi : direction + légende écrites à la main) ;
 *  2. le scénario éducatif (haussier / baissier / neutre) → ses conditions de lecture ;
 *  3. la zone de confirmation seule → ce qu'il faut voir pour valider la figure.
 *
 * Une fiche qui n'a rien de tout cela (notion pure : dividende, PER, unités de temps…) ne reçoit
 * PAS de lecture guidée : on n'invente pas une lecture de marché là où il n'y en a pas.
 */

/** Provenance de la lecture — utile aux tests et à la traçabilité, jamais affichée telle quelle. */
export type GuidedReadingOrigin = 'exemple' | 'scenario' | 'confirmation';

export interface GuidedReading {
  direction: Direction;
  caption: string;
  origin: GuidedReadingOrigin;
}

/** Lecture guidée d'une fiche, ou `undefined` s'il n'y a rien d'honnête à en dire. */
export function guidedReading(concept: LearningConcept): GuidedReading | undefined {
  // 1. L'exemple rédigé fait toujours foi.
  const example = concept.chartExamples[0];
  if (example?.caption?.trim()) {
    return { direction: example.direction ?? 'neutral', caption: example.caption.trim(), origin: 'exemple' };
  }

  // 2. Le scénario éducatif : ses conditions SONT la lecture de la figure.
  const scenarios: [Direction, { conditions: string[] } | undefined][] = [
    ['bullish', concept.bullishScenario],
    ['bearish', concept.bearishScenario],
    ['neutral', concept.neutralScenario],
  ];
  for (const [direction, scenario] of scenarios) {
    const conditions = scenario?.conditions.map((c) => c.trim()).filter(Boolean) ?? [];
    if (conditions.length) return { direction, caption: conditions.join(' · '), origin: 'scenario' };
  }

  // 3. À défaut, ce qui confirme la figure suffit à guider la lecture.
  const confirmation = concept.confirmationZone?.trim();
  if (confirmation) {
    return {
      direction: concept.visualSpec?.direction ?? 'neutral',
      caption: `Ce qui valide la lecture : ${confirmation.charAt(0).toLocaleLowerCase('fr-FR')}${confirmation.slice(1)}`,
      origin: 'confirmation',
    };
  }

  return undefined;
}
