import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const FONT = "GoogleSans";
export const FONT_PATH = path.resolve(__dirname, "../../test/font/GoogleSans-VariableFont_GRAD,opsz,wght.ttf");
export const LOGO_PATH = path.resolve(__dirname, "../../test/image/sone.svg");

export const PAGE_WIDTH = 794; // A4 at 96dpi
export const PADDING = 32;
export const TABLE_WIDTH = PAGE_WIDTH - PADDING * 2; // 730
export const TBW = 1; // table borderWidth; cells must sum to TABLE_WIDTH - TBW*2 = 728

// Explicit column widths — each set sums to 728
export const COL_INVOICE = { desc: 428, qty: 100, unit: 100, amount: 100 };
export const COL_REPORT  = { month: 278, revenue: 150, expenses: 160, profit: 140 };
export const COL_BANK    = { date: 108, desc: 300, credit: 110, debit: 110, balance: 100 };

export const C = {
  white:     "#ffffff",
  black:     "#111111",
  gray:      "#6b7280",
  lightGray: "#f3f4f6",
  border:    "#e5e7eb",
  accent:    "#1a1a2e",
  green:     "#16a34a",
  red:       "#dc2626",
};
