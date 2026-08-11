# ADR-142 — LOT C2 : la figure miroir

- **Statut** : accepté (première tranche de la dette chiffrée par le LOT C1).
- **Contexte** : l'ADR-141 se termine par une phrase que ce lot vient honorer — « les 22 fiches de
  bibliothèque n'ont toujours pas d'exercices à elles, et leur statut s'arrête donc à “Découvert”.
  […] Leur donner une compétence propre est un travail de contenu, monde par monde. »

## Pourquoi ces deux fiches d'abord

Sur les 22, deux se distinguent : **l'avalement baissier** et **le double sommet**. Ce ne sont pas
des notions de plus — ce sont les **miroirs exacts** de deux figures déjà enseignées juste à côté
(l'avalement haussier, compétence 4 du monde des chandeliers ; le double creux, compétence 1 du
monde des figures). La fiche du double sommet le dit elle-même : « le miroir baissier du double
creux ».

Et surtout, elles portent **l'erreur la plus fréquente de tout le corpus** : sur un setup baissier,
l'invalidation **change de côté**. Le double creux s'invalide sous ses planchers ; le double sommet
s'invalide **au-dessus** de ses sommets. Un apprenant qui a bien appris la version haussière place
spontanément l'invalidation du mauvais côté du graphique — et surveille le mauvais bord.

Enseigner le miroir n'est donc pas doubler une leçon : c'est **corriger un réflexe**.

## Décision

Deux nouvelles compétences guidées, une par monde, nommées identiquement parce qu'elles enseignent
le même geste :

| Compétence | Concept entraîné | Ce qu'elle corrige |
|---|---|---|
| `skill.candle.mirror` — « La figure miroir » | `concept.bearish-engulfing` | l'invalidation passe **au-dessus** du plus haut de la figure |
| `skill.patterns.mirror` — « La figure miroir » | `concept.double-top` | l'invalidation passe **au-dessus** des sommets, pas sous la ligne de cou |

1. **Cinq exercices chacune, un par objectif RÉEL de la fiche** — reconnaître, interpréter,
   confirmer, invalider, déjouer le faux signal. Aucun objectif inventé, aucun omis : la liste est
   dérivée de `objectivesForConcept`, et les tests de module la relisent depuis la fiche.
2. **Chaque énoncé cite un champ de la fiche.** La reconnaissance montre le `visualSpec` réel
   (`candle.bearish-engulfing.v1`, `pattern.double-top.v1`) ; la lecture ordonnée reprend
   `howToRecognize` et `contextRequired` ; la confirmation reprend `confirmationZone` ;
   l'invalidation reprend `invalidation` ; le faux signal reprend `falseSignals` et
   `commonMistakes`.
3. **L'invalidation se PLACE, et elle se place en haut.** La mécanique `place-extreme` — déjà
   déclarée, gradée et jouée — vise le plus haut atteint. C'est exactement ce que demandent ces deux
   fiches. **Aucun nouveau player, aucune nouvelle interaction.**
4. **Une leçon guidée par compétence**, construite sur le même squelette que les quatorze modules
   existants (intro, observe, visuel, hypothèse, manipulation, explication, faux signal, résumé,
   flashcard). Chacune s'ouvre en rappelant la version déjà apprise : le miroir n'a de sens que
   comme transposition.

## Résultat mesurable

- **Compétences : 48 → 50.** Le pin structurel de `repoTruth` suit, avec sa raison écrite.
- **Fiches de bibliothèque : 22 → 20.** Le verrou du LOT C1 chiffre la dette ; il passe à 20, et ce
  changement est *voulu*, pas subi — c'était précisément l'objet du test.
- Deux concepts de plus peuvent désormais atteindre « Maîtrisé » : ils ont des objectifs exerçables,
  donc la couverture et la révision espacée les voient enfin.

## Ce qui n'a pas changé

- **Aucun concept, monde ou catégorie ajouté** : les deux fiches existaient déjà, complètes, dans le
  corpus. Le compteur de concepts reste **67** — on n'a rien gonflé.
- Aucun nouveau player, aucune dépendance, aucune migration, aucun asset.
- Statuts éditoriaux inchangés (`needsReview`), aucun vocabulaire BUY/SELL : les énoncés disent
  « setup baissier », « zone de confirmation », « invalidation ».
- Les sessions ne s'allongent pas : cinq exercices par compétence, sous le plafond de six.

## Tests (exécutés)

- `candleModuleScenarios.test.ts` / `patternsModuleScenarios.test.ts` — la 5e compétence entre dans
  **tous** les garde-fous existants : couverture des objectifs réels dérivée de la fiche, gradabilité
  par le grader RÉEL, cohérence figure/dataset avec le `visualSpec`, mécaniques distinctes,
  checkpoint, absence de vocabulaire interdit.
- **Le verrou de placement est RENFORCÉ, pas assoupli.** Il vérifiait « la cible placée est le plus
  bas réel ». Il vérifie désormais que la cible est l'extrême réel **du côté annoncé par l'énoncé** —
  et qu'il existe exactement un placement vers le haut par module. Autrement dit : le test échouerait
  si la figure miroir demandait le haut mais validait le bas. C'est le cœur pédagogique du lot, et il
  est verrouillé.
- `repoTruth.test.ts` — pin 48 → 50, avec sa justification.
- `conceptNextStep.test.ts` — dette 22 → 20.

Gate `EXPO_NO_TELEMETRY=1 npm run check` : verte de bout en bout.

## Ce qui reste

**20 fiches de bibliothèque** sans compétence propre. Les prochaines tranches naturelles sont les
autres miroirs et variantes de familles déjà enseignées (étoile filante et pendu face au marteau,
triangle descendant face au triangle ascendant, drapeau baissier face au drapeau haussier, ÉTÉ
inversé face à l'épaule-tête-épaule). Le reste — harami, tweezer, dividende, PER — demandera de
vraies compétences neuves, pas des transpositions.
