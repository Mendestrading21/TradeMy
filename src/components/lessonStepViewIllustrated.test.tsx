/**
 * LOT W1 — leçons 100 % illustrées : le contre-exemple (« faux signal ») MONTRE le visuel réel du
 * concept au-dessus du piège, et le résumé (« à retenir ») ancre la synthèse avec la vignette
 * compacte (MiniVisual). Repli texte inchangé quand aucun concept n'est résolvable — jamais
 * d'étape vide. Garde-fous sur des leçons RÉELLES des modules guidés.
 */
/* eslint-disable @typescript-eslint/no-require-imports, import/first -- les fabriques jest.mock sont
   hissées par jest au-dessus des imports ; require() y est le seul mécanisme disponible. */
import { describe, it, expect, jest } from '@jest/globals';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: () => {}, back: () => {} }) }));
// Même mock que les tests d'intégration : animations statiques, arbre de rendu réel.
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

import { LessonStepView } from './LessonStepView';
import { VisualCard, MiniVisual } from '@/engines/visual';
import { getLessons, conceptSlugForSkill, conceptBySlug, V5_CONCEPTS, CONTENT_MODULES } from '@/data';

const SKILL = 'skill.patterns.double'; // module guidé Figures : concept réel avec visualSpec
const LESSON = getLessons(SKILL)[0];
const FALSE_SIGNAL = LESSON.steps.find((s) => s.kind === 'falseSignal')!;
const SUMMARY = LESSON.steps.find((s) => s.kind === 'summary')!;

function render(el: React.ReactElement): ReactTestRenderer {
  let r!: ReactTestRenderer;
  act(() => {
    r = renderer.create(el);
  });
  return r;
}
const hasText = (r: ReactTestRenderer, s: string) =>
  r.root.findAll((n) => typeof n.props?.children === 'string' && n.props.children === s, { deep: true }).length > 0;

describe('LessonStepView — contre-exemple et résumé illustrés (LOT W1)', () => {
  it('la leçon réelle porte bien les deux étapes, sans conceptRef propre (le repli compte)', () => {
    expect(FALSE_SIGNAL).toBeDefined();
    expect(SUMMARY).toBeDefined();
    expect(FALSE_SIGNAL.conceptRef).toBeUndefined();
    expect(conceptBySlug(V5_CONCEPTS, conceptSlugForSkill(SKILL)!)?.visualSpec).toBeDefined();
  });

  it('« faux signal » : le visuel réel du concept s’affiche AU-DESSUS du piège décrit', () => {
    const r = render(<LessonStepView step={FALSE_SIGNAL} conceptSlug={conceptSlugForSkill(SKILL)} />);
    expect(r.root.findAllByType(VisualCard)).toHaveLength(1);
    if (FALSE_SIGNAL.body) expect(hasText(r, FALSE_SIGNAL.body)).toBe(true); // le texte reste lisible
    act(() => r.unmount());
  });

  it('« à retenir » : la vignette compacte du concept accompagne la synthèse', () => {
    const r = render(<LessonStepView step={SUMMARY} conceptSlug={conceptSlugForSkill(SKILL)} />);
    expect(r.root.findAllByType(MiniVisual)).toHaveLength(1);
    if (SUMMARY.body) expect(hasText(r, SUMMARY.body)).toBe(true);
    act(() => r.unmount());
  });

  it('sans concept résolvable : repli texte inchangé pour les deux étapes (jamais vide)', () => {
    for (const step of [FALSE_SIGNAL, SUMMARY]) {
      const r = render(<LessonStepView step={step} />);
      expect(r.root.findAllByType(VisualCard)).toHaveLength(0);
      expect(r.root.findAllByType(MiniVisual)).toHaveLength(0);
      if (step.body) expect(hasText(r, step.body)).toBe(true);
      act(() => r.unmount());
    }
  });

  it('TOUTES les leçons des 15 modules guidés rendent leurs étapes falseSignal et summary sans erreur', () => {
    // Couverture exhaustive : chaque compétence de chaque module — zéro écran cassé, texte lisible.
    for (const m of CONTENT_MODULES) {
      for (const s of m.skills) {
        const lesson = getLessons(s.id)[0];
        if (!lesson) continue;
        for (const kind of ['falseSignal', 'summary'] as const) {
          const step = lesson.steps.find((st) => st.kind === kind);
          if (!step) continue;
          const r = render(<LessonStepView step={step} conceptSlug={conceptSlugForSkill(s.id)} />);
          if (step.body) expect(hasText(r, step.body)).toBe(true);
          act(() => r.unmount());
        }
      }
    }
  });
});
