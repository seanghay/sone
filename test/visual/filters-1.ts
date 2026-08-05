import { fileURLToPath } from "node:url";
import { Column, Grid, Photo, Text } from "../../src/index.ts";
import { writeCanvasToFile } from "./utils.ts";

const relative = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const photo = relative("../image/kouprey.jpg");

const SIZE = 200;

// Each tile shows the same photo with one CSS filter applied, so the effect of
// every supported filter function is visible side by side.
const tile = (label: string, apply: (p: ReturnType<typeof Photo>) => unknown) =>
  Column(
    apply(Photo(photo).size(SIZE, SIZE).scaleType("cover")) as never,
    Text(label)
      .size(11)
      .weight("bold")
      .font("GeistMono")
      .color("#e2e8f0")
      .marginTop(8),
  )
    .padding(12)
    .rounded(14)
    .bg("#111827")
    .alignItems("center");

const root = Column(
  Text("CSS Filters").size(30).weight("bold").color("#f8fafc"),
  Text("Every supported filter function, applied to one photo.")
    .size(13)
    .color("#94a3b8")
    .marginTop(4),
  Grid(
    tile("none", (p) => p),
    tile("blur(4)", (p) => p.blur(4)),
    tile("grayscale(1)", (p) => p.grayscale(1)),
    tile("sepia(1)", (p) => p.sepia(1)),
    tile("invert(1)", (p) => p.invert(1)),
    tile("brightness(1.6)", (p) => p.brightness(1.6)),
    tile("contrast(1.8)", (p) => p.contrast(1.8)),
    tile("saturate(2.5)", (p) => p.saturate(2.5)),
    tile("hueRotate(120)", (p) => p.hueRotate(120)),
    tile("grayscale + contrast", (p) => p.grayscale(1).contrast(1.4)),
  )
    .columns("1fr", "1fr", "1fr", "1fr", "1fr")
    .columnGap(16)
    .rowGap(16)
    .marginTop(24),
)
  .bg("linear-gradient(180deg, #020617 0%, #0f172a 100%)")
  .padding(36)
  .gap(0);

await writeCanvasToFile(root, import.meta.url);
