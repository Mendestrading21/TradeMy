# ADR-126 — LOT W2 : fiches illustrées — Lecture guidée & Comparer (Visual Max 2)

- **Statut** : accepté (priorité propriétaire du 30/07/2026 — suite d'ADR-125).
- **Contexte** : les 36 `chartExamples` du corpus (légende + direction) n'étaient **rendus nulle
  part**, et **12 d'entre eux** référençaient des clés de dataset `chart.*.v1` **pendantes**
  (jamais câblées — dette héritée des premiers batches éditoriaux). Le registre de comparaisons
  (`COMPARISONS`, 4 paires) n'était visible que dans la bibliothèque visuelle.

## Décisions
1. **Réparation des 12 clés pendantes** : chaque `chartExamples.datasetKey` mort est remappé vers
   le **dataset réel** de la fiche (ex. `chart.doji.v1` → `candle.doji.v1`) — légendes intactes,
   statuts éditoriaux inchangés. Un **garde-fou global** interdit désormais toute clé d'exemple
   qui ne résout pas (`conceptExamples.test.ts`).
2. **« Lecture guidée »** : sous le Visuel de la fiche, la légende de l'exemple annoté s'affiche
   avec la direction du scénario ÉDUCATIF (icône `market-up`/`market-down`, couleurs sémantiques
   marché, libellés « setup haussier/baissier » du canon) — **36 fiches** gagnent une lecture
   commentée de leur graphique.
3. **« Comparer »** : nouveau registre explicite `COMPARISON_BY_CONCEPT` (6 concepts → 4 paires
   existantes : anatomie ↔ bull-vs-bear, doji/marubozu ↔ doji-vs-marubozu, uptrend/downtrend ↔
   uptrend-vs-downtrend, range ↔ trend-vs-range). Les fiches mappées rendent la paire côte à
   côte via le moteur canonique (`VisualCard` type `comparison`) — comprendre par CONTRASTE.
   Mapping minimal et manuel — jamais dérivé automatiquement.

## Tests (exécutés)
- `conceptExamples.test.ts` : zéro clé pendante (les 67 fiches), ≥ 36 fiches illustrées d'un
  exemple, légendes non vides, mapping comparaisons valide (concept réel + paire réelle + datasets
  résolus), garde vocabulaire sur toutes les légendes.
- `concept.integration` (écran réel) : « Lecture guidée » + légende + icône sémantique rendues ;
  fiche doji = 2 VisualCard (Visuel + Comparer) ; fiche non mappée = 1 seule (aucun bruit).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.

## Portée
Aucune dépendance, aucune migration, statuts `needsReview` inchangés, visuels 100 % originaux.
