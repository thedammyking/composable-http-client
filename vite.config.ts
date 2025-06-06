import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { codecovVitePlugin } from '@codecov/vite-plugin';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: 'composables-http-client',
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        axios: resolve(__dirname, 'src/axios.ts'),
        fetch: resolve(__dirname, 'src/fetch.ts'),
        errors: resolve(__dirname, 'src/errors/index.ts'),
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
