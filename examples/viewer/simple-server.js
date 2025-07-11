import { hot } from "hot-hook";
await hot.init({
  root: import.meta.filename,
  boundaries: ["src/main.sone.js"],
});

import { pack } from "msgpackr";
import { sone, loadImage } from "sone";
import { WebSocketServer } from "ws";
import { watch } from "chokidar";
import memoize from "fast-memoize";

const clients = new Set();

const _loadImage = memoize(loadImage);

async function refresh(client) {
  try {
    const module = await import(
      "./src/main.sone.js",
      import.meta.hot?.boundary
    );

    const Component = module.default;

    if (!Component) {
      return;
    }

    const loader = module.loader;
    const cfg = module.config;

    let loaderData = null;

    if (loader) {
      loaderData = await loader({ loadImage: _loadImage });
    }

    const canvas = sone(() => Component(loaderData), cfg).canvas();

    const imageBuffer = await canvas.toBuffer("raw");
    const buffer = pack({
      image: imageBuffer,
      width: canvas.width,
      height: canvas.height,
    });

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
  console.log("client connected");

  ws.on("error", console.error);
  ws.on("close", () => {
    console.log("client disconnected");
    clients.delete(ws);
  });
});
