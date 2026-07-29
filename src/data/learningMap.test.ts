import { describe, it, expect } from '@jest/globals';
import {
  GUIDED_MODULES,
  isGuidedWorld,
  guidedModulesForWorld,
  isWorldDone,
  isWorldExplored,
  buildLearningPath,
  worldsOpen,
  worldsDone,
  worldEntryById,
  LEVEL_BANDS,
  levelBandForOrder,
  type LearningProgressInput,
} from './learningMap';
import { WORLDS, conceptsByWorld } from './learningConcept';
import { V5_CONCEPTS } from './learningContent';
import { SKILLS, CHECKPOINT_ID, CONTENT_MODULES } from './seed';
import { CANDLE_SKILLS, CANDLE_CHECKPOINT_ID } from './candleModuleScenarios';
import { STRUCTURE_SKILLS, STRUCTURE_CHECKPOINT_ID } from './structureModuleScenarios';
import { SR_SKILLS, SR_CHECKPOINT_ID } from './srModuleScenarios';
import { ANATOMY_SKILLS, ANATOMY_CHECKPOINT_ID } from './anatomyModuleScenarios';
import { PATTERNS_SKILLS, PATTERNS_CHECKPOINT_ID } from './patternsModuleScenarios';
import { INDICATORS_SKILLS, INDICATORS_CHECKPOINT_ID } from './indicatorsModuleScenarios';
import { VOLUME_SKILLS, VOLUME_CHECKPOINT_ID } from './volumeModuleScenarios';
import { PRICEACTION_SKILLS, PRICEACTION_CHECKPOINT_ID } from './priceActionModuleScenarios';
import { RISK_SKILLS, RISK_CHECKPOINT_ID } from './riskModuleScenarios';
import { PSYCHOLOGY_SKILLS, PSYCHOLOGY_CHECKPOINT_ID } from './psychologyModuleScenarios';
import { SMC_SKILLS, SMC_CHECKPOINT_ID } from './smcModuleScenarios';
import { WYCKOFF_SKILLS, WYCKOFF_CHECKPOINT_ID } from './wyckoffModuleScenarios';
import { OPTIONS_SKILLS, OPTIONS_CHECKPOINT_ID } from './optionsModuleScenarios';
import { FALSESIGNALS_SKILLS, FALSESIGNALS_CHECKPOINT_ID } from './falseSignalsModuleScenarios';

const EMPTY: LearningProgressInput = { completedSkills: [], exploredSlugs: [] };
const WORLD1_DONE: LearningProgressInput = {
  completedSkills: [...SKILLS.map((s) => s.id), CHECKPOINT_ID],
  exploredSlugs: [],
};

const foundations = WORLDS.find((w) => w.id === 'world.foundations')!;

