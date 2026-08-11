# ADR-143 — LOT C3 : le miroir dans les deux sens

- **Statut** : accepté (deuxième tranche de la dette chiffrée par le LOT C1).
- **Contexte** : le LOT C2 a rendu entraînables deux fiches de bibliothèque en enseignant leur
  **miroir**. Il a aussi laissé une formule dangereusement simple derrière lui — « figure baissière,
  donc invalidation en haut ». Ce lot la corrige en même temps qu'il traite les trois miroirs
  restants du monde des figures.

## Le défaut que ce lot évite

Après le LOT C2, un apprenant pouvait retenir la mauvaise règle : *un setup baissier s'invalide en
haut*. C'est vrai, mais ce n'est pas la règle — c'est un cas particulier. La vraie règle est :

> **L'invalidation se place TOUJOURS du côté opposé au sens du setup.**

Les trois figures restantes permettent de l'établir sans la dire à la place de l'apprenant, parce
qu'elles ne vont pas toutes dans le même sens :

| Compétence | Concept | Sens de la fiche | Invalidation |
|---|---|---|---|
| `skill.patterns.triangle-mirror` — « Le triangle, retourné » | `concept.descending-triangle` | baissier | **en haut** (ligne des sommets descendants) |
| `skill.patterns.flag-mirror` — « Le drapeau, retourné » | `concept.bear-flag` | baissier | **en haut** (haut du drapeau) |
| `skill.patterns.reversal-mirror` — « Le retournement, retourné » | `concept.inverse-head-shoulders` | **haussier** | **en bas** (sous la tête) |

La troisième casse le réflexe que les deux premières viennent d'installer. C'est délibéré, et c'est
la raison pour laquelle ces trois compétences forment **un seul lot** au lieu de trois.

## Décision

1. **Trois compétences guidées**, cinq exercices chacune — un par objectif RÉEL de la fiche.
   Reconnaissance sur le `visualSpec` réel, lecture ordonnée dérivée de `howToRecognize`,
   confirmation dérivée de `confirmationZone`, invalidation dérivée d'`invalidation`, faux signal
   dérivé de `falseSignals` et `commonMistakes`.
2. **Le placement suit la fiche, pas une habitude.** Les deux figures baissières utilisent
   `place-extreme` (le plus haut) ; l'ÉTÉ inversée, haussière, utilise `place-invalidation` (le plus
   bas). Aucune nouvelle mécanique : les deux existaient déjà.
3. **Le faux signal de l'ÉTÉ inversée porte exactement l'erreur du lot** — l'affirmation à repérer
   est « comme toute figure de retournement, elle s'invalide au-dessus de sa tête ». C'est faux, et
   c'est précisément ce qu'un apprenant venant des deux leçons précédentes va croire.
4. **Trois leçons guidées**, dont la dernière énonce la règle générale à l'étape `explain` — après
   que l'apprenant a rencontré le contre-exemple, pas avant.

## Résultat mesurable

- **Compétences : 50 → 53.** Monde des figures : 5 → 8 compétences, pour 13 concepts — c'est le
  monde le plus riche du corpus, et sa profondeur suit enfin.
- **Fiches de bibliothèque : 20 → 17.**
- **Concepts inchangés : 67.** Les trois fiches existaient déjà, complètes.

## Le verrou porte désormais la leçon

Le test de placement du module vérifiait « la cible est le plus bas réel ». Le LOT C2 l'a étendu au
côté annoncé par l'énoncé. Ce lot lui donne sa forme définitive :

**six placements — trois setups haussiers invalidés vers le bas, trois setups baissiers invalidés
vers le haut** — et chaque cible doit être l'extrême réel du côté correspondant.

Autrement dit, le test échouerait si l'on appliquait la fausse règle à l'ÉTÉ inversée. La leçon du
lot n'est pas seulement écrite dans le contenu : elle est **exécutable**.

## Ce qui n'a pas changé

Aucun concept, monde ou catégorie ajouté ; aucun nouveau player, aucune dépendance, aucune
migration, aucun asset. Statuts éditoriaux inchangés (`needsReview`). Aucun vocabulaire BUY/SELL.
Cinq exercices par compétence, sous le plafond de six.

## Tests (exécutés)

Les trois compétences entrent dans **tous** les garde-fous du module : couverture des objectifs
réels dérivée des fiches, gradabilité par le grader RÉEL, cohérence figure/dataset avec le
`visualSpec`, mécaniques distinctes, checkpoint, vocabulaire. Compteurs mis à jour avec leur raison :
exercices du module 25 → 40, reconnaissances 5 → 8, placements 3 → 6, compétences 50 → 53, dette
20 → 17.

Gate `EXPO_NO_TELEMETRY=1 npm run check` : verte de bout en bout.

## Ce qui reste

**17 fiches de bibliothèque.** Les miroirs du monde des figures sont épuisés — il reste, dans les
chandeliers, les confusions de **contexte** plutôt que de direction : le pendu a exactement la même
forme que le marteau, l'étoile filante celle du marteau inversé. Ce n'est plus « la même figure à
l'envers » mais « la même figure, l'autre histoire » : un lot distinct, et une leçon différente.
