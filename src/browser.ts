/**
 * Browser platform implementation using HTML5 Canvas API
 * Note: Platform-specific renderer must be created separately
 * @example
 * import { render, Column, Text } from "sone/browser";
 * const canvas = await render(Column(Text("Hello")), browserRenderer);
 */
export * from "./core.ts";
export * from "./qrcode.ts";
export * from "./renderer.ts";
