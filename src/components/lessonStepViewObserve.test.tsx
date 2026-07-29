/**
 * LOT V5 — l'étape « observe » MONTRE ce qu'elle demande d'observer : le visuel réel du concept
 * de la compétence (dataset de la fiche) s'affiche au-dessus de la consigne. Repli texte inchangé
 * quand aucun concept n'est résolvable. Garde-fous sur une leçon RÉELLE d'un module guidé.
 */
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
import { VisualCard } from '@/engines/visual';
import { getLessons, conceptSlugForSkill, conceptBySlug, V5_CONCEPTS } from '@/data';

const SKILL = 'skill.patterns.double'; // module guidé Figures : concept réel avec visualSpec
const LESSON = getLessons(SKILL)[0];
const OBSERVE = LESSON.steps.find((s) => s.kind === 'observe')!;

function render(el: React.ReactElement): ReactTestRenderer {
  let r!: ReactTestRenderer;
  act(() => {
    r = renderer.create(el);
  });
  return r;
}
const hasText = (r: ReactTestRenderer, s: string) =>
  r.root.findAll((n) => typeof n.props?.children === 'string' && n.props.children === s, { deep: true }).length > 0;

describe('LessonStepView — étape « observe » visuelle (LOT V5)', () => {
  it('la leçon réelle porte bien une étape observe SANS conceptRef propre (le repli compte)', () => {
    expect(OBSERVE).toBeDefined();
    expect(OBSERVE.conceptRef).toBeUndefined();
    // Le pont compétence → concept résout une fiche RÉELLE avec visuel.
    const slug = conceptSlugForSkill(SKILL)!;
    expect(conceptBySlug(V5_CONCEPTS, slug)?.visualSpec).toBeDefined();
  });

  it('avec le concept de la compétence : le graphique réel s’affiche AVEC la consigne', () => {
    const r = render(<LessonStepView step={OBSERVE} conceptSlug={conceptSlugForSkill(SKILL)} />);
    expect(r.root.findAllByType(VisualCard)).toHaveLength(1);
    if (OBSERVE.body) expect(hasText(r, OBSERVE.body)).toBe(true); // la consigne reste lisible
    act(() => r.unmount());
  });

  it('sans concept résolvable : repli texte inchangé (aucun visuel, consigne seule)', () => {
    const r = render(<LessonStepView step={OBSERVE} />);
    expect(r.root.findAllByType(VisualCard)).toHaveLength(0);
    if (OBSERVE.body) expect(hasText(r, OBSERVE.body)).toBe(true);
    act(() => r.unmount());
  });

  it('toutes les étapes observe des modules guidés restent rendables avec leur concept', () => {
    // Chaque compétence des modules guidés a un pont vers une fiche : l'étape observe de sa
    // leçon se rend sans erreur (visuel si la fiche en a un, texte sinon) — zéro écran cassé.
    const skills = ['skill.candles', 'skill.anatomy.candle', 'skill.structure.uptrend', 'skill.indicators.rsi'];
    for (const skillId of skills) {
      const lesson = getLessons(skillId)[0];
      const obs = lesson?.steps.find((s) => s.kind === 'observe');
      if (!obs) continue;
      const r = render(<LessonStepView step={obs} conceptSlug={conceptSlugForSkill(skillId)} />);
      if (obs.body) expect(hasText(r, obs.body)).toBe(true);
      act(() => r.unmount());
    }
  });
});
