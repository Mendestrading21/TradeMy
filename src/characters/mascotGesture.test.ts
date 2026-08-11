import { describe, it, expect } from '@jest/globals';
import {
  gestureFor,
  gestureTrack,
  gestureAmplitude,
  maxLiftPx,
  motionPlan,
  presenceFor,
  GESTURE_TRACKS,
  type MascotGesture,
} from './motionPlan';
import { CHARACTER_STATES } from './states';
import type { CharacterState } from './types';

const ALL = Object.keys(CHARACTER_STATES) as CharacterState[];

/**
 * LOT M2 — VERROU du geste.
 *
 * Le défaut réparé : vingt-cinq états canoniques, mais le mouvement ne portait que TROIS valeurs
 * (le pop 1.14 / 1.06 / 1.0). Une mise en garde bougeait exactement comme une explication ; une
 * célébration exactement comme un salut. Le geste ne disait donc rien — seule l'image parlait.
 *
 * Ces tests vérifient que le geste est DÉRIVÉ du registre (aucune table écrite à la main), qu'il
 * distingue réellement les états qui se confondaient, et qu'il ne viole aucune règle du canon :
 * reduced-motion strictement statique, aucune boucle hors repos, aucune déformation de l'image.
 */

describe('LOT M2 — le geste des guides', () => {
  it('CHAQUE état canonique a un geste (aucun état muet, aucun état oublié)', () => {
    for (const s of ALL) {
      expect(GESTURE_TRACKS[gestureFor(s)]).toBeDefined();
    }
  });

  it('le geste est DÉRIVÉ du registre : intensité puis expression, jamais une liste à la main', () => {
    // La règle, relue depuis les métadonnées elles-mêmes. Si quelqu'un ajoute un état demain, il
    // reçoit automatiquement le geste cohérent avec l'intensité et l'expression qu'il déclare.
    for (const s of ALL) {
      const spec = CHARACTER_STATES[s];
      const attendu: MascotGesture =
        spec.intensity === 'still'
          ? 'none'
          : spec.intensity === 'lively'
            ? 'hop'
            : spec.expression === 'concerned' || spec.expression === 'sad'
              ? 'shake'
              : spec.expression === 'thinking'
                ? 'sink'
                : spec.expression === 'excited'
                  ? 'lean'
                  : 'nod';
      expect(gestureFor(s)).toBe(attendu);
    }
  });

  it('les quatre états qui bougeaient IDENTIQUEMENT bougent maintenant différemment', () => {
    // Avant ce lot : warning, explain, point et agree partageaient le même pop de 1.06 ; on ne
    // pouvait pas distinguer une mise en garde d'une explication autrement qu'en lisant le texte.
    const gestes = ['warning', 'explain', 'point', 'agree'].map((s) => gestureFor(s as CharacterState));
    expect(new Set(gestes).size).toBe(3); // shake / nod / lean — explain et agree acquiescent tous deux
    expect(gestureFor('warning')).toBe('shake');
    expect(gestureFor('point')).toBe('lean');
    expect(gestureFor('warning')).not.toBe(gestureFor('explain'));
    expect(gestureFor('point')).not.toBe(gestureFor('explain'));
  });

  it('le corpus emploie au moins cinq gestes distincts (le mouvement porte du sens)', () => {
    const employes = new Set(ALL.map((s) => gestureFor(s)));
    expect(employes.size).toBeGreaterThanOrEqual(5);
  });

  it('un état « still » ne gestifie pas — le canon interdit d’agiter un état système', () => {
    for (const s of ALL) {
      if (CHARACTER_STATES[s].intensity === 'still') {
        expect(gestureFor(s)).toBe('none');
        expect(gestureTrack('none', presenceFor('toto')).stepMs).toBe(0);
      }
    }
  });

  it('reduced-motion → AUCUN geste : le plan reste strictement statique', () => {
    for (const s of ALL) {
      expect(motionPlan(s, true, 'toto')).toEqual({ kind: 'static' });
      expect(motionPlan(s, true, 'bobo', -1)).toEqual({ kind: 'static' });
    }
  });

  it('les trois pistes d’un geste ont la MÊME longueur (une étape = une pose complète)', () => {
    for (const [nom, t] of Object.entries(GESTURE_TRACKS)) {
      expect(`${nom}:${t.translateX.length}`).toBe(`${nom}:${t.translateY.length}`);
      expect(`${nom}:${t.rotateDeg.length}`).toBe(`${nom}:${t.translateY.length}`);
      expect(t.translateY.length).toBeGreaterThan(0);
    }
  });

  it('un geste NON maintenu revient exactement à zéro : la « sortie » est dans la trajectoire', () => {
    for (const [nom, t] of Object.entries(GESTURE_TRACKS)) {
      if (t.holds) continue;
      const dernier = (a: readonly number[]) => a[a.length - 1];
      expect(`${nom}:${dernier(t.translateY)}`).toBe(`${nom}:0`);
      expect(`${nom}:${dernier(t.translateX)}`).toBe(`${nom}:0`);
      expect(`${nom}:${dernier(t.rotateDeg)}`).toBe(`${nom}:0`);
    }
  });

  it('seuls le regard et la réflexion se MAINTIENNENT (les deux gestes « portés »)', () => {
    const maintenus = (Object.keys(GESTURE_TRACKS) as MascotGesture[]).filter(
      (g) => GESTURE_TRACKS[g].holds,
    );
    expect(maintenus.sort()).toEqual(['lean', 'sink']);
  });

  it('aucun geste ne dure plus d’une demi-seconde : un geste se lit, il ne se subit pas', () => {
    for (const [nom, t] of Object.entries(GESTURE_TRACKS)) {
      const total = t.stepMs * t.translateY.length;
      expect(`${nom}:${total <= 500}`).toBe(`${nom}:true`);
    }
  });

  it('l’ampleur suit le tempérament : Toto ample, Bobo contenu — dérivé, pas inventé', () => {
    const toto = gestureAmplitude(presenceFor('toto'));
    const bobo = gestureAmplitude(presenceFor('bobo'));
    expect(toto).toBeGreaterThan(1); // le taureau enthousiaste dépasse la référence neutre
    expect(bobo).toBeLessThan(1); // l'ours prudent reste en deçà
    expect(gestureAmplitude(presenceFor())).toBe(1); // la présence neutre EST la référence
    // Et le geste joué suit : le bond de Toto monte plus haut que celui de Bobo.
    const haut = (c: 'toto' | 'bobo') => Math.min(...gestureTrack('hop', presenceFor(c)).translateY);
    expect(haut('toto')).toBeLessThan(haut('bobo')); // plus négatif = plus haut
  });

  it('le miroir retourne le geste : un guide à droite ne pointe pas hors de l’écran', () => {
    const droite = gestureTrack('lean', presenceFor('toto'), 1);
    const gauche = gestureTrack('lean', presenceFor('toto'), -1);
    expect(droite.translateX[0]).toBeGreaterThan(0);
    expect(gauche.translateX[0]).toBe(-droite.translateX[0]);
    expect(gauche.rotateDeg[0]).toBe(-droite.rotateDeg[0]);
    // Le miroir ne touche QUE les axes latéraux : un bond reste un bond, vers le haut.
    expect(gestureTrack('hop', presenceFor('toto'), -1).translateY).toEqual(
      gestureTrack('hop', presenceFor('toto'), 1).translateY,
    );
  });

  it('l’échelle de l’ombre couvre la hauteur réellement atteignable (respiration + bond)', () => {
    for (const c of ['toto', 'bobo'] as const) {
      const p = presenceFor(c);
      const sommet = p.floatPx + Math.abs(Math.min(...gestureTrack('hop', p).translateY));
      // Sans cette borne, l'ombre resterait large sous un personnage en l'air.
      expect(maxLiftPx(p)).toBeCloseTo(sommet, 6);
      expect(maxLiftPx(p)).toBeGreaterThan(p.floatPx);
    }
  });

  it('le plan animé transporte le geste ET sa trajectoire (le rendu n’a rien à recalculer)', () => {
    const plan = motionPlan('point', false, 'toto', -1);
    expect(plan.kind).toBe('animated');
    if (plan.kind !== 'animated') return;
    expect(plan.gesture).toBe('lean');
    expect(plan.track).toEqual(gestureTrack('lean', presenceFor('toto'), -1));
    // Le pop de l'ancien modèle est CONSERVÉ : le geste s'ajoute, il ne remplace rien.
    expect(plan.popScale).toBe(1.06);
    expect(plan.loopFloat).toBe(false);
  });

  it('aucun geste ne boucle : « idle » reste la seule boucle entretenue de l’application', () => {
    for (const s of ALL) {
      const plan = motionPlan(s, false, 'toto');
      if (plan.kind !== 'animated') continue;
      if (s !== 'idle') expect(plan.loopFloat).toBe(false);
      // Un geste est une trajectoire FINIE : elle a un nombre d'étapes borné, jamais infini.
      expect(Number.isFinite(plan.track.translateY.length)).toBe(true);
      expect(plan.track.translateY.length).toBeLessThanOrEqual(4);
    }
  });
});
