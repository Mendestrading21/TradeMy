/**
 * @jest-environment node
 *
 * Test d'intégration RENDU de la fiche concept de production (`app/concept/[slug].tsx`) — LOT 4-J.
 * Prouve, sur l'écran RÉEL et la LOGIQUE existante préservée : rendu d'une fiche riche, état
 * « concept introuvable », `VisualCard` conservée, analytics `concept_viewed` inchangé (nom + payload
 * `categoryId`/`hasVisual`) et AUCUN autre évènement, marquage `markRecentlyViewed`/`markConceptExplored`
 * appelé UNE seule fois après `ready` (aucun double effet), favoris, concepts liés actionnables +
 * navigation `/concept/[slug]`, avis éditorial (`needsEditorialReview`), disclaimer, iconographie
 * `TrademyIcon` (aucun emoji), maîtrise exposée par l'ICÔNE + le LIBELLÉ (jamais la seule couleur),
 * noms/rôles accessibles, remontage déterministe.
 * `useProgress` est mocké (capture des marquages + favoris) ; le reste de `@/data` reste RÉEL.
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
// `useProgress` mocké pour capturer marquages/favoris ; tout le reste de `@/data` reste RÉEL.
// IMPORTANT (LOT 4-K) : les fonctions sont des références STABLES (définies une seule fois), comme le
// vrai `ProgressProvider` qui les mémoïse (`useCallback`). Sans cela, le re-rendu du garde-fou
// d'hydratation changerait les dépendances de l'effet de marquage et le doublerait — artefact de mock.
jest.mock('@/data', () => {
  const actual = jest.requireActual('@/data') as Record<string, unknown>;
  const calls: { recent: string[]; explored: string[][]; favToggles: string[] } = { recent: [], explored: [], favToggles: [] };
  const favorites = new Set<string>();
  const progressState = { learning: { conceptsExplored: [] as string[] }, skills: {}, completedSkills: [] as string[], targets: {} };
  const toggleFavorite = (s: string) => calls.favToggles.push(s);
  const markRecentlyViewed = (s: string) => calls.recent.push(s);
  const markConceptExplored = (s: string, w: string) => calls.explored.push([s, w]);
  const progress = { favorites, toggleFavorite, markRecentlyViewed, markConceptExplored, ready: true, state: progressState };
  return {
    __esModule: true, ...actual, __calls: calls, __favorites: favorites, __progressState: progressState,
    useProgress: () => progress,
  };
});

import ConceptFiche from '@/app/concept/[slug]';
import { TrademyIcon, Chip, theme } from '@/design-system';
import { VisualCard, COMPARISON_BY_CONCEPT } from '@/engines/visual';
import { V5_CONCEPTS, relatedConcepts, needsEditorialReview, conceptMasteryStatus, EDITORIAL_REVIEW_NOTICE } from '@/data';
import { recentEvents, clearRecentEvents } from '@/analytics';
import { findEmoji } from './emojiGuard';
import * as ExpoRouter from 'expo-router';
import * as Data from '@/data';

const routerState = (ExpoRouter as unknown as { __state: { params: Record<string, unknown>; calls: unknown[][] } }).__state;
const calls = (Data as unknown as { __calls: { recent: string[]; explored: string[][]; favToggles: string[] } }).__calls;

// Concept RICHE réel (visuel + dialogue + scénario + faux signaux + flashcard + liés) — choisi par prédicat.
const RICH = V5_CONCEPTS.find(
  (c) => c.visualSpec && c.dialogue && c.bullishScenario && c.falseSignals.length && c.flashcards.length && relatedConcepts(V5_CONCEPTS, c).length,
)!;
const FIRST_RELATED = relatedConcepts(V5_CONCEPTS, RICH)[0];
// Concepts réels par difficulté (Découverte 1–2 · Intermédiaire 3 · Avancé 4–5) pour les couleurs.
const DIFF = (n: number) => V5_CONCEPTS.find((c) => c.difficulty === n)!;
// La puce de difficulté est la SEULE avec l'icône `target` ; on lit sa couleur EFFECTIVE.
const difficultyChipColor = (root: ReactTestInstance): string | undefined =>
  root.findAllByType(Chip).find((c) => c.props.iconName === 'target')?.props.color as string | undefined;

function pressables(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.onPress === 'function', { deep: true });
}
function byLabel(root: ReactTestInstance, label: string): ReactTestInstance | undefined {
  return pressables(root).find((n) => String(n.props.accessibilityLabel ?? '') === label);
}
function textNodes(root: ReactTestInstance, s: string): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.children === 'string' && (n.props.children as string) === s, { deep: true });
}
const hasText = (root: ReactTestInstance, s: string) => textNodes(root, s).length > 0;
const hasTextIncluding = (root: ReactTestInstance, sub: string) =>
  root.findAll((n) => typeof n.props?.children === 'string' && (n.props.children as string).includes(sub), { deep: true }).length > 0;
const iconNames = (root: ReactTestInstance) => root.findAllByType(TrademyIcon).map((n) => String(n.props.name));

// LOT 4-K — Premier PAINT synchrone (avant flush de la microtâche) : la route affiche le chargement,
// indépendamment du slug (garde-fou d'hydratation). Les effets métier s'exécutent déjà à ce paint.
function firstPaint(slug: string): ReactTestRenderer {
  routerState.params = { slug };
  let r!: ReactTestRenderer;
  act(() => { r = create(createElement(ConceptFiche)); });
  return r;
}
// Flush de la microtâche → `mounted` bascule → contenu réel (hydratation terminée).
async function flush(): Promise<void> {
  await act(async () => { await Promise.resolve(); });
}
// Montage COMPLET (paint + hydratation) : renvoie la fiche réelle rendue.
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

describe('Fiche concept de production — canon, logique préservée (LOT 4-J)', () => {
  it('rend une fiche réelle : titre, sections clés, VisualCard, icônes Trademy, aucun emoji', async () => {
    const r = await mount(RICH.slug);
    expect(hasText(r.root, RICH.title)).toBe(true);
    expect(hasText(r.root, 'En bref')).toBe(true);
    expect(hasText(r.root, 'Définition')).toBe(true);
    // VisualCard conservée (graphique pédagogique prioritaire) — LOT W2 : une fiche mappée
    // « Comparer » peut légitimement en rendre une seconde.
    expect(r.root.findAllByType(VisualCard).length).toBeGreaterThanOrEqual(1);
    // Iconographie exclusivement TrademyIcon, en quantité.
    expect(iconNames(r.root).length).toBeGreaterThan(3);
    // Aucun emoji nulle part dans l'arbre rendu.
    expect(findEmoji(JSON.stringify(r.toJSON()))).toEqual([]);
    expect(JSON.stringify(r.toJSON())).not.toMatch(/[‹›←→↑↓★☆🔎🔒⏱️🎯]/u);
    act(() => r.unmount());
  });

  it('état « concept introuvable » : StateView, aucun plantage, aucune VisualCard', async () => {
    const r = await mount('__slug-inexistant-xyz__');
    expect(hasText(r.root, 'Concept introuvable')).toBe(true);
    expect(r.root.findAllByType(VisualCard)).toHaveLength(0);
    // L'icône de l'état vide est une TrademyIcon (search), pas un emoji.
    expect(iconNames(r.root)).toContain('search');
    act(() => r.unmount());
  });

  // ── LOT 4-K — Hydratation déterministe (robustesse des liens directs) ─────────────────────────
  it('LOT 4-K — 1er paint = chargement STABLE (ni titre ni introuvable), fiche après hydratation', async () => {
    const r = firstPaint(RICH.slug);
    // Premier paint : uniquement le chargement, INDÉPENDANT du slug (identique au HTML pré-rendu).
    expect(hasText(r.root, 'On prépare la fiche…')).toBe(true);
    expect(hasText(r.root, RICH.title)).toBe(false);
    expect(hasText(r.root, 'Concept introuvable')).toBe(false);
    expect(r.root.findAllByType(VisualCard)).toHaveLength(0);
    // Après flush des microtâches : la fiche réelle apparaît.
    await flush();
    expect(hasText(r.root, RICH.title)).toBe(true);
    expect(r.root.findAllByType(VisualCard)).toHaveLength(1);
    act(() => r.unmount());
  });

  it('LOT 4-K — effets métier EXACTEMENT une fois ; un rendu supplémentaire ne les double pas', async () => {
    const r = firstPaint(RICH.slug);
    await flush();
    await flush(); // rendu supplémentaire (hydratation déjà faite) → ne doit rien redéclencher
    expect(recentEvents().filter((e) => e.event === 'concept_viewed')).toHaveLength(1);
    expect(calls.recent.filter((s) => s === RICH.slug)).toHaveLength(1);
    expect(calls.explored.filter(([s]) => s === RICH.slug)).toHaveLength(1);
    act(() => r.unmount());
  });

  it('LOT 4-K — slug invalide : introuvable après hydratation, AUCUN effet métier', async () => {
    const r = await mount('__slug-inexistant-k__');
    expect(hasText(r.root, 'Concept introuvable')).toBe(true);
    expect(recentEvents().filter((e) => e.event === 'concept_viewed')).toHaveLength(0);
    expect(calls.recent).toHaveLength(0);
    expect(calls.explored).toHaveLength(0);
    act(() => r.unmount());
  });

  it('analytics INCHANGÉS : concept_viewed une fois, payload exact, aucun autre évènement', async () => {
    const r = await mount(RICH.slug);
    const cv = recentEvents().filter((e) => e.event === 'concept_viewed');
    expect(cv).toHaveLength(1);
    expect(cv[0].props).toMatchObject({ categoryId: RICH.categoryId, hasVisual: Boolean(RICH.visualSpec) });
    expect(recentEvents().every((e) => e.event === 'concept_viewed')).toBe(true);
    act(() => r.unmount());
  });

  it('marquage exploration/récent appelé UNE seule fois après ready (aucun double effet)', async () => {
    const r = await mount(RICH.slug);
    expect(calls.recent.filter((s) => s === RICH.slug)).toHaveLength(1);
    expect(calls.explored.filter(([s]) => s === RICH.slug)).toHaveLength(1);
    expect(calls.explored[0]).toEqual([RICH.slug, RICH.worldId]);
    act(() => r.unmount());
  });

  it('favoris : bouton nommé ; bascule via toggleFavorite avec le slug', async () => {
    const r = await mount(RICH.slug);
    const favBtn = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '').toLowerCase().includes('favori'));
    expect(favBtn).toBeDefined();
    act(() => (favBtn!.props.onPress as () => void)());
    expect(calls.favToggles).toContain(RICH.slug);
    act(() => r.unmount());
  });

  // ── LOT V4 — détail à la demande (moins de texte affiché, plus d'interaction) ────────────────
  it('LOT V4 — la définition complète est REPLIÉE par défaut et s’ouvre au tap (bouton accessible, état expanded)', async () => {
    const r = await mount(RICH.slug);
    expect(hasText(r.root, 'Définition')).toBe(true); // le titre de section reste visible
    expect(hasText(r.root, 'En bref')).toBe(true); // la définition courte reste TOUJOURS lisible
    expect(hasText(r.root, RICH.definitionDetailed)).toBe(false); // le pavé long attend le tap
    const toggle = byLabel(r.root, 'Lire la définition complète');
    expect(toggle).toBeDefined();
    expect(toggle!.props.accessibilityState?.expanded).toBe(false);
    act(() => (toggle!.props.onPress as () => void)());
    expect(hasText(r.root, RICH.definitionDetailed)).toBe(true); // dépliée : texte complet
    const opened = byLabel(r.root, 'Masquer la définition complète');
    expect(opened).toBeDefined();
    expect(opened!.props.accessibilityState?.expanded).toBe(true);
    act(() => (opened!.props.onPress as () => void)()); // re-tap → repli (bouton jamais mort)
    expect(hasText(r.root, RICH.definitionDetailed)).toBe(false);
    act(() => r.unmount());
  });

  it('LOT V4 — flashcard : la réponse reste cachée jusqu’au tap « Révéler la réponse » (rappel actif)', async () => {
    const r = await mount(RICH.slug);
    const { front, back } = RICH.flashcards[0];
    expect(hasText(r.root, front)).toBe(true); // la question s'affiche
    expect(hasText(r.root, back)).toBe(false); // la réponse attend le tap
    const reveal = pressables(r.root).find((n) => textNodes(n, 'Révéler la réponse').length > 0);
    expect(reveal).toBeDefined();
    act(() => (reveal!.props.onPress as () => void)());
    expect(hasText(r.root, back)).toBe(true); // révélée
    expect(pressables(r.root).some((n) => textNodes(n, 'Révéler la réponse').length > 0)).toBe(false);
    act(() => r.unmount());
  });

  it('LOT W2 — « Lecture guidée » : la légende de l’exemple annoté s’affiche sous le visuel, direction sémantique', async () => {
    // Fiche réelle AVEC exemple annoté (36 fiches du corpus en ont un).
    const withExample = V5_CONCEPTS.find((c) => c.visualSpec && c.chartExamples.length)!;
    const r = await mount(withExample.slug);
    expect(hasTextIncluding(r.root, 'Lecture guidée')).toBe(true);
    expect(hasText(r.root, withExample.chartExamples[0].caption)).toBe(true);
    // L'icône de direction est sémantique (market-up/market-down), jamais un emoji.
    expect(iconNames(r.root).some((n) => n === 'market-up' || n === 'market-down')).toBe(true);
    act(() => r.unmount());
  });

  it('LOT W2 — « Comparer » : la fiche doji rend la paire recommandée (2 VisualCard), une fiche non mappée non', async () => {
    const doji = V5_CONCEPTS.find((c) => c.id === 'concept.doji')!;
    const r = await mount(doji.slug);
    expect(r.root.findAllByType(VisualCard)).toHaveLength(2); // Visuel + Comparer
    expect(hasText(r.root, 'Comparer')).toBe(true);
    act(() => r.unmount());
    // Une fiche riche NON mappée ne rend ni « Comparer » ni seconde carte (aucun bruit).
    const unmapped = V5_CONCEPTS.find((c) => c.visualSpec && !COMPARISON_BY_CONCEPT[c.id])!;
    const r2 = await mount(unmapped.slug);
    expect(r2.root.findAllByType(VisualCard)).toHaveLength(1);
    expect(hasText(r2.root, 'Comparer')).toBe(false);
    act(() => r2.unmount());
  });

  it('concepts liés : chips actionnables nommées + navigation /concept/[slug]', async () => {
    const r = await mount(RICH.slug);
    const chip = byLabel(r.root, `Ouvrir ${FIRST_RELATED.title}`);
    expect(chip).toBeDefined();
    expect(chip!.props.accessibilityRole).toBe('button');
    act(() => (chip!.props.onPress as () => void)());
    const pushes = routerState.calls.filter((c) => c[0] === 'push');
    expect(pushes.some((c) => c[1] === `/concept/${FIRST_RELATED.slug}`)).toBe(true);
    act(() => r.unmount());
  });

  it('avis de relecture éditoriale conservé (needsEditorialReview)', async () => {
    expect(needsEditorialReview(RICH)).toBe(true); // corpus V5 : statut needsReview
    const r = await mount(RICH.slug);
    expect(hasText(r.root, 'À relire')).toBe(true);
    expect(hasTextIncluding(r.root, EDITORIAL_REVIEW_NOTICE.slice(0, 24))).toBe(true);
    act(() => r.unmount());
  });

  it('disclaimer : disclaimer du concept + disclaimer éducatif canonique présents', async () => {
    const r = await mount(RICH.slug);
    expect(hasText(r.root, RICH.disclaimer)).toBe(true);
    expect(hasTextIncluding(r.root, 'risque de perte')).toBe(true); // Disclaimer canonique
    act(() => r.unmount());
  });

  it('maîtrise exposée par ICÔNE + LIBELLÉ, jamais la seule couleur', async () => {
    const r = await mount(RICH.slug);
    const st = conceptMasteryStatus(RICH, { exploredSlugs: [], skills: {}, completedSkills: [], targets: {} });
    expect(hasText(r.root, st.stateLabel)).toBe(true); // libellé texte présent
    // L'icône d'état (book pour « new ») fait partie du système Trademy, jamais un aplat de couleur seul.
    expect(iconNames(r.root)).toContain('book');
    act(() => r.unmount());
  });

  it('puce de difficulté : couleur EFFECTIVE stricte, jamais technical/cyan (bug corrigé)', async () => {
    // Découverte (1–2) → neutral — et surtout PAS technical (difficultyTone renverrait technical ici).
    const easy = await mount(DIFF(2).slug);
    expect(difficultyChipColor(easy.root)).toBe(theme.colors.neutral);
    expect(difficultyChipColor(easy.root)).not.toBe(theme.colors.technical);
    act(() => easy.unmount());
    // Intermédiaire (3) → warning.
    const mid = await mount(DIFF(3).slug);
    expect(difficultyChipColor(mid.root)).toBe(theme.colors.warning);
    expect(difficultyChipColor(mid.root)).not.toBe(theme.colors.technical);
    act(() => mid.unmount());
    // Avancé (4–5) → advanced.
    const hard = await mount(DIFF(4).slug);
    expect(difficultyChipColor(hard.root)).toBe(theme.colors.advanced);
    expect(difficultyChipColor(hard.root)).not.toBe(theme.colors.technical);
    act(() => hard.unmount());
  });

  it('robustesse : aucune valeur invalide, remontage déterministe', async () => {
    const first = await mount(RICH.slug);
    const json1 = JSON.stringify(first.toJSON());
    expect(json1).not.toMatch(/NaN|undefined|Infinity|Invalid Date/);
    act(() => first.unmount());
    // Réinitialise les marquages puis remonte : rendu identique.
    calls.recent.length = 0; calls.explored.length = 0;
    const second = await mount(RICH.slug);
    expect(JSON.stringify(second.toJSON())).toBe(json1);
    // Un seul marquage par montage (pas de double effet).
    expect(calls.explored.filter(([s]) => s === RICH.slug)).toHaveLength(1);
    act(() => second.unmount());
  });
});
