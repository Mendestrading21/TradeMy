# ADR-136 — LOT D1 : les exercices rattrapent le contenu (et ne peuvent plus décrocher)

- **Statut** : accepté (priorité propriétaire du 11/08/2026 : « développe au max, avec des vraies
  données, des vrais trucs, le maximum possible »).
- **Contexte** : un audit de couverture, écrit pour ce lot, a comparé pour chaque compétence guidée
  les objectifs **réellement exercés** aux objectifs **réels de sa fiche** — ceux que
  `learningTarget` dérive de ses champs (`learningObjective`, `definitionShort`,
  `confirmationZone`, `invalidation`, `falseSignals`).

## Le défaut trouvé

**Le contenu avait avancé, les exercices non.**

Le LOT E3 (ADR-133) avait enrichi cinq fiches d'une **zone de confirmation** et d'une
**invalidation** réelles. Ces deux champs créent mécaniquement deux objectifs pédagogiques de plus.
Or les cinq compétences correspondantes ont continué de n'exercer que trois objectifs : l'apprenant
lisait la confirmation sur la fiche, mais ne la pratiquait jamais.

L'audit a montré que le décalage était **plus large** que les cinq fiches : **18 objectifs
documentés n'étaient exercés nulle part**, répartis sur douze autres compétences (chandeliers,
structure, niveaux, figures) et sur la leçon libre « Actions ».

**Pourquoi rien ne l'avait signalé** : chaque module vérifiait sa couverture contre une liste
d'objectifs **écrite en dur dans son test**. Enrichir une fiche ne faisait donc échouer aucun test —
la liste figée restait « juste » par rapport à elle-même.

## Décision

1. **Combler les 23 manques**, chacun **DÉRIVÉ** du champ réel de sa fiche (`confirmationZone`,
   `invalidation`, `definitionShort`, `falseSignals`, conditions de scénario). Rien n'est inventé :
   chaque énoncé cite un contenu déjà rédigé et déjà relu.
2. **Choisir la mécanique d'après le contenu, jamais l'inverse.** Une invalidation qui est
   littéralement « sous le plus bas atteint » se **place** sur le graphique (mèche de rejet,
   impulsion/correction → deux nouveaux exercices de manipulation continue). Une invalidation qui est
   un retour de l'autre côté d'un niveau, ou une reprise au-dessus, se **raisonne** (scénario
   conditionnel). Aucun placement n'a été forcé là où la cible ne serait pas le plancher réel de la
   série rendue.
3. **Rendre l'attente DÉRIVÉE, dans les sept tests de module** : `EXPECTED` est désormais calculé
   par `objectivesForConcept(fiche)` au lieu d'être recopié. Enrichir une fiche fait maintenant
   **échouer** son module tant que les exercices n'ont pas suivi.
4. **Ajouter un verrou de corpus** (`guidedObjectiveCoverage.test.ts`) qui, sur l'ensemble des
   compétences guidées, vérifie les deux sens :
   - aucun exercice ne cible un objectif **absent** de sa fiche (rien d'inventé) ;
   - aucun objectif documenté ne reste **sans exercice** (le contenu ne devance plus la pratique).
   Le second contrôle est fait **par cible** (`conceptId::objectiveId`), comme la maîtrise :
   une fiche partagée par deux compétences reste correctement couverte sans exiger que chacune
   l'épuise seule.

## Ce que ça change pour l'apprenant

Cinq compétences passent de 3 à 5 exercices, treize autres gagnent l'objectif qui leur manquait.
Concrètement : on ne se contente plus de **reconnaître** une mèche de rejet, un double creux ou une
distribution — on doit dire **ce qui la confirme** et **ce qui la démentirait**. C'est précisément la
promesse du canon : « une visite n'est pas une maîtrise ».

## Ce qui n'a pas changé

- **Aucun concept, aucune compétence, aucun monde ajouté.** Statuts éditoriaux inchangés
  (`needsReview`).
- **Aucune dépendance, aucune migration.** Les progrès existants restent valides : la maîtrise se
  mesure par cible, et les cibles ajoutées sont simplement « pas encore vues ».
- **Aucun vocabulaire BUY/SELL, aucune promesse de gain** — vérifié par le garde-fou de chaque module.
- Les silences honnêtes sont **préservés** : `unite-de-temps` et `echelle-des-prix` ne documentent
  toujours pas de zone de confirmation → elles restent à 3 exercices, sans objectif inventé.

## Tests (exécutés)

- `guidedObjectiveCoverage.test.ts` (4) : verrou de corpus, dans les deux sens.
- Les 7 tests de module réécrits (attente dérivée, comptes exacts, placement uniquement là où
  l'invalidation est un plancher, gradabilité de chaque nouvel exercice par le grader réel).
- Suite `src/data` complète : verte.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` : verte de bout en bout.

## Reste ouvert

La **variété des mécaniques** reste un chantier distinct : le corpus guidé n'utilise que 5 des
13 formats déclarés, et quatre interactions graphiques déjà implémentées (`read-direction`,
`touch-extreme-zone`, `label-extreme`, `place-extreme`) ne sont employées nulle part dans les
modules. Ce lot n'a délibérément pas forcé leur usage : la mécanique doit servir le contenu, pas
l'inverse. Les introduire demande de choisir, fiche par fiche, celles où elles enseignent vraiment.
