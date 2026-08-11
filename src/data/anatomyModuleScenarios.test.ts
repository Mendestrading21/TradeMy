/**
 * LOT 4-P — Garde-fous du module guidé « Lire un graphique de près » (world.anatomy).
 *
 * Même rigueur que les modules précédents : câblage, couverture d'objectifs RÉELS (jamais
 * inventés), mécaniques distinctes, gradabilité, cohérence visuel/dataset, checkpoint propre,
 * vocabulaire. Spécificité honnête : AUCUN des trois concepts ne documente d'invalidation-plancher
 * → aucun placement d'invalidation (4 mécaniques distinctes, pas 5).
 */
import { describe, it, expect } from '@jest/globals';
import {
  ANATOMY_SKILLS,
  ANATOMY_CHECKPOINT_ID,
  ANATOMY_SKILL_CONCEPT_ID,
  ANATOMY_MODULE_SCENARIOS,
  ANATOMY_MODULE_SCENARIOS_BY_SKILL,
  ANATOMY_MODULE_EXERCISES_BY_SKILL,
} from './anatomyModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise } from '../engines/exercise';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/**
 * Objectifs RÉELS ciblés par compétence (dérivés des champs du concept — voir learningTarget).
 * NB : `concept.candle-anatomy` est aussi le concept de l'unité pilote (skill.candles, Fondations),
 * qui cible déjà recognize/interpret/avoid — l'union avec `confirm` (ajouté ici) reste l'ensemble
 * attendu ci-dessous.
 */
const EXPECTED: Record<string, ObjectiveKind[]> = {
  'concept.candle-anatomy': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
  // Ni zone de confirmation ni invalidation documentées → 3 objectifs seulement (honnêteté).
  'concept.unite-de-temps': ['recognize', 'interpret', 'avoid-false-signal'],
  'concept.echelle-des-prix': ['recognize', 'interpret', 'avoid-false-signal'],
};

const ALL_EXERCISES = Object.values(ANATOMY_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire un graphique de près » — modèle officiel (world.anatomy)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of ANATOMY_SKILLS) {
      expect(getExercises(s.id)).toEqual(ANATOMY_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(ANATOMY_MODULE_SCENARIOS.length);
    // LOT D2 — 5 pour « le corps et les mèches » (+ un repère à identifier), 3 pour l'unité de
    // temps, 4 pour l'échelle des prix (+ une zone à toucher en lisant l'axe) = 12 exercices.
    expect(ALL_EXERCISES.length).toBe(12);
  });

  it('chaque compétence cible un concept RÉEL de world.anatomy', () => {
    const anatomyIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.anatomy').map((c) => c.id));
    for (const s of ANATOMY_SKILLS) {
      const cid = ANATOMY_SKILL_CONCEPT_ID[s.id];
      expect(anatomyIds.has(cid)).toBe(true);
    }
  });

  it('couvre uniquement des OBJECTIFS RÉELS ; aucun concept du module ne reçoit d’exercice d’invalidation', () => {
    for (const [cid, kinds] of Object.entries(EXPECTED)) {
      const covered = new Set(exercisableObjectiveIds(cid));
      expect(covered).toEqual(new Set(kinds.map((k) => objectiveId(cid, k))));
      for (const oid of covered) expect(objectiveByIdIn(V5_CONCEPTS, oid)).toBeDefined();
    }
    for (const cid of Object.keys(EXPECTED)) {
      expect(exercisableObjectiveIds(cid)).not.toContain(objectiveId(cid, 'invalidate'));
    }
  });

  it('le module couvre les natures d’objectif RÉELLEMENT documentées (recognize, interpret, confirm, avoid-false-signal)', () => {
    const kinds = new Set<string>();
    for (const ex of ALL_EXERCISES) {
      const parsed = ex.target ? parseObjectiveId(ex.target.objectiveId) : null;
      if (parsed) kinds.add(parsed.kind);
    }
    // Honnêteté : `invalidate` est ABSENT — aucun concept du monde 2 ne documente d'invalidation.
    expect(kinds).toEqual(new Set(['recognize', 'interpret', 'confirm', 'avoid-false-signal']));
  });

  it('mécaniques réellement distinctes : 6 types d’exercice, dont le repère et la zone au doigt (pas de placement — aucun plancher documenté)', () => {
    const types = new Set(ALL_EXERCISES.map((e) => e.type));
    // LOT D2 — le monde qui apprend à LIRE un graphique le fait désormais manipuler : un repère à
    // identifier (`label_chart`) et une zone à toucher en lisant l'axe (`select_chart_zone`).
    expect(types).toEqual(
      new Set(['identify_figure', 'order', 'scenario', 'find_error', 'label_chart', 'select_chart_zone']),
    );
    // Aucun concept du monde ne documente d'invalidation-plancher → toujours aucun placement.
    expect(ALL_EXERCISES.filter((e) => e.type === 'place_invalidation')).toHaveLength(0);
    for (const s of ANATOMY_SKILLS) {
      const kinds = scenarioInteractionTypes(ANATOMY_MODULE_SCENARIOS_BY_SKILL[s.id]);
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
        case 'identify_pattern': answer = ex.validation.correctIndex; break;
        case 'label_chart': answer = ex.validation.correctIndex; break;
        case 'select_chart_zone': answer = ex.validation.correctZone; break;
        default: throw new Error(`type inattendu: ${ex.type}`);
      }
      expect(gradeExercise(ex, answer).correct).toBe(true);
    }
  });

  it('cohérence visuel : chaque reconnaissance montre un dataset RÉEL et le variant de sa fiche', () => {
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

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Anatomie', () => {
    expect(isCheckpoint(ANATOMY_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(ANATOMY_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.anatomy.')).toBe(true);
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
