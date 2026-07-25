import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verrou LOT 4-F — la Bibliothèque et le FavoriteButton ne DÉTOURNENT aucune couleur réservée :
 *  - `bullish`/`bearish` = vérité de MARCHÉ uniquement ;
 *  - `technical` = annotation graphique uniquement (plus jamais « Découvert ») ;
 *  - `advanced` = difficulté avancée réelle uniquement ;
 *  - `reward` = récompense réellement obtenue (jamais « Maîtrisé » ni un simple favori).
 * Les états pédagogiques emploient `textMuted`/`info`/`primaryBright`/`success`/`mastery`.
 */
const APPRENDRE = join(process.cwd(), 'src', 'app', '(tabs)', 'apprendre.tsx');
const FAVORITE = join(process.cwd(), 'src', 'design-system', 'components', 'FavoriteButton.tsx');
const SRC = readFileSync(APPRENDRE, 'utf8');
const FAV = readFileSync(FAVORITE, 'utf8');

describe('LOT 4-F — couleurs sémantiques de la Bibliothèque', () => {
  it('ne détourne ni bullish, ni bearish, ni technical, ni advanced, ni reward', () => {
    for (const t of ['bullish', 'bearish', 'technical', 'advanced', 'reward']) {
      expect(SRC).not.toMatch(new RegExp(`theme\\.colors\\.${t}`));
    }
  });

  it('emploie les tokens pédagogiques stricts (info, success, mastery, primaryBright)', () => {
    expect(SRC).toMatch(/theme\.colors\.info/);
    expect(SRC).toMatch(/theme\.colors\.success/);
    expect(SRC).toMatch(/theme\.colors\.mastery/);
    expect(SRC).toMatch(/theme\.colors\.primaryBright/);
  });

  it('le FavoriteButton n’emploie plus reward (un favori n’est pas une récompense)', () => {
    expect(FAV).not.toMatch(/theme\.colors\.reward/);
    expect(FAV).toMatch(/star-filled/);
    expect(FAV).toMatch(/theme\.colors\.primaryBright/);
  });
});
