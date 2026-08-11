# ADR-135 — LOT M1 : Toto et Bobo habitent l'écran (présence et volume)

- **Statut** : accepté (priorité propriétaire du 11/08/2026 : « améliore Toto et Bobo au max, plus
  développés, plus en 3D, plus réels, qu'ils bougent vraiment »).
- **Contexte** : les guides sont des **rendus 3D fixes** (ADR-116 : renders + motion, jamais de 3D
  temps réel ; les PNG ne sont jamais redimensionnés). Leur animation se limitait à un pop bref au
  changement d'état et à un flottement vertical identique pour les deux personnages. Résultat : des
  images posées sur le fond, sans volume ni ancrage — l'effet « autocollant ».

## Décision
La présence naît du **mouvement**, en quatre gestes coordonnés, tous dérivés d'un noyau **pur et
testable** (`motionPlan.ts`) :

1. **Arrivée** — le guide s'approche (échelle de départ < 1 + montée + fondu) au lieu d'apparaître
   d'un coup. Ressort doux, sans rebond excessif.
2. **Respiration** — flottement au repos, **propre au tempérament canonique** : Toto, taureau
   enthousiaste, respire plus ample (4 pt) et plus vite (950 ms) ; Bobo, ours prudent, respire
   contenu (2,5 pt) et lent (1450 ms).
3. **Balancement** — micro-rotation en phase avec la respiration (1,6° pour Toto, 0,9° pour Bobo) :
   c'est elle qui **révèle le volume** d'un render fixe, sans jamais le déformer.
4. **Ombre au sol** — une ellipse douce qui **se resserre et s'éclaircit quand le guide monte**.
   C'est l'ancrage : le personnage occupe un espace au lieu de flotter sur le fond.

Le pop bref au changement d'état (dosé par l'intensité du registre d'états) est conservé, et la
respiration reste **réservée au repos** — aucune boucle décorative ailleurs.

## Ce qui n'a pas changé
- **Aucun nouvel asset**, aucun render modifié ou redimensionné : les 8 PNG officiels sont intacts.
- **Aucune 3D temps réel**, aucune dépendance ajoutée.
- **`prefers-reduced-motion` prioritaire** : rendu strictement statique, sans ombre animée, avec le
  même libellé accessible — vérifié pour **tous** les états et les deux personnages.
- L'API du contrôleur (`character`, `state`, `size`, `ring`) est inchangée : tous les écrans en
  héritent sans modification.
- L'ombre est un noir translucide, jamais une couleur sémantique (le verrou des couleurs est intact).

## Tests (exécutés)
- `mascotPresence.test.ts` (6) : le tempérament canon pilote réellement le mouvement (Toto plus
  ample et plus vif que Bobo), présence neutre pour un avatar sans personnage, bornes crédibles
  (rien qui saute, rien qui bascule, ombre douce), reduced-motion qui désactive **tout** sur tous
  les états et personnages, présence transmise à chaque état, respiration réservée au repos.
- Suite `src/characters` complète (79 tests) : verte, aucune régression.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout (exit vérifié).

## Reste ouvert
De **nouvelles poses 3D** (Toto qui pointe le graphique, Bobo qui lève la main) demandent une
production de renders côté propriétaire — le registre des figures (ADR-128) est prêt à les
accueillir. Ce lot tire tout ce qu'il est possible de tirer des 8 renders existants.
