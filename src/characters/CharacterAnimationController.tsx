import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  cancelAnimation,
} from 'react-native-reanimated';
import { MascotAvatar } from './MascotAvatar';
import { useReducedMotion } from './useReducedMotion';
import { CHARACTER_STATES } from './states';
import { motionPlan } from './motionPlan';
import { motion } from '../design-system/tokens';
import type { CharacterId, CharacterState } from './types';

export type CharacterAnimationControllerProps = {
  character: CharacterId;
  state?: CharacterState;
  size?: number;
};

/**
 * Point d'intégration unique pour l'animation des personnages (avatars 3D Toto/Bobo).
 *
 * Applique des micro-animations Reanimated pilotées par le registre d'états (source unique) :
 * pop bref au changement d'état (dosé par l'intensité, durée = token motion), et flottement
 * doux UNIQUEMENT au repos. Aucune boucle décorative hors idle. L'API {character, state, size}
 * est inchangée : tous les écrans en héritent.
 *
 * Respecte toujours « réduire les animations » : rendu statique (aucun mouvement) si activé,
 * avec le même libellé accessible.
 */
export function CharacterAnimationController({
  character,
  state = 'idle',
  size = 96,
}: CharacterAnimationControllerProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  // Libellé accessible piloté par le registre (source unique) ; plan de mouvement dérivé du
  // noyau PUR `motionPlan` (reduced-motion, échelle du pop, boucle idle) — testable sans Reanimated.
  // On extrait des primitives (narrow-safe) pour un tableau de dépendances honnête.
  const accessibleText = CHARACTER_STATES[state]?.accessibleText ?? '';
  const plan = motionPlan(state, reduced);
  const isStatic = plan.kind === 'static';
  const popTarget = plan.kind === 'animated' ? plan.popScale : 1;
  const loopFloat = plan.kind === 'animated' ? plan.loopFloat : false;

  useEffect(() => {
    if (isStatic) {
      cancelAnimation(scale);
      cancelAnimation(translateY);
      scale.value = 1;
      translateY.value = 0;
      return;
    }
    // réaction ponctuelle au changement d'état, dosée par l'intensité ; pop bref (< 120 ms).
    scale.value = withSequence(withTiming(popTarget, { duration: motion.instant }), withSpring(1));
    // flottement doux UNIQUEMENT au repos (seule boucle entretenue).
    if (loopFloat) {
      translateY.value = withRepeat(withSequence(withTiming(-3, { duration: 1100 }), withTiming(0, { duration: 1100 })), -1, true);
    } else {
      cancelAnimation(translateY);
      translateY.value = withTiming(0, { duration: 200 });
    }
    // Démontage / changement d'état : on annule la boucle pour ne laisser aucun timer actif.
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(scale);
    };
  }, [isStatic, popTarget, loopFloat, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  if (reduced) {
    // Alternative STATIQUE : même avatar, aucune animation, même information (libellé accessible).
    return (
      <View accessibilityRole="image" accessibilityLabel={accessibleText}>
        <MascotAvatar character={character} state={state} size={size} />
      </View>
    );
  }

  return (
    <Animated.View style={animatedStyle} accessibilityRole="image" accessibilityLabel={accessibleText}>
      <MascotAvatar character={character} state={state} size={size} />
    </Animated.View>
  );
}
