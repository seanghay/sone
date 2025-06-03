import "dotenv/config.js";
import express from "express";
import morgan from "morgan";
import fg from "fast-glob";
import path from "node:path";
import gracefulShutdown from "http-graceful-shutdown";
import { loadImage, sone } from "sone";
import "./font.js";
import { FontLibrary } from "skia-canvas";

const port = process.env.PORT || 8000;
const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.use(morgan(isProduction ? "combined" : "dev"));
app.use(express.json());

// route registration
for await (const file of fg.stream("./src/**/render.js")) {
  const module = await import(file);
  const templateId = path.basename(path.dirname(file));

  app.get(`/render/${templateId}/:type`, async (req, res) => {
    const type = req.params.type.toLowerCase();

    if (!["pdf", "jpg", "jpeg", "png"].includes(type)) {
      res.status(404).end();
      return;
    }

    let loaderData = {};

    if (module.loader) {
      loaderData = await module.loader({ loadAsset: loadImage, req });
    }

    const cfg = module.config;

    // always disable debug mode in serve
    if (cfg) {
      cfg.debug = false;
    }

    if (module.default) {
      const Comp = () => module.default(loaderData);
      switch (type) {
        case "pdf":
          res.type(type).send(await sone(Comp, cfg).pdf());
          return;
        case "jpg":
        case "jpeg":
          res.type(type).send(await sone(Comp, cfg).jpg());
          return;
        case "png":
          res.type(type).send(await sone(Comp, cfg).jpg());
      }
      return;
    }
    res.status({});
  });
}

app.get("/fonts", (req, res) => res.json(FontLibrary.families));

const server = app.listen(port, () =>
  console.info(`server is listening at http://localhost:${port}`),
);

gracefulShutdown(server);
