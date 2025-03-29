/// <reference types="vitest/config" />
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  build: {
    rollupOptions: {
      input: './src/server/app.ts'
    }
  },
  optimizeDeps: {
    include: ['@conform-to/react', '@conform-to/zod']
  }
});
