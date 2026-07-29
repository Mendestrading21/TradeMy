/**
 * Contenu du module pilote « Lire un graphique » (voix pédagogique, aucune donnée personnelle WMB).
 * Structure : Module → Compétences ordonnées → Leçons + Exercices. Extensible vers 30-40 leçons.
 */
import type { Lesson, Skill } from '../engines/learning';
import { initialProgress } from '../engines/learning';
import type { Exercise } from '../engines/exercise';
import { buildDirectionExercise } from '../engines/exercise';
import type { Pattern } from '../engines/pattern';
import { generateCandles, supportLevel, resistanceLevel } from '../engines/pattern';
import { PROGRESS_SCHEMA_VERSION, emptyLearning, type ProgressState } from './repositories';
import { rotateExercises, buildCheckpoint } from './exerciseRotation';
import { objectiveId, type ObjectiveKind } from './learningTarget';
import { CANDLE_PILOT_EXERCISES } from './pilotScenarios';
import {
  CANDLE_SKILLS,
  CANDLE_MODULE_ID,
  CANDLE_MODULE_TITLE,
  CANDLE_MODULE_WORLD_ID,
  CANDLE_CHECKPOINT_ID,
  CANDLE_CHECKPOINT_TITLE,
  CANDLE_MODULE_EXERCISES_BY_SKILL,
  CANDLE_SKILL_CONCEPT_ID,
  CANDLE_SKILL_CONCEPT_SLUG,
} from './candleModuleScenarios';
import {
  STRUCTURE_SKILLS,
  STRUCTURE_MODULE_ID,
  STRUCTURE_MODULE_TITLE,
  STRUCTURE_MODULE_WORLD_ID,
  STRUCTURE_CHECKPOINT_ID,
  STRUCTURE_CHECKPOINT_TITLE,
  STRUCTURE_MODULE_EXERCISES_BY_SKILL,
  STRUCTURE_SKILL_CONCEPT_ID,
  STRUCTURE_SKILL_CONCEPT_SLUG,
} from './structureModuleScenarios';
import {
  SR_SKILLS,
  SR_MODULE_ID,
  SR_MODULE_TITLE,
  SR_MODULE_WORLD_ID,
  SR_CHECKPOINT_ID,
  SR_CHECKPOINT_TITLE,
  SR_MODULE_EXERCISES_BY_SKILL,
  SR_SKILL_CONCEPT_ID,
  SR_SKILL_CONCEPT_SLUG,
} from './srModuleScenarios';
import {
  ANATOMY_SKILLS,
  ANATOMY_MODULE_ID,
  ANATOMY_MODULE_TITLE,
  ANATOMY_MODULE_WORLD_ID,
  ANATOMY_CHECKPOINT_ID,
  ANATOMY_CHECKPOINT_TITLE,
  ANATOMY_MODULE_EXERCISES_BY_SKILL,
  ANATOMY_SKILL_CONCEPT_ID,
  ANATOMY_SKILL_CONCEPT_SLUG,
} from './anatomyModuleScenarios';
import {
  PATTERNS_SKILLS,
  PATTERNS_MODULE_ID,
  PATTERNS_MODULE_TITLE,
  PATTERNS_MODULE_WORLD_ID,
  PATTERNS_CHECKPOINT_ID,
  PATTERNS_CHECKPOINT_TITLE,
  PATTERNS_MODULE_EXERCISES_BY_SKILL,
  PATTERNS_SKILL_CONCEPT_ID,
  PATTERNS_SKILL_CONCEPT_SLUG,
} from './patternsModuleScenarios';

export interface ContentModule {
  id: string;
  title: string;
  description: string;
  skills: Skill[];
}

// ─── Compétences (ordre = progression du parcours) ───────────────────
export const SKILLS: Skill[] = [
  { id: 'skill.actions', name: 'Comprendre une action', description: 'Ce qu’est une action et ce qu’implique d’en détenir.' },
  { id: 'skill.trend', name: 'Tendance, support & résistance', description: 'Lire la direction du prix et ses niveaux clés.' },
  { id: 'skill.candles', name: 'Chandeliers japonais', description: 'Décoder une bougie : corps, mèches, couleur.' },
  { id: 'skill.patterns', name: 'Premières figures', description: 'Repérer une figure de retournement simple.' },
];

export const PILOT_MODULE: ContentModule = {
  id: 'module.read-chart',
  title: 'Lire un graphique',
  description: 'Le parcours fondateur : de l’action au premier pattern.',
  skills: SKILLS,
};

