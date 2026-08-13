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
import {
  INDICATORS_SKILLS,
  INDICATORS_MODULE_ID,
  INDICATORS_MODULE_TITLE,
  INDICATORS_MODULE_WORLD_ID,
  INDICATORS_CHECKPOINT_ID,
  INDICATORS_CHECKPOINT_TITLE,
  INDICATORS_MODULE_EXERCISES_BY_SKILL,
  INDICATORS_SKILL_CONCEPT_ID,
  INDICATORS_SKILL_CONCEPT_SLUG,
} from './indicatorsModuleScenarios';
import {
  VOLUME_SKILLS,
  VOLUME_MODULE_ID,
  VOLUME_MODULE_TITLE,
  VOLUME_MODULE_WORLD_ID,
  VOLUME_CHECKPOINT_ID,
  VOLUME_CHECKPOINT_TITLE,
  VOLUME_MODULE_EXERCISES_BY_SKILL,
  VOLUME_SKILL_CONCEPT_ID,
  VOLUME_SKILL_CONCEPT_SLUG,
} from './volumeModuleScenarios';
import {
  PRICEACTION_SKILLS,
  PRICEACTION_MODULE_ID,
  PRICEACTION_MODULE_TITLE,
  PRICEACTION_MODULE_WORLD_ID,
  PRICEACTION_CHECKPOINT_ID,
  PRICEACTION_CHECKPOINT_TITLE,
  PRICEACTION_MODULE_EXERCISES_BY_SKILL,
  PRICEACTION_SKILL_CONCEPT_ID,
  PRICEACTION_SKILL_CONCEPT_SLUG,
} from './priceActionModuleScenarios';
import {
  RISK_SKILLS,
  RISK_MODULE_ID,
  RISK_MODULE_TITLE,
  RISK_MODULE_WORLD_ID,
  RISK_CHECKPOINT_ID,
  RISK_CHECKPOINT_TITLE,
  RISK_MODULE_EXERCISES_BY_SKILL,
  RISK_SKILL_CONCEPT_ID,
  RISK_SKILL_CONCEPT_SLUG,
} from './riskModuleScenarios';
import {
  PSYCHOLOGY_SKILLS,
  PSYCHOLOGY_MODULE_ID,
  PSYCHOLOGY_MODULE_TITLE,
  PSYCHOLOGY_MODULE_WORLD_ID,
  PSYCHOLOGY_CHECKPOINT_ID,
  PSYCHOLOGY_CHECKPOINT_TITLE,
  PSYCHOLOGY_MODULE_EXERCISES_BY_SKILL,
  PSYCHOLOGY_SKILL_CONCEPT_ID,
  PSYCHOLOGY_SKILL_CONCEPT_SLUG,
} from './psychologyModuleScenarios';
import {
  FOUNDATIONS_SKILLS,
  FOUNDATIONS_MODULE_EXERCISES_BY_SKILL,
  FOUNDATIONS_SKILL_CONCEPT_ID,
  FOUNDATIONS_SKILL_CONCEPT_SLUG,
} from './foundationsModuleScenarios';
import {
  SMC_SKILLS,
  SMC_MODULE_ID,
  SMC_MODULE_TITLE,
  SMC_MODULE_WORLD_ID,
  SMC_CHECKPOINT_ID,
  SMC_CHECKPOINT_TITLE,
  SMC_MODULE_EXERCISES_BY_SKILL,
  SMC_SKILL_CONCEPT_ID,
  SMC_SKILL_CONCEPT_SLUG,
} from './smcModuleScenarios';
import {
  WYCKOFF_SKILLS,
  WYCKOFF_MODULE_ID,
  WYCKOFF_MODULE_TITLE,
  WYCKOFF_MODULE_WORLD_ID,
  WYCKOFF_CHECKPOINT_ID,
  WYCKOFF_CHECKPOINT_TITLE,
  WYCKOFF_MODULE_EXERCISES_BY_SKILL,
  WYCKOFF_SKILL_CONCEPT_ID,
  WYCKOFF_SKILL_CONCEPT_SLUG,
} from './wyckoffModuleScenarios';
import {
  OPTIONS_SKILLS,
  OPTIONS_MODULE_ID,
  OPTIONS_MODULE_TITLE,
  OPTIONS_MODULE_WORLD_ID,
  OPTIONS_CHECKPOINT_ID,
  OPTIONS_CHECKPOINT_TITLE,
  OPTIONS_MODULE_EXERCISES_BY_SKILL,
  OPTIONS_SKILL_CONCEPT_ID,
  OPTIONS_SKILL_CONCEPT_SLUG,
} from './optionsModuleScenarios';
import {
  FALSESIGNALS_SKILLS,
  FALSESIGNALS_MODULE_ID,
  FALSESIGNALS_MODULE_TITLE,
  FALSESIGNALS_MODULE_WORLD_ID,
  FALSESIGNALS_CHECKPOINT_ID,
  FALSESIGNALS_CHECKPOINT_TITLE,
  FALSESIGNALS_MODULE_EXERCISES_BY_SKILL,
  FALSESIGNALS_SKILL_CONCEPT_ID,
  FALSESIGNALS_SKILL_CONCEPT_SLUG,
} from './falseSignalsModuleScenarios';

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
  // LOT C8 — les deux notions du monde 1 qui ne se lisent pas sur un graphique : elles se
  // CALCULENT. Elles rejoignent le module existant plutôt que d'en former un second : la
  // complétion d'un monde est pilotée par SON module et SON checkpoint, un par monde.
  ...FOUNDATIONS_SKILLS,
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
        { id: 's0', kind: 'intro', body: 'Deux façons de financer une entreprise, deux positions très différentes : en devenir copropriétaire, ou lui prêter de l’argent.' },
        { id: 's1', kind: 'explain', body: 'Une action te rend copropriétaire. Une obligation est une dette : l’entreprise te doit de l’argent, tu n’en es pas propriétaire.' },
        { id: 's2', kind: 'example', body: 'Actionnaire : tu votes en assemblée et tu peux recevoir un dividende, sans garantie. Obligataire : tu perçois un intérêt convenu et le capital est remboursé à l’échéance — sauf défaut.' },
        { id: 's3', kind: 'falseSignal', body: 'Croire qu’une obligation est « sans risque » est un piège : un émetteur peut faire défaut, et la valeur d’une obligation bouge avec les taux.' },
        { id: 's4', kind: 'summary', body: 'Action = part (risque + potentiel). Obligation = prêt (plus prévisible, remboursé).' },
        { id: 's5', kind: 'flashcard', flashcard: { front: 'Action ou obligation : laquelle fait de toi un créancier ?', back: 'L’obligation — tu prêtes. L’action fait de toi un copropriétaire.' } },
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
        { id: 's0', kind: 'intro', body: 'Certains niveaux reviennent sans cesse : le prix y bute, rebondit, y revient. Ce sont les repères de lecture les plus utiles d’un graphique.' },
        { id: 's1', kind: 'observe', body: 'Cherche un niveau touché PLUSIEURS fois : sous le prix (plancher) ou au-dessus (plafond). Un seul contact ne fait pas une zone.' },
        { id: 's2', kind: 'visual', conceptRef: 'support-resistance' },
        { id: 's3', kind: 'explain', body: 'Le support est un plancher où les acheteurs reviennent. La résistance est un plafond où les vendeurs reprennent la main.' },
        { id: 's4', kind: 'hypothesis', conceptRef: 'support-resistance', body: 'Tant que le niveau tient à la clôture, la zone reste valide ; une clôture franche au-delà l’invalide.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'support-resistance' },
        { id: 's5', kind: 'falseSignal', body: 'Une mèche qui dépasse le niveau puis revient n’est pas une cassure : c’est souvent un balayage. On lit la clôture, pas l’extrême.' },
        { id: 's6', kind: 'summary', body: 'Ce sont des zones de mémoire du marché : des repères, pas des garanties.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui valide une zone de support ou de résistance ?', back: 'Plusieurs contacts, pas un seul — et c’est la clôture qui tranche, jamais la mèche.' } },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'support-resistance' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'rsi' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'changement-de-caractere' },
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
        { id: 's0', kind: 'intro', body: 'Une bougie tient en quatre nombres : ouverture, plus haut, plus bas, clôture. Savoir les lire, c’est savoir lire n’importe quel graphique.' },
        { id: 's1', kind: 'observe', body: 'Repère d’abord le corps (la partie épaisse), puis les deux mèches : jusqu’où le prix est monté, jusqu’où il est descendu.' },
        { id: 's2', kind: 'visual', conceptRef: 'anatomie-bougie' },
        { id: 's3', kind: 'explain', body: 'Corps = distance ouverture↔clôture. Mèche haute = plus haut. Mèche basse = plus bas.' },
        { id: 's4', kind: 'hypothesis', conceptRef: 'anatomie-bougie', body: 'Le corps donne le sens de la période ; les mèches racontent ce que le marché a refusé.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'anatomie-bougie' },
        { id: 's5', kind: 'falseSignal', body: 'Un grand corps ne dit rien de la suite : c’est le contexte (niveau, structure) qui donne son sens à la bougie.' },
        { id: 's6', kind: 'summary', body: 'Une longue mèche traduit souvent un rejet de prix : le marché y est allé puis en est revenu — à confirmer avec le contexte.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Que raconte une longue mèche ?', back: 'Un rejet : le prix est allé jusque-là puis en est revenu avant la clôture.' } },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'marteau' },
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
        { id: 'sMan', kind: 'interaction', chartSeed: 314 },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'double-creux' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'triangle-ascendant' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'drapeau-haussier' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'marubozu' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'marteau' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'doji' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'avalement-haussier' },
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
  // ─── LOT C2 — La figure MIROIR (world.candles) ──────────────────────
  'skill.candle.mirror': [
    {
      id: 'lesson.candle-mirror',
      slug: 'avalement-baissier-miroir',
      title: 'La figure miroir : le même geste, à l’envers',
      skillId: 'skill.candle.mirror',
      objective: 'Transposer l’avalement à la baisse et retrouver son invalidation, qui change de côté.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Tu viens d’apprendre l’avalement haussier. Sa version baissière a exactement la même géométrie — et une invalidation à l’opposé.' },
        { id: 's1', kind: 'observe', body: 'Cherche une petite bougie haussière suivie d’une grande bougie baissière dont le corps recouvre le précédent, après une hausse.' },
        { id: 's2', kind: 'visual', conceptRef: 'avalement-baissier' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'avalement-baissier', body: 'La figure pose une hypothèse de bascule vers les vendeurs : elle se joue sous le plus bas de l’englobement, pas avant.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'avalement-baissier' },
        { id: 's4', kind: 'explain', body: 'L’englobement montre que les vendeurs ont repris la main. Le réflexe à corriger est celui de l’invalidation : sur un setup baissier, elle se place AU-DESSUS du plus haut de la figure.' },
        { id: 's5', kind: 'falseSignal', body: 'Un englobement seulement partiel, ou une figure isolée loin de toute résistance, n’est pas une bascule.' },
        { id: 's6', kind: 'summary', body: 'Avalement baissier = englobement après une hausse ; confirmation sous le plus bas de l’englobement ; invalidation au-dessus du plus haut de la figure.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Où se place l’invalidation d’un avalement baissier ?', back: 'Au-dessus du plus haut de la figure — l’inverse du cas haussier.' } },
      ],
      commonMistake: 'Placer l’invalidation sous la figure par réflexe haussier, et surveiller le mauvais côté du graphique.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT C4 — La même forme, l'autre histoire (world.candles) ───────
  'skill.candle.context': [
    {
      id: 'lesson.candle-context',
      slug: 'pendu-contexte',
      title: 'Le contexte décide',
      skillId: 'skill.candle.context',
      objective: 'Distinguer marteau et pendu, de forme identique, par ce qui les précède.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le pendu a EXACTEMENT la forme du marteau : petit corps en haut, longue mèche basse. Seul ce qui le précède change son sens.' },
        { id: 's1', kind: 'observe', body: 'Regarde d’abord ce qui vient AVANT la bougie : une baisse, ou une hausse ?' },
        { id: 's2', kind: 'visual', conceptRef: 'pendu' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'pendu', body: 'Après une hausse, la même silhouette devient un avertissement baissier : elle se joue sous le corps, pas avant.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'pendu' },
        { id: 's4', kind: 'explain', body: 'La confirmation est un passage sous le corps du pendu. Et comme le setup est baissier, l’invalidation se place AU-DESSUS de son plus haut — l’inverse du marteau.' },
        { id: 's5', kind: 'falseSignal', body: 'En pleine impulsion, loin de toute résistance, un pendu a peu de portée.' },
        { id: 's6', kind: 'summary', body: 'Marteau et pendu : même forme, contexte opposé. Le pendu se confirme sous son corps et s’invalide au-dessus de son plus haut.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Marteau ou pendu ?', back: 'Même forme ; le contexte décide : marteau après une baisse, pendu après une hausse.' } },
      ],
      commonMistake: 'Lire la forme avant le contexte, et traiter un pendu comme un marteau.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.candle.rejection-high': [
    {
      id: 'lesson.candle-rejection-high',
      slug: 'etoile-filante-rejet',
      title: 'Le rejet par le haut',
      skillId: 'skill.candle.rejection-high',
      objective: 'Lire une étoile filante : longue mèche haute après une hausse, près d’une résistance.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une longue mèche vers le haut raconte un rejet des prix hauts : les acheteurs ont poussé, puis ont perdu le terrain gagné.' },
        { id: 's1', kind: 'observe', body: 'Cherche un petit corps en bas surmonté d’une longue mèche, après une hausse et près d’une résistance.' },
        { id: 's2', kind: 'visual', conceptRef: 'etoile-filante' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'etoile-filante', body: 'Le rejet pose une hypothèse de plafond : elle se joue sous le plus bas de la bougie, pas avant.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'etoile-filante' },
        { id: 's4', kind: 'explain', body: 'La confirmation est un passage sous le plus bas de l’étoile filante ; l’invalidation, le setup étant baissier, se place au-dessus du plus haut de la mèche.' },
        { id: 's5', kind: 'falseSignal', body: 'Sans résistance à proximité, ou avec un volume trop faible pour appuyer le rejet, la figure pèse peu.' },
        { id: 's6', kind: 'summary', body: 'Étoile filante = rejet des prix hauts après une hausse ; confirmation sous son plus bas ; invalidation au-dessus de sa mèche.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Que montre une étoile filante ?', back: 'Un rejet des prix hauts après une hausse — un plafond possible, à confirmer sous son plus bas.' } },
      ],
      commonMistake: 'Valider le rejet sur la seule longueur de la mèche, sans résistance ni participation.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.candle.rejection-low': [
    {
      id: 'lesson.candle-rejection-low',
      slug: 'marteau-inverse-autre-histoire',
      title: 'Le même rejet, l’autre histoire',
      skillId: 'skill.candle.rejection-low',
      objective: 'Comprendre que le marteau inversé, de forme identique à l’étoile filante, est HAUSSIER.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Tu viens de lire une étoile filante. Voici exactement la même silhouette — mais après une BAISSE. Tout change.' },
        { id: 's1', kind: 'observe', body: 'Petit corps en bas, longue mèche haute, au contact d’un support, après une baisse prolongée.' },
        { id: 's2', kind: 'visual', conceptRef: 'marteau-inverse' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'marteau-inverse', body: 'Après une baisse, la même bougie devient un TEST de retournement haussier : elle se joue au-dessus de son plus haut.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'marteau-inverse' },
        { id: 's4', kind: 'explain', body: 'Retiens la règle plutôt que la silhouette : deux bougies de forme identique n’ont ni la même confirmation ni la même invalidation. Ici, le setup est haussier — donc l’invalidation se place EN BAS, sous la bougie.' },
        { id: 's5', kind: 'falseSignal', body: 'Sans support ni confirmation, la mèche haute traduit surtout un rejet des prix hauts.' },
        { id: 's6', kind: 'summary', body: 'Marteau inversé = étoile filante après une baisse ; confirmation au-dessus de son plus haut ; invalidation sous la bougie.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Marteau inversé ou étoile filante ?', back: 'Même forme ; marteau inversé après une baisse (haussier), étoile filante après une hausse (baissier).' } },
      ],
      commonMistake: 'Déduire l’invalidation de la forme de la bougie plutôt que du sens du setup.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT C9 — Le rapport entre deux bougies : contenance et niveau partagé ──
  'skill.candle.containment': [
    {
      id: 'lesson.candle-containment',
      slug: 'harami-bougie-contenue',
      title: 'La bougie contenue',
      skillId: 'skill.candle.containment',
      objective: 'Lire un harami comme un RALENTISSEMENT, et non comme un retournement annoncé.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Tu sais lire une bougie, un bloc de deux, une séquence de trois. Voici la dernière façon : le RAPPORT entre deux bougies voisines.' },
        { id: 's1', kind: 'observe', body: 'Une grande bougie qui étend la tendance. Puis une petite, dont le corps tient ENTIÈREMENT dans celui de la précédente.' },
        { id: 's2', kind: 'visual', conceptRef: 'harami' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'harami', body: 'Une séance qui ne dépasse plus la précédente a cessé d’avancer. Le harami ne dit pas « ça se retourne » — il dit « ça ralentit ».' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'harami' },
        { id: 's4', kind: 'explain', body: 'Harami et avalement sont la même relation lue à l’envers : ici la seconde bougie est CONTENUE, là elle CONTIENT. Et comme le harami n’annonce aucun sens, c’est la sortie de la petite bougie qui le donnera.' },
        { id: 's5', kind: 'falseSignal', body: 'En plein milieu d’une impulsion forte, une pause d’une seule séance ne signifie pas grand-chose.' },
        { id: 's6', kind: 'summary', body: 'Harami = petite bougie contenue dans le corps de la grande. Ralentissement, pas retournement ; la sortie donne le sens ; la reprise de la tendance d’origine l’annule.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Harami ou avalement ?', back: 'Même relation, sens inverse : dans le harami la seconde bougie est contenue, dans l’avalement elle englobe la première.' } },
      ],
      commonMistake: 'Lire un harami comme l’annonce d’un retournement, alors qu’il ne donne aucune direction.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.candle.twin-level': [
    {
      id: 'lesson.candle-twin-level',
      slug: 'pincettes-meme-extreme',
      title: 'Le même extrême, deux fois',
      skillId: 'skill.candle.twin-level',
      objective: 'Comprendre que ce sont des pincettes qui désignent un NIVEAU, pas une forme de bougie.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Toutes les figures vues jusqu’ici se lisent dans la forme des bougies. Celle-ci se lit dans un PRIX.' },
        { id: 's1', kind: 'observe', body: 'Deux séances voisines qui s’arrêtent exactement au même plus haut. Elles dessinent une ligne horizontale.' },
        { id: 's2', kind: 'visual', conceptRef: 'pincettes' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'pincettes', body: 'Peu importe à quoi ressemblent ces deux bougies : ce qui compte, c’est qu’elles butent deux fois au même endroit. Le marché y a rencontré quelque chose.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'pincettes' },
        { id: 's4', kind: 'explain', body: 'Le double test montre que le niveau EXISTE — pas qu’il tiendra. C’est la sortie du niveau qui donne le sens. Et l’invalidation est un franchissement FRANC : quelques centimes au-dessus, c’est souvent la mèche qui va chercher les invalidations trop serrées.' },
        { id: 's5', kind: 'falseSignal', body: 'Des pincettes au milieu de nulle part, sans niveau déjà visible avant elles, ne testent rien du tout.' },
        { id: 's6', kind: 'summary', body: 'Pincettes = deux bougies qui butent au même prix. C’est le niveau qui parle ; il doit préexister ; la sortie décide.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui fait des pincettes ?', back: 'Deux extrêmes au MÊME prix, sur un niveau qui existait déjà — pas la forme des deux bougies.' } },
      ],
      commonMistake: 'Repérer des pincettes n’importe où, sans vérifier que le niveau comptait avant elles.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT C6 — La séquence : la lecture passe d'une bougie à trois, et l'ordre décide ──
  'skill.candle.sequence-reversal': [
    {
      id: 'lesson.candle-sequence-reversal',
      slug: 'etoile-du-matin-trois-temps',
      title: 'Le retournement en trois temps',
      skillId: 'skill.candle.sequence-reversal',
      objective: 'Lire une étoile du matin comme une SÉQUENCE de trois bougies dont l’ordre porte le sens.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Jusqu’ici, une bougie suffisait à poser une question. Ici il en faut trois — et si tu les lis dans le désordre, tu lis une autre figure.' },
        { id: 's1', kind: 'observe', body: 'Une baisse est en cours. Première bougie baissière. Puis une toute petite bougie : le mouvement s’arrête. Puis une haussière qui remonte dans le corps de la première.' },
        { id: 's2', kind: 'visual', conceptRef: 'etoile-du-matin' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'etoile-du-matin', body: 'Ce n’est pas la troisième bougie qui fait le retournement, c’est la PAUSE du milieu : elle marque le moment où la baisse cesse d’avancer.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'etoile-du-matin' },
        { id: 's4', kind: 'explain', body: 'La confirmation se prend au-dessus du plus haut de la troisième bougie. L’invalidation se place sous le plus bas de la FIGURE — les trois bougies ensemble, pas la dernière seule.' },
        { id: 's5', kind: 'falseSignal', body: 'Une troisième bougie faible, qui ne reprend rien du corps de la première, laisse la figure sans contenu : la pause n’a débouché sur rien.' },
        { id: 's6', kind: 'summary', body: 'Étoile du matin = baissière, indécision, haussière, dans cet ordre, après une baisse. Lue à l’envers, c’est une étoile du soir — la figure miroir, baissière.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui distingue l’étoile du matin de l’étoile du soir ?', back: 'Les mêmes trois temps, dans l’ordre inverse : matin = baissière/indécision/haussière après une baisse ; soir = haussière/indécision/baissière après une hausse.' } },
      ],
      commonMistake: 'Chercher la figure dans la dernière bougie, alors que c’est la petite bougie du milieu qui la constitue.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.candle.sequence-momentum': [
    {
      id: 'lesson.candle-sequence-momentum',
      slug: 'trois-soldats-poussee',
      title: 'La poussée en trois temps',
      skillId: 'skill.candle.sequence-momentum',
      objective: 'Distinguer une poussée de trois bougies du même sens d’un essoufflement de fin de mouvement.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Trois bougies encore — mais cette fois elles vont toutes dans le MÊME sens. Il n’y a pas de pause au milieu : ce n’est pas un retournement, c’est une poussée.' },
        { id: 's1', kind: 'observe', body: 'Trois bougies haussières consécutives, chacune clôturant plus haut que la précédente, avec des mèches courtes.' },
        { id: 's2', kind: 'visual', conceptRef: 'trois-soldats' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'trois-soldats', body: 'La même séquence ne dit pas la même chose selon l’endroit : au départ d’un mouvement, c’est une poussée ; après une hausse déjà étirée, c’est un essoufflement.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'trois-soldats' },
        { id: 's4', kind: 'explain', body: 'La confirmation se prend au-dessus de la CLÔTURE de la troisième, pas de son plus haut : ce sont les corps qui portent la conviction. L’invalidation se place sous le corps de la PREMIÈRE des trois — on est revenu au point de départ.' },
        { id: 's5', kind: 'falseSignal', body: 'De longues mèches hautes sur les trois bougies trahissent un rejet à chaque séance, malgré des clôtures en hausse.' },
        { id: 's6', kind: 'summary', body: 'Trois soldats = trois bougies du même sens, lues APRÈS avoir situé où l’on se trouve dans le mouvement. Les trois corbeaux sont la séquence miroir, baissière.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Où se lit d’abord une séquence de trois soldats ?', back: 'Dans le contexte : début de mouvement (poussée) ou hausse déjà étirée (essoufflement). La forme se lit ensuite.' } },
      ],
      commonMistake: 'Prendre trois bougies haussières de suite pour un signal d’autant plus fort que la hausse dure déjà.',
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'tendance-haussiere' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'tendance-baissiere' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'range' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'cassure-de-structure' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'support-resistance' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'polarite-flip' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'retest-de-niveau' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'anatomie-bougie' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'unite-de-temps' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'echelle-des-prix' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'double-creux' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'triangle-ascendant' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'drapeau-haussier' },
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
        { id: 'sMan', kind: 'interaction', conceptRef: 'epaule-tete-epaule' },
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
  // ─── LOT C2 — La figure MIROIR (world.patterns) ─────────────────────
  'skill.patterns.mirror': [
    {
      id: 'lesson.patterns-mirror',
      slug: 'double-sommet-miroir',
      title: 'La figure miroir : le double, retourné',
      skillId: 'skill.patterns.mirror',
      objective: 'Transposer le double creux à la baisse et retrouver son invalidation, qui change de côté.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le double sommet est le miroir baissier du double creux : deux plafonds au lieu de deux planchers, un « M » au lieu d’un « W ».' },
        { id: 's1', kind: 'observe', body: 'Cherche deux sommets à un niveau proche, séparés par un creux intermédiaire : c’est lui, la ligne de cou.' },
        { id: 's2', kind: 'visual', conceptRef: 'double-sommet' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'double-sommet', body: 'Deux échecs au même plafond posent une hypothèse de retournement : elle se joue sous la ligne de cou, pas avant.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'double-sommet' },
        { id: 's4', kind: 'explain', body: 'La confirmation est une clôture SOUS la ligne de cou. Le réflexe à corriger est l’invalidation : elle se place AU-DESSUS des sommets.' },
        { id: 's5', kind: 'falseSignal', body: 'Une cassure de la ligne de cou sans participation, suivie d’un retour au-dessus, était un faux signal.' },
        { id: 's6', kind: 'summary', body: 'Double sommet = deux plafonds + ligne de cou ; confirmation sous la ligne de cou ; invalidation au-dessus des sommets.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Où se place l’invalidation d’un double sommet ?', back: 'Au-dessus des deux sommets — l’inverse du double creux.' } },
      ],
      commonMistake: 'Anticiper avant la cassure de la ligne de cou, ou placer l’invalidation sous la figure par réflexe de double creux.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT C3 — Les trois miroirs restants (world.patterns) ───────────
  'skill.patterns.triangle-mirror': [
    {
      id: 'lesson.patterns-triangle-mirror',
      slug: 'triangle-descendant-miroir',
      title: 'Le triangle, retourné',
      skillId: 'skill.patterns.triangle-mirror',
      objective: 'Lire un triangle descendant et placer son invalidation du bon côté.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Tu as appris le triangle ascendant : résistance plate, creux qui montent. Le descendant en est l’exact opposé — et son invalidation change de côté.' },
        { id: 's1', kind: 'observe', body: 'Cherche un support horizontal testé plusieurs fois, surmonté de sommets de plus en plus bas.' },
        { id: 's2', kind: 'visual', conceptRef: 'triangle-descendant' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'triangle-descendant', body: 'La compression pose une hypothèse de résolution vers le bas : elle se joue sous le support, pas avant.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'triangle-descendant' },
        { id: 's4', kind: 'explain', body: 'La confirmation est une clôture sous le support, idéalement retestée par le dessous. L’invalidation, elle, se place AU-DESSUS de la ligne des sommets descendants.' },
        { id: 's5', kind: 'falseSignal', body: 'Une fausse cassure sous le support, sans participation et aussitôt annulée, n’était pas une résolution.' },
        { id: 's6', kind: 'summary', body: 'Triangle descendant = support plat + sommets descendants ; confirmation sous le support ; invalidation au-dessus de la ligne des sommets.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Où s’invalide un triangle descendant ?', back: 'Au-dessus de la ligne des sommets descendants — le setup est baissier, l’invalidation est en haut.' } },
      ],
      commonMistake: 'Confondre la zone de confirmation (sous le support) et la zone d’invalidation (au-dessus des sommets).',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.patterns.flag-mirror': [
    {
      id: 'lesson.patterns-flag-mirror',
      slug: 'drapeau-baissier-miroir',
      title: 'Le drapeau, retourné',
      skillId: 'skill.patterns.flag-mirror',
      objective: 'Lire un drapeau baissier et placer son invalidation du bon côté.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le drapeau baissier est le miroir du haussier : un mât vers le bas, puis un canal qui remonte doucement à contre-sens.' },
        { id: 's1', kind: 'observe', body: 'Cherche une chute rapide et nette, suivie d’une remontée lente et étroite qui n’efface pas le mouvement.' },
        { id: 's2', kind: 'visual', conceptRef: 'drapeau-baissier' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'drapeau-baissier', body: 'La pause pose une hypothèse de continuation : elle se joue sous le bas du drapeau, pas avant.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'drapeau-baissier' },
        { id: 's4', kind: 'explain', body: 'La confirmation est un passage sous le bas du drapeau. L’invalidation se place AU-DESSUS du haut du drapeau : au-delà, la pause devient un retournement.' },
        { id: 's5', kind: 'falseSignal', body: 'Sans mât net, il n’y a pas de drapeau ; et une cassure sans suivi laisse la figure en suspens.' },
        { id: 's6', kind: 'summary', body: 'Drapeau baissier = mât vers le bas + canal remontant ; confirmation sous le bas du drapeau ; invalidation au-dessus de son haut.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Où s’invalide un drapeau baissier ?', back: 'Au-dessus du haut du drapeau — le canal a alors rendu son mât.' } },
      ],
      commonMistake: 'Prendre toute remontée lente après une baisse pour un drapeau, sans vérifier le mât.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.patterns.reversal-mirror': [
    {
      id: 'lesson.patterns-reversal-mirror',
      slug: 'etei-inversee-miroir',
      title: 'Le retournement, retourné',
      skillId: 'skill.patterns.reversal-mirror',
      objective: 'Lire une ÉTÉ inversée et comprendre que, HAUSSIÈRE, elle s’invalide vers le bas.',
      difficulty: 'intermediate',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Tu viens de voir deux miroirs baissiers, invalidés vers le haut. Celui-ci est HAUSSIER — et sa règle d’invalidation s’inverse avec lui.' },
        { id: 's1', kind: 'observe', body: 'Cherche trois creux successifs après une baisse, celui du milieu nettement plus bas que les deux autres.' },
        { id: 's2', kind: 'visual', conceptRef: 'etei-inversee' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'etei-inversee', body: 'La figure pose une hypothèse de retournement à la hausse : elle se joue au-dessus de la ligne de cou, pas avant.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'etei-inversee' },
        { id: 's4', kind: 'explain', body: 'La leçon des trois miroirs tient en une phrase : l’invalidation se place TOUJOURS du côté opposé au sens du setup. Baissier, elle est en haut ; haussier, elle est en bas — ici, sous la tête.' },
        { id: 's5', kind: 'falseSignal', body: 'Des épaules très asymétriques brouillent la lecture, et une cassure sans suivi laisse la figure en suspens.' },
        { id: 's6', kind: 'summary', body: 'ÉTÉ inversée = trois creux, tête au milieu ; confirmation au-dessus de la ligne de cou ; invalidation sous la tête.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'De quel côté se place une invalidation ?', back: 'Du côté opposé au sens du setup : en haut pour un setup baissier, en bas pour un setup haussier.' } },
      ],
      commonMistake: 'Appliquer « retournement = invalidation en haut » sans regarder le SENS de la figure.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT C7 — La pente ment, et une figure n'annonce rien ──
  'skill.patterns.wedge': [
    {
      id: 'lesson.patterns-wedge',
      slug: 'biseau-ascendant-pente-ment',
      title: 'Quand la pente ment',
      skillId: 'skill.patterns.wedge',
      objective: 'Lire un biseau ascendant comme une figure BAISSIÈRE, malgré ses deux droites qui montent.',
      difficulty: 'advanced',
      estimatedMinutes: 7,
      steps: [
        { id: 's0', kind: 'intro', body: 'Jusqu’ici, une figure qui monte se lisait à la hausse. Celle-ci monte — et se lit à la baisse. C’est la première fois que le dessin te trompe.' },
        { id: 's1', kind: 'observe', body: 'Deux droites qui montent toutes les deux. Regarde l’écart entre elles : il se resserre. Chaque poussée gagne moins de terrain que la précédente.' },
        { id: 's2', kind: 'visual', conceptRef: 'biseau-ascendant' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'biseau-ascendant', body: 'Ce n’est pas la pente qui parle, c’est la CONVERGENCE : une hausse qui a besoin de plus en plus d’efforts pour gagner de moins en moins est une hausse qui s’essouffle.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'biseau-ascendant' },
        { id: 's4', kind: 'explain', body: 'Le biseau se confirme SOUS la droite basse cassée — donc à l’opposé de sa pente. Et comme le setup est baissier, son invalidation se place en HAUT, cette fois dans le sens de la pente. Rien ne se déduit du dessin ; tout se déduit du sens.' },
        { id: 's5', kind: 'falseSignal', body: 'Une fausse cassure suivie d’un retour dans le biseau annule la lecture — le resserrement continue.' },
        { id: 's6', kind: 'summary', body: 'Biseau ascendant = deux droites montantes qui convergent. Lecture baissière ; confirmation sous la droite basse ; invalidation par le haut.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui distingue un biseau d’un canal ?', back: 'Le canal a deux droites parallèles, le biseau des droites qui convergent — et c’est cette convergence qui donne le sens, pas la pente.' } },
      ],
      commonMistake: 'Déduire le sens de la pente : « ça monte, donc c’est haussier ».',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.patterns.wedge-mirror': [
    {
      id: 'lesson.patterns-wedge-mirror',
      slug: 'biseau-descendant-miroir',
      title: 'La pente ment dans les deux sens',
      skillId: 'skill.patterns.wedge-mirror',
      objective: 'Vérifier que la règle « la convergence prime la pente » vaut aussi pour un biseau descendant, donc HAUSSIER.',
      difficulty: 'advanced',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Si tu as retenu « un biseau est baissier », tu as retenu un cas, pas une règle. Voici le même dessin inversé.' },
        { id: 's1', kind: 'observe', body: 'Deux droites qui descendent toutes les deux, et qui se resserrent. Chaque vague de baisse perd de l’ampleur.' },
        { id: 's2', kind: 'visual', conceptRef: 'biseau-descendant' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'biseau-descendant', body: 'Même raisonnement, sens opposé : une baisse dont chaque vague faiblit est une baisse qui s’essouffle. La lecture est donc HAUSSIÈRE.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'biseau-descendant' },
        { id: 's4', kind: 'explain', body: 'Confirmation au-dessus de la droite haute, avec retest. Invalidation en BAS, puisque le setup est haussier. Les deux biseaux se lisent chacun à l’inverse de leur pente — c’est la règle, et elle vaut dans les deux sens.' },
        { id: 's5', kind: 'falseSignal', body: 'Une sortie haute sans participation, aussitôt annulée, ne confirme rien.' },
        { id: 's6', kind: 'summary', body: 'Biseau descendant = deux droites descendantes qui convergent. Lecture haussière ; confirmation au-dessus de la droite haute ; invalidation en bas.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Un biseau est-il une figure baissière ?', back: 'Non. C’est une figure qui se lit à l’INVERSE de sa pente : ascendant donc baissier, descendant donc haussier.' } },
      ],
      commonMistake: 'Retenir « biseau = baissier » au lieu de « biseau = à l’inverse de sa pente ».',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.patterns.no-direction': [
    {
      id: 'lesson.patterns-no-direction',
      slug: 'triangle-symetrique-sans-direction',
      title: 'La figure sans direction',
      skillId: 'skill.patterns.no-direction',
      objective: 'Comprendre qu’une figure peut ne donner aucun sens — et que c’est alors la sortie qui décide.',
      difficulty: 'advanced',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Toutes les figures vues jusqu’ici annoncent un sens. Celle-ci n’en annonce aucun — et ce n’est pas un défaut de lecture, c’est ce qu’elle est.' },
        { id: 's1', kind: 'observe', body: 'Des sommets de plus en plus bas, des creux de plus en plus hauts. Aucune des deux bornes n’est plate : les deux camps cèdent du terrain en même temps.' },
        { id: 's2', kind: 'visual', conceptRef: 'triangle-symetrique' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'triangle-symetrique', body: 'Le triangle ascendant a une résistance plate, le descendant un support plat — et cette borne plate donne le sens. Ici il n’y en a pas : personne ne domine.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'triangle-symetrique' },
        { id: 's4', kind: 'explain', body: 'La figure ne donne pas une direction, elle donne un NIVEAU DE DÉCISION. Reconnaître ne suffit plus : il faut attendre la sortie confirmée d’une des deux droites, clôture puis retest. Et comme elle n’a pas de sens propre, elle n’a pas de côté d’invalidation : elle s’invalide par un RETOUR DEDANS.' },
        { id: 's5', kind: 'falseSignal', body: 'Une sortie sans participation, suivie d’un retour dans le triangle, ne décide rien — et n’annonce pas non plus la sortie opposée.' },
        { id: 's6', kind: 'summary', body: 'Triangle symétrique = sommets descendants ET creux montants, sans borne plate. Aucun sens propre ; la sortie confirmée le donne ; le retour dedans l’annule.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Où est le sens d’un triangle symétrique ?', back: 'Nulle part dans la figure : il vient de la sortie confirmée, dans un sens ou dans l’autre.' } },
      ],
      commonMistake: 'Attendre de la figure une direction qu’elle ne donne pas, et deviner le sens avant la sortie.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT C10 — La forme du chemin, et le niveau qui s'use ──
  'skill.patterns.curvature': [
    {
      id: 'lesson.patterns-curvature',
      slug: 'tasse-anse-forme-du-chemin',
      title: 'La forme du chemin',
      skillId: 'skill.patterns.curvature',
      objective: 'Lire la COURBURE d’un creux — un U se digère, un V rebondit — et non seulement ses extrémités.',
      difficulty: 'advanced',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Toutes les figures vues jusqu’ici se définissent par des points ou des lignes. Celle-ci se définit par la FORME du chemin entre deux points.' },
        { id: 's1', kind: 'observe', body: 'Un creux large et arrondi, en U, qui ramène le prix à son point de départ. Puis un petit repli juste sous ce bord : l’anse.' },
        { id: 's2', kind: 'visual', conceptRef: 'tasse-anse' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'tasse-anse', body: 'Un U met du temps : les vendeurs se sont écoulés progressivement. Un V est brutal : rien ne s’est digéré, seul un choc a renvoyé le prix vers le haut.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'tasse-anse' },
        { id: 's4', kind: 'explain', body: 'La confirmation se prend au-dessus du bord supérieur de la tasse. L’invalidation, elle, se place sous le creux de l’ANSE — pas sous le fond de la tasse, qui est bien trop loin.' },
        { id: 's5', kind: 'falseSignal', body: 'Une tasse en V, trop brutale, n’a rien digéré : la même remontée n’a pas la même valeur.' },
        { id: 's6', kind: 'summary', body: 'Tasse = creux arrondi revenu à son bord, puis anse. Confirmation au-dessus du bord ; invalidation sous l’anse ; un V n’est pas un U.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Pourquoi un creux en V ne vaut-il pas un creux en U ?', back: 'Parce que rien ne s’y est digéré : le U étale l’écoulement des vendeurs, le V n’est qu’un choc.' } },
      ],
      commonMistake: 'Ne regarder que les extrémités du creux, en ignorant la forme du chemin entre elles.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.patterns.tested-level': [
    {
      id: 'lesson.patterns-tested-level',
      slug: 'triple-creux-niveau-use',
      title: 'Le niveau trop testé',
      skillId: 'skill.patterns.tested-level',
      objective: 'Comprendre qu’un plancher sollicité trop souvent s’use, au lieu de se renforcer.',
      difficulty: 'advanced',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Tu connais le double creux. Voici le même niveau tenu une fois de plus. L’intuition dit « encore plus solide ». Elle a tort.' },
        { id: 's1', kind: 'observe', body: 'Trois creux qui s’arrêtent au même niveau, reliés par deux rebonds intermédiaires.' },
        { id: 's2', kind: 'visual', conceptRef: 'triple-creux' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'triple-creux', body: 'À chaque passage, les acheteurs présents à ce niveau se servent — et il en reste moins. Un plancher n’est pas un mur : c’est un stock qui se vide.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'triple-creux' },
        { id: 's4', kind: 'explain', body: 'Le nombre de tests ne confirme rien. Seul le franchissement de la ligne de cou confirme la figure ; l’invalidation reste une clôture sous le triple plancher.' },
        { id: 's5', kind: 'falseSignal', body: 'Le troisième test est souvent celui qui cède — c’est ce que dit la fiche elle-même, et c’est exactement le contraire de ce qu’on croit.' },
        { id: 's6', kind: 'summary', body: 'Triple creux = trois creux au même niveau. Confirmation au-dessus de la ligne de cou ; invalidation sous le plancher ; et plus un niveau est testé, plus il s’use.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Un plancher testé trois fois est-il plus solide ?', back: 'Non : chaque test consomme les acheteurs présents au niveau. Le troisième est souvent celui qui cède.' } },
      ],
      commonMistake: 'Croire qu’un niveau se renforce à chaque test, alors qu’il s’épuise.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-R — Module guidé « Lire les indicateurs » (world.indicators) ──
  'skill.indicators.rsi': [
    {
      id: 'lesson.indicators-rsi',
      slug: 'rsi-lecture',
      title: 'Le RSI : la force relative, pas un ordre',
      skillId: 'skill.indicators.rsi',
      objective: 'Lire le RSI, ses zones extrêmes et ses limites.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Sous le prix, une courbe bornée entre 0 et 100 : le RSI. Elle résume la force relative des hausses et des baisses récentes.' },
        { id: 's1', kind: 'observe', body: 'Repère les deux seuils de référence : 70 (zone de surachat) et 30 (zone de survente).' },
        { id: 's2', kind: 'visual', conceptRef: 'rsi' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'rsi', body: 'Un extrême n’est pas un signal : c’est un repère de contexte, à confirmer par la structure de prix.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'rsi' },
        { id: 's4', kind: 'falseSignal', body: 'En pleine tendance haussière, agir sur un simple « surachat » est le piège classique : le RSI peut rester longtemps à l’extrême.' },
        { id: 's5', kind: 'summary', body: 'RSI = oscillateur borné 0–100 ; 70/30 sont des repères de contexte, jamais des ordres — la structure confirme.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Que signifie un RSI au-dessus de 70 ?', back: 'Une zone de surachat : un repère de contexte à confirmer par la structure — pas un signal automatique.' } },
      ],
      commonMistake: 'Traiter 70/30 comme des ordres automatiques.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.indicators.macd': [
    {
      id: 'lesson.indicators-macd',
      slug: 'macd-lecture',
      title: 'Le MACD : l’élan, en retard',
      skillId: 'skill.indicators.macd',
      objective: 'Lire le MACD (ligne, signal, histogramme) et son retard.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le MACD mesure l’élan : l’écart entre une moyenne rapide et une lente, complété d’une ligne de signal et d’un histogramme.' },
        { id: 's1', kind: 'observe', body: 'Repère les deux lignes (MACD et signal) et l’histogramme qui matérialise leur écart.' },
        { id: 's2', kind: 'visual', conceptRef: 'macd' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'macd' },
        { id: 's3', kind: 'explain', body: 'Croisements et passage par zéro sont des repères d’élan — fondé sur des moyennes, le MACD retarde le prix. Si le prix contredit franchement le signal, le signal est invalidé.' },
        { id: 's4', kind: 'falseSignal', body: 'En range, les croisements se multiplient sans tendance derrière : c’est le faux signal classique du MACD.' },
        { id: 's5', kind: 'summary', body: 'MACD = élan par moyennes (retardé) ; croisements = repères, jamais des ordres — le prix prime.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Pourquoi le MACD est-il dit « retardé » ?', back: 'Fondé sur des moyennes, il suit le prix : ses signaux arrivent après le mouvement.' } },
      ],
      commonMistake: 'Traiter chaque croisement comme un ordre d’entrée.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.indicators.bollinger': [
    {
      id: 'lesson.indicators-bollinger',
      slug: 'bollinger-lecture',
      title: 'Les bandes de Bollinger : respirer avec la volatilité',
      skillId: 'skill.indicators.bollinger',
      objective: 'Lire compression et expansion — sans signal automatique.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une moyenne encadrée de deux bandes à ±2 écarts-types : les bandes de Bollinger mesurent la volatilité, pas la direction.' },
        { id: 's1', kind: 'observe', body: 'Repère le resserrement des bandes (compression, faible volatilité) puis leur écartement (expansion).' },
        { id: 's2', kind: 'visual', conceptRef: 'bandes-de-bollinger' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'bandes-de-bollinger', body: 'Une sortie de compression est une hypothèse : elle se confirme avec la structure — une sortie aussitôt annulée est une fausse sortie.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'bandes-de-bollinger' },
        { id: 's4', kind: 'falseSignal', body: 'En tendance, le prix peut « marcher » le long d’une bande : chaque contact de bande n’est pas un signal de retour vers la moyenne.' },
        { id: 's5', kind: 'summary', body: 'Bollinger = volatilité (compression/expansion) ; le contact d’une bande n’est jamais un signal automatique — la structure confirme.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Que signale un resserrement des bandes ?', back: 'Une compression : la volatilité baisse — la sortie éventuelle reste à confirmer par la structure.' } },
      ],
      commonMistake: 'Prendre le contact d’une bande pour un signal automatique de retour.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.indicators.divergence': [
    {
      id: 'lesson.indicators-divergence',
      slug: 'divergence-lecture',
      title: 'La divergence : quand le prix et l’oscillateur se contredisent',
      skillId: 'skill.indicators.divergence',
      objective: 'Lire un désaccord prix/oscillateur comme essoufflement à confirmer.',
      difficulty: 'advanced',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le prix fait des plus-hauts croissants, l’oscillateur des plus-hauts décroissants : les deux séries ne racontent plus la même histoire.' },
        { id: 's1', kind: 'observe', body: 'Compare les pivots du prix et ceux de l’oscillateur : cherche un désaccord de sens.' },
        { id: 's2', kind: 'visual', conceptRef: 'divergence' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'divergence', body: 'L’élan faiblit sous la surface — mais ce n’est qu’un essoufflement POSSIBLE, jamais un signal isolé.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'divergence' },
        { id: 's4', kind: 'explain', body: 'La divergence se confirme par la structure (cassure d’un creux) ; si le prix poursuit et que l’oscillateur repart avec lui, le désaccord est effacé.' },
        { id: 's5', kind: 'falseSignal', body: 'Prendre chaque divergence pour un retournement imminent est le piège classique : beaucoup s’effacent sans suite.' },
        { id: 's6', kind: 'summary', body: 'Divergence = désaccord de pivots prix/oscillateur ; hypothèse d’essoufflement, confirmée par la structure seulement.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui confirme une divergence baissière ?', back: 'La structure : la cassure d’un creux — jamais l’oscillateur seul.' } },
      ],
      commonMistake: 'Entrer sur la seule divergence, sans confirmation de structure.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-S — Module guidé « Lire le volume » (world.volume) ──────
  'skill.volume.participation': [
    {
      id: 'lesson.volume-participation',
      slug: 'volume-lecture',
      title: 'Le volume : qui participe au mouvement ?',
      skillId: 'skill.volume.participation',
      objective: 'Lire le volume comme mesure de participation, jamais comme signal.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Sous chaque bougie, une barre : la quantité échangée sur la période. C’est le volume — la participation au mouvement.' },
        { id: 's1', kind: 'observe', body: 'Compare les barres : lesquelles ressortent ? Sur quels mouvements ?' },
        { id: 's2', kind: 'visual', conceptRef: 'volume' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'volume', body: 'Un mouvement accompagné (volume élevé) n’a pas le même poids qu’un mouvement désert — mais le volume ne donne jamais la direction.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'volume' },
        { id: 's4', kind: 'falseSignal', body: 'Une cassure sur volume faible est souvent suivie d’un retour : le faux départ classique.' },
        { id: 's5', kind: 'summary', body: 'Volume = participation par période ; il crédibilise une cassure AVEC la structure, il ne prédit rien seul.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Que mesure le volume ?', back: 'La quantité échangée par période : la participation au mouvement — jamais sa direction.' } },
      ],
      commonMistake: 'Lire le volume comme un signal directionnel.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.volume.vwap': [
    {
      id: 'lesson.volume-vwap',
      slug: 'vwap-lecture',
      title: 'Le VWAP : la moyenne qui pèse le volume',
      skillId: 'skill.volume.vwap',
      objective: 'Lire le VWAP comme repère intraday — jamais comme un ordre.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le VWAP est le prix moyen de la séance, pondéré par le volume : là où la séance a « vraiment » échangé.' },
        { id: 's1', kind: 'observe', body: 'Situe le prix par rapport à la ligne : au-dessus, en dessous, ou en train d’y revenir ?' },
        { id: 's2', kind: 'visual', conceptRef: 'vwap' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'vwap', body: 'La lecture se joue à la RÉACTION du prix autour du VWAP, avec la structure de la séance — pas au simple contact.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'vwap' },
        { id: 's4', kind: 'falseSignal', body: 'Traiter chaque contact du VWAP comme un ordre d’entrée est le piège classique : c’est un repère, pas un déclencheur.' },
        { id: 's5', kind: 'summary', body: 'VWAP = moyenne pondérée par le volume ; repère de séance dont la lecture se confirme par la réaction du prix.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce que le VWAP ?', back: 'Le prix moyen d’une séance pondéré par le volume : un repère intraday, jamais un ordre.' } },
      ],
      commonMistake: 'Prendre chaque contact du VWAP pour un déclencheur.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.volume.profile': [
    {
      id: 'lesson.volume-profile',
      slug: 'profil-de-volume-lecture',
      title: 'Le profil de volume : la mémoire des niveaux',
      skillId: 'skill.volume.profile',
      objective: 'Repérer le POC et lire les paliers échangés comme des zones de mémoire.',
      difficulty: 'advanced',
      estimatedMinutes: 6,
      steps: [
        { id: 's0', kind: 'intro', body: 'Au lieu de compter les échanges par période, le profil les répartit par NIVEAU de prix : où le marché a-t-il le plus échangé ?' },
        { id: 's1', kind: 'observe', body: 'Repère le palier le plus fourni de l’histogramme : c’est le POC. Note aussi les zones désertes.' },
        { id: 's2', kind: 'visual', conceptRef: 'profil-de-volume' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'profil-de-volume', body: 'Un palier très échangé est une zone de mémoire : on y ATTEND une réaction — on ne la présume jamais acquise.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'profil-de-volume' },
        { id: 's4', kind: 'explain', body: 'La lecture se confirme à la réaction du prix sur le palier ; si le prix l’ignore et le traverse franchement, la lecture d’appui est invalidée.' },
        { id: 's5', kind: 'falseSignal', body: 'Un POC lu sur une période trop courte est un repère fragile : le piège classique du profil.' },
        { id: 's6', kind: 'summary', body: 'Profil = échanges par niveau ; POC = palier dominant ; confirmé par la réaction, invalidé par la traversée franche.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Qu’est-ce que le POC d’un profil de volume ?', back: 'Le palier de prix le plus échangé de la période : une zone de mémoire du marché, pas une promesse.' } },
      ],
      commonMistake: 'Lire un POC sur une période trop courte.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-T — Module guidé « Lire la price action » (world.price-action) ──
  'skill.priceaction.reading': [
    {
      id: 'lesson.priceaction-reading',
      slug: 'price-action-lecture',
      title: 'Le prix nu : zones, structure, réactions',
      skillId: 'skill.priceaction.reading',
      objective: 'Lire le comportement du prix avant tout indicateur.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Pas d’indicateur ici : seulement le prix. Ses zones de réaction et sa structure racontent déjà l’essentiel.' },
        { id: 's1', kind: 'observe', body: 'Repère les zones où le prix a déjà réagi, puis la structure (sommets et creux).' },
        { id: 's2', kind: 'visual', conceptRef: 'price-action' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'price-action', body: 'Une bougie ne se lit JAMAIS isolément : c’est sa position — sur quelle zone, dans quelle structure — qui lui donne son sens.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'price-action' },
        { id: 's4', kind: 'falseSignal', body: 'Interpréter une bougie sans regarder où elle se situe est le piège classique de la price action.' },
        { id: 's5', kind: 'summary', body: 'Price action = zones + structure + réactions ; la confirmation vient de la réaction du prix aux niveaux.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Que lit la price action ?', back: 'Le prix lui-même : ses zones de réaction et sa structure — avant tout indicateur.' } },
      ],
      commonMistake: 'Interpréter une bougie sans regarder où elle se situe.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.priceaction.wick': [
    {
      id: 'lesson.priceaction-wick',
      slug: 'meche-de-rejet-lecture',
      title: 'La mèche de rejet : repoussé de la zone',
      skillId: 'skill.priceaction.wick',
      objective: 'Lire une longue mèche comme un rejet — sur une zone seulement.',
      difficulty: 'intermediate',
      estimatedMinutes: 4,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une longue mèche raconte une bataille : le prix a exploré une zone… et en a été repoussé.' },
        { id: 's1', kind: 'observe', body: 'Repère la longue mèche, puis vérifie OÙ elle se produit : sur une zone connue ?' },
        { id: 's2', kind: 'visual', conceptRef: 'meche-de-rejet' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'meche-de-rejet', body: 'Le rejet ne vaut que par sa zone : une longue mèche en plein vide n’est que du bruit.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'meche-de-rejet' },
        { id: 's4', kind: 'falseSignal', body: 'Longue mèche sans zone : bruit plutôt que rejet — le piège classique.' },
        { id: 's5', kind: 'summary', body: 'Mèche longue + zone connue = rejet à surveiller ; mèche sans zone = bruit.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Quand une longue mèche est-elle un rejet ?', back: 'Quand elle se produit sur une zone connue — sans zone, c’est du bruit.' } },
      ],
      commonMistake: 'Prendre toute longue mèche pour un rejet, où qu’elle soit.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.priceaction.impulse': [
    {
      id: 'lesson.priceaction-impulse',
      slug: 'impulsion-correction-lecture',
      title: 'Impulsion et correction : le rythme du prix',
      skillId: 'skill.priceaction.impulse',
      objective: 'Distinguer la poussée (impulsion) de la respiration (correction).',
      difficulty: 'intermediate',
      estimatedMinutes: 4,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le prix n’avance pas en ligne droite : il pousse (impulsion), puis respire (correction), puis pousse encore.' },
        { id: 's1', kind: 'observe', body: 'Repère la poussée dynamique, puis le repli plus lent et contenu qui la suit.' },
        { id: 's2', kind: 'visual', conceptRef: 'impulsion-et-correction' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'impulsion-et-correction', body: 'Tant que la correction reste partielle, le rythme tient. Une correction trop profonde raconte autre chose.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'impulsion-et-correction' },
        { id: 's4', kind: 'falseSignal', body: 'Confondre une correction profonde avec une simple respiration est le piège classique du rythme.' },
        { id: 's5', kind: 'summary', body: 'Impulsion = poussée ; correction = respiration contenue ; l’ampleur relative se surveille toujours.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Impulsion vs correction ?', back: 'La poussée dynamique vs la respiration plus lente et contenue qui la suit.' } },
      ],
      commonMistake: 'Confondre une correction profonde avec une simple respiration.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-U — Module guidé « Gérer le risque » (world.risk) ───────
  'skill.risk.reward': [
    {
      id: 'lesson.risk-reward',
      slug: 'risque-rendement-lecture',
      title: 'Risque et rendement : comparer avant d’entrer',
      skillId: 'skill.risk.reward',
      objective: 'Comparer la distance au stop à la distance à la cible — avant l’entrée.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Un scénario éducatif a trois repères : l’entrée théorique, le stop (l’invalidation) et l’objectif pédagogique. Deux distances à comparer.' },
        { id: 's1', kind: 'observe', body: 'Mesure la distance entrée→stop (le risque), puis entrée→cible (le rendement visé).' },
        { id: 's2', kind: 'visual', conceptRef: 'risque-rendement' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'risque-rendement', body: 'Le rapport se lit AVANT l’entrée : le stop borne la perte, la cible situe le rendement — jamais l’inverse.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'risque-rendement' },
        { id: 's4', kind: 'falseSignal', body: 'Élargir le stop après coup pour « laisser une chance » fait exploser le risque prévu : le piège classique.' },
        { id: 's5', kind: 'summary', body: 'Risque = entrée→stop ; rendement = entrée→cible ; la comparaison se fait avant, le stop ne bouge pas après.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Que compare le rapport risque/rendement ?', back: 'La distance entrée→stop (le risque) à la distance entrée→cible (le rendement visé) — avant l’entrée.' } },
      ],
      commonMistake: 'Élargir le stop après coup pour « laisser une chance ».',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.risk.stop': [
    {
      id: 'lesson.risk-stop',
      slug: 'stop-loss-lecture',
      title: 'Le stop : l’invalidation qui borne la perte',
      skillId: 'skill.risk.stop',
      objective: 'Placer un stop comme niveau d’invalidation, défini avant l’entrée.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le stop n’est pas une punition : c’est le niveau qui, franchi, annule l’idée — et borne la perte à un montant décidé à l’avance.' },
        { id: 's1', kind: 'observe', body: 'Repère le creux structurel sous l’entrée théorique : c’est là que l’idée serait invalidée.' },
        { id: 's2', kind: 'visual', conceptRef: 'stop-loss' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'stop-loss', body: 'Le stop se définit AVANT l’entrée, sur la structure — s’il est touché, l’idée est abandonnée, point.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'stop-loss' },
        { id: 's4', kind: 'falseSignal', body: 'Déplacer le stop plus loin pour éviter d’être sorti fait dérailler le risque prévu : le piège classique.' },
        { id: 's5', kind: 'summary', body: 'Stop = invalidation structurelle définie avant l’entrée ; touché → idée abandonnée, perte limitée.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Quand le stop se définit-il ?', back: 'AVANT l’entrée, sur la structure — et il ne se déplace pas après coup.' } },
      ],
      commonMistake: 'Déplacer le stop plus loin pour éviter d’être sorti.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.risk.sizing': [
    {
      id: 'lesson.risk-sizing',
      slug: 'taille-de-position-lecture',
      title: 'La taille de position : le risque décide, pas l’envie',
      skillId: 'skill.risk.sizing',
      objective: 'Dimensionner une position depuis le risque accepté et la distance au stop.',
      difficulty: 'intermediate',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'La taille ne se choisit pas à l’envie : elle se CALCULE — risque accepté (une petite part du capital) divisé par la distance au stop.' },
        { id: 's1', kind: 'observe', body: 'Compare deux scénarios éducatifs : même risque accepté, stops à des distances différentes — les tailles diffèrent.' },
        { id: 's2', kind: 'visual', conceptRef: 'taille-de-position' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'taille-de-position', body: 'Plus le stop est loin, plus la taille est petite — à risque constant. La méthode ne change jamais.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'taille-de-position' },
        { id: 's4', kind: 'falseSignal', body: 'Doubler la taille après des pertes pour « se refaire » (revenge trading) est le piège le plus coûteux.' },
        { id: 's5', kind: 'summary', body: 'Taille = risque accepté ÷ distance au stop ; gains ou pertes récentes n’y changent rien.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Comment se calcule la taille de position ?', back: 'Risque accepté (petite part du capital) divisé par la distance entrée→stop.' } },
      ],
      commonMistake: 'Doubler la taille après des pertes pour « se refaire ».',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-V — Module guidé « Déjouer ses biais » (world.psychology) ─
  'skill.psychology.fomo': [
    {
      id: 'lesson.psychology-fomo',
      slug: 'fomo-lecture',
      title: 'Le FOMO : entrer trop tard coûte cher',
      skillId: 'skill.psychology.fomo',
      objective: 'Reconnaître le FOMO et le désamorcer par un plan préparé à l’avance.',
      difficulty: 'intermediate',
      estimatedMinutes: 4,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le FOMO (peur de rater) pousse à entrer parce que « ça s’envole » — après l’accélération, près d’un extrême, sans plan.' },
        { id: 's1', kind: 'observe', body: 'Repère l’accélération déjà bien avancée, puis l’essoufflement qui suit souvent quand tout le monde est entré.' },
        { id: 's2', kind: 'visual', conceptRef: 'fomo' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'fomo', body: 'Le problème n’est pas le sens du mouvement : c’est l’entrée impulsive, sans plan ni invalidation.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'fomo' },
        { id: 's4', kind: 'falseSignal', body: 'Prendre l’accélération pour une invitation à entrer sans plan est le piège classique du FOMO.' },
        { id: 's5', kind: 'summary', body: 'FOMO = entrée tardive sur l’émotion ; la parade = un plan défini AVANT le mouvement, avec une invalidation claire.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce que le FOMO ?', back: 'La peur de rater un mouvement, qui pousse à entrer trop tard, sans plan ni invalidation.' } },
      ],
      commonMistake: 'Entrer près d’un extrême juste pour « ne pas rater ».',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.psychology.discipline': [
    {
      id: 'lesson.psychology-discipline',
      slug: 'discipline-lecture',
      title: 'Discipline : le processus prime sur l’issue',
      skillId: 'skill.psychology.discipline',
      objective: 'Comprendre pourquoi suivre un plan prime sur l’issue d’une seule idée.',
      difficulty: 'intermediate',
      estimatedMinutes: 4,
      steps: [
        { id: 's0', kind: 'intro', body: 'La discipline exécute un processus décidé à froid : contexte attendu, niveau, confirmation, invalidation et taille — pas l’émotion du moment.' },
        { id: 's1', kind: 'observe', body: 'Repère le contexte attendu par un plan : le niveau cassé, puis retesté — c’est LÀ que le plan prévoit d’agir.' },
        { id: 's2', kind: 'visual', conceptRef: 'discipline' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'discipline', body: 'Une idée isolée dépend du hasard ; c’est la qualité du processus, répété, qui compte.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'discipline' },
        { id: 's4', kind: 'falseSignal', body: 'Prendre une réussite chanceuse hors plan pour une bonne décision est le piège classique : le résultat ne valide pas le processus.' },
        { id: 's5', kind: 'summary', body: 'Décision = plan à froid + contexte + confirmation ; on juge le processus, jamais l’issue d’une seule idée.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Sur quoi juger une décision de trading ?', back: 'Sur la qualité du processus (le plan suivi), pas sur le résultat d’une seule idée.' } },
      ],
      commonMistake: 'Juger une décision sur son seul résultat plutôt que sur le processus.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT C8 — Module guidé « Ce que vaut une action » (world.foundations) ──
  'skill.foundations.dividend': [
    {
      id: 'lesson.foundations-dividend',
      slug: 'dividende-lecture',
      title: 'Le dividende',
      skillId: 'skill.foundations.dividend',
      objective: 'Comprendre ce qu’est un dividende, et pourquoi le cours s’ajuste le jour du détachement.',
      difficulty: 'beginner',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Tout le reste de Trademy t’apprend à lire un graphique. Cette notion-ci ne se lit pas : elle se calcule.' },
        { id: 's1', kind: 'observe', body: 'Une entreprise gagne de l’argent sur l’année. Elle en reverse une part à ses actionnaires, en cash. Le jour du versement, le cours baisse d’environ ce montant.' },
        { id: 's2', kind: 'visual', conceptRef: 'dividende' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'dividende', body: 'Cette baisse n’est pas une chute : c’est de l’argent qui a quitté l’entreprise pour aller dans la poche des actionnaires. Rien ne s’est perdu, tout a changé de place.' },
        { id: 's4', kind: 'explain', body: 'Le rendement du dividende rapporte le dividende au PRIX : 2 € versés sur une action à 50 €, c’est 4 %. Ce rapport a donc deux façons de monter — le dividende augmente, ou le cours baisse. La seconde est la plus fréquente, et la moins réjouissante.' },
        { id: 's5', kind: 'falseSignal', body: 'Un rendement très élevé traduit souvent un cours qui a chuté, avec un dividende affiché pas encore revu. Et un dividende peut être réduit ou supprimé si le bénéfice baisse.' },
        { id: 's6', kind: 'summary', body: 'Dividende = part du bénéfice reversée. Le cours s’ajuste au détachement. Rendement = dividende ÷ prix — regarde toujours lequel des deux a bougé.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Pourquoi un rendement du dividende très élevé doit-il alerter ?', back: 'Parce qu’il peut venir d’une chute du cours (le dénominateur), pas d’une hausse du dividende.' } },
      ],
      commonMistake: 'Lire un rendement élevé comme une bonne affaire, sans regarder pourquoi il est élevé.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.foundations.per': [
    {
      id: 'lesson.foundations-per',
      slug: 'per-lecture',
      title: 'Le PER',
      skillId: 'skill.foundations.per',
      objective: 'Calculer un PER et comprendre pourquoi ses extrêmes, bas comme haut, se lisent mal.',
      difficulty: 'beginner',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une action à 20 € est-elle chère ? La question n’a aucun sens seule. Il faut la rapporter à ce que l’entreprise gagne.' },
        { id: 's1', kind: 'observe', body: 'Prix de l’action : 20 €. Bénéfice par action : 2 € par an. On divise : 20 ÷ 2 = 10.' },
        { id: 's2', kind: 'visual', conceptRef: 'per' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'per', body: 'Ce 10 se lit comme un prix : tu paies dix euros pour un euro de bénéfice annuel. Autrement dit, environ dix années de bénéfices au rythme actuel.' },
        { id: 's4', kind: 'explain', body: 'Deux nombres, une division — mais les DEUX peuvent bouger. Un PER qui baisse peut venir d’un prix qui recule (le cas qu’on imagine) ou d’un bénéfice qui monte (bonne nouvelle)… ou d’un bénéfice qui s’effondre plus vite que le prix.' },
        { id: 's5', kind: 'falseSignal', body: 'Un PER très bas peut signaler un bénéfice en train de s’effondrer. Un PER très élevé peut être justifié par une croissance forte — ou par un excès d’optimisme.' },
        { id: 's6', kind: 'summary', body: 'PER = prix ÷ bénéfice par action. Il se lit en années de bénéfices. Ses extrêmes ne disent rien sans regarder LEQUEL des deux nombres les a produits.' },
        { id: 's7', kind: 'flashcard', flashcard: { front: 'Un PER bas signifie-t-il une action bon marché ?', back: 'Pas nécessairement : le rapport baisse aussi quand le bénéfice s’effondre. Il faut regarder le dénominateur.' } },
      ],
      commonMistake: 'Traiter le PER comme un verdict (« bas = pas cher ») au lieu d’un rapport dont les deux termes bougent.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-W — Module guidé « Lire le Smart Money » (world.smc) ─────
  'skill.smc.orderblock': [
    {
      id: 'lesson.smc-orderblock',
      slug: 'order-block-lecture',
      title: 'L’order block : une zone d’intérêt, pas un signal',
      skillId: 'skill.smc.orderblock',
      objective: 'Repérer la dernière bougie opposée avant une impulsion et la traiter en zone à surveiller.',
      difficulty: 'advanced',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Avant une forte impulsion, il reste souvent une dernière bougie de sens opposé : c’est l’order block — une zone que le prix revisite souvent.' },
        { id: 's1', kind: 'observe', body: 'Repère la forte impulsion, puis la dernière bougie opposée juste avant : c’est la zone à marquer.' },
        { id: 's2', kind: 'visual', conceptRef: 'order-block' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'order-block', body: 'La zone ne vaut que par la réaction OBSERVÉE du prix à son retour — avec la structure, jamais seule.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'order-block' },
        { id: 's4', kind: 'falseSignal', body: 'Traiter toute bougie précédant une hausse comme un order block « magique » est le piège classique.' },
        { id: 's5', kind: 'summary', body: 'Order block = dernière bougie opposée avant l’impulsion ; zone d’intérêt à surveiller ; traversée franche sans réaction = zone invalidée.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qu’un order block ?', back: 'La dernière bougie de sens opposé avant une forte impulsion — une zone d’intérêt éducative, jamais un signal.' } },
      ],
      commonMistake: 'Traiter toute bougie avant une hausse comme un order block « magique ».',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.smc.fvg': [
    {
      id: 'lesson.smc-fvg',
      slug: 'fair-value-gap-lecture',
      title: 'Le fair value gap : le vide laissé par l’impulsion',
      skillId: 'skill.smc.fvg',
      objective: 'Lire le déséquilibre à trois bougies et observer le comblement sans le présumer.',
      difficulty: 'advanced',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Une impulsion rapide laisse parfois un vide : entre le haut de la première bougie et le bas de la troisième, le prix n’a pas échangé — c’est le fair value gap.' },
        { id: 's1', kind: 'observe', body: 'Repère les trois bougies d’impulsion et le vide entre la première et la troisième.' },
        { id: 's2', kind: 'visual', conceptRef: 'fair-value-gap' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'fair-value-gap', body: 'Le comblement n’est jamais garanti : la zone s’observe, sa réaction se juge avec la structure.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'fair-value-gap' },
        { id: 's4', kind: 'falseSignal', body: 'Voir un FVG « décisif » dans le moindre petit gap sans impulsion est le piège classique.' },
        { id: 's5', kind: 'summary', body: 'FVG = déséquilibre à trois bougies ; zone d’intérêt ; éloignement durable sans comblement = hypothèse abandonnée.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Comment se définit un fair value gap ?', back: 'Un déséquilibre à trois bougies : le haut de la première est sous le bas de la troisième.' } },
      ],
      commonMistake: 'Voir un FVG « décisif » sur le moindre petit gap sans impulsion.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.smc.choch': [
    {
      id: 'lesson.smc-choch',
      slug: 'changement-de-caractere-lecture',
      title: 'Le CHoCH : premier signe de bascule, pas une preuve',
      skillId: 'skill.smc.choch',
      objective: 'Reconnaître la première cassure à contre-tendance et exiger la clôture au-delà du pivot.',
      difficulty: 'advanced',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Quand une séquence casse pour la première fois un pivot à CONTRE-tendance, le caractère du mouvement change : c’est le CHoCH — un premier signe, pas une bascule prouvée.' },
        { id: 's1', kind: 'observe', body: 'Suis la séquence de pivots, puis repère la première cassure à contre-tendance avec clôture au-delà.' },
        { id: 's2', kind: 'visual', conceptRef: 'changement-de-caractere' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'changement-de-caractere', body: 'La confirmation se cherche au-delà du pivot cassé, idéalement avec de la participation ; si la tendance initiale reprend franchement, le signe est invalidé.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'changement-de-caractere' },
        { id: 's4', kind: 'falseSignal', body: 'Une mèche qui perce le pivot sans clôture au-delà ressemble à une chasse aux stops — le piège classique.' },
        { id: 's5', kind: 'summary', body: 'CHoCH = première cassure contre-tendance ; clôture exigée ; reprise franche de la tendance = signe abandonné.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qu’un changement de caractère ?', back: 'La première cassure de structure à contre-tendance, qui remet en cause la séquence en cours.' } },
      ],
      commonMistake: 'Valider un CHoCH sur une mèche sans clôture au-delà du pivot.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.smc.demand': [
    {
      id: 'lesson.smc-demand',
      slug: 'zone-de-demande-lecture',
      title: 'La zone de demande : le support qui a une histoire',
      skillId: 'skill.smc.demand',
      objective: 'Identifier la zone d’où le prix est parti à la hausse et placer son invalidation sous la base.',
      difficulty: 'advanced',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Quand le prix part nettement à la hausse depuis une zone, cette base devient une zone de demande : un support à surveiller au prochain retour.' },
        { id: 's1', kind: 'observe', body: 'Repère le départ net à la hausse, puis délimite la base d’où il est parti.' },
        { id: 's2', kind: 'visual', conceptRef: 'zone-de-demande' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'zone-de-demande', body: 'La confirmation est le rejet observé dans le sens haussier ; une clôture franche SOUS la zone invalide le scénario — c’est un plancher qui se place.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'zone-de-demande' },
        { id: 's4', kind: 'falseSignal', body: 'Une zone déjà retestée plusieurs fois est affaiblie — la traiter comme neuve est le piège classique.' },
        { id: 's5', kind: 'summary', body: 'Demande = base d’un départ haussier net ; rejet haussier = confirmation ; clôture franche sous la zone = invalidation.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui invalide une zone de demande ?', back: 'Une clôture franche SOUS la zone : le plancher cède, le scénario éducatif s’abandonne.' } },
      ],
      commonMistake: 'Traiter une zone déjà retestée plusieurs fois comme une zone neuve.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.smc.supply': [
    {
      id: 'lesson.smc-supply',
      slug: 'zone-d-offre-lecture',
      title: 'La zone d’offre : la résistance qui a une histoire',
      skillId: 'skill.smc.supply',
      objective: 'Identifier la zone d’où le prix est parti à la baisse et reconnaître son invalidation au-dessus.',
      difficulty: 'advanced',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Quand le prix part nettement à la baisse depuis une zone, ce plafond devient une zone d’offre : une résistance à surveiller au prochain retour.' },
        { id: 's1', kind: 'observe', body: 'Repère le départ net à la baisse, puis délimite le plafond d’où il est parti.' },
        { id: 's2', kind: 'visual', conceptRef: 'zone-d-offre' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'zone-d-offre', body: 'La confirmation est le rejet observé dans le sens baissier ; une clôture franche AU-DESSUS de la zone invalide le scénario.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'zone-d-offre' },
        { id: 's4', kind: 'falseSignal', body: 'Comme pour la demande : une zone retestée plusieurs fois est affaiblie, pas renforcée.' },
        { id: 's5', kind: 'summary', body: 'Offre = plafond d’un départ baissier net ; rejet baissier = confirmation ; clôture franche au-dessus = invalidation.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui invalide une zone d’offre ?', back: 'Une clôture franche AU-DESSUS de la zone : le scénario baissier éducatif s’abandonne.' } },
      ],
      commonMistake: 'Croire qu’une zone d’offre devient plus fiable à chaque retest.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-X — Module guidé « Lire les phases Wyckoff » (world.wyckoff) ─
  'skill.wyckoff.accumulation': [
    {
      id: 'lesson.wyckoff-accumulation',
      slug: 'wyckoff-accumulation-lecture',
      title: 'L’accumulation : la base où l’offre s’épuise',
      skillId: 'skill.wyckoff.accumulation',
      objective: 'Lire une base en range comme accumulation possible et placer son invalidation sous la zone.',
      difficulty: 'advanced',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Après une baisse, le prix construit parfois une longue base en range : l’offre s’y épuise progressivement — c’est l’accumulation, souvent suivie d’une sortie par le haut.' },
        { id: 's1', kind: 'observe', body: 'Repère la longue base horizontale, ses bords (haut et bas), et l’épuisement des poussées baissières.' },
        { id: 's2', kind: 'visual', conceptRef: 'wyckoff-accumulation' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'wyckoff-accumulation', body: 'La sortie se confirme par le HAUT de la base, avec la structure et la participation ; une rupture par le BAS invalide le scénario.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'wyckoff-accumulation' },
        { id: 's4', kind: 'falseSignal', body: 'La fausse sortie par le haut, aussitôt ramenée dans la base, est le piège classique de l’accumulation.' },
        { id: 's5', kind: 'summary', body: 'Accumulation = base en range où l’offre s’épuise ; sortie confirmée par le haut ; rupture par le bas = invalidation.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui invalide une accumulation ?', back: 'Une rupture par le bas de la zone d’accumulation : le scénario éducatif s’abandonne.' } },
      ],
      commonMistake: 'Prendre une fausse sortie par le haut pour une sortie confirmée.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.wyckoff.distribution': [
    {
      id: 'lesson.wyckoff-distribution',
      slug: 'distribution-wyckoff-lecture',
      title: 'La distribution : le range qui plafonne une hausse',
      skillId: 'skill.wyckoff.distribution',
      objective: 'Reconnaître une distribution possible par son contexte — jamais un range seul.',
      difficulty: 'advanced',
      estimatedMinutes: 4,
      steps: [
        { id: 's0', kind: 'intro', body: 'Après une hausse, un range en sommet peut être une distribution : l’offre y absorbe progressivement la demande.' },
        { id: 's1', kind: 'observe', body: 'Vérifie le contexte (une hausse précède), puis observe le plafonnement : les poussées ne tiennent plus.' },
        { id: 's2', kind: 'visual', conceptRef: 'distribution-wyckoff' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'distribution-wyckoff', body: 'Le contexte décide : un range sans hausse préalable n’est pas une distribution — la prudence prime.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'distribution-wyckoff' },
        { id: 's4', kind: 'falseSignal', body: 'Voir de la distribution dans tout range, sans contexte, est le piège classique.' },
        { id: 's5', kind: 'summary', body: 'Distribution = range EN SOMMET où l’offre absorbe la demande ; le contexte est indispensable.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qu’une distribution (Wyckoff) ?', back: 'Un range en sommet où l’offre absorbe progressivement la demande — lisible seulement dans son contexte.' } },
      ],
      commonMistake: 'Voir de la distribution dans tout range, sans contexte.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-Y — Module guidé « Lire les payoffs d'options » (world.options) ─
  'skill.options.call': [
    {
      id: 'lesson.options-call',
      slug: 'option-call-lecture',
      title: 'Le call : un droit, une prime, un seuil',
      skillId: 'skill.options.call',
      objective: 'Lire le payoff d’un call : perte bornée à la prime, seuil au strike + prime.',
      difficulty: 'advanced',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Un call est un DROIT d’acheter à un prix fixé (le strike), contre une prime payée. Un droit — jamais une obligation.' },
        { id: 's1', kind: 'observe', body: 'Lis le diagramme de payoff : plat sous le strike (perte = prime), croissant au-delà, avec un seuil de rentabilité.' },
        { id: 's2', kind: 'visual', conceptRef: 'option-call' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'option-call', body: 'La perte est bornée à la prime AVANT même de commencer ; le scénario ne devient gagnant qu’au-delà du strike + prime, à l’échéance.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'option-call' },
        { id: 's4', kind: 'falseSignal', body: 'Oublier l’effet du temps est le piège classique : une option perd de la valeur en approchant de l’échéance.' },
        { id: 's5', kind: 'summary', body: 'Call = droit d’acheter au strike ; perte max = prime ; seuil = strike + prime ; le temps érode la valeur.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Quelle est la perte maximale d’un call ?', back: 'La prime payée — le droit expire sans valeur sous le strike à l’échéance.' } },
      ],
      commonMistake: 'Oublier que le temps érode la valeur d’une option.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.options.put': [
    {
      id: 'lesson.options-put',
      slug: 'option-put-lecture',
      title: 'Le put : le miroir du call',
      skillId: 'skill.options.put',
      objective: 'Lire le payoff d’un put, miroir du call : seuil au strike − prime.',
      difficulty: 'advanced',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Un put est un DROIT de vendre à un prix fixé (le strike), contre une prime payée : le miroir exact du call.' },
        { id: 's1', kind: 'observe', body: 'Lis le diagramme de payoff : croissant sous le strike, plat au-dessus (perte = prime) — l’image inversée du call.' },
        { id: 's2', kind: 'visual', conceptRef: 'option-put' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'option-put', body: 'Le put prend de la valeur quand le prix baisse ; le seuil de rentabilité est au strike MOINS la prime, à l’échéance.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'option-put' },
        { id: 's4', kind: 'falseSignal', body: 'Ignorer l’érosion de la valeur temps à l’approche de l’échéance est le piège classique.' },
        { id: 's5', kind: 'summary', body: 'Put = droit de vendre au strike ; perte max = prime ; seuil = strike − prime ; même érosion du temps que le call.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Quand un put expire-t-il sans valeur ?', back: 'Au-dessus du strike à l’échéance — la perte est limitée à la prime.' } },
      ],
      commonMistake: 'Ignorer l’érosion de la valeur temps à l’approche de l’échéance.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  // ─── LOT 4-Z — Module guidé « Déjouer les faux signaux » (world.false-signals) ─
  'skill.falsesignals.fakeout': [
    {
      id: 'lesson.falsesignals-fakeout',
      slug: 'faux-signal-lecture',
      title: 'Le faux signal : la mèche qui ment',
      skillId: 'skill.falsesignals.fakeout',
      objective: 'Reconnaître la mèche qui perce sans clôture et exiger la clôture confirmée.',
      difficulty: 'advanced',
      estimatedMinutes: 5,
      steps: [
        { id: 's0', kind: 'intro', body: 'Un niveau percé par une mèche, sans clôture au-delà, puis un retour immédiat : le faux signal (fakeout) est le piège le plus fréquent des niveaux.' },
        { id: 's1', kind: 'observe', body: 'Repère la mèche qui perce le niveau, l’absence de clôture au-delà, puis le retour de l’autre côté.' },
        { id: 's2', kind: 'visual', conceptRef: 'faux-signal' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'faux-signal', body: 'Le fakeout se confirme par le RETOUR sous le niveau ; une clôture confirmée AU-DELÀ invalide cette lecture — la cassure devient valide.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'faux-signal' },
        { id: 's4', kind: 'falseSignal', body: 'Prendre chaque mèche au-delà d’un niveau pour une cassure est le piège classique.' },
        { id: 's5', kind: 'summary', body: 'Mèche sans clôture = pas une cassure ; retour = fakeout confirmé ; clôture au-delà = cassure valide.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qui sépare une cassure valide d’un fakeout ?', back: 'La CLÔTURE confirmée au-delà du niveau — une mèche seule ne prouve rien.' } },
      ],
      commonMistake: 'Prendre chaque mèche au-delà d’un niveau pour une cassure.',
      sources: ['Voix pédagogique Trademy'],
      status: 'draft',
    },
  ],
  'skill.falsesignals.breakout': [
    {
      id: 'lesson.falsesignals-breakout',
      slug: 'faux-breakout-lecture',
      title: 'Le faux breakout : la cassure qui échoue',
      skillId: 'skill.falsesignals.breakout',
      objective: 'Reconnaître une cassure qui échoue et revient aussitôt dans la zone.',
      difficulty: 'advanced',
      estimatedMinutes: 4,
      steps: [
        { id: 's0', kind: 'intro', body: 'Le prix franchit un niveau… puis revient aussitôt dans la zone : la cassure a échoué. C’est le faux breakout.' },
        { id: 's1', kind: 'observe', body: 'Observe le franchissement, l’absence de poursuite, puis le retour dans la zone d’origine.' },
        { id: 's2', kind: 'visual', conceptRef: 'faux-breakout' },
        { id: 's3', kind: 'hypothesis', conceptRef: 'faux-breakout', body: 'L’échec d’une cassure se CONSTATE (retour dans la zone), il ne se devine pas — prudence sur toute cassure sans preuve.' },
        { id: 'sMan', kind: 'interaction', conceptRef: 'faux-breakout' },
        { id: 's4', kind: 'falseSignal', body: 'Toute mèche au-delà d’un niveau n’est pas un fakeout : le retour dans la zone doit se constater.' },
        { id: 's5', kind: 'summary', body: 'Franchissement sans poursuite + retour dans la zone = breakout raté ; la preuve avant la conclusion.' },
        { id: 's6', kind: 'flashcard', flashcard: { front: 'Qu’est-ce qu’un faux breakout ?', back: 'Une cassure qui échoue : le prix franchit un niveau puis revient aussitôt dans la zone.' } },
      ],
      commonMistake: 'Conclure au faux breakout avant d’avoir constaté le retour dans la zone.',
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
    // LOT D1 — objectif `confirm` de `concept.market-basics`, jusqu'ici documenté mais exercé nulle
    // part. Dérivé de sa `confirmationZone` : « la lecture se fait sur la structure des prix, dans
    // son unité de temps ».
    { id: 'ex.actions.confirm', type: 'mcq', skillId: 'skill.actions', prompt: 'Sur quoi se fait la lecture d’un prix ?', options: ['Sur la structure des prix, dans son unité de temps', 'Sur la dernière bougie, isolément', 'Sur la couleur dominante du graphique'], validation: { correctIndex: 0 }, difficulty: 'medium', feedback: fb('Exact : un prix se lit dans sa structure et dans l’unité de temps choisie.', 'Une bougie isolée ne dit rien : c’est la structure, dans son unité de temps, qui porte la lecture.', 'La lecture se fait sur la structure des prix, dans son unité de temps.', 'Changer d’unité de temps change l’impression, pas les prix.') },
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
  'skill.candle.mirror': CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.mirror'],
  'skill.candle.context': CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.context'],
  'skill.candle.rejection-high': CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.rejection-high'],
  'skill.candle.rejection-low': CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.rejection-low'],
  // LOT C6 — la séquence : trois bougies, et l'ordre décide.
  'skill.candle.sequence-reversal': CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.sequence-reversal'],
  'skill.candle.sequence-momentum': CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.sequence-momentum'],
  // LOT C9 — le rapport entre deux bougies : contenance (harami) et niveau partagé (pincettes).
  'skill.candle.containment': CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.containment'],
  'skill.candle.twin-level': CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.twin-level'],
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
  'skill.patterns.mirror': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.mirror'],
  'skill.patterns.triangle-mirror': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.triangle-mirror'],
  'skill.patterns.flag-mirror': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.flag-mirror'],
  'skill.patterns.reversal-mirror': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.reversal-mirror'],
  // LOT C7 — la pente ment (deux biseaux), et une figure n'annonce rien (triangle symétrique).
  'skill.patterns.wedge': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.wedge'],
  'skill.patterns.wedge-mirror': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.wedge-mirror'],
  'skill.patterns.no-direction': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.no-direction'],
  // LOT C10 — la courbure du chemin, et le niveau qui s'use.
  'skill.patterns.curvature': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.curvature'],
  'skill.patterns.tested-level': PATTERNS_MODULE_EXERCISES_BY_SKILL['skill.patterns.tested-level'],
  'skill.indicators.rsi': INDICATORS_MODULE_EXERCISES_BY_SKILL['skill.indicators.rsi'],
  'skill.indicators.macd': INDICATORS_MODULE_EXERCISES_BY_SKILL['skill.indicators.macd'],
  'skill.indicators.bollinger': INDICATORS_MODULE_EXERCISES_BY_SKILL['skill.indicators.bollinger'],
  'skill.indicators.divergence': INDICATORS_MODULE_EXERCISES_BY_SKILL['skill.indicators.divergence'],
  'skill.volume.participation': VOLUME_MODULE_EXERCISES_BY_SKILL['skill.volume.participation'],
  'skill.volume.vwap': VOLUME_MODULE_EXERCISES_BY_SKILL['skill.volume.vwap'],
  'skill.volume.profile': VOLUME_MODULE_EXERCISES_BY_SKILL['skill.volume.profile'],
  'skill.priceaction.reading': PRICEACTION_MODULE_EXERCISES_BY_SKILL['skill.priceaction.reading'],
  'skill.priceaction.wick': PRICEACTION_MODULE_EXERCISES_BY_SKILL['skill.priceaction.wick'],
  'skill.priceaction.impulse': PRICEACTION_MODULE_EXERCISES_BY_SKILL['skill.priceaction.impulse'],
  'skill.risk.reward': RISK_MODULE_EXERCISES_BY_SKILL['skill.risk.reward'],
  'skill.risk.stop': RISK_MODULE_EXERCISES_BY_SKILL['skill.risk.stop'],
  'skill.risk.sizing': RISK_MODULE_EXERCISES_BY_SKILL['skill.risk.sizing'],
  // LOT 4-V — module guidé Psychologie : exercices dérivés des scénarios (source unique).
  'skill.psychology.fomo': PSYCHOLOGY_MODULE_EXERCISES_BY_SKILL['skill.psychology.fomo'],
  'skill.psychology.discipline': PSYCHOLOGY_MODULE_EXERCISES_BY_SKILL['skill.psychology.discipline'],
  // LOT C8 — module Fondations : les deux notions du corpus qui se CALCULENT.
  'skill.foundations.dividend': FOUNDATIONS_MODULE_EXERCISES_BY_SKILL['skill.foundations.dividend'],
  'skill.foundations.per': FOUNDATIONS_MODULE_EXERCISES_BY_SKILL['skill.foundations.per'],
  // LOT 4-W — module guidé Smart Money : exercices dérivés des scénarios (source unique).
  'skill.smc.orderblock': SMC_MODULE_EXERCISES_BY_SKILL['skill.smc.orderblock'],
  'skill.smc.fvg': SMC_MODULE_EXERCISES_BY_SKILL['skill.smc.fvg'],
  'skill.smc.choch': SMC_MODULE_EXERCISES_BY_SKILL['skill.smc.choch'],
  'skill.smc.demand': SMC_MODULE_EXERCISES_BY_SKILL['skill.smc.demand'],
  'skill.smc.supply': SMC_MODULE_EXERCISES_BY_SKILL['skill.smc.supply'],
  // LOT 4-X — module guidé Wyckoff : exercices dérivés des scénarios (source unique).
  'skill.wyckoff.accumulation': WYCKOFF_MODULE_EXERCISES_BY_SKILL['skill.wyckoff.accumulation'],
  'skill.wyckoff.distribution': WYCKOFF_MODULE_EXERCISES_BY_SKILL['skill.wyckoff.distribution'],
  // LOT 4-Y — module guidé Options : exercices dérivés des scénarios (source unique).
  'skill.options.call': OPTIONS_MODULE_EXERCISES_BY_SKILL['skill.options.call'],
  'skill.options.put': OPTIONS_MODULE_EXERCISES_BY_SKILL['skill.options.put'],
  // LOT 4-Z — module guidé Faux signaux : exercices dérivés des scénarios (source unique).
  'skill.falsesignals.fakeout': FALSESIGNALS_MODULE_EXERCISES_BY_SKILL['skill.falsesignals.fakeout'],
  'skill.falsesignals.breakout': FALSESIGNALS_MODULE_EXERCISES_BY_SKILL['skill.falsesignals.breakout'],
};

// ─── Cibles pédagogiques des exercices ───────────────────────────────
// Concept représentatif de chaque compétence (source : CONCEPT_BY_SKILL, mais par id).
// Exporté (LOT D1) : c'est la source UNIQUE compétence → concept, dont le verrou de couverture
// `guidedObjectiveCoverage.test.ts` a besoin pour comparer les exercices au contenu réel.
export const SKILL_CONCEPT_ID: Record<string, string> = {
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
  ...INDICATORS_SKILL_CONCEPT_ID,
  ...VOLUME_SKILL_CONCEPT_ID,
  ...PRICEACTION_SKILL_CONCEPT_ID,
  ...RISK_SKILL_CONCEPT_ID,
  ...PSYCHOLOGY_SKILL_CONCEPT_ID,
  ...FOUNDATIONS_SKILL_CONCEPT_ID,
  ...SMC_SKILL_CONCEPT_ID,
  ...WYCKOFF_SKILL_CONCEPT_ID,
  ...OPTIONS_SKILL_CONCEPT_ID,
  ...FALSESIGNALS_SKILL_CONCEPT_ID,
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
  'ex.actions.confirm': 'confirm',
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
export const CHECKPOINT_TITLE = 'Revue — Premiers repères';

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
    // LOT C8 — le titre suit le contenu : le module couvre désormais aussi ce que VAUT une action
    // (dividende, PER), qui ne se lit sur aucun graphique. L'IDENTIFIANT ne change pas — il est
    // persisté dans la progression des apprenants, le renommer effacerait leur avancement.
    title: 'Premiers repères',
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
  // LOT 4-R — 7e module guidé réel : « Lire les indicateurs » (monde 7, world.indicators).
  // Un indicateur dérive du prix : repères de contexte, jamais des ordres — la structure confirme.
  {
    id: INDICATORS_MODULE_ID,
    title: INDICATORS_MODULE_TITLE,
    worldId: INDICATORS_MODULE_WORLD_ID,
    skills: INDICATORS_SKILLS,
    checkpointId: INDICATORS_CHECKPOINT_ID,
    checkpointTitle: INDICATORS_CHECKPOINT_TITLE,
  },
  // LOT 4-S — 8e module guidé réel : « Lire le volume » (monde 8, world.volume).
  // Le volume mesure la participation, jamais la direction ; le POC est une mémoire, pas une promesse.
  {
    id: VOLUME_MODULE_ID,
    title: VOLUME_MODULE_TITLE,
    worldId: VOLUME_MODULE_WORLD_ID,
    skills: VOLUME_SKILLS,
    checkpointId: VOLUME_CHECKPOINT_ID,
    checkpointTitle: VOLUME_CHECKPOINT_TITLE,
  },
  // LOT 4-T — 9e module guidé réel : « Lire la price action » (monde 9, world.price-action).
  // Le prix raconte tout avant l'indicateur : zones, mèches de rejet, rythme impulsion/correction.
  {
    id: PRICEACTION_MODULE_ID,
    title: PRICEACTION_MODULE_TITLE,
    worldId: PRICEACTION_MODULE_WORLD_ID,
    skills: PRICEACTION_SKILLS,
    checkpointId: PRICEACTION_CHECKPOINT_ID,
    checkpointTitle: PRICEACTION_CHECKPOINT_TITLE,
  },
  // LOT 4-U — 10e module guidé réel : « Gérer le risque » (monde 10, world.risk).
  // Le risque se décide AVANT l'entrée : stop = invalidation, taille = risque accepté ÷ distance.
  {
    id: RISK_MODULE_ID,
    title: RISK_MODULE_TITLE,
    worldId: RISK_MODULE_WORLD_ID,
    skills: RISK_SKILLS,
    checkpointId: RISK_CHECKPOINT_ID,
    checkpointTitle: RISK_CHECKPOINT_TITLE,
  },
  // LOT 4-V — 11e module guidé réel : « Déjouer ses biais » (monde 11, world.psychology).
  // La décision se juge sur le processus, pas sur l'issue d'une seule idée — FOMO et discipline.
  {
    id: PSYCHOLOGY_MODULE_ID,
    title: PSYCHOLOGY_MODULE_TITLE,
    worldId: PSYCHOLOGY_MODULE_WORLD_ID,
    skills: PSYCHOLOGY_SKILLS,
    checkpointId: PSYCHOLOGY_CHECKPOINT_ID,
    checkpointTitle: PSYCHOLOGY_CHECKPOINT_TITLE,
  },
  // LOT 4-W — 12e module guidé réel : « Lire le Smart Money » (monde 12, world.smc).
  // Des zones d'intérêt à surveiller — la réaction observée du prix fait foi, jamais la zone seule.
  {
    id: SMC_MODULE_ID,
    title: SMC_MODULE_TITLE,
    worldId: SMC_MODULE_WORLD_ID,
    skills: SMC_SKILLS,
    checkpointId: SMC_CHECKPOINT_ID,
    checkpointTitle: SMC_CHECKPOINT_TITLE,
  },
  // LOT 4-X — 13e module guidé réel : « Lire les phases Wyckoff » (monde 13, world.wyckoff).
  // Accumulation (base où l'offre s'épuise) et distribution (sommet où elle absorbe) — le contexte décide.
  {
    id: WYCKOFF_MODULE_ID,
    title: WYCKOFF_MODULE_TITLE,
    worldId: WYCKOFF_MODULE_WORLD_ID,
    skills: WYCKOFF_SKILLS,
    checkpointId: WYCKOFF_CHECKPOINT_ID,
    checkpointTitle: WYCKOFF_CHECKPOINT_TITLE,
  },
  // LOT 4-Y — 14e module guidé réel : « Lire les payoffs d'options » (monde 14, world.options).
  // Une option est un DROIT : perte bornée à la prime, seuil de rentabilité, érosion du temps.
  {
    id: OPTIONS_MODULE_ID,
    title: OPTIONS_MODULE_TITLE,
    worldId: OPTIONS_MODULE_WORLD_ID,
    skills: OPTIONS_SKILLS,
    checkpointId: OPTIONS_CHECKPOINT_ID,
    checkpointTitle: OPTIONS_CHECKPOINT_TITLE,
  },
  // LOT 4-Z — 15e et DERNIER module guidé : « Déjouer les faux signaux » (monde 15,
  // world.false-signals). Le parcours entier (1..15) est désormais guidé : la compétence finale
  // est de savoir quand NE PAS croire un signal — la clôture confirmée fait foi.
  {
    id: FALSESIGNALS_MODULE_ID,
    title: FALSESIGNALS_MODULE_TITLE,
    worldId: FALSESIGNALS_MODULE_WORLD_ID,
    skills: FALSESIGNALS_SKILLS,
    checkpointId: FALSESIGNALS_CHECKPOINT_ID,
    checkpointTitle: FALSESIGNALS_CHECKPOINT_TITLE,
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
  ...INDICATORS_SKILL_CONCEPT_SLUG,
  ...VOLUME_SKILL_CONCEPT_SLUG,
  ...PRICEACTION_SKILL_CONCEPT_SLUG,
  ...RISK_SKILL_CONCEPT_SLUG,
  ...PSYCHOLOGY_SKILL_CONCEPT_SLUG,
  ...FOUNDATIONS_SKILL_CONCEPT_SLUG,
  ...SMC_SKILL_CONCEPT_SLUG,
  ...WYCKOFF_SKILL_CONCEPT_SLUG,
  ...OPTIONS_SKILL_CONCEPT_SLUG,
  ...FALSESIGNALS_SKILL_CONCEPT_SLUG,
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
