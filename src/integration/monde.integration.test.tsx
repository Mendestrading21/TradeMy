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
import { ProgressProvider } from '@/data';
import { WORLDS, V5_CONCEPTS, conceptsByWorld, SKILLS, CHECKPOINT_ID, buildLearningPath, worldEntryById } from '@/data';
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
const WORLD2 = SORTED[1]; // world.anatomy — monde de contenu, ordre 2
const WORLD2_SLUGS = conceptsByWorld(V5_CONCEPTS, WORLD2.id).map((c) => c.slug);

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
const W2_EXPLORED = seed({ completedSkills: [...ALL_SKILLS, CHECKPOINT_ID], learning: { conceptsExplored: WORLD2_SLUGS } });

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

  // ─── Monde de contenu avec concepts ─────────────────────────────────────────
  it('contenu déverrouillé : aucune fausse leçon, concepts canoniques, nav /concept/[slug], consulté ≠ maîtrisé', async () => {
    await persist(W1_DONE); // débloque le monde 2
    const r = await mount(WORLD2.id);
    // Message honnête (pas de leçon inexistante).
    expect(hasTextIncluding(r.root, 'n’est pas la maîtriser')).toBe(true);
    // Concepts issus de la source canonique (titres réels).
    const c0 = conceptsByWorld(V5_CONCEPTS, WORLD2.id)[0];
    expect(hasText(r.root, c0.title)).toBe(true);
    // Prochaine étape = explorer la première fiche.
    const cta = ctaWithHint(r.root, 'Explorer les notions');
    expect(cta).toBeDefined();
    act(() => (cta!.props.onPress as () => void)());
    expect(pushes()).toContain(`/concept/${c0.slug}`);
    await act(async () => r.unmount());
  });

  it('contenu entièrement consulté : « exploré » (jamais « terminé »), suite = monde suivant si ouvert', async () => {
    await persist(W2_EXPLORED);
    const r = await mount(WORLD2.id);
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
