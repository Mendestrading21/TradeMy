/**
 * @jest-environment node
 *
 * Test d'INTÉGRATION de PRODUCTION du parcours pilote : on monte l'ÉCRAN DE SESSION RÉEL
 * (`app/session/[skillId].tsx`) dans le `ProgressProvider` RÉEL, avec l'orchestrateur Toto/Bobo réel
 * (LOT 2), le dépôt de reprise réel (AsyncStorage) et les handlers de progression réels. On clique les
 * VRAIS contrôles ; le grader, le feedback, la mascotte (via l'orchestrateur), la progression et la
 * persistance sont ceux de l'application. Aucune boucle de session reconstruite.
 *
 * Mocks d'INFRASTRUCTURE uniquement (autour des composants de production), car Reanimated 4 (worklets
 * natifs) et expo-router ne tournent pas sous jest :
 *   - react-native-reanimated → animations statiques (le sprite ne bouge pas, l'arbre est réel) ;
 *   - expo-router → paramètre de route + routeur capturé ;
 *   - react-native-safe-area-context / expo-image → conteneurs passifs ;
 *   - @/lib/connectivity → en ligne (contrôlable).
 * Aucune dépendance ajoutée (react-test-renderer est fourni par jest-expo).
 */
/* eslint-disable @typescript-eslint/no-require-imports, import/first -- les fabriques jest.mock sont
   hissées au-dessus des imports et utilisent require() (contrainte du moteur de mocks jest). */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { create, act, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { createElement } from 'react';

jest.mock('react-native-reanimated', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: { View, Text, createAnimatedComponent: (c: unknown) => c },
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withTiming: (v: unknown) => v,
    withSpring: (v: unknown) => v,
    withSequence: (...a: unknown[]) => a[a.length - 1],
    withRepeat: (v: unknown) => v,
    withDelay: (_d: unknown, v: unknown) => v,
    cancelAnimation: () => {},
    Easing: { linear: (x: number) => x, inOut: () => (x: number) => x, ease: (x: number) => x },
    interpolate: () => 0,
    runOnJS: (fn: unknown) => fn,
  };
});
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  const strip = ({ children, style }: { children?: unknown; style?: unknown }) =>
    React.createElement(View, { style }, children);
  return {
    __esModule: true,
    SafeAreaProvider: ({ children }: { children?: unknown }) => children,
    SafeAreaView: strip,
    SafeAreaConsumer: ({ children }: { children: (i: unknown) => unknown }) => children(insets),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    SafeAreaInsetsContext: React.createContext(insets),
    initialWindowMetrics: { insets, frame },
  };
});
jest.mock('expo-image', () => ({ __esModule: true, Image: require('react-native').View }));
jest.mock('@/lib/connectivity', () => ({
  __esModule: true,
  useConnectivity: () => (globalThis as Record<string, unknown>).__online ?? true,
}));
jest.mock('expo-router', () => {
  const state: { params: Record<string, unknown>; calls: unknown[][] } = { params: { skillId: 'skill.candles' }, calls: [] };
  return {
    __esModule: true,
    __state: state,
    useLocalSearchParams: () => state.params,
    useRouter: () => ({
      push: (...a: unknown[]) => state.calls.push(['push', ...a]),
      replace: (...a: unknown[]) => state.calls.push(['replace', ...a]),
      back: () => {},
      navigate: () => {},
    }),
    useFocusEffect: () => {},
    Link: ({ children }: { children?: unknown }) => children ?? null,
    Stack: { Screen: () => null },
  };
});

import Session, { remediationVariant } from '@/app/session/[skillId]';
import { ProgressProvider, getExercises, rotateExercises, limitCount, CHECKPOINT_ID, CANDLE_CHECKPOINT_ID, checkpointExercises } from '@/data';
import { objectiveId } from '@/data/learningTarget';
import { isObjectiveProven } from '@/data/targetProgress';
import { PILOT_CANDLE_CONCEPT_ID } from '@/data/pilotScenarios';
import { progressRepository } from '@/data/repositories';
import type { Exercise } from '@/engines/exercise';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoRouter from 'expo-router';

const routerState = (ExpoRouter as unknown as { __state: { params: Record<string, unknown>; calls: unknown[][] } }).__state;
const C = PILOT_CANDLE_CONCEPT_ID;

