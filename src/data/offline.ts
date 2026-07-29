/**
 * Disponibilité hors-ligne — pure et testable.
 *
 * PatternLab embarque tout le contenu du parcours (compétences, leçons, exercices,
 * glossaire, badges) ET la couche V5 (concepts riches, visuels SVG déterministes, mondes).
 * La progression est stockée localement (AsyncStorage). Ce module résume ce qui est
 * réellement disponible sans réseau, pour l'afficher honnêtement et le garantir par test.
 * Aucune dépendance runtime : les visuels sont générés en code (datasets déterministes),
 * jamais téléchargés.
 */
import { ALL_MODULE_SKILLS, allLessons, getExercises } from './seed';
import { GLOSSARY_TERMS } from './glossary';
import { BADGES } from './badges';
import { V5_CONCEPTS } from './learningContent';
import { WORLDS } from './learningConcept';
import { UNIFIED_GLOSSARY } from './glossaryUnified';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

export interface OfflineCapabilities {
  skills: number;
  lessons: number;
  exercises: number;
  glossaryTerms: number;
  badges: number;
  /** Concepts V5 riches embarqués (fiches visuelles). */
  concepts: number;
  /** Datasets OHLC déterministes des visuels (générés en code, jamais téléchargés). */
  visualDatasets: number;
  /** Mondes du parcours V5. */
  worlds: number;
  /** Glossaire unifié (termes v1 + concepts V5, dédupliqués). */
  unifiedGlossary: number;
  /** Tout le contenu (parcours + V5) est embarqué (disponible hors-ligne). */
  contentReady: boolean;
  /** La progression est stockée localement (aucune dépendance réseau). */
  progressLocal: boolean;
}

export function offlineCapabilities(): OfflineCapabilities {
  const lessons = allLessons().length;
  const exercises = ALL_MODULE_SKILLS.reduce((n, s) => n + getExercises(s.id).length, 0);
  const concepts = V5_CONCEPTS.length;
  const visualDatasets = Object.keys(VISUAL_DATASETS).length;
  return {
    skills: ALL_MODULE_SKILLS.length,
    lessons,
    exercises,
    glossaryTerms: GLOSSARY_TERMS.length,
    badges: BADGES.length,
    concepts,
    visualDatasets,
    worlds: WORLDS.length,
    unifiedGlossary: UNIFIED_GLOSSARY.length,
    contentReady: ALL_MODULE_SKILLS.length > 0 && lessons > 0 && exercises > 0 && concepts > 0 && visualDatasets > 0,
    progressLocal: true,
  };
}
