# Trademy — état de préparation

Chiffres et vérifications **mesurés sur `main`** après la série C. Ce document ne recopie aucun
compteur : chacun vient de `src/data/repoTruth.ts` ou d'une commande dont la sortie est citée.

## Ce qui est prêt, et vérifié ici

| Vérification | Résultat |
|---|---|
| Gate canonique `npm run check` | **verte** — lint 0 erreur, typecheck, **1642 tests**, validation de contenu, contrôle de release |
| Export web | **300 pages HTML**, 2175 références vérifiées sous `/TradeMy/` |
| Bundle natif Android | **succès**, 1973 modules |
| Bundle natif iOS | **succès**, 1881 modules |
| Fuite du chemin web dans le natif (ADR-146) | **zéro occurrence** de `TradeMy/assets` sur les deux plateformes |
| `expo-doctor` | **18/20** — les 2 échecs sont des appels réseau bloqués par l'environnement, pas des défauts du projet |
| CI GitHub Actions | verte sur chaque PR fusionnée |

## Le corpus, tel qu'il est

| | |
|---|---|
| Concepts riches | **67** |
| Compétences | **67** |
| Leçons | **78** |
| Exercices | **336** |
| Mondes | **15**, chacun avec son module guidé et son checkpoint propre |
| Formats d'exercice | **13 déclarés, 13 branchés** — aucun format mort |
| Termes de glossaire · badges | 24 · 23 |

**Fiches consultables sans compétence propre : 3** (étoile du soir, trois corbeaux, cassure-retest).
Elles sont enseignées mais pas entraînées pour elles-mêmes, et l'ADR-152 dit pourquoi ce n'est pas
zéro : trois fiches assumées valent mieux qu'un compteur à zéro obtenu par des leçons redondantes.

## Poids mesuré

| | Android | iOS |
|---|---|---|
| Bundle total | 12 Mo | 10 Mo |
| dont bytecode JS | 5,5 Mo | — |
| dont assets | 5,5 Mo | — |

Sur les assets, **4,4 Mo sont les huit rendus 3D des mascottes**, en une seule densité. L'icône de
l'app pèse 736 Ko et l'écran de démarrage 332 Ko.

## Ce qui reste, et qui n'appartient qu'au propriétaire

**1. Faire tourner l'app sur un téléphone.** Aucun appareil réel n'existe dans l'environnement de
développement. Rien de ce qui touche à la fluidité, au geste au doigt, à l'ouverture du clavier ou à
la mémoire n'a pu être vérifié. Procédure : `docs/LANCER_SUR_ANDROID.md` — cinq minutes, aucun
compte requis.

**2. Le compte Apple Developer.** Le socle d'abonnement est un modèle local, testé, sans SDK de
paiement (ADR-138). Il attend un magasin réel. Les produits à créer :

| Plan | Identifiant |
|---|---|
| Mensuel | `com.trademy.app.sub.monthly` |
| Annuel | `com.trademy.app.sub.annual` |
| Accès définitif | `com.trademy.app.lifetime` |

Le bundle identifier est **`com.trademy.app`**, verrouillé par test contre `app.json` sur les deux
plateformes (ADR-147). Il ne pourra plus changer une fois la fiche créée.

**3. La relecture éditoriale.** Les 67 fiches portent `status: needsReview`. Ce statut ne peut pas
être levé par la machine qui a écrit le contenu : s'auto-valider détruirait le signal.

**4. Deux décisions de produit ouvertes.**
- Le poids des mascottes (4,4 Mo) : à trancher après avoir vu l'app démarrer sur un vrai appareil.
- Ce qui devient payant. Le canon pose que le cœur pédagogique reste gratuit ; le périmètre exact de
  l'abonnement n'est pas décidé.

## Ce que « prêt » ne veut pas dire

Aucune de ces vérifications ne remplace un utilisateur réel devant l'écran. Ce document dit ce qui a
été mesuré et par quelle commande — il ne dit pas que l'application est bonne. Ça, seul l'usage le
dira.
