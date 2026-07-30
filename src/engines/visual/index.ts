/** Moteur de visuels V5 — géométrie pure, datasets déterministes, composants SVG. */
export * from './candleGeometry';
export * from './visualDatasets';
export {
  CandlestickGlyphs,
  type Level,
  type Zone,
  type Guide,
  type GuidePoint,
  type Marker,
} from './components/CandlestickGlyphs';
export { CandleAnatomy } from './components/CandleAnatomy';
export { IndicatorPanel } from './components/IndicatorPanel';
export { OptionPayoff, type OptionKind } from './components/OptionPayoff';
export { VolumeProfile } from './components/VolumeProfile';
export { ComparisonVisual } from './components/ComparisonVisual';
export { CheatSheetVisual } from './components/CheatSheetVisual';
export { MechanismVisual } from './components/MechanismVisual';
export { MiniVisual } from './components/MiniVisual';
export { VisualCard } from './components/VisualCard';
export { FIGURE_OVERLAYS, figureOverlay, type FigureOverlay } from './figureOverlays';
export { RISK_SETUPS, riskSetup, type RiskSetup } from './riskSetups';
export { COMPARISONS, comparison, COMPARISON_BY_CONCEPT, comparisonForConcept, type Comparison, type ComparisonSide } from './comparisons';
export { CHEAT_SHEETS, cheatSheet, type CheatItem } from './cheatSheets';
export { MECHANISMS, mechanism, type Mechanism, type MechanismStep } from './mechanisms';
export { CHART_MODES, chartModeOptions, type ChartMode, type ChartModeOptions } from './chartMode';
export { INDICATOR_LABS, indicatorLabById, type IndicatorLab } from './indicatorLab';
export { buildVolumeProfile, type VolumeProfile as VolumeProfileData, type VolumeBin } from './volumeProfile';
export * from './indicatorMath';
export { INDICATOR_CONFIGS, indicatorConfig, type IndicatorConfig, type IndicatorKind } from './indicatorConfigs';
