# ADR-151 — LOT C9 : le rapport entre deux bougies

- **Statut** : accepté.
- **Contexte** : suite du LOT C8. Il restait 7 fiches de bibliothèque, dont deux dans le monde des
  chandeliers.

## La dernière façon de lire qui manquait au module

Le module « Lire les chandeliers » enseignait trois façons de lire :

| Façon | Exemples | Depuis |
|---|---|---|
| une **forme** | marubozu, marteau, doji, pendu, étoile filante | LOT 4-M, C4 |
| un **bloc** de deux | avalement haussier et baissier | LOT 4-M, C2 |
| une **séquence** de trois, ordonnée | étoile du matin, trois soldats | LOT C6 |

Il en manquait une quatrième, et deux fiches de bibliothèque la portaient : **le rapport
géométrique entre deux bougies voisines**.

- **Harami** — « Une petite bougie **contenue** dans le corps de la grande précédente. » Ce n'est
  la forme d'aucune des deux : c'est le fait que l'une tienne dans l'autre.
- **Pincettes** — « Deux bougies qui butent sur un **même extrême**. » La forme des bougies importe
  peu ; ce qui parle est le **prix** auquel elles s'arrêtent toutes les deux. Le corpus le confirme
  en reliant cette fiche à `concept.support-resistance` — un niveau, pas une figure.

## Deux leçons distinctes, pas un doublon

**La bougie contenue** (`skill.candle.containment`). Le harami dit « ça ralentit », pas « ça se
retourne » : une séance qui ne dépasse plus la précédente a cessé d'avancer. Le rapprochement utile
est avec l'avalement, déjà enseigné : **la même relation lue à l'envers** — ici la seconde bougie
est contenue, là elle contient.

**Le même extrême, deux fois** (`skill.candle.twin-level`). L'étape que l'on saute est la
troisième : vérifier que le niveau **existait déjà** avant ces deux bougies. Le corpus en fait son
faux signal — « pincettes au milieu de nulle part, sans niveau ». L'exercice de lecture ordonnée la
place donc explicitement dans la séquence.

## Le harami est neutre — même conséquence qu'au LOT C7

`visualSpec.direction` vaut `neutral`, et cela se lit dans sa `confirmationZone` : « à la sortie de
la petite bougie, dans le **sens confirmé** » — pas dans un sens annoncé.

Son `invalidation` est « poursuite nette de la tendance d'origine » : un **comportement**, pas un
extrême. Comme pour le triangle symétrique au LOT C7, **il n'y a aucun côté à placer**. L'objectif
`invalidate` est donc couvert par un scénario conditionnel, et un test l'exige dans les deux sens :
zéro `place_invalidation` pour le harami, et l'objectif bien présent en `scenario`.

C'est la deuxième fois que cette règle s'applique. Elle n'est plus un cas particulier : **une figure
sans direction n'a pas de côté d'invalidation.**

Les pincettes, elles, sont `bearish` (pincettes de sommet) : invalidation vers le **haut**, donc
mécanique `place-extreme`. Le verrou de direction passe à 10 placements — six haussiers vers le bas,
quatre baissiers vers le haut.

## Tout est dérivé

| Objectif | Source dans la fiche |
|---|---|
| `recognize` | `definitionShort` + `visualSpec` (datasets déjà présents) |
| `interpret` | la relation énoncée par `definitionShort` |
| `confirm` | `confirmationZone` |
| `invalidate` | `invalidation` |
| `avoid-false-signal` | `falseSignals` |

Un test exige que la confirmation et l'invalidation de chaque fiche se **retrouvent textuellement**
dans les énoncés. Les datasets (`candle.bullish-harami.v1`, `candle.tweezer-top.v1`) existaient
déjà : **aucun visuel créé**.

## Chiffres, tous vérifiés par test

- Compétences : **63 → 65**.
- Exercices du module Chandeliers : **49 → 59**. Reconnaissances : 10 → 12. Placements : 9 → 10.
- Fiches de bibliothèque : **7 → 5**. Concepts : **67, inchangé**.
- Statuts éditoriaux inchangés (`needsReview`).

## Ce qui reste

Cinq fiches : **étoile du soir**, **trois corbeaux** (les miroirs de séquence du LOT C6),
**tasse-anse**, **triple creux**, **cassure-retest**. Les deux premières sont enseignées sans être
entraînées — c'est assumé depuis le LOT C6. Les trois autres attendent chacune une leçon qui
apporte quelque chose de neuf.
