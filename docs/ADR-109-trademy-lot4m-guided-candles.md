# ADR-109 — LOT 4-M : module guidé « Lire les chandeliers » (`world.candles`)

- **Statut** : proposé — LOT 4-M, **deuxième module guidé réel** après « Lire un graphique »
  (Fondations). **PR en BROUILLON**, en attente de validation humaine et de CI verte ; passera à
  « accepté » à la validation. Base : `main` `d72b1b30822e394a6dbca160a47f6b7a9fe8c0a9` (LOT 4-L fusionné).
- **Contexte** : jusqu'ici un seul monde était **guidé** (Fondations : 4 compétences + checkpoint) ; les
  14 autres mondes restaient des collections de notions. Le LOT 4-M transforme le **monde 3**
  (`world.candles`, 14 concepts réels, tous `needsReview`) en un module guidé complet, sans toucher aux
  13 autres mondes ni à Fondations.

## Principe pédagogique central
Une bougie isolée ne prédit rien. Le module enseigne donc, pour chaque figure réelle du corpus, la
**reconnaissance** puis le **contexte**, la **confirmation** et l'**invalidation** — jamais un signal
certain. Aucun vocabulaire BUY/SELL, aucun ordre personnalisé, aucune promesse de gain. Toto formule
l'hypothèse, Bobo rappelle la condition et le faux signal ; leur dialogue enseigne, il ne prédit pas.

## Décision — un 2e module dérivé du registre canonique unique
Le moteur multi-module (LOT 4-M incrément A, ADR pré-existant du registre `CONTENT_MODULES`) permet
d'ajouter un module en ajoutant **une entrée** au registre. Le LOT 4-M ajoute cette entrée et son
contenu, sans seconde source de vérité.

### Quatre compétences atomiques ordonnées (concepts RÉELS de `world.candles`)
| Compétence | Concept réel (slug) | Objectifs ciblés (dérivés des champs du concept) |
|---|---|---|
| `skill.candle.pressure` — Pression et conviction | `concept.marubozu` (marubozu) | recognize, interpret, invalidate, avoid-false-signal |
| `skill.candle.rejection` — Le rejet des extrêmes | `concept.hammer` (marteau) | recognize, confirm, invalidate, avoid-false-signal |
| `skill.candle.indecision` — L'indécision | `concept.doji` (doji) | recognize, interpret, confirm, avoid-false-signal |
| `skill.candle.reversal` — Le retournement à deux bougies | `concept.bullish-engulfing` (avalement-haussier) | recognize, interpret, confirm, invalidate |

Checkpoint **propre** : `checkpoint.candles` (« Revue — Chandeliers japonais »), jamais partagé avec
Fondations. Objectifs **jamais inventés** : ils sont dérivés des champs réels du concept
(`learningTarget`). Le `doji` ne documentant pas d'invalidation, aucune compétence ne lui attache
d'exercice d'invalidation — honnêteté du modèle.

### Source sémantique unique par item (`candleModuleScenarios.ts`)
Chaque item est un `LearningScenario` d'où dérivent, par construction, le visuel, la bonne réponse, le
feedback et le résumé accessible — comme l'unité pilote. 16 exercices (4 par compétence).

### Extension du moteur de scénario — aucun nouveau primitif d'interface
Trois interactions **natives figure de chandelier** ont été ajoutées, **mappées sur des players de
production EXISTANTS** (donc aucun nouveau geste/renderer/primitif) :
| Interaction | Player existant | Objectif servi | Vérité dérivée |
|---|---|---|---|
| `identify-candle` | `identify_figure` | recognize | dataset/variant de la fiche du concept |
| `place-invalidation` | `place_invalidation` | invalidate | cible = **plus bas réel** de la série rendue |
| `read-scenario` | `scenario` | confirm | conclusion conditionnelle (SI … ALORS …) |

Mécaniques réellement distinctes du module : reconnaissance visuelle, réorganisation, placement continu,
raisonnement conditionnel, repérage de faux signal — **5 types d'exercice** (`identify_figure`, `order`,
`place_invalidation`, `scenario`, `find_error`).

