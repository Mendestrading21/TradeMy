/**
 * Moteur d'exercices — les 12 formats du kit (reference + schemas/exercise.schema.json).
 * P0.1 implémente `mcq` et `true_false` ; les autres sont déclarés puis branchés par lot.
 */

export type ExerciseType =
  | 'mcq'
  | 'true_false'
  | 'match'
  | 'order'
  | 'select_chart_zone'
  | 'identify_pattern'
  | 'find_error'
  | 'scenario'
  | 'numeric'
  // Formats graphiques V5 (Lot 6)
  | 'place_invalidation'
  | 'label_chart'
  | 'sequence_market_structure'
  // Reconnaissance de figure sur visuel du moteur (bibliothèque)
  | 'identify_figure';

/**
 * Tous les formats DÉCLARÉS = tous les formats BRANCHÉS (un grader enregistré).
 * Learning-Master Lot 7 : `drag_drop`, `draw_level` et `timed` (déclarés sans grader ni renderer)
 * ont été retirés — plus d'incohérence 16/13. Ajouter un format = l'ajouter ici, enregistrer son
 * grader et le décrire dans `EXERCISE_FORMAT_REGISTRY`.
 */
export const ALL_EXERCISE_TYPES: ExerciseType[] = [
  'mcq',
  'true_false',
  'match',
  'order',
  'select_chart_zone',
  'identify_pattern',
  'find_error',
  'scenario',
  'numeric',
  'place_invalidation',
  'label_chart',
  'sequence_market_structure',
  'identify_figure',
];

export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';

/** Feedback obligatoire : pourquoi c'est correct, pourquoi c'est faux, la règle, et quand elle échoue. */
export interface ExerciseFeedback {
  correct: string;
  incorrect: string;
  rule?: string;
  whenItFails?: string;
}

/**
 * Cible pédagogique d'un exercice : le couple (conceptId, objectiveId).
 * Structurellement compatible avec `LearningTarget` (src/data/learningTarget.ts),
 * défini ici sans import inter-couches pour éviter tout cycle data↔engines.
 * Optionnel : les exercices historiques restent valides sans cible.
 */
export interface ExerciseTarget {
  conceptId: string;
  objectiveId: string;
}

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  skillId: string;
  prompt: string;
  difficulty?: ExerciseDifficulty;
  feedback: ExerciseFeedback;
  sources?: string[];
  /** Cible pédagogique adressée (conceptId + objectiveId). Optionnel. */
  target?: ExerciseTarget;
  /**
   * Résumé accessible CANONIQUE de l'item (lecteur d'écran), dérivé de la même vérité que le
   * graphique/la réponse/le feedback. Porté par l'exercice pour que les players l'affichent
   * sans le recalculer en parallèle (une seule vérité). Optionnel.
   */
  accessibilitySummary?: string;
}

export interface McqExercise extends BaseExercise {
  type: 'mcq';
  options: string[];
  validation: { correctIndex: number };
}

export interface TrueFalseExercise extends BaseExercise {
  type: 'true_false';
  validation: { answer: boolean };
}

export interface NumericExercise extends BaseExercise {
  type: 'numeric';
  unit?: string;
  validation: { answer: number; tolerance?: number };
}

export interface OrderExercise extends BaseExercise {
  type: 'order';
  items: string[];
  /** correctOrder = indices de `items` dans le bon ordre. */
  validation: { correctOrder: number[] };
}

export interface MatchExercise extends BaseExercise {
  type: 'match';
  left: string[];
  right: string[];
  /** matches[i] = index dans `right` associé à left[i]. */
  validation: { matches: number[] };
}

export interface FindErrorExercise extends BaseExercise {
  type: 'find_error';
  statements: string[];
  /** Index de l'affirmation ERRONÉE à repérer. */
  validation: { errorIndex: number };
}

export interface IdentifyPatternExercise extends BaseExercise {
  type: 'identify_pattern';
  /** Seed de la série de bougies à afficher (reproductible). */
  chartSeed: number;
  options: string[];
  validation: { correctIndex: number };
}

/** Scénario conditionnel (SI … / ALORS …). */
export interface ScenarioExercise extends BaseExercise {
  type: 'scenario';
  /** Le « SI » : le setup/contexte à évaluer. */
  context: string;
  /** Les issues possibles (« ALORS »). */
  options: string[];
  validation: { correctIndex: number };
}

/** Sélection d'une zone du graphique (gauche→droite). */
export interface SelectChartZoneExercise extends BaseExercise {
  type: 'select_chart_zone';
  chartSeed: number;
  /** Libellés des zones, de gauche à droite (servent aussi de repère accessible). */
  zones: string[];
  validation: { correctZone: number };
}

/**
 * Placer un niveau d'invalidation (prix) sur le graphique.
 * La réponse est un prix ; correcte si dans la tolérance absolue autour de la cible.
 */
export interface PlaceInvalidationExercise extends BaseExercise {
  type: 'place_invalidation';
  chartSeed: number;
  /** Repère textuel (ex. « sous le second creux ») — sens attendu, accessible. */
  hint?: string;
  validation: { targetPrice: number; tolerance: number };
}

/** Étiqueter un élément mis en évidence sur le graphique (bougie marquée par un repère). */
export interface LabelChartExercise extends BaseExercise {
  type: 'label_chart';
  chartSeed: number;
  /** Index de la bougie mise en évidence (0-based) dans la série de 30. */
  markerIndex: number;
  options: string[];
  validation: { correctIndex: number };
}

/** Reconstituer l'ordre d'une séquence de structure de marché (range → cassure → pullback…). */
export interface SequenceMarketStructureExercise extends BaseExercise {
  type: 'sequence_market_structure';
  /** Étapes à ordonner. */
  steps: string[];
  /** Seed d'un graphique d'illustration (optionnel). */
  chartSeed?: number;
  /** correctOrder = indices de `steps` dans le bon ordre. */
  validation: { correctOrder: number[] };
}

/**
 * Reconnaître une figure rendue par le moteur de visuels (bibliothèque déterministe).
 * Le visuel est affiché en mode « énigme » ; on choisit son nom parmi des intitulés.
 */
export interface IdentifyFigureExercise extends BaseExercise {
  type: 'identify_figure';
  /** Clé du dataset OHLC déterministe de la figure à reconnaître. */
  datasetKey: string;
  /** Variant (= id de figure) pour résoudre overlays/indicateurs au rendu. */
  variant: string;
  /** Type de rendu du moteur de visuels. */
  visualType: 'candle-anatomy' | 'candlestick-pattern' | 'chart-pattern' | 'market-structure' | 'indicator' | 'volume-profile';
  options: string[];
  validation: { correctIndex: number };
}

/** Union discriminée des formats implémentés (narrowing par `type`). */
export type Exercise =
  | McqExercise
  | TrueFalseExercise
  | NumericExercise
  | OrderExercise
  | MatchExercise
  | FindErrorExercise
  | IdentifyPatternExercise
  | ScenarioExercise
  | SelectChartZoneExercise
  | PlaceInvalidationExercise
  | LabelChartExercise
  | SequenceMarketStructureExercise
  | IdentifyFigureExercise;

export interface GradeResult {
  correct: boolean;
  feedback: ExerciseFeedback;
}
