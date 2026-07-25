import { View, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { Text } from './Text';
import { TrademyIcon, type TrademyIconName } from '../icons/TrademyIcon';

export type ChipProps = {
  /** Icône fonctionnelle du système Trademy (préférée pour un indicateur/statut). */
  iconName?: TrademyIconName;
  /** Emoji de contenu (décoratif) — utiliser `iconName` pour une icône fonctionnelle. */
  icon?: string;
  label: string;
  color?: string;
  accessibilityLabel?: string;
};

/**
 * Petite pastille pour XP, série (streak), pièces, niveau, statut…
 *
 * A11y : le conteneur est un ÉLÉMENT accessible unique (`accessible`), ce qui rend la prop
 * `accessibilityLabel` réellement opérationnelle et regroupe l'annonce (pas de double lecture
 * icône + texte). L'icône reste décorative (masquée par `TrademyIcon`). Quand le libellé visible
 * n'a pas de sens seul (ex. un nombre nu comme un compteur), passez un `accessibilityLabel` explicite.
 */
export function Chip({ iconName, icon, label, color, accessibilityLabel }: ChipProps) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.chip, color ? { borderColor: color } : null]}
    >
      {iconName ? (
        <TrademyIcon name={iconName} size={14} color={color ?? theme.colors.textPrimary} strokeWidth={2.2} />
      ) : icon ? (
        <Text variant="caption">{icon}</Text>
      ) : null}
      <Text variant="label" color={color ?? theme.colors.textPrimary}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
});
