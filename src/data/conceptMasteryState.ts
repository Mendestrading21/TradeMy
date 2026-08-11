/**
 * Machine d'états stricte de la maîtrise d'un concept (P0 — progression honnête).
 *
 * Cinq états nettement séparés :
 *   new       — jamais vu
 *   explored  — fiche consultée (ne vaut JAMAIS maîtrise)
 *   completed — au moins un objectif exerçable entraîné avec succès
 *   strong    — au moins un objectif prouvé (retenu dans le temps), couverture incomplète
 *   mastered  — TOUS les objectifs exerçables prouvés + checkpoint indépendant réussi
 *
 * La maîtrise s'appuie sur la COUVERTURE des objectifs réellement entraînés
 * (`targets` persistés, schéma v8), pas sur une note agrégée au niveau compétence.
 * Deux garde-fous P0 :
 *   1. Un concept qui n'est entraîné par AUCUN exercice est plafonné à « exploré »
 *      — fin de la maîtrise partagée entre fiches d'une même famille.
 *   2. La maîtrise exige la couverture complète des objectifs exerçables du concept.
 *
 * LOT C1 : le garde-fou n° 1 posait la mauvaise question (le champ `skillId` de la fiche, hérité
 * des leçons libres) et plafonnait 42 concepts pourtant activement entraînés. Voir
 * `isRepresentativeConcept` ci-dessous ; l'intention P0 est conservée, sa mise en œuvre corrigée.
 */
import type { LearningConcept } from './learningConcept';
import type { SkillProgress } from '../engines/learning';
import { objectiveCoverage, type TargetProgress } from './targetProgress';
import { CHECKPOINT_ID, exercisableObjectiveIds } from './seed';

export type ConceptState = 'new' | 'explored' | 'completed' | 'strong' | 'mastered';

export interface ConceptStateInput {
  exploredSlugs: string[];
  /** Conservé pour compatibilité des appelants ; la maîtrise dérive des cibles, pas de la compétence. */
  skills?: Record<string, SkillProgress>;
  /** Compétences/points de contrôle réussis (contient CHECKPOINT_ID si le checkpoint est passé). */
  completedSkills?: string[];
  /** Progression par cible pédagogique (schéma v8) — source de la couverture. */
  targets?: Record<string, TargetProgress>;
}

/** Détail des conditions de maîtrise (UI « il te reste à… » et tests). */
export interface MasteryGate {
  /** Le concept est le représentant entraîné de sa compétence. */
  representative: boolean;
  /** Fiche consultée. */
  explored: boolean;
  /** Au moins un objectif exerçable entraîné avec succès. */
  trained: boolean;
  /** Tous les objectifs exerçables sont prouvés (entraînés + retenus dans le temps). */
  coverageComplete: boolean;
  /** Checkpoint indépendant réussi. */
  checkpointPassed: boolean;
}

/**
 * Un concept est « entraîné » s'il porte au moins un objectif RÉELLEMENT exercé quelque part dans
 * le parcours. Les fiches de bibliothèque, qui n'ont aucun exercice à elles, n'héritent donc
 * d'aucune maîtrise : l'intention P0 (fin de la maîtrise partagée) est intacte.
 *
 * LOT C1 — CORRECTION. La règle interrogeait auparavant le champ `skillId` de la FICHE, comparé au
 * concept représentatif de cette compétence. Or ce champ pointe vers les leçons libres historiques
 * (`skill.candles`, `skill.patterns`, `skill.trend`, `skill.actions`) — ou n'existe pas du tout sur
 * la moitié du corpus. Il n'a jamais désigné la compétence guidée qui entraîne vraiment la notion.
 * Résultat mesuré avant ce lot : **3 concepts sur 67** étaient jugés représentatifs, et **42
 * concepts activement entraînés, exercices ciblés à l'appui, restaient plafonnés à « Découvert »
 * pour toujours** — quoi que fasse l'apprenant.
 *
 * La question posée ici est désormais celle qui compte, et elle se lit dans le même registre que la
 * couverture : ce concept a-t-il des objectifs exerçables ? Aucun garde-fou n'est perdu —
 * `objectiveCoverage` exige déjà `total > 0` pour déclarer une couverture complète.
 */
export function isRepresentativeConcept(concept: Pick<LearningConcept, 'id'>): boolean {
  return exercisableObjectiveIds(concept.id).length > 0;
}

export function masteryGate(concept: LearningConcept, input: ConceptStateInput): MasteryGate {
  const exercisable = exercisableObjectiveIds(concept.id);
  const cov = objectiveCoverage(exercisable, input.targets ?? {});
  return {
    representative: isRepresentativeConcept(concept),
    explored: input.exploredSlugs.includes(concept.slug),
    trained: cov.trained > 0,
    coverageComplete: cov.complete,
    checkpointPassed: (input.completedSkills ?? []).includes(CHECKPOINT_ID),
  };
}

/** Toutes les conditions de maîtrise sont-elles réunies ? */
export function canBeMastered(concept: LearningConcept, input: ConceptStateInput): boolean {
  const g = masteryGate(concept, input);
  return g.representative && g.explored && g.coverageComplete && g.checkpointPassed;
}

/** État de maîtrise strict d'un concept. */
export function conceptState(concept: LearningConcept, input: ConceptStateInput): ConceptState {
  const explored = input.exploredSlugs.includes(concept.slug);

  // Non représentatif : plafond « exploré » (pas d'héritage entre concepts d'une compétence).
  if (!isRepresentativeConcept(concept)) return explored ? 'explored' : 'new';

  if (canBeMastered(concept, input)) return 'mastered';

  const cov = objectiveCoverage(exercisableObjectiveIds(concept.id), input.targets ?? {});
  if (cov.proven > 0) return 'strong'; // au moins un objectif prouvé, couverture/checkpoint incomplets
  if (cov.trained > 0) return 'completed';
  return explored ? 'explored' : 'new';
}

/** Le concept est-il réellement maîtrisé (état strict) ? */
export function isConceptMastered(concept: LearningConcept, input: ConceptStateInput): boolean {
  return conceptState(concept, input) === 'mastered';
}
