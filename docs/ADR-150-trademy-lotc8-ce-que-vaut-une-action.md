# ADR-150 — LOT C8 : deux notions qui ne se lisent pas, elles se calculent

- **Statut** : accepté.
- **Contexte** : suite du LOT C7. Il restait 9 fiches de bibliothèque, dont deux dans le **premier
  monde du parcours**.

## Une prémisse fausse, corrigée par les tests

J'ai commencé ce lot en croyant que `world.foundations` était **le seul des quinze mondes sans
module guidé** — parce que je n'avais trouvé que 14 fichiers `*ModuleScenarios.ts` pour 15 mondes.

**C'était faux.** Le monde 1 a un module depuis l'origine, `module.foundations.read-chart` : il est
défini directement dans `seed.ts`, pas via un fichier de scénarios. C'est le test `learningMap` qui
me l'a dit, en refusant un seizième module.

Ce qui reste vrai, et que la mesure confirme : sur les **trois** fiches du monde 1, une seule
(`concept.market-basics`) était entraînable. Dividende et PER restaient consultables sans jamais
être demandées — dans le monde par lequel tout apprenant entre.

## L'idée neuve : la définition EST une division

Tout le reste du corpus enseigne à **lire** un graphique. Ces deux notions ne se lisent pas : elles
se **calculent**, et leurs pièges sont arithmétiques.

- **Rendement du dividende = dividende ÷ prix.** Il a donc deux façons de monter : le dividende
  augmente… ou le cours baisse. Le corpus le dit déjà dans ses faux signaux : « un rendement du
  dividende très élevé traduit parfois une chute du cours, pas une bonne affaire ».
- **PER = prix ÷ bénéfice par action.** Un PER bas peut trahir un bénéfice qui s'effondre.

Dans les deux cas, c'est le **dénominateur** qui a bougé — et c'est invisible sur le nombre seul.
Sans avoir posé l'opération une fois, on ne peut pas comprendre pourquoi l'extrême trompe. La
mécanique `compute` (LOT D3), jusqu'ici réservée au monde du risque, sort donc de ce monde pour la
première fois.

## Deux contraintes imposées par la donnée, assumées telles quelles

**Trois objectifs, pas cinq.** Ces fiches n'ont ni `confirmationZone` ni `invalidation`, et c'est
correct : ADR-133 a établi qu'une NOTION n'en a pas, et que lui en inventer une serait enseigner du
faux. Les objectifs réels sont `recognize`, `interpret` et `avoid-false-signal`. Un test l'exige
dans les deux sens : les fiches n'ont pas ces champs, et les exercices ne couvrent que ces trois-là.

**Aucune reconnaissance de figure.** Leur `visualSpec.type` est `mechanism` — un schéma, pas une
série de bougies. La mécanique `identify-candle` exige un `datasetKey` OHLC. Il n'y a rien à
corriger dans le moteur : il n'y a simplement **pas de figure à reconnaître**. `recognize` passe
donc par un scénario. Un test verrouille l'absence d'`identify_figure` ici.

## Un module par monde : je n'ai pas restructuré le parcours

Créer un module « Ce que vaut une action » aurait donné **deux checkpoints au monde 1**. Or la
complétion d'un monde est pilotée par SON module et SON checkpoint — un par monde. Changer cela est
une restructuration du parcours, pas un lot de contenu.

Les deux compétences **rejoignent donc le module existant** du monde 1. Un test interdit désormais
qu'on refasse l'erreur : `world.foundations` doit avoir exactement un module, et il doit contenir
ces deux compétences.

Conséquence assumée : le module s'intitulait « Lire un graphique », ce qui ne couvre plus son
contenu. Il devient **« Premiers repères »**, et son checkpoint « Revue — Premiers repères ».
**Les identifiants ne changent pas** (`module.foundations.read-chart`, `checkpoint.read-chart`) :
ils sont persistés dans la progression des apprenants, et les renommer effacerait leur avancement.
Seuls les libellés affichés bougent.

## Le verrou de la manipulation devient une règle, pas une liste de noms

Le canon impose de MANIPULER, et le LOT E1 l'avait verrouillé : chaque compétence doit porter une
manipulation dans sa leçon, la seule exception étant nommée (`lesson.action-vs-bond`).

Ces deux leçons n'ont pas de figure à manipuler. J'aurais pu leur ajouter une étape `interaction`
pointant vers leur concept : le test l'aurait **acceptée** (le concept existe) tout en produisant
un **rendu vide**, puisqu'il n'y a pas de dataset. C'est précisément ce que ce verrou cherche à
interdire ; le contourner en le satisfaisant à la lettre aurait été pire que de le laisser rouge.

La règle a donc été **renforcée** au lieu d'être élargie : une compétence peut n'avoir aucune
manipulation de leçon **à condition de porter un exercice `numeric`**. Pour une notion qui est une
division, manipuler c'est poser l'opération — pas déplacer une ligne. C'est vérifiable, et c'est
plus strict qu'une liste de noms.

## Chiffres, tous vérifiés par test

- Compétences : **61 → 63**. Modules : **15, inchangé**.
- Exercices du monde 1 : +6 (2 compétences × 3 objectifs réels).
- Compétences avec calcul : 3 → **5** (`skill.actions`, les deux nouvelles, les deux du risque).
- Fiches de bibliothèque : **9 → 7**. Concepts : **67, inchangé**.
- **Le monde 1 n'a plus aucune fiche inentraînable.**
- Statuts éditoriaux inchangés (`needsReview`).

## Ce que ce lot ne fait pas

Aucun concept ajouté, aucun dataset créé, aucune dépendance, aucune migration persistante, aucun
écran modifié. Restent **7 fiches** : harami, pincettes, étoile du soir, trois corbeaux, tasse-anse,
triple creux, cassure-retest.
