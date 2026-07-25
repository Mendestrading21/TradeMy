/**
 * Garde-fou emoji GÉNÉRIQUE du projet Trademy — source unique.
 *
 * Détecte tout pictogramme/emoji système susceptible d'être utilisé comme substitut d'icône
 * (au lieu de la famille `TrademyIcon`). Réutilisé par les gardes de source (Accueil, pilote)
 * ET par les tests d'intégration rendu, afin qu'aucun écran ne réintroduise d'emoji.
 *
 * Portée : pictogrammes/emoji uniquement. Les flèches typographiques (→, ›, ◀, ▶) et l'ellipsis
 * restent autorisées (plages 2190–23FF, 25xx exclues). Le sélecteur de variante emoji U+FE0F
 * (présent dans « ⏱️ », « ❤️ »…) est inclus pour attraper les emoji à base de symbole.
 */
export const EMOJI_PICTOGRAPH = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;

/** Renvoie tous les pictogrammes emoji trouvés dans `text` (tableau vide si aucun). */
export function findEmoji(text: string): string[] {
  return text.match(new RegExp(EMOJI_PICTOGRAPH, 'gu')) ?? [];
}
