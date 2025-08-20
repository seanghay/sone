import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/node.ts", "src/browser.ts"],
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: true,
  dts: true,
  format: ["esm", "cjs"],
});
