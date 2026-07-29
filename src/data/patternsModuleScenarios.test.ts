/**
 * LOT 4-Q — Garde-fous du module guidé « Lire les figures » (world.patterns).
 *
 * Même rigueur que les modules précédents : câblage, couverture d'objectifs RÉELS (jamais
 * inventés), mécaniques distinctes, gradabilité, cohérence figure/dataset, cohérence du placement
 * d'invalidation (seuls planchers documentés : double creux et drapeau), checkpoint propre,
 * vocabulaire. Les 9 autres figures du monde restent des fiches consultables (non attachées).
 */
import { describe, it, expect } from '@jest/globals';
import {
  PATTERNS_SKILLS,
  PATTERNS_CHECKPOINT_ID,
  PATTERNS_SKILL_CONCEPT_ID,
  PATTERNS_MODULE_SCENARIOS,
  PATTERNS_MODULE_SCENARIOS_BY_SKILL,
  PATTERNS_MODULE_EXERCISES_BY_SKILL,
} from './patternsModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise, lowestLow } from '../engines/exercise';
import { generateCandles } from '../engines/pattern/demoChart';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/**
 * Objectifs RÉELS ciblés par compétence (dérivés des champs du concept — voir learningTarget).
 * NB : `concept.double-bottom` est aussi ciblé (recognize) par un exercice Fondations
 * (skill.patterns) — l'union reste identique à l'ensemble attendu ci-dessous.
 */
const EXPECTED: Record<string, ObjectiveKind[]> = {
  // Fondations (skill.patterns) cible déjà recognize ET confirm sur le double creux :
  // l'union avec le module (interpret, invalidate, avoid) couvre les 5 natures.
  'concept.double-bottom': ['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal'],
  'concept.ascending-triangle': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
  'concept.bull-flag': ['recognize', 'confirm', 'invalidate', 'avoid-false-signal'],
  'concept.head-shoulders': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
};

const ALL_EXERCISES = Object.values(PATTERNS_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire les figures » — modèle officiel (world.patterns)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of PATTERNS_SKILLS) {
      expect(getExercises(s.id)).toEqual(PATTERNS_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(PATTERNS_MODULE_SCENARIOS.length);
    // 4 compétences × 4 items = 16 exercices dérivés.
    expect(ALL_EXERCISES.length).toBe(16);
  });

  it('chaque compétence cible un concept RÉEL de world.patterns', () => {
    const patternIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.patterns').map((c) => c.id));
    for (const s of PATTERNS_SKILLS) {
      const cid = PATTERNS_SKILL_CONCEPT_ID[s.id];
      expect(patternIds.has(cid)).toBe(true);
    }
  });

  it('couvre uniquement des OBJECTIFS RÉELS ; triangle (ligne montante) et ÉTÉ (invalidation au-dessus) sans placement', () => {
    for (const [cid, kinds] of Object.entries(EXPECTED)) {
      const covered = new Set(exercisableObjectiveIds(cid));
      expect(covered).toEqual(new Set(kinds.map((k) => objectiveId(cid, k))));
      for (const oid of covered) expect(objectiveByIdIn(V5_CONCEPTS, oid)).toBeDefined();
    }
    // Le placement de plancher n'est PAS attaché aux figures dont l'invalidation n'est pas un plancher.
    expect(exercisableObjectiveIds('concept.ascending-triangle')).not.toContain(
      objectiveId('concept.ascending-triangle', 'invalidate'),
    );
    expect(exercisableObjectiveIds('concept.head-shoulders')).not.toContain(
      objectiveId('concept.head-shoulders', 'invalidate'),
    );
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
    for (const s of PATTERNS_SKILLS) {
      const kinds = scenarioInteractionTypes(PATTERNS_MODULE_SCENARIOS_BY_SKILL[s.id]);
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
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      expect(concept.visualSpec?.datasetKey).toBe(ex.datasetKey);
    }
  });

  it('cohérence invalidation : la cible placée EST le plus bas réel de la série rendue', () => {
    const places = ALL_EXERCISES.filter((e) => e.type === 'place_invalidation');
    // Deux planchers documentés : le double creux (sous les creux) et le drapeau (sous le canal).
    expect(places.length).toBe(2);
    for (const ex of places) {
      if (ex.type !== 'place_invalidation') continue;
      const candles = generateCandles(ex.chartSeed, 30);
      expect(ex.validation.targetPrice).toBe(lowestLow(candles));
      expect(ex.validation.tolerance).toBeGreaterThan(0);
    }
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Figures', () => {
    expect(isCheckpoint(PATTERNS_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(PATTERNS_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.patterns.')).toBe(true);
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
