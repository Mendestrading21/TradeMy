import { describe, it, expect } from '@jest/globals';
import { V5_CONCEPTS } from './learningContent';
import { exercisableObjectiveIds } from './seed';

/**
 * LOT C5 — VERROU des notions liées.
 *
 * Le défaut réparé : sept fiches ne déclaraient AUCUNE notion liée. Ce n'était pas qu'un manque
 * éditorial — depuis le LOT C1, `conceptNextStep` dérive la « prochaine étape » d'une fiche de sa
 * parenté déclarée, et retombe sinon sur la première compétence du monde. Ces sept fiches renvoyaient
 * donc l'apprenant vers un repli générique plutôt que vers la notion qui les éclaire vraiment.
 *
 * Ce verrou tient l'invariant dans les deux sens : chaque fiche déclare au moins une parenté, et
 * chaque parenté déclarée pointe vers un concept qui existe.
 */

const IDS = new Set(V5_CONCEPTS.map((c) => c.id));

describe('LOT C5 — la parenté déclarée des fiches', () => {
  it('CHAQUE fiche déclare au moins une notion liée', () => {
    const sansParente = V5_CONCEPTS.filter((c) => !(c.relatedConceptIds ?? []).length).map((c) => c.id);
    expect(sansParente).toEqual([]);
  });

  it('AUCUNE parenté ne pointe dans le vide : tout identifiant cité existe', () => {
    const casses: string[] = [];
    for (const c of V5_CONCEPTS) {
      for (const rel of c.relatedConceptIds ?? []) {
        if (!IDS.has(rel)) casses.push(`${c.id} → ${rel}`);
      }
    }
    expect(casses).toEqual([]);
  });

  it('aucune fiche ne se cite elle-même, et aucune parenté n’est répétée', () => {
    for (const c of V5_CONCEPTS) {
      const rels = c.relatedConceptIds ?? [];
      expect(`${c.id}:${rels.includes(c.id)}`).toBe(`${c.id}:false`);
      expect(`${c.id}:${new Set(rels).size}`).toBe(`${c.id}:${rels.length}`);
    }
  });

  it('les sept parentés ajoutées mènent à une notion ENTRAÎNÉE — donc à une compétence jouable', () => {
    // C'est ce qui fait la différence entre « voici une notion voisine » et « voici où l'exercer ».
    const AJOUTEES = [
      'concept.unite-de-temps',
      'concept.echelle-des-prix',
      'concept.meche-de-rejet',
      'concept.impulsion-et-correction',
      'concept.retest-de-niveau',
      'concept.distribution-wyckoff',
      'concept.faux-breakout',
    ];
    for (const id of AJOUTEES) {
      const c = V5_CONCEPTS.find((x) => x.id === id)!;
      expect(c).toBeDefined();
      const rels = c.relatedConceptIds ?? [];
      const menantAUneCompetence = rels.filter((r) => exercisableObjectiveIds(r).length > 0);
      expect(`${id}:${menantAUneCompetence.length > 0}`).toBe(`${id}:true`);
    }
  });

  it('la parenté TRAVERSE les mondes, et c’est voulu', () => {
    // Note d'honnêteté : ce test vérifiait d'abord qu'une parenté restait dans son monde. Le corpus
    // l'a démenti, et il avait raison — le marteau renvoie au double creux (il en forme souvent le
    // second plancher), la discipline au risque-rendement, l'option au même. C'est exactement ce à
    // quoi sert `relatedConceptIds` : relier des familles à travers le parcours, pas cloisonner.
    // On vérifie donc ce qui est vrai — que ces ponts existent — au lieu d'interdire ce qui est bon.
    const ponts = V5_CONCEPTS.flatMap((c) =>
      (c.relatedConceptIds ?? [])
        .map((rel) => V5_CONCEPTS.find((x) => x.id === rel))
        .filter((cible) => cible && cible.worldId !== c.worldId),
    );
    expect(ponts.length).toBeGreaterThan(0);
  });
});
