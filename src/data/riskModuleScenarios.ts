/**
 * LOT 4-U — Module guidé « Gérer le risque » (monde 10, `world.risk`).
 *
 * Dixième module guidé réel, dérivé du registre canonique `CONTENT_MODULES`. Même architecture :
 * chaque item est un `LearningScenario` — UNE seule vérité par item. Aucune seconde source.
 *
 * Principe pédagogique central : le risque se décide AVANT l'entrée — le stop borne la perte
 * (l'invalidation), le rapport risque/rendement se compare à l'avance, et la taille découle du
 * risque accepté, jamais de l'envie. Trois compétences, une par concept réel du monde :
 *   1. Risque et rendement   → `concept.risk-reward`
 *   2. Le stop-loss          → `concept.stop-loss`
 *   3. La taille de position → `concept.position-sizing`
 *
 * Objectifs ciblés = objectifs RÉELS (learningTarget). Honnêteté du placement : le STOP est par
 * nature un PLANCHER documenté (« stop placé sous le support : la perte est bornée si le niveau
 * cède ») → le stop-loss porte le seul exercice de placement du module. L'invalidation du
 * risque/rendement (« atteinte du stop ») s'exerce par scénario conditionnel ; la taille de
 * position ne documente pas d'invalidation → aucun objectif inventé.
 * Statuts éditoriaux inchangés (`needsReview`). Aucun vocabulaire BUY/SELL — uniquement des
 * scénarios ÉDUCATIFS (entrée théorique, invalidation, objectif pédagogique).
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const RISK_MODULE_ID = 'module.risk.manage-risk';
export const RISK_MODULE_TITLE = 'Gérer le risque';
export const RISK_MODULE_WORLD_ID = 'world.risk';
export const RISK_CHECKPOINT_ID = 'checkpoint.risk';
export const RISK_CHECKPOINT_TITLE = 'Revue — Risk management';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const RISK_SKILLS: Skill[] = [
  { id: 'skill.risk.reward', name: 'Risque et rendement', description: 'Comparer la distance au stop à la distance à la cible — avant l’entrée.' },
  { id: 'skill.risk.stop', name: 'Le stop-loss', description: 'Placer l’invalidation qui borne la perte, définie AVANT l’entrée.' },
  { id: 'skill.risk.sizing', name: 'La taille de position', description: 'Dimensionner depuis le risque accepté, jamais depuis l’envie.' },
];

// Concepts réels du monde `world.risk` reliés à chaque compétence.
const REWARD = 'concept.risk-reward';
const STOP = 'concept.stop-loss';
const SIZING = 'concept.position-sizing';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const RISK_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.risk.reward': REWARD,
  'skill.risk.stop': STOP,
  'skill.risk.sizing': SIZING,
};
export const RISK_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.risk.reward': 'risque-rendement',
  'skill.risk.stop': 'stop-loss',
  'skill.risk.sizing': 'taille-de-position',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — Risque et rendement ───────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · invalidate (scénario) ·
// avoid-false-signal — les 5 natures sont documentées.
const REWARD_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.risk.reward.recognize',
    skillId: 'skill.risk.reward',
    target: target(REWARD, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'risk.setup.v1',
    variant: 'risk-reward',
    visualType: 'risk-reward',
    prompt: 'Que compare ce schéma entrée / stop / cible ?',
    options: ['Le risque (entrée→stop) au rendement visé (entrée→cible)', 'Le volume échangé à la volatilité', 'Deux moyennes mobiles entre elles'],
    correctIndex: 0,
    a11y: 'Un scénario éducatif : l’entrée théorique, le stop en dessous et la cible au-dessus — deux distances comparées.',
    difficulty: 'easy',
    rule: 'Le rapport risque/rendement compare la distance entrée→stop à la distance entrée→cible — avant l’entrée.',
  },
  {
    id: 'ex.risk.reward.interpret',
    skillId: 'skill.risk.reward',
    target: target(REWARD, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un rapport risque/rendement.',
    steps: [
      'Situe l’entrée théorique du scénario éducatif',
      'Mesure la distance entrée→stop : le risque',
      'Mesure la distance entrée→cible : le rendement visé',
      'Compare les deux AVANT d’envisager quoi que ce soit',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Le rapport se lit risque d’abord, rendement ensuite, comparaison toujours — avant l’entrée.',
  },
  {
    id: 'ex.risk.reward.confirm',
    skillId: 'skill.risk.reward',
    target: target(REWARD, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Quand ce rapport se lit-il ?',
    context: 'Un scénario éducatif propose une entrée théorique, un stop sous le dernier creux et un objectif pédagogique deux fois plus loin que le stop.',
    options: [
      'AVANT l’entrée : le stop borne la perte, la cible situe le rendement — le rapport se lit à l’avance.',
      'Après coup : on ajuste le stop et la cible selon ce que fait le prix.',
      'Jamais : le rapport risque/rendement ne sert à rien.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Le rapport risque/rendement se lit avant l’entrée : le stop borne la perte, la cible situe le rendement.',
  },
  {
    id: 'ex.risk.reward.invalidate',
    skillId: 'skill.risk.reward',
    target: target(REWARD, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Que se passe-t-il quand le stop est atteint ?',
    context: 'Le scénario éducatif prévoyait un stop sous le creux. Le prix descend et touche ce niveau.',
    options: [
      'La perte est bornée et l’hypothèse est abandonnée : c’est exactement le rôle du stop.',
      'On élargit le stop pour laisser une chance au scénario.',
      'On ignore le stop : une bonne idée finit toujours par revenir.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Atteinte du stop = perte bornée, hypothèse abandonnée — jamais un stop élargi après coup.',
  },
  {
    id: 'ex.risk.reward.avoid',
    skillId: 'skill.risk.reward',
    target: target(REWARD, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le rapport risque/rendement.',
    statements: [
      'Le rapport compare la distance au stop et la distance à la cible.',
      'Élargir le stop après coup « laisse une chance » sans changer le risque.',
      'Le rapport se lit avant l’entrée, jamais après.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — Le stop-loss ──────────────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · invalidate (PLACEMENT : le stop
// est un PLANCHER documenté — « sous le support ») · avoid-false-signal.
const STOP_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.risk.stop.recognize',
    skillId: 'skill.risk.stop',
    target: target(STOP, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'risk.setup.v1',
    variant: 'stop-loss',
    visualType: 'risk-reward',
    prompt: 'Quel est le rôle du niveau tracé SOUS l’entrée théorique ?',
    options: ['Le stop : le niveau qui, franchi, annule l’idée et borne la perte', 'La cible du scénario éducatif', 'Une moyenne mobile'],
    correctIndex: 0,
    a11y: 'Un scénario éducatif : le stop est tracé sous l’entrée théorique — le niveau d’invalidation qui borne la perte.',
    difficulty: 'easy',
    rule: 'Le stop est le niveau d’invalidation : franchi, il annule l’idée et borne la perte.',
  },
  {
    id: 'ex.risk.stop.interpret',
    skillId: 'skill.risk.stop',
    target: target(STOP, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la définition d’un stop.',
    steps: [
      'Lis la structure : où l’idée serait-elle invalidée ?',
      'Place le stop À ce niveau, AVANT l’entrée',
      'Déduis le risque : la distance entrée→stop',
      'Ne déplace plus le stop pour « laisser une chance »',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Le stop se définit sur la structure, avant l’entrée — et ne se déplace pas après coup.',
  },
  {
    id: 'ex.risk.stop.confirm',
    skillId: 'skill.risk.stop',
    target: target(STOP, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Quand le stop se définit-il ?',
    context: 'Un scénario éducatif se prépare : l’entrée théorique est identifiée, le dernier creux structurel est repéré juste en dessous.',
    options: [
      'AVANT l’entrée, sur la structure : le creux invalidant donne le niveau du stop.',
      'Après l’entrée, selon l’émotion du moment.',
      'Jamais : un scénario n’a pas besoin d’invalidation.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Le stop se définit AVANT l’entrée, sur la structure — jamais après, jamais à l’émotion.',
  },
  {
    id: 'ex.risk.stop.invalidate',
    skillId: 'skill.risk.stop',
    target: target(STOP, 'invalidate'),
    interaction: 'place-invalidation',
    chartSeed: 411,
    prompt: 'Place le stop : sous quel plancher cette idée éducative ne tient plus ?',
    difficulty: 'hard',
    rule: 'Le stop se place sous le plancher structurel : si le niveau cède, l’idée est invalidée et la perte bornée.',
  },
  {
    id: 'ex.risk.stop.avoid',
    skillId: 'skill.risk.stop',
    target: target(STOP, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le stop.',
    statements: [
      'Le stop se définit avant l’entrée, sur la structure.',
      'Déplacer le stop plus loin évite d’être sorti, sans conséquence sur le risque.',
      'Atteindre le stop signifie : idée abandonnée, perte limitée.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 3 — La taille de position ─────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
// (Pas d'objectif `invalidate` : le concept ne documente pas d'invalidation.)
const SIZING_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.risk.sizing.recognize',
    skillId: 'skill.risk.sizing',
    target: target(SIZING, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'risk.setup.v1',
    variant: 'position-sizing',
    visualType: 'risk-reward',
    prompt: 'Qu’est-ce qui détermine la taille dans ce schéma ?',
    options: ['La distance entrée→stop et le risque accepté (une petite part du capital)', 'L’envie de gagner davantage', 'La couleur de la dernière bougie'],
    correctIndex: 0,
    a11y: 'Un scénario éducatif : la distance entre l’entrée théorique et le stop fixe le risque, donc la taille.',
    difficulty: 'easy',
    rule: 'La taille découle du risque accepté et de la distance au stop — jamais de l’envie.',
  },
  {
    id: 'ex.risk.sizing.interpret',
    skillId: 'skill.risk.sizing',
    target: target(SIZING, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre le dimensionnement d’une position éducative.',
    steps: [
      'Choisis le risque accepté : une petite part du capital',
      'Mesure la distance entrée→stop du scénario',
      'Déduis la taille : risque accepté ÷ distance au stop',
      'Garde la même méthode, gains ou pertes récentes comprises',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Risque accepté d’abord, distance au stop ensuite, taille déduite enfin — la méthode ne change jamais.',
  },
  {
    id: 'ex.risk.sizing.confirm',
    skillId: 'skill.risk.sizing',
    target: target(SIZING, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Comment cette taille se calcule-t-elle ?',
    context: 'Un scénario éducatif fixe un risque accepté de 1 % du capital fictif. Le stop est deux fois plus loin que dans le scénario précédent.',
    options: [
      'À partir du risque accepté et de la distance au stop : stop plus loin → taille plus petite.',
      'À partir de l’envie : plus on veut gagner, plus la taille grossit.',
      'Au hasard : la taille n’a pas d’importance.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La taille se calcule depuis le risque accepté et la distance au stop : plus le stop est loin, plus la taille diminue.',
  },
  {
    id: 'ex.risk.sizing.avoid',
    skillId: 'skill.risk.sizing',
    target: target(SIZING, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur la taille de position.',
    statements: [
      'La taille se calcule depuis le risque accepté et la distance au stop.',
      'Doubler la taille après des pertes permet de « se refaire » plus vite.',
      'Un stop plus éloigné implique une taille plus petite, à risque égal.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const RISK_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.risk.reward': REWARD_SCENARIOS,
  'skill.risk.stop': STOP_SCENARIOS,
  'skill.risk.sizing': SIZING_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const RISK_MODULE_SCENARIOS: LearningScenario[] = RISK_SKILLS.flatMap(
  (s) => RISK_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const RISK_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(RISK_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
