import { type ReactNode } from 'react';
import Svg, { Path, Circle, Line, Rect, Polyline, Polygon } from 'react-native-svg';
import { theme } from '../theme';

/**
 * Système d'icônes Trademy — vecteurs 2D ORIGINAUX, monochromes, trait uniforme.
 * Aucune icône n'est copiée d'un pack externe. Grille 24×24, coins arrondis, poids de
 * trait cohérent. Les icônes de navigation et d'action utilisent ce système (jamais un
 * emoji système comme substitut permanent). Réf. : docs/design/TRADEMY_LEARNING_GLASS.md.
 */
export type TrademyIconName =
  // Navigation (cinq espaces)
  | 'home'
  | 'learn'
  | 'library'
  | 'lab'
  | 'profile'
  // Actions / statut
  | 'search'
  | 'star'
  | 'star-filled'
  | 'chevron-right'
  | 'chevron-left'
  | 'close'
  | 'check'
  | 'lock'
  | 'play'
  | 'refresh'
  | 'chart'
  | 'flame'
  | 'trophy'
  | 'bolt'
  | 'target'
  | 'info'
  | 'settings'
  | 'heart'
  | 'book'
  // LOT 4 — progression & apprentissage (progression = APPRENTISSAGE, jamais une direction de marché)
  | 'review'
  | 'unlocked'
  | 'progression'
  | 'checkpoint'
  | 'mastery'
  | 'hint'
  | 'success'
  | 'error'
  | 'warning'
  // LOT 4 — pédagogie du marché (famille B, monochrome ici ; le graphique exact reste vectoriel)
  // DIRECTIONS symétriques : flèches neutres, jamais « croissance » vs « chute » (aucune morale).
  | 'market-up'
  | 'market-down'
  | 'volume'
  | 'support'
  | 'resistance'
  | 'confirmation'
  | 'invalidation'
  | 'false-signal'
  | 'risk'
  | 'psychology'
  // LOT 4-B — application Accueil (canon TradeMy Learning Glass, géométrie originale)
  | 'timer'
  | 'coin';

type Parts = { color: string; sw: number };

const stroke = (color: string, sw: number) => ({
  stroke: color,
  strokeWidth: sw,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
});

