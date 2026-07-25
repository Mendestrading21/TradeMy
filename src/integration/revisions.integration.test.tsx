/**
 * @jest-environment node
 *
 * Test d'intégration RENDU de l'écran RÉVISIONS de production (`app/(tabs)/revisions.tsx`) monté dans
 * le `ProgressProvider` réel (LOT 4-C), sur des états DÉTERMINISTES (seed AsyncStorage, `now` figé).
 * Prouve, sur l'écran RÉEL : icônes de la famille, action principale + route EXACTE, a11y des niveaux
 * de maîtrise (nom + valeur + contexte, jamais un nombre isolé), états (plusieurs dues / à jour /
 * aucune compétence), reprise après remontage, et INVARIANTS du moteur (fonctions pures inchangées).
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
  const strip = ({ children, style }: { children?: unknown; style?: unknown }) =>
    React.createElement(View, { style }, children);
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

import Revisions from '@/app/(tabs)/revisions';
import { ProgressProvider } from '@/data';
import { masteryStatus, isDue, type SkillProgress } from '@/engines/learning';
import { findEmoji } from './emojiGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoRouter from 'expo-router';

const routerState = (ExpoRouter as unknown as { __state: { calls: unknown[][] } }).__state;

function review(dueAt: number) {
  return { repetitions: 3, easiness: 2.5, intervalDays: 1, dueAt };
}
/** Progression persistée déterministe. */
function seedState(opts: { completed: string[]; skills: Record<string, unknown> }) {
  return JSON.stringify({
    onboarded: true,
    schemaVersion: 8,
    completedSkills: opts.completed,
    skills: opts.skills,
  });
}
async function persist(json: string) {
  await AsyncStorage.clear();
  await AsyncStorage.setItem('patternlab.progress.v1', json);
}
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
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(createElement(ProgressProvider, null, createElement(Revisions)));
  });
  await flush();
  return renderer;
}

// Deux compétences terminées ; DUE = dueAt ≤ now, NON DUE = dueAt futur.
const DUE_TWO = seedState({
  completed: ['skill.actions', 'skill.trend'],
  skills: {
    'skill.actions': { skillId: 'skill.actions', xp: 60, mastery: 0.85, confidence: 0.9, review: review(0), errorTags: { 'couleur-seule': 3 } },
    'skill.trend': { skillId: 'skill.trend', xp: 30, mastery: 0.4, confidence: 0.3, review: review(1), errorTags: {} },
  },
});
const UP_TO_DATE = seedState({
  completed: ['skill.actions'],
  skills: {
    'skill.actions': { skillId: 'skill.actions', xp: 60, mastery: 0.85, confidence: 0.9, review: review(FIXED_NOW + 3 * DAY), errorTags: {} },
  },
});
const NOTHING = seedState({ completed: [], skills: {} });

beforeEach(() => {
  routerState.calls.length = 0;
});