// ─── Leçons par compétence ───────────────────────────────────────────
const LESSONS: Record<string, Lesson[]> = {
  'skill.actions': [
    {
      id: 'lesson.action-definition',
      slug: 'quest-ce-quune-action',
      title: 'Qu’est-ce qu’une action ?',
      skillId: 'skill.actions',
      objective: 'Comprendre ce que représente une action.',
      difficulty: 'beginner',
      estimatedMinutes: 4,
      steps: [
        { id: 's0', kind: 'intro', body: 'Derrière chaque action se cache une vraie entreprise. En détenir une, c’est en posséder un petit morceau.' },
        { id: 's1', kind: 'explain', body: 'Une action représente une petite part d’une entreprise. En détenir une fait de toi un actionnaire.' },
        { id: 's2', kind: 'example', body: 'Si une entreprise est découpée en 1 000 actions et que tu en as 10, tu possèdes 1 % de l’entreprise.' },
        { id: 's2div', kind: 'visual', conceptRef: 'dividende' },
        { id: 's2b', kind: 'observe', body: 'Le prix d’une action se lit sur un graphique. Chaque « bougie » résume une période : ouverture, clôture, plus haut et plus bas.' },
        { id: 's2c', kind: 'visual', conceptRef: 'anatomie-bougie' },
        { id: 's2d', kind: 'chart', chartSeed: 2024, body: 'Le prix affiché en bougies : verte quand la clôture dépasse l’ouverture, rouge sinon. La structure d’ensemble raconte la tendance.' },
        { id: 's2e', kind: 'interaction', chartSeed: 2024, body: 'À toi : révèle les bougies une à une et observe la tendance se dessiner.' },
        { id: 's3', kind: 'summary', body: 'Une action = une part d’entreprise. Son prix se lit en bougies sur un graphique et varie selon l’offre et la demande.' },
        { id: 's4', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qu’une action ?', back: 'Une part de propriété d’une entreprise : la détenir fait de toi un actionnaire.' } },
      ],
      commonMistake: 'Confondre le prix d’une action avec la « valeur » de l’entreprise.',
      sources: ['WMB — Glossaire : Action'],
      status: 'approved',
    },
    {
      id: 'lesson.action-vs-bond',
      slug: 'action-ou-obligation',
      title: 'Action ou obligation ?',
      skillId: 'skill.actions',
      objective: 'Distinguer être propriétaire (action) et être créancier (obligation).',
      difficulty: 'beginner',
      estimatedMinutes: 4,
      steps: [
        { id: 's1', kind: 'explain', body: 'Une action te rend copropriétaire. Une obligation est une dette : l’entreprise te doit de l’argent, tu n’en es pas propriétaire.' },
        { id: 's2', kind: 'summary', body: 'Action = part (risque + potentiel). Obligation = prêt (plus prévisible, remboursé).' },
      ],
      commonMistake: 'Croire qu’une obligation donne un droit de vote comme une action.',
      sources: ['WMB — Glossaire : Obligation'],
      status: 'approved',
    },
  ],
  'skill.trend': [
    {
      id: 'lesson.read-trend',
      slug: 'lire-une-tendance',
      title: 'Lire une tendance',
      skillId: 'skill.trend',
      objective: 'Identifier une tendance haussière, baissière ou latérale.',
      difficulty: 'beginner',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une tendance n’est pas une opinion : c’est une suite de sommets et de creux qui monte ou qui descend.' },
        { id: 's1', kind: 'observe', body: 'Regarde la suite des sommets et des creux : montent-ils ensemble, ou descendent-ils ?' },
        { id: 's2', kind: 'visual', conceptRef: 'tendance-haussiere' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'tendance-haussiere', body: 'Tant que les sommets et les creux montent, l’hypothèse haussière tient — jusqu’à ce qu’un plus bas casse la structure.' },
        { id: 's4', kind: 'interaction', chartSeed: 2024, body: 'Révèle le graphique bougie par bougie : vois-tu la structure monter ?' },
        { id: 's5', kind: 'explain', body: 'Des sommets et des creux de plus en plus hauts = tendance haussière. De plus en plus bas = baissière.' },
        { id: 's6', kind: 'summary', body: 'C’est la structure du prix qui définit la tendance, pas une opinion. En range, le prix oscille sans direction.' },
      ],
      commonMistake: 'Croire qu’une seule grosse bougie verte définit une tendance haussière.',
      sources: ['WMB — Glossaire : Tendance'],
      status: 'approved',
    },
    {
      id: 'lesson.support-resistance',
      slug: 'support-resistance',
      title: 'Support & résistance',
      skillId: 'skill.trend',
      objective: 'Repérer les niveaux où le prix a tendance à buter.',
      difficulty: 'beginner',
      estimatedMinutes: 5,
      steps: [
        { id: 's1', kind: 'explain', body: 'Le support est un plancher où les acheteurs reviennent. La résistance est un plafond où les vendeurs reprennent la main.' },
        { id: 's2', kind: 'summary', body: 'Ce sont des zones de mémoire du marché : des repères, pas des garanties.' },
      ],
      sources: ['WMB — Glossaire : Support & Résistance'],
      status: 'approved',
    },
    {
      id: 'lesson.support-resistance-v5',
      slug: 'support-resistance-visuel',
      title: 'Support & résistance (visuel)',
      skillId: 'skill.trend',
      objective: 'Voir les zones de support/résistance et raisonner en scénarios.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le prix bute souvent aux mêmes niveaux : ce sont les zones où l’offre et la demande se disputent.' },
        { id: 's1', kind: 'observe', body: 'Repère une zone basse où le prix rebondit (support) et une zone haute où il plafonne (résistance).' },
        { id: 's2', kind: 'visual', conceptRef: 'support-resistance' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'support-resistance', body: 'Une zone tient… jusqu’à ce qu’elle cède. On raisonne en scénarios, pas en certitudes.' },
        { id: 's4', kind: 'explain', body: 'Ce sont des zones de mémoire : plus un niveau a été testé, plus il compte — sans jamais garantir un rebond.' },
        { id: 's5', kind: 'falseSignal', body: 'Une cassure nette d’un support peut le transformer en résistance (flip) : le plancher devient plafond.' },
        { id: 's6', kind: 'summary', body: 'Support = plancher, résistance = plafond ; des repères de zone, jamais des garanties.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Que devient un support cassé nettement ?', back: 'Souvent une résistance (flip) : l’ancien plancher agit comme un nouveau plafond.' } },
      ],
      commonMistake: 'Tracer un trait unique au lieu d’une zone, et l’attendre comme une garantie.',
      sources: ['WMB — Support & Résistance'],
      status: 'draft',
    },
    {
      id: 'lesson.rsi-divergence-v5',
      slug: 'rsi-et-divergence-visuel',
      title: 'RSI & divergence (visuel)',
      skillId: 'skill.trend',
      objective: 'Lire le RSI sans en faire un signal, et repérer une divergence prix/oscillateur.',
      difficulty: 'advanced',
      estimatedMinutes: 7,
      steps: [
        { id: 's0', kind: 'intro', body: 'Un oscillateur sous le prix, borné 0–100 : le RSI. Utile comme repère de contexte, jamais comme ordre.' },
        { id: 's1', kind: 'visual', conceptRef: 'rsi' },
        { id: 's2', kind: 'explain', body: 'Au-dessus de 70, on parle de surachat ; sous 30, de survente. En tendance forte, l’extrême peut durer : ce n’est pas un signal en soi.' },
        { id: 's3', kind: 'visual', conceptRef: 'divergence' },
        { id: 's4', kind: 'hypothesis', conceptRef: 'divergence', body: 'Prix en plus-hauts croissants, oscillateur en plus-hauts décroissants : l’élan faiblit sous la surface. Une hypothèse d’essoufflement, à confirmer.' },
        { id: 's5', kind: 'falseSignal', body: 'Une divergence peut persister longtemps sans retournement : ce n’est pas un minuteur. La structure confirme, pas l’oscillateur seul.' },
        { id: 's6', kind: 'summary', body: 'RSI = repère de contexte ; divergence = désaccord prix/oscillateur, signe d’essoufflement à confirmer par la structure.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Une divergence est-elle un signal isolé fiable ?', back: 'Non : elle signale un essoufflement possible ; la confirmation vient de la structure de prix.' } },
      ],
      commonMistake: 'Vendre un simple « surachat » ou une divergence sans confirmation de structure.',
      sources: ['WMB — Indicateurs : RSI & divergences'],
      status: 'draft',
    },
    {
      id: 'lesson.choch-orderblock-v5',
      slug: 'choch-et-order-block-visuel',
      title: 'Structure : CHoCH & order block (visuel)',
      skillId: 'skill.trend',
      objective: 'Enchaîner changement de caractère et zone d’intérêt (éducatif, jamais prescriptif).',
      difficulty: 'advanced',
      estimatedMinutes: 7,
      steps: [
        { id: 's0', kind: 'intro', body: 'La structure raconte le rapport de force : des creux et sommets qui se suivent, jusqu’à ce que le rythme change.' },
        { id: 's1', kind: 'visual', conceptRef: 'changement-de-caractere' },
        { id: 's2', kind: 'explain', body: 'Le changement de caractère (CHoCH) est la première cassure à contre-tendance : un premier signe de bascule, pas une certitude.' },
        { id: 's3', kind: 'visual', conceptRef: 'order-block' },
        { id: 's4', kind: 'hypothesis', conceptRef: 'order-block', body: 'La dernière bougie avant l’impulsion devient une zone d’intérêt souvent retestée — un repère d’observation, jamais une garantie.' },
        { id: 's5', kind: 'falseSignal', body: 'Le prix ne réagit pas toujours : une zone peut être traversée sans réaction. On confronte toujours à la structure.' },
        { id: 's6', kind: 'summary', body: 'CHoCH = premier signe de bascule ; order block = zone d’intérêt à confirmer. Éducatif, jamais prescriptif.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Un CHoCH garantit-il un retournement ?', back: 'Non : c’est un premier signe de bascule, à confirmer par la suite de la structure.' } },
      ],
      commonMistake: 'Voir des order blocks partout et oublier le contexte de structure.',
      sources: ['WMB — Structure : CHoCH & zones'],
      status: 'draft',
    },
  ],
  'skill.candles': [
    {
      id: 'lesson.candle-basics',
      slug: 'la-bougie-japonaise',
      title: 'La bougie japonaise',
      skillId: 'skill.candles',
      objective: 'Lire ce qu’une bougie raconte sur une période.',
      difficulty: 'beginner',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une seule bougie raconte déjà une histoire : qui, des acheteurs ou des vendeurs, a eu le dernier mot sur la période.' },
        { id: 's1', kind: 'explain', body: 'Une bougie résume une période : ouverture, clôture, plus haut et plus bas. Le corps relie ouverture et clôture.' },
        { id: 's2', kind: 'observe', body: 'Repère le corps (épais) et les mèches (fins traits) : le corps dit le sens, les mèches disent jusqu’où le prix est allé.' },
        { id: 's2b', kind: 'visual', conceptRef: 'anatomie-bougie' },
        { id: 's3', kind: 'chart', chartSeed: 77, body: 'Sur ce graphique de démonstration, chaque bougie verte clôture plus haut qu’elle n’a ouvert, chaque rouge l’inverse.' },
        { id: 's3b', kind: 'interaction', chartSeed: 77, body: 'Révèle les bougies une à une : sur chacune, repère le corps et les mèches.' },
        { id: 's4', kind: 'example', body: 'Bougie verte : la clôture est au-dessus de l’ouverture (hausse sur la période). Rouge : l’inverse.' },
        { id: 's5', kind: 'falseSignal', body: 'Une grande bougie verte n’annonce pas la suite : une longue mèche haute juste après peut signaler un rejet. Le contexte prime.' },
        { id: 's6', kind: 'summary', body: 'Les mèches montrent les extrêmes atteints ; le corps montre le sens dominant.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Que montre le corps d’une bougie ?', back: 'La distance ouverture ↔ clôture — donc le sens dominant de la période.' } },
      ],
      commonMistake: 'Lire la couleur sans regarder la taille du corps ni les mèches.',
      sources: ['WMB — Analyse technique : Chandeliers'],
      status: 'approved',
    },
    {
      id: 'lesson.candle-anatomy',
      slug: 'corps-meches-couleur',
      title: 'Corps, mèches, couleur',
      skillId: 'skill.candles',
      objective: 'Décomposer une bougie.',
      difficulty: 'beginner',
      estimatedMinutes: 4,
      steps: [
        { id: 's1', kind: 'explain', body: 'Corps = distance ouverture↔clôture. Mèche haute = plus haut. Mèche basse = plus bas.' },
        { id: 's2', kind: 'summary', body: 'Une longue mèche traduit souvent un rejet de prix : le marché y est allé puis en est revenu — à confirmer avec le contexte.' },
      ],
      sources: ['WMB — Analyse technique : Chandeliers'],
      status: 'approved',
    },
    {
      id: 'lesson.hammer-v5',
      slug: 'le-marteau-visuel',
      title: 'Le marteau (visuel)',
      skillId: 'skill.candles',
      objective: 'Reconnaître un marteau et poser son hypothèse conditionnelle.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Après une baisse, une bougie plante une longue mèche basse puis referme près du haut : le marteau.' },
        { id: 's1', kind: 'observe', body: 'Cherche un petit corps en haut et une longue mèche basse — au moins deux fois le corps.' },
        { id: 's2', kind: 'visual', conceptRef: 'marteau' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'marteau', body: 'Le marteau seul ne suffit pas : il pose une hypothèse à confirmer.' },
        { id: 's4', kind: 'explain', body: 'La longue mèche basse montre que les vendeurs ont poussé le prix bas… avant que les acheteurs ne reprennent la main d’ici la clôture.' },
        { id: 's5', kind: 'falseSignal', body: 'Un marteau en plein range, sans zone de support ni confirmation, n’a pas de valeur : le contexte prime.' },
        { id: 's6', kind: 'summary', body: 'Marteau = rejet du bas dans un contexte de baisse ; on attend une confirmation avant d’en tirer une hypothèse.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Que raconte la longue mèche basse d’un marteau ?', back: 'Un rejet du bas : les vendeurs ont poussé le prix, les acheteurs l’ont ramené vers le haut avant la clôture.' } },
      ],
      commonMistake: 'Prendre tout petit corps avec mèche pour un marteau, hors contexte de baisse.',
      sources: ['WMB — Chandeliers : Marteau'],
      status: 'draft',
    },
  ],
  'skill.patterns': [
    {
      id: 'lesson.reversal-figures',
      slug: 'figures-de-retournement',
      title: 'Figures de retournement',
      skillId: 'skill.patterns',
      objective: 'Comprendre l’idée d’une figure de retournement.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Certaines figures reviennent souvent aux retournements. On apprend à les repérer — sans jamais y voir une certitude.' },
        { id: 's1', kind: 'observe', body: 'Cherche deux creux à un niveau proche, séparés par un rebond : un « W » se dessine.' },
        { id: 's2', kind: 'visual', conceptRef: 'double-creux' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'double-creux', body: 'Tant que la ligne de cou n’est pas cassée, la figure reste une hypothèse, pas un fait.' },
        { id: 's4', kind: 'interaction', chartSeed: 314, body: 'Révèle le graphique bougie par bougie et repère où la figure se confirmerait.' },
        { id: 's5', kind: 'explain', body: 'Une figure de retournement suggère qu’une tendance pourrait s’inverser — sans jamais garantir quoi que ce soit.' },
        { id: 's6', kind: 'summary', body: 'On attend une confirmation (ex. cassure d’un niveau) avant de considérer la figure comme active.' },
      ],
      commonMistake: 'Anticiper une figure avant sa confirmation.',
      sources: ['WMB — Figures chartistes'],
      status: 'approved',
    },
    {
      id: 'lesson.double-bottom',
      slug: 'le-double-creux',
      title: 'Le double creux',
      skillId: 'skill.patterns',
      objective: 'Reconnaître un double creux et sa confirmation.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Après une baisse, le prix teste deux fois le même plancher sans le casser : les vendeurs s’essoufflent-ils ?' },
        { id: 's1', kind: 'explain', body: 'Deux creux à un niveau proche séparés par un rebond forment un « W ». C’est une figure potentiellement haussière.' },
        { id: 's2', kind: 'chart', chartSeed: 314, body: 'Observe la structure en « W » : deux creux proches et un sommet intermédiaire (la ligne de cou).' },
        { id: 's3', kind: 'falseSignal', body: 'Tant que la ligne de cou n’est pas cassée, la figure n’est pas confirmée ; un nouveau plus-bas sous le second creux l’invalide.' },
        { id: 's4', kind: 'summary', body: 'La confirmation vient de la cassure de la ligne de cou, idéalement avec du volume.' },
        { id: 's5', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui confirme un double creux ?', back: 'La cassure de la ligne de cou (le sommet intermédiaire), idéalement soutenue par le volume.' } },
      ],
      commonMistake: 'Ignorer le volume, souvent plus faible sur le second creux.',
      sources: ['WMB — Figures chartistes : Double Creux'],
      status: 'approved',
    },
    {
      id: 'lesson.double-bottom-v5',
      slug: 'le-double-creux-visuel',
      title: 'Le double creux (visuel)',
      skillId: 'skill.patterns',
      objective: 'Voir un double creux et distinguer sa confirmation de son invalidation.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Deux creux au même niveau, un sommet entre les deux : le « W » du double creux.' },
        { id: 's1', kind: 'observe', body: 'Cherche deux creux proches séparés par un rebond, et la ligne de cou (le sommet intermédiaire).' },
        { id: 's2', kind: 'visual', conceptRef: 'double-creux' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'double-creux', body: 'Le « W » pose une hypothèse haussière conditionnelle : rien n’est acquis avant la cassure.' },
        { id: 's4', kind: 'explain', body: 'La confirmation vient de la cassure de la ligne de cou, idéalement soutenue par le volume.' },
        { id: 's5', kind: 'falseSignal', body: 'Sans cassure de la ligne de cou, la figure n’est pas active ; un plus-bas sous le second creux l’invalide.' },
        { id: 's6', kind: 'summary', body: 'Double creux = deux planchers + cassure de la ligne de cou pour confirmer ; sinon, hypothèse invalidée.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Quand un double creux est-il invalidé ?', back: 'Quand le prix casse nettement sous le second creux ; tant que la ligne de cou n’est pas franchie, il n’est pas confirmé.' } },
      ],
      commonMistake: 'Anticiper la hausse avant la cassure de la ligne de cou.',
      sources: ['WMB — Figures : Double Creux'],
      status: 'draft',
    },
    {
      id: 'lesson.triangles-v5',
      slug: 'les-triangles-visuel',
      title: 'Les triangles (visuel)',
      skillId: 'skill.patterns',
      objective: 'Distinguer triangle ascendant, descendant et symétrique, et attendre la sortie confirmée.',
      difficulty: 'intermediate',
      estimatedMinutes: 7,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le prix se comprime entre deux lignes qui se rapprochent : un triangle. Trois familles, une même règle — attendre la sortie confirmée.' },
        { id: 's1', kind: 'visual', conceptRef: 'triangle-ascendant' },
        { id: 's2', kind: 'explain', body: 'Triangle ascendant : résistance plate, creux montants. La pression acheteuse monte contre un plafond fixe.' },
        { id: 's3', kind: 'visual', conceptRef: 'triangle-descendant' },
        { id: 's4', kind: 'explain', body: 'Triangle descendant : support plat, sommets descendants. La pression vendeuse pèse sur un plancher fixe.' },
        { id: 's5', kind: 'visual', conceptRef: 'triangle-symetrique' },
        { id: 's6', kind: 'falseSignal', body: 'Le triangle symétrique n’a pas de biais : une sortie non tenue (fausse sortie) piège ceux qui devinent le sens à l’avance.' },
        { id: 's7', kind: 'summary', body: 'Trois triangles, une discipline : on identifie les lignes, puis on attend la sortie confirmée (clôture, retest).' },
        { id: 's8', kind: 'flashcard', flashcard: { front: 'Qu’attend-on avant d’agir sur un triangle ?', back: 'La sortie confirmée d’une des lignes (clôture, idéalement retest) — jamais une supposition avant.' } },
      ],
      commonMistake: 'Deviner le sens d’un triangle symétrique avant la sortie confirmée.',
      sources: ['WMB — Figures chartistes : Triangles'],
      status: 'draft',
    },
    {
      id: 'lesson.bull-flag-v5',
      slug: 'le-drapeau-haussier-visuel',
      title: 'Le drapeau haussier (visuel)',
      skillId: 'skill.patterns',
      objective: 'Lire un drapeau comme respiration dans une hausse et situer son invalidation.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une hausse forte (le mât), puis une petite consolidation en pente douce : le drapeau haussier.' },
        { id: 's1', kind: 'observe', body: 'Repère le mât (l’impulsion) puis le canal étroit qui respire à contre-sens.' },
        { id: 's2', kind: 'visual', conceptRef: 'drapeau-haussier' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'drapeau-haussier', body: 'Le drapeau pose une hypothèse de continuation : elle se joue à la sortie du canal, pas avant.' },
        { id: 's4', kind: 'explain', body: 'Le volume se calme pendant la consolidation, puis reprend souvent à la sortie par le haut.' },
        { id: 's5', kind: 'falseSignal', body: 'Une consolidation trop profonde qui efface le mât n’est plus un drapeau : l’hypothèse de continuation tombe.' },
        { id: 's6', kind: 'summary', body: 'Drapeau = mât + consolidation ordonnée ; on agit sur la sortie confirmée, pas sur la consolidation.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui invalide un drapeau haussier ?', back: 'Une consolidation qui casse le bas du drapeau et efface une bonne part du mât.' } },
      ],
      commonMistake: 'Confondre un drapeau (respiration brève) avec un vrai retournement.',
      sources: ['WMB — Figures chartistes : Drapeaux'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-M — Module guidé « Lire les chandeliers » (world.candles) ──
  'skill.candle.pressure': [
    {
      id: 'lesson.candle-pressure',
      slug: 'marubozu-pression',
      title: 'Marubozu : la pression franche',
      skillId: 'skill.candle.pressure',
      objective: 'Lire la conviction d’une séance à sens unique.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une bougie tout en corps, presque sans mèche : le marubozu. La séance n’a pas été contestée.' },
        { id: 's1', kind: 'observe', body: 'Cherche un corps long, sans mèche haute ni basse, qui clôture près de l’extrême de la séance.' },
        { id: 's2', kind: 'visual', conceptRef: 'marubozu' },
        { id: 's3', kind: 'explain', body: 'Le corps long dit la pression ; l’absence de mèche dit qu’elle n’a pas été repoussée.' },
        { id: 's4', kind: 'falseSignal', body: 'Un marubozu isolé en plein range, ou sur faible participation, ne donne pas de direction fiable.' },
        { id: 's5', kind: 'summary', body: 'Marubozu = corps plein, pression non contestée ; sa portée dépend toujours du contexte.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Que traduit un marubozu ?', back: 'Une séance à sens unique : corps long, quasi sans mèche, une pression non contestée.' } },
      ],
      commonMistake: 'Prendre tout grand corps pour un marubozu sans vérifier l’absence de mèches ni le contexte.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.candle.rejection': [
    {
      id: 'lesson.candle-rejection',
      slug: 'marteau-rejet',
      title: 'Le marteau : un rejet des bas',
      skillId: 'skill.candle.rejection',
      objective: 'Reconnaître un rejet de prix et poser son hypothèse conditionnelle.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Après une baisse, une bougie plante une longue mèche basse puis referme près du haut : le marteau.' },
        { id: 's1', kind: 'observe', body: 'Cherche un petit corps en haut et une longue mèche basse, au moins deux fois le corps.' },
        { id: 's2', kind: 'visual', conceptRef: 'marteau' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'marteau', body: 'Le marteau seul ne suffit pas : il pose une hypothèse à confirmer au-dessus de son plus haut.' },
        { id: 's4', kind: 'explain', body: 'La longue mèche basse montre que les vendeurs ont poussé le prix bas avant que les acheteurs ne reprennent la main d’ici la clôture.' },
        { id: 's5', kind: 'falseSignal', body: 'Un marteau en plein range, sans support ni confirmation, n’a pas de valeur : le contexte prime.' },
        { id: 's6', kind: 'summary', body: 'Marteau = rejet du bas en contexte de baisse ; on attend une confirmation avant d’en tirer une hypothèse.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Qu’invalide un marteau ?', back: 'Une clôture nette sous le plus bas de sa mèche : le rejet ne tient plus.' } },
      ],
      commonMistake: 'Prendre tout petit corps avec mèche pour un marteau, hors contexte de baisse.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.candle.indecision': [
    {
      id: 'lesson.candle-indecision',
      slug: 'doji-indecision',
      title: 'Le doji : l’indécision',
      skillId: 'skill.candle.indecision',
      objective: 'Lire un équilibre acheteurs/vendeurs et attendre ce qui le tranche.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Ouverture et clôture presque au même niveau : le doji. Acheteurs et vendeurs se sont neutralisés.' },
        { id: 's1', kind: 'observe', body: 'Cherche un corps minuscule avec des mèches de chaque côté, après un mouvement marqué.' },
        { id: 's2', kind: 'visual', conceptRef: 'doji' },
        { id: 's3', kind: 'explain', body: 'Un doji traduit l’indécision : ni les acheteurs ni les vendeurs n’ont pris le dessus sur la séance.' },
        { id: 's4', kind: 'falseSignal', body: 'Un doji isolé, sans tendance préalable, porte peu d’information : il ne signale pas à lui seul un retournement.' },
        { id: 's5', kind: 'summary', body: 'Doji = équilibre ; son sens n’est tranché que par la bougie suivante, au-dessus ou en dessous.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui tranche un doji ?', back: 'La bougie qui suit : elle clôture au-dessus ou en dessous du doji et lève l’indécision.' } },
      ],
      commonMistake: 'Lire un retournement dans un doji isolé, sans mouvement préalable ni confirmation.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.candle.reversal': [
    {
      id: 'lesson.candle-reversal',
      slug: 'avalement-haussier-reprise',
      title: 'L’avalement haussier : une reprise à confirmer',
      skillId: 'skill.candle.reversal',
      objective: 'Repérer une reprise en deux bougies et situer confirmation et invalidation.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Après une baisse, une grande bougie haussière englobe entièrement le corps de la bougie baissière précédente : l’avalement haussier.' },
        { id: 's1', kind: 'observe', body: 'Cherche une bougie baissière suivie d’une bougie haussière dont le corps recouvre le corps précédent.' },
        { id: 's2', kind: 'visual', conceptRef: 'avalement-haussier' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'avalement-haussier', body: 'La figure pose une hypothèse de reprise : elle se joue au-dessus du plus haut de l’avalement, pas avant.' },
        { id: 's4', kind: 'explain', body: 'L’englobement montre que les acheteurs ont repris la main sur la séance ; la confirmation vient au-dessus du plus haut de la figure.' },
        { id: 's5', kind: 'falseSignal', body: 'Un avalement sans participation, aussitôt annulé par un retour sous la figure, n’est pas une reprise.' },
        { id: 's6', kind: 'summary', body: 'Avalement haussier = englobement + confirmation au-dessus du plus haut ; invalidé sous le plus bas des deux bougies.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Qu’invalide un avalement haussier ?', back: 'Une clôture sous le plus bas des deux bougies : la reprise ne tient plus.' } },
      ],
      commonMistake: 'Anticiper la reprise avant la confirmation au-dessus du plus haut de l’avalement.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-N — Module guidé « Lire la structure » (world.structure) ──
  'skill.structure.uptrend': [
    {
      id: 'lesson.structure-uptrend',
      slug: 'tendance-haussiere-structure',
      title: 'La tendance haussière : une structure, pas une opinion',
      skillId: 'skill.structure.uptrend',
      objective: 'Définir une tendance haussière par sa séquence HH/HL.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une tendance haussière ne se décrète pas : elle se lit dans la structure des prix, sommet après sommet, creux après creux.' },
        { id: 's1', kind: 'observe', body: 'Cherche des sommets de plus en plus hauts (HH) et des creux de plus en plus hauts (HL), avec des retracements limités.' },
        { id: 's2', kind: 'visual', conceptRef: 'tendance-haussiere' },
        { id: 's3', kind: 'explain', body: 'Chaque nouveau plus-haut au-dessus du précédent confirme la structure ; chaque creux tenu au-dessus du précédent la protège.' },
        { id: 's4', kind: 'falseSignal', body: 'Un simple rebond dans une baisse n’est pas une tendance haussière : une seule grande bougie ne fait pas une structure.' },
        { id: 's5', kind: 'summary', body: 'Tendance haussière = séquence HH/HL intacte ; elle est invalidée quand un creux passe sous le creux précédent.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui définit une tendance haussière ?', back: 'Une structure de sommets et de creux de plus en plus hauts (HH/HL).' } },
      ],
      commonMistake: 'Lire la tendance sur une bougie plutôt que sur la structure.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.structure.downtrend': [
    {
      id: 'lesson.structure-downtrend',
      slug: 'tendance-baissiere-structure',
      title: 'La tendance baissière : le symétrique exact',
      skillId: 'skill.structure.downtrend',
      objective: 'Décrire une tendance baissière par sa séquence LH/LL.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'La baisse a la même grammaire que la hausse, inversée : des sommets et des creux de plus en plus bas.' },
        { id: 's1', kind: 'observe', body: 'Cherche des sommets décroissants (LH), des creux décroissants (LL), et des rebonds qui échouent chacun plus bas.' },
        { id: 's2', kind: 'visual', conceptRef: 'tendance-baissiere' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'tendance-baissiere', body: 'Tant que la suite LH/LL tient, la pression vendeuse domine : viser le creux sans changement de structure, c’est se précipiter.' },
        { id: 's4', kind: 'explain', body: 'La structure baissière reste valable jusqu’à sa rupture : un plus haut plus haut remet la tendance en question.' },
        { id: 's5', kind: 'falseSignal', body: 'Un seul rebond n’est pas un retournement : sans plus haut plus haut, la structure baissière est intacte.' },
        { id: 's6', kind: 'summary', body: 'Tendance baissière = séquence LH/LL ; elle est remise en cause par un plus haut plus haut, pas par un rebond isolé.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui remet en cause une tendance baissière ?', back: 'Un plus haut plus haut : il casse la suite de sommets décroissants.' } },
      ],
      commonMistake: 'Acheter le creux sans changement de structure.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.structure.range': [
    {
      id: 'lesson.structure-range',
      slug: 'range-equilibre',
      title: 'Le range : la zone d’équilibre',
      skillId: 'skill.structure.range',
      objective: 'Reconnaître un range et attendre une sortie confirmée.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Quand ni les acheteurs ni les vendeurs ne dominent, le prix oscille entre un plancher et un plafond : le range.' },
        { id: 's1', kind: 'observe', body: 'Cherche des rebonds répétés sur un support, des rejets répétés sous une résistance, et l’absence de sommets/creux progressifs.' },
        { id: 's2', kind: 'visual', conceptRef: 'range' },
        { id: 's3', kind: 'explain', body: 'Les bornes sont des zones, pas des lignes exactes. Une sortie confirmée du range — clôture au-delà d’une borne, idéalement retestée — ouvre une nouvelle phase.' },
        { id: 's4', kind: 'falseSignal', body: 'Une mèche au-delà d’une borne sans clôture confirmée est une fausse sortie : le prix repasse aussitôt dans la zone.' },
        { id: 's5', kind: 'summary', body: 'Range = équilibre entre support et résistance ; seul compte ce qui le termine : une sortie franche et confirmée.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui met fin à un range ?', back: 'Une sortie franche et confirmée d’une borne (clôture au-delà, idéalement retestée).' } },
      ],
      commonMistake: 'Traiter les bornes comme des lignes exactes plutôt que des zones.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.structure.break': [
    {
      id: 'lesson.structure-break',
      slug: 'cassure-de-structure-lecture',
      title: 'La cassure de structure : quand la séquence cède',
      skillId: 'skill.structure.break',
      objective: 'Repérer une cassure de structure et rester probabiliste.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Dans une hausse, tout repose sur le dernier creux protégé. Le jour où il cède, la séquence HH/HL est rompue : c’est la cassure de structure.' },
        { id: 's1', kind: 'observe', body: 'Cherche une séquence bien établie, puis une clôture qui casse le dernier creux protégé, avec un changement de rythme.' },
        { id: 's2', kind: 'visual', conceptRef: 'cassure-de-structure' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'cassure-de-structure', body: 'La cassure signale que le rapport de force bascule — elle ne garantit pas un retournement : c’est une hypothèse à surveiller.' },
        { id: 's4', kind: 'explain', body: 'La cassure se confirme sous le dernier creux protégé, idéalement avec de la participation ; une reprise au-dessus du niveau cassé l’invalide.' },
        { id: 's5', kind: 'falseSignal', body: 'Une mèche qui perce le creux sans clôture au-delà peut n’être qu’une chasse aux stops ; un simple retracement n’est pas une cassure.' },
        { id: 's6', kind: 'summary', body: 'Cassure de structure = rupture du dernier creux protégé, en clôture ; à confirmer, jamais garantie.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Qu’invalide une cassure de structure baissière ?', back: 'Une reprise et une clôture au-dessus du niveau cassé, sans suite baissière.' } },
      ],
      commonMistake: 'Confondre un simple retracement avec une cassure de structure.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-O — Module guidé « Lire les niveaux » (world.support-resistance) ──
  'skill.sr.zones': [
    {
      id: 'lesson.sr-zones',
      slug: 'zones-support-resistance',
      title: 'Support et résistance : des zones, pas des lignes',
      skillId: 'skill.sr.zones',
      objective: 'Identifier une zone de support ou de résistance et son rôle.',
      difficulty: 'beginner',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le marché a de la mémoire : certains niveaux font revenir les acheteurs (support) ou les vendeurs (résistance).' },
        { id: 's1', kind: 'observe', body: 'Cherche plusieurs touches au même niveau, avec des réactions visibles du prix : rejets, pauses, rebonds.' },
        { id: 's2', kind: 'visual', conceptRef: 'support-resistance' },
        { id: 's3', kind: 'explain', body: 'Raisonne en ZONES, jamais en lignes exactes : le marché ne réagit pas au pixel près. La réaction du prix à l’approche de la zone est l’information.' },
        { id: 's4', kind: 'falseSignal', body: 'Une mèche qui dépasse la zone sans clôture au-delà n’invalide pas le niveau : il faut une clôture nette, sans retour immédiat.' },
        { id: 's5', kind: 'summary', body: 'Support = plancher, résistance = plafond ; des zones de mémoire, jamais garanties, invalidées par une clôture nette au-delà.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Support ou résistance : ligne ou zone ?', back: 'Une zone : le marché raisonne rarement au pixel près.' } },
      ],
      commonMistake: 'Tracer des lignes trop précises au lieu de zones.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.sr.flip': [
    {
      id: 'lesson.sr-flip',
      slug: 'polarite-flip-lecture',
      title: 'La polarité : quand un niveau change de rôle',
      skillId: 'skill.sr.flip',
      objective: 'Comprendre qu’un niveau cassé peut changer de rôle (flip).',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Un support franchi ne disparaît pas : il change souvent de rôle et agit en résistance au retour du prix. C’est la polarité, ou « flip ».' },
        { id: 's1', kind: 'observe', body: 'Cherche un niveau clairement franchi et confirmé, puis un retour du prix vers ce même niveau (retest).' },
        { id: 's2', kind: 'visual', conceptRef: 'polarite-flip' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'polarite-flip', body: 'Le flip reste une hypothèse tant que le retest n’a pas réagi : ne le tiens jamais pour acquis.' },
        { id: 's4', kind: 'explain', body: 'La confirmation se lit à la réaction du prix au retest, côté opposé au rôle initial ; un retour franc de l’ancien côté annule le flip.' },
        { id: 's5', kind: 'falseSignal', body: 'Un retest qui traverse le niveau sans réaction est un flip non tenu : l’hypothèse tombe.' },
        { id: 's6', kind: 'summary', body: 'Flip = niveau cassé qui change de rôle, confirmé au retest — une hypothèse à vérifier, jamais une certitude.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qu’un flip de polarité ?', back: 'Un niveau cassé qui change de rôle : un support devient résistance (ou l’inverse), confirmé au retest.' } },
      ],
      commonMistake: 'Attendre un flip comme une certitude plutôt qu’une hypothèse.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.sr.retest': [
    {
      id: 'lesson.sr-retest',
      slug: 'retest-lecture',
      title: 'Le retest : le niveau repasse son examen',
      skillId: 'skill.sr.retest',
      objective: 'Lire le retour du prix sur un niveau cassé — qui confirme ou invalide.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Après une cassure, le prix revient souvent tester le niveau franchi : le retest. C’est là que le niveau repasse son examen.' },
        { id: 's1', kind: 'observe', body: 'Vérifie d’abord que le niveau a réellement cassé — pas juste été effleuré — puis observe le retour du prix.' },
        { id: 's2', kind: 'visual', conceptRef: 'retest-de-niveau' },
        { id: 's3', kind: 'explain', body: 'Un retest qui tient renforce l’hypothèse de continuation ; un retour franc de l’autre côté l’invalide. Les deux issues existent.' },
        { id: 's4', kind: 'falseSignal', body: 'Prendre un simple contact pour une cassure suivie de retest est l’erreur classique : sans cassure réelle, pas de retest.' },
        { id: 's5', kind: 'summary', body: 'Retest = retour sur un niveau cassé ; il peut confirmer comme invalider — jamais garantir.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qu’un retest ?', back: 'Le retour du prix sur un niveau cassé pour le tester à nouveau.' } },
      ],
      commonMistake: 'Oublier que le retest peut invalider, pas seulement confirmer.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-P — Module guidé « Lire un graphique de près » (world.anatomy) ──
  'skill.anatomy.candle': [
    {
      id: 'lesson.anatomy-candle',
      slug: 'corps-et-meches',
      title: 'Le corps et les mèches',
      skillId: 'skill.anatomy.candle',
      objective: 'Décomposer une bougie en corps et mèches et lire ce qu’elle raconte.',
      difficulty: 'beginner',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une bougie résume une période en quatre prix : ouverture, clôture, plus haut, plus bas. Tout le reste se lit dedans.' },
        { id: 's1', kind: 'observe', body: 'Repère le corps (ouverture ↔ clôture) et les deux mèches (les extrêmes atteints pendant la période).' },
        { id: 's2', kind: 'visual', conceptRef: 'anatomie-bougie' },
        { id: 's3', kind: 'explain', body: 'Corps long = mouvement décidé ; longues mèches = hésitation ou rejet. La couleur dit le sens de la période — pas la suite.' },
        { id: 's4', kind: 'falseSignal', body: 'Lire la couleur sans regarder la taille du corps ni les mèches mène aux contresens : une bougie décrit le passé.' },
        { id: 's5', kind: 'summary', body: 'Corps = sens, mèches = extrêmes ; la lecture se confirme avec les bougies suivantes et le contexte.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Que montre le corps d’une bougie ?', back: 'La distance ouverture ↔ clôture — donc le sens dominant de la période.' } },
      ],
      commonMistake: 'Croire qu’une couleur prédit la bougie suivante.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.anatomy.timeframe': [
    {
      id: 'lesson.anatomy-timeframe',
      slug: 'unite-de-temps-lecture',
      title: 'L’unité de temps : ce qu’une bougie résume',
      skillId: 'skill.anatomy.timeframe',
      objective: 'Comprendre qu’une bougie résume une durée choisie (l’unité de temps).',
      difficulty: 'beginner',
      estimatedMinutes: 4,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une bougie n’a de sens qu’avec sa durée : 1 minute, 1 heure, 1 jour. C’est l’unité de temps.' },
        { id: 's1', kind: 'observe', body: 'La même série paraît très différente en 5 minutes et en journalier : plus l’unité est courte, plus il y a de bruit.' },
        { id: 's2', kind: 'visual', conceptRef: 'unite-de-temps' },
        { id: 's3', kind: 'explain', body: 'On lit d’abord la structure sur une unité large (la tendance de fond), puis on affine sur une unité plus courte.' },
        { id: 's4', kind: 'falseSignal', body: 'Confondre un signal de très court terme avec la tendance de fond est l’erreur classique du zoom excessif.' },
        { id: 's5', kind: 'summary', body: 'Une bougie = une durée fixe ; le signal court doit tenir face à la structure large.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Que représente une bougie ?', back: 'Une durée fixe : l’unité de temps (1 min, 1 h, 1 jour…).' } },
      ],
      commonMistake: 'Zoomer trop fort et perdre le contexte d’ensemble.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.anatomy.scale': [
    {
      id: 'lesson.anatomy-scale',
      slug: 'echelle-des-prix-lecture',
      title: 'L’échelle des prix : mesurer, pas impressionner',
      skillId: 'skill.anatomy.scale',
      objective: 'Lire l’axe des prix pour situer un mouvement dans son contexte.',
      difficulty: 'beginner',
      estimatedMinutes: 4,
      steps: [
        { id: 's0', kind: 'intro', body: 'L’axe vertical situe chaque bougie à son niveau de prix. C’est lui qui dit la vraie ampleur d’un mouvement.' },
        { id: 's1', kind: 'observe', body: 'Repère les niveaux au bord du graphique et mesure l’écart réel entre deux points : c’est l’amplitude.' },
        { id: 's2', kind: 'visual', conceptRef: 'echelle-des-prix' },
        { id: 's3', kind: 'explain', body: 'Une même hausse paraît spectaculaire ou modeste selon l’étirement de l’échelle : on compare l’amplitude à la structure, pas à l’impression.' },
        { id: 's4', kind: 'falseSignal', body: 'Surestimer une hausse à cause d’une échelle compressée ou étirée : l’axe change l’impression, jamais les prix.' },
        { id: 's5', kind: 'summary', body: 'Lire les niveaux, mesurer l’amplitude réelle, la rapporter au contexte — ne jamais juger à l’œil.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'À quoi sert l’échelle des prix ?', back: 'À situer chaque bougie à son niveau et à mesurer l’amplitude réelle.' } },
      ],
      commonMistake: 'Juger l’ampleur à l’œil sans lire les niveaux.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-Q — Module guidé « Lire les figures » (world.patterns) ──
  'skill.patterns.double': [
    {
      id: 'lesson.patterns-double',
      slug: 'double-creux-lecture',
      title: 'Le double creux : deux planchers, une ligne de cou',
      skillId: 'skill.patterns.double',
      objective: 'Reconnaître un double creux et attendre sa confirmation.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Deux fois de suite, le prix rebondit au même niveau : le double creux. Entre les deux, un sommet — la ligne de cou.' },
        { id: 's1', kind: 'observe', body: 'Repère deux creux au même niveau, puis trace la ligne de cou sur le sommet intermédiaire.' },
        { id: 's2', kind: 'visual', conceptRef: 'double-creux' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'double-creux', body: 'La figure ne vaut que confirmée : la clôture au-dessus de la ligne de cou est l’événement, pas les creux eux-mêmes.' },
        { id: 's4', kind: 'falseSignal', body: 'Un franchissement de la ligne de cou sans participation, aussitôt rendu, est un faux signal classique.' },
        { id: 's5', kind: 'summary', body: 'Double creux = deux planchers + ligne de cou ; confirmé au-dessus de la ligne de cou, invalidé sous les creux.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui confirme un double creux ?', back: 'Une clôture au-dessus de la ligne de cou (le sommet intermédiaire).' } },
      ],
      commonMistake: 'Jouer la figure dès le second creux, sans attendre la ligne de cou.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.patterns.triangle': [
    {
      id: 'lesson.patterns-triangle',
      slug: 'triangle-ascendant-lecture',
      title: 'Le triangle ascendant : la compression',
      skillId: 'skill.patterns.triangle',
      objective: 'Lire la compression d’un triangle et attendre sa résolution.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une résistance plate, des creux de plus en plus hauts : le prix se comprime. C’est le triangle ascendant.' },
        { id: 's1', kind: 'observe', body: 'Repère la résistance horizontale testée plusieurs fois et la ligne montante des creux.' },
        { id: 's2', kind: 'visual', conceptRef: 'triangle-ascendant' },
        { id: 's3', kind: 'explain', body: 'La pression acheteuse monte, mais rien n’est joué : seule une clôture franche hors du triangle résout la figure — dans un sens comme dans l’autre.' },
        { id: 's4', kind: 'falseSignal', body: 'Une fausse sortie au-dessus de la résistance sans participation, aussitôt annulée, piège les impatients.' },
        { id: 's5', kind: 'summary', body: 'Triangle ascendant = compression sous résistance ; seule la résolution en clôture compte, jamais l’anticipation.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui résout un triangle ascendant ?', back: 'Une clôture franche hors du triangle — idéalement au-dessus de la résistance, avec retest.' } },
      ],
      commonMistake: 'Anticiper la sortie avant la clôture hors du triangle.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.patterns.flag': [
    {
      id: 'lesson.patterns-flag',
      slug: 'drapeau-haussier-lecture',
      title: 'Le drapeau : la pause qui continue',
      skillId: 'skill.patterns.flag',
      objective: 'Lire une consolidation de continuation : mât, canal, reprise.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Après une forte impulsion (le mât), le prix souffle dans un petit canal incliné : le drapeau.' },
        { id: 's1', kind: 'observe', body: 'Repère le mât (l’impulsion), puis le canal court et contenu de la consolidation.' },
        { id: 's2', kind: 'visual', conceptRef: 'drapeau-haussier' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'drapeau-haussier', body: 'L’hypothèse de continuation se joue à la sortie HAUTE du canal — pas pendant la pause.' },
        { id: 's4', kind: 'falseSignal', body: 'Une sortie haute sans participation, qui retombe aussitôt dans le canal, n’est pas une continuation.' },
        { id: 's5', kind: 'summary', body: 'Drapeau = mât + canal court ; confirmé à la sortie haute, invalidé sous le bas du canal.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’invalide un drapeau haussier ?', back: 'Une clôture sous le bas du canal, effaçant une bonne part du mât.' } },
      ],
      commonMistake: 'Confondre toute consolidation avec un drapeau : le canal doit rester court et contenu.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.patterns.reversal': [
    {
      id: 'lesson.patterns-reversal',
      slug: 'epaule-tete-epaule-lecture',
      title: 'L’épaule-tête-épaule : le retournement majeur',
      skillId: 'skill.patterns.reversal',
      objective: 'Reconnaître l’ÉTÉ, sa ligne de cou et sa confirmation.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Trois sommets, le central plus haut que les deux autres : l’épaule-tête-épaule, figure de retournement majeure.' },
        { id: 's1', kind: 'observe', body: 'Repère les trois sommets (épaule, tête, épaule) puis trace la ligne de cou sous les creux intermédiaires.' },
        { id: 's2', kind: 'visual', conceptRef: 'epaule-tete-epaule' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'epaule-tete-epaule', body: 'La figure ne se joue PAS à l’épaule droite : tout se décide à la clôture sous la ligne de cou.' },
        { id: 's4', kind: 'explain', body: 'La confirmation se lit sous la ligne de cou, idéalement retestée par l’arrière ; une reprise au-dessus l’invalide.' },
        { id: 's5', kind: 'falseSignal', body: 'Une cassure de la ligne de cou sans participation, aussitôt rendue, est un faux signal — le retournement n’est jamais garanti.' },
        { id: 's6', kind: 'summary', body: 'ÉTÉ = trois sommets + ligne de cou ; confirmée sous la ligne de cou, jamais garantie.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Où se confirme une épaule-tête-épaule ?', back: 'Sous la ligne de cou, en clôture — idéalement retestée par l’arrière.' } },
      ],
      commonMistake: 'Jouer la figure dès l’épaule droite, avant la cassure de la ligne de cou.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
};

