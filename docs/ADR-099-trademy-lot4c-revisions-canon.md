# ADR-099 — LOT 4-C : application du canon à l'écran Révisions

- **Statut** : proposé — LOT 4-C, troisième application verticale de la fondation LOT 4-A (ADR-097),
  après l'Accueil (ADR-098). **PR en BROUILLON**, en attente de validation humaine ; passera à
  « accepté » à la validation.
- **Contexte** : le LOT 4-C applique le canon **TradeMy Learning Glass** à l'**écran Révisions**
  (`src/app/(tabs)/revisions.tsx`). Lot **présentationnel** : l'écran LIT le moteur de répétition
  espacée et de maîtrise, il ne le modifie pas.

## Diagnostic initial
- **Emojis système (6)** : `🔁` (titre), `🎯` (points faibles), `🃏` (deck), `🚩` (erreurs), `✅`
  (état à jour), `🌱` (StateView vide).
- **Couleurs détournées** : `strong → bullish` (vert de MARCHÉ pour « Solide »), erreurs → `bearish`
  (rouge de MARCHÉ), `learning`/`reviewing → technical` (cyan d'ANNOTATION), `mastered → primary`
  (au lieu du token `mastery`). Le statut n'était distingué que par couleur + mot (pas d'icône).
- **A11y** : jauge et caption annonçaient le **même pourcentage** (double lecture) ; chip `×N` ⇒ nom
  quasi-numérique ; statut annoncé par un simple mot sans contexte « niveau de maîtrise ».
- **États** : loading / plusieurs dues / aucune due / points faibles / aucune compétence terminée
  couverts, mais **sans hiérarchie à action principale unique** (plusieurs boutons « Réviser »
  concurrents) ni état « à jour » dominant.
- **CTA/routes** : `/session/{id}`, `/revision-deck`, `/parcours` — tous fonctionnels, aucun bouton mort.
- **Risque moteur** : nul — l'écran ne fait que lire les fonctions pures.

## Décision — hiérarchie finale
Une seule **action principale** domine : carte héro **« À RÉVISER AUJOURD'HUI »** avec la compétence
prioritaire (première due) + **un CTA primaire** `Réviser — {compétence}` ; les autres dues passent en
boutons **secondaires**. Sans révision due, la carte devient **« TU ES À JOUR »** avec **une** action
utile existante (`Continuer le parcours`). Suivent, en **secondaire** : points faibles, progression de
maîtrise (une carte par compétence), deck (Premium). Priorité = présentation ; le moteur décide de ce
qui est dû.

## Décision — mapping état pédagogique → couleur → icône → texte accessible
La couleur n'est **jamais** le seul signal (icône **et** libellé toujours présents). Aucune couleur de
marché/annotation détournée.

| Statut | Libellé | Couleur (token) | Icône | Nom accessible |
|---|---|---|---|---|
| `new` | Nouveau | `neutral` | `hint` | « Niveau de maîtrise : Nouveau » |
| `learning` | En cours | `info` | `progression` | « Niveau de maîtrise : En cours » |
| `fragile` | Fragile | `warning` | `warning` | « Niveau de maîtrise : Fragile » |
| `reviewing` | À consolider | `info` | `review` | « Niveau de maîtrise : À consolider » |
| `strong` | Solide | `success` (menthe pédagogique) | `check` | « Niveau de maîtrise : Solide » |
| `mastered` | Maîtrisé | `mastery` (accent de marque) | `mastery` | « Niveau de maîtrise : Maîtrisé » |

- **Jauge de maîtrise** : `ProgressBar` = nom + valeur + contexte (`accessibilityLabel` « Progression de
  {compétence} » + `accessibilityValue` = %), couleur = couleur de statut ; le **% visible est
  décoratif** (`importantForAccessibility="no"`) → plus de double lecture du pourcentage.
- **Erreurs** : `feedbackIncorrect` (rose pédagogique, PAS `bearish`) + icône `warning`.
- **En-têtes de section** : `review` (titre), `review` (héro), `target` (points faibles, `info`),
  `book` (deck). Toutes les icônes sont **décoratives** (masquées aux lecteurs d'écran).
- AA de `info`/`success`/`mastery`/`feedbackIncorrect` **vérifié** (`contrast.test.ts`).

## Composants réutilisés / ajoutés
- **Réutilisés** : `TrademyIcon`, `Chip` (accessible, LOT 4-B), `ProgressBar`, `Button`, `Card`,
  `StateView`, `CharacterScene`.
- **Ajout additif** : `StateView` accepte désormais `iconName?: TrademyIconName` (icône de la famille,
  décorative) en plus de `icon?: string` — pour un état vide **sans emoji**. Non-cassant.
- **Aucun** changement de dépendance ; `package.json`/lock inchangés.

## États couverts
Loading · plusieurs révisions dues (héro + liste secondaire) · une seule révision · **aucune révision
(« à jour »)** · notion fragile/prioritaire · notion solide/maîtrisée · reprise après remontage · texte
agrandi · reduced-motion. L'état vide explique clairement que l'utilisateur est à jour et propose une
seule action existante.

## Tests
- `revisions.integration.test.tsx` (écran RÉEL + `ProgressProvider`, `now` figé) : action principale +
  **route exacte** `/session/skill.actions` ; icônes de la famille décoratives ; a11y des niveaux de
  maîtrise (nom explicite) ; jauges nom+valeur+contexte ; **aucun** nom accessible réduit à un nombre ;
  **aucun** emoji ; états (plusieurs dues / à jour → `/parcours` / aucune compétence) ; **reprise** après
  remontage ; **invariants moteur** (`masteryStatus`/`isDue` inchangés).
- `revisionsNoEmoji.test.ts` (garde-fou générique `findEmoji`) et `revisionsSemanticColors.test.ts`
  (aucun `bullish`/`bearish`/`technical`/`advanced` ; `success`/`mastery`/`feedbackIncorrect` présents).

## Captures (déterministes, script séparé)
`scripts/capture-revisions.mjs` (manifeste séparé, ne touche ni au pilote ni à l'Accueil) — horloge et
fuseau **figés** (`Europe/Zurich`), état local déterministe, **parcours réel côté client**
(racine → « Reprendre » → Accueil → carte « Révisions »). 6 PNG : `revisions-320/390/web(1440)/empty/
reduced/large` (texte agrandi via zoom navigateur). Échec sur erreur console, pageerror, mauvais écran
(route/marqueur/CTA), débordement, build obsolète, signature non déterministe, capture manquante.

## Confirmation — moteur NON modifié
Aucune modification de : intervalles de répétition espacée, calcul de maîtrise, règles de réussite/échec,
planification, données utilisateur, persistance, migrations, routes. Le diff ne touche **aucun** fichier
de `src/engines/learning/` ni les repositories de progression. Test d'invariants en garde-fou.

## Limites restantes
- **Révisions est un écran d'onglet MASQUÉ** (canon : « Réviser est intégré à l'Accueil / au Profil »).
  Il n'existe donc pas de bouton d'onglet Révisions **sélectionnable** ; la navigation est prouvée par la
  **route résolue** (`/revisions`), un marqueur stable, le CTA principal et la présence du navigateur
  d'onglets (les 5 onglets primaires restent non sélectionnés — état correct pour cet écran masqué).
- **Dette de shell (hors périmètre 4-C)** : à ~320 px, les **libellés d'onglets** de la barre sont
  **tronqués** (contrainte du shell/tab-bar). Non corrigée ici.

**LOT 4-D (Profil) : non commencé** — sera cadré séparément depuis le canon, après validation humaine.
