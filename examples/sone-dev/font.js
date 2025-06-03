import fg from "fast-glob";
import { FontLibrary } from "skia-canvas";

FontLibrary.use(await fg("./fonts/**/*.ttf"));
