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

/** Plan de mouvement résolu pour un état donné. */
export type MotionPlan =
  /** Reduced-motion : avatar figé, aucune animation (l'information passe par le texte accessible). */
  | { kind: 'static' }
  /** Pop bref au changement d'état (échelle dosée par l'intensité) + flottement en boucle si idle. */
  | { kind: 'animated'; popScale: number; loopFloat: boolean; presence: MascotPresence };

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
 */
export function motionPlan(state: CharacterState, reduced: boolean, character?: CharacterId): MotionPlan {
  if (reduced) return { kind: 'static' };
  const intensity = CHARACTER_STATES[state]?.intensity ?? 'subtle';
  return {
    kind: 'animated',
    popScale: popScale(intensity),
    loopFloat: loopsFloat(state),
    presence: presenceFor(character),
  };
}
