/**
 * Source de scénario pédagogique CANONIQUE (modèle officiel du parcours pilote).
 *
 * Un `LearningScenario` est l'unique vérité d'un item : à partir d'un seul `chartSeed` (ou d'un
 * contenu structurel), on DÉRIVE le graphique, la bonne réponse, le feedback et le résumé accessible.
 * Le graphique, la réponse, le feedback et l'accessibilité partagent donc une seule vérité — par
 * construction — comme `buildDirectionExercise`, mais généralisé aux interactions graphiques
 * (direction, zone du plus haut, élément marqué) et structurelles (ordre de lecture, faux signal).
 *
 * Interdit par construction : un graphique qui montrerait une vérité différente de la question, du
 * feedback ou du texte lecteur d'écran — la réponse est calculée depuis la série réellement rendue.
 */
import { generateCandles } from '../pattern/demoChart';
import { describeCandles } from '../pattern/chartA11y';
import type { Candle } from '../pattern/types';
import type {
  Exercise,
  ExerciseDifficulty,
  ExerciseTarget,
  SelectChartZoneExercise,
  LabelChartExercise,
  OrderExercise,
  FindErrorExercise,
  PlaceInvalidationExercise,
  IdentifyFigureExercise,
  ScenarioExercise,
} from './types';
import { buildDirectionExercise } from './semanticExercise';

/** Nombre de bougies rendu pour les scénarios graphiques (aligné sur les players). */
export const SCENARIO_CANDLE_COUNT = 30;

/** Libellés des trois tiers temporels (gauche → droite), servent aussi de repère accessible. */
export const THIRD_LABELS = ['Premier tiers', 'Deuxième tiers', 'Dernier tiers'] as const;

/** Ordre des options directionnelles, TOUJOURS [hausse, baisse, latéral] (cf. semanticExercise). */
const DIRECTION_INDEX: Record<'haussière' | 'baissière' | 'latérale', 0 | 1 | 2> = {
  haussière: 0,
  baissière: 1,
  latérale: 2,
};

/** Les interactions réellement différentes couvertes par le modèle. */
export type ScenarioInteraction =
  | 'read-direction' // identify_pattern — lire la structure (graphique)
  | 'touch-extreme-zone' // select_chart_zone — toucher le tiers du plus haut (graphique, tactile)
  | 'label-extreme' // label_chart — reconnaître l'élément marqué = le plus haut (graphique)
  | 'place-extreme' // place_invalidation — PLACER une ligne au plus haut atteint (manipulation continue)
  | 'read-order' // order — ordonner la lecture (structurel)
  | 'spot-false-signal' // find_error — repérer l'affirmation fausse (structurel)
  // ── LOT 4-M : interactions natives « figure de chandelier » (mappées sur des players EXISTANTS,
  //    aucun nouveau primitif d'interface — une figure prédit rien sans contexte/confirmation/invalidation).
  | 'identify-candle' // identify_figure — reconnaître UNE figure de chandelier rendue (sa forme)
  | 'place-invalidation' // place_invalidation — PLACER le niveau d'invalidation (sous le plus bas atteint)
  | 'read-scenario'; // scenario — conclure un scénario conditionnel (SI contexte … ALORS …)

interface ScenarioBase {
  id: string;
  skillId: string;
  /** Cible pédagogique (conceptId + objectiveId) — déjà résolue par la donnée. */
  target: ExerciseTarget;
  prompt: string;
  difficulty?: ExerciseDifficulty;
  /** Nuance pédagogique (règle générale), indépendante de la vérité dérivée. */
  rule?: string;
  /** Mise en garde (faux signal), indépendante de la vérité dérivée. */
  whenItFails?: string;
  /**
   * Résumé accessible EXPLICITE, pour les interactions dont la vérité n'est pas dérivable d'une série
   * (figure isolée, scénario conditionnel). Rédigé honnêtement, il décrit ce que le lecteur d'écran
   * doit entendre. Ignoré par les interactions graphiques (dérivées de la série réelle).
   */
  a11y?: string;
}

