# ADR-118 — LOT 4-T : module guidé « Lire la price action » (`world.price-action`)

- **Statut** : accepté (programme « développer jusqu'au bout » — cadre ADR-111).
- **Contexte** : le monde 9 (`world.price-action`, **3 concepts réels**, tous `needsReview`) devient
  le **neuvième module guidé**. Les mondes guidés forment un **préfixe 1..9** (verrouillé par test).

## Principe pédagogique central
Avant tout indicateur, le prix raconte déjà tout : OÙ il réagit (les zones), COMMENT il est
repoussé (les mèches) et À QUEL RYTHME il avance (impulsions et corrections). Trois compétences,
une par concept réel du monde.

### Trois compétences (concepts réels)
| Compétence | Concept réel (slug) | Objectifs ciblés par le module |
|---|---|---|
| `skill.priceaction.reading` — Le prix nu | `concept.price-action-intro` (price-action) | recognize, interpret, confirm, avoid-false-signal |
| `skill.priceaction.wick` — La mèche de rejet | `concept.meche-de-rejet` (meche-de-rejet) | recognize, interpret, avoid-false-signal |
| `skill.priceaction.impulse` — Impulsion et correction | `concept.impulsion-et-correction` (impulsion-et-correction) | recognize, interpret, avoid-false-signal |

Checkpoint **propre** : `checkpoint.priceaction` (« Revue — Price action »). **10 exercices**
(4 + 3 + 3), 3 leçons visual-first sur les datasets réels des fiches.

### Honnêteté du modèle
- **AUCUN concept du monde ne documente d'invalidation** → aucun objectif `invalidate` inventé,
  AUCUN placement (4 mécaniques distinctes, comme les modules Anatomie et Volume).
- Seule l'intro documente une zone de confirmation → la mèche de rejet et l'impulsion/correction
  portent 3 exercices chacune (leurs objectifs réels seulement).

## Tests (exécutés)
- `priceActionModuleScenarios.test.ts` : câblage, objectifs réels (ensembles exacts par concept,
  `invalidate` ABSENT honnêtement), gradabilité (grader réel), cohérence dataset/variant/type de
  rendu, aucun placement, checkpoint propre, vocabulaire.
- Verrous : `repoTruth` (pin 32), `learningMap` (9 modules / 6 mondes fins / préfixe 1..9),
  `guidedModuleEngine` (9e checkpoint propre et indépendant), `monde.integration`
  (fiche réelle du monde 9 : 3 compétences + checkpoint + prochaine étape).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, zéro changement moteur/écran. Statuts éditoriaux inchangés.
Compteurs dérivés : 32 compétences guidées / 43 leçons / 140 exercices (cf. `repoTruth`).