// ─── Exercices par compétence (formats variés) ───────────────────────
const fb = (correct: string, incorrect: string, rule?: string, whenItFails?: string) => ({ correct, incorrect, rule, whenItFails });

// ─── Cibles déterministes des exercices graphiques V5 (Lot 6) ────────────────
// Calculées depuis la série reproductible (même seed ⇒ même cible) : le grader reste
// pur (tolérance absolue), la correction affichée coïncide avec la ligne révélée.
const INV_SEED = 909;
const invCandles = generateCandles(INV_SEED, 30);
const INV_TARGET = supportLevel(invCandles); // plancher = zone d'invalidation
const INV_TOL = (resistanceLevel(invCandles) - supportLevel(invCandles)) * 0.08;

const LABEL_SEED = 451;
const labelCandles = generateCandles(LABEL_SEED, 30);
const LABEL_MARKER = labelCandles.reduce((best, c, i) => (c.h > labelCandles[best].h ? i : best), 0); // plus haut atteint

const RAW_EXERCISES: Record<string, Exercise[]> = {
  'skill.actions': [
    { id: 'ex.actions.mcq', type: 'mcq', skillId: 'skill.actions', prompt: 'Que représente une action ?', options: ['Un prêt à une entreprise', 'Une part d’une entreprise', 'Une monnaie numérique'], validation: { correctIndex: 1 }, difficulty: 'easy', feedback: fb('Exact — une action, c’est une part d’entreprise.', 'Une action n’est ni un prêt ni une monnaie.', 'Action = part d’entreprise.', 'Un prêt à une entreprise, c’est une obligation.') },
    buildDirectionExercise({
      id: 'ex.actions.chart-direction',
      skillId: 'skill.actions',
      target: { conceptId: 'concept.market-basics', objectiveId: 'concept.market-basics::recognize' },
      chartSeed: 7,
      prompt: 'Voici le prix d’une action affiché en bougies. Quelle est sa direction générale ?',
      options: ['Plutôt à la hausse', 'Plutôt à la baisse', 'Sans direction nette'],
      difficulty: 'easy',
      rule: 'Le prix se lit sur un graphique en bougies ; la tendance se lit sur la structure globale.',
    }),
    { id: 'ex.actions.green-candle', type: 'identify_figure', skillId: 'skill.actions', prompt: 'Sur cette bougie, comment le prix a-t-il évolué pendant la période ?', datasetKey: 'candle.bullish-marubozu.v1', variant: 'bullish-marubozu', visualType: 'candlestick-pattern', options: ['Le prix a monté (clôture au-dessus de l’ouverture)', 'Le prix a baissé', 'Le prix n’a pas bougé'], validation: { correctIndex: 0 }, difficulty: 'easy', feedback: fb('Exact : une bougie verte clôture au-dessus de son ouverture.', 'Une bougie verte clôture au-dessus de l’ouverture : le prix a monté.', 'Couleur = sens ouverture → clôture (verte = hausse).') },
    { id: 'ex.actions.tf', type: 'true_false', skillId: 'skill.actions', prompt: 'Un actionnaire possède une part de l’entreprise.', validation: { answer: true }, difficulty: 'easy', feedback: fb('Oui : détenir une action, c’est posséder une fraction de l’entreprise.', 'C’est pourtant vrai : l’actionnaire est copropriétaire.', 'Actionnaire = copropriétaire.') },
    { id: 'ex.actions.numeric', type: 'numeric', skillId: 'skill.actions', prompt: 'Sur 1 000 actions, combien en faut-il pour 1 % ?', unit: 'actions', validation: { answer: 10, tolerance: 0 }, difficulty: 'easy', feedback: fb('Exact : 1 % de 1 000 = 10.', '1 % de 1 000 = 10 actions.', 'Part = actions détenues ÷ total.') },
    { id: 'ex.actions.match', type: 'match', skillId: 'skill.actions', prompt: 'Associe chaque terme à sa définition.', left: ['Action', 'Obligation', 'Dividende'], right: ['Part d’entreprise', 'Dette de l’entreprise', 'Part du bénéfice versée'], validation: { matches: [0, 1, 2] }, difficulty: 'medium', feedback: fb('Parfait : action = part, obligation = dette, dividende = bénéfice versé.', 'Une obligation est une dette, pas une part.', 'Action ≠ obligation.') },
    { id: 'ex.actions.find', type: 'find_error', skillId: 'skill.actions', prompt: 'Repère l’affirmation FAUSSE.', statements: ['Une action est une part d’entreprise.', 'Le prix d’une action ne varie jamais.', 'Un actionnaire peut recevoir des dividendes.'], validation: { errorIndex: 1 }, difficulty: 'easy', feedback: fb('Exact : le prix varie en permanence.', 'L’erreur est « le prix ne varie jamais ».', 'Le prix d’une action fluctue toujours.') },
    { id: 'ex.actions.dividende', type: 'mcq', skillId: 'skill.actions', prompt: 'À la date de détachement du dividende, que devient le cours de l’action ?', options: ['Il baisse d’environ le montant du dividende', 'Il monte du montant du dividende', 'Il ne change pas'], validation: { correctIndex: 0 }, difficulty: 'medium', feedback: fb('Exact : la valeur sort de l’entreprise vers l’actionnaire, le cours s’ajuste à la baisse.', 'Toucher un dividende n’ajoute pas de valeur : le cours baisse d’environ le dividende.', 'Détachement = le cours s’ajuste d’environ le dividende.', 'Un dividende n’est jamais garanti d’une année sur l’autre.') },
    { id: 'ex.actions.per', type: 'mcq', skillId: 'skill.actions', prompt: 'Un PER de 10 signifie approximativement…', options: ['On paie l’action ~10 ans de bénéfices actuels', 'L’action rapporte 10 % par an', 'Le dividende vaut 10 €'], validation: { correctIndex: 0 }, difficulty: 'medium', feedback: fb('Exact : PER = prix ÷ bénéfice par action ; 10 ≈ dix années de bénéfices.', 'Le PER n’est ni un rendement ni un dividende : c’est un multiple prix/bénéfice.', 'PER = prix ÷ bénéfice par action.', 'Un PER se compare à secteur et moment comparables.') },
  ],
  'skill.trend': [
    { id: 'ex.trend.tf', type: 'true_false', skillId: 'skill.trend', prompt: 'Des sommets et creux de plus en plus hauts décrivent une tendance haussière.', validation: { answer: true }, difficulty: 'easy', feedback: fb('Oui : c’est la définition structurelle d’une tendance haussière.', 'C’est vrai : ce sont les points hauts/bas croissants qui font la tendance.', 'La structure du prix définit la tendance.') },
    { id: 'ex.trend.order', type: 'order', skillId: 'skill.trend', prompt: 'Ordonne du plus baissier au plus haussier.', items: ['Marché haussier (bull)', 'Marché en range', 'Marché baissier (bear)'], validation: { correctOrder: [2, 1, 0] }, difficulty: 'medium', feedback: fb('Bien vu : bear → range → bull.', 'Ordre attendu : baissier, range, haussier.', 'Bear = baisse durable ; bull = hausse durable.') },
    { id: 'ex.trend.mcq', type: 'mcq', skillId: 'skill.trend', prompt: 'Qu’est-ce qu’une résistance ?', options: ['Un plancher où les acheteurs reviennent', 'Un plafond où les vendeurs reprennent la main', 'Un indicateur de volume'], validation: { correctIndex: 1 }, difficulty: 'medium', feedback: fb('Exact : la résistance plafonne la hausse.', 'La résistance est un plafond ; le plancher, c’est le support.', 'Résistance = plafond, support = plancher.') },
    { id: 'ex.trend.find', type: 'find_error', skillId: 'skill.trend', prompt: 'Repère l’affirmation FAUSSE.', statements: ['Le support agit comme un plancher.', 'La résistance garantit à 100 % que le prix redescend.', 'Ces niveaux sont des repères, pas des certitudes.'], validation: { errorIndex: 1 }, difficulty: 'medium', feedback: fb('Exact : rien n’est garanti à 100 %.', 'L’erreur est le « garantit à 100 % ».', 'Un niveau est un repère, jamais une garantie.') },
    buildDirectionExercise({
      id: 'ex.trend.identify',
      skillId: 'skill.trend',
      target: { conceptId: 'concept.uptrend', objectiveId: 'concept.uptrend::recognize' },
      chartSeed: 11,
      prompt: 'Quelle tendance générale ce graphique montre-t-il ?',
      options: ['Haussière', 'Baissière', 'Latérale (range)'],
      difficulty: 'medium',
      rule: 'La tendance se lit sur la structure (sommets et creux), pas sur une seule bougie.',
    }),
    { id: 'ex.trend.zone', type: 'select_chart_zone', skillId: 'skill.trend', prompt: 'Le support est le plancher où les acheteurs reviennent. Touche la zone du support.', chartSeed: 2024, zones: ['Zone haute', 'Zone médiane', 'Zone basse'], validation: { correctZone: 2 }, difficulty: 'medium', feedback: fb('Exact — le support, c’est la zone basse (le plancher).', 'Le support est la zone basse ; le plafond du haut, c’est la résistance.', 'Support = plancher (bas), résistance = plafond (haut).', 'Un support finit parfois par céder : rien n’est garanti à 100 %.') },
    { id: 'ex.trend.identify-figure', type: 'identify_figure', skillId: 'skill.trend', prompt: 'Quel indicateur reconnais-tu ?', datasetKey: 'indicator.rsi.v1', variant: 'rsi', visualType: 'indicator', options: ['MACD', 'RSI', 'Bandes de Bollinger', 'Volume'], validation: { correctIndex: 1 }, difficulty: 'hard', feedback: fb('Exact : un oscillateur 0–100 avec zones 70/30.', 'C’est le RSI : oscillateur borné 0–100 sous le prix, seuils 70/30.', 'RSI = force relative, surachat > 70 / survente < 30.', '« Suracheté » n’est pas un ordre : en tendance, l’extrême peut durer.') },
  ],
  // Unité PILOTE « Comprendre un chandelier » : exercices DÉRIVÉS de la source de scénario canonique
  // (une seule vérité par item → graphique = réponse = feedback = a11y). Voir `pilotScenarios.ts`.
  'skill.candles': CANDLE_PILOT_EXERCISES,
  'skill.patterns': [
    { id: 'ex.patterns.invalidation', type: 'place_invalidation', skillId: 'skill.patterns', prompt: 'Place le niveau d’invalidation : sous quel plancher la figure ne tient plus ?', chartSeed: INV_SEED, hint: 'le plus bas atteint (le plancher)', validation: { targetPrice: INV_TARGET, tolerance: INV_TOL }, difficulty: 'hard', feedback: fb('Bien vu : sous le plancher, l’hypothèse est invalidée.', 'L’invalidation se pose sous le plancher (le plus bas atteint), pas au milieu.', 'Invalidation = niveau qui, franchi, annule le scénario.', 'Une invalidation trop serrée saute au moindre bruit ; trop large, elle ne protège plus.') },
    { id: 'ex.patterns.label', type: 'label_chart', skillId: 'skill.patterns', prompt: 'Observe le repère sur le graphique.', chartSeed: LABEL_SEED, markerIndex: LABEL_MARKER, options: ['Le plus haut atteint sur la période', 'Le plancher (support)', 'Le volume échangé'], validation: { correctIndex: 0 }, difficulty: 'medium', feedback: fb('Exact : le repère pointe le sommet, le plus haut atteint.', 'Le repère est au sommet : c’est le plus haut atteint, pas le plancher ni le volume.', 'La mèche haute marque le plus haut de la période.') },
    { id: 'ex.patterns.sequence', type: 'sequence_market_structure', skillId: 'skill.patterns', prompt: 'Remets la structure de marché dans l’ordre chronologique.', chartSeed: 12, steps: ['Cassure de la résistance (breakout)', 'Range : accumulation dans une zone', 'Tendance haussière : sommets et creux plus hauts', 'Pullback : retest du niveau cassé'], validation: { correctOrder: [1, 0, 3, 2] }, difficulty: 'hard', feedback: fb('Bien vu : accumulation, cassure, retest, puis tendance.', 'Ordre attendu : range → cassure → pullback → tendance.', 'La structure évolue par phases successives.', 'Une cassure peut échouer (faux signal) et le prix revenir dans le range.') },
    buildDirectionExercise({
      id: 'ex.patterns.identify',
      skillId: 'skill.patterns',
      target: { conceptId: 'concept.double-bottom', objectiveId: 'concept.double-bottom::recognize' },
      chartSeed: 314,
      prompt: 'Sur ce schéma, quelle est la direction dominante ?',
      options: ['Plutôt haussière', 'Plutôt baissière', 'Sans direction nette'],
      difficulty: 'medium',
      rule: 'On lit la direction sur la structure globale.',
    }),
    { id: 'ex.patterns.mcq', type: 'mcq', skillId: 'skill.patterns', prompt: 'Un double creux est une figure plutôt…', options: ['Haussière', 'Baissière', 'Neutre par nature'], validation: { correctIndex: 0 }, difficulty: 'medium', feedback: fb('Exact : le double creux est une figure de retournement haussier.', 'Le double creux (« W ») est plutôt haussier.', 'Deux creux + cassure = potentiel haussier.') },
    { id: 'ex.patterns.tf', type: 'true_false', skillId: 'skill.patterns', prompt: 'Un double creux est confirmé par la cassure de la ligne de cou.', validation: { answer: true }, difficulty: 'medium', feedback: fb('Oui : sans cassure de la ligne de cou, la figure n’est pas confirmée.', 'C’est vrai : la cassure de la ligne de cou confirme.', 'Pas de confirmation sans cassure.') },
    { id: 'ex.patterns.find', type: 'find_error', skillId: 'skill.patterns', prompt: 'Repère l’affirmation FAUSSE sur le double creux.', statements: ['Les deux creux sont à un niveau proche.', 'La figure est invalidée si le prix casse nettement sous le second creux.', 'La figure garantit une hausse.'], validation: { errorIndex: 2 }, difficulty: 'medium', feedback: fb('Exact : aucune figure ne garantit un mouvement.', 'L’erreur : rien n’est garanti.', 'Une figure donne un scénario, jamais une certitude.') },
    { id: 'ex.patterns.scenario', type: 'scenario', skillId: 'skill.patterns', prompt: 'Que peux-tu en conclure ?', context: 'Un double creux s’est formé et le prix casse la ligne de cou avec du volume.', options: ['La figure est confirmée : hypothèse haussière.', 'La figure est invalidée.', 'Il ne se passe rien de notable.'], validation: { correctIndex: 0 }, difficulty: 'medium', feedback: fb('Oui : cassure de la ligne de cou + volume = confirmation.', 'La cassure de la ligne de cou avec volume confirme la figure.', 'Confirmation = cassure de la ligne de cou, idéalement avec volume.', 'Une confirmation n’est jamais une certitude : le prix peut refranchir le niveau (faux signal).') },
    { id: 'ex.patterns.identify-figure', type: 'identify_figure', skillId: 'skill.patterns', prompt: 'Quelle figure chartiste reconnais-tu ?', datasetKey: 'pattern.head-shoulders.v1', variant: 'head-shoulders', visualType: 'chart-pattern', options: ['Triangle ascendant', 'Épaule-tête-épaule', 'Double creux', 'Drapeau haussier'], validation: { correctIndex: 1 }, difficulty: 'medium', feedback: fb('Bien vu : trois sommets, la tête au centre.', 'C’est une épaule-tête-épaule : la tête (sommet central) domine deux épaules.', 'ÉTÉ = tête centrale plus haute + ligne de cou ; la cassure confirme.', 'Sans cassure de la ligne de cou, la figure n’est pas confirmée.') },
  ],
  // ─── LOT 4-M — Module « Lire les chandeliers » : exercices DÉRIVÉS des scénarios canoniques ──
  // (une seule vérité par item → visuel = réponse = feedback = a11y). Voir `candleModuleScenarios.ts`.
  'skill.candle.pressure': CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.pressure'],
  'skill.candle.rejection': CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.rejection'],
  'skill.candle.indecision': CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.indecision'],
  'skill.candle.reversal': CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.reversal'],
  // LOT 4-N — module « Lire la structure » : exercices dérivés des scénarios (une vérité par item).
  'skill.structure.uptrend': STRUCTURE_MODULE_EXERCISES_BY_SKILL['skill.structure.uptrend'],
  'skill.structure.downtrend': STRUCTURE_MODULE_EXERCISES_BY_SKILL['skill.structure.downtrend'],
  'skill.structure.range': STRUCTURE_MODULE_EXERCISES_BY_SKILL['skill.structure.range'],
  'skill.structure.break': STRUCTURE_MODULE_EXERCISES_BY_SKILL['skill.structure.break'],
  // LOT 4-O — module « Lire les niveaux » : exercices dérivés des scénarios (une vérité par item).
  'skill.sr.zones': SR_MODULE_EXERCISES_BY_SKILL['skill.sr.zones'],
  'skill.sr.flip': SR_MODULE_EXERCISES_BY_SKILL['skill.sr.flip'],
  'skill.sr.retest': SR_MODULE_EXERCISES_BY_SKILL['skill.sr.retest'],
  // LOT 4-P — module « Lire un graphique de près » : exercices dérivés des scénarios.
  'skill.anatomy.candle': ANATOMY_MODULE_EXERCISES_BY_SKILL['skill.anatomy.candle'],
  'skill.anatomy.timeframe': ANATOMY_MODULE_EXERCISES_BY_SKILL['skill.anatomy.timeframe'],
  'skill.anatomy.scale': ANATOMY_MODULE_EXERCISES_BY_SKILL['skill.anatomy.scale'],
  // LOT 4-Q — module « Lire les figures » : exercices dérivés des scénarios.
  'skill.patterns.double': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.double'],
  'skill.patterns.triangle': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.triangle'],
  'skill.patterns.flag': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.flag'],
  'skill.patterns.reversal': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.reversal'],
};

