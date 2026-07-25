import { useRouter } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { Screen, Text, Card, Button, Chip, ProgressBar, StateView, TrademyIcon, theme } from '@/design-system';
import { MascotFigure, CharacterScene } from '@/characters';
import { MiniVisual } from '@/engines/visual';
import {
  useProgress,
  SKILLS,
  buildDailyMission,
  selectDueReviews,
  exercisesForMinutes,
  OBJECTIVES,
  conceptOfTheDay,
  V5_CONCEPTS,
  greetingFor,
} from '@/data';
import { analytics } from '@/analytics';
import { Disclaimer } from '@/components/Disclaimer';
import { useNow } from '@/lib/useNow';

/**
 * Accueil recentré (Learning-Master Lot 1) : une action principale (mission du jour) + progression
 * compacte + révision due + concept du jour. Le catalogue d'apprentissage vit dans l'onglet
 * « Apprendre » ; les quêtes vivent dans « Réussites ». L'accueil ne porte plus de grille de
 * raccourcis ni de blocs concurrents.
 */
export default function Home() {
  const router = useRouter();
  const { state, ready, profile } = useProgress();
  const now = useNow();

  if (!ready || !state) {
    return (
      <Screen>
        <StateView variant="loading" title="On prépare ta mission du jour…" />
      </Screen>
    );
  }

  const xpInLevel = state.totalXp % 100;
  const mission = buildDailyMission(state, SKILLS, now);
  const dueCount = selectDueReviews(state, SKILLS, now).length;
  const minutes = profile?.dailyMinutes ?? 5;
  const sessionCount = exercisesForMinutes(minutes);
  const objectiveLabel = OBJECTIVES.find((o) => o.value === profile?.objective)?.label;
  const featured = conceptOfTheDay(V5_CONCEPTS, now);
  const greeting = greetingFor(new Date(now).getHours());

  const startMission = () => {
    if (mission.skillId) {
      analytics.track('daily_mission_started', { skillId: mission.skillId, count: sessionCount });
      router.push({ pathname: '/session/[skillId]', params: { skillId: mission.skillId, count: String(sessionCount) } });
    } else {
      router.push('/parcours');
    }
  };

  return (
    <Screen>
      <Text variant="h1">{greeting}, apprenti !</Text>
      <Text variant="body" color={theme.colors.textSecondary}>
        {objectiveLabel
          ? `Objectif : ${objectiveLabel} · ${minutes} min aujourd’hui.`
          : 'Cinq minutes suffisent. Voici ta mission du jour.'}
      </Text>

      {/* Action principale unique : la mission du jour (progression compacte incluse) */}
      <Card elevated>
        <View style={styles.sectionLabel}>
          <TrademyIcon name="target" size={16} color={theme.colors.primaryBright} />
          <Text variant="label" color={theme.colors.primaryBright}>
            MISSION DU JOUR
          </Text>
        </View>
        <Text variant="h2">{mission.skillName || 'Module terminé'}</Text>
        <View style={styles.missionMascot}>
          <MascotFigure name="toto-think" gesture="idle" height={104} decorative />
        </View>
        <Text variant="body" color={theme.colors.textSecondary}>
          {mission.subtitle}
        </Text>
        {mission.skillId ? (
          <View style={styles.missionMeta}>
            <Chip iconName="timer" label={`~${minutes} min`} color={theme.colors.info} />
            <Chip iconName="book" label={`${sessionCount} exercice${sessionCount > 1 ? 's' : ''}`} color={theme.colors.neutral} />
          </View>
        ) : null}
        <View style={styles.cta}>
          <Button label={mission.ctaLabel} onPress={startMission} accessibilityHint="Démarrer la mission du jour" />
        </View>
        <View style={styles.progressStrip}>
          <View style={styles.chips}>
            <Chip iconName="star" label={`Niv. ${state.level}`} color={theme.colors.primary} />
            <Chip iconName="flame" label={`${state.streakDays} j`} color={theme.colors.warning} />
            <Chip
              iconName="coin"
              label={`${state.coins}`}
              color={theme.colors.reward}
              accessibilityLabel={`${state.coins} jeton${state.coins > 1 ? 's' : ''} d’apprentissage`}
            />
          </View>
          <ProgressBar value={xpInLevel / 100} accessibilityLabel={`${xpInLevel} sur 100 XP`} />
          <Text variant="caption" color={theme.colors.textMuted}>
            {xpInLevel} / 100 XP vers le niveau {state.level + 1}
          </Text>
        </View>
      </Card>

      {/* Accès rapide : révisions dues + favoris (Réviser n'est plus un onglet) */}
      <View style={styles.quickRow}>
        <Pressable
          style={styles.flex1}
          accessibilityRole="button"
          accessibilityHint="Ouvrir les révisions"
          onPress={() => router.push('/revisions')}
        >
          <Card style={dueCount ? styles.reviewDue : undefined}>
            <View style={styles.quickHead}>
              <TrademyIcon name="refresh" size={20} color={dueCount ? theme.colors.warning : theme.colors.primaryBright} />
              <Text variant="title" style={styles.flex1}>
                Révisions
              </Text>
            </View>
            <Text variant="caption" color={dueCount ? theme.colors.warning : theme.colors.textMuted}>
              {dueCount ? `${dueCount} carte${dueCount > 1 ? 's' : ''} à revoir` : 'À jour — reviens plus tard'}
            </Text>
          </Card>
        </Pressable>

        <Pressable
          style={styles.flex1}
          accessibilityRole="button"
          accessibilityHint="Ouvrir tes favoris dans la bibliothèque"
          onPress={() => router.push('/glossaire')}
        >
          <Card>
            <View style={styles.quickHead}>
              <TrademyIcon name="star" size={20} color={theme.colors.reward} />
              <Text variant="title" style={styles.flex1}>
                Favoris
              </Text>
            </View>
            <Text variant="caption" color={theme.colors.textMuted}>
              Tes fiches épinglées, dans la Bibliothèque.
            </Text>
          </Card>
        </Pressable>
      </View>

      {/* Concept du jour : hook de rétention + signal visuel (rotation déterministe) */}
      {featured ? (
        <Pressable
          accessibilityRole="button"
          accessibilityHint={`Découvrir le concept du jour : ${featured.title}`}
          onPress={() => router.push(`/concept/${featured.slug}`)}
        >
          <Card style={styles.conceptCard}>
            <View style={styles.sectionLabel}>
              <TrademyIcon name="hint" size={16} color={theme.colors.primaryBright} />
              <Text variant="label" color={theme.colors.primaryBright}>
                CONCEPT DU JOUR
              </Text>
            </View>
            <Text variant="h2">{featured.title}</Text>
            {featured.visualSpec ? (
              <View style={styles.conceptVisual}>
                <MiniVisual spec={featured.visualSpec} width={150} />
              </View>
            ) : null}
            <Text variant="body" color={theme.colors.textSecondary}>
              {featured.definitionShort}
            </Text>
            <Text variant="caption" color={theme.colors.primary}>
              Découvrir la fiche ›
            </Text>
          </Card>
        </Pressable>
      ) : null}

      <CharacterScene
        character="bobo"
        state="think"
        size={56}
        speech="Un pas par jour suffit. On vérifie, on ne devine pas."
      />

      <Disclaimer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  missionMascot: { alignItems: 'center', marginVertical: theme.spacing.sm },
  conceptCard: { borderColor: theme.colors.primary, gap: theme.spacing.xs },
  conceptVisual: { alignItems: 'center', marginVertical: theme.spacing.xs },
  missionMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  cta: { marginVertical: theme.spacing.md },
  progressStrip: { gap: theme.spacing.xs },
  chips: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.xs },
  quickRow: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'stretch' },
  quickHead: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: 2 },
  reviewDue: { borderColor: theme.colors.warning },
  flex1: { flex: 1 },
});
