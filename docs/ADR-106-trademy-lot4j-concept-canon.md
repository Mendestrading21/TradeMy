# ADR-106 — LOT 4-J : refonte canonique de la fiche concept visuelle

- **Statut** : accepté — LOT 4-J, dixième application de la fondation LOT 4-A (ADR-097), après les six
  écrans d'onglet (ADR-098 → ADR-103), le shell de navigation (ADR-104) et l'onboarding (ADR-105).
  Premier lot dédié à un **écran de profondeur** (hors des cinq onglets). **PR #20 fusionnée** dans `main`
  (squash, commit `c9bbfb5`) après validation humaine et CI verte. La limite « React #418 sur deep-link
  direct » listée plus bas est **résolue** par le LOT 4-K ([ADR-107](./ADR-107-trademy-lot4k-direct-links.md)).
- **Contexte** : le LOT 4-J applique le canon **TradeMy Learning Glass** à la **fiche concept**
  (`src/app/concept/[slug].tsx`, route `/concept/[slug]`). C'est la surface centrale de lecture d'un
  concept, pensée pour croître vers 500+ entrées, atteinte depuis la Bibliothèque (LOT 4-F), le glossaire,
  les mondes et les concepts liés. Elle restait incohérente avec le canon.

## Problème (mesuré dans le code, sur `main` `644425f`)
- **Emoji système** `🔎` dans l'état « concept introuvable » (`EmptyState icon="🔎"`).
- **Glyphe de commande** `›` détourné en navigation dans les chips « concepts liés » (`{rc.title} ›`).
- **Zéro `TrademyIcon`** : aucune iconographie fonctionnelle de la famille.
- **Couleur `technical`/cyan (annotation) détournée** hors de son rôle : état de **maîtrise**, libellé
  d'en-tête (monde/catégorie), chips de **navigation** « concepts liés » (bordure + texte cyan), et —
  **indirectement** — la puce de **difficulté** via `difficultyTone`, qui renvoie `colors.technical` pour
  les difficultés 1–2 (majorité du corpus). Un simple garde-fou de source ne détecte pas ce dernier cas.
- **Maîtrise portée surtout par la couleur**, sans icône dédiée cohérente avec la Bibliothèque.
- **Aucun test ni capture** propres à cette route.

## Décision — présentation au canon, logique intacte
Refonte **présentationnelle** de l'écran : un seul système d'icônes (`TrademyIcon`), couleurs sémantiques
strictes, hiérarchie claire, graphique pédagogique (`VisualCard`) prioritaire. **Aucune** donnée, logique,
route, analytics ni persistance n'est modifiée.

