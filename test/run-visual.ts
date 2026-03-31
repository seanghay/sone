import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const dirname = url.fileURLToPath(new URL("./visual", import.meta.url));

const entries = await fs.readdir("test/visual");
const scripts = entries.filter((e) => e.endsWith(".ts"));

const promises: Promise<unknown>[] = [];

for (const file of scripts) {
  const name = path.parse(file).name;
  const p = import(url.pathToFileURL(path.join(dirname, name)).href);
  promises.push(p);
}

await Promise.all(promises);
