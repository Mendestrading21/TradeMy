import { Pressable } from 'react-native';
import { theme } from '../theme';
import { hitSlopFor } from '../a11y';
import { TrademyIcon } from '../icons/TrademyIcon';

export type FavoriteButtonProps = {
  active: boolean;
  onToggle: () => void;
  /** Nom de l'élément, injecté dans le label d'accessibilité (« Ajouter … aux favoris »). */
  label: string;
  size?: 'md' | 'lg';
};

/**
 * Bouton favori accessible — icône canonique `star` / `star-filled` (jamais un glyphe Unicode).
 * Actif = `star-filled` en accent de MARQUE (`primaryBright`) ; inactif = `star` en ton neutre.
 * Un favori n'est PAS une récompense : on n'emploie donc jamais `reward`. L'état n'est jamais porté
 * par la seule couleur — il est aussi dans `accessibilityState.selected` et le glyphe plein/vide.
 */
export function FavoriteButton({ active, onToggle, label, size = 'md' }: FavoriteButtonProps) {
  const px = size === 'lg' ? 26 : 22;
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={hitSlopFor(28)}
      accessibilityRole="button"
      accessibilityLabel={active ? `Retirer ${label} des favoris` : `Ajouter ${label} aux favoris`}
      accessibilityState={{ selected: active }}
    >
      <TrademyIcon
        name={active ? 'star-filled' : 'star'}
        size={px}
        color={active ? theme.colors.primaryBright : theme.colors.textMuted}
      />
    </Pressable>
  );
}
