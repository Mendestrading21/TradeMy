import { describe, it, expect } from '@jest/globals';
import { datasetByKey } from '../engines/visual/visualDatasets';
import { INDICATOR_CONFIGS } from '../engines/visual/indicatorConfigs';
import { stochastic, rsi, closesOf, highsOf, lowsOf } from '../engines/visual/indicatorMath';
import { V5_CONCEPTS } from './learningContent';

/**
 * LOT G3 — VERROU DE DÉRIVATION.
 *
 * Ce lot repose sur une affirmation forte, et le seul moyen honnête de la tenir est de la
 * recalculer : sur LA MÊME série et LA MÊME bougie, le stochastique et le RSI donnent des lectures
 * opposées. La fiche cite « 4 et 32 » ; ce test les retrouve depuis les données, avec les périodes
 * réellement employées par le rendu.
 *
 * Il verrouille aussi la forme de la divergence cachée — creux du prix plus HAUT, creux de
 * l'oscillateur plus BAS — qui est exactement l'inverse de la divergence classique.
 */

const STOCH_KEY = 'indicator.stochastic.v1';
const HDIV_KEY = 'indicator.hidden-divergence.v1';

/** Seuils réellement tracés par `IndicatorPanel` pour chaque oscillateur. */
const SEUILS = { stochastique: { haut: 80, bas: 20 }, rsi: { haut: 70, bas: 30 } };

const fiche = (id: string) => {
  const c = V5_CONCEPTS.find((x) => x.id === id);
  expect(c).toBeDefined();
  return c!;
};

describe('LOT G3 — le stochastique et le RSI, sur la même série', () => {
  const candles = datasetByKey(STOCH_KEY);
  const cfg = INDICATOR_CONFIGS.stochastic;
  const stoch = stochastic(
    highsOf(candles),
    lowsOf(candles),
    closesOf(candles),
    cfg.period ?? 5,
    cfg.k ?? 3,
  );
  // Le RSI de référence emploie la période de sa propre fiche (`INDICATOR_CONFIGS.rsi`).
  const force = rsi(closesOf(candles), INDICATOR_CONFIGS.rsi.period ?? 5);

  it('il existe une bougie où l’un crie l’extrême et l’autre dit le milieu', () => {
    const contradictions = candles
      .map((_, i) => i)
      .filter((i) => {
        const k = stoch.k[i];
        const r = force[i];
        if (k == null || r == null) return false;
        const kExtreme = k < SEUILS.stochastique.bas || k > SEUILS.stochastique.haut;
        const rNeutre = r > SEUILS.rsi.bas && r < SEUILS.rsi.haut;
        return kExtreme && rNeutre;
      });
    // Pas une, mais plusieurs : le désaccord n'est pas un accident de série.
    expect(contradictions.length).toBeGreaterThanOrEqual(2);
  });

  it('les deux valeurs citées par la fiche sont bien celles que le moteur produit', () => {
    // Douzième bougie (index 11) : le stochastique au plancher, le RSI au milieu.
    expect(stoch.k[11]).toBeCloseTo(4.2, 1);
    expect(force[11]).toBeCloseTo(32.5, 1);
    expect(stoch.k[11] as number).toBeLessThan(SEUILS.stochastique.bas);
    expect(force[11] as number).toBeGreaterThan(SEUILS.rsi.bas);
    // Et le désaccord existe aussi dans l'autre sens (neuvième bougie).
    expect(stoch.k[8] as number).toBeGreaterThan(SEUILS.stochastique.haut);
    expect(force[8] as number).toBeLessThan(SEUILS.rsi.haut);
  });

  it('le stochastique balaie une amplitude bien plus large que le RSI — d’où sa nervosité', () => {
    const amplitude = (values: (number | null)[]) => {
      const v = values.filter((x): x is number => x != null);
      return Math.max(...v) - Math.min(...v);
    };
    expect(amplitude(stoch.k)).toBeGreaterThan(2 * amplitude(force));
  });

  it('la fiche du stochastique ne documente aucune invalidation, comme celle du RSI', () => {
    expect(fiche('concept.stochastic').invalidation).toBeUndefined();
    expect(fiche('concept.rsi').invalidation).toBeUndefined();
    expect(fiche('concept.stochastic').visualSpec?.datasetKey).toBe(STOCH_KEY);
  });
});

describe('LOT G3 — la divergence cachée est le contraire de la classique', () => {
  const candles = datasetByKey(HDIV_KEY);
  const cfg = INDICATOR_CONFIGS['hidden-divergence'];
  const [a, b] = cfg.priceHighs as [number, number];
  const osc = cfg.osc as number[];

  it('le prix fait un creux PLUS HAUT et l’oscillateur un creux plus BAS', () => {
    expect(cfg.pivot).toBe('low');
    // Les deux pivots comparés sont bien des creux de la série rendue.
    expect(candles[a].l).toBeCloseTo(47, 2);
    expect(candles[b].l).toBeCloseTo(51, 2);
    expect(candles[b].l).toBeGreaterThan(candles[a].l);
    // L'oscillateur, lui, descend entre les deux mêmes indices.
    expect(osc[b]).toBeLessThan(osc[a]);
  });

  it('la divergence CLASSIQUE compare des sommets, et dans l’autre sens', () => {
    // C'est la comparaison qui fait la leçon : même désaccord, pivots opposés.
    const classique = INDICATOR_CONFIGS.divergence;
    expect(classique.pivot).toBe('high');
    const [ca, cb] = classique.priceHighs as [number, number];
    const prix = datasetByKey(classique.datasetKey);
    expect(prix[cb].h).toBeGreaterThan(prix[ca].h); // sommets croissants
    expect((classique.osc as number[])[cb]).toBeLessThan((classique.osc as number[])[ca]);
  });

  it('et les deux fiches concluent l’inverse l’une de l’autre', () => {
    expect(fiche('concept.divergence').visualSpec?.direction).toBe('bearish');
    expect(fiche('concept.hidden-divergence').visualSpec?.direction).toBe('bullish');
    // La cachée repose sur une structure : elle a donc une invalidation, et c'est un plancher.
    expect(fiche('concept.hidden-divergence').invalidation).toBeTruthy();
  });

  it('les deux fiches d’oscillateur disent que leur courbe est une ILLUSTRATION', () => {
    // Les deux figures fournissent leur série d'oscillateur au lieu de la calculer sur le prix.
    // Le taire laisserait croire que la courbe se déduit du graphique du dessus.
    for (const id of ['concept.divergence', 'concept.hidden-divergence']) {
      expect(fiche(id).interpretationLimits.join(' ')).toContain('ILLUSTRATION');
    }
  });
});
