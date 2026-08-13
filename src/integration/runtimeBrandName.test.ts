import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { APP_INFO } from '../lib/appInfo';

/**
 * Garde-fou de MARQUE, sur le modèle de `runtimeNoEmoji`.
 *
 * Le canon distingue trois noms : la marque publique **Trademy**, le nom du dépôt **TradeMy**, et
 * l'identifiant historique interne **PatternLab**. Un seul des trois doit atteindre l'utilisateur.
 *
 * Ce test existe parce que la distinction avait déjà lâché : le PREMIER écran de l'onboarding
 * affichait « Bienvenue sur TradeMy » — le nom du dépôt, sur l'écran d'accueil d'un nouveau venu.
 * Découvert en pilotant l'export web réel dans un navigateur, pas par un test : aucun ne regardait.
 *
 * La règle appliquée ici est volontairement étroite pour rester vraie :
 *  - dans le TEXTE RENDU (littéraux JSX, libellés, `accessibilityLabel`), la seule graphie admise
 *    est celle de `APP_INFO.name` — et le mieux reste de la dériver au lieu de l'écrire ;
 *  - dans les COMMENTAIRES, les autres graphies sont libres (elles nomment le dépôt, un document
 *    de design ou un lot historique, et les interdire ne protégerait personne) ;
 *  - les clés de stockage `patternlab.*` sont PERSISTÉES : les renommer effacerait la progression
 *    des utilisateurs existants. Elles ne sont pas du texte rendu.
 */
const ROOT = join(__dirname, '..', '..');
const DIRS = ['src/app', 'src/components', 'src/design-system', 'src/characters', 'src/engines', 'src/lib'];

/** Graphies interdites à l'écran : le nom du dépôt et l'identifiant historique. */
const INTERDITES = [/TradeMy/, /PatternLab/i];

function sourcesRuntime(): string[] {
  const out = execSync(
    `find ${DIRS.join(' ')} \\( -name '*.ts' -o -name '*.tsx' \\) ! -name '*.test.*'`,
    { cwd: ROOT, encoding: 'utf8' },
  );
  return out.trim().split('\n').filter(Boolean);
}

/** Retire les commentaires (ligne et bloc) : ils n'atteignent jamais l'écran. */
function sansCommentaires(source: string): string[] {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((l) => l.replace(/\/\/.*$/, ''));
}

describe('Garde-fou de marque — l’utilisateur ne voit QUE « Trademy »', () => {
  it('la marque publique est bien celle du canon', () => {
    expect(APP_INFO.name).toBe('Trademy');
  });

  it('aucune source runtime ne rend le nom du dépôt ni l’identifiant historique', () => {
    const fichiers = sourcesRuntime();
    expect(fichiers.length).toBeGreaterThan(100); // le périmètre réel est bien balayé
    const fautifs: string[] = [];
    for (const f of fichiers) {
      sansCommentaires(readFileSync(join(ROOT, f), 'utf8')).forEach((ligne, i) => {
        // Les clés de stockage persistées (`patternlab.progress`…) ne sont pas du texte rendu.
        const nettoyee = ligne.replace(/['"`]patternlab\.[a-z0-9._-]*['"`]/gi, '');
        for (const motif of INTERDITES) {
          if (motif.test(nettoyee)) fautifs.push(`${f}:${i + 1} → ${ligne.trim().slice(0, 90)}`);
        }
      });
    }
    expect(fautifs).toEqual([]);
  });

  it('l’écran d’onboarding DÉRIVE la marque au lieu de l’écrire en dur', () => {
    // Le défaut d'origine était un littéral. Dériver de la source unique le rend impossible à répéter.
    const source = readFileSync(join(ROOT, 'src/app/onboarding.tsx'), 'utf8');
    expect(source).toContain('Bienvenue sur {APP.name}');
  });
});
