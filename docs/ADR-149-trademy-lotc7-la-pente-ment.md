# ADR-149 — LOT C7 : quand la pente ment, et quand une figure n'annonce rien

- **Statut** : accepté.
- **Contexte** : suite du LOT C6. Il restait 12 fiches de bibliothèque ; trois d'entre elles portent
  des idées que le module « Lire les figures » n'enseigne nulle part.

## Une hypothèse mesurée, et à moitié fausse

J'ai d'abord supposé que le triangle symétrique était **la seule figure sans direction du corpus**.
La mesure dit non : **20 concepts** sont `direction: 'neutral'` (le doji, le range, le RSI, le VWAP…).
L'affirmation aurait été fausse.

Restreinte aux **figures chartistes** (`visualSpec.type === 'chart-pattern'`, 20 fiches), il n'en
reste que deux neutres — et **une seule dans `world.patterns`** : le triangle symétrique. C'est cette
formulation-là qui est vraie, et c'est celle qui est enseignée.

La seconde hypothèse, elle, tient : sur les 67 fiches, **trois seulement** ont une direction
pédagogique opposée à ce que dessine leur figure. Deux sont les biseaux.

## Décision — trois compétences

**`skill.patterns.wedge` — Quand la pente ment** (`concept.rising-wedge`). Les huit compétences
précédentes du module suivent toutes leur dessin : ce qui monte se lit haussier. Le biseau ascendant
**monte** et `visualSpec.direction` dit **`bearish`**. Sa `definitionShort` explique pourquoi :
« Deux droites montantes qui convergent : une hausse qui s'essouffle. » Ce n'est pas la pente qui
parle, c'est la **convergence** — une hausse qui demande de plus en plus d'efforts pour gagner de
moins en moins.

**`skill.patterns.wedge-mirror` — La pente ment dans les deux sens** (`concept.falling-wedge`).
Ce miroir n'est pas mécanique : il vérifie que l'apprenant a retenu la **règle** (« la convergence
prime la pente ») et non un cas particulier (« un biseau est baissier »). Le faux signal à repérer
est précisément cette généralisation ratée.

**`skill.patterns.no-direction` — La figure sans direction** (`concept.symmetrical-triangle`).
Les triangles ascendant et descendant ont une **borne plate**, et c'est elle qui donne le sens. Le
symétrique n'en a aucune. Reconnaître la figure ne suffit donc plus : sa `confirmationZone` dit
« la sortie confirmée d'une des **deux** trendlines ». La figure ne donne pas une direction, elle
donne un **niveau de décision**.

## La donnée a imposé une mécanique, et cette mécanique enseigne

Le triangle symétrique déclare bien une `invalidation` — mais c'est
« Retour immédiat dans la figure après une sortie non tenue ». **Ni plancher ni plafond : un retour
dedans.** Il n'y a aucun côté à placer.

Lui donner un exercice `place-invalidation` aurait enseigné une direction que la figure n'a pas.
L'objectif est donc couvert par un **scénario conditionnel** — jamais escamoté — et un test l'exige
dans les deux sens : aucun `place_invalidation` pour cette fiche, et l'objectif `invalidate` bien
présent sous forme de `scenario`. **Le choix de mécanique est lui-même la leçon.**

Pour les biseaux, le moteur a imposé l'autre moitié de la règle : `place-invalidation` vise toujours
le **plus bas** de la série ; un setup baissier doit donc utiliser `place-extreme`. Le biseau
ascendant — baissier malgré sa pente — passe par `place-extreme`, le descendant par
`place-invalidation`. Cohérent par construction, pas par convention.

## Le verrou du LOT C3 devient plus fort qu'un compteur

Le test d'invalidation du module passe de 6 à 8 placements, et gagne trois assertions :

- le biseau **ascendant** (dessin ↑, setup baissier) s'invalide vers le **haut** ;
- le biseau **descendant** (dessin ↓, setup haussier) vers le **bas** ;
- le triangle symétrique n'apparaît dans **aucun** placement.

Si quelqu'un « corrige » un jour un biseau pour l'aligner sur sa pente, ce test tombe.

Un second test protège la leçon elle-même : les **huit compétences antérieures** sont vérifiées comme
suivant leur pente. Le jour où une autre figure du module deviendrait contre-intuitive, l'affirmation
« les biseaux sont l'exception » deviendrait fausse — et le test le dirait.

## Chiffres, tous vérifiés par test

- Compétences : **58 → 61**.
- Exercices du module Figures : **40 → 55**. Reconnaissances : 8 → 11. Placements : 6 → 8.
- Fiches de bibliothèque : **12 → 9**. Concepts : **67, inchangé**.
- Statuts éditoriaux inchangés (`needsReview`).

## Ce que ce lot ne fait pas

Aucun concept ajouté, aucun dataset créé — les trois existaient déjà. Aucune dépendance, aucune
migration, aucun écran touché.

Restent **9 fiches** : harami, pincettes, étoile du soir, trois corbeaux, tasse-anse, triple creux,
cassure-retest, dividende, PER. Les deux dernières ne sont pas des figures mais des **notions
calculables** — ce sera une autre mécanique.
