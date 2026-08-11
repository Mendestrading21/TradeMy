# ADR-139 — LOT D3 : le risque se calcule, il ne se coche pas

- **Statut** : accepté (priorité propriétaire : « développe au max, des vrais trucs »).
- **Contexte** : le LOT D2 avait porté le parcours guidé de 5 à 8 formats d'exercice sur 13, en
  posant une règle : **la mécanique doit servir le contenu**. Il restait un cas où le contenu
  réclamait franchement une mécanique absente.

## Le défaut

Le monde **Risque** enseigne trois notions dont deux ont une réponse **chiffrée** :

- `risque-rendement` — « la distance entrée→stop (le risque) comparée à la distance entrée→cible » ;
- `taille-de-position` — « choisir la taille pour que la distance au stop représente une petite part
  du capital ».

Or **tous** ses exercices se cochaient. On pouvait donc traverser le monde qui protège le capital,
répondre juste partout, et n'avoir jamais posé une seule opération. Un QCM sur un ratio laisse
deviner exactement ce que la compétence consiste à savoir calculer.

Le format `numeric` était pourtant déjà **déclaré, gradé et joué** (champ numérique avec unité,
accessible) — il ne servait que dans la leçon libre « Actions ».

## Décision

1. **Ajouter l'interaction `compute`** au modèle de scénario canonique (`scenario.ts`), mappée sur
   le player de production `numeric` existant. **Aucun nouveau composant d'interface.** Comme toute
   interaction du modèle, elle porte sa propre vérité : énoncé, unité, réponse, tolérance — et un
   champ `method` qui explique **comment on arrive au résultat**.
2. **Le feedback donne le résultat ET la méthode.** Sur un calcul, une erreur n'apprend rien si l'on
   ne voit pas où le raisonnement a dérapé : `« La réponse est 3 × le risque. Risque = 100 − 95 = 5.
   Rendement = 115 − 100 = 15. Rapport = 15 ÷ 5 = 3. »`
3. **Deux exercices**, chacun **VARIANTE** d'un objectif `interpret` existant (la couverture des
   objectifs est donc inchangée ; c'est la rotation entre visites qui gagne une façon de demander) :
   - `skill.risk.reward` — le multiple de risque, dérivé mot pour mot de la définition de la fiche ;
   - `skill.risk.sizing` — la taille de position, le geste même du dimensionnement.
4. **Le résumé accessible reprend les données de l'énoncé et l'unité attendue** : contrairement aux
   interactions graphiques, la vérité n'est pas dans une série rendue — sans les chiffres, la
   question serait impossible à répondre au lecteur d'écran.

## Ce qui n'a pas changé

- **Aucun nouveau player, aucune dépendance, aucune migration.**
- Aucun concept, compétence ou monde ajouté ; statuts éditoriaux inchangés (`needsReview`).
- **Aucun vocabulaire BUY/SELL** : les énoncés disent « entrée théorique », « invalidation »,
  « objectif pédagogique » — le vocabulaire canonique.
- Les sessions ne s'allongent pas au-delà de la borne : les deux compétences passent à 6 exercices,
  le plafond déjà tenu par le reste du parcours guidé.

## Résultat mesurable

Formats employés par le parcours guidé : **8 → 9** sur 13. `true_false` et `match` restent inutilisés
dans les modules — faute de contenu qui les justifie honnêtement, et ce n'est pas un manque à combler
pour le plaisir du compte.

## Tests (exécutés)

- `guidedMechanicVariety.test.ts` étendu : au moins **neuf** façons de demander, et un verrou qui
  liste **exactement** les compétences portant un calcul — les deux du monde Risque plus la leçon
  libre « Actions », qui faisait déjà calculer une part du capital avant ce lot. Le calcul ne peut
  donc pas se répandre là où il n'enseignerait rien.
- `riskModuleScenarios.test.ts` : compte exact (16), jeu de types incluant `numeric`, et **chaque
  nouvel exercice corrigé par le grader RÉEL** (la bonne réponse est acceptée).
- Suites `src/data` et `src/engines` complètes : 965 tests verts.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` : verte de bout en bout.
