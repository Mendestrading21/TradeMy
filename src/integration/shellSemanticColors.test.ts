import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verrous de source LOT 4-H sur le shell de navigation (`TrademyTabBar` + `(tabs)/_layout.tsx`) :
 *  - aucune couleur sémantique DÉTOURNÉE pour un usage générique de navigation (bullish/bearish =
 *    marché ; reward/mastery/advanced = progression ; confirmation/invalidation/technical = annotation) ;
 *  - l'accent d'état actif reste l'accent de MARQUE (primary/primaryBright), comme partout ailleurs ;
 *  - un SEUL système d'icônes (`TrademyIcon`) — aucun pack externe ;
 *  - le shell N'IMPORTE aucun moteur/dataset/analytics/persistance (il ne fait que présenter) ;
 *  - la cible tactile minimale (44 px) est présente.
 */
const TABBAR = join(process.cwd(), 'src', 'components', 'TrademyTabBar.tsx');
const LAYOUT = join(process.cwd(), 'src', 'app', '(tabs)', '_layout.tsx');
const SRC = readFileSync(TABBAR, 'utf8');
const LAY = readFileSync(LAYOUT, 'utf8');
const BOTH = `${SRC}\n${LAY}`;

describe('LOT 4-H — couleurs, icônes et imports du shell', () => {
  it('ne détourne aucune couleur sémantique réservée', () => {
    for (const t of ['bullish', 'bearish', 'reward', 'mastery', 'advanced', 'confirmation', 'invalidation', 'technical']) {
      expect(BOTH).not.toMatch(new RegExp(`theme\\.colors\\.${t}\\b`));
    }
  });

  it('emploie l’accent de marque et les tokens de surface/état/focus attendus', () => {
    expect(SRC).toMatch(/theme\.colors\.primaryBright\b/); // accent actif
    expect(SRC).toMatch(/theme\.colors\.primary\b/); // contour de la capsule active
    expect(SRC).toMatch(/theme\.colors\.textSecondary\b/); // libellé inactif (AA)
    expect(SRC).toMatch(/theme\.colors\.surfaceSelected\b/); // fond de la capsule active
    expect(SRC).toMatch(/theme\.colors\.focusRing\b/); // focus clavier visible
  });

  it('n’utilise qu’un seul système d’icônes (TrademyIcon), aucun pack externe', () => {
    expect(SRC).toMatch(/\bTrademyIcon\b/);
    for (const pack of ['@expo/vector-icons', 'react-native-vector-icons', 'lucide', 'react-icons', 'ionicons', 'FontAwesome', 'MaterialIcons']) {
      expect(BOTH).not.toContain(pack);
    }
  });

  it('n’importe aucun moteur, dataset, analytics ni persistance (shell purement présentationnel)', () => {
    for (const forbidden of ['@/engines', '@/analytics', '@/data', 'AsyncStorage', 'repositories', 'migration', 'progressContext', 'useProgress']) {
      expect(BOTH).not.toContain(forbidden);
    }
  });

  it('conserve une cible tactile minimale de 44 px', () => {
    expect(SRC).toMatch(/minHeight:\s*44/);
  });
});