// ─── Cibles pédagogiques des exercices ───────────────────────────────
// Concept représentatif de chaque compétence (source : CONCEPT_BY_SKILL, mais par id).
const SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.actions': 'concept.market-basics',
  'skill.trend': 'concept.uptrend',
  'skill.candles': 'concept.candle-anatomy',
  'skill.patterns': 'concept.double-bottom',
  // LOT 4-M — compétences du module « Lire les chandeliers » (concepts réels de world.candles).
  ...CANDLE_SKILL_CONCEPT_ID,
  // LOT 4-N — compétences du module « Lire la structure » (concepts réels de world.structure).
  ...STRUCTURE_SKILL_CONCEPT_ID,
  // LOT 4-O — compétences du module « Lire les niveaux » (concepts réels de world.support-resistance).
  ...SR_SKILL_CONCEPT_ID,
  // LOT 4-P — compétences du module « Lire un graphique de près » (concepts réels de world.anatomy).
  ...ANATOMY_SKILL_CONCEPT_ID,
  // LOT 4-Q — compétences du module « Lire les figures » (concepts réels de world.patterns).
  ...PATTERNS_SKILL_CONCEPT_ID,
};

// Objectif adressé par chaque exercice (les exercices directionnels portent déjà leur cible).
// Chaque `kind` est un objectif RÉEL du concept représentatif (aucune cible orpheline).
const EXERCISE_OBJECTIVE: Record<string, ObjectiveKind> = {
  'ex.actions.mcq': 'interpret',
  'ex.actions.green-candle': 'recognize',
  'ex.actions.tf': 'interpret',
  'ex.actions.numeric': 'interpret',
  'ex.actions.match': 'interpret',
  'ex.actions.find': 'avoid-false-signal',
  'ex.actions.dividende': 'interpret',
  'ex.actions.per': 'interpret',
  'ex.trend.tf': 'recognize',
  'ex.trend.order': 'interpret',
  'ex.trend.mcq': 'interpret',
  'ex.trend.find': 'avoid-false-signal',
  'ex.trend.zone': 'recognize',
  'ex.trend.identify-figure': 'recognize',
  // `skill.candles` : les exercices de l'unité pilote portent déjà leur cible (pilotScenarios.ts).
  'ex.patterns.invalidation': 'invalidate',
  'ex.patterns.label': 'recognize',
  'ex.patterns.sequence': 'interpret',
  'ex.patterns.mcq': 'interpret',
  'ex.patterns.tf': 'confirm',
  'ex.patterns.find': 'avoid-false-signal',
  'ex.patterns.scenario': 'confirm',
  'ex.patterns.identify-figure': 'recognize',
};

