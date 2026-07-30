/**
 * @jest-environment node
 *
 * Test d'intégration RENDU de l'écran BIBLIOTHÈQUE de production (`app/(tabs)/apprendre.tsx`) monté
 * dans le `ProgressProvider` RÉEL (LOT 4-F), sur des états DÉTERMINISTES (seed AsyncStorage : progress
 * + glossaryprefs). Prouve, sur l'écran RÉEL et les VRAIS providers : corpus dérivé de `V5_CONCEPTS` ;
 * recherche (titre/alias, casse/accents) ; collections Tous/Favoris/Récents ; filtre famille + 5 états
 * STRICTS (Nouveau/Découvert/En cours/Solide/Maîtrisé) alimentés par les 4 paramètres réels ;
 * consulter ≠ maîtrisé ; routes exactes `/concept/{slug}` et des 5 outils ; aucune mutation de
 * progression à l'ouverture/au filtre/au favori ; états vides avec action ; a11y (nom groupé, aucun
 * nombre isolé) ; aucun emoji/étoile Unicode ; reprise après remontage ; invariants inchangés.
 */
/* eslint-disable @typescript-eslint/no-require-imports, import/first -- fabriques jest.mock hissées. */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
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
// FlatList → rend TOUTES les lignes (+ header/empty/footer) pour l'assertion complète (Proxy : n'évalue
// pas les getters natifs de react-native).
jest.mock('react-native', () => {
  const RN: any = jest.requireActual('react-native');
  const React = require('react');
  const resolve = (C: any) => (typeof C === 'function' ? React.createElement(C) : (C ?? null));
  function MockFlatList({ data = [], renderItem, keyExtractor, ListHeaderComponent, ListEmptyComponent, ListFooterComponent }: any) {
    const items = data.length
      ? data.map((item: any, index: number) => React.createElement(RN.View, { key: keyExtractor ? keyExtractor(item, index) : String(index) }, renderItem({ item, index })))
      : resolve(ListEmptyComponent);
    return React.createElement(RN.View, null, resolve(ListHeaderComponent), items, resolve(ListFooterComponent));
  }
  return new Proxy(RN, { get: (t: any, k: any) => (k === 'FlatList' ? MockFlatList : t[k]) });
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

import Bibliotheque from '@/app/(tabs)/apprendre';
import { MiniVisual } from '@/engines/visual';
import { ProgressProvider, V5_CONCEPTS, CATEGORIES, conceptFamilies, conceptMasteryStatus, exercisableObjectiveIds, CHECKPOINT_ID } from '@/data';
import { findEmoji } from './emojiGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoRouter from 'expo-router';

const routerState = (ExpoRouter as unknown as { __state: { calls: unknown[][] } }).__state;

const CANDLE = V5_CONCEPTS.find((c) => c.slug === 'anatomie-bougie')!; // représentatif de skill.candles
const MARTEAU = V5_CONCEPTS.find((c) => c.slug === 'marteau')!; // partage skill.candles, non représentatif
const OBJS = exercisableObjectiveIds(CANDLE.id);

type TP = { objectiveId: string; conceptId: string; attempts: number; correct: number; sessions: number; lastCorrect: boolean; review: { repetitions: number; easiness: number; intervalDays: number; dueAt: number } };
const proven = (o: string): TP => ({ objectiveId: o, conceptId: CANDLE.id, attempts: 6, correct: 6, sessions: 2, lastCorrect: true, review: { repetitions: 2, easiness: 2.5, intervalDays: 6, dueAt: 0 } });
const fullCoverage = (): Record<string, TP> => Object.fromEntries(OBJS.map((o) => [o, proven(o)]));
const trainedOnly = (): Record<string, TP> => ({ [OBJS[0]]: { objectiveId: OBJS[0], conceptId: CANDLE.id, attempts: 3, correct: 2, sessions: 1, lastCorrect: true, review: { repetitions: 0, easiness: 2.5, intervalDays: 0, dueAt: 0 } } });
const oneProven = (): Record<string, TP> => ({ [OBJS[0]]: proven(OBJS[0]) });

function progress(o: object) {
  return JSON.stringify({ onboarded: true, schemaVersion: 8, completedSkills: [], totalXp: 0, streakDays: 0, coins: 0, learning: { conceptsExplored: [] }, skills: {}, targets: {}, ...o });
}
async function persist(progressJson: string | null, prefs?: { favorites?: string[]; recent?: string[] }) {
  await AsyncStorage.clear();
  if (progressJson) await AsyncStorage.setItem('patternlab.progress.v1', progressJson);
  if (prefs) await AsyncStorage.setItem('patternlab.glossaryprefs.v1', JSON.stringify({ favorites: prefs.favorites ?? [], recent: prefs.recent ?? [] }));
}

function pressables(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.onPress === 'function', { deep: true });
}
/** Carte concept : Pressable dont le nom accessible commence par le titre du concept. */
function cardFor(root: ReactTestInstance, title: string): ReactTestInstance | undefined {
  return pressables(root).find((n) => String(n.props.accessibilityLabel ?? '').startsWith(`${title}.`));
}
function textNodes(root: ReactTestInstance, s: string): ReactTestInstance[] {
  return root.findAll((n) => typeof n.props?.children === 'string' && (n.props.children as string) === s, { deep: true });
}
function pressAncestor(node?: ReactTestInstance): ReactTestInstance | undefined {
  let p: ReactTestInstance | null | undefined = node;
  while (p) { if (typeof p.props?.onPress === 'function') return p; p = p.parent; }
  return undefined;
}
function setSearch(root: ReactTestInstance, value: string) {
  const input = root.find((n) => String(n.props?.accessibilityLabel ?? '') === 'Rechercher un concept');
  act(() => (input.props.onChangeText as (v: string) => void)(value));
}
function pressByA11y(root: ReactTestInstance, label: string) {
  const p = pressables(root).find((n) => String(n.props.accessibilityLabel ?? '') === label);
  if (!p) throw new Error(`bouton introuvable: ${label}`);
  act(() => (p.props.onPress as () => void)());
}
/** Presse le bouton dont le libellé VISIBLE (Text enfant) correspond — ex. le CTA d'un StateView. */
function pressByText(root: ReactTestInstance, text: string) {
  const p = pressAncestor(textNodes(root, text)[0]);
  if (!p) throw new Error(`bouton (texte) introuvable: ${text}`);
  act(() => (p.props.onPress as () => void)());
}
function summaryLabel(root: ReactTestInstance): string {
  const n = root.find((x) => typeof x.props?.accessibilityLabel === 'string' && /concept.* sur \d+/.test(x.props.accessibilityLabel as string));
  return n.props.accessibilityLabel as string;
}
function assertNoLoneNumbers(root: ReactTestInstance) {
  const lone = root.findAll((n) => typeof n.props?.accessibilityLabel === 'string' && /^\s*\d+\s*%?\s*$/.test(n.props.accessibilityLabel as string), { deep: true });
  expect(lone).toHaveLength(0);
}
async function flush() { for (let i = 0; i < 8; i++) await act(async () => { await Promise.resolve(); }); }
async function mount(): Promise<ReactTestRenderer> {
  let r!: ReactTestRenderer;
  await act(async () => { r = create(createElement(ProgressProvider, null, createElement(Bibliotheque))); });
  await flush();
  return r;
}
const expectedLabel = (input: object) => conceptMasteryStatus(CANDLE, { exploredSlugs: [], skills: {}, ...input } as never).stateLabel;

beforeEach(() => { routerState.calls.length = 0; });

describe('Bibliothèque de production — recherche, collections, vérité stricte, a11y (LOT 4-F)', () => {
  it('corpus dérivé de V5_CONCEPTS + recherche titre/casse/accents/alias + route /concept/{slug}', async () => {
    await persist(progress({}));
    const r = await mount();
    const root = r.root;
    // Résumé = tout le corpus (sans doublon) — la valeur vient de V5_CONCEPTS.
    expect(summaryLabel(root)).toContain(`sur ${V5_CONCEPTS.length}`);
    expect(findEmoji(JSON.stringify(r.toJSON()))).toEqual([]);
    assertNoLoneNumbers(root);

    // Recherche par titre (accents/casse) → le concept anatomie apparaît.
    setSearch(root, 'ANATOMIÉ');
    expect(cardFor(r.root, CANDLE.title)).toBeDefined();
    // Recherche par alias.
    setSearch(root, 'candle');
    expect(cardFor(r.root, CANDLE.title)).toBeDefined();
    // Ouvrir → route exacte.
    act(() => (cardFor(r.root, CANDLE.title)!.props.onPress as () => void)());
    expect(routerState.calls.filter((c) => c[0] === 'push')).toEqual([['push', `/concept/${CANDLE.slug}`]]);
    // Recherche sans résultat → état vide avec action « Effacer les filtres ».
    setSearch(root, 'zzznope');
    expect(summaryLabel(r.root)).toMatch(/^0 concepts? correspondants? sur/);
    expect(pressables(r.root).some((n) => String(n.props.accessibilityLabel ?? '') === 'Effacer les filtres')).toBe(true);
    await act(async () => r.unmount());
  });

  it('les 5 états STRICTS reflètent la vérité (4 paramètres) : consulter n’est jamais « Maîtrisé »', async () => {
    // explored (consulté, jamais maîtrisé)
    await persist(progress({ learning: { conceptsExplored: ['anatomie-bougie'] } }));
    let r = await mount();
    setSearch(r.root, 'anatomie');
    expect(cardFor(r.root, CANDLE.title)!.props.accessibilityLabel).toContain('Niveau : Découvert.');
    expect(cardFor(r.root, CANDLE.title)!.props.accessibilityLabel).not.toContain('Maîtrisé');
    expect(expectedLabel({ exploredSlugs: ['anatomie-bougie'] })).toBe('Découvert');
    await act(async () => r.unmount());

    // completed (En cours)
    await persist(progress({ learning: { conceptsExplored: ['anatomie-bougie'] }, targets: trainedOnly() }));
    r = await mount();
    setSearch(r.root, 'anatomie');
    expect(cardFor(r.root, CANDLE.title)!.props.accessibilityLabel).toContain('Niveau : En cours.');
    await act(async () => r.unmount());

    // strong (Solide)
    await persist(progress({ learning: { conceptsExplored: ['anatomie-bougie'] }, targets: oneProven(), completedSkills: [CHECKPOINT_ID] }));
    r = await mount();
    setSearch(r.root, 'anatomie');
    expect(cardFor(r.root, CANDLE.title)!.props.accessibilityLabel).toContain('Niveau : Solide.');
    await act(async () => r.unmount());

    // mastered (Maîtrisé) — uniquement quand toutes les conditions réelles sont réunies
    await persist(progress({ learning: { conceptsExplored: ['anatomie-bougie'] }, targets: fullCoverage(), completedSkills: [CHECKPOINT_ID] }));
    r = await mount();
    setSearch(r.root, 'anatomie');
    expect(cardFor(r.root, CANDLE.title)!.props.accessibilityLabel).toContain('Niveau : Maîtrisé.');
    expect(expectedLabel({ exploredSlugs: ['anatomie-bougie'], targets: fullCoverage(), completedSkills: [CHECKPOINT_ID] })).toBe('Maîtrisé');
    await act(async () => r.unmount());
  });

  it('aucune maîtrise partagée : un concept non représentatif reste « Découvert » malgré la couverture', async () => {
    await persist(progress({ learning: { conceptsExplored: ['anatomie-bougie', 'marteau'] }, targets: fullCoverage(), completedSkills: [CHECKPOINT_ID] }));
    const r = await mount();
    setSearch(r.root, 'marteau');
    const card = cardFor(r.root, MARTEAU.title);
    expect(card).toBeDefined();
    expect(card!.props.accessibilityLabel).toContain('Niveau : Découvert.');
    expect(card!.props.accessibilityLabel).not.toContain('Maîtrisé');
    await act(async () => r.unmount());
  });

  it('filtre par famille exact (dérivé de CATEGORIES) et résumé contextualisé', async () => {
    await persist(progress({}));
    const r = await mount();
    const fam = conceptFamilies(V5_CONCEPTS, CATEGORIES).find((f) => f.count <= 5 && f.count >= 2)!; // petite famille
    // Active le filtre famille via sa pilule.
    const pill = pressAncestor(textNodes(r.root, `${fam.label} · ${fam.count}`)[0]);
    expect(pill).toBeDefined();
    act(() => (pill!.props.onPress as () => void)());
    expect(summaryLabel(r.root)).toContain(`${fam.count} concept`);
    expect(summaryLabel(r.root)).toContain(`famille ${fam.label}`);
    await act(async () => r.unmount());
  });

  it('collections Favoris (persistées, filtrées) et Récents (ordre de recentSlugs)', async () => {
    await persist(progress({}), { favorites: ['marteau', 'anatomie-bougie'], recent: ['doji', 'marteau'] });
    const r = await mount();
    // Favoris → uniquement les 2 favoris.
    act(() => (pressAncestor(textNodes(r.root, 'Favoris')[0])!.props.onPress as () => void)());
    expect(summaryLabel(r.root)).toMatch(/^2 concepts/);
    expect(cardFor(r.root, MARTEAU.title)).toBeDefined();
    // Récents → ordre de recentSlugs (doji avant marteau).
    act(() => (pressAncestor(textNodes(r.root, 'Récents')[0])!.props.onPress as () => void)());
    const labels = pressables(r.root).map((n) => String(n.props.accessibilityLabel ?? '')).filter((l) => /Niveau : /.test(l));
    const idxDoji = labels.findIndex((l) => l.startsWith(V5_CONCEPTS.find((c) => c.slug === 'doji')!.title));
    const idxMarteau = labels.findIndex((l) => l.startsWith(MARTEAU.title));
    expect(idxDoji).toBeGreaterThanOrEqual(0);
    expect(idxDoji).toBeLessThan(idxMarteau);
    await act(async () => r.unmount());
  });

  it('états vides distincts avec action réelle (Favoris / Récents)', async () => {
    await persist(progress({}), { favorites: [], recent: [] });
    const r = await mount();
    act(() => (pressAncestor(textNodes(r.root, 'Favoris')[0])!.props.onPress as () => void)());
    expect(textNodes(r.root, 'Aucun favori pour l’instant').length).toBeGreaterThan(0);
    expect(textNodes(r.root, 'Voir tous les concepts').length).toBeGreaterThan(0);
    // Action « Voir tous les concepts » restaure la liste complète.
    pressByText(r.root, 'Voir tous les concepts');
    expect(summaryLabel(r.root)).toContain(`sur ${V5_CONCEPTS.length}`);
    await act(async () => r.unmount());
  });

  it('les 5 outils de référence ouvrent leurs routes EXACTES', async () => {
    await persist(progress({}));
    const r = await mount();
    const routes: Record<string, string> = { Glossaire: '/glossaire', Figures: '/bibliotheque-visuelle', 'Quiz visuel': '/reconnaissance', 'Leçons': '/lecons', 'Quiz éclair': '/quiz' };
    for (const [label, route] of Object.entries(routes)) {
      routerState.calls.length = 0;
      pressByA11y(r.root, label);
      expect(routerState.calls.filter((c) => c[0] === 'push')).toEqual([['push', route]]);
    }
    await act(async () => r.unmount());
  });

  it('icônes canoniques star/star-filled ; aucun emoji ni étoile Unicode dans le rendu', async () => {
    await persist(progress({}), { favorites: ['marteau'], recent: [] });
    const r = await mount();
    const json = JSON.stringify(r.toJSON());
    expect(findEmoji(json)).toEqual([]);
    expect(json).not.toMatch(/[★☆]/);
    // Le favori est une action distincte, avec état sélectionné.
    const fav = r.root.find((n) => String(n.props?.accessibilityLabel ?? '').startsWith('Retirer') && n.props?.accessibilityRole === 'button');
    expect(Boolean(fav.props.accessibilityState?.selected)).toBe(true);
    await act(async () => r.unmount());
  });

  it('favori = action distincte ; l’ajouter ne mute PAS la progression (maîtrise)', async () => {
    await persist(progress({ learning: { conceptsExplored: ['anatomie-bougie'] } }), { favorites: [], recent: [] });
    const r = await mount();
    const progBefore = await AsyncStorage.getItem('patternlab.progress.v1');
    setSearch(r.root, 'anatomie');
    const addFav = pressables(r.root).find((n) => String(n.props.accessibilityLabel ?? '') === `Ajouter ${CANDLE.title} aux favoris`);
    expect(addFav).toBeDefined();
    await act(async () => (addFav!.props.onPress as () => void)());
    await flush();
    // Les favoris changent (glossaryprefs) mais la progression est INCHANGÉE.
    expect(await AsyncStorage.getItem('patternlab.progress.v1')).toBe(progBefore);
    const prefs = JSON.parse((await AsyncStorage.getItem('patternlab.glossaryprefs.v1')) ?? '{}');
    expect(prefs.favorites).toContain('anatomie-bougie');
    await act(async () => r.unmount());
  });

  it('ouvrir/filtrer ne mute aucune progression au montage', async () => {
    await persist(progress({ learning: { conceptsExplored: ['anatomie-bougie'] }, targets: fullCoverage(), completedSkills: [CHECKPOINT_ID] }));
    const r = await mount();
    const after = await AsyncStorage.getItem('patternlab.progress.v1');
    const parsed = JSON.parse(after ?? '{}');
    // Le montage ne fabrique aucune maîtrise/exploration supplémentaire.
    expect(parsed.completedSkills).toEqual([CHECKPOINT_ID]);
    expect(parsed.learning.conceptsExplored).toEqual(['anatomie-bougie']);
    // Filtrer (recherche) ne touche pas le stockage.
    setSearch(r.root, 'doji');
    await flush();
    expect(await AsyncStorage.getItem('patternlab.progress.v1')).toBe(after);
    await act(async () => r.unmount());
  });

  it('LOT W5 — bibliothèque-galerie : une vignette par carte AVEC visuel, repli texte sinon, a11y inchangée', async () => {
    await persist(progress({}));
    const r = await mount();
    // Exactement une vignette (MiniVisual) par concept AVEC visuel — et le corpus est ENTIÈREMENT
    // illustré : chaque carte de la bibliothèque porte son signal visuel.
    const withVisual = V5_CONCEPTS.filter((c) => c.visualSpec).length;
    expect(withVisual).toBe(V5_CONCEPTS.length);
    expect(r.root.findAllByType(MiniVisual)).toHaveLength(withVisual);
    // La vignette est DÉCORATIVE : le nom accessible de la carte est inchangé (titre en tête + niveau),
    // porté par le Pressable — le bloc visuel vit sous accessibilityElementsHidden.
    const sample = V5_CONCEPTS.find((c) => c.visualSpec)!;
    expect(cardFor(r.root, sample.title)!.props.accessibilityLabel).toContain('Niveau :');
    // Garde d'avenir : une carte SANS visuel resterait complète (textes + niveau), sans vignette.
    const plain = V5_CONCEPTS.find((c) => !c.visualSpec);
    if (plain) {
      const plainCard = cardFor(r.root, plain.title)!;
      expect(plainCard.findAllByType(MiniVisual)).toHaveLength(0);
      expect(plainCard.props.accessibilityLabel).toContain('Niveau :');
    }
    // La galerie n'introduit ni emoji ni valeur invalide dans le rendu complet.
    const json = JSON.stringify(r.toJSON());
    expect(findEmoji(json)).toEqual([]);
    expect(json).not.toMatch(/NaN|Infinity|Invalid Date/);
    await act(async () => r.unmount());
  });

  it('reprise après remontage : mêmes états stricts ; aucune valeur invalide', async () => {
    const seed = progress({ learning: { conceptsExplored: ['anatomie-bougie'] }, targets: fullCoverage(), completedSkills: [CHECKPOINT_ID] });
    await persist(seed);
    const first = await mount();
    setSearch(first.root, 'anatomie');
    expect(cardFor(first.root, CANDLE.title)!.props.accessibilityLabel).toContain('Niveau : Maîtrisé.');
    expect(JSON.stringify(first.toJSON())).not.toMatch(/NaN|undefined|Infinity|Invalid Date/);
    await act(async () => first.unmount());

    const second = await mount();
    setSearch(second.root, 'anatomie');
    expect(cardFor(second.root, CANDLE.title)!.props.accessibilityLabel).toContain('Niveau : Maîtrisé.');
    await act(async () => second.unmount());
  });
});
