import express from "express";
import { renderAsImageBuffer } from "sonejs";
import { ReportDocument } from "./components.js";

const app = express();
app.use(express.json());

app.post("/api/render", async (req, res, next) => {
  try {
    const component = ReportDocument(req.body);
    const buffer = renderAsImageBuffer(component);
    res.type("jpeg");
    res.send(buffer);
  } catch (e) {
    next(e);
  }
});

app.listen(8080, () =>
  console.log("server is listening at http://localhost:8080"),
);