describe('learningMap — hiérarchie unique', () => {
  it('quinze modules guidés : Fondations (1), Anatomie (2), Chandeliers (3), Structure (4), Niveaux (5), Figures (6), Indicateurs (7), Volume (8), Price action (9), Risk (10), Psychologie (11), SMC (12), Wyckoff (13), Options (14) et Faux signaux (15), chacun son checkpoint propre', () => {
    expect(GUIDED_MODULES).toHaveLength(15);
    const foundationsModule = GUIDED_MODULES.find((m) => m.worldId === 'world.foundations')!;
    expect(foundationsModule).toBeDefined();
    expect(foundationsModule.skillIds).toEqual(SKILLS.map((s) => s.id));
    expect(foundationsModule.checkpointId).toBe(CHECKPOINT_ID);
    const candlesModule = GUIDED_MODULES.find((m) => m.worldId === 'world.candles')!;
    expect(candlesModule).toBeDefined();
    expect(candlesModule.skillIds).toEqual(CANDLE_SKILLS.map((s) => s.id));
    expect(candlesModule.checkpointId).toBe(CANDLE_CHECKPOINT_ID);
    const structureModule = GUIDED_MODULES.find((m) => m.worldId === 'world.structure')!;
    expect(structureModule).toBeDefined();
    expect(structureModule.skillIds).toEqual(STRUCTURE_SKILLS.map((s) => s.id));
    expect(structureModule.checkpointId).toBe(STRUCTURE_CHECKPOINT_ID);
    const srModule = GUIDED_MODULES.find((m) => m.worldId === 'world.support-resistance')!;
    expect(srModule).toBeDefined();
    expect(srModule.skillIds).toEqual(SR_SKILLS.map((s) => s.id));
    expect(srModule.checkpointId).toBe(SR_CHECKPOINT_ID);
    const anatomyModule = GUIDED_MODULES.find((m) => m.worldId === 'world.anatomy')!;
    expect(anatomyModule).toBeDefined();
    expect(anatomyModule.skillIds).toEqual(ANATOMY_SKILLS.map((s) => s.id));
    expect(anatomyModule.checkpointId).toBe(ANATOMY_CHECKPOINT_ID);
    const patternsModule = GUIDED_MODULES.find((m) => m.worldId === 'world.patterns')!;
    expect(patternsModule).toBeDefined();
    expect(patternsModule.skillIds).toEqual(PATTERNS_SKILLS.map((s) => s.id));
    expect(patternsModule.checkpointId).toBe(PATTERNS_CHECKPOINT_ID);
    const indicatorsModule = GUIDED_MODULES.find((m) => m.worldId === 'world.indicators')!;
    expect(indicatorsModule).toBeDefined();
    expect(indicatorsModule.skillIds).toEqual(INDICATORS_SKILLS.map((s) => s.id));
    expect(indicatorsModule.checkpointId).toBe(INDICATORS_CHECKPOINT_ID);
    const volumeModule = GUIDED_MODULES.find((m) => m.worldId === 'world.volume')!;
    expect(volumeModule).toBeDefined();
    expect(volumeModule.skillIds).toEqual(VOLUME_SKILLS.map((s) => s.id));
    expect(volumeModule.checkpointId).toBe(VOLUME_CHECKPOINT_ID);
    const priceActionModule = GUIDED_MODULES.find((m) => m.worldId === 'world.price-action')!;
    expect(priceActionModule).toBeDefined();
    expect(priceActionModule.skillIds).toEqual(PRICEACTION_SKILLS.map((s) => s.id));
    expect(priceActionModule.checkpointId).toBe(PRICEACTION_CHECKPOINT_ID);
    const riskModule = GUIDED_MODULES.find((m) => m.worldId === 'world.risk')!;
    expect(riskModule).toBeDefined();
    expect(riskModule.skillIds).toEqual(RISK_SKILLS.map((s) => s.id));
    expect(riskModule.checkpointId).toBe(RISK_CHECKPOINT_ID);
    const psychologyModule = GUIDED_MODULES.find((m) => m.worldId === 'world.psychology')!;
    expect(psychologyModule).toBeDefined();
    expect(psychologyModule.skillIds).toEqual(PSYCHOLOGY_SKILLS.map((s) => s.id));
    expect(psychologyModule.checkpointId).toBe(PSYCHOLOGY_CHECKPOINT_ID);
    const smcModule = GUIDED_MODULES.find((m) => m.worldId === 'world.smc')!;
    expect(smcModule).toBeDefined();
    expect(smcModule.skillIds).toEqual(SMC_SKILLS.map((s) => s.id));
    expect(smcModule.checkpointId).toBe(SMC_CHECKPOINT_ID);
    const wyckoffModule = GUIDED_MODULES.find((m) => m.worldId === 'world.wyckoff')!;
    expect(wyckoffModule).toBeDefined();
    expect(wyckoffModule.skillIds).toEqual(WYCKOFF_SKILLS.map((s) => s.id));
    expect(wyckoffModule.checkpointId).toBe(WYCKOFF_CHECKPOINT_ID);
    const optionsModule = GUIDED_MODULES.find((m) => m.worldId === 'world.options')!;
    expect(optionsModule).toBeDefined();
    expect(optionsModule.skillIds).toEqual(OPTIONS_SKILLS.map((s) => s.id));
    expect(optionsModule.checkpointId).toBe(OPTIONS_CHECKPOINT_ID);
    const falseSignalsModule = GUIDED_MODULES.find((m) => m.worldId === 'world.false-signals')!;
    expect(falseSignalsModule).toBeDefined();
    expect(falseSignalsModule.skillIds).toEqual(FALSESIGNALS_SKILLS.map((s) => s.id));
    expect(falseSignalsModule.checkpointId).toBe(FALSESIGNALS_CHECKPOINT_ID);
    // Chaque monde guidé est reconnu ; les checkpoints sont PROPRES (jamais partagés).
    expect(isGuidedWorld('world.foundations')).toBe(true);
    expect(isGuidedWorld('world.candles')).toBe(true);
    expect(isGuidedWorld('world.structure')).toBe(true);
    expect(isGuidedWorld('world.support-resistance')).toBe(true);
    expect(isGuidedWorld('world.anatomy')).toBe(true);
    expect(isGuidedWorld('world.patterns')).toBe(true);
    expect(isGuidedWorld('world.indicators')).toBe(true);
    expect(isGuidedWorld('world.volume')).toBe(true);
    expect(isGuidedWorld('world.price-action')).toBe(true);
    expect(isGuidedWorld('world.risk')).toBe(true);
    expect(isGuidedWorld('world.psychology')).toBe(true);
    expect(isGuidedWorld('world.smc')).toBe(true);
    expect(isGuidedWorld('world.wyckoff')).toBe(true);
    expect(isGuidedWorld('world.options')).toBe(true);
    expect(isGuidedWorld('world.false-signals')).toBe(true);
    for (const wid of ['world.foundations', 'world.anatomy', 'world.candles', 'world.structure', 'world.support-resistance', 'world.patterns', 'world.indicators', 'world.volume', 'world.price-action', 'world.risk', 'world.psychology', 'world.smc', 'world.wyckoff', 'world.options', 'world.false-signals']) {
      expect(guidedModulesForWorld(wid)).toHaveLength(1);
    }
    expect(new Set(GUIDED_MODULES.map((m) => m.checkpointId)).size).toBe(15);
    // 15/15 : PLUS AUCUN monde de contenu — le parcours entier est guidé.
    const guidedWorldIds = new Set(GUIDED_MODULES.map((m) => m.worldId));
    expect(WORLDS.filter((w) => !guidedWorldIds.has(w.id))).toHaveLength(0);
    // Les mondes guidés couvrent TOUT le parcours (ordres 1..15) — la progression reste linéaire.
    const guidedOrders = WORLDS.filter((w) => guidedWorldIds.has(w.id)).map((w) => w.order).sort((a, b) => a - b);
    expect(guidedOrders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('nouvel utilisateur : seul le monde 1 est ouvert (en cours), le reste verrouillé', () => {
    const path = buildLearningPath(WORLDS, V5_CONCEPTS, EMPTY);
    expect(path).toHaveLength(WORLDS.length);
    const first = worldEntryById(path, 'world.foundations')!;
    expect(first.status).toBe('current');
    expect(first.guided).toBe(true);
    expect(worldsOpen(path)).toBe(1);
    expect(worldsDone(path)).toBe(0);
    const others = path.filter((e) => e.world.id !== 'world.foundations');
    expect(others.every((e) => e.status === 'locked')).toBe(true);
    expect(others.every((e) => typeof e.lockReason === 'string')).toBe(true);
  });

  it('checkpoint du monde 1 validé → monde 1 terminé, monde 2 ouvert', () => {
    const path = buildLearningPath(WORLDS, V5_CONCEPTS, WORLD1_DONE);
    const first = worldEntryById(path, 'world.foundations')!;
    expect(first.status).toBe('done');
    expect(first.progress).toBe(1);
    expect(worldsOpen(path)).toBeGreaterThanOrEqual(2);
    const second = [...path].sort((a, b) => a.world.order - b.world.order)[1];
    expect(second.status === 'current' || second.status === 'unlocked').toBe(true);
  });

  it('P0 (LOT 4-Z) : PLUS AUCUN monde de contenu — la consultation seule ne termine JAMAIS un monde', () => {
    // 15/15 : chaque monde est guidé — aucun monde ne peut être « terminé » par la lecture des fiches.
    expect(WORLDS.every((w) => isGuidedWorld(w.id))).toBe(true);
    for (const w of WORLDS) {
      const slugs = conceptsByWorld(V5_CONCEPTS, w.id).map((c) => c.slug);
      expect(isWorldDone(w, V5_CONCEPTS, { completedSkills: [], exploredSlugs: slugs })).toBe(false);
      // Un monde guidé n'est pas non plus « exploré » par la seule visite : la preuve prime.
      expect(isWorldExplored(w, V5_CONCEPTS, { completedSkills: [], exploredSlugs: slugs })).toBe(false);
    }
  });

  it('parcours entièrement guidé : tous les modules validés → les 15 mondes sont terminés (aucune impasse)', () => {
    const guidedDone = CONTENT_MODULES.flatMap((m) => [...m.skills.map((s) => s.id), m.checkpointId]);
    const input: LearningProgressInput = { completedSkills: guidedDone, exploredSlugs: [] };
    const path = buildLearningPath(WORLDS, V5_CONCEPTS, input);
    expect(worldsDone(path)).toBe(WORLDS.length);
    for (const w of WORLDS) expect(worldEntryById(path, w.id)!.status).toBe('done');
  });

  it('la visite seule ne valide jamais le monde guidé (maîtrise ≠ visite)', () => {
    const slugs = conceptsByWorld(V5_CONCEPTS, 'world.foundations').map((c) => c.slug);
    // Explorer toutes les fiches du monde 1 ne suffit pas : il faut le checkpoint.
    expect(isWorldDone(foundations, V5_CONCEPTS, { completedSkills: [], exploredSlugs: slugs })).toBe(false);
    expect(isWorldExplored(foundations, V5_CONCEPTS, { completedSkills: [], exploredSlugs: slugs })).toBe(false);
  });
});

describe('learningMap — niveaux & maîtrise', () => {
  it('trois bandes de niveau couvrent les 15 mondes', () => {
    expect(LEVEL_BANDS.map((b) => b.band)).toEqual(['debutant', 'intermediaire', 'avance']);
    const covered = LEVEL_BANDS.reduce((n, b) => n + (b.maxOrder - b.minOrder + 1), 0);
    expect(covered).toBe(WORLDS.length);
    expect(levelBandForOrder(1).band).toBe('debutant');
    expect(levelBandForOrder(5).band).toBe('debutant');
    expect(levelBandForOrder(6).band).toBe('intermediaire');
    expect(levelBandForOrder(10).band).toBe('intermediaire');
    expect(levelBandForOrder(11).band).toBe('avance');
    expect(levelBandForOrder(15).band).toBe('avance');
  });

  it('un monde n’est « maîtrisé » que s’il est terminé ET ses fiches maîtrisées', () => {
    const fSlugs = conceptsByWorld(V5_CONCEPTS, 'world.foundations').map((c) => c.slug);
    expect(fSlugs.length).toBeGreaterThan(0);

    // Terminé (checkpoint) mais aucune maîtrise déclarée → non maîtrisé.
    const doneOnly = buildLearningPath(WORLDS, V5_CONCEPTS, WORLD1_DONE);
    const feDone = worldEntryById(doneOnly, 'world.foundations')!;
    expect(feDone.status).toBe('done');
    expect(feDone.mastered).toBe(false);

    // Terminé ET toutes les fiches maîtrisées → maîtrisé.
    const mastered = buildLearningPath(WORLDS, V5_CONCEPTS, { ...WORLD1_DONE, masteredSlugs: fSlugs });
    expect(worldEntryById(mastered, 'world.foundations')!.mastered).toBe(true);
  });
});
