/**
 * LOT 4-M — Incrément A : moteur MULTI-MODULE.
 *
 * Prouve que le checkpoint, la résolution des compétences et `buildWorldMap` sont pilotés par le
 * registre canonique `CONTENT_MODULES` (dont `GUIDED_MODULES` dérive), qu'un checkpoint est PROPRE à
 * son module (aucune dépendance au checkpoint Fondations global), et que le comportement Fondations
 * reste STRICTEMENT identique (non-régression).
 */
import { describe, it, expect } from '@jest/globals';
import {
  CONTENT_MODULES,
  GUIDED_MODULES,
  CHECKPOINT_ID,
  CHECKPOINT_TITLE,
  isCheckpoint,
  checkpointExercises,
  getExercises,
  skillById,
  skillsForModule,
  buildWorldMap,
  SKILLS,
  CANDLE_MODULE_ID,
  CANDLE_CHECKPOINT_ID,
  CANDLE_CHECKPOINT_TITLE,
  CANDLE_SKILLS,
  STRUCTURE_MODULE_ID,
  STRUCTURE_CHECKPOINT_ID,
  STRUCTURE_CHECKPOINT_TITLE,
  SR_MODULE_ID,
  SR_CHECKPOINT_ID,
  SR_CHECKPOINT_TITLE,
  ANATOMY_MODULE_ID,
  ANATOMY_CHECKPOINT_ID,
  ANATOMY_CHECKPOINT_TITLE,
  PATTERNS_MODULE_ID,
  PATTERNS_CHECKPOINT_ID,
  PATTERNS_CHECKPOINT_TITLE,
  INDICATORS_MODULE_ID,
  INDICATORS_CHECKPOINT_ID,
  INDICATORS_CHECKPOINT_TITLE,
  VOLUME_MODULE_ID,
  VOLUME_CHECKPOINT_ID,
  VOLUME_CHECKPOINT_TITLE,
  PRICEACTION_MODULE_ID,
  PRICEACTION_CHECKPOINT_ID,
  PRICEACTION_CHECKPOINT_TITLE,
  RISK_MODULE_ID,
  RISK_CHECKPOINT_ID,
  RISK_CHECKPOINT_TITLE,
  PSYCHOLOGY_MODULE_ID,
  PSYCHOLOGY_CHECKPOINT_ID,
  PSYCHOLOGY_CHECKPOINT_TITLE,
} from '@/data';
import type { ProgressState } from './repositories';
import type { Skill } from '../engines/learning';
import { initialProgress } from '../engines/learning';

const T0 = 1_700_000_000_000;
function state(completedSkills: string[] = [], skillIds: string[] = []): ProgressState {
  const skills = Object.fromEntries(skillIds.map((id) => [id, initialProgress(id, T0)]));
  return {
    onboarded: true, level: 1, totalXp: 0, streakDays: 0, coins: 0,
    completedSkills, skills, daily: { date: '', sessions: 0, correct: 0, xp: 0 },
    claimedQuestIds: [], claimedStreakMilestones: [], history: [], learning: undefined,
    schemaVersion: 8,
  };
}

