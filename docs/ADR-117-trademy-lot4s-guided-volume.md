# ADR-117 — LOT 4-S : module guidé « Lire le volume » (`world.volume`)

- **Statut** : accepté (programme « développer jusqu'au bout » — cadre ADR-111).
- **Contexte** : le monde 8 (`world.volume`, **3 concepts réels**, tous `needsReview`) devient le
  **huitième module guidé**. Les mondes guidés forment un **préfixe 1..8** (verrouillé par test).

## Principe pédagogique central
Le volume mesure la PARTICIPATION, jamais la direction. Un mouvement accompagné se lit autrement
qu'un mouvement désert — et un palier très échangé (profil de volume) est une zone de mémoire du
marché, pas une promesse. Trois compétences, une par concept réel du monde.

### Trois compétences (concepts réels)
| Compétence | Concept réel (slug) | Objectifs ciblés par le module |
|---|---|---|
| `skill.volume.participation` — Le volume | `concept.volume` (volume) | recognize, interpret, confirm, avoid-false-signal |
| `skill.volume.vwap` — Le VWAP | `concept.vwap` (vwap) | recognize, interpret, confirm, avoid-false-signal |
| `skill.volume.profile` — Le profil de volume | `concept.volume-profile` (profil-de-volume) | recognize, interpret, confirm, invalidate, avoid-false-signal |

Checkpoint **propre** : `checkpoint.volume` (« Revue — Volume et profil »). **13 exercices**
(2×4 + 5), 3 leçons visual-first sur les datasets réels des fiches.

### Honnêteté du modèle
- **`volume` et `vwap` ne documentent PAS d'invalidation** → aucun objectif `invalidate` inventé.
- **Seul le profil de volume documente une invalidation** (« le prix ignore le palier et le
  traverse franchement ») — contextuelle, PAS un plancher → exercée par scénario conditionnel,
  AUCUN placement dans ce module ; le profil porte 5 exercices (ses 5 natures sont documentées).

### Extension moteur minimale
Le `visualType` de la reconnaissance (`identify-candle` / `identify_figure`) accepte désormais
`'volume-profile'` : le player rendait déjà via `VisualCard` (qui supporte les 11 types de visuels),
seule l'union de types l'interdisait. La reconnaissance du profil montre ainsi le **rendu réel de
sa fiche** (histogramme par niveau) — cohérence verrouillée par test (`visualSpec.type === visualType`).

## Tests (exécutés)
- `volumeModuleScenarios.test.ts` : câblage, objectifs réels (ensembles exacts par concept),
  gradabilité (grader réel), cohérence dataset/variant/TYPE de rendu, aucun placement,
  checkpoint propre, vocabulaire.
- Verrous : `repoTruth` (pin 29), `learningMap` (8 modules / 7 mondes fins / préfixe 1..8),
  `guidedModuleEngine` (8e checkpoint propre et indépendant), `monde.integration`
  (fiche réelle du monde 8 : 3 compétences + checkpoint + prochaine étape).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, zéro changement d'écran. Statuts éditoriaux inchangés.
Compteurs dérivés : 29 compétences guidées / 40 leçons / 130 exercices (cf. `repoTruth`).
