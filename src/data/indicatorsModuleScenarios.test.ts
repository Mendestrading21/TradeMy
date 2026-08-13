/**
 * LOT 4-R — Garde-fous du module guidé « Lire les indicateurs » (world.indicators).
 *
 * Même rigueur que les modules précédents : câblage, couverture d'objectifs RÉELS (jamais
 * inventés), mécaniques distinctes, gradabilité, cohérence indicateur/dataset, honnêteté du
 * placement, checkpoint propre, vocabulaire.
 *
 * LOT G1 — le module passe de quatre à sept compétences, et deux verrous CHANGENT de sens plutôt
 * que de disparaître. « Aucun placement dans ce module » était vrai tant qu'aucun concept du monde
 * ne documentait un côté d'invalidation ; les deux croisements de moyennes en documentent un, et
 * de sens OPPOSÉ. Le verrou devient donc : le placement existe, et chaque côté est le bon —
 * plancher pour le haussier, plafond pour le baissier. Une règle affaiblie aurait laissé passer
 * l'erreur exacte que la fiche du croisement baissier enseigne à éviter.
 */
import { describe, it, expect } from '@jest/globals';
import {
  INDICATORS_SKILLS,
  INDICATORS_CHECKPOINT_ID,
  INDICATORS_SKILL_CONCEPT_ID,
  INDICATORS_MODULE_SCENARIOS,
  INDICATORS_MODULE_SCENARIOS_BY_SKILL,
  INDICATORS_MODULE_EXERCISES_BY_SKILL,
} from './indicatorsModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise } from '../engines/exercise';
import { SCENARIO_CANDLE_COUNT, highestHigh, lowestLow } from '../engines/exercise/scenario';
import { generateCandles } from '../engines/pattern/demoChart';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/**
 * Objectifs RÉELS ciblés par compétence (dérivés des champs du concept — voir learningTarget).
 * Aucun autre module n'exerce ces concepts : l'union observée == l'ensemble ciblé ici.
 */
const EXPECTED: Record<string, ObjectiveKind[]> = {
  // RSI, MACD et Bollinger ne documentent PAS d'invalidation → pas d'objectif `invalidate`.
  'concept.rsi': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
  'concept.macd': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
  'concept.bollinger': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
  // La divergence documente ses 5 natures (dont l'invalidation) → 5 exercices.
  'concept.divergence': ['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal'],
  // LOT G1 — la moyenne mobile n'est pas un setup : elle ne documente aucune invalidation, comme
  // le RSI. Les deux croisements, eux, en documentent une chacun, de sens opposé.
  'concept.moving-average': ['recognize', 'interpret', 'confirm', 'avoid-false-signal'],
  'concept.golden-cross': ['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal'],
  'concept.death-cross': ['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal'],
};

const ALL_EXERCISES = Object.values(INDICATORS_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire les indicateurs » — modèle officiel (world.indicators)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of INDICATORS_SKILLS) {
      expect(getExercises(s.id)).toEqual(INDICATORS_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(INDICATORS_MODULE_SCENARIOS.length);
    // 4 compétences × 4 items (RSI, MACD, Bollinger, moyenne mobile) + 3 × 5 (divergence et les
    // deux croisements, qui documentent leurs cinq natures) = 31 exercices.
    expect(ALL_EXERCISES.length).toBe(31);
  });

  it('chaque compétence cible un concept RÉEL de world.indicators', () => {
    const indicatorIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.indicators').map((c) => c.id));
    for (const s of INDICATORS_SKILLS) {
      const cid = INDICATORS_SKILL_CONCEPT_ID[s.id];
      expect(indicatorIds.has(cid)).toBe(true);
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

  it('honnêteté du placement : il n’existe QUE là où un concept documente un côté d’invalidation', () => {
    // Avant le LOT G1, aucun concept du monde n'en documentait : le module n'avait aucun placement.
    // Les deux croisements en documentent un — et un seul chacun.
    const placements = ALL_EXERCISES.filter((e) => e.type === 'place_invalidation');
    expect(placements.map((e) => e.skillId).sort()).toEqual([
      'skill.indicators.cross-down',
      'skill.indicators.cross-up',
    ]);
    // Les quatre concepts sans côté documenté (RSI, MACD, Bollinger, moyenne mobile) n'en ont AUCUN.
    for (const id of ['skill.indicators.rsi', 'skill.indicators.macd', 'skill.indicators.bollinger', 'skill.indicators.moving-average']) {
      expect(getExercises(id).some((e) => e.type === 'place_invalidation')).toBe(false);
    }
    const types = new Set(ALL_EXERCISES.map((e) => e.type));
    expect(types).toEqual(
      new Set(['identify_figure', 'order', 'scenario', 'find_error', 'place_invalidation', 'numeric']),
    );
    for (const s of INDICATORS_SKILLS) {
      const kinds = scenarioInteractionTypes(INDICATORS_MODULE_SCENARIOS_BY_SKILL[s.id]);
      expect(kinds.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('le CÔTÉ de chaque placement suit la direction de sa fiche — la cible est recalculée', () => {
    // Le verrou qui compte. Les deux exercices partagent le player `place_invalidation`, mais leur
    // cible est calculée par des mécaniques opposées : `place-invalidation` vise le plus BAS réel
    // de la série, `place-extreme` le plus HAUT. Se tromper de mécanique aurait produit un exercice
    // qui enseigne exactement la faute que la fiche du croisement baissier met en garde.
    const cible = (skillId: string) => {
      const ex = getExercises(skillId).find((e) => e.type === 'place_invalidation');
      expect(ex).toBeDefined();
      if (ex?.type !== 'place_invalidation') throw new Error('placement introuvable');
      const candles = generateCandles(ex.chartSeed, SCENARIO_CANDLE_COUNT);
      return { attendu: ex.validation.targetPrice, bas: lowestLow(candles), haut: highestHigh(candles) };
    };
    // Setup HAUSSIER : l'invalidation est un plancher.
    const haussier = cible('skill.indicators.cross-up');
    expect(haussier.attendu).toBe(haussier.bas);
    expect(haussier.attendu).not.toBe(haussier.haut);
    // Setup BAISSIER : l'invalidation est un plafond.
    const baissier = cible('skill.indicators.cross-down');
    expect(baissier.attendu).toBe(baissier.haut);
    expect(baissier.attendu).not.toBe(baissier.bas);
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

  it('cohérence indicateur : chaque reconnaissance montre un dataset RÉEL et le variant de sa fiche', () => {
    const figures = ALL_EXERCISES.filter((e) => e.type === 'identify_figure');
    expect(figures.length).toBe(7);
    for (const ex of figures) {
      if (ex.type !== 'identify_figure') continue;
      expect(ex.visualType).toBe('indicator');
      expect(VISUAL_DATASETS[ex.datasetKey]).toBeDefined();
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      expect(concept.visualSpec?.datasetKey).toBe(ex.datasetKey);
    }
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Indicateurs', () => {
    expect(isCheckpoint(INDICATORS_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(INDICATORS_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.indicators.')).toBe(true);
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
