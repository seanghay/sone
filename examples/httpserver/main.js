import express from "express";
import { sone } from "sonejs";
import { ReportDocument } from "./components.js";
import gracefulShutdown from "http-graceful-shutdown";

const app = express();
app.use(express.json());

app.post("/api/render", async (req, res, next) => {
  try {
    const buffer = await sone(() => ReportDocument(req.body)).jpg();
    res.type("jpeg");
    res.send(buffer);
  } catch (e) {
    next(e);
  }
});

const server = app.listen(8080, () =>
  console.log("server is listening at http://localhost:8080"),
);

gracefulShutdown(server);
