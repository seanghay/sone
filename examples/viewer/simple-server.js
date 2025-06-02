import { hot } from "hot-hook";
await hot.init({
  root: import.meta.filename,
  boundaries: ["src/main.sone.js"],
});
import { pack } from "msgpackr";
import { sone } from "sone";
import { WebSocketServer } from "ws";
import { watch } from "chokidar";

const clients = new Set();

let loaderData = null;

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

    if (loader && loaderData == null) {
      loaderData = await loader();
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

watch("src/main.sone.js").on("change", async () => {
  await refresh();
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
