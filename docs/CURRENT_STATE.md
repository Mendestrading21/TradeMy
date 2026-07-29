# État courant de TradeMy / PatternLab

**Date de référence :** 22 juillet 2026

**Dépôt :** `Mendestrading21/TradeMy`

**Base vérifiée :** `main` au commit `5f34d57`

**Branche de fondation :** `cleanup/repository-foundation`

## Produit

Le socle Expo/React Native est fonctionnel et ne doit pas être reconstruit. PatternLab possède déjà
sa navigation à cinq onglets, son parcours de 15 mondes, ses leçons, exercices, révisions, glossaire,
bibliothèque visuelle, laboratoires, progression locale et guides Toto/Bobo.

Les valeurs exactes du corpus et des registres ne sont jamais maintenues ici : consulter
`src/data/repoTruth.ts`, contrôlé par `src/data/repoTruth.test.ts`.

## Fondation 2026-07-22

- identité produit **PatternLab** séparée du nom de dépôt **TradeMy** ;
- chemin GitHub Pages centralisé dans `config/deployment.json` et contrôlé sous `/TradeMy/` ;
- Node/npm harmonisés pour local, CI et déploiement ;
- icônes Expo remplacées par l’identité Toto/Bobo sur web, iOS, Android et splash ;
- un seul skill Claude actif et trois documents d’entrée canoniques ;
- ZIP WMB, moodboards bruts, sources graphiques lourdes et scripts temporaires retirés de l’arbre
  courant ; ils restent récupérables dans l’historique Git de la base ;
- contenu et assets runtime inchangés : ce lot est une fondation, pas une refonte fonctionnelle.

## Programme actif

Le programme `patternlab-learning-master` reste la trajectoire produit. Les lots 0 à 9 et le premier
incrément du Lot 10 sont dans `main`. La prochaine évolution produit doit poursuivre un seul objectif
à la fois : enrichissement éditorial revu humainement, puis progression/rétention, sans rouvrir les
anciens programmes archivés.

## Refonte Trademy — en cours (branche `feat/trademy-complete-redesign`)

Transformation complète vers l'identité **Trademy** guidée par les documents canoniques (vision,
Trademy Learning Glass, Toto/Bobo, architecture 500+, plan d'exécution — PR #2 fusionnée). Exécution
par lots ; `main` n'est jamais modifié directement ; livrable = une PR vers `main`.

- **Lot 1 — Identité & tokens** ✅ : marque publique **Trademy** partout (app.json, appInfo,
  manifeste PWA, `+html`, écrans Accueil/Profil/Premium, label éditorial), signature
  « Ne parie pas. Comprends. ». Design system **Trademy Learning Glass** installé dans
  `src/design-system/tokens.ts` : marque **violette** (CTA), marché vert/rouge, or (zones), cyan
  (annotations), feedback pédagogique **distinct** du marché, bloc `motion`. Contraste WCAG AA
  reverrouillé ; nouveau `tokens.test.ts` garde l'identité. Voir **ADR-076**.

- **Lot 2 — Composants & icônes** ✅ : système d'icônes **Trademy** original
  (`src/design-system/icons/TrademyIcon.tsx`, ≥ 24 vecteurs monochromes) câblé dans la barre
  d'onglets (fin des emojis de navigation) ; `BrandLogo` (mark + wordmark) sur l'Accueil ;
  `ProgressRing` et `IconButton` ajoutés au design system ; `icons.test.ts` verrouille le registre.
  Voir **ADR-077**.

- **Lot 3 — Navigation & cinq espaces** ✅ : barre canonique **Accueil · Apprendre · Bibliothèque ·
  Laboratoire · Profil** pilotée par une source unique `src/lib/navigation.ts` (+ `navigation.test.ts`).
  Le Laboratoire redevient un onglet ; Réviser est intégré à l'Accueil/Profil. Hub « Bibliothèque »
  à icônes Trademy (fin des emojis de nav) ; composant `Disclaimer` unifié. Aucune route perdue,
  aucun renommage d'URL. Voir **ADR-078**.

- **Lot 4 — Onboarding & Accueil** ✅ : `Chip` accepte les icônes Trademy (`iconName`) ; Accueil à
  chips iconifiées (niveau/série), **rangée Révisions + Favoris**, **intervention de Bobo** (les deux
  mascottes présentes), rappel via `Disclaimer` ; onboarding : sélection à icône `check`. Voir **ADR-079**.

