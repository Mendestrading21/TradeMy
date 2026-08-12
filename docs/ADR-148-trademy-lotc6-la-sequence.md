# ADR-148 — LOT C6 : une bougie ne suffit pas, il en faut trois, et l'ordre décide

- **Statut** : accepté.
- **Contexte** : après le LOT C4, j'avais annoncé que les 14 fiches de bibliothèque restantes ne
  méritaient plus de transposition mécanique. **La mesure m'a démenti sur quatre d'entre elles.**

## Ce que la mesure a montré

En sondant les 14 fiches restantes, quatre portent une idée que le module n'enseigne nulle part :

| Fiche | `definitionShort` |
|---|---|
| Étoile du matin | « Trois bougies : baissière, petite d'indécision, puis haussière — après une baisse. » |
| Étoile du soir | « Trois bougies : haussière, petite d'indécision, puis baissière — après une hausse. » |
| Trois soldats blancs | « Trois bougies haussières successives, chacune clôturant plus haut. » |
| Trois corbeaux noirs | « Trois bougies baissières successives, chacune clôturant plus bas. » |

Tout le module `world.candles` lisait jusqu'ici **une** bougie (marubozu, marteau, doji, pendu,
étoile filante, marteau inversé) ou **deux lues comme un bloc** (l'avalement). Ici il en faut
**trois, dans l'ordre** — et lue à l'envers, une étoile du matin **est** une étoile du soir.

Ce n'est pas une transposition. C'est une notion neuve.

## Décision — deux compétences, deux histoires opposées

**`skill.candle.sequence-reversal` — Le retournement en trois temps** (`concept.morning-star`).
Ce qui fait la figure n'est pas la troisième bougie : c'est **la pause du milieu**, le moment où la
baisse cesse d'avancer. Sans elle, il n'y a pas d'étoile.

**`skill.candle.sequence-momentum` — La poussée en trois temps** (`concept.three-white-soldiers`).
Trois bougies encore, mais **du même sens** : pas de pause, donc pas de retournement — une
continuation. Et le corpus lui-même porte la nuance qui la retourne : `falseSignals` dit « après une
hausse déjà étirée ». Les mêmes trois bougies sont une poussée au départ et un **essoufflement** en
fin de course. C'est pourquoi l'exercice de lecture ordonnée commence par **« regarde d'abord où
l'on se trouve »** — le contexte avant la forme.

La mécanique `read-order` cesse ici d'être un exercice d'énonciation pour devenir **la chose
enseignée**. Les deux exercices d'ordre portent sur quatre temps et se corrigent en `[0,1,2,3]` :
la bonne réponse EST la chronologie.

## Tout est dérivé, rien n'est inventé

Chaque énoncé cite un champ déjà validé de la fiche :

| Objectif | Source dans la fiche |
|---|---|
| `recognize` | `definitionShort` + `visualSpec` (dataset et variant déjà présents) |
| `interpret` | la séquence énoncée par `definitionShort` |
| `confirm` | `confirmationZone` |
| `invalidate` | `invalidation` |
| `avoid-false-signal` | `falseSignals` |

Un test l'exige : pour chaque compétence, la confirmation et l'invalidation de la fiche doivent se
**retrouver textuellement** dans les énoncés. Les quatre datasets (`candle.morning-star.v1`,
`candle.evening-star.v1`, `candle.three-white-soldiers.v1`, `candle.three-black-crows.v1`)
existaient déjà : **aucun visuel n'a été créé pour ce lot.**

## Pourquoi 14 → 12, et pas 14 → 10

Le corpus impose une invariante que j'ai mesurée avant d'écrire quoi que ce soit : **une compétence
= un concept**, 56 compétences sur 56 sans une seule exception. Rattacher les figures miroir
(étoile du soir, trois corbeaux) aux mêmes compétences l'aurait brisée ; leur donner deux
compétences de plus aurait été exactement la transposition mécanique que le LOT C4 a refusée — la
règle du miroir est déjà enseignée et exercée par les LOTS C2 et C3.

Les deux miroirs restent donc en bibliothèque. Ils sont **enseignés** — dans le résumé des leçons,
dans les options de reconnaissance, dans les faux signaux (« Étoile du matin et étoile du soir se
confirment du même côté, puisqu'elles ont la même forme » est l'affirmation FAUSSE à repérer) —
mais pas encore entraînés pour eux-mêmes. Le compteur dit 12, et il dit vrai.

## Chiffres, tous vérifiés par test

- Compétences : **56 → 58**.
- Exercices du module Chandeliers : **39 → 49**.
- Reconnaissances de figure : 8 → 10. Placements d'invalidation : 7 → 9 (six haussiers vers le bas,
  trois baissiers vers le haut — le verrou de direction du LOT C3 tient).
- Fiches de bibliothèque : **14 → 12**. Concepts : **67, inchangé**.
- Statuts éditoriaux inchangés : les fiches restent `needsReview`.

## Ce que ce lot ne fait pas

Aucun concept ajouté, aucun dataset créé, aucune dépendance, aucune migration, aucun écran touché.
Les 12 fiches restantes (harami, pincettes, biseaux, triangle symétrique, tasse-anse, triple creux,
cassure-retest, les deux miroirs de séquence, dividende, PER) attendent chacune une leçon qui
enseigne quelque chose de neuf — pas un gabarit recopié.
