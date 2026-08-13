# Trademy — état de préparation

Chiffres et vérifications **mesurés sur `main`**. Ce document ne recopie aucun compteur de corpus :
chacun vient de `src/data/repoTruth.ts`. Les résultats de commande sont datés par le lot qui les a
produits, jamais par une valeur historique reprise.

## Le web est en ligne

**https://mendestrading21.github.io/TradeMy/** — publié par `deploy.yml`, qui rejoue la gate
complète avant chaque publication. Gratuit, sans compte, sans donnée de paiement.

## Ce qui a été vérifié dans un vrai navigateur

Passe de bout en bout sur **l'artefact exactement déployé** (`dist/`, servi sous `/TradeMy/`), dans
Chromium, à 390 × 844 — pas un rendu de test, le bundle web de production.

| Vérification | Résultat |
|---|---|
| Accueil, onboarding complet (7 étapes) | passe, et débouche sur la première session |
| Les 5 espaces + les 3 écrans hors barre | tous rendus |
| Une session entière | **40 interactions enchaînées, 0 erreur** |
| 9 écrans secondaires (glossaire, stats, deck, réussites, légal…) | tous rendus |
| Fiches concept + graphiques | rendus, bandeau « À relire » visible |
| Monde verrouillé | raison **et** prochaine action affichées |
| URL inconnue | 404 canonique en français |
| « Réduire les animations » | l'app reste utilisable |
| 320 px | aucun débordement horizontal |
| Zoom web (WCAG 1.4.4) | autorisé |
| Coupure réseau | aucune erreur |
| **Erreurs console · exceptions · requêtes en échec** | **0 · 0 · 0** |

Un seul vrai défaut est sorti de cette passe : le premier écran de l'onboarding affichait le nom du
dépôt à la place de la marque. Corrigé, et verrouillé par `runtimeBrandName`.

## Ce qui a été vérifié par la gate

| Vérification | Résultat |
|---|---|
| `npm run check` | **verte** — lint 0 erreur, typecheck, tests, validation de contenu, contrôle de release |
| Export web | 74 pages concept, 24 pages glossaire, toutes les références vérifiées sous `/TradeMy/` |
| Bundle natif Android · iOS | **succès** sur les deux |
| Fuite du chemin web dans le natif (ADR-146) | **zéro occurrence** de `TradeMy/assets` |
| `expo-doctor` | **18/20** — les 2 échecs sont des appels réseau bloqués par l'environnement |
| CI GitHub Actions | verte sur chaque PR fusionnée |

## Le corpus

Les compteurs exacts se lisent dans `repoTruth.ts`. Ce qui compte ici, ce sont les **invariants** :

- **15 mondes, 15 modules guidés** — aucun monde ne se termine par la seule lecture.
- **Chaque objectif exercé est un objectif documenté** par sa fiche, et réciproquement.
- **13 formats d'exercice déclarés, 13 branchés** — aucun format mort.
- **Indicateurs : 13 variantes enseignées sur 15**, les 2 restantes refusées **avec leur raison**,
  vérifié par `indicatorCoverage.test.ts` (ADR-157).
- **3 fiches consultables sans compétence propre**, assumées et expliquées (ADR-152).

## Poids mesuré

| | Android | iOS |
|---|---|---|
| Bundle total | 12 Mo | 10 Mo |
| dont bytecode JS | 5,5 Mo | — |
| dont assets | 5,5 Mo | — |

Sur les assets, **4,4 Mo sont les huit rendus 3D des mascottes**, en une seule densité. L'icône de
l'app pèse 736 Ko et l'écran de démarrage 332 Ko.

## Ce qui reste, et qui n'appartient qu'au propriétaire

**1. Faire tourner l'app sur un téléphone.** Aucun appareil réel dans l'environnement de
développement : la fluidité, le geste au doigt, l'ouverture du clavier et la mémoire n'ont jamais
été observés. Le web prouve la logique, pas le toucher. Procédure :
`LANCER_SUR_ANDROID.md` — cinq minutes, aucun compte requis.

**2. Le compte Apple Developer.** Le socle d'abonnement est un modèle local testé, sans SDK de
paiement (ADR-138). Tout ce qui se prépare sans le compte est prêt : voir `APP_STORE_KIT.md`.

| Plan | Identifiant |
|---|---|
| Mensuel | `com.trademy.app.sub.monthly` |
| Annuel | `com.trademy.app.sub.annual` |
| Accès définitif | `com.trademy.app.lifetime` |

Le bundle identifier est **`com.trademy.app`**, verrouillé par test contre `app.json` sur les deux
plateformes (ADR-147). Il ne pourra plus changer une fois la fiche créée.

**3. La relecture éditoriale.** Toutes les fiches portent `status: needsReview`, et l'affichent à
l'écran. Ce statut ne peut pas être levé par la machine qui a écrit le contenu : s'auto-valider
détruirait le signal.

**4. Deux décisions de produit.**
- Le poids des mascottes (4,4 Mo) — à trancher après avoir vu l'app sur un vrai appareil.
- Ce qui devient payant. Le canon pose que le cœur pédagogique reste gratuit ; le périmètre exact
  de l'abonnement n'est pas décidé.

**5. Le ménage des branches distantes.** 71 branches fusionnées subsistent. La suppression est
refusée depuis l'environnement de développement (HTTP 403 du proxy) ; elle se fait en local :

```bash
git fetch --prune origin
for b in $(git branch -r --format='%(refname:short)' | grep -v 'HEAD\|origin/main' | sed 's|origin/||'); do
  git push origin --delete "$b"
done
```

## Ce que « prêt » ne veut pas dire

Aucune de ces vérifications ne remplace un utilisateur réel devant l'écran. Ce document dit ce qui a
été mesuré et par quel moyen — il ne dit pas que l'application est bonne. Ça, seul l'usage le dira.
