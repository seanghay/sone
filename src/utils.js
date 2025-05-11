import { Align, FlexDirection, Justify, PositionType } from "yoga-layout";
import { lineBreakTokenizer } from "./segmenter.js";
import { Path2D, Canvas, loadImage, FontLibrary, Image } from "skia-canvas";

export const SoneConfig = {
  createCanvas: (width, height) => new Canvas(width, height),
  loadImage,
  lineBreakTokenizer,
  registerFont: (fontPath, { family }) => FontLibrary.use(family, [fontPath]),
  resetFonts: () => FontLibrary.reset(),
  Image,
  Path2D,
  dpr: 1,
};

if (SoneConfig.Image == null) {
  if (typeof window !== "undefined") {
    SoneConfig.Image = window.Image;
  }
}

export const DrawSymbol = Symbol();

function createIdGenerator() {
  let id = -1;
  return () => {
    id++;
    return id;
  };
}

export const createId = createIdGenerator();

export function isImage(image) {
  return image instanceof SoneConfig.Image;
}

/**
 * @param {"auto" | "flex-start" | "center" | "flex-end" | "stretch" | "baseline" | "space-between" | "space-around" | "space-evenly"} value
 */
export function parseAlign(value) {
  if (value === "auto") return Align.Auto;
  if (value === "flex-start") return Align.FlexStart;
  if (value === "center") return Align.Center;
  if (value === "flex-end") return Align.FlexEnd;
  if (value === "stretch") return Align.Stretch;
  if (value === "baseline") return Align.Baseline;
  if (value === "space-between") return Align.SpaceBetween;
  if (value === "space-around") return Align.SpaceAround;
  if (value === "space-evenly") return Align.SpaceEvenly;
  return value;
}

/**
 * @param {"flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly"} value
 */
export function parseJustify(value) {
  if (value === "flex-start") return Justify.FlexStart;
  if (value === "center") return Justify.Center;
  if (value === "flex-end") return Justify.FlexEnd;
  if (value === "space-between") return Justify.SpaceBetween;
  if (value === "space-around") return Justify.SpaceAround;
  if (value === "space-evenly") return Justify.SpaceEvenly;
  return value;
}

/**
 * @param {"static" | "relative" | "absolute"} value
 */
export function parsePositionType(value) {
  if (value === "static") return PositionType.Static;
  if (value === "relative") return PositionType.Relative;
  if (value === "absolute") return PositionType.Absolute;
  return value;
}

/**
 * @param {"column" | "column-reverse" | "row" | "row-reverse"} value
 */
export function parseFlexDirection(value) {
  if (value === "column") return FlexDirection.Column;
  if (value === "column-reverse") return FlexDirection.ColumnReverse;
  if (value === "row") return FlexDirection.Row;
  if (value === "row-reverse") return FlexDirection.RowReverse;
  return value;
}
