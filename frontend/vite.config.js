import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'info',
  plugins: [
    react({
      disableOxcRecommendation: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          // Radix UI components
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-radix';
          }
          // Animation libraries
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) {
            return 'vendor-animation';
          }
          // Three.js / 3D
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          // Chart libraries
          if (id.includes('node_modules/recharts')) {
            return 'vendor-chart';
          }
          // Data & form libraries
          if (id.includes('node_modules/@tanstack/react-query') || id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
            return 'vendor-data';
          }
          // Editor / document libraries
          if (id.includes('node_modules/react-quill') || id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'vendor-editor';
          }
          // UI component libraries
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/embla-carousel') || id.includes('node_modules/vaul') || id.includes('node_modules/cmdk') || id.includes('node_modules/sonner') || id.includes('node_modules/react-hot-toast')) {
            return 'vendor-ui';
          }
          // Large util libraries
          if (id.includes('node_modules/lodash') || id.includes('node_modules/date-fns') || id.includes('node_modules/moment') || id.includes('node_modules/clsx') || id.includes('node_modules/class-variance-authority')) {
            return 'vendor-utils';
          }
        }
      }
    }
  }
});