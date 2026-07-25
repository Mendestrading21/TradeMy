import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findEmoji } from './emojiGuard';

/**
 * Garde-fou LOT 4-D : l'écran Profil (`(tabs)/profil.tsx`) n'utilise AUCUN emoji système en
 * substitut d'icône. On réutilise la SOURCE UNIQUE `findEmoji` (`emojiGuard`). Les flèches
 * typographiques restent autorisées.
 */
const PROFIL = join(process.cwd(), 'src', 'app', '(tabs)', 'profil.tsx');

describe('LOT 4-D — Profil sans emoji système', () => {
  it('src/app/(tabs)/profil.tsx ne contient aucun pictogramme emoji', () => {
    const offenders: string[] = [];
    readFileSync(PROFIL, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        const m = findEmoji(line);
        if (m.length) offenders.push(`${i + 1} → ${m.join(' ')}`);
      });
    expect(offenders).toEqual([]);
  });
});
