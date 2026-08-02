import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Button, Chip, ProgressBar, StateView, TrademyIcon, theme, type TrademyIconName } from '@/design-system';
import { MascotFigure } from '@/characters';
import { BADGES, earnedBadges, streakInfo, STREAK_MILESTONE_REWARD, buildDailyQuests, useProgress } from '@/data';
import { useNow } from '@/lib/useNow';

// ── Icônes Trademy des quêtes et badges (canon : aucun emoji rendu ; les champs `icon`/`emoji`
// des données sont IGNORÉS au rendu — même règle que l'onboarding). Repli par famille. ──
const QUEST_ICON: Record<string, TrademyIconName> = {
  'quest.session': 'target',
  'quest.correct5': 'success',
  'quest.xp30': 'bolt',
};
const BADGE_ICON: Record<string, TrademyIconName> = {
  'first-step': 'progression',
  'first-skill': 'learn',
  'streak-3': 'flame',
  explorer: 'search',
  collector: 'coin',
  studious: 'book',
  mastery: 'mastery',
  'module-done': 'checkpoint',
  'candle-anatomist': 'candles',
  'trend-cartographer': 'chart',
  'pattern-reader': 'learn',
  'false-signal-spotter': 'invalidation',
  curious: 'hint',
  'world-cartographer': 'home',
  'reader-eye': 'search',
  'streak-7': 'flame',
  climber: 'progression',
  devoted: 'book',
  treasurer: 'coin',
  'curious-plus': 'hint',
  'world-tour': 'home',
  'sharp-eye': 'target',
  'flawless-reco': 'trophy',
};
const FAMILY_FALLBACK: Record<string, TrademyIconName> = { progress: 'progression', understanding: 'mastery' };

