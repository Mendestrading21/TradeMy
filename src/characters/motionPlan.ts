/**
 * Plan de mouvement d'un avatar — noyau PUR et testable (aucun Reanimated, aucun rendu).
 *
 * `CharacterAnimationController` en dérive ses valeurs animées : ainsi la règle « reduced-motion =
 * statique », l'échelle du pop (dosée par l'intensité de l'état) et « seul idle boucle » sont
 * décidées ici, une seule fois, et vérifiées par des tests purs — sans dépendre du moteur d'animation.
 */
import { CHARACTER_STATES, type Intensity } from './states';
import type { CharacterId, CharacterState } from './types';

/**
 * LOT M1 — PRÉSENCE d'un guide : ce qui donne du volume et de la vie à un render 3D fixe.
 *
 * Les mascottes sont des rendus 3D STATIQUES (canon : jamais de 3D temps réel, jamais de
 * redimensionnement des PNG). Le sentiment de présence vient donc du mouvement : une respiration
 * propre à chaque personnage, un léger balancement qui révèle le volume, une arrivée en douceur,
 * et surtout une OMBRE au sol qui suit la respiration — c'est elle qui ancre le personnage dans
 * l'espace au lieu de le laisser flotter comme un autocollant.
 *
 * Le tempérament canonique de chacun pilote ces valeurs : Toto, taureau enthousiaste, respire plus
 * ample et plus vite ; Bobo, ours prudent, respire lentement et bouge peu.
 */
export interface MascotPresence {
  /** Amplitude de la respiration au repos, en points. */
  floatPx: number;
  /** Durée d'un demi-cycle de respiration (montée), en ms. */
  floatPeriodMs: number;
  /** Balancement maximal accompagnant la respiration, en degrés (donne le volume). */
  swayDeg: number;
  /** Échelle de départ à l'arrivée du guide (< 1 : il s'approche). */
  entryScale: number;
  /** Décalage vertical de départ à l'arrivée, en points (> 0 : il monte vers sa place). */
  entryTranslateY: number;
  /** Opacité de l'ombre au sol quand le personnage est au plus bas (ancrage maximal). */
  shadowOpacity: number;
}

/** Tempérament de chaque guide (canon Toto/Bobo) ; `default` sert aux avatars sans personnage. */
export const MASCOT_PRESENCE: Record<CharacterId | 'default', MascotPresence> = {
  // Toto : enthousiaste — respiration ample et vive, balancement net.
  toto: { floatPx: 4, floatPeriodMs: 950, swayDeg: 1.6, entryScale: 0.86, entryTranslateY: 10, shadowOpacity: 0.3 },
  // Bobo : prudent — respiration lente et contenue, presque immobile.
  bobo: { floatPx: 2.5, floatPeriodMs: 1450, swayDeg: 0.9, entryScale: 0.9, entryTranslateY: 7, shadowOpacity: 0.26 },
  default: { floatPx: 3, floatPeriodMs: 1100, swayDeg: 1.2, entryScale: 0.88, entryTranslateY: 8, shadowOpacity: 0.28 },
};

/** Présence du guide demandé (repli neutre si l'avatar n'a pas de personnage). */
export function presenceFor(character?: CharacterId): MascotPresence {
  return MASCOT_PRESENCE[character ?? 'default'] ?? MASCOT_PRESENCE.default;
}

/**
 * LOT M2 — GESTE d'un état : ce que le mouvement DIT, en plus de ce que l'image montre.
 *
 * Avant ce lot, les vingt-cinq états canoniques ne produisaient que **trois** mouvements distincts
 * (le pop dosé par l'intensité : 1.14 / 1.06 / 1.0). Une mise en garde et une explication bougeaient
 * donc exactement pareil ; une célébration et un salut aussi. Le canon demande l'inverse : « une
 * animation contextuelle courte avec entrée, geste, regard/pointage et sortie ».
 *
 * Six gestes suffisent, parce qu'ils sont les seuls qu'un rendu 3D FIXE peut porter honnêtement —
 * on déplace et on incline l'image, on ne la déforme jamais et on n'en fabrique aucune pose :
 */
export type MascotGesture =
  /** Aucun geste : l'état est au repos ou système (le canon interdit d'agiter un état « still »). */
  | 'none'
  /** Bond vertical puis retombée : la réussite et la fête. */
  | 'hop'
  /** Hochement descendant : l'assentiment et l'encouragement. */
  | 'nod'
  /** Balancement latéral : le doute, le refus, la mise en garde. */
  | 'shake'
  /** Penché vers le contenu, MAINTENU : le regard et le pointage. */
  | 'lean'
  /** Léger tassement, MAINTENU : la réflexion en cours. */
  | 'sink';

/**
 * Trajectoire d'un geste, en images-clés. Les trois pistes ont toujours la même longueur : une
 * étape = une valeur sur chaque axe, jouée en `stepMs`. Aucun geste ne boucle (`idle` reste la
 * seule boucle entretenue de toute l'application).
 */
export interface GestureTrack {
  /** Décalage vertical, en points (négatif = vers le haut). */
  translateY: readonly number[];
  /** Décalage latéral, en points (positif = vers le contenu que le guide désigne). */
  translateX: readonly number[];
  /** Inclinaison, en degrés. */
  rotateDeg: readonly number[];
  /** Durée d'UNE étape, en ms (0 = aucun geste à jouer). */
  stepMs: number;
  /** Le geste se maintient-il en fin de course (regard porté) au lieu de revenir à zéro ? */
  holds: boolean;
}

/**
 * Trajectoires de référence, pour le tempérament neutre. Elles sont volontairement courtes : un
 * geste doit être lu, pas subi — le plus long tient en une demi-seconde.
 */
