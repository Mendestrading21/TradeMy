import { describe, it, expect } from '@jest/globals';
import { conceptNextStep, guidedSkillToDiscover } from './conceptNextStep';
import { V5_CONCEPTS } from './learningContent';
import { isRepresentativeConcept } from './conceptMasteryState';
import { ALL_MODULE_SKILLS, SKILL_CONCEPT_ID, skillById, exercisableObjectiveIds, CHECKPOINT_ID } from './seed';
import type { ConceptStateInput } from './conceptMasteryState';
import { MASTERY_MIN_REPS, type TargetProgress } from './targetProgress';

/**
 * LOT C1 — VERROU de la raison et de la prochaine action.
 *
 * Le défaut réparé : la machine de maîtrise savait pourquoi un concept était bloqué, mais
 * l'apprenant, lui, ne voyait qu'un statut. Et pour les fiches de BIBLIOTHÈQUE — sans exercices à
 * elles — ce statut ne peut légitimement jamais bouger : le garde-fou P0 les plafonne, à raison, à
 * « Découvert ». Personne ne le disait. Elles étaient 22 au LOT C1 ; le LOT C2 en a rendu deux
 * entraînables, il en reste 20.
 *
 * (Le même lot corrige, dans `conceptMasteryState`, un plafonnement qui frappait AUSSI 42 concepts
 * pourtant activement entraînés : c'était un bug, pas une règle. Le compte de 22 vérifié ici est
 * donc la dette réelle et assumée, une fois le bug retiré.)
 *
 * Ces tests vérifient qu'aucune fiche n'est une impasse : chacune sait dire pourquoi elle en est là
 * et, quand une suite existe, vers quelle compétence RÉELLE aller.
 */

const VIDE: ConceptStateInput = { exploredSlugs: [], targets: {}, completedSkills: [] };

/**
 * Progression fabriquée avec les VRAIS champs persistés : `correct > 0` fait « entraîné », et la
 * rétention différée (répétitions + intervalle) fait « prouvé ». Aucun raccourci : les seuils sont
 * ceux du modèle (`MASTERY_MIN_REPS`), pas des valeurs commodes.
 */
function targets(ids: string[], proven: boolean, conceptId: string): Record<string, TargetProgress> {
  const out: Record<string, TargetProgress> = {};
  for (const id of ids) {
    out[id] = {
      objectiveId: id,
      conceptId,
      attempts: 4,
      correct: 4,
      sessions: proven ? MASTERY_MIN_REPS + 1 : 1,
      lastCorrect: true,
      review: {
        repetitions: proven ? MASTERY_MIN_REPS : 0,
        easiness: 2.5,
        intervalDays: proven ? 6 : 0,
        dueAt: 0,
      },
    };
  }
  return out;
}

const LIBRARY_ONLY = V5_CONCEPTS.filter((c) => !isRepresentativeConcept(c));
const REPRESENTATIVE = V5_CONCEPTS.filter((c) => isRepresentativeConcept(c));

