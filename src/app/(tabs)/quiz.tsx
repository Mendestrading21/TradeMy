import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Card, Button, Chip, theme } from '@/design-system';
import { CharacterScene, MascotFigure } from '@/characters';
import { MiniVisual } from '@/engines/visual';
import { DEMO_SKILL, DEMO_EXERCISES, V5_CONCEPTS } from '@/data';

/** Quelques figures à reconnaître (signal visuel sur la page d'accueil du quiz). */
const RECOGNIZE = V5_CONCEPTS.filter((c) => c.visualSpec).slice(0, 6);

const FORMAT_LABELS: Record<string, string> = {
  mcq: 'Choix multiple',
  true_false: 'Vrai / Faux',
  numeric: 'Numérique',
  order: 'Mise en ordre',
  match: 'Association',
  find_error: 'Trouve l’erreur',
  identify_pattern: 'Reconnaissance',
  scenario: 'Scénario',
  select_chart_zone: 'Zone du graphique',
  place_invalidation: 'Place l’invalidation',
  label_chart: 'Étiquette le graphique',
  sequence_market_structure: 'Ordonne la structure',
  identify_figure: 'Reconnais la figure',
};

export default function Quiz() {
  const router = useRouter();
  const formats = [...new Set(DEMO_EXERCISES.map((e) => e.type))];

  return (
    <Screen>
      <Text variant="h1">Quiz éclair</Text>
      <Text variant="body" color={theme.colors.textSecondary}>
        Une session de {DEMO_EXERCISES.length} exercices variés sur « {DEMO_SKILL.name} ».
      </Text>

      <MascotFigure name="analyze" gesture="idle" height={160} />

      <Card>
        <Text variant="title">Formats de cette session</Text>
        <View style={styles.formats}>
          {formats.map((f) => (
            <Chip key={f} label={FORMAT_LABELS[f] ?? f} color={theme.colors.primary} />
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="title">Ce que tu vas reconnaître</Text>
        <Text variant="caption" color={theme.colors.textMuted}>
          Des figures à repérer — chaque schéma est dessiné en code.
        </Text>
        <View style={styles.recognize}>
          {RECOGNIZE.map((c) => (
            <View key={c.id} style={styles.recognizeItem}>
              {c.visualSpec ? <MiniVisual spec={c.visualSpec} width={104} /> : null}
              <Text variant="caption" color={theme.colors.textSecondary} center>
                {c.shortTitle}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <CharacterScene
        character="toto"
        state="explain"
        speech="Chaque bonne réponse te donne de l’XP. On explique toujours pourquoi !"
      />

      <Button
        label="Commencer la session"
        onPress={() => router.push(`/session/${DEMO_SKILL.id}`)}
        accessibilityHint="Lancer les exercices"
      />
      <Button
        label="Quiz visuel"
        variant="secondary"
        onPress={() => router.push('/reconnaissance')}
        accessibilityHint="Quiz de lecture des figures : nom, sens, famille — 3 niveaux de difficulté"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  formats: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  recognize: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginTop: theme.spacing.sm, justifyContent: 'space-between' },
  recognizeItem: { alignItems: 'center', gap: 2 },
});
