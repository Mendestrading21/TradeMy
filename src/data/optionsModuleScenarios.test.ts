/**
 * LOT 4-Y — Garde-fous du module guidé « Lire les payoffs d'options » (world.options).
 *
 * Même rigueur que les modules précédents : câblage, couverture d'objectifs RÉELS (les cinq
 * natures sont documentées sur les deux concepts), mécaniques distinctes (4 — AUCUN placement :
 * les invalidations sont des ÉTATS à l'échéance, pas des planchers de série), gradabilité,
 * cohérence visuel (payoff réel des fiches, sans dataset OHLC), checkpoint propre, vocabulaire.
 */
import { describe, it, expect } from '@jest/globals';
import {
  OPTIONS_SKILLS,
  OPTIONS_CHECKPOINT_ID,
  OPTIONS_SKILL_CONCEPT_ID,
  OPTIONS_MODULE_SCENARIOS,
  OPTIONS_MODULE_SCENARIOS_BY_SKILL,
  OPTIONS_MODULE_EXERCISES_BY_SKILL,
} from './optionsModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise } from '../engines/exercise';

/**
 * Objectifs RÉELS ciblés par compétence (dérivés des champs du concept — voir learningTarget).
 * Aucun autre module n'exerce ces concepts : l'union observée == l'ensemble ciblé ici.
 * Les DEUX concepts documentent les cinq natures.
 */
const ALL_KINDS: ObjectiveKind[] = ['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal'];
const EXPECTED: Record<string, ObjectiveKind[]> = {
  'concept.options-basics': ALL_KINDS,
  'concept.put-option': ALL_KINDS,
};

const ALL_EXERCISES = Object.values(OPTIONS_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire les payoffs d’options » — modèle officiel (world.options)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of OPTIONS_SKILLS) {
      expect(getExercises(s.id)).toEqual(OPTIONS_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(OPTIONS_MODULE_SCENARIOS.length);
    // 2 compétences × 5 natures documentées = 10 exercices.
    expect(ALL_EXERCISES.length).toBe(10);
  });

  it('chaque compétence cible un concept RÉEL de world.options', () => {
    const optionIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.options').map((c) => c.id));
    for (const s of OPTIONS_SKILLS) {
      const cid = OPTIONS_SKILL_CONCEPT_ID[s.id];
      expect(optionIds.has(cid)).toBe(true);
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

  it('mécaniques réellement distinctes : 4 types d’exercice, AUCUN placement (invalidation = état à l’échéance, pas un plancher)', () => {
    const types = new Set(ALL_EXERCISES.map((e) => e.type));
    expect(types).toEqual(new Set(['identify_figure', 'order', 'scenario', 'find_error']));
    expect(ALL_EXERCISES.some((e) => e.type === 'place_invalidation')).toBe(false);
    for (const s of OPTIONS_SKILLS) {
      const kinds = scenarioInteractionTypes(OPTIONS_MODULE_SCENARIOS_BY_SKILL[s.id]);
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

  it('cohérence visuelle : chaque reconnaissance rend le PAYOFF réel de sa fiche (aucun dataset OHLC — comme la fiche)', () => {
    const figures = ALL_EXERCISES.filter((e) => e.type === 'identify_figure');
    expect(figures.length).toBe(2);
    for (const ex of figures) {
      if (ex.type !== 'identify_figure') continue;
      expect(ex.visualType).toBe('option-payoff'); // le rendu réel des fiches du monde Options
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      expect(concept.visualSpec?.type).toBe(ex.visualType);
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      // Le payoff est CALCULÉ depuis le variant (call/put) : ni la fiche ni l'exercice ne portent de dataset.
      expect(concept.visualSpec?.datasetKey).toBeUndefined();
      expect(ex.datasetKey).toBe('');
    }
    expect(new Set(figures.map((e) => (e.type === 'identify_figure' ? e.variant : ''))).size).toBe(2);
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Options', () => {
    expect(isCheckpoint(OPTIONS_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(OPTIONS_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.options.')).toBe(true);
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
