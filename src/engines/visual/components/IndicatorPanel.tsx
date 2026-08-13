import { View } from 'react-native';
import Svg, { Rect, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { colors } from '../../../design-system/tokens';
import { priceScale } from '../../pattern/interactive';
import { candleLayout } from '../candleGeometry';
import type { Candle } from '../../pattern/types';
import { closesOf, highsOf, lowsOf, sma, ema, rsi, macdSeries, bollinger, fibLevels, volumeBars, stochastic, vwap, atr } from '../indicatorMath';
import type { IndicatorConfig } from '../indicatorConfigs';

const RIBBON_COLORS = [colors.bullish, colors.technical, colors.advanced, colors.bearish];

const W = 320;

/** Construit une chaîne de points SVG en sautant les valeurs nulles. */
function poly(vals: (number | null)[], xAt: (i: number) => number, toY: (v: number) => number): string {
  return vals
    .map((v, i) => (v == null ? null : `${xAt(i).toFixed(1)},${toY(v).toFixed(1)}`))
    .filter(Boolean)
    .join(' ');
}

/**
 * Renderer d'indicateurs (Lot 4). Panneau prix (bougies + superpositions) et, selon l'indicateur,
 * un sous-panneau (oscillateur / volume). Tout est calculé en code (déterministe), jamais un signal.
 */
export function IndicatorPanel({
  candles,
  config,
  accessibilityLabel,
}: {
  candles: Candle[];
  config: IndicatorConfig;
  accessibilityLabel?: string;
}) {
  const closes = closesOf(candles);
  const hasSub =
    config.kind === 'rsi' ||
    config.kind === 'macd' ||
    config.kind === 'volume' ||
    config.kind === 'divergence' ||
    config.kind === 'stochastic' ||
    config.kind === 'atr';
  const H = 180;
  const priceH = hasSub ? 106 : 172;
  const gap = 8;
  const subTop = priceH + gap;
  const subH = H - subTop;

  const scale = priceScale(candles, priceH, 12);
  const layout = candleLayout(candles, { width: W, height: priceH, padY: 12 });
  const slot = W / (candles.length || 1);
  const xAt = (i: number) => Math.max(0, Math.min(W, i * slot + slot / 2));
  const yP = (v: number) => scale.priceToY(v);

  // ── Superpositions sur le prix ──────────────────────────────────────
  const overlays: React.ReactNode[] = [];
  if (config.kind === 'ma') {
    // LOT G1 — les deux moyennes ne sont PAS peintes aux couleurs du marché. Elles l'étaient
    // (rapide en vert, lente en rouge), et cela se lisait « ligne haussière / ligne baissière »
    // alors que les deux dérivent du même prix : la couleur y distingue une PÉRIODE, pas un sens.
    // Traitement des superpositions dérivées, déjà employé par les bandes de Bollinger juste en
    // dessous : annotation (cyan) pour la ligne qu'on lit, ligne discrète en pointillés pour la
    // référence lente. Le canon réserve vert et rouge à la direction du marché.
    const fastP = config.fast ?? 3;
    const slowP = config.slow ?? 6;
    const fast = sma(closes, fastP);
    const slow = sma(closes, slowP);
    overlays.push(<Polyline key="ma-slow" points={poly(slow, xAt, yP)} fill="none" stroke={colors.textMuted} strokeWidth={1.4} strokeDasharray="5 3" />);
    overlays.push(<Polyline key="ma-fast" points={poly(fast, xAt, yP)} fill="none" stroke={colors.technical} strokeWidth={1.6} />);
    // Sans légende, « la rapide passe au-dessus de la lente » est indécidable à l'œil.
    overlays.push(
      <SvgText key="ma-legend" x={3} y={10} fill={colors.textMuted} fontSize={9}>
        {`rapide ${fastP} · lente ${slowP}`}
      </SvgText>,
    );
  } else if (config.kind === 'bollinger') {
    const b = bollinger(closes, config.period ?? 5, config.k ?? 2);
    overlays.push(<Polyline key="bb-up" points={poly(b.upper, xAt, yP)} fill="none" stroke={colors.technical} strokeWidth={1.3} />);
    overlays.push(<Polyline key="bb-mid" points={poly(b.mid, xAt, yP)} fill="none" stroke={colors.textMuted} strokeWidth={1.1} strokeDasharray="4 3" />);
    overlays.push(<Polyline key="bb-low" points={poly(b.lower, xAt, yP)} fill="none" stroke={colors.technical} strokeWidth={1.3} />);
  } else if (config.kind === 'fibonacci') {
    const low = Math.min(...candles.map((c) => c.l));
    const high = Math.max(...candles.map((c) => c.h));
    for (const f of fibLevels(low, high)) {
      overlays.push(<Line key={`fib-${f.ratio}`} x1={0} y1={yP(f.price)} x2={W} y2={yP(f.price)} stroke={colors.advanced} strokeWidth={1} strokeDasharray="3 3" />);
      overlays.push(
        <SvgText key={`fibt-${f.ratio}`} x={W - 3} y={yP(f.price) - 2} fill={colors.textMuted} fontSize={9} textAnchor="end">
          {(f.ratio * 100).toFixed(1).replace('.0', '')}%
        </SvgText>,
      );
    }
  } else if (config.kind === 'ribbon') {
    const periods = config.ribbon ?? [3, 5, 8];
    periods.forEach((p, idx) => {
      overlays.push(<Polyline key={`rib-${p}`} points={poly(ema(closes, p), xAt, yP)} fill="none" stroke={RIBBON_COLORS[idx % RIBBON_COLORS.length]} strokeWidth={1.4} />);
    });
  } else if (config.kind === 'vwap') {
    overlays.push(<Polyline key="vwap" points={poly(vwap(candles), xAt, yP)} fill="none" stroke={colors.advanced} strokeWidth={1.6} strokeDasharray="5 3" />);
    overlays.push(<SvgText key="vwap-t" x={W - 3} y={14} fill={colors.textMuted} fontSize={9} textAnchor="end">VWAP</SvgText>);
  } else if (config.kind === 'divergence' && config.priceHighs) {
    const low = config.pivot === 'low';
    const [a, b] = config.priceHighs;
    const pa = low ? candles[a].l : candles[a].h;
    const pb = low ? candles[b].l : candles[b].h;
    overlays.push(<Line key="div-price" x1={xAt(a)} y1={yP(pa)} x2={xAt(b)} y2={yP(pb)} stroke={colors.bearish} strokeWidth={1.4} strokeDasharray="4 3" />);
    overlays.push(
      <SvgText key="div-pt" x={xAt(b)} y={yP(pb) + (low ? 12 : -3)} fill={colors.textSecondary} fontSize={9} textAnchor="end">
        {low ? 'prix : creux ↑' : 'prix ↑'}
      </SvgText>,
    );
  }

  // ── Sous-panneau ────────────────────────────────────────────────────
  const sub: React.ReactNode[] = [];
  if (config.kind === 'rsi') {
    const r = rsi(closes, config.period ?? 5);
    const toY = (v: number) => subTop + subH - (v / 100) * subH;
    const zoneTop = toY(100);
    sub.push(<Rect key="ob" x={0} y={zoneTop} width={W} height={toY(70) - zoneTop} fill={colors.bearish} fillOpacity={0.12} />);
    sub.push(<Rect key="os" x={0} y={toY(30)} width={W} height={toY(0) - toY(30)} fill={colors.bullish} fillOpacity={0.12} />);
    sub.push(<Line key="l70" x1={0} y1={toY(70)} x2={W} y2={toY(70)} stroke={colors.textMuted} strokeWidth={1} strokeDasharray="4 3" />);
    sub.push(<Line key="l30" x1={0} y1={toY(30)} x2={W} y2={toY(30)} stroke={colors.textMuted} strokeWidth={1} strokeDasharray="4 3" />);
    sub.push(<Polyline key="rsi" points={poly(r, xAt, toY)} fill="none" stroke={colors.technical} strokeWidth={1.6} />);
    sub.push(<SvgText key="lab" x={3} y={subTop + 10} fill={colors.textMuted} fontSize={9}>RSI · 70/30</SvgText>);
  } else if (config.kind === 'macd') {
    const m = macdSeries(closes, config.fast ?? 3, config.slow ?? 6, config.period ?? 4);
    const vals = m.flatMap((p) => [p.macd, p.signal, p.hist].filter((v): v is number => v != null));
    const maxAbs = Math.max(1, ...vals.map((v) => Math.abs(v)));
    const zeroY = subTop + subH / 2;
    const toY = (v: number) => zeroY - (v / maxAbs) * (subH / 2 - 4);
    sub.push(<Line key="zero" x1={0} y1={zeroY} x2={W} y2={zeroY} stroke={colors.textMuted} strokeWidth={1} />);
    m.forEach((p, i) => {
      if (p.hist == null) return;
      const y = toY(p.hist);
      sub.push(<Rect key={`h-${i}`} x={xAt(i) - slot * 0.25} y={Math.min(zeroY, y)} width={Math.max(2, slot * 0.5)} height={Math.max(1, Math.abs(zeroY - y))} fill={p.hist >= 0 ? colors.bullish : colors.bearish} fillOpacity={0.5} />);
    });
    sub.push(<Polyline key="macd" points={poly(m.map((p) => p.macd), xAt, toY)} fill="none" stroke={colors.technical} strokeWidth={1.4} />);
    sub.push(<Polyline key="sig" points={poly(m.map((p) => p.signal), xAt, toY)} fill="none" stroke={colors.advanced} strokeWidth={1.4} />);
    sub.push(<SvgText key="lab" x={3} y={subTop + 10} fill={colors.textMuted} fontSize={9}>MACD</SvgText>);
  } else if (config.kind === 'volume') {
    const v = volumeBars(candles);
    const maxV = Math.max(1, ...v);
    v.forEach((val, i) => {
      const h = (val / maxV) * (subH - 6);
      sub.push(<Rect key={`v-${i}`} x={xAt(i) - slot * 0.3} y={subTop + subH - h} width={Math.max(2, slot * 0.6)} height={h} fill={candles[i].c >= candles[i].o ? colors.bullish : colors.bearish} fillOpacity={0.55} />);
    });
    sub.push(<SvgText key="lab" x={3} y={subTop + 10} fill={colors.textMuted} fontSize={9}>Volume</SvgText>);
  } else if (config.kind === 'stochastic') {
    const s = stochastic(highsOf(candles), lowsOf(candles), closes, config.period ?? 5, config.k ?? 3);
    const toY = (v: number) => subTop + subH - (v / 100) * subH;
    sub.push(<Rect key="ob" x={0} y={toY(100)} width={W} height={toY(80) - toY(100)} fill={colors.bearish} fillOpacity={0.12} />);
    sub.push(<Rect key="os" x={0} y={toY(20)} width={W} height={toY(0) - toY(20)} fill={colors.bullish} fillOpacity={0.12} />);
    sub.push(<Line key="l80" x1={0} y1={toY(80)} x2={W} y2={toY(80)} stroke={colors.textMuted} strokeWidth={1} strokeDasharray="4 3" />);
    sub.push(<Line key="l20" x1={0} y1={toY(20)} x2={W} y2={toY(20)} stroke={colors.textMuted} strokeWidth={1} strokeDasharray="4 3" />);
    sub.push(<Polyline key="k" points={poly(s.k, xAt, toY)} fill="none" stroke={colors.technical} strokeWidth={1.5} />);
    sub.push(<Polyline key="d" points={poly(s.d, xAt, toY)} fill="none" stroke={colors.advanced} strokeWidth={1.3} />);
    sub.push(<SvgText key="lab" x={3} y={subTop + 10} fill={colors.textMuted} fontSize={9}>Stoch · 80/20</SvgText>);
  } else if (config.kind === 'atr') {
    const a = atr(candles, config.period ?? 4);
    const defined = a.filter((v): v is number => v != null);
    const maxA = Math.max(1, ...defined);
    const minA = Math.min(0, ...defined);
    const toY = (v: number) => subTop + subH - ((v - minA) / (maxA - minA || 1)) * (subH - 6);
    sub.push(<Polyline key="atr" points={poly(a, xAt, toY)} fill="none" stroke={colors.technical} strokeWidth={1.6} />);
    sub.push(<SvgText key="lab" x={3} y={subTop + 10} fill={colors.textMuted} fontSize={9}>ATR (volatilité)</SvgText>);
  } else if (config.kind === 'divergence' && config.osc && config.oscHighs) {
    const osc = config.osc;
    const low = config.pivot === 'low';
    const toY = (val: number) => subTop + subH - (val / 100) * subH;
    sub.push(<Polyline key="osc" points={poly(osc, xAt, toY)} fill="none" stroke={colors.technical} strokeWidth={1.6} />);
    const [a, b] = config.oscHighs;
    sub.push(<Line key="div-osc" x1={xAt(a)} y1={toY(osc[a])} x2={xAt(b)} y2={toY(osc[b])} stroke={colors.bearish} strokeWidth={1.4} strokeDasharray="4 3" />);
    sub.push(<SvgText key="lab" x={3} y={subTop + 10} fill={colors.textMuted} fontSize={9}>{low ? 'RSI : creux ↓' : 'RSI ↓'}</SvgText>);
  }

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {layout.map((c) => (
          <Line key={`w-${c.index}`} x1={c.wickX} y1={c.wickTop} x2={c.wickX} y2={c.wickBottom} stroke={c.up ? colors.bullish : colors.bearish} strokeWidth={1.2} />
        ))}
        {layout.map((c) => (
          <Rect key={`b-${c.index}`} x={c.bodyX} y={c.bodyY} width={c.bodyW} height={c.bodyH} fill={c.up ? colors.bullish : colors.bearish} rx={1} />
        ))}
        {overlays}
        {hasSub ? <Line x1={0} y1={priceH + gap / 2} x2={W} y2={priceH + gap / 2} stroke={colors.borderStrong} strokeWidth={0.8} /> : null}
        {sub}
      </Svg>
    </View>
  );
}
