import { Column, Row, Text, Table, TableRow, TableCell } from "sone";

export default function Root() {
  const items = [
    { desc: "ប្រព័ន្ធរចនា UI (UI Design System)", qty: 1, rate: 4800, total: 4800 },
    { desc: "ការអភិវឌ្ឍន៍ Frontend", qty: 3, rate: 2400, total: 7200 },
    { desc: "ចលនា និង អានីមេហ្សិន (Motion & Animations)", qty: 1, rate: 1600, total: 1600 },
    { desc: "ការត្រួតពិនិត្យគុណភាព (QA)", qty: 2, rate: 800, total: 1600 },
  ];

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const fmt = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  const col = {
    desc: { grow: true },
    qty:  { width: 45 }, // Slightly wider for Khmer text
    rate: { width: 90 },
    amt:  { width: 90 },
  };

  const headCell = (t: string, opts: { grow?: boolean; width?: number }, align: "left" | "right" = "left") => {
    const base = TableCell(Text(t).size(9).weight("700").color("#6b7280").letterSpacing(0.5).align(align))
      .paddingTop(8).paddingBottom(8).paddingLeft(10).paddingRight(10);
    return opts.grow ? base.grow(1) : base.width(opts.width!);
  };

  const dataCell = (t: string, opts: { grow?: boolean; width?: number }, align: "left" | "right" = "left") => {
    const base = TableCell(Text(t).size(10).color("#111827").align(align)) // Adjusted size for Khmer readability
      .paddingTop(11).paddingBottom(11).paddingLeft(10).paddingRight(10);
    return opts.grow ? base.grow(1) : base.width(opts.width!);
  };

  return Column(
    // Header
    Row(
      Column(
        Text("វិក្កយបត្រ").size(24).weight("700").color("#111827").letterSpacing(-0.5),
        Text("#INV-2024-0042").size(11).color("#9ca3af").marginTop(2),
      ).grow(1),
      Column(
        Text("Acme Studio").size(13).weight("600").color("#111827").align("right"),
        Text("hello@acmestudio.io").size(11).color("#6b7280").align("right"),
        Text("San Francisco, CA").size(11).color("#6b7280").align("right"),
      ).alignItems("flex-end"),
    ).alignItems("flex-start").marginBottom(32),

    // Bill to / dates
    Row(
      Column(
        Text("ព័ត៌មានអតិថិជន").size(9).weight("700").color("#9ca3af").letterSpacing(1),
        Text("Sarah Johnson").size(12).weight("600").color("#111827").marginTop(6),
        Text("Bright Future Inc.").size(11).color("#6b7280"),
        Text("New York, NY 10001").size(11).color("#6b7280"),
      ).grow(1),
      Column(
        Row(
          Text("កាលបរិច្ឆេទចេញ").size(9).weight("700").color("#9ca3af").letterSpacing(0.5).width(85),
          Text("1 ធ្នូ 2024").size(11).color("#111827"),
        ).gap(12).alignItems("center"),
        Row(
          Text("ថ្ងៃត្រូវបង់ប្រាក់").size(9).weight("700").color("#9ca3af").letterSpacing(0.5).width(85),
          Text("31 ធ្នូ 2024").size(11).color("#e53e3e"),
        ).gap(12).alignItems("center").marginTop(6),
        Row(
          Text("ស្ថានភាព").size(9).weight("700").color("#9ca3af").letterSpacing(0.5).width(85),
          Text("មិនទាន់បង់").size(8).weight("700").color("#fff")
            .bg("#111827").paddingTop(3).paddingBottom(3).paddingLeft(8).paddingRight(8).cornerRadius(3),
        ).gap(12).alignItems("center").marginTop(6),
      ),
    ).alignItems("flex-start").marginBottom(28),

    // Table header row
    TableRow(
      headCell("បរិយាយ", col.desc),
      headCell("ចំនួន",    col.qty,  "right"),
      headCell("តម្លៃឯកតា",   col.rate, "right"),
      headCell("សរុប", col.amt,  "right"),
    ).bg("#f9fafb"),

    // Divider
    Column().height(1).bg("#e5e7eb"),

    // Line items
    ...items.map((item, i) =>
      Column(
        TableRow(
          dataCell(item.desc,        col.desc),
          dataCell(String(item.qty), col.qty,  "right"),
          dataCell(fmt(item.rate),   col.rate, "right"),
          dataCell(fmt(item.total),  col.amt,  "right"),
        ).bg(i % 2 === 0 ? "white" : "#f9fafb"),
        Column().height(1).bg("#f3f4f6"),
      ),
    ),

    // Totals
    Column(
      Row(
        Text("សរុបរង").size(11).color("#6b7280").grow(1),
        Text(fmt(subtotal)).size(11).color("#111827"),
      ).alignItems("center").paddingTop(8).paddingBottom(4),
      Row(
        Text("ពន្ធ (10%)").size(11).color("#6b7280").grow(1),
        Text(fmt(tax)).size(11).color("#111827"),
      ).alignItems("center").paddingTop(4).paddingBottom(8),
      Column().height(1).bg("#e5e7eb"),
      Row(
        Text("សរុបរួម").size(13).weight("700").color("#111827").grow(1),
        Text(fmt(total)).size(14).weight("700").color("#111827"),
      ).alignItems("center").paddingTop(12),
    ).alignItems("stretch").marginTop(8),

    // Footer
    Column(
      Column().height(1).bg("#e5e7eb").marginTop(32).marginBottom(14),
      Text("ការបង់ប្រាក់ត្រូវធ្វើឡើងក្នុងរយៈពេល 30 ថ្ងៃ។ ការបង់ប្រាក់យឺតនឹងត្រូវគិតការប្រាក់ 1.5% ក្នុងមួយខែ។")
        .size(9).color("#9ca3af").align("center"),
    ),
  )
  .padding(40)
  .bg("white")
  .width(600);
}