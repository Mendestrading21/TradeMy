# ADR-123 — LOT 4-Y : module guidé « Lire les payoffs d'options » (`world.options`)

- **Statut** : accepté (programme « développer jusqu'au bout » — cadre ADR-111).
- **Contexte** : le monde 14 (`world.options`, **2 concepts réels**, tous `needsReview`) devient le
  **quatorzième module guidé**. Les mondes guidés forment un **préfixe 1..14** (verrouillé par
  test) ; seul le monde 15 reste une collection de notions.

## Principe pédagogique central
Une option est un DROIT, jamais une obligation : le payoff se lit AVANT tout — perte bornée à la
prime d'un côté, seuil de rentabilité de l'autre, et l'effet du temps qui érode la valeur. Deux
compétences, une par concept réel du monde. Éducatif de bout en bout, **sans exécution**.

### Deux compétences (concepts réels)
| Compétence | Concept réel (slug) | Objectifs ciblés par le module |
|---|---|---|
| `skill.options.call` — Le call | `concept.options-basics` (option-call) | les 5 natures |
| `skill.options.put` — Le put | `concept.put-option` (option-put) | les 5 natures |

Checkpoint **propre** : `checkpoint.options` (« Revue — Options et volatilité »). **10 exercices**
(5 + 5), 2 leçons visual-first sur le payoff réel des fiches.

### Honnêteté du modèle
- Les invalidations documentées sont des **ÉTATS à l'échéance** (« sous le strike », « au-dessus
  du strike » : le droit expire, perte limitée à la prime) — pas des planchers de prix d'une
  série → **scénarios conditionnels, AUCUN placement**.
- **4 mécaniques distinctes** (reconnaissance, lecture ordonnée, scénario, faux signal).
- Les reconnaissances rendent le **payoff réel des fiches** : le `visualType` de la reconnaissance
  accepte `'option-payoff'` (même mécanique d'extension que `volume-profile` au LOT 4-S et
  `risk-reward` au LOT 4-U — le renderer `OptionPayoff` existait déjà, y compris le mode
  « énigme »). Le payoff est **calculé depuis le variant** (call/put) : ni la fiche ni l'exercice
  ne portent de dataset OHLC (`datasetKey` vide, cohérence verrouillée par test — même convention
  `noDatasetTypes` que le deck de révision).

### Adaptation des tests dynamiques « monde de contenu »
Le premier monde NON guidé est désormais le **dernier** du parcours (monde 15) : les assertions
« le monde suivant est débloqué » de `learningMap.test` et `parcours.integration` deviennent
conditionnelles à l'existence d'un monde suivant (elles restaient écrites pour un monde de contenu
au milieu du parcours). Sémantique inchangée : exploré ≠ terminé, déblocage vérifié quand un
suivant existe.

## Tests (exécutés)
- `optionsModuleScenarios.test.ts` : câblage, objectifs réels (les 5 natures sur les 2 concepts),
  gradabilité, AUCUN placement (vérifié explicitement), cohérence payoff/variant/type (datasetKey
  vide comme la fiche), checkpoint propre, vocabulaire.
- Verrous : `repoTruth` (pin 46), `learningMap` (14 modules / 1 monde fin / préfixe 1..14),
  `guidedModuleEngine` (14e checkpoint propre), `monde.integration` (fiche réelle du monde 14).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, zéro changement d'écran (extension d'union de 2 lignes,
renderer existant). Statuts éditoriaux inchangés. Compteurs dérivés : 46 compétences guidées /
57 leçons / 205 exercices (cf. `repoTruth`).
