# ADR-154 — Le moteur dessine ce que personne n'enseigne : ouverture de la série G

- **Statut** : accepté.
- **Contexte** : après la série C (la dette du corpus : des fiches enseignées mais jamais entraînées),
  une autre dette, symétrique, restait invisible — des **capacités du moteur** que rien n'enseigne.

## Le constat qui ouvre la série

Le registre `INDICATOR_CONFIGS` déclare **quinze variantes d'indicateur**. Chacune a son dataset
déterministe, ses calculs testés (`indicatorMath.test.ts`) et son rendu (`IndicatorPanel`). Le
corpus, lui, n'en nommait que **six** : RSI, MACD, Bollinger, divergence, volume, VWAP.

Les neuf autres — `moving-average`, `golden-cross`, `death-cross`, `ma-ribbon`, `stochastic`, `atr`,
`bollinger-squeeze`, `fibonacci`, `hidden-divergence` — existaient en code, prêtes à s'afficher, sans
qu'aucune fiche ne les mentionne.

Parmi elles, **la moyenne mobile**. L'indicateur le plus employé de toute l'analyse technique, celui
dont dérive le MACD que le corpus enseignait déjà, absent du corpus qui enseignait le MACD.

C'est le défaut inverse de la série C. Là, le contenu devançait la pratique. Ici, la capacité
technique devançait le contenu.

## Ce que ce lot ajoute

Trois fiches, trois compétences guidées, quatorze exercices — le module « Lire les indicateurs »
passe de 4 à 7 compétences et de 17 à 31 exercices.

| Fiche | Variante rendue | Objectifs exercés |
|---|---|---|
| Moyenne mobile | `moving-average` | reconnaître, **calculer**, confirmer, éviter le faux signal |
| Croisement haussier | `golden-cross` | + situer l'invalidation (**plancher**) |
| Croisement baissier | `death-cross` | + situer l'invalidation (**plafond**) |

Les deux croisements sont deux fiches, pas une : c'est la règle du corpus depuis le LOT C2 (une
compétence = un concept), et c'est aussi ce que la matière commande — un plancher et un plafond ne
s'apprennent pas ensemble.

## La colonne vertébrale du lot : trois bougies

Le mot « golden cross » promet beaucoup. L'arithmétique promet moins, et elle est vérifiable.

Sur le dataset `indicator.golden-cross.v1`, avec les périodes réellement tracées (3 et 6) :

- le prix touche son plus bas à la **quatrième** bougie ;
- les moyennes ne se croisent qu'à la **septième**.

**Trois bougies de retard.** Le dataset baissier donne exactement le même écart, au sens près. Ce
n'est pas une opinion sur la fiabilité des croisements : c'est une conséquence du calcul, lisible sur
le graphique que l'élève a sous les yeux.

Et le troisième dataset, `indicator.ma.v1`, montre l'autre moitié de la leçon : sur une série
hésitante, les deux mêmes moyennes se croisent **deux fois en treize bougies**, sans tendance
derrière. Le faux signal de la fiche n'est pas illustré par une phrase — il est dans l'image.

## Ces chiffres ne sont pas recopiés

`movingAverageDerivation.test.ts` **recalcule** chacun d'eux depuis le dataset et les périodes
déclarées dans le registre du moteur — les mêmes que celles que le renderer trace. Si un dataset ou
une période changeait, le test tomberait avant que la fiche ne devienne un mensonge.

Le test verrouille aussi l'inégalité, en plus des valeurs exactes : *le croisement ne précède jamais
le retournement*. Les valeurs peuvent bouger avec un dataset ; la leçon, non.

## Le défaut trouvé en chemin : deux moyennes peintes aux couleurs du marché

En allant lire le renderer pour décrire honnêtement ce qu'il trace, un défaut est apparu :
`IndicatorPanel` peignait la moyenne **rapide en vert** et la **lente en rouge**.

Le canon Trademy réserve le vert et le rouge à la direction du marché. Or ces deux lignes dérivent du
même prix : la couleur y distinguait une **période**, pas un sens. Un élève y lisait naturellement
« ligne haussière contre ligne baissière » — l'inverse exact de ce que la fiche enseigne.

Corrigé avec le traitement que les bandes de Bollinger emploient déjà dix lignes plus bas :
annotation (cyan) pour la ligne qu'on lit, pointillés discrets pour la référence lente. Une légende
`rapide 3 · lente 6` a été ajoutée : sans elle, « la rapide passe au-dessus de la lente » était
indécidable à l'œil. `indicatorPanelColors.test.tsx` monte le vrai renderer et lit les couleurs
réellement produites.

Le ruban de moyennes (`ma-ribbon`) présente le même défaut. Il n'est pas corrigé ici : aucune fiche
ne l'enseigne encore, et le corriger sans le contenu qui le justifie serait un changement sans
utilisateur. Il rejoindra le lot qui l'enseignera.

## Deux verrous qui changent de sens plutôt que de disparaître

**« Aucun placement dans ce module »** était vrai tant qu'aucun concept du monde ne documentait un
côté d'invalidation. Les deux croisements en documentent un. Le verrou devient : le placement existe
**là et seulement là**, et chaque côté est le bon — `place-invalidation` (plus bas réel) pour le
haussier, `place-extreme` (plus haut réel) pour le baissier. Le test recalcule les deux cibles depuis
les séries rendues. Affaiblir ce verrou aurait laissé passer l'erreur exacte que la fiche du
croisement baissier apprend à éviter.

**La liste des compétences qui font calculer** s'ouvre à la moyenne mobile, comme elle s'était
ouverte au dividende et au PER au LOT C8, et pour la même raison : sa définition **est** une
opération. Six clôtures montant de 40 à 50 donnent une ligne à 45 — cinq points sous le dernier prix,
et ces cinq points ne viennent que du calcul. Aucun QCM ne fait comprendre ça.

## Ce qui n'a PAS été fait

**Les huit autres variantes orphelines restent orphelines.** Elles feront les lots suivants de la
série, un sujet à la fois. Écrire huit fiches d'un coup produirait huit textes plausibles ; ce lot en
a produit trois vérifiables.

**Aucun dataset n'a été modifié.** Les trois séries existaient et étaient déjà testées : les fiches
se sont adaptées aux données, jamais l'inverse. C'est ce qui rend le verrou de dérivation possible.

## Compteurs

- Concepts : **67 → 70**. Compétences : **67 → 70**.
- Module « Lire les indicateurs » : 4 → 7 compétences, 17 → 31 exercices.
- Fiches consultables sans compétence propre : **3**, inchangé — les trois nouvelles arrivent avec
  leur compétence, ce que la série C avait dû faire après coup.
- Variantes d'indicateur enseignées : **6 → 9** sur 15.
