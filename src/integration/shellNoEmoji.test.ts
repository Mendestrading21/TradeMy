import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findEmoji } from './emojiGuard';

/**
 * Garde-fou LOT 4-H : le shell de navigation (`TrademyTabBar` + `(tabs)/_layout.tsx`) n'utilise AUCUN
 * emoji système ni glyphe Unicode en substitut de commande/icône (les libellés restent du texte pur,
 * les pictogrammes viennent uniquement de `TrademyIcon`).
 */
const FILES = [
  join(process.cwd(), 'src', 'components', 'TrademyTabBar.tsx'),
  join(process.cwd(), 'src', 'app', '(tabs)', '_layout.tsx'),
];
const COMMAND_GLYPHS = /[⏮⏭◀▶←↑→↓‹›★☆]/u;

describe('LOT 4-H — Shell sans emoji ni glyphe de commande', () => {
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

  it.each(FILES)('%s n’utilise aucun glyphe Unicode comme commande', (file) => {
    const src = readFileSync(file, 'utf8');
    const offenders = src
      .split('\n')
      .map((line, i) => (COMMAND_GLYPHS.test(line) ? `${i + 1} → ${line.trim().slice(0, 60)}` : null))
      .filter(Boolean);
    expect(offenders).toEqual([]);
  });
});
