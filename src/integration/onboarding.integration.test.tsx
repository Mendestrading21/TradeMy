/**
 * @jest-environment node
 *
 * Test d'intégration RENDU de l'écran ONBOARDING de production (`app/onboarding.tsx`) — LOT 4-I.
 * Prouve, sur l'écran RÉEL et la LOGIQUE existante préservée : 7 étapes, progression, navigation
 * avant/arrière, impossibilité d'avancer sans sélection obligatoire, sélections uniques/multiples,
 * mapping option → `TrademyIcon` (plus aucun emoji ni lettre A/B/C), diagnostic complet, résultat
 * produit par `recommendStartSkill`, `completeOnboarding` appelé UNE seule fois, `router.replace` vers
 * `/session/[skillId]` (route inchangée), analytics `goal_selected` sans changement de taxonomie et
 * AUCUN nouvel évènement, aucune écriture supplémentaire, remontage déterministe, aucune valeur invalide.
 * `useProgress` est mocké (capture de `completeOnboarding`) ; le reste de `@/data` reste RÉEL.
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
  const state: { calls: unknown[][] } = { calls: [] };
  return {
    __esModule: true, __state: state,
    useRouter: () => ({ push: (...a: unknown[]) => state.calls.push(['push', ...a]), replace: (...a: unknown[]) => state.calls.push(['replace', ...a]), back: () => {}, navigate: () => {} }),
    useLocalSearchParams: () => ({}), useFocusEffect: () => {}, Link: ({ children }: { children?: unknown }) => children ?? null, Stack: { Screen: () => null },
  };
});
// `useProgress` mocké pour capturer `completeOnboarding` ; tout le reste de `@/data` reste RÉEL.
jest.mock('@/data', () => {
  const actual = jest.requireActual('@/data') as Record<string, unknown>;
  const completeCalls: unknown[] = [];
  return { __esModule: true, ...actual, __completeCalls: completeCalls, useProgress: () => ({ completeOnboarding: (p: unknown) => completeCalls.push(p) }) };
});

import Onboarding from '@/app/onboarding';
import { TrademyIcon } from '@/design-system';
import { OBJECTIVES, LEVELS, DAILY_OPTIONS, TOPICS, SKILLS, skillById, recommendStartSkill, exercisesForMinutes } from '@/data';
import { recentEvents, clearRecentEvents } from '@/analytics';
import { findEmoji } from './emojiGuard';
import { APP_INFO } from '@/lib/appInfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoRouter from 'expo-router';
import * as Data from '@/data';

const routerCalls = (ExpoRouter as unknown as { __state: { calls: unknown[][] } }).__state.calls;
const completeCalls = (Data as unknown as { __completeCalls: unknown[] }).__completeCalls;
const KNOWN_EVENTS = new Set(['onboarding_started', 'goal_selected', 'path_generated', 'diagnostic_completed']);

function pressables(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.onPress === 'function', { deep: true });
}
// Le nom accessible d'une carte est `label` ou `label. hint` (niveaux/durées ont un indice).
const labelMatches = (a: unknown, label: string) => String(a ?? '') === label || String(a ?? '').startsWith(`${label}. `);
function byLabel(root: ReactTestInstance, label: string): ReactTestInstance | undefined {
  return pressables(root).find((n) => labelMatches(n.props.accessibilityLabel, label));
}
const selectedFrom = (root: ReactTestInstance, options: { label: string }[]) =>
  pressables(root).filter((n) => n.props.accessibilityState?.selected === true && options.some((o) => labelMatches(n.props.accessibilityLabel, o.label)));
function textNodes(root: ReactTestInstance, s: string): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.children === 'string' && (n.props.children as string) === s, { deep: true });
}
function pressAncestor(node?: ReactTestInstance): ReactTestInstance | undefined {
  let p: ReactTestInstance | null | undefined = node;
  while (p) { if (typeof p.props?.onPress === 'function') return p; p = p.parent; }
  return undefined;
}
function pressText(root: ReactTestInstance, text: string) {
  const p = pressAncestor(textNodes(root, text)[0]);
  if (!p) throw new Error(`bouton texte introuvable: ${text}`);
  act(() => (p.props.onPress as () => void)());
}
function pressLabel(root: ReactTestInstance, label: string) {
  const p = byLabel(root, label);
  if (!p) throw new Error(`option introuvable: ${label}`);
  act(() => (p.props.onPress as () => void)());
}
const hasText = (root: ReactTestInstance, s: string) => textNodes(root, s).length > 0;
const hasTextIncluding = (root: ReactTestInstance, sub: string) =>
  root.findAll((n) => typeof n.props?.children === 'string' && (n.props.children as string).includes(sub), { deep: true }).length > 0;
// Le libellé visible « Étape 1 / 7 · Bienvenue » est INTERPOLÉ : ses enfants sont un TABLEAU
// (`['Étape ', 1, ' / ', 7, ' · ', 'Bienvenue']`), jamais une chaîne unique. On reconstitue.
function joinedTextNodes(root: ReactTestInstance, s: string): ReactTestInstance[] {
  return root.findAll((n) => {
    const c = n.props?.children;
    if (!Array.isArray(c) || !c.every((x) => typeof x === 'string' || typeof x === 'number')) return false;
    return c.map(String).join('') === s;
  }, { deep: true });
}
const hasJoinedText = (root: ReactTestInstance, s: string) => joinedTextNodes(root, s).length > 0;
// Le nom accessible de la ProgressBar est une chaîne UNIQUE « Étape 1 sur 7 : Bienvenue ».
const hasA11yLabel = (root: ReactTestInstance, expected: string) =>
  root.findAll((n) => String(n.props?.accessibilityLabel ?? '') === expected, { deep: true }).length > 0;
const iconNames = (root: ReactTestInstance) => root.findAllByType(TrademyIcon).map((n) => String(n.props.name));
const stepCaption = (root: ReactTestInstance) => root.findAll((n) => typeof n.props?.children !== 'undefined' && /Étape \d+ sur \d+/.test(String(n.props?.accessibilityLabel ?? '')), { deep: true });

function mount(): ReactTestRenderer {
  let r!: ReactTestRenderer;
  act(() => { r = create(createElement(Onboarding)); });
  return r;
}
/** Va jusqu'à l'étape « Ton parcours » avec des choix déterministes ; renvoie le skill attendu. */
function advanceToResult(r: ReactTestRenderer, opts: { topics?: string[]; diag?: boolean } = {}) {
  const root = r.root;
  pressText(root, 'Commencer'); // 0 → 1
  pressLabel(root, OBJECTIVES[0].label);
  pressText(root, 'Continuer'); // 1 → 2
  pressLabel(root, LEVELS[0].label);
  pressText(root, 'Continuer'); // 2 → 3
  pressLabel(root, DAILY_OPTIONS[1].label);
  pressText(root, 'Continuer'); // 3 → 4
  for (const t of opts.topics ?? []) pressLabel(root, TOPICS.find((x) => x.value === t)!.label);
  pressText(root, 'Continuer'); // 4 → 5
  if (opts.diag) {
    pressText(root, 'Faire le diagnostic (30 s)');
    // 3 questions : on répond à la première option à chaque fois.
    for (let q = 0; q < 3; q++) {
      const opt = q === 0 ? 'Une part d’entreprise' : q === 1 ? 'Haussière' : 'Au-dessus de l’ouverture';
      pressLabel(root, opt);
    }
    pressText(root, 'Continuer'); // done → 6
  } else {
    pressText(root, 'Passer'); // 5 → 6
  }
  return recommendStartSkill(LEVELS[0].value, (opts.topics ?? []) as never, SKILLS);
}

