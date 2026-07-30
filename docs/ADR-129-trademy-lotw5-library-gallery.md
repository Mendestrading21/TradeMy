# ADR-129 — LOT W5 : bibliothèque-galerie (Visual Max 2)

- **Statut** : accepté (priorité propriétaire du 30/07/2026 : « développe au max plus
  d'illustrations » — clôture du programme Visual Max 2, suite d'ADR-128).
- **Contexte** : la bibliothèque (`(tabs)/apprendre`) listait les 67 concepts en cartes
  purement textuelles (titre, famille, définition, niveau) alors que CHAQUE concept du corpus
  porte un `visualSpec` rendu partout ailleurs (fiche, leçons, quiz). L'écran de référence
  était le dernier sans signal visuel.

## Décision
La bibliothèque devient une **galerie** : chaque carte concept embarque la vignette compacte
de sa figure (`MiniVisual`, moteur SVG canonique, largeur 96) dans une rangée
[vignette, textes], AVANT la définition — on reconnaît la figure d'un coup d'œil avant de lire.

- **Décorative par construction** : la vignette vit dans le bloc déjà masqué aux lecteurs
  d'écran (`accessibilityElementsHidden`) — le nom accessible de la carte (titre, famille,
  durée, niveau) est INCHANGÉ, aucun élément accessible ajouté.
- **Repli texte garanti** : un concept sans `visualSpec` rendrait la carte textuelle
  d'origine (garde d'avenir — le corpus actuel est illustré à 100 %, verrouillé par test).
- **Virtualisation intacte** : le `FlatList` (initialNumToRender 12, windowSize 8,
  removeClippedSubviews) n'est pas modifié ; la vignette réutilise les datasets déterministes
  du moteur visuel, sans nouvel état ni nouvelle dépendance.

## Tests (exécutés)
- `bibliotheque.integration.test.tsx` (écran de production monté dans le vrai
  `ProgressProvider`) : une vignette `MiniVisual` par carte, corpus entièrement illustré
  (67/67), nom accessible inchangé, aucun emoji ni valeur invalide ; les 11 verrous
  existants (recherche, collections, 5 états stricts, non-mutation, routes) inchangés.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout (exit vérifié).

## Portée
Présentation uniquement : aucune donnée, aucun moteur, aucune navigation, aucune dépendance
modifiés. Clôt le programme Visual Max 2 (W1 leçons → W2 fiches → W3 mascottes → W4 registre
→ W5 galerie).
