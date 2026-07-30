/**
 * LOT V1 — Avatar 3D : la TÊTE des renders réels remplace l'avatar vectoriel 2D.
 *
 * Garde-fous : chaque (personnage × expression) résout vers un render RÉEL du dépôt ;
 * chaque état canonique se rend sans erreur avec un libellé accessible ; le cadrage
 * zoome réellement sur la tête (l'image affichée déborde du cercle, jamais l'inverse).
 */
import { describe, it, expect } from '@jest/globals';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { Image } from 'expo-image';
import { MascotAvatar, AVATAR_FIGURE } from './MascotAvatar';
import { MascotDuo } from './MascotDuo';
import { theme } from '../design-system/theme';
import { IMAGES } from './assets';
import { CHARACTER_STATES } from './states';
import type { CharacterId, CharacterState, Expression } from './types';

const CHARACTERS: CharacterId[] = ['toto', 'bobo'];
const EXPRESSIONS: Expression[] = ['neutral', 'happy', 'excited', 'thinking', 'concerned', 'sad'];
const STATES = Object.keys(CHARACTER_STATES) as CharacterState[];

function render(el: React.ReactElement): ReactTestRenderer {
  let r!: ReactTestRenderer;
  act(() => {
    r = renderer.create(el);
  });
  return r;
}

describe('MascotAvatar — avatar 3D (tête des renders réels)', () => {
  it('chaque (personnage × expression) résout vers un render RÉEL du dépôt', () => {
    for (const c of CHARACTERS) {
      for (const e of EXPRESSIONS) {
        const name = AVATAR_FIGURE[c][e];
        expect(IMAGES[name]).toBeDefined();
        expect(name.startsWith(c)).toBe(true); // jamais la figure de l'autre personnage
      }
    }
  });

  it('tous les états canoniques se rendent, avec le bon libellé accessible', () => {
    for (const c of CHARACTERS) {
      for (const s of STATES) {
        const r = render(<MascotAvatar character={c} state={s} size={64} />);
        const root = r.root.findAll((n) => n.props?.accessibilityRole === 'image', { deep: true });
        expect(root.length).toBeGreaterThan(0);
        const label = String(root[0].props.accessibilityLabel);
        expect(label).toContain(c === 'toto' ? 'Toto' : 'Bobo');
        act(() => r.unmount());
      }
    }
  });

  it('le cadrage zoome sur la tête : l’image affichée est plus grande que le cercle', () => {
    const size = 96;
    const r = render(<MascotAvatar character="bobo" state="warning" size={size} />);
    const img = r.root.findAllByType(Image)[0];
    expect(img.props.source).toBe(IMAGES['bobo-warning']);
    const style = img.props.style as { width: number; height: number };
    expect(style.height).toBeGreaterThan(size);
    expect(style.width).toBeGreaterThan(size);
    act(() => r.unmount());
  });

  it('l’état pilote la figure : pensée → pose « réflexion » de Toto, jamais celle de Bobo', () => {
    const r = render(<MascotAvatar character="toto" state="think" size={64} />);
    const img = r.root.findAllByType(Image)[0];
    expect(img.props.source).toBe(IMAGES['toto-think']);
    act(() => r.unmount());
  });

  it('LOT W3 — anneau d’identité : bordure à la couleur du personnage + halo, libellé conservé', () => {
    for (const [c, color] of [['toto', theme.colors.bullish], ['bobo', theme.colors.bearish]] as const) {
      const r = render(<MascotAvatar character={c} size={64} ring />);
      const flat = JSON.stringify(r.toJSON());
      expect(flat).toContain(`"borderColor":"${color}"`); // anneau = couleur d'identité canon
      expect(flat).toContain(`"backgroundColor":"${color}24"`); // halo doux dérivé du même token
      const labeled = r.root.findAll((n) => n.props?.accessibilityRole === 'image', { deep: true });
      expect(String(labeled[0]?.props.accessibilityLabel)).toContain(c === 'toto' ? 'Toto' : 'Bobo');
      act(() => r.unmount());
    }
  });

  it('LOT W3 — decorative : masqué aux lecteurs d’écran (le parent porte le libellé)', () => {
    const r = render(<MascotAvatar character="toto" size={64} decorative />);
    expect(r.root.findAll((n) => n.props?.accessibilityRole === 'image', { deep: true })).toHaveLength(0);
    expect(r.root.findAll((n) => n.props?.accessibilityElementsHidden === true, { deep: true }).length).toBeGreaterThan(0);
    act(() => r.unmount());
  });
});

describe('MascotDuo — les deux guides en un seul format (LOT W3)', () => {
  it('rend les DEUX têtes réelles sous UN SEUL libellé accessible « Toto et Bobo »', () => {
    const r = render(<MascotDuo size={48} />);
    const labeled = r.root.findAll((n) => n.props?.accessibilityRole === 'image' && n.props?.accessible === true, { deep: true });
    // UN SEUL libellé exposé (le duo) — les têtes internes sont décoratives, jamais nommées.
    const labels = new Set(labeled.map((n) => String(n.props.accessibilityLabel)));
    expect(labels).toEqual(new Set(['Toto et Bobo, vos guides']));
    expect(r.root.findAllByType(Image)).toHaveLength(2); // les deux renders réels
    act(() => r.unmount());
  });

  it('avec anneaux : chaque tête porte l’anneau de SA couleur d’identité', () => {
    const r = render(<MascotDuo size={48} ring />);
    const flat = JSON.stringify(r.toJSON());
    expect(flat).toContain(`"borderColor":"${theme.colors.bullish}"`);
    expect(flat).toContain(`"borderColor":"${theme.colors.bearish}"`);
    act(() => r.unmount());
  });
});