beforeEach(() => { routerCalls.length = 0; completeCalls.length = 0; clearRecentEvents(); (AsyncStorage.setItem as jest.Mock).mockClear(); });

describe('Onboarding de production — 7 étapes, canon, logique préservée (LOT 4-I)', () => {
  it('rend la 1re étape, expose 7 étapes, progresse et navigue avant/arrière ; aucun emoji au montage', () => {
    const r = mount();
    // La marque affichée est la MARQUE PUBLIQUE, pas le nom du dépôt. Cette ligne figeait
    // « Bienvenue sur TradeMy » : le défaut n'était pas seulement non couvert, il était protégé.
    // L'assertion dérive désormais de la source unique, comme l'écran.
    // Le titre est désormais INTERPOLÉ (enfants tableau) : `hasJoinedText`, comme la ligne suivante.
    expect(hasJoinedText(r.root, `Bienvenue sur ${APP_INFO.name}`)).toBe(true);
    // Libellé visible (interpolé, enfants tableau) + nom accessible (chaîne unique) cohérents.
    expect(hasJoinedText(r.root, 'Étape 1 / 7 · Bienvenue')).toBe(true);
    expect(hasA11yLabel(r.root, 'Étape 1 sur 7 : Bienvenue')).toBe(true);
    expect(stepCaption(r.root).length).toBeGreaterThan(0);
    expect(findEmoji(JSON.stringify(r.toJSON()))).toEqual([]);
    expect(JSON.stringify(r.toJSON())).not.toMatch(/[👋🎯🎉⏱★☆]/u);
    pressText(r.root, 'Commencer');
    expect(hasJoinedText(r.root, 'Étape 2 / 7 · Objectif')).toBe(true);
    expect(hasA11yLabel(r.root, 'Étape 2 sur 7 : Objectif')).toBe(true);
    pressText(r.root, 'Retour');
    expect(hasJoinedText(r.root, 'Étape 1 / 7 · Bienvenue')).toBe(true);
    act(() => r.unmount());
  });

  it('interdit d’avancer sans objectif ; sélection d’objectif unique + goal_selected sans nouvelle taxonomie', () => {
    const r = mount();
    pressText(r.root, 'Commencer');
    // « Continuer » désactivé tant qu'aucun objectif n'est choisi.
    const cont = pressAncestor(textNodes(r.root, 'Continuer')[0])!;
    expect(cont.props.accessibilityState?.disabled).toBe(true);
    expect(hasText(r.root, 'Fais un choix pour continuer.')).toBe(true);
    // Sélection.
    clearRecentEvents();
    pressLabel(r.root, OBJECTIVES[0].label);
    const selected = selectedFrom(r.root, OBJECTIVES);
    expect(selected).toHaveLength(1); // un seul objectif actif
    // goal_selected déclenché avec la value exacte, taxonomie inchangée.
    const gs = recentEvents().filter((e) => e.event === 'goal_selected');
    expect(gs).toHaveLength(1);
    expect(gs[0].props?.objective).toBe(OBJECTIVES[0].value);
    // La carte sélectionnée expose l'état AUTREMENT que par la couleur (icône `check`).
    expect(iconNames(r.root)).toContain('check');
    // « Continuer » désormais actif.
    expect(pressAncestor(textNodes(r.root, 'Continuer')[0])!.props.accessibilityState?.disabled).toBe(false);
    act(() => r.unmount());
  });

  it('mappe chaque option vers une icône TrademyIcon (aucune lettre A/B/C, aucun emoji)', () => {
    const r = mount();
    pressText(r.root, 'Commencer');
    // Étape Objectif : les 4 icônes canoniques attendues.
    for (const name of ['learn', 'chart', 'review', 'risk']) expect(iconNames(r.root)).toContain(name);
    // Aucune pseudo-icône alphabétique isolée nulle part.
    for (const L of ['A', 'B', 'C']) expect(textNodes(r.root, L)).toHaveLength(0);
    act(() => r.unmount());
  });

  it('niveau et durée : sélection unique active à chaque étape', () => {
    const r = mount();
    pressText(r.root, 'Commencer');
    pressLabel(r.root, OBJECTIVES[0].label); pressText(r.root, 'Continuer');
    // Niveau
    pressLabel(r.root, LEVELS[1].label);
    expect(selectedFrom(r.root, LEVELS)).toHaveLength(1);
    pressText(r.root, 'Continuer');
    // Durée
    pressLabel(r.root, DAILY_OPTIONS[0].label);
    expect(selectedFrom(r.root, DAILY_OPTIONS)).toHaveLength(1);
    act(() => r.unmount());
  });

  it('sujets : sélection MULTIPLE réelle (plusieurs actifs simultanément)', () => {
    const r = mount();
    pressText(r.root, 'Commencer');
    pressLabel(r.root, OBJECTIVES[0].label); pressText(r.root, 'Continuer');
    pressLabel(r.root, LEVELS[0].label); pressText(r.root, 'Continuer');
    pressLabel(r.root, DAILY_OPTIONS[1].label); pressText(r.root, 'Continuer');
    pressLabel(r.root, TOPICS[0].label);
    pressLabel(r.root, TOPICS[1].label);
    const active = selectedFrom(r.root, TOPICS);
    expect(active).toHaveLength(2); // multi-sélection autorisée
    act(() => r.unmount());
  });

  it('diagnostic : trois questions, options SANS lettre, score exposé (diagnostic_completed)', () => {
    const r = mount();
    pressText(r.root, 'Commencer');
    pressLabel(r.root, OBJECTIVES[0].label); pressText(r.root, 'Continuer');
    pressLabel(r.root, LEVELS[0].label); pressText(r.root, 'Continuer');
    pressLabel(r.root, DAILY_OPTIONS[1].label); pressText(r.root, 'Continuer');
    pressText(r.root, 'Continuer'); // sujets → diagnostic
    pressText(r.root, 'Faire le diagnostic (30 s)');
    expect(hasText(r.root, 'Une action, c’est avant tout…')).toBe(true);
    for (const L of ['A', 'B', 'C']) expect(textNodes(r.root, L)).toHaveLength(0);
    pressLabel(r.root, 'Une part d’entreprise');
    pressLabel(r.root, 'Haussière');
    pressLabel(r.root, 'Au-dessus de l’ouverture');
    expect(JSON.stringify(r.toJSON())).toContain('bonnes réponses');
    expect(recentEvents().filter((e) => e.event === 'diagnostic_completed')).toHaveLength(1);
    act(() => r.unmount());
  });

  it('résultat : compétence recommandée par la logique existante ; completeOnboarding UNE fois ; replace vers /session/[skillId]', () => {
    const r = mount();
    const startSkillId = advanceToResult(r, {});
    const startName = skillById(startSkillId)!.name;
    expect(hasText(r.root, 'Ton parcours')).toBe(true);
    expect(hasText(r.root, startName)).toBe(true); // point de départ recommandé inchangé
    // Finaliser.
    pressText(r.root, 'Commencer ma première leçon');
    expect(completeCalls).toHaveLength(1); // completeOnboarding exactement une fois
    const replaces = routerCalls.filter((c) => c[0] === 'replace');
    expect(replaces).toHaveLength(1); // aucune double soumission
    expect(replaces[0][1]).toEqual({ pathname: '/session/[skillId]', params: { skillId: startSkillId, count: String(exercisesForMinutes(DAILY_OPTIONS[1].value)) } });
    // Aucune écriture de persistance supplémentaire (useProgress mocké, aucun AsyncStorage.setItem).
    expect(AsyncStorage.setItem as jest.Mock).not.toHaveBeenCalled();
    act(() => r.unmount());
  });

  it('n’émet AUCUN évènement hors taxonomie connue sur tout le parcours (aucun nouvel évènement)', () => {
    const r = mount();
    advanceToResult(r, { topics: ['tendance'], diag: true });
    pressText(r.root, 'Commencer ma première leçon');
    expect(recentEvents().every((e) => KNOWN_EVENTS.has(e.event))).toBe(true);
    act(() => r.unmount());
  });

  it('robustesse : aucun bouton mort, remontage déterministe, aucune valeur invalide', () => {
    const first = mount();
    const json1 = JSON.stringify(first.toJSON());
    expect(json1).not.toMatch(/NaN|undefined|Infinity|Invalid Date/);
    // Aucun bouton mort : tout onglet interactif possède un gestionnaire.
    const buttons = first.root.findAll((n) => n.props?.accessibilityRole === 'button', { deep: true });
    for (const b of buttons) if ('onPress' in (b.props ?? {})) expect(typeof b.props.onPress).toBe('function');
    act(() => first.unmount());
    const second = mount();
    expect(JSON.stringify(second.toJSON())).toBe(json1); // remontage → rendu identique
    act(() => second.unmount());
  });
});
