/**
 * @jest-environment node
 *
 * Test d'intégration RENDU de l'écran PROFIL de production (`app/(tabs)/profil.tsx`) monté dans le
 * `ProgressProvider` réel (LOT 4-D), sur des états DÉTERMINISTES (seed AsyncStorage, `now` figé).
 * Prouve, sur l'écran RÉEL : identité, résumé de progression (données des vrais providers, aucune
 * valeur accessible réduite à un nombre), action principale + route EXACTE selon l'état, raccourci
 * Révisions → /revisions, préférence fonctionnelle (switch analytics), reprise, aucun emoji.
 */
/* eslint-disable @typescript-eslint/no-require-imports, import/first -- fabriques jest.mock hissées. */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { create, act, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { createElement } from 'react';

const FIXED_NOW = 1_700_000_000_000;
const DAY = 24 * 60 * 60 * 1000;

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

import Profil from '@/app/(tabs)/profil';
import { ProgressProvider } from '@/data';
import { findEmoji } from './emojiGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoRouter from 'expo-router';

const routerState = (ExpoRouter as unknown as { __state: { calls: unknown[][] } }).__state;

function review(dueAt: number) {
  return { repetitions: 2, easiness: 2.5, intervalDays: 1, dueAt };
}
function seed(json: object) {
  return JSON.stringify({ onboarded: true, schemaVersion: 8, ...json });
}
async function persist(json: string | null, onboarding?: string) {
  await AsyncStorage.clear();
  if (json) await AsyncStorage.setItem('patternlab.progress.v1', json);
  if (onboarding) await AsyncStorage.setItem('patternlab.onboarding.v1', onboarding);
}
const ONBOARDING = JSON.stringify({
  schemaVersion: 1,
  objective: 'debuter',
  level: 'debutant',
  dailyMinutes: 5,
  topics: ['chandeliers'],
  diagnosticDone: false,
  diagnosticScore: null,
  startSkillId: 'skill.actions',
  guide: 'toto',
  completedAt: '2026-01-01T09:00:00.000Z',
});
function pressables(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.onPress === 'function', { deep: true });
}
function byHint(root: ReactTestInstance, hint: string): ReactTestInstance | undefined {
  return pressables(root).find((n) => String(n.props.accessibilityHint ?? '') === hint);
}
async function flush(): Promise<void> {
  for (let i = 0; i < 8; i++) await act(async () => { await Promise.resolve(); });
}
async function mount(): Promise<ReactTestRenderer> {
  let r!: ReactTestRenderer;
  await act(async () => { r = create(createElement(ProgressProvider, null, createElement(Profil))); });
  await flush();
  return r;
}

const DUE = seed({
  completedSkills: ['skill.actions'],
  totalXp: 150,
  streakDays: 3,
  coins: 20,
  learning: { conceptsExplored: ['a', 'b', 'c'], worldsExplored: [], falseSignalsSpotted: 0, figuresRecognized: 0, bestRecognitionStreak: 0 },
  skills: { 'skill.actions': { skillId: 'skill.actions', xp: 60, mastery: 0.6, confidence: 0.6, review: review(FIXED_NOW - DAY), errorTags: { 'couleur-seule': 2 } } },
});
const PROGRESS_NO_DUE = seed({
  completedSkills: ['skill.actions', 'skill.trend'],
  totalXp: 320,
  streakDays: 7,
  coins: 60,
  skills: {
    'skill.actions': { skillId: 'skill.actions', xp: 90, mastery: 0.9, confidence: 0.9, review: review(FIXED_NOW + 3 * DAY), errorTags: {} },
    'skill.trend': { skillId: 'skill.trend', xp: 80, mastery: 0.8, confidence: 0.8, review: review(FIXED_NOW + 3 * DAY), errorTags: {} },
  },
});

beforeEach(() => { routerState.calls.length = 0; });

/** Aucun nom accessible de l'écran n'est un nombre/pourcentage isolé. */
function assertNoLoneNumbers(root: ReactTestInstance) {
  const lone = root.findAll(
    (n) => typeof n.props?.accessibilityLabel === 'string' && /^\s*\d+\s*%?\s*$/.test(n.props.accessibilityLabel as string),
    { deep: true },
  );
  expect(lone).toHaveLength(0);
}

