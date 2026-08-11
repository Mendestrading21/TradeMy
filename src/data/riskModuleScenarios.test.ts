/**
 * LOT 4-U — Garde-fous du module guidé « Gérer le risque » (world.risk).
 *
 * Même rigueur que les modules précédents : câblage, couverture d'objectifs RÉELS (jamais
 * inventés), mécaniques distinctes (5, dont le SEUL placement du module : le stop est un plancher
 * documenté), gradabilité, cohérence visuel/dataset, checkpoint propre, vocabulaire.
 */
import { describe, it, expect } from '@jest/globals';
import {
  RISK_SKILLS,
  RISK_CHECKPOINT_ID,
  RISK_SKILL_CONCEPT_ID,
  RISK_MODULE_SCENARIOS,
  RISK_MODULE_SCENARIOS_BY_SKILL,
  RISK_MODULE_EXERCISES_BY_SKILL,
} from './riskModuleScenarios';
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
 */
const EXPECTED: Record<string, ObjectiveKind[]> = {
  'concept.risk-reward': ['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal'],
  'concept.stop-loss': ['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal'],
  // La taille de position ne documente PAS d'invalidation → pas d'objectif `invalidate`.
  'concept.position-sizing': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
};

const ALL_EXERCISES = Object.values(RISK_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Gérer le risque » — modèle officiel (world.risk)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of RISK_SKILLS) {
      expect(getExercises(s.id)).toEqual(RISK_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(RISK_MODULE_SCENARIOS.length);
    // 2 compétences × 5 (cinq natures documentées) + la taille × 4 = 14 exercices.
    // LOT D3 — 6 pour risque/rendement et 6 pour la taille de position (chacune gagne un CALCUL),
    // 4 pour le stop-loss = 16 exercices dérivés.
    expect(ALL_EXERCISES.length).toBe(16);
  });

  it('chaque compétence cible un concept RÉEL de world.risk', () => {
    const riskIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.risk').map((c) => c.id));
    for (const s of RISK_SKILLS) {
      const cid = RISK_SKILL_CONCEPT_ID[s.id];
      expect(riskIds.has(cid)).toBe(true);
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

  it('mécaniques réellement distinctes : 5 types d’exercice, dont le placement (le stop EST un plancher)', () => {
    const types = new Set(ALL_EXERCISES.map((e) => e.type));
    // LOT D3 — `numeric` s'ajoute : un multiple de risque et une taille de position se POSENT.
    // Un QCM y laisserait deviner ce que la compétence consiste justement à savoir calculer.
    expect(types).toEqual(
      new Set(['identify_figure', 'order', 'scenario', 'place_invalidation', 'find_error', 'numeric']),
    );
    for (const s of RISK_SKILLS) {
      const kinds = scenarioInteractionTypes(RISK_MODULE_SCENARIOS_BY_SKILL[s.id]);
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
        case 'numeric': answer = ex.validation.answer; break;
        case 'place_invalidation': answer = ex.validation.targetPrice; break;
        default: throw new Error(`type inattendu: ${ex.type}`);
      }
      expect(gradeExercise(ex, answer).correct).toBe(true);
    }
  });

  it('cohérence du placement : le stop placé EST le plus bas réel de la série rendue (seul placement du module)', () => {
    const places = ALL_EXERCISES.filter((e) => e.type === 'place_invalidation');
    // Le stop-loss est le SEUL concept du monde dont l'invalidation est un plancher physique.
    expect(places.length).toBe(1);
    for (const ex of places) {
      if (ex.type !== 'place_invalidation') continue;
      expect(ex.skillId).toBe('skill.risk.stop');
      const candles = generateCandles(ex.chartSeed, 30);
      expect(ex.validation.targetPrice).toBe(lowestLow(candles));
      expect(ex.validation.tolerance).toBeGreaterThan(0);
    }
  });

  it('cohérence visuelle : chaque reconnaissance montre le dataset RÉEL, le variant ET le type de rendu de sa fiche', () => {
    const figures = ALL_EXERCISES.filter((e) => e.type === 'identify_figure');
    expect(figures.length).toBe(3);
    for (const ex of figures) {
      if (ex.type !== 'identify_figure') continue;
      expect(ex.visualType).toBe('risk-reward'); // le rendu réel des fiches du monde Risk
      expect(VISUAL_DATASETS[ex.datasetKey]).toBeDefined();
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      expect(concept.visualSpec?.type).toBe(ex.visualType);
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      expect(concept.visualSpec?.datasetKey).toBe(ex.datasetKey);
    }
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Risk', () => {
    expect(isCheckpoint(RISK_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(RISK_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.risk.')).toBe(true);
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
