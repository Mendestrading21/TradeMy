# ADR-107 — LOT 4-K : robustesse des liens directs de contenu (suppression du React #418)

- **Statut** : accepté — LOT 4-K, lot de **robustesse** (correctness), consécutif au LOT 4-J (ADR-106) qui
  refondait la présentation de la fiche concept et documentait la limite « React #418 sur deep-link
  direct » comme à traiter hors de son périmètre. **PR #21 fusionnée** dans `main` (squash, commit
  `b35a95f`) après validation humaine, CI verte et déploiement Pages. Le même garde-fou de génération
  statique est réutilisé pour la fiche Monde canonique au LOT 4-L ([ADR-108](./ADR-108-trademy-lot4l-world-canon.md)).
- **Contexte** : les routes dynamiques de **contenu** `/concept/[slug]` (`src/app/concept/[slug].tsx`) et
  `/glossaire/[slug]` (`src/app/glossaire/[slug].tsx`) émettaient une divergence d'hydratation **React #418**
  lors d'un **accès direct** ou d'un **rechargement** (deep-link), alors que la navigation in-app (SPA) était
  saine. Ce lot est **exclusivement** un correctif de génération statique et d'hydratation : **aucune refonte
  visuelle**, aucune donnée, aucun moteur, aucune analytics modifiés.

