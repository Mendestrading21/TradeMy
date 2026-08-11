import { describe, it, expect } from '@jest/globals';
import { motionPlan, presenceFor, MASCOT_PRESENCE } from './motionPlan';
import { CHARACTER_STATES } from './states';
import type { CharacterState } from './types';

/**
 * LOT M1 — verrou de la PRÉSENCE des guides.
 *
 * Les renders sont des images 3D fixes : c'est le mouvement qui donne le volume et la vie. Ce test
 * garantit que le tempérament canonique de chaque guide pilote réellement ce mouvement (Toto
 * enthousiaste : respiration ample et vive ; Bobo prudent : lente et contenue), que les valeurs
 * restent dans des bornes crédibles (aucune animation « qui saute »), et surtout que
 * « réduire les animations » désactive TOUT, sans exception.
 */
const ALL = Object.keys(CHARACTER_STATES) as CharacterState[];

describe('LOT M1 — présence des guides (mouvement qui donne le volume)', () => {
  it('le tempérament canon pilote le mouvement : Toto plus ample et plus vif que Bobo', () => {
    const toto = presenceFor('toto');
    const bobo = presenceFor('bobo');
    expect(toto.floatPx).toBeGreaterThan(bobo.floatPx); // Toto respire plus ample
    expect(toto.floatPeriodMs).toBeLessThan(bobo.floatPeriodMs); // …et plus vite
    expect(toto.swayDeg).toBeGreaterThan(bobo.swayDeg); // …avec un balancement plus net
  });

  it('un avatar sans personnage reçoit une présence neutre, jamais indéfinie', () => {
    expect(presenceFor()).toEqual(MASCOT_PRESENCE.default);
    const neutre = presenceFor();
    const toto = presenceFor('toto');
    const bobo = presenceFor('bobo');
    expect(neutre.floatPx).toBeLessThanOrEqual(toto.floatPx);
    expect(neutre.floatPx).toBeGreaterThanOrEqual(bobo.floatPx);
  });

  it('les valeurs restent crédibles : rien qui saute, rien qui bascule', () => {
    for (const p of Object.values(MASCOT_PRESENCE)) {
      expect(p.floatPx).toBeGreaterThan(0);
      expect(p.floatPx).toBeLessThanOrEqual(6); // une respiration, pas un saut
      expect(p.floatPeriodMs).toBeGreaterThanOrEqual(700); // jamais nerveux
      expect(p.swayDeg).toBeGreaterThan(0);
      expect(p.swayDeg).toBeLessThanOrEqual(3); // un balancement, pas une bascule
      expect(p.entryScale).toBeGreaterThan(0.7); // le guide s'approche, il ne surgit pas
      expect(p.entryScale).toBeLessThan(1);
      expect(p.entryTranslateY).toBeGreaterThan(0);
      expect(p.shadowOpacity).toBeGreaterThan(0.1);
      expect(p.shadowOpacity).toBeLessThan(0.5); // une ombre douce, jamais une tache
    }
  });

  it('reduced-motion désactive TOUT, y compris la présence (aucun plan animé ne fuit)', () => {
    for (const s of ALL) {
      for (const c of ['toto', 'bobo', undefined] as const) {
        expect(motionPlan(s, true, c)).toEqual({ kind: 'static' });
      }
    }
  });

  it('sans reduced-motion, chaque état porte la présence du personnage demandé', () => {
    for (const s of ALL) {
      const plan = motionPlan(s, false, 'bobo');
      expect(plan.kind).toBe('animated');
      if (plan.kind === 'animated') expect(plan.presence).toEqual(MASCOT_PRESENCE.bobo);
    }
  });

  it('la respiration reste réservée au repos : aucune boucle décorative ailleurs', () => {
    for (const s of ALL) {
      const plan = motionPlan(s, false, 'toto');
      if (plan.kind === 'animated' && s !== 'idle') expect(plan.loopFloat).toBe(false);
    }
  });
});
