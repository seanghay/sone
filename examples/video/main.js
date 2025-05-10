import fs from "node:fs/promises";
import { createRoot, SoneConfig } from "sonejs";
import { ReportDocument, defaultData } from "./components.js";

await fs.mkdir("frames", { recursive: true });

const totalFrameCount = 60 * 8;

let canvas = null;

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

function interpolateTriangle(t) {
  // Ensure t is between 0 and 1
  t = t % 1;

  // For the first half (0 to 0.5), we go from 0 to 1
  if (t < 0.5) {
    return t * 2;
  } else {
    return 2 - t * 2;
  }
}

function ease(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

let w = 0;
let h = 0;

for (let i = 0; i < totalFrameCount; i++) {
  const p = interpolateTriangle(i / totalFrameCount);

  const root = createRoot(
    ReportDocument({
      ...defaultData,
      progress: p * 100,
      project: {
        ...defaultData.project,
        name: `Sone Video.js (${i})`,
      },
      tracks: defaultData.tracks.map((track) => ({
        ...track,
        start: track.start * ease(Math.min(p * 2, 1)),
        end: track.end * ease(Math.min(p * 2, 1)),
      })),
    }),
  );

  if (canvas == null) {
    w = root.node.getComputedWidth();
    h = root.node.getComputedHeight() ;
  }
  canvas = SoneConfig.createCanvas(w, h);

  const ctx = canvas.getContext("2d");
  root.render(ctx);
  root.free();

  const filename = `${i}`.padStart(4, "0") + ".jpg";
  await fs.writeFile(
    `frames/${filename}`,
    await canvas.toBuffer("jpeg", { quality: 1.0 }),
  );

  console.log(i / totalFrameCount);
}
