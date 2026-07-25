/**
 * @jest-environment node
 *
 * Test d'intégration RENDU de l'écran d'ACCUEIL de production (`app/(tabs)/index.tsx`) monté dans le
 * `ProgressProvider` réel (LOT 4-B, renforcé). Prouve, sur l'écran RÉEL et un état DÉTERMINISTE :
 *  1. les icônes `target`, `hint`, `timer`, `coin` de la FAMILLE Trademy sont rendues (identifiées par
 *     leur géométrie SVG propre, pas « au moins un SVG ») ;
 *  2. `timer` et `coin` produisent une géométrie SVG NON VIDE avec `viewBox="0 0 24 24"` ;
 *  3. les couleurs sémantiques sont respectées au RENDU — durée = `info`, « Concept du jour » = accent
 *     de marque `primaryBright` — et aucune icône n'utilise `technical`/`advanced` (jamais détournés) ;
 *  4. l'action principale émet EXACTEMENT la route de session attendue avec ses paramètres ;
 *  5. aucun emoji système n'apparaît dans TOUT le rendu (garde-fou GÉNÉRIQUE du projet) ;
 *  6. les icônes restent décoratives pour les lecteurs d'écran et les libellés sont préservés.
 * expo-router / useNow sont mockés au seul niveau infrastructure pour un rendu déterministe.
 */
/* eslint-disable @typescript-eslint/no-require-imports, import/first -- fabriques jest.mock hissées
   au-dessus des imports et utilisant require() (contrainte du moteur de mocks jest). */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { create, act, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { createElement } from 'react';

const FIXED_NOW = 1_700_000_000_000; // état temporel figé → rendu 100 % déterministe.

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

import Home from '@/app/(tabs)/index';
import {
  ProgressProvider,
  SKILLS,
  buildDailyMission,
  exercisesForMinutes,
  migrateProgress,
  PROGRESS_SCHEMA_VERSION,
} from '@/data';
import { theme } from '@/design-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoRouter from 'expo-router';
import { findEmoji } from './emojiGuard';

const routerState = (ExpoRouter as unknown as { __state: { calls: unknown[][] } }).__state;

/** État persistant déterministe : onboardé, aucune compétence terminée → mission « apprendre » stable. */
const SEED = JSON.stringify({ onboarded: true, schemaVersion: PROGRESS_SCHEMA_VERSION });

function pressables(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.onPress === 'function', { deep: true });
}
/** SVG de la FAMILLE d'icônes uniquement (les graphiques MiniVisual utilisent `0 0 W H`, jamais 24×24). */
function iconSvgs(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => n.props?.viewBox === '0 0 24 24', { deep: true });
}
/** Un SVG d'icône contient-il une primitive satisfaisant `pred` (Circle/Line/Path…) ? */
function hasPart(svg: ReactTestInstance, pred: (n: ReactTestInstance) => boolean): boolean {
  return svg.findAll(pred, { deep: true }).length > 0;
}
const rEq = (n: ReactTestInstance, v: string) => String(n.props?.r ?? '') === v;
const dHas = (n: ReactTestInstance, frag: string) =>
  typeof n.props?.d === 'string' && n.props.d.includes(frag);
/** Couleur de trait effective d'une icône (toutes ses primitives tracées partagent `color`). */
function iconColor(svg: ReactTestInstance): string | undefined {
  const part = svg.findAll(
    (n) => typeof n.props?.stroke === 'string' && n.props.stroke !== 'none',
    { deep: true },
  )[0];
  return part?.props?.stroke as string | undefined;
}
async function flush(): Promise<void> {
  for (let i = 0; i < 8; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem('patternlab.progress.v1', SEED);
  routerState.calls.length = 0;
});

describe('Accueil de production — icônes de la famille + couleurs + action principale (LOT 4-B)', () => {
  it('rend target/hint/timer/coin, respecte les couleurs sémantiques et émet la route exacte', async () => {
    let renderer!: ReactTestRenderer;
    await act(async () => {
      renderer = create(createElement(ProgressProvider, null, createElement(Home)));
    });
    await flush();
    const root = renderer.root;
    const json = JSON.stringify(renderer.toJSON());

    // (1) Libellés de section présents, portés par une icône de la famille (plus d'emoji préfixe).
    expect(json).toContain('MISSION DU JOUR');
    expect(json).toContain('CONCEPT DU JOUR');

    // (2) Les QUATRE icônes attendues sont rendues, identifiées par leur géométrie propre (24×24).
    const svgs = iconSvgs(root);
    const timer = svgs.find((s) => hasPart(s, (n) => rEq(n, '7'))); // cadran r=7 (unique)
    const coin = svgs.find((s) => hasPart(s, (n) => rEq(n, '4.6'))); // anneau intérieur r=4.6 (unique)
    const target = svgs.find((s) => hasPart(s, (n) => rEq(n, '0.6'))); // point central r=0.6 (unique)
    const hint = svgs.find((s) => hasPart(s, (n) => dHas(n, '15.5a5 5'))); // ampoule (unique)
    for (const [name, svg] of Object.entries({ target, hint, timer, coin })) {
      if (!svg) throw new Error(`icône ${name} absente du rendu de l'Accueil`);
      expect(svg.props.viewBox).toBe('0 0 24 24'); // géométrie SVG non vide, grille canonique
    }
    // timer & coin : géométrie réellement peuplée (≥ 2 primitives tracées).
    expect(timer!.findAll((n) => n.props?.stroke != null || n.props?.fill != null).length).toBeGreaterThanOrEqual(2);
    expect(coin!.findAll((n) => n.props?.stroke != null || n.props?.fill != null).length).toBeGreaterThanOrEqual(2);

    // (3) Couleurs sémantiques au RENDU : durée = info, « Concept du jour » = accent de marque.
    expect(iconColor(timer!)).toBe(theme.colors.info);
    expect(iconColor(hint!)).toBe(theme.colors.primaryBright);
    // Aucune icône de l'Accueil n'utilise les couleurs réservées technical/advanced.
    for (const svg of svgs) {
      const parts = svg.findAll((n) => n.props?.stroke != null || n.props?.fill != null, { deep: true });
      for (const p of parts) {
        for (const c of [p.props.stroke, p.props.fill]) {
          if (typeof c === 'string') {
            expect(c).not.toBe(theme.colors.technical);
            expect(c).not.toBe(theme.colors.advanced);
          }
        }
      }
    }

    // (6) Les icônes de la famille restent décoratives pour les lecteurs d'écran.
    for (const svg of [target!, hint!, timer!, coin!]) {
      expect(svg.props.accessibilityElementsHidden).toBe(true);
    }

    // (5) Aucun emoji système dans TOUT le rendu réel (garde-fou générique du projet).
    expect(findEmoji(json)).toEqual([]);

    // (4) L'action principale émet EXACTEMENT la route de session attendue, sur l'état déterministe.
    const state = migrateProgress({ onboarded: true, schemaVersion: PROGRESS_SCHEMA_VERSION }, FIXED_NOW)!;
    const expectedMission = buildDailyMission(state, SKILLS, FIXED_NOW);
    expect(expectedMission.skillId).toBeTruthy();
    const cta = pressables(root).find(
      (n) => String(n.props.accessibilityHint ?? '') === 'Démarrer la mission du jour',
    );
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    const pushed = routerState.calls.filter((c) => c[0] === 'push');
    expect(pushed).toHaveLength(1);
    expect(pushed[0][1]).toEqual({
      pathname: '/session/[skillId]',
      params: { skillId: expectedMission.skillId, count: String(exercisesForMinutes(5)) },
    });

    await act(async () => renderer.unmount());
  });
});
