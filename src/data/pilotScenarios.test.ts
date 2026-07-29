import { describe, it, expect } from '@jest/globals';
import { CANDLE_PILOT_SCENARIOS, CANDLE_PILOT_EXERCISES, PILOT_CANDLE_CONCEPT_ID } from './pilotScenarios';
import { getExercises, exercisableObjectiveIds, exerciseVariantsForObjective } from './seed';
import { objectiveId } from './learningTarget';
import { scenarioInteractionTypes, gradeExercise } from '../engines/exercise';

const C = PILOT_CANDLE_CONCEPT_ID;

describe('Unité pilote « Comprendre un chandelier » — modèle officiel', () => {
  it('est bien câblée : skill.candles = les exercices dérivés des scénarios', () => {
    expect(getExercises('skill.candles')).toEqual(CANDLE_PILOT_EXERCISES);
    expect(CANDLE_PILOT_EXERCISES).toHaveLength(CANDLE_PILOT_SCENARIOS.length);
    expect(CANDLE_PILOT_EXERCISES.length).toBeGreaterThanOrEqual(6);
  });

  it('couvre au moins 3 objectifs atomiques RÉELS du concept', () => {
    const covered = new Set(CANDLE_PILOT_EXERCISES.map((e) => e.target?.objectiveId));
    expect(covered.has(objectiveId(C, 'recognize'))).toBe(true);
    expect(covered.has(objectiveId(C, 'interpret'))).toBe(true);
    expect(covered.has(objectiveId(C, 'avoid-false-signal'))).toBe(true);
    // exercisableObjectiveIds (base de la couverture/maîtrise) contient ces objectifs.
    // Depuis le LOT 4-P, le concept porte AUSSI `confirm`, exercé par le module Anatomie
    // (skill.anatomy.candle) : l'ensemble global est l'union des deux compétences.
    const exObj = new Set(exercisableObjectiveIds(C));
    for (const oid of covered) expect(exObj.has(oid as string)).toBe(true);
    expect(exObj).toEqual(new Set([...covered, objectiveId(C, 'confirm')]));
  });

  it('propose 4 MÉCANIQUES utilisateur réellement distinctes (pas des QCM déguisés)', () => {
    const kinds = scenarioInteractionTypes(CANDLE_PILOT_SCENARIOS);
    // 3 interactions non-QCM + le placement continu d'une ligne (4e mécanique réelle).
    expect(kinds).toEqual(
      expect.arrayContaining(['touch-extreme-zone', 'label-extreme', 'read-order', 'place-extreme']),
    );
    const types = new Set(CANDLE_PILOT_EXERCISES.map((e) => e.type));
    expect(types).toEqual(
      new Set(['identify_pattern', 'select_chart_zone', 'label_chart', 'place_invalidation', 'order', 'find_error']),
    );
    // Les 4 mécaniques utilisateur distinctes : choix / zone au doigt / réorganisation / placement continu.
    const mechanic = (t: string) =>
      t === 'select_chart_zone'
        ? 'zone'
        : t === 'order'
          ? 'reorder'
          : t === 'place_invalidation'
            ? 'place'
            : 'choice';
    expect(new Set([...types].map(mechanic))).toEqual(new Set(['choice', 'zone', 'reorder', 'place']));
  });

  it('la remédiation dispose d’une variante DIFFÉRENTE (recognize et interpret ont ≥2 variantes)', () => {
    expect(exerciseVariantsForObjective(objectiveId(C, 'recognize')).length).toBeGreaterThanOrEqual(2);
    expect(exerciseVariantsForObjective(objectiveId(C, 'interpret')).length).toBeGreaterThanOrEqual(2);
  });

  it('chaque exercice se corrige (une bonne réponse existe et est acceptée)', () => {
    for (const ex of CANDLE_PILOT_EXERCISES) {
      // Réponse correcte reconstruite selon le type, puis vérifiée par le grader réel.
      let answer: unknown;
      switch (ex.type) {
        case 'identify_pattern': answer = ex.validation.correctIndex; break;
        case 'select_chart_zone': answer = ex.validation.correctZone; break;
        case 'label_chart': answer = ex.validation.correctIndex; break;
        case 'find_error': answer = ex.validation.errorIndex; break;
        case 'order': answer = ex.validation.correctOrder; break;
        case 'place_invalidation': answer = ex.validation.targetPrice; break;
        default: throw new Error(`type inattendu: ${ex.type}`);
      }
      expect(gradeExercise(ex, answer).correct).toBe(true);
    }
  });

  it('le flagship « direction » a une réponse nette (pas un range ambigu)', () => {
    const dir = CANDLE_PILOT_EXERCISES.find((e) => e.id === 'ex.candles.direction');
    if (!dir || dir.type !== 'identify_pattern') throw new Error('direction manquante');
    // seed choisi pour une structure clairement haussière → option 0.
    expect(dir.validation.correctIndex).toBe(0);
  });

  it('aucun exercice ne contient BUY/SELL ni promesse de gain', () => {
    const forbidden = /\b(buy|sell|profit garanti|gain garanti|trade gagnant|signal sûr)\b/i;
    for (const ex of CANDLE_PILOT_EXERCISES) {
      const bag = [ex.prompt, ex.feedback.correct, ex.feedback.incorrect, ex.feedback.rule ?? '', ex.feedback.whenItFails ?? ''];
      if (ex.type === 'select_chart_zone') bag.push(...ex.zones);
      if (ex.type === 'order') bag.push(...ex.items);
      if (ex.type === 'find_error') bag.push(...ex.statements);
      if (ex.type === 'identify_pattern' || ex.type === 'label_chart') bag.push(...ex.options);
      expect(bag.join(' ')).not.toMatch(forbidden);
    }
  });
});
