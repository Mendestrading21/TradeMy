import { describe, it, expect } from '@jest/globals';
import { findEmoji } from './emojiGuard';

/**
 * Verrou de la SOURCE UNIQUE de détection emoji (`emojiGuard`). Prouve que les emoji-symboles
 * hors des blocs « pictographes » sont bien attrapés (montre, réveil, sablier, avance, keycaps,
 * drapeaux, variantes FE0F) ET que les flèches/chevrons typographiques de TradeMy restent autorisés.
 */
describe('emojiGuard — détection emoji fondée sur les propriétés Unicode', () => {
  const POSITIFS: [string, string][] = [
    ['cible 🎯', '🎯'],
    ['montre ⌚', '⌚'],
    ['réveil ⏰', '⏰'],
    ['sablier ⏳', '⏳'],
    ['avance rapide ⏩', '⏩'],
    ['coche ✅', '✅'],
    ['keycap sans FE0F 1⃣', '1⃣'],
    ['keycap avec FE0F 1️⃣', '1️⃣'],
    ['drapeau 🇫🇷', '🇫🇷'],
    ['variante emoji FE0F ◀️', '◀️'],
    ['chronomètre ⏱️', '⏱️'],
  ];
  it.each(POSITIFS)('détecte un emoji système : %s', (_label, s) => {
    expect(findEmoji(s).length).toBeGreaterThan(0);
  });

  const NEGATIFS: [string, string][] = [
    ['flèche droite →', 'Suivant →'],
    ['chevron ›', 'Découvrir la fiche ›'],
    ['triangle gauche ◀ (texte)', '◀'],
    ['triangle droit ▶ (texte)', '▶'],
    ['flèche double ↔ (texte)', '↔'],
    ['nombre nu', '0'],
    ['compteur XP', '100 XP'],
    ['libellé de mission', 'MISSION DU JOUR'],
  ];
  it.each(NEGATIFS)('autorise (présentation texte) : %s', (_label, s) => {
    expect(findEmoji(s)).toEqual([]);
  });

  it('findEmoji renvoie les occurrences et un tableau vide sinon', () => {
    expect(findEmoji('avant 🎯 après')).toContain('🎯');
    expect(findEmoji('flèches → › ◀ ▶ ↔ seulement')).toEqual([]);
  });
});
