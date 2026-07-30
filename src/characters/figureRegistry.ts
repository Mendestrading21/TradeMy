import { IMAGES, type ImageName } from './assets';

/**
 * LOT W4 — REGISTRE CANONIQUE des figures mascottes (source unique d'organisation des images).
 *
 * Chaque render 3D officiel du dépôt est décrit UNE fois : fichier, personnage, humeur, usage
 * recommandé et dimensions NATIVES épinglées. Les dimensions sont la vérité de cadrage
 * (`HEAD_CROP` s'y réfère) : ne JAMAIS redimensionner les PNG — un changement de fichier doit
 * passer par ce registre et son verrou (`figureRegistry.test.ts` vérifie l'en-tête PNG réel).
 */
export interface MascotFigureMeta {
  /** Chemin du PNG dans le dépôt (vérifié par test). */
  file: string;
  /** Personnage(s) présents sur le render. */
  character: 'toto' | 'bobo' | 'duo';
  /** Humeur / rôle expressif du render. */
  mood: string;
  /** Usage recommandé dans l'app (doc vivante — où ce render « cadre »). */
  usage: string;
  /** Dimensions NATIVES du PNG (épinglées — vérité de cadrage, jamais redimensionner). */
  width: number;
  height: number;
}

export const FIGURE_REGISTRY: Record<ImageName, MascotFigureMeta> = {
  'toto-wave': {
    file: 'assets/characters/figures/toto-wave.png',
    character: 'toto',
    mood: 'accueillant (salut)',
    usage: 'Accueil, landing, avatar neutre/heureux de Toto.',
    width: 541,
    height: 760,
  },
  'toto-present': {
    file: 'assets/characters/figures/toto-present.png',
    character: 'toto',
    mood: 'enthousiaste (présente)',
    usage: 'Parcours, onboarding (fin), avatar « excited » de Toto.',
    width: 649,
    height: 760,
  },
  'toto-think': {
    file: 'assets/characters/figures/toto-think.png',
    character: 'toto',
    mood: 'réfléchi (pense)',
    usage: 'Accueil (concept du jour), avatar « thinking/concerned » de Toto.',
    width: 589,
    height: 760,
  },
  'toto-read': {
    file: 'assets/characters/figures/toto-read.png',
    character: 'toto',
    mood: 'studieux (lit)',
    usage: 'Onboarding (bienvenue), contextes de lecture/étude.',
    width: 461,
    height: 760,
  },
  'bobo-wave': {
    file: 'assets/characters/figures/bobo-wave.png',
    character: 'bobo',
    mood: 'accueillant (salut)',
    usage: 'Landing, avatar neutre/heureux de Bobo.',
    width: 570,
    height: 760,
  },
  'bobo-warning': {
    file: 'assets/characters/figures/bobo-warning.png',
    character: 'bobo',
    mood: 'prudent (met en garde)',
    usage: 'Faux signaux et invalidations, avatar « thinking/concerned » de Bobo.',
    width: 545,
    height: 760,
  },
  analyze: {
    file: 'assets/characters/figures/analyze.png',
    character: 'duo',
    mood: 'concentrés (analysent ensemble)',
    usage: 'Quiz / entraînement — les deux guides face au graphique.',
    width: 760,
    height: 673,
  },
  celebrate: {
    file: 'assets/characters/figures/celebrate.png',
    character: 'duo',
    mood: 'joyeux (célèbrent ensemble)',
    usage: 'Fin de session réussie, réussites/badges.',
    width: 760,
    height: 599,
  },
};

/** Métadonnées d'un render (organisation des images — source unique). */
export function figureMeta(name: ImageName): MascotFigureMeta {
  return FIGURE_REGISTRY[name];
}

/** Tous les noms de figures — dérivés du registre (jamais recopiés). */
export const FIGURE_NAMES = Object.keys(FIGURE_REGISTRY) as ImageName[];

// Garde-fou de complétude au COMPILATEUR : le registre couvre exactement les assets déclarés.
const _exhaustive: Record<keyof typeof IMAGES, MascotFigureMeta> = FIGURE_REGISTRY;
void _exhaustive;
