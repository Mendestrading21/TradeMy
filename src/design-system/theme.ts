/**
 * Trademy — Thème.
 * P0.1 : un seul thème « sombre premium » (l'identité de la marque).
 * Le thème clair est prévu mais différé (voir docs/CURRENT_STATE.md).
 */
import {
  colors,
  spacing,
  radius,
  typography,
  elevation,
  motion,
  opacity,
  borderWidth,
  touchTarget,
  zIndex,
} from './tokens';

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  elevation,
  // LOT 4 — jetons de fondation additionnels exposés sur le thème (rétro-compatible).
  motion,
  opacity,
  borderWidth,
  touchTarget,
  zIndex,
} as const;

export type Theme = typeof theme;

/** Hook d'accès au thème. Abstrait aujourd'hui pour permettre le multi-thème plus tard. */
export function useTheme(): Theme {
  return theme;
}
