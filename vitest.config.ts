import path from 'node:path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    test: {
        environment: 'node',
        include: ['test/**/*.test.ts'],
        setupFiles: ['test/lib/setup.ts'],
        clearMocks: true,
        restoreMocks: true
    }
});
