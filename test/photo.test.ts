import { expect, test } from "vitest";
import { Photo } from "../src/core.ts";

test("simple photo", () => {
  const node = Photo("https://example.com").scaleType("cover").size(123, 321);
  expect(node.type).toBe("photo");
  expect(node.props.src).toBe("https://example.com");
  expect(node.props.image).toBeUndefined();
  expect(node.props.scaleType).toEqual("cover");
  expect(node.props.width).toEqual(123);
  expect(node.props.height).toEqual(321);
});

test("simple photo from buffer", () => {
  const node = Photo(Buffer.from("xxx"));
  expect(node.type).toBe("photo");
  expect(node.props.src).toEqual(Buffer.from("xxx"));
  expect(node.props.image).toBeUndefined();
});