describe('Profil de production — identité, progression, action principale, a11y (LOT 4-D)', () => {
  it('nouvel utilisateur : identité neutre + « Commencer le parcours » → /parcours ; aucun nombre accessible isolé', async () => {
    await persist(null); // aucune progression
    const r = await mount();
    const root = r.root;
    const json = JSON.stringify(r.toJSON());

    expect(json).toContain('Apprenti Trademy'); // identité neutre, jamais un faux nom
    expect(json).toContain('TA PROGRESSION');
    expect(findEmoji(json)).toEqual([]);
    assertNoLoneNumbers(root);

    const cta = byHint(root, 'Démarrer le parcours d’apprentissage');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(routerState.calls.filter((c) => c[0] === 'push')).toEqual([['push', '/parcours']]);

    await act(async () => r.unmount());
  });

  it('révisions dues : action principale « Réviser maintenant » → /revisions', async () => {
    await persist(DUE);
    const r = await mount();
    const root = r.root;
    const json = JSON.stringify(r.toJSON());

    expect(findEmoji(json)).toEqual([]);
    assertNoLoneNumbers(root);

    // Métriques issues des VRAIS providers (données seedées).
    const explored = root.find((n) => String(n.props?.accessibilityLabel ?? '') === '3 notions découvertes');
    expect(explored).toBeDefined();

    const cta = byHint(root, 'Ouvrir les révisions recommandées');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(routerState.calls.filter((c) => c[0] === 'push')).toEqual([['push', '/revisions']]);

    // Raccourci Révisions → /revisions (accès, pas une copie).
    routerState.calls.length = 0;
    const short = byHint(root, 'Ouvrir les révisions');
    expect(short).toBeDefined();
    act(() => (short!.props.onPress as () => void)());
    expect(routerState.calls.some((c) => c[0] === 'push' && c[1] === '/revisions')).toBe(true);

    await act(async () => r.unmount());
  });

  it('progression sans révision due : action principale « Continuer le parcours » → /parcours', async () => {
    await persist(PROGRESS_NO_DUE);
    const r = await mount();
    const root = r.root;

    const cta = byHint(root, 'Reprendre le parcours d’apprentissage');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(routerState.calls.filter((c) => c[0] === 'push')).toEqual([['push', '/parcours']]);

    // Icônes de la famille décoratives (aucune annoncée).
    const svgs = root.findAll((n) => n.props?.viewBox === '0 0 24 24', { deep: true });
    expect(svgs.length).toBeGreaterThan(0);
    for (const s of svgs) expect(s.props.accessibilityElementsHidden).toBe(true);

    await act(async () => r.unmount());
  });

  it('préférence RÉELLE : le switch « Suivi d’usage anonyme » bascule un vrai état', async () => {
    await persist(DUE);
    const r = await mount();
    const root = r.root;
    const sw = root.find(
      (n) => n.props?.accessibilityRole === 'switch' && String(n.props?.accessibilityLabel ?? '') === 'Suivi d’usage anonyme',
    );
    expect(sw).toBeDefined();
    const before = Boolean(sw.props.accessibilityState?.checked);
    await act(async () => (sw.props.onPress as () => void)());
    await flush();
    const swAfter = r.root.find(
      (n) => n.props?.accessibilityRole === 'switch' && String(n.props?.accessibilityLabel ?? '') === 'Suivi d’usage anonyme',
    );
    expect(Boolean(swAfter.props.accessibilityState?.checked)).toBe(!before); // état réellement basculé
    await act(async () => r.unmount());
  });

  it('identité personnalisée : guide choisi + ancienneté RÉELLE (date valide, jamais NaN)', async () => {
    await persist(DUE, ONBOARDING);
    const r = await mount();
    const root = r.root;
    const json = JSON.stringify(r.toJSON());

    // Guide réellement choisi → chip d'identité au nom accessible explicite.
    const guideChip = root.find((n) => String(n.props?.accessibilityLabel ?? '') === 'Guide choisi : Toto');
    expect(guideChip).toBeDefined();
    // Ancienneté formatée depuis `profile.completedAt` (UTC, déterministe) — jamais NaN/Invalid Date.
    // (RN scinde les enfants de Text interpolés → on vérifie les deux fragments.)
    expect(json).toContain('Parcours démarré le');
    expect(json).toContain('1 janvier 2026');
    expect(json).not.toMatch(/NaN|Invalid Date/);
    // Donnée d'onboarding réelle affichée et regroupée en un nom accessible.
    const objectiveRow = root.find((n) => /^Objectif : /.test(String(n.props?.accessibilityLabel ?? '')));
    expect(objectiveRow).toBeDefined();

    await act(async () => r.unmount());
  });

  it('reprise après navigation : l’état persisté redonne la même action principale', async () => {
    await persist(DUE);
    const first = await mount();
    expect(byHint(first.root, 'Ouvrir les révisions recommandées')).toBeDefined();
    await act(async () => first.unmount());

    const second = await mount();
    expect(byHint(second.root, 'Ouvrir les révisions recommandées')).toBeDefined();
    await act(async () => second.unmount());
  });
});
