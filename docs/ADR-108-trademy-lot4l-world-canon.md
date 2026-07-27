# ADR-108 — LOT 4-L : fiche Monde canonique (`/monde/[id]`)

- **Statut** : proposé — LOT 4-L, onzième application de la fondation LOT 4-A (ADR-097), après les six
  écrans d'onglet (ADR-098 → ADR-103), le shell (ADR-104), l'onboarding (ADR-105), la fiche concept
  (ADR-106) et la robustesse des liens directs (ADR-107). Deuxième écran de **profondeur** au canon (après
  la fiche concept). **PR en BROUILLON**, en attente de validation humaine et de CI verte ; passera à
  « accepté » à la validation.
- **Contexte** : le LOT 4-L applique le canon **TradeMy Learning Glass** à la **fiche Monde**
  (`src/app/monde/[id].tsx`, route `/monde/[id]`). C'est la surface où l'utilisateur comprend où il se
  trouve dans le parcours, ce qu'il va apprendre, sa progression réelle et la prochaine action utile.
  L'écran existant portait déjà un titre, un widget de progression, un trail guidé et une liste de
  concepts, mais la hiérarchie et l'intention principale n'étaient pas immédiatement lisibles.

## Problème (mesuré dans le code, sur `main` `b35a95f`)
- **Pas d'action principale immédiate** : aucune carte « prochaine étape » dérivée de l'état ; l'utilisateur
  devait déduire quoi faire du trail ou de la liste.
- **Détournements de couleur** : libellé d'en-tête « MONDE n / N » en `technical` (cyan d'annotation), puce
  « revue » du checkpoint en `technical`, lien « Découvrir la notion » en `technical`.
- **Glyphe de commande** `›` détourné en navigation (liste de concepts, lien « Découvrir la notion »).
- **Statut du monde peu explicite** (aucune puce de statut sémantique dans le héros), pas de distinction
  visible consultation / maîtrise sur les concepts, pas de sortie claire pour un monde terminé.

## Décision — présentation au canon, moteurs intacts
Refonte **présentationnelle** de l'écran autour de six sections. **Aucune** donnée, logique, route,
analytics ni persistance n'est modifiée : l'écran LIT les moteurs existants et n'écrit jamais de
progression au rendu.

### Sources canoniques (aucune seconde source de vérité)
| Donnée | Source |
|---|---|
| Liste et ordre des mondes | `WORLDS` (`generateStaticParams` en dérive) |
| Statut / progression / verrou / maîtrise du monde | `buildLearningPath` → `worldEntryById` |
| Trail du module guidé (terminé/courant/dû/verrouillé + checkpoint) | `buildWorldMap` |
| Concepts du monde | `conceptsByWorld(V5_CONCEPTS, worldId)` |
| Notion liée à une compétence | `conceptSlugForSkill` |
| Compétences du module | `SKILLS` / `guidedModulesForWorld` |

### Structure de la fiche
1. **En-tête héro** : « MONDE n / N » (neutre `textMuted`, plus de cyan), titre, sous-titre, puce de
   **statut sémantique** (icône + libellé + couleur, jamais la couleur seule), puce « Module guidé » ou
   « n notions ».
2. **Carte « Prochaine étape »** — action principale UNIQUE, **dérivée de l'état réel** (`deriveNextStep`),
   jamais codée en dur (voir plus bas).
3. **Objectifs** (module guidé) : « Ce que tu vas savoir faire » = les compétences du module (la promesse
   pédagogique, distincte du trail qui porte le **statut**). Omise pour les mondes de contenu (la section
   Concepts est alors la source, pas de duplication).
4. **Parcours du monde** : monde guidé → trail chronologique conservé (statut texte + icône + couleur,
   cibles ≥ 44 px, focus visible) ; monde de contenu → collection honnête de notions (pas de faux trail).
5. **Concepts du monde** : monde de contenu → source principale (visuel `MiniVisual`, titre, définition
   réels, ouverture `/concept/[slug]`) ; monde guidé → accès **secondaire** aux notions du monde. Les
   fiches déjà consultées portent une marque explicite « Consultée · pas encore maîtrisée ».
6. **Monde terminé** : bannière « Module validé » (or/récompense) + prochaine étape « Continuer vers ce
   monde » si le monde suivant est réellement ouvert — **jamais une impasse**.

