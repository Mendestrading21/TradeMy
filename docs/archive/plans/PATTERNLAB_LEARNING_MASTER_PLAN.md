# PatternLab Learning Master — Audit & Plan des 14 lots

> **Document de trajectoire.** Sa baseline décrit le début du programme. Pour l’état et les compteurs
> actuels, utiliser `docs/CURRENT_STATE.md` et `src/data/repoTruth.ts`.

Skill : `patternlab-learning-master`. Programme d'**audit + consolidation** (pas une refonte
technique), initialement établi le 21 juillet 2026. Les lots déjà livrés sont consignés plus bas ;
ne jamais réexécuter une ancienne étape sans comparer le code à `docs/CURRENT_STATE.md`.

## Baseline — vérifiée par le code (pas recopiée d'un doc)

| Élément | Valeur (code) |
|---|---|
| Onglets visibles | 5 : Accueil · Parcours · **Labo** · **Révisions** · Profil (+ leçons/quiz masqués) |
| Concepts riches V5 | **58** (`learningContent.ts` 38 + `learningContentBatch.ts` 20) |
| Compétences runtime | **4** (actions, trend, candles, patterns) |
| Leçons / exercices (`seed.ts`) | **15** / **28** |
| Formats d'exercice | **16 déclarés** / **13 graders** enregistrés (incohérence) |
| Glossaire v1 | **24** termes |
| Badges | 23 |
| Gate | verte — compteurs désormais générés par `src/data/repoTruth.ts` (Lot 0) |

