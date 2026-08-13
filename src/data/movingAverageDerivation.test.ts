import { describe, it, expect } from '@jest/globals';
import { datasetByKey } from '../engines/visual/visualDatasets';
import { INDICATOR_CONFIGS } from '../engines/visual/indicatorConfigs';
import { sma, closesOf } from '../engines/visual/indicatorMath';
import { V5_CONCEPTS } from './learningContent';

/**
 * LOT G1 — VERROU DE DÉRIVATION.
 *
 * Les trois fiches de la moyenne mobile avancent des faits CHIFFRÉS : « le prix touche son plus bas
 * à la quatrième bougie et les moyennes ne se croisent qu'à la septième », « deux croisements en
 * treize bougies », « la moyenne à 6 périodes n'a sa première valeur qu'à la sixième bougie ».
 *
 * Un chiffre écrit dans une fiche est une dette : il était vrai le jour où il a été écrit. Ce test
 * le RECALCULE à partir du dataset réel et des périodes réellement déclarées dans
 * `INDICATOR_CONFIGS` — les mêmes que celles que `IndicatorPanel` trace à l'écran. Si un dataset
 * ou une période changeait, ce test tomberait AVANT que la fiche ne devienne un mensonge.
 *
 * Il ne teste pas « le code fait ce que le code fait » : il teste que la PROSE et le GRAPHIQUE
 * racontent la même chose.
 */

/** Périodes réellement rendues pour une variante (source unique : le registre du moteur). */
function periods(variant: string): { fast: number; slow: number } {
  const cfg = INDICATOR_CONFIGS[variant];
  expect(cfg).toBeDefined();
  return { fast: cfg.fast ?? 3, slow: cfg.slow ?? 6 };
}

/**
 * Indices des bougies où la moyenne rapide franchit la lente (le premier point où le signe de
 * l'écart change, les deux valeurs étant définies). C'est exactement ce que l'œil voit.
 */
function crossings(variant: string, datasetKey: string): number[] {
  const candles = datasetByKey(datasetKey);
  const { fast, slow } = periods(variant);
  const f = sma(closesOf(candles), fast);
  const s = sma(closesOf(candles), slow);
  const out: number[] = [];
  let previous: 'above' | 'below' | null = null;
  for (let i = 0; i < candles.length; i++) {
    if (f[i] == null || s[i] == null) continue;
    const side = (f[i] as number) > (s[i] as number) ? 'above' : 'below';
    if (previous !== null && side !== previous) out.push(i);
    previous = side;
  }
  return out;
}

/** Index de la bougie dont la CLÔTURE est la plus basse (le retournement que l'œil repère). */
function lowestCloseIndex(datasetKey: string): number {
  const closes = closesOf(datasetByKey(datasetKey));
  return closes.reduce((best, v, i) => (v < closes[best] ? i : best), 0);
}
function highestCloseIndex(datasetKey: string): number {
  const closes = closesOf(datasetByKey(datasetKey));
  return closes.reduce((best, v, i) => (v > closes[best] ? i : best), 0);
}

const fiche = (id: string) => {
  const c = V5_CONCEPTS.find((x) => x.id === id);
  expect(c).toBeDefined();
  return c!;
};

describe('LOT G1 — les chiffres des fiches sont recalculés, jamais recopiés', () => {
  it('le croisement HAUSSIER se produit trois bougies APRÈS le plus bas du prix', () => {
    const cross = crossings('golden-cross', 'indicator.golden-cross.v1');
    // Un seul croisement : le dataset raconte UNE histoire, pas plusieurs.
    expect(cross).toHaveLength(1);
    const bas = lowestCloseIndex('indicator.golden-cross.v1');
    // Quatrième bougie (index 3) pour le plus bas, septième (index 6) pour le croisement.
    expect(bas).toBe(3);
    expect(cross[0]).toBe(6);
    expect(cross[0] - bas).toBe(3);
  });

  it('le croisement BAISSIER se produit trois bougies APRÈS le plus haut du prix', () => {
    const cross = crossings('death-cross', 'indicator.death-cross.v1');
    expect(cross).toHaveLength(1);
    const haut = highestCloseIndex('indicator.death-cross.v1');
    expect(haut).toBe(3);
    expect(cross[0]).toBe(6);
    expect(cross[0] - haut).toBe(3);
  });

  it('le croisement ne PRÉCÈDE jamais le retournement — c’est la leçon des deux fiches', () => {
    // Formulé comme une inégalité, pour que la leçon survive à un changement de dataset même si les
    // valeurs exactes, elles, ne survivent pas.
    expect(crossings('golden-cross', 'indicator.golden-cross.v1')[0]).toBeGreaterThan(
      lowestCloseIndex('indicator.golden-cross.v1'),
    );
    expect(crossings('death-cross', 'indicator.death-cross.v1')[0]).toBeGreaterThan(
      highestCloseIndex('indicator.death-cross.v1'),
    );
  });

  it('la série hésitante de la fiche « moyenne mobile » porte bien DEUX croisements en treize bougies', () => {
    const candles = datasetByKey('indicator.ma.v1');
    expect(candles).toHaveLength(13);
    // C'est le faux signal enseigné par la fiche : le croisement s'y répète sans rien annoncer.
    expect(crossings('moving-average', 'indicator.ma.v1')).toHaveLength(2);
  });

  it('la moyenne lente n’a pas de valeur avant sa sixième bougie (ce que dit la fiche)', () => {
    const { slow } = periods('moving-average');
    expect(slow).toBe(6);
    const s = sma(closesOf(datasetByKey('indicator.ma.v1')), slow);
    expect(s.slice(0, slow - 1).every((v) => v === null)).toBe(true);
    expect(s[slow - 1]).not.toBeNull();
  });

  it('les trois fiches pointent vers les datasets qu’elles décrivent, et vers aucun autre', () => {
    expect(fiche('concept.moving-average').visualSpec?.datasetKey).toBe('indicator.ma.v1');
    expect(fiche('concept.golden-cross').visualSpec?.datasetKey).toBe('indicator.golden-cross.v1');
    expect(fiche('concept.death-cross').visualSpec?.datasetKey).toBe('indicator.death-cross.v1');
    // Et leur variante est bien une variante que le moteur sait configurer.
    for (const id of ['concept.moving-average', 'concept.golden-cross', 'concept.death-cross']) {
      expect(INDICATOR_CONFIGS[fiche(id).visualSpec!.variant]).toBeDefined();
    }
  });

  it('la moyenne mobile ne documente AUCUNE invalidation : elle n’est pas un setup', () => {
    // Honnêteté du modèle, comme le RSI et le MACD. Une ligne de résumé n'a rien à invalider ;
    // les deux croisements, eux, ont un côté — et ils le déclarent.
    expect(fiche('concept.moving-average').invalidation).toBeUndefined();
    expect(fiche('concept.golden-cross').invalidation).toBeTruthy();
    expect(fiche('concept.death-cross').invalidation).toBeTruthy();
    // Et ces deux côtés sont OPPOSÉS : plancher pour le haussier, plafond pour le baissier.
    expect(fiche('concept.golden-cross').visualSpec?.direction).toBe('bullish');
    expect(fiche('concept.death-cross').visualSpec?.direction).toBe('bearish');
  });
});