## Problème (cause racine prouvée)
L'export web est **statique** (`expo export --platform web`, hébergé sur GitHub Pages). Une route dynamique
sans `generateStaticParams` n'émet que le **template** `concept/[slug].html` (idem glossaire), mais **aucun**
fichier concret par slug. Sur GitHub Pages, une requête vers `/TradeMy/concept/marteau` ne trouve pas de
fichier → **repli `404.html`** (qui, ici, sert le HTML de l'**accueil**). Le client, lui, résout `marteau`
depuis l'URL et rend la **fiche** au premier paint : le HTML servi (accueil) **diverge** du premier rendu
client (fiche) → **React #418** (hydration mismatch).

Prouvé avant correctif par le harnais Chromium (`scripts/verify-direct-links.mjs`) reproduisant la sémantique
Pages : les 8 deep-links étaient servis par `404.html` et déclenchaient le #418. La cause est **double** :
(1) absence de HTML concret par slug ; (2) premier rendu client dépendant du slug (donc différent du HTML
servi). **Les deux couches doivent être corrigées.**

## Décision — réutiliser le mécanisme éprouvé de `lesson/[id]`, sans nouvelle architecture
Deux garde-fous par route, exactement comme `src/app/lesson/[id].tsx` :

### 1. `generateStaticParams` dérivé de la source canonique
- **Concept** : `V5_CONCEPTS.map((c) => ({ slug: c.slug }))` → un `concept/<slug>.html` **concret** par
  concept connu (67). GitHub Pages sert ce fichier **directement** (plus de repli `404.html`).
- **Glossaire** : `GLOSSARY_TERMS.map((t) => ({ slug: t.slug }))` → un `glossaire/<slug>.html` par terme (24).
  Dérivé de **`GLOSSARY_TERMS`**, **jamais** `UNIFIED_GLOSSARY` (85 entrées, dont les entrées V5 sont routées
  vers `/concept/[slug]` ; le glossaire ne pré-génère que ses propres termes).
- **Aucune liste de slugs recopiée, aucun compteur codé en dur** : tout concept/terme ajouté à son registre
  produit automatiquement son HTML au prochain build ; aucune omission, aucun doublon, jamais le littéral
  `[slug]`. Verrouillé exhaustivement par `src/integration/staticParams.test.ts`.

### 2. Premier rendu indépendant du slug (`mounted`)
Un état `mounted` (`useState(false)`) bascule à `true` via une **microtâche** (`Promise.resolve().then(...)`,
hors chemin synchrone), **annulée au démontage** (`cancelled`). Tant que `!mounted`, l'écran rend un
`StateView variant="loading"` **stable et indépendant du slug** (« On prépare la fiche… » / « On prépare le
terme… »), **identique** au HTML pré-rendu statiquement. Après hydratation, la microtâche déclenche un
re-rendu qui affiche la fiche/le terme réels. Le premier paint client **coïncide** donc avec le HTML servi →
plus de #418.

- **`ready` (persistance) n'est PAS détourné** : `mounted` décrit **uniquement** le montage de la route ;
  `ready` reste réservé à la disponibilité de la progression. Les deux sont distincts.
- **Ordre des hooks stable** : tous les `useEffect` sont déclarés **avant** le retour anticipé `if (!mounted)`.
  Le garde-fou ne conditionne que le **rendu**, jamais l'exécution des hooks.

### Effets métier — préservés EXACTEMENT une fois
Le garde-fou ne gate pas les effets (keyés sur `concept`/`term`/`ready`, pas sur `mounted`) ; les références
du provider sont mémoïsées (`useCallback`) → la bascule `mounted` ne re-déclenche aucun effet.
- **Concept** : `analytics.track('concept_viewed', { categoryId, hasVisual })` (nom + payload **inchangés**,
  aucun nouvel évènement) ; `markRecentlyViewed(slug)` + `markConceptExplored(slug, worldId)` **après `ready`**,
  une seule fois ; favoris, concepts liés, maîtrise, avis de relecture, `VisualCard`, disclaimers — intacts.
- **Glossaire** : `analytics.track('concept_viewed', { category, hasRelatedSkill })` (inchangé) ;
  `markRecentlyViewed(slug)` + `markConceptExplored(slug)` **après `ready`**, une seule fois ; favoris, termes
  reliés (`/glossaire/[slug]`), session liée (`/session/[skillId]`) — intacts.
- **Aucune écriture pendant le pré-rendu statique** (les effets ne s'exécutent qu'au montage client).

## Alternatives écartées
1. **`suppressHydrationWarning` / filtrage des erreurs console** → écarté : masque le symptôme, ne corrige pas
   la divergence ; interdit par le périmètre.
2. **Rechargement forcé / `setTimeout` / faux `window`** → écarté : contournements fragiles, interdits.
3. **Détourner `ready` (useProgress) comme drapeau d'hydratation** → écarté : mélange persistance et montage,
   casserait le marquage.
4. **Refondre le repli `404.html`** → écarté : hors périmètre ; la limite « slug inconnu tapé directement »
   est documentée, pas contournée (voir « Limites »).

## Périmètre
- **Autorisé / touché** : `src/app/concept/[slug].tsx` et `src/app/glossaire/[slug].tsx` (ajout
  `generateStaticParams` + garde-fou `mounted` uniquement) ; `src/integration/staticParams.test.ts` (nouveau),
  `src/integration/concept.integration.test.tsx` (hydratation), `src/integration/glossaire.integration.test.tsx`
  (nouveau) ; `scripts/verify-web-build.mjs` (contrôle d'émission), `scripts/verify-direct-links.mjs` (nouveau,
  Chromium) ; `scripts/capture-concept.mjs` (commentaire corrigé) ; `docs/ADR-107-*.md`, `docs/DECISIONS_INDEX.md`,
  bascule `docs/ADR-106-*.md` (statut + note).
- **Interdit / inchangé** : `src/data/**`, `V5_CONCEPTS`/`GLOSSARY_TERMS`/`UNIFIED_GLOSSARY`, moteurs,
  progression/maîtrise/répétition espacée, `AsyncStorage`/migrations, taxonomie/payload analytics, présentation
  visuelle (couleurs, tokens, icônes, contenu, espacements) des deux fiches, `session/[skillId]`, `lesson/[id]`,
  `monde/[id]`, `package.json`/lockfile/dépendances. La **dette visuelle du glossaire** (emoji `🔎`, `technical`
  sur les chips reliés) est **volontairement conservée** — hors périmètre d'un lot de robustesse.

## Preuves (tests)
- **`staticParams.test.ts`** (`@jest-environment node`) : `generateStaticParams` de chaque route == slugs du
  registre canonique (mêmes valeurs, même ordre, unicité, ni omission ni ajout, jamais `[slug]`) ; glossaire
  strictement plus court que `UNIFIED_GLOSSARY`. Échoue si `generateStaticParams` est retiré/dérive.
- **`concept.integration.test.tsx`** (rendu RÉEL, `useProgress` mocké à **références stables**) : premier paint
  = **chargement seul** (ni « Marteau » ni « Concept introuvable », pas de `VisualCard`) ; après flush = fiche
  réelle ; `concept_viewed`/récent/exploré **exactement une fois** (un rendu d'hydratation supplémentaire ne
  double pas) ; slug invalide → « introuvable » après hydratation, **aucun effet** ; **tous les invariants
  LOT 4-J conservés** (couleur runtime de la puce de difficulté, etc.).
- **`glossaire.integration.test.tsx`** (parallèle) : chargement stable, terme réel après hydratation, introuvable
  sans effet, `concept_viewed { category, hasRelatedSkill }` une fois, marquage une fois, favori, terme relié →
  `/glossaire/[slug]`, session liée → `/session/[skillId]`, remontage déterministe.
- **`verify-web-build.mjs`** (section D) : échoue si `generateStaticParams` disparaît d'une route, si seul le
  template `[slug].html` existe, ou si un slug canonique témoin (`marteau`/`doji`, `bull-bear`/`volatilite`)
  n'a pas son HTML concret.

## Preuve d'exécution (Chromium, `scripts/verify-direct-links.mjs`)
Sert `dist/` en reproduisant EXACTEMENT GitHub Pages (préfixe `/TradeMy/`, URLs sans extension, repli `404.html`),
écouteurs console/pageerror/rejet installés **avant** navigation. **8 scénarios** : accès direct + rechargement
concept (`marteau`) et glossaire (`bull-bear`), directs `concept/doji` et `glossaire/volatilite`, navigation SPA
(concept lié / terme relié) avec Précédent/Suivant. Chacun vérifie : bonne fiche, bon pathname, préfixe `/TradeMy/`
préservé, `404.html` **jamais** servi pour un slug connu, **0 React #418**, 0 `console.error`, 0 `pageerror`,
0 rejet non géré, aucun écran resté en chargement, aucune page blanche. **Résultat : 0/8 en échec, #418 = 0.**

## Impact build
Chaque slug connu obtient désormais un HTML concret : `dist/concept/` = 67 fiches concrètes + template ;
`dist/glossaire/` = 24 fiches concrètes + template (+ index). Le nombre total de pages exportées augmente en
conséquence (mesuré au build par `verify-web-build.mjs`). Aucune dépendance ajoutée, `package.json`/lockfile
inchangés.

## Limites (honnêtes)
- **Slug INCONNU tapé directement** (hors registre) : GitHub Pages n'a pas de fichier → repli `404.html`
  (accueil) et, en accès direct, la même divergence pourrait apparaître pour un slug **non pré-généré**. Ce lot
  **garantit** l'absence de #418 pour tout slug **connu / pré-généré** (le cas réel : liens internes, partages de
  fiches existantes). Le repli 404 générique n'est **pas** refondu ici (hors périmètre). L'état « introuvable »
  reste testé via navigation SPA. Un lot ultérieur pourra durcir le repli 404 si nécessaire.
- Contrôles natifs iOS/Android **non exécutés** : seuls Chromium + tests React Native/Jest l'ont été.

## Rollback
Revert du commit unique du LOT 4-K. Aucune migration, aucun changement de schéma ni de données → rollback sans
effet de bord. Retirer `generateStaticParams` ferait immédiatement échouer `staticParams.test.ts` et la section D
de `verify-web-build.mjs` (garde-fou anti-régression).

**LOT suivant : non commencé.** La refonte visuelle de `/monde/[id]` reste réservée au LOT 4-L ; la dette visuelle
du glossaire à un lot présentationnel dédié.