## Verdict de l'audit
Le socle est solide (stack moderne, moteurs purs testés, conformité éducative, visuels SVG
déterministes, a11y). Ce qu'il faut : **une seule trajectoire**, des **leçons réellement séquencées**,
des **mondes fondés sur la maîtrise** (pas la simple visite), une **bibliothèque transformée en
pratique**, et une **interface plus calme**. Plusieurs lots **retravaillent** ce que le programme
Experience Max a ajouté (c'est voulu : consolider, pas empiler).

## Problèmes structurants (P0 → P2) et où ils sont dans le code
- **P0 — Deux parcours concurrents** : `(tabs)/parcours.tsx` montre le trail 4-compétences **et** la
  carte des 15 mondes → deux modèles de progression sur une page.
- **P0 — 15 mondes = catalogue, pas parcours** : `worldPath.ts` débloque à la 1re visite, « terminé »
  = toutes les fiches vues → mesure la navigation, pas l'apprentissage.
- **P0 — Accueil dense** : mission + snapshot + concept du jour + révisions + quêtes + 6 tuiles
  Explorer + 2 mascottes + disclaimer.
- **P0 — Leçon non séquencée** : la phase `learn` de `session/[skillId].tsx` rend tous les steps sur
  un seul écran défilant.
- **P1** : écart contenu/parcours (58 concepts, 4 skills) · Dividende/PER passifs (glossaire seul) ·
  moteur d'exercices incohérent (16/13, `drag_drop`/`draw_level`/`timed` sans grader) · **fallback
  silencieux** session inconnue → `skill.actions` · progression gonflable (voir = exploré) · premium
  non vendable.
- **P2** : animations mascottes limitées + dialogues à 3–4 variantes génériques · doc `PROJECT_STATUS`
  qui garde de vieilles sections contradictoires.

---

## Plan des 14 lots (ordre du skill) — statut vs app actuelle

| # | Lot | Statut | Ce que ça change | Risque |
|---|---|---|---|---|
| 0 | **Vérité du dépôt** | 🟢 fait | Source unique `src/data/repoTruth.ts` (+ test de dérive) ; réconciliation des formats (16/13) ; fin du repli silencieux de session ; doc courante séparée de l'historique (`PROJECT_STATUS_ARCHIVE.md`). Voir **ADR-064**. | faible |
| 1 | **Navigation & accueil simplifiés** | 🟢 fait | 5 onglets **Accueil · Parcours · Apprendre · Réviser · Profil** ; hub **Apprendre** (`(tabs)/apprendre.tsx`) = biblio, glossaire, quiz visuel, quiz éclair, leçons, **Labo** ; accueil recentré (mission + progression compacte + révision due + concept du jour) ; Quêtes → Réussites. Voir **ADR-065**. | moyen (refonte tab bar + routes) |
| 2 | **Hiérarchie pédagogique unique** | 🟢 fait | Modèle pur unique `learningMap.ts` (Monde → Module → Compétence ; monde 1 = 4 skills + checkpoint) ; route **`/monde/[id]`** ; `parcours` = un seul chemin ; déblocage par **checkpoint** ; **aucune migration** (dérivé de l'état existant). Voir **ADR-066**. | élevé (modèle + migration) |
| 3 | **Session pas-à-pas** | 🟢 fait | Stepper **un step par écran** (progression, Retour, CTA unique) ; **reprise exacte** après fermeture (`sessionFlow`/`sessionResumeRepository`) ; **contre-exemple garanti** (`buildLearnSteps`) ; résultat de **maîtrise réelle** + prochaine révision. (Fallback silencieux : déjà réglé au Lot 0.) Voir **ADR-067**. | moyen |
| 4 | **Fondations interactives** | 🟢 fait | Dividende & PER en concepts riches + **nouveau visuel `mechanism`** (étapes fléchées) ; step visuel + 2 exercices dans le monde 1 (agrégés au checkpoint) ; concepts 58→60, visuels 10→11. Voir **ADR-068**. | faible-moyen |
| 5 | **Graphique canonique** | 🟢 fait | Vocabulaire unique des 4 modes (`chartMode.ts`) ; **axe des prix** + **légende** hausse/baisse sur les fiches (`VisualCard`) ; robustesse vide/plat/extrême verrouillée par test. (S'appuie sur grille/volume/replay/mode aveugle existants.) Voir **ADR-069**. | moyen |
| 6 | **Indicateurs** | 🟢 fait | `indicatorLab.ts` (RSI/MM/Bollinger paramétrables + faux signaux) ; section « Labs d'indicateurs » au Laboratoire (sélecteurs → `IndicatorPanel` recomposé en direct). Quiz visuels indicateurs déjà présents. Voir **ADR-070**. | moyen |
| 7 | **Exercices adaptatifs** | 🟢 fait | `EXERCISE_FORMAT_REGISTRY` unique (exhaustif à la compilation) ; orphelins `drag_drop`/`draw_level`/`timed` retirés (13/13) ; **misconceptions typées** (`misconceptions.ts`) surfacées dans Réviser (« points faibles »). Réinsertion de base déjà présente. Voir **ADR-071**. | moyen |
| 8 | **Glossaire & bibliothèque premium** | 🟢 fait | `conceptMastery.ts` (statut Nouveau/Découvert/Maîtrisé sur la fiche) ; `searchFigures` + recherche dans la bibliothèque visuelle (cohérente avec le glossaire). Favoris/récents déjà là ; collections + comparaison côte à côte = extensions futures. Voir **ADR-072**. | faible-moyen |
| 9 | **Toto/Bobo V3** | 🟢 fait | `mascotMoment.ts` (`MascotMoment` + `mistakeMoment`) : erreur → Bobo pointe la misconception précise (Lot 7) ; inventaire d'assets + reduced motion documentés. Orchestration d'animation fine = extension future (rendu statique honnête). Voir **ADR-073**. | faible-moyen |
| 10 | **Contenu des 15 mondes** | 🟡 partiel (incrément 1) | **+7 concepts** équilibrant les mondes minces (60→67 vers 75), chacun sur un dataset réel + visuel + `needsReview` (ADR-074). Reste itératif : 75 puis 150, revue humaine + provenance. | moyen (volume éditorial) |
| 11 | **Progression, révision & rétention** | 🔴 à faire | États **Découvert/Pratiqué/Compris/Solide/Maîtrisé** ; révision au niveau concept ; célébrations de badges (toast/modale) ; stats 30 jours ; quêtes hors du CTA principal. | moyen |
| 12 | **Abonnement réel prêt à brancher** | 🟡 partiel | Une offre **Plus** ; abstraction **entitlement** ; états achat/restauration/offline/expiration. **Aucun achat réel sans tes comptes + autorisation.** | faible (sans achat réel) |
| 13 | **Release native** | 🔴 à faire — **action humaine** | VoiceOver/TalkBack ; NetInfo natif ; **build EAS signé** ; TestFlight/Play interne ; provider crash/analytics ; captures + fiches stores. **Nécessite tes comptes Apple/Google.** | externe |

Légende : 🔴 à faire · 🟡 partiel (socle existant à consolider) · 🟢 fait.

---

## Séquence recommandée
1. ~~**Lot 0 — Vérité du dépôt**~~ ✅ **fait** : source unique `repoTruth`, fin du repli silencieux,
   doc courante/historique séparées (ADR-064).
2. ~~**Lot 1 — Navigation & accueil**~~ ✅ **fait** : 5 onglets + hub Apprendre + accueil recentré
   (ADR-065).
3. ~~**Lot 2 — Hiérarchie unique**~~ ✅ **fait** : `learningMap` + route `/monde/[id]` + parcours
   unique, sans migration (ADR-066).
4. ~~**Lot 3 — Session pas-à-pas**~~ ✅ **fait** : stepper, reprise exacte, contre-exemple, maîtrise
   réelle (ADR-067).
5. ~~**Lot 4 — Fondations interactives**~~ ✅ **fait** : Dividende/PER en concepts riches + visuel
   `mechanism` + monde 1 (ADR-068).
6. ~~**Lot 5 — Graphique canonique**~~ ✅ **fait** : 4 modes unifiés + axe/légende + robustesse
   (ADR-069).
7. ~~**Lot 6 — Indicateurs**~~ ✅ **fait** : labs paramétrables RSI/MM/Bollinger + faux signaux
   (ADR-070).
8. ~~**Lot 7 — Exercices adaptatifs**~~ ✅ **fait** : registre unique + orphelins retirés +
   misconceptions typées (ADR-071).
9. ~~**Lot 8 — Glossaire & bibliothèque premium**~~ ✅ **fait** : statut d'apprentissage sur les
   fiches + recherche dans la bibliothèque (ADR-072).
10. ~~**Lot 9 — Toto/Bobo V3**~~ ✅ **fait** : `mascotMoment` + dialogues liés aux erreurs (ADR-073).
11. **Lot 10 — Contenu des 15 mondes** *(prochain)* : atteindre 75 puis 150 concepts jouables reliés à
    leçon + pratique + révision. Puis Lot 11 ; Lot 12 (entitlement, sans achat) ; Lot 13 avec tes
    comptes.

## Méthode par lot (rappel skill)
Logique pure + tests d'abord → migration non destructive si le modèle change → données, moteurs,
écrans → gate complète (`lint · typecheck · test · validate:content · release:check · build:web`) →
pilotage réel 320/390/430 px + console + clavier → doc à jour → **publication live sur ton accord**.
Rapport factuel (testé vs parcouru vs déclaré), jamais un test/appareil non exécuté.