function withTarget(ex: Exercise): Exercise {
  if (ex.target) return ex; // exercices directionnels : cible déjà posée
  const conceptId = SKILL_CONCEPT_ID[ex.skillId];
  const kind = EXERCISE_OBJECTIVE[ex.id];
  if (!conceptId || !kind) return ex;
  return { ...ex, target: { conceptId, objectiveId: objectiveId(conceptId, kind) } };
}

/** Chaque exercice porte une cible pédagogique (conceptId + objectiveId). */
const EXERCISES: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(RAW_EXERCISES).map(([skillId, list]) => [skillId, list.map(withTarget)]),
);

/** Objectifs réellement exerçables d'un concept = ceux ciblés par au moins un exercice. */
export function exercisableObjectiveIds(conceptId: string): string[] {
  const set = new Set<string>();
  for (const list of Object.values(EXERCISES)) {
    for (const ex of list) {
      if (ex.target?.conceptId === conceptId) set.add(ex.target.objectiveId);
    }
  }
  return [...set];
}

/** Variantes d'exercice qui adressent un objectif donné (même cible, formulations différentes). */
export function exerciseVariantsForObjective(objectiveId: string): Exercise[] {
  const out: Exercise[] = [];
  for (const list of Object.values(EXERCISES)) {
    for (const ex of list) {
      if (ex.target?.objectiveId === objectiveId) out.push(ex);
    }
  }
  return out;
}

