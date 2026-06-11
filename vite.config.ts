import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { imagetools } from "vite-imagetools";

export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VITE_BUILD_HASH': JSON.stringify(
      new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')
    )
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    imagetools(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom', 'react-i18next', 'i18next', 'libphonenumber-js'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Group all Lucide icons into a single chunk
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          // Group React core
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/scheduler/')) {
            return 'react-vendor';
          }
          // Group router
          if (id.includes('react-router-dom') || id.includes('@remix-run')) {
            return 'router';
          }
          // Group Supabase
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          // Group all Radix UI components
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          // Group TanStack Query
          if (id.includes('@tanstack')) {
            return 'query';
          }
          // Group i18n
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          // Group Recharts and D3
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }
          // Group forms
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'forms';
          }
          // Group Framer Motion
          if (id.includes('framer-motion')) {
            return 'animations';
          }
          // Group remaining node_modules into vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    target: 'esnext',
    minify: 'esbuild',
  },
}));
