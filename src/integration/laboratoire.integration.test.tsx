/**
 * @jest-environment node
 *
 * Test d'intégration RENDU de l'écran LABORATOIRE de production (`app/(tabs)/laboratoire.tsx`) monté
 * SANS `ProgressProvider` (l'atelier n'utilise AUCUNE progression). Prouve, sur l'écran RÉEL et des
 * moteurs/données DÉTERMINISTES :
 *  - identité d'écran (H1 unique « Laboratoire ») et route préservée (module `(tabs)/laboratoire`) ;
 *  - 4 expériences, UNE SEULE active à la fois — les graphiques/scènes des activités inactives ne sont
 *    PAS montés (`InteractiveChart`/`MarketReplayChart`/`IndicatorPanel`) ;
 *  - lecture guidée : scénarios issus de `CHART_SCENARIOS`, changement déterministe, replay borné +
 *    remis à zéro au changement, compteur contextuel, repères masqués absents de l'arbre a11y, Toto/Bobo
 *    alignés sur le scénario ;
 *  - tracé de support : validation impossible avant placement (raison), placement réel + close/retry via
 *    `isLevelClose`, feedback DISTINCT du marché, ≤ 1 complétion par essai ;
 *  - replay volume : révélation complète (≠ maîtrise), ≤ 1 complétion ;
 *  - indicateurs : 3 labs issus d'`INDICATOR_LABS`, paramètre branché sur `configFor`, défaut restauré
 *    au changement de lab, faux signal aligné ;
 *  - analytics : AUCUN `lab_started`/`lab_completed` au montage ; `lab_started` seulement après une
 *    interaction significative (dédupliqué) ; JAMAIS d'évènement de maîtrise/XP/progression ;
 *  - AUCUNE écriture de persistance (AsyncStorage) ; ressources secondaires → routes EXACTES ; aucun
 *    bouton mort ; a11y (noms contextuels, aucun nombre isolé) ; déterminisme après remontage ; aucune
 *    valeur invalide (NaN/undefined/Infinity/Invalid Date).
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
jest.mock('expo-router', () => {
  const state: { calls: unknown[][] } = { calls: [] };
  return {
    __esModule: true,
    __state: state,
    useRouter: () => ({ push: (...a: unknown[]) => state.calls.push(['push', ...a]), replace: () => {}, back: () => {}, navigate: () => {} }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: () => {},
    Link: ({ children }: { children?: unknown }) => children ?? null,
    Stack: { Screen: () => null },
  };
});

import Laboratoire from '@/app/(tabs)/laboratoire';
import { Text as DsText } from '@/design-system';
import { InteractiveChart, MarketReplayChart, generateCandles, priceScale, supportLevel, isLevelClose } from '@/engines/pattern';
import { IndicatorPanel, INDICATOR_LABS, datasetByKey } from '@/engines/visual';
import { CHART_SCENARIOS } from '@/data';
import { recentEvents, clearRecentEvents } from '@/analytics';
import { findEmoji } from './emojiGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoRouter from 'expo-router';

const routerState = (ExpoRouter as unknown as { __state: { calls: unknown[][] } }).__state;

// ── Valeurs déterministes RECALCULÉES depuis les MÊMES moteurs que l'écran (preuve de déterminisme) ──
const SUPPORT_CANDLES = generateCandles(2024, 30);
const SUPPORT_SCALE = priceScale(SUPPORT_CANDLES, 170);
const SUPPORT_TARGET = supportLevel(SUPPORT_CANDLES);
const scenarioTotal = (id: string) => datasetByKey(CHART_SCENARIOS.find((s) => s.id === id)!.datasetKey).length;
const initialVisible = (id: string) => Math.min(6, scenarioTotal(id));
/** Compteur attendu — grammaticalement correct (miroir de l'écran), jamais un nombre nu. */
const revealed = (v: number, t: number) => `${v} bougie${v > 1 ? 's' : ''} révélée${v > 1 ? 's' : ''} sur ${t}`;

