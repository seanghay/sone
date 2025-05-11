import { sone } from "sonejs";
import Root from "./components/khm-moh-stats.sone.js";
import fs from "node:fs/promises";
import ProgressBar from "progress";
import path from "node:path";

await fs.mkdir("frames", { recursive: true });

const durationInSeconds = 10;
const frameRatePerSecond = 30;

const frameCount = durationInSeconds * frameRatePerSecond;

const progressBar = new ProgressBar(
  "[render :percent]:bar :current/:total",
  frameCount,
);

for (let i = 0; i < frameCount; i++) {
  const file = path.join("frames", `${String(i).padStart(4, "0")}.jpg`);
  const progress = i / frameCount;
  const buffer = await sone(() => Root(progress)).jpg();
  await fs.writeFile(file, buffer);
  progressBar.tick();
}
