import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Button, Chip, ProgressBar, StateView, theme } from '@/design-system';
import { useProgress, SKILLS, computeStats, MASTERY_ORDER, MASTERY_LABEL, type ActivityPoint } from '@/data';
import type { MasteryStatus } from '@/engines/learning';
import { analytics } from '@/analytics';
import { useNow } from '@/lib/useNow';

const STATUS_COLOR: Record<MasteryStatus, string> = {
  new: theme.colors.textMuted,
  learning: theme.colors.technical,
  fragile: theme.colors.warning,
  reviewing: theme.colors.technical,
  strong: theme.colors.bullish,
  mastered: theme.colors.primary,
};

const WEEKDAY = ['di', 'lu', 'ma', 'me', 'je', 've', 'sa'];
function weekdayLabel(date: string): string {
  const d = new Date(date + 'T00:00:00Z');
  return WEEKDAY[d.getUTCDay()] ?? '·';
}

export default function Statistiques() {
  const router = useRouter();
  const { state, ready } = useProgress();
  const now = useNow();

  useEffect(() => {
    analytics.track('stats_viewed');
  }, []);

  if (!ready) {
    return (
      <Screen>
        <StateView variant="loading" title="On charge tes statistiques…" />
      </Screen>
    );
  }

  const stats = state ? computeStats(state, SKILLS, now) : null;

  if (!stats) {
    return (
      <Screen>
        <Text variant="h1">Statistiques</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          Tes statistiques apparaîtront dès ta première session.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text variant="h1">Statistiques</Text>
      <Text variant="body" color={theme.colors.textSecondary}>
        Ta progression réelle, sans fard.
      </Text>

      {/* Vue d'ensemble */}
      <Card elevated>
        <View style={styles.overview}>
          <Overview label="Niveau" value={String(stats.level)} />
          <Overview label="XP total" value={String(stats.totalXp)} />
          <Overview label="Série" value={`${stats.streakDays} j`} />
          <Overview label="Pièces" value={String(stats.coins)} />
          <Overview label="Compétences" value={`${stats.completedCount}/${stats.totalSkills}`} />
          <Overview label="XP (7 j)" value={String(stats.windowXp)} />
        </View>
      </Card>

      {/* Exploration — compréhension V5 (jamais des gains ni de la vitesse) */}
      <Card>
        <Text variant="title">Exploration</Text>
        <View style={styles.overview}>
          <Overview label="Concepts explorés" value={String(stats.exploration.conceptsExplored)} />
          <Overview label="Mondes explorés" value={String(stats.exploration.worldsExplored)} />
          <Overview label="Faux signaux repérés" value={String(stats.exploration.falseSignalsSpotted)} />
          <Overview label="Figures reconnues" value={String(stats.exploration.figuresRecognized)} />
        </View>
        <Text variant="caption" color={theme.colors.textMuted}>
          La compréhension et la diversité priment sur la vitesse.
        </Text>
      </Card>

      {/* v1 gratuite (ADR-110) : le détail complet est ouvert à tout le monde. */}
      {/* Activité des 7 derniers jours */}
      <Card>
        <View style={styles.row}>
          <Text variant="title" style={styles.flex1}>
            Activité — 7 jours
          </Text>
          <Text variant="caption" color={theme.colors.textMuted}>
            {stats.activeDays} jour{stats.activeDays > 1 ? 's' : ''} actif{stats.activeDays > 1 ? 's' : ''}
          </Text>
        </View>
        <ActivityChart activity={stats.activity} peak={stats.peakXp} />
        <Text variant="caption" color={theme.colors.textMuted}>
          XP gagné par jour. La régularité prime sur l’intensité.
        </Text>
      </Card>

      {/* Maîtrise par compétence */}
      <Card>
        <Text variant="title">Maîtrise par compétence</Text>
        <View style={styles.distribution}>
          {MASTERY_ORDER.filter((s) => stats.masteryDistribution[s] > 0).map((s) => (
            <Chip key={s} label={`${MASTERY_LABEL[s]} ${stats.masteryDistribution[s]}`} color={STATUS_COLOR[s]} />
          ))}
        </View>
        <View style={styles.skills}>
          {stats.skills.map((sk) => (
            <View key={sk.id} style={styles.skill}>
              <View style={styles.row}>
                <Text variant="body" style={styles.flex1}>
                  {sk.name}
                </Text>
                <Chip label={MASTERY_LABEL[sk.status]} color={STATUS_COLOR[sk.status]} />
              </View>
              <ProgressBar
                value={sk.mastery}
                color={STATUS_COLOR[sk.status]}
                accessibilityLabel={`${sk.name} : maîtrise ${Math.round(sk.mastery * 100)} %`}
              />
              <Text variant="caption" color={theme.colors.textMuted}>
                Maîtrise {Math.round(sk.mastery * 100)} % · confiance {Math.round(sk.confidence * 100)} %
                {sk.errors > 0 ? ` · ${sk.errors} erreur${sk.errors > 1 ? 's' : ''}` : ''}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Erreurs à retravailler */}
      <Card>
        <Text variant="title">À retravailler</Text>
        {stats.recurringErrors.length ? (
          <>
            <View style={styles.errors}>
              {stats.recurringErrors.slice(0, 5).map((e) => (
                <View key={`${e.skillId}:${e.tag}`} style={styles.errorRow}>
                  <Text variant="body" style={styles.flex1}>
                    {e.skillName}
                  </Text>
                  <Chip label={`${e.count}×`} color={theme.colors.bearish} />
                </View>
              ))}
            </View>
            <Button
              label="Réviser mes points faibles"
              onPress={() => router.push('/revisions')}
              accessibilityHint="Ouvrir les révisions"
            />
          </>
        ) : (
          <Text variant="body" color={theme.colors.textSecondary}>
            Aucune erreur récurrente pour l’instant. Continue comme ça !
          </Text>
        )}
      </Card>

      <Button label="Retour au profil" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

function Overview({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.overviewItem}>
      <Text variant="h2">{value}</Text>
      <Text variant="caption" color={theme.colors.textMuted}>
        {label}
      </Text>
    </View>
  );
}

function ActivityChart({ activity, peak }: { activity: ActivityPoint[]; peak: number }) {
  const max = Math.max(peak, 1);
  return (
    <View style={styles.chart} accessibilityRole="image" accessibilityLabel="Activité des 7 derniers jours (XP par jour)">
      {activity.map((a) => {
        const ratio = a.xp / max;
        return (
          <View key={a.date} style={styles.chartCol}>
            <View
              style={styles.barTrack}
              accessible
              accessibilityLabel={`${a.date} : ${a.xp} XP, ${a.sessions} session${a.sessions > 1 ? 's' : ''}`}
            >
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.round(Math.max(a.xp > 0 ? 8 : 2, ratio * 100))}%`,
                    backgroundColor: a.isToday ? theme.colors.primary : theme.colors.technical,
                  },
                ]}
              />
            </View>
            <Text variant="caption" color={a.isToday ? theme.colors.primary : theme.colors.textMuted} center>
              {weekdayLabel(a.date)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  overview: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg, marginTop: theme.spacing.xs },
  overviewItem: { flexBasis: '27%', gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  flex1: { flex: 1 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: theme.spacing.sm, height: 120, marginVertical: theme.spacing.sm },
  chartCol: { flex: 1, alignItems: 'center', gap: theme.spacing.xs },
  barTrack: { width: '100%', height: 96, justifyContent: 'flex-end', backgroundColor: theme.colors.surfaceSunken, borderRadius: theme.radius.sm, overflow: 'hidden' },
  bar: { width: '100%', borderRadius: theme.radius.sm },
  distribution: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginVertical: theme.spacing.sm },
  skills: { gap: theme.spacing.md, marginTop: theme.spacing.xs },
  skill: { gap: theme.spacing.xs },
  errors: { gap: theme.spacing.xs, marginVertical: theme.spacing.sm },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
});
