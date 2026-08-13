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
 *   6. Le triangle, retourné   → `concept.descending-triangle` (LOT C3)
 *   7. Le drapeau, retourné    → `concept.bear-flag` (LOT C3)
 *   8. Le retournement, retourné → `concept.inverse-head-shoulders` (LOT C3, HAUSSIER)
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
  // LOT C3 — les trois miroirs restants, DANS LES DEUX SENS : deux baissiers (invalidation en haut)
  // et un haussier (invalidation en bas). La règle n'est pas « baissier = en haut » : l'invalidation
  // suit la DIRECTION du setup, quelle qu'elle soit.
  { id: 'skill.patterns.triangle-mirror', name: 'Le triangle, retourné', description: 'Lire un triangle descendant : support plat, sommets qui descendent — et invalidation en haut.' },
  { id: 'skill.patterns.flag-mirror', name: 'Le drapeau, retourné', description: 'Lire une pause de continuation baissière : mât, canal, reprise — et invalidation en haut.' },
  { id: 'skill.patterns.reversal-mirror', name: 'Le retournement, retourné', description: 'Lire une épaule-tête-épaule inversée : figure HAUSSIÈRE, donc invalidation en bas.' },
  // LOT C7 — la PENTE MENT. Les huit compétences ci-dessus suivent toutes leur dessin : ce qui monte
  // se lit haussier, ce qui descend se lit baissier. Les biseaux sont l'exception, et le corpus le
  // dit lui-même dans `visualSpec.direction`.
  { id: 'skill.patterns.wedge', name: 'Quand la pente ment', description: 'Un biseau ascendant monte — et se lit BAISSIER : c’est la convergence qui parle, pas la pente.' },
  { id: 'skill.patterns.wedge-mirror', name: 'La pente ment dans les deux sens', description: 'Un biseau descendant descend — et se lit haussier. La règle vaut aussi à l’envers.' },
  // LOT C7 — la figure qui n'annonce RIEN. Seule figure `neutral` du monde : reconnaître ne suffit
  // plus, il faut attendre la sortie.
  { id: 'skill.patterns.no-direction', name: 'La figure sans direction', description: 'Le triangle symétrique ne dit pas où ça va : c’est la sortie confirmée qui décide.' },
];

// Concepts réels du monde `world.patterns` reliés à chaque compétence.
const DOUBLE = 'concept.double-bottom';
const TRIANGLE = 'concept.ascending-triangle';
const FLAG = 'concept.bull-flag';
const HNS = 'concept.head-shoulders';
const DOUBLE_TOP = 'concept.double-top';
const DESC_TRIANGLE = 'concept.descending-triangle';
const BEAR_FLAG = 'concept.bear-flag';
const INVERSE_HNS = 'concept.inverse-head-shoulders';
const RISING_WEDGE = 'concept.rising-wedge';
const FALLING_WEDGE = 'concept.falling-wedge';
const SYM_TRIANGLE = 'concept.symmetrical-triangle';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const PATTERNS_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.patterns.double': DOUBLE,
  'skill.patterns.triangle': TRIANGLE,
  'skill.patterns.flag': FLAG,
  'skill.patterns.reversal': HNS,
  'skill.patterns.mirror': DOUBLE_TOP,
  'skill.patterns.triangle-mirror': DESC_TRIANGLE,
  'skill.patterns.flag-mirror': BEAR_FLAG,
  'skill.patterns.reversal-mirror': INVERSE_HNS,
  'skill.patterns.wedge': RISING_WEDGE,
  'skill.patterns.wedge-mirror': FALLING_WEDGE,
  'skill.patterns.no-direction': SYM_TRIANGLE,
};
export const PATTERNS_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.patterns.double': 'double-creux',
  'skill.patterns.triangle': 'triangle-ascendant',
  'skill.patterns.flag': 'drapeau-haussier',
  'skill.patterns.reversal': 'epaule-tete-epaule',
  'skill.patterns.mirror': 'double-sommet',
  'skill.patterns.triangle-mirror': 'triangle-descendant',
  'skill.patterns.flag-mirror': 'drapeau-baissier',
  'skill.patterns.reversal-mirror': 'etei-inversee',
  'skill.patterns.wedge': 'biseau-ascendant',
  'skill.patterns.wedge-mirror': 'biseau-descendant',
  'skill.patterns.no-direction': 'triangle-symetrique',
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

