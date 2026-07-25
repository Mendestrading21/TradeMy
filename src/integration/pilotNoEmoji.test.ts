import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { characterLine, type DialogueContext } from '@/characters/dialogue';
import { findEmoji } from './emojiGuard';

/**
 * Garde-fou LOT 4-A : AUCUN emoji système dans le parcours pilote. On contrôle le CONTENU RÉELLEMENT
 * RENDU, pas seulement les fichiers d'écran :
 *   1. source des écrans session + monde ;
 *   2. composants réellement montés par les étapes du pilote ;
 *   3. source des modules de contenu consommés par la session (dialogues, misconceptions) ;
 *   4. sortie RUNTIME de toutes les variantes de `characterLine` (répliques Toto/Bobo rendues).
 *
 * Détection : la SOURCE UNIQUE `findEmoji` (`emojiGuard`), fondée sur les propriétés Unicode
 * (plus de regex locale dupliquée). Les flèches TYPOGRAPHIQUES (→, ↔, ◀, ▶) restent autorisées.
 */
const SCREENS = [
  join(process.cwd(), 'src', 'app', 'session', '[skillId].tsx'),
  join(process.cwd(), 'src', 'app', 'monde', '[id].tsx'),
];
const RENDERED_COMPONENTS = [
  join(process.cwd(), 'src', 'components', 'LessonStepView.tsx'),
  join(process.cwd(), 'src', 'components', 'LessonReplay.tsx'),
  join(process.cwd(), 'src', 'design-system', 'components', 'Flashcard.tsx'),
];
// Modules de contenu PURS consommés par la session pilote (répliques + misconceptions rendues).
const CONTENT = [
  join(process.cwd(), 'src', 'characters', 'dialogue.ts'),
  join(process.cwd(), 'src', 'data', 'mascotMoment.ts'),
  join(process.cwd(), 'src', 'data', 'misconceptions.ts'),
];

function scan(file: string): string[] {
  const offenders: string[] = [];
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      const m = findEmoji(line);
      if (m.length) offenders.push(`${file.replace(process.cwd(), '.')}:${i + 1} → ${m.join(' ')}`);
    });
  return offenders;
}

describe('LOT 4-A — aucun emoji système dans le parcours pilote', () => {
  it.each(SCREENS)('écran %s sans pictogramme emoji', (file) => {
    expect(scan(file)).toEqual([]);
  });

  it.each(RENDERED_COMPONENTS)('composant rendu %s sans pictogramme emoji', (file) => {
    expect(scan(file)).toEqual([]);
  });

  it.each(CONTENT)('contenu %s (rendu par la session) sans pictogramme emoji', (file) => {
    expect(scan(file)).toEqual([]);
  });

  it('toutes les variantes RENDUES de characterLine sont sans emoji', () => {
    const ctxs: DialogueContext[] = [];
    for (const correct of [true, false]) {
      for (const streak of [0, 3, 5]) {
        ctxs.push({ kind: 'answer', correct, streak });
        ctxs.push({ kind: 'recognition', correct, streak });
      }
    }
    for (const tier of ['perfect', 'pass', 'retry'] as const) ctxs.push({ kind: 'result', tier });
    ctxs.push({ kind: 'mission' });
    for (const direction of ['bullish', 'bearish', 'neutral'] as const) ctxs.push({ kind: 'concept', direction });

    const offenders: string[] = [];
    for (const ctx of ctxs) {
      // seeds 0..7 : couvrent toutes les entrées de chaque banque (≤ 4 variantes, cycle par modulo).
      for (let seed = 0; seed < 8; seed++) {
        const { text } = characterLine(ctx, seed);
        if (findEmoji(text).length) offenders.push(`${JSON.stringify(ctx)}#${seed} → ${text}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
