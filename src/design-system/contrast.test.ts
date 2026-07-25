import { describe, it, expect } from '@jest/globals';
import { contrastRatio, relativeLuminance, meetsAA, hexToRgb, WCAG_AA_NORMAL } from './contrast';
import { colors } from './tokens';

describe('contrast (WCAG)', () => {
  it('calcule les cas de référence', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 0);
    expect(contrastRatio('#111111', '#111111')).toBeCloseTo(1, 5);
  });

  it('meetsAA distingue au-dessus/au-dessous du seuil', () => {
    expect(meetsAA('#FFFFFF', '#000000')).toBe(true);
    expect(meetsAA('#777777', '#808080')).toBe(false);
  });
});

const SURFACES = ['background', 'surface', 'surfaceElevated', 'surfaceInteractive'] as const;

describe('accessibilité de la palette Instrument Glass (AA ≥ 4.5)', () => {
  it.each(SURFACES)('textPrimary lisible sur %s', (s) => {
    expect(contrastRatio(colors.textPrimary, colors[s])).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });

  it.each(SURFACES)('textSecondary lisible sur %s', (s) => {
    expect(contrastRatio(colors.textSecondary, colors[s])).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });

  it.each(SURFACES)('textMuted lisible sur %s (captions incluses)', (s) => {
    expect(contrastRatio(colors.textMuted, colors[s])).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });

  it('les couleurs d’accent restent lisibles comme texte sur surface', () => {
    for (const accent of [colors.primary, colors.feedbackIncorrect, colors.warning, colors.technical, colors.reward]) {
      expect(contrastRatio(accent, colors.surface)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    }
  });

  it('les textes « on-couleur » des boutons sont lisibles', () => {
    expect(contrastRatio(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    expect(contrastRatio(colors.onReward, colors.reward)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    expect(contrastRatio(colors.onAdvanced, colors.advanced)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });
});

// ── Garantie AA exhaustive (verrouille toute la palette réellement utilisée) ──
// Toutes les couleurs de texte neutres doivent tenir l'AA sur TOUTES les surfaces,
// y compris les fonds profonds (graphiques, bandeaux) — pas seulement les cartes.
const ALL_SURFACES = [
  'background',
  'backgroundDeep',
  'surface',
  'surfaceElevated',
  'surfaceInteractive',
  'surfaceSunken',
] as const;

// Couleurs d'accent utilisées comme TEXTE/icône coloré (puces, statuts, légendes) —
// elles apparaissent sur les surfaces de carte/écran (background/surface/surfaceElevated).
const ACCENT_TEXT = ['primary', 'primaryBright', 'info', 'technical', 'warning', 'reward', 'neutral', 'advanced', 'bullish', 'bearish'] as const;
const CARD_SURFACES = ['background', 'surface', 'surfaceElevated'] as const;

describe('AA exhaustif — couleurs de texte neutres sur toutes les surfaces', () => {
  for (const fg of ['textPrimary', 'textSecondary', 'textMuted'] as const) {
    it.each(ALL_SURFACES)(`${fg} ≥ AA sur %s`, (s) => {
      expect(contrastRatio(colors[fg], colors[s])).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });
  }
});

describe('AA exhaustif — accents colorés comme texte sur les surfaces de carte', () => {
  for (const fg of ACCENT_TEXT) {
    it.each(CARD_SURFACES)(`${fg} ≥ AA sur %s`, (s) => {
      expect(contrastRatio(colors[fg], colors[s])).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });
  }
});

// ── LOT 4-A — surfaces d'état (sélection/verrou) : AA VÉRIFIÉ, pas seulement affirmé ──
// La doc ne doit jamais prétendre « AA partout » sans ce verrou. On teste texte neutre + accents
// réellement susceptibles d'apparaître comme texte/icône sur une surface sélectionnée/verrouillée,
// y compris les couleurs de MARCHÉ (bullish/bearish) et la MAÎTRISE.
const STATE_SURFACES = ['surfaceSelected', 'surfaceLocked'] as const;
const STATE_FG = [
  'textPrimary',
  'textSecondary',
  'textMuted',
  'primary',
  'technical',
  'reward',
  'bullish',
  'bearish',
  'mastery',
] as const;

describe('AA — surfaces d’état LOT 4 (surfaceSelected / surfaceLocked)', () => {
  for (const fg of STATE_FG) {
    it.each(STATE_SURFACES)(`${fg} ≥ AA sur %s`, (s) => {
      expect(contrastRatio(colors[fg], colors[s])).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });
  }
});
