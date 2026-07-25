/**
 * Garde-fou emoji GÉNÉRIQUE du projet Trademy — SOURCE UNIQUE.
 *
 * Détecte tout pictogramme/emoji système susceptible d'être utilisé comme substitut d'icône
 * (au lieu de la famille `TrademyIcon`). Fondé sur les PROPRIÉTÉS Unicode (et non des plages
 * approximatives), pour attraper aussi les symboles-emoji hors des blocs « pictographes » :
 *   - `\p{Emoji_Presentation}` : caractères à présentation EMOJI par défaut (⌚ ⏰ ⏳ ⏩ ✅ 🎯 …) ;
 *   - `\p{Emoji}️` : n'importe quel caractère « emoji » forcé en présentation emoji par le
 *     sélecteur de variante U+FE0F — donc une VARIANTE FE0F (⏱, ◀, #, 1 + FE0F) reste détectée ;
 *   - `\p{Regional_Indicator}` : lettres indicatrices régionales → drapeaux (🇫🇷 …) ;
 *   - `⃣` : « combining enclosing keycap » → keycaps même SANS FE0F (« 1 » + U+20E3).
 *
 * AUTORISÉ (présentation TEXTE) : les flèches et chevrons typographiques utilisés par TradeMy —
 * `→` (2192), `›` (203A), `◀` (25C0), `▶` (25B6), `↔` (2194). Ces caractères ont
 * `Emoji_Presentation = No` : ils ne matchent PAS tant qu'ils ne sont pas suivis de U+FE0F.
 * Les nombres nus (« 0 », « 100 XP ») ne matchent jamais (Emoji sans FE0F).
 */
export const EMOJI_PICTOGRAPH = /\p{Emoji_Presentation}|\p{Emoji}️|\p{Regional_Indicator}|⃣/u;

/**
 * Renvoie tous les pictogrammes/emoji trouvés dans `text` (tableau vide si aucun).
 *
 * On reconstruit une variante GLOBALE en PRÉSERVANT les drapeaux compilés de `EMOJI_PICTOGRAPH`
 * (et sa `source`) au lieu de forcer « gu » : selon la transpilation Babel, les `\p{…}` peuvent être
 * expansés en classes basées sur les paires de substitution, sans drapeau `u` — forcer `u` casserait
 * alors les emoji astraux (🎯, drapeaux). Ajouter uniquement `g` reste correct dans tous les cas.
 */
export function findEmoji(text: string): string[] {
  const flags = EMOJI_PICTOGRAPH.flags.includes('g')
    ? EMOJI_PICTOGRAPH.flags
    : EMOJI_PICTOGRAPH.flags + 'g';
  return text.match(new RegExp(EMOJI_PICTOGRAPH.source, flags)) ?? [];
}
