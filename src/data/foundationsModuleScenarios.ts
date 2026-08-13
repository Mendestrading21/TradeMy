/**
 * LOT C8 — « Ce que vaut une action » : deux compétences de plus au monde 1 (`world.foundations`).
 *
 * J'avais d'abord cru que `world.foundations` était le seul des quinze mondes sans module guidé.
 * C'était FAUX : il en a un depuis l'origine, `module.foundations.read-chart`. Ce qui est vrai, et
 * que la mesure a confirmé : sur ses TROIS fiches, une seule (`concept.market-basics`) était
 * entraînable. Dividende et PER restaient consultables sans jamais être demandées — dans le
 * premier monde du parcours, celui par lequel tout apprenant entre.
 *
 * Principe pédagogique central, et il est NOUVEAU dans l'application : tout le reste du corpus
 * enseigne à LIRE un graphique. Ces deux notions-là ne se lisent pas, elles se CALCULENT — et leurs
 * pièges sont arithmétiques, pas graphiques. Un PER bas peut trahir un bénéfice qui s'effondre ; un
 * rendement élevé, un cours qui a chuté. Dans les deux cas, c'est le DÉNOMINATEUR qui a bougé, et
 * c'est invisible sur le nombre seul.
 *   1. Le dividende → `concept.dividende`
 *   2. Le PER       → `concept.per`
 *
 * Deux contraintes que la DONNÉE impose, et qui sont assumées telles quelles :
 *
 * — Ni `confirmationZone` ni `invalidation` sur ces deux fiches. C'est correct (ADR-133 : une
 *   NOTION n'a pas de zone de confirmation ; lui en inventer une serait enseigner du faux). Les
 *   objectifs réels sont donc `recognize`, `interpret` et `avoid-false-signal` — trois, pas cinq.
 *
 * — Leur `visualSpec.type` est `mechanism` : un schéma, pas une série de bougies. La mécanique
 *   `identify-candle` exige un `datasetKey` OHLC ; elle ne peut donc pas servir ici, et il n'y a
 *   rien à corriger — il n'y a simplement pas de figure à reconnaître. `recognize` passe par un
 *   scénario, et `interpret` par le CALCUL (`compute`, mécanique du LOT D3 jusqu'ici réservée au
 *   monde du risque).
 *
 * Les nombres des énoncés de calcul viennent des fiches elles-mêmes : le résumé accessible du PER
 * porte « Prix (20 €) ÷ Bénéfice par action (2 €) = PER de 10 ». Statuts éditoriaux inchangés
 * (`needsReview`). Aucun vocabulaire BUY/SELL, aucun conseil, aucune promesse de rendement.
 */
import { buildScenarioExercises, type LearningScenario, type Exercise } from '../engines/exercise';
import type { Skill } from '../engines/learning';
import { objectiveId, type ObjectiveKind } from './learningTarget';

/**
 * Monde couvert. Ces compétences REJOIGNENT le module existant du monde 1
 * (`module.foundations.read-chart`) au lieu d'en former un second : la complétion d'un monde est
 * pilotée par SON module et SON checkpoint, un par monde. Créer un 16e module aurait donné deux
 * checkpoints au monde 1 et cassé ce modèle — une restructuration du parcours, pas un lot de
 * contenu.
 */
export const FOUNDATIONS_MODULE_WORLD_ID = 'world.foundations';

/** Compétences atomiques ajoutées au module du monde 1, dans l'ordre pédagogique. */
export const FOUNDATIONS_SKILLS: Skill[] = [
  { id: 'skill.foundations.dividend', name: 'Le dividende', description: 'Ce que l’entreprise reverse — et pourquoi le cours s’ajuste le jour du détachement.' },
  { id: 'skill.foundations.per', name: 'Le PER', description: 'Le prix d’un euro de bénéfice : un rapport qui se calcule, et dont les extrêmes trompent.' },
];

// Concepts réels du monde `world.foundations` reliés à chaque compétence.
const DIVIDENDE = 'concept.dividende';
const PER = 'concept.per';

