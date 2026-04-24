import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['src/index.ts'],
    format: 'esm',
    dts: true,
    clean: true,
    outDir: 'dist',
    target: 'node20',
    sourcemap: true,
    fixedExtension: false,
});
