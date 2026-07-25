import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findEmoji } from './emojiGuard';

/**
 * Garde-fou LOT 4-I : l'onboarding (`app/onboarding.tsx`) n'utilise AUCUN emoji système, AUCUN glyphe
 * Unicode de commande, AUCUNE lettre en pseudo-icône (`String.fromCharCode`) ni prop `emoji` rendue.
 * Les pictogrammes viennent exclusivement de `TrademyIcon`.
 */
const SRC = readFileSync(join(process.cwd(), 'src', 'app', 'onboarding.tsx'), 'utf8');
const COMMAND_GLYPHS = /[⏮⏭◀▶←↑→↓‹›★☆]/u;

describe('LOT 4-I — Onboarding sans emoji ni pseudo-icône', () => {
  it('ne contient aucun pictogramme emoji', () => {
    const offenders: string[] = [];
    SRC.split('\n').forEach((line, i) => {
      const m = findEmoji(line);
      if (m.length) offenders.push(`${i + 1} → ${m.join(' ')}`);
    });
    expect(offenders).toEqual([]);
  });

  it('n’utilise aucun glyphe Unicode comme commande', () => {
    const offenders = SRC.split('\n')
      .map((l, i) => (COMMAND_GLYPHS.test(l) ? `${i + 1} → ${l.trim().slice(0, 60)}` : null))
      .filter(Boolean);
    expect(offenders).toEqual([]);
  });

  it('n’utilise plus String.fromCharCode comme pseudo-icône ni de prop emoji rendue', () => {
    expect(SRC).not.toMatch(/String\.fromCharCode/);
    expect(SRC).not.toMatch(/\bemoji=\{/); // plus aucune prop emoji passée à une carte
    expect(SRC).not.toMatch(/icon="/); // Chip via iconName (TrademyIcon), jamais icon="emoji"
  });
});
