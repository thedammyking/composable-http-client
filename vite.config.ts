import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        axios: resolve(__dirname, 'src/axios.ts'),
        fetch: resolve(__dirname, 'src/fetch.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const extension = format === 'es' ? 'js' : 'cjs';
        return `${entryName}.${extension}`;
      },
    },
    rollupOptions: {
      external: ['axios', 'zod'],
      output: {
        globals: {
          axios: 'axios',
          zod: 'zod',
        },
      },
    },
    target: 'es2020',
    sourcemap: true,
  },
  esbuild: {
    target: 'es2020',
  },
});
