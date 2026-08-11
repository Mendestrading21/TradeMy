/**
 * LOT 4-P — Module guidé « Lire un graphique de près » (monde 2, `world.anatomy`).
 *
 * Cinquième module guidé réel, dérivé du registre canonique `CONTENT_MODULES`. Même architecture :
 * chaque item est un `LearningScenario` — UNE seule vérité par item. Aucune seconde source.
 *
 * Principe pédagogique central : avant de lire des figures, on lit l'OUTIL — ce qu'une bougie
 * contient (corps, mèches), ce qu'elle résume (l'unité de temps) et ce que dit l'axe (l'échelle
 * des prix). Trois compétences (le monde 2 compte trois concepts réels — aucun objectif inventé) :
 *   1. Le corps et les mèches → `concept.candle-anatomy`
 *   2. L'unité de temps       → `concept.unite-de-temps`
 *   3. L'échelle des prix     → `concept.echelle-des-prix`
 *
 * Objectifs ciblés = objectifs RÉELS (learningTarget). Honnêteté du modèle : aucun des trois
 * concepts ne documente d'invalidation-plancher → AUCUN placement d'invalidation dans ce module
 * (4 mécaniques distinctes, pas 5) ; `unite-de-temps` et `echelle-des-prix` ne documentent pas de
 * zone de confirmation → 3 exercices chacun. Statuts éditoriaux inchangés (`needsReview`).
 *
 * NB : le monde 2 devient GUIDÉ — il ne se « termine » plus par la seule lecture des fiches
 * (comportement canonique d'un monde guidé : la preuve par le checkpoint).
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const ANATOMY_MODULE_ID = 'module.anatomy.read-chart-tools';
export const ANATOMY_MODULE_TITLE = 'Lire un graphique de près';
export const ANATOMY_MODULE_WORLD_ID = 'world.anatomy';
export const ANATOMY_CHECKPOINT_ID = 'checkpoint.anatomy';
export const ANATOMY_CHECKPOINT_TITLE = 'Revue — Anatomie d’un graphique';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const ANATOMY_SKILLS: Skill[] = [
  { id: 'skill.anatomy.candle', name: 'Le corps et les mèches', description: 'Décomposer une bougie : corps (sens) et mèches (extrêmes).' },
  { id: 'skill.anatomy.timeframe', name: 'L’unité de temps', description: 'Comprendre qu’une bougie résume une durée choisie.' },
  { id: 'skill.anatomy.scale', name: 'L’échelle des prix', description: 'Lire l’axe vertical et mesurer l’amplitude réelle, pas l’impression.' },
];

// Concepts réels du monde `world.anatomy` reliés à chaque compétence.
const ANATOMY = 'concept.candle-anatomy';
const TIMEFRAME = 'concept.unite-de-temps';
const SCALE = 'concept.echelle-des-prix';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const ANATOMY_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.anatomy.candle': ANATOMY,
  'skill.anatomy.timeframe': TIMEFRAME,
  'skill.anatomy.scale': SCALE,
};
export const ANATOMY_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.anatomy.candle': 'anatomie-bougie',
  'skill.anatomy.timeframe': 'unite-de-temps',
  'skill.anatomy.scale': 'echelle-des-prix',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — Le corps et les mèches (anatomie d'une bougie) ────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
const CANDLE_ANATOMY_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.anatomy.candle.recognize',
    skillId: 'skill.anatomy.candle',
    target: target(ANATOMY, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.anatomy.v1',
    variant: 'bullish',
    visualType: 'candle-anatomy',
    prompt: 'Que montre le rectangle central de cette bougie détaillée ?',
    options: ['Le corps : la distance entre l’ouverture et la clôture', 'La mèche haute : le plus haut atteint', 'Le volume échangé sur la période'],
    correctIndex: 0,
    a11y: 'Une bougie avec un corps rectangulaire entre l’ouverture et la clôture, prolongé d’une mèche haute et d’une mèche basse.',
    difficulty: 'easy',
    rule: 'Le corps relie l’ouverture et la clôture (le sens) ; les mèches marquent les extrêmes de la période.',
  },
  {
    // LOT D2 — VARIANTE de `recognize` : au lieu de choisir dans un catalogue, on identifie
    // l'élément qu'un repère désigne sur un vrai graphique. La bougie marquée est celle qui atteint
    // le plus haut RÉEL de la série rendue (graine 143) → cohérent par construction.
    id: 'ex.anatomy.candle.label-high',
    skillId: 'skill.anatomy.candle',
    target: target(ANATOMY, 'recognize'),
    interaction: 'label-extreme',
    chartSeed: 143,
    prompt: 'Le repère pointe un élément de cette bougie. Que marque-t-il ?',
    options: [
      'Le plus haut atteint sur la période (la mèche haute)',
      'L’ouverture de la bougie',
      'Le plus bas atteint sur la période (la mèche basse)',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La mèche haute marque le plus haut atteint pendant la période ; le corps, lui, donne le sens.',
  },
  {
    id: 'ex.anatomy.candle.interpret',
    skillId: 'skill.anatomy.candle',
    target: target(ANATOMY, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’une bougie.',
    steps: [
      'Repère le corps (ouverture ↔ clôture)',
      'Lis son sens (clôture au-dessus ou en dessous de l’ouverture)',
      'Observe les mèches (les extrêmes atteints)',
      'Rappelle-toi : une bougie décrit le passé, pas l’avenir',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Une bougie se lit corps d’abord (le sens), puis mèches (les extrêmes) — et elle raconte le passé.',
  },
  {
    id: 'ex.anatomy.candle.confirm',
    skillId: 'skill.anatomy.candle',
    target: target(ANATOMY, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Que peux-tu conclure ?',
    context: 'Une bougie au corps long clôture près de son plus haut ; les deux bougies suivantes prolongent le mouvement dans le même sens.',
    options: [
      'La lecture se confirme : les bougies suivantes et le contexte valident ce que racontait le corps (sans certitude).',
      'La première bougie garantissait à elle seule la suite.',
      'La couleur de la bougie prédit toujours la bougie suivante.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La lecture d’une bougie se confirme avec les bougies suivantes et le contexte — jamais seule.',
  },
  {
    id: 'ex.anatomy.candle.avoid',
    skillId: 'skill.anatomy.candle',
    target: target(ANATOMY, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur la lecture d’une bougie.',
    statements: [
      'Le corps montre la distance entre l’ouverture et la clôture.',
      'La couleur d’une bougie suffit : inutile de regarder la taille du corps ou les mèches.',
      'Les mèches marquent les extrêmes atteints pendant la période.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — L'unité de temps ──────────────────────────────────
// recognize · interpret · avoid-false-signal UNIQUEMENT (ni confirmation ni invalidation documentées).
const TIMEFRAME_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.anatomy.timeframe.recognize',
    skillId: 'skill.anatomy.timeframe',
    target: target(TIMEFRAME, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'candle.anatomy.v1',
    variant: 'timeframe',
    visualType: 'candle-anatomy',
    prompt: 'Cette bougie détaillée condense ouverture, plus haut, plus bas et clôture. Sur quelle base ?',
    options: ['Une durée fixe choisie : l’unité de temps (1 min, 1 h, 1 jour…)', 'Le volume total échangé', 'Le nombre d’acheteurs présents'],
    correctIndex: 0,
    a11y: 'Une bougie détaillée (corps + mèches) illustrant ce qu’une unité de temps condense.',
    difficulty: 'easy',
    rule: 'Chaque bougie condense O/H/L/C sur une durée fixe : l’unité de temps.',
  },
  {
    id: 'ex.anatomy.timeframe.interpret',
    skillId: 'skill.anatomy.timeframe',
    target: target(TIMEFRAME, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre une lecture multi-unités de temps.',
    steps: [
      'Choisis l’unité selon ton horizon d’observation',
      'Lis d’abord la structure sur une unité LARGE',
      'Affine ensuite sur une unité plus courte',
      'Vérifie qu’un signal court tient face à la structure large',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'On lit du large vers le court : la tendance de fond d’abord, le détail ensuite.',
  },
  {
    id: 'ex.anatomy.timeframe.avoid',
    skillId: 'skill.anatomy.timeframe',
    target: target(TIMEFRAME, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur l’unité de temps.',
    statements: [
      'Plus l’unité de temps est courte, plus il y a de bruit.',
      'Un signal d’une minute pèse autant que la structure journalière.',
      'Une même série paraît très différente en 5 minutes ou en journalier.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 3 — L'échelle des prix ────────────────────────────────
// recognize · interpret · avoid-false-signal UNIQUEMENT (ni confirmation ni invalidation documentées).
const SCALE_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.anatomy.scale.recognize',
    skillId: 'skill.anatomy.scale',
    target: target(SCALE, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.uptrend.v1',
    variant: 'price-scale',
    visualType: 'candlestick-pattern',
    prompt: 'Cette série se lit sur son axe vertical. Que donne cet axe ?',
    options: ['L’échelle des prix : le niveau de chaque bougie et l’amplitude réelle', 'La durée de chaque bougie', 'Le sentiment des investisseurs'],
    correctIndex: 0,
    a11y: 'Une série haussière lue sur son axe des prix, avec des repères de niveau.',
    difficulty: 'easy',
    rule: 'L’axe des prix situe chaque bougie à son niveau et permet de mesurer l’amplitude réelle entre deux points.',
  },
  {
    // LOT D2 — VARIANTE de `recognize`, au DOIGT : lire l'axe des prix pour situer le plus haut.
    // C'est l'exercice qui fait vraiment travailler l'échelle — un QCM sur « à quoi sert l'axe »
    // n'oblige pas à le lire. La bonne zone est le tiers qui contient le plus haut RÉEL de la série
    // rendue (graine 126 : tiers du MILIEU, donc ni le premier ni le dernier par réflexe).
    id: 'ex.anatomy.scale.touch-high',
    skillId: 'skill.anatomy.scale',
    target: target(SCALE, 'recognize'),
    interaction: 'touch-extreme-zone',
    chartSeed: 126,
    prompt: 'En lisant l’axe des prix, touche le tiers où le prix a atteint son plus haut.',
    difficulty: 'medium',
    rule: 'On situe un extrême en comparant les niveaux sur l’axe, pas en se fiant à l’impression visuelle.',
    whenItFails: 'Un axe étiré fait paraître un mouvement spectaculaire : seuls les niveaux lus comptent.',
  },
  {
    id: 'ex.anatomy.scale.interpret',
    skillId: 'skill.anatomy.scale',
    target: target(SCALE, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un mouvement sur l’échelle des prix.',
    steps: [
      'Repère les niveaux de prix au bord du graphique',
      'Mesure l’amplitude réelle entre les deux points',
      'Rapporte cette amplitude au contexte (structure, niveaux)',
      'Méfie-toi de l’étirement de l’axe : il change l’impression, pas les prix',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'On mesure l’amplitude sur l’axe, on la rapporte au contexte — jamais à l’impression visuelle.',
  },
  {
    id: 'ex.anatomy.scale.avoid',
    skillId: 'skill.anatomy.scale',
    target: target(SCALE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur l’échelle des prix.',
    statements: [
      'Une échelle très étirée exagère l’ampleur perçue d’un mouvement.',
      'Si une hausse paraît spectaculaire à l’œil, c’est qu’elle l’est réellement.',
      'L’étirement de l’axe change l’impression, pas les prix réels.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const ANATOMY_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.anatomy.candle': CANDLE_ANATOMY_SCENARIOS,
  'skill.anatomy.timeframe': TIMEFRAME_SCENARIOS,
  'skill.anatomy.scale': SCALE_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const ANATOMY_MODULE_SCENARIOS: LearningScenario[] = ANATOMY_SKILLS.flatMap(
  (s) => ANATOMY_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const ANATOMY_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(ANATOMY_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
