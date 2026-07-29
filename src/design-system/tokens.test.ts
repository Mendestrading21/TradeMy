import { describe, it, expect } from '@jest/globals';
import { colors, palette, motion, opacity, borderWidth, touchTarget, zIndex } from './tokens';
import { APP_INFO } from '../lib/appInfo';

/**
 * Verrou de l'identité « Trademy Learning Glass » (Lot 1).
 * Empêche une régression silencieuse : la marque reste violette, le marché reste
 * vert/rouge, et le feedback pédagogique garde des teintes propres.
 * Référence : docs/design/TRADEMY_LEARNING_GLASS.md.
 */
describe('Trademy Learning Glass — sémantique des tokens', () => {
  it('la marque/CTA est violette, jamais une couleur de marché', () => {
    expect(colors.primary).toBe(palette.violet);
    expect(colors.primary).not.toBe(colors.bullish);
    expect(colors.primary).not.toBe(colors.bearish);
  });

  it('marché : vert = haussier, rouge = baissier', () => {
    expect(colors.bullish).toBe(palette.green);
    expect(colors.bearish).toBe(palette.red);
  });

  it('le feedback pédagogique est distinct des couleurs de marché', () => {
    // Une bonne réponse n'est pas une bougie haussière ; une erreur n'est pas une bougie baissière.
    expect(colors.feedbackCorrect).not.toBe(colors.bullish);
    expect(colors.feedbackIncorrect).not.toBe(colors.bearish);
  });

  it('distingue visuellement une révision due du checkpoint/récompense', () => {
    expect(colors.warning).toBe(palette.amber);
    expect(colors.reward).toBe(palette.gold);
    expect(colors.warning).not.toBe(colors.reward);
    // L'invalidation reste une zone importante dorée, pas une alerte de révision.
    expect(colors.invalidation).toBe(colors.reward);
  });

  it('le texte du bouton primaire est le « sur-violet » sombre dédié', () => {
    expect(colors.onPrimary).toBe(palette.onViolet);
  });

  it('les durées de mouvement sont bornées (le mouvement explique, ne décore pas)', () => {
    expect(motion.micro).toBeLessThanOrEqual(200);
    expect(motion.celebration).toBeLessThan(900);
  });

  it('échelle canonique de mouvement : instant < fast < standard < expressive < celebration', () => {
    expect(motion.instant).toBeLessThanOrEqual(120); // retour immédiat < 120 ms
    expect(motion.instant).toBeLessThan(motion.fast);
    expect(motion.fast).toBeLessThan(motion.standard);
    expect(motion.standard).toBeLessThan(motion.expressive);
    expect(motion.expressive).toBeLessThan(motion.celebration);
    expect(motion.celebration).toBeLessThanOrEqual(1200); // plafond célébration
  });

  it('identité publique = Trademy avec sa signature', () => {
    expect(APP_INFO.name).toBe('Trademy');
    expect(APP_INFO.signature).toBe('Ne parie pas. Comprends.');
  });
});

/**
 * LOT 4 — jetons de fondation ajoutés (états de surface, sémantique d'état de marché, échelles).
 * Verrouille leur intention pour éviter une dérive : l'invalidation n'est PAS le baissier, le faux
 * signal n'est ni haussier ni baissier, et la couleur reste un signal PARMI d'autres (icône + forme).
 */
describe('LOT 4 — fondation visuelle : tokens sémantiques', () => {
  it('expose des surfaces d’état distinctes (sélection / verrou) + focus visible', () => {
    for (const key of ['surfaceSelected', 'surfaceLocked', 'focusRing'] as const) {
      expect(typeof colors[key]).toBe('string');
      expect(colors[key]).toMatch(/^#|rgba/);
    }
    expect(colors.surfaceSelected).not.toBe(colors.surface);
    expect(colors.surfaceLocked).not.toBe(colors.surface);
  });

  it('la MAÎTRISE pédagogique n’emprunte jamais une couleur de marché ni de feedback', () => {
    // Un accomplissement d'apprentissage n'est pas une bougie haussière (règle LOT 4-A).
    expect(colors.mastery).not.toBe(colors.bullish);
    expect(colors.mastery).not.toBe(colors.bearish);
    expect(colors.mastery).not.toBe(colors.feedbackCorrect);
    expect(colors.mastery).not.toBe(colors.feedbackIncorrect);
  });

  it('l’état de marché est sémantique et NON confondu avec direction/feedback', () => {
    // Confirmation = annotation technique (cyan) ; invalidation = zone importante (or), jamais baissier.
    expect(colors.confirmation).toBe(colors.technical);
    expect(colors.invalidation).not.toBe(colors.bearish);
    // Faux signal = leurre : ni haussier ni baissier (la forme barrée + le libellé portent le sens).
    expect(colors.falseSignal).not.toBe(colors.bullish);
    expect(colors.falseSignal).not.toBe(colors.bearish);
  });

  it('échelles bornées : opacité, bordures, cible tactile, empilement', () => {
    expect(opacity.glass).toBeLessThan(opacity.glassBorder); // voile < liseré (verre discret)
    expect(opacity.disabled).toBeLessThan(opacity.full);
    expect(borderWidth.thin).toBeLessThan(borderWidth.thick);
    expect(touchTarget.min).toBe(44); // WCAG 2.5.5 / HIG / Material
    expect(zIndex.base).toBeLessThan(zIndex.overlay);
    expect(zIndex.overlay).toBeLessThan(zIndex.toast);
  });
});