describe('Révisions de production — hiérarchie, icônes, a11y, états (LOT 4-C)', () => {
  it('plusieurs dues : action principale + route EXACTE, a11y de maîtrise, aucun emoji', async () => {
    await persist(DUE_TWO);
    const renderer = await mount();
    const root = renderer.root;
    const json = JSON.stringify(renderer.toJSON());

    // Hiérarchie : le libellé de l'action principale unique est présent.
    expect(json).toContain('À RÉVISER AUJOURD’HUI');

    // Action principale = réviser la compétence prioritaire → route de session EXACTE.
    const cta = byHint(root, 'Lancer la révision de Comprendre une action');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    const pushed = routerState.calls.filter((c) => c[0] === 'push');
    expect(pushed).toHaveLength(1);
    expect(pushed[0][1]).toBe('/session/skill.actions');

    // Icônes de la famille rendues (viewBox 24×24), décoratives.
    const svgs = root.findAll((n) => n.props?.viewBox === '0 0 24 24', { deep: true });
    expect(svgs.length).toBeGreaterThan(0);
    for (const s of svgs) expect(s.props.accessibilityElementsHidden).toBe(true);

    // A11y des niveaux de maîtrise : nom explicite (pas un simple mot ni un nombre).
    const masteryChips = root.findAll(
      (n) => typeof n.props?.accessibilityLabel === 'string' && /^Niveau de maîtrise : /.test(n.props.accessibilityLabel as string),
      { deep: true },
    );
    expect(masteryChips.length).toBeGreaterThan(0);

    // Les jauges ont nom + valeur + contexte (progressbar avec label « Progression de … » + accessibilityValue).
    const bars = root.findAll(
      (n) => n.props?.accessibilityRole === 'progressbar' && typeof n.props?.accessibilityValue?.now === 'number',
      { deep: true },
    );
    expect(bars.length).toBeGreaterThan(0);
    for (const b of bars) expect(String(b.props.accessibilityLabel ?? '')).toMatch(/^Progression de /);

    // Aucun nom accessible réduit à un nombre/pourcentage isolé.
    const lone = root.findAll(
      (n) => typeof n.props?.accessibilityLabel === 'string' && /^\s*\d+\s*%?\s*$/.test(n.props.accessibilityLabel as string),
      { deep: true },
    );
    expect(lone).toHaveLength(0);

    // Aucun emoji système dans TOUT le rendu réel (garde-fou générique du projet).
    expect(findEmoji(json)).toEqual([]);

    await act(async () => renderer.unmount());
  });

  it('à jour (aucune due) : « TU ES À JOUR » + CTA vers le parcours', async () => {
    await persist(UP_TO_DATE);
    const renderer = await mount();
    const root = renderer.root;
    const json = JSON.stringify(renderer.toJSON());

    expect(json).toContain('TU ES À JOUR');
    expect(json).not.toContain('À RÉVISER AUJOURD’HUI');
    expect(findEmoji(json)).toEqual([]);

    const cta = byHint(root, 'Ouvrir le parcours d’apprentissage');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    const pushed = routerState.calls.filter((c) => c[0] === 'push');
    expect(pushed).toHaveLength(1);
    expect(pushed[0][1]).toBe('/parcours');

    await act(async () => renderer.unmount());
  });

  it('aucune compétence terminée : état vide explicite + action existante', async () => {
    await persist(NOTHING);
    const renderer = await mount();
    const root = renderer.root;
    const json = JSON.stringify(renderer.toJSON());

    expect(json).toContain('Aucune compétence terminée');
    expect(findEmoji(json)).toEqual([]);

    const cta = pressables(root).find(
      (n) => typeof n.props.onPress === 'function' && /Ouvrir le parcours/.test(JSON.stringify(n.props)),
    );
    // L'état vide propose UNE action existante (StateView action → /parcours).
    const emptyAction = pressables(root).find((n) => {
      act(() => (n.props.onPress as () => void)?.());
      return routerState.calls.some((c) => c[1] === '/parcours');
    });
    expect(cta ?? emptyAction).toBeDefined();
    expect(routerState.calls.some((c) => c[0] === 'push' && c[1] === '/parcours')).toBe(true);

    await act(async () => renderer.unmount());
  });

  it('reprise après navigation : l\'état persisté redonne la même action principale', async () => {
    await persist(DUE_TWO);
    const first = await mount();
    expect(JSON.stringify(first.toJSON())).toContain('À RÉVISER AUJOURD’HUI');
    await act(async () => first.unmount());

    // Remontage (retour sur l'onglet) : la persistance rejoue le même état déterministe.
    const second = await mount();
    const root = second.root;
    expect(JSON.stringify(second.toJSON())).toContain('À RÉVISER AUJOURD’HUI');
    expect(byHint(root, 'Lancer la révision de Comprendre une action')).toBeDefined();
    await act(async () => second.unmount());
  });

  it('INVARIANTS moteur : masteryStatus / isDue inchangés (fonctions pures non modifiées)', () => {
    // isMastered = repetitions ≥ 3 && mastery ≥ 0.8 ; « strong » = mastery ≥ 0.8 mais PAS encore maîtrisé.
    const strong: SkillProgress = { skillId: 'x', xp: 0, mastery: 0.85, confidence: 0.9, review: { repetitions: 2, easiness: 2.5, intervalDays: 1, dueAt: 0 }, errorTags: {} };
    const mastered: SkillProgress = { skillId: 'm', xp: 0, mastery: 0.9, confidence: 0.9, review: review(0), errorTags: {} };
    const learning: SkillProgress = { skillId: 'y', xp: 0, mastery: 0.3, confidence: 0.2, review: review(0), errorTags: {} };
    const fresh: SkillProgress = { skillId: 'z', xp: 0, mastery: 0, confidence: 0, review: { repetitions: 0, easiness: 2.5, intervalDays: 0, dueAt: 0 }, errorTags: {} };
    expect(masteryStatus(strong)).toBe('strong');
    expect(masteryStatus(mastered)).toBe('mastered');
    expect(masteryStatus(learning)).toBe('learning');
    expect(masteryStatus(fresh)).toBe('new');
    expect(isDue(review(0), FIXED_NOW)).toBe(true);
    expect(isDue(review(FIXED_NOW + DAY), FIXED_NOW)).toBe(false);
  });
});
