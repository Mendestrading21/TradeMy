import { describe, it, expect } from '@jest/globals';
import { ALL_MODULE_SKILLS, getExercises, exercisableObjectiveIds, exerciseVariantsForObjective } from './seed';
import { allExercisesFlat } from './repoTruth';
import { V5_CONCEPTS } from './learningContent';

/**
 * LOT E5 — verrou de la VARIÉTÉ de pratique.
 *
 * Constat mesuré : 85 % des exercices tenaient dans 4 formats sur les 13 implémentés ; « Associe »
 * (`match`) n'était utilisé qu'une seule fois. Ce format exerce pourtant une compétence que rien
 * d'autre ne travaille : ne pas confondre deux notions VOISINES du même monde.
 *
 * Chaque module guidé reçoit un exercice d'association dérivé de ses concepts réels. Les
 * invariants ci-dessous garantissent qu'il enseigne juste, qu'il n'est pas trivial, et surtout
 * qu'il n'a créé AUCUNE nouvelle exigence de maîtrise.
 */
const matchs = () => allExercisesFlat().filter((e) => e.type === 'match');

describe('LOT E5 — « Associe » : distinguer les notions voisines d’un monde', () => {
  it('le format passe d’anecdotique à réellement présent dans le parcours', () => {
    expect(matchs().length).toBeGreaterThanOrEqual(10);
  });

  it('chaque association est dérivée de concepts RÉELS et de leurs critères RÉELS', () => {
    for (const ex of matchs()) {
      if (ex.type !== 'match') continue;
      if (!ex.id.endsWith('.match-figures')) continue; // exercice historique rédigé à la main
      expect(ex.left.length).toBe(ex.right.length);
      expect(ex.left.length).toBeGreaterThanOrEqual(3);
      for (const titre of ex.left) {
        const concept = V5_CONCEPTS.find((c) => c.title === titre);
        expect(concept).toBeDefined();
        // Le critère du concept figure bien dans la colonne de droite.
        expect(ex.right).toContain(concept!.howToRecognize[0].trim());
      }
    }
  });

  it('la solution est une vraie association, jamais l’alignement ligne à ligne', () => {
    for (const ex of matchs()) {
      if (ex.type !== 'match' || !ex.id.endsWith('.match-figures')) continue;
      const identite = ex.left.map((_, i) => i);
      expect(ex.validation.matches).not.toEqual(identite);
      // Bijection : chaque proposition sert exactement une fois.
      expect([...ex.validation.matches].sort((a, b) => a - b)).toEqual(identite);
    }
  });

  it('la solution est JUSTE : matches[i] pointe le critère du concept de gauche', () => {
    for (const ex of matchs()) {
      if (ex.type !== 'match' || !ex.id.endsWith('.match-figures')) continue;
      ex.left.forEach((titre, i) => {
        const concept = V5_CONCEPTS.find((c) => c.title === titre)!;
        expect(ex.right[ex.validation.matches[i]]).toBe(concept.howToRecognize[0].trim());
      });
    }
  });

  it('AUCUNE nouvelle exigence de maîtrise : chaque cible visée était déjà exerçable', () => {
    for (const ex of matchs()) {
      if (!ex.target || !ex.id.endsWith('.match-figures')) continue;
      const objectifs = exercisableObjectiveIds(ex.target.conceptId);
      expect(objectifs).toContain(ex.target.objectiveId);
      // L'exercice est une VARIANTE de rotation : l'objectif a plusieurs formulations.
      expect(exerciseVariantsForObjective(ex.target.objectiveId).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('chaque association est rattachée à une compétence réelle du parcours, sans doublon d’id', () => {
    const ids = allExercisesFlat().map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const skills = new Set(ALL_MODULE_SKILLS.map((s) => s.id));
    for (const ex of matchs()) {
      if (!ex.id.endsWith('.match-figures')) continue;
      expect(skills.has(ex.skillId)).toBe(true);
      expect(getExercises(ex.skillId).some((e) => e.id === ex.id)).toBe(true);
    }
  });

  it('feedback complet et vocabulaire canon', () => {
    for (const ex of matchs()) {
      if (!ex.id.endsWith('.match-figures')) continue;
      expect(ex.feedback.correct.trim().length).toBeGreaterThan(10);
      expect(ex.feedback.incorrect.trim().length).toBeGreaterThan(10);
      expect(`${ex.prompt} ${ex.feedback.correct} ${ex.feedback.incorrect}`).not.toMatch(
        /\b(buy|sell|profit garanti|gain garanti|trade gagnant|signal sûr)\b/i,
      );
    }
  });
});