export const GESTURE_TRACKS: Record<MascotGesture, GestureTrack> = {
  none: { translateY: [0], translateX: [0], rotateDeg: [0], stepMs: 0, holds: false },
  hop: { translateY: [-14, 3, 0], translateX: [0, 0, 0], rotateDeg: [0, 0, 0], stepMs: 130, holds: false },
  nod: { translateY: [6, 0], translateX: [0, 0], rotateDeg: [0, 0], stepMs: 150, holds: false },
  shake: {
    translateY: [0, 0, 0, 0],
    translateX: [-6, 6, -3, 0],
    rotateDeg: [-2.5, 2.5, -1, 0],
    stepMs: 90,
    holds: false,
  },
  lean: { translateY: [0], translateX: [7], rotateDeg: [3.5], stepMs: 260, holds: true },
  sink: { translateY: [4], translateX: [0], rotateDeg: [0], stepMs: 260, holds: true },
};

/**
 * Geste d'un état — **DÉRIVÉ** du registre canonique, jamais écrit à la main état par état.
 *
 * L'ordre de résolution est la règle, et il se lit comme une phrase : un état immobile ne gestifie
 * pas ; un état vif bondit ; une expression inquiète ou triste se balance ; une expression pensive
 * se tasse ; une expression excitée mais contenue se penche vers ce qu'elle désigne ; tout le reste
 * acquiesce. Ajouter un état au registre lui donne donc automatiquement un geste cohérent.
 */
export function gestureFor(state: CharacterState): MascotGesture {
  const spec = CHARACTER_STATES[state];
  if (!spec) return 'none';
  if (spec.intensity === 'still') return 'none';
  if (spec.intensity === 'lively') return 'hop';
  if (spec.expression === 'concerned' || spec.expression === 'sad') return 'shake';
  if (spec.expression === 'thinking') return 'sink';
  if (spec.expression === 'excited') return 'lean';
  return 'nod';
}

/**
 * Ampleur du geste selon le tempérament — dérivée du balancement de repos, pas d'une constante
 * inventée : Toto, ample au repos, l'est aussi dans son geste ; Bobo, contenu, reste contenu.
 */
export function gestureAmplitude(presence: MascotPresence): number {
  return presence.swayDeg / MASCOT_PRESENCE.default.swayDeg;
}

/**
 * Trajectoire jouable : la référence, mise à l'ampleur du tempérament et orientée vers le contenu.
 * `facing` vaut -1 quand la scène est en miroir (le guide est à droite) : le geste se retourne avec
 * elle, sinon le guide pointerait hors de l'écran.
 */
export function gestureTrack(
  gesture: MascotGesture,
  presence: MascotPresence,
  facing: 1 | -1 = 1,
): GestureTrack {
  const base = GESTURE_TRACKS[gesture];
  const k = gestureAmplitude(presence);
  return {
    translateY: base.translateY.map((v) => v * k),
    translateX: base.translateX.map((v) => v * k * facing),
    rotateDeg: base.rotateDeg.map((v) => v * k * facing),
    stepMs: base.stepMs,
    holds: base.holds,
  };
}

/**
 * Élévation maximale qu'un guide peut atteindre — respiration au plus haut PLUS le sommet du bond,
 * à son ampleur. C'est l'échelle qui dose l'ombre au sol : sans elle, l'ombre resterait large sous
 * un personnage en l'air, et le bond ressemblerait à un autocollant qui glisse.
 */
export function maxLiftPx(presence: MascotPresence): number {
  const hopPeak = Math.max(...GESTURE_TRACKS.hop.translateY.map((v) => Math.abs(v)));
  return presence.floatPx + hopPeak * gestureAmplitude(presence);
}

/** Plan de mouvement résolu pour un état donné. */
export type MotionPlan =
  /** Reduced-motion : avatar figé, aucune animation (l'information passe par le texte accessible). */
  | { kind: 'static' }
  /** Pop bref au changement d'état (échelle dosée par l'intensité) + flottement en boucle si idle. */
  | {
      kind: 'animated';
      popScale: number;
      loopFloat: boolean;
      presence: MascotPresence;
      /** LOT M2 — le geste que cet état joue, et sa trajectoire déjà mise à l'ampleur du guide. */
      gesture: MascotGesture;
      track: GestureTrack;
    };

/** Échelle du pop bref selon l'intensité (still = aucun agrandissement). */
export function popScale(intensity: Intensity): number {
  return intensity === 'lively' ? 1.14 : intensity === 'still' ? 1.0 : 1.06;
}

/** Seul l'état de repos entretient une boucle (flottement doux) : aucune boucle décorative ailleurs. */
export function loopsFloat(state: CharacterState): boolean {
  return state === 'idle';
}

/**
 * Résout le plan de mouvement d'un état, en respectant d'abord reduced-motion.
 * `character` (optionnel) sélectionne le tempérament : sans lui, une présence neutre s'applique.
 * `facing` (optionnel) oriente le geste vers le contenu quand la scène est en miroir.
 */
export function motionPlan(
  state: CharacterState,
  reduced: boolean,
  character?: CharacterId,
  facing: 1 | -1 = 1,
): MotionPlan {
  if (reduced) return { kind: 'static' };
  const intensity = CHARACTER_STATES[state]?.intensity ?? 'subtle';
  const presence = presenceFor(character);
  const gesture = gestureFor(state);
  return {
    kind: 'animated',
    popScale: popScale(intensity),
    loopFloat: loopsFloat(state),
    presence,
    gesture,
    track: gestureTrack(gesture, presence, facing),
  };
}
