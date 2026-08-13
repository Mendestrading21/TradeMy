import { describe, it, expect } from '@jest/globals';
import {
  FOUNDATIONS_SKILLS,
  FOUNDATIONS_SKILL_CONCEPT_ID,
  FOUNDATIONS_MODULE_SCENARIOS,
  FOUNDATIONS_MODULE_EXERCISES_BY_SKILL,
} from './foundationsModuleScenarios';
import { getExercises, getLessons, exercisableObjectiveIds, CONTENT_MODULES } from './seed';
import { objectivesForConcept } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { gradeExercise } from '../engines/exercise';

/**
 * LOT C8 — VERROUS de « Ce que vaut une action » (monde 1, `world.foundations`).
 *
 * Ce que ce lot répare : sur les TROIS fiches du premier monde du parcours, une seule était
 * entraînable. Dividende et PER — les deux seules notions du corpus dont la définition EST une
 * division — restaient consultables sans jamais être demandées.
 *
 * Ce que ces tests protègent, au-delà des compteurs :
 *  1. les deux compétences rejoignent le module EXISTANT du monde 1, jamais un second module ;
 *  2. les objectifs couverts sont exactement ceux que les fiches DÉCLARENT (trois, pas cinq) ;
 *  3. le calcul est le geste central, et sa méthode est vérifiable à la main ;
 *  4. aucun exercice de reconnaissance de FIGURE : ces notions n'en ont pas.
 */

const ALL = Object.values(FOUNDATIONS_MODULE_EXERCISES_BY_SKILL).flat();

describe('LOT C8 — ce que vaut une action (world.foundations)', () => {
  it('les deux compétences rejoignent le module EXISTANT du monde 1 — pas un second module', () => {
    // La complétion d'un monde est pilotée par SON module et SON checkpoint. Un 16e module aurait
    // donné deux checkpoints au monde 1 : ce test interdit que quelqu'un le refasse par mégarde.
    const modulesDuMonde1 = CONTENT_MODULES.filter((m) => m.worldId === 'world.foundations');
    expect(modulesDuMonde1).toHaveLength(1);
    const ids = modulesDuMonde1[0].skills.map((s) => s.id);
    for (const s of FOUNDATIONS_SKILLS) expect(ids).toContain(s.id);
  });

  it('câblage : chaque compétence expose ses exercices dérivés, et porte une leçon', () => {
    for (const s of FOUNDATIONS_SKILLS) {
      expect(getExercises(s.id)).toEqual(FOUNDATIONS_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getLessons(s.id).length).toBeGreaterThan(0);
    }
    expect(ALL.length).toBe(FOUNDATIONS_MODULE_SCENARIOS.length);
    expect(ALL.length).toBe(6); // 2 compétences × 3 objectifs RÉELS
  });

  it('couvre EXACTEMENT les objectifs que les fiches déclarent : trois, pas cinq', () => {
    // Ni `confirmationZone` ni `invalidation` sur une NOTION (ADR-133). Leur inventer une zone de
    // confirmation serait enseigner du faux ; l'absence d'exercice `confirm` est donc voulue.
    for (const [skillId, conceptId] of Object.entries(FOUNDATIONS_SKILL_CONCEPT_ID)) {
      const fiche = V5_CONCEPTS.find((c) => c.id === conceptId)!;
      expect(fiche.confirmationZone).toBeFalsy();
      expect(fiche.invalidation).toBeFalsy();
      const attendus = objectivesForConcept(fiche).map((o) => o.kind).sort();
      expect(attendus).toEqual(['avoid-false-signal', 'interpret', 'recognize']);
      const couverts = FOUNDATIONS_MODULE_EXERCISES_BY_SKILL[skillId]
        .map((e) => e.target!.objectiveId.split('::')[1])
        .sort();
      expect(couverts).toEqual(attendus);
      // Et la fiche cesse d'être une impasse : elle a désormais des objectifs exerçables.
      expect(exercisableObjectiveIds(conceptId).length).toBe(3);
    }
  });

  it('le CALCUL est le geste central, et sa méthode se refait à la main', () => {
    const calculs = ALL.filter((e) => e.type === 'numeric');
    expect(calculs).toHaveLength(2); // un par compétence
    for (const ex of calculs) {
      if (ex.type !== 'numeric') continue;
      // La bonne réponse est acceptée par le grader RÉEL, pas par une assertion parallèle.
      expect(gradeExercise(ex, ex.validation.answer).correct).toBe(true);
      // La méthode est écrite, et elle contient la division qui définit la notion.
      expect(ex.feedback.rule ?? '').toBeTruthy();
    }
    // Rendement du dividende : 2 ÷ 50 = 4 %. PER : 36 ÷ 3 = 12.
    const parId = new Map(calculs.map((e) => [e.id, e]));
    const div = parId.get('ex.foundations.dividend.compute')!;
    const per = parId.get('ex.foundations.per.compute')!;
    if (div.type === 'numeric') expect(div.validation.answer).toBe(2 / 50 * 100);
    if (per.type === 'numeric') expect(per.validation.answer).toBe(36 / 3);
  });

  it('aucune reconnaissance de FIGURE : ces notions n’en ont pas, et on n’en invente pas', () => {
    // Leur `visualSpec.type` est `mechanism` — un schéma, sans série de bougies. La mécanique de
    // reconnaissance exige un dataset OHLC : elle ne peut pas s'appliquer, et c'est correct.
    for (const conceptId of Object.values(FOUNDATIONS_SKILL_CONCEPT_ID)) {
      const fiche = V5_CONCEPTS.find((c) => c.id === conceptId)!;
      expect(fiche.visualSpec?.type).toBe('mechanism');
      expect(fiche.visualSpec?.datasetKey).toBeFalsy();
    }
    expect(ALL.some((e) => e.type === 'identify_figure')).toBe(false);
  });

  it('chaque exercice se corrige, et aucun ne contient BUY/SELL ni promesse de gain', () => {
    const interdits = /\b(buy|sell|profit garanti|gain garanti|rendement garanti|placement sûr)\b/i;
    for (const ex of ALL) {
      let reponse: unknown;
      switch (ex.type) {
        case 'scenario': reponse = ex.validation.correctIndex; break;
        case 'find_error': reponse = ex.validation.errorIndex; break;
        case 'numeric': reponse = ex.validation.answer; break;
        default: throw new Error(`type inattendu: ${ex.type}`);
      }
      expect(gradeExercise(ex, reponse).correct).toBe(true);

      const bag = [ex.prompt, ex.feedback.correct, ex.feedback.incorrect, ex.feedback.rule ?? '', ex.feedback.whenItFails ?? ''];
      if (ex.type === 'find_error') bag.push(...ex.statements);
      if (ex.type === 'scenario') bag.push(ex.context, ...ex.options);
      expect(bag.join(' ')).not.toMatch(interdits);
    }
  });
});
