# ADR-102 — LOT 4-F : application du canon à la Bibliothèque

- **Statut** : proposé — LOT 4-F, sixième application verticale de la fondation LOT 4-A (ADR-097), après
  l'Accueil (ADR-098), Révisions (ADR-099), le Profil (ADR-100) et Apprendre/Parcours (ADR-101). **PR en
  BROUILLON**, en attente de validation humaine ; passera à « accepté » à la validation.
- **Contexte** : le LOT 4-F applique le canon **TradeMy Learning Glass** à l'espace **Bibliothèque**
  (`src/app/(tabs)/apprendre.tsx`, route historique `/apprendre`, fiche `/concept/{slug}`, libellé
  d'onglet « Bibliothèque »). Lot **présentationnel** : l'écran LIT `V5_CONCEPTS`, la recherche/filtres
  PURS (`browseConcepts`) et la machine de maîtrise STRICTE (`conceptMasteryStatus` → 5 états). Aucun
  moteur / contenu / persistance / route / navigation modifié.

## Diagnostic initial (confirmé dans le code)
- **`★ Favoris`, `★`, `☆`** employés comme faux système d'icônes (collection, `FavoriteButton`, état vide).
- **`technical` détourné** pour « Découvert » ; **`reward` détourné** pour « Maîtrisé » (token canonique
  `mastery`) et pour un **favori actif** (un favori n'est pas une récompense).
- **`conceptMasteryStatus` appelé sans `completedSkills` ni `targets`** (seulement `exploredSlugs` +
  `skills`) → l'écran **ne pouvait jamais** afficher En cours/Solide/Maîtrisé correctement (sous-report),
  et **mentait** par rapport aux fiches/Profil/Parcours.
- **Filtre limité à 3 valeurs grossières** (Nouveau/Découvert/Maîtrisé) alors que la machine distingue **5**.
- **Statut sans icône** (point coloré + texte) ; résultats en `list.map` (risque à 500+) ; familles en
  ligne ; **5 outils avant la recherche** ; état vide **sans action** ; recherche **sans effacement** ;
  favori et carte **non regroupés** ; **chargement du provider non traité**.

## Corpus réel (mesuré depuis les données, non codé en dur)
**67 concepts**, **12 familles** présentes (sur 13 catégories), 67 avec `visualSpec`, 67 avec
`estimatedMinutes`, tous en statut éditorial `needsReview` (donc non affiché comme gage de maturité),
difficultés présentes 1–4 (répartition 6 / 21 / 29 / 11). Ces valeurs restent **dérivées** à l'exécution
(`V5_CONCEPTS.length`, `conceptFamilies`, `conceptMasteryStatus`) — jamais recopiées.

## Décision — architecture finale (recherche dominante)
1. En-tête « Bibliothèque » + explication utile.
2. **Recherche DOMINANTE** (icône `search`, effacement rapide `close`).
3. **Collections** `Tous` / `Favoris` / `Récents` (SegmentedControl, badges de compte).
4. **Filtres** : famille (dérivée du corpus) + **état pédagogique strict (5 états)**.
5. **Résumé contextualisé** (un seul nom accessible) + **« Effacer les filtres »** (uniquement si un
   filtre/recherche est actif).
6. **Liste NATIVE virtualisée** (`FlatList` via `Screen scroll={false}` — **sans toucher au shell** ni
   ajouter de dépendance) : `keyExtractor` stable, header/empty/footer, `initialNumToRender`/`windowSize`.
7. **Outils de référence** en **footer secondaire** (déplacés APRÈS la recherche) + disclaimer.

La recherche est l'interaction dominante ; **aucun CTA artificiel** n'a été ajouté.

## Décision — recherche & filtres (source de vérité préservée)
- Recherche = **moteur réel** `searchConcepts` : **titre + titre court + alias**, insensible casse/accents
  (`normalizeSearch`), espaces gérés. On **ne prétend pas** rechercher définitions/tags.
- Ordre déterministe (ordre de `V5_CONCEPTS` ; `Récents` = ordre de `recentSlugs`).
- Filtre des **5 états stricts** appliqué en mémoïsant `conceptState` (via `conceptMasteryStatus`) — **aucun
  second calcul** ni extension du moteur de maîtrise ; le moteur `conceptLibrary` reste inchangé.
- Favoris/Récents = mécanismes existants (`glossaryPrefsRepository`) — **aucun second stockage**.

## Décision — mapping état strict → token → icône (décorative) → texte
La couleur n'est **jamais** le seul signal (icône **et** libellé toujours présents).

| État réel | Token | Icône | Libellé |
|---|---|---|---|
| `new` | `textMuted` | `book` | Nouveau |
| `explored` | `info` | `library` | Découvert |
| `completed` | `primaryBright` (progression) | `progression` | En cours |
| `strong` | `success` | `success` | Solide |
| `mastered` | `mastery` | `mastery` | Maîtrisé |

**Favoris** : non favori → `star` (`textMuted`) ; favori → `star-filled` (`primaryBright`, accent de
**marque**). **Jamais `reward`** pour un favori. Rappels : `bullish`/`bearish` = marché ; `technical` =
annotation ; `advanced` = difficulté ; `reward` = récompense réellement obtenue.

## Différence consulté / entraîné / solide / maîtrisé (préservée, 4 paramètres transmis)
`conceptMasteryStatus` reçoit désormais `exploredSlugs`, `skills`, **`completedSkills`** et **`targets`**.
- **Nouveau** (jamais vu) · **Découvert** (fiche consultée — **jamais** maîtrisé) · **En cours** (un
  objectif entraîné) · **Solide** (au moins un objectif prouvé, couverture incomplète) · **Maîtrisé**
  (couverture complète **+** checkpoint, concept représentatif). Aucune maîtrise partagée entre concepts
  d'une même compétence. Ouvrir/filtrer/mettre en favori ne mute **aucune** progression (c'est la fiche
  `/concept/{slug}` qui marque « exploré »).

## Cartes de concept
Titre · famille · difficulté · durée (si dispo) · résumé court · état strict (icône + texte) · favori.
Chaque carte : **nom accessible regroupé** (titre + famille + difficulté + durée + niveau + favori),
ouvre `/concept/{slug}`, cible ≥ 44 px, **favori = action distincte** (`role=button`, `selected`), aucun
graphique décoratif, jamais « Maîtrisé » sans preuve réelle.

## Stratégie de performance (500+)
`FlatList` native virtualisée (pas de montage simultané de centaines de cartes), clés stables (`slug`),
statut mémoïsé (`useMemo` sur les 4 entrées de maîtrise), résultats mémoïsés, ordre déterministe. Rendu
possible **sans refonte du shell** (`Screen scroll={false}` déjà disponible) ni dépendance. Vérifié mobile
(320/390) et web (1440) via Chromium réel.

## États vides / indisponibles
Chargement (`StateView variant="loading"`) ; aucun favori (`iconName="star"` + action « Voir tous les
concepts ») ; aucun récent (`review` + action) ; aucun résultat de recherche/filtre (`search` + action
« Effacer les filtres »). Tous **sans emoji**, avec une **action réelle**, sans promesse de contenu
inexistant, sans `NaN`/`undefined`/`Infinity`.

## Composants réutilisés / modifiés
- **Réutilisés** : `Screen`, `Card`, `SegmentedControl`, `StateView`, `TrademyIcon`, `Disclaimer`.
- **Modifié (minimal, rétrocompatible)** : `FavoriteButton` — `★`/`☆` → `TrademyIcon` `star`/`star-filled`,
  couleur `reward` → `primaryBright` ; **API inchangée** (`active`/`onToggle`/`label`/`size`). Ses autres
  usages (glossaire, fiche concept) rendent désormais l'icône canonique, sans refonte de ces écrans.
- **Aucun** ajout de dépendance ; `package.json`/lock inchangés. `conceptLibrary`/moteurs **non modifiés**.

## Routes vérifiées
Fiche `/concept/{slug}` ; outils `/glossaire`, `/bibliotheque-visuelle`, `/reconnaissance`, `/lecons`,
`/quiz`. Toutes existantes, aucun bouton mort, aucune route fictive.

## États couverts
Nouvel utilisateur · découvert · en cours · solide · maîtrisé · aucun favori · plusieurs favoris · aucun
récent · récents ordonnés · recherche avec/ sans résultat (casse/accents) · filtre famille · filtre état ·
combinaison vide · effacement · provider non prêt · reprise après remontage · 320 / 390 / 1440 · texte
agrandi · reduced-motion.

## Tests
- `bibliotheque.integration.test.tsx` (écran RÉEL + `ProgressProvider`, seed progress + glossaryprefs,
  `FlatList` mocké pour rendre toutes les lignes) : corpus dérivé de `V5_CONCEPTS` ; recherche
  titre/alias/casse/accents ; **5 états stricts** alimentés par les 4 paramètres (consulter ≠ maîtrisé ;
  aucune maîtrise partagée) ; filtre famille exact + résumé contextualisé ; collections Favoris (filtrées)
  / Récents (ordre) ; états vides + action ; **routes exactes** `/concept/{slug}` et des 5 outils ; favori
  = action distincte n'altérant **pas** la progression ; aucune mutation au montage/filtre ; reprise ;
  aucune valeur invalide ; aucun emoji/étoile Unicode.
- `bibliothequeNoEmoji.test.ts` (garde-fou `findEmoji` **+** interdiction `★`/`☆`, sur l'écran **et** le
  `FavoriteButton`) et `bibliothequeSemanticColors.test.ts` (aucun `bullish`/`bearish`/`technical`/
  `advanced`/`reward` ; `info`/`success`/`mastery`/`primaryBright` présents ; `FavoriteButton` sans `reward`).

## Captures (déterministes, script séparé)
`scripts/capture-bibliotheque.mjs` (manifeste séparé — ne touche ni au pilote, ni à l'Accueil, ni à
Révisions, ni au Profil, ni au Parcours) — horloge/fuseau **figés** (`Europe/Zurich`), états déterministes
(clés `progress` v8 + `glossaryprefs`), parcours réel côté client (racine → « Reprendre » → Accueil →
onglet **Bibliothèque** vérifié par rôle **avec état sélectionné**, route `/TradeMy/apprendre`). Les
filtres/recherche/collections étant un **état local**, ils sont atteints par de **vraies interactions** ;
les scénarios sont scopés au **contenu visible** (les onglets inactifs restent montés). 10 PNG :
`bibliotheque-new-320`, `-search-390`, `-filtered-390`, `-favorites-390`, `-recent-390`, `-mastered-390`,
`-empty-390`, `-advanced-web` (1440), `-large-text` (zoom navigateur), `-reduced-motion`. Échec sur :
erreur console, pageerror, mauvais écran/onglet/route, build obsolète, signature incorrecte, débordement,
emoji, **étoile Unicode**, `NaN`/`undefined`/`Infinity`, recherche absente, capture manquante ou parasite.

## Confirmation — moteur, contenu et persistance NON modifiés
Aucune modification de : `V5_CONCEPTS` et ses textes/statuts, `conceptMasteryState`, le moteur de maîtrise,
la répétition espacée, les règles de progression, la persistance, les migrations, les repositories,
l'authentification, les abonnements, la navigation globale, les routes, `src/app/concept/[slug].tsx`, ni
les autres écrans (Accueil, Révisions, Profil, Parcours, Laboratoire, glossaire, bibliothèque visuelle,
quiz, leçons). Le diff ne touche **aucun** fichier de `src/engines/`. Le seul composant partagé modifié
(`FavoriteButton`) conserve son API et est couvert par les garde-fous.

## Limites restantes
- **Dette de shell (hors périmètre 4-F)** : à ~320 px, les **libellés d'onglets** de la barre restent
  **tronqués** (comme noté en 4-B → 4-E). Non corrigée ici.
- Filtre par **difficulté** non ajouté (choix : garder l'écran focalisé sur famille + état strict ; la
  difficulté reste visible sur chaque carte). Décision documentée, réversible.
- Tous les concepts sont `needsReview` : aucun badge de maturité éditoriale n'est affiché (honnêteté).

**LOT 4-G (Laboratoire) : non commencé** — sera cadré séparément depuis le canon, après validation humaine.
