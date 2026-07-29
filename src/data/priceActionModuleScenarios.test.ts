/**
 * LOT 4-T — Garde-fous du module guidé « Lire la price action » (world.price-action).
 *
 * Même rigueur que les modules précédents : câblage, couverture d'objectifs RÉELS (jamais
 * inventés), mécaniques distinctes, gradabilité, cohérence visuel/dataset, honnêteté du modèle
 * (aucune invalidation documentée dans ce monde → ni objectif invalidate ni placement),
 * checkpoint propre, vocabulaire.
 */
import { describe, it, expect } from '@jest/globals';
import {
  PRICEACTION_SKILLS,
  PRICEACTION_CHECKPOINT_ID,
  PRICEACTION_SKILL_CONCEPT_ID,
  PRICEACTION_MODULE_SCENARIOS,
  PRICEACTION_MODULE_SCENARIOS_BY_SKILL,
  PRICEACTION_MODULE_EXERCISES_BY_SKILL,
} from './priceActionModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise } from '../engines/exercise';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/**
 * Objectifs RÉELS ciblés par compétence (dérivés des champs du concept — voir learningTarget).
 * Aucun autre module n'exerce ces concepts : l'union observée == l'ensemble ciblé ici.
 */
const EXPECTED: Record<string, ObjectiveKind[]> = {
  // Seule l'intro documente une zone de confirmation ; AUCUN concept ne documente d'invalidation.
  'concept.price-action-intro': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
  'concept.meche-de-rejet': ['recognize', 'interpret', 'avoid-false-signal'],
  'concept.impulsion-et-correction': ['recognize', 'interpret', 'avoid-false-signal'],
};

const ALL_EXERCISES = Object.values(PRICEACTION_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire la price action » — modèle officiel (world.price-action)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of PRICEACTION_SKILLS) {
      expect(getExercises(s.id)).toEqual(PRICEACTION_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(PRICEACTION_MODULE_SCENARIOS.length);
    // 1 compétence × 4 items + 2 compétences × 3 (objectifs réels seulement) = 10 exercices.
    expect(ALL_EXERCISES.length).toBe(10);
  });

  it('chaque compétence cible un concept RÉEL de world.price-action', () => {
    const paIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.price-action').map((c) => c.id));
    for (const s of PRICEACTION_SKILLS) {
      const cid = PRICEACTION_SKILL_CONCEPT_ID[s.id];
      expect(paIds.has(cid)).toBe(true);
    }
  });

  it('couvre uniquement des OBJECTIFS RÉELS de chaque concept', () => {
    for (const [cid, kinds] of Object.entries(EXPECTED)) {
      const covered = new Set(exercisableObjectiveIds(cid));
      expect(covered).toEqual(new Set(kinds.map((k) => objectiveId(cid, k))));
      for (const oid of covered) expect(objectiveByIdIn(V5_CONCEPTS, oid)).toBeDefined();
    }
  });

  it('le module couvre exactement les natures DOCUMENTÉES (jamais d’invalidate inventé)', () => {
    const kinds = new Set<string>();
    for (const ex of ALL_EXERCISES) {
      const parsed = ex.target ? parseObjectiveId(ex.target.objectiveId) : null;
      if (parsed) kinds.add(parsed.kind);
    }
    // Aucun concept du monde ne documente d'invalidation : `invalidate` est ABSENT, honnêtement.
    expect(kinds).toEqual(new Set(['recognize', 'interpret', 'confirm', 'avoid-false-signal']));
  });

  it('honnêteté du placement : aucune invalidation documentée → AUCUN placement dans ce module', () => {
    expect(ALL_EXERCISES.some((e) => e.type === 'place_invalidation')).toBe(false);
    const types = new Set(ALL_EXERCISES.map((e) => e.type));
    expect(types).toEqual(new Set(['identify_figure', 'order', 'scenario', 'find_error']));
    for (const s of PRICEACTION_SKILLS) {
      const kinds = scenarioInteractionTypes(PRICEACTION_MODULE_SCENARIOS_BY_SKILL[s.id]);
      expect(kinds.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('chaque exercice se corrige (une bonne réponse existe et est acceptée par le grader réel)', () => {
    for (const ex of ALL_EXERCISES) {
      let answer: unknown;
      switch (ex.type) {
        case 'identify_figure': answer = ex.validation.correctIndex; break;
        case 'scenario': answer = ex.validation.correctIndex; break;
        case 'find_error': answer = ex.validation.errorIndex; break;
        case 'order': answer = ex.validation.correctOrder; break;
        default: throw new Error(`type inattendu: ${ex.type}`);
      }
      expect(gradeExercise(ex, answer).correct).toBe(true);
    }
  });

  it('cohérence visuelle : chaque reconnaissance montre le dataset RÉEL, le variant ET le type de rendu de sa fiche', () => {
    const figures = ALL_EXERCISES.filter((e) => e.type === 'identify_figure');
    expect(figures.length).toBe(3);
    for (const ex of figures) {
      if (ex.type !== 'identify_figure') continue;
      expect(VISUAL_DATASETS[ex.datasetKey]).toBeDefined();
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      expect(concept.visualSpec?.type).toBe(ex.visualType);
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      expect(concept.visualSpec?.datasetKey).toBe(ex.datasetKey);
    }
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Price action', () => {
    expect(isCheckpoint(PRICEACTION_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(PRICEACTION_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.priceaction.')).toBe(true);
    expect(skillIds.size).toBeGreaterThanOrEqual(2);
  });

  it('aucun exercice ne contient BUY/SELL ni promesse de gain', () => {
    const forbidden = /\b(buy|sell|profit garanti|gain garanti|trade gagnant|signal sûr|liberté financière garantie)\b/i;
    for (const ex of ALL_EXERCISES) {
      const bag = [ex.prompt, ex.feedback.correct, ex.feedback.incorrect, ex.feedback.rule ?? '', ex.feedback.whenItFails ?? ''];
      if (ex.type === 'order') bag.push(...ex.items);
      if (ex.type === 'find_error') bag.push(...ex.statements);
      if (ex.type === 'scenario') bag.push(ex.context, ...ex.options);
      if (ex.type === 'identify_figure') bag.push(...ex.options);
      expect(bag.join(' ')).not.toMatch(forbidden);
    }
  });
});
