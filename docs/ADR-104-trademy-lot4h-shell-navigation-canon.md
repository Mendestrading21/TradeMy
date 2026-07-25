# ADR-104 — LOT 4-H : shell global et navigation responsive canonique

- **Statut** : accepté — LOT 4-H, huitième application de la fondation LOT 4-A (ADR-097), après les six
  écrans verticaux (ADR-098 → ADR-103). Premier lot dédié à l'**enveloppe** (shell) plutôt qu'à un écran.
  **PR #18 fusionnée** dans `main` (squash, commit `fd082be`) après validation humaine et CI verte.
- **Contexte** : la barre d'onglets par défaut de react-navigation (via `expo-router` `Tabs`) tronquait
  les libellés longs (« Bibliothèque », « Laboratoire ») sous ~360 px, et sa présentation restait
  générique. Le LOT 4-H remplace **uniquement** la barre par un composant premium, lisible dès 320 px,
  sans toucher aux moteurs, données, contenu ni logique métier des cinq écrans.

## Diagnostic initial (mesuré dans le code)
- `src/app/(tabs)/_layout.tsx` configurait `Tabs` avec `tabBarActiveTintColor`/`tabBarStyle` et une icône
  par onglet, mais **laissait la barre par défaut** rendre les libellés horizontalement.
- **Cause exacte de la troncature à 320 px** : la barre par défaut répartit ~64 px par onglet et rend le
  libellé sur une ligne avec ellipsis ; « Bibliothèque » (12 car.) et « Laboratoire » dépassent la largeur
  disponible et sont **coupés**. C'est la dette de shell notée dès les LOT 4-B → 4-G.
- Source des libellés/icônes/routes : `src/lib/navigation.ts` (`PRIMARY_SPACES`, verrouillé par
  `navigation.test.ts`) — **conservée intacte**. Le shell `Screen` (`src/design-system/components/Screen.tsx`)
  gère les safe-areas des écrans — **non modifié**.

## Décision — barre `TrademyTabBar` (composant de navigation dédié)
Nouveau composant `src/components/TrademyTabBar.tsx` (hors arbre de routage `app/`), branché via le
render-prop `tabBar` de `Tabs`. Il **dérive** ses cinq entrées de `PRIMARY_SPACES` (ordre canonique) et
retrouve la route réelle (clé + focus) dans l'état du navigateur ; les écrans hors-barre (`href: null` :
revisions, lecons, quiz) restent montés mais ne sont **jamais** rendus dans la barre.

- **Composition VERTICALE** (icône 22 px au-dessus du libellé), largeur distribuée (`flex: 1`), typographie
  10 px `letterSpacing -0.1` : les cinq libellés tiennent **sans troncature dès 320 px** (mesuré :
  scrollWidth ≤ clientWidth pour « Bibliothèque »).
- **Cible tactile ≥ 44 px** (mesuré 48 px de haut), repère `role="navigation"` « Navigation principale ».
- **Vrais liens** : chaque onglet est un `Link` (expo-router) `asChild` → ancre `<a href>` réelle. Les
  routes EXISTANTES sont préservées (`/`, `/parcours`, `/apprendre`, `/laboratoire`, `/profil`) ; la
  navigation sans JS / le SSR / la sémantique de lien / les **références HTML** (558) sont conservés.

## Mapping onglet → route → icône → texte
| Espace | Route (href) | Icône `TrademyIcon` | Libellé |
|---|---|---|---|
| Accueil | `/` | `home` | Accueil |
| Apprendre | `/parcours` | `learn` | Apprendre |
| Bibliothèque | `/apprendre` | `library` | Bibliothèque |
| Laboratoire | `/laboratoire` | `lab` | Laboratoire |
| Profil | `/profil` | `profile` | Profil |

Aucune route renommée ; aucun second système d'icônes ; aucun emoji ni glyphe Unicode de commande.

## État actif — plusieurs indices, jamais la seule couleur
- **Forme/fond** : capsule arrondie remplie (`surfaceSelected`) + **contour** `primary` (accent de marque).
- **Icône** : trait plus épais (2.6 vs 2).
- **Couleur** : accent `primaryBright` (vs `textSecondary` inactif).
- **Nom accessible** : l'actif est exposé « `Titre`, espace actif » (texte, pas couleur) **et** par
  `accessibilityState.selected`.

L'accent d'état reste l'**accent de MARQUE** (violet), cohérent avec l'état sélectionné partout ailleurs
(pilules, SegmentedControl). Le canon réserve cyan = annotation et vert/rouge = marché : les employer pour
la navigation serait un détournement — d'où le choix du violet plutôt que du « cyan/vert » suggéré.

## Responsive & safe-areas
Vérifié à 320 / 390 / 430 / 768 / 1024 / 1440 px, en texte agrandi (zoom navigateur) et `reduced-motion` :
cinq onglets visibles, aucun libellé tronqué, aucun débordement horizontal, aucun chevauchement, aucune
cible < 44 px. La barre respecte l'inset bas (`insets.bottom` du navigateur, borné à `spacing.xs`).

