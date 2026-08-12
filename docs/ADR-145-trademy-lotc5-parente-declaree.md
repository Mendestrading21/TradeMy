# ADR-145 — LOT C5 : la parenté déclarée

- **Statut** : accepté (correction d'un manque relevé par l'audit éditorial du corpus).
- **Contexte** : le LOT C1 a fait de `relatedConceptIds` un champ **fonctionnel**, et non plus
  seulement documentaire. `conceptNextStep` en dérive la « prochaine étape » d'une fiche : la notion
  liée déclarée par l'éditeur l'emporte, et à défaut seulement, on retombe sur la première
  compétence du monde.

## Le défaut

**Sept fiches sur 67 ne déclaraient aucune notion liée** — unité de temps, échelle des prix, mèche de
rejet, impulsion et correction, retest de niveau, distribution Wyckoff, faux breakout.

Avant le LOT C1, c'était un manque documentaire sans conséquence. Depuis, c'en est un vrai : ces
sept fiches envoyaient l'apprenant vers un **repli générique** — la première compétence du monde —
au lieu de la notion qui les éclaire réellement. Un apprenant lisant « mèche de rejet » était renvoyé
vers le début de son monde plutôt que vers le marteau, qui est précisément la figure faite de cette
mèche.

## Décision

Sept parentés ajoutées, chacune justifiée par le contenu lui-même, et **toutes menant à une notion
entraînée** — donc à une compétence réellement jouable :

| Fiche | Parentés déclarées | Pourquoi |
|---|---|---|
| Unité de temps | anatomie d'une bougie, échelle des prix | les deux dimensions d'un graphique |
| Échelle des prix | anatomie, unité de temps, support et résistance | c'est sur cet axe que se situent les niveaux |
| Mèche de rejet | marteau, étoile filante, support et résistance | la mèche EST la matière de ces deux figures, et elle rejette une zone |
| Impulsion et correction | tendance haussière, drapeau haussier, price action | le drapeau EST une correction ; l'alternance fait la tendance |
| Retest de niveau | polarité, support et résistance, cassure de structure | le retest est le mécanisme du flip |
| Distribution Wyckoff | accumulation, range, volume | miroir exact de l'accumulation, lu au volume |
| Faux breakout | faux signal, support et résistance, cassure de structure | un faux signal appliqué à une cassure |

Aucun contenu pédagogique n'a été réécrit : seules les relations ont été déclarées.

## Le verrou

`conceptRelations.test.ts` tient l'invariant dans les deux sens : **chaque fiche déclare au moins une
parenté**, **chaque parenté pointe vers un concept qui existe**, aucune fiche ne se cite elle-même,
aucune parenté n'est répétée, et les sept ajoutées mènent bien à une notion entraînée.

## Une règle que j'ai retirée, et pourquoi

J'avais d'abord écrit un cinquième test : *une parenté doit rester dans son monde, sauf pour une
courte liste de notions transverses*. Le corpus l'a démenti sur huit relations — le marteau renvoie
au double creux (il en forme souvent le second plancher), la discipline au risque-rendement, les
options au même, la cassure-retest à la polarité.

**Le corpus avait raison, pas moi.** C'est exactement ce à quoi sert `relatedConceptIds` : relier des
familles **à travers** le parcours. J'aurais pu allonger la liste d'exceptions jusqu'à ce que le test
passe ; c'eût été fabriquer une règle pour la satisfaire. Le test a donc été remplacé par celui qui
dit vrai : ces ponts entre mondes existent, et c'est voulu.

## Tests (exécutés)

`conceptRelations.test.ts` — 5 tests verts. Suite `src/data` complète : 75 suites, 873 tests.
Gate `EXPO_NO_TELEMETRY=1 npm run check` : verte de bout en bout.