export interface DirectionScenario extends ScenarioBase {
  interaction: 'read-direction';
  chartSeed: number;
  /** Libellés des 3 options, TOUJOURS [hausse, baisse, latéral]. */
  options: [string, string, string];
}
export interface ExtremeZoneScenario extends ScenarioBase {
  interaction: 'touch-extreme-zone';
  chartSeed: number;
}
export interface LabelExtremeScenario extends ScenarioBase {
  interaction: 'label-extreme';
  chartSeed: number;
  /** Options ; la bonne (index `correctIndex`) DOIT décrire « le plus haut ». */
  options: string[];
  correctIndex: number;
}
export interface PlaceExtremeScenario extends ScenarioBase {
  interaction: 'place-extreme';
  chartSeed: number;
}
export interface ReadOrderScenario extends ScenarioBase {
  interaction: 'read-order';
  steps: string[];
  /** Indices de `steps` dans le bon ordre. */
  correctOrder: number[];
}
export interface FalseSignalScenario extends ScenarioBase {
  interaction: 'spot-false-signal';
  statements: string[];
  /** Index de l'affirmation FAUSSE. */
  errorIndex: number;
}

/** Reconnaître UNE figure de chandelier rendue par le moteur de visuels (déterministe). */
export interface IdentifyCandleScenario extends ScenarioBase {
  interaction: 'identify-candle';
  /** Clé du dataset OHLC déterministe de la figure (source : visualDatasets). */
  datasetKey: string;
  /** Variant (= id de figure) pour résoudre le rendu. */
  variant: string;
  /** Type de rendu du moteur de visuels. */
  visualType: 'candle-anatomy' | 'candlestick-pattern' | 'chart-pattern' | 'market-structure' | 'indicator' | 'volume-profile';
  options: string[];
  /** Index de la bonne réponse (le nom de la figure montrée). */
  correctIndex: number;
}

/**
 * PLACER le niveau d'invalidation d'un scénario (sous le plus bas atteint de la série). 5e mécanique
 * de placement, distincte de `place-extreme` (qui vise le plus HAUT) : ici la cible est le plus BAS
 * réel de la série rendue → cohérente par construction. Player de production `place_invalidation`.
 */
export interface PlaceInvalidationScenario extends ScenarioBase {
  interaction: 'place-invalidation';
  chartSeed: number;
}

/** Conclure un scénario conditionnel (SI contexte … ALORS …). Player de production `scenario`. */
export interface ReadScenarioScenario extends ScenarioBase {
  interaction: 'read-scenario';
  /** Le « SI » : le setup/contexte à évaluer. */
  context: string;
  /** Les issues possibles (« ALORS »). */
  options: string[];
  /** Index de la conclusion correcte. */
  correctIndex: number;
}

export type LearningScenario =
  | DirectionScenario
  | ExtremeZoneScenario
  | LabelExtremeScenario
  | PlaceExtremeScenario
  | ReadOrderScenario
  | FalseSignalScenario
  | IdentifyCandleScenario
  | PlaceInvalidationScenario
  | ReadScenarioScenario;

/** Le tiers temporel (0..2) qui contient le plus haut de la série. Vérité unique de la zone. */
export function highestThird(candles: Candle[], thirds = 3): number {
  if (!candles.length) return 0;
  const size = Math.ceil(candles.length / thirds);
  let best = 0;
  let bestHigh = -Infinity;
  for (let t = 0; t < thirds; t++) {
    const slice = candles.slice(t * size, t * size + size);
    const hi = slice.length ? Math.max(...slice.map((c) => c.h)) : -Infinity;
    if (hi > bestHigh) {
      bestHigh = hi;
      best = t;
    }
  }
  return best;
}

/** Index de la bougie qui atteint le plus haut de la série. Vérité unique du repère. */
export function highestCandleIndex(candles: Candle[]): number {
  if (!candles.length) return 0;
  return candles.reduce((best, c, i) => (c.h > candles[best].h ? i : best), 0);
}

/** Plus haut prix atteint sur la série (mèche haute la plus élevée). Vérité unique du niveau à placer. */
export function highestHigh(candles: Candle[]): number {
  if (!candles.length) return 0;
  return Math.max(...candles.map((c) => c.h));
}

/** Plus bas prix atteint sur la série (amplitude → tolérance). */
export function lowestLow(candles: Candle[]): number {
  if (!candles.length) return 0;
  return Math.min(...candles.map((c) => c.l));
}

