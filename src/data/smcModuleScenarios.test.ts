/**
 * LOT 4-W — Garde-fous du module guidé « Lire le Smart Money » (world.smc).
 *
 * Même rigueur que les modules précédents : câblage, couverture d'objectifs RÉELS (les cinq
 * natures sont documentées sur les cinq concepts), mécaniques distinctes (5, dont le SEUL
 * placement du module : la zone de demande s'invalide par un plancher documenté — « clôture
 * franche SOUS la zone »), gradabilité, cohérence visuel/dataset, checkpoint propre, vocabulaire.
 */
import { describe, it, expect } from '@jest/globals';
import {
  SMC_SKILLS,
  SMC_CHECKPOINT_ID,
  SMC_SKILL_CONCEPT_ID,
  SMC_MODULE_SCENARIOS,
  SMC_MODULE_SCENARIOS_BY_SKILL,
  SMC_MODULE_EXERCISES_BY_SKILL,
} from './smcModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise, lowestLow } from '../engines/exercise';
import { generateCandles } from '../engines/pattern/demoChart';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/**
 * Objectifs RÉELS ciblés par compétence (dérivés des champs du concept — voir learningTarget).
 * Aucun autre module n'exerce ces concepts : l'union observée == l'ensemble ciblé ici.
 * Les CINQ concepts documentent les cinq natures (objectif top-level chacun).
 */
const ALL_KINDS: ObjectiveKind[] = ['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal'];
const EXPECTED: Record<string, ObjectiveKind[]> = {
  'concept.order-block': ALL_KINDS,
  'concept.fair-value-gap': ALL_KINDS,
  'concept.change-of-character': ALL_KINDS,
  'concept.demand-zone': ALL_KINDS,
  'concept.supply-zone': ALL_KINDS,
};

const ALL_EXERCISES = Object.values(SMC_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire le Smart Money » — modèle officiel (world.smc)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of SMC_SKILLS) {
      expect(getExercises(s.id)).toEqual(SMC_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(SMC_MODULE_SCENARIOS.length);
    // 5 compétences × 5 natures documentées = 25 exercices.
    expect(ALL_EXERCISES.length).toBe(25);
  });

  it('chaque compétence cible un concept RÉEL de world.smc', () => {
    const smcIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.smc').map((c) => c.id));
    for (const s of SMC_SKILLS) {
      const cid = SMC_SKILL_CONCEPT_ID[s.id];
      expect(smcIds.has(cid)).toBe(true);
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

  it('mécaniques réellement distinctes : 5 types d’exercice, dont le placement (la demande a un plancher documenté)', () => {
    const types = new Set(ALL_EXERCISES.map((e) => e.type));
    expect(types).toEqual(new Set(['identify_figure', 'order', 'scenario', 'place_invalidation', 'find_error']));
    for (const s of SMC_SKILLS) {
      const kinds = scenarioInteractionTypes(SMC_MODULE_SCENARIOS_BY_SKILL[s.id]);
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

  it('cohérence du placement : le plancher placé EST le plus bas réel de la série rendue (seul placement, sur la demande)', () => {
    const places = ALL_EXERCISES.filter((e) => e.type === 'place_invalidation');
    // Seule la zone de demande s'invalide par un plancher (« clôture franche SOUS la zone ») ;
    // l'offre s'invalide AU-DESSUS (pas un plancher), les trois autres par événement.
    expect(places.length).toBe(1);
    for (const ex of places) {
      if (ex.type !== 'place_invalidation') continue;
      expect(ex.skillId).toBe('skill.smc.demand');
      const candles = generateCandles(ex.chartSeed, 30);
      expect(ex.validation.targetPrice).toBe(lowestLow(candles));
      expect(ex.validation.tolerance).toBeGreaterThan(0);
    }
  });

  it('cohérence visuelle : chaque reconnaissance montre le dataset RÉEL, le variant ET le type de rendu de sa fiche', () => {
    const figures = ALL_EXERCISES.filter((e) => e.type === 'identify_figure');
    expect(figures.length).toBe(5);
    for (const ex of figures) {
      if (ex.type !== 'identify_figure') continue;
      expect(VISUAL_DATASETS[ex.datasetKey]).toBeDefined();
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      // Le rendu réel de CHAQUE fiche (chart-pattern pour OB/FVG/CHoCH, market-structure pour demande/offre).
      expect(concept.visualSpec?.type).toBe(ex.visualType);
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      expect(concept.visualSpec?.datasetKey).toBe(ex.datasetKey);
    }
    expect(new Set(figures.map((e) => (e.type === 'identify_figure' ? e.visualType : ''))).size).toBe(2);
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences SMC', () => {
    expect(isCheckpoint(SMC_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(SMC_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.smc.')).toBe(true);
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
