import { expect, test } from "vitest";
import { qrcode } from "../src/qrcode.ts";

test("qrcode generates basic QR code SVG", () => {
  const result = qrcode("Hello World");
  const svg = result.toString();

  expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
  expect(svg).toContain('viewBox="0 0');
  expect(svg).toContain('<rect fill="white"');
  expect(svg).toContain('<path fill="black"');
  expect(svg).toContain("</svg>");
});

test("qrcode with custom options", () => {
  const result = qrcode("Test", {
    pixelSize: 5,
    whiteColor: "#ffffff",
    blackColor: "#000000",
  });
  const svg = result.toString();

  expect(svg).toContain('<rect fill="#ffffff"');
  expect(svg).toContain('<path fill="#000000"');
  // QR code dimensions vary based on data content
});

test("qrcode returns Buffer", () => {
  const result = qrcode("Buffer test");

  expect(Buffer.isBuffer(result)).toBe(true);
  expect(result.length).toBeGreaterThan(0);
});

test("qrcode handles empty string", () => {
  const result = qrcode("");
  const svg = result.toString();

  expect(svg).toContain("<svg");
  expect(svg).toContain("</svg>");
});

test("qrcode with large pixel size", () => {
  const result = qrcode("Large", { pixelSize: 20 });
  const svg = result.toString();

  // Should contain pixelSize in the SVG
  expect(svg).toContain('width="460" height="460"'); // QR code size is 23x23 for "Large" (460 = 23 * 20)
});

test("qrcode with custom colors", () => {
  const result = qrcode("Colors", {
    whiteColor: "red",
    blackColor: "blue",
  });
  const svg = result.toString();

  expect(svg).toContain('<rect fill="red"');
  expect(svg).toContain('<path fill="blue"');
});

test("qrcode path data format", () => {
  const result = qrcode("Path", { pixelSize: 1 });
  const svg = result.toString();

  // Should contain path commands (M for moveTo, h/v for horizontal/vertical lines, z for close)
  expect(svg).toMatch(/d="[Mhvz0-9,-]*"/);
});

test("qrcode handles different data types", () => {
  // Test with number as string
  const numResult = qrcode("12345");
  expect(numResult.toString()).toContain("<svg");

  // Test with URL
  const urlResult = qrcode("https://example.com");
  expect(urlResult.toString()).toContain("<svg");
});
