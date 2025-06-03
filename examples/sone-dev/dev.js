#!/usr/bin/env node
import { hot } from "hot-hook";

await hot.init({
  root: import.meta.filename,
  boundaries: ["./src/**/*.js"],
});

import { pack } from "msgpackr";
import { sone, loadImage } from "sone";
import { WebSocketServer } from "ws";
import { watch } from "chokidar";
import memoize from "fast-memoize";
import { resolve } from "node:path";

const clients = new Set();

let componentFile = process.argv[2];

if (!componentFile) {
  throw Error("[error] component file required");
}

componentFile = resolve(componentFile);

const loadAsset = memoize(loadImage);

let counter = 0;

async function refresh(client) {
  try {
    const module = await import(
      `${componentFile}?v=${counter++}`,
      import.meta.hot?.boundary
    );

    const Component = module.default;

    if (!Component) {
      return;
    }

    const loader = module.loader;
    const cfg = module.config;

    let loaderData = null;

    const ss = Date.now();
    if (loader) {
      loaderData = await loader({ loadAsset, isDev: true });
    }

    const canvas = sone(() => Component(loaderData), cfg).canvas();
    const imageBuffer = await canvas.toBuffer("raw");

    const buffer = pack({
      image: imageBuffer,
      width: canvas.width,
      height: canvas.height,
    });

    console.log(`render: ${Date.now() - ss}ms`);

    if (client) {
      client.send(buffer);
      return;
    }

    for (const ws of clients) {
      ws.send(buffer);
    }
  } catch (e) {
    console.error(e);
  }
}

watch("src").on("all", async (event, path) => {
  if (event === "change") {
    await refresh();
  }
});

const wss = new WebSocketServer({ port: 5003 });

wss.on("connection", async function connection(ws) {
  await refresh(ws);
  clients.add(ws);
  ws.on("error", console.error);
  ws.on("close", () => {
    clients.delete(ws);
  });
});
