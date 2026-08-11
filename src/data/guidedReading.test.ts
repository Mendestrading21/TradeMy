import { describe, it, expect } from '@jest/globals';
import { guidedReading } from './guidedReading';
import { V5_CONCEPTS } from './learningContent';

/**
 * LOT E4 — verrou de la LECTURE GUIDÉE dérivée.
 *
 * Avant ce lot, le bloc n'apparaissait que sur les fiches portant un exemple annoté RÉDIGÉ : les
 * autres affichaient leur visuel sans un mot pour dire comment le lire. La lecture est désormais
 * dérivée des champs déjà validés de la fiche — jamais inventée — selon un ordre de priorité
 * strict, et reste ABSENTE des notions pures.
 */
const VOCABULAIRE_INTERDIT = /\b(buy|sell|profit garanti|gain garanti|trade gagnant|signal sûr)\b/i;

describe('LOT E4 — lecture guidée dérivée des champs réels de la fiche', () => {
  it('couvre bien plus de fiches qu’avant (l’exemple rédigé ne couvrait que les fiches annotées)', () => {
    const avecExempleRedige = V5_CONCEPTS.filter((c) => c.chartExamples[0]?.caption?.trim()).length;
    const avecLecture = V5_CONCEPTS.filter((c) => guidedReading(c)).length;
    expect(avecLecture).toBeGreaterThan(avecExempleRedige);
    // La très grande majorité du corpus dispose désormais d'une lecture guidée.
    expect(avecLecture).toBeGreaterThanOrEqual(60);
  });

  it('l’exemple RÉDIGÉ fait toujours foi quand il existe', () => {
    for (const c of V5_CONCEPTS) {
      const ex = c.chartExamples[0];
      if (!ex?.caption?.trim()) continue;
      const r = guidedReading(c)!;
      expect(r.origin).toBe('exemple');
      expect(r.caption).toBe(ex.caption.trim());
      expect(r.direction).toBe(ex.direction ?? 'neutral');
    }
  });

  it('chaque légende dérivée cite un contenu RÉEL de la fiche (aucun texte inventé)', () => {
    const inventees: string[] = [];
    for (const c of V5_CONCEPTS) {
      const r = guidedReading(c);
      if (!r || r.origin === 'exemple') continue;
      if (r.origin === 'scenario') {
        const scenario = c.bullishScenario ?? c.bearishScenario ?? c.neutralScenario;
        const attendu = scenario!.conditions.map((x) => x.trim()).filter(Boolean).join(' · ');
        if (r.caption !== attendu) inventees.push(`${c.slug}/scenario`);
      } else {
        const confirmation = c.confirmationZone!.trim();
        // La légende reprend la zone de confirmation (hors initiale, mise en minuscule).
        if (!r.caption.includes(confirmation.slice(1))) inventees.push(`${c.slug}/confirmation`);
      }
    }
    expect(inventees).toEqual([]);
  });

  it('la direction dérivée reste cohérente avec la source (scénario ou visuel)', () => {
    for (const c of V5_CONCEPTS) {
      const r = guidedReading(c);
      if (!r) continue;
      if (r.origin === 'scenario') {
        const attendue = c.bullishScenario ? 'bullish' : c.bearishScenario ? 'bearish' : 'neutral';
        expect(r.direction).toBe(attendue);
      }
      if (r.origin === 'confirmation') {
        expect(r.direction).toBe(c.visualSpec?.direction ?? 'neutral');
      }
    }
  });

  it('les NOTIONS pures n’obtiennent PAS de lecture de marché fabriquée', () => {
    for (const slug of ['dividende', 'per', 'unite-de-temps', 'echelle-des-prix']) {
      const c = V5_CONCEPTS.find((x) => x.slug === slug)!;
      expect(guidedReading(c)).toBeUndefined();
    }
  });

  it('aucune légende vide, aucun vocabulaire interdit, résultat déterministe', () => {
    for (const c of V5_CONCEPTS) {
      const r = guidedReading(c);
      if (!r) continue;
      expect(r.caption.trim().length).toBeGreaterThan(10);
      expect(r.caption).not.toMatch(VOCABULAIRE_INTERDIT);
      expect(guidedReading(c)).toEqual(r);
    }
  });
});
