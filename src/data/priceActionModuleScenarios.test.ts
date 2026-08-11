/**
 * LOT 4-T — Garde-fous du module guidé « Lire la price action » (world.price-action).
 *
 * Même rigueur que les modules précédents : câblage, couverture d'objectifs RÉELS (jamais
 * inventés, jamais oubliés), mécaniques distinctes, gradabilité, cohérence visuel/dataset,
 * honnêteté du modèle (un placement uniquement là où l'invalidation est un plancher),
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
import { objectiveId, parseObjectiveId, objectiveByIdIn, objectivesForConcept, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise } from '../engines/exercise';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/**
 * Objectifs RÉELS de chaque concept du module. LOT D1 : cette attente est DÉRIVÉE de la fiche
 * elle-même (`objectivesForConcept`) au lieu d'être écrite en dur — une liste figée avait laissé
 * passer l'enrichissement du LOT E3 sans que les exercices suivent. Aucun autre module n'exerce
 * ces concepts : l'union observée == l'ensemble dérivé ici.
 */
const MODULE_CONCEPT_IDS = [
  'concept.price-action-intro',
  'concept.meche-de-rejet',
  'concept.impulsion-et-correction',
];
const EXPECTED: Record<string, ObjectiveKind[]> = Object.fromEntries(
  MODULE_CONCEPT_IDS.map((id) => [
    id,
    objectivesForConcept(V5_CONCEPTS.find((c) => c.id === id)!).map((o) => o.kind),
  ]),
);

const ALL_EXERCISES = Object.values(PRICEACTION_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire la price action » — modèle officiel (world.price-action)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of PRICEACTION_SKILLS) {
      expect(getExercises(s.id)).toEqual(PRICEACTION_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(PRICEACTION_MODULE_SCENARIOS.length);
    // LOT D1 — l'intro reste à 4 (ni invalidation ni scénario documentés au-delà) ; la mèche de
    // rejet et l'impulsion/correction passent de 3 à 5 (confirmation + invalidation enrichies par
    // le LOT E3, ADR-133). 4 + 5 + 5 = 14 exercices.
    expect(ALL_EXERCISES.length).toBe(14);
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

  it('le module couvre exactement les natures DOCUMENTÉES (aucune inventée, aucune oubliée)', () => {
    const kinds = new Set<string>();
    for (const ex of ALL_EXERCISES) {
      const parsed = ex.target ? parseObjectiveId(ex.target.objectiveId) : null;
      if (parsed) kinds.add(parsed.kind);
    }
    // L'union des natures exercées == l'union des natures DÉRIVÉES des trois fiches.
    expect(kinds).toEqual(new Set(Object.values(EXPECTED).flat()));
  });

  it('honnêteté du placement : un placement UNIQUEMENT là où l’invalidation est un plancher', () => {
    // LOT D1 — la mèche de rejet et l'impulsion/correction s'invalident littéralement « sous le
    // plus bas atteint » : elles se PLACENT. L'intro price action ne documente aucune invalidation
    // → aucun placement, honnêtement.
    const placements = ALL_EXERCISES.filter((e) => e.type === 'place_invalidation');
    expect(placements.map((e) => e.skillId).sort()).toEqual([
      'skill.priceaction.impulse',
      'skill.priceaction.wick',
    ]);
    const types = new Set(ALL_EXERCISES.map((e) => e.type));
    expect(types).toEqual(new Set(['identify_figure', 'order', 'scenario', 'find_error', 'place_invalidation']));
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
        case 'place_invalidation': answer = ex.validation.targetPrice; break;
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
