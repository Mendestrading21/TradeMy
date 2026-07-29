/**
 * LOT 4-Y — Module guidé « Lire les payoffs d'options » (monde 14, `world.options`).
 *
 * Quatorzième module guidé réel, dérivé du registre canonique `CONTENT_MODULES`. Même
 * architecture : chaque item est un `LearningScenario` — UNE seule vérité par item.
 *
 * Principe pédagogique central : une option est un DROIT, pas une obligation — le payoff se lit
 * AVANT tout : perte bornée à la prime d'un côté, seuil de rentabilité de l'autre, et l'effet du
 * temps qui érode la valeur. Deux compétences, une par concept réel du monde :
 *   1. Le call (option d'achat) → `concept.options-basics`
 *   2. Le put (option de vente) → `concept.put-option`
 *
 * Objectifs ciblés = objectifs RÉELS (learningTarget) : les cinq natures sont documentées sur les
 * deux concepts. Honnêteté du modèle : les invalidations sont des ÉTATS à l'échéance (« sous le
 * strike », « au-dessus du strike ») — pas des planchers de prix d'une série → scénarios
 * conditionnels, AUCUN placement. Les reconnaissances rendent le PAYOFF réel des fiches
 * (`option-payoff`, calculé depuis le variant call/put — pas de dataset OHLC : `datasetKey` vide,
 * comme les fiches elles-mêmes qui n'en déclarent pas).
 * Statuts éditoriaux inchangés (`needsReview`). Aucun vocabulaire BUY/SELL — uniquement des
 * scénarios ÉDUCATIFS, sans exécution.
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const OPTIONS_MODULE_ID = 'module.options.read-payoffs';
export const OPTIONS_MODULE_TITLE = 'Lire les payoffs d’options';
export const OPTIONS_MODULE_WORLD_ID = 'world.options';
export const OPTIONS_CHECKPOINT_ID = 'checkpoint.options';
export const OPTIONS_CHECKPOINT_TITLE = 'Revue — Options et volatilité';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const OPTIONS_SKILLS: Skill[] = [
  { id: 'skill.options.call', name: 'Le call', description: 'Lire le payoff d’un call : perte bornée à la prime, seuil au strike + prime.' },
  { id: 'skill.options.put', name: 'Le put', description: 'Lire le payoff d’un put, miroir du call : seuil au strike − prime.' },
];

// Concepts réels du monde `world.options` reliés à chaque compétence.
const CALL = 'concept.options-basics';
const PUT = 'concept.put-option';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const OPTIONS_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.options.call': CALL,
  'skill.options.put': PUT,
};
export const OPTIONS_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.options.call': 'option-call',
  'skill.options.put': 'option-put',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — Le call ───────────────────────────────────────────
// recognize · interpret · confirm (scénario) · invalidate (scénario : « sous le strike à
// l'échéance » est un ÉTAT, pas un plancher de série → pas de placement) · avoid-false-signal.
const CALL_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.options.call.recognize',
    skillId: 'skill.options.call',
    target: target(CALL, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: '',
    variant: 'call',
    visualType: 'option-payoff',
    prompt: 'Que montre ce diagramme de payoff ?',
    options: ['Un call : perte bornée à la prime sous le strike, gain croissant au-delà du seuil', 'Une moyenne mobile sur les prix', 'Le volume échangé par séance'],
    correctIndex: 0,
    a11y: 'Le payoff d’un call à l’échéance : plat (perte = prime) sous le strike, puis montant au-delà, avec un seuil de rentabilité.',
    difficulty: 'easy',
    rule: 'Le call est un DROIT d’acheter au strike contre une prime : perte bornée à la prime, seuil de rentabilité au strike + prime.',
  },
  {
    id: 'ex.options.call.interpret',
    skillId: 'skill.options.call',
    target: target(CALL, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture éducative du payoff d’un call.',
    steps: [
      'Identifie la prime payée : c’est la perte maximale possible',
      'Repère le strike : le prix fixé par le droit',
      'Calcule le seuil de rentabilité : strike + prime',
      'Lis le payoff à l’échéance : plat sous le strike, croissant au-delà',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Prime d’abord, strike ensuite, seuil calculé, payoff lu — la perte est bornée avant même de commencer.',
  },
  {
    id: 'ex.options.call.confirm',
    skillId: 'skill.options.call',
    target: target(CALL, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Quand ce call devient-il gagnant dans ce scénario éducatif ?',
    context: 'Scénario éducatif : un call de strike 100 a coûté 5 de prime. L’échéance approche.',
    options: [
      'Au-dessus du seuil de rentabilité (strike + prime, soit 105) à l’échéance.',
      'Dès que le prix dépasse le strike (100), la prime n’a pas d’importance.',
      'Dès l’achat du call : le temps joue en sa faveur.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La zone de confirmation d’un call est AU-DESSUS du seuil de rentabilité (strike + prime) à l’échéance — pas au strike.',
  },
  {
    id: 'ex.options.call.invalidate',
    skillId: 'skill.options.call',
    target: target(CALL, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Que se passe-t-il si le scénario échoue ?',
    context: 'Scénario éducatif : à l’échéance, le prix termine SOUS le strike du call.',
    options: [
      'Le droit expire sans valeur : la perte est limitée à la prime payée.',
      'La perte est illimitée : il faut compenser la différence avec le strike.',
      'Rien : le call se prolonge automatiquement jusqu’au prochain mois.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Sous le strike à l’échéance, le call expire : la perte est LIMITÉE à la prime — c’est la définition même du droit.',
  },
  {
    id: 'ex.options.call.avoid',
    skillId: 'skill.options.call',
    target: target(CALL, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les calls.',
    statements: [
      'Une option perd de la valeur en approchant de l’échéance (effet du temps).',
      'Le temps ne change rien : une option garde sa valeur jusqu’à l’échéance.',
      'La perte maximale d’un call payé 5 de prime est 5.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — Le put ────────────────────────────────────────────
// recognize · interpret · confirm (scénario) · invalidate (scénario : « au-dessus du strike à
// l'échéance » est un ÉTAT, pas un plancher → pas de placement) · avoid-false-signal.
const PUT_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.options.put.recognize',
    skillId: 'skill.options.put',
    target: target(PUT, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: '',
    variant: 'put',
    visualType: 'option-payoff',
    prompt: 'Que montre ce diagramme de payoff ?',
    options: ['Un put : gain croissant sous le seuil, perte bornée à la prime au-dessus du strike', 'Un call : gain croissant au-dessus du strike', 'Un indicateur de volatilité'],
    correctIndex: 0,
    a11y: 'Le payoff d’un put à l’échéance : montant sous le strike, plat (perte = prime) au-dessus — le miroir du call.',
    difficulty: 'easy',
    rule: 'Le put est un DROIT de vendre au strike contre une prime : le miroir du call — il prend de la valeur quand le prix baisse.',
  },
  {
    id: 'ex.options.put.interpret',
    skillId: 'skill.options.put',
    target: target(PUT, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture éducative du payoff d’un put.',
    steps: [
      'Identifie la prime payée : c’est la perte maximale possible',
      'Repère le strike : le prix fixé par le droit de vendre',
      'Calcule le seuil de rentabilité : strike − prime',
      'Lis le payoff à l’échéance : croissant sous le seuil, plat au-dessus du strike',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Même méthode que le call, en miroir : le seuil d’un put est au strike MOINS la prime.',
  },
  {
    id: 'ex.options.put.confirm',
    skillId: 'skill.options.put',
    target: target(PUT, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Quand ce put devient-il gagnant dans ce scénario éducatif ?',
    context: 'Scénario éducatif : un put de strike 100 a coûté 5 de prime. L’échéance approche.',
    options: [
      'Sous le seuil de rentabilité (strike − prime, soit 95) à l’échéance.',
      'Dès que le prix passe sous le strike (100), la prime n’a pas d’importance.',
      'Quand le prix monte : un put suit la hausse.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La zone de confirmation d’un put est SOUS le seuil de rentabilité (strike − prime) à l’échéance — le miroir exact du call.',
  },
  {
    id: 'ex.options.put.invalidate',
    skillId: 'skill.options.put',
    target: target(PUT, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Que se passe-t-il si le scénario échoue ?',
    context: 'Scénario éducatif : à l’échéance, le prix termine AU-DESSUS du strike du put.',
    options: [
      'Le droit expire sans valeur : la perte est limitée à la prime payée.',
      'La perte grandit avec la hausse : elle n’a pas de limite.',
      'Le put se transforme automatiquement en call.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Au-dessus du strike à l’échéance, le put expire : la perte est LIMITÉE à la prime — le droit n’oblige à rien.',
  },
  {
    id: 'ex.options.put.avoid',
    skillId: 'skill.options.put',
    target: target(PUT, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les puts.',
    statements: [
      'La valeur temps d’un put s’érode à l’approche de l’échéance.',
      'La valeur temps est un détail : seul le strike compte jusqu’au dernier jour.',
      'La perte maximale d’un put payé 5 de prime est 5.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const OPTIONS_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.options.call': CALL_SCENARIOS,
  'skill.options.put': PUT_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const OPTIONS_MODULE_SCENARIOS: LearningScenario[] = OPTIONS_SKILLS.flatMap(
  (s) => OPTIONS_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const OPTIONS_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(OPTIONS_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
