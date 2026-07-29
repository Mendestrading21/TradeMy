/**
 * LOT 4-N — Module guidé « Lire la structure » (monde 4, `world.structure`).
 *
 * Troisième module guidé réel, après Fondations et Chandeliers. Même architecture que
 * `candleModuleScenarios.ts` : chaque item est un `LearningScenario` — UNE seule vérité d'où
 * dérivent le visuel, la bonne réponse, le feedback et le résumé accessible. Aucune seconde source.
 *
 * Principe pédagogique central : la tendance se lit dans la STRUCTURE (suite de sommets et de
 * creux), jamais dans une bougie ni une opinion. Quatre compétences atomiques ordonnées :
 *   1. La tendance haussière   → `concept.uptrend` (HH/HL)
 *   2. La tendance baissière   → `concept.downtrend` (LH/LL)
 *   3. Le range                → `concept.range` (zone d'équilibre)
 *   4. La cassure de structure → `concept.break-of-structure` (BOS)
 *
 * Objectifs ciblés = objectifs RÉELS dérivés des champs du concept (learningTarget) — jamais
 * inventés. Le placement d'invalidation (plancher) n'est attaché qu'à la tendance haussière, seul
 * concept du module dont l'invalidation documentée est un PLANCHER (un creux sous le creux
 * précédent) ; le BOS baissier s'invalide au-dessus du niveau cassé → pas de placement de plancher
 * (honnêteté du modèle). Statuts éditoriaux inchangés (`needsReview`). Aucun vocabulaire BUY/SELL.
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const STRUCTURE_MODULE_ID = 'module.structure.read-structure';
export const STRUCTURE_MODULE_TITLE = 'Lire la structure';
export const STRUCTURE_MODULE_WORLD_ID = 'world.structure';
export const STRUCTURE_CHECKPOINT_ID = 'checkpoint.structure';
export const STRUCTURE_CHECKPOINT_TITLE = 'Revue — Tendances et structure';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const STRUCTURE_SKILLS: Skill[] = [
  { id: 'skill.structure.uptrend', name: 'La tendance haussière', description: 'Lire la séquence HH/HL : sommets et creux de plus en plus hauts.' },
  { id: 'skill.structure.downtrend', name: 'La tendance baissière', description: 'Lire le symétrique baissier : sommets et creux décroissants (LH/LL).' },
  { id: 'skill.structure.range', name: 'Le range', description: 'Reconnaître la zone d’équilibre entre support et résistance.' },
  { id: 'skill.structure.break', name: 'La cassure de structure', description: 'Repérer la rupture de séquence qui remet la tendance en cause.' },
];

// Concepts réels du monde `world.structure` reliés à chaque compétence (source : learningContent V5).
const UPTREND = 'concept.uptrend';
const DOWNTREND = 'concept.downtrend';
const RANGE = 'concept.range';
const BOS = 'concept.break-of-structure';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const STRUCTURE_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.structure.uptrend': UPTREND,
  'skill.structure.downtrend': DOWNTREND,
  'skill.structure.range': RANGE,
  'skill.structure.break': BOS,
};
export const STRUCTURE_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.structure.uptrend': 'tendance-haussiere',
  'skill.structure.downtrend': 'tendance-baissiere',
  'skill.structure.range': 'range',
  'skill.structure.break': 'cassure-de-structure',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — La tendance haussière (HH/HL) ─────────────────────
// recognize (structure) · interpret (lecture ordonnée) · invalidate (plancher) · avoid-false-signal.
const UPTREND_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.structure.uptrend.recognize',
    skillId: 'skill.structure.uptrend',
    target: target(UPTREND, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.uptrend.v1',
    variant: 'uptrend',
    visualType: 'market-structure',
    prompt: 'Quelle structure de prix reconnais-tu ?',
    options: ['Une tendance haussière (sommets et creux de plus en plus hauts)', 'Un range (oscillation sans direction)', 'Une tendance baissière (sommets et creux décroissants)'],
    correctIndex: 0,
    a11y: 'Une série de prix qui progresse : chaque sommet dépasse le précédent et chaque creux reste au-dessus du précédent.',
    difficulty: 'easy',
    rule: 'La tendance haussière se lit dans la structure : des sommets (HH) et des creux (HL) de plus en plus hauts.',
  },
  {
    id: 'ex.structure.uptrend.interpret',
    skillId: 'skill.structure.uptrend',
    target: target(UPTREND, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’une tendance haussière.',
    steps: [
      'Repère les sommets successifs (chacun plus haut)',
      'Repère les creux successifs (chacun plus haut)',
      'Vérifie que les retracements tiennent au-dessus du creux précédent',
      'Conclus : la structure HH/HL est intacte, la tendance est valable',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'La tendance se lit sommets d’abord, puis creux, puis tenue des retracements — jamais sur une seule bougie.',
  },
  {
    id: 'ex.structure.uptrend.invalidate',
    skillId: 'skill.structure.uptrend',
    target: target(UPTREND, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 314,
    prompt: 'Place le niveau d’invalidation : sous quel plancher la structure haussière ne tient plus ?',
    difficulty: 'hard',
    rule: 'La tendance haussière est invalidée quand un creux passe sous le creux précédent : l’invalidation se pose sous ce plancher protégé.',
  },
  {
    id: 'ex.structure.uptrend.avoid',
    skillId: 'skill.structure.uptrend',
    target: target(UPTREND, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur la tendance haussière.',
    statements: [
      'Une tendance haussière se définit par des sommets et des creux de plus en plus hauts.',
      'Un simple rebond dans une baisse suffit à parler de tendance haussière.',
      'Une seule grande bougie ne fait pas une tendance : c’est la structure qui compte.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — La tendance baissière (LH/LL) ─────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
const DOWNTREND_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.structure.downtrend.recognize',
    skillId: 'skill.structure.downtrend',
    target: target(DOWNTREND, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.downtrend.v1',
    variant: 'downtrend',
    visualType: 'market-structure',
    prompt: 'Quelle structure de prix reconnais-tu ?',
    options: ['Une tendance baissière (sommets et creux décroissants)', 'Une tendance haussière (HH/HL)', 'Un range (zone d’équilibre)'],
    correctIndex: 0,
    a11y: 'Une structure de prix descendante : les sommets et les creux s’enchaînent de plus en plus bas.',
    difficulty: 'easy',
    rule: 'La tendance baissière se lit dans la structure : des sommets (LH) et des creux (LL) décroissants.',
  },
  {
    id: 'ex.structure.downtrend.interpret',
    skillId: 'skill.structure.downtrend',
    target: target(DOWNTREND, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’une tendance baissière.',
    steps: [
      'Repère les sommets décroissants (LH)',
      'Repère les creux décroissants (LL)',
      'Observe les rebonds qui échouent chacun plus bas',
      'Conclus : la pression vendeuse domine tant que la suite tient',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Le symétrique de la hausse : sommets puis creux décroissants, avec des rebonds qui échouent plus bas.',
  },
  {
    id: 'ex.structure.downtrend.confirm',
    skillId: 'skill.structure.downtrend',
    target: target(DOWNTREND, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Que peux-tu conclure ?',
    context: 'Après un rebond qui échoue sous le sommet précédent (LH), le prix reprend et clôture sous le dernier creux.',
    options: [
      'La structure baissière se confirme : un nouveau plus bas prolonge la séquence (sans certitude).',
      'La tendance baissière est invalidée.',
      'Le rebond annonçait un retournement garanti.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La poursuite baissière se confirme à la reprise sous le dernier creux, après un rebond en sommet plus bas.',
  },
  {
    id: 'ex.structure.downtrend.avoid',
    skillId: 'skill.structure.downtrend',
    target: target(DOWNTREND, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur la tendance baissière.',
    statements: [
      'La tendance baissière se lit sur plusieurs bougies, jamais sur une seule.',
      'Un seul rebond suffit à annoncer le retournement d’une tendance baissière.',
      'C’est un plus haut plus haut qui remet la structure baissière en question.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 3 — Le range (zone d'équilibre) ───────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
const RANGE_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.structure.range.recognize',
    skillId: 'skill.structure.range',
    target: target(RANGE, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.support-resistance.v1',
    variant: 'range',
    visualType: 'market-structure',
    prompt: 'Quelle structure de prix reconnais-tu ?',
    options: ['Un range (le prix oscille entre support et résistance)', 'Une tendance haussière (HH/HL)', 'Une cassure de structure (rupture de séquence)'],
    correctIndex: 0,
    a11y: 'Un prix qui oscille entre une zone basse (support) et une zone haute (résistance), sans direction nette.',
    difficulty: 'easy',
    rule: 'Le range se reconnaît à ses rebonds répétés sur un support et ses rejets répétés sous une résistance.',
  },
  {
    id: 'ex.structure.range.interpret',
    skillId: 'skill.structure.range',
    target: target(RANGE, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un range.',
    steps: [
      'Délimite le plancher : des rebonds répétés sur le support',
      'Délimite le plafond : des rejets répétés sous la résistance',
      'Vérifie l’absence de sommets/creux progressifs',
      'Attends une sortie franche et confirmée d’une borne',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un range se lit bornes d’abord (zones, pas lignes exactes), puis on attend la sortie confirmée.',
  },
  {
    id: 'ex.structure.range.confirm',
    skillId: 'skill.structure.range',
    target: target(RANGE, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Que peux-tu conclure ?',
    context: 'Le prix clôture nettement au-dessus de la résistance du range, puis revient la retester sans repasser dedans.',
    options: [
      'La sortie du range se confirme : clôture au-delà de la borne, puis retest tenu (à surveiller, sans certitude).',
      'Le range continue comme si de rien n’était.',
      'La sortie est forcément un faux départ.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Une sortie de range se confirme par une clôture au-delà de la borne, idéalement retestée.',
  },
  {
    id: 'ex.structure.range.avoid',
    skillId: 'skill.structure.range',
    target: target(RANGE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le range.',
    statements: [
      'Les bornes d’un range sont des zones, pas des lignes exactes.',
      'Une mèche au-delà d’une borne, sans clôture confirmée, valide la sortie du range.',
      'Tant qu’aucune sortie n’est confirmée, le prix reste en zone d’équilibre.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 4 — La cassure de structure (BOS) ─────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
// (L'invalidation documentée du BOS baissier est une reprise AU-DESSUS du niveau cassé — pas un
//  plancher : aucun placement de plancher n'est donc attaché, par honnêteté du modèle.)
const BREAK_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.structure.break.recognize',
    skillId: 'skill.structure.break',
    target: target(BOS, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.bos.v1',
    variant: 'break-of-structure',
    visualType: 'market-structure',
    prompt: 'Quelle structure de prix reconnais-tu ?',
    options: ['Une cassure de structure (le dernier creux protégé cède)', 'Un range (zone d’équilibre)', 'Une tendance haussière intacte (HH/HL)'],
    correctIndex: 0,
    a11y: 'Une progression haussière qui se rompt : le prix casse sous le dernier creux protégé de la séquence.',
    difficulty: 'medium',
    rule: 'La cassure de structure se reconnaît à la rupture de la séquence : le dernier creux protégé cède.',
  },
  {
    id: 'ex.structure.break.interpret',
    skillId: 'skill.structure.break',
    target: target(BOS, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’une cassure de structure.',
    steps: [
      'Identifie la tendance et sa séquence de creux/sommets',
      'Repère le dernier creux protégé (higher low)',
      'Constate la clôture qui casse ce niveau',
      'Reste prudent : une cassure n’est pas un retournement garanti',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Une cassure se lit dans l’ordre : structure identifiée, creux protégé repéré, clôture au-delà constatée — puis prudence.',
  },
  {
    id: 'ex.structure.break.confirm',
    skillId: 'skill.structure.break',
    target: target(BOS, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Que peux-tu conclure ?',
    context: 'En tendance haussière, une bougie clôture nettement sous le dernier creux protégé, avec de la participation, sans reprise immédiate au-dessus.',
    options: [
      'La cassure de structure est constatée : la séquence HH/HL est rompue, le rapport de force change (sans garantir un retournement).',
      'La tendance haussière reste intacte.',
      'Un retournement baissier est garanti.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La cassure se confirme sous le dernier creux protégé, idéalement avec de la participation — sans jamais garantir la suite.',
  },
  {
    id: 'ex.structure.break.avoid',
    skillId: 'skill.structure.break',
    target: target(BOS, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur la cassure de structure.',
    statements: [
      'Une mèche qui perce le creux sans clôture au-delà peut n’être qu’une chasse aux stops.',
      'Toute cassure de structure garantit un retournement immédiat.',
      'Un simple retracement n’est pas une cassure de structure.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const STRUCTURE_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.structure.uptrend': UPTREND_SCENARIOS,
  'skill.structure.downtrend': DOWNTREND_SCENARIOS,
  'skill.structure.range': RANGE_SCENARIOS,
  'skill.structure.break': BREAK_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const STRUCTURE_MODULE_SCENARIOS: LearningScenario[] = STRUCTURE_SKILLS.flatMap(
  (s) => STRUCTURE_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const STRUCTURE_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(STRUCTURE_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
