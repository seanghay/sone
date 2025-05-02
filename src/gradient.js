import gradientParser from "gradient-parser";
import rgbRegex from "rgb-regex";
import rgbaRegex from "rgba-regex";
import hslRegex from "hsl-regex";
import hslaRegex from "hsla-regex";
import hexRegex from "hex-color-regex";

export const keywords = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  goldenrod: "#daa520",
  gold: "#ffd700",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavenderblush: "#fff0f5",
  lavender: "#e6e6fa",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32",
};

function getColor(color) {
  switch (color.type) {
    case "hex":
      return `#${color.value}`;
    case "literal":
      return color.value;
    default:
      return `${color.type}(${color.value.join(",")})`;
  }
}

function getPixelsForColor(color, colorsLength, index, maxWidth) {
  const { length } = color;
  if (!length) return (1 / (colorsLength - 1)) * index;
  if (length.type === "px") return Number.parseFloat(length.value);
  if (length.type === "%") {
    if (maxWidth) {
      return (Number.parseFloat(length.value) * maxWidth) / 100;
    }
    return length.value / 100;
  }
}

function getColorsAndLocations(colorStops, maxWidth) {
  return colorStops.reduce(
    (acc, color, index) => {
      acc.colors = [...acc.colors, getColor(color)];
      const locationValue = getPixelsForColor(
        color,
        colorStops.length,
        index,
        maxWidth,
      );

      acc.locations = [...acc.locations, locationValue];
      return acc;
    },
    { colors: [], locations: [] },
  );
}

function getRepeatingColorsAndLocations(colorStops, sizes) {
  const { width: maxWidth } = sizes;
  const { colors: initialColors, locations: initialLocations } =
    getColorsAndLocations(colorStops, maxWidth);

  const maxValue = Number.parseFloat(initialLocations.slice(-1)[0]);
  const increment = maxValue / maxWidth;
  const maxChunks = Math.round(maxWidth / maxValue);

  const locations = [];
  for (let i = 0; i < maxChunks; i++) {
    for (const j of initialLocations) {
      locations.push(j / maxWidth + increment * i);
    }
  }

  const colors = locations.map(
    (_, i) => initialColors[i % initialColors.length],
  );

  return { colors, locations };
}

function round(number) {
  return Math.round(number * 10000) / 10000;
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

const getVectorsByOrientation = (orientation) => {
  return orientation.type === "directional"
    ? getVectorsByDirection(orientation.value)
    : getVectorsByAngle(orientation.value);
};

function getVectorsByAngle(alfa) {
  const angle = degreesToRadians(alfa);
  const gradientLineLength = round(
    Math.abs(Math.sin(angle)) + Math.abs(Math.cos(angle)),
  );

  const center = { x: 0.5, y: 0.5 };
  const yDiff = (Math.sin(angle - Math.PI / 2) * gradientLineLength) / 2;
  const xDiff = (Math.cos(angle - Math.PI / 2) * gradientLineLength) / 2;

  return {
    start: {
      x: center.x - xDiff,
      y: center.y - yDiff,
    },
    end: {
      x: center.x + xDiff,
      y: center.y + yDiff,
    },
  };
}

function getVectorsByDirection(direction) {
  switch (direction) {
    case "top":
      return getVectorsByAngle(0);
    case "right":
      return getVectorsByAngle(90);
    case "bottom":
      return getVectorsByAngle(180);
    case "left":
      return getVectorsByAngle(270);
    case "left top":
      return getVectorsByAngle(270 + 45);
    case "left bottom":
      return getVectorsByAngle(180 + 45);
    case "right top":
      return getVectorsByAngle(45);
    case "right bottom":
      return getVectorsByAngle(90 + 45);
  }
}

/**
 * @param {string} value
 * @param {{width: number, height: number}} size
 */
export function generateGradient(value, size) {
  const values = [];
  for (const { type, colorStops, orientation } of gradientParser.parse(value)) {
    if (type === "radial-gradient" || type === "repeating-radial-gradient") {
      continue;
    }
    const colorsAndLocations =
      type === "linear-gradient"
        ? getColorsAndLocations(colorStops)
        : getRepeatingColorsAndLocations(colorStops, size);
    const vec = getVectorsByOrientation(orientation);
    values.push({
      ...colorsAndLocations,
      ...vec,
    });
  }

  return values;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} value
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
export function createGradientFillStyleList(ctx, value, x, y, width, height) {
  const items = generateGradient(value, { width, height });

  const values = [];
  for (const item of items) {
    const gradient = ctx.createLinearGradient(
      x + item.start.x * width,
      y + item.start.y * height,
      x + item.end.x * width,
      y + item.end.y * height,
    );
    for (let i = 0; i < item.colors.length; i++) {
      const color = item.colors[i];
      const location = item.locations[i];
      gradient.addColorStop(location, color);
    }
    values.push(gradient);
  }
  return values;
}

const isRgb = (str) => rgbRegex({ exact: true }).test(str);
const isRgba = (str) => rgbaRegex({ exact: true }).test(str);
const isHsl = (str) => hslRegex({ exact: true }).test(str);
const isHsla = (str) => hslaRegex({ exact: true }).test(str);
const isHex = (str) => hexRegex({ strict: true }).test(str);
const isKeyword = (str) => str in keywords;
const isInherit = (str) => str === "inherit";
const isCurrentColor = (str) =>
  str === "currentColor" || str === "currentcolor";
const isTransparent = (str) => str === "transparent";

export function isColor(str) {
  return (
    isRgb(str) ||
    isRgba(str) ||
    isHsl(str) ||
    isHsla(str) ||
    isHex(str) ||
    isKeyword(str) ||
    isInherit(str) ||
    isCurrentColor(str) ||
    isTransparent(str)
  );
}
