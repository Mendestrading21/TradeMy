/**
 * LOT 4-M — Garde-fous du module guidé « Lire les chandeliers » (world.candles).
 *
 * Réplique, pour ce 2e module réel, la rigueur de l'unité pilote : câblage, couverture d'objectifs
 * RÉELS (jamais inventés), mécaniques distinctes, gradabilité, cohérence figure/dataset, cohérence du
 * placement d'invalidation, checkpoint propre, et absence totale de vocabulaire BUY/SELL ou de
 * promesse de gain.
 */
import { describe, it, expect } from '@jest/globals';
import {
  CANDLE_SKILLS,
  CANDLE_CHECKPOINT_ID,
  CANDLE_SKILL_CONCEPT_ID,
  CANDLE_MODULE_SCENARIOS,
  CANDLE_MODULE_SCENARIOS_BY_SKILL,
  CANDLE_MODULE_EXERCISES_BY_SKILL,
} from './candleModuleScenarios';
import { getExercises, exercisableObjectiveIds, checkpointExercises, isCheckpoint } from './seed';
import { objectiveId, parseObjectiveId, objectiveByIdIn, objectivesForConcept, type ObjectiveKind } from './learningTarget';
import { V5_CONCEPTS } from './learningContent';
import { conceptsByWorld } from './learningConcept';
import { scenarioInteractionTypes, gradeExercise, lowestLow, highestHigh } from '../engines/exercise';
import { generateCandles } from '../engines/pattern/demoChart';
import { VISUAL_DATASETS } from '../engines/visual/visualDatasets';

/**
 * Objectifs RÉELS de chaque concept du module. LOT D1 : cette attente est DÉRIVÉE de la fiche
 * elle-même (`objectivesForConcept`) au lieu d'être écrite en dur — une liste figée avait laissé
 * passer l'enrichissement du LOT E3 sans que les exercices suivent.
 */
const MODULE_CONCEPT_IDS = [
  'concept.marubozu',
  'concept.hammer',
  'concept.doji',
  'concept.bullish-engulfing',
  // LOT C2 — la figure miroir : cette fiche de bibliothèque devient une compétence entraînable.
  'concept.bearish-engulfing',
  // LOT C4 — la même FORME, l'autre histoire (contexte, pas direction).
  'concept.hanging-man',
  'concept.shooting-star',
  'concept.inverted-hammer',
  // LOT C6 — la SÉQUENCE : trois bougies, et l'ordre décide.
  'concept.morning-star',
  'concept.three-white-soldiers',
  // LOT C9 — le RAPPORT entre deux bougies : contenance et niveau partagé.
  'concept.harami',
  'concept.tweezer',
];
const EXPECTED: Record<string, ObjectiveKind[]> = Object.fromEntries(
  MODULE_CONCEPT_IDS.map((id) => [
    id,
    objectivesForConcept(V5_CONCEPTS.find((c) => c.id === id)!).map((o) => o.kind),
  ]),
);

const ALL_EXERCISES = Object.values(CANDLE_MODULE_EXERCISES_BY_SKILL).flat();