// ── Helpers d'arbre (mêmes conventions que les autres tests d'intégration) ──
function pressables(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.onPress === 'function', { deep: true });
}
function textNodes(root: ReactTestInstance, s: string): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.children === 'string' && (n.props.children as string) === s, { deep: true });
}
function hasText(root: ReactTestInstance, s: string): boolean {
  return textNodes(root, s).length > 0;
}
function pressAncestor(node?: ReactTestInstance): ReactTestInstance | undefined {
  let p: ReactTestInstance | null | undefined = node;
  while (p) { if (typeof p.props?.onPress === 'function') return p; p = p.parent; }
  return undefined;
}
function pressByText(root: ReactTestInstance, text: string) {
  const p = pressAncestor(textNodes(root, text)[0]);
  if (!p) throw new Error(`bouton (texte) introuvable: ${text}`);
  act(() => (p.props.onPress as () => void)());
}
function pressByA11y(root: ReactTestInstance, label: string) {
  const p = pressables(root).find((n) => String(n.props.accessibilityLabel ?? '') === label);
  if (!p) throw new Error(`bouton (a11y) introuvable: ${label}`);
  act(() => (p.props.onPress as () => void)());
}
function buttonByText(root: ReactTestInstance, text: string): ReactTestInstance {
  const p = pressAncestor(textNodes(root, text)[0]);
  if (!p) throw new Error(`Pressable introuvable pour: ${text}`);
  return p;
}
function chartLayout(root: ReactTestInstance, width = 360) {
  const nodes = root.findAll((n) => typeof n.props?.onLayout === 'function', { deep: true });
  act(() => nodes.forEach((n) => (n.props.onLayout as (e: unknown) => void)({ nativeEvent: { layout: { width, height: 170, x: 0, y: 0 } } })));
}
function a11yLabels(root: ReactTestInstance): string[] {
  return root.findAll((n) => typeof n.props?.accessibilityLabel === 'string', { deep: true }).map((n) => n.props.accessibilityLabel as string);
}
function assertNoLoneNumbers(root: ReactTestInstance) {
  const lone = a11yLabels(root).filter((l) => /^\s*\d+([.,]\d+)?\s*%?\s*$/.test(l));
  expect(lone).toEqual([]);
}
function json(r: ReactTestRenderer): string {
  return JSON.stringify(r.toJSON());
}
function assertNoInvalid(r: ReactTestRenderer) {
  expect(json(r)).not.toMatch(/NaN|undefined|Infinity|Invalid Date/);
}

const started = () => recentEvents().filter((e) => e.event === 'lab_started');
const completed = () => recentEvents().filter((e) => e.event === 'lab_completed');
const allEventNames = () => recentEvents().map((e) => e.event);

async function flush() { for (let i = 0; i < 6; i++) await act(async () => { await Promise.resolve(); }); }
async function mount(): Promise<ReactTestRenderer> {
  let r!: ReactTestRenderer;
  await act(async () => { r = create(createElement(Laboratoire)); });
  await flush();
  return r;
}

beforeEach(async () => {
  routerState.calls.length = 0;
  clearRecentEvents();
  (AsyncStorage.setItem as jest.Mock).mockClear();
  await AsyncStorage.clear();
  (AsyncStorage.setItem as jest.Mock).mockClear();
});

