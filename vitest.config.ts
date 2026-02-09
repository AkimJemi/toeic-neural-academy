/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/setupTests.ts',
    },
    resolve: {
        alias: {
            '\\.(css|less|sass|scss)$': './src/__mocks__/styleMock.ts',
        },
    },
    server: {
        proxy: {
            '/api': 'http://localhost:3015'
        }
    }
});
