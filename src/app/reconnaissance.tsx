import { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Button, TrademyIcon, theme } from '@/design-system';
import { CharacterScene, characterLine } from '@/characters';
import { VisualCard } from '@/engines/visual';
import {
  buildVisualQuiz,
  QUIZ_DIFFICULTIES,
  RECOGNITION_GROUPS,
  useProgress,
  type RecognitionGroup,
  type QuizDifficulty,
} from '@/data';

const ROUNDS = 8;

/**
 * « Quiz visuel » — quiz de lecture de figures, gamifié et accessible. Les questions sont VARIÉES
 * (nom, sens de lecture, famille) selon la difficulté choisie. La figure est affichée en mode énigme
 * (aucune fuite de la réponse, y compris au lecteur d'écran) ; après le choix, le schéma se révèle
 * (étiquettes + explication illustrée). Déterministe par graine.
 */
export default function Reconnaissance() {
  const router = useRouter();
  const { recordRecognition, ready } = useProgress();
  const [seed, setSeed] = useState(2024);
  const [group, setGroup] = useState<RecognitionGroup>('all');
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('moyen');
  const session = useMemo(
    () => buildVisualQuiz(seed, { count: ROUNDS, difficulty, group }),
    [seed, group, difficulty],
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const resetSession = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
  };

  const chooseGroup = (g: RecognitionGroup) => {
    if (g === group) return;
    setGroup(g);
    resetSession();
  };

  const chooseDifficulty = (d: QuizDifficulty) => {
    if (d === difficulty) return;
    setDifficulty(d);
    resetSession();
  };

  const finished = index >= session.length;
  const round = finished ? null : session[index];
  const answered = selected !== null;
  const isCorrect = answered && round !== null && selected === round.correctIndex;
  // Réplique contextuelle et variée de Toto/Bobo (varie avec l'index de la question).
  const feedbackLine = answered ? characterLine({ kind: 'recognition', correct: isCorrect, streak }, index) : null;

  const choose = (i: number) => {
    if (answered || !round) return;
    setSelected(i);
    if (i === round.correctIndex) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    // Dernière manche : consigner le résultat de la série (persisté + badges).
    if (round && index === session.length - 1 && ready) {
      recordRecognition(score, bestStreak);
    }
    setSelected(null);
    setIndex((i) => i + 1);
  };

  const replay = () => {
    setSeed((s) => s + 1);
    resetSession();
  };

  const groupPicker = (
    <View style={styles.groups} accessibilityRole="tablist">
      {RECOGNITION_GROUPS.map((g) => {
        const active = group === g.id;
        return (
          <Pressable
            key={g.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityHint={`S’entraîner : ${g.label.toLowerCase()}`}
            onPress={() => chooseGroup(g.id)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text variant="caption" color={active ? theme.colors.backgroundDeep : theme.colors.textSecondary}>
              {g.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const difficultyPicker = (
    <View style={styles.groups} accessibilityRole="tablist">
      {QUIZ_DIFFICULTIES.map((d) => {
        const active = difficulty === d.id;
        return (
          <Pressable
            key={d.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityHint={`Difficulté : ${d.label} — ${d.hint}`}
            onPress={() => chooseDifficulty(d.id)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text variant="caption" color={active ? theme.colors.backgroundDeep : theme.colors.advanced}>
              {d.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (finished) {
    const ratio = Math.round((score / session.length) * 100);
    return (
      <Screen>
        <View style={styles.titleRow}>
          <TrademyIcon name="search" size={22} color={theme.colors.primaryBright} />
          <Text variant="h1">Résultat</Text>
        </View>
        {difficultyPicker}
        {groupPicker}
        <Card elevated style={styles.result}>
          <Text variant="h2">{score} / {session.length} bonnes réponses</Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            Meilleure série : {bestStreak} d’affilée · {ratio}% de réussite.
          </Text>
          <CharacterScene
            character={ratio >= 60 ? 'toto' : 'bobo'}
            state={ratio >= 60 ? 'celebrate-small' : 'encourage'}
            size={64}
            speech={ratio >= 60 ? 'Bel œil ! Ta lecture des figures progresse.' : 'La reconnaissance vient avec la répétition. On recommence ?'}
          />
        </Card>
        <Button label="Rejouer une série" onPress={replay} accessibilityHint="Recommencer avec de nouvelles figures" />
        <Button label="Voir la bibliothèque des figures" variant="secondary" onPress={() => router.push('/bibliotheque-visuelle')} accessibilityHint="Ouvrir la galerie de toutes les figures" />
        <Button label="Retour" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.titleRow}>
        <TrademyIcon name="search" size={22} color={theme.colors.primaryBright} />
        <Text variant="h1">Quiz visuel</Text>
      </View>
      {difficultyPicker}
      {groupPicker}
      <View style={styles.meta}>
        <Text variant="caption" color={theme.colors.textMuted}>Question {index + 1} / {session.length}</Text>
        <Text variant="caption" color={theme.colors.technical}>Score {score} · série {streak}</Text>
      </View>

      <VisualCard spec={round!.spec} blind={!answered} title={answered ? round!.figureTitle : undefined} />

      <Text variant="body" color={theme.colors.textSecondary}>
        {answered ? 'Réponse révélée — le schéma est annoté ci-dessus.' : round!.prompt}
      </Text>

      <View style={styles.options}>
        {round!.options.map((opt, i) => {
          const correct = answered && i === round!.correctIndex;
          const wrongPick = answered && i === selected && i !== round!.correctIndex;
          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityState={{ disabled: answered, selected: i === selected }}
              accessibilityHint={answered ? undefined : `Répondre : ${opt}`}
              disabled={answered}
              onPress={() => choose(i)}
              style={[
                styles.option,
                correct && styles.optionCorrect,
                wrongPick && styles.optionWrong,
              ]}
            >
              <Text variant="body" color={theme.colors.textPrimary} style={styles.flex1}>
                {answered && correct ? '✓ ' : wrongPick ? '✗ ' : ''}
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {answered ? (
        <Card>
          <Text variant="title" color={isCorrect ? theme.colors.bullish : theme.colors.bearish}>
            {isCorrect ? 'Bien vu !' : `Réponse : ${round!.options[round!.correctIndex]}`}
          </Text>
          <Text variant="body" color={theme.colors.textSecondary}>
            Figure : {round!.figureTitle}. {round!.explanation}
          </Text>
          {feedbackLine ? (
            <CharacterScene
              character={feedbackLine.character}
              state={feedbackLine.state}
              size={54}
              showName={false}
              speech={feedbackLine.text}
            />
          ) : null}
          <Button label={index + 1 >= session.length ? 'Voir le résultat' : 'Figure suivante'} onPress={next} accessibilityHint="Passer à la figure suivante" />
        </Card>
      ) : null}

      <Button label="Abandonner" variant="ghost" onPress={() => router.back()} accessibilityHint="Quitter l’entraînement" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  groups: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.xs },
  pill: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
  },
  pillActive: { backgroundColor: theme.colors.technical, borderColor: theme.colors.technical },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  options: { gap: theme.spacing.sm, marginVertical: theme.spacing.sm },
  option: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCorrect: { borderColor: theme.colors.bullish, backgroundColor: `${theme.colors.bullish}22` },
  optionWrong: { borderColor: theme.colors.bearish, backgroundColor: `${theme.colors.bearish}22` },
  result: { gap: theme.spacing.sm, alignItems: 'flex-start' },
  flex1: { flex: 1 },
});
