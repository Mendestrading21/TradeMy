import { View, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { Text } from './Text';
import { TrademyIcon } from '../icons/TrademyIcon';

export type OfflineBannerProps = { visible: boolean };

/** Bandeau discret indiquant l'état hors ligne. Rôle « alert » pour les lecteurs d'écran. */
export function OfflineBanner({ visible }: OfflineBannerProps) {
  if (!visible) return null;
  return (
    <View accessibilityRole="alert" style={styles.bar}>
      <TrademyIcon name="info" size={14} color={theme.colors.textPrimary} />
      <Text variant="label" color={theme.colors.textPrimary} center>
        Hors ligne — ta progression reste enregistrée sur cet appareil.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceInteractive,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderStrong,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
});