describe('Module guidé « Lire les chandeliers » — modèle officiel (world.candles)', () => {
  it('câblage : chaque compétence expose les exercices DÉRIVÉS de ses scénarios', () => {
    for (const s of CANDLE_SKILLS) {
      expect(getExercises(s.id)).toEqual(CANDLE_MODULE_EXERCISES_BY_SKILL[s.id]);
      expect(getExercises(s.id).length).toBeGreaterThanOrEqual(3);
    }
    expect(ALL_EXERCISES.length).toBe(CANDLE_MODULE_SCENARIOS.length);
    // LOT C2 : 19 → 24. LOT C4 : 24 → 39 (trois compétences de plus, cinq objectifs réels chacune).
    // LOT C6 : 39 → 49 (deux compétences de séquence, cinq objectifs réels chacune).
    // LOT C9 : 49 → 59 (harami et pincettes, cinq objectifs réels chacun).
    expect(ALL_EXERCISES.length).toBe(59);
  });

  it('chaque compétence cible un concept RÉEL de world.candles', () => {
    const candleIds = new Set(conceptsByWorld(V5_CONCEPTS, 'world.candles').map((c) => c.id));
    for (const s of CANDLE_SKILLS) {
      const cid = CANDLE_SKILL_CONCEPT_ID[s.id];
      expect(candleIds.has(cid)).toBe(true);
    }
  });

  it('couvre uniquement des OBJECTIFS RÉELS ; le doji (sans invalidation documentée) n’a pas d’exo d’invalidation', () => {
    for (const [cid, kinds] of Object.entries(EXPECTED)) {
      const covered = new Set(exercisableObjectiveIds(cid));
      expect(covered).toEqual(new Set(kinds.map((k) => objectiveId(cid, k))));
      // Aucun objectif ciblé n’est orphelin : il se résout dans le modèle canonique.
      for (const oid of covered) expect(objectiveByIdIn(V5_CONCEPTS, oid)).toBeDefined();
    }
    // Honnêteté du modèle : le doji ne documente pas d’invalidation → aucune cible d’invalidation.
    expect(exercisableObjectiveIds('concept.doji')).not.toContain(objectiveId('concept.doji', 'invalidate'));
  });

  it('le module couvre les 5 natures d’objectif (recognize → interpret → confirm → invalidate → avoid-false-signal)', () => {
    const kinds = new Set<string>();
    for (const ex of ALL_EXERCISES) {
      const parsed = ex.target ? parseObjectiveId(ex.target.objectiveId) : null;
      if (parsed) kinds.add(parsed.kind);
    }
    expect(kinds).toEqual(new Set(['recognize', 'interpret', 'confirm', 'invalidate', 'avoid-false-signal']));
  });

  it('mécaniques réellement distinctes : 5 types d’exercice, dont placement et réorganisation (pas que des QCM)', () => {
    const types = new Set(ALL_EXERCISES.map((e) => e.type));
    expect(types).toEqual(new Set(['identify_figure', 'order', 'scenario', 'place_invalidation', 'find_error']));
    // Chaque compétence propose au moins 3 interactions réellement différentes.
    for (const s of CANDLE_SKILLS) {
      const kinds = scenarioInteractionTypes(CANDLE_MODULE_SCENARIOS_BY_SKILL[s.id]);
      expect(kinds.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('chaque exercice se corrige (une bonne réponse existe et est acceptée par le grader réel)', () => {
    for (const ex of ALL_EXERCISES) {
      let answer: unknown;
      switch (ex.type) {
        case 'identify_figure': answer = ex.validation.correctIndex; break;
        case 'scenario': answer = ex.validation.correctIndex; break;
        case 'find_error': answer = ex.validation.errorIndex; break;
        case 'order': answer = ex.validation.correctOrder; break;
        case 'place_invalidation': answer = ex.validation.targetPrice; break;
        default: throw new Error(`type inattendu: ${ex.type}`);
      }
      expect(gradeExercise(ex, answer).correct).toBe(true);
    }
  });

  it('cohérence figure : chaque reconnaissance montre un dataset RÉEL et le variant de sa fiche', () => {
    const figures = ALL_EXERCISES.filter((e) => e.type === 'identify_figure');
    expect(figures.length).toBe(12); // une reconnaissance par compétence du module.
    for (const ex of figures) {
      if (ex.type !== 'identify_figure') continue;
      expect(VISUAL_DATASETS[ex.datasetKey]).toBeDefined();
      // Le variant coïncide avec le visualSpec du concept cible (même figure rendue).
      const concept = V5_CONCEPTS.find((c) => c.id === ex.target?.conceptId)!;
      expect(concept.visualSpec?.variant).toBe(ex.variant);
      expect(concept.visualSpec?.datasetKey).toBe(ex.datasetKey);
    }
  });

  it('cohérence invalidation : la cible placée EST l’extrême RÉEL, du bon côté du graphique', () => {
    const places = ALL_EXERCISES.filter((e) => e.type === 'place_invalidation');
    // LOT C4 puis C6 puis C9 — même verrou que le monde des figures, et même leçon : l'invalidation
    // se place du côté OPPOSÉ au sens du setup. Dix placements : six setups haussiers invalidés vers
    // le BAS (marubozu, marteau, avalement haussier, marteau inversé, étoile du matin, trois
    // soldats) et quatre baissiers vers le HAUT (avalement baissier, pendu, étoile filante,
    // pincettes de sommet).
    expect(places.length).toBe(10);
    const versLeHaut = places.filter((ex) => (ex.hint ?? '').includes('plus haut'));
    expect(versLeHaut).toHaveLength(4);
    // LOT C9 — le HARAMI est NEUTRE : comme le triangle symétrique du LOT C7, il n'a pas de côté,
    // donc aucun placement. Son invalidation est un COMPORTEMENT (la tendance d'origine repart).
    const conceptsPlacés = new Set(places.map((ex) => ex.target?.conceptId));
    expect(conceptsPlacés.has('concept.harami')).toBe(false);
    expect(conceptsPlacés.has('concept.tweezer')).toBe(true);
    for (const ex of places) {
      if (ex.type !== 'place_invalidation') continue;
      expect(ex.hint).toBeTruthy();
      const candles = generateCandles(ex.chartSeed, 30);
      const haut = (ex.hint ?? '').includes('plus haut');
      expect(ex.validation.targetPrice).toBe(haut ? highestHigh(candles) : lowestLow(candles));
      expect(ex.validation.tolerance).toBeGreaterThan(0);
    }
  });

  it('checkpoint PROPRE au module : reconnu, non vide, et composé des compétences Chandeliers', () => {
    expect(isCheckpoint(CANDLE_CHECKPOINT_ID)).toBe(true);
    const cp = checkpointExercises(CANDLE_CHECKPOINT_ID, 0, 2);
    expect(cp.length).toBeGreaterThan(0);
    const skillIds = new Set(cp.map((e) => e.skillId));
    for (const id of skillIds) expect(id.startsWith('skill.candle.')).toBe(true);
    // La revue mélange plusieurs compétences du module (pas une seule).
    expect(skillIds.size).toBeGreaterThanOrEqual(2);
  });

  // ── LOT C6 — la SÉQUENCE. Ces trois tests prouvent que le lot enseigne bien une idée neuve, et
  //    que ses deux compétences ne sont pas des copies l'une de l'autre.
  describe('LOT C6 — trois bougies, et l’ordre décide', () => {
    const SEQUENCE_SKILLS = ['skill.candle.sequence-reversal', 'skill.candle.sequence-momentum'];

    it('les deux compétences de séquence existent, portent 5 exercices chacune, et ciblent la figure de leur fiche', () => {
      for (const id of SEQUENCE_SKILLS) {
        expect(CANDLE_SKILLS.some((s) => s.id === id)).toBe(true);
        expect(CANDLE_MODULE_EXERCISES_BY_SKILL[id]).toHaveLength(5);
        // Une compétence = UN concept : l'invariante du corpus, respectée ici aussi.
        const ciblés = new Set(CANDLE_MODULE_EXERCISES_BY_SKILL[id].map((e) => e.target?.conceptId));
        expect(ciblés.size).toBe(1);
        expect([...ciblés][0]).toBe(CANDLE_SKILL_CONCEPT_ID[id]);
      }
    });

    it('la lecture ORDONNÉE porte réellement sur les trois temps — pas sur la forme d’une bougie', () => {
      for (const id of SEQUENCE_SKILLS) {
        const ordre = CANDLE_MODULE_EXERCISES_BY_SKILL[id].find((e) => e.type === 'order');
        expect(ordre).toBeDefined();
        if (ordre?.type !== 'order') throw new Error('exercice `order` attendu');
        // Quatre temps énoncés : les trois bougies, puis ce qu'on attend ensuite.
        expect(ordre.items).toHaveLength(4);
        // La bonne réponse est l'ordre chronologique : c'est justement ce qui est enseigné.
        expect(ordre.validation.correctOrder).toEqual([0, 1, 2, 3]);
      }
    });

    it('chaque énoncé de séquence est DÉRIVÉ de la fiche : confirmation, invalidation et faux signal s’y retrouvent', () => {
      const attendus: Record<string, { conceptId: string; confirme: RegExp; invalide: RegExp }> = {
        // « Au-dessus du plus haut de la troisième bougie. » / « Clôture sous le plus bas de la figure. »
        'skill.candle.sequence-reversal': {
          conceptId: 'concept.morning-star',
          confirme: /plus haut de la troisième/i,
          invalide: /plus bas de la (figure|FIGURE)/i,
        },
        // « Au-dessus de la clôture de la troisième bougie. » / « Clôture sous le corps de la première des trois. »
        'skill.candle.sequence-momentum': {
          conceptId: 'concept.three-white-soldiers',
          confirme: /clôture de la troisième/i,
          invalide: /corps de la (première|PREMIÈRE)/i,
        },
      };
      for (const [skillId, attendu] of Object.entries(attendus)) {
        const fiche = V5_CONCEPTS.find((c) => c.id === attendu.conceptId)!;
        // La fiche déclare bien ces deux champs — sinon l'exercice serait inventé.
        expect(fiche.confirmationZone).toBeTruthy();
        expect(fiche.invalidation).toBeTruthy();
        const textes = CANDLE_MODULE_EXERCISES_BY_SKILL[skillId]
          .map((e) => [e.prompt, e.feedback.rule ?? '', e.feedback.whenItFails ?? '', e.feedback.correct].join(' '))
          .join(' ');
        expect(textes).toMatch(attendu.confirme);
        expect(textes).toMatch(attendu.invalide);
      }
    });
  });

  // ── LOT C9 — le RAPPORT entre deux bougies. Ces tests prouvent que la relation est bien la chose
  //    enseignée, et que le harami neutre est traité comme le triangle symétrique du LOT C7.
  describe('LOT C9 — la relation entre deux bougies', () => {
    it('les deux compétences existent, portent 5 exercices, et ciblent la fiche annoncée', () => {
      for (const id of ['skill.candle.containment', 'skill.candle.twin-level']) {
        expect(CANDLE_SKILLS.some((s) => s.id === id)).toBe(true);
        expect(CANDLE_MODULE_EXERCISES_BY_SKILL[id]).toHaveLength(5);
        const ciblés = new Set(CANDLE_MODULE_EXERCISES_BY_SKILL[id].map((e) => e.target?.conceptId));
        expect(ciblés.size).toBe(1);
        expect([...ciblés][0]).toBe(CANDLE_SKILL_CONCEPT_ID[id]);
      }
    });

    it('le CORPUS dit que le harami est neutre — d’où l’absence de placement, comme au LOT C7', () => {
      const harami = V5_CONCEPTS.find((c) => c.id === 'concept.harami')!;
      expect(harami.visualSpec?.direction).toBe('neutral');
      // Sa fiche déclare bien une invalidation, mais c'est un COMPORTEMENT, pas un extrême.
      expect(harami.invalidation).toBeTruthy();
      const items = CANDLE_MODULE_EXERCISES_BY_SKILL['skill.candle.containment'];
      expect(items.some((e) => e.type === 'place_invalidation')).toBe(false);
      // L'objectif reste COUVERT : il passe par un scénario conditionnel, jamais escamoté.
      const invalidate = items.find((e) => e.target?.objectiveId.endsWith('::invalidate'));
      expect(invalidate?.type).toBe('scenario');
    });

    it('chaque énoncé est DÉRIVÉ de sa fiche : confirmation et invalidation s’y retrouvent', () => {
      const attendus: Record<string, { conceptId: string; confirme: RegExp; invalide: RegExp }> = {
        // « À la sortie de la petite bougie » / « Poursuite nette de la tendance d'origine »
        'skill.candle.containment': {
          conceptId: 'concept.harami',
          confirme: /sortie de la petite bougie/i,
          invalide: /tendance d’origine/i,
        },
        // « À la sortie du niveau » / « Franchissement franc du niveau testé »
        'skill.candle.twin-level': {
          conceptId: 'concept.tweezer',
          confirme: /sortie du niveau/i,
          invalide: /franchissement franc/i,
        },
      };
      for (const [skillId, attendu] of Object.entries(attendus)) {
        const fiche = V5_CONCEPTS.find((c) => c.id === attendu.conceptId)!;
        expect(fiche.confirmationZone).toBeTruthy();
        expect(fiche.invalidation).toBeTruthy();
        const textes = CANDLE_MODULE_EXERCISES_BY_SKILL[skillId]
          .map((e) => [e.prompt, e.feedback.rule ?? '', e.feedback.whenItFails ?? '', e.feedback.correct].join(' '))
          .join(' ');
        expect(textes).toMatch(attendu.confirme);
        expect(textes).toMatch(attendu.invalide);
      }
    });
  });

  it('aucun exercice ne contient BUY/SELL ni promesse de gain', () => {
    const forbidden = /\b(buy|sell|profit garanti|gain garanti|trade gagnant|signal sûr|liberté financière garantie)\b/i;
    for (const ex of ALL_EXERCISES) {
      const bag = [ex.prompt, ex.feedback.correct, ex.feedback.incorrect, ex.feedback.rule ?? '', ex.feedback.whenItFails ?? ''];
      if (ex.type === 'order') bag.push(...ex.items);
      if (ex.type === 'find_error') bag.push(...ex.statements);
      if (ex.type === 'scenario') bag.push(ex.context, ...ex.options);
      if (ex.type === 'identify_figure') bag.push(...ex.options);
      expect(bag.join(' ')).not.toMatch(forbidden);
    }
  });
});
