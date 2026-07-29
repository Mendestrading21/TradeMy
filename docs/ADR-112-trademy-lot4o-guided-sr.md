# ADR-112 — LOT 4-O : module guidé « Lire les niveaux » (`world.support-resistance`)

- **Statut** : accepté (programme « développer jusqu'au bout » — ADR-111 pour le cadre).
- **Contexte** : après Fondations, Chandeliers (ADR-109) et Structure (ADR-111), le monde 5
  (`world.support-resistance`, **3 concepts réels**, tous `needsReview`) devient le **quatrième
  module guidé** via une entrée du registre `CONTENT_MODULES` — zéro changement moteur.

## Principe pédagogique central
Un niveau est une **zone de mémoire du marché**, jamais une ligne exacte — et jamais une garantie.
Le module enseigne : les zones (support/résistance), le changement de rôle (polarité/flip), et le
retour qui teste (retest) — qui peut confirmer COMME invalider.

### Trois compétences (le monde compte trois concepts réels — aucun objectif inventé)
| Compétence | Concept réel (slug) | Objectifs ciblés (dérivés des champs du concept) |
|---|---|---|
| `skill.sr.zones` — Les zones de mémoire | `concept.support-resistance` (support-resistance) | recognize, interpret, invalidate, avoid-false-signal |
| `skill.sr.flip` — La polarité (flip) | `concept.polarity-flip` (polarite-flip) | recognize, interpret, confirm, avoid-false-signal |
| `skill.sr.retest` — Le retest | `concept.retest-de-niveau` (retest-de-niveau) | recognize, interpret, avoid-false-signal |

Checkpoint **propre** : `checkpoint.sr` (« Revue — Supports et résistances »).

### Honnêteté du modèle
- `retest-de-niveau` ne documente **ni zone de confirmation ni invalidation** → **3 exercices
  seulement** (comme le doji sans invalidation au LOT 4-M). 4+4+3 = **11 exercices**.
- Le seul **placement de plancher** est attaché au support (invalidation documentée = clôture nette
  SOUS la zone). Le flip s'invalide par un retour de l'AUTRE CÔTÉ du niveau → aucun placement.
- Les reconnaissances rendent les datasets `market-structure` réels des fiches
  (`structure.support-resistance.v1` ×2 avec variants distincts, `structure.break-retest.v1`).

### Leçons
3 leçons visual-first (`lesson.sr-*`, statut `draft`), étape `hypothesis` sur le flip (Toto/Bobo).

## Tests (exécutés)
- `srModuleScenarios.test.ts` : câblage, objectifs réels (retest à 3), gradabilité, cohérence
  dataset/variant, checkpoint propre, vocabulaire.
- Verrous : `repoTruth` (pin 15 compétences), `learningMap` (4 modules / 11 mondes fins),
  `guidedModuleEngine` (4e checkpoint indépendant), `monde.integration` (fiche réelle du monde 5 :
  3 compétences + checkpoint propre + prochaine étape `/session/skill.sr.zones`).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, zéro changement moteur/écran. Statuts éditoriaux inchangés.
Compteurs dérivés : 15 compétences guidées / 26 leçons / 74 exercices (cf. `repoTruth`).
