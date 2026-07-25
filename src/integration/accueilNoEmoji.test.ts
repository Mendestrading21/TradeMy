import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findEmoji } from './emojiGuard';

/**
 * Garde-fou LOT 4-B : l'écran d'Accueil (`(tabs)/index.tsx`) n'utilise AUCUN emoji système en
 * substitut d'icône. La famille `TrademyIcon` (ou du texte) porte tout signe visuel. On réutilise
 * la SOURCE UNIQUE `findEmoji` (`emojiGuard`), pas une liste ni une regex ad hoc. Portée :
 * pictogrammes/emoji uniquement ; les flèches typographiques (→, ›) restent autorisées.
 */
const ACCUEIL = join(process.cwd(), 'src', 'app', '(tabs)', 'index.tsx');

describe('LOT 4-B — Accueil sans emoji système', () => {
  it('src/app/(tabs)/index.tsx ne contient aucun pictogramme emoji', () => {
    const offenders: string[] = [];
    readFileSync(ACCUEIL, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        const m = findEmoji(line);
        if (m.length) offenders.push(`${i + 1} → ${m.join(' ')}`);
      });
    expect(offenders).toEqual([]);
  });
});
