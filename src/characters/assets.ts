/**
 * Carte des figures Toto & Bobo (exports runtime 3D sur fond transparent).
 * Les sources de production restent dans l'archive design privée ; le dépôt ne conserve que les
 * PNG optimisés décrits dans `assets/characters/README.md`. Metro hashe ces require().
 */

/** Figures détourées (fond transparent) — personnages posés sans cadre. */
export const IMAGES = {
  'toto-wave': require('../../assets/characters/figures/toto-wave.png'),
  'toto-present': require('../../assets/characters/figures/toto-present.png'),
  'toto-read': require('../../assets/characters/figures/toto-read.png'),
  'toto-think': require('../../assets/characters/figures/toto-think.png'),
  'bobo-wave': require('../../assets/characters/figures/bobo-wave.png'),
  'bobo-warning': require('../../assets/characters/figures/bobo-warning.png'),
  celebrate: require('../../assets/characters/figures/celebrate.png'),
  analyze: require('../../assets/characters/figures/analyze.png'),
};
export type ImageName = keyof typeof IMAGES;

/** @deprecated alias de compat. */
export const FIGURES = IMAGES;
export type FigureName = ImageName;

// Les avatars ronds cadrent la TÊTE de ces renders (MascotAvatar) : mêmes personnages partout.