/** Compétence → concept représentatif (id) et slug (lien « Découvrir la notion » de la fiche Monde). */
export const FOUNDATIONS_SKILL_CONCEPT_ID: Record<string, string> = {
  'skill.foundations.dividend': DIVIDENDE,
  'skill.foundations.per': PER,
};
export const FOUNDATIONS_SKILL_CONCEPT_SLUG: Record<string, string> = {
  'skill.foundations.dividend': 'dividende',
  'skill.foundations.per': 'per',
};

/** Cible pédagogique (conceptId + objectiveId) pour un `kind` d'objectif d'un concept réel. */
function target(conceptId: string, kind: ObjectiveKind) {
  return { conceptId, objectiveId: objectiveId(conceptId, kind) };
}

// ── Compétence 1 — Le dividende ──────────────────────────────────────────────────────────
// Dérivé de la fiche :
//   `definitionShort` : « Une part du bénéfice qu'une entreprise reverse à ses actionnaires… »
//   `visualSpec.annotations` : « le cours s'ajuste à la date de détachement »
//   `falseSignals` : rendement très élevé = parfois une chute du cours ; un dividende peut être
//                    réduit ou supprimé si le bénéfice baisse.
// Objectifs réels : recognize · interpret · avoid-false-signal. Aucun `confirm`, aucun `invalidate`.
const DIVIDEND_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.foundations.dividend.recognize',
    skillId: 'skill.foundations.dividend',
    target: target(DIVIDENDE, 'recognize'),
    // Pas d'`identify-candle` : il n'y a pas de figure, il y a un mécanisme en trois temps.
    interaction: 'read-scenario',
    prompt: 'De quoi parle ce mécanisme ?',
    context:
      'Une entreprise réalise un bénéfice sur l’année. Elle en reverse une part à ses actionnaires, en cash. Le jour du versement, le cours de l’action s’ajuste à la baisse d’environ le montant versé.',
    options: [
      'Du dividende : une part du bénéfice reversée aux actionnaires.',
      'D’une baisse du cours provoquée par des vendeurs ce jour-là.',
      'D’un remboursement du capital investi par les actionnaires.',
    ],
    correctIndex: 0,
    difficulty: 'easy',
    rule: 'Le dividende n’est pas un cadeau : c’est une part du bénéfice qui SORT de l’entreprise. Le cours s’ajuste d’autant, parce que l’entreprise vaut d’autant moins.',
    a11y:
      'Mécanisme en trois temps : bénéfice réalisé, part reversée en cash aux actionnaires, cours ajusté à la baisse du montant versé le jour du détachement.',
  },
  {
    // LOT D3 réutilisé hors du monde du risque : la notion se CALCULE. Le rendement du dividende
    // est le rapport nommé par les faux signaux de la fiche (« un rendement du dividende très
    // élevé… ») ; sans l'avoir posé une fois, on ne comprend pas pourquoi il peut tromper.
    id: 'ex.foundations.dividend.compute',
    skillId: 'skill.foundations.dividend',
    target: target(DIVIDENDE, 'interpret'),
    interaction: 'compute',
    prompt:
      'Une action cote 50 €. L’entreprise verse un dividende annuel de 2 € par action. Quel est le rendement du dividende ?',
    unit: '%',
    answer: 4,
    tolerance: 0,
    method: 'Rendement = dividende ÷ prix = 2 ÷ 50 = 0,04, soit 4 %.',
    difficulty: 'medium',
    rule: 'Le rendement rapporte le dividende au PRIX. Il a donc deux façons de monter : le dividende augmente… ou le cours baisse.',
    whenItFails:
      'Un rendement très élevé traduit souvent la seconde : le cours a chuté, et le dividende affiché n’a pas encore été revu.',
    a11y:
      'Calcul : action à 50 €, dividende annuel de 2 € par action. Réponse attendue en pourcentage.',
  },
  {
    id: 'ex.foundations.dividend.avoid',
    skillId: 'skill.foundations.dividend',
    target: target(DIVIDENDE, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le dividende.',
    statements: [
      'Un dividende peut être réduit ou supprimé si le bénéfice baisse.',
      'Un rendement du dividende très élevé signale une entreprise plus généreuse que les autres.',
      'Le cours s’ajuste à la baisse le jour du détachement, d’environ le montant versé.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

// ── Compétence 2 — Le PER ────────────────────────────────────────────────────────────────
// Dérivé de la fiche :
//   `definitionShort` : « Le rapport entre le prix de l'action et le bénéfice par action… »
//   `visualSpec.annotations` : « PER = prix ÷ bénéfice par action »
//   `visualSpec.accessibilitySummary` : « Prix (20 €) ÷ Bénéfice par action (2 €) = PER de 10 »
//   `falseSignals` : un PER très bas peut signaler un bénéfice qui s'effondre ; un PER très élevé
//                    peut être justifié par la croissance… ou par un excès d'optimisme.
const PER_SCENARIOS: LearningScenario[] = [
  {
    id: 'ex.foundations.per.recognize',
    skillId: 'skill.foundations.per',
    target: target(PER, 'recognize'),
    interaction: 'read-scenario',
    prompt: 'Que mesure ce rapport ?',
    context:
      'Une action cote 20 €. L’entreprise gagne 2 € par action et par an. On divise le premier nombre par le second, ce qui donne 10.',
    options: [
      'Le PER : le prix payé pour un euro de bénéfice — ici, environ dix années de bénéfices.',
      'Le rendement du dividende de l’action, exprimé en années.',
      'La croissance attendue du bénéfice sur les dix prochaines années.',
    ],
    correctIndex: 0,
    difficulty: 'medium',
    rule: 'Le PER se lit comme un PRIX : « combien je paie un euro de bénéfice ». Un PER de 10, c’est environ dix années de bénéfices au rythme actuel.',
    a11y:
      'Formule en trois blocs : prix de 20 € divisé par bénéfice par action de 2 €, résultat 10.',
  },
  {
    id: 'ex.foundations.per.compute',
    skillId: 'skill.foundations.per',
    target: target(PER, 'interpret'),
    interaction: 'compute',
    prompt:
      'Une action cote 36 €. L’entreprise gagne 3 € par action et par an. Quel est son PER ?',
    unit: '× le bénéfice annuel',
    answer: 12,
    tolerance: 0,
    method: 'PER = prix ÷ bénéfice par action = 36 ÷ 3 = 12.',
    difficulty: 'medium',
    rule: 'PER = prix ÷ bénéfice par action. Deux nombres, une division — mais les DEUX peuvent bouger.',
    whenItFails:
      'Un PER qui baisse n’est pas forcément une bonne nouvelle : si c’est le bénéfice qui s’effondre, le rapport diminue pour la pire des raisons.',
    a11y:
      'Calcul : action à 36 €, bénéfice par action de 3 € par an. Réponse attendue en multiples du bénéfice annuel.',
  },
  {
    id: 'ex.foundations.per.avoid',
    skillId: 'skill.foundations.per',
    target: target(PER, 'avoid-false-signal'),
    interaction: 'spot-false-signal',
    prompt: 'Repère l’affirmation FAUSSE sur le PER.',
    statements: [
      'Un PER très bas peut signaler un bénéfice en train de s’effondrer.',
      'Un PER bas désigne toujours une action moins chère qu’une action à PER élevé.',
      'Un PER très élevé peut être justifié par une croissance forte — ou par un excès d’optimisme.',
    ],
    errorIndex: 1,
    difficulty: 'medium',
  },
];

/** Scénarios par compétence (source unique du module). */
export const FOUNDATIONS_MODULE_SCENARIOS_BY_SKILL: Record<string, LearningScenario[]> = {
  'skill.foundations.dividend': DIVIDEND_SCENARIOS,
  'skill.foundations.per': PER_SCENARIOS,
};

/** Tous les scénarios du module, à plat (tests de diversité/couverture). */
export const FOUNDATIONS_MODULE_SCENARIOS: LearningScenario[] = FOUNDATIONS_SKILLS.flatMap(
  (s) => FOUNDATIONS_MODULE_SCENARIOS_BY_SKILL[s.id],
);

/** Exercices notés par compétence, DÉRIVÉS des scénarios (une seule vérité par item). */
export const FOUNDATIONS_MODULE_EXERCISES_BY_SKILL: Record<string, Exercise[]> = Object.fromEntries(
  Object.entries(FOUNDATIONS_MODULE_SCENARIOS_BY_SKILL).map(([id, list]) => [id, buildScenarioExercises(list)]),
);
