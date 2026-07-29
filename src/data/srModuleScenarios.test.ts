/**
 * LOT 4-O — Garde-fous du module guidé « Lire les niveaux » (world.support-resistance).
 *
 * Même rigueur que les modules précédents : câblage, couverture d'objectifs RÉELS (jamais
 * inventés), mécaniques distinctes, gradabilité, cohérence structure/dataset, cohérence du
 * placement d'invalidation (seul plancher documenté : le support), checkpoint propre, et absence
 * totale de vocabulaire BUY/SELL ou de promesse de gain.
 */
import { describe, it, expect } from '@jest/globals';
import {
  SR_SKILLS,
  SR_CHECKPOINT_ID,
  SR_SKILL_CONCEPT_ID,
  SR_MODULE_SCENARIOS,
  SR_MODULE_SCENARIOS_BY_SKILL,
  SR_MODULE_EXERCISES_BY_SKILL,
} from './srModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise, lowestLow } from '../engines/exercise';
import { generateCandles } from '../engines/pattern/demoChart';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/** Objectifs RÉELS ciblés par compétence (dérivés des champs du concept — voir learningTarget). */
const EXPECTED: Record<string, ObjectiveKind[]> = {
  'concept.support-resistance': ['recognize', 'interpret', 'invalidate', 'avoid-false-signal'],
  'concept.polarity-flip': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
  // `retest-de-niveau` ne documente NI zone de confirmation NI invalidation → 3 objectifs seulement.
  'concept.retest-de-niveau': ['recognize', 'interpret', 'avoid-false-signal'],
};

const ALL_EXERCISES = Object.values(SR_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire les niveaux » — modèle officiel (world.support-resistance)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of SR_SKILLS) {
      expect(getExercises(s.id)).toEqual(SR_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(SR_MODULE_SCENARIOS.length);
    // 4 + 4 + 3 = 11 exercices dérivés (le retest ne documente que 3 objectifs — honnêteté).
    expect(ALL_EXERCISES.length).toBe(11);
  });

  it('chaque compétence cible un concept RÉEL de world.support-resistance', () => {
    const srIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.support-resistance').map((c) => c.id));
    for (const s of SR_SKILLS) {
      const cid = SR_SKILL_CONCEPT_ID[s.id];
      expect(srIds.has(cid)).toBe(true);
    }
  });

  it('couvre uniquement des OBJECTIFS RÉELS ; le retest (sans confirmation/invalidation documentées) reste à 3 exercices', () => {
    for (const [cid, kinds] of Object.entries(EXPECTED)) {
      const covered = new Set(exercisableObjectiveIds(cid));
      expect(covered).toEqual(new Set(kinds.map((k) => objectiveId(cid, k))));
      for (const oid of covered) expect(objectiveByIdIn(V5_CONCEPTS, oid)).toBeDefined();
    }
    expect(exercisableObjectiveIds('concept.retest-de-niveau')).not.toContain(
      objectiveId('concept.retest-de-niveau', 'confirm'),
    );
    expect(exercisableObjectiveIds('concept.retest-de-niveau')).not.toContain(
      objectiveId('concept.retest-de-niveau', 'invalidate'),
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
    for (const s of SR_SKILLS) {
      const kinds = scenarioInteractionTypes(SR_MODULE_SCENARIOS_BY_SKILL[s.id]);
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

  it('cohérence structure : chaque reconnaissance montre un dataset RÉEL et le variant de sa fiche', () => {
    const figures = ALL_EXERCISES.filter((e) => e.type === 'identify_figure');
    expect(figures.length).toBe(3);
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
    // Un seul plancher documenté dans ce module : l'invalidation du support (clôture nette dessous).
    expect(places.length).toBe(1);
    for (const ex of places) {
      if (ex.type !== 'place_invalidation') continue;
      const candles = generateCandles(ex.chartSeed, 30);
      expect(ex.validation.targetPrice).toBe(lowestLow(candles));
      expect(ex.validation.tolerance).toBeGreaterThan(0);
    }
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Niveaux', () => {
    expect(isCheckpoint(SR_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(SR_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.sr.')).toBe(true);
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
