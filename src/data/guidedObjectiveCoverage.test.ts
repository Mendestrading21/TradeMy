import { describe, it, expect } from '@jest/globals';
import { SKILL_CONCEPT_ID, getExercises, exercisableObjectiveIds, CONTENT_MODULES } from './seed';
import { V5_CONCEPTS } from './learningContent';
import { objectivesForConcept, objectiveId, parseObjectiveId, type ObjectiveKind } from './learningTarget';

/**
 * LOT D1 — VERROU DE COUVERTURE des modules guidés.
 *
 * Le défaut réparé par ce lot : un lot éditorial (E3/ADR-133) a enrichi cinq fiches d'une zone de
 * confirmation et d'une invalidation RÉELLES, mais les compétences guidées correspondantes ont
 * continué de n'exercer que trois objectifs. Le contenu avait avancé, les exercices non — et rien
 * ne le signalait, chaque module ne vérifiant qu'une liste d'objectifs ÉCRITE EN DUR.
 *
 * Ce verrou supprime la classe entière de ce défaut : pour CHAQUE compétence guidée, les objectifs
 * réellement exercés sont comparés aux objectifs RÉELS de son concept, tels que `learningTarget`
 * les dérive de ses champs (`learningObjective`, `definitionShort`, `confirmationZone`,
 * `invalidation`, `falseSignals`). Enrichir une fiche fera donc échouer ce test tant que ses
 * exercices n'auront pas suivi — et inventer un objectif absent de la fiche le fera échouer aussi.
 */

/** Compétences des 14 modules GUIDÉS (le module Fondations historique garde ses exercices libres). */
const GUIDED_SKILL_IDS = CONTENT_MODULES.flatMap((m) => m.skills.map((s) => s.id)).filter((id) =>
  Object.prototype.hasOwnProperty.call(SKILL_CONCEPT_ID, id),
);

/** Natures d'objectif RÉELLES d'un concept, dérivées de ses champs (source unique). */
function realKinds(conceptId: string): ObjectiveKind[] {
  const concept = V5_CONCEPTS.find((c) => c.id === conceptId);
  if (!concept) throw new Error(`Concept introuvable pour le verrou de couverture : ${conceptId}`);
  return objectivesForConcept(concept).map((o) => o.kind);
}

/** Natures d'objectif réellement exercées par une compétence. */
function exercisedKinds(skillId: string): ObjectiveKind[] {
  const kinds = new Set<ObjectiveKind>();
  for (const ex of getExercises(skillId)) {
    if (!ex.target) continue;
    const parsed = parseObjectiveId(ex.target.objectiveId);
    if (parsed) kinds.add(parsed.kind);
  }
  return [...kinds];
}

describe('LOT D1 — les exercices guidés couvrent EXACTEMENT les objectifs réels de leur fiche', () => {
  it('le corpus guidé n’est pas vide (le verrou porte sur du contenu réel)', () => {
    expect(GUIDED_SKILL_IDS.length).toBeGreaterThanOrEqual(40);
  });

  it('aucune compétence n’exerce un objectif ABSENT de sa fiche (rien d’inventé)', () => {
    const orphans: string[] = [];
    for (const skillId of GUIDED_SKILL_IDS) {
      const real = new Set(realKinds(SKILL_CONCEPT_ID[skillId]));
      for (const kind of exercisedKinds(skillId)) {
        if (!real.has(kind)) orphans.push(`${skillId} → ${kind}`);
      }
    }
    expect(orphans).toEqual([]);
  });

  it('aucun objectif documenté par une fiche ne reste SANS exercice (le contenu ne devance plus la pratique)', () => {
    // La maîtrise se mesure par CIBLE (conceptId + objectiveId), et `exercisableObjectiveIds`
    // agrège toutes les compétences : le manque qui compte est donc celui d'un objectif exercé
    // NULLE PART. Une fiche partagée par deux compétences (ex. `concept.uptrend`, adressé par la
    // leçon libre « Tendance » et par le module guidé Structure) reste ainsi correctement couverte
    // sans exiger que chacune l'épuise seule.
    const gaps: string[] = [];
    const conceptIds = [...new Set(GUIDED_SKILL_IDS.map((id) => SKILL_CONCEPT_ID[id]))];
    for (const conceptId of conceptIds) {
      const exercised = new Set(exercisableObjectiveIds(conceptId));
      for (const kind of realKinds(conceptId)) {
        if (!exercised.has(objectiveId(conceptId, kind))) gaps.push(`${conceptId} → ${kind}`);
      }
    }
    expect(gaps).toEqual([]);
  });

  it('les cinq fiches enrichies par le LOT E3 sont désormais exercées sur confirmation ET invalidation', () => {
    // Chacune documente `confirmationZone` ET `invalidation` (ADR-133) : les deux natures doivent
    // être exercées, sans quoi l'enrichissement éditorial resterait invisible dans la pratique.
    const RATTRAPEES = [
      'skill.priceaction.wick',
      'skill.priceaction.impulse',
      'skill.sr.retest',
      'skill.wyckoff.distribution',
      'skill.falsesignals.breakout',
    ];
    for (const skillId of RATTRAPEES) {
      const kinds = exercisedKinds(skillId);
      expect(kinds).toContain('confirm');
      expect(kinds).toContain('invalidate');
      expect(getExercises(skillId).length).toBeGreaterThanOrEqual(5);
    }
  });
});
