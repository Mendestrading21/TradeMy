/**
 * LOT 4-M — Direction visuelle du monde Chandeliers : garde-fous exécutables.
 *
 * Vérifie que la direction visuelle du module respecte le canon SANS image de moodboard :
 *  - la signature Chandeliers est un vecteur du système d'icônes interne (jamais un raster) ;
 *  - les chandeliers rendus dérivent de données OHLC COHÉRENTES (h ≥ max(o,c), l ≤ min(o,c), h ≥ l) ;
 *  - le résumé accessible existe pour chaque figure du module ;
 *  - le contenu du module n'emploie aucun emoji fonctionnel, aucun `BUY`/`SELL`, aucune promesse ;
 *  - la source du module n'importe aucune image, aucune URL distante, aucune couleur codée en dur.
 */
import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';
import { generateCandles } from '../engines/pattern/demoChart';
import { TRADEMY_ICON_NAMES } from '../design-system/icons/TrademyIcon';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld, vocabularyIssuesIn } from './learningConcept';
import {
  CANDLE_MODULE_EXERCISES_BY_SKILL,
  CANDLE_SKILLS,
  CANDLE_SKILL_CONCEPT_ID,
} from './candleModuleScenarios';
import { getLessons } from './seed';
import { findEmoji } from '../integration/emojiGuard';

type OHLC = { o: number; h: number; l: number; c: number };
function assertOHLC(c: OHLC): void {
  expect(c.h).toBeGreaterThanOrEqual(Math.max(c.o, c.c)); // le plus haut couvre corps et mèche
  expect(c.l).toBeLessThanOrEqual(Math.min(c.o, c.c)); // le plus bas couvre corps et mèche
  expect(c.h).toBeGreaterThanOrEqual(c.l); // plus haut ≥ plus bas
}

/** Textes RÉELLEMENT rendus du module (exercices + leçons) — base des contrôles vocabulaire/emoji. */
function moduleTexts(): string[] {
  const out: string[] = [];
  for (const ex of Object.values(CANDLE_MODULE_EXERCISES_BY_SKILL).flat()) {
    out.push(ex.prompt, ex.feedback.correct, ex.feedback.incorrect, ex.feedback.rule ?? '', ex.feedback.whenItFails ?? '', ex.accessibilitySummary ?? '');
    if (ex.type === 'order') out.push(...ex.items);
    if (ex.type === 'find_error') out.push(...ex.statements);
    if (ex.type === 'scenario') out.push(ex.context, ...ex.options);
    if (ex.type === 'identify_figure') out.push(...ex.options);
  }
  for (const s of CANDLE_SKILLS) {
    for (const l of getLessons(s.id)) {
      out.push(l.title, l.objective ?? '', l.commonMistake ?? '');
      for (const step of l.steps) {
        if (step.body) out.push(step.body);
        if (step.flashcard) out.push(step.flashcard.front, step.flashcard.back);
      }
    }
  }
  return out.filter(Boolean);
}

describe('LOT 4-M — direction visuelle du monde Chandeliers', () => {
  it('signature : un vecteur du système d’icônes interne (jamais une image importée)', () => {
    expect(TRADEMY_ICON_NAMES).toContain('candles');
  });

  it('chandeliers rendus : chaque dataset `candle.*` respecte les invariants OHLC', () => {
    const keys = Object.keys(VISUAL_DATASETS).filter((k) => k.startsWith('candle.'));
    expect(keys.length).toBeGreaterThan(0);
    for (const k of keys) {
      const series = VISUAL_DATASETS[k] as unknown as OHLC[];
      expect(Array.isArray(series)).toBe(true);
      for (const c of series) assertOHLC(c);
    }
  });

  it('séries de placement (invalidation) : OHLC cohérentes pour toute graine du module', () => {
    for (const seed of [41, 53, 67, 7, 314, 909, 2024]) {
      for (const c of generateCandles(seed, 30)) assertOHLC(c);
    }
  });

  it('a11y : chaque concept du module porte un résumé accessible dérivé de sa figure', () => {
    const candleIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.candles').map((c) => c.id));
    for (const s of CANDLE_SKILLS) {
      const cid = CANDLE_SKILL_CONCEPT_ID[s.id];
      expect(candleIds.has(cid)).toBe(true);
      const concept = V5_CONCEPTS.find((c) => c.id === cid)!;
      expect((concept.visualSpec?.accessibilitySummary ?? '').trim().length).toBeGreaterThan(0);
    }
  });

  it('contenu du module : aucun emoji fonctionnel (substitut d’icône)', () => {
    for (const t of moduleTexts()) expect(findEmoji(t)).toEqual([]);
  });

  it('contenu du module : aucun BUY/SELL ni promesse de gain', () => {
    expect(vocabularyIssuesIn(moduleTexts())).toEqual([]);
  });

  it('source du module : aucune image importée, aucune URL distante, aucune couleur codée en dur', () => {
    const src = readFileSync(join(process.cwd(), 'src/data/candleModuleScenarios.ts'), 'utf8');
    expect(src).not.toMatch(/\.(png|jpe?g|gif|webp|bmp)\b/i); // aucun raster (aucun moodboard)
    expect(src).not.toMatch(/https?:\/\//i); // aucune référence distante
    expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b/); // couleurs = tokens sémantiques, jamais en dur
  });
});