// ── Helpers d'inspection/interaction de l'arbre RÉEL ──
function textOf(inst: ReactTestInstance): string {
  const out: string[] = [];
  const visit = (n: ReactTestInstance | string) => {
    if (typeof n === 'string') return void out.push(n);
    for (const c of n.children) visit(c);
  };
  for (const c of inst.children) visit(c);
  return out.join(' ');
}
function pressables(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.onPress === 'function', { deep: true });
}
function a11yLabels(root: ReactTestInstance): string[] {
  return root
    .findAll((n) => typeof n.props?.accessibilityLabel === 'string', { deep: true })
    .map((n) => String(n.props.accessibilityLabel));
}
async function flush(): Promise<void> {
  for (let i = 0; i < 8; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}
async function tapText(root: ReactTestInstance, text: string): Promise<void> {
  const b = pressables(root).find((n) => textOf(n).includes(text));
  if (!b) throw new Error(`Aucun contrôle rendu ne contient « ${text} »`);
  act(() => (b.props.onPress as () => void)());
  await flush();
}
function tapLabelSync(root: ReactTestInstance, labelIncludes: string): void {
  const b = pressables(root).find((n) => String(n.props.accessibilityLabel ?? '').includes(labelIncludes));
  if (!b) throw new Error(`Aucun contrôle avec libellé « ${labelIncludes} »`);
  act(() => (b.props.onPress as () => void)());
}
function readOrder(root: ReactTestInstance, items: string[]): number[] {
  const byPos: string[] = [];
  for (const n of pressables(root)) {
    const m = String(n.props.accessibilityLabel ?? '').match(/^Monter « (.*) » \(position (\d+) sur \d+\)$/);
    if (m) byPos[Number(m[2]) - 1] = m[1];
  }
  return byPos.map((t) => items.indexOf(t));
}
async function mount(): Promise<{ root: ReactTestInstance; unmount: () => void }> {
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(createElement(ProgressProvider, null, createElement(Session)));
  });
  await flush();
  return {
    root: renderer.root,
    unmount: () => act(() => renderer.unmount()),
  };
}
/** Avance la phase Apprendre jusqu'à la pratique via les VRAIS boutons de l'écran. */
async function reachPractice(root: ReactTestInstance): Promise<void> {
  for (let i = 0; i < 20; i++) {
    if (/Exercice\s+\d+\s*\/\s*\d+/.test(textOf(root))) return;
    const start = pressables(root).find((n) => textOf(n).includes('Commencer les exercices'));
    if (start) {
      act(() => (start.props.onPress as () => void)());
      await flush();
      continue;
    }
    const next = pressables(root).find((n) => textOf(n).includes('Suivant'));
    if (next) {
      act(() => (next.props.onPress as () => void)());
      await flush();
      continue;
    }
    break;
  }
}
/** Répond correctement à l'exercice courant (connu par sa clé) via un contrôle réellement rendu. */
async function answerCorrect(root: ReactTestInstance, ex: Exercise): Promise<void> {
  switch (ex.type) {
    case 'identify_pattern':
    case 'label_chart':
    case 'identify_figure':
    case 'scenario':
    case 'mcq':
      await tapText(root, ex.options[ex.validation.correctIndex]);
      return;
    case 'true_false':
      await tapText(root, ex.validation.answer ? 'Vrai' : 'Faux');
      return;
    case 'find_error':
      await tapText(root, ex.statements[ex.validation.errorIndex]);
      return;
    case 'select_chart_zone':
      tapLabelSync(root, `Zone ${ex.validation.correctZone + 1} :`);
      await flush();
      return;
    case 'order': {
      const rank = (idx: number) => ex.validation.correctOrder.indexOf(idx);
      for (let g = 0; g <= ex.items.length ** 2 + 2; g++) {
        const cur = readOrder(root, ex.items);
        const pos = cur.findIndex((_, i) => i < cur.length - 1 && rank(cur[i]) > rank(cur[i + 1]));
        if (pos < 0) break;
        tapLabelSync(root, `Descendre « ${ex.items[cur[pos]]} » (position ${pos + 1} sur ${cur.length})`);
      }
      await tapText(root, 'Valider l’ordre');
      return;
    }
    case 'place_invalidation':
      for (let i = 0; i < 60; i++) tapLabelSync(root, 'Monter'); // clavier : remonte au plus haut (clampé)
      await flush();
      await tapText(root, 'Valider mon niveau');
      return;
    default:
      throw new Error(`type non géré: ${ex.type}`);
  }
}

