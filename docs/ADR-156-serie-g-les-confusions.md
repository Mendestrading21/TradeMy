# ADR-156 — Les deux notions qu'on confond avec ce qu'on sait déjà

- **Statut** : accepté. Troisième lot de la série G (ADR-154, ADR-155).
- **Contexte** : quatre variantes du moteur restaient orphelines. Deux portent un sujet réellement
  distinct — et toutes deux ressemblent à une notion déjà enseignée.

## Le point commun des deux dernières

Le stochastique ressemble au RSI : même échelle 0-100, mêmes zones extrêmes, même panneau sous le
prix. La divergence cachée ressemble à la divergence classique : le même désaccord entre le prix et
un oscillateur.

Dans les deux cas, la ressemblance est le piège. C'est la doctrine du LOT C4 — « la même forme,
l'autre histoire » — appliquée cette fois aux indicateurs. Et comme au LOT C4, chaque nouvelle fiche
n'a de sens **qu'en la comparant** à celle qui la précède : les deux compétences arrivent en dernier
dans le module, avec le RSI et la divergence classique en prérequis.

## Le stochastique : deux verdicts opposés sur la même bougie

Le fait qui porte la fiche est mesuré, pas affirmé. Sur la série de `indicator.stochastic.v1` :

| Bougie | Stochastique %K | RSI |
|---|---:|---:|
| 9ᵉ | **96,1** — au-dessus de 80 | **65,2** — sous 70 |
| 12ᵉ | **4,2** — sous 20 | **32,5** — au-dessus de 30 |

Deux fois, dans les deux sens : l'un est à l'extrême quand l'autre est au milieu. Aucun des deux n'a
tort. Le stochastique situe la clôture **dans le range récent** ; le RSI compare **l'ampleur des
hausses à celle des baisses**. Deux questions, deux réponses.

Le test recalcule ces valeurs, et il vérifie en plus que le désaccord n'est pas un accident de série
en comptant les bougies où il se produit. Troisième mesure : sur la même série, le stochastique
balaie **plus du double** de l'amplitude du RSI — d'où sa nervosité, et d'où le fait que ses
extrêmes soient moins remarquables.

### La mécanique `compute` a été envisagée, puis écartée

%K est une division : `(clôture − plus bas) ÷ (plus haut − plus bas)`. La tentation était réelle,
après le PER (LOT C8), la moyenne mobile (G1) et l'ATR (G2).

Le critère posé à ces trois lots est double : **la réponse EST un nombre**, *et* **sans l'opération
la notion n'a pas d'usage**. La seconde moitié ne tient pas ici. Le moteur calcule %K ; le travail de
l'élève est de le **lire**, et de comprendre pourquoi il diffère du RSI. Poser la division aurait
ajouté une mécanique, pas une compréhension.

La liste des compétences qui font calculer reste donc à quatre.

## La divergence cachée : les mêmes pointillés, les pivots inverses

| | Divergence classique | Divergence cachée |
|---|---|---|
| Ce qu'on compare | des **sommets** | des **creux** |
| Le prix | plus-hauts croissants | creux plus **haut** (47 → 51) |
| L'oscillateur | plus-hauts décroissants | creux plus **bas** (30 → 25) |
| La conclusion | essoufflement | **continuation** |

Le désaccord a la même allure ; la lecture s'inverse. Un creux plus haut, c'est une structure
haussière qui tient — le désaccord de l'oscillateur ne l'annule pas, il accompagne une pause.

Le test verrouille les deux configurations **côte à côte** : c'est la comparaison qui fait la leçon,
pas la fiche isolée.

L'invalidation suit la structure : sous le creux précédent du prix, les plus-bas croissants
n'existent plus. C'est un plancher → `place-invalidation`.

## Une honnêteté ajoutée en chemin, sur une fiche ancienne

En décrivant ce que le renderer trace, un point est apparu : les deux figures de divergence
affichent un oscillateur **fourni par la figure**, pas calculé sur le prix. C'est un choix
d'illustration défendable — il rend le désaccord lisible — mais le taire laissait croire que la
courbe se déduit du graphique du dessus.

La limite est donc écrite dans la fiche neuve **et ajoutée à `concept.divergence`**, qui avait le
même silence depuis l'origine. Un test vérifie que les deux la portent. Modifier une fiche ancienne
n'est pas anodin ; ici, elle disait moins que la vérité, et ce lot était le moment où on l'a vu.

## Observé, et NON changé

Les zones de surachat et de survente du RSI et du stochastique sont peintes avec les couleurs du
marché (à 12 % d'opacité). C'est la même famille de question qu'au LOT G1 pour les moyennes — mais
pas le même cas : là, la couleur distinguait deux **périodes** et n'avait aucun sens directionnel ;
ici, une zone « haut du range » porte au moins une connotation de marché.

Trancher demanderait de toucher le RSI, le MACD et le stochastique d'un même geste. C'est une
décision de design, pas un lot de contenu. Elle est notée pour qu'elle ne se perde pas.

## Ce qui reste de la série G

Une seule variante orpheline : **`ma-ribbon`**, le ruban de moyennes. Et une question franche à
trancher avant d'écrire quoi que ce soit — un ruban, c'est trois moyennes mobiles empilées.
Est-ce une notion, ou la transposition mécanique de `concept.moving-average` que les LOTS C4 et C6
ont refusée ? Le lot qui l'abordera devra répondre à ça d'abord.

(`bollinger-squeeze` a été écartée définitivement au LOT G2 : la compression est déjà enseignée dans
la fiche des bandes.)

## Compteurs

- Concepts **72 → 74**. Compétences **72 → 74**.
- Module « Lire les indicateurs » : 9 → 11 compétences, 40 → 49 exercices.
- Variantes d'indicateur enseignées : **11 → 13** sur 15. Orphelines : **4 → 2**, dont une écartée
  par décision et une en question ouverte.
- Compétences qui font calculer : **4**, inchangé — et c'est le résultat d'un refus.
