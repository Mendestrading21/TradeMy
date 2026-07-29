/**
 * LOT 4-V — Module guidé « Déjouer ses biais » (monde 11, `world.psychology`).
 *
 * Onzième module guidé réel, dérivé du registre canonique `CONTENT_MODULES`. Même architecture :
 * chaque item est un `LearningScenario` — UNE seule vérité par item. Aucune seconde source.
 *
 * Principe pédagogique central : la décision se juge sur le PROCESSUS, pas sur l'issue d'une seule
 * idée. Le FOMO pousse à entrer trop tard, sur l'émotion ; la discipline exécute un plan décidé à
 * froid (contexte, niveau, confirmation, invalidation, taille). Deux compétences, une par concept
 * réel du monde :
 *   1. Le FOMO             → `concept.fomo`
 *   2. Discipline et plan  → `concept.trading-discipline`
 *
 * Objectifs ciblés = objectifs RÉELS (learningTarget). Honnêteté du modèle : AUCUN des deux
 * concepts ne documente d'invalidation top-level (leurs « invalidations » sont des comportements
 * dans `neutralScenario`, pas des planchers de prix) → ni objectif `invalidate`, ni placement.
 * Quatre natures par compétence : recognize, interpret, confirm, avoid-false-signal.
 * Statuts éditoriaux inchangés (`needsReview`). Aucun vocabulaire BUY/SELL — uniquement des
 * scénarios ÉDUCATIFS (entrée théorique, invalidation, objectif pédagogique).
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const PSYCHOLOGY_MODULE_ID = 'module.psychology.master-mindset';
export const PSYCHOLOGY_MODULE_TITLE = 'Déjouer ses biais';
export const PSYCHOLOGY_MODULE_WORLD_ID = 'world.psychology';
export const PSYCHOLOGY_CHECKPOINT_ID = 'checkpoint.psychology';
export const PSYCHOLOGY_CHECKPOINT_TITLE = 'Revue — Psychologie et biais';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const PSYCHOLOGY_SKILLS: Skill[] = [
  { id: 'skill.psychology.fomo', name: 'Le FOMO', description: 'Reconnaître l’envie d’entrer trop tard — et la désamorcer par un plan.' },
  { id: 'skill.psychology.discipline', name: 'Discipline et plan', description: 'Juger la décision sur le processus, jamais sur l’issue d’une seule idée.' },
];

// Concepts réels du monde `world.psychology` reliés à chaque compétence.
const FOMO = 'concept.fomo';
const DISCIPLINE = 'concept.trading-discipline';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const PSYCHOLOGY_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.psychology.fomo': FOMO,
  'skill.psychology.discipline': DISCIPLINE,
};
export const PSYCHOLOGY_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.psychology.fomo': 'fomo',
  'skill.psychology.discipline': 'discipline',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — Le FOMO ───────────────────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
// (Pas d'objectif `invalidate` : le concept ne documente pas d'invalidation top-level.)
const FOMO_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.psychology.fomo.recognize',
    skillId: 'skill.psychology.fomo',
    target: target(FOMO, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.parabolic.v1',
    variant: 'parabolic',
    visualType: 'chart-pattern',
    prompt: 'Cette accélération est déjà bien avancée. Quel biais pousse à entrer ICI ?',
    options: ['Le FOMO : entrer près d’un extrême juste pour ne pas rater, sans plan', 'La patience : c’est le meilleur point d’entrée théorique', 'Aucun : un mouvement fort garantit la suite'],
    correctIndex: 0,
    a11y: 'Un prix qui accélère fortement puis s’essouffle : le type de mouvement où le FOMO pousse à entrer trop tard.',
    difficulty: 'easy',
    rule: 'Le FOMO pousse à entrer après l’accélération, près d’un extrême — sans plan ni invalidation.',
  },
  {
    id: 'ex.psychology.fomo.interpret',
    skillId: 'skill.psychology.fomo',
    target: target(FOMO, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre le film typique du FOMO.',
    steps: [
      'Un mouvement rapide attire l’attention',
      'L’envie monte : « entrer avant que ça parte sans moi »',
      'L’entrée se fait près d’un extrême, sans plan ni invalidation',
      'Le mouvement s’essouffle une fois tout le monde entré',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Le FOMO suit toujours le même film : accélération, envie, entrée tardive sans plan, essoufflement.',
  },
  {
    id: 'ex.psychology.fomo.confirm',
    skillId: 'skill.psychology.fomo',
    target: target(FOMO, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui désamorce le FOMO dans ce scénario ?',
    context: 'Un scénario éducatif montre une forte accélération. Toto veut entrer immédiatement « pour ne pas rater le mouvement ».',
    options: [
      'Un plan défini AVANT le mouvement, avec une invalidation claire.',
      'Entrer encore plus vite, avant que le prix ne monte davantage.',
      'Augmenter la taille pour compenser le retard pris.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La parade au FOMO est un plan préparé avant le mouvement, avec une invalidation claire.',
  },
  {
    id: 'ex.psychology.fomo.avoid',
    skillId: 'skill.psychology.fomo',
    target: target(FOMO, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le FOMO.',
    statements: [
      'Une accélération déjà avancée n’est pas une invitation à entrer sans plan.',
      'Quand « ça s’envole », il faut entrer tout de suite pour ne pas rater le mouvement.',
      'Un plan préparé à l’avance, avec invalidation, désamorce l’entrée impulsive.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — Discipline et plan ────────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
// (Pas d'objectif `invalidate` : le concept ne documente pas d'invalidation top-level.)
const DISCIPLINE_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.psychology.discipline.recognize',
    skillId: 'skill.psychology.discipline',
    target: target(DISCIPLINE, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.break-retest.v1',
    variant: 'break-retest',
    visualType: 'chart-pattern',
    prompt: 'Un niveau cassé puis retesté. Que représente ce contexte pour une décision disciplinée ?',
    options: ['Le contexte ATTENDU par le plan : on agit sur le plan, pas sur l’émotion', 'Une raison d’improviser une entrée immédiate', 'Un détail sans importance pour la décision'],
    correctIndex: 0,
    a11y: 'Un niveau cassé puis retesté : le type de contexte attendu par un plan, avant d’agir avec discipline.',
    difficulty: 'easy',
    rule: 'La discipline attend le contexte prévu par le plan (niveau, confirmation) au lieu d’improviser.',
  },
  {
    id: 'ex.psychology.discipline.interpret',
    skillId: 'skill.psychology.discipline',
    target: target(DISCIPLINE, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre une décision disciplinée, préparée à froid.',
    steps: [
      'Définis le plan à froid : contexte attendu, entrée théorique, invalidation, taille',
      'Attends que le contexte prévu se présente vraiment',
      'Vérifie la confirmation avant d’agir',
      'Exécute le plan tel quel — sans improviser sous l’émotion',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Plan à froid d’abord, contexte ensuite, confirmation, puis exécution — jamais l’inverse.',
  },
  {
    id: 'ex.psychology.discipline.confirm',
    skillId: 'skill.psychology.discipline',
    target: target(DISCIPLINE, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui valide une décision disciplinée ici ?',
    context: 'Un scénario éducatif : le plan prévoit d’agir seulement si le niveau attendu est retesté avec confirmation. Le prix approche du niveau, l’excitation monte.',
    options: [
      'Le respect du plan : contexte, niveau et confirmation réunis avant toute décision.',
      'L’excitation : si l’envie est forte, c’est que c’est le bon moment.',
      'Le résultat de la dernière idée : après une réussite, on peut improviser.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Une décision se valide par le respect du plan (contexte, niveau, confirmation) — pas par l’émotion du moment.',
  },
  {
    id: 'ex.psychology.discipline.avoid',
    skillId: 'skill.psychology.discipline',
    target: target(DISCIPLINE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur la discipline.',
    statements: [
      'Une décision se juge sur la qualité du processus, pas sur l’issue d’une seule idée.',
      'Une réussite chanceuse hors plan prouve que c’était une bonne décision.',
      'La discipline rend le processus répétable — elle ne rend pas chaque idée gagnante.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const PSYCHOLOGY_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.psychology.fomo': FOMO_SCENARIOS,
  'skill.psychology.discipline': DISCIPLINE_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const PSYCHOLOGY_MODULE_SCENARIOS: LearningScenario[] = PSYCHOLOGY_SKILLS.flatMap(
  (s) => PSYCHOLOGY_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const PSYCHOLOGY_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(PSYCHOLOGY_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
