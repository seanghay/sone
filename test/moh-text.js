import { renderAsImageBuffer } from "../src/core.js";
//import Root from './khm-moh-stats.sone.js';
import fs from "node:fs/promises";
import { Column } from "../src/flex.js";
import { Text } from "../src/text.js";

function Root() {
  return Column(
    Text("Hello\nworld world\nworld").size(22).align("center").color("red"),
    Text("Hello\nworld world world").size(22).align("left").color("green"),
    Text("Hello\nworld world world").size(22).align("right").color("blue"),
  //
    Text("Hello world world\nworld").size(44).align("center").color("red"),
    Text("Hello world world\nworld").size(44).align("left").color("green"),
    Text("Hello world world\nworld").size(44).align("right").color("blue"),
    
  ).padding(20).gap(18);
}

await fs.writeFile("test/moh-text.jpg", await renderAsImageBuffer(Root()));
