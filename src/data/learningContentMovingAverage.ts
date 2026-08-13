/**
 * LOT G1 — La moyenne mobile et ses deux croisements (`world.indicators`).
 *
 * Ouverture de la série G. Le constat qui la déclenche : le moteur de visuels sait dessiner
 * **quinze variantes d'indicateur**, et le corpus n'en enseignait que six. Neuf figures — dont la
 * moyenne mobile, l'indicateur le plus employé de toute l'analyse technique — existaient en code,
 * avec leur dataset déterministe et leurs calculs testés, sans qu'aucune fiche ne les nomme.
 *
 * Ces trois fiches ne sont pas inventées : chacune DÉCRIT ce que le moteur trace réellement à
 * partir de son dataset, avec `sma(closes, 3)` et `sma(closes, 6)` — les périodes déclarées dans
 * `INDICATOR_CONFIGS`. Les faits chiffrés cités ci-dessous (retard de trois bougies, deux
 * croisements dans la série hésitante, première valeur à la sixième bougie) sont RECALCULÉS par
 * `movingAverageDerivation.test.ts` : si un dataset changeait, le test tomberait avant la fiche.
 *
 * Statut `needsReview` : aucune auto-validation. Aucun vocabulaire prescriptif.
 */
import { DEFAULT_DISCLAIMER, type LearningConcept } from './learningConcept';

