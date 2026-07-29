# Trademy Learning Glass — design system canonique

## Principe

Une académie sombre, premium et vivante : rigueur de TradingView/Bloomberg, simplicité de Duolingo et surfaces de verre colorées originales. Les références externes sont des inspirations de densité, profondeur et convivialité ; aucun pack, filigrane, logo ou illustration externe ne doit être copié.

## Hiérarchie visuelle

- Fond principal nuit, presque noir, légèrement bleuté.
- Cartes profondes, arrondies, bordées d’un trait clair très discret.
- Une lumière colorée localisée par carte, jamais un arc-en-ciel permanent.
- Données et graphiques nets ; effets glass uniquement autour, jamais sur l’information critique.
- Grands titres compacts, corps très lisible, chiffres tabulaires.
- Espacement généreux, grille de 4 px, zones tactiles de 44 px minimum.

## Tokens sémantiques

| Token | Valeur de départ | Usage |
|---|---:|---|
| background.canvas | #080A12 | fond global |
| background.elevated | #101421 | cartes |
| surface.glass | rgba(255,255,255,0.07) | verre |
| border.subtle | rgba(255,255,255,0.12) | contours |
| text.primary | #F7F8FC | titres |
| text.secondary | #A9B0C3 | explications |
| brand.primary | #8B5CF6 | marque, CTA principal |
| brand.cyan | #22D3EE | annotations techniques |
| market.bull | #2DD4A7 | marché haussier uniquement |
| market.bear | #FF5D73 | marché baissier uniquement |
| market.zone | #F6C453 | zones importantes |
| feedback.correct | #66E3A4 | bonne réponse |
| feedback.wrong | #FF8798 | erreur pédagogique |
| feedback.info | #6EA8FE | information |
| feedback.warning | #F09A5A | vigilance et révision due, distinctes d’un checkpoint |

Le vert et le rouge ne servent jamais à la navigation générale. Ils décrivent le marché. Une bonne réponse utilise feedback.correct afin d’éviter toute confusion avec une bougie haussière.

## Typographie

Utiliser une seule famille sans-serif compatible avec la stack actuelle, avec fallback système. Ne pas ajouter une police distante sans preuve de licence, coût acceptable et fonctionnement offline.

- Display : 32/38, 700–800.
- H1 : 28/34, 700.
- H2 : 22/28, 700.
- Body : 16/24, 400–500.
- Caption : 13/18, 500.
- Data : chiffres tabulaires, 600–700.

## Formes

- Rayon petite puce : 10–12.
- Bouton : 14–16.
- Carte standard : 20.
- Carte héro : 24–28.
- Ombres rares ; préférer bordure, contraste et halo interne.
- Icônes avec le même poids de trait, coins arrondis et boîte optique.

## Iconographie originale

Trois niveaux seulement :

1. **Navigation :** icônes vectorielles 2D monochromes originales.
2. **Pédagogie :** pictogrammes 2D colorés et schémas de marché codés en SVG.
3. **Moments forts :** illustrations Toto/Bobo ou objets 3D maison, parcimonieux.

Interdit : emojis système comme icônes principales, packs incohérents, filigranes, symboles BUY/SELL, styles 3D mélangés au hasard.

## Graphiques pédagogiques

Chaque graphique doit avoir :

- axes ou repères compréhensibles ;
- légende explicite ;
- couleurs sémantiques ;
- annotations cyan ;
- zone importante or ;
- titre et objectif pédagogique ;
- état vide et dataset déterministe ;
- description accessible ;
- mode reduced-motion ;
- exemple et faux signal.

Modes canoniques : **statique, guidé, interactif, aveugle**. Le mode aveugle masque réellement labels et indices.

## Composants obligatoires

- AppShell, TopBar et TabBar.
- BrandMark/Wordmark.
- PrimaryButton, SecondaryButton, IconButton.
- LearningCard, HeroCard, StatCard, ConceptCard.
- ProgressRing, ProgressBar, MasteryBadge.
- MarketChartCard, AnnotationChip, Legend.
- MascotMoment, DialogueBubble.
- QuizOption, FeedbackPanel.
- EmptyState, ErrorState, OfflineState, LockedState, PremiumState.
- BottomSheet/Modal et Toast accessibles.

Chaque composant doit être documenté par ses variantes, états, accessibilité et usage interdit.

## Mouvement

Durées : micro 120–180 ms, transition 220–320 ms, célébration courte < 900 ms. Le mouvement explique : apparition d’une zone, progression, réaction mascotte. Pas de boucle décorative permanente. Avec reduced-motion, remplacer par changement instantané ou fondu léger.

## Règles d’écran

- Une intention principale.
- Maximum trois niveaux de hiérarchie visibles.
- Aucun texte sur halo peu contrasté.
- Aucun scroll horizontal caché.
- États loading/vide/erreur/offline prévus dès le composant.
- Contraste WCAG AA, focus web visible, labels lecteurs d’écran.
- Vérification mobile 390 × 844, petit écran et web large.
