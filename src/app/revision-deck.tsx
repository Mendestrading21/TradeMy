import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Pressable, FlatList, StyleSheet } from 'react-native';
import { Screen, Text, Flashcard, Button, TrademyIcon, theme, hitSlopFor } from '@/design-system';
import { CharacterScene } from '@/characters';
import { MiniVisual } from '@/engines/visual';
import { buildRevisionDeck, ANGLE_LABEL, type RevisionAngle, type DeckFlashcard, type DeckQuiz } from '@/data';

const deck = buildRevisionDeck();

/**
 * Deck consolidé de révision — ouvert à tout le monde (v1 gratuite, ADR-110).
 *
 * LOT E2 — la matière a été multipliée (cartes DÉRIVÉES des champs réels de chaque fiche) : la
 * liste est donc VIRTUALISÉE (`FlatList`, `Screen scroll={false}`) et filtrable par ANGLE, pour
 * réviser une facette précise (reconnaître, confirmer, invalider, erreur, faux signal, limite)
 * plutôt que de dérouler tout le corpus.
 */
type Filtre = 'tout' | 'quiz' | RevisionAngle;

const ANGLES: RevisionAngle[] = ['reconnaitre', 'confirmer', 'invalider', 'erreur', 'faux-signal', 'limite'];

/** Une entrée de liste : carte de révision OU mini-quiz (rendus par le même composant retournable). */
type Item =
  | { kind: 'card'; key: string; card: DeckFlashcard }
  | { kind: 'quiz'; key: string; quiz: DeckQuiz };

export default function RevisionDeck() {
  const router = useRouter();
  const [filtre, setFiltre] = useState<Filtre>('tout');

  const items = useMemo<Item[]>(() => {
    if (filtre === 'quiz') return deck.quizzes.map((q, i) => ({ kind: 'quiz', key: `q-${i}`, quiz: q }));
    const cartes = filtre === 'tout' ? deck.flashcards : deck.flashcards.filter((f) => f.angle === filtre);
    const base: Item[] = cartes.map((f, i) => ({ kind: 'card', key: `f-${i}-${f.conceptSlug}`, card: f }));
    return filtre === 'tout' ? [...base, ...deck.quizzes.map((q, i): Item => ({ kind: 'quiz', key: `q-${i}`, quiz: q }))] : base;
  }, [filtre]);

  const derivees = deck.flashcards.filter((f) => f.origin === 'derivee').length;

  const Header = (
    <View style={styles.header}>
      <Text variant="h1">Deck de révision</Text>
      <Text variant="body" color={theme.colors.textSecondary}>
        {deck.flashcards.length} cartes ({derivees} tirées des fiches) · {deck.quizzes.length} mini-quiz ·{' '}
        {deck.conceptCount} concepts.
      </Text>
      <CharacterScene character="bobo" state="review" size={54} showName={false} speech="On révise l’essentiel, une carte à la fois." />
      <View style={styles.filters}>
        <Pill label="Tout" active={filtre === 'tout'} onPress={() => setFiltre('tout')} />
        {ANGLES.map((a) => (
          <Pill key={a} label={ANGLE_LABEL[a]} active={filtre === a} onPress={() => setFiltre(a)} />
        ))}
        <Pill label="Mini-quiz" active={filtre === 'quiz'} onPress={() => setFiltre('quiz')} />
      </View>
      <View accessible accessibilityLabel={`${items.length} carte${items.length !== 1 ? 's' : ''} à réviser dans cette sélection`}>
        <Text variant="caption" color={theme.colors.textMuted}>
          {items.length} carte{items.length !== 1 ? 's' : ''} dans cette sélection
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: Item }) => {
    const visual = item.kind === 'card' ? item.card.visualSpec : item.quiz.visualSpec;
    const titre = item.kind === 'card' ? item.card.conceptTitle : item.quiz.conceptTitle;
    const angle = item.kind === 'card' ? item.card.angle : undefined;
    return (
      <View style={styles.item}>
        <View style={styles.head}>
          {visual ? <MiniVisual spec={visual} width={96} /> : null}
          <View style={styles.flex1}>
            <Text variant="caption" color={theme.colors.technical}>
              {titre}
            </Text>
            {angle ? (
              <Text variant="label" color={theme.colors.textMuted}>
                {ANGLE_LABEL[angle]}
              </Text>
            ) : null}
          </View>
        </View>
        {item.kind === 'card' ? (
          <Flashcard front={item.card.front} back={item.card.back} />
        ) : (
          <Flashcard
            front={item.quiz.question}
            back={`Réponse : ${item.quiz.options[item.quiz.correctIndex]} — ${item.quiz.explanation}`}
          />
        )}
      </View>
    );
  };

  return (
    <Screen scroll={false}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.key}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        ListFooterComponent={<Button label="Retour" variant="secondary" onPress={() => router.back()} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        windowSize={7}
        removeClippedSubviews
      />
    </Screen>
  );
}

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityHint={`Réviser : ${label.toLowerCase()}`}
      hitSlop={hitSlopFor(24)}
      style={[styles.pill, active && styles.pillActive]}
    >
      {active ? <TrademyIcon name="check" size={13} color={theme.colors.onPrimary} /> : null}
      <Text variant="label" color={active ? theme.colors.onPrimary : theme.colors.textSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { padding: theme.spacing.lg, gap: theme.spacing.md },
  header: { gap: theme.spacing.sm, marginBottom: theme.spacing.xs },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 36,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  pillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  item: { gap: theme.spacing.xs },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  flex1: { flex: 1, gap: 2 },
});
