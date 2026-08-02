import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { findEmoji } from './emojiGuard';

/**
 * Garde-fou GLOBAL (audit canon) : AUCUN pictogramme emoji ni étoile Unicode (★/☆) dans AUCUNE
 * source runtime — écrans, composants, design system, mascottes, moteurs. Les gardes par écran
 * (accueil, bibliothèque, …) restent ; celui-ci ferme les mailles : les écrans secondaires
 * (leçons libres, glossaire, journal, quiz visuel, réussites) et les primitives (StateView,
 * OfflineBanner) rendaient des emoji système jamais couverts par un test.
 *
 * Source unique : `findEmoji` (`emojiGuard`). Les flèches typographiques en présentation TEXTE
 * (→ › ◀ ▶ ↔) restent autorisées. Les champs `emoji`/`icon` des DONNÉES (badges, quêtes) peuvent
 * exister mais ne doivent jamais être rendus tels quels — les écrans mappent vers `TrademyIcon`.
 */
const ROOT = join(__dirname, '..', '..');
const DIRS = ['src/app', 'src/components', 'src/design-system', 'src/characters', 'src/engines'];

function runtimeSources(): string[] {
  const out = execSync(
    `find ${DIRS.join(' ')} \\( -name '*.ts' -o -name '*.tsx' \\) ! -name '*.test.*'`,
    { cwd: ROOT, encoding: 'utf8' },
  );
  return out.trim().split('\n').filter(Boolean);
}

describe('Garde-fou global — aucune source runtime ne contient d’emoji ni d’étoile Unicode', () => {
  it('src/app + src/components + src/design-system + src/characters + src/engines : zéro pictogramme', () => {
    const files = runtimeSources();
    expect(files.length).toBeGreaterThan(100); // le périmètre réel est bien balayé
    const offenders: string[] = [];
    for (const f of files) {
      readFileSync(join(ROOT, f), 'utf8')
        .split('\n')
        .forEach((line, i) => {
          const hits = [...findEmoji(line), ...(line.match(/[★☆]/g) ?? [])];
          if (hits.length) offenders.push(`${f}:${i + 1} → ${hits.join(' ')}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});
