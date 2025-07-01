/// <reference types="vitest/config" />
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [reactRouter(), tsconfigPaths()],
  build: {
    rollupOptions: {
      input: isSsrBuild ? './src/server/app.ts' : undefined
    }
  },
  optimizeDeps: {
    include: ['@conform-to/react', '@conform-to/zod']
  }
}));
