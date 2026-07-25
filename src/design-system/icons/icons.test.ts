import { describe, it, expect } from '@jest/globals';
import { TRADEMY_ICON_NAMES } from './TrademyIcon';

/**
 * Verrou du système d'icônes Trademy (Lot 2). Garantit que les icônes de navigation et
 * d'action existent (aucun emoji système en substitut) et que le registre est cohérent.
 */
describe('Système d’icônes Trademy', () => {
  it('couvre les cinq espaces de navigation', () => {
    for (const nav of ['home', 'learn', 'library', 'lab', 'profile'] as const) {
      expect(TRADEMY_ICON_NAMES).toContain(nav);
    }
  });

  it('fournit les icônes d’action essentielles', () => {
    for (const action of ['search', 'star', 'chevron-right', 'close', 'check', 'lock', 'play', 'chart'] as const) {
      expect(TRADEMY_ICON_NAMES).toContain(action);
    }
  });

  it('n’a aucun doublon de nom', () => {
    expect(new Set(TRADEMY_ICON_NAMES).size).toBe(TRADEMY_ICON_NAMES.length);
  });

  it('expose un jeu d’icônes non trivial', () => {
    expect(TRADEMY_ICON_NAMES.length).toBeGreaterThanOrEqual(20);
  });

  it('LOT 4 — couvre les concepts du canon pédagogique TradeMy (progression & marché)', () => {
    const required = [
      'review', 'unlocked', 'progression', 'checkpoint', 'mastery', 'hint',
      'success', 'error', 'warning',
      'volume', 'support', 'resistance', 'confirmation', 'invalidation',
      'false-signal', 'risk', 'psychology',
      // Directions de marché symétriques (LOT 4-A) — distinctes de la progression d'apprentissage.
      'market-up', 'market-down',
    ] as const;
    for (const name of required) {
      expect(TRADEMY_ICON_NAMES).toContain(name);
    }
  });

  it('LOT 4-B — glyphes Accueil du canon (timer, coin)', () => {
    for (const name of ['timer', 'coin'] as const) {
      expect(TRADEMY_ICON_NAMES).toContain(name);
    }
  });

  it('LOT 4-A — la direction de marché n’emprunte pas l’icône de progression pédagogique', () => {
    // `progression` reste un glyphe d'APPRENTISSAGE ; les directions ont leurs propres flèches neutres.
    expect(TRADEMY_ICON_NAMES).toContain('progression');
    expect(TRADEMY_ICON_NAMES).not.toContain('decline'); // ancien glyphe moralisant retiré
  });

  it('LOT 4 — reste une seule famille raisonnable (pas 100 icônes)', () => {
    expect(TRADEMY_ICON_NAMES.length).toBeLessThanOrEqual(60);
  });
});
