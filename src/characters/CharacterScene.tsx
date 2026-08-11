import { View, StyleSheet } from 'react-native';
import { theme } from '../design-system/theme';
import { Text } from '../design-system/components/Text';
import { CharacterAnimationController } from './CharacterAnimationController';
import { CHARACTER_NAME, type CharacterId, type CharacterState } from './types';

export type CharacterSceneProps = {
  character: CharacterId;
  state?: CharacterState;
  size?: number;
  speech?: string;
  showName?: boolean;
  reversed?: boolean;
};

/** Un personnage + une bulle de dialogue optionnelle. Utilisé pour les conseils, feedbacks, etc. */
export function CharacterScene({
  character,
  state = 'idle',
  size = 84,
  speech,
  showName = true,
  reversed = false,
}: CharacterSceneProps) {
  const accent = character === 'toto' ? theme.colors.bullish : theme.colors.bearish;
  return (
    <View style={[styles.row, reversed && styles.reversed]}>
      <View style={styles.avatar}>
        {/* LOT M2 — le guide se tourne vers sa bulle : à droite en lecture normale, à gauche quand
            la scène est en miroir. Sans cela, un pointage désignerait le bord de l'écran. */}
        <CharacterAnimationController
          character={character}
          state={state}
          size={size}
          facing={reversed ? -1 : 1}
        />
        {showName ? (
          <Text variant="caption" color={accent} center>
            {CHARACTER_NAME[character]}
          </Text>
        ) : null}
      </View>
      {speech ? (
        <View style={[styles.bubble, { borderColor: accent }]}>
          <Text variant="body">{speech}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  reversed: { flexDirection: 'row-reverse' },
  avatar: { alignItems: 'center', gap: theme.spacing.xs },
  bubble: {
    flex: 1,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
});
