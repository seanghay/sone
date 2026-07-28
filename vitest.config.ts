import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // CanvasKit has no system fonts, so every suite needs fonts registered
    // before it renders or measures anything.
    setupFiles: ["./test/fixtures/setup.ts"],
    // Software-rasterized WASM rendering is several times slower on a GPU-less
    // CI runner than on a dev machine; the 5s default is too tight for the
    // render-heavy Skia suites. The heaviest heap tests set their own higher
    // limit on top of this.
    testTimeout: 30_000,
  },
});
