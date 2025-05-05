import fs from "node:fs/promises";
import { createRoot } from "sonejs";
import { ReportDocument, defaultData } from "./components.js";
import { createCanvas } from "canvas";

await fs.mkdir("frames", { recursive: true });

const totalFrameCount = 60 * 8;

let canvas = null;

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
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

for (let i = 0; i < totalFrameCount; i++) {
  const p = interpolateTriangle(i / totalFrameCount);

  const root = createRoot(
    ReportDocument({
      ...defaultData,
      progress: easeInOut(p) * 100,
      project: {
        ...defaultData.project,
        name: `Sone Video.js (${i})`,
      },
      tracks: defaultData.tracks.map((track) => ({
        ...track,
        start: track.start * Math.min(p * 2, 1),
        end: track.end * Math.min(p * 2, 1),
      })),
    }),
  );

  if (canvas == null) {
    const width = root.node.getComputedWidth();
    const height = root.node.getComputedHeight() + 1;
    canvas = createCanvas(width, height);
  }

  const ctx = canvas.getContext("2d");
  root.render(ctx);
  root.free();

  const filename = `${i}`.padStart(4, "0") + ".jpg";
  await fs.writeFile(
    `frames/${filename}`,
    canvas.toBuffer("image/jpeg", { quality: 1.0 }),
  );
}
