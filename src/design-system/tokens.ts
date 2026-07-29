/**
 * Trademy — Design tokens « Trademy Learning Glass ».
 * Référence canonique : `docs/design/TRADEMY_LEARNING_GLASS.md`.
 *
 * Direction : académie sombre premium, surfaces de verre discrètes, halos maîtrisés,
 * bordures fines. La couleur est SÉMANTIQUE et ne se réinterprète jamais localement :
 *   - violet  = marque et action (CTA) ;
 *   - vert    = marché HAUSSIER uniquement ;
 *   - rouge   = marché BAISSIER uniquement ;
 *   - or      = zones importantes ;
 *   - cyan    = annotations techniques.
 *
 * IMPORTANT (règle kit) : la sémantique PÉDAGOGIQUE (correct/incorrect) est distincte de
 * la sémantique de MARCHÉ (haussier/baissier). Une bonne réponse n'est PAS une bougie verte :
 * les tokens `feedback*` utilisent des teintes propres (menthe/rose), séparées de `bullish/bearish`.
 *
 * Accessibilité : les paires texte/surface visent le contraste WCAG AA (≥ 4.5), y compris
 * la marque violette comme texte coloré. Vérifié par `contrast.test.ts` — ne pas assombrir
 * un texte ni éclaircir une surface sans revalider.
 */

export const palette = {
  // Surfaces nuit premium (canvas ≈ #080A12, cartes ≈ #101421) — Trademy Learning Glass
  backgroundDeep: '#05070E',
  bg: '#0A0D16',
  surface: '#101421',
  surfaceElevated: '#171C2B',
  surfaceInteractive: '#1F2536',
  surfaceSunken: '#05070C',
  // LOT 4 — états de surface explicites (sélection / verrou), distincts de `interactive`.
  // `surfaceSelected` assombri (#181F30) pour tenir le contraste AA des accents/texte posés dessus
  // (violet, texte atténué, marché) — vérifié par contrast.test.ts.
  surfaceSelected: '#181F30',
  surfaceLocked: '#0C111C',

  // Bordures / verre contrôlé
  borderSubtle: '#232B3F',
  borderStrong: '#38435E',
  hairline: 'rgba(247, 248, 252, 0.06)',
  // Verre : voile clair très léger + liseré fin (≈ 7 % d'opacité).
  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',

  // Texte (AA sur toutes les surfaces, y compris fonds profonds — cf. contrast.test.ts)
  textPrimary: '#F7F8FC',
  textSecondary: '#AEB6C7',
  textMuted: '#9098AC',

  // Marque (violet) — CTA / action. Ni marché, ni bonne réponse.
  // Teinte AA-ajustée de la référence #8B5CF6 : lisible comme TEXTE sur carte ET comme
  // fond de bouton (texte sombre `onViolet`).
  violet: '#9270F0',
  violetBright: '#A78BFA',
  violetDim: '#6D48D0',
  onViolet: '#16082C',

  // Marché : vert = haussier, rouge = baissier (jamais réutilisés comme correct/incorrect)
  green: '#2DD4A7',
  greenBright: '#4EE7BE',
  greenDim: '#1F9E7C',
  red: '#FF5D73',
  redBright: '#FF8091',

  // Annotation technique (cyan) + vigilance (orange) + zones/récompenses (or).
  // `amber` et `gold` restent volontairement distincts : une révision due n'est pas un checkpoint.
  technical: '#22D3EE',
  amber: '#F09A5A',
  gold: '#F6C453',
  neutral: '#93A0B4',
  // Concepts avancés (difficulté 4–5) : orchidée distincte de la marque violette.
  advanced: '#C084FC',

  // Feedback pédagogique — teintes propres, distinctes du marché.
  feedbackCorrect: '#66E3A4',
  feedbackWrong: '#FF8798',
  feedbackInfo: '#6EA8FE',

  white: '#FFFFFF',
  black: '#000000',
  onGreen: '#04231A',
  onGold: '#2A1E05',
  onAdvanced: '#2A1044',
} as const;

