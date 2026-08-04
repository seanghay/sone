import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/shiki.ts"],
  sourcemap: false,
  clean: true,
  minify: false,
  dts: true,
  format: ["esm", "cjs"],
  target: false,
});
