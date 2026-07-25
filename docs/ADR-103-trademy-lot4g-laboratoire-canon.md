# ADR-103 — LOT 4-G : application du canon au Laboratoire

- **Statut** : proposé — LOT 4-G, septième application verticale de la fondation LOT 4-A (ADR-097), après
  l'Accueil (ADR-098), Révisions (ADR-099), le Profil (ADR-100), Apprendre/Parcours (ADR-101) et la
  Bibliothèque (ADR-102). **PR en BROUILLON**, en attente de validation humaine ; passera à « accepté » à
  la validation.
- **Contexte** : le LOT 4-G applique le canon **TradeMy Learning Glass** à l'espace **Laboratoire**
  (`src/app/(tabs)/laboratoire.tsx`, route historique `/laboratoire`, libellé d'onglet « Laboratoire »).
  Lot **présentationnel** : l'écran LIT des moteurs PURS et DÉTERMINISTES (tracé interactif, machine de
  replay, labs d'indicateurs) et les scénarios (`CHART_SCENARIOS`). Aucun moteur / dataset / taxonomie
  analytics / contenu / persistance / route / navigation modifié. **Le Laboratoire n'utilise PAS
  `useProgress`** : aucun XP, aucune compétence, aucun objectif, aucun checkpoint, aucune maîtrise, aucune
  répétition espacée, aucune persistance. Un résultat de Laboratoire est un **feedback d'ESSAI**, jamais
  une preuve de maîtrise ; un remontage complet restaure des valeurs déterministes.

## Contrat produit (non négociable)
Le Laboratoire est un espace pour **choisir une expérience, manipuler un graphique pédagogique, observer
un scénario, tracer un repère, rejouer une séquence, ajuster un paramètre d'indicateur, comparer avec
explication, identifier une invalidation / un faux signal, et réessayer librement**. Il n'est **jamais**
une app de signaux, un simulateur de gain, un courtier, un terminal temps réel, un second Parcours /
Bibliothèque, une liste des 500+ concepts, ni un système de maîtrise parallèle. Vocabulaire conforme
(setup haussier/baissier, entrée théorique, zone de confirmation, invalidation, objectif pédagogique,
faux signal, scénario éducatif) ; jamais BUY/SELL ni promesse de gain.

## Diagnostic initial (confirmé dans le code, avant réécriture)
- **Emojis système** `🔎` / `⚠️` et **glyphes de commande** (`⏮ ◀ ▶ ⏭`, `↑ ↓`, `›`) employés comme faux
  système d'icônes de contrôle.
- **Duplication de la Bibliothèque** : `V5_CONCEPTS.map` (liste de concepts) et l'aperçu statique
  `ANATOMY_SPEC` / `VisualCard` — un second index passif, hors mission du Laboratoire.
- **Couleurs détournées** : `bullish`/`bearish`/`reward` appliqués à des éléments d'atelier (ni marché, ni
  récompense).
