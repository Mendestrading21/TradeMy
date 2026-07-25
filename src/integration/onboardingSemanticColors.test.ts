import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verrous de source LOT 4-I sur l'onboarding (`app/onboarding.tsx`) :
 *  - aucune couleur sémantique DÉTOURNÉE (bullish/bearish = marché ; reward/mastery/advanced =
 *    récompense/maîtrise/difficulté ; confirmation/invalidation/technical = annotation) ;
 *  - tokens attendus présents (primary/primaryBright/info/neutral/success) ;
 *  - un SEUL système d'icônes (`TrademyIcon`), aucun pack externe ;
 *  - mappings présentationnels option → icône déclarés ;
 *  - taxonomie analytics INCHANGÉE (aucun nouvel évènement) ;
 *  - aucune mutation de dataset et aucune dépendance externe ajoutée.
 */
const SRC = readFileSync(join(process.cwd(), 'src', 'app', 'onboarding.tsx'), 'utf8');
const KNOWN_EVENTS = new Set(['onboarding_started', 'goal_selected', 'path_generated', 'diagnostic_completed']);

describe('LOT 4-I — couleurs, icônes, analytics et imports de l’onboarding', () => {
  it('ne détourne aucune couleur sémantique réservée', () => {
    for (const t of ['bullish', 'bearish', 'reward', 'mastery', 'advanced', 'confirmation', 'invalidation', 'technical']) {
      expect(SRC).not.toMatch(new RegExp(`theme\\.colors\\.${t}\\b`));
    }
  });

  it('emploie les tokens attendus', () => {
    for (const t of ['primary', 'primaryBright', 'info', 'neutral', 'success']) {
      expect(SRC).toMatch(new RegExp(`theme\\.colors\\.${t}\\b`));
    }
  });

  it('n’utilise qu’un seul système d’icônes (TrademyIcon), aucun pack externe', () => {
    expect(SRC).toMatch(/\bTrademyIcon\b/);
    for (const pack of ['@expo/vector-icons', 'react-native-vector-icons', 'lucide', 'react-icons', 'ionicons', 'FontAwesome', 'MaterialIcons']) {
      expect(SRC).not.toContain(pack);
    }
  });

  it('déclare des mappings présentationnels option → icône', () => {
    expect(SRC).toMatch(/OBJECTIVE_ICON/);
    expect(SRC).toMatch(/LEVEL_ICON/);
    expect(SRC).toMatch(/TOPIC_ICON/);
    expect(SRC).toMatch(/TrademyIconName/);
  });

  it('ne modifie pas la taxonomie analytics (aucun évènement hors ensemble connu)', () => {
    const events = [...SRC.matchAll(/analytics\.track\(\s*'([a-z_]+)'/g)].map((m) => m[1]);
    expect(events.length).toBeGreaterThan(0);
    for (const e of events) expect(KNOWN_EVENTS.has(e)).toBe(true);
  });

  it('ne mute aucun dataset (lecture seule des options)', () => {
    for (const ds of ['OBJECTIVES', 'LEVELS', 'DAILY_OPTIONS', 'TOPICS']) {
      expect(SRC).not.toMatch(new RegExp(`${ds}\\.push`));
      expect(SRC).not.toMatch(new RegExp(`${ds}\\[[^\\]]+\\]\\s*=`)); // aucune écriture d'index
    }
  });
});
