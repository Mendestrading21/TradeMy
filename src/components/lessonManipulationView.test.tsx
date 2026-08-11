/**
 * LOT E1 — rendu RÉEL de l'étape de manipulation : le replay affiche la FIGURE du concept quand
 * son dataset est assez long, la consigne est DÉRIVÉE du premier critère de reconnaissance (aucun
 * texte dupliqué dans les données), et le repli sur la série déterministe reste opérationnel.
 */
/* eslint-disable @typescript-eslint/no-require-imports, import/first -- fabriques jest.mock hissées. */
import { describe, it, expect, jest } from '@jest/globals';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: () => {}, back: () => {} }) }));
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
import { LessonReplay } from './LessonReplay';
import { allLessonsFlat } from '@/data/repoTruth';
import { conceptBySlug, V5_CONCEPTS } from '@/data';
import { datasetByKey } from '@/engines/visual';

function render(node: React.ReactElement): ReactTestRenderer {
  let r!: ReactTestRenderer;
  act(() => {
    r = renderer.create(node);
  });
  return r;
}
const textOf = (r: ReactTestRenderer) => JSON.stringify(r.toJSON());

/** Une manipulation adossée à un concept dont le dataset est assez long pour être rejoué. */
const AVEC_FIGURE = allLessonsFlat()
  .flatMap((l) => l.steps.filter((s) => s.kind === 'interaction'))
  .find((s) => datasetByKey(conceptBySlug(V5_CONCEPTS, s.conceptRef ?? '')?.visualSpec?.datasetKey).length >= 8)!;

describe('LOT E1 — rendu de la manipulation', () => {
  it('rejoue la FIGURE RÉELLE du concept (bougies du dataset canonique, pas la série de repli)', () => {
    const concept = conceptBySlug(V5_CONCEPTS, AVEC_FIGURE.conceptRef!)!;
    const figure = datasetByKey(concept.visualSpec!.datasetKey);
    const r = render(<LessonStepView step={AVEC_FIGURE} />);
    const replays = r.root.findAllByType(LessonReplay);
    expect(replays).toHaveLength(1);
    expect(replays[0].props.series).toEqual(figure);
    act(() => r.unmount());
  });

  it('dérive la consigne du premier critère de reconnaissance du concept (source unique)', () => {
    const concept = conceptBySlug(V5_CONCEPTS, AVEC_FIGURE.conceptRef!)!;
    const critere = concept.howToRecognize[0];
    const r = render(<LessonStepView step={AVEC_FIGURE} />);
    const rendu = textOf(r);
    expect(rendu).toContain('Révèle les bougies une à une');
    // Le critère RÉEL du concept apparaît (hors initiale, mise en minuscule pour l'enchâssement).
    expect(rendu).toContain(critere.slice(1));
    act(() => r.unmount());
  });

  it('repli : sans concept résolvable, la série déterministe est rejouée et rien ne casse', () => {
    const r = render(<LessonStepView step={{ id: 'x', kind: 'interaction', chartSeed: 2024 }} />);
    const replays = r.root.findAllByType(LessonReplay);
    expect(replays).toHaveLength(1);
    expect(replays[0].props.series).toBeUndefined();
    expect(replays[0].props.seed).toBe(2024);
    act(() => r.unmount());
  });

  it('un texte explicite dans la donnée prime sur la consigne dérivée', () => {
    const r = render(
      <LessonStepView step={{ id: 'x', kind: 'interaction', conceptRef: AVEC_FIGURE.conceptRef, body: 'Consigne propre à la leçon.' }} />,
    );
    expect(textOf(r)).toContain('Consigne propre à la leçon.');
    act(() => r.unmount());
  });

  it('toutes les manipulations RÉELLES du parcours se rendent sans erreur ni valeur invalide', () => {
    const steps = allLessonsFlat().flatMap((l) => l.steps.filter((s) => s.kind === 'interaction'));
    expect(steps.length).toBeGreaterThanOrEqual(58);
    for (const s of steps) {
      const r = render(<LessonStepView step={s} />);
      const rendu = textOf(r);
      expect(rendu).not.toMatch(/NaN|undefined|Infinity/);
      expect(r.root.findAllByType(LessonReplay)).toHaveLength(1);
      act(() => r.unmount());
    }
  });
});
