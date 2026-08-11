/**
 * LOT 4-Z — Module guidé « Déjouer les faux signaux » (monde 15, `world.false-signals`).
 *
 * QUINZIÈME et DERNIER module guidé : le parcours entier (mondes 1..15) est désormais guidé.
 * Dérivé du registre canonique `CONTENT_MODULES`. Même architecture : chaque item est un
 * `LearningScenario` — UNE seule vérité par item. Aucune seconde source.
 *
 * Principe pédagogique central : la compétence finale du parcours est de savoir quand NE PAS
 * croire un signal — une mèche qui perce sans clôture n'est pas une cassure ; un franchissement
 * aussitôt annulé est un piège. La clôture confirmée fait foi, dans les deux sens. Deux
 * compétences, une par concept réel du monde :
 *   1. Le faux signal (fakeout) → `concept.fakeout`
 *   2. Le faux breakout          → `concept.faux-breakout`
 *
 * Objectifs ciblés = objectifs RÉELS (learningTarget). Honnêteté du modèle : l'« invalidation »
 * du fakeout est une CLÔTURE CONFIRMÉE AU-DELÀ du niveau (la cassure devient valide) — un
 * événement au-dessus, pas un plancher → scénario conditionnel, aucun placement.
 *
 * LOT D1 — le faux breakout documente DÉSORMAIS une zone de confirmation ET une invalidation
 * (enrichies par le LOT E3, ADR-133) : la compétence les exerce, alors qu'elle s'arrêtait à
 * 3 natures quand ces champs étaient vides. Les deux ajouts sont DÉRIVÉS des champs réels
 * (`confirmationZone`, `neutralScenario.conditions`, `invalidation`) — rien n'est inventé. Comme
 * pour le fakeout, son invalidation est un événement AU-DELÀ du niveau : elle se raisonne.
 * Statuts éditoriaux inchangés (`needsReview`). Aucun vocabulaire BUY/SELL — uniquement des
 * scénarios ÉDUCATIFS (entrée théorique, invalidation, objectif pédagogique).
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const FALSESIGNALS_MODULE_ID = 'module.falsesignals.read-fakeouts';
export const FALSESIGNALS_MODULE_TITLE = 'Déjouer les faux signaux';
export const FALSESIGNALS_MODULE_WORLD_ID = 'world.false-signals';
export const FALSESIGNALS_CHECKPOINT_ID = 'checkpoint.falsesignals';
export const FALSESIGNALS_CHECKPOINT_TITLE = 'Revue — Faux signaux';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const FALSESIGNALS_SKILLS: Skill[] = [
  { id: 'skill.falsesignals.fakeout', name: 'Le faux signal', description: 'Reconnaître la mèche qui perce sans clôture — et exiger la clôture confirmée.' },
  { id: 'skill.falsesignals.breakout', name: 'Le faux breakout', description: 'Reconnaître la cassure qui échoue et revient aussitôt dans la zone.' },
];

// Concepts réels du monde `world.false-signals` reliés à chaque compétence.
const FAKEOUT = 'concept.fakeout';
const FAUX_BREAKOUT = 'concept.faux-breakout';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const FALSESIGNALS_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.falsesignals.fakeout': FAKEOUT,
  'skill.falsesignals.breakout': FAUX_BREAKOUT,
};
export const FALSESIGNALS_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.falsesignals.fakeout': 'faux-signal',
  'skill.falsesignals.breakout': 'faux-breakout',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — Le faux signal (fakeout) ──────────────────────────
// recognize · interpret · confirm (scénario : le RETOUR sous le niveau confirme le fakeout) ·
// invalidate (scénario : clôture confirmée AU-DELÀ = la cassure devient valide — un événement
// au-dessus, pas un plancher → pas de placement) · avoid-false-signal.
const FAKEOUT_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.falsesignals.fakeout.recognize',
    skillId: 'skill.falsesignals.fakeout',
    target: target(FAKEOUT, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.fakeout.v1',
    variant: 'fakeout',
    visualType: 'chart-pattern',
    prompt: 'Que montre ce franchissement bref, aussitôt annulé ?',
    options: ['Un faux signal : le niveau est percé sans clôture, puis le prix revient de l’autre côté', 'Une cassure valide et confirmée', 'Un simple doji sans contexte'],
    correctIndex: 0,
    a11y: 'Un niveau percé par une mèche, sans clôture au-delà, puis un retour immédiat de l’autre côté : le faux signal type.',
    difficulty: 'easy',
    rule: 'Le fakeout est un franchissement bref aussitôt annulé : une mèche au-delà d’un niveau n’est pas une cassure.',
  },
  {
    id: 'ex.falsesignals.fakeout.interpret',
    skillId: 'skill.falsesignals.fakeout',
    target: target(FAKEOUT, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture éducative d’un faux signal.',
    steps: [
      'Repère le niveau surveillé (support, résistance, bord de range)',
      'Observe le franchissement : mèche au-delà, sans clôture',
      'Constate le retour rapide de l’autre côté du niveau',
      'Conclus : la « cassure » était un piège — le niveau tient',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Niveau, mèche sans clôture, retour, conclusion : le film du fakeout se lit toujours dans cet ordre.',
  },
  {
    id: 'ex.falsesignals.fakeout.confirm',
    skillId: 'skill.falsesignals.fakeout',
    target: target(FAKEOUT, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme le faux signal dans ce scénario ?',
    context: 'Scénario éducatif : une mèche perce la résistance surveillée, sans clôture au-delà. La bougie suivante s’installe sous le niveau.',
    options: [
      'Le retour sous le niveau, après la mèche qui l’a percé sans clôture.',
      'La taille de la mèche : plus elle est longue, plus la cassure est valide.',
      'Le simple contact avec le niveau.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Le fakeout se confirme par le RETOUR sous le niveau après la mèche sans clôture — le niveau a tenu.',
  },
  {
    id: 'ex.falsesignals.fakeout.invalidate',
    skillId: 'skill.falsesignals.fakeout',
    target: target(FAKEOUT, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui invalide la lecture « faux signal » ?',
    context: 'Scénario éducatif : après la mèche, le prix CLÔTURE franchement au-delà du niveau, puis s’y maintient.',
    options: [
      'La clôture confirmée au-delà du niveau : la cassure devient valide, le scénario « fakeout » s’abandonne.',
      'Rien : une fois qualifié de fakeout, un mouvement le reste.',
      'Le volume faible : il transforme toute cassure en faux signal.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Une clôture confirmée au-delà du niveau invalide la lecture « fakeout » : la cassure est devenue valide — l’hypothèse s’abandonne.',
  },
  {
    id: 'ex.falsesignals.fakeout.avoid',
    skillId: 'skill.falsesignals.fakeout',
    target: target(FAKEOUT, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les faux signaux.',
    statements: [
      'Une mèche au-delà d’un niveau, sans clôture, n’est pas une cassure.',
      'Chaque mèche au-delà d’un niveau est une cassure qui se joue immédiatement.',
      'La clôture confirmée est ce qui sépare une cassure valide d’un fakeout.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — Le faux breakout ──────────────────────────────────
// recognize · interpret · avoid-false-signal — 3 natures seulement : la fiche ne documente NI
// zone de confirmation NI invalidation (aucun objectif inventé, honnêteté du modèle).
const FAUX_BREAKOUT_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.falsesignals.breakout.recognize',
    skillId: 'skill.falsesignals.breakout',
    target: target(FAUX_BREAKOUT, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.fakeout.v1',
    variant: 'fakeout',
    visualType: 'market-structure',
    prompt: 'Que raconte cette cassure qui revient aussitôt dans la zone ?',
    options: ['Un faux breakout : la cassure a échoué, le prix est revenu dans la zone', 'Une cassure réussie qui continue', 'Un range parfaitement respecté'],
    correctIndex: 0,
    a11y: 'Le prix franchit un niveau puis revient aussitôt dans la zone : la cassure a échoué.',
    difficulty: 'easy',
    rule: 'Le faux breakout est une cassure qui échoue : le prix franchit le niveau puis revient aussitôt dans la zone.',
  },
  {
    id: 'ex.falsesignals.breakout.interpret',
    skillId: 'skill.falsesignals.breakout',
    target: target(FAUX_BREAKOUT, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture éducative d’un faux breakout.',
    steps: [
      'Le prix franchit un niveau surveillé',
      'Le mouvement ne tient pas : aucune poursuite ne s’installe',
      'Le prix revient aussitôt dans la zone d’origine',
      'Conclus : la cassure a échoué — prudence sur les cassures sans preuve',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Franchissement, absence de poursuite, retour dans la zone, conclusion : l’échec d’une cassure se constate, il ne se devine pas.',
  },
  {
    // Dérivé de `confirmationZone` : « le retour à l’intérieur : après le dépassement, une clôture
    // de nouveau dans la zone d’origine signe le faux signal » + les conditions de `neutralScenario`.
    id: 'ex.falsesignals.breakout.confirm',
    skillId: 'skill.falsesignals.breakout',
    target: target(FAUX_BREAKOUT, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui signe le faux breakout ?',
    context:
      'Le prix a brièvement dépassé un niveau surveillé, en mèche, sans enchaîner de clôtures au-delà.',
    options: [
      'Une clôture de nouveau DANS la zone d’origine : le retour à l’intérieur signe le faux signal.',
      'Le simple fait que la mèche ait dépassé le niveau.',
      'La taille de la mèche : plus elle est longue, plus le faux signal est certain.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Ce qui signe un faux breakout, c’est le RETOUR : une clôture de nouveau dans la zone d’origine.',
    whenItFails: 'Tant que le prix reste au-delà du niveau, rien n’est signé : la cassure peut être réelle.',
    a11y:
      'Contexte : un dépassement bref d’un niveau surveillé, en mèche, sans clôture tenue au-delà. Trois conclusions possibles à départager.',
  },
  {
    // Dérivé de `invalidation` : « le prix reste au-delà du niveau et y enchaîne les clôtures ».
    // Événement AU-DELÀ du niveau, pas un plancher → scénario conditionnel, aucun placement.
    id: 'ex.falsesignals.breakout.invalidate',
    skillId: 'skill.falsesignals.breakout',
    target: target(FAUX_BREAKOUT, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui démentirait la lecture « faux breakout » ?',
    context:
      'Tu as lu le dépassement comme un faux signal. Tu cherches ce qui prouverait le contraire.',
    options: [
      'Le prix RESTE au-delà du niveau et y enchaîne les clôtures : la cassure était réelle.',
      'Le prix revient toucher le niveau par en dessous une seule fois.',
      'Le volume baisse après le dépassement.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'La lecture « faux breakout » tombe dès que les clôtures s’enchaînent AU-DELÀ du niveau.',
    whenItFails: 'S’entêter à voir un piège dans une cassure qui tient, c’est manquer ce que le marché a déjà tranché.',
    a11y:
      'Contexte : un dépassement de niveau lu comme un faux signal ; il s’agit d’identifier ce qui prouverait le contraire. Trois propositions à départager.',
  },
  {
    id: 'ex.falsesignals.breakout.avoid',
    skillId: 'skill.falsesignals.breakout',
    target: target(FAUX_BREAKOUT, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les faux breakouts.',
    statements: [
      'Toute mèche au-delà d’un niveau n’est pas un fakeout : le retour dans la zone doit se constater.',
      'Dès qu’une mèche dépasse un niveau, c’est forcément un faux breakout.',
      'Une cassure sans poursuite qui revient dans la zone est un breakout raté.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const FALSESIGNALS_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.falsesignals.fakeout': FAKEOUT_SCENARIOS,
  'skill.falsesignals.breakout': FAUX_BREAKOUT_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const FALSESIGNALS_MODULE_SCENARIOS: LearningScenario[] = FALSESIGNALS_SKILLS.flatMap(
  (s) => FALSESIGNALS_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const FALSESIGNALS_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(FALSESIGNALS_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
