/**
 * Test d'INTÉGRATION du parcours pilote sur les modules RÉELS (pas des fonctions isolées) :
 * accueil → monde → leçon → erreur → retry (variante) → réussite → checkpoint → progression.
 * Vérifie que l'unité re-dérivée s'insère dans les moteurs P0 sans régression.
 */
import { describe, it, expect } from '@jest/globals';
import { WORLDS } from './learningConcept';
import { V5_CONCEPTS } from './learningContent';
import { buildLearningPath } from './learningMap';
import {
  getExercises,
  getLessons,
  CHECKPOINT_ID,
  isCheckpoint,
  exerciseVariantsForObjective,
  pickVariant,
  exercisableObjectiveIds,
  defaultProgress,
} from './seed';
import { gradeExercise, type Exercise } from '../engines/exercise';
import { aggregateAnswered, type AnsweredRecord } from './sessionFlow';
import { recordSessionReview, recordTargetSessionReview, completeSession } from './progressLogic';
import { objectiveCoverage, isObjectiveProven } from './targetProgress';
import { objectiveId } from './learningTarget';
import { PILOT_CANDLE_CONCEPT_ID } from './pilotScenarios';

const NOW = 1_700_000_000_000;
const DAY = 86_400_000;
const C = PILOT_CANDLE_CONCEPT_ID;

/** Réponse CORRECTE d'un exercice pilote (reconstruite par type). */
function correctAnswer(ex: Exercise): unknown {
  switch (ex.type) {
    case 'identify_pattern':
    case 'label_chart':
      return ex.validation.correctIndex;
    case 'select_chart_zone':
      return ex.validation.correctZone;
    case 'find_error':
      return ex.validation.errorIndex;
    case 'order':
      return ex.validation.correctOrder;
    case 'place_invalidation':
      return ex.validation.targetPrice;
    default:
      throw new Error(`type inattendu: ${ex.type}`);
  }
}

/** Réponse FAUSSE d'un exercice à choix (index différent du correct). */
function wrongIndex(correct: number, n = 3): number {
  return (correct + 1) % n;
}

/** Une session : joue chaque exercice donné (correct=vrai → bonne réponse), renvoie les AnsweredRecord. */
function playSession(exs: Exercise[], allCorrect: boolean): AnsweredRecord[] {
  return exs.map((ex) => ({
    exerciseId: ex.id,
    skillId: ex.skillId,
    conceptId: ex.target?.conceptId,
    objectiveId: ex.target?.objectiveId,
    correct: allCorrect,
  }));
}

