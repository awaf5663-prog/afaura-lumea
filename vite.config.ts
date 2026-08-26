import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    /*
     * Chemin de base du site publié.
     *
     * Sur GitHub Pages, le site vit dans un sous-dossier (/afaura-lumea/) et
     * les fichiers doivent être demandés à cette adresse. Sur un hébergeur qui
     * sert le site à la racine (Vercel, Netlify, domaine propre), la variable
     * reste vide et tout part de « / ».
     */
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss()],
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