describe('Laboratoire de production — une activité à la fois, essais (pas de maîtrise), a11y (LOT 4-G)', () => {
  it('identité + 4 expériences + activité par défaut isolée, AUCUN évènement au montage', async () => {
    const r = await mount();
    const root = r.root;

    // H1 unique — une SEULE occurrence au niveau du composant `Text` (on ignore les couches-hôtes).
    expect(root.findAll((n) => n.type === DsText && n.props?.children === 'Laboratoire', { deep: true })).toHaveLength(1);
    // 4 expériences (pastilles) — libellés complets en nom accessible.
    for (const label of ['Lecture guidée', 'Tracer un support', 'Replay volume', 'Indicateurs']) {
      expect(pressables(root).some((n) => String(n.props.accessibilityLabel ?? '') === label)).toBe(true);
    }
    // Activité par défaut = lecture guidée : SEULE sa carte est montée.
    expect(hasText(root, 'Lecture guidée')).toBe(true);
    expect(hasText(root, 'Tracer un support')).toBe(false); // titre de carte (le pill affiche « Support »)
    expect(hasText(root, 'Replay volume')).toBe(false);
    expect(hasText(root, 'Indicateurs')).toBe(false);
    // Les graphiques/scènes des activités INACTIVES ne sont pas montés.
    expect(root.findAllByType(MarketReplayChart)).toHaveLength(1); // guidée
    expect(root.findAllByType(InteractiveChart)).toHaveLength(0); // support inactif
    expect(root.findAllByType(IndicatorPanel)).toHaveLength(0); // indicateurs inactif

    // Aucun évènement analytics au montage.
    expect(started()).toHaveLength(0);
    expect(completed()).toHaveLength(0);

    // A11y de base + pas d'emoji + aucune valeur invalide.
    expect(findEmoji(json(r))).toEqual([]);
    assertNoLoneNumbers(root);
    assertNoInvalid(r);
    await act(async () => r.unmount());
  });

  it('lecture guidée : scénarios de CHART_SCENARIOS, changement déterministe, Toto/Bobo alignés, replay remis à zéro', async () => {
    const r = await mount();
    const root = r.root;
    const s0 = CHART_SCENARIOS[0];
    const s1 = CHART_SCENARIOS[1];

    // Scénario initial : question + hypothèses alignées.
    expect(hasText(root, s0.question)).toBe(true);
    expect(hasText(root, s0.toto)).toBe(true);
    expect(hasText(root, s0.bobo)).toBe(true);
    // Compteur contextuel initial.
    expect(a11yLabels(root)).toContain(revealed(initialVisible(s0.id), scenarioTotal(s0.id)));

    // Avance d'une bougie (interaction significative → lab_started dédupliqué).
    pressByText(root, 'Suivante');
    pressByText(root, 'Suivante');
    expect(a11yLabels(r.root)).toContain(revealed(initialVisible(s0.id) + 2, scenarioTotal(s0.id)));
    expect(started().filter((e) => e.props?.scenario === `read:${s0.id}`)).toHaveLength(1); // dédupliqué

    // Change de scénario → déterministe (question/Toto/Bobo de s1) ET replay remis au visible initial.
    pressByText(r.root, s1.title);
    expect(hasText(r.root, s1.question)).toBe(true);
    expect(hasText(r.root, s1.toto)).toBe(true);
    expect(hasText(r.root, s0.question)).toBe(false);
    expect(a11yLabels(r.root)).toContain(revealed(initialVisible(s1.id), scenarioTotal(s1.id)));
    await act(async () => r.unmount());
  });

  it('lecture guidée : repères masqués par défaut (absents de l’arbre a11y) puis révélés et groupés', async () => {
    const r = await mount();
    const root = r.root;
    const s0 = CHART_SCENARIOS[0];
    const marker = s0.annotations[0];

    // Masqués : ni le libellé ni un nom accessible du repère.
    expect(hasText(root, marker.label)).toBe(false);
    expect(a11yLabels(root).some((l) => l.includes(marker.label))).toBe(false);

    // Révèle → chaque repère est un élément accessible groupé « label. detail ».
    pressByA11y(root, 'Afficher les repères à observer');
    expect(hasText(r.root, marker.label)).toBe(true);
    expect(a11yLabels(r.root)).toContain(`${marker.label}. ${marker.detail}`);
    await act(async () => r.unmount());
  });

  it('lecture guidée : contrôles de replay bornés (fin désactivée à la fin, début désactivé au retour)', async () => {
    const r = await mount();
    const s0 = CHART_SCENARIOS[0];
    const total = scenarioTotal(s0.id);
    // La série démarre à 6 bougies révélées (min(6,total)) : on peut donc reculer, mais pas au-delà.
    // Fin atteinte → « Suivante »/« Tout révéler » désactivés ; « Début »/« Précédente » actifs.
    pressByText(r.root, 'Tout révéler');
    expect(a11yLabels(r.root)).toContain(revealed(total, total));
    expect(buttonByText(r.root, 'Suivante').props.accessibilityState?.disabled).toBe(true);
    expect(buttonByText(r.root, 'Tout révéler').props.accessibilityState?.disabled).toBe(true);
    expect(buttonByText(r.root, 'Début').props.accessibilityState?.disabled).toBe(false);
    // Retour au début → « Début »/« Précédente » désactivés ; « Suivante » réactivé.
    pressByText(r.root, 'Début');
    expect(a11yLabels(r.root)).toContain(revealed(1, total));
    expect(buttonByText(r.root, 'Début').props.accessibilityState?.disabled).toBe(true);
    expect(buttonByText(r.root, 'Précédente').props.accessibilityState?.disabled).toBe(true);
    expect(buttonByText(r.root, 'Suivante').props.accessibilityState?.disabled).toBe(false);
    await act(async () => r.unmount());
  });

  it('tracé de support : validation impossible avant placement, placement réel, close/retry via isLevelClose, ≤1 complétion/essai', async () => {
    const r = await mount();
    pressByA11y(r.root, 'Tracer un support'); // bascule d'activité
    await flush();

    // Une seule activité montée : la lecture guidée est démontée.
    expect(hasText(r.root, 'Tracer un support')).toBe(true);
    expect(hasText(r.root, 'Lecture guidée')).toBe(false);

    // Validation bloquée avant placement (raison exposée).
    const validate = buttonByText(r.root, 'Valider mon tracé');
    expect(validate.props.accessibilityState?.disabled).toBe(true);
    expect(hasText(r.root, 'Place d’abord ta ligne sur le graphique.')).toBe(true);

    // Mesure d'écran → le graphique interactif se monte (responsive depuis l'écran, borné à 520).
    chartLayout(r.root, 360);
    const chart = r.root.findAllByType(InteractiveChart);
    expect(chart).toHaveLength(1);
    expect(chart[0].props.width).toBe(360);

    // Placement RÉEL exact sur le creux de référence (le callback que le graphique invoque au toucher).
    clearRecentEvents();
    act(() => (chart[0].props.onPickPrice as (p: number) => void)(SUPPORT_TARGET));
    pressByText(r.root, 'Valider mon tracé');
    // close déterministe via isLevelClose (tolérance du moteur), feedback positif DISTINCT du marché.
    expect(isLevelClose(SUPPORT_TARGET, SUPPORT_TARGET, SUPPORT_SCALE.range)).toBe(true);
    expect(hasText(r.root, 'Placement proche du creux de référence.')).toBe(true);
    // Exactement UNE complétion pour cet essai.
    expect(completed()).toHaveLength(1);
    expect(completed()[0].props?.scenario).toBe('trace_support');
    assertNoInvalid(r);

    // Réessayer ré-arme un nouvel essai ; un placement clairement éloigné → « à revoir ».
    pressByText(r.root, 'Réessayer');
    chartLayout(r.root, 360);
    const chart2 = r.root.findAllByType(InteractiveChart)[0];
    clearRecentEvents();
    act(() => (chart2.props.onPickPrice as (p: number) => void)(SUPPORT_SCALE.max));
    pressByText(r.root, 'Valider mon tracé');
    expect(isLevelClose(SUPPORT_SCALE.max, SUPPORT_TARGET, SUPPORT_SCALE.range)).toBe(false);
    expect(hasText(r.root, 'À revoir : le repère se pose sur le creux le plus bas, pas au milieu.')).toBe(true);
    expect(completed()).toHaveLength(1); // toujours ≤ 1 par essai
    await act(async () => r.unmount());
  });

  it('replay volume : révélation complète (≠ maîtrise), une seule complétion', async () => {
    const r = await mount();
    pressByA11y(r.root, 'Replay volume');
    await flush();

    // Une seule activité : chart de replay monté, pas d'interactif/indicateur.
    expect(root_has(r, MarketReplayChart, 1));
    expect(r.root.findAllByType(InteractiveChart)).toHaveLength(0);
    expect(r.root.findAllByType(IndicatorPanel)).toHaveLength(0);

    clearRecentEvents();
    pressByText(r.root, 'Tout révéler');
    // Chip de fin + rappel « ≠ maîtrise ».
    expect(hasText(r.root, 'Séquence entièrement révélée')).toBe(true);
    expect(hasText(r.root, '« Séquence entièrement révélée » signifie seulement que tu as tout déroulé — jamais une maîtrise.')).toBe(true);
    expect(completed()).toHaveLength(1);
    expect(completed()[0].props?.scenario).toBe('volume_replay');
    assertNoInvalid(r);
    await act(async () => r.unmount());
  });

  it('indicateurs : 3 labs d’INDICATOR_LABS, paramètre branché sur configFor, défaut restauré au changement de lab', async () => {
    const r = await mount();
    pressByA11y(r.root, 'Indicateurs');
    await flush();

    // Les 3 labs sont proposés (titres), le panneau reçoit la config par défaut (RSI période 14).
    for (const l of INDICATOR_LABS) expect(hasText(r.root, l.title)).toBe(true);
    const rsi = INDICATOR_LABS[0];
    expect(r.root.findAllByType(IndicatorPanel)[0].props.config).toEqual(rsi.configFor(rsi.defaultValue));

    // Ajuste le paramètre → configFor(nouvelle valeur) (ex. 21).
    pressByText(r.root, rsi.formatValue(21));
    expect(r.root.findAllByType(IndicatorPanel)[0].props.config).toEqual(rsi.configFor(21));

    // Change de lab → paramètre par défaut restauré + faux signal aligné.
    const boll = INDICATOR_LABS[2];
    pressByText(r.root, boll.title);
    expect(r.root.findAllByType(IndicatorPanel)[0].props.config).toEqual(boll.configFor(boll.defaultValue));
    // Le libellé « Faux signal : … » est un Text à deux enfants ; on vérifie la chaîne de faux signal
    // elle-même (présente dans la ligne d'alerte ET dans la bulle de Bobo).
    expect(hasText(r.root, boll.falseSignal)).toBe(true);
    assertNoInvalid(r);
    await act(async () => r.unmount());
  });

  it('aucune écriture de persistance ; aucun évènement de maîtrise/XP/progression sur tout le parcours', async () => {
    const r = await mount();
    // Parcours les 4 activités + interactions.
    pressByText(r.root, 'Suivante');
    pressByA11y(r.root, 'Tracer un support');
    chartLayout(r.root, 360);
    act(() => (r.root.findAllByType(InteractiveChart)[0].props.onPickPrice as (p: number) => void)(SUPPORT_TARGET));
    pressByText(r.root, 'Valider mon tracé');
    pressByA11y(r.root, 'Replay volume');
    pressByText(r.root, 'Tout révéler');
    pressByA11y(r.root, 'Indicateurs');
    pressByText(r.root, INDICATOR_LABS[2].title);
    await flush();

    // Le Laboratoire ne PERSISTE rien.
    expect(AsyncStorage.setItem as jest.Mock).not.toHaveBeenCalled();
    // Seuls des évènements d'ESSAI existent — jamais de maîtrise/XP/progression.
    expect(allEventNames().every((n) => n === 'lab_started' || n === 'lab_completed')).toBe(true);
    await act(async () => r.unmount());
  });

  it('ressources secondaires → routes EXACTES ; aucun bouton mort', async () => {
    const r = await mount();
    const routes: Record<string, string> = {
      'Bibliothèque': '/apprendre',
      'Bibliothèque visuelle': '/bibliotheque-visuelle',
      'Leçon — Le double creux': '/lesson/lesson.double-bottom',
    };
    for (const [label, route] of Object.entries(routes)) {
      routerState.calls.length = 0;
      pressByA11y(r.root, label);
      expect(routerState.calls.filter((c) => c[0] === 'push')).toEqual([['push', route]]);
    }
    // Aucun bouton mort : tout élément qui DÉCLARE `onPress` porte un vrai gestionnaire (jamais
    // undefined/null). On ignore les vues-hôtes rendues par Pressable (rôle « button » sans `onPress`).
    const buttons = r.root.findAll((n) => n.props?.accessibilityRole === 'button', { deep: true });
    expect(buttons.length).toBeGreaterThan(0);
    for (const b of buttons) {
      if ('onPress' in (b.props ?? {})) expect(typeof b.props.onPress).toBe('function');
    }
    // Et il existe bien de vrais éléments interactifs (gestionnaires réels).
    expect(pressables(r.root).length).toBeGreaterThan(3);
    await act(async () => r.unmount());
  });

  it('déterminisme après remontage : valeurs par défaut restaurées ; aucune valeur invalide', async () => {
    const s0 = CHART_SCENARIOS[0];
    const first = await mount();
    // Perturbe l'état : avance le replay, change de scénario, bascule d'activité.
    pressByText(first.root, 'Suivante');
    pressByText(first.root, CHART_SCENARIOS[2].title);
    pressByA11y(first.root, 'Indicateurs');
    await act(async () => first.unmount());

    // Remontage complet → défauts DÉTERMINISTES restaurés.
    const second = await mount();
    expect(second.root.findAllByType(MarketReplayChart)).toHaveLength(1); // retour sur lecture guidée
    expect(hasText(second.root, s0.question)).toBe(true);
    expect(a11yLabels(second.root)).toContain(revealed(initialVisible(s0.id), scenarioTotal(s0.id)));
    assertNoInvalid(second);
    await act(async () => second.unmount());
  });
});

/** Utilitaire : X instances d'un composant montées (message d'erreur lisible). */
function root_has(r: ReactTestRenderer, Comp: Parameters<ReactTestInstance['findAllByType']>[0], n: number): boolean {
  const got = r.root.findAllByType(Comp).length;
  if (got !== n) throw new Error(`attendu ${n} instance(s), obtenu ${got}`);
  return true;
}