describe('LOT C1 — la fiche dit pourquoi, et ce qu’il reste à faire', () => {
  it('AUCUNE fiche n’est une impasse : les 67 savent nommer leur raison', () => {
    for (const c of V5_CONCEPTS) {
      const step = conceptNextStep(c, VIDE);
      expect(step.reason.length).toBeGreaterThan(20);
      expect(step.blocker).toBeTruthy();
    }
  });

  it('le corpus se partage en deux familles nettes, et la dette est CHIFFRÉE', () => {
    // Ce compte n'est pas décoratif : c'est la mesure du défaut réparé. S'il change, c'est qu'un lot
    // a donné (ou retiré) une compétence propre à des fiches — il faut alors le vouloir.
    expect(REPRESENTATIVE.length + LIBRARY_ONLY.length).toBe(V5_CONCEPTS.length);
    // LOT C2 : 22 → 20 (avalement baissier, double sommet). LOT C3 : 20 → 17 (triangle descendant,
    // drapeau baissier, ÉTÉ inversée). Chaque baisse correspond à un lot qui a donné à ces fiches
    // leur propre compétence guidée — jamais à un relâchement de la règle.
    expect(LIBRARY_ONLY.length).toBe(17);
    expect(V5_CONCEPTS.length).toBe(67);
  });

  it('une fiche de bibliothèque le DIT — au lieu d’afficher un statut qui ne bougera jamais', () => {
    for (const c of LIBRARY_ONLY) {
      const step = conceptNextStep(c, { ...VIDE, exploredSlugs: [c.slug] });
      expect(step.blocker).toBe('library-only');
      expect(step.reason).toContain('Découvert');
    }
  });

  it('et elle propose une compétence guidée RÉELLE : chacune a une suite, aucune n’est orpheline', () => {
    const sansSuite: string[] = [];
    for (const c of LIBRARY_ONLY) {
      const step = conceptNextStep(c, VIDE);
      if (!step.action) {
        sansSuite.push(c.id);
        continue;
      }
      // La compétence proposée existe vraiment, et son libellé vient du registre.
      const skill = skillById(step.action.skillId);
      expect(skill).toBeDefined();
      expect(step.action.label).toBe(skill!.name);
      // Elle entraîne bien un concept : ce n'est pas un renvoi vers le vide.
      expect(SKILL_CONCEPT_ID[step.action.skillId]).toBeTruthy();
    }
    expect(sansSuite).toEqual([]);
  });

  it('la suite proposée est PARENTE : notion liée déclarée par la fiche, ou même monde', () => {
    for (const c of LIBRARY_ONLY) {
      const skillId = guidedSkillToDiscover(c);
      expect(skillId).toBeTruthy();
      const cible = SKILL_CONCEPT_ID[skillId!];
      const parRelation = (c.relatedConceptIds ?? []).includes(cible);
      const parMonde = V5_CONCEPTS.find((x) => x.id === cible)?.worldId === c.worldId;
      // L'un ou l'autre — jamais un renvoi arbitraire vers un monde étranger.
      expect(`${c.id}:${parRelation || parMonde}`).toBe(`${c.id}:true`);
    }
  });

  it('la parenté déclarée PRIME sur le repli par monde (on suit ce que l’éditeur a écrit)', () => {
    // Le pendu déclare le marteau comme notion liée : c'est vers « Le rejet des extrêmes » qu'on
    // envoie, pas vers la première compétence du monde des chandeliers.
    const pendu = V5_CONCEPTS.find((c) => c.id === 'concept.hanging-man')!;
    expect(pendu.relatedConceptIds).toContain('concept.hammer');
    expect(guidedSkillToDiscover(pendu)).toBe('skill.candle.rejection');
    // Le double sommet déclare le double creux : « La figure double ».
    const doubleTop = V5_CONCEPTS.find((c) => c.id === 'concept.double-top')!;
    expect(guidedSkillToDiscover(doubleTop)).toBe('skill.patterns.double');
  });

  it('un concept représentatif suit les VRAIES étapes de la machine de maîtrise, dans l’ordre', () => {
    const c = V5_CONCEPTS.find((x) => x.id === 'concept.hammer')!;
    const objectifs = exercisableObjectiveIds(c.id);
    expect(objectifs.length).toBeGreaterThan(1);

    expect(conceptNextStep(c, VIDE).blocker).toBe('not-explored');

    const lue: ConceptStateInput = { ...VIDE, exploredSlugs: [c.slug] };
    expect(conceptNextStep(c, lue).blocker).toBe('not-trained');

    const partiel = { ...lue, targets: targets([objectifs[0]], false, c.id) };
    expect(conceptNextStep(c, partiel).blocker).toBe('coverage-incomplete');

    const couvert = { ...lue, targets: targets(objectifs, true, c.id) };
    expect(conceptNextStep(c, couvert).blocker).toBe('checkpoint-pending');

    const fini = { ...couvert, completedSkills: [CHECKPOINT_ID] };
    const step = conceptNextStep(c, fini);
    expect(step.blocker).toBe('none');
    expect(step.action).toBeNull(); // maîtrisé : plus rien à proposer, aucun bouton mort
  });

  it('tant que ce n’est pas fini, l’action pointe vers SA compétence — pas vers une autre', () => {
    for (const c of REPRESENTATIVE) {
      const step = conceptNextStep(c, { ...VIDE, exploredSlugs: [c.slug] });
      if (!step.action) continue;
      expect(SKILL_CONCEPT_ID[step.action.skillId]).toBe(c.id);
    }
  });

  it('toute compétence proposée est jouable : elle appartient au registre des modules', () => {
    const connues = new Set(ALL_MODULE_SKILLS.map((s) => s.id));
    for (const c of V5_CONCEPTS) {
      const step = conceptNextStep(c, { ...VIDE, exploredSlugs: [c.slug] });
      if (step.action) expect(connues.has(step.action.skillId)).toBe(true);
    }
  });

  it('aucune raison n’emploie de jargon d’état ni de vocabulaire interdit', () => {
    const INTERDIT = /\b(buy|sell|profit garanti|gain garanti|trade gagnant|signal sûr)\b/i;
    const JARGON = /(representative|coverageComplete|blocker|masteryGate|targetProgress)/;
    for (const c of V5_CONCEPTS) {
      for (const input of [VIDE, { ...VIDE, exploredSlugs: [c.slug] }]) {
        const { reason } = conceptNextStep(c, input);
        expect(INTERDIT.test(reason)).toBe(false);
        expect(JARGON.test(reason)).toBe(false);
      }
    }
  });
});
