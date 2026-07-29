/**
 * LOT 4-Z — Garde-fous du module guidé « Déjouer les faux signaux » (world.false-signals).
 *
 * QUINZIÈME et DERNIER module guidé : le parcours entier est guidé. Même rigueur que les modules
 * précédents : câblage, couverture d'objectifs RÉELS (le faux breakout ne documente NI
 * confirmation NI invalidation → 3 natures seulement), mécaniques distinctes (4 — AUCUN
 * placement : l'invalidation du fakeout est une clôture AU-DELÀ du niveau, pas un plancher),
 * gradabilité, cohérence visuel/dataset, checkpoint propre, vocabulaire.
 */
import { describe, it, expect } from '@jest/globals';
import {
  FALSESIGNALS_SKILLS,
  FALSESIGNALS_CHECKPOINT_ID,
  FALSESIGNALS_SKILL_CONCEPT_ID,
  FALSESIGNALS_MODULE_SCENARIOS,
  FALSESIGNALS_MODULE_SCENARIOS_BY_SKILL,
  FALSESIGNALS_MODULE_EXERCISES_BY_SKILL,
} from './falseSignalsModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld, WORLDS } from './learningConcept';
import { isGuidedWorld } from './learningMap';
import { scenarioInteractionTypes, gradeExercise } from '../engines/exercise';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/**
 * Objectifs RÉELS ciblés par compétence (dérivés des champs du concept — voir learningTarget).
 * Aucun autre module n'exerce ces concepts : l'union observée == l'ensemble ciblé ici.
 * Le faux breakout ne documente NI `confirmationZone` NI `invalidation` → 3 natures seulement.
 */
const EXPECTED: Record<string, ObjectiveKind[]> = {
  'concept.fakeout': ['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal'],
  'concept.faux-breakout': ['recognize', 'interpret', 'avoid-false-signal'],
};

const ALL_EXERCISES = Object.values(FALSESIGNALS_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Déjouer les faux signaux » — modèle officiel (world.false-signals)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of FALSESIGNALS_SKILLS) {
      expect(getExercises(s.id)).toEqual(FALSESIGNALS_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(FALSESIGNALS_MODULE_SCENARIOS.length);
    // Fakeout × 5 natures + faux breakout × 3 natures = 8 exercices.
    expect(ALL_EXERCISES.length).toBe(8);
  });

  it('15/15 : avec ce module, TOUS les mondes du parcours sont guidés (plus aucun monde de contenu)', () => {
    expect(WORLDS.every((w) => isGuidedWorld(w.id))).toBe(true);
    expect(WORLDS).toHaveLength(15);
  });

  it('chaque compétence cible un concept RÉEL de world.false-signals', () => {
    const fsIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.false-signals').map((c) => c.id));
    for (const s of FALSESIGNALS_SKILLS) {
      const cid = FALSESIGNALS_SKILL_CONCEPT_ID[s.id];
      expect(fsIds.has(cid)).toBe(true);
    }
  });

  it('couvre uniquement des OBJECTIFS RÉELS de chaque concept', () => {
    for (const [cid, kinds] of Object.entries(EXPECTED)) {
      const covered = new Set(exercisableObjectiveIds(cid));
      expect(covered).toEqual(new Set(kinds.map((k) => objectiveId(cid, k))));
      for (const oid of covered) expect(objectiveByIdIn(V5_CONCEPTS, oid)).toBeDefined();
    }
  });

  it('le module couvre les 5 natures d’objectif (recognize → interpret → confirm → invalidate → avoid-false-signal)', () => {
    const kinds = new Set<string>();
    for (const ex of ALL_EXERCISES) {
      const parsed = ex.target ? parseObjectiveId(ex.target.objectiveId) : null;
      if (parsed) kinds.add(parsed.kind);
    }
    expect(kinds).toEqual(new Set(['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal']));
  });

  it('mécaniques réellement distinctes : 4 types d’exercice, AUCUN placement (l’invalidation du fakeout est AU-DESSUS du niveau)', () => {
    const types = new Set(ALL_EXERCISES.map((e) => e.type));
    expect(types).toEqual(new Set(['identify_figure', 'order', 'scenario', 'find_error']));
    expect(ALL_EXERCISES.some((e) => e.type === 'place_invalidation')).toBe(false);
    for (const s of FALSESIGNALS_SKILLS) {
      const kinds = scenarioInteractionTypes(FALSESIGNALS_MODULE_SCENARIOS_BY_SKILL[s.id]);
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
    expect(figures.length).toBe(2);
    for (const ex of figures) {
      if (ex.type !== 'identify_figure') continue;
      expect(VISUAL_DATASETS[ex.datasetKey]).toBeDefined();
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      // Le rendu réel de CHAQUE fiche (chart-pattern pour le fakeout, market-structure pour le faux breakout).
      expect(concept.visualSpec?.type).toBe(ex.visualType);
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      expect(concept.visualSpec?.datasetKey).toBe(ex.datasetKey);
    }
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Faux signaux', () => {
    expect(isCheckpoint(FALSESIGNALS_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(FALSESIGNALS_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.falsesignals.')).toBe(true);
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
