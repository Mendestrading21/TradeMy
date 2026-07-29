import { useRouter } from 'expo-router';
import { Pressable, View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Chip, theme } from '@/design-system';
import { SKILLS, getLessons } from '@/data';

export default function Lecons() {
  const router = useRouter();

  return (
    <Screen>
      <Text variant="h1">Leçons</Text>
      <Text variant="body" color={theme.colors.textSecondary}>
        Module pilote « Lire un graphique » — {SKILLS.length} compétences.
      </Text>

      {SKILLS.map((skill) => (
        <View key={skill.id} style={styles.section}>
          <Text variant="h2">{skill.name}</Text>
          {getLessons(skill.id).map((lesson) => (
            <Pressable
              key={lesson.id}
              accessibilityRole="button"
              accessibilityHint="Ouvrir la leçon"
              onPress={() => router.push(`/lesson/${lesson.id}`)}
            >
              <Card>
                <Text variant="title">{lesson.title}</Text>
                <Text variant="body" color={theme.colors.textSecondary}>
                  {lesson.objective}
                </Text>
                <View style={styles.meta}>
                  <Chip label={`${lesson.estimatedMinutes ?? 5} min`} />
                  <Chip label={lesson.difficulty ?? 'débutant'} color={theme.colors.primary} />
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      ))}

      <Card>
        <Text variant="title">Envie de t’exercer sur un vrai graphique ?</Text>
        <Text variant="body" color={theme.colors.textSecondary}>
          L’onglet Laboratoire présente une figure en chandeliers avec sa zone de
          confirmation et son invalidation.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Ouvrir le Laboratoire"
          onPress={() => router.push('/laboratoire')}
        >
          <Text variant="title" color={theme.colors.primaryBright}>
            Ouvrir le Laboratoire ›
          </Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: theme.spacing.sm },
  meta: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
});
