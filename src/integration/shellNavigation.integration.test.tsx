/**
 * @jest-environment node
 *
 * Test d'intégration du SHELL de navigation (LOT 4-H) : rendu RÉEL de `TrademyTabBar` (la barre des
 * cinq espaces) avec des props de barre FABRIQUÉES. Prouve, sans toucher aux écrans métier :
 * cinq onglets exactement (jamais les écrans hors-barre), libellés canoniques, mapping vers les routes
 * EXISTANTES (href) et les icônes Trademy, un seul actif, état actif exposé (nom + forme, jamais la
 * seule couleur), navigation au clic, aucun bouton mort, remontage déterministe, aucune écriture de
 * persistance, aucune valeur invalide. `expo-router` est mocké au seul niveau infrastructure (le `Link`
 * réel injecte le `href`/`onPress` ; on le simule pour capturer la navigation).
 */
/* eslint-disable @typescript-eslint/no-require-imports, import/first -- fabriques jest.mock hissées. */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { create, act, type ReactTestInstance, type ReactTestRenderer } from 'react-test-renderer';
import { createElement } from 'react';

// `Link asChild` rend un vrai lien (href) : on le simule en injectant `href` → `onPress` dans l'enfant,
// pour capturer la navigation au clic. `Tabs` n'est utilisé qu'en position de type (érasé au runtime).
jest.mock('expo-router', () => {
  const React = require('react');
  const calls: string[] = [];
  return {
    __esModule: true,
    __hrefCalls: calls,
    Tabs: () => null,
    Link: ({ href, children }: { href: string; asChild?: boolean; children: React.ReactElement }) =>
      React.cloneElement(children, { onPress: () => calls.push(String(href)) }),
  };
});

import { TrademyTabBar } from '@/components/TrademyTabBar';
import { PRIMARY_SPACES } from '@/lib/navigation';
import { TrademyIcon } from '@/design-system';
import { findEmoji } from './emojiGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoRouter from 'expo-router';

const hrefCalls = (ExpoRouter as unknown as { __hrefCalls: string[] }).__hrefCalls;

// Toutes les routes montées par le navigateur (5 espaces + 3 écrans hors-barre) — la barre ne doit
// JAMAIS rendre les écrans hors-barre.
const ROUTE_NAMES = ['index', 'parcours', 'apprendre', 'laboratoire', 'profil', 'revisions', 'lecons', 'quiz'];
const EXPECTED_HREF: Record<string, string> = {
  index: '/', parcours: '/parcours', apprendre: '/apprendre', laboratoire: '/laboratoire', profil: '/profil',
};

function fakeProps(activeName = 'index') {
  const routes = ROUTE_NAMES.map((name) => ({ key: `${name}-key`, name }));
  const index = routes.findIndex((r) => r.name === activeName);
  return {
    state: { index, routes },
    descriptors: Object.fromEntries(routes.map((r) => [r.key, { options: {}, navigation: {} }])),
    navigation: { navigate: () => {}, emit: () => ({ defaultPrevented: false }) },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  } as unknown as Parameters<typeof TrademyTabBar>[0];
}

function render(activeName = 'index'): ReactTestRenderer {
  let r!: ReactTestRenderer;
  act(() => { r = create(createElement(TrademyTabBar, fakeProps(activeName))); });
  return r;
}
/** Les onglets = les nœuds qui portent un `onPress` (injecté par le Link simulé) ET un nom accessible. */
function tabs(r: ReactTestRenderer): ReactTestInstance[] {
  return r.root.findAll(
    (n) => typeof n.props?.onPress === 'function' && typeof n.props?.accessibilityLabel === 'string',
    { deep: true },
  );
}
const labelOf = (t: ReactTestInstance) => String(t.props.accessibilityLabel);

beforeEach(() => { hrefCalls.length = 0; (AsyncStorage.setItem as jest.Mock).mockClear(); });

