# ADR-100 — LOT 4-D : application du canon à l'écran Profil

- **Statut** : proposé — LOT 4-D, quatrième application verticale de la fondation LOT 4-A (ADR-097),
  après l'Accueil (ADR-098) et Révisions (ADR-099). **PR en BROUILLON**, en attente de validation
  humaine ; passera à « accepté » à la validation.
- **Contexte** : le LOT 4-D applique le canon **TradeMy Learning Glass** à l'**écran Profil**
  (`src/app/(tabs)/profil.tsx`). Lot **présentationnel** : l'écran LIT les providers (progression,
  profil d'onboarding, premium, consentement) et n'expose que des **préférences réelles** (consentement
  analytics, choix de guide, réinitialisation, repersonnalisation). Il ne modifie ni le moteur
  SR/maîtrise, ni la persistance, ni les routes, ni un quelconque système de compte/abonnement.

## Diagnostic initial (10 points)
1. **Emojis système (5)** : `✅` (à jour), `📶` (connectivité), `✨` (premium), `🏅` (badges), `📖`
   (glossaire) — utilisés en substitut d'icône.
2. **Couleur détournée** : chip « En ligne » en `bullish` (vert de MARCHÉ) au lieu d'un token
   pédagogique. La connectivité n'est **pas** une vérité de marché.
3. **Faux contenu** : carte `DEMO_SKILL` (compétence factice de démonstration) présentée comme réelle.
4. **Doublon** : la liste des points faibles était **dupliquée** (une fois en résumé, une fois en carte),
   alourdissant l'écran en second tableau de bord.
5. **Hiérarchie** : aucune **action principale unique** dominante ; l'identité de l'apprenant n'émergeait
   pas ; l'écran ressemblait à un second Accueil surchargé (~10 cartes de même poids).
6. **Ancienneté** : `profile.completedAt` affichée sans garde-fou → risque de `NaN`/`Invalid Date` si la
   valeur est absente ou malformée.
7. **Métriques accessibles** : plusieurs valeurs (compteurs, %) exposées comme **nombres isolés** sans
   contexte (pas de nom accessible explicite).
8. **Préférences** : contrôles réels (analytics, guide) noyés au milieu de cartes décoratives.
9. **État sans progression** : le nouvel utilisateur voyait des zéros bruts, sans accueil ni orientation.
10. **Données secondaires manquantes** : profil d'onboarding potentiellement `null` (guide/objectif/
    diagnostic absents) sans branche d'affichage sûre.

## Décision — hiérarchie finale (5 niveaux, une seule action dominante)
1. **Identité de l'apprenant** — carte héro : nom **neutre** « Apprenti Trademy » (jamais un faux nom
   inventé), avatar = **guide choisi** (`CharacterAnimationController`) ou **duo Toto + Bobo** par défaut,
   chip `Niveau {n}`, chip `Guide : {Toto|Bobo}` si choisi, **phrase de progression honnête** selon
   l'état réel, et ancienneté `Parcours démarré le {date}` **uniquement si** la date est valide.
2. **Résumé de progression** — carte « TA PROGRESSION » : `XPBar` (niveau + XP dans le niveau) puis
   cinq `StatTile` issus des **vrais** providers (découvertes, maîtrisées, à renforcer, série, points).
3. **Action principale UNIQUE** — un seul `Button` dominant, dont le libellé et la route dépendent de
   l'état réel (voir table ci-dessous).
4. **Raccourcis réels** — Révisions (→ `/revisions`, **accès**, pas une copie ; caption « N recommandée·s »
   ou « À jour »), Statistiques (→ `/statistiques`), Mes réussites (→ `/reussites`), Glossaire & favoris
   (→ `/glossaire`). Tous fonctionnels, aucun bouton mort.
5. **Préférences & légal** — profil d'apprentissage (objectif/niveau/temps/diagnostic + sujets +
   repersonnaliser), choix de guide, accessibilité & hors-ligne, confidentialité (switch analytics réel),
   Premium, à propos, réinitialisation, **disclaimer** éducatif.

### Action principale selon l'état réel
| État | Libellé | Route | Nom accessible (hint) |
|---|---|---|---|
| révision(s) due(s) (`dueCount > 0`) | « Réviser maintenant » | `/revisions` | « Ouvrir les révisions recommandées » |
| progression sans due (`hasProgress`) | « Continuer le parcours » | `/parcours` | « Reprendre le parcours d'apprentissage » |
| nouvel utilisateur (aucune progression) | « Commencer le parcours » | `/parcours` | « Démarrer le parcours d'apprentissage » |

`dueCount = selectDueReviews(state, SKILLS, now).length` ; `hasProgress = completedSkills.length > 0 ||
totalXp > 0`. Le moteur décide de ce qui est dû ; la présentation choisit **une** action.

## Décision — mapping métrique → couleur (token) → icône (décorative) → nom accessible
La couleur n'est **jamais** le seul signal ; chaque tuile porte une icône **et** un nom accessible
regroupé (« label + valeur + contexte »), jamais un nombre isolé. **Aucune** couleur de
marché (`bullish`/`bearish`) ou d'annotation (`technical`) détournée.

| Métrique | Source réelle | Couleur (token) | Icône | Nom accessible |
|---|---|---|---|---|
| Découvertes | `learning.conceptsExplored` | `info` | `hint` | « N notions découvertes » |
| Maîtrisées | `conceptMasteryStatus` sur `V5_CONCEPTS` | `mastery` (accent de marque) | `mastery` | « N notions maîtrisées » |
| À renforcer | `summarizeMisconceptions(errorTags)` | `warning` | `warning` | « N notions à renforcer » |
| Série | `state.streakDays` | `warning` | `flame` | « N jour·s de série d'apprentissage » |
| Points | `state.coins` | `reward` (or) | `coin` | « N point·s d'apprentissage » |

