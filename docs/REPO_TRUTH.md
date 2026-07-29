# Vérité du dépôt (compteurs générés)

Source unique : **`src/data/repoTruth.ts`** — tous les compteurs sont **dérivés des registres du
code** (jamais recopiés d'un document). Garantis par **`src/data/repoTruth.test.ts`** :

- cohérence : chaque compteur == longueur du registre correspondant ;
- unicité : aucun doublon d'id/slug (concepts, compétences, badges, glossaire, mondes, catégories,
  types de visuels) ;
- réconciliation des formats d'exercice : déclarés vs branchés, écart nommé explicitement ;
- intégrité : chaque compétence a leçon + exercices ; chaque lien `CONCEPT_BY_SKILL` résout ;
- pins structurels : compétences, mondes, catégories, types de visuels (leur évolution passe par
  un lot dédié, pas par une dérive silencieuse).

> **Règle de documentation.** Ne jamais écrire un compteur à la main dans la doc. Citer `repoTruth`
> (ou reprendre l'instantané ci-dessous, qui est régénéré à partir du module). Un contenu qui
> change fait évoluer le compteur automatiquement ; une incohérence casse la CI.

## Instantané courant

| Métrique | Registre (code) | Valeur |
|---|---|---|
| Concepts riches V5 | `V5_CONCEPTS` | 67 |
| Compétences (modules guidés) | `ALL_MODULE_SKILLS` | 15 |
| Leçons | `allLessonsFlat()` | 26 |
| Exercices | `allExercisesFlat()` | 74 |
| Termes de glossaire (v1) | `GLOSSARY_TERMS` | 24 |
| Badges | `BADGES` | 23 |
| Mondes | `WORLDS` | 15 |
| Catégories | `CATEGORIES` | 13 |
| Types de visuels rendables | `SUPPORTED_VISUAL_TYPES` | 11 |
| Formats d'exercice | `ALL_EXERCISE_TYPES` = `supportedTypes()` | 13 / 13 |

> Depuis le LOT 4-O, quatre modules guidés existent (Fondations + Chandeliers + Structure + Niveaux) :
> les compteurs compétences/leçons/exercices agrègent TOUS les modules via `CONTENT_MODULES` (source unique).

## Formats d'exercice — réconciliation

- **Déclarés** (`ALL_EXERCISE_TYPES`) : **13**.
- **Branchés** (`supportedTypes()`, un grader enregistré) : **13**.
- **En attente** : aucun.

Depuis le **Lot 7**, les trois formats orphelins (`drag_drop`, `draw_level`, `timed`) — déclarés sans
grader ni renderer — ont été **retirés** : déclarés === branchés. Le registre unique
**`EXERCISE_FORMAT_REGISTRY`** (`src/engines/exercise/formatRegistry.ts`) décrit chaque format
(libellé, interactif, a11y, statut) ; le type `Record<ExerciseType, …>` garantit l'exhaustivité à la
compilation.

## Obtenir les compteurs

```ts
import { REPO_TRUTH, repoTruthLines } from '@/data';

console.log(repoTruthLines().join('\n'));
```
