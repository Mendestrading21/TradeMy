import { describe, it, expect } from '@jest/globals';
import { allLessonsFlat } from './repoTruth';
import { ALL_MODULE_SKILLS, getLessons } from './seed';
import { V5_CONCEPTS } from './learningContent';
import { conceptBySlug } from './learningConcept';
import { datasetByKey } from '../engines/visual/visualDatasets';

/**
 * LOT E1 — verrou de la MANIPULATION (canon : « observer, formuler, vérifier, MANIPULER, répondre,
 * expliquer puis réviser »). Avant ce lot, 4 leçons sur 59 seulement portaient une étape
 * `interaction` : la manipulation était le maillon manquant de la boucle.
 *
 * Invariants garantis ici :
 *  1. CHAQUE compétence du parcours propose au moins une manipulation dans son arc de leçons ;
 *  2. toute étape de manipulation est RÉSOLVABLE (concept réel avec dataset, ou graine
 *     déterministe) — jamais un rendu mort ;
 *  3. la manipulation n'est jamais du décor : elle porte le concept de la leçon (`conceptRef`) ou
 *     une graine explicite ;
 *  4. la seule leçon sans manipulation est CONCEPTUELLE (aucune figure à manipuler) — elle est
 *     nommée ici, ce qui interdit toute régression silencieuse ailleurs.
 */

/** Leçon purement notionnelle (action vs obligation) : aucune figure de marché à manipuler. */
const SANS_FIGURE = ['lesson.action-vs-bond'];

describe('LOT E1 — la manipulation fait partie de chaque leçon', () => {
  it('chaque compétence du parcours propose au moins une manipulation', () => {
    const sansManip = ALL_MODULE_SKILLS.filter(
      (s) => !getLessons(s.id).some((l) => l.steps.some((st) => st.kind === 'interaction')),
    ).map((s) => s.id);
    expect(sansManip).toEqual([]);
  });

  it('toutes les leçons portent une manipulation, sauf la leçon notionnelle documentée', () => {
    const lessons = allLessonsFlat();
    const sans = lessons.filter((l) => !l.steps.some((s) => s.kind === 'interaction')).map((l) => l.id);
    expect(sans).toEqual(SANS_FIGURE);
    // Le corpus reste très majoritairement manipulable (garde de non-régression).
    expect(lessons.length - sans.length).toBeGreaterThanOrEqual(58);
  });

  it('chaque manipulation est résolvable : concept réel OU graine déterministe (jamais un rendu mort)', () => {
    const orphelines: string[] = [];
    for (const l of allLessonsFlat()) {
      for (const s of l.steps.filter((st) => st.kind === 'interaction')) {
        const parConcept = !!s.conceptRef && !!conceptBySlug(V5_CONCEPTS, s.conceptRef);
        const parGraine = typeof s.chartSeed === 'number';
        if (!parConcept && !parGraine) orphelines.push(`${l.id}/${s.id}`);
      }
    }
    expect(orphelines).toEqual([]);
  });

  it('une part significative des manipulations rejoue la FIGURE RÉELLE du concept', () => {
    let vraieFigure = 0;
    for (const l of allLessonsFlat()) {
      for (const s of l.steps.filter((st) => st.kind === 'interaction')) {
        const c = s.conceptRef ? conceptBySlug(V5_CONCEPTS, s.conceptRef) : undefined;
        if (datasetByKey(c?.visualSpec?.datasetKey).length >= 8) vraieFigure++;
      }
    }
    // Les figures d'une seule bougie (marteau, doji…) retombent volontairement sur la série
    // déterministe : « révéler » une bougie unique n'apprendrait rien.
    expect(vraieFigure).toBeGreaterThanOrEqual(25);
  });

  it('la manipulation est placée APRÈS l’observation ou la formulation (ordre de la boucle)', () => {
    const malPlacees: string[] = [];
    for (const l of allLessonsFlat()) {
      const i = l.steps.findIndex((s) => s.kind === 'interaction');
      if (i < 0) continue;
      const avant = l.steps.slice(0, i).map((s) => s.kind);
      // On manipule ce qu'on a d'abord regardé ou formulé — jamais en toute première étape.
      if (!avant.some((k) => k === 'observe' || k === 'visual' || k === 'hypothesis' || k === 'chart' || k === 'explain' || k === 'intro')) {
        malPlacees.push(l.id);
      }
    }
    expect(malPlacees).toEqual([]);
  });
});
