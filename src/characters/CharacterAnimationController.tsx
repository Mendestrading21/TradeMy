import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated';
import { MascotAvatar } from './MascotAvatar';
import { useReducedMotion } from './useReducedMotion';
import { CHARACTER_STATES } from './states';
import { motionPlan, presenceFor } from './motionPlan';
import { motion } from '../design-system/tokens';
import type { CharacterId, CharacterState } from './types';

export type CharacterAnimationControllerProps = {
  character: CharacterId;
  state?: CharacterState;
  size?: number;
  /** LOT W3 — anneau d'identité + halo (transmis à l'avatar) : mise en avant du guide. */
  ring?: boolean;
};

/**
 * Point d'intégration unique pour l'animation des personnages (avatars 3D Toto/Bobo).
 *
 * LOT M1 — les guides HABITENT l'écran. Les renders sont des images 3D fixes (canon : jamais de 3D
 * temps réel) ; la présence vient donc du mouvement, en quatre gestes :
 *  1. **arrivée** — le guide s'approche (échelle + montée) au lieu d'apparaître d'un coup ;
 *  2. **respiration** — flottement propre au tempérament (Toto ample et vif, Bobo lent et contenu) ;
 *  3. **balancement** — une micro-rotation en phase avec la respiration, qui révèle le volume ;
 *  4. **ombre au sol** — elle se resserre et s'éclaircit quand le guide monte : c'est elle qui
 *     l'ancre dans l'espace au lieu d'un autocollant posé sur le fond.
 *
 * Le pop bref au changement d'état (dosé par l'intensité du registre) est conservé. Aucune boucle
 * décorative hors repos. « Réduire les animations » reste prioritaire : rendu strictement statique,
 * sans ombre animée, avec le même libellé accessible.
 */
export function CharacterAnimationController({
  character,
  state = 'idle',
  size = 96,
  ring = false,
}: CharacterAnimationControllerProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  /** Progression de la respiration (0 = au sol, 1 = au plus haut) — pilote sway ET ombre. */
  const breath = useSharedValue(0);
  /** Progression de l'arrivée (0 = au loin, 1 = en place). */
  const entry = useSharedValue(1);

  // Libellé accessible piloté par le registre (source unique) ; plan de mouvement dérivé du
  // noyau PUR `motionPlan` (reduced-motion, échelle du pop, boucle idle, présence du personnage).
  const accessibleText = CHARACTER_STATES[state]?.accessibleText ?? '';
  const plan = motionPlan(state, reduced, character);
  const isStatic = plan.kind === 'static';
  const popTarget = plan.kind === 'animated' ? plan.popScale : 1;
  const loopFloat = plan.kind === 'animated' ? plan.loopFloat : false;
  const presence = presenceFor(character);
  const { floatPx, floatPeriodMs, swayDeg, entryScale, entryTranslateY, shadowOpacity } = presence;

  useEffect(() => {
    if (isStatic) {
      cancelAnimation(scale);
      cancelAnimation(translateY);
      cancelAnimation(breath);
      cancelAnimation(entry);
      scale.value = 1;
      translateY.value = 0;
      breath.value = 0;
      entry.value = 1;
      return;
    }
    // 1. Arrivée : le guide s'approche puis se pose (ressort doux, sans rebond excessif).
    entry.value = 0;
    entry.value = withSpring(1, { damping: 14, stiffness: 140 });
    // 2. Réaction ponctuelle au changement d'état, dosée par l'intensité ; pop bref (< 120 ms).
    scale.value = withSequence(withTiming(popTarget, { duration: motion.instant }), withSpring(1));
    // 3. Respiration UNIQUEMENT au repos (seule boucle entretenue) — sway et ombre en dérivent.
    if (loopFloat) {
      breath.value = withRepeat(
        withSequence(withTiming(1, { duration: floatPeriodMs }), withTiming(0, { duration: floatPeriodMs })),
        -1,
        true,
      );
    } else {
      cancelAnimation(breath);
      breath.value = withTiming(0, { duration: 200 });
    }
    // Démontage / changement d'état : on annule tout pour ne laisser aucun timer actif.
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(breath);
      cancelAnimation(entry);
    };
  }, [isStatic, popTarget, loopFloat, floatPeriodMs, scale, translateY, breath, entry]);

  const avatarStyle = useAnimatedStyle(() => {
    const lift = -breath.value * floatPx + (1 - entry.value) * entryTranslateY;
    const approach = entryScale + (1 - entryScale) * entry.value;
    return {
      opacity: entry.value,
      transform: [
        { perspective: 600 },
        { translateY: lift + translateY.value },
        { rotateZ: `${(breath.value * 2 - 1) * swayDeg}deg` },
        { scale: scale.value * approach },
      ],
    };
  });

  // L'ombre se resserre et s'éclaircit quand le guide monte : l'ancrage au sol se lit.
  const shadowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(breath.value, [0, 1], [shadowOpacity, shadowOpacity * 0.55]) * entry.value,
    transform: [{ scaleX: interpolate(breath.value, [0, 1], [1, 0.82]) }],
  }));

  if (reduced) {
    // Alternative STATIQUE : même avatar, aucune animation, même information (libellé accessible).
    return (
      <View accessibilityRole="image" accessibilityLabel={accessibleText}>
        <MascotAvatar character={character} state={state} size={size} ring={ring} />
      </View>
    );
  }

  return (
    <View accessibilityRole="image" accessibilityLabel={accessibleText} style={styles.stage}>
      <Animated.View
        pointerEvents="none"
        style={[styles.shadow, { width: size * 0.62, height: Math.max(5, size * 0.09), borderRadius: size }, shadowStyle]}
      />
      <Animated.View style={avatarStyle}>
        <MascotAvatar character={character} state={state} size={size} ring={ring} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'flex-end' },
  /** Ombre portée au sol : noir translucide, jamais une couleur sémantique. */
  shadow: { position: 'absolute', bottom: 0, backgroundColor: '#000' },
});