/** Résumé accessible d'un scénario — pour les scénarios graphiques, dérivé de la série réelle. */
export function scenarioA11ySummary(scenario: LearningScenario): string {
  switch (scenario.interaction) {
    case 'read-direction':
    case 'touch-extreme-zone':
    case 'label-extreme':
    case 'place-extreme':
    case 'place-invalidation':
      return describeCandles(generateCandles(scenario.chartSeed, SCENARIO_CANDLE_COUNT));
    case 'read-order':
      return `Étapes à ordonner : ${scenario.steps.join(' ; ')}.`;
    case 'spot-false-signal':
      return `Affirmations à évaluer : ${scenario.statements.join(' ; ')}.`;
    case 'identify-candle':
      // Figure isolée : le résumé décrit honnêtement la forme rendue (fourni par la donnée).
      return scenario.a11y ?? `Figure de chandelier à reconnaître parmi : ${scenario.options.join(' ; ')}.`;
    case 'read-scenario':
      return scenario.a11y ?? `Contexte : ${scenario.context} Conclusions possibles : ${scenario.options.join(' ; ')}.`;
  }
}

/**
 * Construit l'exercice noté COHÉRENT PAR CONSTRUCTION d'un scénario : la bonne réponse, le feedback
 * et l'accessibilité dérivent de la même vérité que le graphique rendu.
 */
