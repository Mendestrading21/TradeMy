# ADR-144 — LOT C4 : la même forme, l'autre histoire

- **Statut** : accepté (troisième tranche de la dette chiffrée par le LOT C1).
- **Contexte** : les LOTS C2 et C3 ont traité les **miroirs** — même figure, direction opposée. Il
  reste, dans le monde des chandeliers, une confusion d'une autre nature, et plus insidieuse.

## Le défaut

Trois figures du corpus ont **exactement la même silhouette** que des figures déjà enseignées, et un
sens **opposé**. Ce n'est plus la direction qui change : c'est le **contexte**.

- Le **pendu** a la forme exacte du **marteau** — petit corps en haut, longue mèche basse. Après une
  baisse c'est un marteau (haussier) ; après une hausse, un pendu (baissier).
- L'**étoile filante** et le **marteau inversé** ont la même forme — petit corps en bas, longue mèche
  haute. Après une hausse c'est une étoile filante (baissier) ; après une baisse, un marteau inversé
  (haussier).

**Le corpus documentait déjà la confusion sans jamais l'exercer.** Les trois fiches se signalent
mutuellement dans leurs `commonMistakes` (« le confondre avec un marteau — contexte opposé »,
« confondre étoile filante et marteau (forme proche, contexte opposé) »), et la flashcard du pendu
dit littéralement : « Même forme ; le contexte décide. » Mais aucun exercice ne mettait jamais
l'apprenant en situation de trancher.

## Décision

Trois compétences guidées dans le monde des chandeliers :

| Compétence | Concept | Sens | Invalidation |
|---|---|---|---|
| `skill.candle.context` — « Le contexte décide » | `concept.hanging-man` | baissier | **en haut** |
| `skill.candle.rejection-high` — « Le rejet par le haut » | `concept.shooting-star` | baissier | **en haut** |
| `skill.candle.rejection-low` — « Le même rejet, l'autre histoire » | `concept.inverted-hammer` | **haussier** | **en bas** |

1. **La reconnaissance pose le contexte AVANT la forme.** Les trois énoncés commencent par « Cette
   bougie apparaît APRÈS UNE HAUSSE » (ou une baisse), et les mauvaises réponses proposées sont
   précisément les figures jumelles. On ne peut pas répondre en regardant la silhouette.
2. **La lecture ordonnée met le contexte en première étape** — « Regarde ce qui PRÉCÈDE » — parce que
   c'est l'ordre de lecture que ces figures exigent, et l'inverse de celui qu'on adopte
   spontanément.
3. **Le faux signal de chaque compétence porte l'erreur attendue** : « une longue mèche basse annonce
   toujours une reprise des acheteurs, quel que soit ce qui précède » ; « puisqu'il a la même forme
   que l'étoile filante, il s'invalide comme elle, vers le haut ».
4. **La règle du LOT C3 tient dans un autre monde** : deux figures baissières invalidées en haut, une
   haussière invalidée en bas. Le marteau inversé le dit explicitement dans son feedback : « deux
   bougies de forme identique n'ont pas la même invalidation ; c'est le SENS du setup qui décide,
   jamais la silhouette ».

## Résultat mesurable

- **Compétences : 53 → 56.** Monde des chandeliers : 5 → 8, pour 14 concepts.
- **Fiches de bibliothèque : 17 → 14.**
- **Concepts inchangés : 67.**

## Un test rendu robuste, pas contourné

`conceptMasteryState.test.ts` illustrait le garde-fou P0 avec le **pendu** — une fiche alors sans
exercice. Ce lot lui en donne, et le test est devenu faux.

Il aurait été facile de le repointer sur une autre fiche nommée, et de le recasser à la tranche
suivante. Il choisit désormais **par prédicat** : *les fiches du monde des chandeliers sans aucun
objectif exerçable*, et vérifie qu'aucune d'elles n'est représentative. Le test dit donc la même
chose qu'avant — l'intention P0 est intacte — mais il reste **juste au fil des lots de contenu**, et
il en vérifie plusieurs au lieu d'une.

## Ce qui n'a pas changé

Aucun concept, monde ou catégorie ajouté ; aucun nouveau player, aucune dépendance, aucune
migration, aucun asset. Statuts éditoriaux inchangés (`needsReview`). Aucun vocabulaire BUY/SELL.
Cinq exercices par compétence, sous le plafond de six.

## Tests (exécutés)

Les trois compétences entrent dans tous les garde-fous du module. Le verrou de placement du monde
des chandeliers reçoit la même forme que celui des figures : **sept placements — quatre setups
haussiers invalidés vers le bas, trois baissiers vers le haut** — chaque cible devant être l'extrême
réel du côté correspondant. Compteurs mis à jour avec leur raison : exercices du module 24 → 39,
reconnaissances 5 → 8, placements 4 → 7, compétences 53 → 56, dette 17 → 14.

Gate `EXPO_NO_TELEMETRY=1 npm run check` : verte de bout en bout.

## Ce qui reste — et une remarque honnête

**14 fiches de bibliothèque.** Les confusions documentées par le corpus lui-même sont désormais
épuisées : ce qui reste (harami, pincettes, étoile du matin et du soir, trois soldats, trois
corbeaux, triangle symétrique, biseaux, tasse-anse, triple creux, cassure-retest, dividende, PER) ne
sont pas des variantes de figures enseignées — ce sont des **notions à part entière**.

Elles ne demandent donc plus une transposition mais une **vraie leçon neuve** chacune. C'est un
travail éditorial de fond, pas un lot mécanique, et il vaut mieux le dire que d'enchaîner des
compétences de remplissage : le canon interdit explicitement de gonfler un compteur avec des entrées
qui n'enseignent rien de neuf.
