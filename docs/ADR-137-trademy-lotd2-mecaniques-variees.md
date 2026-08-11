# ADR-137 — LOT D2 : des mécaniques qui changent (lire un VRAI graphique, pas seulement une figure)

- **Statut** : accepté (priorité propriétaire du 11/08/2026 : « comme du Duolingo mais du trading »,
  « développe au max »).
- **Contexte** : le LOT D1 avait rendu la couverture des objectifs complète, mais laissé un constat
  ouvert et mesuré : dans les quatorze modules guidés, **la mécanique était liée 1 pour 1 à
  l'objectif**.

## Le défaut

Sur les 44 compétences guidées :

- `recognize` était **toujours** une reconnaissance de figure de catalogue ;
- `interpret` était **toujours** une remise en ordre ;
- `avoid-false-signal` était **toujours** un « repère l'affirmation fausse ».

Cinq formats seulement sur les treize déclarés étaient employés. Quatre interactions **déjà
implémentées, déjà testées, déjà dotées d'un player de production** — lire le sens d'une série
(`read-direction`), toucher le tiers d'un extrême (`touch-extreme-zone`), identifier ce qu'un repère
désigne (`label-extreme`), poser une ligne sur le plus haut (`place-extreme`) — n'étaient utilisées
dans **aucun** module. Seule la compétence pilote « Comprendre un chandelier » les employait.

Conséquence : un apprenant traversant le parcours refaisait les mêmes quatre gestes 44 fois.

## Décision

**Six variantes** ajoutées, uniquement là où lire un graphique **est** la compétence enseignée :

| Compétence | Mécanique introduite | Pourquoi ici |
|---|---|---|
| `skill.structure.uptrend` | lire le sens d'une série (graine 102, +77 %) | la structure EST le sujet |
| `skill.structure.downtrend` | lire le sens d'une série (graine 135, −36 %) | idem |
| `skill.structure.range` | lire le sens d'une série (graine 153, −0,7 %) | constater l'absence de sens |
| `skill.anatomy.candle` | identifier ce qu'un repère désigne | reconnaître corps et mèches sur un vrai graphique |
| `skill.anatomy.scale` | toucher le tiers du plus haut, au doigt | un QCM sur l'axe n'oblige pas à le LIRE |
| `skill.sr.zones` | poser la ligne sur le plus haut atteint | une résistance se pose, elle ne se coche pas |

Trois principes ont guidé ces choix :

1. **La mécanique sert le contenu, jamais l'inverse.** Aucune interaction graphique n'a été ajoutée
   aux mondes où un graphique de bougies quelconque ne dit rien du concept (options, psychologie,
   indicateurs). Saupoudrer aurait fait du remplissage.
2. **Ce sont des VARIANTES d'objectifs existants**, pas de nouveaux objectifs. La couverture du
   LOT D1 est donc inchangée ; ce qui change, c'est que la **rotation** entre visites propose une
   autre façon de demander — et que la **remédiation** après une erreur peut désormais reformuler
   avec un geste différent.
3. **La vérité reste dérivée de la série réellement rendue.** La bonne réponse, le feedback et le
   résumé lecteur d'écran sont calculés depuis les bougies affichées ; les graines ont été choisies
   pour que la réponse soit franche (tendances marquées, extrême dans le tiers du milieu plutôt qu'au
   bord).

## Résultat mesurable

- Formats employés par le parcours guidé : **5 → 8** sur 13.
- `recognize` passe d'**une** mécanique à **quatre**.
- Les sessions ne s'allongent pas : aucune compétence de module guidé ne dépasse 6 questions.

Le plafond de 13 formats n'est pas un objectif : `numeric`, `true_false` et `match` n'ont pas encore
de contenu qui les justifie honnêtement dans ces modules.

## Ce qui n'a pas changé

- Aucun concept, compétence ou monde ajouté ; statuts éditoriaux inchangés (`needsReview`).
- Aucune dépendance, aucune migration, **aucun nouveau player** : ces quatre interactions étaient
  déjà rendues par des composants de production accessibles (clavier ↑/↓, tactile, lecteur d'écran).
- Aucun vocabulaire BUY/SELL, aucune promesse de gain.

## Dette rendue visible

Les trois leçons **libres** historiques (`module.foundations`, exercices rédigés à la main, antérieurs
au modèle de scénario) dépassent la fourchette « deux à cinq questions » du canon :
`skill.actions` 10, `skill.patterns` 9, `skill.trend` 7, `skill.candles` 6. Ce lot ne les raccourcit
pas — c'est une décision éditoriale, pas technique — mais `guidedMechanicVariety.test.ts` **fige ces
longueurs réelles** pour que la dette reste visible et ne grossisse pas en silence.

## Tests (exécutés)

- `guidedMechanicVariety.test.ts` (7) : formats tous déclarés et `live`, au moins 8 façons de
  demander, `recognize` servi par ≥ 4 mécaniques, ≥ 3 natures à mécaniques multiples, les
  interactions graphiques présentes exactement dans les six compétences visées, longueur des sessions
  bornée, dette Fondations figée.
- Les 3 tests de module concernés étendus : nouveaux types acceptés par le grader RÉEL, jeu de types
  attendu mis à jour, et pour les niveaux un verrou qui distingue les **deux** placements rendus par
  le même player mais visant des extrêmes **opposés** (invalidation sous le plus bas, résistance sur
  le plus haut).
- Gate `EXPO_NO_TELEMETRY=1 npm run check` : verte de bout en bout.
