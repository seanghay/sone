import { Column, Row, Table, TableCell, TableRow, Text, TextDefault } from "sone";
import { Header } from "../components.js";
import { C, COL_REPORT, FONT, PAGE_WIDTH, TBW } from "../constants.js";

const MONTHLY_DATA = [
  { month: "មករា / Jan",   revenue: 12400, expenses: 8200 },
  { month: "កុម្ភៈ / Feb", revenue: 15800, expenses: 9400 },
  { month: "មីនា / Mar",   revenue: 13200, expenses: 7600 },
];

function StatCard(label, value, sublabel) {
  return Column(
    Text(value).font(FONT).size(28).color(C.accent).weight(700),
    Text(label).font(FONT).size(12).color(C.black).weight(600),
    Text(sublabel).font(FONT).size(10).color(C.gray).weight(400),
  )
    .gap(4)
    .padding(20)
    .bg(C.lightGray)
    .rounded(8)
    .grow(1);
}

function SectionTitle(kh, en) {
  return Column(
    Text(kh).font(FONT).size(14).color(C.accent).weight(700),
    Text(en).font(FONT).size(11).color(C.gray).weight(400),
    Row().height(2).width(40).bg(C.accent).marginTop(4),
  ).gap(2);
}

function MonthlyTable(data) {
  return TextDefault(
    Table(
      TableRow(
        TextDefault(
          TableCell(Text("ខែ / MONTH")).width(COL_REPORT.month),
          TableCell(Text("ចំណូល\nREVENUE").align("right")).width(COL_REPORT.revenue),
          TableCell(Text("ចំណាយ\nEXPENSES").align("right")).width(COL_REPORT.expenses),
          TableCell(Text("ចំណេញ\nPROFIT").align("right")).width(COL_REPORT.profit),
        ).color(C.white).weight(700),
      ).bg(C.accent),

      ...data.map((row, i) => {
        const profit = row.revenue - row.expenses;
        return TableRow(
          TableCell(Text(row.month).weight(500)).width(COL_REPORT.month),
          TableCell(Text(`$${row.revenue.toLocaleString()}`).align("right")).width(COL_REPORT.revenue),
          TableCell(Text(`$${row.expenses.toLocaleString()}`).align("right")).width(COL_REPORT.expenses),
          TableCell(Text(`$${profit.toLocaleString()}`).color(C.green).weight(600).align("right")).width(COL_REPORT.profit),
        ).bg(i % 2 === 1 ? C.lightGray : C.white);
      }),
    )
      .bg(C.white)
      .borderWidth(TBW)
      .borderColor(C.border)
      .spacing(16, 10),
  ).font(FONT).size(12).color(C.black);
}

export function ReportDocument() {
  return Column(
    Header({
      title: "របាយការណ៍",
      subtitle: "BUSINESS REPORT · Q1 2026",
      date: "រយៈពេល: មករា – មីនា 2026",
      number: "RPT-2026-Q1",
      numberLabel: "លេខ",
    }),

    Column(
      SectionTitle("សង្ខេបប្រតិបត្តិការ", "Executive Summary"),
      Text(
        "ក្រុមហ៊ុន Sone Corp មានការរីកចម្រើនគួរឱ្យកត់សម្គាល់ក្នុងត្រីមាសទី១ ឆ្នាំ២០២៦ " +
        "ជាមួយនឹងចំណូលសរុបឡើងដល់ $41,400 ដែលកើនឡើង 18% ប្រៀបធៀបនឹងត្រីមាសដូចគ្នានៃឆ្នាំ២០២៥។ " +
        "Sone Corp recorded strong growth in Q1 2026, with total revenue reaching $41,400 — " +
        "an 18% increase year-on-year. Operational efficiency improved across all departments.",
      ).font(FONT).size(12).color(C.black).lineHeight(1.6).maxWidth(680),
    )
      .gap(12)
      .padding(24, 32),

    Row(
      StatCard("ចំណូលសរុប\nTotal Revenue",   "$41,400", "▲ 18% YoY"),
      StatCard("ចំណាយសរុប\nTotal Expenses", "$25,200", "▼ 5% YoY"),
      StatCard("ប្រាក់ចំណេញ\nNet Profit",   "$16,200", "▲ 32% YoY"),
    )
      .gap(16)
      .paddingLeft(32)
      .paddingRight(32),

    Column(
      SectionTitle("លទ្ធផលប្រចាំខែ", "Monthly Breakdown"),
      MonthlyTable(MONTHLY_DATA),
    )
      .gap(12)
      .padding(24, 32),

    Column(
      SectionTitle("គោលបំណងត្រីមាសបន្ទាប់", "Q2 2026 Objectives"),
      Column(
        Text("• ពង្រីកទីផ្សារទៅក្នុងខេត្ត ៥ / Expand market to 5 provinces")
          .font(FONT).size(12).color(C.black).lineHeight(1.5),
        Text("• ជ្រើសរើសបុគ្គលិកថ្មី ១០ នាក់ / Hire 10 new team members")
          .font(FONT).size(12).color(C.black).lineHeight(1.5),
        Text("• សម្រេចចំណូល $60,000 / Achieve $60,000 revenue target")
          .font(FONT).size(12).color(C.black).lineHeight(1.5),
        Text("• បង្ហើយការអភិវឌ្ឍន៍ platform v2 / Complete platform v2 development")
          .font(FONT).size(12).color(C.black).lineHeight(1.5),
      ).gap(8),
    )
      .gap(12)
      .paddingLeft(32)
      .paddingRight(32)
      .paddingBottom(32),

    
  ).bg(C.white).width(PAGE_WIDTH);
}
