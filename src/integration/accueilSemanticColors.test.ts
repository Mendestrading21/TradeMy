import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verrou LOT 4-B (micro-correction) — l'Accueil ne DÉTOURNE plus les couleurs sémantiques
 * réservées : `technical` (cyan = annotation graphique) et `advanced` (orchidée = difficulté 4–5)
 * ne doivent jamais habiller ses éléments. La durée de mission est informationnelle (`info`) ;
 * « Concept du jour » porte un accent de MARQUE (`primary`/`primaryBright`) — car
 * `conceptOfTheDay()` peut afficher une notion débutante, pas seulement un concept avancé.
 * (Complète la preuve de RENDU dans `accueil.integration.test.tsx` par un verrou de SOURCE.)
 */
const ACCUEIL = join(process.cwd(), 'src', 'app', '(tabs)', 'index.tsx');
const SRC = readFileSync(ACCUEIL, 'utf8');

describe('LOT 4-B — couleurs sémantiques de l’Accueil', () => {
  it('ne détourne ni theme.colors.technical ni theme.colors.advanced', () => {
    expect(SRC).not.toMatch(/theme\.colors\.technical/);
    expect(SRC).not.toMatch(/theme\.colors\.advanced/);
  });

  it('la durée de mission porte l’accent informationnel (info)', () => {
    expect(SRC).toMatch(/iconName="timer"[^>]*color=\{theme\.colors\.info\}/);
  });

  it('« Concept du jour » porte un accent de marque (bordure primary)', () => {
    expect(SRC).toMatch(/conceptCard:\s*\{\s*borderColor:\s*theme\.colors\.primary\b/);
  });
});
