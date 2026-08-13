/**
 * LOT 4-R — Module guidé « Lire les indicateurs » (monde 7, `world.indicators`).
 *
 * Septième module guidé réel, dérivé du registre canonique `CONTENT_MODULES`. Même architecture :
 * chaque item est un `LearningScenario` — UNE seule vérité par item. Aucune seconde source.
 *
 * Principe pédagogique central : un indicateur DÉRIVE du prix — il résume, il ne prédit pas. Ses
 * seuils et croisements sont des repères de contexte, jamais des ordres : la structure de prix
 * confirme (ou contredit) toujours la lecture. Une compétence par concept réel du monde :
 *   1. Le RSI                  → `concept.rsi`
 *   2. Le MACD                 → `concept.macd`
 *   3. Les bandes de Bollinger → `concept.bollinger`
 *   4. La divergence           → `concept.divergence`
 *   5. La moyenne mobile       → `concept.moving-average`   (LOT G1)
 *   6. Le croisement haussier  → `concept.golden-cross`     (LOT G1)
 *   7. Le croisement baissier  → `concept.death-cross`      (LOT G1)
 *
 * Objectifs ciblés = objectifs RÉELS (learningTarget). Honnêteté du modèle : parmi les quatre
 * premières compétences, SEULE la divergence documente une invalidation (« poursuite de la tendance
 * qui efface le désaccord ») → un seul exercice `invalidate` par scénario conditionnel ; RSI, MACD,
 * Bollinger et la moyenne mobile n'en documentent aucune, et le module n'en invente pas.
 *
 * LOT G1 change deux choses dans ce module. Le PLACEMENT graphique y entre, parce que les deux
 * croisements sont les premières notions du monde à porter un vrai côté d'invalidation : plancher
 * pour le haussier (`place-invalidation`), plafond pour le baissier (`place-extreme`). Et le CALCUL
 * y entre, parce que la moyenne mobile est une notion dont la définition est une opération.
 * Statuts éditoriaux inchangés (`needsReview`). Aucun vocabulaire BUY/SELL.
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const INDICATORS_MODULE_ID = 'module.indicators.read-indicators';
export const INDICATORS_MODULE_TITLE = 'Lire les indicateurs';
export const INDICATORS_MODULE_WORLD_ID = 'world.indicators';
export const INDICATORS_CHECKPOINT_ID = 'checkpoint.indicators';
export const INDICATORS_CHECKPOINT_TITLE = 'Revue — Indicateurs techniques';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const INDICATORS_SKILLS: Skill[] = [
  { id: 'skill.indicators.rsi', name: 'Le RSI', description: 'Lire un oscillateur borné 0–100 et ses zones extrêmes — sans en faire un ordre.' },
  { id: 'skill.indicators.macd', name: 'Le MACD', description: 'Lire l’élan par deux moyennes, leur croisement et l’histogramme — un repère retardé.' },
  { id: 'skill.indicators.bollinger', name: 'Les bandes de Bollinger', description: 'Lire la volatilité : compression, expansion et marche le long d’une bande.' },
  { id: 'skill.indicators.divergence', name: 'La divergence', description: 'Repérer un désaccord prix/oscillateur comme signe d’essoufflement — à confirmer.' },
  // LOT G1 — la moyenne mobile ouvre la série G. Elle vient APRÈS les quatre premières compétences
  // bien qu'elle soit la plus simple : le MACD, les bandes et le RSI ont déjà appris que l'indicateur
  // dérive du prix ; la moyenne, elle, sert à mesurer COMBIEN il en dérive en retard.
  { id: 'skill.indicators.moving-average', name: 'La moyenne mobile', description: 'Calculer une moyenne des dernières clôtures et voir ce que le lissage coûte en réactivité.' },
  { id: 'skill.indicators.cross-up', name: 'Le croisement haussier', description: 'Situer un croisement de moyennes par rapport au retournement du prix — il le suit, jamais l’inverse.' },
  { id: 'skill.indicators.cross-down', name: 'Le croisement baissier', description: 'Le miroir exact, plafond compris : l’invalidation d’un setup baissier se pose au-dessus.' },
];

// Concepts réels du monde `world.indicators` reliés à chaque compétence.
const RSI = 'concept.rsi';
const MACD = 'concept.macd';
const BOLLINGER = 'concept.bollinger';
const DIVERGENCE = 'concept.divergence';
const MA = 'concept.moving-average';
const CROSS_UP = 'concept.golden-cross';
const CROSS_DOWN = 'concept.death-cross';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const INDICATORS_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.indicators.rsi': RSI,
  'skill.indicators.macd': MACD,
  'skill.indicators.bollinger': BOLLINGER,
  'skill.indicators.divergence': DIVERGENCE,
  'skill.indicators.moving-average': MA,
  'skill.indicators.cross-up': CROSS_UP,
  'skill.indicators.cross-down': CROSS_DOWN,
};
export const INDICATORS_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.indicators.rsi': 'rsi',
  'skill.indicators.macd': 'macd',
  'skill.indicators.bollinger': 'bandes-de-bollinger',
  'skill.indicators.divergence': 'divergence',
  'skill.indicators.moving-average': 'moyenne-mobile',
  'skill.indicators.cross-up': 'croisement-haussier-de-moyennes',
  'skill.indicators.cross-down': 'croisement-baissier-de-moyennes',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — Le RSI ────────────────────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
const RSI_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.indicators.rsi.recognize',
    skillId: 'skill.indicators.rsi',
    target: target(RSI, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'indicator.rsi.v1',
    variant: 'rsi',
    visualType: 'indicator',
    prompt: 'Quel indicateur reconnais-tu sous le prix ?',
    options: ['Le RSI : un oscillateur borné 0–100, avec des seuils à 70 et 30', 'Le MACD : deux lignes et un histogramme d’écart', 'Les bandes de Bollinger : une moyenne encadrée de deux bandes'],
    correctIndex: 0,
    a11y: 'Un oscillateur 0–100 sous le prix, avec des zones de surachat (au-dessus de 70) et de survente (sous 30).',
    difficulty: 'easy',
    rule: 'Le RSI se reconnaît à sa courbe bornée 0–100 et à ses seuils de référence : 70 (surachat) et 30 (survente).',
  },
  {
    id: 'ex.indicators.rsi.interpret',
    skillId: 'skill.indicators.rsi',
    target: target(RSI, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un RSI.',
    steps: [
      'Situe la valeur du RSI entre 0 et 100',
      'Repère si elle traverse une zone extrême (au-dessus de 70, sous 30)',
      'Replace cette lecture dans le contexte de tendance',
      'Rappelle-toi : en tendance forte, le RSI peut rester longtemps à l’extrême',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Le RSI se lit valeur d’abord, zone ensuite, contexte toujours — un extrême n’est pas un signal en soi.',
  },
  {
    id: 'ex.indicators.rsi.confirm',
    skillId: 'skill.indicators.rsi',
    target: target(RSI, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette lecture ?',
    context: 'Après une longue baisse, le RSI sort de la zone de survente pendant que le prix cesse de faire des plus-bas et reprend un plus-haut local.',
    options: [
      'La structure de prix : c’est elle qui confirme la lecture, jamais l’oscillateur seul.',
      'Le RSI seul : sortir de la zone de survente suffit à valider un retournement.',
      'Rien à vérifier : un RSI sous 30 garantissait déjà le rebond.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La lecture du RSI se confirme avec la structure de prix, jamais par l’oscillateur seul.',
  },
  {
    id: 'ex.indicators.rsi.avoid',
    skillId: 'skill.indicators.rsi',
    target: target(RSI, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le RSI.',
    statements: [
      'Le RSI est borné entre 0 et 100, avec des repères à 70 et 30.',
      'Un RSI au-dessus de 70 déclenche mécaniquement une baisse imminente.',
      'En tendance forte, le RSI peut rester longtemps en zone extrême.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — Le MACD ───────────────────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
// (Pas d'objectif `invalidate` : le concept ne documente pas d'invalidation.)
const MACD_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.indicators.macd.recognize',
    skillId: 'skill.indicators.macd',
    target: target(MACD, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'indicator.macd.v1',
    variant: 'macd',
    visualType: 'indicator',
    prompt: 'Quel indicateur reconnais-tu sous le prix ?',
    options: ['Le MACD : deux lignes (MACD et signal) et un histogramme d’écart', 'Le RSI : un oscillateur borné 0–100', 'Le volume : des barres d’échanges sous chaque bougie'],
    correctIndex: 0,
    a11y: 'Sous le prix, deux lignes (MACD et signal) et un histogramme d’écart illustrant l’élan et ses croisements.',
    difficulty: 'easy',
    rule: 'Le MACD se reconnaît à ses deux lignes (MACD et signal) et à son histogramme, qui matérialise leur écart.',
  },
  {
    id: 'ex.indicators.macd.interpret',
    skillId: 'skill.indicators.macd',
    target: target(MACD, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un MACD.',
    steps: [
      'Repère la ligne MACD et sa ligne de signal',
      'Observe l’histogramme : l’écart entre les deux',
      'Note les croisements et le passage par zéro comme repères d’élan',
      'Rappelle-toi : fondé sur des moyennes, le MACD retarde le prix',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Le MACD se lit lignes d’abord, histogramme ensuite, croisements en repères — en gardant son retard en tête.',
  },
  {
    id: 'ex.indicators.macd.confirm',
    skillId: 'skill.indicators.macd',
    target: target(MACD, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette lecture ?',
    context: 'Le MACD vient de croiser à la hausse. Dans les bougies suivantes, le prix tient ses plus-bas et reprend un plus-haut local.',
    options: [
      'La structure de prix : c’est elle qui confirme la lecture d’élan, jamais le croisement seul.',
      'Le croisement seul : il valide l’élan haussier à lui seul.',
      'Rien à vérifier : un croisement du MACD est un signal automatique.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La lecture du MACD se confirme avec la structure de prix, jamais par le croisement seul.',
  },
  {
    id: 'ex.indicators.macd.avoid',
    skillId: 'skill.indicators.macd',
    target: target(MACD, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le MACD.',
    statements: [
      'Le MACD mesure l’écart entre deux moyennes exponentielles.',
      'En range, multiplier les croisements du MACD donne des signaux fiables.',
      'Fondé sur des moyennes, le MACD retarde le prix.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 3 — Les bandes de Bollinger ───────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
// (Pas d'objectif `invalidate` : le concept ne documente pas d'invalidation.)
const BOLLINGER_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.indicators.bollinger.recognize',
    skillId: 'skill.indicators.bollinger',
    target: target(BOLLINGER, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'indicator.bollinger.v1',
    variant: 'bollinger',
    visualType: 'indicator',
    prompt: 'Quel indicateur reconnais-tu autour du prix ?',
    options: ['Les bandes de Bollinger : une moyenne encadrée de deux bandes à ±2 écarts-types', 'Le MACD : deux lignes et un histogramme sous le prix', 'Le RSI : un oscillateur borné 0–100 sous le prix'],
    correctIndex: 0,
    a11y: 'Une moyenne encadrée de deux bandes à ±2 écarts-types, qui se resserrent en faible volatilité et s’écartent à l’expansion.',
    difficulty: 'easy',
    rule: 'Les bandes de Bollinger encadrent une moyenne à ±2 écarts-types : resserrées en compression, écartées en expansion.',
  },
  {
    id: 'ex.indicators.bollinger.interpret',
    skillId: 'skill.indicators.bollinger',
    target: target(BOLLINGER, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture des bandes de Bollinger.',
    steps: [
      'Repère la moyenne centrale et ses deux bandes à ±2 écarts-types',
      'Observe la largeur des bandes : resserrées (compression) ou écartées (expansion)',
      'Situe le prix par rapport aux bandes (contact, marche le long d’une bande)',
      'Rappelle-toi : les bandes mesurent la volatilité, pas la direction',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Les bandes se lisent moyenne d’abord, largeur ensuite, position du prix enfin — volatilité, pas direction.',
  },
  {
    id: 'ex.indicators.bollinger.confirm',
    skillId: 'skill.indicators.bollinger',
    target: target(BOLLINGER, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette sortie de compression ?',
    context: 'Après un long resserrement des bandes, le prix sort par le haut et les bandes commencent à s’écarter.',
    options: [
      'La structure de prix : la sortie se confirme avec elle (clôtures, plus-hauts tenus), pas par la seule bande.',
      'Le simple contact de la bande haute : il valide la sortie à lui seul.',
      'L’écartement des bandes suffit : la direction n’a pas d’importance.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Une sortie de compression se confirme avec la structure de prix — pas par la seule bande.',
  },
  {
    id: 'ex.indicators.bollinger.avoid',
    skillId: 'skill.indicators.bollinger',
    target: target(BOLLINGER, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les bandes de Bollinger.',
    statements: [
      'Les bandes se resserrent quand la volatilité baisse (compression).',
      'Chaque contact de la bande haute annonce un retour immédiat vers la moyenne.',
      'En tendance, le prix peut « marcher » le long d’une bande.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 4 — La divergence ─────────────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · invalidate (scénario) ·
// avoid-false-signal — le SEUL concept du monde qui documente une invalidation → 5 exercices.
const DIVERGENCE_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.indicators.divergence.recognize',
    skillId: 'skill.indicators.divergence',
    target: target(DIVERGENCE, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'indicator.divergence.v1',
    variant: 'divergence',
    visualType: 'indicator',
    prompt: 'Que montre ce désaccord entre le prix et l’oscillateur ?',
    options: ['Une divergence : prix en plus-hauts croissants, oscillateur en plus-hauts décroissants', 'Une confirmation : prix et oscillateur montent ensemble', 'Une compression de volatilité entre deux bandes'],
    correctIndex: 0,
    a11y: 'Le prix fait des plus-hauts croissants tandis que l’oscillateur fait des plus-hauts décroissants : un désaccord qui signale un essoufflement possible.',
    difficulty: 'medium',
    rule: 'Une divergence est un désaccord de sens entre les pivots du prix et ceux de l’oscillateur.',
  },
  {
    id: 'ex.indicators.divergence.interpret',
    skillId: 'skill.indicators.divergence',
    target: target(DIVERGENCE, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’une divergence.',
    steps: [
      'Repère les pivots du prix (plus-hauts, plus-bas)',
      'Compare-les aux pivots de l’oscillateur',
      'Constate le désaccord de sens entre les deux séries',
      'Traite-le comme un essoufflement possible — jamais un signal isolé',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Une divergence se lit pivots du prix d’abord, pivots de l’oscillateur ensuite — et reste une hypothèse d’essoufflement.',
  },
  {
    id: 'ex.indicators.divergence.confirm',
    skillId: 'skill.indicators.divergence',
    target: target(DIVERGENCE, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette divergence ?',
    context: 'Le prix fait des plus-hauts croissants, l’oscillateur des plus-hauts décroissants. Puis le prix casse le creux qui portait sa dernière jambe de hausse.',
    options: [
      'La structure : la cassure d’un creux confirme l’essoufflement — pas l’oscillateur seul.',
      'La divergence seule suffisait : elle annonçait déjà le retournement certain.',
      'Le prochain pivot de l’oscillateur, quoi que fasse le prix.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Une divergence se confirme par la structure (cassure d’un creux), pas par l’oscillateur seul.',
  },
  {
    id: 'ex.indicators.divergence.invalidate',
    skillId: 'skill.indicators.divergence',
    target: target(DIVERGENCE, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui invalide cette divergence ?',
    context: 'Une divergence baissière était en place. Puis le prix poursuit franchement sa hausse et l’oscillateur repart à la hausse avec lui.',
    options: [
      'La poursuite de la tendance efface le désaccord : la divergence est invalidée.',
      'Rien : une divergence repérée reste valable indéfiniment.',
      'Seul un nouveau croisement du MACD peut invalider une divergence.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Une divergence est invalidée quand la poursuite de la tendance efface le désaccord entre prix et oscillateur.',
  },
  {
    id: 'ex.indicators.divergence.avoid',
    skillId: 'skill.indicators.divergence',
    target: target(DIVERGENCE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur la divergence.',
    statements: [
      'Une divergence compare les pivots du prix et ceux de l’oscillateur.',
      'Chaque divergence annonce un retournement imminent.',
      'Sans confirmation de structure, le prix peut poursuivre et l’oscillateur repartir avec lui.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 5 — La moyenne mobile (LOT G1) ────────────────────────
// recognize · interpret (CALCUL) · confirm (scénario) · avoid-false-signal.
// Pas d'objectif `invalidate` : une moyenne n'est pas un setup, elle n'a rien à invalider — la
// fiche ne documente donc aucune invalidation, et le module n'en invente pas.
//
// Le calcul n'est pas un ornement. La moyenne mobile est, avec le rendement du dividende et le PER,
// la seule notion du corpus dont la DÉFINITION est une opération : une somme divisée par un nombre.
// Et l'opération donne à voir le retard mieux qu'aucune phrase : six clôtures montant de 40 à 50
// donnent une ligne à 45, cinq points sous le dernier prix.
const MA_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.indicators.ma.recognize',
    skillId: 'skill.indicators.moving-average',
    target: target(MA, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'indicator.ma.v1',
    variant: 'moving-average',
    visualType: 'indicator',
    prompt: 'Que sont les deux lignes tracées PAR-DESSUS les bougies ?',
    options: [
      'Deux moyennes mobiles de périodes différentes : une rapide et une lente',
      'Les deux bandes de Bollinger, à plus ou moins deux écarts-types',
      'Le MACD et sa ligne de signal, qui se lisent dans un panneau séparé',
    ],
    correctIndex: 0,
    a11y: 'Deux lignes lissées superposées aux bougies : une moyenne à 3 périodes, qui suit le prix de près, et une moyenne à 6 périodes, plus lisse et plus lente. Sur cette série hésitante, elles se croisent à deux reprises.',
    difficulty: 'easy',
    rule: 'Une moyenne mobile se trace SUR le prix : elle est faite des clôtures elles-mêmes, pas d’un calcul affiché à part.',
  },
  {
    id: 'ex.indicators.ma.compute',
    skillId: 'skill.indicators.moving-average',
    target: target(MA, 'interpret'),
    interaction: 'compute',
    prompt:
      'Les six dernières clôtures sont 40, 42, 44, 46, 48 et 50. Que vaut la moyenne mobile à 6 périodes ?',
    unit: 'points de prix',
    answer: 45,
    tolerance: 0,
    method:
      'Moyenne = somme ÷ nombre de périodes = (40 + 42 + 44 + 46 + 48 + 50) ÷ 6 = 270 ÷ 6 = 45. Le prix vient pourtant de clôturer à 50 : la ligne est cinq points en dessous. Ce n’est pas une erreur — c’est exactement le retard que le lissage coûte.',
    difficulty: 'medium',
    rule: 'Une moyenne mobile est la moyenne des N dernières clôtures : elle résume le passé récent, donc elle traîne derrière le dernier prix.',
  },
  {
    id: 'ex.indicators.ma.confirm',
    skillId: 'skill.indicators.moving-average',
    target: target(MA, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette lecture ?',
    context:
      'Le prix évolue au-dessus de sa moyenne à 6 périodes depuis plusieurs bougies, et il vient de reprendre un plus-haut local.',
    options: [
      'La structure de prix : la moyenne confirme ce que le prix a déjà fait, elle ne l’annonce pas.',
      'La position au-dessus de la moyenne : elle suffit à établir la suite du mouvement.',
      'Rien à vérifier : au-dessus de sa moyenne, un prix continue de monter.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Une moyenne se confirme par la structure de prix — « au-dessus de sa moyenne » est une constatation arithmétique, pas un scénario.',
  },
  {
    id: 'ex.indicators.ma.avoid',
    skillId: 'skill.indicators.moving-average',
    target: target(MA, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur la moyenne mobile.',
    statements: [
      'Une moyenne à 6 périodes n’a sa première valeur qu’à la sixième bougie.',
      'Une période plus longue rend la ligne plus lisse ET plus réactive.',
      'Dans un marché hésitant, deux moyennes peuvent se croiser plusieurs fois sans tendance derrière.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 6 — Le croisement haussier (LOT G1) ───────────────────
// recognize · interpret (lecture ordonnée) · confirm · invalidate (PLACEMENT) · avoid-false-signal.
// Setup HAUSSIER ⇒ l'invalidation est un plancher : mécanique `place-invalidation`, qui vise le plus
// BAS réel de la série. Premier placement graphique du monde des indicateurs.
const CROSS_UP_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.indicators.cross-up.recognize',
    skillId: 'skill.indicators.cross-up',
    target: target(CROSS_UP, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'indicator.golden-cross.v1',
    variant: 'golden-cross',
    visualType: 'indicator',
    prompt: 'Que viennent de faire les deux moyennes ?',
    options: [
      'La rapide est repassée AU-DESSUS de la lente : un croisement haussier',
      'La rapide est repassée SOUS la lente : un croisement baissier',
      'Elles se sont écartées sans se croiser : une simple expansion',
    ],
    correctIndex: 0,
    a11y: 'Le prix baisse, forme son plus bas à la quatrième bougie, puis remonte. La moyenne à 3 périodes ne repasse au-dessus de la moyenne à 6 périodes qu’à la septième bougie : trois bougies après le retournement du prix.',
    difficulty: 'easy',
    rule: 'Un croisement haussier, c’est la moyenne courte qui franchit la longue par le bas — un point précis, sur une bougie précise.',
  },
  {
    id: 'ex.indicators.cross-up.interpret',
    skillId: 'skill.indicators.cross-up',
    target: target(CROSS_UP, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre ce qui s’est réellement passé.',
    steps: [
      'Le prix baisse : la moyenne rapide évolue sous la lente',
      'Le prix cesse de faire des plus-bas et forme son plancher',
      'Les clôtures remontent et tirent la moyenne rapide vers le haut',
      'La rapide franchit la lente : le croisement est constaté, trois bougies après le plancher',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Le prix tourne d’abord, les moyennes le constatent ensuite : l’ordre ne s’inverse jamais.',
  },
  {
    id: 'ex.indicators.cross-up.confirm',
    skillId: 'skill.indicators.cross-up',
    target: target(CROSS_UP, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme ce croisement haussier ?',
    context:
      'La moyenne rapide vient de repasser au-dessus de la lente. Sur les bougies suivantes, les plus-bas tiennent et un plus-haut local est repris.',
    options: [
      'La structure de prix qui tient après le croisement — des plus-bas conservés et un plus-haut repris.',
      'Le croisement lui-même : dès qu’il a lieu, la hausse est établie.',
      'La longueur des périodes choisies : plus elles sont longues, plus le croisement est valide.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Un croisement se confirme par ce que fait le prix APRÈS, jamais par le croisement seul.',
  },
  {
    id: 'ex.indicators.cross-up.invalidate',
    skillId: 'skill.indicators.cross-up',
    target: target(CROSS_UP, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 1020,
    prompt:
      'Pose le niveau sous lequel ce setup haussier n’a plus lieu d’être : le plancher de la période.',
    difficulty: 'hard',
    rule: 'L’invalidation d’un croisement haussier est un PLANCHER : sous le plus bas de la jambe qui l’a produit, la rapide repasse sous la lente et le constat tombe.',
    whenItFails:
      'Trop serrée, l’invalidation saute au premier bruit ; trop large, elle ne protège plus rien.',
  },
  {
    id: 'ex.indicators.cross-up.avoid',
    skillId: 'skill.indicators.cross-up',
    target: target(CROSS_UP, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le croisement haussier.',
    statements: [
      'Le croisement se produit après que le prix a déjà formé son plus bas.',
      'Le croisement annonce la hausse à venir avant que le prix ne bouge.',
      'En range, la rapide traverse la lente dans les deux sens sans qu’aucune tendance suive.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 7 — Le croisement baissier (LOT G1) ───────────────────
// Même cinq objectifs, un seul changement de mécanique — et il est central : setup BAISSIER ⇒
// l'invalidation est un PLAFOND, donc `place-extreme` (qui vise le plus HAUT réel). `place-invalidation`
// viserait le plancher et enseignerait le contraire de la fiche. Même règle qu'au LOT C10.
const CROSS_DOWN_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.indicators.cross-down.recognize',
    skillId: 'skill.indicators.cross-down',
    target: target(CROSS_DOWN, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'indicator.death-cross.v1',
    variant: 'death-cross',
    visualType: 'indicator',
    prompt: 'Que viennent de faire les deux moyennes ?',
    options: [
      'La rapide est repassée SOUS la lente : un croisement baissier',
      'La rapide est repassée AU-DESSUS de la lente : un croisement haussier',
      'Elles se sont resserrées sans se croiser : une compression',
    ],
    correctIndex: 0,
    a11y: 'Le prix monte, forme son plus haut à la quatrième bougie, puis baisse. La moyenne à 3 périodes ne repasse sous la moyenne à 6 périodes qu’à la septième bougie : trois bougies après le retournement du prix.',
    difficulty: 'easy',
    rule: 'Un croisement baissier, c’est la moyenne courte qui franchit la longue par le haut — le miroir exact du croisement haussier.',
  },
  {
    id: 'ex.indicators.cross-down.interpret',
    skillId: 'skill.indicators.cross-down',
    target: target(CROSS_DOWN, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre ce qui s’est réellement passé.',
    steps: [
      'Le prix monte : la moyenne rapide évolue au-dessus de la lente',
      'Le prix cesse de faire des plus-hauts et forme son sommet',
      'Les clôtures redescendent et tirent la moyenne rapide vers le bas',
      'La rapide passe sous la lente : le croisement est constaté, trois bougies après le sommet',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Le prix tourne d’abord, les moyennes le constatent ensuite — dans ce sens aussi.',
  },
  {
    id: 'ex.indicators.cross-down.confirm',
    skillId: 'skill.indicators.cross-down',
    target: target(CROSS_DOWN, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme ce croisement baissier ?',
    context:
      'La moyenne rapide vient de repasser sous la lente. Sur les bougies suivantes, les plus-hauts cèdent et un plus-bas local est repris.',
    options: [
      'La structure de prix qui reste sous le sommet — des plus-hauts qui cèdent et un plus-bas repris.',
      'Le nom de la figure : un « croisement de la mort » se passe de confirmation.',
      'Le croisement seul, dès qu’il est visible sur le graphique.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Le nom dramatique d’une figure ne mesure pas sa portée : seule la structure de prix confirme.',
  },
  {
    id: 'ex.indicators.cross-down.invalidate',
    skillId: 'skill.indicators.cross-down',
    target: target(CROSS_DOWN, 'invalidate'),
    interaction: 'place-extreme',
    chartSeed: 1376,
    prompt:
      'Pose le niveau au-dessus duquel ce setup baissier n’a plus lieu d’être : le plafond de la période.',
    difficulty: 'hard',
    rule: 'L’invalidation d’un croisement baissier est un PLAFOND : au-dessus du plus haut atteint, la rapide repasse au-dessus de la lente et le constat tombe.',
    whenItFails:
      'Poser un plancher sous un setup baissier est l’erreur symétrique la plus fréquente : le niveau qui compte est au-dessus.',
  },
  {
    id: 'ex.indicators.cross-down.avoid',
    skillId: 'skill.indicators.cross-down',
    target: target(CROSS_DOWN, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le croisement baissier.',
    statements: [
      'C’est le même calcul que le croisement haussier, au sens près.',
      'Son nom plus dramatique traduit une portée statistique plus forte.',
      'Son invalidation se pose au-dessus, au plus haut de la jambe qui l’a produit.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const INDICATORS_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.indicators.rsi': RSI_SCENARIOS,
  'skill.indicators.macd': MACD_SCENARIOS,
  'skill.indicators.bollinger': BOLLINGER_SCENARIOS,
  'skill.indicators.divergence': DIVERGENCE_SCENARIOS,
  'skill.indicators.moving-average': MA_SCENARIOS,
  'skill.indicators.cross-up': CROSS_UP_SCENARIOS,
  'skill.indicators.cross-down': CROSS_DOWN_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const INDICATORS_MODULE_SCENARIOS: LearningScenario[] = INDICATORS_SKILLS.flatMap(
  (s) => INDICATORS_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const INDICATORS_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(INDICATORS_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