- **Identité** : `Niveau {n}` en `primary` (marque), `Guide` en `primaryBright`. Le violet reste réservé
  à la marque/progression/premium ; l'or (`reward`) au seul système de récompense.
- **Connectivité** : chip « En ligne » en `success` (menthe pédagogique, **plus** `bullish`), « Hors
  ligne » en `textMuted`. La réduction des animations est signalée par icône (`check`/`close`) **et** texte.
- **Switch analytics** : `Pressable` `accessibilityRole="switch"` + `accessibilityState.checked` +
  `accessibilityLabel` « Suivi d'usage anonyme » ; le pastille visuelle Activé/Désactivé est
  **décorative** (`importantForAccessibility="no"`) → pas de double lecture.
- **Lignes de profil** : `ProfileRow` regroupe label+valeur en **un** nom accessible (`accessible
  accessibilityLabel={`${label} : ${value}`}`).

## Robustesse — jamais de valeur invalide
- `formatJoined(iso)` : renvoie `null` si l'ISO est absent **ou** `Number.isFinite(Date.parse(iso))` est
  faux → l'écran omet simplement la ligne d'ancienneté. Formatage **UTC déterministe** (mois FR),
  jamais `NaN`/`Invalid Date`.
- **État de chargement** : `if (!ready || !state)` → `StateView variant="loading"` (aucun rendu de
  métrique avant que les données réelles soient prêtes).
- **Profil d'onboarding `null`** : branche dédiée invitant à personnaliser (aucun `undefined`/`—` brut
  non maîtrisé ; les libellés absents retombent sur `—`).
- **Diagnostic** : affiché en % **uniquement** si `diagnosticDone && diagnosticScore != null`, sinon
  « non réalisé ».

## Contenu supprimé (faux / doublon)
- Carte **`DEMO_SKILL`** retirée (aucune compétence factice).
- Liste des points faibles **dédupliquée** (le compteur « à renforcer » reste, la carte redondante part).
- Aucun **faux badge**, **faux classement social**, **résultat inventé** ni vocabulaire BUY/SELL.

## Composants réutilisés (aucun ajout de dépendance)
`Screen`, `Card`, `Button`, `Chip` (accessible, LOT 4-B), `XPBar`, `StatTile`, `StateView`, `TrademyIcon`,
`CharacterAnimationController`, `GuideSelectionCard`, `Disclaimer`. `package.json`/lock **inchangés**.

## États couverts
Nouvel utilisateur (identité neutre + duo + « Commencer le parcours ») · intermédiaire · avancé ·
révision due (« Réviser maintenant ») · aucune due (« Continuer le parcours ») · sans accomplissement ·
données secondaires manquantes (profil `null`) · reprise après remontage · texte agrandi · reduced-motion ·
320 / 390 / 1440 px.

## Tests
- `profil.integration.test.tsx` (écran RÉEL + `ProgressProvider`, `now` figé) : identité neutre « Apprenti
  Trademy » ; action principale + **route exacte** selon l'état (`/parcours` nouvel utilisateur,
  `/revisions` due, `/parcours` progression) ; métriques issues des **vrais** providers (« 3 notions
  découvertes ») ; raccourci Révisions → `/revisions` ; **aucun** nom accessible réduit à un nombre ;
  icônes de la famille décoratives ; switch analytics bascule un **vrai** état ; identité personnalisée
  (guide + ancienneté RÉELLE « 1 janvier 2026 », jamais `NaN`) ; **reprise** après remontage ; **aucun** emoji.
- `profilNoEmoji.test.ts` (garde-fou générique `findEmoji`) et `profilSemanticColors.test.ts` (aucun
  `bullish`/`bearish`/`technical`/`advanced`).

## Captures (déterministes, script séparé)
`scripts/capture-profil.mjs` (manifeste séparé, ne touche ni au pilote, ni à l'Accueil, ni à Révisions) —
horloge et fuseau **figés** (`Europe/Zurich`), état local déterministe (seed des clés `progress` **et**
`onboarding` par scénario), **parcours réel côté client** (racine → « Reprendre » → Accueil → onglet
**Profil**). 7 PNG : `profil-new-320`, `profil-progress-390`, `profil-advanced-web` (1440),
`profil-revisions-due`, `profil-empty-achievements`, `profil-large-text` (zoom navigateur),
`profil-reduced-motion`. Échec sur erreur console, pageerror, mauvais écran, **mauvais onglet actif**,
`NaN`/`undefined`/date invalide, débordement horizontal, CTA principal absent, build obsolète, signature
non déterministe, capture manquante ou parasite.

- **Onglet Profil = onglet primaire SÉLECTIONNABLE** (contrairement à Révisions, masqué) : chaque capture
  vérifie `role="tab"` **nom « Profil » avec `selected: true`** (un seul), les 5 onglets primaires, et un
  marqueur stable (« TA PROGRESSION ») pour bloquer un build obsolète.

## Confirmation — moteur NON modifié
Aucune modification de : intervalles de répétition espacée, calcul de maîtrise, règles de réussite/échec,
conditions d'accomplissement, planification, données utilisateur, persistance, migrations, routes, auth,
abonnements, logique premium, navigation, autres écrans. Le diff ne touche **aucun** fichier de
`src/engines/` ni les repositories de progression. Tests de garde-fou (couleurs, emoji, invariants de rendu).

## Limites restantes
- **Dette de shell (hors périmètre 4-D)** : à ~320 px, les **libellés d'onglets** de la barre restent
  **tronqués** (contrainte du shell/tab-bar), comme noté en 4-B/4-C. Non corrigée ici.

**LOT 4-E : non commencé** — sera cadré séparément depuis le canon, après validation humaine.
