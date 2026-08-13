# Carte canonique du dépôt

Cette carte indique à Claude Code où lire et où écrire. Tout élément non listé doit être considéré
comme historique jusqu’à preuve du contraire.

| Zone | Rôle | Règle |
|---|---|---|
| `src/app/` | Routes et écrans Expo Router | UI active ; aucun bouton mort |
| `src/design-system/` | Tokens et primitives | Source visuelle avant toute couleur locale |
| `src/characters/` | Toto/Bobo et motion | Utiliser seulement les assets runtime documentés |
| `src/engines/` | Logique pure apprentissage/exercices/visuels | Tester avant câblage UI |
| `src/data/learningContent.ts` | Composition canonique du contenu rendu | `V5_CONCEPTS` alimente l’app |
| `src/data/seed.ts` | Registre canonique `CONTENT_MODULES` des modules guidés | Ajouter un module guidé = une entrée + son contenu |
| `src/data/pilotScenarios.ts`, `src/data/candleModuleScenarios.ts` | Sources de scénario uniques des modules guidés | Un item = un `LearningScenario` (visuel = réponse = feedback = a11y) |
| `src/data/repoTruth.ts` | Compteurs dérivés | Ne jamais recopier des nombres dans la doc |
| `content/drafts/` | File éditoriale JSON | `needsReview`, jamais publiée automatiquement |
| `content/published/` | Exemples/pipeline JSON historique | Pas le registre runtime actuel |
| `schemas/` | Contrats JSON | Versionner toute évolution éditoriale |
| `assets/brand/` | Source canonique de marque + manifeste | Toute icône part d’ici |
| `assets/characters/figures/` | Personnages optimisés utilisés par l’app | Conserver et optimiser sans changer le style |
| `assets/images/`, `public/` | Exports Expo/PWA | Générés/contrôlés, pas des moodboards |
| `config/deployment.json` | Chemin et URL publics | Unique vérité du déploiement GitHub Pages |
| `config/web-manifest.json` | Métadonnées PWA sans chemins | Combinées par `prepare:web` |
| `scripts/` | Pipelines reproductibles et contrôles | Aucun chemin absolu ni effet réseau implicite |
| `.claude/skills/patternlab-learning-master/` | Seul skill agent actif | Charger uniquement pour un lot produit |
| `docs/ADR-*.md` | Mémoire des décisions | Conserver ; la décision la plus récente prévaut |
| `docs/archive/` | Programmes, plans terminés et états historiques | Ne jamais traiter comme instructions actives |
| `docs/CURRENT_STATE.md` | État courant, unique | Aucun second document ne décrit « l'état » |
| `docs/ETAT_DE_PREPARATION.md` | Ce qui est vérifié vs ce qui appartient au propriétaire | Chaque chiffre cite la commande qui le produit |

## Ce qui a été retiré au grand ménage

Les **captures d'écran de développement** (12 dossiers `docs/*-captures/`, 122 fichiers, 22,6 Mo)
ont été supprimées : elles prouvaient le rendu d'écrans à une date donnée, et l'application a
changé depuis. La preuve vivante, ce sont les **tests d'intégration** qui montent les écrans réels.
Les **scripts qui les produisaient** (12 `capture-*.mjs`) sont partis avec elles, ainsi que deux
vérificateurs qu'aucune commande n'appelait et l'importeur `import-wmb`.

Cinq documents ont été supprimés pour **doublon**, chacun ayant une source canonique qui reste :
`PROJECT_STATUS.md` (→ `CURRENT_STATE.md`), `design/VISUAL_DIRECTION.md`
(→ `design/TRADEMY_LEARNING_GLASS.md`), `REPO_TRUTH.md` (→ `src/data/repoTruth.ts`),
`RELEASE_READINESS.md` (→ `RELEASE_CHECKLIST.md` + `ETAT_DE_PREPARATION.md`) et
`CONTENT_COVERAGE.md`, qui déclarait lui-même que ses nombres n'étaient plus une source de vérité.

Trois plans terminés ont été **archivés, pas supprimés** — l'historique se conserve :
`docs/archive/plans/`.

## Sources retirées de l’arbre courant

`APP-main.zip`, `Patern Images REF/`, `assets/characters/source/`, `assets/visual-references/` et les
scripts de préparation non reproductibles ne sont ni du code runtime ni des instructions Claude.
Ils sont récupérables depuis le commit de base `5f34d57` si une restauration ponctuelle est validée.

Ne pas les réintroduire. Une nouvelle source externe passe d’abord par une zone privée, une revue de
licence/confidentialité et une transformation vers un format original PatternLab.

## Flux de contenu

```text
source externe revue
→ brouillon JSON needsReview
→ validation schéma/vocabulaire/idempotence
→ revue humaine
→ intégration dans V5_CONCEPTS
→ rendu application et tests repoTruth
```

Aucun ZIP, script de seed, routeur DB, e-mail ou newsletter externe ne doit contourner ce flux.