export const colors = {
  background: palette.bg,
  backgroundDeep: palette.backgroundDeep,
  surface: palette.surface,
  surfaceElevated: palette.surfaceElevated,
  surfaceInteractive: palette.surfaceInteractive,
  surfaceSunken: palette.surfaceSunken,
  // LOT 4 — surfaces d'état + anneau de focus visible (clavier web / navigation lecteur d'écran).
  surfaceSelected: palette.surfaceSelected,
  surfaceLocked: palette.surfaceLocked,
  focusRing: palette.violetBright,
  border: palette.borderSubtle,
  borderSubtle: palette.borderSubtle,
  borderStrong: palette.borderStrong,
  hairline: palette.hairline,
  glass: palette.glass,
  glassBorder: palette.glassBorder,

  textPrimary: palette.textPrimary,
  textSecondary: palette.textSecondary,
  textMuted: palette.textMuted,

  // UI semantics — la marque est VIOLETTE (action/CTA)
  primary: palette.violet,
  primaryBright: palette.violetBright,
  primaryDim: palette.violetDim,
  /** Succès pédagogique / état positif — teinte propre, distincte d'une bougie haussière. */
  success: palette.feedbackCorrect,
  danger: palette.red,
  warning: palette.amber,
  /** Information (bleu) — distinct du cyan d'annotation technique. */
  info: palette.feedbackInfo,
  technical: palette.technical,
  reward: palette.gold,
  neutral: palette.neutral,
  /** Concepts avancés (difficulté 4–5, familles expertes) — jamais une direction financière. */
  advanced: palette.advanced,
  /**
   * Maîtrise pédagogique (accomplissement d'apprentissage) — teinte de MARQUE dédiée, JAMAIS une
   * couleur de marché. Distincte de bullish/bearish (direction) et de feedbackCorrect/Incorrect.
   */
  mastery: palette.violetBright,

  // Financial semantics (chart direction) — NOT to be reused as correct/incorrect
  bullish: palette.green,
  bearish: palette.red,

  // LOT 4 — sémantique d'ÉTAT DE MARCHÉ pédagogique (setup, zone, invalidation, faux signal).
  // Dérivée de la palette AA existante. La COULEUR N'EST JAMAIS le seul signal : `MarketStatePill`
  // porte toujours une icône + une forme + un libellé. Distincte du feedback (correct/incorrect).
  confirmation: palette.technical, // zone de confirmation = annotation technique (cyan)
  invalidation: palette.gold, // niveau d'invalidation = zone importante (or), jamais « baissier »
  falseSignal: palette.neutral, // faux signal = neutre + motif barré (leurre, ni haussier ni baissier)

  // Pedagogical feedback — intentionally distinct from bullish/bearish
  feedbackCorrect: palette.feedbackCorrect,
  feedbackIncorrect: palette.feedbackWrong,

  onPrimary: palette.onViolet,
  onReward: palette.onGold,
  onAdvanced: palette.onAdvanced,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 26,
  pill: 999,
} as const;

/** Ombres portées (profondeur « verre » discrète, contrôlée). Compatibles iOS/Android/web. */
export const elevation = {
  none: {},
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  raised: {
    shadowColor: '#000000',
    shadowOpacity: 0.42,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
} as const;

export type Elevation = keyof typeof elevation;

/**
 * Opacités sémantiques (LOT 4). Le « verre » reste discret : voile ≈ 6 %, liseré ≈ 12 %.
 * `disabled`/`muted` pilotent les états inactifs ; `scrim` assombrit un fond sous une couche.
 */
export const opacity = {
  disabled: 0.4,
  muted: 0.6,
  glass: 0.06,
  glassBorder: 0.12,
  scrim: 0.7,
  full: 1,
} as const;

export type OpacityToken = keyof typeof opacity;

/** Épaisseurs de bordure normalisées (fines par principe « verre contrôlé »). */
export const borderWidth = {
  thin: 1,
  regular: 1.5,
  thick: 2,
} as const;

export type BorderWidthToken = keyof typeof borderWidth;

/** Cible tactile minimale (miroir de `A11Y.minTouchTarget`, exposé comme jeton de layout). */
export const touchTarget = { min: 44 } as const;

/** Couches d'empilement nommées — évite les z-index magiques dispersés. */
export const zIndex = {
  base: 0,
  raised: 1,
  sticky: 10,
  overlay: 100,
  toast: 1000,
} as const;

export type ZIndexToken = keyof typeof zIndex;

export type FontWeight = '400' | '500' | '600' | '700' | '800';

export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800' as FontWeight, letterSpacing: -0.5 },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: '700' as FontWeight, letterSpacing: -0.3 },
  h2: { fontSize: 21, lineHeight: 27, fontWeight: '700' as FontWeight },
  title: { fontSize: 17, lineHeight: 23, fontWeight: '600' as FontWeight },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as FontWeight },
  label: { fontSize: 13, lineHeight: 17, fontWeight: '600' as FontWeight, letterSpacing: 0.2 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as FontWeight },
} as const;

export type TypographyVariant = keyof typeof typography;

/**
 * Durées de mouvement (Trademy Learning Glass). Le mouvement EXPLIQUE (apparition d'une zone,
 * progression, réaction mascotte) ; jamais de boucle décorative permanente. Sous
 * `prefers-reduced-motion`, préférer un changement instantané ou un fondu léger.
 */
export const motion = {
  // Aliases historiques (conservés pour compatibilité des consommateurs existants).
  micro: 150,
  transition: 260,
  // Échelle canonique (Toto/Bobo motion system) — le mouvement EXPLIQUE, jamais décoratif.
  /** Retour visuel/tactile immédiat (< 120 ms) : sélection, tap. */
  instant: 100,
  /** Réaction courte : pop d'état, apparition d'annotation. */
  fast: 200,
  /** Transition standard : changement de scène mascotte, révélation. */
  standard: 300,
  /** Réaction expressive : bonne réponse, encouragement. */
  expressive: 550,
  /** Célébration forte (checkpoint, niveau) — plafonnée. */
  celebration: 720,
} as const;

export type MotionToken = keyof typeof motion;
