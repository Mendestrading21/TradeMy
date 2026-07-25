import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findEmoji } from './emojiGuard';

/**
 * Garde-fou LOT 4-F : l'écran Bibliothèque (`(tabs)/apprendre.tsx`) ET le `FavoriteButton` partagé
 * n'utilisent AUCUN emoji système ni glyphe Unicode (★/☆) en substitut d'icône. On réutilise la
 * SOURCE UNIQUE `findEmoji` (`emojiGuard`) et on interdit explicitement les étoiles typographiques.
 */
const FILES = [
  join(process.cwd(), 'src', 'app', '(tabs)', 'apprendre.tsx'),
  join(process.cwd(), 'src', 'design-system', 'components', 'FavoriteButton.tsx'),
];

describe('LOT 4-F — Bibliothèque & FavoriteButton sans emoji ni étoile Unicode', () => {
  it.each(FILES)('%s ne contient aucun pictogramme emoji', (file) => {
    const offenders: string[] = [];
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        const m = findEmoji(line);
        if (m.length) offenders.push(`${i + 1} → ${m.join(' ')}`);
      });
    expect(offenders).toEqual([]);
  });

  it.each(FILES)('%s ne contient aucune étoile Unicode ★/☆', (file) => {
    expect(readFileSync(file, 'utf8')).not.toMatch(/[★☆]/);
  });
});
