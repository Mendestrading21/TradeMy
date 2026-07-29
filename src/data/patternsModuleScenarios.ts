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
];

// Concepts réels du monde `world.patterns` reliés à chaque compétence.
const DOUBLE = 'concept.double-bottom';
const TRIANGLE = 'concept.ascending-triangle';
const FLAG = 'concept.bull-flag';
const HNS = 'concept.head-shoulders';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const PATTERNS_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.patterns.double': DOUBLE,
  'skill.patterns.triangle': TRIANGLE,
  'skill.patterns.flag': FLAG,
  'skill.patterns.reversal': HNS,
};
export const PATTERNS_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.patterns.double': 'double-creux',
  'skill.patterns.triangle': 'triangle-ascendant',
  'skill.patterns.flag': 'drapeau-haussier',
  'skill.patterns.reversal': 'epaule-tete-epaule',
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

/** Scénarios par compétence (source unique du module). */
export const PATTERNS_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.patterns.double': DOUBLE_SCENARIOS,
  'skill.patterns.triangle': TRIANGLE_SCENARIOS,
  'skill.patterns.flag': FLAG_SCENARIOS,
  'skill.patterns.reversal': REVERSAL_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const PATTERNS_MODULE_SCENARIOS: LearningScenario[] = PATTERNS_SKILLS.flatMap(
  (s) => PATTERNS_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const PATTERNS_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(PATTERNS_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