describe('LOT 4-M — moteur multi-module (registre canonique)', () => {
  it('GUIDED_MODULES dérive EXACTEMENT de CONTENT_MODULES (source unique, aucune 2e vérité)', () => {
    expect(GUIDED_MODULES).toHaveLength(CONTENT_MODULES.length);
    for (const m of CONTENT_MODULES) {
      const g = GUIDED_MODULES.find((x) => x.id === m.id)!;
      expect(g).toBeDefined();
      expect(g.title).toBe(m.title);
      expect(g.worldId).toBe(m.worldId);
      expect(g.checkpointId).toBe(m.checkpointId);
      expect(g.skillIds).toEqual(m.skills.map((s) => s.id));
    }
    // Chaque checkpoint est PROPRE à son module (aucun partage entre modules).
    const cps = CONTENT_MODULES.map((m) => m.checkpointId);
    expect(new Set(cps).size).toBe(cps.length);
  });

  it('non-régression Fondations : checkpoint reconnu, agrégé, titré comme avant', () => {
    expect(isCheckpoint(CHECKPOINT_ID)).toBe(true);
    expect(skillById(CHECKPOINT_ID)).toEqual({ id: CHECKPOINT_ID, name: CHECKPOINT_TITLE });
    // getExercises(checkpoint) agrège 2 exercices par compétence Fondations (comportement historique).
    const agg = getExercises(CHECKPOINT_ID);
    expect(agg.length).toBeGreaterThan(0);
    expect(agg.length).toBeLessThanOrEqual(SKILLS.length * 2);
    // checkpointExercises tourne avec le round et reste non vide.
    expect(checkpointExercises(CHECKPOINT_ID, 0, 2).length).toBeGreaterThan(0);
    expect(skillsForModule('module.foundations.read-chart').map((s) => s.id)).toEqual(SKILLS.map((s) => s.id));
  });

  it('id inconnu : jamais un checkpoint, aucun repli silencieux', () => {
    expect(isCheckpoint('checkpoint.inconnu')).toBe(false);
    expect(checkpointExercises('checkpoint.inconnu')).toEqual([]);
    expect(skillById('skill.inconnu')).toBeUndefined();
    expect(skillsForModule('module.inconnu')).toEqual([]);
  });

  it('buildWorldMap : checkpoint PARAMÉTRÉ, indépendant du checkpoint Fondations', () => {
    const skills: Skill[] = [
      { id: 'skill.x1', name: 'X1', description: '' },
      { id: 'skill.x2', name: 'X2', description: '' },
    ];
    const CP = 'checkpoint.x';
    // Toutes les compétences X faites, mais le checkpoint X n'est PAS validé → checkpoint « current ».
    const m = buildWorldMap(state(['skill.x1', 'skill.x2'], ['skill.x1', 'skill.x2']), skills, 'Module X', T0, {
      checkpointId: CP,
      checkpointTitle: 'Revue X',
      worldTitle: 'Monde 3 · Chandeliers',
    });
    const cpNode = m.nodes.find((n) => n.kind === 'checkpoint')!;
    expect(cpNode.id).toBe(CP);
    expect(cpNode.title).toBe('Revue X');
    expect(cpNode.status).toBe('current');
    expect(m.worldTitle).toBe('Monde 3 · Chandeliers');
    // Le checkpoint Fondations validé n'affecte PAS le checkpoint X (indépendance).
    const m2 = buildWorldMap(state(['skill.x1', 'skill.x2', CHECKPOINT_ID], ['skill.x1', 'skill.x2']), skills, 'Module X', T0, { checkpointId: CP });
    expect(m2.nodes.find((n) => n.kind === 'checkpoint')!.status).toBe('current');
    // Le checkpoint X validé → « done ».
    const m3 = buildWorldMap(state(['skill.x1', 'skill.x2', CP], ['skill.x1', 'skill.x2']), skills, 'Module X', T0, { checkpointId: CP });
    expect(m3.nodes.find((n) => n.kind === 'checkpoint')!.status).toBe('done');
  });

  it('buildWorldMap sans options = Fondations (non-régression stricte)', () => {
    const m = buildWorldMap(state([], SKILLS.map((s) => s.id)), SKILLS, 'Lire un graphique', T0);
    const cpNode = m.nodes.find((n) => n.kind === 'checkpoint')!;
    expect(cpNode.id).toBe(CHECKPOINT_ID);
    expect(cpNode.title).toBe(CHECKPOINT_TITLE);
    expect(m.worldTitle).toBe('Monde 1 · Fondations');
  });

  it('module RÉEL Chandeliers : 2e module, checkpoint PROPRE résolu par le moteur (indépendant de Fondations)', () => {
    // Un 2e module guidé réel existe, avec un checkpoint distinct de celui de Fondations.
    expect(CONTENT_MODULES.map((m) => m.id)).toEqual(['module.foundations.read-chart', CANDLE_MODULE_ID, STRUCTURE_MODULE_ID, SR_MODULE_ID, ANATOMY_MODULE_ID, PATTERNS_MODULE_ID, INDICATORS_MODULE_ID, VOLUME_MODULE_ID, PRICEACTION_MODULE_ID, RISK_MODULE_ID, PSYCHOLOGY_MODULE_ID]);
    expect(isCheckpoint(CANDLE_CHECKPOINT_ID)).toBe(true);
    expect(CANDLE_CHECKPOINT_ID).not.toBe(CHECKPOINT_ID);
    expect(skillById(CANDLE_CHECKPOINT_ID)).toEqual({ id: CANDLE_CHECKPOINT_ID, name: CANDLE_CHECKPOINT_TITLE });
    // La revue Chandeliers agrège des exercices des compétences du module (skillId réel conservé).
    const cp = checkpointExercises(CANDLE_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    expect(cp.every((e) => e.skillId.startsWith('skill.candle.'))).toBe(true);
    expect(skillsForModule(CANDLE_MODULE_ID).map((s) => s.id)).toEqual(CANDLE_SKILLS.map((s) => s.id));
    // Le checkpoint Fondations validé n'affecte PAS le module Chandeliers (indépendance).
    expect(checkpointExercises(CHECKPOINT_ID, 0, 2).every((e) => e.skillId.startsWith('skill.candle.'))).toBe(false);
  });

  it('module RÉEL Structure (LOT 4-N) : 3e module, checkpoint PROPRE, indépendant des deux autres', () => {
    expect(isCheckpoint(STRUCTURE_CHECKPOINT_ID)).toBe(true);
    expect(STRUCTURE_CHECKPOINT_ID).not.toBe(CHECKPOINT_ID);
    expect(STRUCTURE_CHECKPOINT_ID).not.toBe(CANDLE_CHECKPOINT_ID);
    expect(skillById(STRUCTURE_CHECKPOINT_ID)).toEqual({ id: STRUCTURE_CHECKPOINT_ID, name: STRUCTURE_CHECKPOINT_TITLE });
    // La revue Structure agrège des exercices des compétences du module (skillId réel conservé).
    const cp = checkpointExercises(STRUCTURE_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    expect(cp.every((e) => e.skillId.startsWith('skill.structure.'))).toBe(true);
    // Les checkpoints des autres modules ne « fuient » pas dans celui-ci.
    expect(checkpointExercises(CANDLE_CHECKPOINT_ID, 0, 2).every((e) => e.skillId.startsWith('skill.structure.'))).toBe(false);
  });

  it('module RÉEL Niveaux (LOT 4-O) : 4e module (3 compétences), checkpoint PROPRE et indépendant', () => {
    expect(isCheckpoint(SR_CHECKPOINT_ID)).toBe(true);
    expect(new Set([CHECKPOINT_ID, CANDLE_CHECKPOINT_ID, STRUCTURE_CHECKPOINT_ID, SR_CHECKPOINT_ID]).size).toBe(4);
    expect(skillById(SR_CHECKPOINT_ID)).toEqual({ id: SR_CHECKPOINT_ID, name: SR_CHECKPOINT_TITLE });
    const cp = checkpointExercises(SR_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    expect(cp.every((e) => e.skillId.startsWith('skill.sr.'))).toBe(true);
  });

  it('module RÉEL Anatomie (LOT 4-P) : 5e module (3 compétences), checkpoint PROPRE et indépendant', () => {
    expect(isCheckpoint(ANATOMY_CHECKPOINT_ID)).toBe(true);
    expect(new Set([CHECKPOINT_ID, CANDLE_CHECKPOINT_ID, STRUCTURE_CHECKPOINT_ID, SR_CHECKPOINT_ID, ANATOMY_CHECKPOINT_ID]).size).toBe(5);
    expect(skillById(ANATOMY_CHECKPOINT_ID)).toEqual({ id: ANATOMY_CHECKPOINT_ID, name: ANATOMY_CHECKPOINT_TITLE });
    const cp = checkpointExercises(ANATOMY_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    expect(cp.every((e) => e.skillId.startsWith('skill.anatomy.'))).toBe(true);
  });

  it('module RÉEL Figures (LOT 4-Q) : 6e module, checkpoint PROPRE, distinct du skill.patterns Fondations', () => {
    expect(isCheckpoint(PATTERNS_CHECKPOINT_ID)).toBe(true);
    expect(skillById(PATTERNS_CHECKPOINT_ID)).toEqual({ id: PATTERNS_CHECKPOINT_ID, name: PATTERNS_CHECKPOINT_TITLE });
    const cp = checkpointExercises(PATTERNS_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    // Compétences du MODULE (skill.patterns.*), jamais l'ancien skill Fondations `skill.patterns`.
    expect(cp.every((e) => e.skillId.startsWith('skill.patterns.'))).toBe(true);
    expect(cp.some((e) => e.skillId === 'skill.patterns')).toBe(false);
  });

  it('module RÉEL Indicateurs (LOT 4-R) : 7e module, checkpoint PROPRE et indépendant', () => {
    expect(isCheckpoint(INDICATORS_CHECKPOINT_ID)).toBe(true);
    expect(
      new Set([CHECKPOINT_ID, CANDLE_CHECKPOINT_ID, STRUCTURE_CHECKPOINT_ID, SR_CHECKPOINT_ID, ANATOMY_CHECKPOINT_ID, PATTERNS_CHECKPOINT_ID, INDICATORS_CHECKPOINT_ID]).size,
    ).toBe(7);
    expect(skillById(INDICATORS_CHECKPOINT_ID)).toEqual({ id: INDICATORS_CHECKPOINT_ID, name: INDICATORS_CHECKPOINT_TITLE });
    const cp = checkpointExercises(INDICATORS_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    expect(cp.every((e) => e.skillId.startsWith('skill.indicators.'))).toBe(true);
  });

  it('module RÉEL Volume (LOT 4-S) : 8e module (3 compétences), checkpoint PROPRE et indépendant', () => {
    expect(isCheckpoint(VOLUME_CHECKPOINT_ID)).toBe(true);
    expect(
      new Set([CHECKPOINT_ID, CANDLE_CHECKPOINT_ID, STRUCTURE_CHECKPOINT_ID, SR_CHECKPOINT_ID, ANATOMY_CHECKPOINT_ID, PATTERNS_CHECKPOINT_ID, INDICATORS_CHECKPOINT_ID, VOLUME_CHECKPOINT_ID]).size,
    ).toBe(8);
    expect(skillById(VOLUME_CHECKPOINT_ID)).toEqual({ id: VOLUME_CHECKPOINT_ID, name: VOLUME_CHECKPOINT_TITLE });
    const cp = checkpointExercises(VOLUME_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    expect(cp.every((e) => e.skillId.startsWith('skill.volume.'))).toBe(true);
  });

  it('module RÉEL Price action (LOT 4-T) : 9e module (3 compétences), checkpoint PROPRE et indépendant', () => {
    expect(isCheckpoint(PRICEACTION_CHECKPOINT_ID)).toBe(true);
    expect(
      new Set([CHECKPOINT_ID, CANDLE_CHECKPOINT_ID, STRUCTURE_CHECKPOINT_ID, SR_CHECKPOINT_ID, ANATOMY_CHECKPOINT_ID, PATTERNS_CHECKPOINT_ID, INDICATORS_CHECKPOINT_ID, VOLUME_CHECKPOINT_ID, PRICEACTION_CHECKPOINT_ID]).size,
    ).toBe(9);
    expect(skillById(PRICEACTION_CHECKPOINT_ID)).toEqual({ id: PRICEACTION_CHECKPOINT_ID, name: PRICEACTION_CHECKPOINT_TITLE });
    const cp = checkpointExercises(PRICEACTION_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    expect(cp.every((e) => e.skillId.startsWith('skill.priceaction.'))).toBe(true);
  });

  it('module RÉEL Risk (LOT 4-U) : 10e module (3 compétences), checkpoint PROPRE et indépendant', () => {
    expect(isCheckpoint(RISK_CHECKPOINT_ID)).toBe(true);
    expect(
      new Set([CHECKPOINT_ID, CANDLE_CHECKPOINT_ID, STRUCTURE_CHECKPOINT_ID, SR_CHECKPOINT_ID, ANATOMY_CHECKPOINT_ID, PATTERNS_CHECKPOINT_ID, INDICATORS_CHECKPOINT_ID, VOLUME_CHECKPOINT_ID, PRICEACTION_CHECKPOINT_ID, RISK_CHECKPOINT_ID]).size,
    ).toBe(10);
    expect(skillById(RISK_CHECKPOINT_ID)).toEqual({ id: RISK_CHECKPOINT_ID, name: RISK_CHECKPOINT_TITLE });
    const cp = checkpointExercises(RISK_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    expect(cp.every((e) => e.skillId.startsWith('skill.risk.'))).toBe(true);
  });

  it('module RÉEL Psychologie (LOT 4-V) : 11e module (2 compétences), checkpoint PROPRE et indépendant', () => {
    expect(isCheckpoint(PSYCHOLOGY_CHECKPOINT_ID)).toBe(true);
    expect(
      new Set([CHECKPOINT_ID, CANDLE_CHECKPOINT_ID, STRUCTURE_CHECKPOINT_ID, SR_CHECKPOINT_ID, ANATOMY_CHECKPOINT_ID, PATTERNS_CHECKPOINT_ID, INDICATORS_CHECKPOINT_ID, VOLUME_CHECKPOINT_ID, PRICEACTION_CHECKPOINT_ID, RISK_CHECKPOINT_ID, PSYCHOLOGY_CHECKPOINT_ID]).size,
    ).toBe(11);
    expect(skillById(PSYCHOLOGY_CHECKPOINT_ID)).toEqual({ id: PSYCHOLOGY_CHECKPOINT_ID, name: PSYCHOLOGY_CHECKPOINT_TITLE });
    const cp = checkpointExercises(PSYCHOLOGY_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    expect(cp.every((e) => e.skillId.startsWith('skill.psychology.'))).toBe(true);
  });
});
