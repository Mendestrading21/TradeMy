import { describe, it, expect } from '@jest/globals';
import { create, act, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { IndicatorPanel } from './IndicatorPanel';
import { colors } from '../../../design-system/tokens';
import { datasetByKey } from '../visualDatasets';
import { INDICATOR_CONFIGS } from '../indicatorConfigs';

/**
 * LOT G1 — VERROU DE SÉMANTIQUE DES COULEURS sur les superpositions de moyennes.
 *
 * Le canon Trademy réserve le vert et le rouge à la DIRECTION DU MARCHÉ. Deux moyennes mobiles
 * tracées sur le même prix ne sont pas deux directions : ce sont deux PÉRIODES du même calcul.
 * Peintes en vert et rouge — ce qu'elles étaient avant ce lot —, elles se lisaient « ligne
 * haussière contre ligne baissière », c'est-à-dire l'inverse exact de ce que la fiche enseigne.
 *
 * Ce test monte le vrai renderer et lit les couleurs réellement produites.
 */
function strokes(variant: string, datasetKey: string): string[] {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = create(
      <IndicatorPanel candles={datasetByKey(datasetKey)} config={INDICATOR_CONFIGS[variant]} />,
    );
  });
  const root = tree.root as unknown as ReactTestInstance;
  const lines = root.findAll(
    (n) => typeof n.props?.stroke === 'string' && typeof n.props?.points === 'string',
    { deep: true },
  );
  return lines.map((n) => String(n.props.stroke));
}

const VARIANTES_MA: [string, string][] = [
  ['moving-average', 'indicator.ma.v1'],
  ['golden-cross', 'indicator.golden-cross.v1'],
  ['death-cross', 'indicator.death-cross.v1'],
];

describe('LOT G1 — les moyennes ne portent pas les couleurs du marché', () => {
  it('aucune des trois variantes de moyennes ne trace une ligne verte ou rouge', () => {
    for (const [variant, datasetKey] of VARIANTES_MA) {
      const traits = strokes(variant, datasetKey);
      expect(traits.length).toBeGreaterThanOrEqual(2);
      expect(traits).not.toContain(colors.bullish);
      expect(traits).not.toContain(colors.bearish);
    }
  });

  it('la rapide se distingue de la lente autrement que par une couleur de direction', () => {
    for (const [variant, datasetKey] of VARIANTES_MA) {
      const traits = strokes(variant, datasetKey);
      // La ligne qu'on lit est en couleur d'annotation ; la référence lente reste discrète.
      expect(traits).toContain(colors.technical);
      expect(traits).toContain(colors.textMuted);
      // Et les deux ne sont jamais confondues.
      expect(colors.technical).not.toBe(colors.textMuted);
    }
  });
});