- **Toutes les activités montées en même temps** : plusieurs graphiques/scènes lourds coexistaient (pas
  d'« une activité dominante à la fois »), au prix de la lisibilité et du coût de rendu.
- **Analytics imprécis** : risque d'émettre `lab_started`/`lab_completed` au montage plutôt que sur une
  interaction/condition terminale réelle.
- **Compteur de bougies** rendu comme **nombre nu** dans le nom accessible (« 1 bougies »), non contextuel.

## Vérité préservée (lue, jamais réécrite)
- **4 scénarios** (`CHART_SCENARIOS` : `trend` / `break-retest` / `fakeout` / `liquidity`). Les
  annotations sont **`label` + `detail` uniquement, SANS coordonnées** : on ne prétend **jamais** afficher
  des annotations superposées au graphique — ce sont des **repères textuels** affichables/masquables.
- **Tracé du support** : `generateCandles(2024, 30)`, `priceScale`, `supportLevel` (= le plus bas ⇒ token
  `warning`, nommé « creux de référence », jamais « support réel »), proximité via **`isLevelClose`
  (tolérance 6 % du moteur) — aucun second calcul de proximité**.
- **Replay volume** : `generateCandles(777, 24)`, `initReplay(len, 6)` ; « séquence entièrement révélée »
  signifie seulement que tout a été déroulé — **jamais une maîtrise**.
- **Labs d'indicateurs** : `INDICATOR_LABS` (RSI 7/14/21, MA 4/6/9, Bollinger 1.5/2/2.5) — le paramètre
  choisi est **branché** sur `configFor(value)` ; **aucun calcul/config d'indicateur n'est modifié**.

## Décision — architecture (une activité dominante à la fois)
1. En-tête « Laboratoire » (icône `lab`, accent de marque) + explication utile.
2. **Sélecteur d'expérience** (4 pastilles `role=tablist`/`button`+`selected`, ≥ 44 px) : Lecture guidée ·
   Tracer un support · Replay volume · Indicateurs.
3. **Une seule expérience montée à la fois** (`{active === … ? <Card/> : null}`) : les graphiques et
   scènes des activités inactives **ne sont pas montés** (lisibilité + coût de rendu). Possible **sans
   toucher au shell** (`Screen` par défaut).
4. **Ressources secondaires** « Continuer à apprendre » vers des routes RÉELLES (`/apprendre`,
   `/bibliotheque-visuelle`, `/lesson/lesson.double-bottom`) + disclaimer.

Aucun CTA artificiel, aucun bouton mort : les contrôles de replay sont **bornés** (Début/Précédente
désactivés au début ; Suivante/Tout révéler désactivés à la fin), jamais décoratifs.

## Décision — mapping token → icône (décorative) → texte
La couleur n'est **jamais** le seul signal (icône **et** libellé toujours présents).

| Élément | Token | Icône |
|---|---|---|
| Sélection d'expérience (active) | `primary` / `primaryBright` | `lab`, `chart`, `volume`, `settings` |
| Repère d'annotation (lecture guidée) | `technical` (annotation cyan) | `target` |
| Zone de support (« creux de référence ») | `warning` | `support` |
| Faux signal (indicateurs) | `falseSignal` (neutre barré) | `false-signal` |
| Bonne réponse **locale** (essai) | `feedbackCorrect` | `success` |
| Essai à revoir | `feedbackIncorrect` | `error` |
| Compteur / niveau (info) | `info` | `volume`, `chart` |
| Séquence entièrement révélée | `success` | `success` |

**Jamais** `bullish`/`bearish`/`reward`/`mastery`/`advanced` pour un élément d'atelier ; `technical`
**uniquement** pour les repères graphiques (jamais la navigation). Toto (`bullish`) et Bobo (`bearish`)
gardent leur **couleur d'identité** via le composant partagé `CharacterScene` (inchangé).

## Décision — analytics (essai, jamais maîtrise)
- `lab_started` émis **uniquement après une interaction significative** (changement de scénario, avance du
  replay, placement, ajustement d'un paramètre), **jamais au montage**, **dédupliqué** par clé et par
  montage (`startedRef`).
- `lab_completed` émis **uniquement sur une condition terminale réelle** (tracé validé ; séquence de replay
  entièrement révélée), **≤ 1 par essai** (dédup via `revealed`/`replayDone`).
- **Aucun** évènement de maîtrise / XP / progression ; **aucune** écriture de persistance (AsyncStorage).
  La **taxonomie et les puits analytics ne sont pas modifiés** — seuls les **déclencheurs** de l'écran le
  sont.

## Une activité = une scène de mascotte
Une seule scène par activité active (le duo Toto + Bobo de la lecture guidée compte pour une). Les
dialogues enseignent une condition, une preuve, une invalidation ou un faux signal — jamais une simple
félicitation.

## États couverts
Lecture guidée (scénario initial · changement déterministe · repères masqués/révélés · replay début/fin) ·
tracé de support (avant placement / raison de blocage · placement réel · feedback proche · feedback à
revoir · réessai) · replay volume (en cours · entièrement révélé) · indicateurs (RSI défaut · paramètre
ajusté · changement de lab avec défaut restauré) · 320 / 390 / 1440 · texte agrandi · reduced-motion.

## Tests
- `laboratoire.integration.test.tsx` (écran RÉEL, **sans** `ProgressProvider`, moteurs/données
  déterministes) : identité (H1 unique) ; 4 expériences ; **une seule activité montée** (les autres
  graphiques `InteractiveChart`/`MarketReplayChart`/`IndicatorPanel` ne sont pas montés) ; scénarios issus
  de `CHART_SCENARIOS` (changement déterministe, Toto/Bobo alignés, replay remis à zéro) ; contrôles bornés
  et compteur contextuel ; repères masqués **absents de l'arbre a11y** puis révélés groupés ; validation du
  support impossible avant placement (raison), placement réel + close/retry via `isLevelClose`, **≤ 1
  complétion/essai** ; replay complet (≠ maîtrise), une complétion ; 3 labs d'`INDICATOR_LABS`, paramètre
  branché sur `configFor`, défaut restauré au changement de lab, faux signal aligné ; **aucun
  `lab_started`/`lab_completed` au montage**, `lab_started` seulement sur interaction (dédupliqué),
  **aucun** évènement de maîtrise/XP/progression, **aucune** écriture AsyncStorage ; ressources → **routes
  exactes** ; aucun bouton mort ; déterminisme après remontage ; aucune valeur invalide.
- `laboratoireNoEmoji.test.ts` (garde-fou `findEmoji` **+** interdiction des glyphes de commande
  `⏮⏭◀▶←↑→↓‹›★☆`) et `laboratoireSemanticColors.test.ts` (aucun `bullish`/`bearish`/`reward`/`mastery`/
  `advanced` ; `feedbackCorrect`/`feedbackIncorrect`/`falseSignal`/`warning`/`info`/`success` présents ;
  `technical` limité aux repères d'annotation, jamais la navigation).

## Captures (déterministes, script séparé)
`scripts/capture-laboratoire.mjs` (manifeste séparé — ne touche à **aucune** capture antérieure) —
horloge/fuseau **figés** (`Europe/Zurich`), parcours réel côté client (racine → « Reprendre » → Accueil →
onglet **Laboratoire** vérifié par rôle **avec état sélectionné**, route `/TradeMy/laboratoire`, 5
onglets). Les états d'atelier étant **locaux**, ils sont atteints par de **vraies interactions** (changer
d'activité/scénario, poser une ligne, valider deux essais, dérouler le replay, ajuster un indicateur). Le
contrôle emoji/glyphe/métrique est **scopé au conteneur de défilement de l'écran Laboratoire** (les
onglets inactifs restent montés et empilés dans le DOM — ex. « Découvrir la fiche › » de l'Accueil — et ne
relèvent pas du LOT 4-G). 11 PNG : `laboratoire-guided-320`, `-guided-masked-390`, `-guided-revealed-390`,
`-support-selected-390`, `-support-feedback-correct-390`, `-support-feedback-retry-390`,
`-volume-complete-390`, `-indicator-adjusted-390`, `-wide-web` (1440), `-large-text` (zoom navigateur),
`-reduced-motion`. Échec sur : erreur console, pageerror, mauvais écran/onglet/route, build obsolète,
activité multiple, signature incorrecte, débordement, emoji, glyphe de commande, `NaN`/`undefined`/
`Infinity`, capture manquante ou parasite.

## Confirmation — moteur, dataset, contenu, persistance et navigation NON modifiés
Aucune modification de : `CHART_SCENARIOS` / `chartLab`, `INDICATOR_LABS` / calculs d'indicateurs, la
machine de replay (`chartEngine`), le tracé interactif (`interactive`), `generateCandles`, `V5_CONCEPTS`,
`learningContent`, la progression / maîtrise / répétition espacée, la persistance, les migrations, les
repositories, la taxonomie et les puits analytics, `navigation.ts`, `_layout.tsx`, les tokens/thème,
`TrademyIcon`, les composants partagés (`CharacterScene`, `Screen`, `Card`, `Button`, `Chip`,
`SegmentedControl`, `Disclaimer`), ni les autres écrans/routes. Le diff ne touche **aucun** fichier de
`src/engines/` ni `src/data/`. `package.json`/lock **inchangés** ; **aucune** dépendance ajoutée.

## Limites restantes
- **Dette de shell (hors périmètre 4-G)** : à ~320 px, les **libellés d'onglets** de la barre restent
  **tronqués** (comme noté en 4-B → 4-F). Non corrigée ici.
- **Annotations sans coordonnées** : le format `CHART_SCENARIOS` ne porte pas de positions ; les repères
  restent donc **textuels** (affichables/masquables). Superposer des marqueurs positionnés exigerait
  d'étendre le dataset et le moteur — **dette documentée**, hors périmètre.
- Le graphique de support est rendu **responsive depuis l'écran** (`onLayout` → `width` borné à 520), sans
  toucher au moteur `InteractiveChart` (qui accepte déjà `width?`).

**LOT suivant : non commencé** — sera cadré séparément depuis le canon, après validation humaine.
