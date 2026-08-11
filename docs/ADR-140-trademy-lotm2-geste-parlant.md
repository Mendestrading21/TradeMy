# ADR-140 — LOT M2 : le geste dit quelque chose

- **Statut** : accepté (priorité propriétaire : « améliore Toto et Bobo au max, qu'ils bougent
  vraiment »).
- **Contexte** : le LOT M1 avait donné aux guides une **présence** — arrivée en approche,
  respiration propre au tempérament, balancement révélant le volume, ombre au sol. Il restait la
  moitié du canon à honorer : « une animation contextuelle **courte** avec entrée, **geste**,
  **regard/pointage** et **sortie** ; éviter le flottement infini uniforme »
  (`patternlab-learning-master`).

## Le défaut

Le registre déclare **vingt-cinq états** canoniques. Le mouvement, lui, ne portait que **trois**
valeurs : le pop dosé par l'intensité — `1.14` (lively), `1.06` (subtle), `1.0` (still).

Conséquence directe, mesurable dans le code d'avant : `warning`, `explain`, `point`, `agree`,
`wrong`, `think`, `false-signal`, `disagree`, `encourage`, `confused`, `debate`, `observe`,
`inspect` et `review` **s'animaient exactement pareil**. `celebrate-big`, `wave`, `streak`,
`level-up`, `welcome` et `premium` aussi.

Autrement dit : une mise en garde et une explication produisaient le même mouvement. Le geste ne
disait rien — seule l'image changeait. Un guide qui « bouge » sans que le mouvement signifie quoi
que ce soit est un décor animé, pas un pédagogue.

## Décision

**Six gestes**, et seulement six — parce que ce sont les seuls qu'un **rendu 3D fixe** peut porter
honnêtement : on déplace et on incline l'image, on ne la déforme jamais, et **on ne fabrique aucune
pose** (le canon interdit la 3D temps réel et le redimensionnement des PNG).

| Geste | Ce qu'il dit | Maintenu ? |
|---|---|---|
| `hop` | bond puis retombée — la réussite, la fête | non |
| `nod` | hochement descendant — l'assentiment, l'encouragement | non |
| `shake` | balancement latéral — le doute, le refus, la mise en garde | non |
| `lean` | penché vers le contenu — le **regard** et le **pointage** | **oui** |
| `sink` | léger tassement — la réflexion en cours | **oui** |
| `none` | rien — les états système et de repos | — |

1. **Le geste est DÉRIVÉ du registre, jamais écrit à la main état par état.** La règle se lit comme
   une phrase : un état immobile ne gestifie pas ; un état vif bondit ; une expression inquiète ou
   triste se balance ; une expression pensive se tasse ; une expression excitée mais contenue se
   penche vers ce qu'elle désigne ; tout le reste acquiesce. **Ajouter un état demain lui donne
   automatiquement un geste cohérent** — et un test relit cette règle depuis les métadonnées.
2. **L'ampleur suit le tempérament, elle aussi dérivée** : le rapport entre le balancement de repos
   du guide et celui de la présence neutre. Toto, ample au repos, l'est dans son geste ; Bobo,
   contenu, reste contenu. Aucune constante inventée par personnage.
3. **Les deux gestes « portés » (`lean`, `sink`) se maintiennent** jusqu'au changement d'état :
   c'est exactement l'« entrée, geste, regard, sortie » du canon — la sortie est le retour à `idle`
   décidé par la machine de réaction existante, pas un minuteur de plus.
4. **Le guide se tourne vers ce qu'il désigne.** `CharacterScene` transmet le sens de lecture :
   quand la scène est en miroir (guide à droite), le geste latéral se retourne avec elle. Sans cela
   un pointage désignerait le bord de l'écran.
5. **L'ombre suit l'élévation TOTALE** (respiration + bond), bornée par la hauteur réellement
   atteignable. Sans cette borne, un bond ressemblerait à un autocollant qui glisse au-dessus d'une
   ombre restée large — le défaut même que le LOT M1 avait corrigé pour la respiration.

## Ce qui n'a pas changé

- **Aucun nouvel asset, aucune 3D temps réel, aucune dépendance, aucune migration.** Les huit
  renders officiels restent les seules images, jamais redimensionnées.
- **Le pop de l'ancien modèle est conservé** : le geste s'ajoute, il ne remplace rien.
- **Reduced-motion reste strictement statique** — un test le vérifie pour les vingt-cinq états, dans
  les deux orientations. L'information ne passe jamais par le seul mouvement : le libellé accessible
  du registre reste la source.
- **Aucune boucle nouvelle** : `idle` demeure la seule boucle entretenue de toute l'application. Un
  geste est une trajectoire **finie** — au plus quatre étapes, au plus une demi-seconde.
- Aucun contenu pédagogique, aucun texte, aucune couleur touchés.

## Tests (exécutés)

`mascotGesture.test.ts` — 14 tests verts :

- chaque état canonique a un geste (aucun état muet, aucun oublié) ;
- la règle de dérivation relue depuis les métadonnées, état par état ;
- **les états qui bougeaient identiquement bougent maintenant différemment** — c'est le défaut,
  prouvé réparé : `warning` ≠ `explain` ≠ `point` ;
- au moins cinq gestes distincts employés par le corpus ;
- un état `still` ne gestifie jamais ;
- reduced-motion → plan strictement statique pour les vingt-cinq états, `facing` compris ;
- les trois pistes d'un geste ont la même longueur ; un geste non maintenu revient **exactement** à
  zéro ; seuls `lean` et `sink` se maintiennent ; aucun geste ne dépasse une demi-seconde ;
- l'ampleur suit le tempérament (Toto > 1 > Bobo, neutre = 1) et le bond de Toto monte plus haut ;
- le miroir retourne les axes latéraux **et seulement eux** — un bond reste vertical ;
- l'échelle d'ombre couvre la hauteur réellement atteignable ;
- aucun geste ne boucle.

`characterAnimationController.test.tsx` — **nouveau, et il comble un trou antérieur à ce lot** : le
contrôleur d'animation n'était rendu par AUCUN test (seul l'avatar statique l'était). Une erreur
dans une séquence animée serait passée à travers la gate. 5 tests verts : les 25 états × 2 guides ×
2 orientations se montent et se démontent ; le libellé accessible vient bien du registre pour chaque
état ; un enchaînement d'états ne casse rien ; sous reduced-motion le rendu est statique — **aucune
ombre animée** — et sans reduced-motion l'ombre du LOT M1 est bien là.

Suite `src/characters` complète : 105 tests verts (13 suites).
Gate `EXPO_NO_TELEMETRY=1 npm run check` : verte de bout en bout.

## Limite réelle, dite franchement

Un render 3D fixe ne peut pas tourner la tête ni lever un bras. `lean` est un **corps penché**, pas
un doigt tendu ; `shake` est un **balancement**, pas une tête qui fait non. Le geste indique une
intention, il ne la mime pas. Aller plus loin demanderait de **nouvelles poses rendues**, que seul
le propriétaire peut produire — le canon interdit d'en fabriquer par déformation d'image.
