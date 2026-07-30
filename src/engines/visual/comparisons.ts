/**
 * Registre des comparaisons (type visuel `comparison`) — deux schémas côte à côte,
 * chacun renvoyant à un dataset OHLC déterministe + une légende. Aucune donnée réelle.
 */
export interface ComparisonSide {
  datasetKey: string;
  caption: string;
}
export interface Comparison {
  left: ComparisonSide;
  right: ComparisonSide;
}

export const COMPARISONS: Record<string, Comparison> = {
  'bull-vs-bear': {
    left: { datasetKey: 'candle.bullish-marubozu.v1', caption: 'Haussière (verte)' },
    right: { datasetKey: 'candle.bearish-marubozu.v1', caption: 'Baissière (rouge)' },
  },
  'trend-vs-range': {
    left: { datasetKey: 'structure.uptrend.v1', caption: 'Tendance' },
    right: { datasetKey: 'structure.support-resistance.v1', caption: 'Range' },
  },
  'doji-vs-marubozu': {
    left: { datasetKey: 'candle.doji.v1', caption: 'Indécision (doji)' },
    right: { datasetKey: 'candle.bullish-marubozu.v1', caption: 'Conviction (marubozu)' },
  },
  'uptrend-vs-downtrend': {
    left: { datasetKey: 'structure.uptrend.v1', caption: 'Haussière' },
    right: { datasetKey: 'structure.downtrend.v1', caption: 'Baissière' },
  },
};

export function comparison(variant: string): Comparison | undefined {
  return COMPARISONS[variant];
}

/**
 * LOT W2 — comparaison recommandée par fiche concept : quand une notion se comprend le mieux
 * PAR CONTRASTE (indécision vs conviction, tendance vs range…), sa fiche montre la paire.
 * Mapping explicite et minimal (jamais dérivé automatiquement) — chaque clé est verrouillée
 * par test : le concept existe ET la comparaison existe.
 */
export const COMPARISON_BY_CONCEPT: Record<string, string> = {
  'concept.candle-anatomy': 'bull-vs-bear',
  'concept.doji': 'doji-vs-marubozu',
  'concept.marubozu': 'doji-vs-marubozu',
  'concept.uptrend': 'uptrend-vs-downtrend',
  'concept.downtrend': 'uptrend-vs-downtrend',
  'concept.range': 'trend-vs-range',
};

/** Comparaison recommandée d'un concept (id) — undefined si la fiche n'en a pas. */
export function comparisonForConcept(conceptId: string): Comparison | undefined {
  const key = COMPARISON_BY_CONCEPT[conceptId];
  return key ? COMPARISONS[key] : undefined;
}
