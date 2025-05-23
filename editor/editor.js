import watcher from "@parcel/watcher";
import express from "express";
import fg from "fast-glob";
import { pack } from "msgpackr";
import { createServer } from "node:http";
import path from "node:path";
import { WebSocketServer } from "ws";
import { sone } from "../src/sone.js";

const app = express();

app.use(express.static("public"));
const server = createServer(app);

const ws = new WebSocketServer({
  server,
});

const clients = new Set();

ws.on("connection", (client) => {
  console.log("client connected");
  clients.add(client);

  // emit component files
  const files = fg.sync("components/*.sone.js");
  files.sort();

  client.send(
    pack({
      type: "list",
      data: files,
    }),
  );

  for (const file of files) {
    const absfile = path.resolve(file);
    refreshModule(absfile).then((result) => {
      client.send(result);
    });
  }

  client.on("close", () => {
    console.log("client disconnected");
    clients.delete(client);
  });
});

await watcher.subscribe(
  path.join(process.cwd(), "components"),
  (err, events) => {
    if (err) {
      console.error(err);
      return;
    }

    for (const event of events) {
      if (!event.path.endsWith(".sone.js")) continue;
      if (event.type === "delete") continue;
      const ss = Date.now();
      refreshModule(event.path).then((result) => {
        console.log(`[render] time ${Date.now() - ss}ms`);
        for (const client of clients) {
          client.send(result);
        }
      });
    }
  },
);

function refreshModule(p) {
  const modulePath = `${p}?t=${Date.now()}`;
  return new Promise((resolve) => {
    import(modulePath)
      .then((module) => {
        const Component = module.default;
        sone(Component, { debug: false, backgroundColor: "white" })
          .jpg()
          .then((imageBuffer) => {
            resolve(
              pack({
                type: "image",
                image: imageBuffer,
                name: path.relative(process.cwd(), p),
                mimeType: "image/jpeg",
              }),
            );
          });
      })
      .catch((err) => console.error(err));
  });
}

server.listen(8080, () =>
  console.log("editor is live at http://localhost:8080"),
);
