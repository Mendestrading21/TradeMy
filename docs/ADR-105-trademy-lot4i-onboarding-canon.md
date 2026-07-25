# ADR-105 — LOT 4-I : application du canon à l'Onboarding & prise en main

- **Statut** : proposé — LOT 4-I, neuvième application de la fondation LOT 4-A (ADR-097), après les six
  écrans verticaux (ADR-098 → ADR-103) et le shell de navigation (ADR-104). Premier lot dédié au **premier
  contact** (flux de prise en main hors des cinq onglets). **PR en BROUILLON**, en attente de validation
  humaine ; passera à « accepté » à la validation.
- **Contexte** : le LOT 4-I applique le canon **TradeMy Learning Glass** à l'**onboarding**
  (`src/app/onboarding.tsx`, route `/onboarding`, flux de sept étapes du premier lancement). L'écran
  restait la dernière surface à utiliser des **emojis système** (👋🎯🎉⏱️) et des **lettres décoratives**
  (A/B/C via `String.fromCharCode`) en guise de pictogrammes. Le LOT change **uniquement** la présentation
  (icônes, hiérarchie, a11y, disclaimer) sans toucher à la logique métier, aux données, à la persistance,
  aux moteurs, aux mascottes ni à la navigation.

## Diagnostic initial (mesuré dans le code)
- `onboarding.tsx` rendait les cartes d'option avec un champ `emoji: string` tiré des datasets
  (`OBJECTIVES`/`LEVELS`/`TOPICS` portent un `.emoji`), un pseudo-pictogramme alphabétique
  `String.fromCharCode(65 + i)` (A/B/C) sur les options de diagnostic, un titre « Bienvenue » 👋, un titre
  « Ton parcours » 🎉, une icône de résultat 🎯 et des `Chip` `icon="⏱️"` / `icon="🎯"`.
- La logique de prise en main était **déjà correcte** et est **conservée telle quelle** : sept étapes
  (`STEPS`), profil (`OnboardingProfile`, `ONBOARDING_SCHEMA_VERSION`), diagnostic (`DIAGNOSTIC`),
  recommandation (`recommendStartSkill`), dosage (`exercisesForMinutes`), persistance (`useProgress` →
  `completeOnboarding`), passation vers `/session/[skillId]`, et analytics
  (`onboarding_started`, `goal_selected`, `path_generated`, `diagnostic_completed`).

## Décision — présentation au canon, logique intacte
Un **seul système d'icônes** (`TrademyIcon`) remplace tous les emojis et lettres. Les pictogrammes sont
dérivés des `value` **stables** des datasets via des mappings PRÉSENTATIONNELS déclarés dans l'écran, sans
jamais modifier la donnée ni détourner une couleur/icône sémantique de son sens (marché, annotation,
récompense, maîtrise restent réservés).

### Mapping option → icône `TrademyIcon`
| Groupe | `value` | Icône | Rationale |
|---|---|---|---|
| Objectif | `debuter` | `learn` | commencer / apprendre |
| Objectif | `comprendre_graphiques` | `chart` | lire un graphique |
| Objectif | `reviser` | `review` | réviser ses bases |
| Objectif | `gerer_risque` | `risk` | cerner le risque |
| Niveau | `debutant` | `hint` | premiers repères |
| Niveau | `initie` | `book` | quelques bases |
| Niveau | `intermediaire` | `progression` | consolider |
| Temps | 3/5/10 min | `timer` | une seule icône de temps, différenciée par le libellé |
| Sujets | `actions` | `book` | comprendre une action |
| Sujets | `tendance` | `chart` | tendance & niveaux |
| Sujets | `chandeliers` | `lab` | chandeliers japonais |
| Sujets | `figures` | `target` | figures chartistes |

- **Cartes d'option (`OptionCard`)** : toute la carte est un `Pressable` `accessibilityRole="button"`,
  `accessibilityState={{ selected }}` et `accessibilityLabel` = `label` ou `label. hint`. L'état
  sélectionné est exposé **autrement que par la seule couleur** : contour (forme), icône `check` et état
  accessible. Cible tactile ≥ 44 px (`minHeight: 44` sur la rangée).
- **Diagnostic** : les options de réponse sont des cartes **libellé seul** (aucune lettre A/B/C, aucun
  emoji, aucune icône) — la bonne réponse n'est jamais divulguée par un pictogramme.
- **Couleurs** : violet (marque/CTA : `primary`/`primaryBright`) pour l'action et l'accent d'état ; les
  `Chip` du récapitulatif emploient `info` (annotation/neutre) et `neutral`, **jamais** vert/rouge de
  marché ni or de récompense.
- **Positionnement éducatif** : le composant `Disclaimer` (« Trademy est une application éducative. Aucun
  conseil… Le trading comporte un risque de perte. ») est présent sur l'écran d'accueil (étape 0) et sur
  l'écran de résultat (étape 6). La promesse produit est explicite : « Apprends à lire un graphique en
  cinq minutes par jour. »

