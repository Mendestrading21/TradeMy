import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verrous de source LOT 4-J sur la fiche concept (`app/concept/[slug].tsx`) :
 *  - `technical`/cyan (annotation) n'est JAMAIS détourné (ni maîtrise, ni chips de navigation, ni
 *    décoration générale) : il n'apparaît plus du tout ici ;
 *  - `bullish`/`bearish` sont réservés à la DIRECTION de marché des scénarios (bloc `SCENARIO_META`) ;
 *  - la maîtrise emploie ses tokens dédiés (identiques à la Bibliothèque : textMuted/info/primaryBright/
 *    success/mastery), jamais le marché ni le cyan ;
 *  - un SEUL système d'icônes (`TrademyIcon`), aucun pack externe ;
 *  - mappings présentationnels déclarés (STATE_META, SCENARIO_META) ;
 *  - taxonomie analytics INCHANGÉE (seul `concept_viewed`) ; aucune mutation de dataset.
 */
const SRC = readFileSync(join(process.cwd(), 'src', 'app', 'concept', '[slug].tsx'), 'utf8');

/** Texte COMPLET d'une déclaration `const NAME … = … ;` jusqu'à la déclaration/commentaire suivant
 *  (robuste aux annotations de type qui contiennent aussi des accolades avant le `=`). */
function block(name: string): string {
  const start = SRC.indexOf(`const ${name}`);
  if (start < 0) return '';
  const rest = SRC.slice(start + `const ${name}`.length);
  const next = rest.search(/\n(const |function |export |\/\*\*)/);
  return next < 0 ? SRC.slice(start) : SRC.slice(start, start + `const ${name}`.length + next);
}

describe('LOT 4-J — couleurs sémantiques, icônes et analytics de la fiche concept', () => {
  it('ne détourne jamais technical/cyan (absent de l’écran)', () => {
    expect(SRC).not.toMatch(/theme\.colors\.technical\b/);
  });

  it('réserve bullish/bearish à la direction de marché des scénarios (bloc SCENARIO_META)', () => {
    const scenario = block('SCENARIO_META');
    expect(scenario).toMatch(/theme\.colors\.bullish\b/);
    expect(scenario).toMatch(/theme\.colors\.bearish\b/);
    // Aucune couleur de marché hors du bloc scénarios.
    const outside = SRC.replace(scenario, '');
    expect(outside).not.toMatch(/theme\.colors\.bullish\b/);
    expect(outside).not.toMatch(/theme\.colors\.bearish\b/);
  });

  it('mappe la maîtrise sur ses tokens dédiés (canon Bibliothèque), sans marché ni cyan', () => {
    const meta = block('STATE_META');
    expect(meta).toMatch(/mastery/);
    for (const token of ['textMuted', 'info', 'primaryBright', 'success', 'mastery']) {
      expect(meta).toMatch(new RegExp(`theme\\.colors\\.${token}\\b`));
    }
    for (const forbidden of ['technical', 'bullish', 'bearish', 'reward']) {
      expect(meta).not.toMatch(new RegExp(`theme\\.colors\\.${forbidden}\\b`));
    }
  });

  it('n’utilise qu’un seul système d’icônes (TrademyIcon), aucun pack externe', () => {
    expect(SRC).toMatch(/\bTrademyIcon\b/);
    for (const pack of ['@expo/vector-icons', 'react-native-vector-icons', 'lucide', 'react-icons', 'ionicons', 'FontAwesome', 'MaterialIcons']) {
      expect(SRC).not.toContain(pack);
    }
  });

  it('déclare les mappings présentationnels (STATE_META, SCENARIO_META, TrademyIconName)', () => {
    expect(SRC).toMatch(/STATE_META/);
    expect(SRC).toMatch(/SCENARIO_META/);
    expect(SRC).toMatch(/TrademyIconName/);
  });

  it('ne modifie pas la taxonomie analytics (seul concept_viewed)', () => {
    const events = [...SRC.matchAll(/analytics\.track\(\s*'([a-z_]+)'/g)].map((m) => m[1]);
    expect(events).toEqual(['concept_viewed']);
  });

  it('ne mute aucun dataset (lecture seule)', () => {
    for (const ds of ['V5_CONCEPTS', 'WORLDS', 'CATEGORIES']) {
      expect(SRC).not.toMatch(new RegExp(`${ds}\\.push`));
      expect(SRC).not.toMatch(new RegExp(`${ds}\\[[^\\]]+\\]\\s*=[^=]`));
    }
  });
});
