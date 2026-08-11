# ADR-131 — LOT E1 : la manipulation dans chaque leçon

- **Statut** : accepté (priorité propriétaire du 02/08/2026 : « analyse ce qui va et ce qui ne va
  pas, puis enrichis au maximum »).
- **Contexte** : l'analyse factuelle du corpus a mesuré le maillon faible de la boucle canonique
  (« observer, formuler, vérifier, **manipuler**, répondre, expliquer puis réviser ») : sur
  **59 leçons, 4 seulement portaient une étape `interaction`**. L'apprenant lisait et répondait,
  mais ne manipulait presque jamais. Trois leçons étaient par ailleurs restées à l'état d'ébauche
  (2 étapes : `explain` + `summary`, contre 7 en moyenne).

## Décision
1. **Une manipulation dans chaque arc de leçon.** L'étape est DÉCLARÉE dans la donnée
   (`{ kind: 'interaction', conceptRef }`) et placée après l'observation/formulation — jamais en
   première étape. Résultat : **58 leçons sur 59** portent une manipulation, et **chacune des 48
   compétences** en propose au moins une.
2. **On manipule la figure enseignée, pas un graphique décoratif.** `LessonReplay` accepte une
   série réelle : quand le dataset canonique du concept est assez long (≥ 8 bougies), c'est la
   FIGURE DU CONCEPT qui se révèle bougie par bougie — ce qui enseigne qu'une figure ne se lit
   qu'une fois formée. En dessous (figures d'une seule bougie : marteau, doji, marubozu…), repli
   sur la série déterministe : « révéler » une bougie unique n'apprendrait rien.
3. **Consigne dérivée, jamais dupliquée.** Le texte de l'étape est dérivé du premier critère de
   reconnaissance du concept (`howToRecognize[0]`) : une seule source de vérité, aucun texte
   recopié dans les données. Un `body` explicite dans la donnée reste prioritaire.
4. **Exception assumée et nommée** : `lesson.action-vs-bond` (action ou obligation) est une
   distinction notionnelle sans figure de marché — y greffer un graphique serait du décor, ce que
   le canon interdit. Le test la nomme, ce qui interdit toute régression silencieuse ailleurs.
5. **Trois ébauches promues en vraies leçons** (`support-resistance`, `candle-anatomy`,
   `action-vs-bond`) : arc complet intro → observe → visuel → explication → hypothèse →
   manipulation → faux signal → résumé → flashcard.

## Tests (exécutés)
- `lessonManipulation.test.ts` : couverture par compétence (48/48), exception unique nommée,
  résolvabilité de chaque manipulation, part de figures réelles rejouées, position dans la boucle.
- `lessonManipulationView.test.tsx` : rendu réel — série du dataset canonique transmise, consigne
  dérivée du critère réel, repli déterministe, priorité au texte explicite, et rendu SANS erreur
  des ~58 manipulations réelles du parcours.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout (exit vérifié).

## Portée
Aucun concept ajouté, aucun compteur gonflé, aucune dépendance, aucune migration. Les statuts
éditoriaux (`needsReview`) sont inchangés.
