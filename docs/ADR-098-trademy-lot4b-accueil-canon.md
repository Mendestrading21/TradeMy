# ADR-098 — LOT 4-B : application du canon à l'Accueil (icônes, couleurs sémantiques, a11y)

- **Statut** : proposé — LOT 4-B, deuxième application verticale de la fondation LOT 4-A (ADR-097).
  **PR #12 en BROUILLON**, en attente de validation humaine ; sera passé à « accepté » à la validation.
- **Contexte** : LOT 4-A (ADR-097) a posé la fondation visuelle et l'a appliquée au parcours pilote. Le
  LOT 4-B étend cette application à l'**onglet Accueil** (`src/app/(tabs)/index.tsx`), depuis le canon
  initial **TradeMy Learning Glass** — sans 3D, sans référence externe, sans toucher aux moteurs, aux
  données, à la progression ni aux routes.

## Décision

### 1. Famille d'icônes — glyphes Accueil du canon
Ajout à la façade unique `TrademyIcon` (grille 24×24, trait uniforme, terminaisons rondes, géométrie
ORIGINALE) : `timer` (minuteur — durée de la mission) et `coin` (jeton d'apprentissage). Verrou
`icons.test.ts`.

### 2. Accueil : emojis-icônes → famille Trademy
Les emojis utilisés comme icônes sont remplacés par des glyphes de la famille (ou retirés du texte) :
- `🎯 MISSION DU JOUR` → icône `target` + libellé ;
- `💡 CONCEPT DU JOUR` → icône `hint` + libellé ;
- puce `⏱️` → `Chip iconName="timer"` ; puce `🪙` → `Chip iconName="coin"` ;
- salutation `… 👋` → texte seul.
Le garde-fou emoji est désormais **générique et partagé** (`src/integration/emojiGuard.ts`), réutilisé
par le verrou de source de l'Accueil ET le test de rendu (plus de liste ad hoc).

### 3. Couleurs sémantiques (micro-correction)
Correction des couleurs détournées, pour respecter strictement la sémantique du canon :
- **Durée de mission** : `technical` (cyan = annotation graphique) → **`info`** (bleu informationnel,
  distinct du cyan). Une durée est une information, pas une annotation de graphique.
- **« Concept du jour »** : `advanced` (orchidée = difficulté 4–5) → accent de **MARQUE** —
  `primaryBright` (icône + libellé) et `primary` (bordure + lien « Découvrir »). `conceptOfTheDay()`
  peut mettre en avant une notion **débutante** ; l'accent ne doit donc jamais signifier « avancé ».
- Conséquence : `technical` et `advanced` ne sont **plus jamais détournés** sur l'Accueil.
- L'AA de `info` sur les surfaces de carte est **vérifié** (`contrast.test.ts`, liste d'accents).
- Verrous : `accueilSemanticColors.test.ts` (source — technical/advanced absents) **et**
  `accueil.integration.test.tsx` (rendu — couleurs effectives des icônes).

### 4. Preuves exécutables (renforcées)
- `src/integration/accueil.integration.test.tsx` monte l'écran d'Accueil **RÉEL** dans le
  `ProgressProvider`, sur un **état déterministe** (onboardé, `now` figé), et prouve :
  - les icônes `target`, `hint`, `timer`, `coin` sont rendues, **identifiées par leur géométrie propre**
    (pas « au moins un SVG ») ; `timer` et `coin` produisent une géométrie SVG non vide `viewBox="0 0 24 24"` ;
  - les **couleurs rendues** sont correctes (durée = `info`, « Concept du jour » = `primaryBright`) et
    **aucune** icône n'utilise `technical`/`advanced` ;
  - l'action principale émet **exactement** la route `/session/[skillId]` avec ses `params` (skillId + count) ;
  - **aucun emoji système** dans tout le rendu (garde-fou générique) ; icônes **décoratives** préservées.
- `src/integration/accueilNoEmoji.test.ts` verrouille l'absence d'emoji dans la source de l'écran.

### 5. Preuves visuelles — captures RÉELLES de l'Accueil (limite levée)
`scripts/capture-accueil.mjs` capture l'Accueil par le **vrai parcours utilisateur côté client** — et non
par un deep-link : seed d'un état local **déjà onboardé**, ouverture de la route **racine**, action
**« Reprendre »**, attente du marqueur stable **« MISSION DU JOUR »**, **vérification de la route résolue
par Expo Router** (chemin racine + barre d'onglets `(tabs)` rendue), puis capture. Manifeste **séparé** de
4 PNG : `accueil-320`, `accueil-390`, `accueil-web` (1440), `accueil-reduced` (`docs/lot4b-captures/`).
Le script **échoue** sur erreur console, pageerror, débordement horizontal, mauvais écran, capture
manquante ou inattendue. Le manifeste des **22 captures pilote reste inchangé**.

## Conséquences
- L'Accueil rejoint la famille d'icônes canonique **et** respecte la sémantique des couleurs ; cohérence
  visuelle accrue, sans dépendance ajoutée, `package.json`/lock inchangés.
- **CI GitHub vs script Chromium — séparés et honnêtes.** La CI (workflow `quality`) exécute
  lint + typecheck + tests + `validate:content` + `release:check` + `build:web` ; elle **ne lance pas** les
  captures. Les captures Chromium sont un **outil de développement séparé** (`capture-accueil.mjs`),
  reproductible localement, hors CI.
- **Dette d'hydratation — précisée honnêtement.** Sur le **vrai parcours utilisateur**
  (racine → « Reprendre » → Accueil), le rendu est **sans erreur console** (0 erreur, prouvé par le script
  de captures). L'onglet Accueil **résout vers la racine `/`** — le groupe `(tabs)` n'apparaît pas dans
  l'URL. L'avertissement React #418 ne subsiste **que** sur un accès **direct et synthétique** à l'artefact
  statique `/(tabs)` de l'export (chemin que le parcours réel n'emprunte jamais) : il relève de
  l'architecture de navigation de l'export statique, **hors périmètre 4-B**, et **n'affecte pas** le
  parcours utilisateur.

## Alternatives écartées
- Garder `technical`/`advanced` sur l'Accueil : rejeté — détourne des couleurs réservées (annotation /
  difficulté) sur des éléments qui n'en relèvent pas.
- Prouver l'Accueil par un deep-link `/(tabs)` : rejeté — chemin synthétique qui déclenche #418 ; le
  **parcours réel** (racine → Reprendre) est la bonne preuve, sans erreur console.
- Corriger le #418 des onglets ici : rejeté — changement d'architecture de navigation, hors scope 4-B.
- Étendre le nouveau système à tous les onglets d'un coup : rejeté — application verticale, un écran à la
  fois (profil/révisions/etc. gardent leur dette emoji, à traiter dans un prochain sous-lot).

**LOT 4-C : non commencé** — sera cadré séparément depuis le canon, après validation humaine.
