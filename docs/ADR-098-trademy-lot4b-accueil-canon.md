# ADR-098 — LOT 4-B : application du canon à l'Accueil (icônes, couleurs, a11y, captures déterministes)

- **Statut** : proposé — LOT 4-B, deuxième application verticale de la fondation LOT 4-A (ADR-097).
  **PR #12 en BROUILLON**, en attente de validation humaine ; sera passé à « accepté » à la validation.
- **Contexte** : LOT 4-A (ADR-097) a posé la fondation visuelle et l'a appliquée au parcours pilote. Le
  LOT 4-B étend cette application à l'**onglet Accueil** (`src/app/(tabs)/index.tsx`), depuis le canon
  initial **TradeMy Learning Glass** — sans 3D, sans référence externe, sans toucher aux moteurs, aux
  données, à la progression, à la persistance ni aux routes.

## Décision

### 1. Famille d'icônes — glyphes Accueil du canon
Ajout à la façade unique `TrademyIcon` (grille 24×24, trait uniforme, terminaisons rondes, géométrie
ORIGINALE) : `timer` (durée de la mission) et `coin` (jeton d'apprentissage). Verrou `icons.test.ts`.

### 2. Accueil : emojis-icônes → famille Trademy
`🎯 MISSION DU JOUR` → `target` + libellé ; `💡 CONCEPT DU JOUR` → `hint` + libellé ; puce `⏱️` →
`Chip iconName="timer"` ; puce `🪙` → `Chip iconName="coin"` ; salutation `👋` → texte seul.

### 3. Couleurs sémantiques
- **Durée de mission** : `technical` (cyan = annotation graphique) → **`info`** (bleu informationnel).
- **« Concept du jour »** : `advanced` (orchidée = difficulté) → accent de **MARQUE** — `primaryBright`
  (icône + libellé) et `primary` (bordure + lien « Découvrir ») ; `conceptOfTheDay()` peut être débutant.
- `technical`/`advanced` **plus jamais détournés** sur l'Accueil. AA de `info` **vérifié**
  (`contrast.test.ts`). Verrous : `accueilSemanticColors.test.ts` (source) + rendu (ci-dessous).

### 4. Accessibilité du compteur de jetons
Le remplacement de `🪙` par une icône SVG décorative laissait un **nombre nu** (« 0 ») sans sens pour un
lecteur d'écran. Corrigé proprement :
- **`Chip`** devient un **élément accessible unique** (`accessible`), ce qui rend la prop
  `accessibilityLabel` réellement opérationnelle et **regroupe l'annonce** (plus de double lecture
  icône + texte visible). L'icône reste **décorative** (masquée par `TrademyIcon`).
- **Accueil** : le compteur reçoit un **nom explicite** — `` `${coins} jeton${s} d’apprentissage` `` (ex.
  « 0 jeton d'apprentissage »), jamais un nombre isolé.
- Verrou : le test de rendu prouve le nom accessible du compteur ET qu'**aucun** nom accessible de
  l'Accueil n'est un nombre isolé.

### 5. Garde-fou emoji — VRAIE source unique
`src/integration/emojiGuard.ts` fonde désormais la détection sur les **propriétés Unicode**
(`\p{Emoji_Presentation}`, `\p{Emoji}` + U+FE0F, `\p{Regional_Indicator}`, keycap U+20E3) au lieu de
plages approximatives — il attrape donc aussi `⌚ ⏰ ⏳ ⏩ ✅`, les keycaps (avec ou sans FE0F) et les
drapeaux, tout en **autorisant** les flèches/chevrons typographiques en présentation texte
(`→ › ◀ ▶ ↔`) et les nombres nus. `findEmoji()` est la **seule** implémentation, utilisée par
`accueilNoEmoji.test.ts`, `accueil.integration.test.tsx` **et** `pilotNoEmoji.test.ts` (regex locale
supprimée). Tests positifs (🎯 ⌚ ⏰ ⏳ ⏩ ✅ keycap drapeau) + négatifs (flèches) : `emojiGuard.test.ts`.

### 6. Preuves exécutables (rendu réel, état déterministe)
`src/integration/accueil.integration.test.tsx` monte l'Accueil **RÉEL** (`ProgressProvider`, `now` figé,
état onboardé) et prouve : les icônes `target/hint/timer/coin` sont rendues (identifiées par leur
géométrie propre) et `timer`/`coin` non vides (`viewBox 0 0 24 24`) ; couleurs rendues correctes
(`info`/`primaryBright`, aucune `technical`/`advanced`) ; nom accessible du compteur de jetons ; route
`/session/[skillId]` **exacte** + params ; **aucun emoji** dans tout le rendu (garde-fou générique) ;
icônes décoratives.