### Signature visuelle et couleurs (canon respecté, aucun ajout redondant)
La signature du monde est sa **figure réelle** (`sampleSpec` = `candlestick-pattern`/`marteau`, rendu par
`MiniVisual` sur le héros du parcours et de la fiche), conforme au canon « graphiques originaux plutôt
qu'icônes génériques » — **aucune icône générique ajoutée**. Les icônes de statut restent sémantiques ;
l'**or** reste réservé au checkpoint / à la récompense (icône `trophy`/`checkpoint`, couleur `reward`).

### Compteurs honnêtes et routes pré-générées
- `repoTruth` et `offlineCapabilities` couvrent désormais **tous** les modules guidés : `skills` 4 → 8,
  leçons et exercices recomptés depuis le code. Les garde-fous globaux (cibles, cohérence
  exercice↔graphique) englobent automatiquement le nouveau module.
- `generateStaticParams` de `/session/[skillId]` pré-génère toutes les compétences guidées **et** tous
  les checkpoints → liens directs `session/skill.candle.*.html` et `session/checkpoint.candles.html`
  servis directement (pas de divergence d'hydratation React #418, cf. LOT 4-K).

## Vérité pédagogique préservée
Consulté ≠ complétion ≠ validation ≠ maîtrise : une transition par cible et par session ; une cible
entièrement échouée redevient **due** immédiatement et reste non maîtrisée ; le checkpoint est
indépendant ; la reprise est fidèle et idempotente (réponse restaurée jamais recomptée). Le monde 3
devient donc « terminé » par la **preuve** (checkpoint), jamais par la seule lecture des 14 fiches —
comme tout monde guidé.

### Statuts éditoriaux
Aucun statut de concept n'est modifié : les 14 fiches `world.candles` restent `needsReview`, surfacées
honnêtement. Aucune source, aucun auteur, aucun relecteur n'est fabriqué.

## Migration
Aucune. Les nouvelles compétences/checkpoints sont des clés supplémentaires dans des maps ouvertes
(`ProgressState`, schemaVersion 8 inchangé). La reprise reste idempotente.

## Alternatives écartées
- **Forker le système de scénario** pour les figures : rejeté — casse la source unique. On étend le
  `LearningScenario` existant.
- **Ajouter un primitif d'interaction dédié** (sélection de partie de bougie) : non nécessaire — les
  players existants couvrent les 5 mécaniques ; règle « au plus un nouveau primitif, seulement si
  indispensable » respectée par zéro nouveau primitif.
- **Ajouter une icône de monde générique** : rejeté — le canon privilégie la figure réelle
  (`MiniVisual`), déjà présente.

## Conséquences
- **+** Un 2e parcours guidé complet, testé de bout en bout sur les écrans de production.
- **+** Les compteurs et garde-fous reflètent la réalité (8 compétences guidées).
- **−** Un utilisateur ayant « exploré » le monde 3 par lecture ne le voit plus « terminé » tant que le
  checkpoint Chandeliers n'est pas réussi (comportement voulu d'un monde guidé ; état dérivé, aucune
  perte de données).

## Tests (exécutés)
- `candleModuleScenarios.test.ts` : câblage, couverture d'objectifs **réels** (doji sans invalidation),
  gradabilité, cohérence figure/dataset et invalidation, checkpoint propre, aucun vocabulaire interdit.
- `scenario.test.ts` : les 3 nouvelles interactions dérivent une vérité unique (déterministe).
- `guidedModuleEngine.test.ts`, `learningMap.test.ts`, `repoTruth.test.ts`, `offline.test.ts` : 2 modules
  guidés, checkpoints propres, 13 mondes non guidés, compteurs à 8 compétences.
- `session.integration.test.tsx` et `monde.integration.test.tsx` : boucle complète Chandeliers et fiche
  du monde 3 sur les écrans **réels** (leçon → pratique → erreur/Bobo → réussite ; checkpoint → célébration ;
  reprise exacte ; prochaine étape et notion liée ouvrables).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte (lint, typecheck, jest, validate:content, release:check,
  build:web). Captures Chromium déterministes sous `docs/lot4m-captures/`.

