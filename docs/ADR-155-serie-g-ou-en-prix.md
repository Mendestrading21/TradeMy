# ADR-155 — Les deux outils qui répondent « où ? »

- **Statut** : accepté. Deuxième lot de la série G (ADR-154).
- **Contexte** : le monde des indicateurs enseignait sept notions. Toutes répondaient à la même
  question.

## Le partage qui n'avait jamais été dit

RSI, MACD, bandes de Bollinger, divergence, moyenne mobile, croisement haussier, croisement
baissier : sept compétences, et une seule question — **comment va le marché**. Une force, un élan,
une volatilité relative, un désaccord, un résumé.

Aucune ne répondait à **« à quel prix »**.

C'est pourtant la question que pose une invalidation. Le monde du risque, lui, la pose depuis
longtemps (stop, taille de position) — mais sans qu'aucun outil de lecture ne vienne l'alimenter.

Deux variantes du moteur y répondaient déjà, sans qu'aucune fiche ne les nomme :

| Variante | Ce qu'elle donne |
|---|---|
| `atr` | une **distance**, dans l'unité du prix |
| `fibonacci` | des **niveaux**, dans l'unité du prix |

## L'ATR : une moyenne, avec les défauts d'une moyenne

L'ATR est la moyenne mobile des amplitudes. Il hérite donc, mot pour mot, de la leçon du LOT G1 —
et le dataset le montre deux fois :

- la bougie la plus large est la **cinquième** ; l'amplitude moyenne culmine à la **sixième**. Un
  retard, encore ;
- et son maximum vaut **7,25** là où cette bougie mesurait **11**. Une moyenne ne rend jamais
  l'extrême — elle en perd ici près d'un tiers.

Ce n'est pas un défaut de l'indicateur : c'est ce qu'une moyenne fait. Mais quelqu'un qui pose une
invalidation « à deux ATR » sans le savoir croit couvrir la volatilité du jour le plus violent.

**Le calcul entre dans la compétence**, comme au LOT C8 pour le PER et au LOT G1 pour la moyenne
mobile, et pour la même raison stricte : la réponse **est** un nombre, et sans l'opération la notion
n'a pas d'usage. Un ATR qu'on ne convertit pas en distance est un nombre qu'on regarde ; converti
(`entrée − 2 × ATR`), il devient un niveau.

**L'ATR ne documente aucune invalidation**, et c'est cohérent : il sert à en poser une, il n'en a
pas. Même honnêteté que le RSI, le MACD et la moyenne mobile.

## Les retracements : l'outil dont la limite EST la leçon

Sur le dataset, le mouvement va de **43,40** à **62,60**. Le niveau 50 % tombe donc à **53,00**, et
le repli s'arrête à **53,40** — quatre dixièmes au-dessus, sur une amplitude de plus de dix-neuf
points.

Assez près pour qu'on parle de « respect du niveau ». Assez loin pour qu'on se demande ce que
« près » veut dire. La fiche pose la question au lieu de la trancher.

Deux faits que le code rend vérifiables, et que la plupart des présentations passent sous silence :

1. **Le niveau 50 % n'est pas un ratio de Fibonacci.** Il figure dans le registre aux côtés de
   0,236, 0,382, 0,618 et 0,786 — mais il n'en dérive pas. Il est là par convention, parce qu'un
   repli de moitié se remarque.
2. **Les niveaux dépendent entièrement des deux points choisis.** Le test le démontre en refaisant
   la grille sur la moitié du mouvement : **aucun** niveau intermédiaire ne survit. Les ratios sont
   fixes ; les niveaux, non.

Le faux signal de la fiche découle du second point, et il est particulier : il ne se produit pas sur
le graphique, il se produit dans la tête de qui regarde. Redessiner la grille jusqu'à ce qu'un
niveau tombe sur le creux — à ce jeu-là, elle marche toujours.

Les retracements **documentent**, eux, une invalidation : sous le niveau 100 %, le départ du
mouvement, il n'y a plus d'impulsion à retracer. C'est un **plancher**, donc `place-invalidation`.

## Ce que le lot n'a PAS fait

**`bollinger-squeeze` reste orpheline, et le restera.** La compression est déjà enseignée : elle est
dans la définition de `concept.bollinger`, dans sa lecture ordonnée et dans son exercice de
confirmation (« sortie de compression »). En faire une fiche séparée serait la transposition
mécanique refusée aux LOTS C4 et C6. Une variante de rendu n'est pas une notion.

Restent donc, après ce lot : `ma-ribbon`, `stochastic`, `hidden-divergence`. Trois variantes, trois
sujets réellement distincts — le stochastique mesure autre chose que le RSI, la divergence cachée
dit le contraire de la divergence classique.

## Compteurs

- Concepts **70 → 72**. Compétences **70 → 72**.
- Module « Lire les indicateurs » : 7 → 9 compétences, 31 → 40 exercices.
- Variantes d'indicateur enseignées : **9 → 11** sur 15 ; orphelines **6 → 4**, dont une (`squeeze`)
  qui le restera par décision.
- Fiches consultables sans compétence propre : **3**, inchangé.
