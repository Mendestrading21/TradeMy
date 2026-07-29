# ADR-119 — LOT 4-U : module guidé « Gérer le risque » (`world.risk`)

- **Statut** : accepté (programme « développer jusqu'au bout » — cadre ADR-111).
- **Contexte** : le monde 10 (`world.risk`, **3 concepts réels**, tous `needsReview`) devient le
  **dixième module guidé**. Les mondes guidés forment un **préfixe 1..10** (verrouillé par test).

## Principe pédagogique central
Le risque se décide AVANT l'entrée : le stop borne la perte (l'invalidation), le rapport
risque/rendement se compare à l'avance, et la taille découle du risque accepté — jamais de
l'envie. Trois compétences, une par concept réel du monde. Éducatif de bout en bout : entrée
théorique, invalidation, objectif pédagogique — jamais d'ordre.

### Trois compétences (concepts réels)
| Compétence | Concept réel (slug) | Objectifs ciblés par le module |
|---|---|---|
| `skill.risk.reward` — Risque et rendement | `concept.risk-reward` (risque-rendement) | recognize, interpret, confirm, invalidate, avoid-false-signal |
| `skill.risk.stop` — Le stop-loss | `concept.stop-loss` (stop-loss) | recognize, interpret, confirm, invalidate, avoid-false-signal |
| `skill.risk.sizing` — La taille de position | `concept.position-sizing` (taille-de-position) | recognize, interpret, confirm, avoid-false-signal |

Checkpoint **propre** : `checkpoint.risk` (« Revue — Risk management »). **14 exercices**
(5 + 5 + 4), 3 leçons visual-first sur le dataset `risk.setup.v1` réel des fiches.

### Honnêteté du modèle
- **Le stop EST un plancher documenté** (« stop placé sous le support : la perte est bornée si le
  niveau cède ») → le stop-loss porte le SEUL exercice de **placement** du module (la mécanique la
  plus fidèle au concept : placer soi-même l'invalidation).
- L'invalidation du risque/rendement (« atteinte du stop : perte bornée, hypothèse abandonnée »)
  est un ÉVÉNEMENT, pas un plancher → scénario conditionnel.
- La taille de position ne documente pas d'invalidation → aucun objectif inventé.
- **5 mécaniques distinctes** dans le module (reconnaissance, lecture ordonnée, scénario,
  placement, faux signal).

### Extension moteur minimale
Le `visualType` de la reconnaissance accepte `'risk-reward'` : les trois fiches du monde partagent
ce rendu (schéma entrée/stop/cible, `risk.setup.v1`) — même mécanique que `volume-profile` au
LOT 4-S, cohérence `visualSpec.type === visualType` verrouillée par test.

## Tests (exécutés)
- `riskModuleScenarios.test.ts` : câblage, objectifs réels (ensembles exacts), gradabilité,
  placement exact (plus bas réel de la série seed 411, unique au stop), cohérence
  dataset/variant/type, checkpoint propre, vocabulaire.
- Verrous : `repoTruth` (pin 35), `learningMap` (10 modules / 5 mondes fins / préfixe 1..10),
  `guidedModuleEngine` (10e checkpoint propre), `monde.integration` (fiche réelle du monde 10).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, zéro changement d'écran. Statuts éditoriaux inchangés.
Compteurs dérivés : 35 compétences guidées / 46 leçons / 154 exercices (cf. `repoTruth`).