### Définition de la « prochaine étape » (`deriveNextStep`, pure, testée)
- **Monde guidé** (depuis `buildWorldMap`) : révision **due** → « Réviser maintenant » (`/session/{skill}`) ;
  sinon compétence **courante** → « Commencer la leçon » / « Continuer » (`/session/{skill}`) ; sinon
  checkpoint **courant** → « Passer le checkpoint » (`/session/{checkpoint}`) ; sinon (module terminé) le
  **monde suivant** s'il est ouvert, à défaut « Retour au parcours ».
- **Monde de contenu** : première fiche **non consultée** → « Explorer les notions » / « Continuer
  l'exploration » (`/concept/{slug}`, durée réelle `estimatedMinutes` affichée) ; sinon le monde suivant
  ouvert, à défaut « Revoir les notions » / « Retour au parcours ».
- Le monde suivant est **lu** depuis `buildLearningPath` (statut ≠ `locked`) — **jamais** déverrouillé
  localement. Aucun « Continuer » sans destination réelle.

### Vérité pédagogique STRICTE (inchangée)
Consulté ≠ terminé ≠ validé ≠ maîtrisé. Un monde de contenu n'est **jamais** « terminé » par la lecture
(au mieux « exploré ») ; « terminé » exige le checkpoint d'un module guidé ; « maîtrisé » exige en plus les
fiches maîtrisées. La fiche **présente** ces états, ne les **change** pas. Aucun pourcentage inventé, aucun
compteur codé en dur, aucune écriture de progression au rendu, aucune clé de persistance, aucune migration.

### Règles de couleurs (tokens dédiés, jamais détournés)
Statut du héros : `current`→`primaryBright` · `unlocked`/`explored`→`info` · `done`→`success` ·
`mastered`→`mastery`. Trail : `done`→`success` · `due`→`warning` · `current`→`primaryBright` ·
`locked`→`textMuted` ; checkpoint et bannière « terminé » → `reward` (or, réservé aux récompenses/checkpoints).
En-tête et libellés neutres → `textMuted`. `technical`/cyan est **absent** de l'écran (hors `MiniVisual`).

## Hydratation & routage (garanties LOT 4-K préservées)
`generateStaticParams` reste dérivé de `WORLDS` (un HTML concret par monde connu). Le premier rendu est
**indépendant de l'id** : la garde `!ready || !state` affiche un chargement identique au pré-rendu statique
→ pas de divergence **React #418**. **`ready` suffit ici** (contrairement à concept/glossaire au LOT 4-K,
dont le premier rendu dépendait du slug) car la fiche Monde ne rend aucun contenu dépendant de l'id avant
`ready`. Aucun `mounted` ajouté, aucun `setTimeout`, aucun `suppressHydrationWarning`, aucun filtrage
d'erreurs, aucun rechargement forcé, aucun repli local mensonger.

## Analytics (inchangé)
`analytics.track('world_opened', { worldId })` — **un seul** par montage (deps stables `world`/`worldId`,
déclaré avant le retour anticipé) ; comportement « introuvable » contractuel conservé
(`session_not_found`). Aucun nouvel évènement, aucun nouveau payload, aucun analytics pendant le pré-rendu.

## Périmètre
- **Autorisé / touché** : `src/app/monde/[id].tsx` (présentation, mappings/helpers locaux) ;
  `src/integration/monde.integration.test.tsx` (nouveau) ; `scripts/verify-world-links.mjs` et
  `scripts/capture-monde.mjs` (nouveaux) ; `docs/lot4l-captures/` ; `docs/ADR-108-*.md` ;
  `docs/DECISIONS_INDEX.md` ; bascule `docs/ADR-107-*.md` (statut + note).
- **Interdit / inchangé** : `WORLDS`, `V5_CONCEPTS`, `SKILLS`, `src/data/**`, moteurs (`buildLearningPath`,
  `buildWorldMap`, progression, maîtrise, répétition espacée), `AsyncStorage`/migrations, taxonomie/payload
  analytics, `session/[skillId]`, `lesson/[id]`, `concept/[slug]`, `glossaire/[slug]`, Parcours global,
  navigation, mascottes/sprites, `package.json`/lockfile/dépendances, premium/paywall.

