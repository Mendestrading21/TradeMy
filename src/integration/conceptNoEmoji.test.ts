import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findEmoji } from './emojiGuard';

/**
 * Garde-fou LOT 4-J : la fiche concept (`app/concept/[slug].tsx`) n'utilise AUCUN emoji système,
 * AUCUN glyphe Unicode de commande (dont ‹ › détournés en navigation), AUCUNE pseudo-icône
 * (`String.fromCharCode`) ni prop `emoji`/`icon="…"` rendue. Les pictogrammes viennent exclusivement
 * de `TrademyIcon`.
 */
const SRC = readFileSync(join(process.cwd(), 'src', 'app', 'concept', '[slug].tsx'), 'utf8');
const COMMAND_GLYPHS = /[⏮⏭◀▶←↑→↓‹›★☆]/u;

describe('LOT 4-J — Fiche concept sans emoji ni pseudo-icône', () => {
  it('ne contient aucun pictogramme emoji', () => {
    const offenders: string[] = [];
    SRC.split('\n').forEach((line, i) => {
      const m = findEmoji(line);
      if (m.length) offenders.push(`${i + 1} → ${m.join(' ')}`);
    });
    expect(offenders).toEqual([]);
  });

  it('n’utilise aucun glyphe Unicode comme commande (dont ‹ ›)', () => {
    const offenders = SRC.split('\n')
      .map((l, i) => (COMMAND_GLYPHS.test(l) ? `${i + 1} → ${l.trim().slice(0, 60)}` : null))
      .filter(Boolean);
    expect(offenders).toEqual([]);
  });

  it('n’utilise plus String.fromCharCode, ni prop emoji, ni icon="…" (emoji)', () => {
    expect(SRC).not.toMatch(/String\.fromCharCode/);
    expect(SRC).not.toMatch(/\bemoji=\{/);
    expect(SRC).not.toMatch(/\bicon="/); // Chip/StateView via iconName (TrademyIcon), jamais icon="emoji"
  });

  it('emploie TrademyIcon comme unique système d’icônes', () => {
    expect(SRC).toMatch(/\bTrademyIcon\b/);
    expect(SRC).toMatch(/\biconName=/);
  });
});
