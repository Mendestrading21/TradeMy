import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, TrademyIcon, theme } from '@/design-system';
import {
  MarketReplayChart,
  generateCandles,
  initReplay,
  stepReplay,
  revealAll,
  resetReplay,
  replayAtEnd,
  replayAtStart,
  type Candle,
} from '@/engines/pattern';

/**
 * Manipulation immersive d'une leçon : révèle un graphique en chandeliers **bougie par bougie**,
 * au rythme de l'utilisateur. Statique (aucune animation automatique → compatible réduction
 * d'animation) ; déterministe par graine. La logique de replay est pure (chartEngine), ici on ne
 * gère que l'état d'affichage. Aucun jugement de marché : on observe la construction du prix.
 *
 * LOT E1 — `series` permet de rejouer la FIGURE RÉELLE du concept (dataset canonique du moteur
 * visuel) au lieu d'une série synthétique : on voit la figure enseignée SE FORMER, ce qui apprend
 * qu'elle ne se lit qu'une fois complète. Repli sur la série déterministe quand le concept n'a pas
 * de dataset assez long (figures d'une seule bougie).
 */
export function LessonReplay({
  seed = 2024,
  count = 26,
  series,
}: {
  seed?: number;
  count?: number;
  /** Bougies réelles à rejouer (prioritaires sur la graine). */
  series?: readonly Candle[];
}) {
  const candles = useMemo(
    () => (series && series.length ? [...series] : generateCandles(seed, count)),
    [series, seed, count],
  );
  const [state, setState] = useState(() => initReplay(candles.length, 6));
  const atEnd = replayAtEnd(state);
  const atStart = replayAtStart(state);

  return (
    <Card>
      <View style={styles.labelRow}>
        <TrademyIcon name="chart" size={16} color={theme.colors.primary} />
        <Text variant="label" color={theme.colors.primary}>
          Manipule — révèle le graphique
        </Text>
      </View>
      <Text variant="caption" color={theme.colors.textMuted}>
        Avance bougie par bougie et regarde la structure se construire.
      </Text>
      <View style={styles.chart}>
        <MarketReplayChart candles={candles} visibleCount={state.visible} height={160} />
      </View>
      <Text variant="caption" color={theme.colors.technical}>
        {state.visible} / {state.total} bougies révélées
      </Text>
      <View style={styles.controls}>
        <Button
          label="◀︎"
          variant="secondary"
          fullWidth={false}
          disabled={atStart}
          disabledReason={atStart ? 'Déjà au début' : undefined}
          onPress={() => setState((s) => stepReplay(s, -1))}
          accessibilityHint="Bougie précédente"
        />
        <Button
          label="Révéler ▶︎"
          fullWidth={false}
          disabled={atEnd}
          disabledReason={atEnd ? 'Tout est révélé' : undefined}
          onPress={() => setState((s) => stepReplay(s, 1))}
          accessibilityHint="Révéler la bougie suivante"
        />
        <Button
          label={atEnd ? 'Recommencer' : 'Tout révéler'}
          variant="ghost"
          fullWidth={false}
          onPress={() => setState((s) => (replayAtEnd(s) ? resetReplay(s) : revealAll(s)))}
          accessibilityHint={atEnd ? 'Recommencer depuis le début' : 'Révéler toutes les bougies'}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  chart: { width: '100%', marginVertical: theme.spacing.sm },
  controls: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center', flexWrap: 'wrap', marginTop: theme.spacing.xs },
});
