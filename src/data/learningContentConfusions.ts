/**
 * LOT G3 — Les deux notions qu'on confond avec ce qu'on sait déjà (`world.indicators`).
 *
 * Troisième lot de la série G (cf. ADR-154, ADR-155). Les deux dernières variantes orphelines du
 * moteur qui portent un sujet réellement distinct ont ceci en commun : chacune ressemble à une
 * notion DÉJÀ enseignée, et signifie autre chose.
 *
 *   - Le stochastique ressemble au RSI — même échelle 0-100, mêmes zones extrêmes — et ne mesure
 *     pas la même chose. Sur la série de cette fiche, à la douzième bougie, l'un vaut 4 et l'autre
 *     32,5 : l'un crie l'extrême, l'autre dit le milieu.
 *   - La divergence cachée a la forme d'une divergence classique — un désaccord entre le prix et
 *     l'oscillateur — et conclut l'inverse : continuation, pas essoufflement.
 *
 * C'est la doctrine du LOT C4 (« la même forme, l'autre histoire ») appliquée aux indicateurs. Les
 * faits chiffrés sont RECALCULÉS par `confusionsDerivation.test.ts`. Statut `needsReview`.
 */
import { DEFAULT_DISCLAIMER, type LearningConcept } from './learningConcept';

export const CONFUSION_CONCEPTS: LearningConcept[] = [
  // ─── Le stochastique ─────────────────────────────────────────────────
  {
    id: 'concept.stochastic',
    slug: 'stochastique',
    estimatedMinutes: 6,
    dialogue: {
      toto: 'Encore une courbe de 0 à 100 avec des zones extrêmes : c’est un RSI, non ?',
      bobo: 'Regarde la même bougie sur les deux. Le stochastique affiche 4, le RSI 32. Même échelle, même série, deux verdicts opposés — parce qu’ils ne mesurent pas la même chose.',
    },
    title: 'Stochastique',
    shortTitle: 'Stochastique',
    aliases: ['Stochastic', 'Oscillateur stochastique', '%K %D'],
    categoryId: 'cat.indicators',
    worldId: 'world.indicators',
    difficulty: 4,
    prerequisites: ['concept.rsi'],
    tags: ['indicateur', 'oscillateur', 'range', 'confusion'],
    learningObjective:
      'Distinguer le stochastique du RSI : deux courbes 0-100 qui ne mesurent pas la même chose.',
    definitionShort:
      'La position de la clôture DANS le range récent, ramenée sur une échelle de 0 à 100.',
    definitionDetailed:
      'Le stochastique répond à une question simple : sur les N dernières bougies, la clôture du jour est-elle plutôt en haut ou en bas de l’intervalle parcouru ? Clôture au plus haut de la période, %K vaut 100 ; au plus bas, 0. Une seconde courbe, %D, en est la moyenne lissée. Le RSI, lui, compare l’ampleur des hausses à celle des baisses — ce n’est pas la même question, et ce n’est pas la même réponse. Ses zones de référence sont d’ailleurs différentes : 80 et 20, quand le RSI emploie 70 et 30.',
    howToRecognize: [
      'Deux courbes dans un panneau sous le prix, bornées de 0 à 100.',
      'Des zones de référence à 80 et 20 — et non 70 et 30 comme le RSI.',
      'Une courbe nerveuse (%K) doublée d’une courbe lissée (%D) qui la suit.',
      'Des passages rapides d’un extrême à l’autre, bien plus fréquents que sur un RSI.',
    ],
    contextRequired: [
      'La période employée : elle définit le range dans lequel la clôture est située.',
      'Le range lui-même : en tendance franche, la clôture reste collée à un bord et l’indicateur sature.',
    ],
    interpretationLimits: [
      'Sur la même série, le stochastique et le RSI donnent des lectures différentes — et parfois opposées. Aucun des deux n’a « raison » : ils ne mesurent pas la même chose.',
      'Le stochastique balaie toute l’échelle bien plus souvent qu’un RSI : ses extrêmes sont donc moins rares, donc moins remarquables.',
      'En tendance forte, il sature en haut ou en bas pendant longtemps. C’est son défaut le plus connu.',
    ],
    neutralScenario: {
      conditions: [
        'Une période annoncée et un range identifiable.',
        'La valeur lue comme une position dans ce range, puis confrontée à la structure.',
      ],
      invalidation:
        'La tendance se poursuit franchement malgré la saturation de l’oscillateur : c’est le prix qui décide.',
    },
    confirmationZone:
      'La structure de prix : le stochastique situe la clôture dans un range, il ne dit pas ce qui vient après.',
    falseSignals: [
      'Traiter 80 et 20 comme les 70 et 30 du RSI : ce ne sont ni les mêmes seuils, ni le même indicateur.',
      'Prendre chaque passage sous 20 pour un creux : sur la série de cette fiche, il y en a deux en quinze bougies.',
    ],
    commonMistakes: [
      'Lire un stochastique comme un RSI parce que les deux vont de 0 à 100.',
      'Oublier qu’en tendance franche, la saturation est normale et non exceptionnelle.',
    ],
    checklist: [
      'Quelle période, donc quel range ?',
      'Suis-je en range ou en tendance franche ?',
      'Que dit le RSI sur la même bougie — et pourquoi diffère-t-il ?',
    ],
    visualSpec: {
      type: 'indicator',
      variant: 'stochastic',
      direction: 'neutral',
      labels: [
        { text: 'haut du range > 80', at: 'ob' },
        { text: 'bas du range < 20', at: 'os' },
      ],
      annotations: [{ kind: 'note', text: 'une position, pas une force' }],
      datasetKey: 'indicator.stochastic.v1',
      accessibilitySummary:
        'Sous le prix, deux courbes bornées de 0 à 100 avec des zones de référence à 80 et 20 : la position de la clôture dans le range des cinq dernières bougies, et sa version lissée. Elles balaient toute l’échelle à plusieurs reprises.',
    },
    chartExamples: [
      {
        datasetKey: 'indicator.stochastic.v1',
        caption:
          'La même série que le prix au-dessus : l’oscillateur passe de 4 à 96 puis revient, sans que le prix ait quitté son range.',
      },
    ],
    interactiveTemplates: ['identify_pattern'],
    flashcards: [
      {
        front: 'Que mesure le stochastique, exactement ?',
        back: 'La position de la clôture dans le range des N dernières bougies : en haut, %K vaut 100 ; en bas, 0.',
      },
      {
        front: 'Quelles sont ses zones de référence ?',
        back: '80 et 20 — pas 70 et 30, qui sont celles du RSI.',
      },
    ],
    miniQuizzes: [
      {
        question: 'Le stochastique et le RSI peuvent-ils donner des lectures opposées sur la même série ?',
        options: [
          'Non, ils sont équivalents',
          'Oui : ils ne mesurent pas la même chose',
          'Seulement si les périodes diffèrent',
          'Seulement en tendance baissière',
        ],
        correctIndex: 1,
        explanation:
          'L’un situe la clôture dans un range, l’autre compare l’ampleur des hausses et des baisses. Deux questions, deux réponses.',
      },
    ],
    relatedConceptIds: ['concept.rsi', 'concept.divergence', 'concept.range'],
    sources: [{ label: 'Voix pédagogique Trademy', kind: 'editorial' }],
    version: 1,
    status: 'needsReview',
    locale: 'fr-CH',
    disclaimer: DEFAULT_DISCLAIMER,
  },

  // ─── La divergence cachée ────────────────────────────────────────────
  {
    id: 'concept.hidden-divergence',
    slug: 'divergence-cachee',
    estimatedMinutes: 7,
    dialogue: {
      toto: 'Le prix et l’oscillateur se contredisent encore : ça va se retourner, comme la dernière fois.',
      bobo: 'Regarde CE que tu compares. La dernière fois, c’étaient des sommets. Ici, ce sont des creux — et le prix fait un creux plus HAUT. Même désaccord, conclusion inverse.',
    },
    title: 'Divergence cachée',
    shortTitle: 'Divergence cachée',
    aliases: ['Hidden divergence', 'Divergence de continuation'],
    categoryId: 'cat.indicators',
    worldId: 'world.indicators',
    difficulty: 5,
    prerequisites: ['concept.divergence'],
    tags: ['indicateur', 'divergence', 'continuation', 'confusion'],
    learningObjective:
      'Distinguer une divergence cachée d’une divergence classique : même désaccord, conclusion opposée.',
    definitionShort:
      'Le prix fait un creux PLUS HAUT tandis que l’oscillateur fait un creux plus bas : un signe de continuation, pas d’essoufflement.',
    definitionDetailed:
      'La divergence classique compare des SOMMETS : prix en plus-hauts croissants, oscillateur en plus-hauts décroissants, et l’on parle d’essoufflement. La divergence cachée compare des CREUX, et le prix y fait un creux plus haut — c’est-à-dire qu’il tient sa structure haussière — pendant que l’oscillateur, lui, fait un creux plus bas. Le désaccord a la même allure ; sa lecture est inverse. Sur le graphique de cette fiche, le creux du prix passe de 47 à 51, et le creux de l’oscillateur de 30 à 25.',
    howToRecognize: [
      'Deux creux du prix, le second PLUS HAUT que le premier.',
      'Les deux creux correspondants de l’oscillateur, le second plus BAS.',
      'Une tendance haussière déjà en place — sans elle, il n’y a rien à continuer.',
    ],
    contextRequired: [
      'Une structure de plus-bas croissants déjà établie : la divergence cachée la confirme, elle ne la crée pas.',
      'Les deux pivots comparés, annoncés : ce sont eux qui font la lecture.',
    ],
    interpretationLimits: [
      'Comparer des creux et comparer des sommets ne racontent pas la même histoire : confondre les deux inverse la conclusion.',
      'Comme toute divergence, elle peut persister longtemps sans que rien ne suive.',
      'Le graphique de cette fiche affiche un oscillateur d’ILLUSTRATION, choisi pour rendre le désaccord lisible. Sur un vrai graphique, il se calcule à partir du prix.',
    ],
    bullishScenario: {
      conditions: [
        'Une tendance haussière avec des plus-bas croissants.',
        'Un creux du prix plus haut que le précédent, et un creux de l’oscillateur plus bas.',
        'Une reprise qui tient au-dessus du creux le plus récent.',
      ],
      invalidation:
        'Le prix reprend son creux précédent : la structure de plus-bas croissants tombe, et il n’y a plus de continuation à attendre.',
    },
    confirmationZone:
      'La structure : des plus-bas croissants conservés et un plus-haut local repris — jamais l’oscillateur seul.',
    invalidation:
      'Une clôture sous le creux précédent du prix : la structure haussière est cassée, la lecture de continuation tombe.',
    falseSignals: [
      'Lire une divergence cachée comme un retournement : c’est exactement la conclusion de la divergence CLASSIQUE, et l’erreur la plus fréquente sur cette figure.',
      'La chercher sans tendance établie : sans plus-bas croissants, il n’y a aucune continuation à confirmer.',
    ],
    commonMistakes: [
      'Comparer des sommets en croyant comparer des creux.',
      'Oublier de vérifier que la tendance existait avant.',
    ],
    checklist: [
      'Est-ce que je compare des creux ou des sommets ?',
      'Le creux du prix est-il vraiment plus haut ?',
      'La tendance haussière existait-elle avant ?',
    ],
    visualSpec: {
      type: 'indicator',
      variant: 'hidden-divergence',
      direction: 'bullish',
      labels: [
        { text: 'prix : creux plus haut', at: 'price' },
        { text: 'oscillateur : creux plus bas', at: 'osc' },
      ],
      annotations: [
        { kind: 'note', text: 'continuation possible, à confirmer', direction: 'bullish' },
      ],
      datasetKey: 'indicator.hidden-divergence.v1',
      accessibilitySummary:
        'Le prix forme deux creux, le second plus haut que le premier ; l’oscillateur en dessous forme les deux creux correspondants, le second plus bas. Un désaccord qui, sur des creux, signale une continuation possible.',
    },
    chartExamples: [
      {
        datasetKey: 'indicator.hidden-divergence.v1',
        caption:
          'Creux du prix de 47 à 51 — plus haut ; creux de l’oscillateur de 30 à 25 — plus bas. La tendance se poursuit ensuite.',
        direction: 'bullish',
      },
    ],
    interactiveTemplates: ['identify_pattern'],
    flashcards: [
      {
        front: 'Quelle est la différence entre divergence classique et divergence cachée ?',
        back: 'La classique compare des sommets et signale un essoufflement ; la cachée compare des creux et signale une continuation.',
      },
      {
        front: 'Qu’est-ce qui invalide une divergence cachée haussière ?',
        back: 'Une clôture sous le creux précédent du prix : la structure de plus-bas croissants tombe.',
      },
    ],
    miniQuizzes: [
      {
        question: 'Que signale une divergence cachée haussière ?',
        options: [
          'Un retournement imminent',
          'Une continuation possible de la tendance en place',
          'Une compression de volatilité',
          'Un changement d’unité de temps',
        ],
        correctIndex: 1,
        explanation:
          'Le prix tient sa structure de plus-bas croissants ; le désaccord de l’oscillateur ne l’annule pas, il accompagne une pause.',
      },
    ],
    relatedConceptIds: ['concept.divergence', 'concept.rsi', 'concept.uptrend', 'concept.impulsion-et-correction'],
    sources: [{ label: 'Voix pédagogique Trademy', kind: 'editorial' }],
    version: 1,
    status: 'needsReview',
    locale: 'fr-CH',
    disclaimer: DEFAULT_DISCLAIMER,
  },
];
