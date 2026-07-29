# ADR-111 — LOT 4-N : module guidé « Lire la structure » (`world.structure`)

- **Statut** : accepté (programme « développer jusqu'au bout » autorisé par le propriétaire le
  29/07/2026 : chaque monde devient un module guidé, lot par lot, gate verte à chaque fusion).
- **Contexte** : après Fondations (monde 1) et Chandeliers (monde 3, ADR-109), le monde 4
  (`world.structure`, 5 concepts réels, tous `needsReview`) devient le **troisième module guidé**.
  Le moteur multi-module (registre `CONTENT_MODULES`) absorbe le module par **une entrée** de
  registre — zéro changement moteur, zéro nouveau primitif d'interaction.

## Principe pédagogique central
La tendance se lit dans la **structure** (suite de sommets et de creux), jamais dans une bougie ni
une opinion. Le module enseigne la grammaire : séquence haussière (HH/HL), son symétrique baissier
(LH/LL), la zone d'équilibre (range), puis la rupture (cassure de structure) — toujours en
probabiliste, jamais en certitude. Aucun vocabulaire BUY/SELL, aucune promesse.

### Quatre compétences atomiques ordonnées (concepts RÉELS de `world.structure`)
| Compétence | Concept réel (slug) | Objectifs ciblés (dérivés des champs du concept) |
|---|---|---|
| `skill.structure.uptrend` — La tendance haussière | `concept.uptrend` (tendance-haussiere) | recognize, interpret, invalidate, avoid-false-signal |
| `skill.structure.downtrend` — La tendance baissière | `concept.downtrend` (tendance-baissiere) | recognize, interpret, confirm, avoid-false-signal |
| `skill.structure.range` — Le range | `concept.range` (range) | recognize, interpret, confirm, avoid-false-signal |
| `skill.structure.break` — La cassure de structure | `concept.break-of-structure` (cassure-de-structure) | recognize, interpret, confirm, avoid-false-signal |

Checkpoint **propre** : `checkpoint.structure` (« Revue — Tendances et structure »), jamais partagé.
Objectifs **jamais inventés** (dérivés de `learningTarget`). **Honnêteté du placement** : le seul
placement d'invalidation (plancher) est attaché à la tendance haussière — son invalidation documentée
EST un plancher (un creux sous le creux précédent). Le BOS baissier s'invalide **au-dessus** du
niveau cassé → aucun placement de plancher ne lui est attaché. `concept.break-and-retest` (5e fiche
du monde) reste une notion consultable, non attachée à une compétence.

### Source sémantique unique et mécaniques
`structureModuleScenarios.ts` : 16 `LearningScenario` (4 par compétence) d'où dérivent visuel,
bonne réponse, feedback et résumé accessible. 5 types d'exercice réellement distincts
(`identify_figure` sur les datasets `market-structure` réels des fiches, `order`,
`place_invalidation`, `scenario`, `find_error`). L'interaction `identify-candle` du moteur acceptait
déjà `visualType: 'market-structure'` — réutilisée telle quelle.

### Leçons
4 leçons visual-first (`lesson.structure-*`, statut `draft`, source « Voix pédagogique Trademy »),
avec étape `visual` sur la fiche réelle et étape `hypothesis` (Toto/Bobo) quand le concept porte un
scénario conditionnel.

## Conséquences
- **+** 3e parcours guidé complet ; compteurs honnêtes : 12 compétences guidées / 23 leçons /
  63 exercices (dérivés, cf. `repoTruth`).
- **+** Routes `/session/skill.structure.*` et `/session/checkpoint.structure` pré-générées
  automatiquement (generateStaticParams dérive de `CONTENT_MODULES`).
- **−** Un utilisateur ayant « exploré » le monde 4 par lecture ne le voit plus « terminé » sans le
  checkpoint (comportement voulu ; état dérivé, aucune perte de données). Aucune migration.

## Tests (exécutés)
- `structureModuleScenarios.test.ts` : câblage, objectifs réels (BOS sans placement de plancher),
  gradabilité par le grader réel, cohérence structure/dataset/variant, checkpoint propre, vocabulaire.
- `learningMap.test.ts` (3 modules, 12 mondes fins), `repoTruth.test.ts` (pin 12), `offline.test.ts`,
  `guidedModuleEngine.test.ts` (3e module indépendant).
- `monde.integration.test.tsx` : fiche du monde 4 réelle — 4 compétences + checkpoint propre +
  prochaine étape `/session/skill.structure.uptrend` + notion liée ouvrable.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, aucun changement moteur/écran. Statuts éditoriaux inchangés
(`needsReview`). Fondations, Chandeliers et les 11 autres mondes inchangés.