export default function Reussites() {
  const { state, ready, claimQuest } = useProgress();
  const now = useNow();

  if (!ready) {
    return (
      <Screen>
        <StateView variant="loading" title="On charge tes réussites…" />
      </Screen>
    );
  }

  const earned = earnedBadges(state);
  const streak = streakInfo(state?.streakDays ?? 0);
  // Quêtes du jour — déplacées ici depuis l'accueil (Lot 1 : hors du CTA principal).
  const quests = state ? buildDailyQuests(state, now) : [];
  const questsDone = quests.filter((q) => q.done).length;
  // Progression vers le prochain jalon depuis le jalon précédent atteint.
  const prevMilestone = streak.reachedMilestones.at(-1) ?? 0;
  const span = streak.next ? streak.next - prevMilestone : 1;
  const streakProgress = streak.next ? (streak.current - prevMilestone) / span : 1;

  return (
    <Screen>
      <Text variant="h1">Réussites</Text>
      <Text variant="body" color={theme.colors.textSecondary}>
        Des badges à débloquer au fil de ta progression.
      </Text>

      <MascotFigure name="celebrate" gesture="celebrate" height={150} decorative />

      <Card elevated>
        <View style={styles.summary}>
          <View style={styles.titleRow}>
            <TrademyIcon name="flame" size={18} color={theme.colors.warning} />
            <Text variant="title">Série</Text>
          </View>
          <Chip iconName="flame" label={`${streak.current} jour${streak.current > 1 ? 's' : ''}`} color={theme.colors.warning} />
        </View>
        <ProgressBar value={streakProgress} color={theme.colors.warning} accessibilityLabel="Progression vers le prochain jalon de série" />
        <Text variant="caption" color={theme.colors.textMuted}>
          {streak.next
            ? `Encore ${streak.toGo} jour${streak.toGo > 1 ? 's' : ''} jusqu’au jalon ${streak.next} · +${STREAK_MILESTONE_REWARD} pièces`
            : `Tous les jalons de série sont atteints. Bravo pour ta constance !`}
        </Text>
      </Card>

      <Card elevated>
        <View style={styles.summary}>
          <Text variant="body" color={theme.colors.textSecondary}>
            Badges obtenus
          </Text>
          <Text variant="title" color={theme.colors.reward}>
            {earned.size} / {BADGES.length}
          </Text>
        </View>
        <ProgressBar value={earned.size / BADGES.length} color={theme.colors.reward} accessibilityLabel="Badges obtenus" />
      </Card>

      {quests.length ? (
        <Card>
          <View style={styles.row}>
            <Text variant="title" style={styles.flex1}>
              Quêtes du jour
            </Text>
            <Text variant="caption" color={theme.colors.textMuted}>
              {questsDone} / {quests.length}
            </Text>
          </View>
          <View style={styles.quests}>
            {quests.map((q) => (
              <View key={q.id} style={styles.quest}>
                <View style={styles.questHead}>
                  <TrademyIcon name={QUEST_ICON[q.id] ?? 'target'} size={16} color={theme.colors.primaryBright} />
                  <Text variant="body" style={styles.flex1}>
                    {q.label}
                  </Text>
                  {q.claimable ? (
                    <Button
                      label={`Réclamer +${q.reward} pièces`}
                      variant="reward"
                      fullWidth={false}
                      onPress={() => claimQuest(q.id)}
                      accessibilityHint={`Réclamer la récompense : ${q.reward} pièces`}
                    />
                  ) : (
                    <Text variant="caption" color={q.claimed ? theme.colors.primary : theme.colors.textMuted}>
                      {q.claimed ? 'Réclamé ✓' : `${q.progress}/${q.target}`}
                    </Text>
                  )}
                </View>
                <ProgressBar
                  value={q.target ? q.progress / q.target : 0}
                  color={q.done ? theme.colors.primary : theme.colors.reward}
                  accessibilityLabel={`${q.label} : ${q.progress} sur ${q.target}`}
                />
              </View>
            ))}
          </View>
          <Text variant="caption" color={theme.colors.textMuted}>
            Les quêtes se renouvellent chaque jour. Les pièces récompensent ta régularité, jamais un pari.
          </Text>
        </Card>
      ) : null}

      <Text variant="h2" style={styles.sectionTitle}>
        Progression
      </Text>
      <View style={styles.grid}>{BADGES.filter((b) => b.family !== 'understanding').map(renderBadge)}</View>

      <Text variant="h2" style={styles.sectionTitle}>
        Compréhension
      </Text>
      <Text variant="caption" color={theme.colors.textMuted}>
        Des badges qui récompensent le savoir, la diversité et le repérage des faux signaux — jamais des gains ni la vitesse.
      </Text>
      <View style={styles.grid}>{BADGES.filter((b) => b.family === 'understanding').map(renderBadge)}</View>
    </Screen>
  );

  function renderBadge(b: (typeof BADGES)[number]) {
    const has = earned.has(b.id);
    return (
      <Card key={b.id} style={[styles.badge, !has && styles.locked]}>
        {has ? (
          <View style={styles.lockWrap}>
            <TrademyIcon name={BADGE_ICON[b.id] ?? FAMILY_FALLBACK[b.family ?? ''] ?? 'trophy'} size={34} color={theme.colors.primaryBright} title={`Badge : ${b.name}`} />
          </View>
        ) : (
          <View style={styles.lockWrap}>
            <TrademyIcon name="lock" size={34} color={theme.colors.textMuted} title="Badge verrouillé" />
          </View>
        )}
        <Text variant="title" center>
          {b.name}
        </Text>
        <Text variant="caption" color={theme.colors.textMuted} center>
          {b.description}
        </Text>
        <Text variant="caption" color={has ? theme.colors.primary : theme.colors.textMuted} center>
          {has ? 'Obtenu ✓' : 'À débloquer'}
        </Text>
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  lockWrap: { alignItems: 'center', justifyContent: 'center', height: 40 },
  sectionTitle: { marginTop: theme.spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  badge: { flexGrow: 1, flexBasis: '44%', alignItems: 'center', gap: theme.spacing.xs },
  locked: { opacity: 0.55 },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  flex1: { flex: 1 },
  quests: { gap: theme.spacing.md, marginVertical: theme.spacing.sm },
  quest: { gap: theme.spacing.xs },
  questHead: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minHeight: 32 },
});
