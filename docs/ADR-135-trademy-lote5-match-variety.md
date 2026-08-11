# ADR-135 — LOT E5 : « Associe » — distinguer les notions voisines d'un même monde

- **Statut** : accepté (priorité propriétaire du 02/08/2026 : « continue à enrichir »).
- **Contexte** : mesure des 213 exercices — **85 % tenaient dans 4 formats** (reconnais la figure,
  repère l'erreur, mets dans l'ordre, scénario) alors que **13 formats sont implémentés**. Le
  format « Associe » (`match`) n'était utilisé **qu'une seule fois** dans tout le parcours. Or il
  exerce une compétence que rien d'autre ne travaille : **ne pas confondre deux notions voisines du
  même monde** (un marteau et une étoile filante, une accumulation et une distribution).

## Décision
Chaque module guidé reçoit **un exercice d'association dérivé de ses concepts réels** : à gauche
les notions du monde, à droite leurs premiers critères de reconnaissance. Le parcours passe de
**213 à 223 exercices**, et le format `match` d'anecdotique (1) à réellement présent (11).

Trois garde-fous rendent l'ajout sûr :

1. **Aucun texte inventé** : titres et critères viennent des fiches (`title`, `howToRecognize[0]`).
   Un module dont moins de trois concepts portent un critère ne produit aucun exercice — une
   association à deux paires n'apprendrait rien.
2. **Jamais trivial** : le lecteur d'exercice affiche les propositions dans l'ordre reçu ; la
   colonne de droite est donc **décalée d'un cran**, et le test interdit que la solution soit
   l'alignement ligne à ligne. Il vérifie aussi que la solution est **juste** (chaque paire pointe
   le critère de son propre concept) et **bijective**.
3. **Aucune nouvelle exigence de maîtrise** : l'exercice ne vise une cible que si cet objectif
   était **déjà exerçable** avant ce lot — il devient alors une simple **variante de rotation**
   (`exerciseVariantsForObjective`), donc de la variété au fil des sessions, sans durcir le
   contrat de maîtrise. Sinon il reste sans cible.

## Tests (exécutés)
- `moduleMatchExercises.test.ts` (7) : présence réelle du format, dérivation depuis des concepts et
  critères réels, non-trivialité et bijection de la solution, justesse de chaque paire, absence de
  nouvelle exigence de maîtrise (et variante de rotation effective), rattachement à une compétence
  réelle sans doublon d'identifiant, feedback complet et vocabulaire canon.
- Compteur dérivé `REPO_TRUTH` mis à jour (223) — la valeur reste calculée par le code.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout (exit vérifié).

## Portée
Aucun concept ajouté, aucune compétence ajoutée, aucune dépendance, aucune migration. Les statuts
`needsReview` sont inchangés : le contenu cité vient de fiches déjà soumises à relecture.
