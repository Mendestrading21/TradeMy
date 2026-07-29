/**
 * Carte d'apprentissage — hiérarchie UNIQUE (pure, testable) : Monde → Module → Compétence.
 *
 * Learning-Master Lot 2 : remplace la concurrence entre le trail pilote (4 compétences) et la carte
 * « on-view » des 15 mondes. Le monde 1 (Fondations) accueille le module guidé « Lire un graphique »
 * (les 4 compétences pilotes + le checkpoint). Les autres mondes exposent leurs concepts jusqu'à ce
 * qu'un module guidé leur soit ajouté (Lots 4/10).
 *
 * Déblocage fondé sur la PROGRESSION, pas seulement la visite. P0 : consulter les fiches d'un monde
 * de contenu le marque « exploré » (assez pour avancer vers le monde suivant), mais JAMAIS
 * « terminé » — « terminé » exige une preuve d'apprentissage (checkpoint d'un module guidé). Un monde
 * de contenu sans pratique n'est donc jamais « terminé » par la seule lecture. Le monde N s'ouvre
 * quand le monde N-1 est exploré (contenu) ou terminé (guidé). Tout est dérivé de l'état déjà
 * persisté (`completedSkills` + `learning.conceptsExplored`) → aucune migration.
 */
import {
  conceptsByWorld,
  type World,
  type LearningConcept,
  type VisualSpec,
} from './learningConcept';
import { CONTENT_MODULES } from './seed';

/** Un module guidé = une suite ordonnée de compétences validée par un checkpoint. */
export interface GuidedModule {
  id: string;
  title: string;
  worldId: string;
  /** Compétences du module, dans l'ordre. */
  skillIds: string[];
  /** Checkpoint de fin de module (revue mixte). */
  checkpointId: string;
}

/**
 * Modules guidés DÉRIVÉS du registre canonique unique `CONTENT_MODULES` (seed) : aucune seconde
 * source de vérité. Ajouter un module guidé = ajouter une entrée dans `CONTENT_MODULES`.
 */
export const GUIDED_MODULES: GuidedModule[] = CONTENT_MODULES.map((m) => ({
  id: m.id,
  title: m.title,
  worldId: m.worldId,
  skillIds: m.skills.map((s) => s.id),
  checkpointId: m.checkpointId,
}));

export function guidedModulesForWorld(worldId: string): GuidedModule[] {
  return GUIDED_MODULES.filter((m) => m.worldId === worldId);
}

export function isGuidedWorld(worldId: string): boolean {
  return guidedModulesForWorld(worldId).length > 0;
}

/** Niveaux du parcours (canon Trademy) : les 15 mondes en trois bandes de cinq. */
export type LevelBand = 'debutant' | 'intermediaire' | 'avance';

export interface LevelBandDef {
  band: LevelBand;
  label: string;
  minOrder: number;
  maxOrder: number;
}

export const LEVEL_BANDS: LevelBandDef[] = [
  { band: 'debutant', label: 'Débutant', minOrder: 1, maxOrder: 5 },
  { band: 'intermediaire', label: 'Intermédiaire', minOrder: 6, maxOrder: 10 },
  { band: 'avance', label: 'Avancé', minOrder: 11, maxOrder: 15 },
];

/** Bande de niveau d'un monde d'après son ordre (le dernier palier capte les ordres élevés). */
export function levelBandForOrder(order: number): LevelBandDef {
  return (
    LEVEL_BANDS.find((b) => order >= b.minOrder && order <= b.maxOrder) ??
    LEVEL_BANDS[LEVEL_BANDS.length - 1]
  );
}

export type WorldStatus = 'done' | 'explored' | 'current' | 'unlocked' | 'locked';

/** Progression dérivée d'un monde dans le chemin unique. */
export interface WorldEntry {
  world: World;
  guided: boolean;
  conceptCount: number;
  exploredCount: number;
  /** 0–1. Monde guidé : (compétences validées + checkpoint) / (compétences + 1). Contenu : explorés/total. */
  progress: number;
  status: WorldStatus;
  /** Terminé ET toutes les fiches du monde maîtrisées (compétence liée solide). */
  mastered: boolean;
  /** Un visuel représentatif (signal visuel du nœud). */
  sampleSpec?: VisualSpec;
  /** Raison du verrou (écran détail). */
  lockReason?: string;
}

/** Entrées de progression nécessaires (sous-ensemble de `ProgressState`), pour rester pur/testable. */
export interface LearningProgressInput {
  completedSkills: string[];
  exploredSlugs: string[];
  /** Slugs de concepts maîtrisés (compétence liée solide) — pour l'état « maîtrisé » d'un monde. */
  masteredSlugs?: string[];
}

/**
 * TERMINÉ = preuve d'apprentissage, jamais la simple consultation.
 * Monde guidé : son checkpoint est validé. Monde de contenu (sans module guidé) :
 * jamais « terminé » par la seule lecture des fiches — au mieux « exploré »
 * (voir `isWorldExplored`). Empêche qu'un monde soit terminé en ouvrant les fiches.
 */
