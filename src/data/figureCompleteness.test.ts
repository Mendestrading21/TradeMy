import { describe, it, expect } from '@jest/globals';
import { V5_CONCEPTS } from './learningContent';
import { derivedCards } from './derivedRevision';

/**
 * LOT E3 — verrou de COMPLÉTUDE des fiches de FIGURE.
 *
 * Le canon impose « condition, preuve, invalidation ». Une fiche qui décrit une figure lisible sur
 * un graphique (chandelier, figure chartiste, structure de marché) doit donc dire ce qui la
 * CONFIRME et ce qui l'INVALIDE — sans quoi elle enseigne une forme sans son garde-fou.
 *
 * Cinq fiches de figure étaient incomplètes (mèche de rejet, impulsion/correction, retest de
 * niveau, distribution Wyckoff, faux breakout) : elles portent désormais zone de confirmation,
 * invalidation et scénario éducatif.
 *
 * Les NOTIONS (dividende, PER, unités de temps, discipline, indicateurs…) n'ont pas d'invalidation
 * et ne doivent pas s'en voir inventer une : elles ne sont pas concernées par cette règle. Les
 * exceptions parmi les types « figure » sont nommées ci-dessous, ce qui interdit toute régression
 * silencieuse tout en assumant les cas où le silence est la position honnête.
 */

/** Types de `visualSpec` qui décrivent une figure lisible sur un graphique. */
const TYPES_FIGURE = new Set(['candlestick-pattern', 'chart-pattern', 'market-structure']);

/**
 * Exceptions ASSUMÉES : fiches qui empruntent un visuel de type « figure » pour ILLUSTRER une
 * notion, alors qu'elles ne décrivent aucun setup à confirmer ou invalider. Leur inventer une
 * invalidation serait enseigner du faux — la position honnête est le silence.
 *
 * - `doji` : figure d'INDÉCISION ; elle n'annonce aucune direction, donc rien à invalider au sens
 *   directionnel (position déjà tenue en ADR-109 : aucun exercice d'invalidation pour le doji) ;
 * - `fomo`, `discipline` : COMPORTEMENTS de l'apprenant, illustrés sur un graphique ;
 * - `price-action` : nom d'une FAMILLE de lecture, pas d'un setup particulier ;
 * - `echelle-des-prix` : RÉGLAGE de lecture du graphique (linéaire/logarithmique).
 *
 * Toute nouvelle entrée ici doit être justifiée : c'est le prix à payer pour ne pas fabriquer
 * d'invalidation de complaisance.
 */
const EXCEPTIONS = ['doji', 'fomo', 'discipline', 'price-action', 'echelle-des-prix'];

const figures = () => V5_CONCEPTS.filter((c) => c.visualSpec && TYPES_FIGURE.has(c.visualSpec.type));

describe('LOT E3 — toute fiche de figure dit ce qui la confirme et ce qui l’invalide', () => {
  it('le périmètre « figure » est réel et significatif', () => {
    expect(figures().length).toBeGreaterThanOrEqual(30);
  });

  it('chaque fiche de figure porte une zone de confirmation ET une invalidation', () => {
    const incompletes = figures()
      .filter((c) => !EXCEPTIONS.includes(c.slug))
      .filter((c) => !c.confirmationZone?.trim() || !c.invalidation?.trim())
      .map((c) => c.slug);
    expect(incompletes).toEqual([]);
  });

  it('les exceptions assumées sont réelles et restent minoritaires (jamais une porte ouverte)', () => {
    for (const slug of EXCEPTIONS) {
      expect(V5_CONCEPTS.some((c) => c.slug === slug)).toBe(true);
    }
    // Une exception reste l'exception : moins d'un sixième des fiches de figure.
    expect(EXCEPTIONS.length * 6).toBeLessThanOrEqual(figures().length);
  });

  it('les cinq figures complétées portent aussi un scénario éducatif cohérent', () => {
    const completees = ['meche-de-rejet', 'impulsion-et-correction', 'retest-de-niveau', 'distribution-wyckoff', 'faux-breakout'];
    for (const slug of completees) {
      const c = V5_CONCEPTS.find((x) => x.slug === slug)!;
      expect(c).toBeDefined();
      const scenario = c.bullishScenario ?? c.bearishScenario ?? c.neutralScenario;
      expect(scenario).toBeDefined();
      expect(scenario!.conditions.length).toBeGreaterThanOrEqual(2);
      expect(scenario!.invalidation.trim().length).toBeGreaterThan(10);
    }
  });

  it('les NOTIONS ne se voient pas inventer d’invalidation (honnêteté du modèle)', () => {
    // Ces fiches expliquent une notion, pas un setup : l'absence d'invalidation est VOULUE.
    for (const slug of ['dividende', 'per', 'unite-de-temps', 'echelle-des-prix', 'discipline', 'fomo']) {
      const c = V5_CONCEPTS.find((x) => x.slug === slug)!;
      expect(c.invalidation).toBeFalsy();
    }
  });

  it('compléter ces fiches enrichit AUSSI la révision (cartes dérivées gagnées)', () => {
    for (const slug of ['meche-de-rejet', 'retest-de-niveau', 'faux-breakout']) {
      const c = V5_CONCEPTS.find((x) => x.slug === slug)!;
      const angles = derivedCards(c).map((d) => d.angle);
      expect(angles).toContain('confirmer');
      expect(angles).toContain('invalider');
    }
  });
});