/**
 * Choisit une variante pour un objectif selon le round de rotation. La remédiation
 * peut réutiliser une cible échouée tout en proposant une variante DIFFÉRENTE
 * lorsqu'il en existe plusieurs (le round avance à chaque session, même échouée).
 */
export function pickVariant(objectiveId: string, round: number): Exercise | undefined {
  const vs = exerciseVariantsForObjective(objectiveId);
  if (!vs.length) return undefined;
  return vs[((Math.trunc(round) % vs.length) + vs.length) % vs.length];
}

// ─── Modules guidés (registre canonique) ─────────────────────────────
// LOT 4-M — source UNIQUE décrivant chaque module guidé : ses compétences ordonnées et son
// checkpoint PROPRE (jamais partagé). `GUIDED_MODULES` (learningMap) en dérive. Ajouter un module =
// ajouter une entrée ici (+ ses LESSONS/EXERCISES) ; le moteur (checkpoint, résolution des
// compétences, carte) est piloté par ce registre, sans dépendance au checkpoint Fondations global.
// Le checkpoint réunit quelques exercices de chaque compétence de SON module ; les exercices gardent
// leur skillId réel → répondre met à jour la maîtrise réelle.
export const CHECKPOINT_ID = 'checkpoint.read-chart';
export const CHECKPOINT_TITLE = 'Revue — Lire un graphique';

