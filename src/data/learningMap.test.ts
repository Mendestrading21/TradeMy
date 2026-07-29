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
import { SKILLS, CHECKPOINT_ID } from './seed';
import { CANDLE_SKILLS, CANDLE_CHECKPOINT_ID } from './candleModuleScenarios';
import { STRUCTURE_SKILLS, STRUCTURE_CHECKPOINT_ID } from './structureModuleScenarios';
import { SR_SKILLS, SR_CHECKPOINT_ID } from './srModuleScenarios';

const EMPTY: LearningProgressInput = { completedSkills: [], exploredSlugs: [] };
const WORLD1_DONE: LearningProgressInput = {
  completedSkills: [...SKILLS.map((s) => s.id), CHECKPOINT_ID],
  exploredSlugs: [],
};

const foundations = WORLDS.find((w) => w.id === 'world.foundations')!;

describe('learningMap — hiérarchie unique', () => {
  it('quatre modules guidés : Fondations (1), Chandeliers (3), Structure (4) et Niveaux (5), chacun son checkpoint propre', () => {
    expect(GUIDED_MODULES).toHaveLength(4);
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
    // Chaque monde guidé est reconnu ; les checkpoints sont PROPRES (jamais partagés).
    expect(isGuidedWorld('world.foundations')).toBe(true);
    expect(isGuidedWorld('world.candles')).toBe(true);
    expect(isGuidedWorld('world.structure')).toBe(true);
    expect(isGuidedWorld('world.support-resistance')).toBe(true);
    expect(guidedModulesForWorld('world.foundations')).toHaveLength(1);
    expect(guidedModulesForWorld('world.candles')).toHaveLength(1);
    expect(guidedModulesForWorld('world.structure')).toHaveLength(1);
    expect(guidedModulesForWorld('world.support-resistance')).toHaveLength(1);
    expect(new Set(GUIDED_MODULES.map((m) => m.checkpointId)).size).toBe(4);
    // Les 11 autres mondes restent des collections de notions (aucun module guidé).
    const guidedWorldIds = new Set(GUIDED_MODULES.map((m) => m.worldId));
    expect(WORLDS.filter((w) => !guidedWorldIds.has(w.id))).toHaveLength(11);
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

  it('P0 : un monde de contenu n’est JAMAIS terminé par la seule consultation des fiches', () => {
    const content = WORLDS.find(
      (w) => !isGuidedWorld(w.id) && conceptsByWorld(V5_CONCEPTS, w.id).length > 0,
    )!;
    const slugs = conceptsByWorld(V5_CONCEPTS, content.id).map((c) => c.slug);
    // Toutes les fiches vues → « exploré » (prêt à avancer), mais jamais « terminé ».
    expect(isWorldExplored(content, V5_CONCEPTS, { completedSkills: [], exploredSlugs: slugs })).toBe(true);
    expect(isWorldDone(content, V5_CONCEPTS, { completedSkills: [], exploredSlugs: slugs })).toBe(false);
    // Fiches partiellement vues → même pas exploré.
    expect(isWorldExplored(content, V5_CONCEPTS, { completedSkills: [], exploredSlugs: slugs.slice(0, -1) })).toBe(false);
  });

  it('consulter toutes les fiches d’un monde de contenu = statut « exploré » (pas « terminé »), et débloque la suite', () => {
    const sorted = [...WORLDS].sort((a, b) => a.order - b.order);
    // Monde 1 terminé (checkpoint) + monde 2 (contenu) entièrement consulté.
    const world2 = sorted[1];
    const world2Slugs = conceptsByWorld(V5_CONCEPTS, world2.id).map((c) => c.slug);
    const input: LearningProgressInput = {
      completedSkills: [...SKILLS.map((s) => s.id), CHECKPOINT_ID],
      exploredSlugs: world2Slugs,
    };
    const path = buildLearningPath(WORLDS, V5_CONCEPTS, input);
    const e2 = worldEntryById(path, world2.id)!;
    expect(e2.status).toBe('explored'); // exploré, pas terminé
    expect(e2.mastered).toBe(false); // un monde de contenu ne se maîtrise pas par la lecture
    // Le monde 3 est débloqué (l'exploration permet d'avancer, sans mentir sur « terminé »).
    const e3 = worldEntryById(path, sorted[2].id)!;
    expect(e3.status).not.toBe('locked');
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
