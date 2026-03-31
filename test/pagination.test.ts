import { expect, test } from "vitest";
import {
  Column,
  PageBreak,
  Row,
  renderer,
  renderPages,
  Text,
} from "../src/node.ts";

const block = (label: string, height = 70) =>
  Column(Text(label).size(14).color("white"))
    .width(120)
    .height(height)
    .padding(12)
    .bg("#334155");

test("renderPages creates multiple pages from automatic overflow", async () => {
  const pages = await renderPages(
    Column(block("A", 90), block("B", 90), block("C", 90)).gap(10),
    renderer,
    { width: 320, pageHeight: 100, margin: { left: 20, right: 30 } },
  );

  expect(pages).toHaveLength(3);
  expect(pages[0].width).toBe(320);
  expect(pages[1].width).toBe(320);
  expect(pages[2].width).toBe(320);
});

test("renderPages respects explicit page breaks and trims the last page", async () => {
  const pages = await renderPages(
    Column(block("First", 60), PageBreak(), block("Second", 40)),
    renderer,
    { pageHeight: 140, lastPageHeight: "content" },
  );

  expect(pages).toHaveLength(2);
  expect(pages[0].height).toBe(140);
  expect(pages[1].height).toBe(40);
});

test("dynamic headers and footers receive final page numbers", async () => {
  const headerCalls: Array<{ pageNumber: number; totalPages: number }> = [];
  const footerCalls: Array<{ pageNumber: number; totalPages: number }> = [];

  const pages = await renderPages(
    Column(block("A", 90), block("B", 90), block("C", 90)).gap(10),
    renderer,
    {
      width: 260,
      pageHeight: 140,
      header: (info) => {
        headerCalls.push(info);
        return Row(Text(`H ${info.pageNumber}/${info.totalPages}`)).height(18);
      },
      footer: (info) => {
        footerCalls.push(info);
        return Row(Text(`F ${info.pageNumber}/${info.totalPages}`)).height(14);
      },
    },
  );

  expect(pages).toHaveLength(3);
  expect(headerCalls[0]).toEqual({ pageNumber: 1, totalPages: 1 });
  expect(footerCalls[0]).toEqual({ pageNumber: 1, totalPages: 1 });
  expect(headerCalls.slice(-3)).toEqual([
    { pageNumber: 1, totalPages: 3 },
    { pageNumber: 2, totalPages: 3 },
    { pageNumber: 3, totalPages: 3 },
  ]);
  expect(footerCalls.slice(-3)).toEqual([
    { pageNumber: 1, totalPages: 3 },
    { pageNumber: 2, totalPages: 3 },
    { pageNumber: 3, totalPages: 3 },
  ]);
});

test("auto-sized canvas width includes margins when width is omitted", async () => {
  const pages = await renderPages(Column(block("Only", 60)), renderer, {
    pageHeight: 120,
    margin: 12,
  });

  expect(pages).toHaveLength(1);
  expect(pages[0].width).toBe(144);
});