export interface ModuleContent {
  id: string;
  title: string;
  worldId: string;
  /** Compétences ordonnées du module. */
  skills: Skill[];
  /** Checkpoint PROPRE au module (jamais partagé entre modules). */
  checkpointId: string;
  checkpointTitle: string;
}

/** Registre canonique des modules guidés (source unique ; `GUIDED_MODULES` en dérive). */
export const CONTENT_MODULES: ModuleContent[] = [
  {
    id: 'module.foundations.read-chart',
    title: 'Lire un graphique',
    worldId: 'world.foundations',
    skills: SKILLS,
    checkpointId: CHECKPOINT_ID,
    checkpointTitle: CHECKPOINT_TITLE,
  },
  // LOT 4-M — 2e module guidé réel : « Lire les chandeliers » (monde 3, world.candles). Checkpoint
  // PROPRE (`checkpoint.candles`), jamais partagé avec Fondations. Les 13 autres mondes restent des
  // collections de notions (aucun module guidé) jusqu'à un lot dédié.
  {
    id: CANDLE_MODULE_ID,
    title: CANDLE_MODULE_TITLE,
    worldId: CANDLE_MODULE_WORLD_ID,
    skills: CANDLE_SKILLS,
    checkpointId: CANDLE_CHECKPOINT_ID,
    checkpointTitle: CANDLE_CHECKPOINT_TITLE,
  },
  // LOT 4-N — 3e module guidé réel : « Lire la structure » (monde 4, world.structure). Checkpoint
  // PROPRE (`checkpoint.structure`). Les 12 autres mondes restent des collections de notions.
  {
    id: STRUCTURE_MODULE_ID,
    title: STRUCTURE_MODULE_TITLE,
    worldId: STRUCTURE_MODULE_WORLD_ID,
    skills: STRUCTURE_SKILLS,
    checkpointId: STRUCTURE_CHECKPOINT_ID,
    checkpointTitle: STRUCTURE_CHECKPOINT_TITLE,
  },
  // LOT 4-O — 4e module guidé réel : « Lire les niveaux » (monde 5, world.support-resistance).
  // Trois compétences (le monde compte trois concepts réels — aucun objectif inventé).
  {
    id: SR_MODULE_ID,
    title: SR_MODULE_TITLE,
    worldId: SR_MODULE_WORLD_ID,
    skills: SR_SKILLS,
    checkpointId: SR_CHECKPOINT_ID,
    checkpointTitle: SR_CHECKPOINT_TITLE,
  },
  // LOT 4-P — 5e module guidé réel : « Lire un graphique de près » (monde 2, world.anatomy).
  // Le monde 2 devient guidé : il ne se « termine » plus par la seule lecture des fiches.
  {
    id: ANATOMY_MODULE_ID,
    title: ANATOMY_MODULE_TITLE,
    worldId: ANATOMY_MODULE_WORLD_ID,
    skills: ANATOMY_SKILLS,
    checkpointId: ANATOMY_CHECKPOINT_ID,
    checkpointTitle: ANATOMY_CHECKPOINT_TITLE,
  },
  // LOT 4-Q — 6e module guidé réel : « Lire les figures » (monde 6, world.patterns).
  // Quatre familles ancrées sur des concepts réels ; les 9 autres figures restent des fiches.
  {
    id: PATTERNS_MODULE_ID,
    title: PATTERNS_MODULE_TITLE,
    worldId: PATTERNS_MODULE_WORLD_ID,
    skills: PATTERNS_SKILLS,
    checkpointId: PATTERNS_CHECKPOINT_ID,
    checkpointTitle: PATTERNS_CHECKPOINT_TITLE,
  },
];

