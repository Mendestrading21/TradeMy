/**
 * @jest-environment node
 *
 * LOT 4-L — Test d'intégration RENDU de la FICHE MONDE de production (`app/monde/[id].tsx`) montée
 * dans le `ProgressProvider` RÉEL, sur des états DÉTERMINISTES (seed AsyncStorage).
 *
 * Prouve, sur l'écran RÉEL et la LOGIQUE existante préservée : hydratation déterministe (1er paint =
 * chargement stable, indépendant de l'id) ; `world_opened` UNE fois (introuvable → aucun `world_opened`,
 * `session_not_found` conservé) ; statut/progression = `buildLearningPath` (aucun second calcul) ;
 * PROCHAINE ÉTAPE dérivée de l'état réel (leçon / continuer / réviser / checkpoint / explorer / monde
 * suivant) avec route EXACTE ; trail guidé (terminé/courant/dû/verrouillé + checkpoint) ; étape
 * verrouillée non ouvrable ; monde de contenu = collection honnête (consulté ≠ maîtrisé) ; monde
 * verrouillé sans contenu dévoilé ; monde terminé sans impasse ; aucune mutation de progression au
 * rendu ni à la navigation ; aucun emoji ; remontage déterministe.
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
jest.mock('expo-image', () => ({ __esModule: true, Image: require('react-native').View }));
jest.mock('@/characters', () => ({ __esModule: true, MascotFigure: () => null, CharacterScene: () => null, useReducedMotion: () => false }));
jest.mock('@/engines/visual', () => ({ __esModule: true, MiniVisual: () => null }));
jest.mock('@/lib/useNow', () => ({ __esModule: true, useNow: () => 1_700_000_000_000 }));
jest.mock('expo-router', () => {
  const state: { params: Record<string, unknown>; calls: unknown[][] } = { params: {}, calls: [] };
  return {
    __esModule: true, __state: state,
    useLocalSearchParams: () => state.params,
    useRouter: () => ({
      push: (...a: unknown[]) => state.calls.push(['push', ...a]),
      replace: (...a: unknown[]) => state.calls.push(['replace', ...a]),
      back: () => state.calls.push(['back']), navigate: () => {},
    }),
    useFocusEffect: () => {}, Link: ({ children }: { children?: unknown }) => children ?? null, Stack: { Screen: () => null },
  };
});

import WorldDetail, { generateStaticParams } from '@/app/monde/[id]';
import { ProgressProvider, WORLDS, V5_CONCEPTS, conceptsByWorld, SKILLS, CHECKPOINT_ID, buildLearningPath, worldEntryById, CANDLE_SKILLS, CANDLE_CHECKPOINT_TITLE, CANDLE_CHECKPOINT_ID, STRUCTURE_SKILLS, STRUCTURE_CHECKPOINT_TITLE, STRUCTURE_CHECKPOINT_ID, SR_SKILLS, SR_CHECKPOINT_TITLE, SR_CHECKPOINT_ID, ANATOMY_SKILLS, ANATOMY_CHECKPOINT_ID, ANATOMY_CHECKPOINT_TITLE, PATTERNS_SKILLS, PATTERNS_CHECKPOINT_TITLE, PATTERNS_CHECKPOINT_ID, INDICATORS_SKILLS, INDICATORS_CHECKPOINT_TITLE, INDICATORS_CHECKPOINT_ID, VOLUME_SKILLS, VOLUME_CHECKPOINT_TITLE, VOLUME_CHECKPOINT_ID, PRICEACTION_SKILLS, PRICEACTION_CHECKPOINT_TITLE, PRICEACTION_CHECKPOINT_ID, RISK_SKILLS, RISK_CHECKPOINT_TITLE, RISK_CHECKPOINT_ID, PSYCHOLOGY_SKILLS, PSYCHOLOGY_CHECKPOINT_TITLE, PSYCHOLOGY_CHECKPOINT_ID, SMC_SKILLS, SMC_CHECKPOINT_TITLE, SMC_CHECKPOINT_ID, WYCKOFF_SKILLS, WYCKOFF_CHECKPOINT_TITLE, CONTENT_MODULES, isGuidedWorld } from '@/data';
import { recentEvents, clearRecentEvents } from '@/analytics';
import { findEmoji } from './emojiGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoRouter from 'expo-router';

const routerState = (ExpoRouter as unknown as { __state: { params: Record<string, unknown>; calls: unknown[][] } }).__state;
const NOW = 1_700_000_000_000;
const KEY = 'patternlab.progress.v1';

const ALL_SKILLS = SKILLS.map((s) => s.id);
const WORLD1 = 'world.foundations';
const SORTED = [...WORLDS].sort((a, b) => a.order - b.order);
const WORLD2 = SORTED[1]; // world.anatomy — GUIDÉ depuis le LOT 4-P (ordre 2)
// Premier monde de CONTENU (non guidé, avec concepts) — DYNAMIQUE, robuste aux conversions futures.
const CONTENT_WORLD = SORTED.find((w) => !isGuidedWorld(w.id) && conceptsByWorld(V5_CONCEPTS, w.id).length > 0)!;
const CONTENT_SLUGS = conceptsByWorld(V5_CONCEPTS, CONTENT_WORLD.id).map((c) => c.slug);
// Tous les modules guidés validés (compétences + checkpoints) — préfixe du parcours terminé.
const ALL_GUIDED_DONE_IDS = CONTENT_MODULES.flatMap((m) => [...m.skills.map((s) => s.id), m.checkpointId]);

function seed(json: object) {
  return JSON.stringify({ onboarded: true, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, ...json });
}
async function persist(json: string) {
  await AsyncStorage.clear();
  await AsyncStorage.setItem(KEY, json);
}
function dueSkill(id: string) {
  return { skillId: id, xp: 10, mastery: 0.5, confidence: 0.5, review: { repetitions: 1, easiness: 2.5, intervalDays: 1, dueAt: NOW - 1000 }, errorTags: {} };
}
const NEW = seed({});
const GUIDED_PARTIAL = seed({ completedSkills: [ALL_SKILLS[0]] }); // 1 compétence terminée, non due
const GUIDED_DUE = seed({ completedSkills: [ALL_SKILLS[0]], skills: { [ALL_SKILLS[0]]: dueSkill(ALL_SKILLS[0]) } });
const ALL_SKILLS_DONE = seed({ completedSkills: [...ALL_SKILLS] }); // checkpoint restant
const W1_DONE = seed({ completedSkills: [...ALL_SKILLS, CHECKPOINT_ID] });
// Mondes 1-2 VALIDÉS par la preuve (le monde 2 est guidé depuis le LOT 4-P) → le monde 3 s'ouvre.
const ANATOMY_DONE_IDS = [...ANATOMY_SKILLS.map((s) => s.id), ANATOMY_CHECKPOINT_ID];
const W2_DONE = seed({ completedSkills: [...ALL_SKILLS, CHECKPOINT_ID, ...ANATOMY_DONE_IDS] });
// Mondes 1-3 avancés (…+ Chandeliers validé) → le monde 4 (Structure) s'ouvre.
const W3_DONE = seed({
  completedSkills: [...ALL_SKILLS, CHECKPOINT_ID, ...ANATOMY_DONE_IDS, ...CANDLE_SKILLS.map((s) => s.id), CANDLE_CHECKPOINT_ID],
});
// Mondes 1-4 avancés (…+ Structure validé) → le monde 5 (Supports et résistances) s'ouvre.
const W4_DONE = seed({
  completedSkills: [
    ...ALL_SKILLS, CHECKPOINT_ID, ...ANATOMY_DONE_IDS,
    ...CANDLE_SKILLS.map((s) => s.id), CANDLE_CHECKPOINT_ID,
    ...STRUCTURE_SKILLS.map((s) => s.id), STRUCTURE_CHECKPOINT_ID,
  ],
});
// Mondes 1-5 avancés (…+ Niveaux validé) → le monde 6 (Figures chartistes) s'ouvre.
const W5_DONE = seed({
  completedSkills: [
    ...ALL_SKILLS, CHECKPOINT_ID, ...ANATOMY_DONE_IDS,
    ...CANDLE_SKILLS.map((s) => s.id), CANDLE_CHECKPOINT_ID,
    ...STRUCTURE_SKILLS.map((s) => s.id), STRUCTURE_CHECKPOINT_ID,
    ...SR_SKILLS.map((s) => s.id), SR_CHECKPOINT_ID,
  ],
});
// Mondes 1-6 avancés (…+ Figures validé) → le monde 7 (Indicateurs techniques) s'ouvre.
const W6_DONE = seed({
  completedSkills: [
    ...ALL_SKILLS, CHECKPOINT_ID, ...ANATOMY_DONE_IDS,
    ...CANDLE_SKILLS.map((s) => s.id), CANDLE_CHECKPOINT_ID,
    ...STRUCTURE_SKILLS.map((s) => s.id), STRUCTURE_CHECKPOINT_ID,
    ...SR_SKILLS.map((s) => s.id), SR_CHECKPOINT_ID,
    ...PATTERNS_SKILLS.map((s) => s.id), PATTERNS_CHECKPOINT_ID,
  ],
});
// Mondes 1-7 avancés (…+ Indicateurs validé) → le monde 8 (Volume) s'ouvre.
const W7_DONE = seed({
  completedSkills: [
    ...ALL_SKILLS, CHECKPOINT_ID, ...ANATOMY_DONE_IDS,
    ...CANDLE_SKILLS.map((s) => s.id), CANDLE_CHECKPOINT_ID,
    ...STRUCTURE_SKILLS.map((s) => s.id), STRUCTURE_CHECKPOINT_ID,
    ...SR_SKILLS.map((s) => s.id), SR_CHECKPOINT_ID,
    ...PATTERNS_SKILLS.map((s) => s.id), PATTERNS_CHECKPOINT_ID,
    ...INDICATORS_SKILLS.map((s) => s.id), INDICATORS_CHECKPOINT_ID,
  ],
});
// Mondes 1-8 avancés (…+ Volume validé) → le monde 9 (Price action) s'ouvre.
const W8_DONE = seed({
  completedSkills: [
    ...ALL_SKILLS, CHECKPOINT_ID, ...ANATOMY_DONE_IDS,
    ...CANDLE_SKILLS.map((s) => s.id), CANDLE_CHECKPOINT_ID,
    ...STRUCTURE_SKILLS.map((s) => s.id), STRUCTURE_CHECKPOINT_ID,
    ...SR_SKILLS.map((s) => s.id), SR_CHECKPOINT_ID,
    ...PATTERNS_SKILLS.map((s) => s.id), PATTERNS_CHECKPOINT_ID,
    ...INDICATORS_SKILLS.map((s) => s.id), INDICATORS_CHECKPOINT_ID,
    ...VOLUME_SKILLS.map((s) => s.id), VOLUME_CHECKPOINT_ID,
  ],
});
// Mondes 1-9 avancés (…+ Price action validé) → le monde 10 (Risk management) s'ouvre.
const W9_DONE = seed({
  completedSkills: [
    ...ALL_SKILLS, CHECKPOINT_ID, ...ANATOMY_DONE_IDS,
    ...CANDLE_SKILLS.map((s) => s.id), CANDLE_CHECKPOINT_ID,
    ...STRUCTURE_SKILLS.map((s) => s.id), STRUCTURE_CHECKPOINT_ID,
    ...SR_SKILLS.map((s) => s.id), SR_CHECKPOINT_ID,
    ...PATTERNS_SKILLS.map((s) => s.id), PATTERNS_CHECKPOINT_ID,
    ...INDICATORS_SKILLS.map((s) => s.id), INDICATORS_CHECKPOINT_ID,
    ...VOLUME_SKILLS.map((s) => s.id), VOLUME_CHECKPOINT_ID,
    ...PRICEACTION_SKILLS.map((s) => s.id), PRICEACTION_CHECKPOINT_ID,
  ],
});
// Mondes 1-10 avancés (…+ Risk validé) → le monde 11 (Psychologie et biais) s'ouvre.
const W10_DONE = seed({
  completedSkills: [
    ...ALL_SKILLS, CHECKPOINT_ID, ...ANATOMY_DONE_IDS,
    ...CANDLE_SKILLS.map((s) => s.id), CANDLE_CHECKPOINT_ID,
    ...STRUCTURE_SKILLS.map((s) => s.id), STRUCTURE_CHECKPOINT_ID,
    ...SR_SKILLS.map((s) => s.id), SR_CHECKPOINT_ID,
    ...PATTERNS_SKILLS.map((s) => s.id), PATTERNS_CHECKPOINT_ID,
    ...INDICATORS_SKILLS.map((s) => s.id), INDICATORS_CHECKPOINT_ID,
    ...VOLUME_SKILLS.map((s) => s.id), VOLUME_CHECKPOINT_ID,
    ...PRICEACTION_SKILLS.map((s) => s.id), PRICEACTION_CHECKPOINT_ID,
    ...RISK_SKILLS.map((s) => s.id), RISK_CHECKPOINT_ID,
  ],
});
// Mondes 1-11 avancés (…+ Psychologie validé) → le monde 12 (Smart Money Concepts) s'ouvre.
const W11_DONE = seed({
  completedSkills: [
    ...ALL_SKILLS, CHECKPOINT_ID, ...ANATOMY_DONE_IDS,
    ...CANDLE_SKILLS.map((s) => s.id), CANDLE_CHECKPOINT_ID,
    ...STRUCTURE_SKILLS.map((s) => s.id), STRUCTURE_CHECKPOINT_ID,
    ...SR_SKILLS.map((s) => s.id), SR_CHECKPOINT_ID,
    ...PATTERNS_SKILLS.map((s) => s.id), PATTERNS_CHECKPOINT_ID,
    ...INDICATORS_SKILLS.map((s) => s.id), INDICATORS_CHECKPOINT_ID,
    ...VOLUME_SKILLS.map((s) => s.id), VOLUME_CHECKPOINT_ID,
    ...PRICEACTION_SKILLS.map((s) => s.id), PRICEACTION_CHECKPOINT_ID,
    ...RISK_SKILLS.map((s) => s.id), RISK_CHECKPOINT_ID,
    ...PSYCHOLOGY_SKILLS.map((s) => s.id), PSYCHOLOGY_CHECKPOINT_ID,
  ],
});
// Mondes 1-12 avancés (…+ SMC validé) → le monde 13 (Wyckoff) s'ouvre.
const W12_DONE = seed({
  completedSkills: [
    ...ALL_SKILLS, CHECKPOINT_ID, ...ANATOMY_DONE_IDS,
    ...CANDLE_SKILLS.map((s) => s.id), CANDLE_CHECKPOINT_ID,
    ...STRUCTURE_SKILLS.map((s) => s.id), STRUCTURE_CHECKPOINT_ID,
    ...SR_SKILLS.map((s) => s.id), SR_CHECKPOINT_ID,
    ...PATTERNS_SKILLS.map((s) => s.id), PATTERNS_CHECKPOINT_ID,
    ...INDICATORS_SKILLS.map((s) => s.id), INDICATORS_CHECKPOINT_ID,
    ...VOLUME_SKILLS.map((s) => s.id), VOLUME_CHECKPOINT_ID,
    ...PRICEACTION_SKILLS.map((s) => s.id), PRICEACTION_CHECKPOINT_ID,
    ...RISK_SKILLS.map((s) => s.id), RISK_CHECKPOINT_ID,
    ...PSYCHOLOGY_SKILLS.map((s) => s.id), PSYCHOLOGY_CHECKPOINT_ID,
    ...SMC_SKILLS.map((s) => s.id), SMC_CHECKPOINT_ID,
  ],
});
// Tous les mondes guidés validés → le premier monde de CONTENU est ouvert.
const GUIDED_ALL_DONE = seed({ completedSkills: ALL_GUIDED_DONE_IDS });
const CONTENT_EXPLORED = seed({ completedSkills: ALL_GUIDED_DONE_IDS, learning: { conceptsExplored: CONTENT_SLUGS } });

function pressables(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.onPress === 'function', { deep: true });
}
function byLabel(root: ReactTestInstance, label: string): ReactTestInstance | undefined {
  return pressables(root).find((n) => String(n.props.accessibilityLabel ?? '') === label);
}
function ctaWithHint(root: ReactTestInstance, sub: string): ReactTestInstance | undefined {
  return pressables(root).find((n) => String(n.props.accessibilityHint ?? '').includes(sub));
}
function hasText(root: ReactTestInstance, s: string): boolean {
  return root.findAll((n) => typeof n.props?.children === 'string' && (n.props.children as string) === s, { deep: true }).length > 0;
}
function hasTextIncluding(root: ReactTestInstance, sub: string): boolean {
  return root.findAll((n) => typeof n.props?.children === 'string' && (n.props.children as string).includes(sub), { deep: true }).length > 0;
}
const pushes = () => routerState.calls.filter((c) => c[0] === 'push').map((c) => c[1]);
const replaces = () => routerState.calls.filter((c) => c[0] === 'replace').map((c) => c[1]);
const worldOpened = () => recentEvents().filter((e) => e.event === 'world_opened');

async function flush(): Promise<void> {
  for (let i = 0; i < 8; i++) await act(async () => { await Promise.resolve(); });
}
function firstPaint(worldId: string): ReactTestRenderer {
  routerState.params = { id: worldId };
  let r!: ReactTestRenderer;
  act(() => { r = create(createElement(ProgressProvider, null, createElement(WorldDetail))); });
  return r;
}
async function mount(worldId: string): Promise<ReactTestRenderer> {
  const r = firstPaint(worldId);
  await flush();
  return r;
}

beforeEach(() => { routerState.params = {}; routerState.calls.length = 0; clearRecentEvents(); });

describe('Fiche Monde de production — canon, vérité pédagogique, a11y (LOT 4-L)', () => {
  // ─── Route & paramètres statiques ─────────────────────────────────────────
  it('generateStaticParams == ids de WORLDS (ordre, unicité, complet, jamais [id])', async () => {
    const got = (await generateStaticParams()).map((p) => p.id);
    expect(got).toEqual(WORLDS.map((w) => w.id));
    expect(new Set(got).size).toBe(got.length);
    expect(got).not.toContain('[id]');
    expect(got.length).toBe(15);
  });

  // ─── Chargement ───────────────────────────────────────────────────────────
  it('1er paint = chargement STABLE (indépendant de l’id) ; contenu réel après hydratation ; world_opened une fois', async () => {
    await persist(NEW);
    const r = firstPaint(WORLD1);
    expect(hasTextIncluding(r.root, 'On ouvre le monde')).toBe(true);
    expect(hasText(r.root, 'Fondations des marchés')).toBe(false); // aucun contenu de monde avant `ready`
    await flush();
    expect(hasText(r.root, 'Fondations des marchés')).toBe(true);
    expect(worldOpened()).toHaveLength(1); // pas de double émission via la transition de chargement
    await act(async () => r.unmount());
  });

  // ─── Monde introuvable ──────────────────────────────────────────────────────
  it('monde introuvable : titre explicite, CTA vers /parcours, AUCUN world_opened', async () => {
    await persist(NEW);
    const r = await mount('world.nexiste-pas');
    expect(hasText(r.root, 'Monde introuvable')).toBe(true);
    expect(hasText(r.root, 'Fondations des marchés')).toBe(false); // aucun contenu d’un autre monde
    const cta = pressables(r.root).find((n) => hasTextIncluding(n, 'parcours') || String(n.props.accessibilityLabel ?? '').includes('parcours'));
    // Le bouton « Voir le parcours » déclenche router.replace('/parcours').
    const btn = pressables(r.root)[0];
    act(() => (btn!.props.onPress as () => void)());
    expect(replaces()).toContain('/parcours');
    expect(worldOpened()).toHaveLength(0);
    expect(recentEvents().some((e) => e.event === 'session_not_found')).toBe(true);
    void cta;
    await act(async () => r.unmount());
  });

  // ─── Monde verrouillé ───────────────────────────────────────────────────────
  it('monde verrouillé : raison réelle, AUCUNE étape ouvrable, CTA parcours, pas de contenu dévoilé', async () => {
    await persist(NEW); // world 1 non exploré → world 2 verrouillé
    const r = await mount(WORLD2.id);
    expect(hasText(r.root, WORLD2.title)).toBe(true);
    expect(hasText(r.root, 'Verrouillé')).toBe(true);
    // Raison réelle issue du chemin.
    const path = buildLearningPath(WORLDS, V5_CONCEPTS, { completedSkills: [], exploredSlugs: [] });
    const reason = worldEntryById(path, WORLD2.id)!.lockReason!;
    expect(hasText(r.root, reason)).toBe(true);
    // Aucune fiche/notion ni prochaine étape ouvrable dévoilée (pas de push vers concept/session).
    const onlyReplace = routerState.calls.every((c) => c[0] !== 'push');
    expect(onlyReplace).toBe(true);
    // CTA parcours.
    const btn = pressables(r.root).find((n) => typeof n.props.onPress === 'function');
    act(() => (btn!.props.onPress as () => void)());
    expect(replaces()).toContain('/parcours');
    await act(async () => r.unmount());
  });

  // ─── Monde guidé disponible ─────────────────────────────────────────────────
  it('guidé, nouvel utilisateur : héros, progression réelle, prochaine étape = leçon → /session/skill.actions', async () => {
    await persist(NEW);
    const r = await mount(WORLD1);
    expect(hasText(r.root, 'Fondations des marchés')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    // Prochaine étape = première compétence, CTA « Commencer la leçon ».
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${ALL_SKILLS[0]}`);
    await act(async () => r.unmount());
  });

  it('guidé, étape verrouillée NON ouvrable ; compétence courante ouvrable → /session', async () => {
    await persist(GUIDED_PARTIAL);
    const r = await mount(WORLD1);
    // La 1re compétence est terminée ; la 2e est courante ; la 3e est verrouillée.
    const currentNode = byLabel(r.root, `${SKILLS[1].name} — Prochaine étape`);
    expect(currentNode).toBeDefined();
    expect(currentNode!.props.accessibilityState?.disabled ?? false).toBe(false);
    const lockedNode = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${SKILLS[2].name} —`));
    expect(lockedNode).toBeDefined();
    expect(lockedNode!.props.accessibilityState?.disabled).toBe(true);
    // Ouvrir la verrouillée ne pousse aucune route.
    act(() => (lockedNode!.props.onPress as () => void)());
    expect(pushes().some((p) => typeof p === 'string' && p.startsWith('/session/'))).toBe(false);
    // Ouvrir la courante pousse vers sa session.
    act(() => (currentNode!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${SKILLS[1].id}`);
    await act(async () => r.unmount());
  });

  it('guidé : navigation vers la notion liée d’une compétence (/concept/[slug])', async () => {
    await persist(NEW);
    const r = await mount(WORLD1);
    const discover = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith('Découvrir la notion liée à'));
    expect(discover).toBeDefined();
    act(() => (discover!.props.onPress as () => void)());
    expect(pushes().some((p) => typeof p === 'string' && p.startsWith('/concept/'))).toBe(true);
    await act(async () => r.unmount());
  });

  // ─── LOT 4-M — 2e monde GUIDÉ réel (Chandeliers) surfacé sur SA fiche ────────
  it('guidé Chandeliers (monde 3) : ses 4 compétences + checkpoint PROPRE surfacent, notion liée ouvrable', async () => {
    // Mondes 1-2 validés par la preuve → world 3 (Chandeliers) « en cours ».
    await persist(W2_DONE);
    const r = await mount('world.candles');
    expect(hasText(r.root, 'Chandeliers japonais')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    // Les 4 compétences du module Chandeliers surfacent (nœuds de la carte du monde).
    for (const s of CANDLE_SKILLS) {
      const node = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${s.name} —`));
      expect(node).toBeDefined();
    }
    // Le checkpoint PROPRE du module surface (jamais celui de Fondations).
    expect(hasTextIncluding(r.root, CANDLE_CHECKPOINT_TITLE)).toBe(true);
    // La prochaine étape = 1re compétence Chandeliers → /session/skill.candle.pressure.
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${CANDLE_SKILLS[0].id}`);
    // La notion liée d’une compétence Chandeliers est ouvrable (/concept/<slug candle>).
    const discover = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith('Découvrir la notion liée à'));
    expect(discover).toBeDefined();
    act(() => (discover!.props.onPress as () => void)());
    expect(pushes().some((p) => typeof p === 'string' && p.startsWith('/concept/'))).toBe(true);
    await act(async () => r.unmount());
  });

  it('guidé Anatomie (monde 2, LOT 4-P) : ses 3 compétences + checkpoint PROPRE surfacent dès Fondations terminées', async () => {
    await persist(W1_DONE); // monde 1 validé → monde 2 (guidé) « en cours »
    const r = await mount('world.anatomy');
    expect(hasText(r.root, 'Anatomie d’un graphique')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    for (const s of ANATOMY_SKILLS) {
      const node = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${s.name} —`));
      expect(node).toBeDefined();
    }
    expect(hasTextIncluding(r.root, ANATOMY_CHECKPOINT_TITLE)).toBe(true);
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${ANATOMY_SKILLS[0].id}`);
    await act(async () => r.unmount());
  });

  it('guidé Structure (monde 4, LOT 4-N) : ses 4 compétences + checkpoint PROPRE surfacent, prochaine étape correcte', async () => {
    // Mondes 1-3 avancés → le monde 4 (Tendances et structure) est « en cours ».
    await persist(W3_DONE);
    const r = await mount('world.structure');
    expect(hasText(r.root, 'Tendances et structure')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    // Les 4 compétences du module Structure surfacent (nœuds de la carte du monde).
    for (const s of STRUCTURE_SKILLS) {
      const node = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${s.name} —`));
      expect(node).toBeDefined();
    }
    // Le checkpoint PROPRE du module surface (jamais ceux de Fondations ou des Chandeliers).
    expect(hasTextIncluding(r.root, STRUCTURE_CHECKPOINT_TITLE)).toBe(true);
    // La prochaine étape = 1re compétence Structure → /session/skill.structure.uptrend.
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${STRUCTURE_SKILLS[0].id}`);
    // La notion liée d'une compétence Structure est ouvrable (/concept/<slug structure>).
    const discover = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith('Découvrir la notion liée à'));
    expect(discover).toBeDefined();
    act(() => (discover!.props.onPress as () => void)());
    expect(pushes().some((p) => typeof p === 'string' && p.startsWith('/concept/'))).toBe(true);
    await act(async () => r.unmount());
  });

  it('guidé Figures (monde 6, LOT 4-Q) : ses 4 compétences + checkpoint PROPRE surfacent, prochaine étape correcte', async () => {
    // Mondes 1-5 validés → le monde 6 (Figures chartistes) est « en cours ».
    await persist(W5_DONE);
    const r = await mount('world.patterns');
    expect(hasText(r.root, 'Figures chartistes')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    for (const s of PATTERNS_SKILLS) {
      const node = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${s.name} —`));
      expect(node).toBeDefined();
    }
    expect(hasTextIncluding(r.root, PATTERNS_CHECKPOINT_TITLE)).toBe(true);
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${PATTERNS_SKILLS[0].id}`);
    await act(async () => r.unmount());
  });

  it('guidé Indicateurs (monde 7, LOT 4-R) : ses 4 compétences + checkpoint PROPRE surfacent, prochaine étape correcte', async () => {
    // Mondes 1-6 validés → le monde 7 (Indicateurs techniques) est « en cours ».
    await persist(W6_DONE);
    const r = await mount('world.indicators');
    expect(hasText(r.root, 'Indicateurs techniques')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    for (const s of INDICATORS_SKILLS) {
      const node = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${s.name} —`));
      expect(node).toBeDefined();
    }
    expect(hasTextIncluding(r.root, INDICATORS_CHECKPOINT_TITLE)).toBe(true);
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${INDICATORS_SKILLS[0].id}`);
    await act(async () => r.unmount());
  });

  it('guidé Volume (monde 8, LOT 4-S) : ses 3 compétences + checkpoint PROPRE surfacent, prochaine étape correcte', async () => {
    // Mondes 1-7 validés → le monde 8 (Volume et volume profile) est « en cours ».
    await persist(W7_DONE);
    const r = await mount('world.volume');
    expect(hasText(r.root, 'Volume et volume profile')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    for (const s of VOLUME_SKILLS) {
      const node = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${s.name} —`));
      expect(node).toBeDefined();
    }
    expect(hasTextIncluding(r.root, VOLUME_CHECKPOINT_TITLE)).toBe(true);
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${VOLUME_SKILLS[0].id}`);
    await act(async () => r.unmount());
  });

  it('guidé Price action (monde 9, LOT 4-T) : ses 3 compétences + checkpoint PROPRE surfacent, prochaine étape correcte', async () => {
    // Mondes 1-8 validés → le monde 9 (Price action) est « en cours ».
    await persist(W8_DONE);
    const r = await mount('world.price-action');
    expect(hasText(r.root, 'Price action')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    for (const s of PRICEACTION_SKILLS) {
      const node = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${s.name} —`));
      expect(node).toBeDefined();
    }
    expect(hasTextIncluding(r.root, PRICEACTION_CHECKPOINT_TITLE)).toBe(true);
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${PRICEACTION_SKILLS[0].id}`);
    await act(async () => r.unmount());
  });

  it('guidé Risk (monde 10, LOT 4-U) : ses 3 compétences + checkpoint PROPRE surfacent, prochaine étape correcte', async () => {
    // Mondes 1-9 validés → le monde 10 (Risk management) est « en cours ».
    await persist(W9_DONE);
    const r = await mount('world.risk');
    expect(hasText(r.root, 'Risk management')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    for (const s of RISK_SKILLS) {
      const node = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${s.name} —`));
      expect(node).toBeDefined();
    }
    expect(hasTextIncluding(r.root, RISK_CHECKPOINT_TITLE)).toBe(true);
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${RISK_SKILLS[0].id}`);
    await act(async () => r.unmount());
  });

  it('guidé Psychologie (monde 11, LOT 4-V) : ses 2 compétences + checkpoint PROPRE surfacent, prochaine étape correcte', async () => {
    // Mondes 1-10 validés → le monde 11 (Psychologie et biais) est « en cours ».
    await persist(W10_DONE);
    const r = await mount('world.psychology');
    expect(hasText(r.root, 'Psychologie et biais')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    for (const s of PSYCHOLOGY_SKILLS) {
      const node = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${s.name} —`));
      expect(node).toBeDefined();
    }
    expect(hasTextIncluding(r.root, PSYCHOLOGY_CHECKPOINT_TITLE)).toBe(true);
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${PSYCHOLOGY_SKILLS[0].id}`);
    await act(async () => r.unmount());
  });

  it('guidé Smart Money (monde 12, LOT 4-W) : ses 5 compétences + checkpoint PROPRE surfacent, prochaine étape correcte', async () => {
    // Mondes 1-11 validés → le monde 12 (Smart Money Concepts) est « en cours ».
    await persist(W11_DONE);
    const r = await mount('world.smc');
    expect(hasText(r.root, 'Smart Money Concepts')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    for (const s of SMC_SKILLS) {
      const node = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${s.name} —`));
      expect(node).toBeDefined();
    }
    expect(hasTextIncluding(r.root, SMC_CHECKPOINT_TITLE)).toBe(true);
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${SMC_SKILLS[0].id}`);
    await act(async () => r.unmount());
  });

  it('guidé Wyckoff (monde 13, LOT 4-X) : ses 2 compétences + checkpoint PROPRE surfacent, prochaine étape correcte', async () => {
    // Mondes 1-12 validés → le monde 13 (Wyckoff) est « en cours ».
    await persist(W12_DONE);
    const r = await mount('world.wyckoff');
    expect(hasText(r.root, 'Wyckoff')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    for (const s of WYCKOFF_SKILLS) {
      const node = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${s.name} —`));
      expect(node).toBeDefined();
    }
    expect(hasTextIncluding(r.root, WYCKOFF_CHECKPOINT_TITLE)).toBe(true);
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${WYCKOFF_SKILLS[0].id}`);
    await act(async () => r.unmount());
  });

  it('guidé Niveaux (monde 5, LOT 4-O) : ses 3 compétences + checkpoint PROPRE surfacent, prochaine étape correcte', async () => {
    // Mondes 1-4 avancés → le monde 5 (Supports et résistances) est « en cours ».
    await persist(W4_DONE);
    const r = await mount('world.support-resistance');
    expect(hasText(r.root, 'Supports et résistances')).toBe(true);
    expect(hasText(r.root, 'En cours')).toBe(true);
    // Les 3 compétences du module Niveaux surfacent (nœuds de la carte du monde).
    for (const s of SR_SKILLS) {
      const node = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${s.name} —`));
      expect(node).toBeDefined();
    }
    // Le checkpoint PROPRE du module surface.
    expect(hasTextIncluding(r.root, SR_CHECKPOINT_TITLE)).toBe(true);
    // La prochaine étape = 1re compétence Niveaux → /session/skill.sr.zones.
    const cta = ctaWithHint(r.root, 'Commencer la leçon');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${SR_SKILLS[0].id}`);
    await act(async () => r.unmount());
  });

  it('guidé : toutes les compétences faites → checkpoint courant → « Passer le checkpoint » /session/checkpoint', async () => {
    await persist(ALL_SKILLS_DONE);
    const r = await mount(WORLD1);
    const cta = ctaWithHint(r.root, 'Passer le checkpoint');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${CHECKPOINT_ID}`);
    await act(async () => r.unmount());
  });

  // ─── Révision due ────────────────────────────────────────────────────────────
  it('révision due : priorité visible + texte, CTA « Réviser maintenant » → bonne session', async () => {
    await persist(GUIDED_DUE);
    const r = await mount(WORLD1);
    // Priorité TEXTUELLE (jamais la seule couleur) : libellé de type de la carte + puce du trail.
    expect(hasText(r.root, 'À RÉVISER')).toBe(true); // type de la prochaine étape
    expect(hasText(r.root, 'à réviser')).toBe(true); // puce du nœud du trail
    const cta = ctaWithHint(r.root, 'Réviser maintenant');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/session/${ALL_SKILLS[0]}`);
    await act(async () => r.unmount());
  });

  // ─── Monde de contenu avec concepts (premier monde NON guidé — dynamique) ──
  it('contenu déverrouillé : aucune fausse leçon, concepts canoniques, nav /concept/[slug], consulté ≠ maîtrisé', async () => {
    await persist(GUIDED_ALL_DONE); // tous les modules guidés validés → premier monde de contenu ouvert
    const r = await mount(CONTENT_WORLD.id);
    // Message honnête (pas de leçon inexistante).
    expect(hasTextIncluding(r.root, 'n’est pas la maîtriser')).toBe(true);
    // Concepts issus de la source canonique (titres réels).
    const c0 = conceptsByWorld(V5_CONCEPTS, CONTENT_WORLD.id)[0];
    expect(hasText(r.root, c0.title)).toBe(true);
    // Prochaine étape = explorer la première fiche.
    const cta = ctaWithHint(r.root, 'Explorer les notions');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/concept/${c0.slug}`);
    await act(async () => r.unmount());
  });

  it('contenu entièrement consulté : « exploré » (jamais « terminé »), suite = monde suivant si ouvert', async () => {
    await persist(CONTENT_EXPLORED);
    const r = await mount(CONTENT_WORLD.id);
    expect(hasText(r.root, 'Exploré')).toBe(true);
    expect(hasText(r.root, 'Terminé')).toBe(false); // un monde de contenu n’est jamais « terminé »
    // Marque « consultée » présente (consultation distincte de la maîtrise).
    expect(hasTextIncluding(r.root, 'pas encore maîtrisée')).toBe(true);
    await act(async () => r.unmount());
  });

  // ─── Monde terminé ───────────────────────────────────────────────────────────
  it('monde guidé terminé : statut « Terminé », module validé, suite proposée (pas d’impasse)', async () => {
    await persist(W1_DONE);
    const r = await mount(WORLD1);
    expect(hasText(r.root, 'Terminé')).toBe(true);
    expect(hasText(r.root, 'Module validé')).toBe(true);
    // Prochaine étape non-impasse : le monde suivant est réellement ouvert.
    const cta = ctaWithHint(r.root, 'Continuer vers ce monde');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/monde/${WORLD2.id}`);
    await act(async () => r.unmount());
  });

  it('l’écran reflète EXACTEMENT buildLearningPath (statut du héros, aucun second calcul)', async () => {
    await persist(W1_DONE);
    const r = await mount(WORLD1);
    const path = buildLearningPath(WORLDS, V5_CONCEPTS, { completedSkills: [...ALL_SKILLS, CHECKPOINT_ID], exploredSlugs: [] });
    expect(worldEntryById(path, WORLD1)!.status).toBe('done');
    expect(hasText(r.root, 'Terminé')).toBe(true);
    await act(async () => r.unmount());
  });

  // ─── Stabilité ────────────────────────────────────────────────────────────────
  it('aucune mutation de progression au rendu ni à la navigation', async () => {
    await persist(NEW);
    const r = await mount(WORLD1);
    const afterMount = await AsyncStorage.getItem(KEY);
    const cta = ctaWithHint(r.root, 'Commencer la leçon')!;
    act(() => (cta.props.onPress as () => void)());
    await flush();
    const afterNav = await AsyncStorage.getItem(KEY);
    expect(afterNav).toBe(afterMount); // la fiche ne mute JAMAIS la progression
    await act(async () => r.unmount());
  });

  it('aucun emoji ; aucune valeur invalide ; remontage déterministe (world_opened une fois par montage)', async () => {
    await persist(GUIDED_PARTIAL);
    const first = await mount(WORLD1);
    const json1 = JSON.stringify(first.toJSON());
    expect(findEmoji(json1)).toEqual([]);
    expect(json1).not.toMatch(/NaN|undefined|Infinity|Invalid Date/);
    expect(worldOpened()).toHaveLength(1);
    await act(async () => first.unmount());

    clearRecentEvents();
    const second = await mount(WORLD1);
    expect(JSON.stringify(second.toJSON())).toBe(json1); // rendu identique
    expect(worldOpened()).toHaveLength(1); // une émission par montage
    await act(async () => second.unmount());
  });
});
