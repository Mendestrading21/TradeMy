/**
 * @jest-environment node
 *
 * Test d'intégration RENDU de l'écran APPRENDRE / PARCOURS de production (`app/(tabs)/parcours.tsx`)
 * monté dans le `ProgressProvider` RÉEL (LOT 4-E), sur des états DÉTERMINISTES (seed AsyncStorage).
 *
 * Prouve, sur l'écran RÉEL et les VRAIS providers : 15 mondes ordonnés en trois bandes de cinq ;
 * déblocage/exploration/terminaison/maîtrise dérivés de `buildLearningPath` (aucun second calcul) ;
 * action principale UNIQUE + route EXACTE `/monde/{id}` selon l'état ; carte verrouillée actionnable
 * vers son détail ; « exploré » ≠ « terminé » ≠ « maîtrisé » ; a11y (nom groupé par monde, aucune
 * valeur réduite à un nombre, progression globale annoncée une seule fois) ; aucun emoji ; reprise
 * après remontage ; aucune mutation de progression au montage/à l'ouverture ; invariants de
 * `learningMap` inchangés.
 */
/* eslint-disable @typescript-eslint/no-require-imports, import/first -- fabriques jest.mock hissées. */
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
  const strip = ({ children, style }: { children?: unknown; style?: unknown }) => React.createElement(View, { style }, children);
  return {
    __esModule: true,
    SafeAreaProvider: ({ children }: { children?: unknown }) => children,
    SafeAreaView: strip,
    useSafeAreaInsets: () => insets,
    SafeAreaInsetsContext: React.createContext(insets),
    initialWindowMetrics: { insets, frame: { x: 0, y: 0, width: 390, height: 844 } },
  };
});
jest.mock('expo-image', () => ({ __esModule: true, Image: require('react-native').View }));
// Feuilles visuelles remplacées par de simples vues (isolent la logique de l'écran, pas de SVG natif).
jest.mock('@/characters', () => ({ __esModule: true, MascotFigure: () => null, useReducedMotion: () => false }));
jest.mock('@/engines/visual', () => ({ __esModule: true, MiniVisual: () => null }));
jest.mock('@/lib/useNow', () => ({ __esModule: true, useNow: () => 1_700_000_000_000 }));
jest.mock('expo-router', () => {
  const state: { calls: unknown[][] } = { calls: [] };
  return {
    __esModule: true,
    __state: state,
    useRouter: () => ({
      push: (...a: unknown[]) => state.calls.push(['push', ...a]),
      replace: (...a: unknown[]) => state.calls.push(['replace', ...a]),
      back: () => {},
      navigate: () => {},
    }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: () => {},
    Link: ({ children }: { children?: unknown }) => children ?? null,
    Stack: { Screen: () => null },
  };
});

import Apprendre from '@/app/(tabs)/parcours';
import { ProgressProvider } from '@/data';
import { WORLDS } from '@/data';
import { V5_CONCEPTS } from '@/data';
import { SKILLS, CHECKPOINT_ID, CONTENT_MODULES, isGuidedWorld } from '@/data';
import { buildLearningPath, worldEntryById } from '@/data';
import { findEmoji } from './emojiGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoRouter from 'expo-router';

const routerState = (ExpoRouter as unknown as { __state: { calls: unknown[][] } }).__state;

const ALL_SKILLS = SKILLS.map((s) => s.id);
const SORTED_WORLDS = [...WORLDS].sort((a, b) => a.order - b.order);
const WORLD2 = SORTED_WORLDS[1]; // world.anatomy (ordre 2) — GUIDÉ depuis le LOT 4-P
// Depuis le LOT 4-Z, PLUS AUCUN monde de contenu : les 15 mondes sont guidés (vérifié en test).
const LAST_WORLD = SORTED_WORLDS[SORTED_WORLDS.length - 1]; // world.false-signals (ordre 15)
// Tous les modules guidés validés (compétences + checkpoints).
const ALL_GUIDED_DONE_IDS = CONTENT_MODULES.flatMap((m) => [...m.skills.map((s) => s.id), m.checkpointId]);

function seed(json: object) {
  return JSON.stringify({ onboarded: true, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, ...json });
}
async function persist(json: string | null) {
  await AsyncStorage.clear();
  if (json) await AsyncStorage.setItem('patternlab.progress.v1', json);
}
const NEW = seed({});
const GUIDED_PARTIAL = seed({ completedSkills: [ALL_SKILLS[0]] }); // 1 compétence, PAS le checkpoint
const W1_DONE = seed({ completedSkills: [...ALL_SKILLS, CHECKPOINT_ID] });
const ALL_DONE = seed({ completedSkills: ALL_GUIDED_DONE_IDS });

function pressables(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.onPress === 'function', { deep: true });
}
function byHint(root: ReactTestInstance, hint: string): ReactTestInstance | undefined {
  return pressables(root).find((n) => String(n.props.accessibilityHint ?? '') === hint);
}
/** Étiquettes accessibles UNIQUES des nœuds de monde (« Monde N, … »). */
function worldLabels(root: ReactTestInstance): string[] {
  const set = new Set<string>();
  root.findAll((n) => typeof n.props?.accessibilityLabel === 'string' && /^Monde \d+,/.test(n.props.accessibilityLabel as string), { deep: true }).forEach((n) =>
    set.add(n.props.accessibilityLabel as string),
  );
  return [...set];
}
function labelForOrder(root: ReactTestInstance, order: number): string | undefined {
  return worldLabels(root).find((l) => new RegExp(`^Monde ${order},`).test(l));
}
function nodePressableForOrder(root: ReactTestInstance, order: number): ReactTestInstance | undefined {
  return pressables(root).find((n) => new RegExp(`^Monde ${order},`).test(String(n.props.accessibilityLabel ?? '')));
}
function assertNoLoneNumbers(root: ReactTestInstance) {
  const lone = root.findAll(
    (n) => typeof n.props?.accessibilityLabel === 'string' && /^\s*\d+\s*%?\s*$/.test(n.props.accessibilityLabel as string),
    { deep: true },
  );
  expect(lone).toHaveLength(0);
}
async function flush(): Promise<void> {
  for (let i = 0; i < 8; i++) await act(async () => { await Promise.resolve(); });
}
async function mount(): Promise<ReactTestRenderer> {
  let r!: ReactTestRenderer;
  await act(async () => { r = create(createElement(ProgressProvider, null, createElement(Apprendre))); });
  await flush();
  return r;
}

