# ADR-125 — LOT W1 : leçons 100 % illustrées (programme « Visual Max 2 »)

- **Statut** : accepté (priorité propriétaire du 30/07/2026 : « plus d'illustrations en
  explication au maximum » — suite du programme Visual Max, ADR-116).
- **Contexte** : depuis le LOT V5, seules les étapes `observe` et `visual` d'une leçon montrent un
  graphique. Les étapes `falseSignal` (contre-exemple) et `summary` (synthèse) restaient du texte
  seul — alors que le contre-exemple est précisément ce qui gagne le plus à être VU.

## Décision
`LessonStepView` rend désormais **quatre étapes illustrées** par leçon :
- **`falseSignal`** : le **visuel réel du concept** (VisualCard, dataset de la fiche) s'affiche
  au-dessus du piège décrit, complété du premier `falseSignals` de la fiche (« Piège type : … »)
  quand il diffère du corps de l'étape — le lecteur regarde la figure en lisant ce qui la déjoue.
  Liseré sémantique `falseSignal`.
- **`summary`** : la **vignette compacte** du concept (MiniVisual, 112 px) accompagne la synthèse
  « À retenir » — l'ancrage visuel de fin de leçon. Liseré `primary`.

Résolution du concept : `conceptRef` de l'étape, sinon repli sur le concept de la COMPÉTENCE
(`conceptSlug`, pont existant du LOT V5). **Repli texte inchangé** si aucun concept n'est
résolvable — jamais d'étape vide, aucune leçon modifiée (zéro changement de données).

## Portée
59 leçons × jusqu'à 2 illustrations supplémentaires chacune, sans toucher au contenu éditorial ni
aux données. Aucune dépendance. Visuels 100 % originaux (moteur SVG canonique).

## Tests (exécutés)
- `lessonStepViewIllustrated.test.tsx` : visuel réel au-dessus du piège (falseSignal), vignette
  dans la synthèse (summary), repli texte sans concept, et **rendu exhaustif** des étapes
  falseSignal/summary de TOUTES les leçons des 15 modules guidés (zéro écran cassé).
- `session.integration` (écran réel) et `lessonStepViewObserve` inchangés et verts.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout.
