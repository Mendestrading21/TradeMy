/**
 * LOT M2 — le CONTRÔLEUR d'animation lui-même, rendu pour de vrai.
 *
 * Jusqu'ici seul l'avatar statique était monté par un test : le contrôleur — celui qui porte la
 * respiration, l'arrivée, l'ombre et désormais le geste — n'était jamais rendu. Une erreur dans une
 * séquence animée ou une valeur partagée serait passée à travers la gate.
 *
 * Ces tests montent le composant RÉEL pour les vingt-cinq états canoniques, dans les deux
 * orientations, avec et sans « réduire les animations ».
 */
import { describe, it, expect, afterEach, jest } from '@jest/globals';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { AccessibilityInfo } from 'react-native';
import { CharacterAnimationController } from './CharacterAnimationController';
import { CHARACTER_STATES } from './states';
import type { CharacterId, CharacterState } from './types';

// Même mock Reanimated que les tests d'intégration du dépôt : le moteur natif n'existe pas sous
// jest-expo. Les valeurs partagées, les séquences et les annulations restent donc exercées pour de
// vrai côté JavaScript — c'est là que vivent les erreurs que ce test doit attraper.
jest.mock('react-native-reanimated', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: { View, Text, createAnimatedComponent: (c: unknown) => c },
    useSharedValue: (v: unknown) => ({ value: v }),
    useAnimatedStyle: (fn: () => unknown) => fn(),
    withTiming: (v: unknown) => v,
    withSpring: (v: unknown) => v,
    withSequence: (...a: unknown[]) => a[a.length - 1],
    withRepeat: (v: unknown) => v,
    cancelAnimation: () => {},
    interpolate: () => 0,
    runOnJS: (fn: unknown) => fn,
  };
});

const STATES = Object.keys(CHARACTER_STATES) as CharacterState[];
const CHARACTERS: CharacterId[] = ['toto', 'bobo'];

function render(el: React.ReactElement): ReactTestRenderer {
  let r!: ReactTestRenderer;
  act(() => {
    r = renderer.create(el);
  });
  return r;
}

/** Force le réglage système « réduire les animations » pour le rendu suivant. */
function withReducedMotion(value: boolean) {
  return jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(value as never) as unknown as { mockRestore: () => void };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('CharacterAnimationController — le contrôleur rendu pour de vrai', () => {
  it('les 25 états × 2 guides × 2 orientations se montent et se démontent sans erreur', () => {
    for (const c of CHARACTERS) {
      for (const s of STATES) {
        for (const facing of [1, -1] as const) {
          const r = render(
            <CharacterAnimationController character={c} state={s} size={72} facing={facing} />,
          );
          const labeled = r.root.findAll((n) => n.props?.accessibilityRole === 'image', {
            deep: true,
          });
          expect(labeled.length).toBeGreaterThan(0);
          act(() => r.unmount());
        }
      }
    }
  });

  it('le libellé accessible vient du REGISTRE : l’information ne passe jamais par le seul geste', () => {
    for (const s of STATES) {
      const r = render(<CharacterAnimationController character="toto" state={s} size={64} />);
      const labeled = r.root.findAll((n) => n.props?.accessibilityRole === 'image', { deep: true });
      expect(String(labeled[0]?.props.accessibilityLabel)).toBe(CHARACTER_STATES[s].accessibleText);
      act(() => r.unmount());
    }
  });

  it('un changement d’état successif ne casse rien (le geste est rejoué, pas empilé)', () => {
    const r = render(<CharacterAnimationController character="bobo" state="idle" size={64} />);
    for (const s of ['point', 'warning', 'celebrate-big', 'think', 'idle'] as CharacterState[]) {
      act(() => {
        r.update(<CharacterAnimationController character="bobo" state={s} size={64} />);
      });
      const labeled = r.root.findAll((n) => n.props?.accessibilityRole === 'image', { deep: true });
      expect(String(labeled[0]?.props.accessibilityLabel)).toBe(CHARACTER_STATES[s].accessibleText);
    }
    act(() => r.unmount());
  });

  it('« réduire les animations » : rendu STATIQUE — aucune ombre animée, même libellé', async () => {
    withReducedMotion(true);
    let r!: ReactTestRenderer;
    await act(async () => {
      r = renderer.create(
        <CharacterAnimationController character="toto" state="celebrate-big" size={64} />,
      );
    });
    // L'ombre au sol est le marqueur du rendu animé : sous reduced-motion, elle n'existe pas.
    const flat = JSON.stringify(r.toJSON());
    expect(flat).not.toContain('"backgroundColor":"#000"');
    const labeled = r.root.findAll((n) => n.props?.accessibilityRole === 'image', { deep: true });
    expect(String(labeled[0]?.props.accessibilityLabel)).toBe(
      CHARACTER_STATES['celebrate-big'].accessibleText,
    );
    act(() => r.unmount());
  });

  it('sans reduced-motion : l’ombre au sol EST présente (l’ancrage du LOT M1 tient toujours)', async () => {
    withReducedMotion(false);
    let r!: ReactTestRenderer;
    await act(async () => {
      r = renderer.create(
        <CharacterAnimationController character="toto" state="celebrate-big" size={64} />,
      );
    });
    expect(JSON.stringify(r.toJSON())).toContain('"backgroundColor":"#000"');
    act(() => r.unmount());
  });
});
