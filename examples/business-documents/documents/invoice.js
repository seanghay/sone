import { Column, Row, Table, TableCell, TableRow, Text, TextDefault } from "sone";
import { Divider, Header, Label, Value } from "../components.js";
import { C, COL_INVOICE, FONT, PAGE_WIDTH, TBW } from "../constants.js";

const ITEMS = [
  { kh: "រចនាប័ទ្មក្រាហ្វិក",  en: "Graphic Design",     qty: 3, unit: 150 },
  { kh: "អភិវឌ្ឍន៍គេហទំព័រ",  en: "Web Development",    qty: 1, unit: 800 },
  { kh: "ការថែទាំប្រព័ន្ធ",   en: "System Maintenance",  qty: 2, unit: 120 },
  { kh: "ការបណ្តុះបណ្តាល",    en: "Staff Training",      qty: 4, unit: 90  },
];

function ItemRow(item, index) {
  return TableRow(
    TableCell(
      Column(
        Text(item.kh).weight(500),
        Text(item.en).size(10).color(C.gray),
      ).gap(2),
    ).width(COL_INVOICE.desc),
    TableCell(Text(`${item.qty}`).align("center")).width(COL_INVOICE.qty),
    TableCell(Text(`$${item.unit.toFixed(2)}`).align("right")).width(COL_INVOICE.unit),
    TableCell(Text(`$${(item.qty * item.unit).toFixed(2)}`).weight(600).align("right")).width(COL_INVOICE.amount),
  ).bg(index % 2 === 1 ? C.lightGray : C.white);
}

function ItemTable(items) {
  return Column(
    TextDefault(
      Table(
        TableRow(
          TextDefault(
            TableCell(Text("ការពិពណ៌នា / DESCRIPTION")).width(COL_INVOICE.desc),
            TableCell(Text("ចំនួន\nQTY").align("center")).width(COL_INVOICE.qty),
            TableCell(Text("តម្លៃ\nUNIT").align("right")).width(COL_INVOICE.unit),
            TableCell(Text("សរុប\nAMOUNT").align("right")).width(COL_INVOICE.amount),
          ).color(C.white).weight(700),
        ).bg(C.accent),
        ...items.map(ItemRow),
      )
        .bg(C.white)
        .borderWidth(TBW)
        .borderColor(C.border)
        .spacing(16, 10),
    ).font(FONT).size(12).color(C.black),
  ).marginLeft(32).marginRight(32);
}

function Totals({ subtotal, tax, total }) {
  return Column(
    Row(
      Text("សរុបរង / Subtotal").font(FONT).size(12).color(C.gray),
      Text(`$${subtotal.toFixed(2)}`).font(FONT).size(12).color(C.black).weight(600),
    ).justifyContent("space-between"),
    Row(
      Text("ពន្ធ VAT 10% / Tax").font(FONT).size(12).color(C.gray),
      Text(`$${tax.toFixed(2)}`).font(FONT).size(12).color(C.black).weight(600),
    ).justifyContent("space-between"),
    Divider(),
    Row(
      Text("សរុបទាំងអស់ / TOTAL").font(FONT).size(14).color(C.accent).weight(700),
      Text(`$${total.toFixed(2)}`).font(FONT).size(16).color(C.accent).weight(700),
    ).justifyContent("space-between"),
  )
    .gap(10)
    .padding(16, 32)
    .paddingBottom(24);
}

export function InvoiceDocument() {
  const subtotal = ITEMS.reduce((s, i) => s + i.qty * i.unit, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return Column(
    Header({
      title: "វិក្កយបត្រ",
      subtitle: "INVOICE",
      date: "កាលបរិច្ឆេទ: 06 មេសា 2026",
      number: "INV-2026-0041",
      numberLabel: "លេខ",
    }),

    Row(
      Column(
        Label("វិក្កយបត្រចេញដល់ / BILL TO"),
        Column(
          Value("លោក ចន្ទ សុភក្ត"),
          Value("Chan Sopheaktra"),
          Value("123 ផ្លូវមន្ត្រី, សង្កាត់ទន្លេបាសាក់"),
          Value("Phnom Penh, Cambodia"),
          Value("sopheaktra@example.com"),
        ).gap(4),
      ).gap(8),

      Column(
        Label("ព័ត៌មានបង់ប្រាក់ / PAYMENT DETAILS"),
        Column(
          Row(Label("ថ្ងៃផុតកំណត់: "), Value("06 ឧសភា 2026")).gap(6),
          Row(Label("លក្ខខណ្ឌ: "), Value("Net 30")).gap(6),
          Row(
            Label("ស្ថានភាព: "),
            Text("UNPAID").font(FONT).size(12).color(C.red).weight(700),
          ).gap(6),
        ).gap(4),
      ).gap(8),
    )
      .padding(24, 32)
      .gap(60)
      .justifyContent("space-between"),

    ItemTable(ITEMS),
    Totals({ subtotal, tax, total }),

    Column(
      Label("ចំណាំ / NOTE"),
      Text(
        "សូមអរគុណចំពោះការទុកចិត្ត។ " +
        "Thank you for your continued trust and business. " +
        "Payment is due within 30 days of invoice date.",
      ).font(FONT).size(11).color(C.gray).lineHeight(1.5).maxWidth(500),
    )
      .gap(6)
      .paddingLeft(32)
      .paddingRight(32)
      .paddingBottom(32),

  ).bg(C.white).width(PAGE_WIDTH);
}