## Direction visuelle et moodboard (complément LOT 4-M)
Le moodboard (16 images d'intention) n'a servi que de référence : **aucune image de référence n'entre
dans le dépôt** (garde-fou exécutable dans `candleVisualDirection.test.ts`).

- **Principes retenus** : interface sombre premium (fond noir bleuté, surfaces anthracite) ; graphiques
  pédagogiques en SVG/primitives exactes dérivés des OHLC ; hiérarchie typographique forte ; états
  portés par icône **+** couleur (jamais la couleur seule) ; profondeur légère par cartes à bord fin.
- **Principes volontairement écartés** : aucune perspective 3D sur un graphique (fausserait la lecture) ;
  aucun néon permanent ; aucune reproduction de widgets/packs de référence ; **aucune icône générique**
  imposée à la place d'une figure réelle ; **aucun nouveau primitif d'interaction** (les players existants
  couvrent reconnaissance / réorganisation / placement continu / raisonnement conditionnel / faux signal —
  la « reconstruction » est servie par le placement accessible d'un extrême OHLC, avec alternative
  clavier ↑/↓ et tactile ; la règle « au plus un nouveau primitif, seulement si indispensable » aboutit à
  zéro nouveau primitif).
- **Composants/SVG originaux créés** : `TrademyIcon` `candles` — **signature du monde Chandeliers**, motif
  de **quatre bougies** (corps ajourés + mèches fines, hauteurs alternées), monochrome, lisible de 16 à
  64 px, dans le système d'icônes interne. Rendu comme marque d'identité du monde 3 sur l'en-tête de la
  fiche Monde (accent violet de marque).
- **Signature Chandeliers** : même géométrie quel que soit l'état ; l'état reste porté séparément (puce
  de statut icône+libellé, trail, prochaine étape), jamais par la seule couleur de la signature.
- **Usage exact des couleurs** : violet = marque / CTA / progression (signature, boutons, barre) ; vert
  et rouge = marché (bougies, « hausse/baisse » toujours accompagnés d'un libellé) ; cyan = annotation
  (cadre « SI… » du scénario de contexte) ; **or = uniquement le checkpoint** (accessible ou réussi) ;
  aucune couleur codée en dur dans le module (tokens seulement, vérifié par test).
- **Reduced motion** : réutilise le système d'animation existant ; sous `prefers-reduced-motion` les
  translations/oscillations/zooms décoratifs sont supprimés, l'état final s'affiche immédiatement, et
  toute l'information (sélection, annotations, figures) reste présente (capture `candle-fiche-reduced-390`).
- **Assets et licences** : aucune image raster, aucune URL distante, aucune police ajoutée, aucun emoji
  fonctionnel dans le module (garde-fous `candleVisualDirection.test.ts` + `icons.test.ts` + garde emoji
  unique du projet). Les captures QA (`docs/lot4m-captures/`) sont des PNG générés, jamais embarqués.
- **Captures inspectées (12)** : `candle-fiche-390` (signature + module), `candle-fiche-320`,
  `candle-fiche-web`, `candle-fiche-reduced-390`, `candle-checkpoint-available-390` (or réservé au
  checkpoint), `candle-review-390` (« à réviser »), `candle-lesson-anatomy-390` (leçon), `candle-context-390`
  (scénario, cadre cyan « SI… »), `candle-feedback-correct-390`, `candle-feedback-bobo-390` (misconception
  Bobo, réponse marquée par icône+couleur), `candle-reconstruct-place-390` (placement d'extrême OHLC,
  clavier ↑/↓), `candle-checkpoint-390` (revue en pratique). Zéro erreur console/page, zéro débordement
  horizontal, OHLC exacts, focus/CTA lisibles.
- **Défaut trouvé puis corrigé** : le pilotage Chromium des sessions échouait à franchir l'étape
  « résumé » de la leçon (sélection par texte ambiguë en RN-web) ; corrigé en ciblant le bouton
  accessible (`getByRole('button')`), rendant les 12 captures déterministes.

## Portée
Aucune dépendance ajoutée ; `package.json` et le lockfile inchangés. Fondations et les 13 autres mondes
inchangés. Le complément « direction visuelle » reste limité à `world.candles` et à l'ajout d'une seule
icône de signature dans le système existant. Aucun push/fusion/déploiement sans autorisation explicite.