export function isWorldDone(
  world: World,
  _concepts: LearningConcept[],
  input: LearningProgressInput,
): boolean {
  const modules = guidedModulesForWorld(world.id);
  if (modules.length > 0) {
    return modules.every((m) => input.completedSkills.includes(m.checkpointId));
  }
  return false;
}

/**
 * EXPLORÉ / prêt à avancer : assez de progression pour ouvrir le monde suivant.
 * Monde guidé : identique à « terminé » (le checkpoint reste requis). Monde de
 * contenu : toutes les fiches consultées. La consultation permet donc d'avancer,
 * mais ne vaut jamais « terminé ».
 */
export function isWorldExplored(
  world: World,
  concepts: LearningConcept[],
  input: LearningProgressInput,
): boolean {
  if (isGuidedWorld(world.id)) return isWorldDone(world, concepts, input);
  const cs = conceptsByWorld(concepts, world.id);
  if (cs.length === 0) return false;
  const explored = new Set(input.exploredSlugs);
  return cs.every((c) => explored.has(c.slug));
}

function worldProgress(
  world: World,
  concepts: LearningConcept[],
  input: LearningProgressInput,
): { progress: number; conceptCount: number; exploredCount: number } {
  const cs = conceptsByWorld(concepts, world.id);
  const explored = new Set(input.exploredSlugs);
  const exploredCount = cs.filter((c) => explored.has(c.slug)).length;
  const modules = guidedModulesForWorld(world.id);
  if (modules.length > 0) {
    const skillIds = modules.flatMap((m) => m.skillIds);
    const doneSkills = skillIds.filter((id) => input.completedSkills.includes(id)).length;
    const checkpoints = modules.length;
    const doneCheckpoints = modules.filter((m) => input.completedSkills.includes(m.checkpointId)).length;
    const total = skillIds.length + checkpoints;
    const progress = total > 0 ? (doneSkills + doneCheckpoints) / total : 0;
    return { progress, conceptCount: cs.length, exploredCount };
  }
  return {
    progress: cs.length > 0 ? exploredCount / cs.length : 0,
    conceptCount: cs.length,
    exploredCount,
  };
}

/**
 * Construit le chemin unique. Monde 1 ouvert ; monde N ouvert seulement si le monde N-1 est terminé.
 * Le premier monde ouvert non terminé est « en cours ».
 */
export function buildLearningPath(
  worlds: World[],
  concepts: LearningConcept[],
  input: LearningProgressInput,
): WorldEntry[] {
  const sorted = [...worlds].sort((a, b) => a.order - b.order);
  const entries: WorldEntry[] = [];
  const masteredSet = new Set(input.masteredSlugs ?? []);
  let currentAssigned = false;

  for (let i = 0; i < sorted.length; i++) {
    const world = sorted[i];
    const guided = isGuidedWorld(world.id);
    const { progress, conceptCount, exploredCount } = worldProgress(world, concepts, input);
    const prev = sorted[i - 1];
    // On ouvre le monde suivant dès que le précédent est exploré (contenu) ou terminé (guidé) :
    // la lecture permet d'avancer, sans jamais faire croire que le monde est « terminé ».
    const unlocked = i === 0 || (prev ? isWorldExplored(prev, concepts, input) : true);
    const done = isWorldDone(world, concepts, input);
    const explored = isWorldExplored(world, concepts, input);

    let status: WorldStatus;
    let lockReason: string | undefined;
    if (!unlocked) {
      status = 'locked';
      lockReason = prev ? `Explore « ${prev.title} » pour débloquer ce monde.` : undefined;
    } else if (done) {
      status = 'done';
    } else if (explored) {
      // Monde de contenu entièrement consulté : « exploré », PAS « terminé ».
      status = 'explored';
    } else if (!currentAssigned) {
      status = 'current';
      currentAssigned = true;
    } else {
      status = 'unlocked';
    }

    const cs = conceptsByWorld(concepts, world.id);
    const mastered = done && cs.length > 0 && cs.every((c) => masteredSet.has(c.slug));
    entries.push({
      world,
      guided,
      conceptCount,
      exploredCount,
      progress,
      status,
      mastered,
      sampleSpec: cs.find((c) => c.visualSpec)?.visualSpec,
      lockReason,
    });
  }
  return entries;
}

/** Nombre de mondes débloqués (non verrouillés). */
export function worldsOpen(entries: WorldEntry[]): number {
  return entries.filter((e) => e.status !== 'locked').length;
}

/** Nombre de mondes terminés. */
export function worldsDone(entries: WorldEntry[]): number {
  return entries.filter((e) => e.status === 'done').length;
}

/** Retrouve une entrée par id de monde (écran détail). */
export function worldEntryById(entries: WorldEntry[], worldId: string): WorldEntry | undefined {
  return entries.find((e) => e.world.id === worldId);
}
