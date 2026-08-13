# ADR-157 — Clôture de la série G : ce qu'on n'écrira pas, et pourquoi

- **Statut** : accepté. Dernier lot de la série G (ADR-154, ADR-155, ADR-156).
- **Contexte** : deux variantes du moteur restaient orphelines. Ce lot ne les enseigne pas — il
  décide, mesure, et verrouille la décision.

## Où en était la série

| | Variantes d'indicateur enseignées |
|---|---|
| Avant le LOT G1 | **6** sur 15 |
| Après G1 · G2 · G3 | **13** sur 15 |

Restaient `bollinger-squeeze` et `ma-ribbon`. La tentation évidente était d'écrire deux fiches de
plus et d'annoncer 15 sur 15. C'est précisément ce que ce lot refuse.

## Le ruban : la mesure décide

Un ruban de moyennes s'enseigne par un **contraste**, et un seul : *ordonné et écarté* = tendance
installée ; *emmêlé* = rien à lire. C'est toute la figure.

Or, sur `indicator.ma-ribbon.v1`, avec les trois périodes réellement tracées (3, 5, 8 en
exponentiel), le ruban est **ordonné sur chacune des bougies où il existe**. L'écart entre la plus
rapide et la plus lente ne fait que croître : 3,77 puis 4,84, 4,16, 5,10. L'état emmêlé n'apparaît
jamais. Pas une fois.

Écrire la fiche, c'est donc écrire la moitié de la leçon en prose, sans image — exactement ce que
les trois lots précédents ont refusé de faire. Chaque fiche de la série G cite un fait **visible sur
son propre graphique** ; celle-ci ne le pourrait pas.

**Il faudrait un dataset neuf.** Et là, la prémisse de la série tombe : elle disait « le moteur sait
déjà dessiner ce que personne n'enseigne ». Ici, il ne sait pas encore dessiner la moitié de ce
qu'il faudrait enseigner. Le sujet reste ouvert pour un futur lot de contenu qui **commencerait par
les données** — ce n'est pas une dette, c'est une décision avec sa condition d'entrée.

## Ce que la mesure a donné en passant

En comparant simple et exponentielle sur la même série (période 5), l'écart maximal mesure **0,21
point**. Invisible à l'œil.

Conséquence pour le contenu : la fiche `moyenne-mobile` gagne **une limite**, pas un chapitre. Elle
nomme la variante exponentielle — un élève la rencontrera partout ailleurs — et s'arrête là. Elle ne
dit pas « l'exponentielle est meilleure », et surtout elle ne prétend pas illustrer une différence
que le graphique de la fiche ne montre pas.

## Le vrai livrable du lot : un verrou

`indicatorCoverage.test.ts` transforme deux refus en **fait vérifiable** :

1. toute variante déclarée par le moteur est soit **enseignée**, soit **refusée avec sa raison** —
   aucune ne peut rester dans un flou ;
2. la liste des refusées est exactement `bollinger-squeeze` et `ma-ribbon` ;
3. la couverture est bien de 13 sur 15 ;
4. le ruban est re-mesuré : le test **recalcule** les états du ruban et échoue si l'emmêlement
   apparaissait un jour — c'est-à-dire si la raison du refus cessait d'être vraie.

Sans ce fichier, « il reste deux variantes, refusées » serait une phrase dans une pull request,
c'est-à-dire une phrase qui vieillit. Une seizième variante ajoutée au moteur fera désormais tomber
le test, et obligera quelqu'un à trancher.

## Bilan de la série G

| Lot | Ce qu'il a ajouté | Le fait qui le portait |
|---|---|---|
| G1 | moyenne mobile, croisement haussier, croisement baissier | le croisement arrive **trois bougies après** le retournement |
| G2 | ATR, retracements de Fibonacci | l'ATR culmine **une bougie après** la plus large, à 7,25 pour une amplitude de 11 |
| G3 | stochastique, divergence cachée | même série, même bougie : **4,2** contre **32,5** |
| G4 | rien — deux refus verrouillés | le ruban n'est **jamais** emmêlé dans ses données |

Neuf fiches, neuf compétences, 32 exercices, et **aucun chiffre recopié** : chacun est recalculé par
un test depuis les datasets et les périodes que le moteur trace réellement.

Trois défauts trouvés en chemin, tous corrigés : les moyennes peintes aux couleurs du marché (G1),
l'absence de légende rapide/lente (G1), et le silence des deux figures de divergence sur le fait que
leur oscillateur est une illustration et non un calcul (G3).

## Compteurs

- Concepts et compétences : **74**, inchangés — ce lot n'ajoute aucun contenu.
- Variantes d'indicateur : **13 enseignées, 2 refusées, 0 en attente**.
