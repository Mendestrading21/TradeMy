# ADR-153 — Le grand ménage : ce qui reste, ce qui part, et ce qui ne peut pas partir

- **Statut** : accepté (demande propriétaire : « trie tout, efface les vieux trucs, qu'il n'y ait
  plus aucun doublon »).
- **Contexte** : le dépôt a traversé une cinquantaine de lots. Avant publication, il fallait savoir
  ce qui y traîne encore.

## Ce que l'audit a mesuré

| Zone | Constat |
|---|---|
| **Code source** | **Sain.** Zéro fichier orphelin dans `src/` : chaque module est importé quelque part |
| **Captures d'écran** | **22,6 Mo, 122 fichiers, 12 dossiers** — 65 % du poids du dépôt |
| **Scripts** | 15 orphelins sur 24 : 12 `capture-*.mjs`, 2 vérificateurs jamais appelés, 1 importeur |
| **Documents** | 5 doublons, 3 plans terminés encore à la racine |
| **Branches distantes** | **77**, dont 71 dont la pull request est fusionnée |

Le désordre n'était pas dans le code. Il était dans ce qui l'entoure.

## Les captures : une preuve périmée

Douze dossiers `docs/*-captures/` contenaient les captures d'écran des LOTS 4-B à 4-M et de l'unité
pilote. Elles prouvaient qu'un écran s'affichait correctement **à une date donnée** — et
l'application a beaucoup changé depuis.

Une image ne se met pas à jour toute seule ; **un test d'intégration, si**. Et le dépôt en a :
les écrans réels sont montés et parcourus par les tests, à chaque exécution de la gate. La preuve
vivante a remplacé la preuve figée depuis longtemps ; il restait à retirer la seconde.

Les 12 scripts qui les produisaient partent avec elles, ainsi que
`verify-direct-links.mjs` (appelé seulement par un script de capture),
`verify-world-links.mjs` (appelé par personne) et `scripts/import-wmb/`.

## Les documents : cinq doublons, une source canonique chacun

| Supprimé | Pourquoi | Ce qui reste |
|---|---|---|
| `PROJECT_STATUS.md` | Deux documents s'annonçaient « état courant » | `CURRENT_STATE.md`, désigné par CLAUDE.md |
| `design/VISUAL_DIRECTION.md` | Se disait « direction visuelle canonique » alors que le canon nomme l'autre — et parlait encore de « PatternLab » | `design/TRADEMY_LEARNING_GLASS.md` |
| `REPO_TRUTH.md` | Un instantané Markdown de compteurs dérivables : exactement ce que CLAUDE.md interdit | `src/data/repoTruth.ts` |
| `RELEASE_READINESS.md` | Troisième document de préparation | `RELEASE_CHECKLIST.md` (la liste) + `ETAT_DE_PREPARATION.md` (la mesure) |
| `CONTENT_COVERAGE.md` | Déclarait lui-même que ses nombres n'étaient plus une source de vérité | `repoTruth.ts` + `LEARNING_CONTENT_ARCHITECTURE.md` |

Trois plans terminés — `PATTERNLAB_V5_MASTER_PLAN`, `PATTERNLAB_LEARNING_MASTER_PLAN`,
`design/LOT4_VISUAL_AUDIT` — sont **archivés sous `docs/archive/plans/`, pas supprimés**. Les deux
premiers déclaraient déjà « ce programme est terminé, ne pas utiliser comme instruction active » ;
il leur manquait seulement d'être rangés là où le canon range l'historique.

## Ce qui ne peut pas partir, et pourquoi

**Les 151 ADR restent.** CLAUDE.md l'interdit sans ambiguïté : « Ne pas effacer les ADR ni
l'historique. » Ce n'est pas une réserve de ma part, c'est la règle du dépôt — et elle est bonne :
un ADR explique *pourquoi* une décision a été prise, ce qu'aucun diff ne dit.

**Les ADR ne sont pas non plus réécrits.** Plusieurs mentionnent en texte les documents supprimés
ci-dessus. C'est correct : ils disent la vérité de leur époque. Le vérificateur de liens confirme
que **les 100 liens Markdown du dépôt résolvent tous** — aucune mention n'était un lien cassé.

`PROJECT_STATUS_ARCHIVE.md` reste également : c'est le journal chronologique, et
`DECISIONS_INDEX.md` y renvoie explicitement.

## Les branches : 71 supprimées, prouvées fusionnées

Le test naïf (`git diff main...branche`) ne prouve rien pour des branches **squash-fusionnées** :
la branche montre toujours son propre travail par rapport à sa base, même quand `main` le contient.

La preuve utilisée est donc l'autre : **l'API GitHub, qui donne un `merged_at` pour chacune des 72
pull requests**, de la #1 à la #72. Toutes fusionnées.

Cela corrige au passage une erreur que j'avais commise deux jours plus tôt : j'avais laissé
`cleanup/repository-foundation` de côté en la croyant non fusionnée, sur la foi d'un diff de 222
fichiers. C'était la PR #1, fusionnée le 22 juillet ; le diff ne reflétait que trois semaines de
`main` en plus.

`gh-pages` part aussi : le déploiement passe par `actions/deploy-pages@v4` (artefact), et aucun
workflow ne référence cette branche.

## Ce qui n'a PAS été fait, délibérément

**Aucune optimisation d'image.** Les 4,4 Mo de mascottes et les 736 Ko de l'icône restent tels
quels : le canon interdit de redimensionner les rendus, et recompresser une icône est une décision
visuelle qui appartient au propriétaire (cf. `ETAT_DE_PREPARATION.md`).

**Aucun changement de code applicatif.** L'audit a montré que `src/` est sain ; il n'y avait rien à
y nettoyer, et inventer un refactor n'aurait servi personne.

## Résultat

- Dépôt suivi par git : **35 Mo → 12 Mo**.
- Fichiers dans `docs/` : **344 → 222**.
- Scripts : **24 → 9**, tous appelés par `package.json`.
- Branches distantes : **77 → 2** (`main` et la branche de ce lot).
- Gate inchangée et verte : lint, typecheck, 1642 tests, 300 pages web.
