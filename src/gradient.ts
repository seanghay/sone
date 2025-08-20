import {
  type AngularNode,
  type ColorStop,
  type DirectionalNode,
  type GradientNode,
} from "gradient-parser";
import { colors } from "./color.ts";

const REGEX_COLOR_RGB = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;

const REGEX_COLOR_RGBA =
  /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(?:\.\d+)?)\)$/;

const REGEX_COLOR_HSL =
  /^hsl\(\s*(\d+)\s*,\s*(\d*(?:\.\d+)?%)\s*,\s*(\d*(?:\.\d+)?%)\)$/;

const REGEX_COLOR_HSLA =
  /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*(\d*(?:\.\d+)?)\)$/;

const REGEX_COLOR_HEX = /^#([a-f0-9]{3,4}|[a-f0-9]{4}(?:[a-f0-9]{2}){1,2})\b$/i;

/**
 * Check if string is a valid CSS color value
 * @param value - string to test
 * @returns true if valid color, false otherwise
 * @example isColor("red") // true
 * @example isColor("#ff0000") // true
 * @example isColor("linear-gradient(...)") // false
 */
export function isColor(value: string): boolean {
  if (value === "transparent") return true;
  if (value in colors) return true;
  return (
    REGEX_COLOR_RGB.test(value) ||
    REGEX_COLOR_RGBA.test(value) ||
    REGEX_COLOR_HSL.test(value) ||
    REGEX_COLOR_HSLA.test(value) ||
    REGEX_COLOR_HEX.test(value)
  );
}

//

function getColor(color: ColorStop) {
  switch (color.type) {
    case "hex":
      return `#${color.value}`;
    case "literal":
      return color.value;
    default:
      return `${color.type}(${color.value.join(",")})`;
  }
}

function getPixelsForColor(
  color: ColorStop,
  colorsLength: number,
  index: number,
  maxWidth?: number,
) {
  const { length } = color;
  if (!length) return (1 / (colorsLength - 1)) * index;
  if (length.type === "px") return Number.parseFloat(length.value);
  if (length.type === "%") {
    if (maxWidth) {
      return (Number.parseFloat(length.value) * maxWidth) / 100;
    }
    return Number(length.value) / 100;
  }
}

interface ColorsAndLocations {
  colors: string[];
  locations: number[];
}

function getColorsAndLocations(
  colorStops: ColorStop[],
  maxWidth?: number,
): ColorsAndLocations {
  return colorStops.reduce(
    (acc, color, index) => {
      acc.colors = [...acc.colors, getColor(color)];
      const locationValue = getPixelsForColor(
        color,
        colorStops.length,
        index,
        maxWidth,
      );
      acc.locations = [...acc.locations, locationValue!];
      return acc;
    },
    { colors: [], locations: [] } as ColorsAndLocations,
  );
}

function getRepeatingColorsAndLocations(
  colorStops: ColorStop[],
  sizes: CssGradientSize,
) {
  const { width: maxWidth } = sizes;
  const { colors: initialColors, locations: initialLocations } =
    getColorsAndLocations(colorStops, maxWidth);

  const t = initialLocations.slice(-1)[0];
  const maxValue = typeof t === "number" ? t : Number.parseFloat(t);
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

function round(number: number) {
  return Math.round(number * 10000) / 10000;
}

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

const getVectorsByOrientation = (
  orientation: DirectionalNode | AngularNode | undefined,
) => {
  if (orientation == null) return getVectorsByAngle(180);
  return orientation.type === "directional"
    ? getVectorsByDirection(orientation.value)
    : getVectorsByAngle(Number(orientation.value));
};

function getVectorsByAngle(alfa: number) {
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

function getVectorsByDirection(direction: string) {
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

export interface CssGradientSize {
  width: number;
  height: number;
}

export type GenerateGradientResult = {
  start?:
    | {
        x: number;
        y: number;
      }
    | undefined;
  end?:
    | {
        x: number;
        y: number;
      }
    | undefined;
  colors: string[];
  locations: number[];
};

export function generateGradient(
  gradients: GradientNode[],
  size: CssGradientSize,
) {
  const values: GenerateGradientResult[] = [];
  for (const { type, colorStops, orientation } of gradients) {
    if (type === "radial-gradient" || type === "repeating-radial-gradient") {
      continue;
    }

    const colorsAndLocations =
      type === "linear-gradient"
        ? getColorsAndLocations(colorStops)
        : getRepeatingColorsAndLocations(colorStops, size);
    const vec = getVectorsByOrientation(orientation!);
    const item = {
      ...colorsAndLocations,
      ...vec,
    };
    values.push(item);
  }

  return values;
}

export function createGradientFillStyleList(
  ctx: CanvasRenderingContext2D,
  gradients: GradientNode[],
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const items = generateGradient(gradients, { width, height });
  const values: CanvasGradient[] = [];

  for (const item of items) {
    const gradient = ctx.createLinearGradient(
      x + item.start!.x * width,
      y + item.start!.y * height,
      x + item.end!.x * width,
      y + item.end!.y * height,
    );

    for (let i = 0; i < item.colors.length; i++) {
      const color = item.colors[i];
      let location = item.locations[i];
      if (location < 0) location = 0;
      if (location > 1) location = 1;
      gradient.addColorStop(location, color);
    }
    values.push(gradient);
  }
  return values;
}
