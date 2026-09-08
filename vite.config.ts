import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

/**
 * Empreinte de la publication en cours, écrite juste avant par
 * scripts/generate-sitemap.mjs. Le site la compare à celle servie par
 * version.json pour savoir qu'une nouvelle version est en ligne.
 */
function buildId(): string {
  try {
    const brut = fs.readFileSync(path.resolve(__dirname, 'public/version.json'), 'utf8');
    return (JSON.parse(brut) as { build?: string }).build ?? 'dev';
  } catch {
    return 'dev';
  }
}

/**
 * Prévient le navigateur de l'adresse de la base, dès la lecture de l'entête.
 *
 * Sans cela, la poignée de main réseau — DNS, TLS — n'a lieu qu'au moment où
 * le catalogue est demandé, soit après le téléchargement et l'analyse de tout
 * le JavaScript. Sur mobile, ce sont quelques centaines de millisecondes
 * perdues à ne rien faire. L'adresse n'a rien de secret : elle est déjà dans
 * le code envoyé au navigateur, et la clé, elle, ne passe pas par ici.
 */
function preconnexionBase() {
  return {
    name: 'preconnexion-base',
    transformIndexHtml(html: string) {
      const url = process.env.VITE_SUPABASE_URL;
      if (!url) return html;
      let origine: string;
      try {
        origine = new URL(url).origin;
      } catch {
        return html;
      }
      return html.replace(
        '</head>',
        `  <link rel="preconnect" href="${origine}" crossorigin />\n` +
          `    <link rel="dns-prefetch" href="${origine}" />\n  </head>`,
      );
    },
  };
}

export default defineConfig(() => {
  return {
    define: { __BUILD_ID__: JSON.stringify(buildId()) },
    /*
     * Chemin de base du site publié.
     *
     * Sur GitHub Pages, le site vit dans un sous-dossier (/afaura-lumea/) et
     * les fichiers doivent être demandés à cette adresse. Sur un hébergeur qui
     * sert le site à la racine (Vercel, Netlify, domaine propre), la variable
     * reste vide et tout part de « / ».
     */
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss(), preconnexionBase()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
