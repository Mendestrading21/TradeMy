/**
 * Carte de parcours immersive — logique pure et testable.
 * Construit les nœuds d'un module : compétences ordonnées + un checkpoint de fin de
 * module. Statuts dérivés de la progression réelle (terminé / courant / dû / verrouillé).
 *
 * LOT 4-M — multi-module : le checkpoint (id/titre) et le titre du monde sont PARAMÉTRÉS
 * (`WorldMapOptions`). Par défaut, ils reproduisent EXACTEMENT le module Fondations
 * (`CHECKPOINT_ID`/`CHECKPOINT_TITLE`, « Monde 1 · Fondations ») → non-régressif. Un second
 * module (Chandeliers) fournit son propre checkpoint sans dépendre du checkpoint Fondations global.
 */
import type { ProgressState } from './repositories';
import type { Skill } from '../engines/learning';
import { isDue } from '../engines/learning';
import { CHECKPOINT_ID, CHECKPOINT_TITLE } from './seed';

export type NodeStatus = 'done' | 'current' | 'due' | 'locked';
export type NodeKind = 'skill' | 'checkpoint';

export interface MapNode {
  id: string;
  kind: NodeKind;
  title: string;
  index: number;
  status: NodeStatus;
}

export interface WorldMap {
  worldTitle: string;
  moduleTitle: string;
  nodes: MapNode[];
  completed: number;
  total: number;
}

/** Paramètres du module (checkpoint propre, titre) — défaut = module Fondations (non-régressif). */
export interface WorldMapOptions {
  /** Id du checkpoint de CE module (défaut : checkpoint Fondations global). */
  checkpointId?: string;
  /** Titre du checkpoint de CE module (défaut : titre Fondations). */
  checkpointTitle?: string;
  /** Titre affiché du monde (défaut : « Monde 1 · Fondations »). */
  worldTitle?: string;
}

/**
 * Construit la carte d'un module.
 * - une compétence terminée est `due` si sa révision est échue, sinon `done` ;
 * - la première compétence non terminée est `current`, les suivantes `locked` ;
 * - le checkpoint (propre au module) est `locked` tant que toutes les compétences ne sont pas
 *   terminées, puis `current`, puis `done` une fois réalisé.
 */
export function buildWorldMap(
  state: ProgressState,
  skills: Skill[],
  moduleTitle: string,
  now: number,
  options: WorldMapOptions = {},
): WorldMap {
  const checkpointId = options.checkpointId ?? CHECKPOINT_ID;
  const checkpointTitle = options.checkpointTitle ?? CHECKPOINT_TITLE;
  const worldTitle = options.worldTitle ?? 'Monde 1 · Fondations';

  const firstIncomplete = skills.findIndex((s) => !state.completedSkills.includes(s.id));

  const nodes: MapNode[] = skills.map((s, i) => {
    let status: NodeStatus;
    if (state.completedSkills.includes(s.id)) {
      status = state.skills[s.id] && isDue(state.skills[s.id].review, now) ? 'due' : 'done';
    } else if (firstIncomplete === i) {
      status = 'current';
    } else {
      status = 'locked';
    }
    return { id: s.id, kind: 'skill', title: s.name, index: i, status };
  });

  const allSkillsDone = skills.length > 0 && skills.every((s) => state.completedSkills.includes(s.id));
  const checkpointDone = state.completedSkills.includes(checkpointId);
  const checkpointStatus: NodeStatus = checkpointDone ? 'done' : allSkillsDone ? 'current' : 'locked';
  nodes.push({
    id: checkpointId,
    kind: 'checkpoint',
    title: checkpointTitle,
    index: skills.length,
    status: checkpointStatus,
  });

  const completed = nodes.filter((n) => n.status === 'done' || n.status === 'due').length;
  return { worldTitle, moduleTitle, nodes, completed, total: nodes.length };
}
