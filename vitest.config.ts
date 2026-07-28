import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // CanvasKit has no system fonts, so every suite needs fonts registered
    // before it renders or measures anything.
    setupFiles: ["./test/fixtures/setup.ts"],
  },
});
