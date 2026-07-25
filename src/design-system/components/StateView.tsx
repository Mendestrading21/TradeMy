import { View, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { Text } from './Text';
import { Button } from './Button';
import { Skeleton } from './Skeleton';
import { TrademyIcon, type TrademyIconName } from '../icons/TrademyIcon';

export type StateVariant = 'loading' | 'empty' | 'error' | 'offline' | 'locked';

export type StateViewProps = {
  variant?: StateVariant;
  title?: string;
  message?: string;
  /** Émoji d'illustration (ignoré en `loading`). Sobre par défaut, override possible. */
  icon?: string;
  /**
   * Icône de la FAMILLE Trademy (préférée à `icon`). Décorative (masquée aux lecteurs d'écran :
   * l'état entier est déjà annoncé via `accessibilityLabel`). Ignorée en `loading`.
   */
  iconName?: TrademyIconName;
  /** Action principale unique (ex. Réessayer). Un seul CTA par état. */
  action?: { label: string; onPress: () => void };
};

const DEFAULTS: Record<StateVariant, { icon: string; title: string; tone: string }> = {
  loading: { icon: '⏳', title: 'Chargement…', tone: theme.colors.textSecondary },
  empty: { icon: '🧭', title: 'Rien ici pour l’instant', tone: theme.colors.textPrimary },
  error: { icon: '😵‍💫', title: 'Oups, un pépin est survenu', tone: theme.colors.danger },
  offline: { icon: '📡', title: 'Tu es hors ligne', tone: theme.colors.textPrimary },
  locked: { icon: '🔒', title: 'Contenu verrouillé', tone: theme.colors.textMuted },
};

/**
 * État transversal : loading / empty / error / offline / locked.
 * Une seule priorité visuelle par état, un seul CTA. Annoncé aux lecteurs d'écran.
 */
export function StateView({ variant = 'empty', title, message, icon, iconName, action }: StateViewProps) {
  const d = DEFAULTS[variant];
  const heading = title ?? d.title;
  const label = message ? `${heading}. ${message}` : heading;

  if (variant === 'loading') {
    return (
      <View
        style={styles.loading}
        accessible
        accessibilityRole="progressbar"
        accessibilityState={{ busy: true }}
        accessibilityLabel={message ? `${heading}. ${message}` : heading}
      >
        <Skeleton width={'60%'} height={22} />
        <Skeleton width={'100%'} height={90} radius={theme.radius.lg} />
        <Skeleton width={'90%'} height={16} />
        <Skeleton width={'75%'} height={16} />
        <Text variant="caption" color={theme.colors.textMuted} center style={styles.loadingLabel}>
          {heading}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap} accessible accessibilityRole="summary" accessibilityLabel={label}>
      {iconName ? (
        <TrademyIcon name={iconName} size={40} color={d.tone} strokeWidth={2} />
      ) : (
        <Text variant="display" center>
          {icon ?? d.icon}
        </Text>
      )}
      <Text variant="h2" center color={d.tone}>
        {heading}
      </Text>
      {message ? (
        <Text variant="body" color={theme.colors.textSecondary} center>
          {message}
        </Text>
      ) : null}
      {action ? (
        <View style={styles.action}>
          <Button label={action.label} onPress={action.onPress} fullWidth={false} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.lg,
  },
  action: { marginTop: theme.spacing.md },
  loading: { gap: theme.spacing.md, paddingVertical: theme.spacing.lg },
  loadingLabel: { marginTop: theme.spacing.xs },
});
