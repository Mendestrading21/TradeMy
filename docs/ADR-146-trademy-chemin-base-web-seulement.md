# ADR-146 — Le chemin de base est une affaire de web, pas d'application

- **Statut** : accepté.
- **Contexte** : première mise en bundle de l'application pour iOS et Android. Jusqu'ici, tout avait
  été validé par des tests Node et un export **web** — le graphe de modules natif n'avait jamais été
  résolu.

## Ce que le premier bundle natif a révélé

`app.config.ts` posait `experiments.baseUrl = '/TradeMy'` — le sous-chemin GitHub Pages — **sans
condition de plateforme**. L'export iOS l'annonçait d'ailleurs dans son journal :
« Using (experimental) base path: /TradeMy ».

Vérification faite dans le bytecode Hermes du bundle iOS, la chaîne y était bien présente :

```
^https?:\/\/.*?\/TradeMy/assets/
```

C'est un motif de **résolution d'URL d'assets**. Un chemin de déploiement web n'a rien à faire dans
une application native : selon le mode de chargement (client de développement, mise à jour à
distance), il peut orienter la résolution des ressources vers un préfixe qui n'existe pas côté
appareil.

## Décision

Le chemin de base n'est plus posé que pour l'**export web**, par un seul endroit :
`scripts/export-web.mjs`, appelé par `npm run build:web`. Il fixe `TRADEMY_WEB_BASE_PATH=1` ;
`app.config.ts` ne renseigne `baseUrl` que si ce drapeau est présent.

Conséquence : tout build natif, tout `expo start`, tout `eas build` obtient une configuration **sans
chemin de base**, ce qui est le comportement correct.

Le passage par un script Node plutôt que par une variable d'environnement en ligne dans
`package.json` garde la commande valable sur Windows comme sur Unix, **sans ajouter la moindre
dépendance**.

## Preuve, des deux côtés

- **Natif** : le bundle Android régénéré après correction ne contient plus aucune occurrence de
  `TradeMy/assets` dans son bytecode — 1 occurrence avant, 0 après.
- **Web** : la gate complète reste verte, avec **278 pages HTML et 2021 références vérifiées sous
  `/TradeMy/`**. Le déploiement GitHub Pages est donc intact, ce qui était la seule chose à ne pas
  casser.

## Pourquoi maintenant, et pas plus tôt

Ce défaut avait été constaté et **documenté sans être corrigé** : l'impact côté natif était
invérifiable ici (aucun appareil), et modifier une configuration de déploiement qui fonctionne sur
la foi d'une hypothèse aurait été un mauvais échange.

Ce qui a changé : le propriétaire s'apprête à lancer l'application sur un téléphone. Le risque cesse
d'être théorique, et la correction est désormais **prouvée sans effet de bord** du côté vérifiable —
le web. C'est ce qui la rend légitime aujourd'hui alors qu'elle ne l'était pas hier.

## Ce qui n'a pas changé

`config/deployment.json` reste la source unique du chemin et de l'URL publique ; `extra.deployment`
continue de les exposer à l'application. Aucune dépendance, aucune migration, aucun contenu touché.