export function buildScenarioExercise(scenario: LearningScenario): Exercise {
  // Résumé accessible CANONIQUE — même vérité que le graphique/la réponse/le feedback. Porté sur
  // l'exercice pour être AFFICHÉ tel quel par les players (jamais recalculé en parallèle).
  const accessibilitySummary = scenarioA11ySummary(scenario);

  switch (scenario.interaction) {
    case 'read-direction':
      return {
        ...buildDirectionExercise({
          id: scenario.id,
          skillId: scenario.skillId,
          target: scenario.target,
          chartSeed: scenario.chartSeed,
          prompt: scenario.prompt,
          options: scenario.options,
          difficulty: scenario.difficulty,
          rule: scenario.rule,
          whenItFails: scenario.whenItFails,
        }),
        accessibilitySummary,
      };

    case 'touch-extreme-zone': {
      const candles = generateCandles(scenario.chartSeed, SCENARIO_CANDLE_COUNT);
      const correctZone = highestThird(candles);
      const label = THIRD_LABELS[correctZone];
      const summary = describeCandles(candles);
      const ex: SelectChartZoneExercise = {
        id: scenario.id,
        type: 'select_chart_zone',
        skillId: scenario.skillId,
        target: scenario.target,
        prompt: scenario.prompt,
        chartSeed: scenario.chartSeed,
        zones: [...THIRD_LABELS],
        validation: { correctZone },
        difficulty: scenario.difficulty ?? 'medium',
        accessibilitySummary,
        feedback: {
          correct: `Bien vu : le plus haut de la période est dans le ${label.toLowerCase()}. ${summary}`,
          incorrect: `Le plus haut de la période est dans le ${label.toLowerCase()} : compare les mèches hautes tiers par tiers. ${summary}`,
          rule: scenario.rule ?? 'La mèche haute la plus longue marque le plus haut atteint sur la période.',
          whenItFails: scenario.whenItFails ?? 'Un plus-haut ponctuel n’annonce pas la suite : c’est la structure d’ensemble qui compte.',
        },
      };
      return ex;
    }

    case 'label-extreme': {
      const candles = generateCandles(scenario.chartSeed, SCENARIO_CANDLE_COUNT);
      const markerIndex = highestCandleIndex(candles);
      const summary = describeCandles(candles);
      const ex: LabelChartExercise = {
        id: scenario.id,
        type: 'label_chart',
        skillId: scenario.skillId,
        target: scenario.target,
        prompt: scenario.prompt,
        chartSeed: scenario.chartSeed,
        markerIndex,
        options: [...scenario.options],
        validation: { correctIndex: scenario.correctIndex },
        difficulty: scenario.difficulty ?? 'medium',
        accessibilitySummary,
        feedback: {
          correct: `Exact : le repère marque le plus haut atteint (la mèche haute). ${summary}`,
          incorrect: `Le repère est posé sur le plus haut de la période (la mèche haute), pas ailleurs. ${summary}`,
          rule: scenario.rule ?? 'La mèche haute marque le plus haut atteint pendant la période.',
          whenItFails: scenario.whenItFails ?? 'Le plus haut décrit le passé de la bougie, jamais la bougie suivante.',
        },
      };
      return ex;
    }

    case 'place-extreme': {
      // 4e mécanique RÉELLE : placer une ligne horizontale au plus haut atteint (manipulation
      // continue), distincte du QCM, de la zone au doigt et de la réorganisation. La cible (prix) est
      // calculée depuis la série réellement rendue → cohérente par construction ; tolérance = 8 % de
      // l'amplitude. Rendu par le player de production `place_invalidation` (clavier ↑/↓ + tactile +
      // lecteur d'écran « adjustable »).
      const candles = generateCandles(scenario.chartSeed, SCENARIO_CANDLE_COUNT);
      const targetPrice = highestHigh(candles);
      const tolerance = (highestHigh(candles) - lowestLow(candles)) * 0.08;
      const ex: PlaceInvalidationExercise = {
        id: scenario.id,
        type: 'place_invalidation',
        skillId: scenario.skillId,
        target: scenario.target,
        prompt: scenario.prompt,
        chartSeed: scenario.chartSeed,
        hint: 'le plus haut atteint (la mèche haute la plus élevée)',
        validation: { targetPrice, tolerance },
        difficulty: scenario.difficulty ?? 'medium',
        accessibilitySummary,
        feedback: {
          correct: `Bien vu : la ligne est posée sur le plus haut atteint (la mèche haute). ${accessibilitySummary}`,
          incorrect: `Le plus haut atteint est la mèche haute la plus élevée : remonte ta ligne jusque-là. ${accessibilitySummary}`,
          rule: scenario.rule ?? 'La mèche haute marque le plus haut atteint sur la période ; le corps, lui, donne le sens.',
          whenItFails: scenario.whenItFails ?? 'Le plus haut décrit le passé de la période, il n’annonce pas la bougie suivante.',
        },
      };
      return ex;
    }

    case 'read-order': {
      const ex: OrderExercise = {
        id: scenario.id,
        type: 'order',
        skillId: scenario.skillId,
        target: scenario.target,
        prompt: scenario.prompt,
        items: [...scenario.steps],
        validation: { correctOrder: [...scenario.correctOrder] },
        difficulty: scenario.difficulty ?? 'medium',
        accessibilitySummary,
        feedback: {
          correct: 'Bien vu : corps (sens), puis mèches (extrêmes), puis contexte.',
          incorrect: `Ordre attendu : ${scenario.correctOrder.map((i) => scenario.steps[i]).join(' → ')}.`,
          rule: scenario.rule ?? 'On lit d’abord le corps (le sens), puis les mèches (les extrêmes), puis le contexte.',
          whenItFails: scenario.whenItFails ?? 'Lire la couleur seule, sans le corps ni les mèches, trompe.',
        },
      };
      return ex;
    }

    case 'spot-false-signal': {
      const ex: FindErrorExercise = {
        id: scenario.id,
        type: 'find_error',
        skillId: scenario.skillId,
        target: scenario.target,
        prompt: scenario.prompt,
        statements: [...scenario.statements],
        validation: { errorIndex: scenario.errorIndex },
        difficulty: scenario.difficulty ?? 'medium',
        accessibilitySummary,
        feedback: {
          correct: `Exact : « ${scenario.statements[scenario.errorIndex]} » est faux.`,
          incorrect: `L’affirmation fausse est : « ${scenario.statements[scenario.errorIndex]} ».`,
          rule: scenario.rule ?? 'Une bougie décrit le passé d’une période ; elle ne prédit pas la suivante.',
          whenItFails: scenario.whenItFails ?? 'La couleur seule ne prédit rien : le contexte prime.',
        },
      };
      return ex;
    }

    case 'identify-candle': {
      // Reconnaissance de figure : la bonne réponse est le nom de la figure réellement rendue
      // (datasetKey + variant). Le feedback nomme cette figure ; l'a11y décrit sa forme.
      const answer = scenario.options[scenario.correctIndex];
      const ex: IdentifyFigureExercise = {
        id: scenario.id,
        type: 'identify_figure',
        skillId: scenario.skillId,
        target: scenario.target,
        prompt: scenario.prompt,
        datasetKey: scenario.datasetKey,
        variant: scenario.variant,
        visualType: scenario.visualType,
        options: [...scenario.options],
        validation: { correctIndex: scenario.correctIndex },
        difficulty: scenario.difficulty ?? 'medium',
        accessibilitySummary,
        feedback: {
          correct: `Exact : c’est « ${answer} », reconnu à sa forme.`,
          incorrect: `La figure montrée est « ${answer} » : compare le corps, les mèches et leur position.`,
          rule: scenario.rule ?? 'On reconnaît une figure à sa forme (corps, mèches, position), pas à ce qu’elle « annoncerait ».',
          whenItFails: scenario.whenItFails ?? 'Reconnaître une figure ne prédit pas la suite : seuls le contexte et la confirmation décident.',
        },
      };
      return ex;
    }

    case 'place-invalidation': {
      // Niveau d'invalidation = le plus BAS réel de la série rendue (sous lequel le scénario tombe).
      // Cohérent par construction ; tolérance = 8 % de l'amplitude. Distinct de `place-extreme` (haut).
      const candles = generateCandles(scenario.chartSeed, SCENARIO_CANDLE_COUNT);
      const targetPrice = lowestLow(candles);
      const tolerance = (highestHigh(candles) - lowestLow(candles)) * 0.08;
      const ex: PlaceInvalidationExercise = {
        id: scenario.id,
        type: 'place_invalidation',
        skillId: scenario.skillId,
        target: scenario.target,
        prompt: scenario.prompt,
        chartSeed: scenario.chartSeed,
        hint: 'le plus bas atteint (le plancher de la période)',
        validation: { targetPrice, tolerance },
        difficulty: scenario.difficulty ?? 'medium',
        accessibilitySummary,
        feedback: {
          correct: `Bien vu : l’invalidation se pose sous le plus bas atteint (le plancher). ${accessibilitySummary}`,
          incorrect: `L’invalidation se situe sous le plus bas atteint (le plancher), pas au milieu : descends ta ligne jusque-là. ${accessibilitySummary}`,
          rule: scenario.rule ?? 'L’invalidation est le niveau qui, franchi, annule le scénario : sous le plus bas de la figure.',
          whenItFails: scenario.whenItFails ?? 'Une invalidation trop serrée saute au moindre bruit ; trop large, elle ne protège plus.',
        },
      };
      return ex;
    }

    case 'read-scenario': {
      const answer = scenario.options[scenario.correctIndex];
      const ex: ScenarioExercise = {
        id: scenario.id,
        type: 'scenario',
        skillId: scenario.skillId,
        target: scenario.target,
        prompt: scenario.prompt,
        context: scenario.context,
        options: [...scenario.options],
        validation: { correctIndex: scenario.correctIndex },
        difficulty: scenario.difficulty ?? 'medium',
        accessibilitySummary,
        feedback: {
          correct: `Exact : ${answer}`,
          incorrect: `Dans ce contexte, la bonne conclusion est : ${answer}`,
          rule: scenario.rule ?? 'Un scénario se conclut sur une CONDITION vérifiée (confirmation), jamais sur une certitude.',
          whenItFails: scenario.whenItFails ?? 'Sans la condition (confirmation ou invalidation), le scénario reste une hypothèse.',
        },
      };
      return ex;
    }
  }
}

/** Exercices notés d'un ensemble de scénarios (l'unité pilote en dérive tout son contenu noté). */
export function buildScenarioExercises(scenarios: LearningScenario[]): Exercise[] {
  return scenarios.map(buildScenarioExercise);
}

/** Types d'interaction distincts couverts par un ensemble de scénarios (contrôle de diversité). */
export function scenarioInteractionTypes(scenarios: LearningScenario[]): ScenarioInteraction[] {
  return [...new Set(scenarios.map((s) => s.interaction))];
}

/** Index d'option attendu selon la tendance dérivée — utilisé par le test de cohérence. */
export const DIRECTION_INDEX_BY_TREND = DIRECTION_INDEX;

/** Mêmes bougies que celles rendues par les players d'un scénario graphique (tests de cohérence). */
export function scenarioCandles(
  scenario:
    | DirectionScenario
    | ExtremeZoneScenario
    | LabelExtremeScenario
    | PlaceExtremeScenario
    | PlaceInvalidationScenario,
): Candle[] {
  return generateCandles(scenario.chartSeed, SCENARIO_CANDLE_COUNT);
}
