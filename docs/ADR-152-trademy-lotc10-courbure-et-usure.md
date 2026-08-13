# ADR-152 — LOT C10 : la forme du chemin, le niveau qui s'use — et ce qui s'arrête là

- **Statut** : accepté. **Ce lot clôt la série C.**
- **Contexte** : il restait 5 fiches de bibliothèque. Deux portent une idée neuve, trois non — et
  cet ADR dit lesquelles, avec la raison.

## Deux idées que le monde des figures n'enseignait pas

**La forme du chemin** (`concept.cup-handle`). Toutes les figures du module se définissent jusqu'ici
par des **points** (creux, sommets) ou des **lignes** (ligne de cou, borne plate, trendlines). La
tasse se définit par la **courbure du chemin entre deux points** — et son propre faux signal ne
parle que de ça : « Tasse en V (trop brutale) plutôt qu'en U ».

Un U met du temps : les vendeurs s'écoulent progressivement. Un V est un choc : rien ne s'est
digéré. La même remontée n'a pas la même valeur. Un test vérifie que cette opposition est réellement
enseignée, et que l'invalidation vient bien de l'**anse** — pas du fond de la tasse, qui est
beaucoup trop loin.

**Le niveau trop testé** (`concept.triple-bottom`). Le double creux est enseigné depuis le LOT 4-Q.
Le triple creux n'en est **pas** la transposition : il contredit l'intuition, et le corpus le dit
lui-même. `falseSignals` : « **Cassure du plancher au troisième test.** »

L'intuition dit « trois fois défendu, donc solide ». La fiche dit l'inverse : chaque passage
consomme les acheteurs présents au niveau. Un plancher n'est pas un mur, c'est un stock qui se vide.
C'est la seule figure du module dont le faux signal porte sur sa **propre répétition**, et un test
vérifie que c'est bien cette croyance-là qui est proposée comme affirmation FAUSSE.

## Un test que ce lot a obligé à préciser

Le LOT C7 avait posé un verrou : « les huit compétences antérieures suivent leur pente, les biseaux
sont l'exception ». Il s'appuyait sur une heuristique — chercher un mot de pente dans le nom du
variant.

La tasse l'a fait tomber : **`cup-handle` n'encode aucune pente dans son nom**, parce que sa
direction vient de la courbure. Élargir la regex aurait masqué exactement le fait que ce lot
enseigne.

Le test a donc été **restreint à ce qu'il mesurait réellement** — les figures dont le nom porte une
pente ou un côté — avec un plancher (`≥ 8 vérifiées`) pour qu'il ne devienne pas vide sans qu'on le
remarque. Et un second test énonce le fait mesuré : **la tasse est la seule figure du module dont le
nom ne dit rien de sa direction.**

Au passage, ce même travail a révélé que `inverse-head-shoulders` satisfaisait les deux motifs à la
fois (`inverse-head` et `head-shoulders`). Le motif descendant est désormais ancré.

## Ce que ce lot ne fait PAS, et pourquoi

Trois fiches restent en bibliothèque, et c'est délibéré.

**Étoile du soir** et **trois corbeaux** : les miroirs des séquences du LOT C6. Assumé depuis ce
lot-là — ils sont **enseignés** (résumés de leçon, options de reconnaissance, faux signaux) sans
être entraînés pour eux-mêmes, et la règle du miroir est déjà exercée par les LOTS C2 et C3.

**Cassure et retest** : mesuré avant de décider. Ses deux notions liées, `concept.polarity-flip`
(« un support cassé qui devient résistance après un retest ») et `concept.retest-de-niveau`
(« après une cassure, le prix revient tester le niveau franchi »), sont **toutes deux déjà
entraînées, avec cinq objectifs chacune**. La cassure-retest en est la conjonction littérale. Lui
donner une compétence serait exactement la transposition mécanique refusée aux LOTS C4 et C6.

**La série C s'arrête donc ici, à 3 fiches de bibliothèque** — et non à 0. Un compteur à zéro
obtenu par des leçons qui répètent ce qui est déjà enseigné vaudrait moins que trois fiches
assumées.

## Chiffres, tous vérifiés par test

- Compétences : **65 → 67**.
- Exercices du module Figures : **55 → 65**. Reconnaissances : 11 → 13. Placements : 8 → 10.
- Fiches de bibliothèque : **5 → 3**. Concepts : **67, inchangé**.
- Statuts éditoriaux inchangés (`needsReview`).

## Bilan de la série C

| Lot | Idée | Dette |
|---|---|---|
| C1 | La fiche dit pourquoi, et ce qu'il reste à faire | 22 |
| C2 · C3 | La figure miroir, dans les deux sens | 22 → 17 |
| C4 | La même forme, l'autre histoire (contexte) | 17 → 14 |
| C6 | La séquence : trois bougies, et l'ordre décide | 14 → 12 |
| C7 | Quand la pente ment · la figure sans direction | 12 → 9 |
| C8 | Deux notions qui se calculent | 9 → 7 |
| C9 | Le rapport entre deux bougies | 7 → 5 |
| C10 | La courbure · le niveau qui s'use | 5 → **3** |

Compétences : **48 → 67**. Aucun concept ajouté, aucun dataset créé sur toute la série.
