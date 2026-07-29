/**
 * LOT 4-S — Module guidé « Lire le volume » (monde 8, `world.volume`).
 *
 * Huitième module guidé réel, dérivé du registre canonique `CONTENT_MODULES`. Même architecture :
 * chaque item est un `LearningScenario` — UNE seule vérité par item. Aucune seconde source.
 *
 * Principe pédagogique central : le volume mesure la PARTICIPATION, jamais la direction. Un
 * mouvement accompagné se lit autrement qu'un mouvement désert — et un palier très échangé
 * (profil de volume) est une zone de mémoire du marché, pas une promesse. Trois compétences,
 * une par concept réel du monde :
 *   1. Le volume            → `concept.volume`
 *   2. Le VWAP              → `concept.vwap`
 *   3. Le profil de volume  → `concept.volume-profile`
 *
 * Objectifs ciblés = objectifs RÉELS (learningTarget). Honnêteté du modèle : `volume` et `vwap`
 * ne documentent PAS d'invalidation → aucun objectif `invalidate` inventé pour eux ; seul le
 * profil de volume documente une invalidation (« le prix ignore le palier et le traverse
 * franchement ») — contextuelle, PAS un plancher → exercé par scénario conditionnel, AUCUN
 * placement dans ce module. Le profil de volume porte 5 exercices (ses cinq natures sont
 * documentées) — 13 exercices au total. Statuts éditoriaux inchangés (`needsReview`).
 * Aucun vocabulaire BUY/SELL.
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/** Identifiant du module guidé (registre canonique `CONTENT_MODULES`). */
export const VOLUME_MODULE_ID = 'module.volume.read-volume';
export const VOLUME_MODULE_TITLE = 'Lire le volume';
export const VOLUME_MODULE_WORLD_ID = 'world.volume';
export const VOLUME_CHECKPOINT_ID = 'checkpoint.volume';
export const VOLUME_CHECKPOINT_TITLE = 'Revue — Volume et profil';

/** Compétences atomiques du module, dans l'ordre pédagogique. */
export const VOLUME_SKILLS: Skill[] = [
  { id: 'skill.volume.participation', name: 'Le volume', description: 'Lire la participation sous chaque bougie — une mesure, jamais un signal.' },
  { id: 'skill.volume.vwap', name: 'Le VWAP', description: 'Lire le prix moyen pondéré par le volume comme repère intraday.' },
  { id: 'skill.volume.profile', name: 'Le profil de volume', description: 'Repérer les paliers les plus échangés (POC) et leur rôle de mémoire.' },
];

// Concepts réels du monde `world.volume` reliés à chaque compétence.
const VOLUME = 'concept.volume';
const VWAP = 'concept.vwap';
const PROFILE = 'concept.volume-profile';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const VOLUME_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.volume.participation': VOLUME,
  'skill.volume.vwap': VWAP,
  'skill.volume.profile': PROFILE,
};
export const VOLUME_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.volume.participation': 'volume',
  'skill.volume.vwap': 'vwap',
  'skill.volume.profile': 'profil-de-volume',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — Le volume (participation) ─────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
