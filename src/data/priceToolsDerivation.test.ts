import { describe, it, expect } from '@jest/globals';
import { datasetByKey } from '../engines/visual/visualDatasets';
import { INDICATOR_CONFIGS } from '../engines/visual/indicatorConfigs';
import { atr, fibLevels } from '../engines/visual/indicatorMath';
import { V5_CONCEPTS } from './learningContent';

/**
 * LOT G2 — VERROU DE DÉRIVATION, même discipline qu'au LOT G1.
 *
 * Les deux fiches avancent des faits chiffrés : « l'amplitude moyenne culmine UNE bougie après la
 * plus large », « elle reste sous l'amplitude de cette bougie », « le mouvement va de 43,40 à 62,60,
 * le niveau 50 % tombe à 53,00 et le repli s'arrête à 53,40 ».
 *
 * Ils sont RECALCULÉS ici depuis le dataset et la période réellement tracés — jamais relus dans la
 * fiche. Et, comme au LOT G1, la LEÇON est verrouillée en plus des valeurs : une moyenne
 * d'amplitudes ne peut pas dépasser son maximum, et le 50 % n'est pas un ratio de Fibonacci.
 */

const ATR_KEY = 'indicator.atr.v1';
const FIB_KEY = 'indicator.fib.v1';

/** Vraie amplitude de chaque bougie — la définition même de l'ATR, réécrite pour vérifier. */
function trueRanges(key: string): number[] {
  const c = datasetByKey(key);
  return c.map((x, i) =>
    i === 0 ? x.h - x.l : Math.max(x.h - x.l, Math.abs(x.h - c[i - 1].c), Math.abs(x.l - c[i - 1].c)),
  );
}

function indexOfMax(values: (number | null)[]): number {
  let best = -1;
  let bestValue = -Infinity;
  values.forEach((v, i) => {
    if (v != null && v > bestValue) {
      bestValue = v;
      best = i;
    }
  });
  return best;
}

const fiche = (id: string) => {
  const c = V5_CONCEPTS.find((x) => x.id === id);
  expect(c).toBeDefined();
  return c!;
};

describe('LOT G2 — ATR : les chiffres de la fiche sont recalculés', () => {
  const periode = INDICATOR_CONFIGS.atr.period ?? 5;
  const tr = trueRanges(ATR_KEY);
  const serie = atr(datasetByKey(ATR_KEY), periode);

  it('l’amplitude moyenne culmine UNE bougie APRÈS la bougie la plus large', () => {
    const plusLarge = indexOfMax(tr);
    const pic = indexOfMax(serie);
    expect(plusLarge).toBe(4);
    expect(pic).toBe(5);
    expect(pic - plusLarge).toBe(1);
  });

  it('et elle reste SOUS l’amplitude de cette bougie — une moyenne ne rend jamais l’extrême', () => {
    const maxAmplitude = Math.max(...tr);
    const maxMoyenne = Math.max(...serie.filter((v): v is number => v != null));
    expect(maxMoyenne).toBeLessThan(maxAmplitude);
    // Ce n'est pas une différence anecdotique : la moyenne perd près d'un tiers de l'extrême.
    expect(maxMoyenne / maxAmplitude).toBeLessThan(0.75);
  });

  it('une amplitude n’est jamais négative, et la courbe n’existe pas avant sa période', () => {
    for (const v of serie) if (v != null) expect(v).toBeGreaterThanOrEqual(0);
    expect(serie.slice(0, periode - 1).every((v) => v === null)).toBe(true);
    expect(serie[periode - 1]).not.toBeNull();
  });

  it('la fiche ATR ne documente aucune invalidation : elle sert à en poser une, elle n’en a pas', () => {
    expect(fiche('concept.atr').invalidation).toBeUndefined();
    expect(fiche('concept.atr').visualSpec?.direction).toBe('neutral');
    expect(fiche('concept.atr').visualSpec?.datasetKey).toBe(ATR_KEY);
  });
});

describe('LOT G2 — Retracements : les niveaux dépendent des points, et le test le montre', () => {
  const serie = datasetByKey(FIB_KEY);
  const bas = Math.min(...serie.map((c) => c.l));
  const haut = Math.max(...serie.map((c) => c.h));
  const niveaux = fibLevels(bas, haut);
  const niveau = (ratio: number) => niveaux.find((n) => n.ratio === ratio)!.price;

  it('les extrêmes de la série rendue donnent bien les niveaux cités par la fiche', () => {
    expect(bas).toBeCloseTo(43.4, 2);
    expect(haut).toBeCloseTo(62.6, 2);
    expect(niveau(0.5)).toBeCloseTo(53.0, 2);
    // Le 0 % est au sommet du mouvement, le 100 % à son départ : c'est ce que dit la fiche.
    expect(niveau(0)).toBe(haut);
    expect(niveau(1)).toBe(bas);
  });

  it('le repli s’arrête JUSTE AU-DESSUS du niveau 50 % — près, mais pas dessus', () => {
    // Le plus bas atteint APRÈS le sommet du mouvement : c'est le creux du repli.
    const sommet = serie.reduce((best, c, i) => (c.h > serie[best].h ? i : best), 0);
    const creuxDuRepli = Math.min(...serie.slice(sommet).map((c) => c.l));
    expect(creuxDuRepli).toBeCloseTo(53.4, 2);
    expect(creuxDuRepli).toBeGreaterThan(niveau(0.5));
    // « Près » vaut ici quatre dixièmes, sur une amplitude de plus de dix-neuf points.
    expect(creuxDuRepli - niveau(0.5)).toBeCloseTo(0.4, 2);
  });

  it('le niveau 50 % n’est PAS un ratio de Fibonacci — la fiche le dit, le registre le montre', () => {
    const ratios = niveaux.map((n) => n.ratio);
    expect(ratios).toContain(0.5);
    // Les vrais ratios dérivés de la suite ; 0,5 n'en fait pas partie, il est là par convention.
    for (const r of [0.236, 0.382, 0.618, 0.786]) expect(ratios).toContain(r);
    expect([0.236, 0.382, 0.618, 0.786]).not.toContain(0.5);
  });

  it('changer les deux points change TOUS les niveaux intermédiaires : la leçon de la fiche', () => {
    // Le fait central : les ratios sont fixes, les niveaux ne le sont pas. On reprend la même
    // série en ne choisissant que la moitié du mouvement — aucun niveau intermédiaire ne survit.
    const autres = fibLevels(bas, (bas + haut) / 2);
    for (const r of [0.236, 0.382, 0.5, 0.618, 0.786]) {
      const avant = niveaux.find((n) => n.ratio === r)!.price;
      const apres = autres.find((n) => n.ratio === r)!.price;
      expect(apres).not.toBeCloseTo(avant, 2);
    }
  });

  it('la fiche des retracements documente son invalidation, et c’est un PLANCHER', () => {
    const f = fiche('concept.fibonacci');
    expect(f.invalidation).toBeTruthy();
    expect(f.visualSpec?.direction).toBe('bullish');
    expect(f.visualSpec?.datasetKey).toBe(FIB_KEY);
    expect(INDICATOR_CONFIGS[f.visualSpec!.variant]).toBeDefined();
  });
});
