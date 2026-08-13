import { describe, it, expect } from '@jest/globals';
import { SKILL_CONCEPT_ID, getExercises, CONTENT_MODULES } from './seed';
import { EXERCISE_FORMAT_REGISTRY } from '../engines/exercise/formatRegistry';
import { parseObjectiveId, type ObjectiveKind } from './learningTarget';
import type { ExerciseType } from '../engines/exercise/types';

/**
 * LOT D2 — VERROU DE VARIÉTÉ des mécaniques.
 *
 * Le défaut réparé par ce lot : dans les quatorze modules guidés, la mécanique était liée 1 pour 1
 * à l'objectif. `recognize` était TOUJOURS une reconnaissance de figure, `interpret` TOUJOURS une
 * remise en ordre, `avoid-false-signal` TOUJOURS un « repère l'affirmation fausse ». Quarante-quatre
 * compétences enchaînaient donc les mêmes gestes — alors que la compétence pilote, elle, emploie
 * quatre mécaniques graphiques que plus aucun module n'utilisait.
 *
 * Ce verrou mesure la variété réellement offerte, pour qu'elle ne puisse plus retomber en silence.
 * Il ne dit PAS « chaque compétence doit tout employer » : une mécanique doit servir le contenu,
 * jamais l'inverse. Il dit : le corpus guidé ne peut pas se réduire à une seule façon de demander.
 */

const GUIDED_SKILL_IDS = CONTENT_MODULES.flatMap((m) => m.skills.map((s) => s.id)).filter((id) =>
  Object.prototype.hasOwnProperty.call(SKILL_CONCEPT_ID, id),
);

/** Les leçons LIBRES historiques (`module.foundations`), antérieures au modèle de scénario. */
const FONDATIONS = ['skill.actions', 'skill.trend', 'skill.candles', 'skill.patterns'];

/** Formats d'exercice réellement employés par les compétences guidées. */
function formatsUtilises(): Set<ExerciseType> {
  const out = new Set<ExerciseType>();
  for (const id of GUIDED_SKILL_IDS) for (const ex of getExercises(id)) out.add(ex.type);
  return out;
}

/** Formats employés pour une nature d'objectif donnée, sur tout le corpus guidé. */
function formatsParNature(kind: ObjectiveKind): Set<ExerciseType> {
  const out = new Set<ExerciseType>();
  for (const id of GUIDED_SKILL_IDS) {
    for (const ex of getExercises(id)) {
      const parsed = ex.target ? parseObjectiveId(ex.target.objectiveId) : null;
      if (parsed?.kind === kind) out.add(ex.type);
    }
  }
  return out;
}

