import { expect, test } from "vitest";
import { Column, Font, sone, Text } from "../../src/index.ts";

// Unlike the rest of the suite, this file exercises the "no fonts registered"
// path: it resets the registry and asserts the bundled defaults load. vitest
// isolates test files, so the reset does not affect other files.
test("falls back to the bundled default fonts when none are registered", async () => {
  Font.reset();
  expect(Font.has("Google Sans")).toBe(false);

  const png = await sone(
    Column(
      Text("default sans — bold").size(20).weight("bold"),
      Text("monospace: const x = 1").font("monospace").size(16),
    )
      .padding(20)
      .bg("white"),
  ).png();

  expect(png.length).toBeGreaterThan(0);
  // Sans backs the generic families; monospace is aliased to the bundled mono.
  expect(Font.has("Google Sans")).toBe(true);
  expect(Font.has("Geist Mono")).toBe(true);
});
