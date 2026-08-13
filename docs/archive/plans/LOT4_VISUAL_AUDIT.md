# LOT 4 — Audit visuel & fondation du design system

Canon : `docs/design/TRADEMY_LEARNING_GLASS.md` puis `src/design-system/`. Décision : `docs/ADR-097-trademy-lot4-visual-foundation.md`.

Audit **réel** effectué sur le dépôt à `main` (`ebc7b5a`), pas sur un audit ancien. Objectif du LOT 4 :
rationaliser l'existant (déjà token-driven) et ajouter une couche premium appliquée au **parcours
vertical pilote**, sans réécrire ni fragiliser le LOT 3.

## 1. Constats de l'audit (recherche ciblée)

| Piste cherchée | Constat | Décision |
|---|---|---|
| Couleurs écrites en dur dans les écrans | **0** (verrou `noHardcodedColors.test.ts` sur `src/app/**`) | Conserver le verrou |
| Emoji en substitut d'icône | Jalons du parcours (`monde/[id]` : 🔒🎉🏁✓🔁) | **Adapté** → `TrademyIcon` |
| Composant dupliqué | `StatTile` défini en local dans l'écran de session | **Fusionné** → `StatTile` partagé |
| Styles d'icônes mélangés | Non : une seule façade `TrademyIcon` déjà en place | Conserver, **compléter** |
| Espacements / rayons incohérents | Non : `spacing`/`radius` tokenisés | Conserver |
| Ombres excessives | Non : `elevation` discret (card/raised) | Conserver |
| Contrastes faibles | Non : `contrast.test.ts` garantit l'AA | Conserver le verrou |
| Cibles tactiles < 44 px | Non : `A11Y.minTouchTarget` + `hitSlopFor` | Conserver |
| Animations décoratives permanentes | Non (motion « explique », borné) | Ne rien ajouter en LOT 4-A |
| Débordement horizontal | 0 px à 320 / 390 / 430 / 1280 (le script de capture échoue sinon) | Vérifié |
| CTA visuellement actif mais mort | Aucun | — |

## 2. Matrice des composants (extrait décisionnel)

| Composant | Emplacement | Décision LOT 4 |
|---|---|---|
| `tokens.ts` (couleurs, spacing, radius, motion) | `src/design-system/` | **Adapter** (ajouts additifs) |
| `TrademyIcon` (façade unique) | `src/design-system/icons/` | **Adapter** (+18 glyphes nommés) |
| `Card`, `Button`, `Badge`, `Chip`, `ProgressBar`, `ProgressRing`, `XPBar` | `src/design-system/components/` | **Conserver** |
| `GlassCard`, `FeedbackPanel`, `EmptyState`, `StateView`, `Skeleton` | idem | **Conserver** |
| `StatTile` (inline, écran session) | `src/app/session/[skillId].tsx` | **Déprécier → fusionné** |
| `MarketStatePill` | *nouveau* `components/` | **Ajouter** |
| `StatTile` partagé | *nouveau* `components/` | **Ajouter** |
| `ProgressWidget` | *nouveau* `components/` | **Ajouter** |
| Personnages Toto/Bobo (`vector/`, `motionPlan`, `orchestrator`) | `src/characters/` | **Conserver** (rôles inchangés) |
| Graphiques (`candleGeometry`, `PatternChart`, `chartEngine`) | `src/engines/` | **Conserver** (source sémantique unique LOT 3) |

## 3. Catalogue des tokens ajoutés (LOT 4)

- Surfaces d'état : `surfaceSelected`, `surfaceLocked` ; focus : `focusRing`.
- État de marché (pédagogique, dérivé de la palette AA) : `confirmation` (cyan), `invalidation` (or),
  `falseSignal` (neutre). **Distincts** de `bullish`/`bearish` (direction) et de `feedbackCorrect`/
  `feedbackIncorrect` (pédagogie).
- Échelles : `opacity` (glass 6 % < liseré 12 %), `borderWidth` (thin/regular/thick),
  `touchTarget.min = 44`, `zIndex` (base→toast).

Règle inchangée : **violet** = marque/CTA ; **vert/rouge** = marché ; **cyan** = annotation ;
**or** = zone importante. La couleur n'est **jamais** le seul signal.

## 4. Catalogue d'icônes (famille A — interface & pédagogie)

Une seule famille (24×24, trait 2, terminaisons rondes). Concepts couverts : navigation
(home/learn/library/lab/profile), actions (search/star/check/close/lock/play/refresh/chart…),
**apprentissage** (review/unlocked/progression/checkpoint/mastery/hint/success/error/warning),
**marché** (market-up/market-down/volume/support/resistance/confirmation/invalidation/false-signal/
risk/psychology). Séparation stricte (LOT 4-A) : `progression` = apprentissage ; les DIRECTIONS de
marché utilisent des flèches neutres (`market-up`/`market-down`), jamais l'icône `progression` ni un
glyphe moralisant. Source de vérité et exhaustivité : `TRADEMY_ICON_NAMES` + `icons.test.ts`.

## 5. Règles des widgets « data premium »

- Verre **discret** : surface élevée + liseré fin (`glassBorder`), aucune généralisation du flou.
- **Aucune valeur inventée** : le widget rend ce que l'appelant fournit ; état vide prévu.
- Lisibilité AA, pas de texte minuscule, résumé accessible d'un bloc.
- Ne pas imiter une application de courtage ; réserver le verre à la progression, pas à tout.

## 6. Règles Toto / Bobo (rappel, inchangé en LOT 4)

Toto = guide principal (curieux, calme, encourageant) ; Bobo = contradicteur (pièges, faux signaux,
questionne). **Jamais** Toto = haussier / Bobo = baissier ; un marché baissier n'est pas une punition.

## 7. Règles de mouvement (rappel)

Échelle bornée `instant`(100) < `fast`(200) < `standard`(300) < `expressive`(550) < `celebration`(720).
Le mouvement EXPLIQUE, jamais de boucle décorative permanente ; reduced-motion pleinement informatif.
Le sous-lot 4-A **n'ajoute aucune animation**.

## 8. Source visuelle : canon retenu / anti-patterns rejetés

**Source unique** : le canon initial **TradeMy Learning Glass** — univers nuit bleutée/anthracite, verre
subtil ; famille d'icônes outline cohérente ; violet = apprentissage/progression/maîtrise ; vert/rouge =
directions de marché ; cyan = annotation technique ; or = zones importantes ; Toto & Bobo.

**Rejetés (anti-patterns)** : néon partout ; casino visuel ; verre/ombres sur chaque carte ; illustration
bitmap à la place d'un graphique exact ; toute image stock ou filigranée.

## 9. Guide de migration progressive

1. Consommer les nouveaux composants via `@/design-system` (barrel). Ne pas réintroduire de tuile ad hoc.
2. Remplacer un emoji-icône par `TrademyIcon` au fil des écrans (pas d'un coup).
3. Pour un état de marché, utiliser `MarketStatePill` (jamais une puce couleur seule).
4. Étendre l'application verticale écran par écran ; ne jamais toucher la logique pédagogique du LOT 3.
5. Sous-lot **4-B** : **non défini ici** — il sera cadré séparément depuis le canon initial TradeMy
   Learning Glass, après validation humaine.
