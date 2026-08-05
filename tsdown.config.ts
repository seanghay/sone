import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/shiki.ts"],
  // Ship the bundled default fonts next to the built chunks, so the
  // `new URL("./fonts/…", import.meta.url)` references in default-fonts.ts
  // resolve in the published package.
  copy: [{ from: "src/skia/fonts", to: "dist" }],
  sourcemap: false,
  clean: true,
  minify: false,
  dts: true,
  format: ["esm", "cjs"],
  target: false,
});