// ── Compétences 6 à 8 — Les miroirs restants — LOT C3 ────────────────
// Deux figures BAISSIÈRES (triangle descendant, drapeau baissier) : invalidation EN HAUT.
// Une figure HAUSSIÈRE (ÉTÉ inversée) : invalidation EN BAS. La règle enseignée n'est donc pas
// « baissier = en haut », mais : l'invalidation se place du côté OPPOSÉ au sens du setup.
const TRIANGLE_MIRROR_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.patterns.triangle-mirror.recognize',
    skillId: 'skill.patterns.triangle-mirror',
    target: target(DESC_TRIANGLE, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'pattern.descending-triangle.v1',
    variant: 'descending-triangle',
    visualType: 'chart-pattern',
    prompt: 'Quelle figure chartiste reconnais-tu ?',
    options: [
      'Un triangle descendant (support plat, sommets qui descendent)',
      'Un triangle ascendant (résistance plate, creux qui montent)',
      'Un drapeau haussier (canal après un mât)',
    ],
    correctIndex: 0,
    a11y: 'Un support horizontal testé plusieurs fois, surmonté de sommets de plus en plus bas : la compression pousse vers le bas.',
    difficulty: 'easy',
    rule: 'Le triangle descendant se reconnaît à son support PLAT et à ses sommets descendants — l’exact opposé de l’ascendant.',
  },
  {
    id: 'ex.patterns.triangle-mirror.interpret',
    skillId: 'skill.patterns.triangle-mirror',
    target: target(DESC_TRIANGLE, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un triangle descendant.',
    steps: [
      'Repère le support horizontal testé plusieurs fois',
      'Trace la ligne des sommets, de plus en plus bas',
      'Constate la compression entre les deux',
      'Attends la résolution : une clôture sous le support',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un triangle se lit support d’abord, puis ligne des sommets, puis compression — la résolution vient après, jamais avant.',
  },
  {
    id: 'ex.patterns.triangle-mirror.confirm',
    skillId: 'skill.patterns.triangle-mirror',
    target: target(DESC_TRIANGLE, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme ce triangle descendant ?',
    context:
      'Le prix a testé quatre fois le même support, tandis que chaque rebond s’arrête plus bas que le précédent. La compression est nette.',
    options: [
      'Une clôture sous le support horizontal, idéalement suivie d’un retest par le dessous.',
      'Le quatrième test du support suffit : à force, il finit toujours par céder.',
      'La compression seule confirme la figure, sans attendre de cassure.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La zone de confirmation d’un triangle descendant est SOUS le support horizontal, sur clôture — et le retest la renforce.',
    whenItFails: 'Un support testé souvent n’est pas un support condamné : sans clôture dessous, rien n’est confirmé.',
    a11y:
      'Contexte : quatre tests du même support, avec des rebonds de plus en plus bas. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.patterns.triangle-mirror.invalidate',
    skillId: 'skill.patterns.triangle-mirror',
    target: target(DESC_TRIANGLE, 'invalidate'),
    interaction: 'place-extreme',
    chartSeed: 248,
    prompt:
      'Ce setup est baissier : il s’invalide vers le HAUT. Place la ligne sur le plus haut atteint.',
    difficulty: 'hard',
    rule:
      'Le triangle descendant est invalidé par une clôture nette au-dessus de la ligne des sommets descendants : l’invalidation se place en HAUT.',
    whenItFails: 'Placer l’invalidation sous le support revient à confondre la zone de confirmation avec la zone d’invalidation.',
  },
  {
    id: 'ex.patterns.triangle-mirror.avoid',
    skillId: 'skill.patterns.triangle-mirror',
    target: target(DESC_TRIANGLE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le triangle descendant.',
    statements: [
      'Une fausse cassure sous le support, sans participation et aussitôt annulée, n’était pas une résolution.',
      'Plus le support est testé, plus la cassure vers le bas est certaine.',
      'La figure n’est résolue qu’à la clôture, pas pendant la séance.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

const FLAG_MIRROR_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.patterns.flag-mirror.recognize',
    skillId: 'skill.patterns.flag-mirror',
    target: target(BEAR_FLAG, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'pattern.bear-flag.v1',
    variant: 'bear-flag',
    visualType: 'chart-pattern',
    prompt: 'Quelle figure chartiste reconnais-tu ?',
    options: [
      'Un drapeau baissier (un mât vers le bas, puis un canal qui remonte doucement)',
      'Un drapeau haussier (un mât vers le haut, puis un canal qui redescend doucement)',
      'Un double sommet (deux plafonds au même niveau)',
    ],
    correctIndex: 0,
    difficulty: 'easy',
    a11y: 'Une chute rapide, puis une remontée lente et étroite en canal : une pause avant reprise possible.',
    rule: 'Le drapeau baissier se reconnaît à son mât VERS LE BAS suivi d’un canal qui remonte doucement à contre-sens.',
  },
  {
    id: 'ex.patterns.flag-mirror.interpret',
    skillId: 'skill.patterns.flag-mirror',
    target: target(BEAR_FLAG, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un drapeau baissier.',
    steps: [
      'Repère le mât : une chute rapide et nette',
      'Identifie le canal : une remontée lente et étroite',
      'Vérifie que le canal ne rend pas tout le mât',
      'Attends la reprise sous le bas du drapeau',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un drapeau se lit mât d’abord, puis canal — sans mât net, il n’y a pas de drapeau.',
  },
  {
    id: 'ex.patterns.flag-mirror.confirm',
    skillId: 'skill.patterns.flag-mirror',
    target: target(BEAR_FLAG, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme ce drapeau baissier ?',
    context:
      'Après une chute rapide, le prix remonte lentement dans un canal étroit, sans effacer la baisse initiale.',
    options: [
      'Le prix repasse sous le bas du drapeau et y reste.',
      'La lenteur de la remontée suffit : un rebond mou annonce toujours la suite.',
      'La hauteur du mât garantit à elle seule la reprise de la baisse.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Un drapeau baissier se confirme SOUS le bas du drapeau — la pause se termine par une reprise, pas par une promesse.',
    whenItFails: 'Une cassure sans suivi laisse la figure en suspens : la pause peut aussi se retourner.',
    a11y: 'Contexte : une chute rapide suivie d’une remontée lente en canal étroit. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.patterns.flag-mirror.invalidate',
    skillId: 'skill.patterns.flag-mirror',
    target: target(BEAR_FLAG, 'invalidate'),
    interaction: 'place-extreme',
    chartSeed: 262,
    prompt: 'Ce setup est baissier : il s’invalide vers le HAUT. Place la ligne sur le plus haut atteint.',
    difficulty: 'hard',
    rule: 'Le drapeau baissier est invalidé par un retour au-dessus du haut du drapeau : l’invalidation se place en HAUT.',
    whenItFails: 'Un canal qui rend tout le mât n’est plus une pause : c’est un retournement.',
  },
  {
    id: 'ex.patterns.flag-mirror.avoid',
    skillId: 'skill.patterns.flag-mirror',
    target: target(BEAR_FLAG, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le drapeau baissier.',
    statements: [
      'Sans mât net, il n’y a pas de drapeau : la figure suppose un mouvement initial franc.',
      'Toute remontée lente après une baisse est un drapeau baissier.',
      'Une cassure sans suivi laisse la figure en suspens.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

const REVERSAL_MIRROR_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.patterns.reversal-mirror.recognize',
    skillId: 'skill.patterns.reversal-mirror',
    target: target(INVERSE_HNS, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'pattern.inverse-head-shoulders.v1',
    variant: 'inverse-head-shoulders',
    visualType: 'chart-pattern',
    prompt: 'Quelle figure chartiste reconnais-tu ?',
    options: [
      'Une épaule-tête-épaule inversée (trois creux, celui du milieu plus bas)',
      'Une épaule-tête-épaule classique (trois sommets, celui du milieu plus haut)',
      'Un triangle symétrique (sommets qui descendent, creux qui montent)',
    ],
    correctIndex: 0,
    difficulty: 'easy',
    a11y: 'Trois creux successifs, celui du milieu nettement plus bas, reliés par une ligne de cou au-dessus.',
    rule: 'L’ÉTÉ inversée se reconnaît à ses trois creux dont le central est le plus bas — le retournement d’une baisse.',
  },
  {
    id: 'ex.patterns.reversal-mirror.interpret',
    skillId: 'skill.patterns.reversal-mirror',
    target: target(INVERSE_HNS, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’une ÉTÉ inversée.',
    steps: [
      'Repère les trois creux successifs',
      'Vérifie que celui du milieu (la tête) est le plus bas',
      'Trace la ligne de cou qui relie les sommets intermédiaires',
      'Attends la clôture AU-DESSUS de la ligne de cou',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'L’ÉTÉ inversée se lit creux d’abord, puis tête, puis ligne de cou — la confirmation vient en dernier.',
  },
  {
    id: 'ex.patterns.reversal-mirror.confirm',
    skillId: 'skill.patterns.reversal-mirror',
    target: target(INVERSE_HNS, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette ÉTÉ inversée ?',
    context:
      'Après une baisse, trois creux se sont formés : le central est nettement plus bas, et les deux sommets intermédiaires dessinent une ligne de cou.',
    options: [
      'Une clôture au-dessus de la ligne de cou.',
      'La symétrie des deux épaules suffit à valider la figure.',
      'La profondeur de la tête garantit à elle seule le retournement.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Cette figure est HAUSSIÈRE : elle se confirme AU-DESSUS de la ligne de cou — l’inverse exact de l’ÉTÉ classique.',
    whenItFails: 'Une cassure sans suivi laisse la figure en suspens ; trois creux ne suffisent pas.',
    a11y: 'Contexte : trois creux après une baisse, le central plus bas, ligne de cou tracée. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.patterns.reversal-mirror.invalidate',
    skillId: 'skill.patterns.reversal-mirror',
    target: target(INVERSE_HNS, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 277,
    prompt:
      'Attention : ce setup est HAUSSIER. Il s’invalide donc vers le BAS. Place la ligne sur le plus bas atteint.',
    difficulty: 'hard',
    rule:
      'L’ÉTÉ inversée est invalidée par un nouveau plus bas sous la tête : parce que le setup est haussier, l’invalidation se place en BAS.',
    whenItFails:
      'La règle n’est pas « une figure de retournement s’invalide en haut » : l’invalidation se place TOUJOURS du côté opposé au sens du setup.',
  },
  {
    id: 'ex.patterns.reversal-mirror.avoid',
    skillId: 'skill.patterns.reversal-mirror',
    target: target(INVERSE_HNS, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur l’ÉTÉ inversée.',
    statements: [
      'Des épaules très asymétriques rendent la figure moins lisible.',
      'Comme toute figure de retournement, elle s’invalide au-dessus de sa tête.',
      'Une cassure de la ligne de cou sans suivi laisse la figure en suspens.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 9 — Quand la pente ment (biseau ascendant) ────────────────────────────────
// LOT C7. Les huit compétences précédentes suivent toutes leur dessin. Ici le corpus dit
// l'inverse : `visualSpec.direction = 'bearish'` pour une figure dont les DEUX droites MONTENT.
// Sa `definitionShort` l'explique — « Deux droites montantes qui convergent : une hausse qui
// s'essouffle » : ce n'est pas la pente qui parle, c'est la CONVERGENCE.
//   `confirmationZone` : « Sous la droite basse cassée. »
//   `invalidation`     : « Sortie par le haut du biseau. »  → setup baissier ⇒ invalidation en HAUT
//   `falseSignals`     : « Fausse cassure suivie d'un retour dans le biseau. »
const WEDGE_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.patterns.wedge.recognize',
    skillId: 'skill.patterns.wedge',
    target: target(RISING_WEDGE, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'pattern.rising-wedge.v1',
    variant: 'rising-wedge',
    visualType: 'chart-pattern',
    prompt: 'Quelle figure chartiste reconnais-tu ?',
    options: [
      'Un biseau ascendant (deux droites montantes qui CONVERGENT)',
      'Un canal ascendant (deux droites montantes PARALLÈLES)',
      'Un triangle ascendant (une résistance plate, des creux qui montent)',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    a11y: 'Deux droites qui montent toutes les deux et se resserrent l’une vers l’autre, le mouvement gagnant de moins en moins à chaque poussée.',
    rule: 'Ce qui distingue un biseau d’un canal n’est pas la pente — les deux montent — mais le fait que les droites SE RESSERRENT.',
  },
  {
    id: 'ex.patterns.wedge.interpret',
    skillId: 'skill.patterns.wedge',
    target: target(RISING_WEDGE, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un biseau ascendant.',
    steps: [
      'Constate que les deux droites montent',
      'Vérifie qu’elles CONVERGENT au lieu de rester parallèles',
      'Lis ce que dit la convergence : chaque poussée gagne moins que la précédente',
      'Conclus au sens BAISSIER, malgré la pente qui monte',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'hard',
    rule: 'La pente se lit en premier, mais elle ne décide pas : c’est la convergence, lue ensuite, qui donne le sens.',
  },
  {
    id: 'ex.patterns.wedge.confirm',
    skillId: 'skill.patterns.wedge',
    target: target(RISING_WEDGE, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme ce biseau ascendant ?',
    context:
      'Le prix monte encore, mais les deux droites du biseau se resserrent : chaque nouvelle poussée gagne moins de terrain que la précédente.',
    options: [
      'Le prix casse la droite BASSE du biseau et clôture dessous.',
      'La droite haute est franchie : la hausse reprend son cours.',
      'La figure monte, donc la sortie attendue est par le haut.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'La confirmation se prend SOUS la droite basse cassée — à l’opposé de la pente, ce qui est exactement le piège de cette figure.',
    whenItFails: 'Une fausse cassure suivie d’un retour dans le biseau annule la lecture.',
    a11y:
      'Contexte : le prix monte encore mais les deux droites du biseau se resserrent, chaque poussée gagnant moins. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.patterns.wedge.invalidate',
    skillId: 'skill.patterns.wedge',
    target: target(RISING_WEDGE, 'invalidate'),
    // Setup BAISSIER ⇒ l'invalidation est un PLAFOND : mécanique `place-extreme` (plus haut réel),
    // comme le double sommet et le triangle descendant. `place-invalidation` vise le plancher.
    interaction: 'place-extreme',
    chartSeed: 631,
    prompt:
      'Attention : malgré sa pente qui MONTE, ce setup est BAISSIER. Il s’invalide donc vers le HAUT. Place la ligne sur le plus haut atteint.',
    difficulty: 'hard',
    rule: 'Le biseau ascendant est invalidé par une sortie PAR LE HAUT : le setup étant baissier, l’invalidation se place en haut — dans le sens de la pente, justement.',
    whenItFails:
      'Se fier à la pente pour placer l’invalidation la met du mauvais côté : c’est le SENS du setup qui décide, jamais l’inclinaison du dessin.',
  },
  {
    id: 'ex.patterns.wedge.avoid',
    skillId: 'skill.patterns.wedge',
    target: target(RISING_WEDGE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le biseau ascendant.',
    statements: [
      'Une fausse cassure suivie d’un retour dans le biseau annule la lecture.',
      'Puisque les deux droites montent, la figure est haussière.',
      'C’est le resserrement des droites, et non leur pente, qui porte le sens.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 10 — La pente ment dans les deux sens (biseau descendant) ──────────────────
// LOT C7. Le miroir n'est pas mécanique ici : il vérifie que l'apprenant a retenu la RÈGLE
// (« la convergence prime la pente ») et non un cas particulier (« un biseau est baissier »).
//   `confirmationZone` : « Au-dessus de la trendline supérieure du biseau (clôture, retest). »
//   `invalidation`     : « Poursuite franche de la baisse sous le biseau. » → setup haussier ⇒ en BAS
//   `falseSignals`     : « Sortie haute sans participation, aussitôt annulée. »
const WEDGE_MIRROR_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.patterns.wedge-mirror.recognize',
    skillId: 'skill.patterns.wedge-mirror',
    target: target(FALLING_WEDGE, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'pattern.falling-wedge.v1',
    variant: 'falling-wedge',
    visualType: 'chart-pattern',
    prompt: 'Cette figure DESCEND. Laquelle est-ce ?',
    options: [
      'Un biseau descendant (deux droites descendantes qui CONVERGENT)',
      'Un canal descendant (deux droites descendantes PARALLÈLES)',
      'Un drapeau baissier (un mât, puis un canal court à contre-sens)',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    a11y: 'Deux droites qui descendent toutes les deux en se resserrant, la baisse perdant de la force à chaque vague.',
    rule: 'Même critère que pour le biseau ascendant : ce sont les droites qui SE RESSERRENT qui font le biseau, pas leur inclinaison.',
  },
  {
    id: 'ex.patterns.wedge-mirror.interpret',
    skillId: 'skill.patterns.wedge-mirror',
    target: target(FALLING_WEDGE, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un biseau descendant.',
    steps: [
      'Constate que les deux droites descendent',
      'Vérifie qu’elles CONVERGENT au lieu de rester parallèles',
      'Lis ce que dit la convergence : chaque vague de baisse perd de la force',
      'Conclus au sens HAUSSIER, malgré la pente qui descend',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'hard',
    rule: 'La règle est la même dans les deux sens : la convergence prime la pente. Un biseau n’est pas « une figure baissière » — c’est une figure qui se lit à l’envers de sa pente.',
  },
  {
    id: 'ex.patterns.wedge-mirror.confirm',
    skillId: 'skill.patterns.wedge-mirror',
    target: target(FALLING_WEDGE, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme ce biseau descendant ?',
    context:
      'Le prix baisse encore, mais les deux droites se resserrent : chaque vague de baisse perd de l’ampleur.',
    options: [
      'Une clôture au-dessus de la droite haute du biseau, puis un retest tenu.',
      'La cassure de la droite basse : la baisse se poursuit dans le sens de la pente.',
      'Le simple resserrement des droites suffit à valider le retournement.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Le biseau descendant se confirme AU-DESSUS de sa droite haute, avec retest — exactement l’inverse du biseau ascendant.',
    whenItFails: 'Une sortie haute sans participation, aussitôt annulée, ne confirme rien.',
    a11y:
      'Contexte : le prix baisse encore mais les deux droites se resserrent, chaque vague perdant de l’ampleur. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.patterns.wedge-mirror.invalidate',
    skillId: 'skill.patterns.wedge-mirror',
    target: target(FALLING_WEDGE, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 733,
    prompt:
      'Attention : malgré sa pente qui DESCEND, ce setup est HAUSSIER. Il s’invalide donc vers le BAS. Place la ligne sur le plus bas atteint.',
    difficulty: 'hard',
    rule: 'Le biseau descendant est invalidé par une poursuite franche de la baisse sous le biseau : le setup étant haussier, l’invalidation se place en bas.',
    whenItFails:
      'Deux biseaux de pentes opposées n’ont pas la même invalidation, et aucune des deux ne se déduit de la pente.',
  },
  {
    id: 'ex.patterns.wedge-mirror.avoid',
    skillId: 'skill.patterns.wedge-mirror',
    target: target(FALLING_WEDGE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les biseaux.',
    statements: [
      'Une sortie haute sans participation, aussitôt annulée, ne confirme rien.',
      'Un biseau est une figure baissière : c’est ce qui le distingue du canal.',
      'Les deux biseaux se lisent à l’inverse de leur pente, chacun dans son sens.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 11 — La figure sans direction (triangle symétrique) ────────────────────────
// LOT C7. Les dix compétences précédentes annoncent toutes un sens. Celle-ci est la SEULE figure
// `direction: 'neutral'` du monde (mesuré : 20 figures chart-pattern, 2 neutres, dont une seule
// dans `world.patterns`). Sa `confirmationZone` le dit : « La sortie confirmée d'une des DEUX
// trendlines ». Reconnaître ne suffit plus.
//
// Conséquence assumée sur la MÉCANIQUE : aucun `place-invalidation` ici. Son `invalidation` est
// « Retour immédiat dans la figure après une sortie non tenue » — ce n'est ni un plancher ni un
// plafond, c'est un RETOUR DEDANS. Il n'y a pas de côté à placer. Poser une ligne serait enseigner
// une direction que la figure n'a pas ; l'objectif est donc couvert par un scénario conditionnel,
// et c'est le choix de mécanique lui-même qui porte la leçon.
const NO_DIRECTION_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.patterns.no-direction.recognize',
    skillId: 'skill.patterns.no-direction',
    target: target(SYM_TRIANGLE, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'pattern.symmetrical-triangle.v1',
    variant: 'symmetrical-triangle',
    visualType: 'chart-pattern',
    prompt: 'Quelle figure chartiste reconnais-tu ?',
    options: [
      'Un triangle symétrique (sommets descendants ET creux montants)',
      'Un triangle ascendant (résistance PLATE, creux montants)',
      'Un triangle descendant (support PLAT, sommets descendants)',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    a11y: 'Des sommets de plus en plus bas et des creux de plus en plus hauts qui convergent vers une pointe, sans qu’aucune des deux bornes ne soit horizontale.',
    rule: 'Les triangles ascendant et descendant ont une borne PLATE — et cette borne donne le sens. Le symétrique n’en a aucune : ni l’un ni l’autre camp ne domine.',
  },
  {
    id: 'ex.patterns.no-direction.interpret',
    skillId: 'skill.patterns.no-direction',
    target: target(SYM_TRIANGLE, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un triangle symétrique.',
    steps: [
      'Repère les sommets qui descendent',
      'Repère les creux qui montent',
      'Constate qu’AUCUNE des deux bornes n’est plate : la figure ne penche d’aucun côté',
      'Attends la sortie confirmée d’une des deux droites — c’est elle qui donnera le sens',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'hard',
    rule: 'Ici, reconnaître la figure ne suffit plus à savoir où ça va. C’est la seule figure du monde dont le sens n’est pas dans le dessin.',
  },
  {
    id: 'ex.patterns.no-direction.confirm',
    skillId: 'skill.patterns.no-direction',
    target: target(SYM_TRIANGLE, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme un triangle symétrique ?',
    context:
      'Les sommets descendent, les creux montent, et l’amplitude se réduit à mesure que la figure approche de sa pointe.',
    options: [
      'La sortie confirmée d’une des DEUX trendlines, clôture puis retest.',
      'La compression suffit : à la pointe, la sortie se fait forcément vers le haut.',
      'Le nombre de touches sur chaque droite indique le camp qui l’emportera.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La figure ne donne pas le sens ; elle donne un NIVEAU de décision. La sortie confirmée le donne, dans un sens ou dans l’autre.',
    whenItFails: 'Une sortie sans participation, suivie d’un retour dans le triangle, ne décide rien.',
    a11y:
      'Contexte : sommets descendants, creux montants, amplitude qui se réduit vers la pointe. Trois conclusions possibles à départager.',
  },
  {
    // Pas de `place-invalidation` : voir le commentaire du bloc. L'invalidation de cette figure est
    // un RETOUR DEDANS, pas un extrême — il n'y a aucun côté à placer.
    id: 'ex.patterns.no-direction.invalidate',
    skillId: 'skill.patterns.no-direction',
    target: target(SYM_TRIANGLE, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Le prix vient de sortir par le haut du triangle. Puis il revient dedans. Qu’est-ce que cela dit ?',
    context:
      'Sortie par le haut d’un triangle symétrique, sans participation notable. Deux séances plus tard, le prix a refermé la cassure et se retrouve à l’intérieur de la figure.',
    options: [
      'La sortie est invalidée : le retour dans la figure annule le sens qu’elle venait de donner.',
      'La sortie reste valable : elle a bien eu lieu, un retour temporaire n’y change rien.',
      'Le retour dedans confirme le sens inverse : la sortie sera donc par le bas.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Cette figure ne s’invalide ni en haut ni en bas — elle s’invalide par un RETOUR DEDANS. N’ayant pas de direction propre, elle n’a pas de côté d’invalidation.',
    whenItFails:
      'Le retour dedans n’annonce pas non plus la sortie opposée : la figure redevient simplement indécise, et il faut réattendre.',
    a11y:
      'Contexte : sortie par le haut sans participation, puis retour à l’intérieur du triangle deux séances plus tard. Trois conclusions possibles à départager.',
  },
  {
    id: 'ex.patterns.no-direction.avoid',
    skillId: 'skill.patterns.no-direction',
    target: target(SYM_TRIANGLE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le triangle symétrique.',
    statements: [
      'Une sortie sans participation, suivie d’un retour dans le triangle, ne décide rien.',
      'Comme les autres triangles, il annonce un sens ; il faut simplement attendre plus longtemps.',
      'C’est l’absence de borne plate qui le prive de direction propre.',
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
  'skill.patterns.triangle-mirror': TRIANGLE_MIRROR_SCENARIOS,
  'skill.patterns.flag-mirror': FLAG_MIRROR_SCENARIOS,
  'skill.patterns.reversal-mirror': REVERSAL_MIRROR_SCENARIOS,
  'skill.patterns.wedge': WEDGE_SCENARIOS,
  'skill.patterns.wedge-mirror': WEDGE_MIRROR_SCENARIOS,
  'skill.patterns.no-direction': NO_DIRECTION_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const PATTERNS_MODULE_SCENARIOS: LearningScenario[] = PATTERNS_SKILLS.flatMap(
  (s) => PATTERNS_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const PATTERNS_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(PATTERNS_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
