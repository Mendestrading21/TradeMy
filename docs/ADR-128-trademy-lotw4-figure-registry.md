# ADR-128 — LOT W4 : registre canonique des figures mascottes (Visual Max 2)

- **Statut** : accepté (priorité propriétaire du 30/07/2026 : « infrastructure, images mieux
  organisées » — suite d'ADR-127).
- **Contexte** : les 8 renders 3D officiels étaient référencés par un simple mapping de fichiers
  (`assets.ts`), leurs dimensions natives dupliquées dans le cadrage tête (`HEAD_CROP`), et
  aucun endroit ne documentait QUI est sur chaque render, son humeur ni où il « cadre ».

## Décision
**`src/characters/figureRegistry.ts`** devient la source UNIQUE d'organisation des images
mascottes : pour chaque render — fichier, personnage (`toto`/`bobo`/`duo`), humeur, usage
recommandé (doc vivante) et **dimensions natives épinglées**.

- **Une seule vérité de dimensions** : `MascotAvatar` dérive désormais le ratio du registre
  (`HEAD_CROP` ne porte plus que `cx`/`cy`/`zoom` — la duplication `iw`/`ih` est supprimée).
- **Verrou sur la réalité du dépôt** (`figureRegistry.test.ts`) : chaque fichier existe, sa
  signature PNG est authentique, et son en-tête IHDR porte EXACTEMENT les dimensions épinglées —
  redimensionner un PNG sans passer par le registre casse la CI (règle canon : ne jamais
  redimensionner les renders).
- **Exhaustivité au compilateur** : le registre couvre exactement les clés d'`IMAGES` (aucun
  render orphelin, aucune entrée fantôme) ; chaque entrée est documentée (humeur + usage non
  vides, personnage cohérent avec le nom du fichier).

## Tests (exécutés)
- `figureRegistry.test.ts` : couverture exacte des 8 assets, IHDR réel == registre, signature
  PNG authentique, documentation complète.
- `mascotAvatar.test` + `session.integration` (écran réel) : cadrage inchangé après dérivation.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout (exit vérifié).

## Portée
Aucune dépendance, aucun asset modifié, aucun changement visuel — pure infrastructure.
