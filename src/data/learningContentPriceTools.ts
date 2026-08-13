/**
 * LOT G2 — Les deux outils qui répondent « où ? » (`world.indicators`).
 *
 * Deuxième lot de la série G (cf. ADR-154). Tous les indicateurs déjà enseignés répondent à la
 * question « COMMENT va le marché » : le RSI donne une force, le MACD un élan, les bandes une
 * volatilité relative, la divergence un désaccord, la moyenne mobile un résumé. Aucun ne répond à
 * « à quel PRIX ». Or c'est précisément la question que pose une invalidation.
 *
 * Deux variantes du moteur y répondaient, sans qu'aucune fiche ne les nomme :
 *   - `atr`       → une DISTANCE en unités de prix ;
 *   - `fibonacci` → des NIVEAUX en unités de prix.
 *
 * Comme au LOT G1, chaque fait chiffré ci-dessous est RECALCULÉ par `priceToolsDerivation.test.ts`
 * depuis le dataset et la période réellement tracés. Statut `needsReview`.
 */
import { DEFAULT_DISCLAIMER, type LearningConcept } from './learningConcept';

export const PRICE_TOOLS_CONCEPTS: LearningConcept[] = [
  // ─── L'ATR ───────────────────────────────────────────────────────────
  {
    id: 'concept.atr',
    slug: 'atr',
    estimatedMinutes: 6,
    dialogue: {
      toto: 'Enfin un indicateur qui parle en euros : l’ATR me dit de combien ça bouge en moyenne, pas si ça monte.',
      bobo: 'Retiens la deuxième moitié de ta phrase. Un ATR qui grimpe ne dit rien du sens — et comme c’est une moyenne, il reste sous l’amplitude du jour le plus violent.',
    },
    title: 'ATR — l’amplitude moyenne',
    shortTitle: 'ATR',
    aliases: ['Average True Range', 'ATR'],
    categoryId: 'cat.indicators',
    worldId: 'world.indicators',
    difficulty: 3,
    prerequisites: ['concept.moving-average'],
    tags: ['indicateur', 'volatilité', 'amplitude', 'invalidation'],
    learningObjective:
      'Lire l’ATR comme une distance en unités de prix — et savoir ce qu’une moyenne d’amplitudes ne montre pas.',
    definitionShort:
      'La moyenne des amplitudes récentes, exprimée en unités de prix : de combien ça bouge, pas dans quel sens.',
    definitionDetailed:
      'Pour chaque bougie on mesure sa « vraie amplitude » : le plus grand des trois écarts entre son plus haut, son plus bas et la clôture précédente — c’est ce dernier point qui compte les ouvertures en écart. L’ATR est la moyenne mobile de ces amplitudes. Il se lit donc en euros, en points, en dollars : la même unité que le prix. C’est ce qui le rend utile pour poser une invalidation, puisqu’une invalidation est elle aussi une distance. Le graphique de cette fiche emploie une période de 4 bougies.',
    howToRecognize: [
      'Une courbe dans un panneau séparé, sous le prix, mais graduée en unités de PRIX et non de 0 à 100.',
      'Elle ne descend jamais sous zéro : une amplitude n’est pas signée.',
      'Elle monte quand les bougies s’élargissent, quel que soit leur sens.',
      'Elle n’existe pas avant d’avoir autant de bougies que sa période.',
    ],
    contextRequired: [
      'Une période annoncée — ici 4 bougies.',
      'Le prix lui-même : une amplitude ne veut rien dire sans savoir de quel niveau on parle.',
    ],
    interpretationLimits: [
      'L’ATR ne dit rien de la direction. Une chute violente et une hausse violente lui donnent la même valeur.',
      'C’est une MOYENNE : elle reste sous l’amplitude du jour le plus violent, et elle culmine après lui.',
      'Comparer l’ATR de deux actifs sans rapporter au prix n’a pas de sens : 2 € d’amplitude sur une action à 20 € et sur une action à 2 000 €, ce n’est pas la même chose.',
    ],
    neutralScenario: {
      conditions: [
        'Une période annoncée et une série assez longue pour la calculer.',
        'La valeur lue comme une distance, rapportée au niveau du prix.',
      ],
      invalidation:
        'La structure de prix contredit ce qu’on avait déduit de l’amplitude : c’est le prix qui décide.',
    },
    confirmationZone:
      'La structure de prix : l’ATR donne une distance, jamais un scénario — c’est le prix qui confirme.',
    falseSignals: [
      'Lire une hausse de l’ATR comme un signal haussier : l’indicateur ignore le sens, une baisse brutale le fait monter tout autant.',
      'Attendre de l’ATR qu’il marque le pic de volatilité au bon moment : sur le graphique de cette fiche, il culmine UNE bougie après la plus large.',
    ],
    commonMistakes: [
      'Poser une invalidation en pourcentage fixe alors que l’amplitude du moment a doublé.',
      'Oublier que l’ATR est une moyenne, et le lire comme l’amplitude d’aujourd’hui.',
    ],
    checklist: [
      'Quelle période ?',
      'Quelle unité — la même que le prix ?',
      'Est-ce que je cherche une distance, ou une direction ?',
    ],
    visualSpec: {
      type: 'indicator',
      variant: 'atr',
      direction: 'neutral',
      labels: [{ text: 'amplitude moyenne (4 bougies)', at: 'atr' }],
      annotations: [{ kind: 'note', text: 'une distance, pas un sens' }],
      datasetKey: 'indicator.atr.v1',
      accessibilitySummary:
        'Sous le prix, une courbe graduée en unités de prix : la moyenne des amplitudes récentes. Elle monte pendant l’élargissement des bougies, culmine une bougie après la plus large, puis redescend.',
    },
    chartExamples: [
      {
        datasetKey: 'indicator.atr.v1',
        caption:
          'Les bougies s’élargissent, puis se resserrent : l’amplitude moyenne suit, avec une bougie de retard sur la plus large.',
      },
    ],
    interactiveTemplates: ['identify_pattern'],
    flashcards: [
      {
        front: 'Dans quelle unité se lit un ATR ?',
        back: 'La même que le prix — euros, points, dollars. C’est une distance, pas un pourcentage ni un score.',
      },
      {
        front: 'Un ATR qui monte annonce-t-il une hausse ?',
        back: 'Non : il ignore le sens. Une baisse brutale le fait monter exactement pareil.',
      },
    ],
    miniQuizzes: [
      {
        question: 'Que mesure l’ATR ?',
        options: [
          'La direction probable du prix',
          'La moyenne des amplitudes récentes, en unités de prix',
          'La force des hausses face aux baisses, de 0 à 100',
          'Le volume échangé',
        ],
        correctIndex: 1,
        explanation:
          'C’est une moyenne d’amplitudes : une distance. La direction n’entre nulle part dans le calcul.',
      },
      {
        question: 'Pourquoi l’ATR reste-t-il sous l’amplitude de la bougie la plus large ?',
        options: [
          'Parce qu’il est plafonné',
          'Parce que c’est une moyenne : les bougies calmes la tirent vers le bas',
          'Parce qu’il ignore les mèches',
          'Parce qu’il se calcule sur les clôtures uniquement',
        ],
        correctIndex: 1,
        explanation:
          'Une moyenne ne rend jamais l’extrême : c’est le prix du lissage, exactement comme pour une moyenne mobile de prix.',
      },
    ],
    relatedConceptIds: [
      'concept.moving-average',
      'concept.bollinger',
      'concept.stop-loss',
      'concept.position-sizing',
    ],
    sources: [{ label: 'Voix pédagogique Trademy', kind: 'editorial' }],
    version: 1,
    status: 'needsReview',
    locale: 'fr-CH',
    disclaimer: DEFAULT_DISCLAIMER,
  },

  // ─── Les retracements de Fibonacci ───────────────────────────────────
  {
    id: 'concept.fibonacci',
    slug: 'retracements-de-fibonacci',
    estimatedMinutes: 7,
    dialogue: {
      toto: 'Le repli s’est arrêté juste sur le niveau : la grille de Fibonacci a vu venir la reprise.',
      bobo: 'Elle n’a rien vu venir : c’est toi qui as choisi les deux points, après coup. Change-les, et les niveaux changent avec eux — c’est la première chose à savoir sur cet outil.',
    },
    title: 'Retracements de Fibonacci',
    shortTitle: 'Retracements',
    aliases: ['Fibonacci', 'Retracement', 'Fibo'],
    categoryId: 'cat.indicators',
    worldId: 'world.indicators',
    difficulty: 4,
    prerequisites: ['concept.impulsion-et-correction'],
    tags: ['indicateur', 'niveaux', 'retracement', 'impulsion'],
    learningObjective:
      'Lire une grille de retracement comme des niveaux CHOISIS, et repérer ce qui la valide ou l’efface.',
    definitionShort:
      'Des niveaux horizontaux placés entre deux extrêmes d’un mouvement, aux fractions 23,6 %, 38,2 %, 50 %, 61,8 % et 78,6 %.',
    definitionDetailed:
      'Après une impulsion, le prix revient souvent sur une partie du chemin parcouru avant de repartir. La grille de retracement découpe ce chemin en fractions et propose des niveaux où le repli pourrait s’arrêter. Sur le graphique de cette fiche, le mouvement va de 43,40 à 62,60 : le niveau 50 % tombe donc à 53,00 et le 61,8 % à 50,73. Le repli, lui, s’est arrêté à 53,40 — quatre dixièmes au-dessus du niveau 50 %. Assez près pour qu’on parle de « respect du niveau », assez loin pour qu’on se demande ce que « près » veut dire.',
    howToRecognize: [
      'Une série de traits horizontaux, étiquetés en pourcentages, entre un plus bas et un plus haut.',
      'Le 0 % au sommet du mouvement, le 100 % à son point de départ.',
      'Les niveaux resserrés au milieu (38,2 %, 50 %, 61,8 %), écartés aux extrêmes.',
    ],
    contextRequired: [
      'Une impulsion claire avec un début et une fin identifiables — sans elle, il n’y a rien à retracer.',
      'Les DEUX points choisis, annoncés : ce sont eux qui déterminent tous les niveaux.',
    ],
    interpretationLimits: [
      'Les niveaux dépendent entièrement des deux points choisis. Deux lectures différentes du même graphique donnent deux grilles différentes.',
      'Le niveau 50 % n’est pas un ratio de Fibonacci : il est là par convention, parce qu’un repli de moitié se remarque.',
      'Sur ce graphique, la grille est tracée entre le plus bas et le plus haut de la série affichée ; sur un vrai graphique, c’est une décision, pas un automatisme.',
      'Un niveau est une zone d’attention, jamais un point de rebond garanti.',
    ],
    bullishScenario: {
      conditions: [
        'Une impulsion haussière achevée, dont les deux extrémités sont claires.',
        'Un repli qui ralentit dans la zone 38,2 % – 61,8 %.',
        'Une structure de prix qui tient : un plus-bas conservé, puis un plus-haut local repris.',
      ],
      invalidation:
        'Le prix passe sous le niveau 100 %, c’est-à-dire sous le départ du mouvement : ce n’est plus un repli, l’impulsion est effacée.',
    },
    confirmationZone:
      'La structure dans la zone de retracement : un plus-bas qui tient et un plus-haut local repris — pas le simple contact d’un trait.',
    invalidation:
      'Une clôture sous le niveau 100 % (le départ de l’impulsion) : le mouvement retracé n’existe plus, et sa grille non plus.',
    falseSignals: [
      'Prendre chaque contact d’un niveau pour un rebond : le prix traverse la plupart des niveaux sans s’arrêter.',
      'Redessiner la grille après coup jusqu’à ce qu’un niveau tombe pile sur le creux — à ce jeu-là, elle marche toujours.',
    ],
    commonMistakes: [
      'Tracer la grille sur un mouvement dont on n’a pas identifié les extrémités.',
      'Croire que 50 % est un ratio de Fibonacci.',
    ],
    checklist: [
      'Quels sont mes deux points, et pourquoi ceux-là ?',
      'Le repli ralentit-il, ou traverse-t-il ?',
      'Où est le niveau 100 %, celui qui efface tout ?',
    ],
    visualSpec: {
      type: 'indicator',
      variant: 'fibonacci',
      direction: 'bullish',
      labels: [
        { text: '0 % au sommet', at: 'top' },
        { text: '100 % au départ du mouvement', at: 'bottom' },
      ],
      annotations: [{ kind: 'note', text: 'des niveaux choisis, pas trouvés', direction: 'bullish' }],
      datasetKey: 'indicator.fib.v1',
      accessibilitySummary:
        'Une impulsion haussière puis un repli, traversés de traits horizontaux étiquetés en pourcentages. Le mouvement va de 43,40 à 62,60 ; le niveau 50 % tombe à 53,00, et le repli s’arrête à 53,40, juste au-dessus.',
    },
    chartExamples: [
      {
        datasetKey: 'indicator.fib.v1',
        caption:
          'Le repli s’arrête à 53,40, quatre dixièmes au-dessus du niveau 50 % (53,00) — près, mais pas dessus.',
        direction: 'bullish',
      },
    ],
    interactiveTemplates: ['identify_pattern'],
    flashcards: [
      {
        front: 'Le niveau 50 % est-il un ratio de Fibonacci ?',
        back: 'Non. Il est là par convention : un repli de moitié se remarque, c’est tout.',
      },
      {
        front: 'Qu’est-ce qui efface une grille de retracement ?',
        back: 'Une clôture sous le niveau 100 %, le départ du mouvement : il n’y a plus d’impulsion à retracer.',
      },
    ],
    miniQuizzes: [
      {
        question: 'De quoi dépendent les niveaux d’une grille de retracement ?',
        options: [
          'Uniquement des ratios, ils sont universels',
          'Des deux points choisis pour tracer la grille',
          'Du volume échangé pendant le repli',
          'De l’unité de temps affichée',
        ],
        correctIndex: 1,
        explanation:
          'Les ratios sont fixes, mais ils s’appliquent à l’écart entre DEUX points que quelqu’un a choisis. Changez les points, tous les niveaux bougent.',
      },
    ],
    relatedConceptIds: [
      'concept.impulsion-et-correction',
      'concept.support-resistance',
      'concept.retest-de-niveau',
      'concept.uptrend',
    ],
    sources: [{ label: 'Voix pédagogique Trademy', kind: 'editorial' }],
    version: 1,
    status: 'needsReview',
    locale: 'fr-CH',
    disclaimer: DEFAULT_DISCLAIMER,
  },
];
