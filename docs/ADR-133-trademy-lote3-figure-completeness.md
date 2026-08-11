# ADR-133 — LOT E3 : toute fiche de figure dit ce qui la confirme et ce qui l'invalide

- **Statut** : accepté (priorité propriétaire du 02/08/2026 : « enrichis au maximum »).
- **Contexte** : mesure du corpus — **21 fiches sur 67 n'avaient aucune invalidation** et 9 aucune
  zone de confirmation. Or le canon Trademy est explicite : on enseigne « une condition, une
  preuve, une invalidation ». Une fiche qui décrit une figure sans dire ce qui la dément enseigne
  une forme sans son garde-fou.

## Décision
**Compléter les fiches de FIGURE réellement incomplètes — et seulement celles-là.**

L'analyse a séparé deux populations parmi les 21 fiches :

1. **Cinq fiches de figure incomplètes** — mèche de rejet, impulsion et correction, retest de
   niveau, distribution Wyckoff, faux breakout. Elles décrivent un setup lisible sur un graphique :
   leur silence était un vrai trou. Elles reçoivent **zone de confirmation, invalidation et
   scénario éducatif** (conditions + invalidation), au vocabulaire canon.
2. **Les autres sont des NOTIONS** — dividende, PER, unités de temps, échelle des prix, discipline,
   FOMO, indicateurs, volume, taille de position… Elles n'ont pas d'invalidation **par nature** :
   leur en inventer une serait enseigner du faux. Le dépôt tenait déjà cette position pour le doji
   (ADR-109) ; elle est ici généralisée et verrouillée par test.

**Règle canonique nouvelle** (`figureCompleteness.test.ts`) : toute fiche dont le visuel est de
type figure (`candlestick-pattern`, `chart-pattern`, `market-structure`) doit porter
`confirmationZone` **et** `invalidation`. Les cinq exceptions assumées (doji, FOMO, discipline,
price action, échelle des prix) sont **nommées avec leur justification** : elles empruntent un
visuel de figure pour illustrer une notion ou un comportement. Toute nouvelle exception devra être
justifiée au même endroit — c'est le prix à payer pour ne jamais fabriquer d'invalidation de
complaisance.

## Effet de levier
Compléter ces fiches enrichit **aussi la révision** : le moteur de cartes dérivées (ADR-132)
produit désormais, pour chacune, une carte « Confirmer » et une carte « Invalider » — la profondeur
gagnée est automatique et vérifiée par test.

## Tests (exécutés)
- `figureCompleteness.test.ts` (6) : périmètre réel des figures, complétude confirmation +
  invalidation, exceptions nommées et minoritaires, scénario éducatif cohérent sur les cinq fiches
  complétées, non-invention d'invalidation sur les notions, cartes de révision effectivement
  gagnées.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout (exit vérifié).

## Portée
Aucun concept ajouté (le corpus reste à 67), aucune dépendance, aucune migration. Les statuts
éditoriaux `needsReview` sont inchangés : le contenu ajouté reste soumis à relecture humaine.
