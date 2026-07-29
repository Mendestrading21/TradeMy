# ADR-120 — LOT 4-V : module guidé « Déjouer ses biais » (`world.psychology`)

- **Statut** : accepté (programme « développer jusqu'au bout » — cadre ADR-111).
- **Contexte** : le monde 11 (`world.psychology`, **2 concepts réels**, tous `needsReview`) devient
  le **onzième module guidé**. Les mondes guidés forment un **préfixe 1..11** (verrouillé par test).

## Principe pédagogique central
La décision se juge sur le PROCESSUS, pas sur l'issue d'une seule idée. Le FOMO pousse à entrer
trop tard, sur l'émotion ; la discipline exécute un plan décidé à froid (contexte, niveau,
confirmation, invalidation, taille). Deux compétences, une par concept réel du monde. Éducatif de
bout en bout : entrée théorique, invalidation, objectif pédagogique — jamais d'ordre.

### Deux compétences (concepts réels)
| Compétence | Concept réel (slug) | Objectifs ciblés par le module |
|---|---|---|
| `skill.psychology.fomo` — Le FOMO | `concept.fomo` (fomo) | recognize, interpret, confirm, avoid-false-signal |
| `skill.psychology.discipline` — Discipline et plan | `concept.trading-discipline` (discipline) | recognize, interpret, confirm, avoid-false-signal |

Checkpoint **propre** : `checkpoint.psychology` (« Revue — Psychologie et biais »). **8 exercices**
(4 + 4), 2 leçons visual-first sur les datasets réels des fiches (`structure.parabolic.v1`,
`structure.break-retest.v1`).

### Honnêteté du modèle
- **Aucun des deux concepts ne documente d'invalidation top-level** (leurs « invalidations » sont
  des comportements — entrer sur l'émotion, improviser hors plan — décrits dans `neutralScenario`,
  pas des planchers de prix) → **ni objectif `invalidate`, ni placement**. Aucun objectif inventé.
- **4 mécaniques distinctes** dans le module (reconnaissance, lecture ordonnée, scénario,
  faux signal).
- Les reconnaissances rendent le **visuel réel des fiches** (`chart-pattern`, déjà supporté —
  aucune extension moteur) : parabole du FOMO, cassure-retest de la discipline ; cohérence
  `visualSpec.type === visualType` + variant + dataset verrouillée par test.

## Tests (exécutés)
- `psychologyModuleScenarios.test.ts` : câblage, objectifs réels (ensembles exacts), gradabilité,
  AUCUN placement (vérifié explicitement), cohérence dataset/variant/type, checkpoint propre,
  vocabulaire.
- Verrous : `repoTruth` (pin 37), `learningMap` (11 modules / 4 mondes fins / préfixe 1..11),
  `guidedModuleEngine` (11e checkpoint propre), `monde.integration` (fiche réelle du monde 11).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, zéro changement d'écran. Statuts éditoriaux inchangés.
Compteurs dérivés : 37 compétences guidées / 48 leçons / 162 exercices (cf. `repoTruth`).
