import { View, StyleSheet } from 'react-native';
import { theme } from '../design-system/theme';
import { MascotAvatar } from './MascotAvatar';

export type MascotDuoProps = {
  /** Diamètre d'une tête (le duo fait ~1,65 × cette largeur). */
  size?: number;
  /** Anneaux d'identité (vert Toto / rouge Bobo) autour des deux têtes. */
  ring?: boolean;
};

/**
 * LOT W3 — « Duo » : nouveau format mascotte — les DEUX têtes 3D réelles en cercles superposés
 * (Toto devant à gauche, Bobo derrière à droite), dérivées des renders officiels (aucun nouvel
 * asset, aucun autre style). Un SEUL élément accessible « Toto et Bobo, vos guides » ; les têtes
 * internes sont décoratives. Format compact pour en-têtes (onboarding, sections de dialogue).
 */
export function MascotDuo({ size = 48, ring = false }: MascotDuoProps) {
  const overlap = Math.round(size * 0.35);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Toto et Bobo, vos guides"
      style={[styles.wrap, { height: size, width: size * 2 - overlap }]}
    >
      <View style={[styles.head, { left: size - overlap }]}>
        <MascotAvatar character="bobo" size={size} ring={ring} decorative />
      </View>
      {/* Toto devant : léger liseré de fond pour détacher les deux cercles. */}
      <View style={[styles.head, styles.front, { borderRadius: size / 2 + 2 }]}>
        <MascotAvatar character="toto" size={size} ring={ring} decorative />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  head: { position: 'absolute', top: 0, left: 0 },
  front: { borderWidth: 2, borderColor: theme.colors.background, margin: -2 },
});
