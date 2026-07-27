/**
 * @jest-environment node
 *
 * LOT 4-K — Test d'intégration RENDU de la fiche glossaire de production (`app/glossaire/[slug].tsx`).
 * Prouve, sur l'écran RÉEL et la LOGIQUE existante préservée : hydratation déterministe (1er paint =
 * chargement stable, indépendant du slug), terme réel après hydratation, état « Terme introuvable »
 * après hydratation, analytics `concept_viewed` inchangé (payload `category`/`hasRelatedSkill`) et
 * AUCUN autre évènement, marquage `markRecentlyViewed`/`markConceptExplored` UNE fois après `ready`
 * (aucun double effet, aucun effet pour un slug invalide), favori, navigation vers un terme relié
 * (`/glossaire/[slug]`) et vers la session liée (`/session/[skillId]`).
 * `useProgress` est mocké (références STABLES, comme le vrai provider mémoïsé) ; le reste de `@/data`
 * reste RÉEL.
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
    withTiming: (v: unknown) => v, withSpring: (v: unknown) => v,
    withSequence: (...a: unknown[]) => a[a.length - 1], withRepeat: (v: unknown) => v,
    withDelay: (_d: unknown, v: unknown) => v, cancelAnimation: () => {},
    Easing: { linear: (x: number) => x, inOut: () => (x: number) => x, ease: (x: number) => x },
    interpolate: () => 0, runOnJS: (fn: unknown) => fn,
  };
});
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const strip = ({ children, style }: { children?: unknown; style?: unknown }) => React.createElement(View, { style }, children);
  return { __esModule: true, SafeAreaProvider: ({ children }: { children?: unknown }) => children, SafeAreaView: strip, useSafeAreaInsets: () => insets, SafeAreaInsetsContext: React.createContext(insets), initialWindowMetrics: { insets, frame: { x: 0, y: 0, width: 390, height: 844 } } };
});
jest.mock('expo-router', () => {
  const state: { params: Record<string, unknown>; calls: unknown[][] } = { params: {}, calls: [] };
  return {
    __esModule: true, __state: state,
    useLocalSearchParams: () => state.params,
    useRouter: () => ({ push: (...a: unknown[]) => state.calls.push(['push', ...a]), replace: (...a: unknown[]) => state.calls.push(['replace', ...a]), back: () => state.calls.push(['back']), navigate: () => {} }),
    useFocusEffect: () => {}, Link: ({ children }: { children?: unknown }) => children ?? null, Stack: { Screen: () => null },
  };
});
// `useProgress` mocké — références STABLES (comme le vrai provider `useCallback`) pour ne pas doubler
// l'effet de marquage lors du re-rendu du garde-fou d'hydratation.
jest.mock('@/data', () => {
  const actual = jest.requireActual('@/data') as Record<string, unknown>;
  const calls: { recent: string[]; explored: string[]; favToggles: string[] } = { recent: [], explored: [], favToggles: [] };
  const favorites = new Set<string>();
  const toggleFavorite = (s: string) => calls.favToggles.push(s);
  const markRecentlyViewed = (s: string) => calls.recent.push(s);
  const markConceptExplored = (s: string) => calls.explored.push(s);
  const progress = { favorites, toggleFavorite, markRecentlyViewed, markConceptExplored, ready: true };
  return { __esModule: true, ...actual, __calls: calls, useProgress: () => progress };
});

import GlossaryDetail from '@/app/glossaire/[slug]';
import { GLOSSARY_TERMS, skillById } from '@/data';
import { recentEvents, clearRecentEvents } from '@/analytics';
import * as ExpoRouter from 'expo-router';
import * as Data from '@/data';

const routerState = (ExpoRouter as unknown as { __state: { params: Record<string, unknown>; calls: unknown[][] } }).__state;
const calls = (Data as unknown as { __calls: { recent: string[]; explored: string[]; favToggles: string[] } }).__calls;

// Terme RICHE réel (termes reliés + compétence liée) — bull-bear.
const RICH = GLOSSARY_TERMS.find((t) => (t.related ?? []).length > 0 && t.relatedSkillId)!;
// Premier terme relié RÉSOLU dans le registre (certains alias peuvent ne pas exister).
const FIRST_REL = (RICH.related ?? []).map((s) => GLOSSARY_TERMS.find((t) => t.slug === s)).find(Boolean)!;
const SKILL = skillById(RICH.relatedSkillId!)!;

function pressables(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.onPress === 'function', { deep: true });
}
function textNodes(root: ReactTestInstance, s: string): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.children === 'string' && (n.props.children as string) === s, { deep: true });
}
const hasText = (root: ReactTestInstance, s: string) => textNodes(root, s).length > 0;
const hasTextIncluding = (root: ReactTestInstance, sub: string) =>
  root.findAll((n) => typeof n.props?.children === 'string' && (n.props.children as string).includes(sub), { deep: true }).length > 0;

function firstPaint(slug: string): ReactTestRenderer {
  routerState.params = { slug };
  let r!: ReactTestRenderer;
  act(() => { r = create(createElement(GlossaryDetail)); });
  return r;
}
async function flush(): Promise<void> {
  await act(async () => { await Promise.resolve(); });
}
async function mount(slug: string): Promise<ReactTestRenderer> {
  const r = firstPaint(slug);
  await flush();
  return r;
}

beforeEach(() => {
  routerState.params = {}; routerState.calls.length = 0;
  calls.recent.length = 0; calls.explored.length = 0; calls.favToggles.length = 0;
  clearRecentEvents();
});

describe('Fiche glossaire de production — hydratation déterministe & logique préservée (LOT 4-K)', () => {
  it('1er paint = chargement STABLE (ni terme ni introuvable) ; terme réel après hydratation', async () => {
    const r = firstPaint(RICH.slug);
    expect(hasText(r.root, 'On prépare le terme…')).toBe(true);
    expect(hasText(r.root, RICH.term)).toBe(false);
    expect(hasText(r.root, 'Terme introuvable')).toBe(false);
    await flush();
    expect(hasText(r.root, RICH.term)).toBe(true);
    expect(hasText(r.root, 'En bref')).toBe(true);
    act(() => r.unmount());
  });

  it('état « Terme introuvable » après hydratation ; AUCUN effet métier', async () => {
    const r = await mount('__terme-inexistant-k__');
    expect(hasText(r.root, 'Terme introuvable')).toBe(true);
    expect(recentEvents().filter((e) => e.event === 'concept_viewed')).toHaveLength(0);
    expect(calls.recent).toHaveLength(0);
    expect(calls.explored).toHaveLength(0);
    act(() => r.unmount());
  });

  it('analytics INCHANGÉS : concept_viewed une fois, payload category/hasRelatedSkill, aucun autre', async () => {
    const r = await mount(RICH.slug);
    const cv = recentEvents().filter((e) => e.event === 'concept_viewed');
    expect(cv).toHaveLength(1);
    expect(cv[0].props).toMatchObject({ category: RICH.category, hasRelatedSkill: Boolean(RICH.relatedSkillId) });
    expect(recentEvents().every((e) => e.event === 'concept_viewed')).toBe(true);
    act(() => r.unmount());
  });

  it('marquage récent/exploré UNE fois après ready ; un rendu supplémentaire ne double pas', async () => {
    const r = firstPaint(RICH.slug);
    await flush();
    await flush();
    expect(calls.recent.filter((s) => s === RICH.slug)).toHaveLength(1);
    expect(calls.explored.filter((s) => s === RICH.slug)).toHaveLength(1);
    act(() => r.unmount());
  });

  it('favori : bouton nommé ; bascule via toggleFavorite avec le slug', async () => {
    const r = await mount(RICH.slug);
    const favBtn = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').toLowerCase().includes('favori'));
    expect(favBtn).toBeDefined();
    act(() => (favBtn!.props.onPress as () => void)());
    expect(calls.favToggles).toContain(RICH.slug);
    act(() => r.unmount());
  });

  it('terme relié : chip actionnable → navigation /glossaire/[slug]', async () => {
    const r = await mount(RICH.slug);
    const chip = pressables(r.root).find((n) => String(n.props.accessibilityHint ?? '') === `Ouvrir ${FIRST_REL.term}`);
    expect(chip).toBeDefined();
    expect(chip!.props.accessibilityRole).toBe('button');
    act(() => (chip!.props.onPress as () => void)());
    const pushes = routerState.calls.filter((c) => c[0] === 'push');
    expect(pushes.some((c) => c[1] === `/glossaire/${FIRST_REL.slug}`)).toBe(true);
    act(() => r.unmount());
  });

  it('session liée : bouton « S’entraîner » → navigation /session/[skillId]', async () => {
    const r = await mount(RICH.slug);
    expect(hasTextIncluding(r.root, 'S’entraîner')).toBe(true);
    const btn = pressables(r.root).find((n) => {
      const label = n.findAll((c) => typeof c.props?.children === 'string' && (c.props.children as string).includes('S’entraîner'), { deep: true });
      return label.length > 0;
    });
    expect(btn).toBeDefined();
    act(() => (btn!.props.onPress as () => void)());
    const pushes = routerState.calls.filter((c) => c[0] === 'push');
    expect(pushes.some((c) => c[1] === `/session/${SKILL.id}`)).toBe(true);
    act(() => r.unmount());
  });

  it('robustesse : aucune valeur invalide, remontage déterministe', async () => {
    const first = await mount(RICH.slug);
    const json1 = JSON.stringify(first.toJSON());
    expect(json1).not.toMatch(/NaN|undefined|Infinity|Invalid Date/);
    act(() => first.unmount());
    calls.recent.length = 0; calls.explored.length = 0;
    const second = await mount(RICH.slug);
    expect(JSON.stringify(second.toJSON())).toBe(json1);
    expect(calls.explored.filter((s) => s === RICH.slug)).toHaveLength(1);
    act(() => second.unmount());
  });
});
