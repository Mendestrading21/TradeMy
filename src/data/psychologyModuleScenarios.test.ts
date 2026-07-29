/**
 * LOT 4-V — Garde-fous du module guidé « Déjouer ses biais » (world.psychology).
 *
 * Même rigueur que les modules précédents : câblage, couverture d'objectifs RÉELS (jamais
 * inventés — aucun des deux concepts ne documente d'invalidation top-level → ni `invalidate`
 * ni placement), mécaniques distinctes, gradabilité, cohérence visuel/dataset, checkpoint
 * propre, vocabulaire.
 */
import { describe, it, expect } from '@jest/globals';
import {
  PSYCHOLOGY_SKILLS,
  PSYCHOLOGY_CHECKPOINT_ID,
  PSYCHOLOGY_SKILL_CONCEPT_ID,
  PSYCHOLOGY_MODULE_SCENARIOS,
  PSYCHOLOGY_MODULE_SCENARIOS_BY_SKILL,
  PSYCHOLOGY_MODULE_EXERCISES_BY_SKILL,
} from './psychologyModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise } from '../engines/exercise';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/**
 * Objectifs RÉELS ciblés par compétence (dérivés des champs du concept — voir learningTarget).
 * Aucun autre module n'exerce ces concepts : l'union observée == l'ensemble ciblé ici.
 * Les deux concepts ne documentent PAS d'invalidation top-level → pas d'objectif `invalidate`.
 */
const EXPECTED: Record<string, ObjectiveKind[]> = {
  'concept.fomo': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
  'concept.trading-discipline': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
};

const ALL_EXERCISES = Object.values(PSYCHOLOGY_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Déjouer ses biais » — modèle officiel (world.psychology)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of PSYCHOLOGY_SKILLS) {
      expect(getExercises(s.id)).toEqual(PSYCHOLOGY_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(PSYCHOLOGY_MODULE_SCENARIOS.length);
    // 2 compétences × 4 natures documentées = 8 exercices.
    expect(ALL_EXERCISES.length).toBe(8);
  });

  it('chaque compétence cible un concept RÉEL de world.psychology', () => {
    const psyIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.psychology').map((c) => c.id));
    for (const s of PSYCHOLOGY_SKILLS) {
      const cid = PSYCHOLOGY_SKILL_CONCEPT_ID[s.id];
      expect(psyIds.has(cid)).toBe(true);
    }
  });

  it('couvre uniquement des OBJECTIFS RÉELS de chaque concept', () => {
    for (const [cid, kinds] of Object.entries(EXPECTED)) {
      const covered = new Set(exercisableObjectiveIds(cid));
      expect(covered).toEqual(new Set(kinds.map((k) => objectiveId(cid, k))));
      for (const oid of covered) expect(objectiveByIdIn(V5_CONCEPTS, oid)).toBeDefined();
    }
  });

  it('le module couvre les 4 natures documentées (recognize → interpret → confirm → avoid-false-signal), sans en inventer', () => {
    const kinds = new Set<string>();
    for (const ex of ALL_EXERCISES) {
      const parsed = ex.target ? parseObjectiveId(ex.target.objectiveId) : null;
      if (parsed) kinds.add(parsed.kind);
    }
    expect(kinds).toEqual(new Set(['recognize', 'interpret', 'confirm', 'avoid-false-signal']));
  });

  it('mécaniques réellement distinctes : 4 types d’exercice, AUCUN placement (aucun plancher documenté)', () => {
    const types = new Set(ALL_EXERCISES.map((e) => e.type));
    expect(types).toEqual(new Set(['identify_figure', 'order', 'scenario', 'find_error']));
    expect(ALL_EXERCISES.some((e) => e.type === 'place_invalidation')).toBe(false);
    for (const s of PSYCHOLOGY_SKILLS) {
      const kinds = scenarioInteractionTypes(PSYCHOLOGY_MODULE_SCENARIOS_BY_SKILL[s.id]);
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
      expect(ex.visualType).toBe('chart-pattern'); // le rendu réel des fiches du monde Psychologie
      expect(VISUAL_DATASETS[ex.datasetKey]).toBeDefined();
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      expect(concept.visualSpec?.type).toBe(ex.visualType);
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      expect(concept.visualSpec?.datasetKey).toBe(ex.datasetKey);
    }
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Psychologie', () => {
    expect(isCheckpoint(PSYCHOLOGY_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(PSYCHOLOGY_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.psychology.')).toBe(true);
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