describe('LOT D2 — la variété des mécaniques du parcours guidé', () => {
  it('tout format employé est un format DÉCLARÉ (aucun player fantôme)', () => {
    for (const type of formatsUtilises()) {
      expect(EXERCISE_FORMAT_REGISTRY[type]).toBeDefined();
      expect(EXERCISE_FORMAT_REGISTRY[type].status).toBe('live');
    }
  });

  it('le parcours guidé emploie au moins neuf façons différentes de demander', () => {
    // Avant le LOT D2 : cinq (reconnaissance de figure, remise en ordre, scénario, trouve l'erreur,
    // placement). Le LOT D3 y ajoute la réponse NUMÉRIQUE, là où la compétence consiste justement à
    // poser un calcul. Le plafond de treize n'est PAS un objectif : `true_false` et `match` n'ont
    // pas encore de contenu qui les justifie honnêtement dans les modules guidés.
    expect(formatsUtilises().size).toBeGreaterThanOrEqual(9);
  });

  it('le monde Risque fait CALCULER : un ratio et une taille ne se cochent pas', () => {
    // LOT D3 — c'est le seul monde dont les notions ont une réponse chiffrée. Avant ce lot, on
    // pouvait « savoir » gérer son risque sans jamais poser une opération.
    for (const id of ['skill.risk.reward', 'skill.risk.sizing']) {
      expect(getExercises(id).map((e) => e.type)).toContain('numeric');
    }
    // Et le calcul reste réservé aux compétences dont la réponse EST un nombre. Ailleurs, un champ
    // numérique n'enseignerait rien.
    //
    // LOT C8 — la liste s'ouvre au monde 1 : le rendement du dividende (2 ÷ 50) et le PER (36 ÷ 3)
    // sont les deux seules notions du corpus dont la définition EST une division. Elles ne se
    // lisent sur aucun graphique ; sans poser l'opération une fois, on ne comprend pas pourquoi un
    // rendement élevé ou un PER bas peuvent tromper — c'est le DÉNOMINATEUR qui a bougé.
    // « skill.actions » portait déjà un calcul (une part du capital) avant le LOT D3.
    //
    // LOT G1 — la moyenne mobile rejoint la liste pour la même raison, et pour une de plus : sa
    // définition EST une opération (une somme divisée par un nombre), et cette opération donne à
    // voir le retard mieux qu'aucune phrase. Six clôtures montant de 40 à 50 produisent une ligne à
    // 45 : cinq points sous le dernier prix, et ces cinq points ne viennent que du calcul.
    const avecCalcul = GUIDED_SKILL_IDS.filter((id) =>
      getExercises(id).some((e) => e.type === 'numeric'),
    ).sort();
    expect(avecCalcul).toEqual([
      'skill.actions',
      'skill.foundations.dividend',
      'skill.foundations.per',
      'skill.indicators.moving-average',
      'skill.risk.reward',
      'skill.risk.sizing',
    ]);
  });

  it('« reconnaître » n’est plus une seule et même question répétée', () => {
    // Reconnaître une figure de catalogue, lire le sens d'une série quelconque, identifier ce qu'un
    // repère désigne, situer un extrême au doigt ou poser un niveau : ce sont des gestes distincts.
    const formats = formatsParNature('recognize');
    expect(formats.size).toBeGreaterThanOrEqual(4);
    expect(formats).toContain('identify_pattern'); // lecture d'un VRAI graphique
  });

  it('au moins trois natures d’objectif offrent plusieurs mécaniques', () => {
    const NATURES: ObjectiveKind[] = ['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal'];
    const variees = NATURES.filter((k) => formatsParNature(k).size >= 2);
    expect(variees.length).toBeGreaterThanOrEqual(3);
  });

  it('les mécaniques graphiques servent les mondes où le graphique EST le sujet', () => {
    // Elles ne sont pas saupoudrées : elles sont là où lire un graphique est la compétence même.
    const AVEC_LECTURE_REELLE = [
      'skill.structure.uptrend',
      'skill.structure.downtrend',
      'skill.structure.range',
      'skill.anatomy.candle',
      'skill.anatomy.scale',
      'skill.sr.zones',
    ];
    const GRAPHIQUES: ExerciseType[] = [
      'identify_pattern',
      'label_chart',
      'select_chart_zone',
      'place_invalidation',
    ];
    for (const id of AVEC_LECTURE_REELLE) {
      const types = getExercises(id).map((e) => e.type);
      expect(types.some((t) => GRAPHIQUES.includes(t))).toBe(true);
    }
  });

  it('une compétence de module guidé ne dépasse pas six questions : la variété ne rallonge pas les sessions', () => {
    // La variété vient de la ROTATION entre visites (le pool tourne), pas de l'allongement.
    for (const id of GUIDED_SKILL_IDS.filter((id) => !FONDATIONS.includes(id))) {
      expect(getExercises(id).length).toBeLessThanOrEqual(6);
    }
  });

  it('les trois leçons libres historiques restent plus longues — dette mesurée, pas masquée', () => {
    // `module.foundations` est antérieur au modèle de scénario : ses exercices sont rédigés à la
    // main, et ses trois compétences dépassent la fourchette « deux à cinq questions » du canon.
    // Ce test ne le corrige pas (raccourcir est une décision éditoriale, pas technique) : il fige
    // les longueurs RÉELLES pour que la dette reste visible et ne grossisse pas en silence.
    expect(FONDATIONS.map((id) => [id, getExercises(id).length])).toEqual([
      ['skill.actions', 10],
      ['skill.trend', 7],
      ['skill.candles', 6],
      ['skill.patterns', 9],
    ]);
  });
});