export const MOVING_AVERAGE_CONCEPTS: LearningConcept[] = [
  // ─── La moyenne mobile ───────────────────────────────────────────────
  {
    id: 'concept.moving-average',
    slug: 'moyenne-mobile',
    estimatedMinutes: 5,
    dialogue: {
      toto: 'Une ligne qui traverse les bougies et lisse le bruit : d’un coup, la tendance se voit mieux.',
      bobo: 'Elle se voit mieux parce qu’elle est déjà passée. Une moyenne est un résumé du passé récent — elle suit le prix, elle ne le devance jamais.',
    },
    title: 'Moyenne mobile',
    shortTitle: 'Moyenne mobile',
    aliases: ['Moving average', 'MM', 'SMA'],
    categoryId: 'cat.indicators',
    worldId: 'world.indicators',
    difficulty: 2,
    prerequisites: [],
    tags: ['indicateur', 'moyenne', 'lissage', 'retard'],
    learningObjective:
      'Lire une moyenne mobile : ce qu’elle lisse, et le retard que ce lissage coûte.',
    definitionShort:
      'La moyenne des dernières clôtures, recalculée à chaque bougie : une ligne qui suit le prix en le lissant.',
    definitionDetailed:
      'Une moyenne mobile à N périodes additionne les N dernières clôtures et les divise par N. À la bougie suivante, la plus ancienne clôture sort du calcul et la nouvelle y entre : la ligne « glisse » avec le prix. Elle n’ajoute aucune information — elle enlève du bruit. C’est le compromis à connaître : plus N est grand, plus la ligne est lisse et stable, et plus elle réagit tard. Le graphique de cette fiche superpose deux périodes, 3 et 6 bougies : la rapide colle au prix, la lente reste en retrait.',
    howToRecognize: [
      'Une ligne continue posée SUR les bougies, et non dans un panneau séparé sous le prix.',
      'Elle traverse le milieu des bougies au lieu d’en épouser les mèches.',
      'Elle ne commence pas à la première bougie : la moyenne à 6 périodes n’a sa première valeur qu’à la sixième.',
      'Deux périodes affichées ensemble donnent deux lignes : la courte réagit vite, la longue reste lisse.',
    ],
    contextRequired: [
      'Une série d’au moins autant de bougies que la période choisie, sinon la ligne n’existe pas encore.',
      'La période employée, annoncée : « une moyenne » sans son N ne veut rien dire.',
    ],
    interpretationLimits: [
      'Une moyenne décrit le passé récent. Elle ne contient aucune information sur la bougie suivante.',
      'Le lissage a un prix : ce que la ligne gagne en stabilité, elle le perd en réactivité.',
      'Deux moyennes de périodes différentes racontent deux histoires différentes de la même série — d’où l’obligation d’annoncer laquelle.',
      // LOT G4 — la variante exponentielle existe et se rencontre partout ; la nommer évite qu'un
      // élève croie que « moyenne mobile » désigne une seule chose. Ce que la fiche NE dit pas :
      // « l’exponentielle est meilleure ». Sur la série de cette fiche, l’écart entre les deux se
      // mesure en dixièmes de point — invisible à l’œil, donc non illustrable ici.
      'Il existe des variantes : la moyenne EXPONENTIELLE pèse davantage les clôtures récentes, la simple les traite à égalité. Cette fiche emploie la simple ; l’écart entre les deux dépend de la série et n’est pas toujours visible.',
    ],
    neutralScenario: {
      conditions: [
        'Une période annoncée et une série assez longue pour la calculer.',
        'La ligne lue comme un résumé, confrontée ensuite à la structure de prix.',
      ],
      invalidation:
        'Le prix impose sa structure : quand il contredit franchement le résumé, c’est le prix qui a raison.',
    },
    confirmationZone:
      'La structure de prix : une moyenne confirme ce que le prix a déjà fait, elle ne l’annonce pas.',
    falseSignals: [
      'Dans un marché hésitant, les deux moyennes se croisent puis se recroisent aussitôt : le graphique de cette fiche en montre deux croisements en treize bougies, sans tendance derrière.',
      'Prendre « le prix est au-dessus de sa moyenne » pour une conclusion : c’est une constatation arithmétique, pas un scénario.',
    ],
    commonMistakes: [
      'Comparer deux moyennes sans dire de quelles périodes il s’agit.',
      'Attendre d’une moyenne qu’elle anticipe, alors qu’elle est construite pour retarder.',
    ],
    checklist: [
      'Quelle période ?',
      'À partir de quelle bougie la ligne existe-t-elle ?',
      'Le prix a-t-il bougé avant la ligne ?',
    ],
    visualSpec: {
      type: 'indicator',
      variant: 'moving-average',
      direction: 'neutral',
      labels: [
        { text: 'rapide (3 bougies)', at: 'fast' },
        { text: 'lente (6 bougies)', at: 'slow' },
      ],
      annotations: [{ kind: 'note', text: 'un résumé du passé récent' }],
      datasetKey: 'indicator.ma.v1',
      accessibilitySummary:
        'Deux lignes lissées superposées aux bougies : une moyenne à 3 périodes, qui suit le prix de près, et une moyenne à 6 périodes, plus lisse et plus lente. Sur cette série hésitante, elles se croisent à deux reprises.',
    },
    chartExamples: [
      {
        datasetKey: 'indicator.ma.v1',
        caption:
          'Série hésitante : la moyenne rapide passe sous la lente, puis repasse au-dessus — deux croisements sans tendance derrière.',
      },
    ],
    interactiveTemplates: ['identify_pattern'],
    flashcards: [
      {
        front: 'Pourquoi une moyenne mobile est-elle toujours en retard ?',
        back: 'Parce qu’elle est faite des clôtures déjà passées : elle les résume, elle ne peut pas les devancer.',
      },
      {
        front: 'Quel est le compromis d’une période longue ?',
        back: 'Une ligne plus lisse et plus stable, mais qui réagit plus tard.',
      },
    ],
    miniQuizzes: [
      {
        question: 'À partir de quelle bougie une moyenne à 6 périodes a-t-elle sa première valeur ?',
        options: ['La première', 'La troisième', 'La sixième', 'La dixième'],
        correctIndex: 2,
        explanation:
          'Il faut six clôtures pour en faire la moyenne : avant la sixième bougie, la ligne n’existe pas.',
      },
      {
        question: 'Que gagne-t-on en allongeant la période d’une moyenne ?',
        options: [
          'De la stabilité, au prix de la réactivité',
          'De la réactivité, au prix de la stabilité',
          'Les deux à la fois',
          'Rien : la période ne change rien',
        ],
        correctIndex: 0,
        explanation:
          'Plus la période est longue, plus la ligne est lisse — et plus elle réagit tard. C’est le compromis central.',
      },
    ],
    relatedConceptIds: [
      'concept.macd',
      'concept.bollinger',
      'concept.golden-cross',
      'concept.death-cross',
    ],
    sources: [{ label: 'Voix pédagogique Trademy', kind: 'editorial' }],
    version: 1,
    status: 'needsReview',
    locale: 'fr-CH',
    disclaimer: DEFAULT_DISCLAIMER,
  },

  // ─── Le croisement haussier ──────────────────────────────────────────
  {
    id: 'concept.golden-cross',
    slug: 'croisement-haussier-de-moyennes',
    estimatedMinutes: 6,
    dialogue: {
      toto: 'La rapide repasse au-dessus de la lente : la pente a changé de camp, setup haussier possible.',
      bobo: 'Compte les bougies avant de t’enthousiasmer : sur ce graphique, le prix avait touché son plus bas trois bougies AVANT le croisement. Ce n’est pas une annonce, c’est un constat en retard.',
    },
    title: 'Croisement haussier de moyennes',
    shortTitle: 'Croisement haussier',
    aliases: ['Golden cross', 'Croisement doré'],
    categoryId: 'cat.indicators',
    worldId: 'world.indicators',
    difficulty: 3,
    prerequisites: ['concept.moving-average'],
    tags: ['indicateur', 'moyenne', 'croisement', 'retard'],
    learningObjective:
      'Reconnaître un croisement haussier de moyennes et mesurer le retard qu’il porte.',
    definitionShort:
      'La moyenne rapide repasse au-dessus de la lente, après que le prix a déjà tourné.',
    definitionDetailed:
      'Quand la moyenne courte franchit la moyenne longue par le bas, on parle de croisement haussier — son nom de marché est « golden cross ». Le nom en promet beaucoup ; l’arithmétique en promet moins. Le croisement ne se produit que lorsque les dernières clôtures ont assez remonté pour tirer la courte au-dessus de la longue : le retournement du prix le précède toujours. Sur le graphique de cette fiche, le prix touche son point bas à la quatrième bougie, et les deux moyennes ne se croisent qu’à la septième — trois bougies plus tard.',
    howToRecognize: [
      'Deux moyennes de périodes différentes tracées sur le même prix.',
      'La rapide vient du dessous et passe au-dessus de la lente.',
      'Le point de croisement se situe APRÈS le plus bas du prix, jamais avant.',
      'Le croisement est un point, pas une zone : il a une bougie précise.',
    ],
    contextRequired: [
      'Une baisse préalable : sans elle, la rapide était déjà au-dessus et il n’y a rien à croiser.',
      'Deux périodes annoncées — ici 3 et 6 bougies.',
    ],
    interpretationLimits: [
      'Le croisement ne déclenche rien : il constate un changement de pente déjà consommé.',
      'Plus les périodes sont longues, plus le constat arrive tard.',
      'Le nom « croisement doré » décrit une réputation, pas une probabilité.',
    ],
    bullishScenario: {
      conditions: [
        'Une baisse préalable, puis un prix qui cesse de faire des plus-bas.',
        'La moyenne rapide qui repasse au-dessus de la lente.',
        'Une structure de prix qui tient au-dessus après le croisement.',
      ],
      invalidation:
        'La moyenne rapide repasse sous la lente, ou le prix reprend ses plus-bas : le croisement est effacé.',
    },
    confirmationZone:
      'La structure de prix après le croisement : des plus-bas qui tiennent et un plus-haut repris — jamais le croisement seul.',
    invalidation:
      'Un retour du prix sous le plancher de la jambe qui a produit le croisement : la rapide repasse sous la lente et le constat tombe.',
    falseSignals: [
      'En range, la rapide traverse la lente dans les deux sens sans qu’aucune tendance suive : le croisement s’y répète sans rien signifier.',
      'Traiter le croisement comme un point d’entrée théorique alors que le mouvement a déjà eu lieu.',
    ],
    commonMistakes: [
      'Croire que le croisement annonce la hausse, alors qu’il la constate.',
      'Ne pas regarder combien de bougies séparent le plus bas du prix et le croisement.',
    ],
    checklist: [
      'Y avait-il une baisse avant ?',
      'Combien de bougies entre le plus bas et le croisement ?',
      'La structure de prix tient-elle après ?',
    ],
    visualSpec: {
      type: 'indicator',
      variant: 'golden-cross',
      direction: 'bullish',
      labels: [
        { text: 'rapide (3 bougies)', at: 'fast' },
        { text: 'lente (6 bougies)', at: 'slow' },
      ],
      annotations: [
        { kind: 'note', text: 'le croisement suit le retournement', direction: 'bullish' },
      ],
      datasetKey: 'indicator.golden-cross.v1',
      accessibilitySummary:
        'Le prix baisse, forme son plus bas à la quatrième bougie, puis remonte. La moyenne à 3 périodes ne repasse au-dessus de la moyenne à 6 périodes qu’à la septième bougie : trois bougies après le retournement du prix.',
    },
    chartExamples: [
      {
        datasetKey: 'indicator.golden-cross.v1',
        caption:
          'Le plus bas du prix tombe à la quatrième bougie ; les moyennes se croisent à la septième — trois bougies de retard.',
        direction: 'bullish',
      },
    ],
    interactiveTemplates: ['identify_pattern'],
    flashcards: [
      {
        front: 'Le croisement haussier arrive-t-il avant ou après le retournement du prix ?',
        back: 'Après — toujours. Sur le graphique de la fiche, trois bougies après le plus bas.',
      },
      {
        front: 'Qu’est-ce qui invalide un croisement haussier ?',
        back: 'Le retour du prix sous le plancher de la jambe qui l’a produit : la rapide repasse sous la lente.',
      },
    ],
    miniQuizzes: [
      {
        question: 'Que constate un croisement haussier de moyennes ?',
        options: [
          'Qu’une hausse va commencer',
          'Que les dernières clôtures ont assez remonté pour tirer la courte au-dessus de la longue',
          'Que le volume augmente',
          'Que la volatilité se comprime',
        ],
        correctIndex: 1,
        explanation:
          'C’est une conséquence arithmétique de clôtures déjà passées : le prix a bougé d’abord, les moyennes ensuite.',
      },
    ],
    relatedConceptIds: [
      'concept.moving-average',
      'concept.death-cross',
      'concept.macd',
      'concept.uptrend',
    ],
    sources: [{ label: 'Voix pédagogique Trademy', kind: 'editorial' }],
    version: 1,
    status: 'needsReview',
    locale: 'fr-CH',
    disclaimer: DEFAULT_DISCLAIMER,
  },

  // ─── Le croisement baissier ──────────────────────────────────────────
  {
    id: 'concept.death-cross',
    slug: 'croisement-baissier-de-moyennes',
    estimatedMinutes: 6,
    dialogue: {
      toto: 'La rapide repasse sous la lente : la pente s’est retournée, setup baissier possible.',
      bobo: 'Même arithmétique que dans l’autre sens, et même retard : trois bougies après le sommet du prix. Le nom dramatique qu’on lui donne n’ajoute aucune information.',
    },
    title: 'Croisement baissier de moyennes',
    shortTitle: 'Croisement baissier',
    aliases: ['Death cross', 'Croisement de la mort'],
    categoryId: 'cat.indicators',
    worldId: 'world.indicators',
    difficulty: 3,
    prerequisites: ['concept.moving-average'],
    tags: ['indicateur', 'moyenne', 'croisement', 'retard'],
    learningObjective:
      'Reconnaître un croisement baissier de moyennes et mesurer le retard qu’il porte.',
    definitionShort:
      'La moyenne rapide repasse sous la lente, après que le prix a déjà tourné.',
    definitionDetailed:
      'Le miroir exact du croisement haussier : la moyenne courte franchit la longue par le haut. Son nom de marché — « death cross » — est le plus dramatique de l’analyse technique, et c’est précisément ce qui le rend intéressant à étudier : le calcul, lui, est identique à celui du croisement haussier, au sens près. Sur le graphique de cette fiche, le prix forme son sommet à la quatrième bougie et les moyennes ne se croisent qu’à la septième. Trois bougies, là encore.',
    howToRecognize: [
      'Deux moyennes de périodes différentes tracées sur le même prix.',
      'La rapide vient du dessus et passe sous la lente.',
      'Le point de croisement se situe APRÈS le plus haut du prix, jamais avant.',
      'Le croisement est un point, pas une zone : il a une bougie précise.',
    ],
    contextRequired: [
      'Une hausse préalable : sans elle, la rapide était déjà au-dessous et il n’y a rien à croiser.',
      'Deux périodes annoncées — ici 3 et 6 bougies.',
    ],
    interpretationLimits: [
      'Le croisement ne déclenche rien : il constate un changement de pente déjà consommé.',
      'Plus les périodes sont longues, plus le constat arrive tard.',
      'Le nom qu’on lui donne dans la presse décrit une réputation, pas une probabilité.',
    ],
    bearishScenario: {
      conditions: [
        'Une hausse préalable, puis un prix qui cesse de faire des plus-hauts.',
        'La moyenne rapide qui repasse sous la lente.',
        'Une structure de prix qui reste sous le sommet après le croisement.',
      ],
      invalidation:
        'La moyenne rapide repasse au-dessus de la lente, ou le prix reprend ses plus-hauts : le croisement est effacé.',
    },
    confirmationZone:
      'La structure de prix après le croisement : des plus-hauts qui cèdent et un plus-bas repris — jamais le croisement seul.',
    invalidation:
      'Un retour du prix au-dessus du plafond de la jambe qui a produit le croisement : la rapide repasse au-dessus de la lente et le constat tombe.',
    falseSignals: [
      'En range, la rapide traverse la lente dans les deux sens sans qu’aucune tendance suive : le croisement s’y répète sans rien signifier.',
      'Lire le nom dramatique de la figure comme une mesure de sa portée.',
    ],
    commonMistakes: [
      'Croire que le croisement annonce la baisse, alors qu’il la constate.',
      'Oublier que l’invalidation d’un scénario baissier est un plafond, pas un plancher.',
    ],
    checklist: [
      'Y avait-il une hausse avant ?',
      'Combien de bougies entre le plus haut et le croisement ?',
      'La structure de prix reste-t-elle sous le sommet après ?',
    ],
    visualSpec: {
      type: 'indicator',
      variant: 'death-cross',
      direction: 'bearish',
      labels: [
        { text: 'rapide (3 bougies)', at: 'fast' },
        { text: 'lente (6 bougies)', at: 'slow' },
      ],
      annotations: [
        { kind: 'note', text: 'le croisement suit le retournement', direction: 'bearish' },
      ],
      datasetKey: 'indicator.death-cross.v1',
      accessibilitySummary:
        'Le prix monte, forme son plus haut à la quatrième bougie, puis baisse. La moyenne à 3 périodes ne repasse sous la moyenne à 6 périodes qu’à la septième bougie : trois bougies après le retournement du prix.',
    },
    chartExamples: [
      {
        datasetKey: 'indicator.death-cross.v1',
        caption:
          'Le plus haut du prix tombe à la quatrième bougie ; les moyennes se croisent à la septième — trois bougies de retard.',
        direction: 'bearish',
      },
    ],
    interactiveTemplates: ['identify_pattern'],
    flashcards: [
      {
        front: 'Où se pose l’invalidation d’un croisement baissier ?',
        back: 'Au-dessus : c’est un plafond, le plus haut de la jambe qui a produit le croisement.',
      },
      {
        front: 'Le croisement baissier est-il plus fiable que le haussier ?',
        back: 'Non : c’est le même calcul, au sens près. Seul son nom est plus dramatique.',
      },
    ],
    miniQuizzes: [
      {
        question: 'Un croisement baissier se produit-il avant ou après le sommet du prix ?',
        options: ['Avant', 'Après', 'Exactement dessus', 'Cela dépend du volume'],
        correctIndex: 1,
        explanation:
          'Toujours après : il faut que les clôtures aient assez baissé pour tirer la courte sous la longue.',
      },
    ],
    relatedConceptIds: [
      'concept.moving-average',
      'concept.golden-cross',
      'concept.macd',
      'concept.downtrend',
    ],
    sources: [{ label: 'Voix pédagogique Trademy', kind: 'editorial' }],
    version: 1,
    status: 'needsReview',
    locale: 'fr-CH',
    disclaimer: DEFAULT_DISCLAIMER,
  },
];
