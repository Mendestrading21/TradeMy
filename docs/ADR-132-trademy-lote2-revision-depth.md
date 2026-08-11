# ADR-132 — LOT E2 : profondeur de révision par dérivation des fiches

- **Statut** : accepté (priorité propriétaire du 02/08/2026 : « enrichis le tout au maximum »).
- **Contexte** : mesure du corpus réel — le contenu est **large mais peu profond**. Chaque fiche
  porte tous les champs canoniques, mais **1,03 flashcard rédigée** et **1 mini-quiz** en moyenne.
  La répétition espacée tournait donc sur ~136 cartes pour 67 concepts : trop peu pour ancrer
  durablement, et toujours le même angle.

## Décision
**Dériver la matière de révision des champs déjà validés de chaque fiche, sans inventer une ligne.**

`src/data/derivedRevision.ts` (pur, testé) construit jusqu'à **six cartes par fiche**, une par
facette réellement documentée :

| Angle | Champ source |
|---|---|
| Reconnaître | `howToRecognize[]` |
| Confirmer | `confirmationZone` |
| Invalider | `invalidation` |
| Erreur fréquente | `commonMistakes[0]` |
| Faux signal | `falseSignals[0]` |
| Limite | `interpretationLimits[0]` |

- **Aucun contenu fabriqué** : le dos de chaque carte cite mot pour mot un champ de la fiche (le
  test le vérifie champ par champ). Une fiche sans invalidation documentée ne produit **pas** de
  carte d'invalidation — l'honnêteté du modèle prime sur le volume.
- **La carte rédigée prime** : un doublon dérivé (même question) est écarté.
- **Provenance tracée** : chaque carte du deck porte `origin: 'redigee' | 'derivee'` et, pour les
  dérivées, son `angle` — la profondeur est donc lisible et vérifiable, jamais déguisée.
- **Réviser une facette précise** : l'écran du deck expose un filtre par angle (Reconnaître,
  Confirmer, Invalider, Erreur, Faux signal, Limite) et un filtre Mini-quiz.
- **Virtualisation** : le deck ayant été multiplié, l'écran passe de `map` intégral à une
  `FlatList` virtualisée (`Screen scroll={false}`, `initialNumToRender` 8) — aucune régression de
  performance sur mobile ni sur le web.

## Tests (exécutés)
- `derivedRevision.test.ts` (7) : contenu réellement cité (aucun texte inventé), aucune carte vide,
  pas de carte fabriquée sur un champ absent, priorité de la carte rédigée, profondeur effective du
  deck, vocabulaire interdit absent, déterminisme de l'ordre.
- `revisionDeck.integration.test.tsx` (5) : écran de production — profondeur rendue, filtre par
  angle exact avec compte accessible, filtre Mini-quiz, zéro emoji / valeur invalide / vocabulaire
  interdit, traçabilité du concept d'origine sur chaque carte.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout (exit vérifié).

## Portée
Aucun concept ajouté, aucun compteur de corpus gonflé (le nombre de concepts est inchangé), aucune
dépendance, aucune migration persistante. Les statuts éditoriaux (`needsReview`) sont intacts : les
cartes dérivées héritent du statut de leur fiche puisqu'elles en citent le contenu.