describe('Parcours pilote — intégration accueil → checkpoint → progression', () => {
  it('accueil → monde : le monde pilote est ouvert, le suivant verrouillé (avec raison)', () => {
    const path = buildLearningPath(WORLDS, V5_CONCEPTS, { completedSkills: [], exploredSlugs: [] });
    const foundations = path.find((w) => w.world.id === 'world.foundations');
    expect(foundations).toBeDefined();
    expect(foundations!.status).toBe('current');
    const second = path[1];
    expect(second.status).toBe('locked');
    expect(second.lockReason).toBeTruthy();
  });

  it('monde → leçon → pratique : l’unité pilote expose leçon + 6 interactions (4 mécaniques)', () => {
    expect(getLessons('skill.candles').length).toBeGreaterThan(0); // phase Apprendre existe
    const exs = getExercises('skill.candles');
    expect(exs.length).toBe(6);
    expect(new Set(exs.map((e) => e.type))).toEqual(
      new Set(['identify_pattern', 'select_chart_zone', 'label_chart', 'place_invalidation', 'order', 'find_error']),
    );
    for (const ex of exs) expect(ex.target?.conceptId).toBe(C);
  });

  it('erreur → retry : une mauvaise réponse est refusée, la variante servie est DIFFÉRENTE', () => {
    const exs = getExercises('skill.candles');
    const direction = exs.find((e) => e.id === 'ex.candles.direction')!;
    if (direction.type !== 'identify_pattern') throw new Error('type');
    // Erreur : un index faux est bien noté incorrect par le grader réel.
    expect(gradeExercise(direction, wrongIndex(direction.validation.correctIndex)).correct).toBe(false);
    // Retry : l'objectif recognize a ≥2 variantes ; la rotation en sert une AUTRE au tour suivant.
    const recognize = objectiveId(C, 'recognize');
    expect(exerciseVariantsForObjective(recognize).length).toBeGreaterThanOrEqual(2);
    const v0 = pickVariant(recognize, 0);
    const v1 = pickVariant(recognize, 1);
    expect(v0?.id).toBeDefined();
    expect(v1?.id).not.toBe(v0?.id);
  });

  it('réussite : toutes les bonnes réponses de l’unité sont acceptées', () => {
    for (const ex of getExercises('skill.candles')) {
      expect(gradeExercise(ex, correctAnswer(ex)).correct).toBe(true);
    }
  });

  it('checkpoint : indépendant, agrège des exercices réels dont l’unité pilote', () => {
    expect(isCheckpoint(CHECKPOINT_ID)).toBe(true);
    const cp = getExercises(CHECKPOINT_ID);
    expect(cp.length).toBeGreaterThan(0);
    expect(cp.some((e) => e.skillId === 'skill.candles')).toBe(true);
  });

  it('progression : une session juste ⇒ 1 transition/cible ; deux sessions espacées ⇒ objectifs prouvés', () => {
    const exs = getExercises('skill.candles');
    let state = defaultProgress(NOW);

    // Session 1 — tout juste. aggregateAnswered agrège par cible (recognize joué 2× → 1 seule cible).
    const answered1 = playSession(exs, true);
    const agg1 = aggregateAnswered(answered1);
    const recognize = objectiveId(C, 'recognize');
    const recognizeResult = agg1.perTarget.find((t) => t.objectiveId === recognize)!;
    expect(recognizeResult.total).toBe(3); // 3 exercices recognize (direction, label-high, place-high) → UNE cible
    // 3 cibles distinctes dans l'UNITÉ PILOTE (le 4e objectif du concept, `confirm`,
    // appartient au module Anatomie depuis le LOT 4-P et ne se joue pas dans cette session).
    expect(agg1.perTarget).toHaveLength(3);

    state = recordSessionReview(state, 'skill.candles', agg1.perSkill[0].correct, agg1.perSkill[0].total, NOW);
    state = recordTargetSessionReview(state, agg1.perTarget, NOW);
    // Une seule transition : recognize à 1 répétition malgré 2 exercices.
    expect(state.targets![recognize].review.repetitions).toBe(1);
    expect(isObjectiveProven(state.targets![recognize])).toBe(false); // reps < 2

    // Session 2 — tout juste, le lendemain. La rétention se prouve (reps ≥ 2, intervalle ≥ 1).
    const agg2 = aggregateAnswered(playSession(exs, true));
    state = recordTargetSessionReview(state, agg2.perTarget, NOW + DAY);
    expect(state.targets![recognize].review.repetitions).toBe(2);
    // Tous les objectifs de l'UNITÉ PILOTE sont prouvés après deux sessions espacées.
    const pilotObjectives = [recognize, objectiveId(C, 'interpret'), objectiveId(C, 'avoid-false-signal')];
    const cov = objectiveCoverage(pilotObjectives, state.targets!);
    expect(cov.total).toBe(3);
    expect(cov.complete).toBe(true); // tous les objectifs de l'unité prouvés
    // Maîtrise par COUVERTURE (honnête) : depuis le LOT 4-P le concept a un 4e objectif exerçable
    // (`confirm`, module Anatomie) — la couverture complète du concept exige AUSSI ce module.
    const full = objectiveCoverage(exercisableObjectiveIds(C), state.targets!);
    expect(full.total).toBe(4);
    expect(full.complete).toBe(false);
  });

  it('progression : une cible ÉCHOUÉE reste due rapidement (jamais « prouvée »)', () => {
    const exs = getExercises('skill.candles');
    let state = defaultProgress(NOW);
    // Session où l'objectif « interpret » est raté (les autres justes).
    const interpret = objectiveId(C, 'interpret');
    const answered: AnsweredRecord[] = exs.map((ex) => ({
      exerciseId: ex.id,
      skillId: ex.skillId,
      conceptId: ex.target?.conceptId,
      objectiveId: ex.target?.objectiveId,
      correct: ex.target?.objectiveId !== interpret,
    }));
    const agg = aggregateAnswered(answered);
    state = recordTargetSessionReview(state, agg.perTarget, NOW);
    const t = state.targets![interpret];
    expect(t.review.repetitions).toBe(0); // remise à zéro
    expect(t.review.dueAt).toBe(NOW); // due immédiatement
    expect(isObjectiveProven(t)).toBe(false);
    expect(objectiveCoverage(exercisableObjectiveIds(C), state.targets!).complete).toBe(false);
  });

  it('fin de session : la rotation avance même sur échec (remédiation par variante)', () => {
    const state = defaultProgress(NOW);
    const { state: after } = completeSession(state, 'skill.candles', false, NOW);
    expect(after.rotation!['skill.candles']).toBe(1); // avance même sans réussite
    expect(after.completedSkills).not.toContain('skill.candles'); // échec ne débloque rien
  });
});