### Règles iconographiques
- `🔎` (introuvable) → `StateView variant="empty" iconName="search"` (primitive d'état partagée).
- `›` (concepts liés) → chip actionnable (`Pressable` rôle bouton, nom « Ouvrir … », cible ≥ 44 px) avec
  `TrademyIcon name="chevron-right"`.
- Titres de section dotés d'icônes de la famille : `info` (En bref), `book` (Définition), `search`
  (Comment reconnaître), `market-up`/`market-down`/`chart` (scénarios), `false-signal` (Faux signaux),
  `review` (Flashcard), `library` (Concepts liés), `warning` (À relire, Invalidation).
- Le composant partagé `TrademyIcon` n'est **pas** modifié (icônes existantes réutilisées).

### Règles de couleurs (tokens dédiés, jamais détournés)
| Emploi | Token | Note |
|---|---|---|
| Maîtrise (5 états) | `textMuted`/`info`/`primaryBright`/`success`/`mastery` | **MÊME mapping que la Bibliothèque** (LOT 4-F) : `STATE_META` local identique — cohérence liste ↔ fiche. Icône + libellé + couleur (jamais la couleur seule). |
| Direction de scénario | `bullish` / `bearish` / `neutral` | RÉSERVÉS au sens marché ; déclarés dans `SCENARIO_META`. |
| Faux signaux, invalidation, À relire | `warning` | AVERTISSEMENT — jamais `bearish` (un faux signal n'est pas une direction de marché). |
| **Difficulté de la puce** | **Découverte (1–2) → `neutral` · Intermédiaire (3) → `warning` · Avancé (4–5) → `advanced`** | Mapping local strict `DIFFICULTY_COLOR`. `difficultyTone` reste employé pour son **libellé** seulement : sa **couleur** renverrait `technical` pour les difficultés 1–2 (cyan d'annotation détourné), donc la puce **n'utilise plus `tone.color`**. |
| Flashcard, accent de marque | `primaryBright` | Marque. |
| En-tête monde/catégorie, alias, puces d'observation | `textMuted` | Neutre — plus de cyan d'annotation détourné. |

`technical`/cyan est **absent de tout chemin d'exécution de cet écran** (hors du `VisualCard` partagé) : ni
en accès direct dans la source, ni **indirectement** via la couleur de `difficultyTone` (retirée de la puce).
C'est **prouvé au RUNTIME** — `concept.integration.test.tsx` vérifie que la couleur EFFECTIVE de la puce
de difficulté vaut `neutral`/`warning`/`advanced` selon la difficulté et **jamais** `technical`.

## Alternatives considérées
1. **Ajouter un garde-fou d'hydratation** (comme `lesson/[id]` : `generateStaticParams` + rendu différé)
   pour supprimer le React #418 du deep-link direct → **écarté de ce lot** : c'est une correction de route
   (correctness), hors du périmètre présentationnel, et elle complexifierait les tests de rendu. Documentée
   comme limite ; à traiter dans un lot de robustesse dédié.
2. **Regrouper fiche concept + fiche leçon** en un seul lot → écarté : « un lot = un résultat utilisateur ».
3. **Nouveau token de maîtrise propre à la fiche** → écarté : réutiliser le mapping Bibliothèque garantit
   la cohérence et évite un doublon.

## Périmètre
- **Autorisé / touché** : `src/app/concept/[slug].tsx` (présentation, mappings/styles locaux) ; tests
  `concept.integration.test.tsx`, `conceptNoEmoji.test.ts`, `conceptSemanticColors.test.ts` ;
  `scripts/capture-concept.mjs` ; `docs/lot4j-captures/` ; `docs/ADR-106-*.md` ; `docs/DECISIONS_INDEX.md` ;
  bascule `docs/ADR-105-*.md` (statut seulement).
- **Interdit / inchangé** : `src/data/**`, `V5_CONCEPTS`, `conceptBySlug`, `relatedConcepts`,
  `conceptMasteryStatus`, `needsEditorialReview`, `src/engines/**`, `VisualCard`, `CharacterScene`,
  mascottes, `navigation.ts`, `Screen`, `TrademyIcon` partagé, shell/onglets, `session/[skillId]`,
  `lesson/[id]`, `monde/[id]`, XP/progression/répétition espacée/persistance, `AsyncStorage`, repositories,
  migrations, taxonomie/payload analytics, `package.json`/lockfile/dépendances, contenu, routes/slugs.

## Logique préservée (vérifiée avant/après)
Récupération par slug ; état « introuvable » ; `relatedConcepts` ; `conceptMasteryStatus` ;
`needsEditorialReview` + `EDITORIAL_REVIEW_NOTICE` ; favoris/`toggleFavorite` ; `markRecentlyViewed` ;
`markConceptExplored` (une seule fois, après `ready`) ; garde `ready` ; `analytics.track('concept_viewed',
{ categoryId, hasVisual })` — **nom et payload inchangés, aucun nouvel évènement** ; navigation
`/concept/[slug]` des concepts liés ; rendu `VisualCard` ; disclaimer du concept (+ disclaimer canonique).

## Preuves (tests d'intégration + garde-fous)
- `concept.integration.test.tsx` (rendu RÉEL, `useProgress` mocké) : fiche riche, état introuvable,
  `VisualCard` conservée, `concept_viewed` une fois avec payload exact + aucun autre évènement, marquage
  récent/exploré une seule fois après `ready`, favoris, concepts liés actionnables + navigation, avis de
  relecture, disclaimers, maîtrise par icône + libellé, remontage déterministe, et — verrou RUNTIME du
  correctif — **couleur EFFECTIVE de la puce de difficulté** = `neutral` (1–2, jamais `technical`) /
  `warning` (3) / `advanced` (4–5).
- `conceptNoEmoji.test.ts` : aucun emoji, aucun glyphe de commande (dont `‹ ›`), plus de
  `String.fromCharCode`/`emoji=`/`icon="…"`, `TrademyIcon`/`iconName` employés.
- `conceptSemanticColors.test.ts` : `technical` absent ; `bullish`/`bearish` confinés à `SCENARIO_META` ;
  maîtrise sur tokens dédiés (canon Bibliothèque) sans marché ni cyan ; **la puce de difficulté n'emploie
  plus `tone.color`** et `DIFFICULTY_COLOR` mappe sur `neutral`/`warning`/`advanced` (jamais `technical`) ;
  un seul système d'icônes ; mappings déclarés ; taxonomie analytics = `concept_viewed` seul ; aucune
  mutation de dataset.

## Captures (déterministes, script séparé)
`scripts/capture-concept.mjs` → `docs/lot4j-captures/` (manifeste séparé). Horloge/fuseau figés
(`Europe/Zurich`), **parcours client réel** (racine → Reprendre → Bibliothèque → recherche → clic fiche =
`router.push`, sans rechargement → **aucun #418**) ; l'état « introuvable » est atteint par navigation
d'historique DANS le SPA monté. Contrôles par capture : aucun emoji/glyphe/valeur invalide, aucun
débordement ; la capture clavier vérifie un focus VISIBLE. 12 PNG : `concept-marteau-320/-390/-430`,
`concept-marteau-web-1024/-web-1440`, `concept-large-text` (zoom 1,25), `concept-reduced-motion`,
`concept-keyboard-focus-web`, `concept-second-doji` (2ᵉ concept), `concept-review-notice`,
`concept-related`, `concept-not-found`. Inspectées visuellement une à une.

## Accessibilité
`FavoriteButton` nommé ; concepts liés = boutons nommés « Ouvrir … » avec icône `chevron-right`, cible
≥ 44 px ; maîtrise compréhensible sans couleur (icône + libellé) ; résumé textuel du `VisualCard` (porté
par `accessibilityLabel`) ; focus clavier cyan visible (`:focus-visible`) ; contrastes AA ; texte agrandi
et `reduced-motion` couverts par captures.

## Risques
Faibles-moyens : écran surtout de lecture. Risque principal = préserver le marquage exploration/maîtrise
et ne pas détourner `bullish`/`bearish` (légitimes pour les scénarios). Mitigé par les verrous de test
(marquage une fois, couleurs sémantiques, analytics).

## Rollback
Revert du commit unique du LOT 4-J ; aucune migration ni changement de schéma → rollback sans effet de
bord.

## Limites restantes
- **React #418 sur deep-link direct** de `/concept/[slug]` (route dynamique non pré-rendue, sans garde
  d'hydratation) : inchangé par ce lot (correction de route hors périmètre ; même traitement que
  `lesson/[id]` à prévoir dans un lot de robustesse). En usage réel (navigation in-app) et dans les
  captures (parcours client), aucune erreur. **→ RÉSOLU par le LOT 4-K ([ADR-107](./ADR-107-trademy-lot4k-direct-links.md))** :
  `generateStaticParams` dérivé de `V5_CONCEPTS` + rendu initial indépendant du slug ; l'accès direct et
  le rechargement sur un slug connu n'émettent plus de #418 (vérifié par `scripts/verify-direct-links.mjs`).
- **Fiche sans visuel non capturable** : les 67 concepts V5 portent tous un `visualSpec` ; l'état « sans
  visuel » est géré (rendu conditionnel) mais non illustrable avec les données réelles.
- Contrôles natifs iOS/Android **non exécutés** : seuls Chromium et les tests React Native/Jest l'ont été.

**LOT suivant : non commencé.**
