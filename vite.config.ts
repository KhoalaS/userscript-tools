/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "./src/index.ts",
            formats: ["es"],
        },
    },
    test: {
        mockReset: true,
        environment: "happy-dom",
        setupFiles: ["vitest.setup.ts"],
    },
});
