import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";
import {
  Column,
  Photo,
  Row,
  render,
  renderer,
  Span,
  Text,
} from "../src/node.ts";

const sampleImageFile = fileURLToPath(
  new URL("./image/kouprey.jpg", import.meta.url),
);

test("render complex layout with mixed components", async () => {
  const component = Column(
    // Header row with text
    Row(
      Text("Header Title").size(24).weight("bold").color("blue"),
      Text("Subtitle").size(16).color("gray"),
    )
      .padding(20)
      .justifyContent("space-between"),

    // Content with image and text
    Row(
      Photo(sampleImageFile).width(200).height(150).rounded(8),
      Column(
        Text(
          "Lorem ipsum ",
          Span("dolor sit amet").weight("bold"),
          " consectetur adipiscing elit.",
        )
          .size(14)
          .lineHeight(1.5),
        Text("Secondary text").size(12).color("gray"),
      )
        .padding(20)
        .flex(1),
    ).gap(20),

    // Footer
    Text("Footer content")
      .size(12)
      .color("darkgray")
      .padding(10),
  )
    .width(600)
    .height(400);

  const canvas = await render(component, renderer);

  expect(canvas).toBeDefined();
  expect(canvas.width).toBe(600);
  expect(canvas.height).toBe(400);
});

test("render text with various decorations", async () => {
  const component = Column(
    Text(
      Span("Bold text ").weight("bold"),
      Span("italic text ").style("italic"),
      Span("underlined text").underline().underlineColor("red"),
    )
      .size(16)
      .lineHeight(2),

    Text("Text with shadow").size(20).dropShadow("2px 2px 4px rgba(0,0,0,0.5)"),

    Text(Span("Stroke text").strokeColor("blue").strokeWidth(1)).size(18),
  )
    .width(500)
    .height(200)
    .padding(20);

  const canvas = await render(component, renderer);

  expect(canvas).toBeDefined();
  expect(canvas.width).toBe(500);
  expect(canvas.height).toBe(200);
});

test("render with backgrounds and borders", async () => {
  const component = Column(
    Row(
      Column().width(100).height(100).bg("red").rounded(10),
      Column().width(100).height(100).bg("blue").rounded(10),
      Column().width(100).height(100).bg("green").rounded(10),
    ).gap(10),

    Text("Bordered content")
      .padding(20)
      .borderWidth(2)
      .borderColor("black")
      .bg("lightgray")
      .rounded(5),
  )
    .width(400)
    .height(300)
    .padding(20)
    .bg("white");

  const canvas = await render(component, renderer);

  expect(canvas).toBeDefined();
  expect(canvas.width).toBe(400);
  expect(canvas.height).toBe(300);
});

test("render with transforms and filters", async () => {
  const component = Column(
    Text("Rotated text").size(24).rotate(15),
    Text("Scaled text").size(16).scale(1.5),
    Column().width(100).height(100).bg("purple").blur(2).brightness(0.8),
  )
    .width(300)
    .height(300)
    .padding(20);

  const canvas = await render(component, renderer);

  expect(canvas).toBeDefined();
  expect(canvas.width).toBe(300);
  expect(canvas.height).toBe(300);
});

test("render responsive text wrapping", async () => {
  const longText =
    "This is a very long text that should wrap across multiple lines when constrained by width. ".repeat(
      5,
    );

  const component = Column(
    Text(longText).size(14).lineHeight(1.4),
    Text(longText).size(14).nowrap().opacity(0.7),
  )
    .width(300)
    .height(400)
    .padding(20);

  const canvas = await render(component, renderer);

  expect(canvas).toBeDefined();
  expect(canvas.width).toBe(300);
  expect(canvas.height).toBe(400);
});
