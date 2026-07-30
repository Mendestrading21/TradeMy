/**
 * LOT W4 — Verrou du REGISTRE canonique des figures mascottes.
 *
 * La vérité d'organisation des images est UNIQUE : chaque render officiel est décrit une fois
 * (fichier, personnage, humeur, usage, dimensions natives). Ce test verrouille le registre sur
 * la RÉALITÉ du dépôt : le fichier existe et l'en-tête PNG (IHDR) porte EXACTEMENT les
 * dimensions épinglées — redimensionner un PNG sans passer par le registre casse la CI.
 */
import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIGURE_REGISTRY, FIGURE_NAMES } from './figureRegistry';
import { IMAGES, type ImageName } from './assets';

const ROOT = join(__dirname, '..', '..');

/** Dimensions réelles d'un PNG depuis son en-tête IHDR (octets 16..24). */
function pngSize(file: string): { width: number; height: number } {
  const buf = readFileSync(join(ROOT, file));
  // Signature PNG : le fichier est bien un PNG (pas un placeholder renommé).
  expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe('Registre canonique des figures (LOT W4)', () => {
  it('couvre EXACTEMENT les assets déclarés (aucun render orphelin, aucune entrée fantôme)', () => {
    expect(new Set(FIGURE_NAMES)).toEqual(new Set(Object.keys(IMAGES) as ImageName[]));
    expect(FIGURE_NAMES).toHaveLength(8);
  });

  it('chaque fichier EXISTE et ses dimensions natives réelles (IHDR) == celles épinglées', () => {
    for (const name of FIGURE_NAMES) {
      const meta = FIGURE_REGISTRY[name];
      const real = pngSize(meta.file);
      expect({ name, ...real }).toEqual({ name, width: meta.width, height: meta.height });
    }
  });

  it('chaque entrée est documentée : personnage cohérent avec le nom, humeur et usage non vides', () => {
    for (const name of FIGURE_NAMES) {
      const meta = FIGURE_REGISTRY[name];
      expect(meta.mood.trim().length).toBeGreaterThan(0);
      expect(meta.usage.trim().length).toBeGreaterThan(0);
      if (name.startsWith('toto')) expect(meta.character).toBe('toto');
      else if (name.startsWith('bobo')) expect(meta.character).toBe('bobo');
      else expect(meta.character).toBe('duo'); // analyze / celebrate : les deux guides ensemble
    }
  });
});
