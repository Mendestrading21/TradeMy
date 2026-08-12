import { describe, it, expect } from '@jest/globals';
import { runReleaseChecks, type ReleaseInputs } from './releaseCheck';

function base(overrides: Partial<ReleaseInputs> = {}): ReleaseInputs {
  return {
    config: {
      name: 'PatternLab',
      slug: 'patternlab',
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/images/icon.png',
      userInterfaceStyle: 'dark',
      ios: { bundleIdentifier: 'com.trademy.app' },
      android: { package: 'com.trademy.app' },
      web: { favicon: './assets/images/favicon.png' },
      plugins: ['expo-router', ['expo-splash-screen', {}]],
    },
    packageVersion: '1.0.0',
    appInfoVersion: '1.0.0',
    assetExists: () => true,
    disclaimer: 'Application éducative — aucun conseil.',
    privacySummary: ['a', 'b', 'c'],
    hasAboutScreen: true,
    contentDraftCount: 10,
    contentAllInReview: true,
    ...overrides,
  };
}

describe('runReleaseChecks', () => {
  it('un projet prêt passe toutes les vérifications', () => {
    const { ok, checks } = runReleaseChecks(base());
    expect(ok).toBe(true);
    expect(checks.every((c) => c.ok)).toBe(true);
  });

  it('échoue si les versions divergent', () => {
    const { ok, checks } = runReleaseChecks(base({ packageVersion: '1.0.1' }));
    expect(ok).toBe(false);
    expect(checks.find((c) => c.name.includes('versions'))?.ok).toBe(false);
  });

  it('exige des identifiants reverse-DNS pour iOS et Android', () => {
    const noIds = runReleaseChecks(base({ config: { ...base().config, ios: {}, android: {} } }));
    expect(noIds.ok).toBe(false);
    const bad = runReleaseChecks(base({ config: { ...base().config, ios: { bundleIdentifier: 'PatternLab' } } }));
    expect(bad.checks.find((c) => c.name.includes('iOS'))?.ok).toBe(false);
  });

  it('échoue si un asset requis est absent', () => {
    const { ok, checks } = runReleaseChecks(base({ assetExists: (p) => !p.includes('icon') }));
    expect(ok).toBe(false);
    expect(checks.find((c) => c.name.includes('icône'))?.ok).toBe(false);
  });

  it('rejette un thème clair (incohérent avec la marque sombre)', () => {
    const { checks } = runReleaseChecks(base({ config: { ...base().config, userInterfaceStyle: 'light' } }));
    expect(checks.find((c) => c.name.includes('thème sombre'))?.ok).toBe(false);
  });

  it('exige un écran « À propos », un disclaimer et ≥ 3 points de confidentialité', () => {
    expect(runReleaseChecks(base({ hasAboutScreen: false })).ok).toBe(false);
    expect(runReleaseChecks(base({ disclaimer: '' })).ok).toBe(false);
    expect(runReleaseChecks(base({ privacySummary: ['a', 'b'] })).ok).toBe(false);
  });

  it('exige le plugin expo-router', () => {
    const { checks } = runReleaseChecks(base({ config: { ...base().config, plugins: ['expo-splash-screen'] } }));
    expect(checks.find((c) => c.name.includes('expo-router'))?.ok).toBe(false);
  });

  it('bloque la publication si un brouillon V5 est auto-publié', () => {
    const { ok, checks } = runReleaseChecks(base({ contentAllInReview: false }));
    expect(ok).toBe(false);
    expect(checks.find((c) => c.name.includes('contenu V5 en revue'))?.ok).toBe(false);
  });
});