## Preuves (tests d'intégration + garde-fous)
`monde.integration.test.tsx` (rendu RÉEL, `ProgressProvider` réel, états AsyncStorage déterministes,
15 tests) : `generateStaticParams` == ids `WORLDS` (ordre, unicité, complet, jamais `[id]`) ; 1er paint
chargement stable + `world_opened` une fois ; introuvable → CTA `/parcours`, **aucun** `world_opened`,
`session_not_found` conservé ; verrouillé → raison réelle, aucune étape ouvrable, aucun contenu dévoilé ;
guidé disponible → prochaine étape leçon `/session/skill.actions` ; étape verrouillée non ouvrable /
courante ouvrable ; notion liée `/concept/…` ; checkpoint courant → « Passer le checkpoint »
`/session/checkpoint.read-chart` ; révision due → « Réviser maintenant » ; contenu → concepts canoniques,
consulté ≠ maîtrisé, « Explorer les notions » `/concept/…` ; exploré ≠ terminé ; terminé → « Module validé »
+ « Continuer vers ce monde » (pas d'impasse) ; écran = `buildLearningPath` ; **aucune mutation de
progression** au rendu ni à la navigation ; aucun emoji ; remontage déterministe.

## Preuve d'exécution (Chromium, `scripts/verify-world-links.mjs`)
Sert `dist/` en reproduisant GitHub Pages, écouteurs installés avant navigation, états injectés via
`localStorage`. **12 scénarios** : guidé disponible (direct + rechargement), verrouillé, contenu avec
concepts, terminé, Monde→Session→retour, Monde→Concept→retour, monde inconnu via SPA, 320×568, 390×844,
web large 1280×900, reduced-motion. **Résultat : 0/12 en échec ; React #418 = 0 ; console.error = 0 ;
pageerror = 0 ; rejets = 0.** Chaque scénario vérifie la bonne fiche, le pathname, le préfixe `/TradeMy/`,
l'absence de `404.html` pour un monde connu, l'absence de débordement horizontal, les CTA vivants et
**l'absence de régression de progression** (champs sémantiques inchangés).

## Captures (déterministes, `scripts/capture-monde.mjs` → `docs/lot4l-captures/`)
Horloge/fuseau figés, états injectés. 7 PNG : `monde-guide-390`, `monde-verrouille-390`, `monde-contenu-390`,
`monde-termine-390`, `monde-guide-320`, `monde-contenu-web`, `monde-guide-web`. Inspectées une à une
(hiérarchie, contraste, icônes cohérentes, alignement, aucune troncature, prochaine action claire).

## Accessibilité
Statut du monde et de chaque nœud annoncés en **texte** (jamais la couleur seule) ; nœuds = boutons nommés
`{titre} — {statut}`, état `disabled` pour les étapes verrouillées, cibles ≥ 44 px ; CTA à nom explicite ;
sections en `header` ; mascotte décorative (non redondante avec un texte annoncé) ; disclaimer éducatif.

## Risques
Faibles-moyens : écran surtout de lecture/orientation. Risque principal = déformer la vérité de progression
ou déverrouiller localement. Mitigé par les verrous (aucune mutation au rendu, statut = `buildLearningPath`,
monde suivant lu et non déverrouillé, tests exhaustifs des états).

## Limites restantes
- **Monde inconnu en accès direct** : comme au LOT 4-K, un id hors `WORLDS` tapé directement retombe sur
  `404.html` (repli Pages) ; ce lot garantit l'absence de #418 pour tout monde **connu / pré-généré** et
  couvre l'état « introuvable » via navigation SPA. Le repli 404 générique n'est pas refondu (hors périmètre).
- **Un seul module guidé** (Fondations) : les 14 autres mondes restent des collections de notions jusqu'à
  l'ajout de modules guidés (lots de contenu ultérieurs). La fiche le présente honnêtement.
- Contrôles natifs iOS/Android **non exécutés** : seuls Chromium et les tests React Native/Jest l'ont été.

## Rollback
Revert du commit unique du LOT 4-L. Aucune migration, aucun changement de schéma ni de données → rollback
sans effet de bord. Retirer `generateStaticParams` ferait échouer `monde.integration.test.tsx`.

**LOT suivant : non commencé.**
