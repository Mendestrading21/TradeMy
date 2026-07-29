/**
 * LOT 4-W — Module guidé « Lire le Smart Money » (monde 12, `world.smc`).
 *
 * Douzième module guidé réel, dérivé du registre canonique `CONTENT_MODULES`. Même architecture :
 * chaque item est un `LearningScenario` — UNE seule vérité par item. Aucune seconde source.
 *
 * Principe pédagogique central : le prix laisse des traces (zones de départ, déséquilibres,
 * cassures à contre-tendance) qui sont des ZONES D'INTÉRÊT à surveiller — jamais des signaux.
 * La réaction observée du prix, avec la structure, fait foi. Cinq compétences, une par concept
 * réel du monde :
 *   1. L'order block             → `concept.order-block`
 *   2. Le fair value gap         → `concept.fair-value-gap`
 *   3. Le changement de caractère→ `concept.change-of-character`
 *   4. La zone de demande        → `concept.demand-zone`
 *   5. La zone d'offre           → `concept.supply-zone`
 *
 * Objectifs ciblés = objectifs RÉELS (learningTarget) : les cinq natures sont documentées sur les
 * cinq concepts. Honnêteté du placement : SEULE la zone de demande s'invalide par un PLANCHER
 * (« clôture franche SOUS la zone ») → seul exercice de placement du module. L'order block
 * (traversée sans réaction), le FVG (éloignement durable), le CHoCH (reprise de la tendance) et
 * la zone d'offre (clôture AU-DESSUS — pas un plancher) s'exercent par scénario conditionnel.
 * Statuts éditoriaux inchangés (`needsReview`). Aucun vocabulaire BUY/SELL — uniquement des
 * scénarios ÉDUCATIFS (entrée théorique, invalidation, objectif pédagogique).
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const SMC_MODULE_ID = 'module.smc.read-smart-money';
export const SMC_MODULE_TITLE = 'Lire le Smart Money';
export const SMC_MODULE_WORLD_ID = 'world.smc';
export const SMC_CHECKPOINT_ID = 'checkpoint.smc';
export const SMC_CHECKPOINT_TITLE = 'Revue — Smart Money Concepts';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const SMC_SKILLS: Skill[] = [
  { id: 'skill.smc.orderblock', name: 'L’order block', description: 'Repérer la dernière bougie opposée avant l’impulsion — une zone d’intérêt, jamais un signal.' },
  { id: 'skill.smc.fvg', name: 'Le fair value gap', description: 'Lire le déséquilibre à trois bougies laissé par une impulsion.' },
  { id: 'skill.smc.choch', name: 'Le changement de caractère', description: 'Reconnaître la première cassure à contre-tendance qui remet la séquence en cause.' },
  { id: 'skill.smc.demand', name: 'La zone de demande', description: 'Identifier la zone d’où le prix est parti à la hausse — un support à surveiller.' },
  { id: 'skill.smc.supply', name: 'La zone d’offre', description: 'Identifier la zone d’où le prix est parti à la baisse — une résistance à surveiller.' },
];

// Concepts réels du monde `world.smc` reliés à chaque compétence.
const OB = 'concept.order-block';
const FVG = 'concept.fair-value-gap';
const CHOCH = 'concept.change-of-character';
const DEMAND = 'concept.demand-zone';
const SUPPLY = 'concept.supply-zone';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const SMC_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.smc.orderblock': OB,
  'skill.smc.fvg': FVG,
  'skill.smc.choch': CHOCH,
  'skill.smc.demand': DEMAND,
  'skill.smc.supply': SUPPLY,
};
export const SMC_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.smc.orderblock': 'order-block',
  'skill.smc.fvg': 'fair-value-gap',
  'skill.smc.choch': 'changement-de-caractere',
  'skill.smc.demand': 'zone-de-demande',
  'skill.smc.supply': 'zone-d-offre',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — L'order block ─────────────────────────────────────
// recognize · interpret · confirm (scénario) · invalidate (scénario : traversée SANS réaction,
// un événement — pas un plancher) · avoid-false-signal.
const OB_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.smc.orderblock.recognize',
    skillId: 'skill.smc.orderblock',
    target: target(OB, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.order-block.v1',
    variant: 'order-block',
    visualType: 'chart-pattern',
    prompt: 'Qu’est-ce qu’un order block sur ce graphique ?',
    options: ['La dernière bougie de sens opposé avant la forte impulsion', 'La plus grande bougie de la série', 'N’importe quelle bougie rouge'],
    correctIndex: 0,
    a11y: 'Une dernière bougie opposée, suivie d’une forte impulsion : la zone que le prix revisite souvent.',
    difficulty: 'easy',
    rule: 'L’order block est la dernière bougie de sens opposé avant une forte impulsion — une zone d’intérêt éducative, jamais un signal.',
  },
  {
    id: 'ex.smc.orderblock.interpret',
    skillId: 'skill.smc.orderblock',
    target: target(OB, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture éducative d’un order block.',
    steps: [
      'Repère une forte impulsion directionnelle',
      'Identifie la dernière bougie de sens opposé juste avant',
      'Marque cette zone comme zone d’intérêt à surveiller',
      'Attends le retour du prix et observe sa réaction avec la structure',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Impulsion d’abord, dernière bougie opposée ensuite, zone marquée, puis OBSERVATION de la réaction — jamais d’action automatique.',
  },
  {
    id: 'ex.smc.orderblock.confirm',
    skillId: 'skill.smc.orderblock',
    target: target(OB, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme l’intérêt de cette zone ?',
    context: 'Scénario éducatif : le prix revient dans un order block marqué après une impulsion haussière.',
    options: [
      'La réaction observée du prix au retour dans la zone, en accord avec la structure.',
      'Le simple fait que la zone existe : tout retour est une opportunité.',
      'La couleur de la bougie qui revient dans la zone.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Une zone ne vaut que par la réaction observée du prix à son retour — avec la structure, jamais seule.',
  },
  {
    id: 'ex.smc.orderblock.invalidate',
    skillId: 'skill.smc.orderblock',
    target: target(OB, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui invalide cette zone d’intérêt ?',
    context: 'Scénario éducatif : le prix revient dans l’order block… et le traverse de part en part, sans aucune réaction.',
    options: [
      'La traversée franche de la zone sans réaction : la zone n’a plus d’intérêt.',
      'Rien : un order block reste valable indéfiniment.',
      'Le temps qui passe : après une heure, la zone devient plus forte.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Une traversée franche sans réaction invalide la zone — l’hypothèse est abandonnée, pas « repoussée ».',
  },
  {
    id: 'ex.smc.orderblock.avoid',
    skillId: 'skill.smc.orderblock',
    target: target(OB, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les order blocks.',
    statements: [
      'Un order block est une zone d’intérêt à surveiller, jamais un signal.',
      'Toute bougie précédant une hausse est un order block « magique » qui fera réagir le prix.',
      'La réaction du prix au retour dans la zone se juge avec la structure.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — Le fair value gap ─────────────────────────────────
// recognize · interpret · confirm (scénario) · invalidate (scénario : éloignement durable,
// un événement — pas un plancher) · avoid-false-signal.
const FVG_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.smc.fvg.recognize',
    skillId: 'skill.smc.fvg',
    target: target(FVG, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.fvg.v1',
    variant: 'fair-value-gap',
    visualType: 'chart-pattern',
    prompt: 'Comment se définit le fair value gap visible ici ?',
    options: ['Un déséquilibre à trois bougies : le haut de la 1re est sous le bas de la 3e', 'Un écart entre deux moyennes mobiles', 'Une zone où le volume est nul'],
    correctIndex: 0,
    a11y: 'Trois bougies d’impulsion : entre la première et la troisième, un vide que le prix n’a pas retracé.',
    difficulty: 'easy',
    rule: 'Le FVG est un déséquilibre à trois bougies laissé par une impulsion : le haut de la première sous le bas de la troisième.',
  },
  {
    id: 'ex.smc.fvg.interpret',
    skillId: 'skill.smc.fvg',
    target: target(FVG, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture éducative d’un fair value gap.',
    steps: [
      'Repère une impulsion en trois bougies',
      'Vérifie le déséquilibre : haut de la 1re sous le bas de la 3e',
      'Marque la zone du vide comme zone d’intérêt',
      'Observe si le prix revient combler, et sa réaction dans la zone',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Impulsion, vérification du vide, zone marquée, puis observation du comblement — dans cet ordre.',
  },
  {
    id: 'ex.smc.fvg.confirm',
    skillId: 'skill.smc.fvg',
    target: target(FVG, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme l’intérêt de ce déséquilibre ?',
    context: 'Scénario éducatif : après une impulsion haussière, le prix revient dans le fair value gap laissé derrière.',
    options: [
      'La réaction observée du prix au retour dans la zone, en accord avec la structure.',
      'Le comblement est garanti : tout FVG est toujours comblé rapidement.',
      'La taille du gap suffit : plus il est grand, plus la réaction est certaine.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Comme toute zone, le FVG ne vaut que par la réaction observée à son retour — aucun comblement n’est garanti.',
  },
  {
    id: 'ex.smc.fvg.invalidate',
    skillId: 'skill.smc.fvg',
    target: target(FVG, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui invalide la lecture de ce déséquilibre ?',
    context: 'Scénario éducatif : le prix s’éloigne du fair value gap, impulsion après impulsion, sans jamais revenir le combler.',
    options: [
      'L’éloignement durable sans comblement : l’hypothèse du retour est abandonnée.',
      'Rien : le prix revient toujours combler un FVG, quel que soit le délai.',
      'La première bougie de pause : toute respiration annule le déséquilibre.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Un éloignement durable sans comblement invalide l’hypothèse du retour — on ne « l’attend » pas indéfiniment.',
  },
  {
    id: 'ex.smc.fvg.avoid',
    skillId: 'skill.smc.fvg',
    target: target(FVG, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les fair value gaps.',
    statements: [
      'Un FVG naît d’une impulsion : sans impulsion, pas de déséquilibre significatif.',
      'Le moindre petit gap, même sans impulsion, est un FVG « décisif ».',
      'La réaction du prix au retour dans le vide se juge avec la structure.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 3 — Le changement de caractère ────────────────────────
// recognize · interpret · confirm (scénario) · invalidate (scénario : la tendance initiale
// reprend, un événement — pas un plancher) · avoid-false-signal.
const CHOCH_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.smc.choch.recognize',
    skillId: 'skill.smc.choch',
    target: target(CHOCH, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.choch.v1',
    variant: 'choch',
    visualType: 'chart-pattern',
    prompt: 'Que montre ce changement de caractère (CHoCH) ?',
    options: ['La première cassure de structure à contre-tendance', 'Une simple correction dans la tendance', 'Un croisement d’indicateurs'],
    correctIndex: 0,
    a11y: 'Une séquence haussière dont un pivot cède à contre-tendance : le premier signe que la séquence est remise en cause.',
    difficulty: 'easy',
    rule: 'Le CHoCH est la première cassure de structure à contre-tendance — un premier signe de bascule, pas une bascule prouvée.',
  },
  {
    id: 'ex.smc.choch.interpret',
    skillId: 'skill.smc.choch',
    target: target(CHOCH, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture éducative d’un changement de caractère.',
    steps: [
      'Identifie la séquence en cours et ses pivots',
      'Repère la cassure d’un pivot à CONTRE-tendance',
      'Vérifie la clôture au-delà du pivot, idéalement avec de la participation',
      'Traite le signe comme une remise en cause — pas comme une bascule prouvée',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Séquence, cassure contre-tendance, clôture vérifiée, prudence : un CHoCH questionne la tendance, il ne la renverse pas à lui seul.',
  },
  {
    id: 'ex.smc.choch.confirm',
    skillId: 'skill.smc.choch',
    target: target(CHOCH, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui renforce ce premier signe de bascule ?',
    context: 'Scénario éducatif : dans une séquence haussière, le prix casse un pivot bas — un possible changement de caractère.',
    options: [
      'Une clôture au-delà du pivot cassé, idéalement avec de la participation.',
      'La cassure en mèche suffit : la clôture n’a pas d’importance.',
      'La couleur de la bougie de cassure.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La zone de confirmation d’un CHoCH est au-delà du pivot cassé — clôture exigée, participation bienvenue.',
  },
  {
    id: 'ex.smc.choch.invalidate',
    skillId: 'skill.smc.choch',
    target: target(CHOCH, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui invalide ce changement de caractère ?',
    context: 'Scénario éducatif : après la cassure à contre-tendance, le prix repart franchement dans le sens de la tendance initiale et enchaîne de nouveaux sommets.',
    options: [
      'La reprise franche de la tendance initiale : le signe de bascule est abandonné.',
      'Rien : un CHoCH reste valable même si la tendance repart.',
      'Une bougie de pause dans la nouvelle direction.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Si la tendance initiale reprend franchement, le CHoCH est invalidé — le scénario éducatif s’abandonne.',
  },
  {
    id: 'ex.smc.choch.avoid',
    skillId: 'skill.smc.choch',
    target: target(CHOCH, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le changement de caractère.',
    statements: [
      'Un CHoCH exige une clôture au-delà du pivot cassé.',
      'Une mèche qui perce le pivot sans clôture au-delà suffit à valider le CHoCH.',
      'Une mèche sans clôture au-delà ressemble souvent à une chasse aux stops.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 4 — La zone de demande ────────────────────────────────
// recognize · interpret · confirm (scénario) · invalidate (PLACEMENT : « clôture franche SOUS
// la zone » = plancher documenté → l'apprenant place lui-même l'invalidation) · avoid-false-signal.
const DEMAND_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.smc.demand.recognize',
    skillId: 'skill.smc.demand',
    target: target(DEMAND, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.demand.v1',
    variant: 'demand',
    visualType: 'market-structure',
    prompt: 'Qu’est-ce qu’une zone de demande sur ce graphique ?',
    options: ['Une zone d’où le prix est parti nettement à la hausse — un support à surveiller', 'La zone où le volume est le plus faible', 'N’importe quel creux du graphique'],
    correctIndex: 0,
    a11y: 'Une base d’où le prix est parti nettement à la hausse : la zone marquée comme support à surveiller.',
    difficulty: 'easy',
    rule: 'La zone de demande est le point de départ d’une hausse nette — un support à SURVEILLER, pas un signal.',
  },
  {
    id: 'ex.smc.demand.interpret',
    skillId: 'skill.smc.demand',
    target: target(DEMAND, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture éducative d’une zone de demande.',
    steps: [
      'Repère un départ net à la hausse',
      'Délimite la zone d’où le mouvement est parti',
      'Marque-la comme support à surveiller',
      'Au retour du prix, observe le rejet dans le sens haussier',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Départ net, zone délimitée, surveillance, puis observation du rejet — la zone ne prédit rien seule.',
  },
  {
    id: 'ex.smc.demand.confirm',
    skillId: 'skill.smc.demand',
    target: target(DEMAND, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme l’intérêt de cette zone de demande ?',
    context: 'Scénario éducatif : le prix revient sur une zone de demande marquée après un départ haussier net.',
    options: [
      'Le rejet observé de la zone, dans le sens haussier.',
      'Le simple contact avec la zone : toucher = repartir.',
      'Le nombre de bougies passées au-dessus de la zone.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La confirmation d’une zone de demande est le REJET observé dans le sens haussier — pas le simple contact.',
  },
  {
    id: 'ex.smc.demand.invalidate',
    skillId: 'skill.smc.demand',
    target: target(DEMAND, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 512,
    prompt: 'Place l’invalidation : sous quel plancher cette zone de demande ne tient plus ?',
    difficulty: 'hard',
    rule: 'Une clôture franche SOUS la zone invalide la demande : le plancher se place sous le plus bas réel de la base.',
  },
  {
    id: 'ex.smc.demand.avoid',
    skillId: 'skill.smc.demand',
    target: target(DEMAND, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les zones de demande.',
    statements: [
      'Une zone déjà retestée plusieurs fois est affaiblie.',
      'Une zone de demande reste aussi forte, quel que soit le nombre de retests.',
      'Le rejet haussier observé au retour est ce qui confirme la zone.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 5 — La zone d'offre ───────────────────────────────────
// recognize · interpret · confirm (scénario) · invalidate (scénario : « clôture franche
// AU-DESSUS de la zone » — un plafond, PAS un plancher → pas de placement) · avoid-false-signal.
const SUPPLY_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.smc.supply.recognize',
    skillId: 'skill.smc.supply',
    target: target(SUPPLY, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.supply.v1',
    variant: 'supply',
    visualType: 'market-structure',
    prompt: 'Qu’est-ce qu’une zone d’offre sur ce graphique ?',
    options: ['Une zone d’où le prix est parti nettement à la baisse — une résistance à surveiller', 'La zone où le prix a le plus stagné', 'N’importe quel sommet du graphique'],
    correctIndex: 0,
    a11y: 'Un plafond d’où le prix est parti nettement à la baisse : la zone marquée comme résistance à surveiller.',
    difficulty: 'easy',
    rule: 'La zone d’offre est le point de départ d’une baisse nette — une résistance à SURVEILLER, pas un signal.',
  },
  {
    id: 'ex.smc.supply.interpret',
    skillId: 'skill.smc.supply',
    target: target(SUPPLY, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture éducative d’une zone d’offre.',
    steps: [
      'Repère un départ net à la baisse',
      'Délimite la zone d’où le mouvement est parti',
      'Marque-la comme résistance à surveiller',
      'Au retour du prix, observe le rejet dans le sens baissier',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Départ net, zone délimitée, surveillance, puis observation du rejet baissier — symétrique de la demande.',
  },
  {
    id: 'ex.smc.supply.confirm',
    skillId: 'skill.smc.supply',
    target: target(SUPPLY, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme l’intérêt de cette zone d’offre ?',
    context: 'Scénario éducatif : le prix remonte vers une zone d’offre marquée après un départ baissier net.',
    options: [
      'Le rejet observé de la zone, dans le sens baissier.',
      'Le simple contact avec la zone : toucher = redescendre.',
      'La vitesse de la remontée vers la zone.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La confirmation d’une zone d’offre est le REJET observé dans le sens baissier — pas le simple contact.',
  },
  {
    id: 'ex.smc.supply.invalidate',
    skillId: 'skill.smc.supply',
    target: target(SUPPLY, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui invalide cette zone d’offre ?',
    context: 'Scénario éducatif : le prix atteint la zone d’offre… puis clôture franchement AU-DESSUS de la zone.',
    options: [
      'La clôture franche au-dessus de la zone : le scénario baissier éducatif est abandonné.',
      'Rien : une zone d’offre reste valable même traversée.',
      'Une mèche qui dépasse la zone sans clôture au-delà.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Une clôture franche AU-DESSUS de la zone d’offre invalide le scénario — l’hypothèse s’abandonne, elle ne se « déplace » pas.',
  },
  {
    id: 'ex.smc.supply.avoid',
    skillId: 'skill.smc.supply',
    target: target(SUPPLY, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les zones d’offre.',
    statements: [
      'Une zone déjà retestée plusieurs fois est affaiblie.',
      'Plus une zone d’offre est retestée, plus elle devient fiable.',
      'Le rejet baissier observé au retour est ce qui confirme la zone.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const SMC_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.smc.orderblock': OB_SCENARIOS,
  'skill.smc.fvg': FVG_SCENARIOS,
  'skill.smc.choch': CHOCH_SCENARIOS,
  'skill.smc.demand': DEMAND_SCENARIOS,
  'skill.smc.supply': SUPPLY_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const SMC_MODULE_SCENARIOS: LearningScenario[] = SMC_SKILLS.flatMap(
  (s) => SMC_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const SMC_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(SMC_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