// (Pas d'objectif `invalidate` : le concept ne documente pas d'invalidation.)
const PARTICIPATION_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.volume.participation.recognize',
    skillId: 'skill.volume.participation',
    target: target(VOLUME, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'indicator.volume.v1',
    variant: 'volume',
    visualType: 'indicator',
    prompt: 'Que montrent ces barres sous le prix ?',
    options: ['Le volume : la quantité échangée par période (la participation)', 'Le RSI : un oscillateur borné 0–100', 'Le VWAP : un prix moyen pondéré'],
    correctIndex: 0,
    a11y: 'Des barres de volume sous chaque bougie, avec des pics sur certains mouvements.',
    difficulty: 'easy',
    rule: 'Le volume se reconnaît à ses barres sous le prix : chacune mesure la quantité échangée sur la période.',
  },
  {
    id: 'ex.volume.participation.interpret',
    skillId: 'skill.volume.participation',
    target: target(VOLUME, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture du volume.',
    steps: [
      'Repère les barres de volume sous chaque bougie',
      'Compare la barre du mouvement à celles d’avant',
      'Relie participation et mouvement : accompagné ou désert ?',
      'Rappelle-toi : le volume mesure la participation, jamais la direction',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Le volume se lit en comparant : un mouvement accompagné n’a pas le même poids qu’un mouvement désert.',
  },
  {
    id: 'ex.volume.participation.confirm',
    skillId: 'skill.volume.participation',
    target: target(VOLUME, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui rend cette cassure plus crédible ?',
    context: 'Le prix casse une résistance testée plusieurs fois. La barre de volume de la cassure est nettement plus haute que les précédentes, et la clôture tient au-dessus du niveau.',
    options: [
      'Le volume élevé qui accompagne la cassure la rend plus crédible — lu AVEC la structure, jamais seul.',
      'Le volume élevé garantit que la cassure ne reviendra jamais.',
      'Le volume n’a aucun rapport avec la crédibilité d’une cassure.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Un volume élevé qui accompagne une cassure la rend plus crédible — avec la structure, sans certitude.',
  },
  {
    id: 'ex.volume.participation.avoid',
    skillId: 'skill.volume.participation',
    target: target(VOLUME, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le volume.',
    statements: [
      'Le volume mesure la quantité échangée par période.',
      'Une cassure sur volume faible vaut autant qu’une cassure accompagnée.',
      'Une cassure sur volume faible est souvent suivie d’un retour (faux départ).',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — Le VWAP ───────────────────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · avoid-false-signal.
// (Pas d'objectif `invalidate` : le concept ne documente pas d'invalidation.)
const VWAP_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.volume.vwap.recognize',
    skillId: 'skill.volume.vwap',
    target: target(VWAP, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'indicator.vwap.v1',
    variant: 'vwap',
    visualType: 'indicator',
    prompt: 'Quelle est cette ligne autour de laquelle le prix oscille ?',
    options: ['Le VWAP : le prix moyen de la séance pondéré par le volume', 'Une bande de Bollinger supérieure', 'La ligne de signal du MACD'],
    correctIndex: 0,
    a11y: 'Le prix oscille autour d’une ligne : sa moyenne de séance pondérée par le volume.',
    difficulty: 'easy',
    rule: 'Le VWAP est le prix moyen pondéré par le volume : un repère de référence intraday, pas un signal.',
  },
  {
    id: 'ex.volume.vwap.interpret',
    skillId: 'skill.volume.vwap',
    target: target(VWAP, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture du VWAP.',
    steps: [
      'Repère la ligne du VWAP sous ou sur le prix',
      'Situe le prix : au-dessus, en dessous, ou autour du VWAP',
      'Observe la réaction du prix quand il revient vers la ligne',
      'Rappelle-toi : un repère de séance, jamais un ordre',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Le VWAP se lit position d’abord (dessus/dessous), réaction ensuite — c’est un repère, pas un signal.',
  },
  {
    id: 'ex.volume.vwap.confirm',
    skillId: 'skill.volume.vwap',
    target: target(VWAP, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme cette lecture ?',
    context: 'Le prix revient sur son VWAP après une hausse. Au contact, il forme un creux plus haut et repart, pendant que la structure de la séance reste haussière.',
    options: [
      'La réaction du prix autour du VWAP, lue AVEC la structure : c’est elle qui confirme.',
      'Le simple contact du VWAP : il suffit à valider la reprise.',
      'Rien : le VWAP prédit la direction à lui seul.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'La lecture du VWAP se confirme par la réaction du prix autour de la ligne, lue avec la structure.',
  },
  {
    id: 'ex.volume.vwap.avoid',
    skillId: 'skill.volume.vwap',
    target: target(VWAP, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le VWAP.',
    statements: [
      'Le VWAP est le prix moyen d’une séance pondéré par le volume.',
      'Chaque contact du prix avec le VWAP est un ordre d’entrée.',
      'Le VWAP sert de repère de référence intraday.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 3 — Le profil de volume ───────────────────────────────
// recognize · interpret (lecture ordonnée) · confirm (scénario) · invalidate (scénario) ·
// avoid-false-signal — le SEUL concept du monde qui documente une invalidation → 5 exercices.
const PROFILE_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.volume.profile.recognize',
    skillId: 'skill.volume.profile',
    target: target(PROFILE, 'recognize'),
    interaction: 'identify-candle',
    datasetKey: 'structure.support-resistance.v1',
    variant: 'range',
    visualType: 'volume-profile',
    prompt: 'Que montre cet histogramme horizontal par niveau de prix ?',
    options: ['Un profil de volume : où le marché a le plus échangé (POC au palier dominant)', 'Des barres de volume par période sous le prix', 'Un carnet d’ordres en temps réel'],
    correctIndex: 0,
    a11y: 'Un histogramme horizontal par niveau de prix : les paliers les plus échangés ressortent, avec le POC au palier dominant.',
    difficulty: 'medium',
    rule: 'Le profil de volume répartit les échanges par NIVEAU de prix : le palier le plus échangé est le POC.',
  },
  {
    id: 'ex.volume.profile.interpret',
    skillId: 'skill.volume.profile',
    target: target(PROFILE, 'interpret'),
    interaction: 'read-order',
    prompt: 'Remets dans l’ordre la lecture d’un profil de volume.',
    steps: [
      'Choisis une période de lecture assez longue',
      'Repère le palier le plus échangé (le POC)',
      'Note les zones désertes (peu d’échanges)',
      'Traite ces paliers comme des zones de mémoire, pas des promesses',
    ],
    correctOrder: [0, 1, 2, 3],
    difficulty: 'medium',
    rule: 'Un profil se lit POC d’abord, zones désertes ensuite — des repères de mémoire du marché.',
  },
  {
    id: 'ex.volume.profile.confirm',
    skillId: 'skill.volume.profile',
    target: target(PROFILE, 'confirm'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui confirme l’intérêt de ce palier ?',
    context: 'Le prix revient sur le palier le plus échangé du profil. Au contact, il ralentit, forme des mèches de rejet et repart.',
    options: [
      'La RÉACTION du prix sur le palier très échangé : c’est elle qui confirme son intérêt.',
      'La hauteur de l’histogramme seule : un gros palier garantit un rebond.',
      'Rien : un palier échangé n’a jamais d’effet sur le prix.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Un palier très échangé se confirme à la réaction du prix — jamais par sa seule taille.',
  },
  {
    id: 'ex.volume.profile.invalidate',
    skillId: 'skill.volume.profile',
    target: target(PROFILE, 'invalidate'),
    interaction: 'read-scenario',
    prompt: 'Qu’est-ce qui invalide cette lecture ?',
    context: 'Tu attendais une réaction sur le palier le plus échangé. Le prix arrive dessus et le traverse franchement, sans ralentir ni réagir.',
    options: [
      'Le prix ignore le palier et le traverse franchement : la lecture d’appui est invalidée.',
      'Rien : un palier très échangé finit toujours par faire réagir le prix.',
      'Il faut agrandir l’histogramme jusqu’à ce que la réaction apparaisse.',
    ],
    correctIndex: 0,
    difficulty: 'hard',
    rule: 'Un palier qui ne fait pas réagir le prix — traversé franchement — invalide la lecture d’appui.',
  },
  {
    id: 'ex.volume.profile.avoid',
    skillId: 'skill.volume.profile',
    target: target(PROFILE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le profil de volume.',
    statements: [
      'Le POC est le palier de prix le plus échangé de la période.',
      'Un POC lu sur une période très courte est un repère aussi fiable qu’un POC de longue période.',
      'Les paliers très échangés sont des zones de mémoire du marché, pas des promesses.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const VOLUME_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.volume.participation': PARTICIPATION_SCENARIOS,
  'skill.volume.vwap': VWAP_SCENARIOS,
  'skill.volume.profile': PROFILE_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const VOLUME_MODULE_SCENARIOS: LearningScenario[] = VOLUME_SKILLS.flatMap(
  (s) => VOLUME_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const VOLUME_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(VOLUME_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