/** Répond FAUX à l'exercice courant (checkpoint : types variés), via un contrôle réellement rendu. */
async function answerWrong(root: ReactTestInstance, ex: Exercise): Promise<void> {
  switch (ex.type) {
    case 'identify_pattern':
    case 'label_chart':
    case 'identify_figure':
    case 'scenario':
    case 'mcq':
      await tapText(root, ex.options[(ex.validation.correctIndex + 1) % ex.options.length]);
      return;
    case 'true_false':
      await tapText(root, ex.validation.answer ? 'Faux' : 'Vrai');
      return;
    case 'find_error':
      await tapText(root, ex.statements[(ex.validation.errorIndex + 1) % ex.statements.length]);
      return;
    case 'select_chart_zone':
      tapLabelSync(root, `Zone ${((ex.validation.correctZone + 1) % 3) + 1} :`);
      await flush();
      return;
    case 'order':
      await tapText(root, 'Valider l’ordre'); // ordre mélangé, non reconstitué → faux
      return;
    case 'place_invalidation':
      tapLabelSync(root, 'Descendre');
      await flush();
      await tapText(root, 'Valider mon niveau');
      return;
    default:
      throw new Error(`wrong non géré: ${ex.type}`);
  }
}
/**
 * Le résultat de production affiche-t-il la CÉLÉBRATION ? Elle est portée par la SCÈNE DE
 * PERSONNAGE accessible (état `celebrate-*`) et, depuis le LOT V2, doublée de la FIGURE 3D duo
 * « celebrate » (asset réparé — damier retiré des pixels), décorative, en cas de réussite seule.
 */
function hasCelebration(root: ReactTestInstance): boolean {
  return mascotStates(root).some((s) => s.startsWith('celebrate'));
}
/** La figure 3D duo « celebrate » (décorative) est-elle rendue sur l'écran de résultat ? */
function hasCelebrateFigure(root: ReactTestInstance): boolean {
  return root
    .findAll((n) => typeof n.props?.name === 'string' && typeof n.props?.gesture === 'string', { deep: true })
    .some((n) => n.props.name === 'celebrate' && n.props.gesture === 'celebrate');
}
/** États de mascotte rendus par les scènes de production (lecture du prop `state`). */
function mascotStates(root: ReactTestInstance): string[] {
  return root
    .findAll((n) => typeof n.props?.state === 'string' && typeof n.props?.character === 'string', { deep: true })
    .map((n) => String(n.props.state));
}

const PILOT_LIST = () => rotateExercises(getExercises('skill.candles'), limitCount(getExercises('skill.candles').length, null), 0);

beforeEach(async () => {
  await AsyncStorage.clear();
  routerState.params = { skillId: 'skill.candles' };
  routerState.calls.length = 0;
  (globalThis as Record<string, unknown>).__online = true;
});

