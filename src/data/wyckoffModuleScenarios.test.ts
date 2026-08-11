/**
 * LOT 4-X — Garde-fous du module guidé « Lire les phases Wyckoff » (world.wyckoff).
 *
 * Même rigueur que les modules précédents : câblage, couverture d'objectifs RÉELS (jamais
 * inventés — la distribution ne documente NI confirmation NI invalidation → 3 natures seulement),
 * mécaniques distinctes (5, dont le SEUL placement du module : l'accumulation s'invalide par un
 * plancher documenté — « rupture par le bas de la zone »), gradabilité, cohérence visuel/dataset,
 * checkpoint propre, vocabulaire.
 */
import { describe, it, expect } from '@jest/globals';
import {
  WYCKOFF_SKILLS,
  WYCKOFF_CHECKPOINT_ID,
  WYCKOFF_SKILL_CONCEPT_ID,
  WYCKOFF_MODULE_SCENARIOS,
  WYCKOFF_MODULE_SCENARIOS_BY_SKILL,
  WYCKOFF_MODULE_EXERCISES_BY_SKILL,
} from './wyckoffModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, objectivesForConcept, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise, lowestLow } from '../engines/exercise';
import { generateCandles } from '../engines/pattern/demoChart';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/**
 * Objectifs RÉELS de chaque concept du module. LOT D1 : cette attente est DÉRIVÉE de la fiche
 * elle-même (`objectivesForConcept`) au lieu d'être écrite en dur — une liste figée avait laissé
 * passer l'enrichissement du LOT E3 sans que les exercices suivent.
 */
const MODULE_CONCEPT_IDS = [
  'concept.wyckoff-accumulation',
  'concept.distribution-wyckoff',
];
const EXPECTED: Record<string, ObjectiveKind[]> = Object.fromEntries(
  MODULE_CONCEPT_IDS.map((id) => [
    id,
    objectivesForConcept(V5_CONCEPTS.find((c) => c.id === id)!).map((o) => o.kind),
  ]),
);

const ALL_EXERCISES = Object.values(WYCKOFF_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire les phases Wyckoff » — modèle officiel (world.wyckoff)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of WYCKOFF_SKILLS) {
      expect(getExercises(s.id)).toEqual(WYCKOFF_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(WYCKOFF_MODULE_SCENARIOS.length);
    // Accumulation × 5 natures + distribution × 3 natures = 8 exercices.
    expect(ALL_EXERCISES.length).toBe(10); // LOT D1 : 5 + 5 (la 2e fiche rattrape confirmation + invalidation)
  });

  it('chaque compétence cible un concept RÉEL de world.wyckoff', () => {
    const wyckoffIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.wyckoff').map((c) => c.id));
    for (const s of WYCKOFF_SKILLS) {
      const cid = WYCKOFF_SKILL_CONCEPT_ID[s.id];
      expect(wyckoffIds.has(cid)).toBe(true);
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

  it('mécaniques réellement distinctes : 5 types d’exercice, dont le placement (l’accumulation a un plancher documenté)', () => {
    const types = new Set(ALL_EXERCISES.map((e) => e.type));
    expect(types).toEqual(new Set(['identify_figure', 'order', 'scenario', 'place_invalidation', 'find_error']));
    for (const s of WYCKOFF_SKILLS) {
      const kinds = scenarioInteractionTypes(WYCKOFF_MODULE_SCENARIOS_BY_SKILL[s.id]);
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

  it('cohérence du placement : le plancher placé EST le plus bas réel de la série rendue (seul placement, sur l’accumulation)', () => {
    const places = ALL_EXERCISES.filter((e) => e.type === 'place_invalidation');
    // Seule l'accumulation s'invalide par un plancher (« rupture par le bas de la zone ») ;
    // la distribution ne documente pas d'invalidation du tout.
    expect(places.length).toBe(1);
    for (const ex of places) {
      if (ex.type !== 'place_invalidation') continue;
      expect(ex.skillId).toBe('skill.wyckoff.accumulation');
      const candles = generateCandles(ex.chartSeed, 30);
      expect(ex.validation.targetPrice).toBe(lowestLow(candles));
      expect(ex.validation.tolerance).toBeGreaterThan(0);
    }
  });

  it('cohérence visuelle : chaque reconnaissance montre le dataset RÉEL, le variant ET le type de rendu de sa fiche', () => {
    const figures = ALL_EXERCISES.filter((e) => e.type === 'identify_figure');
    expect(figures.length).toBe(2);
    for (const ex of figures) {
      if (ex.type !== 'identify_figure') continue;
      expect(VISUAL_DATASETS[ex.datasetKey]).toBeDefined();
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      // Le rendu réel de CHAQUE fiche (chart-pattern pour l'accumulation, market-structure pour la distribution).
      expect(concept.visualSpec?.type).toBe(ex.visualType);
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      expect(concept.visualSpec?.datasetKey).toBe(ex.datasetKey);
    }
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Wyckoff', () => {
    expect(isCheckpoint(WYCKOFF_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(WYCKOFF_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.wyckoff.')).toBe(true);
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
