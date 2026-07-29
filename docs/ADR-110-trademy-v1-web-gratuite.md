# ADR-110 — v1 web gratuite : retrait du paywall démo et finitions de cohérence

- **Statut** : accepté (décision propriétaire du 29 juillet 2026 — publication web prioritaire,
  v1 entièrement gratuite).
- **Contexte** : l'audit produit complet du 29/07/2026 a confirmé que l'app est déployée en continu
  sur GitHub Pages et testable publiquement, mais que le « premium » affiché était une **simulation
  locale** (aucun achat réel, drapeau `demo`) qui verrouillait réellement deux fonctions
  (statistiques complètes, deck de révision). Afficher une offre payante non achetable dans une
  version publique de test serait malhonnête ; le canon exige zéro bouton mort et zéro état trompeur.

## Décision

1. **Tout est gratuit en v1.** Les deux gates réels sont retirés :
   - `/statistiques` montre l'historique d'activité, la maîtrise par compétence et les points
     faibles à tout le monde ;
   - `/revision-deck` (et sa carte dans Révisions) est ouvert à tout le monde.
2. **Aucun paywall affiché.** `/premium` devient un écran d'information « Accès libre » : Trademy
   est gratuit pendant la phase de test, rien n'est verrouillé, aucun prix ni bouton d'achat. La
   route est conservée (liens existants) ; la carte du Profil devient un rappel « ACCÈS LIBRE ».
3. **Le modèle pur `premium.ts` est conservé tel quel** (types, offres hypothétiques, migration,
   tests) : c'est une réserve documentée pour une éventuelle monétisation FUTURE, qui exigera une
   nouvelle décision documentée et une intégration d'achat réelle avant tout réaffichage.
4. **Zéro bouton mort** : le bouton désactivé « J'ai déjà un compte » (landing) est retiré ;
   les comptes restent une fonctionnalité P2 décrite dans le plan, pas un contrôle inerte.
5. **Cohérence visuelle des écrans secondaires** : les titres emoji restants (Leçons, Quiz,
   Glossaire, Réussites, Statistiques, Deck) passent au canon (texte propre + `TrademyIcon` là où
   l'icône porte du sens : série `flame`, badge verrouillé `lock`) ; `Statistiques` et `Réussites`
   gagnent un état de chargement (`StateView loading`), comme le Profil. Les emoji d'ŒUVRE
   (badges obtenus, icônes de quêtes définis comme données) sont conservés.
6. **Hygiène dépôt** : l'instantané `docs/REPO_TRUTH.md` est régénéré depuis `repoTruth.ts`
   (8 compétences / 19 leçons / 47 exercices — 2 modules guidés) ; la branche `gh-pages` héritée
   (déploiement manuel du 20/07) est supprimée, la source Pages étant le workflow Actions.

## Conséquences

- **+** La version publique de test ne montre plus rien de faux : aucun prix, aucun verrou, aucune
  promesse. Les testeurs accèdent à tout, ce qui maximise le retour d'usage.
- **+** `premium_gate_hit` / `paywall_viewed` ne sont plus émis (événements conservés dans le
  registre analytics pour l'historique du journal local).
- **−** Aucune monétisation en v1 (choix assumé). Réintroduire une offre exigera : décision
  documentée, achat réel (StoreKit / Play Billing), et conservation du cœur d'apprentissage gratuit.

## Portée

Aucune dépendance ajoutée ; aucune migration (le drapeau premium persisté reste lu/écrit tel quel
par le provider, simplement plus affiché). Moteurs, contenu pédagogique et progression inchangés.