/** Toutes les compétences, tous modules guidés confondus (résolution du moteur, compteurs, persistance). */
export const ALL_MODULE_SKILLS: Skill[] = CONTENT_MODULES.flatMap((m) => m.skills);
const CHECKPOINT_IDS = new Set(CONTENT_MODULES.map((m) => m.checkpointId));
/** Module dont l'id fourni est le checkpoint (sinon undefined). */
function moduleByCheckpoint(id: string): ModuleContent | undefined {
  return CONTENT_MODULES.find((m) => m.checkpointId === id);
}
/** Compétences d'un module par son id (fiche Monde / carte de parcours). */
export function skillsForModule(moduleId: string): Skill[] {
  return CONTENT_MODULES.find((m) => m.id === moduleId)?.skills ?? [];
}
/** Un id est-il un checkpoint (de N'IMPORTE quel module) ? */
export function isCheckpoint(id: string): boolean {
  return CHECKPOINT_IDS.has(id);
}

// ─── Helpers de contenu ──────────────────────────────────────────────
export function getLessons(skillId: string): Lesson[] {
  return LESSONS[skillId] ?? [];
}
export function getExercises(skillId: string): Exercise[] {
  const mod = moduleByCheckpoint(skillId);
  if (mod) return mod.skills.flatMap((s) => (EXERCISES[s.id] ?? []).slice(0, 2));
  return EXERCISES[skillId] ?? [];
}

/**
 * Checkpoint tournant d'UN module : `perSkill` exercices de chaque compétence du module, la fenêtre
 * tournant avec `round` (round 0 = comportement historique). Chaque module a son propre checkpoint,
 * donc plusieurs objectifs de CE module sont couverts à chaque passage.
 */
export function checkpointExercises(checkpointId: string, round = 0, perSkill = 2): Exercise[] {
  const mod = moduleByCheckpoint(checkpointId);
  if (!mod) return [];
  return buildCheckpoint(
    mod.skills.map((s) => EXERCISES[s.id] ?? []),
    perSkill,
    round,
  );
}

/**
 * Sélection tournante d'une session de compétence : au lieu des premiers `count`
 * figés, une page déterministe qui avance avec `round` (round 0 = historique).
 * Un checkpoint est délégué à `checkpointExercises` du module correspondant.
 */
export function rotatedExercises(skillId: string, count: number, round = 0): Exercise[] {
  const mod = moduleByCheckpoint(skillId);
  if (mod) return checkpointExercises(skillId, round, Math.max(1, Math.floor(count / mod.skills.length) || 2));
  return rotateExercises(EXERCISES[skillId] ?? [], count, round);
}
export function skillById(id: string): Skill | undefined {
  const mod = moduleByCheckpoint(id);
  if (mod) return { id: mod.checkpointId, name: mod.checkpointTitle };
  return ALL_MODULE_SKILLS.find((s) => s.id === id);
}
export function allLessons(): Lesson[] {
  return ALL_MODULE_SKILLS.flatMap((s) => getLessons(s.id));
}

// ─── Pont compétence → fiche concept V5 ──────────────────────────────
// Relie chaque compétence du parcours à une fiche concept riche (avec VisualCard),
// pour le lien « Découvrir la notion » du parcours. Slugs présents dans V5_CONCEPTS.
export const CONCEPT_BY_SKILL: Record<string, string> = {
  'skill.actions': 'marche-et-prix',
  'skill.trend': 'tendance-haussiere',
  'skill.candles': 'anatomie-bougie',
  'skill.patterns': 'double-creux',
  // LOT 4-M — lien « Découvrir la notion » des compétences Chandeliers vers leur fiche concept.
  ...CANDLE_SKILL_CONCEPT_SLUG,
  ...STRUCTURE_SKILL_CONCEPT_SLUG,
  ...SR_SKILL_CONCEPT_SLUG,
  ...ANATOMY_SKILL_CONCEPT_SLUG,
  ...PATTERNS_SKILL_CONCEPT_SLUG,
};
export function conceptSlugForSkill(id: string): string | undefined {
  return CONCEPT_BY_SKILL[id];
}

export const DEMO_PATTERN: Pattern = {
  id: 'pattern.double-bottom',
  slug: 'double-creux',
  name: 'Double Creux',
  aliases: ['Double Bottom', 'W'],
  family: 'double_top_bottom',
  direction: 'bullish',
  difficulty: 'beginner',
  definition: 'Deux creux à un niveau proche séparés par un rebond, formant un « W ». Une figure de retournement potentiellement haussière.',
  recognitionRules: ['Deux creux à un niveau similaire.', 'Un sommet intermédiaire (ligne de cou).', 'Une cassure au-dessus de la ligne de cou confirme.'],
  invalidationRules: ['Le prix casse nettement sous le second creux.', 'Aucune cassure de la ligne de cou : figure non confirmée.'],
  commonMistakes: ['Anticiper avant la cassure de la ligne de cou.'],
  sources: ['WMB — Figures chartistes : Double Creux'],
  status: 'approved',
};

// ─── Rétro-compat (P0.1/P0.2) ────────────────────────────────────────
export const DEMO_SKILL: Skill = SKILLS[0];
export const DEMO_LESSONS: Lesson[] = getLessons('skill.actions');
export const DEMO_EXERCISES: Exercise[] = getExercises('skill.actions');

/** Progression par défaut : une entrée par compétence de CHAQUE module guidé. */
export function defaultProgress(now: number): ProgressState {
  const skills = Object.fromEntries(ALL_MODULE_SKILLS.map((s) => [s.id, initialProgress(s.id, now)]));
  return {
    onboarded: false,
    level: 1,
    totalXp: 0,
    streakDays: 0,
    coins: 0,
    completedSkills: [],
    skills,
    daily: { date: '', sessions: 0, correct: 0, xp: 0 },
    claimedQuestIds: [],
    claimedStreakMilestones: [],
    history: [],
    learning: emptyLearning(),
    schemaVersion: PROGRESS_SCHEMA_VERSION,
  };
}