- **Lot 5 — Parcours Apprendre** ✅ : roadmap à **niveaux** (Débutant/Intermédiaire/Avancé via
  `LEVEL_BANDS`), **cinq états** avec légende (verrouillé/disponible/en cours/terminé/**maîtrisé**),
  badges `TrademyIcon` (cadenas/coche/trophée), prérequis visibles. Modèle pur + tests. Voir **ADR-080**.

- **Lot 6 — Bibliothèque** ✅ : l'espace devient un **index de concepts cherchable**
  (`src/data/conceptLibrary.ts`, pur + testé) : recherche, collections Tous/Favoris/Récents, filtre
  par famille (compte) et par statut de maîtrise, cartes → fiche avec favori. Outils de référence
  conservés. Voir **ADR-081**.

- **Lot 7 — Laboratoire** ✅ : section **« Lis un graphique, étape par étape »** — scénarios
  (`src/data/chartLab.ts`, pur + testé : tendance, cassure-retest, faux breakout, liquidité),
  **révélation progressive** + **bascule annotations affichées/masquées** + Toto/Bobo ; bouton mort
  supprimé. Voir **ADR-082**.

- **Lot 8 — Quiz & feedback** ✅ : `AnswerOption` (QuizOption) marque correct/incorrect via icônes
  Trademy (`check`/`close`) ; `FeedbackPanel` gagne une icône de statut + un emplacement visuel/mascotte ;
  la session **intègre la mascotte dans le panneau de correction** (Toto réussite / Bobo idée fausse).
  Voir **ADR-083**.

- **Lot 9 — Progression & Profil** ✅ : composant **`XPBar`** ; carte « Ta progression »
  (XPBar niveau/XP, chips à icônes série/points/**concepts maîtrisés**, **révisions recommandées** →
  Réviser) ; carte conditionnelle **« Tes erreurs fréquentes »** (misconceptions). Voir **ADR-084**.

- **Lot 10 — Toto/Bobo & animations** ✅ : système déjà mûr (24 états, pop évènementiel + flottement
  au repos, **rendu statique si reduced-motion**, présence sur tous les écrans). Ajout de l'état
  canonique **`point`** (Toto pointe le graphique annoté au Laboratoire) + couverture testée. Voir **ADR-085**.

- **Lot 11 — Schéma canonique & enrichissement** ✅ : le type `LearningConcept` gagne `estimatedMinutes`
  (durée) et `dialogue` (interventions Toto/Bobo), **optionnels**, portés par le concept (source
  unique). Concepts phares « Marché expliqué » enrichis ; surfacés sur la fiche (puce durée + bloc
  Toto/Bobo) et la Bibliothèque. Correspondance canon→schéma documentée. Voir **ADR-086**.

- **Lot 12 — A11y, responsive & finitions** ✅ : audit propre (0 couleur en dur dans les écrans,
  0 « PatternLab » visible, 0 vocabulaire interdit hors gardes) ; garde-fou `noHardcodedColors.test.ts` ;
  responsive vérifié à **320 / 390 / 430 px** en Chromium ; contraste AA et reduced-motion verrouillés.
  Voir **ADR-087**.

- **Lot 13 — Validation finale & PR** ✅ : `npm run check` **vert** (lint · typecheck · 503 tests ·
  validate:content · release:check · build:web) ; `expo-doctor` 18/20 (2 échecs réseau-seul) ; captures
  **avant/après** produites (Chromium). **PR #3** ouverte vers `main`
  (`feat/trademy-complete-redesign`).

> **Refonte Trademy — terminée** (Lots 1→13), **fusionnée dans `main` (PR #3) et déployée en live**
> sur GitHub Pages. La transformation d'identité, de design, de navigation et de structure est publiée.

## Enrichissement éditorial — en cours (par paquets revus)

Le schéma de concept est entièrement canonique (ADR-086) : `estimatedMinutes` (durée) et
`dialogue` (interventions Toto/Bobo) sont portés par le concept (source unique). L'enrichissement se
poursuit **un paquet à la fois, revu humainement**, sans jamais gonfler le corpus ni auto-publier.

- **Batch 1 — premier parcours débutant** ✅ : les cinq mondes d'entrée (Fondations · Anatomie ·
  Structure · Supports/Résistances · Faux signaux) sont enrichis **de bout en bout** (durée + dialogue
  Toto/Bobo sur les 12 concepts restants → 16/16). Aucune UI ajoutée (rendus câblés au Lot 11) ; verrou
  `conceptEnrichment.test.ts` (`BATCH_1`). Voir **ADR-088**. Le nombre exact de concepts enrichis reste
  dérivé du code, jamais recopié ici.
- **Batch 2 — monde des chandeliers** ✅ : `world.candles` (14 concepts) enrichi de bout en bout
  (durée + dialogue Toto/Bobo). Verrou `conceptEnrichment.test.ts` (`BATCH_2`). Voir **ADR-089**.
- **Batch 3 — monde des figures chartistes** ✅ : `world.patterns` (13 concepts) enrichi de bout en
  bout (durée + dialogue Toto/Bobo). Verrou `conceptEnrichment.test.ts` (`BATCH_3`). Voir **ADR-090**.
- **Batch 4 — reste du corpus** ✅ : SMC, indicateurs, volume, risk, price action, psychologie,
  wyckoff, options (24 concepts) enrichis. Verrous `BATCH_4` + assertion d'exhaustivité. Voir **ADR-091**.

> **Enrichissement éditorial — complet : les 67 concepts** portent durée + dialogue Toto/Bobo.

## Fiabilité pédagogique P0 — en cours (branche `fix/trademy-p0-pedagogical-truth`)

Lot correctif ciblé : **Trademy ne doit jamais enseigner une réponse fausse**, et la progression
doit refléter un apprentissage réel. Cinq défauts P0 confirmés dans le code courant, corrigés avec
garde-fous (voir **ADR-092**) ; aucune migration destructive, corpus et navigation inchangés.

- **Cohérence graphique ↔ réponse** ✅ : graines contradictoires de `seed.ts` corrigées ; test
  `exerciseChartCoherence.test.ts` recalcule la direction réelle de chaque exercice directionnel et
  la compare à la bonne réponse (bloque toute régression future).
- **Révision par session (pas par réponse)** ✅ : `recordAnswer` = activité seule ; maîtrise + SM-2
  via `recordSessionReview` (note agrégée appliquée une fois). Session faible → révision proche ;
  session ratée → immédiate. `applyGrade` conserve son comportement historique.
- **Reprise idempotente** ✅ : note et avance d'index committées ensemble ; fin du double comptage.
- **Statut éditorial visible** ✅ : schéma + helper `needsEditorialReview()` ; bandeau « À relire »
  (texte + couleur) sur chaque fiche non validée ; aucune source externe fabriquée.
- **Portes de qualité** ✅ : `deploy.yml` rejoue `npm run check` complet avant publication ; zoom web
  rétabli (viewport sans `user-scalable=no`). Verrous `infraGuards.test.ts`.

> **P0 — livré en PR (draft), non fusionné, non déployé.** Ne pas fusionner sans validation humaine.

## Progression fiable P0 — en cours (même branche `fix/trademy-p0-pedagogical-truth`)

Extension du lot, guidée par deux explorations (exercices ; répétition & maîtrise). Additif et non
destructif (aucun champ persistant ajouté). Voir **ADR-093**.

- **Cible pédagogique canonique** ✅ : `conceptId + objectiveId`, objectifs dérivés du contenu réel
  (`learningTarget.ts`).
- **Source sémantique unique** ✅ : les exercices directionnels dérivent réponse + feedback +
  accessibilité de la direction calculée sur la série affichée (`semanticExercise.ts`) — cohérence
  par construction ; remédiation liée au bon objectif.
- **Rotation déterministe** ✅ : page glissante par round (session + checkpoint), fin de la sélection
  figée des premiers exercices (`exerciseRotation.ts`).
- **Maîtrise prouvée** ✅ : machine d'états stricte new → explored → completed → strong → mastered ;
  `strong` n'est plus « maîtrisé » ; fin de la maîtrise héritée entre concepts partageant un skillId
  (`conceptMasteryState.ts`).
- **Verrou des mondes** ✅ : un monde de contenu (2 à 15) n'est jamais « terminé » par la seule
  consultation — « exploré » suffit à avancer, « terminé » exige un checkpoint (`learningMap.ts`).
- **Compatibilité** ✅ : anciennes données relues plus honnêtement, sans perte ; schéma et clés
  `patternlab.*` inchangés.

## Progression par cible persistée P0 — en cours (même branche, après revue PR #8)

Achève l'architecture par cible (ADR-094). Change le modèle **persisté** → migration non destructive
(schéma v8).

- **Progression par cible persistée** ✅ : `targets` (objectiveId → SM-2 propre) ; au plus une
  transition par cible et par session ; deux objectifs d'une compétence avancent indépendamment.
- **Maîtrise par couverture** ✅ : chaque exercice porte une cible ; la maîtrise exige la couverture
  complète des objectifs exerçables du concept (fin de l'approximation au niveau compétence).
- **Reprise de checkpoint fidèle** ✅ : réponses (avec cible) persistées et restaurées ; reprise ==
  session continue, sans double comptage.
- **Rotation persistante robuste** ✅ : compteur `rotation` qui avance même après un échec ;
  variantes différentes ; indépendant de SM-2.
- **Preuve CI** ✅ : `ci.yml` exécute la gate sur chaque pull request vers `main` (npm ci · git diff
  --check · npm run check) ; déploiement réservé à `main`.

## Modules guidés — 2e module réel (LOT 4-M, branche `feat/trademy-lot4m-guided-candles`)

Le parcours passe de **un** module guidé (Fondations) à **deux** : `world.candles` (monde 3) devient un
module guidé complet, dérivé du **registre canonique unique** `CONTENT_MODULES` (aucune seconde vérité).
Voir **ADR-109**. Les 13 autres mondes restent des collections de notions ; Fondations est inchangé.

- **Module « Lire les chandeliers »** ✅ : 4 compétences atomiques → concepts réels de `world.candles`
  (marubozu, marteau, doji, avalement haussier) ; checkpoint **propre** `checkpoint.candles`.
- **Source de scénario unique** ✅ : 16 exercices dérivés de `candleModuleScenarios.ts` (visuel = réponse
  = feedback = a11y) ; 3 interactions natives « figure » mappées sur des players **existants**
  (`identify_figure`, `place_invalidation`, `scenario`) — aucun nouveau primitif.
- **Objectifs réels** ✅ : dérivés des champs du concept ; le doji, sans invalidation documentée, n'a
  aucun exercice d'invalidation (honnêteté du modèle). Statuts éditoriaux inchangés (`needsReview`).
- **Compteurs honnêtes** ✅ : `repoTruth`/`offline` couvrent tous les modules guidés (compétences 4 → 8) ;
  routes `/session/*` pré-générées pour toutes les compétences + checkpoints (liens directs stables).
- **Vérité pédagogique préservée** ✅ : prouvée de bout en bout sur les écrans réels (session + fiche du
  monde 3) — 1 transition/cible, cible échouée due, aucune maîtrise prématurée, reprise idempotente.

> **Programme « guider tous les mondes » en cours** (autorisation propriétaire du 29/07/2026 : un
> lot par monde, gate verte à chaque fusion). Modules guidés : Fondations, Anatomie (ADR-113),
> Chandeliers (ADR-109), Structure (ADR-111), Niveaux (ADR-112), Figures (ADR-114), Indicateurs
> (ADR-115), Volume (ADR-117), Price action (ADR-118), Risk (ADR-119), Psychologie (ADR-120),
> SMC (ADR-121), Wyckoff (LOT 4-X, ADR-122) — **13 mondes guidés sur 15** (préfixe 1-13
> entièrement guidé), 2 restent des collections de notions.
> Depuis le LOT 4-P, un monde guidé se termine par la preuve (checkpoint), plus par la seule lecture.

## Programme « Visual Max » (ADR-116) — 29/07/2026, livré

Priorité propriétaire (captures à l'appui) : mascottes 3D partout, moins de texte, plus
d'interaction. Lots livrés (PR #30-#34) : avatars 3D (fin du vectoriel 2D), célébration 3D de fin
de session (asset `celebrate` réparé), fiche concept « détail à la demande », étape observe
visuelle dans toutes les leçons guidées, défrange des 8 renders (fin du liseré blanc).
**Reste ouvert** : LOT V3 — nouvelles poses 3D, bloqué sur la production design du propriétaire
(brief transmis : 10 poses, PNG fond transparent ~760 px, même style que les 8 renders).

## v1 web gratuite (ADR-110) — 29/07/2026

Décision propriétaire : publication **web d'abord**, version de test **entièrement gratuite**.
Le paywall de démonstration est retiré (statistiques complètes et deck de révision ouverts à tous,
`/premium` devient un écran d'information « Accès libre ») ; le modèle pur `premium.ts` est conservé
pour une éventuelle décision future. Zéro bouton mort (landing) ; écrans secondaires alignés sur le
canon (emoji → `TrademyIcon`, états de chargement) ; `docs/REPO_TRUTH.md` régénéré ; branche
`gh-pages` héritée supprimée (la source Pages est le workflow Actions).

## Gate canonique

```bash
npm ci
npm run check
```

Le résultat exact de la gate appartient au rapport de commit/PR, jamais à une valeur historique
copiée ici.

## Limites connues

- Les fichiers retirés de la branche restent présents dans l’historique Git public. Une purge de
  l’historique serait une opération séparée, destructive et soumise à validation explicite.
- Les imports WMB pédagogiques ne sont pas encore normalisés vers un générateur runtime unique.
- Les builds natifs signés et les stores exigent les comptes Apple/Google du propriétaire.
- `npm audit` ne remonte plus de vulnérabilité haute ou critique. Les alertes modérées restantes sont
  transitives dans la chaîne Expo ; la correction automatique proposée rétrograderait le SDK et ne
  doit pas être appliquée avec `--force`.
