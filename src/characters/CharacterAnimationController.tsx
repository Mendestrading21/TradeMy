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
import { motionPlan, presenceFor, maxLiftPx } from './motionPlan';
import { motion } from '../design-system/tokens';
import type { CharacterId, CharacterState } from './types';

export type CharacterAnimationControllerProps = {
  character: CharacterId;
  state?: CharacterState;
  size?: number;
  /** LOT W3 — anneau d'identité + halo (transmis à l'avatar) : mise en avant du guide. */
  ring?: boolean;
  /**
   * LOT M2 — côté vers lequel le guide se tourne quand il désigne quelque chose. Par défaut le
   * contenu est à sa droite (`1`) ; passer `-1` quand la scène est en miroir, sinon le guide
   * pointerait hors de l'écran.
   */
  facing?: 1 | -1;
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
 *
 * LOT M2 — le geste DIT quelque chose. À l'arrivée d'un état, le guide joue la trajectoire courte
 * décidée par le noyau pur (`gestureFor` → `gestureTrack`) : il bondit, hoche, se balance, se
 * penche vers ce qu'il désigne ou se tasse pour réfléchir. Les gestes « maintenus » (regard,
 * réflexion) restent en place jusqu'au changement d'état — c'est la « sortie » du canon. Aucun
 * geste ne boucle : `idle` demeure la seule boucle entretenue de toute l'application.
 */
export function CharacterAnimationController({
  character,
  state = 'idle',
  size = 96,
  ring = false,
  facing = 1,
}: CharacterAnimationControllerProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  /** Progression de la respiration (0 = au sol, 1 = au plus haut) — pilote sway ET ombre. */
  const breath = useSharedValue(0);
  /** Progression de l'arrivée (0 = au loin, 1 = en place). */
  const entry = useSharedValue(1);
  /** LOT M2 — geste courant, sur les trois axes qu'un render 3D fixe peut porter honnêtement. */
  const gestureY = useSharedValue(0);
  const gestureX = useSharedValue(0);
  const gestureRot = useSharedValue(0);

  // Libellé accessible piloté par le registre (source unique) ; plan de mouvement dérivé du
  // noyau PUR `motionPlan` (reduced-motion, échelle du pop, boucle idle, présence du personnage).
  const accessibleText = CHARACTER_STATES[state]?.accessibleText ?? '';
  const plan = motionPlan(state, reduced, character, facing);
  const isStatic = plan.kind === 'static';
  const popTarget = plan.kind === 'animated' ? plan.popScale : 1;
  const loopFloat = plan.kind === 'animated' ? plan.loopFloat : false;
  const presence = presenceFor(character);
  const { floatPx, floatPeriodMs, swayDeg, entryScale, entryTranslateY, shadowOpacity } = presence;
  // La trajectoire est sérialisée pour servir de dépendance stable à l'effet : deux états qui
  // jouent le même geste ne relancent pas l'animation pour rien.
  const track = plan.kind === 'animated' ? plan.track : null;
  const trackKey = track ? JSON.stringify(track) : 'static';

  useEffect(() => {
    if (isStatic || !track) {
      cancelAnimation(scale);
      cancelAnimation(translateY);
      cancelAnimation(breath);
      cancelAnimation(entry);
      cancelAnimation(gestureY);
      cancelAnimation(gestureX);
      cancelAnimation(gestureRot);
      scale.value = 1;
      translateY.value = 0;
      breath.value = 0;
      entry.value = 1;
      gestureY.value = 0;
      gestureX.value = 0;
      gestureRot.value = 0;
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
    // 4. LOT M2 — le GESTE de l'état : une trajectoire courte, jouée une fois, jamais en boucle.
    //    Les gestes maintenus (`lean`, `sink`) terminent sur leur valeur et y restent jusqu'au
    //    prochain état ; les autres terminent sur zéro : la « sortie » est dans la trajectoire.
    if (track.stepMs > 0) {
      const step = { duration: track.stepMs };
      const play = (frames: readonly number[]) =>
        frames.length === 1
          ? withTiming(frames[0], step)
          : withSequence(...(frames.map((v) => withTiming(v, step)) as [never, ...never[]]));
      gestureY.value = play(track.translateY);
      gestureX.value = play(track.translateX);
      gestureRot.value = play(track.rotateDeg);
    } else {
      gestureY.value = withTiming(0, { duration: motion.instant });
      gestureX.value = withTiming(0, { duration: motion.instant });
      gestureRot.value = withTiming(0, { duration: motion.instant });
    }
    // Démontage / changement d'état : on annule tout pour ne laisser aucun timer actif.
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(breath);
      cancelAnimation(entry);
      cancelAnimation(gestureY);
      cancelAnimation(gestureX);
      cancelAnimation(gestureRot);
    };
    // `trackKey` représente `track` (objet recréé à chaque rendu) : c'est LUI la vraie dépendance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isStatic,
    popTarget,
    loopFloat,
    floatPeriodMs,
    trackKey,
    scale,
    translateY,
    breath,
    entry,
    gestureY,
    gestureX,
    gestureRot,
  ]);

  const avatarStyle = useAnimatedStyle(() => {
    const lift = -breath.value * floatPx + (1 - entry.value) * entryTranslateY;
    const approach = entryScale + (1 - entryScale) * entry.value;
    return {
      opacity: entry.value,
      transform: [
        { perspective: 600 },
        { translateY: lift + translateY.value + gestureY.value },
        { translateX: gestureX.value },
        // Le geste s'ajoute à la respiration : le guide continue de respirer pendant qu'il parle.
        { rotateZ: `${(breath.value * 2 - 1) * swayDeg + gestureRot.value}deg` },
        { scale: scale.value * approach },
      ],
    };
  });

  // L'ombre se resserre et s'éclaircit quand le guide monte : l'ancrage au sol se lit. LOT M2 — elle
  // suit désormais l'élévation TOTALE (respiration + bond), sinon un bond ressemblerait à un
  // autocollant qui glisse au-dessus d'une ombre restée large.
  const liftScale = maxLiftPx(presence);
  const shadowStyle = useAnimatedStyle(() => {
    const lift = breath.value * floatPx - gestureY.value;
    const airborne = Math.min(1, Math.max(0, lift / liftScale));
    return {
      opacity: interpolate(airborne, [0, 1], [shadowOpacity, shadowOpacity * 0.45]) * entry.value,
      transform: [{ scaleX: interpolate(airborne, [0, 1], [1, 0.7]) }],
    };
  });

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
