# Checklist de publication — PatternLab

État au **LOT 19 — Release readiness**. Deux catégories : **automatisé** (vérifié en CI /
localement) et **action humaine requise** (comptes, credentials, soumission — hors de
portée de l'agent, nécessite une autorisation explicite).

## Automatisé (vérifiable maintenant)

Porte de validation complète :

```bash
npm run check
```

`release:check` vérifie (logique pure `src/release/releaseCheck.ts`, testée) :

- [x] `name`, `slug`, `orientation` renseignés dans `app.json`
- [x] `userInterfaceStyle` cohérent avec la marque sombre (`dark`)
- [x] versions synchronisées : `app.json` = `package.json` = `APP_INFO.version`
- [x] `ios.bundleIdentifier` et `android.package` en reverse-DNS (`com.trademy.app`)
- [x] icône et favicon présents sur le disque
- [x] `expo-router` activé
- [x] disclaimer éducatif présent, résumé de confidentialité (≥ 3 points), écran « À propos »

Autres éléments prêts :

- [x] Splash + icônes Toto/Bobo (adaptive Android, PNG iOS, favicon/PWA) référencés et vérifiés
- [x] Couleurs de marque appliquées (splash / adaptive icon / `backgroundColor` / `primaryColor`)
- [x] Compliance chiffrement iOS déclarée (`ITSAppUsesNonExemptEncryption: false`)
- [x] Écran « À propos & mentions légales » (`/a-propos`) + politique de confidentialité (`docs/PRIVACY.md`)
- [x] États UI couverts (loading / empty / error / offline / locked / disabled)
- [x] Accessibilité : contraste AA verrouillé, titres, focus clavier, cibles tactiles (LOT 18)
- [x] Hors-ligne : local-first vérifié, bandeau + garde-fou réseau (LOT 17)
- [x] Réduction d'animation respectée (design system + `prefers-reduced-motion` web)
- [x] Confidentialité : opt-out analytics, aucune donnée personnelle/financière (LOT 16)

## Action humaine requise (autorisation explicite)

Ces étapes nécessitent des comptes/credentials et une décision de publication — **non
réalisées** par l'agent :

- [ ] Comptes développeur **Apple** (99 $/an) et **Google Play** (25 $ une fois)
- [ ] Configuration **EAS** (`eas.json`, `eas build` iOS/Android) et signature
- [ ] Captures d'écran de store, textes de fiche, catégorie, classification d'âge
- [ ] Politique de confidentialité hébergée (URL publique) + questionnaire de données du store
- [ ] Revue interne finale (QA device réel iOS + Android), puis **soumission** aux stores
- [ ] Crash reporting (Sentry/…) — à brancher avec accord (aucun envoi de donnée perso)
- [ ] Branchement d'un vrai magasin d'achat (StoreKit / Play Billing) — voir monétisation (LOT 15)
- [ ] Source native de connectivité (NetInfo) — voir offline (LOT 17)
- [ ] Fournisseur analytics validé côté vie privée — voir analytics (LOT 16)
- [ ] Rollback : versionner le tag, garder la version précédente publiable
- [ ] Approbation finale (Elio) avant toute publication/poussée

## Notes de version (1.0.0)

Première version : parcours « Lire un graphique » (4 compétences, leçons V2, exercices
avancés, laboratoire interactif), maîtrise adaptative, gamification (quêtes, série,
réussites), statistiques, glossaire enrichi, offre premium (simulée), analytics
privacy-first, mode hors-ligne, accessibilité AA. Aucune donnée personnelle, aucun conseil
financier.
