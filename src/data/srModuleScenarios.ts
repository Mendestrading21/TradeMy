/**
 * LOT 4-O — Module guidé « Lire les niveaux » (monde 5, `world.support-resistance`).
 *
 * Quatrième module guidé réel, dérivé du registre canonique `CONTENT_MODULES`. Même architecture :
 * chaque item est un `LearningScenario` — UNE seule vérité d'où dérivent le visuel, la bonne
 * réponse, le feedback et le résumé accessible. Aucune seconde source.
 *
 * Principe pédagogique central : un niveau est une ZONE de mémoire du marché, jamais une ligne
 * exacte — et jamais une garantie. Trois compétences atomiques ordonnées (le monde 5 compte trois
 * concepts réels ; on n'invente NI compétence NI objectif au-delà du corpus) :
 *   1. Les zones de mémoire  → `concept.support-resistance`
 *   2. La polarité (flip)    → `concept.polarity-flip`
 *   3. Le retest             → `concept.retest-de-niveau`
 *
 * Objectifs ciblés = objectifs RÉELS dérivés des champs du concept (learningTarget). Honnêteté du
 * modèle : `retest-de-niveau` ne documente ni zone de confirmation ni invalidation → 3 exercices
 * seulement (recognize, interpret, avoid-false-signal). Le seul placement de plancher est attaché
 * au support (invalidation documentée = clôture nette SOUS la zone) ; le flip s'invalide par un
 * retour de l'autre côté (pas un plancher) → aucun placement. Statuts éditoriaux inchangés.
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const SR_MODULE_ID = 'module.sr.read-levels';
export const SR_MODULE_TITLE = 'Lire les niveaux';
export const SR_MODULE_WORLD_ID = 'world.support-resistance';
export const SR_CHECKPOINT_ID = 'checkpoint.sr';
export const SR_CHECKPOINT_TITLE = 'Revue — Supports et résistances';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const SR_SKILLS: Skill[] = [
  { id: 'skill.sr.zones', name: 'Les zones de mémoire', description: 'Repérer un plancher (support) et un plafond (résistance) — en zones, jamais en lignes.' },
  { id: 'skill.sr.flip', name: 'La polarité (flip)', description: 'Comprendre qu’un niveau cassé peut changer de rôle au retest.' },
  { id: 'skill.sr.retest', name: 'Le retest', description: 'Lire le retour du prix sur un niveau cassé — qui confirme ou invalide.' },
];

// Concepts réels du monde `world.support-resistance` reliés à chaque compétence.
const SR = 'concept.support-resistance';
const FLIP = 'concept.polarity-flip';
const RETEST = 'concept.retest-de-niveau';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const SR_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.sr.zones': SR,
  'skill.sr.flip': FLIP,
  'skill.sr.retest': RETEST,
};
export const SR_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.sr.zones': 'support-resistance',
  'skill.sr.flip': 'polarite-flip',
  'skill.sr.retest': 'retest-de-niveau',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — Les zones de mémoire (support / résistance) ───────
// recognize (structure) · interpret (lecture ordonnée) · invalidate (plancher) · avoid-false-signal.
const ZONES_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.sr.zones.recognize',
    skillId: 'skill.sr.zones',
    target: target(SR, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.support-resistance.v1',
    variant: 'support-resistance',
    visualType: 'market-structure',
    prompt: 'Que montrent les deux zones horizontales qui encadrent le prix ?',
    options: ['Un support (plancher) et une résistance (plafond)', 'Deux moyennes mobiles', 'Une tendance haussière (HH/HL)'],
    correctIndex: 0,
    a11y: 'Deux zones horizontales encadrant le prix : un plancher où les acheteurs reviennent, un plafond où les vendeurs reprennent la main.',
    difficulty: 'easy',
    rule: 'Support et résistance sont des zones de mémoire du marché : plusieurs touches, des réactions visibles — jamais des lignes exactes.',
  },
  {
    id: 'ex.sr.zones.interpret',
    skillId: 'skill.sr.zones',
    target: target(SR, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’une zone de support ou de résistance.',
    steps: [
      'Repère plusieurs touches au même niveau',
      'Trace une zone (pas une ligne exacte)',
      'Observe la réaction du prix à l’approche',
      'Retiens : un niveau n’est jamais garanti',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un niveau se lit touches d’abord, puis zone, puis réaction — sans jamais le tenir pour acquis.',
  },
  {
    id: 'ex.sr.zones.invalidate',
    skillId: 'skill.sr.zones',
    target: target(SR, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 909,
    prompt: 'Place le niveau d’invalidation : sous quel plancher le support ne tient plus ?',
    difficulty: 'hard',
    rule: 'Un support est invalidé par une clôture nette sous sa zone, sans retour immédiat : l’invalidation se pose sous ce plancher.',
  },
  {
    id: 'ex.sr.zones.avoid',
    skillId: 'skill.sr.zones',
    target: target(SR, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur les supports et résistances.',
    statements: [
      'Un support est une zone où les acheteurs sont revenus plusieurs fois.',
      'Une mèche qui dépasse la zone sans clôture au-delà suffit à invalider le niveau.',
      'Mieux vaut raisonner en zones qu’en lignes exactes.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — La polarité / flip ────────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario du retest) · avoid-false-signal.
// (L'invalidation documentée du flip est un retour de l'AUTRE CÔTÉ du niveau — pas un plancher.)
const FLIP_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.sr.flip.recognize',
    skillId: 'skill.sr.flip',
    target: target(FLIP, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.support-resistance.v1',
    variant: 'polarity-flip',
    visualType: 'market-structure',
    prompt: 'Un support est franchi puis retesté par le dessous : comment s’appelle ce changement de rôle ?',
    options: ['La polarité (flip) : l’ancien support agit en résistance', 'Un range : rien n’a changé', 'Une tendance haussière (HH/HL)'],
    correctIndex: 0,
    a11y: 'Un niveau franchi puis retesté, changeant de rôle : l’ancien plancher agit comme un nouveau plafond.',
    difficulty: 'medium',
    rule: 'La polarité (flip) : un niveau cassé et confirmé change souvent de rôle — support devient résistance, et réciproquement.',
  },
  {
    id: 'ex.sr.flip.interpret',
    skillId: 'skill.sr.flip',
    target: target(FLIP, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un flip de polarité.',
    steps: [
      'Constate un niveau clairement franchi et confirmé',
      'Attends le retour du prix vers ce niveau (retest)',
      'Observe la réaction côté opposé au rôle initial',
      'Retiens : le flip reste une hypothèse, jamais une certitude',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Le flip se lit cassure d’abord, puis retest, puis réaction dans le nouveau rôle — en hypothèse, pas en garantie.',
  },
  {
    id: 'ex.sr.flip.confirm',
    skillId: 'skill.sr.flip',
    target: target(FLIP, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Que peux-tu conclure ?',
    context: 'Un support est cassé et confirmé, puis le prix revient le retester par le dessous et se fait rejeter sur l’ancien niveau.',
    options: [
      'Le flip se confirme : l’ancien support agit en résistance au retest (à surveiller, sans certitude).',
      'Le flip est invalidé.',
      'Le niveau a disparu du marché.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Le flip se confirme par la réaction du prix au retest, dans le nouveau rôle du niveau.',
  },
  {
    id: 'ex.sr.flip.avoid',
    skillId: 'skill.sr.flip',
    target: target(FLIP, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur la polarité (flip).',
    statements: [
      'Un flip se confirme par la réaction du prix au retest, dans le nouveau rôle.',
      'Un flip est acquis dès la cassure, avant même le retest.',
      'Un retest qui traverse le niveau sans réaction est un flip non tenu.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 3 — Le retest ─────────────────────────────────────────
// recognize · interpret · avoid-false-signal UNIQUEMENT : la fiche `retest-de-niveau` ne documente
// ni zone de confirmation ni invalidation → on n'attache aucun exercice inventé (honnêteté).
const RETEST_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.sr.retest.recognize',
    skillId: 'skill.sr.retest',
    target: target(RETEST, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.break-retest.v1',
    variant: 'retest',
    visualType: 'market-structure',
    prompt: 'Après une cassure, le prix revient sur le niveau franchi : comment s’appelle ce mouvement ?',
    options: ['Un retest du niveau cassé', 'Un doji', 'Une cassure de structure (BOS)'],
    correctIndex: 0,
    a11y: 'Un niveau cassé puis retesté par le prix, illustrant la polarité support/résistance.',
    difficulty: 'easy',
    rule: 'Le retest est le retour du prix sur un niveau cassé, pour le tester dans son nouveau rôle.',
  },
  {
    id: 'ex.sr.retest.interpret',
    skillId: 'skill.sr.retest',
    target: target(RETEST, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un retest.',
    steps: [
      'Vérifie que le niveau a RÉELLEMENT cassé (pas juste effleuré)',
      'Attends le retour du prix sur ce niveau',
      'Observe la réaction au contact (tenue ou rejet)',
      'Conclus : le retest confirme OU invalide — les deux issues existent',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un retest se lit cassure vérifiée d’abord, puis retour, puis réaction — il peut confirmer comme invalider.',
  },
  {
    id: 'ex.sr.retest.avoid',
    skillId: 'skill.sr.retest',
    target: target(RETEST, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le retest.',
    statements: [
      'Un retest exige une cassure réelle du niveau, pas un simple contact.',
      'Un retest garantit toujours la continuation du mouvement.',
      'Un retour franc de l’autre côté du niveau invalide le retest.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const SR_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.sr.zones': ZONES_SCENARIOS,
  'skill.sr.flip': FLIP_SCENARIOS,
  'skill.sr.retest': RETEST_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const SR_MODULE_SCENARIOS: LearningScenario[] = SR_SKILLS.flatMap(
  (s) => SR_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const SR_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(SR_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
