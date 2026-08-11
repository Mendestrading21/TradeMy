# ADR-134 — LOT E4 : une lecture guidée sur chaque fiche qui peut en avoir une

- **Statut** : accepté (priorité propriétaire du 02/08/2026 : « enrichis au maximum »).
- **Contexte** : le bloc « Lecture guidée » (ADR-126) n'apparaissait que sur les **36 fiches** dont
  l'exemple annoté était rédigé à la main (`chartExamples`). Les 31 autres affichaient leur visuel
  **sans un mot pour dire comment le lire** — alors que la fiche contient déjà, validée, la matière
  de cette lecture : son scénario éducatif ou sa zone de confirmation.

## Décision
`src/data/guidedReading.ts` (pur, testé) **dérive** la lecture guidée, selon un ordre de priorité
strict :

1. **L'exemple annoté RÉDIGÉ** — direction et légende écrites à la main : il fait foi ;
2. **le scénario éducatif** (haussier / baissier / neutre) — ses *conditions* SONT la lecture de la
   figure, et la direction vient du scénario retenu ;
3. **la zone de confirmation** seule — « ce qui valide la lecture », direction prise sur le visuel.

**Une fiche qui n'a rien de tout cela n'obtient PAS de lecture guidée.** Les notions pures
(dividende, PER, unités de temps, échelle des prix) n'affichent aucun bloc : on n'invente pas une
lecture de marché là où il n'y en a pas — même règle d'honnêteté qu'en ADR-133.

La couverture passe de **36 à plus de 60 fiches** sur 67, sans une ligne de contenu inventée. Le
verrou de couleurs sémantiques est intact : la direction continue de passer par `SCENARIO_META`
(source unique du sens marché sur la fiche), donc `bullish`/`bearish` restent réservés à ce bloc.

## Tests (exécutés)
- `guidedReading.test.ts` (6) : couverture réellement élargie, priorité de l'exemple rédigé,
  légende dérivée citant un champ réel (comparaison exacte, scénario et confirmation), cohérence de
  la direction avec sa source, absence de bloc sur les notions pures, légendes non vides,
  vocabulaire interdit absent, déterminisme.
- `concept.integration.test.tsx` (existant) : la fiche de production continue de rendre le bloc et
  ses assertions passent inchangées.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout (exit vérifié).

## Portée
Présentation et dérivation uniquement : aucun concept ajouté, aucun champ de données modifié,
aucune dépendance, aucune migration. Les statuts `needsReview` sont inchangés.
