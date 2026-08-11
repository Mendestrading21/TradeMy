/**
 * LOT 4-Q — Module guidé « Lire les figures » (monde 6, `world.patterns`).
 *
 * Sixième module guidé réel, dérivé du registre canonique `CONTENT_MODULES`. Même architecture :
 * chaque item est un `LearningScenario` — UNE seule vérité par item. Aucune seconde source.
 *
 * Principe pédagogique central : une figure chartiste n'est jamais une promesse — c'est une
 * hypothèse conditionnelle qui se CONFIRME (clôture, participation, retest) ou s'INVALIDE. Quatre
 * compétences par FAMILLES, chacune ancrée sur un concept réel représentatif (les 9 autres figures
 * du monde restent des fiches consultables) :
 *   1. Les doubles           → `concept.double-bottom` (double creux)
 *   2. Les triangles         → `concept.ascending-triangle` (triangle ascendant)
 *   3. Les drapeaux          → `concept.bull-flag` (drapeau haussier, continuation)
 *   4. Le retournement majeur → `concept.head-shoulders` (épaule-tête-épaule)
 *   5. La figure miroir        → `concept.double-top` (double sommet — LOT C2)
 *
 * Objectifs ciblés = objectifs RÉELS (learningTarget). Honnêteté du placement : seuls le double
 * creux (« sous le second creux ») et le drapeau (« sous le bas du drapeau ») documentent une
 * invalidation-PLANCHER → placement pour eux seuls. Le triangle s'invalide sous une ligne MONTANTE
 * (pas un plancher horizontal) et l'ÉTÉ, baissier, s'invalide AU-DESSUS de la tête → pas de
 * placement. Statuts éditoriaux inchangés (`needsReview`). Aucun vocabulaire BUY/SELL.
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const PATTERNS_MODULE_ID = 'module.patterns.read-patterns';
export const PATTERNS_MODULE_TITLE = 'Lire les figures';
export const PATTERNS_MODULE_WORLD_ID = 'world.patterns';
export const PATTERNS_CHECKPOINT_ID = 'checkpoint.patterns';
export const PATTERNS_CHECKPOINT_TITLE = 'Revue — Figures chartistes';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const PATTERNS_SKILLS: Skill[] = [
  { id: 'skill.patterns.double', name: 'Les doubles', description: 'Reconnaître un double creux et sa ligne de cou — jamais sans confirmation.' },
  { id: 'skill.patterns.triangle', name: 'Les triangles', description: 'Lire la compression d’un triangle ascendant et attendre sa résolution.' },
  { id: 'skill.patterns.flag', name: 'Les drapeaux', description: 'Lire une pause de continuation : mât, canal, reprise.' },
  { id: 'skill.patterns.reversal', name: 'Le retournement majeur', description: 'Reconnaître l’épaule-tête-épaule et sa ligne de cou.' },
  // LOT C2 — la figure MIROIR : le double, retourné. Même lecture, invalidation de l'autre côté.
  { id: 'skill.patterns.mirror', name: 'La figure miroir', description: 'Transposer le double à la baisse — et retrouver son invalidation, qui change de côté.' },
];

// Concepts réels du monde `world.patterns` reliés à chaque compétence.
const DOUBLE = 'concept.double-bottom';
const TRIANGLE = 'concept.ascending-triangle';
const FLAG = 'concept.bull-flag';
const HNS = 'concept.head-shoulders';
const DOUBLE_TOP = 'concept.double-top';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const PATTERNS_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.patterns.double': DOUBLE,
  'skill.patterns.triangle': TRIANGLE,
  'skill.patterns.flag': FLAG,
  'skill.patterns.reversal': HNS,
  'skill.patterns.mirror': DOUBLE_TOP,
};
export const PATTERNS_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.patterns.double': 'double-creux',
  'skill.patterns.triangle': 'triangle-ascendant',
  'skill.patterns.flag': 'drapeau-haussier',
  'skill.patterns.reversal': 'epaule-tete-epaule',
  'skill.patterns.mirror': 'double-sommet',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — Les doubles (double creux) ────────────────────────
// recognize · interpret (lecture ordonnée) · invalidate (plancher) · avoid-false-signal.
const DOUBLE_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.patterns.double.recognize',
    skillId: 'skill.patterns.double',
    target: target(DOUBLE, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'pattern.double-bottom.v1',
    variant: 'double-bottom',
    visualType: 'chart-pattern',
    prompt: 'Quelle figure chartiste reconnais-tu ?',
    options: ['Un double creux (deux planchers au même niveau)', 'Un drapeau haussier (canal après un mât)', 'Un triangle ascendant (résistance plate, creux montants)'],
    correctIndex: 0,
    a11y: 'Deux creux successifs au même niveau, séparés par un sommet intermédiaire : la ligne de cou.',
    difficulty: 'easy',
    rule: 'Le double creux se reconnaît à ses deux planchers au même niveau et à sa ligne de cou (le sommet intermédiaire).',
  },
  {
    id: 'ex.patterns.double.interpret',
    skillId: 'skill.patterns.double',
    target: target(DOUBLE, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un double creux.',
    steps: [
      'Repère deux creux successifs au même niveau',
      'Trace la ligne de cou (le sommet intermédiaire)',
      'Attends la clôture au-dessus de la ligne de cou',
      'Reste prudent : sans confirmation, la figure n’est qu’une hypothèse',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un double creux se lit creux d’abord, puis ligne de cou, puis confirmation — jamais une promesse.',
  },
  {
    // LOT D1 — dérivé de `confirmationZone` : « au-dessus de la ligne de cou (sommet
    // intermédiaire) » + les conditions du scénario de la fiche.
    id: 'ex.patterns.double.confirm',
    skillId: 'skill.patterns.double',
    target: target(DOUBLE, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme ce double creux ?',
    context:
      'Deux creux se sont formés à un niveau similaire, séparés par un sommet intermédiaire qui définit la ligne de cou.',
    options: [
      'Une clôture AU-DESSUS de la ligne de cou : c’est là que la figure se confirme.',
      'Le simple fait que les deux creux soient au même niveau.',
      'Un second creux légèrement plus bas que le premier.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Un double creux ne se confirme qu’au-dessus de la ligne de cou — le sommet intermédiaire est le juge.',
    whenItFails: 'Tant que la ligne de cou n’est pas franchie en clôture, la figure n’est qu’un dessin.',
    a11y:
      'Contexte : deux creux à un niveau similaire séparés par un sommet intermédiaire formant la ligne de cou. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.patterns.double.invalidate',
    skillId: 'skill.patterns.double',
    target: target(DOUBLE, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 7,
    prompt: 'Place le niveau d’invalidation : sous quel plancher le double creux ne tient plus ?',
    difficulty: 'hard',
    rule: 'Le double creux est invalidé par une clôture nette sous le niveau des deux creux : l’invalidation se pose sous ce plancher.',
  },
  {
    id: 'ex.patterns.double.avoid',
    skillId: 'skill.patterns.double',
    target: target(DOUBLE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le double creux.',
    statements: [
      'La ligne de cou est le sommet intermédiaire entre les deux creux.',
      'Deux creux au même niveau suffisent : inutile d’attendre la clôture au-dessus de la ligne de cou.',
      'Un franchissement de la ligne de cou sans participation, aussitôt rendu, est un faux signal.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — Les triangles (triangle ascendant) ────────────────
// recognize · interpret · confirm (scénario) · avoid-false-signal.
// (Invalidation sous une ligne de creux MONTANTE — pas un plancher horizontal → pas de placement.)
const TRIANGLE_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.patterns.triangle.recognize',
    skillId: 'skill.patterns.triangle',
    target: target(TRIANGLE, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'pattern.ascending-triangle.v1',
    variant: 'ascending-triangle',
    visualType: 'chart-pattern',
    prompt: 'Quelle figure chartiste reconnais-tu ?',
    options: ['Un triangle ascendant (résistance plate, creux de plus en plus hauts)', 'Un double creux (deux planchers)', 'Une épaule-tête-épaule (trois sommets)'],
    correctIndex: 0,
    a11y: 'Une résistance horizontale testée plusieurs fois, avec des creux de plus en plus hauts qui compriment le prix.',
    difficulty: 'medium',
    rule: 'Le triangle ascendant se reconnaît à sa résistance plate et à ses creux montants qui compriment le prix.',
  },
  {
    id: 'ex.patterns.triangle.interpret',
    skillId: 'skill.patterns.triangle',
    target: target(TRIANGLE, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un triangle ascendant.',
    steps: [
      'Repère la résistance horizontale testée plusieurs fois',
      'Repère les creux de plus en plus hauts',
      'Constate la compression du prix entre les deux',
      'Attends la résolution : une clôture franche hors du triangle',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un triangle se lit bornes d’abord, compression ensuite — et seule sa résolution en clôture compte.',
  },
  {
    id: 'ex.patterns.triangle.confirm',
    skillId: 'skill.patterns.triangle',
    target: target(TRIANGLE, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Que peux-tu conclure ?',
    context: 'Le prix clôture nettement au-dessus de la résistance horizontale du triangle, puis la reteste sans repasser dessous.',
    options: [
      'La sortie haussière se confirme : clôture au-dessus de la résistance, retest tenu (à surveiller, sans certitude).',
      'Le triangle est invalidé.',
      'La figure garantit la poursuite de la hausse.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La confirmation du triangle ascendant se lit au-dessus de la résistance, sur clôture — idéalement retestée.',
  },
  {
    // LOT D1 — dérivé de `invalidation` : « sortie par le bas : clôture sous la trendline des creux ».
    id: 'ex.patterns.triangle.invalidate',
    skillId: 'skill.patterns.triangle',
    target: target(TRIANGLE, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui démentirait ce triangle ascendant ?',
    context:
      'Des creux de plus en plus hauts se resserrent contre une résistance horizontale déjà touchée plusieurs fois.',
    options: [
      'Une clôture SOUS la ligne des creux montants : la sortie se fait par le bas, la lecture tombe.',
      'Une mèche qui perce brièvement la résistance sans clôturer au-dessus.',
      'Un resserrement plus lent que prévu vers la pointe.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Un triangle ascendant est démenti par une clôture sous la ligne des creux montants : c’est elle qui portait la figure.',
    whenItFails: 'Un triangle ne « doit » rien : la sortie par le bas est une issue possible, pas un accident.',
    a11y:
      'Contexte : des creux montants se resserrant contre une résistance horizontale ; il s’agit d’identifier ce qui démentirait la figure. Trois propositions à départager.',
  },
  {
    id: 'ex.patterns.triangle.avoid',
    skillId: 'skill.patterns.triangle',
    target: target(TRIANGLE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le triangle ascendant.',
    statements: [
      'La compression vient des creux montants sous une résistance plate.',
      'Toute sortie au-dessus de la résistance est valable, même sans participation ni clôture.',
      'Une clôture sous la ligne des creux montants renverse l’idée haussière.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 3 — Les drapeaux (drapeau haussier, continuation) ─────
// recognize · confirm (scénario) · invalidate (plancher du drapeau) · avoid-false-signal.
const FLAG_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.patterns.flag.recognize',
    skillId: 'skill.patterns.flag',
    target: target(FLAG, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'pattern.bull-flag.v1',
    variant: 'bull-flag',
    visualType: 'chart-pattern',
    prompt: 'Quelle figure chartiste reconnais-tu ?',
    options: ['Un drapeau haussier (mât puis canal de consolidation)', 'Un triangle ascendant (compression sous résistance)', 'Un double creux (deux planchers)'],
    correctIndex: 0,
    a11y: 'Une forte impulsion (le mât) suivie d’un petit canal de consolidation légèrement incliné : le drapeau.',
    difficulty: 'medium',
    rule: 'Le drapeau haussier se reconnaît à son mât (l’impulsion) suivi d’un canal court de consolidation.',
  },
  {
    // LOT D1 — dérivé de `definitionShort` (« une forte hausse — le mât — suivie d’une
    // consolidation en petit canal descendant ») et de `howToRecognize`.
    id: 'ex.patterns.flag.interpret',
    skillId: 'skill.patterns.flag',
    target: target(FLAG, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un drapeau haussier.',
    steps: [
      'Repère le mât : une impulsion nette et rapide',
      'Repère le drapeau : une consolidation en canal étroit, souvent contre-tendance',
      'Observe le volume : il se calme pendant la consolidation',
      'Attends la sortie : rien n’est joué tant que la borne haute n’est pas franchie en clôture',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un drapeau se lit mât d’abord, consolidation ensuite — et la sortie se constate, elle ne s’anticipe pas.',
    whenItFails: 'Une consolidation qui efface une bonne part du mât n’est plus un drapeau.',
  },
  {
    id: 'ex.patterns.flag.confirm',
    skillId: 'skill.patterns.flag',
    target: target(FLAG, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Que peux-tu conclure ?',
    context: 'Après un mât haussier, le prix consolide dans un petit canal puis clôture au-dessus de la borne supérieure du canal.',
    options: [
      'La continuation se confirme : sortie par le haut du canal en clôture (à surveiller, sans certitude).',
      'Le drapeau est invalidé.',
      'La figure garantit un nouveau mât identique.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La confirmation du drapeau se lit au-dessus de la borne supérieure du canal de consolidation.',
  },
  {
    id: 'ex.patterns.flag.invalidate',
    skillId: 'skill.patterns.flag',
    target: target(FLAG, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 2024,
    prompt: 'Place le niveau d’invalidation : sous quel plancher le drapeau ne tient plus ?',
    difficulty: 'hard',
    rule: 'Le drapeau est invalidé par une clôture sous le bas du canal, effaçant une bonne part du mât : l’invalidation se pose sous ce plancher.',
  },
  {
    id: 'ex.patterns.flag.avoid',
    skillId: 'skill.patterns.flag',
    target: target(FLAG, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le drapeau haussier.',
    statements: [
      'Le drapeau est une PAUSE après une impulsion : la consolidation reste courte et contenue.',
      'Une sortie haute sans participation, aussitôt rendue dans le canal, valide quand même la continuation.',
      'Une clôture sous le bas du drapeau annule la logique de continuation.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 4 — Le retournement majeur (épaule-tête-épaule) ───────
// recognize · interpret · confirm (scénario) · avoid-false-signal.
// (Figure BAISSIÈRE : l'invalidation documentée est AU-DESSUS (tête / ligne de cou) → pas de plancher.)
const REVERSAL_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.patterns.reversal.recognize',
    skillId: 'skill.patterns.reversal',
    target: target(HNS, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'pattern.head-shoulders.v1',
    variant: 'head-shoulders',
    visualType: 'chart-pattern',
    prompt: 'Quelle figure chartiste reconnais-tu ?',
    options: ['Une épaule-tête-épaule (trois sommets, le central plus haut)', 'Un drapeau haussier (mât + canal)', 'Un double creux (deux planchers)'],
    correctIndex: 0,
    a11y: 'Trois sommets successifs dont le central (la tête) dépasse les deux autres (les épaules), au-dessus d’une ligne de cou.',
    difficulty: 'medium',
    rule: 'L’épaule-tête-épaule se reconnaît à ses trois sommets — la tête au centre — et à sa ligne de cou.',
  },
  {
    id: 'ex.patterns.reversal.interpret',
    skillId: 'skill.patterns.reversal',
    target: target(HNS, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’une épaule-tête-épaule.',
    steps: [
      'Repère les trois sommets (la tête au centre, plus haute)',
      'Trace la ligne de cou sous les creux intermédiaires',
      'Attends la clôture sous la ligne de cou',
      'Reste probabiliste : un retournement n’est jamais garanti',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'L’ÉTÉ se lit sommets d’abord, ligne de cou ensuite, confirmation enfin — jamais une garantie.',
  },
  {
    id: 'ex.patterns.reversal.confirm',
    skillId: 'skill.patterns.reversal',
    target: target(HNS, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Que peux-tu conclure ?',
    context: 'Après la troisième bosse (l’épaule droite), le prix clôture nettement sous la ligne de cou, puis la reteste par l’arrière sans repasser au-dessus.',
    options: [
      'Le retournement baissier se confirme : clôture sous la ligne de cou, retest tenu (à surveiller, sans certitude).',
      'La figure est invalidée.',
      'La hausse est garantie de reprendre.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La confirmation de l’ÉTÉ se lit sous la ligne de cou, idéalement retestée par l’arrière.',
  },
  {
    // LOT D1 — dérivé de `invalidation` : « le prix reprend au-dessus de la ligne de cou et de
    // l’épaule droite ».
    id: 'ex.patterns.reversal.invalidate',
    skillId: 'skill.patterns.reversal',
    target: target(HNS, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui démentirait cette épaule-tête-épaule ?',
    context:
      'Trois sommets se sont formés, celui du milieu plus haut ; deux creux dessinent la ligne de cou et l’épaule droite est en place.',
    options: [
      'Le prix reprend AU-DESSUS de la ligne de cou ET de l’épaule droite : la figure est démentie.',
      'La tête est nettement plus haute que les deux épaules.',
      'Le volume décroît en approchant de la tête.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Une épaule-tête-épaule tombe quand le prix repasse au-dessus de la ligne de cou et de l’épaule droite.',
    whenItFails: 'Une figure « parfaite » à l’œil n’oblige à rien : c’est la reprise au-dessus qui tranche.',
    a11y:
      'Contexte : trois sommets dont celui du milieu est le plus haut, deux creux formant la ligne de cou, épaule droite en place ; il s’agit d’identifier ce qui démentirait la figure. Trois propositions à départager.',
  },
  {
    id: 'ex.patterns.reversal.avoid',
    skillId: 'skill.patterns.reversal',
    target: target(HNS, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur l’épaule-tête-épaule.',
    statements: [
      'La tête est le sommet central, plus haut que les deux épaules.',
      'La figure se joue dès la formation de l’épaule droite, sans attendre la ligne de cou.',
      'Une cassure de la ligne de cou sans participation, aussitôt rendue, est un faux signal.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 5 — La figure miroir (double sommet) — LOT C2 ─────────
// Le double SOMMET est le miroir exact du double creux enseigné en compétence 1 : même géométrie,
// même ligne de cou, direction opposée — et invalidation opposée, AU-DESSUS des sommets là où le
// double creux s'invalide sous ses planchers. La fiche le dit elle-même : « le miroir baissier du
// double creux ». Les cinq objectifs sont ceux de `concept.double-top`, sans exception ni ajout.
const MIRROR_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.patterns.mirror.recognize',
    skillId: 'skill.patterns.mirror',
    target: target(DOUBLE_TOP, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'pattern.double-top.v1',
    variant: 'double-top',
    visualType: 'chart-pattern',
    prompt: 'Quelle figure chartiste reconnais-tu ?',
    options: [
      'Un double sommet (deux plafonds au même niveau, un « M »)',
      'Un double creux (deux planchers au même niveau, un « W »)',
      'Un triangle ascendant (résistance plate, creux montants)',
    ],
    correctIndex: 0,
    a11y: 'Deux sommets à un niveau proche séparés par un creux ; la cassure du creux confirme la figure.',
    difficulty: 'easy',
    rule:
      'Le double sommet se reconnaît à ses deux plafonds au même niveau et à sa ligne de cou (le creux intermédiaire).',
  },
  {
    // Dérivé de `howToRecognize` et `contextRequired` de la fiche.
    id: 'ex.patterns.mirror.interpret',
    skillId: 'skill.patterns.mirror',
    target: target(DOUBLE_TOP, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un double sommet.',
    steps: [
      'Vérifie qu’une hausse précède la figure',
      'Repère deux sommets à un niveau similaire',
      'Trace la ligne de cou (le creux intermédiaire)',
      'Attends la clôture SOUS la ligne de cou',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule:
      'Un double sommet se lit contexte d’abord, puis sommets, puis ligne de cou, puis confirmation — jamais une promesse.',
  },
  {
    // Dérivé de `confirmationZone` : « Sous la ligne de cou (creux intermédiaire) ».
    id: 'ex.patterns.mirror.confirm',
    skillId: 'skill.patterns.mirror',
    target: target(DOUBLE_TOP, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme ce double sommet ?',
    context:
      'Le prix a testé deux fois le même plafond sans le franchir, avec un volume plus faible au second sommet ; le creux intermédiaire est net.',
    options: [
      'Une clôture sous la ligne de cou, c’est-à-dire sous le creux intermédiaire.',
      'Le second échec au plafond suffit : deux refus valent confirmation.',
      'La baisse du volume au second sommet confirme à elle seule la figure.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule:
      'Un double sommet se confirme SOUS la ligne de cou — exactement le miroir du double creux, qui se confirme au-dessus.',
    whenItFails:
      'Tant que la ligne de cou n’est pas cassée, la figure n’est pas confirmée : anticiper est l’erreur la plus courante.',
    a11y:
      'Contexte : deux tests d’un même plafond sans franchissement, volume plus faible au second, creux intermédiaire net. Trois conclusions possibles à départager.',
  },
  {
    // Dérivé de `invalidation` : « Le prix casse nettement au-dessus du second sommet ». C'est là
    // que le miroir compte : le double creux s'invalide vers le BAS, celui-ci vers le HAUT.
    id: 'ex.patterns.mirror.invalidate',
    skillId: 'skill.patterns.mirror',
    target: target(DOUBLE_TOP, 'invalidate'),
    interaction: 'place-extreme',
    chartSeed: 231,
    prompt:
      'Un double sommet s’invalide vers le HAUT. Place la ligne sur le plus haut atteint : au-dessus, la figure tombe.',
    difficulty: 'hard',
    rule:
      'Le double sommet est invalidé par une cassure nette au-dessus des sommets : l’invalidation se place en HAUT, jamais sous la ligne de cou.',
    whenItFails:
      'Placer l’invalidation sous la figure, par réflexe de double creux, revient à surveiller le mauvais côté du graphique.',
  },
  {
    // Dérivé de `falseSignals` (« cassure de la ligne de cou sans participation, suivie d'un retour
    // au-dessus ») et de `commonMistakes` (« anticiper avant la cassure »).
    id: 'ex.patterns.mirror.avoid',
    skillId: 'skill.patterns.mirror',
    target: target(DOUBLE_TOP, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le double sommet.',
    statements: [
      'Une cassure de la ligne de cou sans participation, suivie d’un retour au-dessus, était un faux signal.',
      'Dès que le second sommet échoue, la figure est confirmée : la ligne de cou n’est qu’un détail.',
      'Tant que la ligne de cou tient, la figure n’est qu’une hypothèse.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const PATTERNS_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.patterns.double': DOUBLE_SCENARIOS,
  'skill.patterns.triangle': TRIANGLE_SCENARIOS,
  'skill.patterns.flag': FLAG_SCENARIOS,
  'skill.patterns.reversal': REVERSAL_SCENARIOS,
  'skill.patterns.mirror': MIRROR_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const PATTERNS_MODULE_SCENARIOS: LearningScenario[] = PATTERNS_SKILLS.flatMap(
  (s) => PATTERNS_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const PATTERNS_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(PATTERNS_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
