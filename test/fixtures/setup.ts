import { beforeAll } from "vitest";
import { registerTestFonts } from "./fonts.ts";

beforeAll(async () => {
  await registerTestFonts();
});
