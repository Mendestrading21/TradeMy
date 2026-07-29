import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Flashcard, Button, theme } from '@/design-system';
import { CharacterScene } from '@/characters';
import { MiniVisual } from '@/engines/visual';
import { buildRevisionDeck } from '@/data';

const deck = buildRevisionDeck();

/** Deck consolidé de révision — ouvert à tout le monde (v1 gratuite, ADR-110). */
export default function RevisionDeck() {
  const router = useRouter();

  return (
    <Screen>
      <Text variant="h1">Deck de révision</Text>
      <Text variant="body" color={theme.colors.textSecondary}>
        {deck.flashcards.length} flashcards · {deck.quizzes.length} mini-quiz · {deck.conceptCount} concepts.
      </Text>
      <CharacterScene character="bobo" state="review" size={54} showName={false} speech="On révise l’essentiel, une carte à la fois." />

      <Text variant="h2">Flashcards</Text>
      {deck.flashcards.map((f, i) => (
        <View key={`f-${i}`} style={styles.item}>
          <View style={styles.head}>
            {f.visualSpec ? <MiniVisual spec={f.visualSpec} width={96} /> : null}
            <Text variant="caption" color={theme.colors.technical} style={styles.flex1}>
              {f.conceptTitle}
            </Text>
          </View>
          <Flashcard front={f.front} back={f.back} />
        </View>
      ))}

      <Text variant="h2">Mini-quiz</Text>
      {deck.quizzes.map((q, i) => (
        <View key={`q-${i}`} style={styles.item}>
          <View style={styles.head}>
            {q.visualSpec ? <MiniVisual spec={q.visualSpec} width={96} /> : null}
            <Text variant="caption" color={theme.colors.technical} style={styles.flex1}>
              {q.conceptTitle}
            </Text>
          </View>
          <Flashcard front={q.question} back={`Réponse : ${q.options[q.correctIndex]} — ${q.explanation}`} />
        </View>
      ))}

      <Button label="Retour" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { gap: theme.spacing.xs },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  flex1: { flex: 1 },
});