describe('Shell de navigation Trademy — cinq espaces, responsive, a11y (LOT 4-H)', () => {
  it('rend un repère de navigation avec EXACTEMENT cinq onglets (jamais les écrans hors-barre)', () => {
    const r = render();
    // On compte le repère au niveau de l'hôte (`type === 'View'`) pour ignorer la couche composite.
    const nav = r.root.findAll((n) => n.props?.role === 'navigation' && typeof n.type === 'string', { deep: true });
    expect(nav).toHaveLength(1);
    expect(nav[0].props.accessibilityLabel).toBe('Navigation principale');
    expect(tabs(r)).toHaveLength(5); // 5, pas 8 : revisions/lecons/quiz ne sont jamais rendus
    act(() => r.unmount());
  });

  it('libellés canoniques Accueil · Apprendre · Bibliothèque · Laboratoire · Profil (ordre)', () => {
    const r = render();
    const labels = tabs(r).map((t) => labelOf(t).replace(', espace actif', ''));
    expect(labels).toEqual(['Accueil', 'Apprendre', 'Bibliothèque', 'Laboratoire', 'Profil']);
    expect(labels).toEqual(PRIMARY_SPACES.map((s) => s.title));
    act(() => r.unmount());
  });

  it('mapping vers les routes EXISTANTES (href) — aucune route renommée — et clic = navigation', () => {
    const r = render();
    // Chaque onglet, pressé, déclenche la navigation vers son href canonique, dans l'ordre.
    for (const t of tabs(r)) act(() => (t.props.onPress as () => void)());
    expect(hrefCalls).toEqual(PRIMARY_SPACES.map((s) => EXPECTED_HREF[s.name]));
    // Aucune route inventée : l'ensemble des href est exactement l'ensemble canonique.
    expect(new Set(hrefCalls)).toEqual(new Set(Object.values(EXPECTED_HREF)));
    act(() => r.unmount());
  });

  it('mapping vers les icônes Trademy existantes (home/learn/library/lab/profile), aucun second système', () => {
    const r = render();
    const icons = r.root.findAllByType(TrademyIcon).map((n) => n.props.name);
    expect(icons).toEqual(PRIMARY_SPACES.map((s) => s.icon));
    expect(icons).toEqual(['home', 'learn', 'library', 'lab', 'profile']);
    act(() => r.unmount());
  });

  it('un SEUL onglet actif ; état exposé par le NOM (jamais la seule couleur) et déterministe selon la route', () => {
    for (const active of ['index', 'apprendre', 'profil']) {
      const r = render(active);
      const selected = tabs(r).filter((t) => t.props.accessibilityState?.selected === true);
      expect(selected).toHaveLength(1);
      // L'actif est exposé par le nom accessible ET par l'état — pas uniquement une couleur.
      expect(labelOf(selected[0])).toMatch(/, espace actif$/);
      const activeTitle = PRIMARY_SPACES.find((s) => s.name === active)!.title;
      expect(labelOf(selected[0])).toBe(`${activeTitle}, espace actif`);
      // Les inactifs n'ont pas le suffixe.
      for (const t of tabs(r)) {
        if (t !== selected[0]) expect(labelOf(t)).not.toMatch(/espace actif/);
      }
      act(() => r.unmount());
    }
  });

  it('aucun bouton mort : chaque onglet possède un gestionnaire réel', () => {
    const r = render();
    const t = tabs(r);
    expect(t).toHaveLength(5);
    for (const tab of t) expect(typeof tab.props.onPress).toBe('function');
    act(() => r.unmount());
  });

  it('n’écrit AUCUNE persistance et ne rend aucune valeur invalide ; remontage déterministe', () => {
    const first = render('laboratoire');
    const json1 = JSON.stringify(first.toJSON());
    expect(json1).not.toMatch(/NaN|undefined|Infinity|Invalid Date/);
    expect(findEmoji(json1)).toEqual([]);
    expect(json1).not.toMatch(/[⏮⏭◀▶←↑→↓‹›★☆]/u);
    act(() => first.unmount());

    const second = render('laboratoire');
    const json2 = JSON.stringify(second.toJSON());
    expect(json2).toBe(json1); // remontage → rendu identique (déterministe)
    act(() => second.unmount());

    // Le shell ne touche pas au stockage.
    expect(AsyncStorage.setItem as jest.Mock).not.toHaveBeenCalled();
  });

  it('les cinq écrans restent joignables (cinq routes distinctes) et les inactifs ne sont pas dupliqués', () => {
    const r = render();
    for (const t of tabs(r)) act(() => (t.props.onPress as () => void)());
    expect(new Set(hrefCalls).size).toBe(5); // 5 destinations distinctes
    expect(r.root.findAllByType(TrademyIcon)).toHaveLength(5); // une icône par onglet, pas de doublon
    act(() => r.unmount());
  });
});