beforeEach(() => { routerState.calls.length = 0; });

describe('Parcours de production — roadmap, action unique, vérité pédagogique, a11y (LOT 4-E)', () => {
  it('affiche exactement 15 mondes, sans doublon, dans l’ordre réel, répartis en trois bandes de cinq', async () => {
    await persist(NEW);
    const r = await mount();
    const labels = worldLabels(r.root);
    expect(labels).toHaveLength(WORLDS.length); // 15
    const orders = labels.map((l) => Number(/^Monde (\d+),/.exec(l)![1])).sort((a, b) => a - b);
    expect(orders).toEqual(Array.from({ length: 15 }, (_, i) => i + 1)); // 1..15 uniques et ordonnés
    // Trois bandes (sections) réellement annoncées.
    const bands = r.root.findAll((n) => /^Niveau (Débutant|Intermédiaire|Avancé)$/.test(String(n.props?.accessibilityLabel ?? '')), { deep: true });
    expect(new Set(bands.map((b) => b.props.accessibilityLabel)).size).toBe(3);
    await act(async () => r.unmount());
  });

  it('nouvel utilisateur : monde 1 « en cours », 14 verrouillés ; action « Commencer le parcours » → /monde/world.foundations', async () => {
    await persist(NEW);
    const r = await mount();
    const root = r.root;

    expect(labelForOrder(root, 1)).toMatch(/Fondations des marchés\. Niveau : en cours\./);
    const locked = worldLabels(root).filter((l) => /verrouillé/.test(l));
    expect(locked).toHaveLength(14);

    const cta = byHint(root, 'Ouvrir le module guidé Fondations des marchés');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(routerState.calls.filter((c) => c[0] === 'push')).toEqual([['push', '/monde/world.foundations']]);

    expect(findEmoji(JSON.stringify(r.toJSON()))).toEqual([]);
    assertNoLoneNumbers(root);
    await act(async () => r.unmount());
  });

  it('module guidé partiellement réalisé : progression > 0, monde 1 « en cours » (jamais terminé par une compétence isolée)', async () => {
    await persist(GUIDED_PARTIAL);
    const r = await mount();
    const l1 = labelForOrder(r.root, 1)!;
    expect(l1).toMatch(/Niveau : en cours/); // pas « terminé »
    expect(l1).not.toMatch(/terminé/);
    const m = /Module guidé, (\d+) % réalisé/.exec(l1);
    expect(m).toBeTruthy();
    const pct = Number(m![1]);
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThan(100);
    await act(async () => r.unmount());
  });

  it('checkpoint validé : monde 1 « terminé » et monde 2 (guidé) débloqué → ouverture /monde/world.anatomy', async () => {
    await persist(W1_DONE);
    const r = await mount();
    const root = r.root;
    expect(labelForOrder(root, 1)).toMatch(/Niveau : terminé\./);
    expect(labelForOrder(root, 2)).not.toMatch(/verrouillé/);

    // Le monde 2 est GUIDÉ : l'action principale porte le hint du module guidé.
    const cta = byHint(root, `Ouvrir le module guidé ${WORLD2.title}`);
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(routerState.calls.filter((c) => c[0] === 'push')).toEqual([['push', `/monde/${WORLD2.id}`]]);
    await act(async () => r.unmount());
  });

  it('15/15 (LOT 4-Z) : tous les modules guidés validés → le parcours ENTIER est terminé, dernier monde compris', async () => {
    // Plus aucun monde de contenu : chaque monde (même le 15e) se termine par la PREUVE.
    expect(SORTED_WORLDS.every((w) => isGuidedWorld(w.id))).toBe(true);
    await persist(ALL_DONE);
    const r = await mount();
    const root = r.root;
    const last = labelForOrder(root, LAST_WORLD.order)!;
    expect(last).toMatch(/Niveau : terminé/);
    expect(last).not.toMatch(/verrouillé/);
    await act(async () => r.unmount());
  });

  it('maîtrise NON accordée sans condition réelle : monde 1 terminé n’est pas « maîtrisé » sans fiches maîtrisées', async () => {
    await persist(W1_DONE);
    const r = await mount();
    const l1 = labelForOrder(r.root, 1)!;
    expect(l1).toMatch(/terminé/);
    expect(l1).not.toMatch(/maîtrisé/);
    await act(async () => r.unmount());
  });

  it('l’écran reflète EXACTEMENT buildLearningPath (aucun second calcul) et n’annonce la progression globale qu’une fois', async () => {
    await persist(W1_DONE);
    const r = await mount();
    const root = r.root;
    // Vérité de référence issue du module pur.
    const path = buildLearningPath(WORLDS, V5_CONCEPTS, { completedSkills: [...ALL_SKILLS, CHECKPOINT_ID], exploredSlugs: [], masteredSlugs: [] });
    const map: Record<string, RegExp> = { done: /terminé/, explored: /exploré/, current: /en cours/, unlocked: /disponible/, locked: /verrouillé/ };
    for (const e of path) {
      const label = labelForOrder(root, e.world.order)!;
      expect(label).toMatch(map[e.mastered ? 'done' : e.status]);
    }
    // Progression GLOBALE annoncée une seule fois (une barre « … terminé(s) sur N »).
    const globals = root.findAll(
      (n) => n.props?.accessibilityRole === 'progressbar' && /termin[ée]s? sur \d+/.test(String(n.props?.accessibilityLabel ?? '')),
      { deep: true },
    );
    // react-test-renderer duplique composite/host : on déduplique par libellé.
    expect(new Set(globals.map((g) => g.props.accessibilityLabel)).size).toBe(1);
    await act(async () => r.unmount());
  });

  it('carte VERROUILLÉE : bouton actif (non désactivé) vers son détail, hint « Voir pourquoi ce monde est verrouillé »', async () => {
    await persist(NEW);
    const r = await mount();
    const node2 = nodePressableForOrder(r.root, 2);
    expect(node2).toBeDefined();
    expect(node2!.props.accessibilityRole).toBe('button');
    expect(node2!.props.accessibilityHint).toBe('Voir pourquoi ce monde est verrouillé');
    // Non annoncé comme désactivé.
    expect(node2!.props.accessibilityState?.disabled ?? false).toBe(false);
    act(() => (node2!.props.onPress as () => void)());
    expect(routerState.calls.some((c) => c[0] === 'push' && c[1] === `/monde/${WORLD2.id}`)).toBe(true);
    await act(async () => r.unmount());
  });

  it('aucune valeur invalide (NaN/undefined/Infinity), aucun pourcentage incohérent', async () => {
    await persist(GUIDED_PARTIAL);
    const r = await mount();
    const json = JSON.stringify(r.toJSON());
    expect(json).not.toMatch(/NaN|undefined|Infinity|Invalid Date/);
    // Chaque pourcentage annoncé reste dans [0,100].
    const pcts = [...json.matchAll(/(\d+) % réalisé/g)].map((m) => Number(m[1]));
    for (const p of pcts) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
    }
    await act(async () => r.unmount());
  });

  it('reprise après remontage : l’état persisté redonne la même action principale', async () => {
    await persist(W1_DONE);
    const first = await mount();
    expect(byHint(first.root, `Ouvrir le module guidé ${WORLD2.title}`)).toBeDefined();
    await act(async () => first.unmount());

    const second = await mount();
    expect(byHint(second.root, `Ouvrir le module guidé ${WORLD2.title}`)).toBeDefined();
    await act(async () => second.unmount());
  });

  it('aucune mutation de progression au montage ni à l’ouverture d’une carte', async () => {
    await persist(W1_DONE);
    const r = await mount();
    const afterMount = await AsyncStorage.getItem('patternlab.progress.v1');
    const parsedMount = JSON.parse(afterMount ?? '{}');
    // Le montage n’ajoute aucune progression.
    expect(parsedMount.completedSkills.sort()).toEqual([...ALL_SKILLS, CHECKPOINT_ID].sort());

    // Ouvrir une carte ne mute rien.
    const node = nodePressableForOrder(r.root, 3);
    act(() => (node!.props.onPress as () => void)());
    await flush();
    const afterOpen = await AsyncStorage.getItem('patternlab.progress.v1');
    expect(afterOpen).toBe(afterMount);
    await act(async () => r.unmount());
  });

  it('invariants de learningMap inchangés (garde-fou du module pur)', () => {
    // Nouvel utilisateur : monde 1 courant, 14 verrouillés.
    const empty = buildLearningPath(WORLDS, V5_CONCEPTS, { completedSkills: [], exploredSlugs: [] });
    expect(empty).toHaveLength(15);
    expect(worldEntryById(empty, 'world.foundations')!.status).toBe('current');
    expect(empty.filter((e) => e.status === 'locked')).toHaveLength(14);
    // Checkpoint validé : monde 1 terminé.
    const done1 = buildLearningPath(WORLDS, V5_CONCEPTS, { completedSkills: [...ALL_SKILLS, CHECKPOINT_ID], exploredSlugs: [] });
    expect(worldEntryById(done1, 'world.foundations')!.status).toBe('done');
    // 15/15 : tous les modules validés → chaque monde est « done » (plus aucun monde de contenu).
    const allDone = buildLearningPath(WORLDS, V5_CONCEPTS, { completedSkills: ALL_GUIDED_DONE_IDS, exploredSlugs: [] });
    expect(allDone.every((e) => e.status === 'done')).toBe(true);
  });
});