describe('Écran de session RÉEL — parcours pilote de production', () => {
  it('leçon → pratique → erreur → Bobo (orchestrateur LOT 2) → réussite → progression PERSISTÉE', async () => {
    const { root, unmount } = await mount();
    await reachPractice(root);
    expect(textOf(root)).toMatch(/Exercice\s+1\s*\/\s*6/);

    const list = PILOT_LIST();
    const direction = list[0];
    if (direction.type !== 'identify_pattern') throw new Error('ex1 ≠ direction');

    // Mauvaise réponse cliquée sur l'écran réel.
    await tapText(root, direction.options[(direction.validation.correctIndex + 1) % 3]);

    // Orchestrateur de production : Bobo sélectionné, misconception RÉELLE portée par la scène mascotte.
    expect(a11yLabels(root).some((l) => l.includes('Bobo'))).toBe(true);
    expect(textOf(root)).toContain('Conclure sur une seule bougie'); // misconception 'tendance-une-bougie'
    // Navigation disponible (aucun blocage) : le bouton Continuer est opérant.
    expect(pressables(root).some((n) => textOf(n).includes('Continuer'))).toBe(true);
    await tapText(root, 'Continuer');

    // Réussir le reste de l'unité, via les vrais contrôles.
    for (let i = 1; i < list.length; i++) {
      await answerCorrect(root, list[i]);
      await tapText(root, i + 1 >= list.length ? 'Voir mon résultat' : 'Continuer');
    }

    // Écran de résultats de production : score affiché.
    expect(textOf(root)).toMatch(/\/\s*6/);

    // Progression RÉELLEMENT persistée par le store de production (AsyncStorage), pas un texte calculé.
    const saved = await progressRepository.load();
    const recognize = objectiveId(C, 'recognize');
    expect(saved).toBeTruthy();
    expect(saved!.targets![recognize]).toBeDefined(); // une transition par cible a été enregistrée
    expect(saved!.targets![recognize].review.repetitions).toBe(1); // recognize 2/3 → une seule transition
    expect(isObjectiveProven(saved!.targets![recognize])).toBe(false); // reps < 2 → AUCUNE maîtrise prématurée
    expect(saved!.skills['skill.candles']).toBeDefined(); // révision de compétence persistée
    expect(saved!.rotation?.['skill.candles']).toBe(1); // completeSession a avancé la rotation (persisté)
    unmount();
  });

  it('cible ENTIÈREMENT échouée → due immédiatement, aucune maîtrise, compétence non débloquée', async () => {
    const { root, unmount } = await mount();
    await reachPractice(root);
    const list = PILOT_LIST();
    const now = Date.now();
    // Tout faux : chaque cible échoue pour de bon.
    for (let i = 0; i < list.length; i++) {
      const ex = list[i];
      if (ex.type === 'identify_pattern' || ex.type === 'label_chart') {
        await tapText(root, ex.options[(ex.validation.correctIndex + 1) % ex.options.length]);
      } else if (ex.type === 'find_error') {
        await tapText(root, ex.statements[(ex.validation.errorIndex + 1) % ex.statements.length]);
      } else if (ex.type === 'select_chart_zone') {
        tapLabelSync(root, `Zone ${((ex.validation.correctZone + 1) % 3) + 1} :`);
        await flush();
      } else if (ex.type === 'order') {
        await tapText(root, 'Valider l’ordre'); // ordre mélangé, non reconstitué → faux
      } else if (ex.type === 'place_invalidation') {
        await tapText(root, 'Valider mon niveau'); // aucun niveau placé → bouton désactivé…
        // …si le bouton est désactivé, place un niveau clairement faux puis valide.
        if (pressables(root).some((n) => textOf(n).includes('Valider mon niveau'))) {
          tapLabelSync(root, 'Descendre');
          await flush();
          await tapText(root, 'Valider mon niveau');
        }
      }
      await tapText(root, i + 1 >= list.length ? 'Voir mon résultat' : 'Continuer');
    }
    const saved = await progressRepository.load();
    for (const kind of ['recognize', 'interpret', 'avoid-false-signal'] as const) {
      const t = saved!.targets![objectiveId(C, kind)];
      expect(t.review.repetitions).toBe(0); // remise à zéro
      expect(t.review.dueAt).toBeLessThanOrEqual(now + 2000); // due immédiatement
      expect(isObjectiveProven(t)).toBe(false); // aucune maîtrise
    }
    expect(saved!.completedSkills).not.toContain('skill.candles'); // échec ne débloque rien
    unmount();
  });

  it('checkpoint RÉEL : réussi → célébration proportionnelle ; échoué → aucune célébration', async () => {
    // Indépendance : la fenêtre du checkpoint tourne indépendamment de l'entraînement.
    expect(checkpointExercises(CHECKPOINT_ID, 0, 2)).not.toEqual(checkpointExercises(CHECKPOINT_ID, 1, 2));
    const cp = checkpointExercises(CHECKPOINT_ID, 0, 2);
    expect(new Set(cp.map((e) => e.skillId)).size).toBeGreaterThan(1); // agrège plusieurs compétences

    // ── Échec : tout faux → tier « à revoir », AUCUNE célébration. ──
    routerState.params = { skillId: CHECKPOINT_ID };
    let s = await mount();
    expect(textOf(s.root)).toMatch(new RegExp(`Exercice\\s+1\\s*/\\s*${cp.length}`));
    for (let i = 0; i < cp.length; i++) {
      await answerWrong(s.root, cp[i]);
      await tapText(s.root, i + 1 >= cp.length ? 'Voir mon résultat' : 'Continuer');
    }
    expect(hasCelebration(s.root)).toBe(false); // échec → pas de célébration
    expect(hasCelebrateFigure(s.root)).toBe(false); // …ni de figure 3D duo (jamais en échec)
    expect(mascotStates(s.root)).not.toContain('celebrate-big');
    s.unmount();

    // ── Réussite : tout juste → célébration (état celebrate-big via l'orchestrateur checkpoint). ──
    await AsyncStorage.clear();
    routerState.params = { skillId: CHECKPOINT_ID };
    s = await mount();
    for (let i = 0; i < cp.length; i++) {
      await answerCorrect(s.root, cp[i]);
      await tapText(s.root, i + 1 >= cp.length ? 'Voir mon résultat' : 'Continuer');
    }
    expect(hasCelebration(s.root)).toBe(true); // réussite → célébration rendue
    expect(hasCelebrateFigure(s.root)).toBe(true); // …avec la figure 3D duo (LOT V2)
    expect(mascotStates(s.root)).toContain('celebrate-big'); // proportionnelle (checkpoint réussi)
    s.unmount();
  });

  it('reprise EXACTE après remontage (stockage réel) + réponse restaurée jamais recomptée', async () => {
    const list = PILOT_LIST();
    // 1re instance : leçon → pratique → répondre correctement à l'exercice 1, Continuer (index → 2).
    let s = await mount();
    await reachPractice(s.root);
    await answerCorrect(s.root, list[0]);
    await tapText(s.root, 'Continuer');
    expect(textOf(s.root)).toMatch(/Exercice\s+2\s*\/\s*6/); // index avancé, 1 réponse validée
    s.unmount(); // fermeture SANS terminer

    // 2e instance (même AsyncStorage) : la reprise restaure EXACTEMENT la position pratique/index.
    s = await mount();
    expect(textOf(s.root)).toMatch(/Exercice\s+2\s*\/\s*6/); // pas la leçon, pas l'exercice 1 : reprise exacte
    // Terminer la session ; la réponse restaurée (exercice 1) ne doit JAMAIS être comptée deux fois.
    for (let i = 1; i < list.length; i++) {
      await answerCorrect(s.root, list[i]);
      await tapText(s.root, i + 1 >= list.length ? 'Voir mon résultat' : 'Continuer');
    }
    const saved = await progressRepository.load();
    const recognize = objectiveId(C, 'recognize');
    // recognize = 3 exercices (direction, label-high, place-high), chacun compté UNE fois malgré la reprise.
    expect(saved!.targets![recognize].attempts).toBe(3);
    s.unmount();
  });

  it('remédiation DÉCLENCHÉE PAR L’ERREUR : variante ≠ échouée ET ≠ exercice suivant, comptée une seule fois', async () => {
    const { root, unmount } = await mount();
    await reachPractice(root);
    const list = PILOT_LIST();
    const direction = list[0];
    if (direction.type !== 'identify_pattern') throw new Error('type');

    // La variante de remédiation ATTENDUE (déterministe) : même cible, ≠ échouée, ≠ exercice suivant.
    const expected = remediationVariant(direction, list[1].id)!;
    expect(expected.id).not.toBe(direction.id);
    expect(expected.id).not.toBe(list[1].id); // PROUVE : ce n'est pas simplement l'exercice suivant du tableau
    expect(expected.target?.objectiveId).toBe(direction.target?.objectiveId); // MÊME cible pédagogique

    // Erreur cliquée → Bobo (orchestrateur) + bouton de remédiation proposé.
    await tapText(root, direction.options[(direction.validation.correctIndex + 1) % 3]);
    expect(a11yLabels(root).some((l) => l.includes('Bobo'))).toBe(true);
    expect(pressables(root).some((n) => textOf(n).includes('Réessayer autrement'))).toBe(true);

    // Déclenchement : la variante affichée est celle attendue (À CAUSE de l'erreur), injectée immédiatement.
    await tapText(root, 'Réessayer autrement');
    expect(textOf(root)).toContain('REMÉDIATION');
    expect(textOf(root)).toContain(expected.prompt);

    // Réussite de la remédiation → « Continuer » reprend le parcours au 2e exercice de BASE (pas +2).
    await answerCorrect(root, expected);
    await tapText(root, 'Continuer');
    expect(textOf(root)).toMatch(/Exercice\s+2\s*\/\s*6/);

    // Terminer : l'erreur de base est comptée UNE fois ; la tentative de remédiation n'est jamais comptée.
    for (let i = 1; i < list.length; i++) {
      await answerCorrect(root, list[i]);
      await tapText(root, i + 1 >= list.length ? 'Voir mon résultat' : 'Continuer');
    }
    const saved = await progressRepository.load();
    const recognize = objectiveId(C, 'recognize');
    expect(saved!.targets![recognize].attempts).toBe(3); // 3 exercices recognize de base ; remédiation non comptée
    unmount();
  });

  it('reprise PENDANT une remédiation : même variante restaurée (header + index), erreur comptée une seule fois', async () => {
    const list = PILOT_LIST();
    const direction = list[0];
    if (direction.type !== 'identify_pattern') throw new Error('type');
    const expected = remediationVariant(direction, list[1].id)!;

    // Erreur → « Réessayer autrement » → la variante de remédiation est affichée.
    let s = await mount();
    await reachPractice(s.root);
    await tapText(s.root, direction.options[(direction.validation.correctIndex + 1) % 3]);
    await tapText(s.root, 'Réessayer autrement');
    expect(textOf(s.root)).toContain('REMÉDIATION');
    expect(textOf(s.root)).toContain(expected.prompt);
    s.unmount(); // DÉMONTAGE avant de répondre à la remédiation

    // Remontage (même AsyncStorage) : MÊME variante restaurée, header « REMÉDIATION », index inchangé.
    s = await mount();
    expect(textOf(s.root)).toMatch(/Exercice\s+1\s*\/\s*6/); // index inchangé (remédiation sur l'ex. de base 1)
    expect(textOf(s.root)).toContain('REMÉDIATION');
    expect(textOf(s.root)).toContain(expected.prompt); // exactement la même variante

    // Répondre à la remédiation, reprendre le parcours, terminer.
    await answerCorrect(s.root, expected);
    await tapText(s.root, 'Continuer');
    expect(textOf(s.root)).toMatch(/Exercice\s+2\s*\/\s*6/);
    for (let i = 1; i < list.length; i++) {
      await answerCorrect(s.root, list[i]);
      await tapText(s.root, i + 1 >= list.length ? 'Voir mon résultat' : 'Continuer');
    }
    // L'erreur de base est comptée UNE seule fois ; la reprise pendant la remédiation ne double rien.
    const saved = await progressRepository.load();
    const recognize = objectiveId(C, 'recognize');
    expect(saved!.targets![recognize].attempts).toBe(3);
    s.unmount();
  });

  it('reprise d’une INTERACTION inachevée : ordre réorganisé (non validé) restauré à l’identique, compté une fois', async () => {
    const list = PILOT_LIST();
    const orderIdx = list.findIndex((e) => e.type === 'order');
    const order = list[orderIdx];
    if (order.type !== 'order') throw new Error('type');

    // Avancer jusqu'à l'exercice d'ordre.
    let s = await mount();
    await reachPractice(s.root);
    for (let i = 0; i < orderIdx; i++) {
      await answerCorrect(s.root, list[i]);
      await tapText(s.root, 'Continuer');
    }
    // Modifier l'ordre SANS valider (une descente depuis la position 1).
    const before = readOrder(s.root, order.items);
    tapLabelSync(s.root, `Descendre « ${order.items[before[0]]} » (position 1 sur ${before.length})`);
    await flush();
    const draft = readOrder(s.root, order.items);
    expect(draft).not.toEqual(before); // la valeur a réellement changé
    s.unmount(); // fermeture SANS valider

    // Remontage (même AsyncStorage) : la valeur EXACTE du brouillon est restaurée.
    s = await mount();
    expect(textOf(s.root)).toMatch(new RegExp(`Exercice\\s+${orderIdx + 1}\\s*/\\s*6`));
    expect(readOrder(s.root, order.items)).toEqual(draft); // ordre inachevé restauré à l'identique

    // Terminer de reconstituer, valider → compté UNE seule fois.
    await answerCorrect(s.root, order);
    await tapText(s.root, 'Continuer');
    for (let i = orderIdx + 1; i < list.length; i++) {
      await answerCorrect(s.root, list[i]);
      await tapText(s.root, i + 1 >= list.length ? 'Voir mon résultat' : 'Continuer');
    }
    const saved = await progressRepository.load();
    const interpret = objectiveId(C, 'interpret');
    expect(saved!.targets![interpret].attempts).toBe(2); // zone-high + read-order, chacun une seule fois
    s.unmount();
  });

  it('reprise d’un CHECKPOINT interrompu : position exacte restaurée', async () => {
    routerState.params = { skillId: CHECKPOINT_ID };
    const cp = checkpointExercises(CHECKPOINT_ID, 0, 2);
    let s = await mount();
    await answerCorrect(s.root, cp[0]);
    await tapText(s.root, 'Continuer'); // index → 1
    expect(textOf(s.root)).toMatch(new RegExp(`Exercice\\s+2\\s*/\\s*${cp.length}`));
    s.unmount();
    s = await mount();
    expect(textOf(s.root)).toMatch(new RegExp(`Exercice\\s+2\\s*/\\s*${cp.length}`)); // reprise fidèle du checkpoint
    s.unmount();
  });

  it('garde-fou hydratation (#418) : le 1er rendu client DIFFÈRE le contenu param-dépendant → chargement stable', async () => {
    // Le client résout `skillId` immédiatement, mais l'écran rend d'ABORD l'état « chargement »
    // (indépendant du paramètre) jusqu'au montage — même sortie que le pré-rendu statique du serveur,
    // donc AUCUNE divergence d'hydratation (React #418). Si l'on réintroduisait un 1er rendu
    // param-dépendant (contenu de session ou « introuvable »), ce garde-fou échouerait.
    routerState.params = { skillId: 'skill.candles' };
    let renderer!: ReactTestRenderer;
    act(() => {
      renderer = create(createElement(ProgressProvider, null, createElement(Session)));
    });
    const firstPaint = JSON.stringify(renderer.toJSON());
    expect(firstPaint).toContain('On prépare ta session'); // 1er rendu = chargement stable
    expect(firstPaint).not.toContain('Chandeliers'); // PAS encore le contenu de la session
    expect(firstPaint).not.toContain('introuvable'); // ni l'écran « introuvable »

    // Après montage, le contenu réel apparaît (l'hydratation a déjà réconcilié le placeholder commun).
    await flush();
    expect(JSON.stringify(renderer.toJSON())).toContain('Chandeliers');
    act(() => renderer.unmount());
  });
});

