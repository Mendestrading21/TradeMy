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
];

// Concepts réels du monde `world.candles` reliés à chaque compétence (source : learningContent V5).
const MARUBOZU = 'concept.marubozu';
const HAMMER = 'concept.hammer';
const DOJI = 'concept.doji';
const ENGULFING = 'concept.bullish-engulfing';
const BEARISH_ENGULFING = 'concept.bearish-engulfing';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const CANDLE_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.candle.pressure': MARUBOZU,
  'skill.candle.rejection': HAMMER,
  'skill.candle.indecision': DOJI,
  'skill.candle.reversal': ENGULFING,
  'skill.candle.mirror': BEARISH_ENGULFING,
};
export const CANDLE_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.candle.pressure': 'marubozu',
  'skill.candle.rejection': 'marteau',
  'skill.candle.indecision': 'doji',
  'skill.candle.reversal': 'avalement-haussier',
  'skill.candle.mirror': 'avalement-baissier',
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

/** Scénarios par compétence (source unique du module). */
export const CANDLE_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.candle.pressure': PRESSURE_SCENARIOS,
  'skill.candle.rejection': REJECTION_SCENARIOS,
  'skill.candle.indecision': INDECISION_SCENARIOS,
  'skill.candle.reversal': REVERSAL_SCENARIOS,
  'skill.candle.mirror': MIRROR_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const CANDLE_MODULE_SCENARIOS: LearningScenario[] = CANDLE_SKILLS.flatMap(
  (s) => CANDLE_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const CANDLE_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(CANDLE_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
