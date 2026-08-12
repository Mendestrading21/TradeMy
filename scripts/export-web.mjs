#!/usr/bin/env node
/**
 * Export web — le SEUL endroit où le chemin de base GitHub Pages est activé.
 *
 * `config/deployment.json` fournit `/TradeMy`, indispensable pour servir le site depuis un
 * sous-chemin. Mais `app.config.ts` l'appliquait à TOUTES les plateformes : le bundle iOS/Android
 * embarquait alors le motif d'URL `^https?://.*?/TradeMy/assets/` — vérifié dans le bytecode Hermes.
 * Un chemin de déploiement web n'a rien à faire dans une application native.
 *
 * Ce script pose donc le drapeau, et lui seul. Sans lui — donc pour tout build natif, tout `expo
 * start`, tout `eas build` — `app.config.ts` laisse `baseUrl` indéfini. Passer par un script Node
 * plutôt que par une variable en ligne dans `package.json` garde la commande valable sur Windows
 * comme sur Unix, sans ajouter la moindre dépendance.
 */
import { spawn } from 'node:child_process';

const child = spawn('npx', ['expo', 'export', '--platform', 'web'], {
  stdio: 'inherit',
  env: { ...process.env, TRADEMY_WEB_BASE_PATH: '1' },
  shell: process.platform === 'win32',
});

child.on('exit', (code) => process.exit(code ?? 1));
child.on('error', (err) => {
  console.error('Échec du lancement de l’export web :', err.message);
  process.exit(1);
});
