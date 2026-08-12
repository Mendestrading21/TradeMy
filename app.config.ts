import type { ConfigContext, ExpoConfig } from 'expo/config';

import deployment from './config/deployment.json';

/**
 * Configuration dynamique minimale.
 *
 * `app.json` décrit l'identité PatternLab. Le chemin GitHub Pages appartient à
 * l'infrastructure du dépôt TradeMy et n'a qu'une source de vérité :
 * `config/deployment.json`.
 *
 * Le chemin de base est réservé à l'EXPORT WEB. Il était auparavant appliqué à toutes les
 * plateformes, et le bundle natif embarquait alors le motif d'URL `^https?://.*?/TradeMy/assets/`
 * (constaté dans le bytecode Hermes d'un export iOS). Un chemin de déploiement web n'a rien à faire
 * dans une application native : seul `scripts/export-web.mjs` pose le drapeau ci-dessous.
 */
const isWebExport = process.env.TRADEMY_WEB_BASE_PATH === '1';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'PatternLab',
  slug: config.slug ?? 'patternlab',
  experiments: {
    ...config.experiments,
    ...(isWebExport ? { baseUrl: deployment.webBasePath } : {}),
  },
  extra: {
    ...config.extra,
    deployment: {
      webBasePath: deployment.webBasePath,
      publicUrl: deployment.publicUrl,
    },
  },
});
