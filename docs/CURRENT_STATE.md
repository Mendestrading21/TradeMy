# État courant de Trademy

**Dépôt :** `Mendestrading21/TradeMy` · **Marque publique :** Trademy · **Base :** `main`

Ce document décrit **ce qu'est l'application aujourd'hui**, et où lire le reste. Il ne raconte pas
l'histoire des lots : c'est le rôle de `DECISIONS_INDEX.md` (une ligne par décision, du plus récent
au plus ancien) et de `PROJECT_STATUS_ARCHIVE.md` (journal chronologique).

Il ne recopie aucun compteur non plus. Les nombres du corpus se lisent dans `src/data/repoTruth.ts`,
contrôlé par son test ; les vérifications mesurées, avec la commande qui les produit, dans
`ETAT_DE_PREPARATION.md`.

## Ce que fait l'application

Trademy apprend à **lire un graphique de marché**, en quelques minutes par jour. Rien n'y est un
conseil : ni ordre, ni signal personnalisé, ni portefeuille réel, ni promesse de gain.

Le parcours est une hiérarchie unique, et une seule :

```text
Parcours → Monde → Module guidé → Compétence → (concepts · leçon · pratique · checkpoint · révision)
```

**Les quinze mondes sont guidés.** Aucun n'est resté une simple collection de fiches à lire : chacun
se termine par un checkpoint qui demande une preuve, jamais par la seule consultation. Une visite ne
vaut pas une maîtrise — celle-ci se mesure **par cible** (`conceptId` + `objectiveId`) et exige la
couverture des objectifs exerçables du concept.

Cinq onglets : Accueil, Apprendre, Bibliothèque, Laboratoire, Profil. Toute la progression est
**locale** : aucun compte, aucun serveur, aucune synchronisation.

## Les invariants que le dépôt fait respecter par des tests

Ce sont les règles qui ont coûté le plus cher à établir, et que la gate empêche de perdre.

| Invariant | Ce qu'il interdit |
|---|---|
| **Une seule vérité par item** (`LearningScenario`) | Un graphique qui montrerait autre chose que la question, le feedback ou le texte lecteur d'écran |
| **Objectifs dérivés des champs du concept** | Exercer un objectif que la fiche ne documente pas — et laisser un objectif documenté sans exercice |
| **Le côté de l'invalidation suit la direction** | Poser un plancher sous un setup baissier (et inversement) |
| **Une figure sans direction n'a pas de côté** | Inventer une invalidation à une figure neutre |
| **Couleurs sémantiques** | Vert/rouge ailleurs que la direction du marché ; feedback pédagogique confondu avec le marché |
| **Zéro emoji rendu** | Un pictogramme système là où l'iconographie Trademy doit être originale |
| **Vocabulaire éducatif** | BUY/SELL, promesse de gain, signal présenté comme sûr |
| **Compteurs dérivés** | Un nombre écrit à la main dans la documentation |
| **Zoom web** | Un `viewport` qui bloque l'agrandissement (WCAG 1.4.4) |

Un lot qui a besoin de changer l'un de ces verrous le change **explicitement**, avec son ADR. Aucun
n'est affaibli en silence pour faire passer un test.

## Le contenu, et son statut

Le corpus est **entièrement en relecture** : chaque fiche porte `status: needsReview` et l'affiche à
l'écran. Ce statut ne peut pas être levé par la machine qui a écrit le contenu — s'auto-valider
détruirait le signal. C'est la première chose qui attend une décision humaine.

Chaque concept porte durée, dialogue Toto/Bobo, visuel déterministe, exemple, contre-exemple, faux
signal, flashcards, mini-quiz, relations et sources. Le flux éditorial ne se contourne pas :

```text
source revue → brouillon JSON needsReview → validation schéma/vocabulaire → revue humaine
→ intégration dans V5_CONCEPTS → rendu et tests
```

## Programmes de contenu — où en est-on

- **Série C — la dette du corpus** : terminée. Elle a soldé les fiches enseignées mais jamais
  entraînées. Elle s'arrête à **trois** fiches de bibliothèque assumées, et non à zéro : les forcer
  aurait produit des transpositions mécaniques (ADR-152).
- **Série G — les capacités que rien n'enseigne** : ouverte. Le moteur sait dessiner des variantes
  d'indicateur qu'aucune fiche ne nomme. Le LOT G1 en a repris trois (moyenne mobile et ses deux
  croisements) ; les autres suivront un sujet à la fois (ADR-154).

## Ce qui est bloqué, et sur qui

Rien de ce qui suit n'est un défaut du code. Ce sont des décisions ou des comptes qui
n'appartiennent qu'au propriétaire.

1. **Faire tourner l'app sur un téléphone.** Aucun appareil réel dans l'environnement de
   développement : la fluidité, le geste au doigt, l'ouverture du clavier et la mémoire n'ont jamais
   été observés. Procédure : `LANCER_SUR_ANDROID.md` — cinq minutes, aucun compte.
2. **Le compte Apple Developer.** Le socle d'abonnement est un modèle local testé, sans SDK de
   paiement (ADR-138) ; le bundle identifier `com.trademy.app` est verrouillé par test (ADR-147).
3. **La relecture éditoriale** des fiches `needsReview`.
4. **Deux décisions produit** : le poids des mascottes, et le périmètre exact de ce qui devient
   payant — le canon posant que le cœur pédagogique reste gratuit.

## Gate canonique

```bash
npm ci
npm run check   # lint · typecheck · tests · validate:content · release:check · build:web
```

Le résultat exact appartient au rapport du commit ou de la pull request, jamais à une valeur
historique recopiée ici. La CI rejoue la même gate sur chaque pull request vers `main`, et le
déploiement la rejoue encore avant de publier.

## Limites connues

- **Un seul thème**, sombre. Il porte l'identité de la marque ; le thème clair est prévu et
  différé — `src/design-system/theme.ts` renvoie ici, et c'est cette ligne qui fait foi.
- Les fichiers retirés de la branche restent dans l'historique Git public. Une purge serait une
  opération séparée, destructive et soumise à validation explicite.
- Les builds natifs signés exigent les comptes Apple et Google du propriétaire.
- `npm audit` ne remonte plus de vulnérabilité haute ou critique. Les alertes modérées restantes
  sont transitives dans la chaîne Expo ; la correction automatique rétrograderait le SDK et ne doit
  pas être appliquée avec `--force`.
