import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["@deck.gl/*", "deck.gl", "maplibre-gl"],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            vendor: ['react', 'react-dom'],
            map: ['maplibre-gl', '@deck.gl/core', '@deck.gl/layers', '@deck.gl/react'],
            ui: ['lucide-react', 'clsx', 'tailwind-merge', 'zustand'],
          },
        },
        // Tree shake more aggressively
        treeshake: {
          moduleSideEffects: false,
        },
      },
      // Enable source maps for production debugging
      sourcemap: false,
      // Minimize bundle size
      minify: 'esbuild',
      // Increase chunk size warning limit since map libraries are large
      chunkSizeWarningLimit: 1000,
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Target modern browsers for smaller bundles
      target: 'es2020',
    },
  },
  // Enable compression
  compressHTML: true,
});
