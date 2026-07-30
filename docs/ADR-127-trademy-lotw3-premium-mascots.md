# ADR-127 — LOT W3 : Toto & Bobo premium — anneaux d'identité & duo (Visual Max 2)

- **Statut** : accepté (priorité propriétaire du 30/07/2026 : « Toto et Bobo plus beaux, d'autres
  types qui cadrent avec l'app » — suite d'ADR-116/125/126).
- **Contexte** : les avatars 3D (têtes des renders réels, ADR-116) s'affichaient partout dans le
  même cercle neutre ; aucun format ne mettait le guide EN AVANT (choix du guide) ni ne montrait
  les deux guides ENSEMBLE (avant de choisir).

## Décisions
1. **Anneau d'identité** (`MascotAvatar`/`CharacterAnimationController` prop `ring`) : bordure à
   la couleur CANON du personnage (vert Toto le taureau / rouge Bobo l'ours — leurs identités,
   pas une réinterprétation locale) + halo doux dérivé du même token (~14 % d'alpha). Jamais par
   défaut — réservé aux moments où le guide est mis en avant.
2. **Nouveau format « duo »** (`MascotDuo`) : les DEUX têtes 3D réelles en cercles superposés
   (Toto devant, Bobo derrière), dérivées des renders officiels — aucun nouvel asset, aucun autre
   style. Un SEUL élément accessible (« Toto et Bobo, vos guides ») ; têtes internes décoratives.
3. **`decorative`** sur `MascotAvatar` : masque l'avatar aux lecteurs d'écran quand un parent
   porte déjà le libellé (même mécanique que `MascotFigure`).

## Câblage
- **Choix du guide** (`GuideSelectionCard`, onboarding + Profil) : avatars annelés 56 px — le
  moment du choix devient premium, la couleur double l'information du libellé (jamais seule).
- **Onboarding** (étape 1) : les deux guides se présentent ENSEMBLE (duo annelé) au-dessus du
  choix — on voit la paire avant de choisir son préféré.
- API existante inchangée partout ailleurs (aucun anneau par défaut, a11y du contrôleur intacte).

## Tests (exécutés)
- `mascotAvatar.test` étendu : anneau = couleur d'identité exacte + halo dérivé du même token,
  libellé conservé ; `decorative` = masqué aux lecteurs d'écran ; duo = un seul libellé exposé
  (« Toto et Bobo, vos guides »), deux renders réels, anneaux aux deux couleurs.
- `guideSelection`, `onboarding.integration`, `session.integration` (écrans réels) verts.
- Gate `EXPO_NO_TELEMETRY=1 npm run check` verte de bout en bout (exit vérifié).

## Portée
Aucune dépendance, aucun nouvel asset, aucune migration. Couleurs 100 % tokens sémantiques.
