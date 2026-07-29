/**
 * LOT 4-N — Garde-fous du module guidé « Lire la structure » (world.structure).
 *
 * Réplique la rigueur des modules précédents : câblage, couverture d'objectifs RÉELS (jamais
 * inventés), mécaniques distinctes, gradabilité, cohérence structure/dataset, cohérence du
 * placement d'invalidation (seul plancher documenté du module : la tendance haussière),
 * checkpoint propre, et absence totale de vocabulaire BUY/SELL ou de promesse de gain.
 */
import { describe, it, expect } from '@jest/globals';
import {
  STRUCTURE_SKILLS,
  STRUCTURE_CHECKPOINT_ID,
  STRUCTURE_SKILL_CONCEPT_ID,
  STRUCTURE_MODULE_SCENARIOS,
  STRUCTURE_MODULE_SCENARIOS_BY_SKILL,
  STRUCTURE_MODULE_EXERCISES_BY_SKILL,
} from './structureModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise, lowestLow } from '../engines/exercise';
import { generateCandles } from '../engines/pattern/demoChart';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/**
 * Objectifs RÉELS ciblés par compétence (dérivés des champs du concept — voir learningTarget).
 * NB : `concept.uptrend` est aussi la notion liée de `skill.trend` (Fondations), qui cible déjà
 * `recognize` — l'union reste identique à l'ensemble attendu ci-dessous.
 */
const EXPECTED: Record<string, ObjectiveKind[]> = {
  'concept.uptrend': ['recognize', 'interpret', 'invalidate', 'avoid-false-signal'],
  'concept.downtrend': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
  'concept.range': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
  'concept.break-of-structure': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
};

const ALL_EXERCISES = Object.values(STRUCTURE_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire la structure » — modèle officiel (world.structure)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of STRUCTURE_SKILLS) {
      expect(getExercises(s.id)).toEqual(STRUCTURE_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(STRUCTURE_MODULE_SCENARIOS.length);
    // 4 compétences × 4 items = 16 exercices dérivés.
    expect(ALL_EXERCISES.length).toBe(16);
  });

  it('chaque compétence cible un concept RÉEL de world.structure', () => {
    const structureIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.structure').map((c) => c.id));
    for (const s of STRUCTURE_SKILLS) {
      const cid = STRUCTURE_SKILL_CONCEPT_ID[s.id];
      expect(structureIds.has(cid)).toBe(true);
    }
  });

  it('couvre uniquement des OBJECTIFS RÉELS ; le BOS baissier (invalidation au-dessus) n’a pas de placement de plancher', () => {
    for (const [cid, kinds] of Object.entries(EXPECTED)) {
      const covered = new Set(exercisableObjectiveIds(cid));
      expect(covered).toEqual(new Set(kinds.map((k) => objectiveId(cid, k))));
      // Aucun objectif ciblé n'est orphelin : il se résout dans le modèle canonique.
      for (const oid of covered) expect(objectiveByIdIn(V5_CONCEPTS, oid)).toBeDefined();
    }
    // Honnêteté du modèle : l'invalidation documentée du BOS est une reprise AU-DESSUS du niveau
    // cassé — pas un plancher → aucun exercice de placement d'invalidation ne lui est attaché.
    expect(exercisableObjectiveIds('concept.break-of-structure')).not.toContain(
      objectiveId('concept.break-of-structure', 'invalidate'),
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
    // Chaque compétence propose au moins 3 interactions réellement différentes.
    for (const s of STRUCTURE_SKILLS) {
      const kinds = scenarioInteractionTypes(STRUCTURE_MODULE_SCENARIOS_BY_SKILL[s.id]);
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
    expect(figures.length).toBe(4);
    for (const ex of figures) {
      if (ex.type !== 'identify_figure') continue;
      expect(VISUAL_DATASETS[ex.datasetKey]).toBeDefined();
      // Le variant coïncide avec le visualSpec du concept cible (même structure rendue).
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      expect(concept.visualSpec?.datasetKey).toBe(ex.datasetKey);
    }
  });

  it('cohérence invalidation : la cible placée EST le plus bas réel de la série rendue', () => {
    const places = ALL_EXERCISES.filter((e) => e.type === 'place_invalidation');
    // Un seul plancher documenté dans ce module : l'invalidation de la tendance haussière.
    expect(places.length).toBe(1);
    for (const ex of places) {
      if (ex.type !== 'place_invalidation') continue;
      const candles = generateCandles(ex.chartSeed, 30);
      expect(ex.validation.targetPrice).toBe(lowestLow(candles));
      expect(ex.validation.tolerance).toBeGreaterThan(0);
    }
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Structure', () => {
    expect(isCheckpoint(STRUCTURE_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(STRUCTURE_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.structure.')).toBe(true);
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
