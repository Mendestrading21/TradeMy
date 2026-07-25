import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findEmoji } from './emojiGuard';

/**
 * Garde-fou LOT 4-G : l'écran Laboratoire (`(tabs)/laboratoire.tsx`) n'utilise AUCUN emoji système ni
 * glyphe Unicode en substitut de commande/icône. On réutilise la SOURCE UNIQUE `findEmoji`, et on
 * interdit explicitement les glyphes de transport/flèches/chevron employés comme commandes.
 */
const LAB = join(process.cwd(), 'src', 'app', '(tabs)', 'laboratoire.tsx');
const SRC = readFileSync(LAB, 'utf8');
// Glyphes de commande à bannir : transport (⏮ ◀ ▶ ⏭), flèches (↑ ↓ ← →), chevrons simples (‹ ›), étoiles.
const COMMAND_GLYPHS = /[⏮⏭◀▶←↑→↓‹›★☆]/u;

describe('LOT 4-G — Laboratoire sans emoji ni glyphe de commande', () => {
  it('ne contient aucun pictogramme emoji', () => {
    const offenders: string[] = [];
    SRC.split('\n').forEach((line, i) => {
      const m = findEmoji(line);
      if (m.length) offenders.push(`${i + 1} → ${m.join(' ')}`);
    });
    expect(offenders).toEqual([]);
  });

  it('n’utilise aucun glyphe Unicode comme commande (⏮ ◀ ▶ ⏭ ↑ ↓ › …)', () => {
    const offenders: string[] = [];
    SRC.split('\n').forEach((line, i) => {
      if (COMMAND_GLYPHS.test(line)) offenders.push(`${i + 1} → ${line.trim().slice(0, 60)}`);
    });
    expect(offenders).toEqual([]);
  });
});
