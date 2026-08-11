/**
 * LOT C1 — « Pourquoi ce statut, et qu'est-ce que je fais maintenant ? » — noyau PUR et testable.
 *
 * Le canon impose d'« afficher la raison d'un verrou et la prochaine action permettant de l'ouvrir ».
 * La machine de maîtrise stricte (`conceptMasteryState`) sait déjà parfaitement pourquoi un concept
 * est bloqué — `masteryGate` calcule `representative`, `explored`, `trained`, `coverageComplete` et
 * `checkpointPassed` — mais **rien n'exposait cette raison à l'apprenant**. Il voyait un statut, et
 * pour un tiers du corpus ce statut ne pouvait jamais bouger, sans un mot d'explication.
 *
 * Le cas le plus lourd, mesuré : **22 fiches sur 67** partagent le `skillId` d'une leçon libre sans
 * en être le concept représentatif. Le garde-fou P0 les plafonne donc à « Découvert » — c'est une
 * décision voulue (fin de la maîtrise héritée), pas un oubli. Mais sa conséquence n'avait jamais été
 * traitée côté écran : un apprenant appliqué pouvait croire à son propre échec.
 *
 * Ce module ne change AUCUNE règle de maîtrise. Il traduit l'état déjà calculé en une phrase et,
 * quand elle existe, en une action réelle — une compétence guidée qui entraîne vraiment la famille
 * de la notion. Tout est DÉRIVÉ des registres : rien n'est écrit fiche par fiche.
 */
import type { LearningConcept } from './learningConcept';
import { masteryGate, type ConceptStateInput } from './conceptMasteryState';
import { ALL_MODULE_SKILLS, SKILL_CONCEPT_ID, skillById } from './seed';
import { V5_CONCEPTS } from './learningContent';

/** Ce qui empêche, à cet instant, le concept d'avancer vers la maîtrise. */
export type MasteryBlocker =
  /** Rien : le concept est maîtrisé. */
  | 'none'
  /** La fiche n'a pas encore été ouverte. */
  | 'not-explored'
  /** Aucun objectif entraîné pour l'instant. */
  | 'not-trained'
  /** Des objectifs restent à prouver. */
  | 'coverage-incomplete'
  /** Tout est prouvé, il reste le point de contrôle indépendant. */
  | 'checkpoint-pending'
  /** Le concept n'a pas de compétence guidée à lui : plafond « Découvert » assumé. */
  | 'library-only';

/** Action réelle proposée : une compétence guidée qui existe et se joue. */
export interface NextStepAction {
  /** Libellé de la compétence, tel que le registre le nomme (jamais réinventé ici). */
  label: string;
  /** Identifiant de la compétence — la route de session s'en déduit. */
  skillId: string;
}

export interface ConceptNextStep {
  blocker: MasteryBlocker;
  /** La raison, en une phrase, dans les mots de l'apprenant. */
  reason: string;
  /** Ce qu'il peut faire maintenant. `null` seulement quand il n'y a rien à faire. */
  action: NextStepAction | null;
}

/**
 * Compétence guidée qui entraîne un concept donné — dérivée de la carte canonique
 * compétence → concept. Une compétence par concept représentatif ; l'ordre du registre tranche les
 * rares doublons, de façon déterministe.
 */
function guidedSkillForConcept(conceptId: string): string | undefined {
  // Une notion peut être revendiquée à la fois par une leçon LIBRE historique (`skill.candles`,
  // `skill.patterns`, `skill.trend`, `skill.actions`) et par la compétence guidée qui l'entraîne
  // vraiment. On envoie toujours vers la compétence guidée : c'est elle qui fait progresser.
  const guided = ALL_MODULE_SKILLS.filter((s) => SKILL_CONCEPT_ID[s.id] === conceptId);
  const horsLeconsLibres = guided.filter((s) => !FREE_LESSON_SKILLS.includes(s.id));
  return (horsLeconsLibres[0] ?? guided[0])?.id;
}

