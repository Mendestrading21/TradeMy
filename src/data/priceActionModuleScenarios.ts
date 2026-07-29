/**
 * LOT 4-T — Module guidé « Lire la price action » (monde 9, `world.price-action`).
 *
 * Neuvième module guidé réel, dérivé du registre canonique `CONTENT_MODULES`. Même architecture :
 * chaque item est un `LearningScenario` — UNE seule vérité par item. Aucune seconde source.
 *
 * Principe pédagogique central : avant tout indicateur, le prix raconte déjà tout — OÙ il réagit
 * (les zones), COMMENT il est repoussé (les mèches) et À QUEL RYTHME il avance (impulsions et
 * corrections). Trois compétences, une par concept réel du monde :
 *   1. Le prix nu             → `concept.price-action-intro`
 *   2. La mèche de rejet      → `concept.meche-de-rejet`
 *   3. Impulsion et correction → `concept.impulsion-et-correction`
 *
 * Objectifs ciblés = objectifs RÉELS (learningTarget). Honnêteté du modèle : AUCUN des trois
 * concepts ne documente d'invalidation → aucun objectif `invalidate` inventé, AUCUN placement
 * (4 mécaniques distinctes) ; la mèche de rejet et l'impulsion/correction ne documentent pas de
 * zone de confirmation → 3 exercices chacune. Statuts éditoriaux inchangés (`needsReview`).
 * Aucun vocabulaire BUY/SELL.
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const PRICEACTION_MODULE_ID = 'module.priceaction.read-price';
export const PRICEACTION_MODULE_TITLE = 'Lire la price action';
export const PRICEACTION_MODULE_WORLD_ID = 'world.price-action';
export const PRICEACTION_CHECKPOINT_ID = 'checkpoint.priceaction';
export const PRICEACTION_CHECKPOINT_TITLE = 'Revue — Price action';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const PRICEACTION_SKILLS: Skill[] = [
  { id: 'skill.priceaction.reading', name: 'Le prix nu', description: 'Lire le comportement du prix par sa structure, avant tout indicateur.' },
  { id: 'skill.priceaction.wick', name: 'La mèche de rejet', description: 'Lire une longue mèche comme un rejet — seulement sur une zone.' },
  { id: 'skill.priceaction.impulse', name: 'Impulsion et correction', description: 'Distinguer la poussée (impulsion) de la respiration (correction).' },
];

// Concepts réels du monde `world.price-action` reliés à chaque compétence.
const READING = 'concept.price-action-intro';
const WICK = 'concept.meche-de-rejet';
const IMPULSE = 'concept.impulsion-et-correction';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const PRICEACTION_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.priceaction.reading': READING,
  'skill.priceaction.wick': WICK,
  'skill.priceaction.impulse': IMPULSE,
};
export const PRICEACTION_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.priceaction.reading': 'price-action',
  'skill.priceaction.wick': 'meche-de-rejet',
  'skill.priceaction.impulse': 'impulsion-et-correction',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — Le prix nu ────────────────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
const READING_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.priceaction.reading.recognize',
    skillId: 'skill.priceaction.reading',
    target: target(READING, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.support-resistance.v1',
    variant: 'support-resistance',
    visualType: 'market-structure',
    prompt: 'Sans indicateur, que lit-on d’abord sur ce graphique ?',
    options: ['Le comportement du prix : ses zones de réaction et sa structure', 'La valeur du RSI', 'Le croisement de deux moyennes'],
    correctIndex: 0,
    a11y: 'Un graphique nu : le prix réagit à des zones, sans aucun indicateur.',
    difficulty: 'easy',
    rule: 'La price action lit le prix lui-même : ses zones de réaction et sa structure — avant tout indicateur.',
  },
  {
    id: 'ex.priceaction.reading.interpret',
    skillId: 'skill.priceaction.reading',
    target: target(READING, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre une lecture de price action.',
    steps: [
      'Repère les zones où le prix a déjà réagi',
      'Observe la structure (sommets et creux)',
      'Lis les bougies À ces zones (pas isolément)',
      'Décide de ce que la réaction confirme ou non',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'On lit zones d’abord, structure ensuite, bougies enfin — une bougie ne se lit jamais hors contexte.',
  },
  {
    id: 'ex.priceaction.reading.confirm',
    skillId: 'skill.priceaction.reading',
    target: target(READING, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette lecture ?',
    context: 'Le prix revient sur une zone qui a déjà réagi deux fois. Il ralentit, forme un creux plus haut, et la structure reste haussière.',
    options: [
      'La RÉACTION du prix à la zone, confirmée par la structure — c’est la base de la price action.',
      'Le simple retour sur la zone : il garantit un rebond.',
      'Rien : sans indicateur, aucune lecture n’est possible.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La lecture se confirme par la réaction du prix aux niveaux, appuyée par la structure.',
  },
  {
    id: 'ex.priceaction.reading.avoid',
    skillId: 'skill.priceaction.reading',
    target: target(READING, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur la price action.',
    statements: [
      'La price action lit le prix par sa structure et ses zones.',
      'Une bougie s’interprète très bien sans regarder où elle se situe.',
      'La réaction du prix à un niveau se lit avec la structure.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — La mèche de rejet ─────────────────────────────────
// recognize · interpret · avoid-false-signal UNIQUEMENT (ni confirmation ni invalidation documentées).
const WICK_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.priceaction.wick.recognize',
    skillId: 'skill.priceaction.wick',
    target: target(WICK, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.hammer.v1',
    variant: 'rejection',
    visualType: 'candlestick-pattern',
    prompt: 'Que raconte cette longue mèche ?',
    options: ['Un rejet : le prix a été repoussé de la zone explorée', 'Une garantie de retournement immédiat', 'Un signal d’indicateur'],
    correctIndex: 0,
    a11y: 'Une bougie à longue mèche : le prix a exploré une zone puis a été repoussé.',
    difficulty: 'easy',
    rule: 'Une longue mèche montre que le prix a exploré une zone et en a été repoussé — un rejet, pas une garantie.',
  },
  {
    id: 'ex.priceaction.wick.interpret',
    skillId: 'skill.priceaction.wick',
    target: target(WICK, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’une mèche de rejet.',
    steps: [
      'Repère la longue mèche sur la bougie',
      'Vérifie OÙ elle se produit : sur une zone connue ?',
      'Lis le sens du rejet (repoussé vers le haut ou le bas)',
      'Attends la suite : un rejet se lit avec le contexte, jamais seul',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Une mèche se lit mèche d’abord, ZONE ensuite — sans zone, ce n’est que du bruit.',
  },
  {
    id: 'ex.priceaction.wick.avoid',
    skillId: 'skill.priceaction.wick',
    target: target(WICK, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur la mèche de rejet.',
    statements: [
      'Une longue mèche montre que le prix a été repoussé d’une zone.',
      'Toute longue mèche est un rejet, peu importe où elle se produit.',
      'Une longue mèche sans zone est du bruit plutôt qu’un rejet.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 3 — Impulsion et correction ───────────────────────────
// recognize · interpret · avoid-false-signal UNIQUEMENT (ni confirmation ni invalidation documentées).
const IMPULSE_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.priceaction.impulse.recognize',
    skillId: 'skill.priceaction.impulse',
    target: target(IMPULSE, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.uptrend.v1',
    variant: 'impulse-correction',
    visualType: 'market-structure',
    prompt: 'Comment ce prix avance-t-il ?',
    options: ['Par poussées (impulsions) entrecoupées de respirations (corrections)', 'En ligne droite, sans pause', 'Au hasard, sans aucun rythme lisible'],
    correctIndex: 0,
    a11y: 'Une progression par poussées suivies de respirations : impulsions et corrections alternent.',
    difficulty: 'easy',
    rule: 'Le prix avance par impulsions (poussées) entrecoupées de corrections (respirations).',
  },
  {
    id: 'ex.priceaction.impulse.interpret',
    skillId: 'skill.priceaction.impulse',
    target: target(IMPULSE, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture du rythme du prix.',
    steps: [
      'Repère la poussée : des bougies dynamiques dans un sens',
      'Repère la respiration : un repli plus lent et contenu',
      'Compare leur ampleur : la correction reste-t-elle partielle ?',
      'Méfie-toi d’une correction profonde : le rythme change peut-être',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Impulsion d’abord, correction ensuite — et l’ampleur relative de la correction se surveille toujours.',
  },
  {
    id: 'ex.priceaction.impulse.avoid',
    skillId: 'skill.priceaction.impulse',
    target: target(IMPULSE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur impulsion et correction.',
    statements: [
      'Une impulsion est une poussée dynamique du prix.',
      'Une correction profonde et une simple respiration, c’est pareil.',
      'Une correction est un repli plus lent et contenu après la poussée.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const PRICEACTION_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.priceaction.reading': READING_SCENARIOS,
  'skill.priceaction.wick': WICK_SCENARIOS,
  'skill.priceaction.impulse': IMPULSE_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const PRICEACTION_MODULE_SCENARIOS: LearningScenario[] = PRICEACTION_SKILLS.flatMap(
  (s) => PRICEACTION_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const PRICEACTION_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(PRICEACTION_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
