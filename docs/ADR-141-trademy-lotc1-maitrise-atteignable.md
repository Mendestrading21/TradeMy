# ADR-141 — LOT C1 : la maîtrise redevient atteignable, et la fiche dit pourquoi

- **Statut** : accepté (correction d'un défaut de progression, découvert en instrumentant le corpus).
- **Contexte** : le canon impose deux choses qui se rejoignent ici — « une visite n'est jamais une
  maîtrise : observer, formuler, vérifier, manipuler, répondre, expliquer puis réviser » et
  « afficher la raison d'un verrou et la prochaine action permettant de l'ouvrir ».

## Le défaut — mesuré, pas supposé

La machine de maîtrise stricte (ADR P0, `conceptMasteryState`) plafonne à « Découvert » tout concept
qui n'est pas le **représentant entraîné** de sa compétence. L'intention est juste : deux fiches
d'une même famille ne doivent pas se partager une maîtrise que l'apprenant n'a prouvée que sur une
seule.

Mais la règle posait la **mauvaise question**. Elle lisait le champ `skillId` **de la fiche**, et le
comparait au concept représentatif de cette compétence. Or ce champ pointe vers les **leçons libres
historiques** (`skill.candles`, `skill.patterns`, `skill.trend`, `skill.actions`) — et il est
**absent** sur trente fiches. Il n'a jamais désigné la compétence guidée qui entraîne réellement la
notion.

Résultat, compté sur le corpus réel avant ce lot :

- **3 concepts sur 67** seulement étaient jugés « représentatifs » ;
- **42 concepts activement entraînés**, exercices ciblés à l'appui, restaient **plafonnés à
  « Découvert » pour toujours**.

Concrètement : on pouvait terminer un monde, prouver chaque objectif dans le temps, réussir le point
de contrôle — et lire encore « Découvert » sur le marteau, l'avalement haussier, le RSI, le
risque-rendement… Le compteur de concepts maîtrisés du Profil ne pouvait pratiquement pas bouger.
Ce n'était pas une règle sévère : c'était une **impasse silencieuse**.

## Décision 1 — poser la question qui compte

`isRepresentativeConcept` demande désormais : **ce concept porte-t-il au moins un objectif
exerçable ?** C'est-à-dire : existe-t-il, quelque part dans le parcours, un exercice qui le vise ?

- **L'intention P0 est intacte.** Une fiche de bibliothèque n'a aucun exercice à elle : elle reste
  plafonnée à « Découvert », et n'hérite de rien.
- **Aucun garde-fou n'est perdu.** `objectiveCoverage` exigeait déjà `total > 0` pour déclarer une
  couverture complète : un concept sans objectif exerçable ne pouvait de toute façon jamais être
  maîtrisé. La règle corrigée est donc *cohérente* avec le calcul de couverture, au lieu de le
  doubler avec un critère étranger.

Après correction : **45 concepts entraînables**, **22 fiches de bibliothèque** — et c'est la dette
réelle, chiffrée par un test.

## Décision 2 — dire la raison, et donner la suite

`conceptNextStep` (nouveau, pur) traduit l'état **déjà calculé** en une phrase et, quand elle
existe, en une action réelle. Il ne décide **aucune** règle de maîtrise : `masteryGate` reste seule
autorité.

Six situations, dans l'ordre où elles se présentent :

| Situation | Ce que la fiche dit | Action proposée |
|---|---|---|
| `library-only` | la notion s'explore, elle n'a pas d'exercices à elle | la compétence qui entraîne **sa famille** |
| `not-explored` | lis la fiche, c'est le point de départ | sa compétence |
| `not-trained` | une visite n'est pas une maîtrise | sa compétence |
| `coverage-incomplete` | reconnaître ne suffit pas : confirmer et invalider aussi | sa compétence |
| `checkpoint-pending` | il reste le point de contrôle, qui vérifie sans indice | sa compétence |
| `none` | notion maîtrisée | **aucune** — jamais de bouton mort |

**La suite proposée est dérivée, jamais écrite fiche par fiche**, en deux chemins :

1. **les notions liées déclarées par la fiche** (`relatedConceptIds`, rédigées par l'éditeur) — le
   pendu renvoie au marteau, le double sommet au double creux : c'est la parenté que le contenu
   affirme lui-même ;
2. à défaut, **la première compétence guidée du même monde**.

Vérifié : **les 22 fiches de bibliothèque ont une suite réelle, aucune n'est une impasse.** Et quand
une notion est revendiquée à la fois par une leçon libre historique et par une compétence guidée,
c'est la **compétence guidée** qui l'emporte : c'est elle qui fait progresser.

## Ce qui n'a pas changé

- **Aucune migration, aucune dépendance, aucun contenu, aucun exercice ajouté.** Les seuils de
  maîtrise (couverture complète + rétention différée + point de contrôle) sont inchangés.
- Aucune couleur ni statut éditorial touché ; `needsReview` reste sur les 67 fiches.
- L'écran ne reformule rien : il affiche **exactement** la phrase du noyau pur.

## Tests (exécutés)

- `conceptNextStep.test.ts` — **10 tests** : aucune fiche n'est une impasse (les 67 savent nommer
  leur raison) ; la dette est **chiffrée** (22 bibliothèque / 45 entraînables / 67 au total) ; les 22
  ont une suite qui existe vraiment, dont le libellé vient du registre ; la suite est **parente**
  (notion liée ou même monde, jamais un renvoi arbitraire) ; la parenté déclarée **prime** sur le
  repli par monde ; un concept entraîné traverse les vraies étapes dans l'ordre — et une fois
  maîtrisé, **plus aucune action n'est proposée** ; aucune raison n'emploie de jargon d'état ni de
  vocabulaire interdit.
- `conceptMasteryState.test.ts` — le test qui **figeait le bug** (« le marteau n'est pas
  représentatif ») est réécrit pour dire la vérité : le marteau est la cible de cinq exercices réels,
  donc il est entraînable ; et le **pendu**, fiche de bibliothèque sans aucun exercice, reste
  plafonné — l'intention P0 est prouvée sur le bon cas.
- `concept.integration.test.tsx` — **3 tests sur l'écran RÉEL** : le bloc « Où j'en suis » affiche la
  raison **exacte** du noyau pur ; le bouton d'entraînement mène à une route de compétence réelle
  (`/session/…`, aucun bouton mort) ; une fiche de bibliothèque explique son plafond et renvoie vers
  sa famille.

Suite complète : 165 suites, 1521 tests verts après la correction (aucune régression ailleurs).
Gate `EXPO_NO_TELEMETRY=1 npm run check` : verte de bout en bout.

## Ce qui reste, dit franchement

Les **22 fiches de bibliothèque** n'ont toujours pas d'exercices à elles, et leur statut s'arrête
donc à « Découvert ». Ce n'est plus silencieux — c'est écrit sur la fiche, avec une porte de sortie —
mais ce n'est pas encore résolu. Leur donner une compétence propre est un travail de contenu, monde
par monde, à mener dans la continuité des modules guidés.