/** Géométrie originale de chaque icône (viewBox 0 0 24 24). */
const ICONS: Record<TrademyIconName, (p: Parts) => ReactNode> = {
  home: ({ color, sw }) => (
    <>
      <Polyline points="3,11.5 12,4 21,11.5" {...stroke(color, sw)} />
      <Path d="M5.5 10.5V20h13v-9.5" {...stroke(color, sw)} />
      <Path d="M10 20v-5h4v5" {...stroke(color, sw)} />
    </>
  ),
  learn: ({ color, sw }) => (
    // Roadmap : parcours sinueux ponctué de jalons.
    <>
      <Path d="M6 20c0-4 12-4 12-8" {...stroke(color, sw)} />
      <Circle cx="6" cy="20" r="2" {...stroke(color, sw)} />
      <Circle cx="12" cy="14" r="2" {...stroke(color, sw)} />
      <Circle cx="18" cy="6" r="2" {...stroke(color, sw)} />
    </>
  ),
  library: ({ color, sw }) => (
    // Livre ouvert (bibliothèque).
    <>
      <Path d="M12 6C10 4.6 6.5 4.6 4 6v12c2.5-1.6 6-1.6 8 0" {...stroke(color, sw)} />
      <Path d="M12 6c2-1.4 5.5-1.4 8 0v12c-2.5-1.6-6-1.6-8 0" {...stroke(color, sw)} />
      <Line x1="12" y1="6" x2="12" y2="18" {...stroke(color, sw)} />
    </>
  ),
  lab: ({ color, sw }) => (
    // Fiole de laboratoire.
    <>
      <Path d="M9.5 3h5" {...stroke(color, sw)} />
      <Path d="M10.5 3v6L6 18.2A1.6 1.6 0 0 0 7.4 20.6h9.2A1.6 1.6 0 0 0 18 18.2L13.5 9V3" {...stroke(color, sw)} />
      <Line x1="8.3" y1="14" x2="15.7" y2="14" {...stroke(color, sw)} />
    </>
  ),
  profile: ({ color, sw }) => (
    <>
      <Circle cx="12" cy="8" r="3.4" {...stroke(color, sw)} />
      <Path d="M5.5 20c0-3.7 3-6 6.5-6s6.5 2.3 6.5 6" {...stroke(color, sw)} />
    </>
  ),
  search: ({ color, sw }) => (
    <>
      <Circle cx="11" cy="11" r="6" {...stroke(color, sw)} />
      <Line x1="20" y1="20" x2="15.5" y2="15.5" {...stroke(color, sw)} />
    </>
  ),
  star: ({ color, sw }) => (
    <Polygon
      points="12,3 14.6,9 21,9.6 16.2,14 17.7,20.3 12,17 6.3,20.3 7.8,14 3,9.6 9.4,9"
      {...stroke(color, sw)}
    />
  ),
  'star-filled': ({ color }) => (
    <Polygon
      points="12,3 14.6,9 21,9.6 16.2,14 17.7,20.3 12,17 6.3,20.3 7.8,14 3,9.6 9.4,9"
      fill={color}
      stroke={color}
      strokeWidth={1}
      strokeLinejoin="round"
    />
  ),
  'chevron-right': ({ color, sw }) => (
    <Polyline points="9,5 16,12 9,19" {...stroke(color, sw)} />
  ),
  'chevron-left': ({ color, sw }) => (
    <Polyline points="15,5 8,12 15,19" {...stroke(color, sw)} />
  ),
  close: ({ color, sw }) => (
    <>
      <Line x1="6" y1="6" x2="18" y2="18" {...stroke(color, sw)} />
      <Line x1="18" y1="6" x2="6" y2="18" {...stroke(color, sw)} />
    </>
  ),
  check: ({ color, sw }) => (
    <Polyline points="5,12.5 10,17.5 19,6.5" {...stroke(color, sw)} />
  ),
  lock: ({ color, sw }) => (
    <>
      <Rect x="5" y="11" width="14" height="9" rx="2" {...stroke(color, sw)} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" {...stroke(color, sw)} />
    </>
  ),
  play: ({ color, sw }) => (
    <Path d="M8 5.5v13l11-6.5z" {...stroke(color, sw)} />
  ),
  refresh: ({ color, sw }) => (
    <>
      <Path d="M20 12a8 8 0 1 1-2.3-5.6" {...stroke(color, sw)} />
      <Polyline points="20,4 20,7 17,7" {...stroke(color, sw)} />
    </>
  ),
  chart: ({ color, sw }) => (
    // Chandeliers stylisés (axe + deux bougies).
    <>
      <Path d="M4 4v16h16" {...stroke(color, sw)} />
      <Line x1="9" y1="6" x2="9" y2="16" {...stroke(color, sw)} />
      <Rect x="7.4" y="8.5" width="3.2" height="5" rx="0.8" {...stroke(color, sw)} />
      <Line x1="15" y1="7" x2="15" y2="17" {...stroke(color, sw)} />
      <Rect x="13.4" y="10.5" width="3.2" height="4.5" rx="0.8" {...stroke(color, sw)} />
    </>
  ),
  flame: ({ color, sw }) => (
    <Path
      d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1.4.6-2.3 1.3-3 .2 1 .9 1.6 1.7 1.6C11.2 8.6 10 6.6 12 3z"
      {...stroke(color, sw)}
    />
  ),
  trophy: ({ color, sw }) => (
    <>
      <Path d="M7 4h10v4a5 5 0 0 1-10 0z" {...stroke(color, sw)} />
      <Path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" {...stroke(color, sw)} />
      <Line x1="12" y1="13" x2="12" y2="17" {...stroke(color, sw)} />
      <Path d="M8.5 20h7M9.5 20v-2h5v2" {...stroke(color, sw)} />
    </>
  ),
  bolt: ({ color, sw }) => (
    <Path d="M13 2 5 13.5h5l-1 8.5 8-12h-5z" {...stroke(color, sw)} />
  ),
  target: ({ color, sw }) => (
    <>
      <Circle cx="12" cy="12" r="8" {...stroke(color, sw)} />
      <Circle cx="12" cy="12" r="4" {...stroke(color, sw)} />
      <Circle cx="12" cy="12" r="0.6" fill={color} stroke={color} />
    </>
  ),
  info: ({ color, sw }) => (
    <>
      <Circle cx="12" cy="12" r="8.5" {...stroke(color, sw)} />
      <Line x1="12" y1="11" x2="12" y2="16.5" {...stroke(color, sw)} />
      <Circle cx="12" cy="7.8" r="0.7" fill={color} stroke={color} />
    </>
  ),
  settings: ({ color, sw }) => (
    // Curseurs (réglages) — lisible en petit, distinct d'un engrenage bruité.
    <>
      <Line x1="4" y1="8" x2="20" y2="8" {...stroke(color, sw)} />
      <Line x1="4" y1="16" x2="20" y2="16" {...stroke(color, sw)} />
      <Circle cx="9" cy="8" r="2.2" {...stroke(color, sw)} fill={theme.colors.surface} />
      <Circle cx="15" cy="16" r="2.2" {...stroke(color, sw)} fill={theme.colors.surface} />
    </>
  ),
  heart: ({ color, sw }) => (
    <Path
      d="M12 20S4 15 4 9.2A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 8 2.2C20 15 12 20 12 20z"
      {...stroke(color, sw)}
    />
  ),
  book: ({ color, sw }) => (
    <>
      <Path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" {...stroke(color, sw)} />
      <Path d="M18 16H7a2 2 0 0 0-2 2" {...stroke(color, sw)} />
    </>
  ),

  // ── LOT 4 — progression & apprentissage ──
  review: ({ color, sw }) => (
    // Deux arcs formant un cycle (révision espacée : on y revient).
    <>
      <Path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3" {...stroke(color, sw)} />
      <Polyline points="17.5,3.5 17.5,7 14,7" {...stroke(color, sw)} />
      <Path d="M19.5 12a7.5 7.5 0 0 1-12.8 5.3" {...stroke(color, sw)} />
      <Polyline points="6.5,20.5 6.5,17 10,17" {...stroke(color, sw)} />
    </>
  ),
  unlocked: ({ color, sw }) => (
    // Cadenas ouvert (anse relevée).
    <>
      <Rect x="5" y="11" width="14" height="9" rx="2" {...stroke(color, sw)} />
      <Path d="M8 11V8a4 4 0 0 1 7.6-1.7" {...stroke(color, sw)} />
    </>
  ),
  progression: ({ color, sw }) => (
    // Courbe ascendante ponctuée + flèche (progression réelle, jamais un cours de marché).
    <>
      <Polyline points="4,19 9,14 13,16 20,7" {...stroke(color, sw)} />
      <Polyline points="15,7 20,7 20,12" {...stroke(color, sw)} />
    </>
  ),
  'market-up': ({ color, sw }) => (
    // Flèche diagonale NEUTRE vers le haut (DIRECTION haussière — ni réussite, ni valeur).
    <>
      <Line x1="5" y1="19" x2="19" y2="5" {...stroke(color, sw)} />
      <Polyline points="10,5 19,5 19,14" {...stroke(color, sw)} />
    </>
  ),
  'market-down': ({ color, sw }) => (
    // Flèche diagonale NEUTRE vers le bas, strictement symétrique (DIRECTION baissière — ni échec, ni punition).
    <>
      <Line x1="5" y1="5" x2="19" y2="19" {...stroke(color, sw)} />
      <Polyline points="10,19 19,19 19,10" {...stroke(color, sw)} />
    </>
  ),
  checkpoint: ({ color, sw }) => (
    // Drapeau de jalon (point de contrôle).
    <>
      <Line x1="6" y1="3.5" x2="6" y2="20.5" {...stroke(color, sw)} />
      <Path d="M6 4.5h11l-2.4 3.4L17 11.5H6z" {...stroke(color, sw)} />
    </>
  ),
  mastery: ({ color, sw }) => (
    // Bouclier + coche (maîtrise démontrée, protégée).
    <>
      <Path d="M12 3.2 19 6v5c0 4.4-3 7.6-7 9.6-4-2-7-5.2-7-9.6V6z" {...stroke(color, sw)} />
      <Polyline points="8.8,12 11,14.2 15.4,9.5" {...stroke(color, sw)} />
    </>
  ),
  hint: ({ color, sw }) => (
    // Ampoule (indice).
    <>
      <Path d="M9 15.5a5 5 0 1 1 6 0c-.7.6-1 1.2-1 2h-4c0-.8-.3-1.4-1-2z" {...stroke(color, sw)} />
      <Line x1="10" y1="20" x2="14" y2="20" {...stroke(color, sw)} />
    </>
  ),
  success: ({ color, sw }) => (
    <>
      <Circle cx="12" cy="12" r="8.5" {...stroke(color, sw)} />
      <Polyline points="8,12.3 11,15.3 16,9" {...stroke(color, sw)} />
    </>
  ),
  error: ({ color, sw }) => (
    <>
      <Circle cx="12" cy="12" r="8.5" {...stroke(color, sw)} />
      <Line x1="9" y1="9" x2="15" y2="15" {...stroke(color, sw)} />
      <Line x1="15" y1="9" x2="9" y2="15" {...stroke(color, sw)} />
    </>
  ),
  warning: ({ color, sw }) => (
    <>
      <Path d="M12 4 21 19H3z" {...stroke(color, sw)} />
      <Line x1="12" y1="10" x2="12" y2="14.5" {...stroke(color, sw)} />
      <Circle cx="12" cy="16.8" r="0.7" fill={color} stroke={color} />
    </>
  ),

  // ── LOT 4 — pédagogie du marché ──
  volume: ({ color, sw }) => (
    // Histogramme de volume (barres sur un axe).
    <>
      <Line x1="4" y1="20" x2="20" y2="20" {...stroke(color, sw)} />
      <Rect x="5.4" y="12" width="2.6" height="6" rx="0.6" {...stroke(color, sw)} />
      <Rect x="10.7" y="8" width="2.6" height="10" rx="0.6" {...stroke(color, sw)} />
      <Rect x="16" y="14" width="2.6" height="4" rx="0.6" {...stroke(color, sw)} />
    </>
  ),
  support: ({ color, sw }) => (
    // Plancher (niveau bas) + rebond vers le haut.
    <>
      <Line x1="4" y1="17.5" x2="20" y2="17.5" {...stroke(color, sw)} />
      <Line x1="12" y1="15.5" x2="12" y2="7" {...stroke(color, sw)} />
      <Polyline points="9,10 12,7 15,10" {...stroke(color, sw)} />
    </>
  ),
  resistance: ({ color, sw }) => (
    // Plafond (niveau haut) + rejet vers le bas.
    <>
      <Line x1="4" y1="6.5" x2="20" y2="6.5" {...stroke(color, sw)} />
      <Line x1="12" y1="8.5" x2="12" y2="17" {...stroke(color, sw)} />
      <Polyline points="9,14 12,17 15,14" {...stroke(color, sw)} />
    </>
  ),
  confirmation: ({ color, sw }) => (
    // Prix qui franchit un niveau + point de confirmation marqué.
    <>
      <Line x1="4" y1="14" x2="20" y2="14" {...stroke(color, sw)} />
      <Polyline points="5,19 11,13 14,15 20,6" {...stroke(color, sw)} />
      <Circle cx="12.5" cy="14" r="1.5" fill={color} stroke={color} />
    </>
  ),
  invalidation: ({ color, sw }) => (
    // Niveau barré d'une croix (scénario invalidé).
    <>
      <Line x1="4" y1="12" x2="20" y2="12" {...stroke(color, sw)} />
      <Line x1="9" y1="9" x2="15" y2="15" {...stroke(color, sw)} />
      <Line x1="15" y1="9" x2="9" y2="15" {...stroke(color, sw)} />
    </>
  ),
  'false-signal': ({ color, sw }) => (
    // Bougie traversée d'une barre oblique (leurre).
    <>
      <Line x1="12" y1="4.5" x2="12" y2="19.5" {...stroke(color, sw)} />
      <Rect x="9.5" y="8" width="5" height="8" rx="1" {...stroke(color, sw)} />
      <Line x1="5.5" y1="19" x2="18.5" y2="5" {...stroke(color, sw)} />
    </>
  ),
  risk: ({ color, sw }) => (
    // Balance (risque / rendement, gestion du risque).
    <>
      <Line x1="12" y1="4" x2="12" y2="20" {...stroke(color, sw)} />
      <Line x1="5" y1="7" x2="19" y2="7" {...stroke(color, sw)} />
      <Path d="M5 7 3 11.2a2.3 2.3 0 0 0 4 0z" {...stroke(color, sw)} />
      <Path d="M19 7l-2 4.2a2.3 2.3 0 0 0 4 0z" {...stroke(color, sw)} />
      <Line x1="9.5" y1="20" x2="14.5" y2="20" {...stroke(color, sw)} />
    </>
  ),
  psychology: ({ color, sw }) => (
    // Tête + boucle de pensée (psychologie du trader).
    <>
      <Circle cx="11" cy="11" r="6.8" {...stroke(color, sw)} />
      <Path d="M11 7.6a2.5 2.5 0 0 1 1.7 4.4c-.8.6-1.2 1-1.2 2" {...stroke(color, sw)} />
      <Circle cx="11" cy="16.2" r="0.7" fill={color} stroke={color} />
    </>
  ),

  // ── LOT 4-B — Accueil ──
  timer: ({ color, sw }) => (
    // Minuteur : cadran + aiguille + poussoir (durée de la mission du jour).
    <>
      <Circle cx="12" cy="13.5" r="7" {...stroke(color, sw)} />
      <Line x1="12" y1="13.5" x2="12" y2="9.5" {...stroke(color, sw)} />
      <Line x1="12" y1="13.5" x2="14.5" y2="15" {...stroke(color, sw)} />
      <Line x1="9.5" y1="3.5" x2="14.5" y2="3.5" {...stroke(color, sw)} />
      <Line x1="12" y1="3.5" x2="12" y2="6.5" {...stroke(color, sw)} />
    </>
  ),
  coin: ({ color, sw }) => (
    // Jeton (pièce d'apprentissage) : disque + anneau intérieur + marque centrale.
    <>
      <Circle cx="12" cy="12" r="8" {...stroke(color, sw)} />
      <Circle cx="12" cy="12" r="4.6" {...stroke(color, sw)} />
      <Line x1="12" y1="9.6" x2="12" y2="14.4" {...stroke(color, sw)} />
    </>
  ),
};

/** Liste stable des noms d'icônes (source de vérité pour les tests d'exhaustivité). */
export const TRADEMY_ICON_NAMES = Object.keys(ICONS) as TrademyIconName[];

export type TrademyIconProps = {
  name: TrademyIconName;
  size?: number;
  color?: string;
  /** Épaisseur du trait (avant mise à l'échelle). Défaut 2. */
  strokeWidth?: number;
  /**
   * Étiquette accessible. Par défaut l'icône est décorative (masquée aux lecteurs
   * d'écran) car elle accompagne un libellé ; fournir `title` pour une icône autonome.
   */
  title?: string;
};

export function TrademyIcon({
  name,
  size = 24,
  color = theme.colors.textPrimary,
  strokeWidth = 2,
  title,
}: TrademyIconProps) {
  const decorative = !title;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={title}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
    >
      {ICONS[name]({ color, sw: strokeWidth })}
    </Svg>
  );
}
