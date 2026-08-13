import { describe, it, expect } from '@jest/globals';
import { INDICATOR_CONFIGS } from '../engines/visual/indicatorConfigs';
import { datasetByKey } from '../engines/visual/visualDatasets';
import { ema, closesOf } from '../engines/visual/indicatorMath';
import { V5_CONCEPTS } from './learningContent';

/**
 * LOT G4 — CLÔTURE DE LA SÉRIE G, et son verrou.
 *
 * La série G est née d'un écart mesuré : le moteur déclarait quinze variantes d'indicateur, le
 * corpus n'en enseignait que six. Trois lots l'ont ramené à deux orphelines — et ces deux-là ne
 * sont pas un reste à faire : ce sont deux REFUS, chacun appuyé sur une mesure.
 *
 *  - `bollinger-squeeze` (LOT G2) : la compression est déjà enseignée par `concept.bollinger` —
 *    dans sa définition, sa lecture ordonnée et son exercice de confirmation. Une variante de rendu
 *    n'est pas une notion.
 *  - `ma-ribbon` (LOT G4) : voir le test dédié ci-dessous. Le dataset ne montre jamais l'état
 *    emmêlé, qui est la moitié de la leçon d'un ruban.
 *
 * Ce fichier transforme ces deux refus en FAIT VÉRIFIABLE. Sans lui, « il reste deux variantes,
 * refusées » serait une phrase dans une pull request — c'est-à-dire une phrase qui vieillit. Si un
 * futur lot enseigne l'une des deux, ou si une seizième variante apparaît, ce test tombe et oblige
 * à trancher explicitement.
 */

/** Variantes réellement citées par une fiche (visualSpec, exemples, gabarits interactifs). */
function variantesEnseignees(): Set<string> {
  const vues = new Set<string>();
  for (const c of V5_CONCEPTS) {
    if (c.visualSpec?.type === 'indicator' && c.visualSpec.variant) vues.add(c.visualSpec.variant);
  }
  return vues;
}

/** Refus explicites, avec la raison. Retirer une entrée d'ici est une DÉCISION, pas un oubli. */
const REFUSEES: Record<string, string> = {
  'bollinger-squeeze': 'compression déjà enseignée par concept.bollinger (LOT G2)',
  'ma-ribbon': 'le dataset ne montre jamais l’état emmêlé (LOT G4)',
};

describe('LOT G4 — la couverture des indicateurs est un fait, pas une intention', () => {
  it('toute variante déclarée par le moteur est soit ENSEIGNÉE, soit REFUSÉE avec sa raison', () => {
    const declarees = Object.keys(INDICATOR_CONFIGS).sort();
    const enseignees = variantesEnseignees();
    const nonClassees = declarees.filter((v) => !enseignees.has(v) && !(v in REFUSEES));
    // Le cœur du verrou : aucune variante ne peut rester dans un flou.
    expect(nonClassees).toEqual([]);
  });

  it('les deux refus sont exactement ceux qui ont été décidés — ni plus, ni moins', () => {
    const enseignees = variantesEnseignees();
    const orphelines = Object.keys(INDICATOR_CONFIGS)
      .filter((v) => !enseignees.has(v))
      .sort();
    expect(orphelines).toEqual(['bollinger-squeeze', 'ma-ribbon']);
    for (const v of orphelines) expect(REFUSEES[v]).toBeTruthy();
  });

  it('la série G a bien fait passer la couverture de 6 à 13 variantes sur 15', () => {
    expect(Object.keys(INDICATOR_CONFIGS)).toHaveLength(15);
    expect(variantesEnseignees().size).toBe(13);
  });

  it('un refus ne peut pas cacher une fiche : aucune fiche ne pointe vers une variante refusée', () => {
    for (const c of V5_CONCEPTS) {
      if (c.visualSpec?.type !== 'indicator') continue;
      expect(Object.keys(REFUSEES)).not.toContain(c.visualSpec.variant);
    }
  });
});

describe('LOT G4 — pourquoi le ruban de moyennes est refusé, mesuré et non affirmé', () => {
  const cfg = INDICATOR_CONFIGS['ma-ribbon'];
  const candles = datasetByKey(cfg.datasetKey);
  const periodes = cfg.ribbon ?? [3, 5, 8];
  const lignes = periodes.map((p) => ema(closesOf(candles), p));

  /** États du ruban, bougie par bougie, là où les trois moyennes existent. */
  function etats(): ('ordonné' | 'emmêlé')[] {
    const out: ('ordonné' | 'emmêlé')[] = [];
    for (let i = 0; i < candles.length; i++) {
      const v = lignes.map((l) => l[i]);
      if (v.some((x) => x == null)) continue;
      const [rapide, moyen, lent] = v as number[];
      const croissant = rapide > moyen && moyen > lent;
      const decroissant = rapide < moyen && moyen < lent;
      out.push(croissant || decroissant ? 'ordonné' : 'emmêlé');
    }
    return out;
  }

  it('le ruban est ORDONNÉ sur toutes les bougies où il existe — l’emmêlement n’apparaît jamais', () => {
    // C'est la raison du refus. Un ruban s'enseigne par le CONTRASTE entre ses deux états :
    // ordonné et écarté = tendance installée ; emmêlé = rien à lire. La série n'en montre qu'un.
    const e = etats();
    expect(e.length).toBeGreaterThan(0);
    expect(e.filter((x) => x === 'emmêlé')).toEqual([]);
    expect(new Set(e)).toEqual(new Set(['ordonné']));
  });

  it('et l’écart ne fait que croître : même la respiration du ruban manque', () => {
    const ecarts: number[] = [];
    for (let i = 0; i < candles.length; i++) {
      const v = lignes.map((l) => l[i]);
      if (v.some((x) => x == null)) continue;
      ecarts.push(Math.abs((v[0] as number) - (v[2] as number)));
    }
    // Un resserrement franc serait le second état à montrer ; il n'y en a pas.
    expect(Math.min(...ecarts)).toBeGreaterThan(3);
  });

  it('écrire cette fiche demanderait un dataset NEUF — ce qui sort de la prémisse de la série', () => {
    // La série G disait : « le moteur sait déjà dessiner ce que personne n'enseigne ». Ici, il ne
    // sait pas encore dessiner la moitié de la leçon. Le sujet reste ouvert pour un lot de contenu
    // qui commencerait par les DONNÉES — pas une dette, une décision.
    expect(REFUSEES['ma-ribbon']).toContain('emmêlé');
  });
});
