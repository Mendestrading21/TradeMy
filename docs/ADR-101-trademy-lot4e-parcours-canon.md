# ADR-101 — LOT 4-E : application du canon à Apprendre / Parcours

- **Statut** : proposé — LOT 4-E, cinquième application verticale de la fondation LOT 4-A (ADR-097),
  après l'Accueil (ADR-098), Révisions (ADR-099) et le Profil (ADR-100). **PR en BROUILLON**, en attente
  de validation humaine ; passera à « accepté » à la validation.
- **Contexte** : le LOT 4-E applique le canon **TradeMy Learning Glass** à l'espace **Apprendre**
  (`src/app/(tabs)/parcours.tsx`, route historique `/parcours`, libellé d'onglet « Apprendre »). Lot
  **présentationnel** : l'écran LIT `buildLearningPath` (source de vérité pédagogique) et n'ajoute
  **aucun** second calcul de progression, de déblocage ou de maîtrise.

## Diagnostic initial (confirmé dans le code)
- **`technical` détourné** : cyan d'annotation employé pour « Disponible », « Guidé », « Exploré »,
  « Débloqué » **et** l'en-tête « APPRENDRE ».
- **`reward` (or) détourné** : appliqué à « Maîtrisé » (au lieu du token `mastery`) et aux **jalons**
  affichés inconditionnellement — un palier futur apparaissait donc comme une récompense déjà obtenue.
- **« Terminé »** rendu en `primary` au lieu de `success`.
- **Légende** reposant sur des **points colorés** ; certains statuts (En cours, Guidé, Disponible)
  **sans icône** → la couleur portait seule l'information.
- **A11y** : nœud de monde **non regroupé** (numéro isolé + titre + sous-titre + chip lus séparément) ;
  progression globale potentiellement **annoncée deux fois** (jauge + caption) ; badge affichant un
  **nombre isolé**.
- **Hiérarchie** : **aucune action principale** dominante ; **15 cartes** de poids visuel quasi égal ;
  aucune « prochaine étape » claire.
- **Cartes verrouillées** : actionnables vers le détail, mais sémantique accessible ambiguë (hint non
  aligné, pas de nom groupé).

## Décision — hiérarchie finale (présentation seule)
1. **En-tête** « APPRENDRE » (eyebrow marque) + titre unique **« Ton parcours »**.
2. **Résumé global** : `ProgressBar` des mondes **terminés** (annoncé **une seule fois**) ; caption
   décorative « N terminés · N explorés · N débloqués sur 15 » masquée au lecteur d'écran.
3. **Carte DOMINANTE « Ta prochaine étape »** : monde courant (dérivé du `current`), phrase
   d'orientation honnête, visuel représentatif, et **UNE** action principale.
4. **Repères** : légende **icône + libellé** (la couleur n'est jamais seule).
5. **Roadmap** des 15 mondes en trois **bandes** (Débutant / Intermédiaire / Avancé) annoncées comme
   sections, chaque nœud hiérarchisé selon son état réel ; **jalons** de fin de bande affichés
   honnêtement (atteint vs à venir).

Tous les mondes restent consultables ; aucun monde supprimé, aucun ordre modifié, aucun déblocage touché.

## Décision — action principale UNIQUE (dérivée exclusivement du `path`)
| État réel (du `current`) | Libellé | Route |
|---|---|---|
| nouvel utilisateur (monde 1 guidé, 0 %) | « Commencer le parcours » | `/monde/world.foundations` |
| module guidé partiellement réalisé | « Continuer {monde} » | `/monde/{id réel}` |
| monde de contenu courant (0 %) | « Explorer {monde} » | `/monde/{id réel}` |
| monde de contenu courant (> 0 %) | « Continuer {monde} » | `/monde/{id réel}` |
| aucune entrée `current` (tout l'accessible exploré/terminé) | repli honnête « Revoir {monde ouvert le plus avancé} » | `/monde/{id réel}` |

Jamais « Parcours terminé » tant que les règles réelles ne le prouvent pas (les mondes de contenu ne
sont jamais « terminés » ; un seul monde guidé existe aujourd'hui).

## Décision — mapping état → token → icône (décorative) → texte accessible
La couleur n'est **jamais** le seul signal (icône **et** libellé toujours présents).

| État réel | Token | Icône | Libellé | Nom accessible (fragment) |
|---|---|---|---|---|
| Disponible | `info` | `unlocked` | Disponible | « Niveau : disponible » |
| En cours | `primaryBright` (progression) | `progression` | En cours | « Niveau : en cours » |
| Exploré | `info` | `library` | Exploré | « Niveau : exploré (fiches consultées, pas encore validé) » |
| Terminé | `success` | `check` | Terminé | « Niveau : terminé » |
| Maîtrisé | `mastery` | `mastery` | Maîtrisé | « Niveau : maîtrisé » |
| Verrouillé | `textMuted` | `lock` | Verrouillé | « Niveau : verrouillé » + raison |
| Module guidé | information secondaire (`textSecondary`) | `checkpoint` | Module guidé | intégré au nom du monde |

Rappels de réservation : `bullish`/`bearish` = marché ; `technical` = annotation ; `advanced` =
difficulté avancée ; `reward` = **jalon réellement atteint uniquement** (un palier futur est rendu en
`textMuted`, jamais en or).

## Différence exploré / terminé / maîtrisé (préservée)
- **Exploré** = toutes les fiches d'un monde de **contenu** consultées → assez pour **avancer**, jamais
  « terminé ».
- **Terminé** = **preuve d'apprentissage** (checkpoint d'un module **guidé** validé ; aujourd'hui seul
  le monde 1).
- **Maîtrisé** = terminé **ET** toutes les fiches du monde maîtrisées (compétence solide).
Ouvrir l'écran ou une carte ne modifie **aucune** progression.

## Traitement des cartes verrouillées
Une carte verrouillée reste un **bouton actif** (non désactivé) vers `/monde/{id}` pour **expliquer** son
verrou. Son nom accessible regroupe **numéro + titre + statut verrouillé + raison** ; son hint est
« Voir pourquoi ce monde est verrouillé ».

## Composants réutilisés (aucun ajout de dépendance)
`Screen`, `Card`, `Button`, `Chip`, `ProgressBar`, `StateView`, `TrademyIcon`, `MascotFigure` (statique
en reduced-motion), `MiniVisual` (décoratif). `package.json`/lock **inchangés**. **Aucune** extension de
composant partagé n'a été nécessaire.

## États couverts
Nouvel utilisateur · module guidé partiel · checkpoint validé · monde de contenu partiellement consulté ·
monde totalement exploré (non terminé) · monde terminé (non maîtrisé) · monde maîtrisé · monde disponible ·
monde verrouillé (avec raison) · plusieurs bandes débloquées · bande Avancé · donnée secondaire absente ·
reprise après remontage · 320 / 390 / 1440 px · texte agrandi · reduced-motion.

## Tests
- `parcours.integration.test.tsx` (écran RÉEL + `ProgressProvider`, seed déterministe) : 15 mondes
  ordonnés en trois bandes de cinq ; nouvel utilisateur (monde 1 courant, 14 verrouillés) ; progression
  guidée dérivée des compétences + checkpoint (une compétence isolée ne termine pas le monde) ; checkpoint
  → monde 1 terminé + monde 2 ouvert ; contenu consulté → exploré (jamais terminé) + monde suivant
  ouvert ; maîtrise non accordée sans condition ; **l'écran reflète exactement `buildLearningPath`** ;
  action principale + **routes exactes** `/monde/{id}` ; carte verrouillée actionnable (bouton actif,
  hint dédié) ; **aucun** nom accessible réduit à un nombre ; progression globale annoncée **une seule
  fois** ; reprise après remontage ; **aucune mutation** au montage/à l'ouverture ; aucun
  NaN/undefined/Infinity ; **invariants de `learningMap` inchangés**.
- `parcoursNoEmoji.test.ts` (garde-fou générique `findEmoji`) et `parcoursSemanticColors.test.ts` (aucun
  `bullish`/`bearish`/`technical`/`advanced` ; `success`/`mastery`/`info` présents).

## Captures (déterministes, script séparé)
`scripts/capture-parcours.mjs` (manifeste séparé, ne touche ni au pilote, ni à l'Accueil, ni à Révisions,
ni au Profil) — horloge et fuseau **figés** (`Europe/Zurich`), état local déterministe (clé `progress`
v8 par scénario, ensembles de fiches **complets** issus de `conceptsByWorld`), parcours réel côté client
(racine → « Reprendre » → Accueil → onglet **Apprendre**). La fenêtre est ajustée à la hauteur réelle du
contenu pour capturer **toute** la roadmap (le ScrollView clipperait sinon). 7 PNG : `parcours-new-320`,
`parcours-progress-390`, `parcours-checkpoint-390`, `parcours-explored-390`, `parcours-advanced-web`
(1440), `parcours-large-text` (zoom navigateur), `parcours-reduced-motion`. Échec sur : erreur console,
pageerror, mauvais écran, **mauvais onglet actif**, mauvaise route, build obsolète, **signature de
scénario incorrecte** (CTA principal absent), statut/bande manquants, `NaN`/`undefined`/`Infinity`,
débordement horizontal, capture manquante ou parasite.

- **Onglet Apprendre = onglet primaire SÉLECTIONNABLE** : chaque capture vérifie `role="tab"` **nom
  « Apprendre » avec `selected: true`**, les 5 onglets primaires, la route résolue `/TradeMy/parcours`,
  et le marqueur stable « TA PROCHAINE ÉTAPE » (anti-build-obsolète).

## Confirmation — moteur, données et persistance NON modifiés
Aucune modification de : `src/data/learningMap.ts`, `GUIDED_MODULES`, `LEVEL_BANDS`, les 15 mondes, les
concepts, les règles de déblocage, le moteur de maîtrise, le moteur de répétition espacée, la
progression, la persistance, les migrations, l'authentification, les abonnements, la navigation globale,
les routes, `src/app/monde/[id].tsx`, ni les autres écrans (Accueil, Révisions, Profil, Bibliothèque,
Laboratoire). Le diff ne touche **aucun** fichier de `src/engines/` ni les repositories de progression.
Tests d'invariants en garde-fou.

## Limites restantes
- **Dette de shell (hors périmètre 4-E)** : à ~320 px, les **libellés d'onglets** de la barre restent
  **tronqués** (contrainte du shell/tab-bar), comme noté en 4-B/4-C/4-D. Non corrigée ici.
- Un seul **module guidé** existe aujourd'hui (`module.foundations.read-chart`) : la roadmap est prête à
  en accueillir d'autres dès qu'ils seront ajoutés à `GUIDED_MODULES` (hors périmètre présentationnel).

**LOT 4-F (Bibliothèque) : non commencé** — sera cadré séparément depuis le canon, après validation humaine.
