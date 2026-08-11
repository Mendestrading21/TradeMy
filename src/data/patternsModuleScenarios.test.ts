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
import { objectiveId, parseObjectiveId, objectiveByIdIn, objectivesForConcept, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise, lowestLow, highestHigh } from '../engines/exercise';
import { generateCandles } from '../engines/pattern/demoChart';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/**
 * Objectifs RÉELS de chaque concept du module. LOT D1 : cette attente est DÉRIVÉE de la fiche
 * elle-même (`objectivesForConcept`) au lieu d'être écrite en dur — une liste figée avait laissé
 * passer l'enrichissement du LOT E3 sans que les exercices suivent.
 */
const MODULE_CONCEPT_IDS = [
  'concept.double-bottom',
  'concept.ascending-triangle',
  'concept.bull-flag',
  'concept.head-shoulders',
  // LOT C2 — la figure miroir : cette fiche de bibliothèque devient une compétence entraînable.
  'concept.double-top',
  // LOT C3 — les trois miroirs restants, dans les DEUX sens.
  'concept.descending-triangle',
  'concept.bear-flag',
  'concept.inverse-head-shoulders',
];
const EXPECTED: Record<string, ObjectiveKind[]> = Object.fromEntries(
  MODULE_CONCEPT_IDS.map((id) => [
    id,
    objectivesForConcept(V5_CONCEPTS.find((c) => c.id === id)!).map((o) => o.kind),
  ]),
);

const ALL_EXERCISES = Object.values(PATTERNS_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire les figures » — modèle officiel (world.patterns)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of PATTERNS_SKILLS) {
      expect(getExercises(s.id)).toEqual(PATTERNS_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(PATTERNS_MODULE_SCENARIOS.length);
    // 4 compétences × 4 items = 16 exercices dérivés.
    // LOT C3 : 25 → 40. Trois compétences miroir de plus, cinq objectifs réels chacune.
    expect(ALL_EXERCISES.length).toBe(40);
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
    // LOT D1 — l'invalidation documentée du triangle (sous la ligne des creux MONTANTS) et celle
    // de l'ÉTÉ (reprise AU-DESSUS de la ligne de cou) sont désormais exercées, mais aucune n'est un
    // plancher : elles se raisonnent (scénario), sans exercice de PLACEMENT.
    expect(exercisableObjectiveIds('concept.ascending-triangle')).toContain(
      objectiveId('concept.ascending-triangle', 'invalidate'),
    );
    expect(exercisableObjectiveIds('concept.head-shoulders')).toContain(
      objectiveId('concept.head-shoulders', 'invalidate'),
    );
    const sansPlancher = ['skill.patterns.triangle', 'skill.patterns.reversal'];
    for (const id of sansPlancher) {
      expect((PATTERNS_MODULE_EXERCISES_BY_SKILL[id] ?? []).filter((e) => e.type === 'place_invalidation')).toEqual([]);
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
    expect(figures.length).toBe(8); // une reconnaissance par compétence du module.
    for (const ex of figures) {
      if (ex.type !== 'identify_figure') continue;
      expect(VISUAL_DATASETS[ex.datasetKey]).toBeDefined();
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      expect(concept.visualSpec?.datasetKey).toBe(ex.datasetKey);
    }
  });

  it('cohérence invalidation : la cible placée EST l’extrême RÉEL, du bon côté du graphique', () => {
    const places = ALL_EXERCISES.filter((e) => e.type === 'place_invalidation');
    // LOT C3 — le verrou porte maintenant la LEÇON du lot : l'invalidation se place du côté OPPOSÉ
    // au sens du setup. Six placements : trois setups haussiers (double creux, drapeau haussier,
    // ÉTÉ inversée) invalidés vers le BAS, trois setups baissiers (double sommet, triangle
    // descendant, drapeau baissier) invalidés vers le HAUT.
    expect(places.length).toBe(6);
    const versLeHaut = places.filter((ex) => (ex.hint ?? '').includes('plus haut'));
    expect(versLeHaut).toHaveLength(3);
    for (const ex of places) {
      if (ex.type !== 'place_invalidation') continue;
      expect(ex.hint).toBeTruthy();
      const candles = generateCandles(ex.chartSeed, 30);
      const haut = (ex.hint ?? '').includes('plus haut');
      expect(ex.validation.targetPrice).toBe(haut ? highestHigh(candles) : lowestLow(candles));
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
