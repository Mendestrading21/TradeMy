import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { theme } from '../design-system/theme';
import { IMAGES, type ImageName } from './assets';
import { STATE_TO_EXPRESSION } from './states';
import type { CharacterId, CharacterState, Expression } from './types';

export type MascotAvatarProps = {
  character: CharacterId;
  state?: CharacterState;
  size?: number;
};

const LABEL: Record<CharacterId, string> = {
  toto: 'Toto, le taureau vert',
  bobo: "Bobo, l'ours rouge",
};

/**
 * Cadrage TÊTE d'un render 3D réel dans un cercle : centre du visage (cx, cy) en coordonnées
 * relatives de l'image source, et zoom = hauteur affichée de l'image / diamètre du cercle.
 * `iw`/`ih` = dimensions natives du PNG (vérifiées) pour préserver le ratio exact.
 */
type HeadCrop = { cx: number; cy: number; zoom: number; iw: number; ih: number };

const HEAD_CROP: Partial<Record<ImageName, HeadCrop>> = {
  'toto-wave': { cx: 0.56, cy: 0.27, zoom: 2.2, iw: 541, ih: 760 },
  'toto-present': { cx: 0.38, cy: 0.29, zoom: 2.2, iw: 649, ih: 760 },
  'toto-think': { cx: 0.54, cy: 0.36, zoom: 1.7, iw: 589, ih: 760 },
  'bobo-wave': { cx: 0.59, cy: 0.26, zoom: 2.2, iw: 570, ih: 760 },
  'bobo-warning': { cx: 0.52, cy: 0.28, zoom: 2.1, iw: 545, ih: 760 },
};

/**
 * Figure 3D par expression — DÉRIVÉE du registre d'états (STATE_TO_EXPRESSION, source unique).
 * Bobo n'a que deux poses rendues : salut (accueillant) et mise en garde (sérieux).
 */
export const AVATAR_FIGURE: Record<CharacterId, Record<Expression, ImageName>> = {
  toto: {
    neutral: 'toto-wave',
    happy: 'toto-wave',
    excited: 'toto-present',
    thinking: 'toto-think',
    concerned: 'toto-think',
    sad: 'toto-think',
  },
  bobo: {
    neutral: 'bobo-wave',
    happy: 'bobo-wave',
    excited: 'bobo-wave',
    thinking: 'bobo-warning',
    concerned: 'bobo-warning',
    sad: 'bobo-warning',
  },
};

/**
 * Avatar 3D — la TÊTE du render réel (fond transparent) cadrée dans un cercle.
 * Remplace l'ancien avatar vectoriel 2D : mêmes personnages partout, du grand écran
 * d'accueil aux bulles de dialogue. L'expression est déduite de l'état via
 * STATE_TO_EXPRESSION (source unique). Même API : remplacement direct dans
 * CharacterAnimationController — tous les écrans en héritent.
 */
export function MascotAvatar({ character, state = 'idle', size = 96 }: MascotAvatarProps) {
  const expr = STATE_TO_EXPRESSION[state];
  const name = AVATAR_FIGURE[character][expr];
  const crop = HEAD_CROP[name]!;
  const h = size * crop.zoom;
  const w = h * (crop.iw / crop.ih);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={LABEL[character]}
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Image
        source={IMAGES[name]}
        contentFit="fill"
        style={{
          position: 'absolute',
          width: w,
          height: h,
          left: size / 2 - crop.cx * w,
          top: size / 2 - crop.cy * h,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