## Accessibilité & focus clavier
Repère `navigation` nommé ; chaque onglet est un lien avec nom accessible non ambigu ; l'état actif est
exposé (nom + `selected`) ; ordre de focus logique (ordre DOM) ; **focus clavier visible** sur le web
(anneau natif + bordure `focusRing` sur la capsule) — capturé dans `shell-keyboard-focus-web`. Icônes
décoratives (masquées) ; aucune information par la seule couleur ; contraste AA (idle `textSecondary` 9.0,
actif `primaryBright` sur `surfaceSelected` 6.0).

## Motion
**Aucune animation** : la barre est statique (état actif par style, pas par transition). `reduced-motion`
est donc respecté par construction, et le rendu est déterministe pour tests et captures.

## Tokens utilisés
`surface`, `borderStrong`, `surfaceSelected`, `primary`, `primaryBright`, `textSecondary`, `focusRing`,
`radius.lg`, `spacing.xs`. Aucun token détourné (`bullish`/`bearish`/`reward`/`mastery`/`advanced`/
`confirmation`/`invalidation`/`technical` absents du shell). Aucune dépendance ni pack d'icônes ajouté.

## Tests
- `shellNavigation.integration.test.tsx` (rendu RÉEL de `TrademyTabBar`, props de barre fabriquées) :
  cinq onglets exactement (jamais les écrans hors-barre) ; libellés canoniques (ordre) ; mapping href des
  routes existantes + clic = navigation ; icônes Trademy `home/learn/library/lab/profile` ; un seul actif ;
  état actif exposé par le nom (jamais la seule couleur) et déterministe selon la route ; aucun bouton
  mort ; aucune écriture de persistance ; remontage déterministe ; aucune valeur invalide.
- `shellNoEmoji.test.ts` (findEmoji + glyphes de commande) et `shellSemanticColors.test.ts` (aucune
  couleur détournée ; tokens de marque/surface/focus présents ; un seul système d'icônes ; aucun import de
  moteur/dataset/analytics/persistance ; cible 44 px).

## Captures (déterministes, script séparé)
`scripts/capture-shell-navigation.mjs` → `docs/lot4h-captures/` (manifeste séparé — ne touche à aucune
capture antérieure), horloge/fuseau figés, parcours client réel (clics sur les cinq liens, vérification
route + onglet actif après chaque clic). Contrôles par capture : cinq liens, mapping href, un seul actif,
aucun libellé tronqué (scrollWidth ≤ clientWidth), cible ≥ 44 px, aucun débordement/chevauchement, aucun
emoji/glyphe/valeur invalide ; la capture clavier vérifie un focus VISIBLE. 11 PNG : `shell-home-320`,
`shell-learn-320`, `shell-library-320`, `shell-lab-320`, `shell-profile-320`, `shell-home-390`,
`shell-lab-430`, `shell-keyboard-focus-web`, `shell-wide-web` (1440), `shell-large-text` (zoom),
`shell-reduced-motion`. Inspectées visuellement une à une.

## Inspection visuelle
Les onze captures confirment : cinq onglets lisibles dès 320 px (« Bibliothèque »/« Laboratoire » complets),
capsule active suivant l'écran, icônes canoniques, focus clavier cyan visible, barre pleine largeur en web,
libellés intacts en texte agrandi, rendu statique en `reduced-motion` — sans aucune régression des écrans.

## Confirmation — non modifiés
Aucune modification de : moteurs pédagogiques (`src/engines/**`), calculs d'indicateurs, machine de replay,
moteurs de graphique, datasets, `CHART_SCENARIOS`, `INDICATOR_LABS`, `learningContent`, `V5_CONCEPTS`,
fiches/leçons/quiz/flashcards, progression/maîtrise/répétition espacée/objectifs/checkpoints, repositories,
persistance, `AsyncStorage`, migrations, analytics, mascottes Toto/Bobo, `src/lib/navigation.ts`, le shell
`Screen`, les écrans métier des cinq onglets, `package.json`/lockfile/dépendances, routes/slugs métier.
Le diff se limite à `TrademyTabBar.tsx`, `(tabs)/_layout.tsx`, les tests/garde-fous, le script de captures
et la documentation.

## Limites restantes
- La barre reste une **liste de liens** (repère `navigation`), non un `tablist` : c'est le modèle correct
  pour une navigation inter-pages (SSR/offline/crawl), l'état actif étant exposé par `aria-current`-like
  via le nom accessible et `selected` (le lien web n'accepte pas `aria-selected`).
- Contrôles natifs iOS/Android **non exécutés** : seuls Chromium et les tests React Native/Jest l'ont été.

**LOT suivant : LOT 4-I — Onboarding & prise en main au canon (voir ADR-105).**
