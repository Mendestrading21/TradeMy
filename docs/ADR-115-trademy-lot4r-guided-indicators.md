# ADR-115 — LOT 4-R : module guidé « Lire les indicateurs » (`world.indicators`)

- **Statut** : accepté (programme « développer jusqu'au bout » — cadre ADR-111).
- **Contexte** : le monde 7 (`world.indicators`, **4 concepts réels**, tous `needsReview`) devient le
  **septième module guidé**. Les mondes guidés forment un **préfixe 1..7** (verrouillé par test).

## Principe pédagogique central
Un indicateur DÉRIVE du prix : il résume, il ne prédit pas. Ses seuils et croisements sont des
repères de contexte, jamais des ordres — la structure de prix confirme (ou contredit) toujours la
lecture. Quatre compétences, une par concept réel du monde.

### Quatre compétences (concepts réels)
| Compétence | Concept réel (slug) | Objectifs ciblés par le module |
|---|---|---|
| `skill.indicators.rsi` — Le RSI | `concept.rsi` (rsi) | recognize, interpret, confirm, avoid-false-signal |
| `skill.indicators.macd` — Le MACD | `concept.macd` (macd) | recognize, interpret, confirm, avoid-false-signal |
| `skill.indicators.bollinger` — Les bandes de Bollinger | `concept.bollinger` (bandes-de-bollinger) | recognize, interpret, confirm, avoid-false-signal |
| `skill.indicators.divergence` — La divergence | `concept.divergence` (divergence) | recognize, interpret, confirm, invalidate, avoid-false-signal |

Checkpoint **propre** : `checkpoint.indicators` (« Revue — Indicateurs techniques »). **17 exercices**
(3×4 + 5), 4 leçons visual-first sur les datasets `indicator` réels des fiches.

### Honnêteté du modèle
- **RSI, MACD et Bollinger ne documentent PAS d'invalidation** (seulement zone de confirmation et
  faux signal) → aucun objectif `invalidate` inventé pour eux.
- **Seule la divergence documente une invalidation** (« poursuite de la tendance qui efface le
  désaccord ») → un seul exercice `invalidate`, par scénario conditionnel ; la divergence est le
  seul concept du monde dont les 5 natures sont documentées → **5 exercices** pour elle.
- **Aucune invalidation-plancher** dans le monde → AUCUN placement d'invalidation (4 mécaniques
  distinctes : reconnaissance visuelle, lecture ordonnée, scénario conditionnel, faux signal —
  comme le module Anatomie, cf. ADR-113).

## Tests (exécutés)
- `indicatorsModuleScenarios.test.ts` : câblage, objectifs réels (ensembles exacts par concept),
  gradabilité (grader réel), cohérence indicateur/dataset/variant (`visualType: 'indicator'`),
  aucun placement, checkpoint propre, vocabulaire.
- Verrous : `repoTruth` (pin 26), `learningMap` (7 modules / 8 mondes fins / préfixe 1..7),
  `guidedModuleEngine` (7e checkpoint propre et indépendant), `monde.integration`
  (fiche réelle du monde 7 : 4 compétences + checkpoint + prochaine étape).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, zéro changement moteur/écran. Statuts éditoriaux inchangés.
Compteurs dérivés : 26 compétences guidées / 37 leçons / 117 exercices (cf. `repoTruth`).
