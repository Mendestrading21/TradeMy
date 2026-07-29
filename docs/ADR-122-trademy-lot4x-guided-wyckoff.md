# ADR-122 — LOT 4-X : module guidé « Lire les phases Wyckoff » (`world.wyckoff`)

- **Statut** : accepté (programme « développer jusqu'au bout » — cadre ADR-111).
- **Contexte** : le monde 13 (`world.wyckoff`, **2 concepts réels**, tous `needsReview`) devient le
  **treizième module guidé**. Les mondes guidés forment un **préfixe 1..13** (verrouillé par test).

## Principe pédagogique central
Les grandes phases se lisent dans les ranges : une base où l'offre s'épuise (accumulation) ou un
sommet où l'offre absorbe la demande (distribution). Le CONTEXTE décide — un range sans contexte
n'est ni l'un ni l'autre. Deux compétences, une par concept réel du monde. Éducatif de bout en
bout : entrée théorique, invalidation, objectif pédagogique — jamais d'ordre.

### Deux compétences (concepts réels)
| Compétence | Concept réel (slug) | Objectifs ciblés par le module |
|---|---|---|
| `skill.wyckoff.accumulation` — L'accumulation | `concept.wyckoff-accumulation` (wyckoff-accumulation) | recognize, interpret, confirm, invalidate, avoid-false-signal |
| `skill.wyckoff.distribution` — La distribution | `concept.distribution-wyckoff` (distribution-wyckoff) | recognize, interpret, avoid-false-signal |

Checkpoint **propre** : `checkpoint.wyckoff` (« Revue — Phases Wyckoff »). **8 exercices**
(5 + 3), 2 leçons visual-first sur les datasets réels des fiches.

### Honnêteté du modèle
- **L'accumulation s'invalide par un PLANCHER documenté** (« rupture par le bas de la zone
  d'accumulation ») → elle porte le SEUL exercice de **placement** du module (plus bas réel de la
  série seed 613, dérivé par le moteur).
- **La distribution ne documente NI zone de confirmation NI invalidation** → 3 natures seulement
  (recognize, interpret, avoid-false-signal). Aucun objectif inventé.
- **5 mécaniques distinctes** dans le module (reconnaissance, lecture ordonnée, scénario,
  placement, faux signal).
- Les reconnaissances rendent le **visuel réel de chaque fiche** (`chart-pattern` pour
  l'accumulation, `market-structure` pour la distribution — types déjà supportés, aucune extension
  moteur) ; cohérence `visualSpec.type === visualType` + variant + dataset verrouillée par test.

## Tests (exécutés)
- `wyckoffModuleScenarios.test.ts` : câblage, objectifs réels (ensembles exacts, 3 natures pour la
  distribution), gradabilité, placement exact (unique, sur l'accumulation), cohérence
  dataset/variant/type, checkpoint propre, vocabulaire.
- Verrous : `repoTruth` (pin 44), `learningMap` (13 modules / 2 mondes fins / préfixe 1..13),
  `guidedModuleEngine` (13e checkpoint propre), `monde.integration` (fiche réelle du monde 13).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, zéro changement d'écran. Statuts éditoriaux inchangés.
Compteurs dérivés : 44 compétences guidées / 55 leçons / 195 exercices (cf. `repoTruth`).