## Preuves exécutables (tests d'intégration + garde-fous)
- `onboarding.integration.test.tsx` (rendu RÉEL de l'écran de production, `useProgress` mocké pour capter
  `completeOnboarding`, reste de `@/data` RÉEL) : sept étapes exposées, progression et navigation
  avant/arrière, blocage sans sélection obligatoire, sélection unique (objectif/niveau/durée) et **multiple**
  (sujets), mapping option → `TrademyIcon` (`learn/chart/review/risk`, aucune lettre A/B/C, aucun emoji),
  diagnostic en trois questions sans lettre + score exposé, compétence recommandée par la logique
  existante, `completeOnboarding` appelé **une seule fois**, `router.replace` vers `/session/[skillId]`
  (route inchangée), `goal_selected` avec la `value` exacte et **aucun** évènement hors taxonomie, aucune
  écriture de persistance supplémentaire, remontage déterministe, aucune valeur invalide.
- `onboardingNoEmoji.test.ts` : aucun emoji (`findEmoji`), aucun glyphe de commande, plus de
  `String.fromCharCode`, plus de prop `emoji={`, plus de `icon="` (les `Chip` passent par `iconName`).
- `onboardingSemanticColors.test.ts` : aucune couleur détournée (bullish/bearish/reward/mastery/advanced/
  confirmation/invalidation/technical) ; tokens attendus présents (`primary/primaryBright/info/neutral/
  success`) ; un seul système d'icônes ; mappings présentationnels déclarés ; taxonomie analytics
  inchangée ; aucune mutation de dataset.

## Captures (déterministes, script séparé)
`scripts/capture-onboarding.mjs` → `docs/lot4i-captures/` (manifeste séparé — ne touche à aucune capture
antérieure), horloge/fuseau figés (`Europe/Zurich`), parcours client réel sur `/TradeMy/onboarding` (clics
réels : « Commencer »/« Continuer », cartes d'option, diagnostic complet), vérification de l'étape à chaque
capture. Contrôles par capture : aucun emoji/glyphe/valeur invalide, aucun débordement horizontal ; la
capture clavier vérifie un focus VISIBLE (anneau `:focus-visible` cyan). 12 PNG : `onboarding-welcome-320`,
`onboarding-goal-320`, `onboarding-level-320`, `onboarding-time-320`, `onboarding-topics-320`,
`onboarding-diagnostic-320`, `onboarding-result-320`, `onboarding-goal-390`, `onboarding-result-wide-web`
(1440), `onboarding-large-text` (zoom 1,25), `onboarding-reduced-motion`, `onboarding-keyboard-focus-web`.
Inspectées visuellement une à une.

## Inspection visuelle
Les douze captures confirment : accueil premium (promesse, mascotte Toto, choix de guide Toto/Bobo,
disclaimer, CTA violet), objectifs/niveaux/durées/sujets avec icônes canoniques distinctes et **aucun**
emoji ni lettre, « Continuer » désactivé avec sa raison visible tant qu'aucun choix n'est fait, diagnostic
à cartes libellé-seul, récapitulatif à `Chip`-icônes (`timer/checkpoint/chart/lab`) et disclaimer, focus
clavier cyan visible, rendu pleine largeur en web, libellés intacts en texte agrandi et en `reduced-motion`
— sans aucune régression de la logique de prise en main.

## Confirmation — non modifiés
Aucune modification de : `OBJECTIVES`/`LEVELS`/`DAILY_OPTIONS`/`TOPICS`/`DIAGNOSTIC`, `src/data/**`,
`recommendStartSkill`, `exercisesForMinutes`, calcul de profil, `ONBOARDING_SCHEMA_VERSION`,
`completeOnboarding`, `useProgress`, persistance, `AsyncStorage`, repositories, migrations, schémas,
taxonomie analytics (nom/payload de `goal_selected` inclus), `src/engines/**`, `MiniVisual`,
`CharacterScene`, `MascotFigure`, `GuideSelectionCard`, mascottes Toto/Bobo, `src/lib/navigation.ts`,
`Screen`, `TrademyTabBar`, le shell, les cinq écrans d'onglet, routes/slugs, contenu, prix/abonnements/
paywalls, `package.json`/lockfile/dépendances. Le diff se limite à `onboarding.tsx`, les tests/garde-fous,
le script de captures et la documentation.

## Limites restantes
- Contrôles natifs iOS/Android **non exécutés** : seuls Chromium et les tests React Native/Jest l'ont été.
- L'écran de session quotidienne (`/session/[skillId]`), cible de la passation, **n'est pas** dans le
  périmètre de ce lot : il reste à traiter dans un lot ultérieur.

**LOT suivant : non commencé.**