/** Leçons libres historiques (`module.foundations`), antérieures au modèle de scénario. */
const FREE_LESSON_SKILLS = ['skill.actions', 'skill.trend', 'skill.candles', 'skill.patterns'];

/** Compétences guidées du même monde, dans l'ordre du parcours. */
function guidedSkillsInWorld(worldId: string): string[] {
  const out: string[] = [];
  for (const skill of ALL_MODULE_SKILLS) {
    const cid = SKILL_CONCEPT_ID[skill.id];
    if (!cid) continue;
    const concept = V5_CONCEPTS.find((c) => c.id === cid);
    if (concept?.worldId === worldId) out.push(skill.id);
  }
  return out;
}

function actionFor(skillId: string | undefined): NextStepAction | null {
  if (!skillId) return null;
  const skill = skillById(skillId);
  return skill ? { label: skill.name, skillId } : null;
}

/**
 * Vers quelle compétence guidée envoyer l'apprenant depuis une fiche de bibliothèque.
 *
 * Deux chemins, dans cet ordre, tous deux DÉRIVÉS de données déjà rédigées et validées :
 *  1. **les notions liées de la fiche** (`relatedConceptIds`, écrites par l'éditeur) — c'est la
 *     parenté que le contenu déclare lui-même : le pendu renvoie au marteau, le double sommet au
 *     double creux ;
 *  2. à défaut, **la première compétence guidée du même monde** — la famille reste la bonne, même
 *     si la fiche n'a pas déclaré de parenté.
 */
export function guidedSkillToDiscover(concept: LearningConcept): string | undefined {
  for (const relatedId of concept.relatedConceptIds ?? []) {
    const skillId = guidedSkillForConcept(relatedId);
    if (skillId) return skillId;
  }
  return guidedSkillsInWorld(concept.worldId)[0];
}

/**
 * Raison + prochaine action pour un concept, à partir de l'état réellement calculé.
 * Aucune règle de maîtrise n'est décidée ici : `masteryGate` reste la seule autorité.
 */
export function conceptNextStep(concept: LearningConcept, input: ConceptStateInput): ConceptNextStep {
  const gate = masteryGate(concept, input);

  // 1. Le plafond assumé : la fiche n'a pas de compétence à elle. On le DIT, et on propose la
  //    compétence qui entraîne vraiment sa famille — plutôt que de laisser un statut immobile.
  if (!gate.representative) {
    const action = actionFor(guidedSkillToDiscover(concept));
    return {
      blocker: 'library-only',
      reason: action
        ? 'Cette notion s’explore dans la bibliothèque : elle n’a pas encore d’exercices à elle, donc son statut s’arrête à « Découvert ». Sa famille, elle, s’entraîne.'
        : 'Cette notion s’explore dans la bibliothèque : elle n’a pas encore d’exercices à elle, donc son statut s’arrête à « Découvert ».',
      action,
    };
  }

  const own = actionFor(guidedSkillForConcept(concept.id));

  if (!gate.explored) {
    return {
      blocker: 'not-explored',
      reason: 'Ouvre la fiche et lis-la : c’est le point de départ, jamais la preuve.',
      action: own,
    };
  }
  if (!gate.trained) {
    return {
      blocker: 'not-trained',
      reason: 'Tu as lu la notion. Une visite n’est pas une maîtrise : il faut maintenant l’exercer.',
      action: own,
    };
  }
  if (!gate.coverageComplete) {
    return {
      blocker: 'coverage-incomplete',
      reason: 'Tous les objectifs de la notion ne sont pas encore prouvés — reconnaître ne suffit pas, il faut aussi confirmer et invalider.',
      action: own,
    };
  }
  if (!gate.checkpointPassed) {
    return {
      blocker: 'checkpoint-pending',
      reason: 'Tous les objectifs sont prouvés. Il reste le point de contrôle du monde, qui vérifie sans indice.',
      action: own,
    };
  }
  return {
    blocker: 'none',
    reason: 'Notion maîtrisée : objectifs prouvés dans le temps et point de contrôle réussi.',
    action: null,
  };
}
