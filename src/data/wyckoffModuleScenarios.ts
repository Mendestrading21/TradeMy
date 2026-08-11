/**
 * LOT 4-X — Module guidé « Lire les phases Wyckoff » (monde 13, `world.wyckoff`).
 *
 * Treizième module guidé réel, dérivé du registre canonique `CONTENT_MODULES`. Même architecture :
 * chaque item est un `LearningScenario` — UNE seule vérité par item. Aucune seconde source.
 *
 * Principe pédagogique central : les grandes phases se lisent dans les ranges — une base où
 * l'offre s'épuise (accumulation) ou un sommet où l'offre absorbe la demande (distribution).
 * Le contexte décide : un range sans contexte n'est ni l'un ni l'autre. Deux compétences, une
 * par concept réel du monde :
 *   1. L'accumulation  → `concept.wyckoff-accumulation`
 *   2. La distribution → `concept.distribution-wyckoff`
 *
 * Objectifs ciblés = objectifs RÉELS (learningTarget). L'accumulation documente les 5 natures, et
 * son invalidation est un PLANCHER (« rupture par le bas de la zone d'accumulation ») → seul
 * exercice de placement du module.
 *
 * LOT D1 — la distribution documente DÉSORMAIS une zone de confirmation ET une invalidation
 * (enrichies par le LOT E3, ADR-133) : la compétence les exerce, alors qu'elle s'arrêtait à
 * 3 natures quand ces champs étaient vides. Les deux ajouts sont DÉRIVÉS des champs réels
 * (`confirmationZone`, `bearishScenario.conditions`, `invalidation`) — rien n'est inventé. Son
 * invalidation est une clôture AU-DESSUS du sommet du range : ce n'est pas un plancher, elle se
 * raisonne (scénario) plutôt qu'elle ne se place.
 * Statuts éditoriaux inchangés (`needsReview`). Aucun vocabulaire BUY/SELL — uniquement des
 * scénarios ÉDUCATIFS (entrée théorique, invalidation, objectif pédagogique).
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const WYCKOFF_MODULE_ID = 'module.wyckoff.read-phases';
export const WYCKOFF_MODULE_TITLE = 'Lire les phases Wyckoff';
export const WYCKOFF_MODULE_WORLD_ID = 'world.wyckoff';
export const WYCKOFF_CHECKPOINT_ID = 'checkpoint.wyckoff';
export const WYCKOFF_CHECKPOINT_TITLE = 'Revue — Phases Wyckoff';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const WYCKOFF_SKILLS: Skill[] = [
  { id: 'skill.wyckoff.accumulation', name: 'L’accumulation', description: 'Lire la base en range où l’offre s’épuise — et placer l’invalidation sous la zone.' },
  { id: 'skill.wyckoff.distribution', name: 'La distribution', description: 'Reconnaître le range en sommet où l’offre absorbe la demande — le contexte décide.' },
];

// Concepts réels du monde `world.wyckoff` reliés à chaque compétence.
const ACCUMULATION = 'concept.wyckoff-accumulation';
const DISTRIBUTION = 'concept.distribution-wyckoff';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const WYCKOFF_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.wyckoff.accumulation': ACCUMULATION,
  'skill.wyckoff.distribution': DISTRIBUTION,
};
export const WYCKOFF_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.wyckoff.accumulation': 'wyckoff-accumulation',
  'skill.wyckoff.distribution': 'distribution-wyckoff',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — L'accumulation ────────────────────────────────────
// recognize · interpret · confirm (scénario) · invalidate (PLACEMENT : « rupture par le bas de
// la zone » = plancher documenté → l'apprenant place lui-même l'invalidation) · avoid-false-signal.
const ACCUMULATION_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.wyckoff.accumulation.recognize',
    skillId: 'skill.wyckoff.accumulation',
    target: target(ACCUMULATION, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.accumulation.v1',
    variant: 'accumulation',
    visualType: 'chart-pattern',
    prompt: 'Que raconte cette longue base en range ?',
    options: ['Une accumulation : l’offre s’épuise, souvent suivie d’une sortie par le haut', 'Une tendance baissière qui s’accélère', 'Un simple bruit sans structure'],
    correctIndex: 0,
    a11y: 'Une longue base horizontale après une baisse : le prix oscille dans un range pendant que l’offre s’épuise.',
    difficulty: 'easy',
    rule: 'L’accumulation est une longue base en range où l’offre s’épuise — souvent suivie d’une sortie par le haut, jamais garantie.',
  },
  {
    id: 'ex.wyckoff.accumulation.interpret',
    skillId: 'skill.wyckoff.accumulation',
    target: target(ACCUMULATION, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture éducative d’une accumulation.',
    steps: [
      'Repère une longue base en range après une baisse',
      'Observe l’épuisement progressif de l’offre dans la base',
      'Surveille les bords : le haut (sortie) et le bas (rupture)',
      'Attends la sortie confirmée par le haut, avec structure et participation',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Base d’abord, épuisement ensuite, bords surveillés, sortie confirmée enfin — l’ordre ne s’improvise pas.',
  },
  {
    id: 'ex.wyckoff.accumulation.confirm',
    skillId: 'skill.wyckoff.accumulation',
    target: target(ACCUMULATION, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme la sortie d’accumulation ?',
    context: 'Scénario éducatif : après une longue base en range, le prix pousse au-dessus du haut de la base.',
    options: [
      'La sortie confirmée par le haut de la base, avec la structure et la participation.',
      'Le premier contact avec le haut du range : toucher = sortir.',
      'La durée seule : après assez de temps, la sortie est automatique.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La confirmation est la sortie par le haut de la base — appuyée par la structure et la participation, pas par le simple contact.',
  },
  {
    id: 'ex.wyckoff.accumulation.invalidate',
    skillId: 'skill.wyckoff.accumulation',
    target: target(ACCUMULATION, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 613,
    prompt: 'Place l’invalidation : sous quel plancher cette accumulation ne tient plus ?',
    difficulty: 'hard',
    rule: 'Une rupture par le bas de la zone d’accumulation invalide le scénario : le plancher se place sous le plus bas réel de la base.',
  },
  {
    id: 'ex.wyckoff.accumulation.avoid',
    skillId: 'skill.wyckoff.accumulation',
    target: target(ACCUMULATION, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur l’accumulation.',
    statements: [
      'Une fausse sortie par le haut, aussitôt ramenée dans la base, est un piège classique.',
      'Toute poussée au-dessus de la base est une sortie définitive : inutile d’attendre la confirmation.',
      'La sortie se confirme avec la structure et la participation.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — La distribution ───────────────────────────────────
// recognize · interpret · avoid-false-signal — 3 natures seulement : la fiche ne documente NI
// zone de confirmation NI invalidation (aucun objectif inventé, honnêteté du modèle).
const DISTRIBUTION_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.wyckoff.distribution.recognize',
    skillId: 'skill.wyckoff.distribution',
    target: target(DISTRIBUTION, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.support-resistance.v1',
    variant: 'distribution',
    visualType: 'market-structure',
    prompt: 'Que raconte ce range qui plafonne une hausse ?',
    options: ['Une distribution possible : l’offre absorbe progressivement la demande', 'Une accélération haussière imminente et certaine', 'Un range sans aucune signification'],
    correctIndex: 0,
    a11y: 'Un range en sommet après une hausse : le prix plafonne pendant que l’offre absorbe la demande.',
    difficulty: 'easy',
    rule: 'La distribution est un range EN SOMMET où l’offre absorbe la demande — le contexte (après une hausse) est indispensable.',
  },
  {
    id: 'ex.wyckoff.distribution.interpret',
    skillId: 'skill.wyckoff.distribution',
    target: target(DISTRIBUTION, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture éducative d’une distribution.',
    steps: [
      'Vérifie le contexte : une hausse précède le range',
      'Observe le plafonnement : les poussées ne tiennent plus',
      'Note l’absorption : l’offre absorbe progressivement la demande',
      'Reste prudent : un range ne se qualifie qu’avec son contexte',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Contexte d’abord, plafonnement ensuite, absorption observée, prudence toujours — un range seul ne dit rien.',
  },
  {
    // Dérivé de `confirmationZone` : « la sortie par le bas : une clôture sous le plancher du
    // range, souvent après un balayage du haut resté sans suite » + les conditions de
    // `bearishScenario`.
    id: 'ex.wyckoff.distribution.confirm',
    skillId: 'skill.wyckoff.distribution',
    target: target(DISTRIBUTION, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette lecture de distribution ?',
    context:
      'Après une hausse marquée, le prix évolue dans un range dont les sommets ne progressent plus ; un balayage du haut vient de rester sans suite.',
    options: [
      'Une clôture sous le PLANCHER du range : la sortie se fait par le bas.',
      'Le balayage du haut suffit : il signe à lui seul la distribution.',
      'Un range de plus de vingt bougies : la durée qualifie la distribution.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Une distribution se confirme par la SORTIE par le bas — une clôture sous le plancher du range.',
    whenItFails: 'Tant que le plancher tient, le range peut n’être qu’une pause avant continuation.',
    a11y:
      'Contexte : après une hausse, un range aux sommets qui ne progressent plus, avec un balayage du haut sans suite. Trois conclusions possibles à départager.',
  },
  {
    // Dérivé de `invalidation` : « une clôture franche au-dessus du sommet du range, tenue
    // ensuite ». L'invalidation est un PLAFOND, pas un plancher : elle se raisonne, ne se place pas.
    id: 'ex.wyckoff.distribution.invalidate',
    skillId: 'skill.wyckoff.distribution',
    target: target(DISTRIBUTION, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui démentirait cette lecture de distribution ?',
    context:
      'Tu lis un range en sommet comme une distribution possible. Tu cherches ce qui invaliderait cette lecture.',
    options: [
      'Une clôture franche au-dessus du sommet du range, tenue ensuite : ce n’était pas une distribution.',
      'Une seule mèche qui dépasse le sommet du range avant de refermer dedans.',
      'Un range qui dure plus longtemps que prévu.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'La lecture de distribution tombe sur une clôture franche AU-DESSUS du sommet du range, tenue ensuite.',
    whenItFails: 'Une mèche seule ne dément rien : c’est la clôture tenue qui tranche.',
    a11y:
      'Contexte : un range en sommet lu comme une distribution possible ; il s’agit d’identifier ce qui invaliderait cette lecture. Trois propositions à départager.',
  },
  {
    id: 'ex.wyckoff.distribution.avoid',
    skillId: 'skill.wyckoff.distribution',
    target: target(DISTRIBUTION, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur la distribution.',
    statements: [
      'La distribution se lit dans son contexte : un range qui plafonne une hausse.',
      'Tout range est une distribution, quel que soit le contexte.',
      'Dans la distribution, l’offre absorbe progressivement la demande.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const WYCKOFF_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.wyckoff.accumulation': ACCUMULATION_SCENARIOS,
  'skill.wyckoff.distribution': DISTRIBUTION_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const WYCKOFF_MODULE_SCENARIOS: LearningScenario[] = WYCKOFF_SKILLS.flatMap(
  (s) => WYCKOFF_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const WYCKOFF_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(WYCKOFF_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
