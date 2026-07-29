# ADR-124 — LOT 4-Z : module guidé « Déjouer les faux signaux » (`world.false-signals`)

- **Statut** : accepté (programme « développer jusqu'au bout » — cadre ADR-111, **lot final**).
- **Contexte** : le monde 15 (`world.false-signals`, **2 concepts réels**, tous `needsReview`)
  devient le **quinzième et DERNIER module guidé** : le parcours entier (mondes 1..15) est
  désormais guidé — **plus aucun « monde de contenu »** (verrouillé par test).

## Principe pédagogique central
La compétence finale du parcours est de savoir quand NE PAS croire un signal : une mèche qui
perce sans clôture n'est pas une cassure ; un franchissement aussitôt annulé est un piège. La
clôture confirmée fait foi, dans les deux sens. Deux compétences, une par concept réel du monde.

### Deux compétences (concepts réels)
| Compétence | Concept réel (slug) | Objectifs ciblés par le module |
|---|---|---|
| `skill.falsesignals.fakeout` — Le faux signal | `concept.fakeout` (faux-signal) | les 5 natures |
| `skill.falsesignals.breakout` — Le faux breakout | `concept.faux-breakout` (faux-breakout) | recognize, interpret, avoid-false-signal |

Checkpoint **propre** : `checkpoint.falsesignals` (« Revue — Faux signaux »). **8 exercices**
(5 + 3), 2 leçons visual-first sur le dataset réel des fiches (`structure.fakeout.v1`, rendu
`chart-pattern` pour le fakeout et `market-structure` pour le faux breakout).

### Honnêteté du modèle
- L'« invalidation » du fakeout est une **clôture confirmée AU-DELÀ du niveau** (la cassure
  devient valide) — un événement au-dessus, pas un plancher → **scénario conditionnel, aucun
  placement**.
- Le faux breakout ne documente **ni zone de confirmation ni invalidation** → 3 natures seulement.
  Aucun objectif inventé.
- **4 mécaniques distinctes** (reconnaissance, lecture ordonnée, scénario, faux signal).

### 15/15 : fin des « mondes de contenu »
Les tests dynamiques « premier monde NON guidé » n'ont plus d'objet — remplacés par des verrous
plus forts :
- `learningMap.test` : **P0 renforcé** — plus AUCUN monde ne peut être « terminé » (ni même
  « exploré ») par la seule consultation des fiches, monde par monde ; et tous les modules
  validés ⇒ les 15 mondes sont `done` (aucune impasse).
- `monde.integration` : fiche réelle du monde 15 « en cours » après W14 ; tous modules validés ⇒
  dernier monde « Terminé », `SORTED.every(isGuidedWorld)`.
- `parcours.integration` : parcours entier terminé (label « Niveau : terminé » sur l'ordre 15) ;
  `buildLearningPath` ⇒ 15 × `done`.

## Tests (exécutés)
- `falseSignalsModuleScenarios.test.ts` : câblage, objectifs réels (ensembles exacts, 3 natures
  pour le faux breakout), 15/15 guidés, gradabilité, AUCUN placement, cohérence
  dataset/variant/type, checkpoint propre, vocabulaire.
- Verrous : `repoTruth` (pin 48), `learningMap` (15 modules / 0 monde fin / ordres 1..15),
  `guidedModuleEngine` (15e checkpoint propre), `monde.integration` + `parcours.integration`.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, zéro changement d'écran. Statuts éditoriaux inchangés.
Compteurs dérivés : 48 compétences guidées / 59 leçons / 213 exercices (cf. `repoTruth`).
