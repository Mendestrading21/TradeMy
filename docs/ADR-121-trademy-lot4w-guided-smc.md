# ADR-121 — LOT 4-W : module guidé « Lire le Smart Money » (`world.smc`)

- **Statut** : accepté (programme « développer jusqu'au bout » — cadre ADR-111).
- **Contexte** : le monde 12 (`world.smc`, **5 concepts réels**, tous `needsReview`) devient le
  **douzième module guidé**. Les mondes guidés forment un **préfixe 1..12** (verrouillé par test).

## Principe pédagogique central
Le prix laisse des traces — zones de départ (demande/offre), déséquilibres (FVG), dernières bougies
opposées (order block), cassures à contre-tendance (CHoCH) — qui sont des ZONES D'INTÉRÊT à
surveiller, jamais des signaux : la réaction observée du prix, avec la structure, fait foi.
Cinq compétences, une par concept réel du monde. Éducatif de bout en bout : entrée théorique,
invalidation, objectif pédagogique — jamais d'ordre.

### Cinq compétences (concepts réels)
| Compétence | Concept réel (slug) | Objectifs ciblés par le module |
|---|---|---|
| `skill.smc.orderblock` — L'order block | `concept.order-block` (order-block) | les 5 natures |
| `skill.smc.fvg` — Le fair value gap | `concept.fair-value-gap` (fair-value-gap) | les 5 natures |
| `skill.smc.choch` — Le changement de caractère | `concept.change-of-character` (changement-de-caractere) | les 5 natures |
| `skill.smc.demand` — La zone de demande | `concept.demand-zone` (zone-de-demande) | les 5 natures |
| `skill.smc.supply` — La zone d'offre | `concept.supply-zone` (zone-d-offre) | les 5 natures |

Checkpoint **propre** : `checkpoint.smc` (« Revue — Smart Money Concepts »). **25 exercices**
(5 × 5), 5 leçons visual-first sur les datasets réels des fiches.

### Honnêteté du modèle
- **Seule la zone de demande s'invalide par un PLANCHER documenté** (« clôture franche SOUS la
  zone ») → elle porte le SEUL exercice de **placement** du module (plus bas réel de la série
  seed 512, dérivé par le moteur).
- L'order block (traversée sans réaction), le FVG (éloignement durable), le CHoCH (reprise
  franche de la tendance initiale) et la zone d'offre (clôture **AU-DESSUS** — un plafond, pas un
  plancher) s'exercent par **scénario conditionnel**.
- **5 mécaniques distinctes** dans le module (reconnaissance, lecture ordonnée, scénario,
  placement, faux signal).
- Les reconnaissances rendent le **visuel réel de chaque fiche** (`chart-pattern` pour
  OB/FVG/CHoCH, `market-structure` pour demande/offre — deux types déjà supportés, aucune
  extension moteur) ; cohérence `visualSpec.type === visualType` + variant + dataset verrouillée
  par test.

## Tests (exécutés)
- `smcModuleScenarios.test.ts` : câblage, objectifs réels (les 5 natures sur les 5 concepts,
  ensembles exacts), gradabilité, placement exact (unique, sur la demande), cohérence
  dataset/variant/type (2 types de rendu), checkpoint propre, vocabulaire.
- Verrous : `repoTruth` (pin 42), `learningMap` (12 modules / 3 mondes fins / préfixe 1..12),
  `guidedModuleEngine` (12e checkpoint propre), `monde.integration` (fiche réelle du monde 12).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, zéro changement d'écran. Statuts éditoriaux inchangés.
Compteurs dérivés : 42 compétences guidées / 53 leçons / 187 exercices (cf. `repoTruth`).
