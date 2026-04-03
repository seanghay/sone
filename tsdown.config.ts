import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/node.ts", "src/browser.ts", "src/shiki.ts"],
  sourcemap: false,
  clean: true,
  minify: false,
  dts: true,
  format: ["esm", "cjs"],
  target: false,
});
