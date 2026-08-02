# ADR-130 — Audit total : balayage canon des écrans secondaires + page introuvable canonique

- **Statut** : accepté (demande propriétaire du 30/07/2026 : « audit totalement complet, chaque
  page une par une, zéro bug, zéro problème »).
- **Contexte** : audit exhaustif exécuté sur l'export réel — crawl Chromium des 262 pages
  (console, requêtes, images, pages blanches, débordements, métriques, vocabulaire), parcours
  réels par clics, vérification binaire des 30 images, URL canoniques et repli 404. Constats :
  1. **Emoji système rendus** sur les écrans jamais couverts par les gardes no-emoji : leçons
     libres (`lesson/[id]` : ⏱️ ⚠️ 🔒), glossaire (`[slug]` : 🔎 ; index : ★), journal (📔),
     quiz visuel (🔍), réussites (quêtes et badges rendaient les champs emoji des données) —
     et dans le design system : les icônes PAR DÉFAUT de `StateView` (⏳ 🧭 😵‍💫 📡 🔒) et le
     bandeau `OfflineBanner` (📡).
  2. **Aucun écran `+not-found`** : tout lien profond inconnu affichait l'« Unmatched Route »
     anglais d'expo-router, avec divergence d'hydratation React #418 (le `404.html` de GitHub
     Pages était une copie d'`index.html`).

## Décisions
1. **Zéro emoji rendu, partout** : les écrans secondaires passent aux icônes `TrademyIcon`
   (timer/warning/lock/search/chart) ; `/reussites` mappe quêtes et badges vers des icônes
   Trademy par identifiant (repli par famille) — les champs `emoji`/`icon` des DONNÉES restent
   (datasets stables) mais ne sont plus jamais rendus tels quels, même règle que l'onboarding.
   `StateView` porte désormais une icône Trademy PAR VARIANT (fin des emoji par défaut) ;
   `EmptyState` expose `iconName` ; `OfflineBanner` passe à l'icône + texte.
2. **Page introuvable canonique** : nouvel écran `+not-found` (français, une seule action
   « Retour à l'accueil ») ; `finalize-web-build` copie son prérendu vers `404.html` — le rendu
   client coïncide avec le prérendu sur les URL inconnues (fin du #418 du repli, fin de l'écran
   anglais). Les 262 routes réelles gardent leur fichier propre (vérifié par verify-direct-links).
3. **Garde-fou GLOBAL** (`runtimeNoEmoji.test.ts`) : plus aucune source runtime (app, components,
   design-system, characters, engines) ne peut contenir un pictogramme emoji ni ★/☆ — la maille
   « écran non listé » est fermée définitivement. Les flèches typographiques texte (→ › ◀ ▶ ↔)
   restent autorisées (source unique `emojiGuard`).

## Validations exécutées
- Crawl Chromium 262/262 pages (avant correctif) : zéro image cassée, zéro page blanche, zéro
  requête échouée, zéro métrique invalide, zéro débordement à 390 px, zéro vocabulaire interdit ;
  les seuls écarts étaient les emoji ci-dessus et le repli 404 non canonique.
- 30 images de l'export : signature et en-tête PNG/SVG valides (30/30).
- `runtimeNoEmoji.test.ts` + typecheck verts ; gate complète `npm run check` verte de bout en
  bout (exit vérifié) ; parcours de capture Chromium re-exécutés.

## Portée
Présentation et outillage de build uniquement — aucune donnée pédagogique, aucun moteur, aucune
navigation, aucune dépendance. Les compteurs ne changent pas.
