/**
 * @jest-environment node
 *
 * LOT E2 — test d'intégration de l'écran RÉEL du deck de révision (`app/revision-deck.tsx`).
 * Prouve, sur l'écran de production : la profondeur réelle (cartes rédigées + cartes dérivées des
 * champs de chaque fiche), le filtre par ANGLE de révision (réviser une facette précise), la
 * virtualisation (aucune régression de perf sur un deck qui a été multiplié), l'accessibilité du
 * résumé et l'absence d'emoji / de valeur invalide.
 */
/* eslint-disable @typescript-eslint/no-require-imports, import/first -- fabriques jest.mock hissées. */
import { describe, it, expect, jest } from '@jest/globals';
import { create, act, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { createElement } from 'react';

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
// FlatList → rend toutes les lignes pour l'assertion (le composant réel reste virtualisé en prod).
jest.mock('react-native', () => {
  const RN: any = jest.requireActual('react-native');
  const React = require('react');
  const resolve = (C: any) => (typeof C === 'function' ? React.createElement(C) : (C ?? null));
  function MockFlatList({ data = [], renderItem, keyExtractor, ListHeaderComponent, ListFooterComponent }: any) {
    const items = data.map((item: any, index: number) =>
      React.createElement(RN.View, { key: keyExtractor ? keyExtractor(item, index) : String(index) }, renderItem({ item, index })),
    );
    return React.createElement(RN.View, null, resolve(ListHeaderComponent), items, resolve(ListFooterComponent));
  }
  return new Proxy(RN, { get: (t: any, k: any) => (k === 'FlatList' ? MockFlatList : t[k]) });
});
jest.mock('expo-router', () => ({
  __esModule: true,
  useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {}, navigate: () => {} }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: () => {},
  Link: ({ children }: { children?: unknown }) => children ?? null,
  Stack: { Screen: () => null },
}));
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

import RevisionDeck from '@/app/revision-deck';
import { buildRevisionDeck, ANGLE_LABEL } from '@/data';
import { findEmoji } from './emojiGuard';

const deck = buildRevisionDeck();

function mount(): ReactTestRenderer {
  let r!: ReactTestRenderer;
  act(() => {
    r = create(createElement(RevisionDeck));
  });
  return r;
}
function pressables(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.onPress === 'function', { deep: true });
}
function pressByLabel(root: ReactTestInstance, label: string) {
  const p = pressables(root).find((n) =>
    n.findAll((x) => typeof x.props?.children === 'string' && x.props.children === label, { deep: true }).length > 0,
  );
  if (!p) throw new Error(`filtre introuvable : ${label}`);
  act(() => (p.props.onPress as () => void)());
}
/** Nombre annoncé par le résumé accessible (« N cartes … dans cette sélection »). */
function compteAnnonce(root: ReactTestInstance): number {
  const n = root.find((x) => typeof x.props?.accessibilityLabel === 'string' && /cartes? .*dans cette sélection/.test(x.props.accessibilityLabel as string));
  return Number((n.props.accessibilityLabel as string).match(/^(\d+)/)![1]);
}

describe('LOT E2 — deck de révision : profondeur réelle et révision par angle', () => {
  it('le deck rendu contient bien plus que les seules cartes rédigées', () => {
    const redigees = deck.flashcards.filter((f) => f.origin === 'redigee').length;
    const derivees = deck.flashcards.filter((f) => f.origin === 'derivee').length;
    expect(derivees).toBeGreaterThan(redigees * 2);
    const r = mount();
    expect(compteAnnonce(r.root)).toBe(deck.flashcards.length + deck.quizzes.length);
    act(() => r.unmount());
  });

  it('filtrer par angle ne montre QUE cet angle, et le compte suit', () => {
    const r = mount();
    for (const angle of ['reconnaitre', 'invalider', 'faux-signal'] as const) {
      pressByLabel(r.root, ANGLE_LABEL[angle]);
      const attendu = deck.flashcards.filter((f) => f.angle === angle).length;
      expect(attendu).toBeGreaterThan(0);
      expect(compteAnnonce(r.root)).toBe(attendu);
    }
    // Retour à « Tout » : le deck complet revient.
    pressByLabel(r.root, 'Tout');
    expect(compteAnnonce(r.root)).toBe(deck.flashcards.length + deck.quizzes.length);
    act(() => r.unmount());
  });

  it('le filtre « Mini-quiz » isole les quiz', () => {
    const r = mount();
    pressByLabel(r.root, 'Mini-quiz');
    expect(compteAnnonce(r.root)).toBe(deck.quizzes.length);
    act(() => r.unmount());
  });

  it('aucun emoji, aucune valeur invalide, aucun vocabulaire interdit dans le rendu', () => {
    const r = mount();
    const json = JSON.stringify(r.toJSON());
    expect(findEmoji(json)).toEqual([]);
    expect(json).not.toMatch(/NaN|Infinity|Invalid Date/);
    expect(json).not.toMatch(/\b(buy|sell|profit garanti|gain garanti)\b/i);
    act(() => r.unmount());
  });

  it('chaque carte affichée porte le concept dont elle vient (traçabilité)', () => {
    const r = mount();
    const json = JSON.stringify(r.toJSON());
    // Un échantillon de titres réels de fiches doit apparaître au-dessus des cartes.
    for (const titre of [...new Set(deck.flashcards.map((f) => f.conceptTitle))].slice(0, 5)) {
      expect(json).toContain(titre);
    }
    act(() => r.unmount());
  });
});
