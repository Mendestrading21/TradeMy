# PatternLab V5 — Plan maître (audit + exécution)

> **Archive de trajectoire V5.** Ce programme est terminé. Il ne doit pas être utilisé comme
> instruction active ; consulter `docs/CURRENT_STATE.md` et `docs/DECISIONS_INDEX.md`.

> Skill `patternlab-v5-master` · mode plan-puis-exécution · 16 lots.
> Application éducative. Aucun contenu ne constitue un conseil financier. Le trading comporte un risque de perte.

## 1. Résumé exécutif
Faire évoluer la **v1** (Lots 0→19 du skill `patternlab-product-growth`, 240 tests verts, PWA
déployée) vers une plateforme **visuelle-first** : modèle de contenu riche `LearningConcept`,
moteur de visuels SVG paramétriques (chandeliers, figures, structure, volume, indicateurs),
graphiques interactifs, 15 mondes, glossaire premium, montée à 150 puis 500+ concepts —
sans app parallèle, par lots testés, documentés et réversibles.

## 2. État réel (audit)
- Branche `claude/connexion-application-1n30su`, tip `4a02a5a`. 240 tests, 25 fichiers de test.
- Validations vertes : lint, typecheck, tests, `validate:content` (21), `release:check` (13), `build:web`.
- Contenu : glossaire **25 termes** (`src/data/glossary.ts`), 1 module pilote (4 compétences, `src/data/seed.ts`),
  18 brouillons `needsReview` (`content/drafts/concepts/`), pipeline `src/content/importPipeline.ts`.
- Moteurs : `src/engines/pattern/` (`PatternChart`, `InteractiveChart`, `interactive.ts`), `src/engines/exercise/` (9 formats).
- Design system « Instrument Glass », personnages Toto/Bobo, gamification/monétisation/analytics/offline/a11y/release **au niveau base**.
- `react-native-svg` 15.15.4 présent. Persistance AsyncStorage, schéma progression v5.

## 3. Architecture cible
`LearningPath → World → Module → Skill → Concept → Lesson (Step/Visual/Interaction/Exercise/Feedback/Flashcard/Review/Assessment)`.
Séparation stricte : XP=activité, mastery=compétence, confidence=stabilité, reviewDueAt, streak, coins, attempts, errorTags.

## 4. Écrans
Accueil · Parcours · Laboratoire · Révisions · Profil ; + Glossaire, Concept (fiche visuelle), Leçon, Session,
Statistiques, Premium, À propos. Glossaire accessible depuis accueil/profil/leçons/corrections.

## 5. Modèle de contenu (Lot 1)
`LearningConcept` (id/slug/title/aliases/category/world/difficulty/prerequisites/objectif/définitions/
reconnaissance/contexte/limites/scénarios conditionnels/confirmation/invalidation/faux signaux/erreurs/
checklist/`VisualSpec`/`ChartExample`/flashcards/mini-quiz/relations/sources/statut/locale/disclaimer).
Pont non destructif : `GlossaryTerm` devient une **vue dérivée** des concepts.

## 6. Moteur visuel (Lot 3)
Générateurs `react-native-svg` paramétriques par famille : anatomie de bougie, patterns de chandeliers,
figures chartistes, structure de marché, volume/profile, indicateurs, comparaisons, mini-cheat-sheets.
Datasets OHLC déterministes (seed), tokens du design system, **résumé accessible obligatoire**, tests snapshot,
rendu vérifié à 320/375/430 px. Jamais de copie des images de référence, jamais BUY/SELL.

## 7. Moteur chart (Lot 5)
Étendre `InteractiveChart` : volume, zoom/pan contrôlés, sélection bougie/zone, ligne/zone/tendance,
annotations, replay, correction visuelle, reset, résumé accessible. Benchmark svg/Skia/Canvas → `docs/ADR-006`.

## 8. Taxonomie (Lot 1 registres, Lots 9–10 remplissage)
13 familles (fondations, anatomie, chandeliers, figures, structure, volume, indicateurs, SMC, Wyckoff,
risk, psychologie, options, macro) ; 15 mondes ; 800+ emplacements. Publier par lots de qualité, jamais tout d'un coup.

## 9. Migration APP (Lots 9–10)
Réutiliser `importPipeline` (hash, dédup, classification, `needsReview`). Inventaire APP avant création de doublons.
Jamais d'utilisateurs/emails/tokens/Stripe/données privées. Idempotence via `sourcePath`/`sourceHash`.

## 10. Lots ordonnés
0 Fiabilité ✅ · **1 Schéma contenu V5** 🆕 · 2 Design System V5 ⤴ · **3 Moteur visuels** 🆕 · 4 Glossaire premium ⤴ ·
5 Chart engine + ADR ⤴ · 6 Exercices graphiques ⤴ · 7 Leçons V5 ⤴ · 8 Parcours & 15 mondes ⤴ · 9 Contenu pilote riche 🆕 ·
10 Extension 500+ 🆕 · 11 Gamification/stats ⤴ · 12 Offline/perf ⤴ · 13 Monétisation (démo) ✅ · 14 Analytics ⤴ ·
15 A11y complète ⤴ · 16 Release readiness ⤴. Dépendances : fiabilité→schéma→moteur visuel→contenu.

## 11. Fichiers exacts (Lot 1)
`src/data/learningConcept.ts` (types + registres `CATEGORIES`/`WORLDS` + helpers), `schemas/learning-concept.schema.json`,
extension `scripts/validate-content/`, pont `glossaryFromConcepts()` dans `src/data/`, `src/data/learningConcept.test.ts`,
`docs/ADR-026-content-model-v5.md`, MAJ `docs/PROJECT_STATUS.md`.

## 12. Tests
Unicité id/slug, catégories/mondes valides, intégrité relations/prérequis, statut/locale/disclaimer,
garde de vocabulaire (aucun BUY/SELL/« profit garanti »), VisualSpec valide (Lot 3+), datasets déterministes,
graders purs, migrations, favoris/recherche. E2E : onboarding→mission→leçon→concept visuel→exercice→révision.

## 13. Accessibilité
Dès le début : contraste AA (verrouillé), titres, focus clavier web, cibles tactiles 44px, alternatives aux gestes,
**résumé textuel de chaque visuel/chart**, reduced motion, information jamais transmise par la seule couleur.

## 14. Analytics
Couche typée existante (privacy-first, opt-out). Ajouter au besoin : `concept_viewed`, `visual_viewed`,
`false_signal_identified`, `mastery_changed` — assainis, sans donnée personnelle/financière.

## 15. Risques
Volume de contenu (mitigation : lots + revue humaine, jamais auto-publié) ; performance SVG mobile
(mitigation : générateurs légers + datasets bornés + tests) ; dette de migration (mitigation : pont non destructif,
`GlossaryTerm` dérivé) ; conteneur éphémère (commits locaux, push sur accord) ; dérive de conformité (garde de vocabulaire testée).

## 16. Rollback
Chaque lot = commit réversible. Les nouveaux modèles/moteurs sont **additifs** ; l'écran glossaire reste
alimenté par la vue dérivée. Retirer un lot = revert du commit, sans perte de la progression utilisateur.

## 17. Décisions bloquantes (arrêt requis)
Clé/secret externe · compte Apple/Google · paiement réel · suppression importante de données ·
décision juridique/commerciale irréversible · **publication distante (push/PR)** · conflit avec du travail utilisateur.
Tout le reste est déductible du code et exécuté sans validation intermédiaire.

---
_Suivi d'exécution : `docs/PROJECT_STATUS.md` · reprise : `docs/PATTERNLAB_V5_CONTINUATION.md` (si interruption)._
