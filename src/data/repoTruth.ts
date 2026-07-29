/**
 * Vérité du dépôt — source unique des compteurs, DÉRIVÉE du code (jamais recopiée d'un doc).
 *
 * Objectif du « Lot 0 — Vérité du dépôt » : la documentation courante cite ce module au lieu de
 * nombres écrits à la main. Le test `repoTruth.test.ts` garantit la cohérence (unicité,
 * réconciliation des formats d'exercice, résolution des références) et sert de contrôle de dérive :
 * si le contenu change, les invariants restent vrais et le compteur suit automatiquement.
 */
import { ALL_MODULE_SKILLS, getLessons, getExercises } from './seed';
import { V5_CONCEPTS } from './learningContent';
import { BADGES } from './badges';
import { WORLDS, CATEGORIES } from './learningConcept';
import { GLOSSARY_TERMS } from './glossary';
import { SUPPORTED_VISUAL_TYPES } from '../engines/visual/visualDatasets';
import { ALL_EXERCISE_TYPES, type ExerciseType } from '../engines/exercise/types';
import { supportedTypes } from '../engines/exercise/registry';

/**
 * Tous les exercices réels du parcours, TOUS modules guidés confondus (les points de contrôle
 * agrègent des exercices déjà comptés → non recomptés). LOT 4-M : le module « Lire les chandeliers »
 * s'ajoute automatiquement au périmètre des compteurs et des garde-fous (cibles, cohérence).
 */
export function allExercisesFlat() {
  return ALL_MODULE_SKILLS.flatMap((s) => getExercises(s.id));
}

/** Toutes les leçons réelles du parcours, tous modules guidés confondus. */
export function allLessonsFlat() {
  return ALL_MODULE_SKILLS.flatMap((s) => getLessons(s.id));
}

/** Réconciliation des formats d'exercice : déclarés (union de types) vs branchés (grader enregistré). */
export interface FormatReconciliation {
  declared: ExerciseType[];
  implemented: ExerciseType[];
  /** Déclarés mais sans grader ni renderer canonique (à finaliser ou retirer — Lot 7). */
  unimplemented: ExerciseType[];
}

export function exerciseFormatReconciliation(): FormatReconciliation {
  const declared = [...ALL_EXERCISE_TYPES].sort();
  const implemented = [...supportedTypes()].sort();
  const implementedSet = new Set(implemented);
  const unimplemented = declared.filter((t) => !implementedSet.has(t));
  return { declared, implemented, unimplemented };
}

/** Compteurs du dépôt, tous dérivés des registres du code. */
export interface RepoTruth {
  concepts: number;
  skills: number;
  lessons: number;
  exercises: number;
  glossaryTerms: number;
  badges: number;
  worlds: number;
  categories: number;
  visualTypes: number;
  exerciseFormatsDeclared: number;
  exerciseFormatsImplemented: number;
  exerciseFormatsUnimplemented: ExerciseType[];
}

export function repoTruth(): RepoTruth {
  const fmt = exerciseFormatReconciliation();
  return {
    concepts: V5_CONCEPTS.length,
    skills: ALL_MODULE_SKILLS.length,
    lessons: allLessonsFlat().length,
    exercises: allExercisesFlat().length,
    glossaryTerms: GLOSSARY_TERMS.length,
    badges: BADGES.length,
    worlds: WORLDS.length,
    categories: CATEGORIES.length,
    visualTypes: SUPPORTED_VISUAL_TYPES.length,
    exerciseFormatsDeclared: fmt.declared.length,
    exerciseFormatsImplemented: fmt.implemented.length,
    exerciseFormatsUnimplemented: fmt.unimplemented,
  };
}

/** Instantané calculé au chargement — à citer par la documentation courante. */
export const REPO_TRUTH: RepoTruth = repoTruth();

/** Lignes lisibles (doc courte / journal) dérivées de REPO_TRUTH. */
export function repoTruthLines(t: RepoTruth = REPO_TRUTH): string[] {
  const formats =
    `Formats d'exercice : ${t.exerciseFormatsDeclared} déclarés / ` +
    `${t.exerciseFormatsImplemented} branchés` +
    (t.exerciseFormatsUnimplemented.length
      ? ` (en attente : ${t.exerciseFormatsUnimplemented.join(', ')})`
      : '');
  return [
    `Concepts riches V5 : ${t.concepts}`,
    `Compétences : ${t.skills}`,
    `Leçons : ${t.lessons}`,
    `Exercices : ${t.exercises}`,
    `Termes de glossaire : ${t.glossaryTerms}`,
    `Badges : ${t.badges}`,
    `Mondes : ${t.worlds}`,
    `Catégories : ${t.categories}`,
    `Types de visuels : ${t.visualTypes}`,
    formats,
  ];
}
