/**
 * @jest-environment node
 *
 * LOT 4-K — Verrou des PARAMÈTRES STATIQUES des routes de contenu à liens directs.
 * `generateStaticParams()` de `concept/[slug]` et `glossaire/[slug]` doit correspondre EXACTEMENT aux
 * registres canoniques (`V5_CONCEPTS`, `GLOSSARY_TERMS`) : mêmes slugs, unicité, ordre déterministe,
 * aucune omission, aucune entrée supplémentaire, jamais le littéral `[slug]`. Toute dérive ou
 * suppression de `generateStaticParams` fait échouer ce test → chaque slug connu obtient son HTML au
 * prochain build. Glossaire : dérivé de `GLOSSARY_TERMS` (jamais `UNIFIED_GLOSSARY`, dont les entrées
 * V5 sont routées vers `/concept/[slug]`).
 *
 * `expo-router`, `react-native-reanimated` et `react-native-safe-area-context` sont mockés uniquement
 * pour que l'IMPORT des modules de route ne charge pas le vrai `expo-router` (dépendance ESM
 * `standard-navigation` non transformée). `generateStaticParams` est une fonction pure des registres.
 */
/* eslint-disable @typescript-eslint/no-require-imports, import/first -- fabriques jest.mock hissées. */
import { describe, it, expect, jest } from '@jest/globals';

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
jest.mock('expo-router', () => ({
  __esModule: true,
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: () => {}, replace: () => {}, back: () => {}, navigate: () => {} }),
  useFocusEffect: () => {},
  Link: ({ children }: { children?: unknown }) => children ?? null,
  Stack: { Screen: () => null },
}));

import { generateStaticParams as conceptParams } from '@/app/concept/[slug]';
import { generateStaticParams as glossaireParams } from '@/app/glossaire/[slug]';
import { V5_CONCEPTS, GLOSSARY_TERMS, UNIFIED_GLOSSARY } from '@/data';

async function slugsOf(fn: () => Promise<{ slug: string }[]>): Promise<string[]> {
  const params = await fn();
  return params.map((p) => p.slug);
}

describe('LOT 4-K — paramètres statiques des routes de contenu', () => {
  it('concept/[slug] : exactement les slugs de V5_CONCEPTS (ordre, unicité, complet)', async () => {
    const got = await slugsOf(conceptParams);
    const expected = V5_CONCEPTS.map((c) => c.slug);
    expect(got).toEqual(expected); // même ordre, mêmes valeurs, ni omission ni ajout
    expect(new Set(got).size).toBe(got.length); // unicité
    expect(got).not.toContain('[slug]'); // jamais le littéral
    expect(got.length).toBeGreaterThan(0);
  });

  it('glossaire/[slug] : exactement les slugs de GLOSSARY_TERMS (jamais UNIFIED_GLOSSARY)', async () => {
    const got = await slugsOf(glossaireParams);
    const expected = GLOSSARY_TERMS.map((t) => t.slug);
    expect(got).toEqual(expected);
    expect(new Set(got).size).toBe(got.length);
    expect(got).not.toContain('[slug]');
    expect(got.length).toBeGreaterThan(0);
    // Garde-fou : le glossaire NE pré-génère PAS les entrées V5 (routées vers /concept).
    expect(got.length).toBeLessThan(UNIFIED_GLOSSARY.length);
  });

  it('aucun chevauchement de contrat : chaque registre reste sa propre source', async () => {
    const conceptSlugs = new Set(await slugsOf(conceptParams));
    const glossaireSlugs = await slugsOf(glossaireParams);
    // Un slug de glossaire peut coïncider textuellement avec un concept (routes distinctes),
    // mais le glossaire ne doit jamais dériver du corpus concept (taille très différente).
    expect(glossaireSlugs.length).not.toBe(conceptSlugs.size);
  });
});
