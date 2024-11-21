import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['@mui/material', '@emotion/react', '@emotion/styled'], // Add dependencies to pre-bundle
  },
});
