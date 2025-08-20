const VALUES_REG = /,(?![^(]*\))/;
const PARTS_REG = /\s(?![^(]*\))/;
const LENGTH_REG = /^[0-9]+[a-zA-Z%]+?$/;

export interface CssShadowProperties {
  inset: boolean;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadRadius?: number;
  color?: string;
}

function parseValue(str: string): CssShadowProperties {
  const parts = str.split(PARTS_REG);
  const inset = parts.includes("inset");
  const last = parts.slice(-1)[0];
  const color = !isLength(last) ? last : undefined;

  const nums = parts
    .filter((n) => n !== "inset")
    .filter((n) => n !== color)
    .map(toNum);

  const [offsetX, offsetY, blurRadius, spreadRadius] = nums;

  return {
    inset,
    offsetX: Number(offsetX),
    offsetY: Number(offsetY),
    blurRadius: Number(blurRadius),
    spreadRadius: spreadRadius == null ? undefined : Number(spreadRadius),
    color,
  };
}

export type CssShadow = ReturnType<typeof parseValue>;

function isLength(v: string) {
  return v === "0" || LENGTH_REG.test(v);
}

function toNum(v: string): number | string {
  if (!/px$/.test(v) && v !== "0") return v;
  const n = Number.parseFloat(v);
  return !Number.isNaN(n) ? n : v;
}

export const parseShadow = (str: string) =>
  str
    .split(VALUES_REG)
    .map((s) => s.trim())
    .map(parseValue);
