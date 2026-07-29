# ADR-114 — LOT 4-Q : module guidé « Lire les figures » (`world.patterns`)

- **Statut** : accepté (programme « développer jusqu'au bout » — cadre ADR-111).
- **Contexte** : le monde 6 (`world.patterns`, **13 concepts réels**, tous `needsReview`) devient le
  **sixième module guidé**. Les mondes guidés forment un **préfixe 1..6** (verrouillé par test).

## Principe pédagogique central
Une figure chartiste n'est jamais une promesse : c'est une hypothèse conditionnelle qui se
**confirme** (clôture, participation, retest) ou s'**invalide**. Quatre compétences par FAMILLES,
chacune ancrée sur un concept réel représentatif — les 9 autres figures du monde restent des
fiches consultables (non attachées à une compétence).

### Quatre compétences (familles → concepts réels)
| Compétence | Concept réel (slug) | Objectifs ciblés par le module |
|---|---|---|
| `skill.patterns.double` — Les doubles | `concept.double-bottom` (double-creux) | recognize, interpret, invalidate, avoid-false-signal |
| `skill.patterns.triangle` — Les triangles | `concept.ascending-triangle` (triangle-ascendant) | recognize, interpret, confirm, avoid-false-signal |
| `skill.patterns.flag` — Les drapeaux | `concept.bull-flag` (drapeau-haussier) | recognize, confirm, invalidate, avoid-false-signal |
| `skill.patterns.reversal` — Le retournement majeur | `concept.head-shoulders` (epaule-tete-epaule) | recognize, interpret, confirm, avoid-false-signal |

Checkpoint **propre** : `checkpoint.patterns` (« Revue — Figures chartistes ») — distinct de
l'ancien `skill.patterns` de Fondations (verrouillé par test). **16 exercices** (4×4), 4 leçons
visual-first sur les datasets `chart-pattern` réels des fiches.

### Honnêteté du modèle
- Placement de plancher UNIQUEMENT pour les invalidations documentées comme planchers : le double
  creux (« sous le niveau des deux creux ») et le drapeau (« sous le bas du canal »). Le triangle
  s'invalide sous une ligne de creux **montante** (pas un plancher horizontal) et l'ÉTÉ, baissier,
  s'invalide **au-dessus** de la tête → pas de placement pour eux.
- `concept.double-bottom` était déjà ciblé par Fondations (recognize + confirm) : l'union couvre
  les 5 natures d'objectif — la maîtrise du concept exige les deux compétences (modèle par
  couverture, cf. ADR-113).

## Tests (exécutés)
- `patternsModuleScenarios.test.ts` : câblage, objectifs réels (unions documentées), gradabilité,
  cohérence figure/dataset/variant, 2 placements exacts (plus bas réel), checkpoint propre,
  vocabulaire.
- Verrous : `repoTruth` (pin 22), `learningMap` (6 modules / 9 mondes fins / préfixe 1..6),
  `guidedModuleEngine` (6e checkpoint, jamais l'ancien `skill.patterns`), `monde.integration`
  (fiche réelle du monde 6 : 4 compétences + checkpoint + prochaine étape).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, zéro changement moteur/écran. Statuts éditoriaux inchangés.
Compteurs dérivés : 22 compétences guidées / 33 leçons / 100 exercices (cf. `repoTruth`).