// ── LOT 4-M — 2e module guidé RÉEL (world.candles) sur le MÊME écran de production ──
const CANDLE_SKILL = 'skill.candle.indecision'; // types : identify_figure, order, scenario, find_error
const DOJI = 'concept.doji';
const CANDLE_LIST = () =>
  rotateExercises(getExercises(CANDLE_SKILL), limitCount(getExercises(CANDLE_SKILL).length, null), 0);

describe('Écran de session RÉEL — module Chandeliers (world.candles)', () => {
  it('session Chandeliers : leçon → pratique → erreur (Bobo) → réussite → 1 transition/cible, cible échouée due, aucune maîtrise prématurée', async () => {
    routerState.params = { skillId: CANDLE_SKILL };
    const { root, unmount } = await mount();
    await reachPractice(root);
    const list = CANDLE_LIST();
    expect(textOf(root)).toMatch(new RegExp(`Exercice\\s+1\\s*/\\s*${list.length}`));

    // ex1 = reconnaissance (identify_figure) : ERREUR cliquée → le guide prudent (Bobo) réagit.
    const ex1 = list[0];
    if (ex1.type !== 'identify_figure') throw new Error('ex1 ≠ identify_figure');
    await tapText(root, ex1.options[(ex1.validation.correctIndex + 1) % ex1.options.length]);
    expect(a11yLabels(root).some((l) => l.includes('Bobo'))).toBe(true);
    expect(pressables(root).some((n) => textOf(n).includes('Continuer'))).toBe(true);
    await tapText(root, 'Continuer');

    // Le reste de l'unité est réussi via les VRAIS contrôles (order, scenario, find_error).
    for (let i = 1; i < list.length; i++) {
      await answerCorrect(root, list[i]);
      await tapText(root, i + 1 >= list.length ? 'Voir mon résultat' : 'Continuer');
    }
    expect(textOf(root)).toMatch(new RegExp(`/\\s*${list.length}`));

    const saved = await progressRepository.load();
    const now = Date.now();
    // recognize (échoué, 1 seul exercice) → remis à zéro, dû immédiatement, AUCUNE maîtrise.
    const recognize = saved!.targets![objectiveId(DOJI, 'recognize')];
    expect(recognize.review.repetitions).toBe(0);
    expect(recognize.review.dueAt).toBeLessThanOrEqual(now + 2000);
    expect(isObjectiveProven(recognize)).toBe(false);
    // interpret / confirm / avoid-false-signal réussis → UNE transition chacun, jamais « maîtrisé ».
    for (const kind of ['interpret', 'confirm', 'avoid-false-signal'] as const) {
      const t = saved!.targets![objectiveId(DOJI, kind)];
      expect(t.review.repetitions).toBe(1);
      expect(isObjectiveProven(t)).toBe(false); // reps < 2 → pas de maîtrise prématurée
    }
    expect(saved!.skills[CANDLE_SKILL]).toBeDefined();
    expect(saved!.rotation?.[CANDLE_SKILL]).toBe(1); // completeSession a avancé la rotation (persisté)
    unmount();
  });

  it('checkpoint Chandeliers RÉEL : PROPRE (skills du module), tournant, réussi → célébration', async () => {
    // Checkpoint indépendant : sa fenêtre tourne, et il n'agrège QUE les compétences Chandeliers.
    expect(checkpointExercises(CANDLE_CHECKPOINT_ID, 0, 2)).not.toEqual(checkpointExercises(CANDLE_CHECKPOINT_ID, 1, 2));
    const cp = checkpointExercises(CANDLE_CHECKPOINT_ID, 0, 2);
    expect(new Set(cp.map((e) => e.skillId)).size).toBeGreaterThan(1);
    expect(cp.every((e) => e.skillId.startsWith('skill.candle.'))).toBe(true);

    await AsyncStorage.clear();
    routerState.params = { skillId: CANDLE_CHECKPOINT_ID };
    const s = await mount();
    expect(textOf(s.root)).toMatch(new RegExp(`Exercice\\s+1\\s*/\\s*${cp.length}`));
    for (let i = 0; i < cp.length; i++) {
      await answerCorrect(s.root, cp[i]);
      await tapText(s.root, i + 1 >= cp.length ? 'Voir mon résultat' : 'Continuer');
    }
    expect(hasCelebration(s.root)).toBe(true); // réussite → célébration rendue
    s.unmount();
  });

  it('reprise EXACTE (stockage réel) : réponse Chandeliers restaurée jamais recomptée', async () => {
    routerState.params = { skillId: CANDLE_SKILL };
    const list = CANDLE_LIST();
    // 1re instance : répondre correctement à l'exercice 1, Continuer (index → 2), fermer SANS terminer.
    let s = await mount();
    await reachPractice(s.root);
    await answerCorrect(s.root, list[0]);
    await tapText(s.root, 'Continuer');
    expect(textOf(s.root)).toMatch(new RegExp(`Exercice\\s+2\\s*/\\s*${list.length}`));
    s.unmount();

    // 2e instance (même AsyncStorage) : reprise EXACTE de la position pratique/index.
    s = await mount();
    expect(textOf(s.root)).toMatch(new RegExp(`Exercice\\s+2\\s*/\\s*${list.length}`));
    for (let i = 1; i < list.length; i++) {
      await answerCorrect(s.root, list[i]);
      await tapText(s.root, i + 1 >= list.length ? 'Voir mon résultat' : 'Continuer');
    }
    const saved = await progressRepository.load();
    // recognize = 1 exercice, compté UNE seule fois malgré la reprise (jamais deux fois).
    expect(saved!.targets![objectiveId(DOJI, 'recognize')].attempts).toBe(1);
    s.unmount();
  });
});
