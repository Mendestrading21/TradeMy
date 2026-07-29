# ADR-116 — Programme « Visual Max » : mascottes 3D partout, moins de texte, plus d'interaction

- **Statut** : accepté (décision propriétaire du 29/07/2026 : « Visual Max d'abord », les mondes
  guidés reprennent ensuite).
- **Contexte** : le propriétaire, captures à l'appui, jugeait les avatars 2D « pas beaux » face aux
  renders 3D de l'accueil, l'app trop textuelle, et signalait un liseré blanc autour des mascottes.

## Décisions (lots livrés V1, V2, V4, V5, V6 — PR #30 à #34)

1. **Avatars 3D partout (V1)** : `MascotAvatar` cadre la TÊTE du render 3D réel dans un cercle
   (cadrage `cx`/`cy`/`zoom` par figure, vérifié sous Chromium aux tailles 52/96). La figure par
   expression DÉRIVE du registre d'états (`STATE_TO_EXPRESSION`, source unique). Le dessin
   vectoriel 2D (`src/characters/vector/`, `CharacterAvatar`) est SUPPRIMÉ. API inchangée
   `{character, state, size}` → tous les écrans héritent via `CharacterAnimationController`.
2. **Célébration 3D (V2)** : l'asset `celebrate.png` est réparé (damier de transparence retiré des
   pixels par canvas Chromium) et la figure duo revient sur l'écran de résultat — réussite
   uniquement, décorative (la scène de personnage garde le texte/état accessibles).
3. **Détail à la demande (V4)** : la fiche concept s'ouvre courte et visuelle — définition complète
   repliée (bouton accessible, état `expanded`), flashcard à réponse révélée au tap. Aucune perte
   d'information, aucun contenu modifié.
4. **« Observer, c'est regarder » (V5)** : l'étape `observe` des leçons rend le graphique réel du
   concept de la compétence (`conceptSlug` de repli via le pont canonique `conceptSlugForSkill`) ;
   repli texte inchangé sans visuel résolvable.
5. **Défrange des renders (V6)** : les 8 PNG sont nettoyés (dé-matte du blanc sur les
   semi-transparents, érosion 1 px, recolorisation des bords clairs sur bande de 3 px) — fin du
   liseré blanc sur fond sombre, silhouettes intactes, dimensions natives inchangées.

## Principes retenus (canon)

- Le « 3D » de la v1 web = **renders + motion** (Reanimated), PAS de 3D temps réel (three.js/GLB
  refusé : dépendance lourde, poids offline, perfs mobiles).
- Les retouches d'assets sont **déterministes et documentées** (scripts canvas Chromium, zéro
  dépendance ajoutée) ; jamais d'asset externe ou filigrané.
- Un pavé de texte devient : un visuel + une consigne d'une ligne + le détail à la demande.
- Toute interaction ajoutée est accessible (rôles, états `expanded`, cibles 44 px, reduced-motion).

## Reste ouvert

- **V3 — nouvelles poses 3D** : bloqué sur la production design du propriétaire (brief transmis :
  10 poses, PNG fond transparent ~760 px, même style). À l'arrivée des fichiers : intégration
  assets + cadrages + mapping d'états en un lot.