### 7. Captures RÉELLES et DÉTERMINISTES de l'Accueil
`scripts/capture-accueil.mjs` (manifeste **séparé** : `accueil-320`, `accueil-390`, `accueil-web` 1440,
`accueil-reduced`) capture par le **vrai parcours utilisateur côté client** :
- **`FIXED_NOW` unique** (15 janv. 2026, 08:30 UTC = 09:30 Europe/Zurich → « Bonjour ») + **horloge
  FIGÉE** (`Date.now()` et `new Date()`) **avant** le chargement de l'app + **fuseau `Europe/Zurich`** →
  MÊME date, mission, salutation et notion du jour pour les **quatre** viewports (vérifié : signature de
  texte visible **identique ×4**) ;
- ouverture de la route **racine** → bouton **« Reprendre »** par son **rôle** de bouton + nom exact →
  marqueur **« MISSION DU JOUR » EXACT et visible** ;
- comme le pathname résolu reste `/TradeMy` (le groupe `(tabs)` n'est pas dans l'URL), la navigation
  n'est **pas** prouvée par une occurrence textuelle mais par la **sémantique accessible réelle** :
  onglet **Accueil** actif (`role="tab"` + `aria-selected`) **et** un autre onglet réel par rôle
  (`Laboratoire`, pas le mot « Bibliothèque » de la carte Favoris) ;
- vérification du **nouveau nom accessible du compteur de jetons** (un ancien `dist` ne peut donc pas
  produire de fausse preuve) ;
- échec sur erreur console, pageerror, débordement, mauvais écran/route/onglet, signature non
  déterministe, capture manquante/inattendue ; publication **atomique non destructive**.

Les PNG ne sont **pas** garantis identiques octet par octet ; ce sont leur **état, contenu, route et
manifeste** qui sont prouvés déterministes.

## Conséquences
- L'Accueil rejoint la famille d'icônes canonique, respecte la sémantique des couleurs et l'a11y, sans
  dépendance ajoutée ; `package.json`/lock inchangés ; aucune migration.
- **CI GitHub vs script Chromium — séparés.** La CI (workflow `quality`) exécute
  lint + typecheck + tests + `validate:content` + `release:check` + `build:web` ; elle **ne lance pas** les
  captures. Le script Chromium (`capture-accueil.mjs`) est un **outil de développement séparé**, hors CI.
- **Dette d'hydratation — honnête.** Sur le **vrai parcours** (racine → « Reprendre » → Accueil), rendu
  **sans erreur console**. L'onglet Accueil résout vers la racine `/`. Le React #418 ne subsiste **que**
  sur un accès **direct synthétique** à l'artefact statique `/(tabs)` de l'export — hors parcours
  utilisateur, hors périmètre 4-B.
- **Dette de shell notée (hors périmètre 4-B).** À **320 px**, les libellés d'onglets de la barre de
  navigation sont **tronqués** (contrainte du shell/tab-bar, pas de l'Accueil). Non corrigée ici ;
  candidate pour un lot de finition de la navigation.

## Alternatives écartées
- Garder `technical`/`advanced`, ou un compteur de jetons en nombre nu : rejeté (sémantique / a11y).
- Détection emoji par plages de code points : rejeté — rate `⌚ ⏰ ⏳ ⏩` et les keycaps ; les propriétés
  Unicode sont la source correcte.
- Prouver l'Accueil par un deep-link `/(tabs)` ou par une occurrence textuelle : rejeté — chemin
  synthétique (#418) / preuve non fiable ; le parcours réel + la sémantique accessible sont la preuve.
- Corriger le #418 des onglets ou la troncature 320 px ici : rejeté — architecture de navigation / shell,
  hors scope 4-B.

**LOT 4-C : non commencé** — sera cadré séparément depuis le canon, après validation humaine.
