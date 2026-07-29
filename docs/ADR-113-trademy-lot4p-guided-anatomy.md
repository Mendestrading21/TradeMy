# ADR-113 — LOT 4-P : module guidé « Lire un graphique de près » (`world.anatomy`)

- **Statut** : accepté (programme « développer jusqu'au bout » — cadre ADR-111).
- **Contexte** : le monde 2 (`world.anatomy`, **3 concepts réels**, tous `needsReview`) devient le
  **cinquième module guidé** via une entrée du registre `CONTENT_MODULES`. Avec lui, **les mondes
  1 à 5 forment un préfixe entièrement guidé** du parcours (verrouillé par test).

## Principe pédagogique central
Avant de lire des figures, on lit l'OUTIL : ce qu'une bougie contient (corps, mèches), ce qu'elle
résume (l'unité de temps) et ce que dit l'axe (l'échelle des prix — mesurer, pas impressionner).

### Trois compétences (le monde compte trois concepts réels — aucun objectif inventé)
| Compétence | Concept réel (slug) | Objectifs ciblés |
|---|---|---|
| `skill.anatomy.candle` — Le corps et les mèches | `concept.candle-anatomy` (anatomie-bougie) | recognize, interpret, confirm, avoid-false-signal |
| `skill.anatomy.timeframe` — L'unité de temps | `concept.unite-de-temps` (unite-de-temps) | recognize, interpret, avoid-false-signal |
| `skill.anatomy.scale` — L'échelle des prix | `concept.echelle-des-prix` (echelle-des-prix) | recognize, interpret, avoid-false-signal |

Checkpoint **propre** : `checkpoint.anatomy` (« Revue — Anatomie d'un graphique »). **10 exercices**
(4+3+3), 3 leçons visual-first. Honnêteté : aucun concept du monde ne documente d'invalidation-
plancher → **aucun placement d'invalidation** (4 mécaniques distinctes, pas 5) ; `unite-de-temps` et
`echelle-des-prix` sans zone de confirmation → 3 exercices chacun. `concept.candle-anatomy` est aussi
le concept de l'unité pilote (Fondations) : l'union des objectifs couverts reste exacte (le module
ajoute `confirm`).

## Changement de sémantique de progression (voulu et documenté)
Le monde 2 était un monde de CONTENU : consulter ses 3 fiches le marquait « exploré » et débloquait
la suite. Il est désormais GUIDÉ : **il se termine par la preuve (checkpoint), plus par la lecture** —
comportement canonique des mondes guidés (« une visite n'est pas une maîtrise »). État dérivé,
aucune migration, aucune perte de données : un utilisateur ayant déjà validé les mondes 3-5 garde
toute sa progression ; le monde 2 lui est simplement proposé comme module à valider.

Conséquence sur les preuves : les tests « monde de contenu » (fiche Monde, Parcours, learningMap)
sont rebasés sur **le premier monde NON guidé, choisi dynamiquement** (aujourd'hui `world.patterns`),
avec un état seedé « tous les modules guidés validés » dérivé de `CONTENT_MODULES` — robuste aux
conversions futures. Un verrou garantit que les mondes guidés forment un **préfixe** (ordres 1..N).

## Tests (exécutés)
- `anatomyModuleScenarios.test.ts` : câblage, objectifs réels (invalidate absent partout),
  gradabilité, cohérence visuel/dataset/variant, checkpoint propre, vocabulaire.
- Verrous : `repoTruth` (pin 18), `learningMap` (5 modules / 10 mondes fins / préfixe 1..5),
  `guidedModuleEngine` (5e checkpoint indépendant).
- `monde.integration` : fiche réelle du monde 2 guidé (3 compétences + checkpoint + prochaine étape
  `/session/skill.anatomy.candle`) ; tests « contenu » rebasés dynamiquement.
- `parcours.integration` : action principale du monde 2 = module guidé (« Ouvrir le module guidé ») ;
  test « exploré » rebasé sur le premier monde de contenu dynamique.
- Harnais de captures : seeds mis à jour (mondes 1-2 validés) pour rester fidèles à la progression.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, zéro changement moteur/écran. Statuts éditoriaux inchangés.
Compteurs dérivés : 18 compétences guidées / 29 leçons / 84 exercices (cf. `repoTruth`).
