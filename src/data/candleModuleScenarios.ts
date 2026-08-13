/**
 * LOT 4-M — Module guidé « Lire les chandeliers » (monde 3, `world.candles`).
 *
 * Deuxième module guidé réel, après « Lire un graphique » (Fondations). Comme l'unité pilote, chaque
 * item est un `LearningScenario` : UNE seule vérité d'où dérivent le visuel, la bonne réponse, le
 * feedback et le résumé accessible (cf. `engines/exercise/scenario.ts`). Aucune seconde source.
 *
 * Principe pédagogique central : une bougie isolée ne prédit rien. On enseigne donc, pour chaque
 * figure réelle du corpus `world.candles`, la reconnaissance PUIS le contexte, la confirmation et
 * l'invalidation. Quatre compétences atomiques, ordonnées du plus simple (une bougie) au plus riche
 * (deux bougies, à confirmer) :
 *   1. Pression et conviction  → `concept.marubozu`
 *   2. Le rejet des extrêmes   → `concept.hammer`
 *   3. L'indécision            → `concept.doji`
 *   4. Le retournement 2 bougies → `concept.bullish-engulfing`
 *   5. La figure miroir        → `concept.bearish-engulfing` (LOT C2)
 *   6. Le contexte décide      → `concept.hanging-man` (LOT C4)
 *   7. Le rejet par le haut    → `concept.shooting-star` (LOT C4)
 *   8. Le même rejet, l'autre histoire → `concept.inverted-hammer` (LOT C4, HAUSSIER)
 *   9. Le retournement en trois temps → `concept.morning-star` (LOT C6)
 *  10. La poussée en trois temps     → `concept.three-white-soldiers` (LOT C6)
 *  11. La bougie contenue            → `concept.harami` (LOT C9)
 *  12. Le même extrême, deux fois    → `concept.tweezer` (LOT C9)
 *
 * LOT C6 introduit la première idée VRAIMENT nouvelle depuis le pilote : jusqu'ici tout le module lit
 * UNE bougie (marubozu, marteau, doji, pendu, étoile filante, marteau inversé) ou DEUX lues comme un
 * bloc (avalement). Les quatre figures de séquence en demandent TROIS, et l'ORDRE décide : lue à
 * l'envers, une étoile du matin devient une étoile du soir. La mécanique `read-order` cesse donc
 * d'être un exercice d'énonciation pour devenir la chose enseignée elle-même.
 *
 * LOT C9 ajoute la dernière façon de lire dont le module manquait : le RAPPORT entre deux bougies.
 * On lisait une FORME (une bougie), un BLOC (l'avalement) ou une SÉQUENCE (trois bougies ordonnées).
 * Le harami et les pincettes ne se lisent d'aucune de ces façons : ce qui compte est la relation
 * géométrique entre deux bougies voisines — l'une CONTIENT l'autre, ou les deux butent au MÊME prix.
 * La forme de chaque bougie prise isolément n'y suffit jamais.
 *
 * Objectifs ciblés = objectifs RÉELS dérivés des champs du concept (learningTarget) — jamais inventés.
 * `concept.doji` ne documente pas d'invalidation : on ne lui attache donc AUCUN exercice d'invalidation
 * (honnêteté du modèle). Statuts éditoriaux inchangés (toutes les fiches restent `needsReview`).
 * Aucun vocabulaire BUY/SELL, aucune promesse de gain, aucun ordre personnalisé.
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const CANDLE_MODULE_ID = 'module.candles.read-candles';
export const CANDLE_MODULE_TITLE = 'Lire les chandeliers';
export const CANDLE_MODULE_WORLD_ID = 'world.candles';
export const CANDLE_CHECKPOINT_ID = 'checkpoint.candles';
export const CANDLE_CHECKPOINT_TITLE = 'Revue — Chandeliers japonais';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const CANDLE_SKILLS: Skill[] = [
  { id: 'skill.candle.pressure', name: 'Pression et conviction', description: 'Lire la force d’une séance : le corps plein du marubozu.' },
  { id: 'skill.candle.rejection', name: 'Le rejet des extrêmes', description: 'Reconnaître un rejet de prix : la longue mèche du marteau.' },
  { id: 'skill.candle.indecision', name: 'L’indécision', description: 'Lire l’équilibre acheteurs/vendeurs : le doji.' },
  { id: 'skill.candle.reversal', name: 'Le retournement à deux bougies', description: 'Repérer une reprise à confirmer : l’avalement haussier.' },
  // LOT C2 — la figure MIROIR : même géométrie, direction opposée, invalidation opposée.
  { id: 'skill.candle.mirror', name: 'La figure miroir', description: 'Transposer l’avalement à la baisse — et retrouver son invalidation, qui change de côté.' },
  // LOT C4 — la même FORME, l'autre histoire : ici ce n'est plus la direction qui change, c'est le
  // CONTEXTE. Trois figures que leurs propres fiches signalent comme confondues entre elles.
  { id: 'skill.candle.context', name: 'Le contexte décide', description: 'Marteau ou pendu : même forme, sens opposé — c’est ce qui précède qui tranche.' },
  { id: 'skill.candle.rejection-high', name: 'Le rejet par le haut', description: 'Lire une étoile filante : longue mèche haute après une hausse, près d’une résistance.' },
  { id: 'skill.candle.rejection-low', name: 'Le même rejet, l’autre histoire', description: 'Le marteau inversé : même forme que l’étoile filante, mais après une baisse — donc haussier.' },
  // LOT C6 — la SÉQUENCE. Jusqu'ici le module lit une bougie (ou deux comme un bloc). Ici il en faut
  // TROIS, et l'ordre décide : lue à l'envers, une étoile du matin devient une étoile du soir.
  { id: 'skill.candle.sequence-reversal', name: 'Le retournement en trois temps', description: 'L’étoile du matin : baissière, indécision, haussière — c’est la PAUSE du milieu qui fait le retournement.' },
  { id: 'skill.candle.sequence-momentum', name: 'La poussée en trois temps', description: 'Trois soldats : trois bougies du même sens. Une continuation — sauf en fin de course, où c’est l’épuisement.' },
  // LOT C9 — le RAPPORT entre deux bougies : ni la forme de l'une, ni l'ordre de trois.
  { id: 'skill.candle.containment', name: 'La bougie contenue', description: 'Le harami : une petite bougie tout entière dans le corps de la précédente. La tendance ralentit sans encore se retourner.' },
  { id: 'skill.candle.twin-level', name: 'Le même extrême, deux fois', description: 'Les pincettes : deux bougies qui butent au même prix. C’est le NIVEAU qui parle, pas la bougie.' },
];

// Concepts réels du monde `world.candles` reliés à chaque compétence (source : learningContent V5).
const MARUBOZU = 'concept.marubozu';
const HAMMER = 'concept.hammer';
const DOJI = 'concept.doji';
const ENGULFING = 'concept.bullish-engulfing';
const BEARISH_ENGULFING = 'concept.bearish-engulfing';
const HANGING_MAN = 'concept.hanging-man';
const SHOOTING_STAR = 'concept.shooting-star';
const INVERTED_HAMMER = 'concept.inverted-hammer';
const MORNING_STAR = 'concept.morning-star';
const EVENING_STAR = 'concept.evening-star';
const THREE_WHITE_SOLDIERS = 'concept.three-white-soldiers';
const THREE_BLACK_CROWS = 'concept.three-black-crows';
const HARAMI = 'concept.harami';
const TWEEZER = 'concept.tweezer';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const CANDLE_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.candle.pressure': MARUBOZU,
  'skill.candle.rejection': HAMMER,
  'skill.candle.indecision': DOJI,
  'skill.candle.reversal': ENGULFING,
  'skill.candle.mirror': BEARISH_ENGULFING,
  'skill.candle.context': HANGING_MAN,
  'skill.candle.rejection-high': SHOOTING_STAR,
  'skill.candle.rejection-low': INVERTED_HAMMER,
  'skill.candle.sequence-reversal': MORNING_STAR,
  'skill.candle.sequence-momentum': THREE_WHITE_SOLDIERS,
  'skill.candle.containment': HARAMI,
  'skill.candle.twin-level': TWEEZER,
};
export const CANDLE_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.candle.pressure': 'marubozu',
  'skill.candle.rejection': 'marteau',
  'skill.candle.indecision': 'doji',
  'skill.candle.reversal': 'avalement-haussier',
  'skill.candle.mirror': 'avalement-baissier',
  'skill.candle.context': 'pendu',
  'skill.candle.rejection-high': 'etoile-filante',
  'skill.candle.rejection-low': 'marteau-inverse',
  'skill.candle.sequence-reversal': 'etoile-du-matin',
  'skill.candle.sequence-momentum': 'trois-soldats',
  'skill.candle.containment': 'harami',
  'skill.candle.twin-level': 'pincettes',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — Pression et conviction (marubozu) ─────────────────
// recognize (figure) · interpret (lecture ordonnée) · invalidate (placement) · avoid-false-signal.
const PRESSURE_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.candle.pressure.recognize',
    skillId: 'skill.candle.pressure',
    target: target(MARUBOZU, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.bullish-marubozu.v1',
    variant: 'bullish-marubozu',
    visualType: 'candlestick-pattern',
    prompt: 'Quelle figure de chandelier reconnais-tu ?',
    options: ['Un marubozu (corps long, quasi sans mèche)', 'Un doji (corps minuscule)', 'Un marteau (longue mèche basse)'],
    correctIndex: 0,
    a11y: 'Bougie presque entièrement composée de son corps, sans mèche visible : une séance à sens unique.',
    difficulty: 'easy',
    rule: 'Un marubozu se reconnaît à son corps long sans mèche : la pression n’a pas été contestée.',
  },
  {
    id: 'ex.candle.pressure.interpret',
    skillId: 'skill.candle.pressure',
    target: target(MARUBOZU, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un marubozu.',
    steps: [
      'Repère le corps long (la pression dominante)',
      'Vérifie les mèches (ici quasi absentes)',
      'Lis le sens de la séance (haussier ou baissier)',
      'Confronte au contexte (tendance, participation)',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un marubozu se lit corps d’abord (la pression), puis mèches (ici minimes), puis contexte.',
  },
  {
    // LOT D1 — dérivé de `confirmationZone` : « continuation dans le sens du corps sur la bougie
    // suivante » + les conditions du scénario de la fiche.
    id: 'ex.candle.pressure.confirm',
    skillId: 'skill.candle.pressure',
    target: target(MARUBOZU, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette pression ?',
    context:
      'Un marubozu au corps long, quasiment sans mèche, vient de clôturer à la cassure d’une résistance surveillée.',
    options: [
      'La bougie suivante prolonge le mouvement dans le sens du corps et tient au-dessus du niveau franchi.',
      'La longueur du corps suffit : une pression aussi nette se passe de suite.',
      'L’absence totale de mèche garantit à elle seule la continuation.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Une pression se confirme par la CONTINUATION : la bougie suivante prolonge le sens du corps et tient.',
    whenItFails: 'Un retour rapide sous le corps du marubozu annule la lecture, aussi net qu’il ait paru.',
    a11y:
      'Contexte : un marubozu au corps long sans mèche, clôturant à la cassure d’une résistance. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.candle.pressure.invalidate',
    skillId: 'skill.candle.pressure',
    target: target(MARUBOZU, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 53,
    prompt: 'Place le niveau d’invalidation : sous quel plancher la pression du marubozu ne tient plus ?',
    difficulty: 'hard',
    rule: 'Le marubozu est invalidé si la bougie suivante efface son corps ; sur le graphique, l’invalidation se pose sous le plus bas de la séance.',
  },
  {
    id: 'ex.candle.pressure.avoid',
    skillId: 'skill.candle.pressure',
    target: target(MARUBOZU, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le marubozu.',
    statements: [
      'Un marubozu montre une séance à sens unique : corps long, quasi sans mèche.',
      'Un marubozu isolé en plein range donne à lui seul une direction fiable.',
      'Une amplitude anormale sur faible participation invite à la prudence.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — Le rejet des extrêmes (marteau) ───────────────────
// recognize · confirm (scénario) · invalidate (placement) · avoid-false-signal.
const REJECTION_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.candle.rejection.recognize',
    skillId: 'skill.candle.rejection',
    target: target(HAMMER, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.hammer.v1',
    variant: 'hammer',
    visualType: 'candlestick-pattern',
    prompt: 'Quelle figure de chandelier reconnais-tu ?',
    options: ['Un marteau (petit corps en haut, longue mèche basse)', 'Un marubozu (corps plein, sans mèche)', 'Un avalement haussier (deux bougies)'],
    correctIndex: 0,
    a11y: 'Bougie à petit corps en haut et longue mèche vers le bas, illustrant un rejet des prix bas après une baisse.',
    difficulty: 'easy',
    rule: 'Le marteau se reconnaît à sa longue mèche basse (≥ 2× le corps) sous un petit corps en haut.',
  },
  {
    // LOT D1 — dérivé de `definitionShort` et de `howToRecognize` : la lecture ordonnée d'un marteau.
    id: 'ex.candle.rejection.interpret',
    skillId: 'skill.candle.rejection',
    target: target(HAMMER, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un marteau.',
    steps: [
      'Repère le petit corps, dans le tiers HAUT de la bougie',
      'Mesure la mèche basse : au moins deux fois la hauteur du corps',
      'Vérifie qu’il n’y a quasiment pas de mèche haute',
      'Replace la bougie dans son contexte : elle n’a de sens qu’après une baisse, sur un support',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un marteau se lit forme d’abord (petit corps haut, longue mèche basse), CONTEXTE ensuite — jamais l’inverse.',
    whenItFails: 'La même forme en plein range, loin de tout support, ne raconte pas un rejet.',
  },
  {
    id: 'ex.candle.rejection.confirm',
    skillId: 'skill.candle.rejection',
    target: target(HAMMER, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Que peux-tu conclure ?',
    context: 'Un marteau se forme sur un support testé après une baisse, puis la bougie suivante clôture au-dessus du plus haut du marteau.',
    options: [
      'La confirmation est là : l’hypothèse haussière conditionnelle tient (à surveiller, sans certitude).',
      'Le marteau est invalidé.',
      'Rien de notable ne s’est produit.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La confirmation du marteau se lit au-dessus de son plus haut, sur la ou les bougies suivantes.',
  },
  {
    id: 'ex.candle.rejection.invalidate',
    skillId: 'skill.candle.rejection',
    target: target(HAMMER, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 41,
    prompt: 'Place le niveau d’invalidation : sous quel plancher le marteau ne tient plus ?',
    difficulty: 'hard',
    rule: 'Le marteau est invalidé par une clôture sous le plus bas de sa mèche : place l’invalidation sous ce plancher.',
  },
  {
    id: 'ex.candle.rejection.avoid',
    skillId: 'skill.candle.rejection',
    target: target(HAMMER, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le marteau.',
    statements: [
      'Un marteau prend son sens dans un contexte de baisse, de préférence près d’un support.',
      'Un marteau isolé, sans support ni confirmation, suffit à annoncer un retournement.',
      'Même forme, contexte opposé : le pendu apparaît après une hausse, pas le marteau.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 3 — L'indécision (doji) ───────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
// (Le doji ne documente PAS d'invalidation → aucun exercice d'invalidation, par honnêteté du modèle.)
const INDECISION_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.candle.indecision.recognize',
    skillId: 'skill.candle.indecision',
    target: target(DOJI, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.doji.v1',
    variant: 'doji',
    visualType: 'candlestick-pattern',
    prompt: 'Quelle figure de chandelier reconnais-tu ?',
    options: ['Un doji (corps minuscule, ouverture ≈ clôture)', 'Un marubozu (corps plein)', 'Un marteau (longue mèche basse)'],
    correctIndex: 0,
    a11y: 'Bougie au corps minuscule (ouverture et clôture quasi identiques), avec des mèches de chaque côté : une séance indécise.',
    difficulty: 'easy',
    rule: 'Un doji se reconnaît à son corps minuscule : ouverture et clôture quasi identiques.',
  },
  {
    id: 'ex.candle.indecision.interpret',
    skillId: 'skill.candle.indecision',
    target: target(DOJI, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un doji.',
    steps: [
      'Repère le corps minuscule (ouverture ≈ clôture)',
      'Observe les mèches de chaque côté',
      'Situe le doji après un mouvement marqué',
      'Attends la bougie suivante qui tranche l’indécision',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un doji traduit l’indécision : il prend son sens après un mouvement, et c’est la bougie suivante qui tranche.',
  },
  {
    id: 'ex.candle.indecision.confirm',
    skillId: 'skill.candle.indecision',
    target: target(DOJI, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Que peux-tu conclure ?',
    context: 'Après une hausse marquée, un doji apparaît, puis la bougie suivante clôture nettement sous le doji.',
    options: [
      'L’indécision est tranchée à la baisse : l’hypothèse d’essoufflement se précise (sans certitude).',
      'Le doji garantit la poursuite de la hausse.',
      'Un doji ne peut jamais être suivi d’une baisse.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Le sens d’un doji est tranché par la bougie suivante, au-dessus ou en dessous du doji.',
  },
  {
    id: 'ex.candle.indecision.avoid',
    skillId: 'skill.candle.indecision',
    target: target(DOJI, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le doji.',
    statements: [
      'Un doji traduit un équilibre entre acheteurs et vendeurs.',
      'Un doji isolé, sans tendance préalable, annonce à lui seul un retournement.',
      'C’est la bougie suivante qui tranche l’indécision d’un doji.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 4 — Le retournement à deux bougies (avalement haussier) ─
// recognize · interpret (lecture ordonnée) · confirm (scénario) · invalidate (placement).
const REVERSAL_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.candle.reversal.recognize',
    skillId: 'skill.candle.reversal',
    target: target(ENGULFING, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.bullish-engulfing.v1',
    variant: 'bullish-engulfing',
    visualType: 'candlestick-pattern',
    prompt: 'Quelle figure de chandelier reconnais-tu ?',
    options: ['Un avalement haussier (la bougie haussière englobe la précédente)', 'Un doji (corps minuscule)', 'Un marubozu (une seule bougie pleine)'],
    correctIndex: 0,
    a11y: 'Deux bougies : une petite bougie baissière, puis une grande bougie haussière dont le corps englobe entièrement le corps précédent.',
    difficulty: 'medium',
    rule: 'L’avalement haussier se reconnaît à sa grande bougie haussière qui englobe le corps de la bougie baissière précédente.',
  },
  {
    id: 'ex.candle.reversal.interpret',
    skillId: 'skill.candle.reversal',
    target: target(ENGULFING, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un avalement haussier.',
    steps: [
      'Repère la bougie baissière initiale',
      'Vois la bougie haussière englober son corps',
      'Situe la figure après une baisse',
      'Attends la confirmation au-dessus du plus haut de la figure',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'L’avalement se lit en deux temps : la reprise englobe la bougie précédente, puis on attend la confirmation.',
  },
  {
    id: 'ex.candle.reversal.confirm',
    skillId: 'skill.candle.reversal',
    target: target(ENGULFING, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Que peux-tu conclure ?',
    context: 'Un avalement haussier se forme après une baisse, puis le prix clôture au-dessus du plus haut de la bougie d’avalement.',
    options: [
      'La confirmation est là : l’hypothèse de reprise tient (à surveiller, sans certitude).',
      'La figure est invalidée.',
      'Rien de notable ne s’est produit.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La confirmation de l’avalement se lit au-dessus du plus haut de la bougie d’avalement.',
  },
  {
    id: 'ex.candle.reversal.invalidate',
    skillId: 'skill.candle.reversal',
    target: target(ENGULFING, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 67,
    prompt: 'Place le niveau d’invalidation : sous quel plancher l’avalement ne tient plus ?',
    difficulty: 'hard',
    rule: 'L’avalement est invalidé par une clôture sous le plus bas des deux bougies : place l’invalidation sous ce plancher.',
  },
  {
    // LOT D1 — dérivé de `falseSignals` (« avalement sans participation, aussitôt annulé par un
    // retour sous la figure ») et de `commonMistakes` (« ne regarder que la seconde bougie »).
    id: 'ex.candle.reversal.avoid',
    skillId: 'skill.candle.reversal',
    target: target(ENGULFING, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur l’avalement haussier.',
    statements: [
      'Le corps haussier doit englober le corps baissier qui le précède.',
      'Il suffit de regarder la seconde bougie : si elle est grande et haussière, la figure est là.',
      'Un avalement aussitôt annulé par un retour sous la figure était un faux signal.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 5 — La figure miroir (avalement baissier) — LOT C2 ────
// L'avalement BAISSIER est le miroir exact de l'avalement haussier enseigné juste avant : même
// géométrie, direction opposée, et surtout invalidation opposée — au-DESSUS du plus haut, alors que
// la version haussière s'invalide sous le plus bas. C'est précisément là que se trompe l'apprenant.
// Les cinq objectifs sont ceux de la fiche `concept.bearish-engulfing`, sans exception ni ajout.
const MIRROR_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.candle.mirror.recognize',
    skillId: 'skill.candle.mirror',
    target: target(BEARISH_ENGULFING, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.bearish-engulfing.v1',
    variant: 'bearish-engulfing',
    visualType: 'candlestick-pattern',
    prompt: 'Quelle figure de chandelier reconnais-tu ?',
    options: [
      'Un avalement baissier (grande rouge qui englobe la verte précédente)',
      'Un avalement haussier (grande verte qui englobe la rouge précédente)',
      'Un marteau (petit corps, longue mèche basse)',
    ],
    correctIndex: 0,
    a11y:
      'Une grande bougie rouge qui recouvre le corps de la bougie verte précédente, après une hausse.',
    difficulty: 'easy',
    rule:
      'L’avalement baissier se reconnaît à sa grande bougie rouge dont le corps englobe entièrement le corps vert précédent, après une hausse.',
  },
  {
    // Dérivé mot pour mot de `howToRecognize` et `contextRequired` de la fiche.
    id: 'ex.candle.mirror.interpret',
    skillId: 'skill.candle.mirror',
    target: target(BEARISH_ENGULFING, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un avalement baissier.',
    steps: [
      'Vérifie qu’une hausse précède la figure',
      'Repère la petite bougie haussière',
      'Contrôle que la grande bougie baissière englobe bien son corps',
      'Regarde s’il y a une résistance à proximité',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule:
      'Un avalement baissier se lit contexte d’abord (la hausse), puis englobement, puis résistance — la géométrie seule ne suffit pas.',
  },
  {
    // Dérivé de `confirmationZone` : « Sous le plus bas de la bougie d'englobement ».
    id: 'ex.candle.mirror.confirm',
    skillId: 'skill.candle.mirror',
    target: target(BEARISH_ENGULFING, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cet avalement baissier ?',
    context:
      'Une grande bougie rouge vient d’englober la petite verte précédente, sous une résistance surveillée, après plusieurs séances de hausse.',
    options: [
      'Le prix passe sous le plus bas de la bougie d’englobement et y reste.',
      'La taille de la bougie rouge suffit : un englobement aussi net se passe de suite.',
      'La résistance au-dessus garantit à elle seule la poursuite de la baisse.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule:
      'La zone de confirmation d’un avalement baissier est SOUS le plus bas de la bougie d’englobement — exactement le miroir du cas haussier.',
    whenItFails:
      'Sans passage sous ce plancher, la figure reste une hypothèse : une grande bougie n’est pas une preuve.',
    a11y:
      'Contexte : une grande bougie rouge englobe la petite verte précédente, sous une résistance, après une hausse. Trois conclusions possibles à départager.',
  },
  {
    // Dérivé de `invalidation` : « Clôture au-dessus du plus haut de la figure ». C'est LE point où
    // le miroir compte : la version haussière s'invalide vers le BAS, celle-ci vers le HAUT.
    id: 'ex.candle.mirror.invalidate',
    skillId: 'skill.candle.mirror',
    target: target(BEARISH_ENGULFING, 'invalidate'),
    interaction: 'place-extreme',
    chartSeed: 214,
    prompt:
      'Un setup baissier s’invalide vers le HAUT. Place la ligne sur le plus haut atteint : au-dessus, la lecture baissière tombe.',
    difficulty: 'hard',
    rule:
      'Un avalement baissier est invalidé par une clôture au-dessus du plus haut de la figure : l’invalidation se place en HAUT, jamais en bas.',
    whenItFails:
      'Placer l’invalidation sous la figure, par réflexe haussier, revient à surveiller le mauvais côté du graphique.',
  },
  {
    // Dérivé de `falseSignals` (« englobement partiel », « figure isolée sans résistance proche »)
    // et de `commonMistakes` (« confondre avalement et simple grande bougie »).
    id: 'ex.candle.mirror.avoid',
    skillId: 'skill.candle.mirror',
    target: target(BEARISH_ENGULFING, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur l’avalement baissier.',
    statements: [
      'Un englobement seulement partiel affaiblit la figure : le corps doit être entièrement recouvert.',
      'Une grande bougie rouge suffit à faire un avalement, même sans petite bougie verte avant elle.',
      'Isolée, loin de toute résistance, la figure a beaucoup moins de portée.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétences 6 à 8 — La même forme, l'autre histoire — LOT C4 ─────
// Ici la direction ne suffit plus : le PENDU a exactement la forme du marteau, et le MARTEAU INVERSÉ
// celle de l'étoile filante. Les trois fiches se signalent mutuellement dans `commonMistakes` — la
// confusion est documentée par le contenu lui-même. Deux figures baissières (invalidation en haut),
// une haussière (invalidation en bas) : la règle du LOT C3 tient encore, dans un autre monde.
const CONTEXT_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.candle.context.recognize',
    skillId: 'skill.candle.context',
    target: target(HANGING_MAN, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.hanging-man.v1',
    variant: 'hanging-man',
    visualType: 'candlestick-pattern',
    prompt: 'Cette bougie apparaît APRÈS UNE HAUSSE. Quelle figure est-ce ?',
    options: [
      'Un pendu (même forme que le marteau, mais après une hausse)',
      'Un marteau (même forme, mais après une baisse)',
      'Un marubozu (corps long, quasi sans mèche)',
    ],
    correctIndex: 0,
    a11y: 'Bougie à petit corps en haut et longue mèche basse, apparaissant après une hausse.',
    difficulty: 'medium',
    rule: 'Marteau et pendu ont la MÊME forme : c’est le contexte qui les distingue — baisse avant, ou hausse avant.',
  },
  {
    id: 'ex.candle.context.interpret',
    skillId: 'skill.candle.context',
    target: target(HANGING_MAN, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un pendu.',
    steps: [
      'Regarde ce qui PRÉCÈDE : une hausse',
      'Repère la forme : petit corps en haut, longue mèche basse',
      'Vérifie s’il y a une résistance à proximité',
      'Attends la bougie suivante pour trancher',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Sur cette figure, le contexte se lit AVANT la forme : la même bougie change de sens selon ce qui la précède.',
  },
  {
    id: 'ex.candle.context.confirm',
    skillId: 'skill.candle.context',
    target: target(HANGING_MAN, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme ce pendu ?',
    context:
      'Après plusieurs séances de hausse, une bougie à petit corps et longue mèche basse se forme sous une résistance connue.',
    options: [
      'La bougie suivante passe sous le corps du pendu et y reste.',
      'La longueur de la mèche basse suffit : un rejet aussi net se passe de suite.',
      'La hausse précédente garantit à elle seule le retournement.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Le pendu se confirme SOUS son corps, sur la bougie suivante — un avertissement, jamais un verdict.',
    whenItFails: 'Sans passage sous le corps, l’avertissement reste un avertissement.',
    a11y:
      'Contexte : après plusieurs séances de hausse, une bougie à petit corps et longue mèche basse sous une résistance. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.candle.context.invalidate',
    skillId: 'skill.candle.context',
    target: target(HANGING_MAN, 'invalidate'),
    interaction: 'place-extreme',
    chartSeed: 291,
    prompt: 'Ce setup est baissier : il s’invalide vers le HAUT. Place la ligne sur le plus haut atteint.',
    difficulty: 'hard',
    rule: 'Le pendu est invalidé par la poursuite de la hausse au-dessus de son plus haut : l’invalidation se place en HAUT.',
    whenItFails: 'Reprendre l’invalidation du marteau — sous la mèche — revient à traiter le pendu comme son contraire.',
  },
  {
    id: 'ex.candle.context.avoid',
    skillId: 'skill.candle.context',
    target: target(HANGING_MAN, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le pendu.',
    statements: [
      'Marteau et pendu ont la même forme ; seul le contexte les distingue.',
      'Une longue mèche basse annonce toujours une reprise des acheteurs, quel que soit ce qui précède.',
      'En pleine impulsion, loin de toute résistance, un pendu a peu de portée.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

const REJECTION_HIGH_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.candle.rejection-high.recognize',
    skillId: 'skill.candle.rejection-high',
    target: target(SHOOTING_STAR, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.shooting-star.v1',
    variant: 'shooting-star',
    visualType: 'candlestick-pattern',
    prompt: 'Cette bougie apparaît APRÈS UNE HAUSSE. Quelle figure est-ce ?',
    options: [
      'Une étoile filante (petit corps en bas, longue mèche haute, après une hausse)',
      'Un marteau inversé (même forme, mais après une baisse)',
      'Un doji (corps minuscule, mèches équilibrées)',
    ],
    correctIndex: 0,
    a11y: 'Une bougie à petit corps en bas et longue mèche vers le haut, illustrant un rejet des prix hauts après une hausse.',
    difficulty: 'medium',
    rule: 'L’étoile filante montre un rejet des prix HAUTS : la longue mèche est au-dessus, et elle survient après une hausse.',
  },
  {
    id: 'ex.candle.rejection-high.interpret',
    skillId: 'skill.candle.rejection-high',
    target: target(SHOOTING_STAR, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’une étoile filante.',
    steps: [
      'Regarde ce qui précède : une hausse',
      'Repère la longue mèche HAUTE et le petit corps en bas',
      'Vérifie la présence d’une résistance à proximité',
      'Regarde si le volume appuie le rejet',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Une mèche haute traduit un rejet des prix hauts ; c’est le contexte et la résistance qui lui donnent du poids.',
  },
  {
    id: 'ex.candle.rejection-high.confirm',
    skillId: 'skill.candle.rejection-high',
    target: target(SHOOTING_STAR, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette étoile filante ?',
    context:
      'Après une hausse soutenue, une bougie à longue mèche haute bute sur une résistance connue et referme près de son plus bas.',
    options: [
      'Le prix passe sous le plus bas de l’étoile filante sur la ou les bougies suivantes.',
      'La longueur de la mèche haute suffit à valider le retournement.',
      'La présence d’une résistance confirme à elle seule la figure.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'L’étoile filante se confirme SOUS son plus bas — le rejet doit être suivi d’effet.',
    whenItFails: 'Un volume trop faible pour appuyer le rejet affaiblit la lecture, même sur une belle mèche.',
    a11y:
      'Contexte : après une hausse soutenue, une bougie à longue mèche haute bute sur une résistance et referme près de son plus bas. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.candle.rejection-high.invalidate',
    skillId: 'skill.candle.rejection-high',
    target: target(SHOOTING_STAR, 'invalidate'),
    interaction: 'place-extreme',
    chartSeed: 305,
    prompt: 'Ce setup est baissier : il s’invalide vers le HAUT. Place la ligne sur le plus haut atteint.',
    difficulty: 'hard',
    rule: 'L’étoile filante est invalidée par une clôture nette au-dessus du plus haut de sa mèche : l’invalidation se place en HAUT.',
    whenItFails: 'Au-dessus de la mèche, le rejet n’a pas tenu : ce n’était pas un plafond.',
  },
  {
    id: 'ex.candle.rejection-high.avoid',
    skillId: 'skill.candle.rejection-high',
    target: target(SHOOTING_STAR, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur l’étoile filante.',
    statements: [
      'Sans résistance à proximité, la figure a beaucoup moins de portée.',
      'Une longue mèche haute est un rejet valable quel que soit le volume qui l’accompagne.',
      'Étoile filante et marteau inversé ont la même forme ; le contexte les sépare.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

const REJECTION_LOW_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.candle.rejection-low.recognize',
    skillId: 'skill.candle.rejection-low',
    target: target(INVERTED_HAMMER, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.inverted-hammer.v1',
    variant: 'inverted-hammer',
    visualType: 'candlestick-pattern',
    prompt: 'Cette bougie apparaît APRÈS UNE BAISSE. Quelle figure est-ce ?',
    options: [
      'Un marteau inversé (même forme que l’étoile filante, mais après une baisse)',
      'Une étoile filante (même forme, mais après une hausse)',
      'Un pendu (petit corps en haut, longue mèche basse)',
    ],
    correctIndex: 0,
    a11y: 'Bougie à petit corps en bas et longue mèche haute, après une baisse.',
    difficulty: 'medium',
    rule: 'Le marteau inversé a la forme exacte de l’étoile filante : seule la baisse qui le précède en fait un test de retournement HAUSSIER.',
  },
  {
    id: 'ex.candle.rejection-low.interpret',
    skillId: 'skill.candle.rejection-low',
    target: target(INVERTED_HAMMER, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un marteau inversé.',
    steps: [
      'Regarde ce qui précède : une baisse',
      'Repère la longue mèche haute et le petit corps en bas',
      'Cherche un support à proximité',
      'Attends la confirmation au-dessus du plus haut de la bougie',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Même forme que l’étoile filante, lecture inverse : c’est la baisse précédente qui en fait un test de retournement.',
  },
  {
    id: 'ex.candle.rejection-low.confirm',
    skillId: 'skill.candle.rejection-low',
    target: target(INVERTED_HAMMER, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme ce marteau inversé ?',
    context:
      'Après une baisse prolongée, une bougie à petit corps bas et longue mèche haute se forme au contact d’un support.',
    options: [
      'Le prix repasse au-dessus du plus haut du marteau inversé.',
      'La longue mèche haute suffit : les acheteurs ont clairement tenté quelque chose.',
      'Le contact avec le support confirme à lui seul le retournement.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Le marteau inversé se confirme AU-DESSUS de son plus haut — l’exact opposé de l’étoile filante, qui se confirme sous son plus bas.',
    whenItFails: 'Sans support ni confirmation, la mèche haute traduit surtout un rejet — pas une reprise.',
    a11y:
      'Contexte : après une baisse prolongée, une bougie à petit corps bas et longue mèche haute au contact d’un support. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.candle.rejection-low.invalidate',
    skillId: 'skill.candle.rejection-low',
    target: target(INVERTED_HAMMER, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 318,
    prompt:
      'Attention : ce setup est HAUSSIER. Il s’invalide donc vers le BAS. Place la ligne sur le plus bas atteint.',
    difficulty: 'hard',
    rule:
      'Le marteau inversé est invalidé par un nouveau plus bas sous la bougie : parce que le setup est haussier, l’invalidation se place en BAS.',
    whenItFails:
      'Deux bougies de forme identique n’ont pas la même invalidation : c’est le SENS du setup qui décide, jamais la silhouette.',
  },
  {
    id: 'ex.candle.rejection-low.avoid',
    skillId: 'skill.candle.rejection-low',
    target: target(INVERTED_HAMMER, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le marteau inversé.',
    statements: [
      'Sans support ni confirmation, la mèche haute traduit surtout un rejet des prix hauts.',
      'Puisqu’il a la même forme que l’étoile filante, il s’invalide comme elle, vers le haut.',
      'C’est la baisse qui le précède qui en fait un test de retournement.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 9 — Le retournement en trois temps (étoile du matin / étoile du soir) ────────
// LOT C6. Première figure du module qui exige TROIS bougies. Tout est dérivé des fiches :
//   `definitionShort` : « Trois bougies : baissière, petite d'indécision, puis haussière — après une baisse. »
//   `confirmationZone` : « Au-dessus du plus haut de la troisième bougie. »
//   `invalidation`     : « Clôture sous le plus bas de la figure. »
//   `falseSignals`     : « Troisième bougie faible qui ne reprend rien. »
// Le miroir (étoile du soir) sert de contre-exemple DANS la même compétence : c'est la même
// séquence lue à l'envers, et c'est précisément ce que l'apprenant doit savoir distinguer.
const SEQUENCE_REVERSAL_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.candle.sequence-reversal.recognize',
    skillId: 'skill.candle.sequence-reversal',
    target: target(MORNING_STAR, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.morning-star.v1',
    variant: 'morning-star',
    visualType: 'candlestick-pattern',
    prompt: 'Cette séquence apparaît APRÈS UNE BAISSE. Quelle figure est-ce ?',
    options: [
      'Une étoile du matin (baissière, indécision, haussière)',
      'Une étoile du soir (haussière, indécision, baissière)',
      'Trois soldats blancs (trois bougies haussières de suite)',
    ],
    correctIndex: 0,
    a11y:
      'Trois bougies : une baissière au corps net, une très petite au milieu, puis une haussière qui remonte dans le corps de la première. L’ensemble suit une baisse.',
    difficulty: 'medium',
    rule: 'L’étoile du matin est une séquence de trois bougies : baissière, indécision, haussière — dans cet ordre, après une baisse.',
  },
  {
    // La mécanique `read-order` cesse d'être un exercice d'énonciation : ici l'ORDRE est la chose
    // enseignée. Une étoile du matin lue à l'envers EST une étoile du soir.
    id: 'ex.candle.sequence-reversal.interpret',
    skillId: 'skill.candle.sequence-reversal',
    target: target(MORNING_STAR, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets les trois temps de l’étoile du matin dans l’ordre.',
    steps: [
      'Une baisse est en cours : la première bougie est baissière',
      'Le mouvement s’arrête : une toute petite bougie, l’indécision',
      'La troisième bougie est haussière et remonte dans le corps de la première',
      'On attend le dépassement du plus haut de cette troisième bougie',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Ici l’ORDRE est la figure : c’est la petite bougie du milieu, la pause, qui sépare la baisse de la reprise. Sans elle, il n’y a pas d’étoile.',
  },
  {
    id: 'ex.candle.sequence-reversal.confirm',
    skillId: 'skill.candle.sequence-reversal',
    target: target(MORNING_STAR, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette étoile du matin ?',
    context:
      'Après une baisse, une bougie baissière, puis une toute petite bougie d’indécision, puis une bougie haussière. La séquence est complète.',
    options: [
      'Le prix dépasse le plus haut de la troisième bougie.',
      'La petite bougie du milieu suffit : l’indécision annonce le retournement.',
      'Les trois bougies formées dans cet ordre valent confirmation à elles seules.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La confirmation se prend AU-DESSUS du plus haut de la troisième bougie — pas à la formation de la figure.',
    whenItFails:
      'Une troisième bougie faible, qui ne reprend rien du corps de la première, laisse la figure sans contenu.',
    a11y:
      'Contexte : après une baisse, la séquence baissière, indécision, haussière est complète. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.candle.sequence-reversal.invalidate',
    skillId: 'skill.candle.sequence-reversal',
    target: target(MORNING_STAR, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 421,
    prompt:
      'Ce setup est HAUSSIER. Il s’invalide donc vers le BAS. Place la ligne sur le plus bas de la figure.',
    difficulty: 'hard',
    rule: 'L’étoile du matin est invalidée par une clôture sous le plus bas de la FIGURE — les trois bougies, pas seulement la dernière.',
    whenItFails:
      'Placer l’invalidation sous la seule troisième bougie la met trop haut : la figure entière est le niveau de référence.',
  },
  {
    // Le contre-exemple est le MIROIR de la figure, et il est dans le corpus : `concept.evening-star`
    // se confirme SOUS le plus bas de sa troisième bougie. C'est l'erreur attendue.
    id: 'ex.candle.sequence-reversal.avoid',
    skillId: 'skill.candle.sequence-reversal',
    target: target(MORNING_STAR, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les étoiles du matin et du soir.',
    statements: [
      'Une troisième bougie faible, qui ne reprend rien, vide la figure de son sens.',
      'Étoile du matin et étoile du soir se confirment du même côté, puisqu’elles ont la même forme.',
      'Les mêmes trois bougies lues dans l’autre sens ne racontent pas la même histoire.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 10 — La poussée en trois temps (trois soldats / trois corbeaux) ────────────
// LOT C6. Même exigence de séquence, mais l'histoire est CONTRAIRE : ici les trois bougies vont
// dans le MÊME sens. Ce n'est pas un retournement, c'est une continuation. Dérivé des fiches :
//   `definitionShort` : « Trois bougies haussières successives, chacune clôturant plus haut. »
//   `confirmationZone` : « Au-dessus de la clôture de la troisième bougie. »
//   `invalidation`     : « Clôture sous le corps de la première des trois. »
//   `falseSignals`     : « Bougies aux longues mèches hautes (rejet) » ; « Après une hausse déjà étirée. »
const SEQUENCE_MOMENTUM_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.candle.sequence-momentum.recognize',
    skillId: 'skill.candle.sequence-momentum',
    target: target(THREE_WHITE_SOLDIERS, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.three-white-soldiers.v1',
    variant: 'three-white-soldiers',
    visualType: 'candlestick-pattern',
    prompt: 'Quelle séquence reconnais-tu ?',
    options: [
      'Trois soldats blancs (trois haussières, chacune clôturant plus haut)',
      'Une étoile du matin (baissière, indécision, haussière)',
      'Trois corbeaux noirs (trois baissières, chacune clôturant plus bas)',
    ],
    correctIndex: 0,
    a11y:
      'Trois bougies haussières consécutives aux corps nets, chacune clôturant plus haut que la précédente, avec peu de mèche.',
    difficulty: 'easy',
    rule: 'Trois soldats : trois bougies du MÊME sens à la suite. Contrairement à l’étoile, il n’y a pas de pause au milieu — c’est une poussée, pas un retournement.',
  },
  {
    id: 'ex.candle.sequence-momentum.interpret',
    skillId: 'skill.candle.sequence-momentum',
    target: target(THREE_WHITE_SOLDIERS, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture de trois soldats blancs.',
    steps: [
      'Regarde d’abord où l’on se trouve : début de mouvement, ou hausse déjà étirée ?',
      'Vérifie que les trois bougies clôturent bien chacune plus haut',
      'Regarde les mèches hautes : longues, elles trahissent un rejet',
      'Attends le dépassement de la clôture de la troisième',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'hard',
    rule: 'La position dans le mouvement se lit AVANT la forme : les trois mêmes bougies sont une poussée au départ, un épuisement en fin de course.',
  },
  {
    id: 'ex.candle.sequence-momentum.confirm',
    skillId: 'skill.candle.sequence-momentum',
    target: target(THREE_WHITE_SOLDIERS, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette poussée ?',
    context:
      'Trois bougies haussières se sont succédé, chacune clôturant plus haut que la précédente, avec des mèches courtes.',
    options: [
      'Le prix dépasse la clôture de la troisième bougie.',
      'Trois bougies haussières de suite se passent de confirmation.',
      'Il suffit que la troisième bougie soit la plus longue des trois.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La poussée se confirme au-dessus de la CLÔTURE de la troisième — pas de son plus haut : ce sont les corps qui portent la conviction.',
    whenItFails:
      'Après une hausse déjà étirée, la même séquence signale plutôt un essoufflement que le début de quelque chose.',
    a11y:
      'Contexte : trois bougies haussières consécutives à mèches courtes, chacune clôturant plus haut. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.candle.sequence-momentum.invalidate',
    skillId: 'skill.candle.sequence-momentum',
    target: target(THREE_WHITE_SOLDIERS, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 517,
    prompt:
      'Ce setup est HAUSSIER. Il s’invalide donc vers le BAS. Place la ligne sur le plus bas atteint.',
    difficulty: 'hard',
    rule: 'Les trois soldats sont invalidés par une clôture sous le corps de la PREMIÈRE des trois : la poussée est annulée quand on revient à son point de départ.',
    whenItFails:
      'La séquence miroir — trois corbeaux — est BAISSIÈRE : elle s’invalide au-dessus du corps de sa première bougie, donc en haut.',
  },
  {
    id: 'ex.candle.sequence-momentum.avoid',
    skillId: 'skill.candle.sequence-momentum',
    target: target(THREE_WHITE_SOLDIERS, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les trois soldats.',
    statements: [
      'De longues mèches hautes sur les trois bougies trahissent un rejet, malgré les clôtures en hausse.',
      'Trois bougies haussières de suite sont un signal d’autant plus fort que la hausse dure déjà depuis longtemps.',
      'Trois soldats et trois corbeaux sont la même séquence de sens opposé, et s’invalident de côtés opposés.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 11 — La bougie contenue (harami) ──────────────────────────────────────────
// LOT C9. Dérivé de la fiche :
//   `definitionShort` : « Une petite bougie contenue dans le corps de la grande précédente : la
//                        tendance ralentit. »
//   `confirmationZone` : « À la sortie de la petite bougie, dans le SENS CONFIRMÉ. »
//   `invalidation`     : « Poursuite nette de la tendance d'origine. »
//   `falseSignals`     : « Harami en plein milieu d'une impulsion forte. »
//
// Le corpus déclare `direction: 'neutral'`, et cela se voit dans sa confirmation : « dans le sens
// CONFIRMÉ », pas dans un sens annoncé. Même conséquence que pour le triangle symétrique au LOT C7 :
// une figure sans direction n'a pas de côté, donc AUCUN placement d'invalidation. Son invalidation
// est « la tendance d'origine repart » — un comportement, pas un extrême. L'objectif est couvert par
// un scénario conditionnel, jamais escamoté.
const CONTAINMENT_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.candle.containment.recognize',
    skillId: 'skill.candle.containment',
    target: target(HARAMI, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.bullish-harami.v1',
    variant: 'bullish-harami',
    visualType: 'candlestick-pattern',
    prompt: 'Regarde le RAPPORT entre les deux bougies. Quelle figure est-ce ?',
    options: [
      'Un harami (la seconde bougie tient entièrement dans le corps de la première)',
      'Un avalement (la seconde bougie ENGLOBE la première — l’inverse)',
      'Des pincettes (deux bougies qui butent sur le même extrême)',
    ],
    correctIndex: 0,
    a11y:
      'Une grande bougie, puis une petite dont le corps tient entièrement à l’intérieur du corps de la précédente.',
    difficulty: 'medium',
    rule: 'Harami et avalement sont la même relation lue dans l’autre sens : dans le harami la seconde est CONTENUE, dans l’avalement elle CONTIENT.',
  },
  {
    id: 'ex.candle.containment.interpret',
    skillId: 'skill.candle.containment',
    target: target(HARAMI, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un harami.',
    steps: [
      'Repère la grande bougie qui vient d’étendre la tendance',
      'Vérifie que la suivante tient ENTIÈREMENT dans son corps',
      'Lis ce que dit cette contenance : le mouvement n’étend plus rien, il ralentit',
      'Attends la sortie de la petite bougie pour connaître le sens',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un harami ne dit pas « ça se retourne » : il dit « ça ralentit ». Une séance qui ne dépasse plus la précédente a cessé d’avancer.',
  },
  {
    id: 'ex.candle.containment.confirm',
    skillId: 'skill.candle.containment',
    target: target(HARAMI, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme ce harami ?',
    context:
      'Après une longue bougie qui a étendu la tendance, la séance suivante est petite et tient entièrement dans le corps de la précédente.',
    options: [
      'La sortie de la petite bougie — et c’est elle qui donne le sens, dans un camp ou dans l’autre.',
      'La contenance suffit : une bougie enfermée annonce le retournement.',
      'La taille de la première bougie décide du sens de la suite.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Le harami donne un niveau de décision, pas une direction : c’est la sortie de la petite bougie qui tranche.',
    whenItFails: 'En plein milieu d’une impulsion forte, une pause d’une séance ne signifie rien.',
    a11y:
      'Contexte : une longue bougie de tendance, puis une petite entièrement contenue dans son corps. Trois conclusions possibles à départager.',
  },
  {
    // Figure NEUTRE : pas de placement. Même règle qu'au LOT C7 pour le triangle symétrique — son
    // invalidation est un COMPORTEMENT (« la tendance d'origine repart »), pas un extrême à poser.
    id: 'ex.candle.containment.invalidate',
    skillId: 'skill.candle.containment',
    target: target(HARAMI, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'La séance suivante repart franchement dans le sens de la tendance d’origine. Qu’est-ce que cela dit du harami ?',
    context:
      'Une tendance baissière, une longue bougie rouge, puis un harami. La séance d’après, le prix casse à la baisse et clôture sous le bas de la grande bougie.',
    options: [
      'Le harami est invalidé : la tendance d’origine a repris, la pause n’a rien changé.',
      'Le harami reste valable : il annonçait un retournement, il faut lui laisser du temps.',
      'La cassure confirme le harami dans le sens baissier.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Le harami s’invalide par la POURSUITE de la tendance d’origine. N’ayant pas de direction propre, il n’a pas de côté d’invalidation à placer.',
    whenItFails:
      'Une sortie par le bas n’est pas non plus « un harami baissier confirmé » : la figure a simplement cessé d’exister.',
    a11y:
      'Contexte : tendance baissière, longue bougie rouge, harami, puis cassure et clôture sous le bas de la grande bougie. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.candle.containment.avoid',
    skillId: 'skill.candle.containment',
    target: target(HARAMI, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le harami.',
    statements: [
      'En plein milieu d’une impulsion forte, un harami ne signifie pas grand-chose.',
      'Une bougie contenue dans la précédente annonce un retournement de tendance.',
      'C’est la sortie de la petite bougie qui donne le sens, pas la figure elle-même.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 12 — Le même extrême, deux fois (pincettes) ───────────────────────────────
// LOT C9. Dérivé de la fiche :
//   `definitionShort` : « Deux bougies qui butent sur un même extrême : un niveau qui tient à deux
//                        reprises. »
//   `confirmationZone` : « À la sortie du niveau, dans le sens confirmé. »
//   `invalidation`     : « Franchissement franc du NIVEAU testé. »
//   `falseSignals`     : « Pincettes au milieu de nulle part, sans niveau. »
//
// L'idée propre à cette compétence : ce n'est pas la bougie qui parle, c'est le PRIX auquel elles
// s'arrêtent toutes les deux. Le corpus la relie d'ailleurs à `concept.support-resistance`, pas à
// une autre figure de chandelier. `direction: 'bearish'` (pincettes de sommet) ⇒ invalidation en
// HAUT, donc mécanique `place-extreme`.
const TWIN_LEVEL_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.candle.twin-level.recognize',
    skillId: 'skill.candle.twin-level',
    target: target(TWEEZER, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.tweezer-top.v1',
    variant: 'tweezer-top',
    visualType: 'candlestick-pattern',
    prompt: 'Regarde à quel PRIX les deux bougies s’arrêtent. Quelle figure est-ce ?',
    options: [
      'Des pincettes (deux bougies qui butent sur le même extrême)',
      'Un harami (la seconde bougie contenue dans le corps de la première)',
      'Un avalement (la seconde bougie englobe la première)',
    ],
    correctIndex: 0,
    a11y:
      'Deux bougies voisines dont les plus hauts s’arrêtent au même niveau, formant une ligne horizontale au sommet.',
    difficulty: 'medium',
    rule: 'Ici la forme des bougies importe peu : ce qui fait la figure, c’est qu’elles s’arrêtent au MÊME prix, deux fois.',
  },
  {
    id: 'ex.candle.twin-level.interpret',
    skillId: 'skill.candle.twin-level',
    target: target(TWEEZER, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture de pincettes.',
    steps: [
      'Repère les deux extrêmes qui s’arrêtent au même prix',
      'Trace le niveau horizontal qu’ils dessinent',
      'Vérifie que ce niveau existait DÉJÀ avant ces deux bougies',
      'Attends la sortie du niveau pour connaître le sens',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'hard',
    rule: 'La troisième étape est celle qu’on saute : deux bougies au même prix ne valent que si ce prix comptait déjà.',
  },
  {
    id: 'ex.candle.twin-level.confirm',
    skillId: 'skill.candle.twin-level',
    target: target(TWEEZER, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme ces pincettes ?',
    context:
      'Deux séances consécutives butent exactement sur le même plus haut, au contact d’une résistance déjà visible sur le graphique.',
    options: [
      'La sortie du niveau testé, qui donne le sens.',
      'Le double contact suffit : un niveau touché deux fois est un niveau qui tient.',
      'La couleur de la seconde bougie indique la suite.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Le double test dit que le niveau EXISTE, pas qu’il tiendra. C’est la sortie qui décide.',
    whenItFails: 'Des pincettes au milieu de nulle part, sans niveau préexistant, ne testent rien.',
    a11y:
      'Contexte : deux séances consécutives butant sur le même plus haut, au contact d’une résistance déjà visible. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.candle.twin-level.invalidate',
    skillId: 'skill.candle.twin-level',
    target: target(TWEEZER, 'invalidate'),
    // Setup BAISSIER (pincettes de sommet) ⇒ invalidation en HAUT : mécanique `place-extreme`.
    interaction: 'place-extreme',
    chartSeed: 842,
    prompt:
      'Ces pincettes de sommet sont un setup BAISSIER : elles s’invalident vers le HAUT. Place la ligne sur le plus haut atteint.',
    difficulty: 'hard',
    rule: 'Les pincettes sont invalidées par un franchissement FRANC du niveau testé : le setup étant baissier, l’invalidation se place au-dessus.',
    whenItFails:
      'Un dépassement de quelques centimes n’est pas un franchissement franc : c’est souvent la mèche qui va chercher les invalidations trop serrées.',
  },
  {
    id: 'ex.candle.twin-level.avoid',
    skillId: 'skill.candle.twin-level',
    target: target(TWEEZER, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les pincettes.',
    statements: [
      'Sans niveau préexistant, deux bougies au même prix ne testent rien.',
      'Ce sont les formes des deux bougies qui font la figure.',
      'Le double test montre que le niveau existe — il ne garantit pas qu’il tiendra.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const CANDLE_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.candle.pressure': PRESSURE_SCENARIOS,
  'skill.candle.rejection': REJECTION_SCENARIOS,
  'skill.candle.indecision': INDECISION_SCENARIOS,
  'skill.candle.reversal': REVERSAL_SCENARIOS,
  'skill.candle.mirror': MIRROR_SCENARIOS,
  'skill.candle.context': CONTEXT_SCENARIOS,
  'skill.candle.rejection-high': REJECTION_HIGH_SCENARIOS,
  'skill.candle.rejection-low': REJECTION_LOW_SCENARIOS,
  'skill.candle.sequence-reversal': SEQUENCE_REVERSAL_SCENARIOS,
  'skill.candle.sequence-momentum': SEQUENCE_MOMENTUM_SCENARIOS,
  'skill.candle.containment': CONTAINMENT_SCENARIOS,
  'skill.candle.twin-level': TWIN_LEVEL_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const CANDLE_MODULE_SCENARIOS: LearningScenario[] = CANDLE_SKILLS.flatMap(
  (s) => CANDLE_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const CANDLE_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(CANDLE_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
