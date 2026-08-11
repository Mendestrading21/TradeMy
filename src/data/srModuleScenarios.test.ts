/**
 * LOT 4-O — Garde-fous du module guidé « Lire les niveaux » (world.support-resistance).
 *
 * Même rigueur que les modules précédents : câblage, couverture d'objectifs RÉELS (jamais
 * inventés), mécaniques distinctes, gradabilité, cohérence structure/dataset, cohérence du
 * placement d'invalidation (seul plancher documenté : le support), couverture COMPLÈTE des natures
 * documentées par chaque fiche (LOT D1), checkpoint propre, et absence
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
  'concept.support-resistance',
  'concept.polarity-flip',
  'concept.retest-de-niveau',
];
const EXPECTED: Record<string, ObjectiveKind[]> = Object.fromEntries(
  MODULE_CONCEPT_IDS.map((id) => [
    id,
    objectivesForConcept(V5_CONCEPTS.find((c) => c.id === id)!).map((o) => o.kind),
  ]),
);

const ALL_EXERCISES = Object.values(SR_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire les niveaux » — modèle officiel (world.support-resistance)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of SR_SKILLS) {
      expect(getExercises(s.id)).toEqual(SR_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(SR_MODULE_SCENARIOS.length);
    expect(ALL_EXERCISES.length).toBe(16); // LOT D2 : 6 (zones, + placement de résistance) + 5 + 5
  });

  it('chaque compétence cible un concept RÉEL de world.support-resistance', () => {
    const srIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.support-resistance').map((c) => c.id));
    for (const s of SR_SKILLS) {
      const cid = SR_SKILL_CONCEPT_ID[s.id];
      expect(srIds.has(cid)).toBe(true);
    }
  });

  it('couvre uniquement des OBJECTIFS RÉELS ; le retest rattrape sa confirmation et son invalidation, sans placement', () => {
    for (const [cid, kinds] of Object.entries(EXPECTED)) {
      const covered = new Set(exercisableObjectiveIds(cid));
      expect(covered).toEqual(new Set(kinds.map((k) => objectiveId(cid, k))));
      for (const oid of covered) expect(objectiveByIdIn(V5_CONCEPTS, oid)).toBeDefined();
    }
    // LOT D1 — le retest documente désormais confirmation ET invalidation (LOT E3, ADR-133) : les
    // deux natures sont exercées. Son invalidation reste « repasser de l'autre côté du niveau »,
    // pas un plancher → elle se raisonne, sans exercice de PLACEMENT.
    expect(exercisableObjectiveIds('concept.retest-de-niveau')).toContain(
      objectiveId('concept.retest-de-niveau', 'confirm'),
    );
    expect(exercisableObjectiveIds('concept.retest-de-niveau')).toContain(
      objectiveId('concept.retest-de-niveau', 'invalidate'),
    );
    const retestPlacements = (SR_MODULE_EXERCISES_BY_SKILL['skill.sr.retest'] ?? []).filter(
      (e) => e.type === 'place_invalidation',
    );
    expect(retestPlacements).toEqual([]);
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

  it('cohérence des niveaux placés : chaque cible EST l’extrême réel que son énoncé désigne', () => {
    // Le module compte DEUX placements, rendus par le même player mais visant des extrêmes
    // OPPOSÉS — c'est justement ce que le verrou doit distinguer :
    //  · l'invalidation du support se pose sous le plus BAS atteint (plancher documenté) ;
    //  · LOT D2 — la résistance se pose sur le plus HAUT atteint (repère d'un niveau).
    // L'indice de l'exercice dit lequel : la cible est vérifiée contre l'extrême correspondant.
    const places = ALL_EXERCISES.filter((e) => e.type === 'place_invalidation');
    expect(places.length).toBe(2);
    const vises = new Set<string>();
    for (const ex of places) {
      if (ex.type !== 'place_invalidation') continue;
      const candles = generateCandles(ex.chartSeed, 30);
      // L'indice n'est pas décoratif : c'est lui qui dit à l'apprenant QUEL niveau viser. Un
      // placement sans indice laisserait la cible indevinable — on le vérifie avant de s'en servir.
      expect(ex.hint).toBeTruthy();
      const versLeBas = (ex.hint ?? '').includes('plus bas');
      expect(ex.validation.targetPrice).toBe(versLeBas ? lowestLow(candles) : highestHigh(candles));
      expect(ex.validation.tolerance).toBeGreaterThan(0);
      vises.add(versLeBas ? 'bas' : 'haut');
    }
    // Les deux extrêmes sont réellement représentés : aucun des deux placements n'est un doublon.
    expect(vises).toEqual(new Set(['bas', 'haut']));
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
