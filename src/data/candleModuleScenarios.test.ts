/**
 * LOT 4-M — Garde-fous du module guidé « Lire les chandeliers » (world.candles).
 *
 * Réplique, pour ce 2e module réel, la rigueur de l'unité pilote : câblage, couverture d'objectifs
 * RÉELS (jamais inventés), mécaniques distinctes, gradabilité, cohérence figure/dataset, cohérence du
 * placement d'invalidation, checkpoint propre, et absence totale de vocabulaire BUY/SELL ou de
 * promesse de gain.
 */
import { describe, it, expect } from '@jest/globals';
import {
  CANDLE_SKILLS,
  CANDLE_CHECKPOINT_ID,
  CANDLE_SKILL_CONCEPT_ID,
  CANDLE_MODULE_SCENARIOS,
  CANDLE_MODULE_SCENARIOS_BY_SKILL,
  CANDLE_MODULE_EXERCISES_BY_SKILL,
} from './candleModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise, lowestLow } from '../engines/exercise';
import { generateCandles } from '../engines/pattern/demoChart';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/** Objectifs RÉELS ciblés par compétence (dérivés des champs du concept — voir learningTarget). */
const EXPECTED: Record<string, ObjectiveKind[]> = {
  'concept.marubozu': ['recognize', 'interpret', 'invalidate', 'avoid-false-signal'],
  'concept.hammer': ['recognize', 'confirm', 'invalidate', 'avoid-false-signal'],
  'concept.doji': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
  'concept.bullish-engulfing': ['recognize', 'interpret', 'confirm', 'invalidate'],
};

const ALL_EXERCISES = Object.values(CANDLE_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire les chandeliers » — modèle officiel (world.candles)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of CANDLE_SKILLS) {
      expect(getExercises(s.id)).toEqual(CANDLE_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(CANDLE_MODULE_SCENARIOS.length);
    // 4 compétences × 4 items = 16 exercices dérivés.
    expect(ALL_EXERCISES.length).toBe(16);
  });

  it('chaque compétence cible un concept RÉEL de world.candles', () => {
    const candleIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.candles').map((c) => c.id));
    for (const s of CANDLE_SKILLS) {
      const cid = CANDLE_SKILL_CONCEPT_ID[s.id];
      expect(candleIds.has(cid)).toBe(true);
    }
  });

  it('couvre uniquement des OBJECTIFS RÉELS ; le doji (sans invalidation documentée) n’a pas d’exo d’invalidation', () => {
    for (const [cid, kinds] of Object.entries(EXPECTED)) {
      const covered = new Set(exercisableObjectiveIds(cid));
      expect(covered).toEqual(new Set(kinds.map((k) => objectiveId(cid, k))));
      // Aucun objectif ciblé n’est orphelin : il se résout dans le modèle canonique.
      for (const oid of covered) expect(objectiveByIdIn(V5_CONCEPTS, oid)).toBeDefined();
    }
    // Honnêteté du modèle : le doji ne documente pas d’invalidation → aucune cible d’invalidation.
    expect(exercisableObjectiveIds('concept.doji')).not.toContain(objectiveId('concept.doji', 'invalidate'));
  });

  it('le module couvre les 5 natures d’objectif (recognize → interpret → confirm → invalidate → avoid-false-signal)', () => {
    const kinds = new Set<string>();
    for (const ex of ALL_EXERCISES) {
      const parsed = ex.target ? parseObjectiveId(ex.target.objectiveId) : null;
      if (parsed) kinds.add(parsed.kind);
    }
    expect(kinds).toEqual(new Set(['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal']));
  });

  it('mécaniques réellement distinctes : 5 types d’exercice, dont placement et réorganisation (pas que des QCM)', () => {
    const types = new Set(ALL_EXERCISES.map((e) => e.type));
    expect(types).toEqual(new Set(['identify_figure', 'order', 'scenario', 'place_invalidation', 'find_error']));
    // Chaque compétence propose au moins 3 interactions réellement différentes.
    for (const s of CANDLE_SKILLS) {
      const kinds = scenarioInteractionTypes(CANDLE_MODULE_SCENARIOS_BY_SKILL[s.id]);
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

  it('cohérence figure : chaque reconnaissance montre un dataset RÉEL et le variant de sa fiche', () => {
    const figures = ALL_EXERCISES.filter((e) => e.type === 'identify_figure');
    expect(figures.length).toBe(4);
    for (const ex of figures) {
      if (ex.type !== 'identify_figure') continue;
      expect(VISUAL_DATASETS[ex.datasetKey]).toBeDefined();
      // Le variant coïncide avec le visualSpec du concept cible (même figure rendue).
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      expect(concept.visualSpec?.datasetKey).toBe(ex.datasetKey);
    }
  });

  it('cohérence invalidation : la cible placée EST le plus bas réel de la série rendue', () => {
    const places = ALL_EXERCISES.filter((e) => e.type === 'place_invalidation');
    expect(places.length).toBe(3);
    for (const ex of places) {
      if (ex.type !== 'place_invalidation') continue;
      const candles = generateCandles(ex.chartSeed, 30);
      expect(ex.validation.targetPrice).toBe(lowestLow(candles));
      expect(ex.validation.tolerance).toBeGreaterThan(0);
    }
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Chandeliers', () => {
    expect(isCheckpoint(CANDLE_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(CANDLE_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.candle.')).toBe(true);
    // La revue mélange plusieurs compétences du module (pas une seule).
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
