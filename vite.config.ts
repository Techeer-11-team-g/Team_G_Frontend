import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      // 백엔드 API 프록시 설정
      '/api': {
        target: 'http://localhost:8000', // 백엔드 서버 주소
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Use esbuild for minification (faster than terser, built-in)
    minify: 'esbuild',
    // Code splitting for optimal caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate for better caching
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          // Heavy libraries - load only when needed
          'vendor-3d': ['@splinetool/react-spline', '@splinetool/runtime'],
          'vendor-animation': ['gsap'],
          'vendor-lottie': ['@lottiefiles/dotlottie-react'],
          'vendor-google-auth': ['@react-oauth/google'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-utils': ['axios', 'zustand', 'clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for smaller bundle
    target: 'es2020',
  },
});
