import { useMemo, useRef, useState } from 'react';
import { useRouter, type Href } from 'expo-router';
import { View, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { Screen, Text, Card, Button, Chip, SegmentedControl, TrademyIcon, theme, type SegmentOption, type TrademyIconName } from '@/design-system';
import { CharacterScene } from '@/characters';
import {
  InteractiveChart,
  MarketReplayChart,
  generateCandles,
  priceScale,
  supportLevel,
  isLevelClose,
  initReplay,
  stepReplay,
  revealAll,
  resetReplay,
  replayAtEnd,
  replayAtStart,
} from '@/engines/pattern';
import { IndicatorPanel, INDICATOR_LABS, indicatorLabById, datasetByKey } from '@/engines/visual';
import { CHART_SCENARIOS, chartScenarioById } from '@/data';
import { Disclaimer } from '@/components/Disclaimer';
import { analytics } from '@/analytics';

/**
 * Espace « Laboratoire » (LOT 4-G — canon TradeMy Learning Glass). Un atelier où l'apprenant manipule
 * des graphiques PÉDAGOGIQUES, SYNTHÉTIQUES et DÉTERMINISTES. **Une seule expérience active à la fois**
 * (les graphiques/scènes des activités inactives ne sont pas montés).
 *
 * Présentation UNIQUEMENT : l'écran LIT les moteurs purs (tracé, replay, labs d'indicateurs) et les
 * scénarios (`CHART_SCENARIOS`). Il ne modifie NI un moteur, NI un dataset, NI la taxonomie analytics.
 * Il n'utilise pas `useProgress` : aucun XP, aucune compétence, aucun objectif, aucun checkpoint, aucune
 * maîtrise, aucune répétition espacée, aucune persistance. Un résultat de Laboratoire est un feedback
 * d'ESSAI, jamais une preuve de maîtrise. Un remontage complet restaure les valeurs déterministes.
 */
type Experience = 'guided' | 'support' | 'volume' | 'indicators';

/** Compteur de replay accessible ET grammaticalement correct (singulier/pluriel), jamais un nombre nu. */
const revealedText = (visible: number, total: number) =>
  `${visible} bougie${visible > 1 ? 's' : ''} révélée${visible > 1 ? 's' : ''} sur ${total}`;

const EXPERIENCES: { id: Experience; label: string; short: string; icon: TrademyIconName }[] = [
  { id: 'guided', label: 'Lecture guidée', short: 'Lecture', icon: 'chart' },
  { id: 'support', label: 'Tracer un support', short: 'Support', icon: 'support' },
  { id: 'volume', label: 'Replay volume', short: 'Replay', icon: 'volume' },
  { id: 'indicators', label: 'Indicateurs', short: 'Indic.', icon: 'settings' },
];

const RESOURCES: { icon: TrademyIconName; label: string; route: Href }[] = [
  { icon: 'library', label: 'Bibliothèque', route: '/apprendre' },
  { icon: 'chart', label: 'Bibliothèque visuelle', route: '/bibliotheque-visuelle' },
  { icon: 'play', label: 'Leçon — Le double creux', route: '/lesson/lesson.double-bottom' },
];

export default function Laboratoire() {
  const router = useRouter();
  const [active, setActive] = useState<Experience>('guided');

  // Analytics : `lab_started` UNIQUEMENT après une interaction significative (jamais au montage),
  // dédupliqué par expérience et par montage.
  const startedRef = useRef<Set<string>>(new Set());
  const markStarted = (key: string) => {
    if (startedRef.current.has(key)) return;
    startedRef.current.add(key);
    analytics.track('lab_started', { scenario: key });
  };

  // ── Tracé du support (dataset déterministe ; moteur pur) ──
  const candles = useMemo(() => generateCandles(2024, 30), []);
  const scale = useMemo(() => priceScale(candles, 170), [candles]);
  const target = useMemo(() => supportLevel(candles), [candles]);
  const stepPrice = scale.range * 0.02;
  const [userPrice, setUserPrice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [chartW, setChartW] = useState<number | null>(null);
  const onChartLayout = (e: LayoutChangeEvent) => setChartW(e.nativeEvent.layout.width);
  const close = revealed && userPrice != null && isLevelClose(userPrice, target, scale.range);
  const pick = (price: number) => { markStarted('trace_support'); setUserPrice(price); setRevealed(false); };
  const nudge = (dir: -1 | 1) => {
    markStarted('trace_support');
    setRevealed(false);
    setUserPrice((p) => {
      const base = p ?? (scale.min + scale.max) / 2;
      return Math.max(scale.min, Math.min(scale.max, base + dir * stepPrice));
    });
  };
  const validateSupport = () => {
    if (userPrice == null) return;
    setRevealed(true);
    analytics.track('lab_completed', { scenario: 'trace_support', success: isLevelClose(userPrice, target, scale.range) });
  };
  const resetSupport = () => { setUserPrice(null); setRevealed(false); };

  // ── Replay volume (machine pure) ──
  const replayCandles = useMemo(() => generateCandles(777, 24), []);
  const [replay, setReplay] = useState(() => initReplay(replayCandles.length, 6));
  const [replayDone, setReplayDone] = useState(false);
  const markReplayDone = (next: ReturnType<typeof initReplay>) => {
    if (replayAtEnd(next) && !replayDone) {
      setReplayDone(true);
      analytics.track('lab_completed', { scenario: 'volume_replay', success: true });
    }
  };
  const replayNext = () => { markStarted('volume_replay'); setReplay((s) => { const n = stepReplay(s, 1); markReplayDone(n); return n; }); };
  const replayPrev = () => { markStarted('volume_replay'); setReplay((s) => stepReplay(s, -1)); };
  const replayAll = () => { markStarted('volume_replay'); setReplay((s) => { const n = revealAll(s); markReplayDone(n); return n; }); };
  const replayReset = () => { markStarted('volume_replay'); setReplayDone(false); setReplay((s) => resetReplay(s)); };

  // ── Labs d'indicateurs (calcul pur ; paramètre branché) ──
  const [labId, setLabId] = useState(INDICATOR_LABS[0].id);
  const [labParam, setLabParam] = useState<number>(INDICATOR_LABS[0].defaultValue);
  const lab = indicatorLabById(labId) ?? INDICATOR_LABS[0];
  const labCandles = useMemo(() => datasetByKey(lab.datasetKey), [lab.datasetKey]);
  const labConfig = lab.configFor(labParam);
  const labOptions: SegmentOption<string>[] = INDICATOR_LABS.map((l) => ({ id: l.id, label: l.title }));
  const paramOptions: SegmentOption<string>[] = lab.paramValues.map((v) => ({ id: String(v), label: lab.formatValue(v) }));

  // ── Lecture guidée (scénarios ; révélation progressive ; repères textuels) ──
  const [scenarioId, setScenarioId] = useState(CHART_SCENARIOS[0].id);
  const scenario = chartScenarioById(scenarioId) ?? CHART_SCENARIOS[0];
  const scenarioCandles = useMemo(() => datasetByKey(scenario.datasetKey), [scenario.datasetKey]);
  const [showMarkers, setShowMarkers] = useState(false);
  const [scenReplay, setScenReplay] = useState(() => initReplay(scenarioCandles.length, Math.min(6, scenarioCandles.length)));
  const scenarioOptions: SegmentOption<string>[] = CHART_SCENARIOS.map((s) => ({ id: s.id, label: s.title }));
  const scenNext = () => { markStarted(`read:${scenarioId}`); setScenReplay((s) => stepReplay(s, 1)); };
  const scenPrev = () => { markStarted(`read:${scenarioId}`); setScenReplay((s) => stepReplay(s, -1)); };
  const scenAll = () => { markStarted(`read:${scenarioId}`); setScenReplay((s) => revealAll(s)); };
  const scenReset = () => { markStarted(`read:${scenarioId}`); setScenReplay((s) => resetReplay(s)); };

  return (
    <Screen>
      <View style={styles.header}>
        <TrademyIcon name="lab" size={22} color={theme.colors.primaryBright} />
        <Text variant="h1">Laboratoire</Text>
      </View>
      <Text variant="body" color={theme.colors.textSecondary}>
        Manipule des graphiques d’entraînement. Toutes les données sont synthétiques, déterministes et
        éducatives — jamais un marché en temps réel ni un signal.
      </Text>

      {/* ── Sélecteur d'expérience (une seule active à la fois) ── */}
      <View style={styles.selector} accessibilityRole="tablist" accessible accessibilityLabel="Choisir une expérience">
        {EXPERIENCES.map((x) => {
          const on = active === x.id;
          return (
            <Pressable
              key={x.id}
              onPress={() => setActive(x.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={x.label}
              style={[styles.expPill, on ? styles.expPillOn : null]}
            >
              <TrademyIcon name={x.icon} size={16} color={on ? theme.colors.onPrimary : theme.colors.primaryBright} />
              <Text variant="label" color={on ? theme.colors.onPrimary : theme.colors.textSecondary}>
                {x.short}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {active === 'guided' ? (
        <Card elevated>
          <View style={styles.cardHead}>
            <TrademyIcon name="chart" size={18} color={theme.colors.primaryBright} />
            <Text variant="title" style={styles.flex1}>
              Lecture guidée
            </Text>
          </View>
          <SegmentedControl
            options={scenarioOptions}
            value={scenarioId}
            onChange={(id) => {
              setScenarioId(id);
              const next = chartScenarioById(id) ?? CHART_SCENARIOS[0];
              const nextCandles = datasetByKey(next.datasetKey);
              setScenReplay(initReplay(nextCandles.length, Math.min(6, nextCandles.length)));
              markStarted(`read:${id}`);
            }}
            accessibilityLabel="Choisir un scénario de lecture"
          />
          <Text variant="body" color={theme.colors.textSecondary}>
            {scenario.question}
          </Text>

          <View style={styles.chart}>
            <MarketReplayChart candles={scenarioCandles} visibleCount={scenReplay.visible} height={170} />
          </View>
          <Chip iconName="volume" label={revealedText(scenReplay.visible, scenReplay.total)} color={theme.colors.info} accessibilityLabel={revealedText(scenReplay.visible, scenReplay.total)} />

          <View style={styles.controls}>
            <Button label="Début" variant="secondary" fullWidth={false} disabled={replayAtStart(scenReplay)} onPress={scenReset} accessibilityHint="Revenir à la première bougie" />
            <Button label="Précédente" variant="secondary" fullWidth={false} disabled={replayAtStart(scenReplay)} onPress={scenPrev} accessibilityHint="Bougie précédente" />
            <Button label="Suivante" variant="secondary" fullWidth={false} disabled={replayAtEnd(scenReplay)} onPress={scenNext} accessibilityHint="Bougie suivante" />
            <Button label="Tout révéler" variant="secondary" fullWidth={false} disabled={replayAtEnd(scenReplay)} onPress={scenAll} accessibilityHint="Révéler toute la séquence" />
          </View>

          <Pressable
            onPress={() => setShowMarkers((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showMarkers }}
            accessibilityLabel={showMarkers ? 'Masquer les repères à observer' : 'Afficher les repères à observer'}
            style={styles.markerToggle}
          >
            <TrademyIcon name={showMarkers ? 'close' : 'target'} size={16} color={theme.colors.primaryBright} />
            <Text variant="label" color={theme.colors.primaryBright}>
              {showMarkers ? 'Masquer les repères' : 'Afficher les repères à observer'}
            </Text>
          </Pressable>

          {showMarkers ? (
            <View style={styles.markers}>
              {scenario.annotations.map((a) => (
                <View key={a.label} style={styles.markerRow} accessible accessibilityLabel={`${a.label}. ${a.detail}`}>
                  <TrademyIcon name="target" size={14} color={theme.colors.technical} />
                  <View style={styles.flex1}>
                    <Text variant="label" color={theme.colors.technical}>
                      {a.label}
                    </Text>
                    <Text variant="caption" color={theme.colors.textSecondary}>
                      {a.detail}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text variant="caption" color={theme.colors.textMuted}>
              Lis le graphique par toi-même, puis affiche les repères pour comparer.
            </Text>
          )}

          <View style={styles.scene}>
            <CharacterScene character="toto" state="point" size={56} speech={scenario.toto} />
            <CharacterScene character="bobo" state="false-signal" size={56} reversed speech={scenario.bobo} />
          </View>
          <Text variant="caption" color={theme.colors.textMuted}>
            Scénario éducatif sur données déterministes — jamais un signal en temps réel.
          </Text>
        </Card>
      ) : null}

      {active === 'support' ? (
        <Card elevated>
          <View style={styles.cardHead}>
            <TrademyIcon name="support" size={18} color={theme.colors.warning} />
            <Text variant="title" style={styles.flex1}>
              Tracer un support
            </Text>
          </View>
          <Text variant="body" color={theme.colors.textSecondary}>
            Pose ta ligne sur le creux de référence de ce scénario — le plancher où la demande revient.
            Touche le graphique ou utilise les boutons, puis valide.
          </Text>

          <View style={styles.chart} onLayout={onChartLayout}>
            {chartW != null ? (
              <InteractiveChart
                candles={candles}
                width={Math.min(chartW, 520)}
                height={170}
                userPrice={userPrice}
                targetPrice={revealed ? target : null}
                disabled={revealed}
                onPickPrice={pick}
                accessibilityLabel={revealed ? 'Graphique validé — non ajustable.' : 'Graphique interactif — touche pour placer ta ligne de référence.'}
              />
            ) : null}
          </View>

          <View style={styles.legendRow}>
            {userPrice != null ? <Chip iconName="chart" label={`Ton niveau : ${userPrice.toFixed(0)}`} color={theme.colors.info} accessibilityLabel={`Ton niveau : ${userPrice.toFixed(0)}`} /> : null}
            {revealed ? <Chip iconName="support" label={`Creux de référence : ${target.toFixed(0)}`} color={theme.colors.warning} accessibilityLabel={`Creux de référence de ce scénario : ${target.toFixed(0)}`} /> : null}
          </View>

          <View style={styles.controls}>
            <Button label="Monter" variant="secondary" fullWidth={false} disabled={revealed} onPress={() => nudge(1)} accessibilityHint="Monter le niveau d’un cran" />
            <Button label="Descendre" variant="secondary" fullWidth={false} disabled={revealed} onPress={() => nudge(-1)} accessibilityHint="Descendre le niveau d’un cran" />
          </View>

          {!revealed ? (
            <Button
              label="Valider mon tracé"
              disabled={userPrice == null}
              disabledReason={userPrice == null ? 'Place d’abord ta ligne sur le graphique.' : undefined}
              onPress={validateSupport}
            />
          ) : (
            <Button label="Réessayer" variant="secondary" onPress={resetSupport} accessibilityHint="Effacer ton tracé et recommencer" />
          )}

          {revealed ? (
            <>
              <View style={styles.feedbackRow} accessible accessibilityLabel={close ? 'Résultat : placement proche du creux de référence.' : 'Résultat : à revoir — vise le creux le plus bas.'}>
                <TrademyIcon name={close ? 'success' : 'error'} size={18} color={close ? theme.colors.feedbackCorrect : theme.colors.feedbackIncorrect} />
                <Text variant="body" color={close ? theme.colors.feedbackCorrect : theme.colors.feedbackIncorrect} style={styles.flex1}>
                  {close ? 'Placement proche du creux de référence.' : 'À revoir : le repère se pose sur le creux le plus bas, pas au milieu.'}
                </Text>
              </View>
              <CharacterScene
                character={close ? 'toto' : 'bobo'}
                state={close ? 'celebrate-small' : 'encourage'}
                size={56}
                speech={close ? 'Bien vu — ta ligne colle au plancher, là où la demande revient.' : 'Regarde le point le plus bas : le repère se pose sur ce plancher.'}
              />
            </>
          ) : null}
          <Text variant="caption" color={theme.colors.textMuted}>
            Un repère de support est une zone plancher — un point de lecture, jamais une garantie. Ce
            feedback est un essai, pas une maîtrise.
          </Text>
        </Card>
      ) : null}

      {active === 'volume' ? (
        <Card elevated>
          <View style={styles.cardHead}>
            <TrademyIcon name="volume" size={18} color={theme.colors.primaryBright} />
            <Text variant="title" style={styles.flex1}>
              Replay volume
            </Text>
          </View>
          <Text variant="body" color={theme.colors.textSecondary}>
            Déroule la séquence bougie par bougie. Le panneau du bas montre le volume — la participation
            qui accompagne (ou non) le mouvement.
          </Text>

          <View style={styles.chart}>
            <MarketReplayChart candles={replayCandles} visibleCount={replay.visible} height={170} />
          </View>

          <View style={styles.legendRow}>
            <Chip iconName="volume" label={revealedText(replay.visible, replay.total)} color={theme.colors.info} accessibilityLabel={revealedText(replay.visible, replay.total)} />
            {replayAtEnd(replay) ? <Chip iconName="success" label="Séquence entièrement révélée" color={theme.colors.success} accessibilityLabel="Séquence entièrement révélée" /> : null}
          </View>

          <View style={styles.controls}>
            <Button label="Début" variant="secondary" fullWidth={false} disabled={replayAtStart(replay)} onPress={replayReset} accessibilityHint="Revenir à la première bougie" />
            <Button label="Précédente" variant="secondary" fullWidth={false} disabled={replayAtStart(replay)} onPress={replayPrev} accessibilityHint="Bougie précédente" />
            <Button label="Suivante" variant="secondary" fullWidth={false} disabled={replayAtEnd(replay)} onPress={replayNext} accessibilityHint="Bougie suivante" />
            <Button label="Tout révéler" variant="secondary" fullWidth={false} disabled={replayAtEnd(replay)} onPress={replayAll} accessibilityHint="Révéler toute la séquence" />
          </View>

          {replayAtEnd(replay) ? (
            <CharacterScene
              character="toto"
              state="explain"
              size={56}
              speech="Regarde où le volume gonfle : une poussée soutenue par la participation est plus crédible qu’un mouvement sans volume."
            />
          ) : null}
          <Text variant="caption" color={theme.colors.textMuted}>
            « Séquence entièrement révélée » signifie seulement que tu as tout déroulé — jamais une maîtrise.
          </Text>
        </Card>
      ) : null}

      {active === 'indicators' ? (
        <Card elevated>
          <View style={styles.cardHead}>
            <TrademyIcon name="settings" size={18} color={theme.colors.primaryBright} />
            <Text variant="title" style={styles.flex1}>
              Indicateurs
            </Text>
          </View>
          <Text variant="body" color={theme.colors.textSecondary}>
            Choisis un indicateur, ajuste son paramètre, et observe sa lecture se recomposer.
          </Text>
          <SegmentedControl
            options={labOptions}
            value={labId}
            onChange={(id) => {
              setLabId(id);
              const l = indicatorLabById(id);
              if (l) setLabParam(l.defaultValue);
              markStarted(`indicator:${id}`);
            }}
            accessibilityLabel="Choisir un indicateur"
          />
          <View style={styles.paramRow}>
            <Text variant="label" color={theme.colors.textMuted}>
              {lab.paramLabel}
            </Text>
            <SegmentedControl
              options={paramOptions}
              value={String(labParam)}
              onChange={(v) => { setLabParam(Number(v)); markStarted(`indicator:${labId}`); }}
              accessibilityLabel={`${lab.paramLabel} de ${lab.title}`}
            />
          </View>
          <IndicatorPanel
            candles={labCandles}
            config={labConfig}
            accessibilityLabel={`${lab.title} — ${lab.paramLabel} ${lab.formatValue(labParam)}. Ajuste le paramètre pour comparer.`}
          />
          <View style={styles.feedbackRow}>
            <TrademyIcon name="false-signal" size={16} color={theme.colors.falseSignal} />
            <Text variant="caption" color={theme.colors.textSecondary} style={styles.flex1}>
              Faux signal : {lab.falseSignal}
            </Text>
          </View>
          <CharacterScene character="bobo" state="false-signal" size={56} reversed speech={lab.falseSignal} />
        </Card>
      ) : null}

      {/* ── Continuer à apprendre (ressources secondaires) ── */}
      <Card>
        <View style={styles.cardHead}>
          <TrademyIcon name="book" size={16} color={theme.colors.textSecondary} />
          <Text variant="label" color={theme.colors.textSecondary}>
            CONTINUER À APPRENDRE
          </Text>
        </View>
        {RESOURCES.map((r) => (
          <Pressable
            key={r.label}
            onPress={() => router.push(r.route)}
            accessibilityRole="button"
            accessibilityLabel={r.label}
            accessibilityHint={`Ouvrir : ${r.label}`}
            style={styles.resourceRow}
          >
            <TrademyIcon name={r.icon} size={18} color={theme.colors.primaryBright} />
            <Text variant="body" style={styles.flex1}>
              {r.label}
            </Text>
            <TrademyIcon name="chevron-right" size={18} color={theme.colors.textMuted} />
          </Pressable>
        ))}
      </Card>

      <Disclaimer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  selector: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  expPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  expPillOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  chart: { alignItems: 'center', marginVertical: theme.spacing.md, width: '100%' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
  markerToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  markers: { gap: theme.spacing.sm, marginVertical: theme.spacing.xs },
  markerRow: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-start' },
  scene: { gap: theme.spacing.md },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  paramRow: { gap: theme.spacing.xs, marginVertical: theme.spacing.sm },
  resourceRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minHeight: 44, paddingVertical: theme.spacing.xs },
  flex1: { flex: 1 },
});
