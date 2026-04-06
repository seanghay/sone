import { Column, Row, Table, TableCell, TableRow, Text, TextDefault } from "sone";
import { Divider, Header, Label, Value } from "../components.js";
import { C, COL_INVOICE, FONT, PAGE_WIDTH, TBW } from "../constants.js";

const ITEMS = [
  { kh: "ប្រព័ន្ធ ERP",           en: "ERP System Implementation",  qty: 1,  unit: 4500 },
  { kh: "ការបណ្តុះបណ្តាល",       en: "Staff Training Program",      qty: 10, unit: 200  },
  { kh: "ការគ្រប់គ្រងគម្រោង",    en: "Project Management",          qty: 3,  unit: 800  },
  { kh: "ការថែទាំប្រចាំឆ្នាំ",   en: "Annual Maintenance Contract", qty: 1,  unit: 1200 },
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

function Totals({ subtotal, discount, tax, total }) {
  return Column(
    Row(
      Text("សរុបរង / Subtotal").font(FONT).size(12).color(C.gray),
      Text(`$${subtotal.toFixed(2)}`).font(FONT).size(12).color(C.black).weight(600),
    ).justifyContent("space-between"),
    Row(
      Text("បញ្ចុះតម្លៃ / Discount").font(FONT).size(12).color(C.gray),
      Text(`-$${discount.toFixed(2)}`).font(FONT).size(12).color(C.red).weight(600),
    ).justifyContent("space-between"),
    Row(
      Text("ពន្ធ VAT 10% / Tax").font(FONT).size(12).color(C.gray),
      Text(`$${tax.toFixed(2)}`).font(FONT).size(12).color(C.black).weight(600),
    ).justifyContent("space-between"),
    Divider(),
    Row(
      Text("តម្លៃសរុប / TOTAL").font(FONT).size(14).color(C.accent).weight(700),
      Text(`$${total.toFixed(2)}`).font(FONT).size(16).color(C.accent).weight(700),
    ).justifyContent("space-between"),
  )
    .gap(10)
    .padding(16, 32)
    .paddingBottom(24);
}

export function QuotationDocument() {
  const subtotal = ITEMS.reduce((s, i) => s + i.qty * i.unit, 0);
  const discount = 500;
  const tax = (subtotal - discount) * 0.1;
  const total = subtotal - discount + tax;

  return Column(
    Header({
      title: "សម្រង់តម្លៃ",
      subtitle: "QUOTATION",
      date: "ចេញថ្ងៃ: 06 មេសា 2026",
      number: "QT-2026-0018",
      numberLabel: "លេខ",
    }),

    Row(
      Column(
        Label("ដាក់ជូន / PREPARED FOR"),
        Column(
          Value("ក្រុមហ៊ុន ខ្មែរ ឌីជីថល"),
          Value("Khmer Digital Co., Ltd."),
          Value("45 ផ្លូវ Norodom, ភ្នំពេញ"),
          Value("Tel: +855 23 456 789"),
        ).gap(4),
      ).gap(8),

      Column(
        Label("ព័ត៌មានស្នើ / QUOTATION INFO"),
        Column(
          Row(Label("ថ្ងៃចេញ: "), Value("06 មេសា 2026")).gap(6),
          Row(Label("សុពលភាព: "), Value("30 ថ្ងៃ / 30 days")).gap(6),
          Row(Label("អ្នកតំណាង: "), Value("លោក ហេង ប៊ុននី")).gap(6),
        ).gap(4),
      ).gap(8),
    )
      .padding(24, 32)
      .gap(60)
      .justifyContent("space-between"),

    ItemTable(ITEMS),
    Totals({ subtotal, discount, tax, total }),

    Column(
      Label("លក្ខខណ្ឌ / TERMS & CONDITIONS"),
      Column(
        Text("• តម្លៃខាងលើនឹងផ្លាស់ប្តូរប្រសិនបើតម្រូវការផ្លាស់ប្តូរ / Prices subject to change if scope changes.")
          .font(FONT).size(11).color(C.gray).lineHeight(1.5),
        Text("• ការបង់ប្រាក់ 50% នៅពេលចុះហត្ថលេខា / 50% deposit required upon contract signing.")
          .font(FONT).size(11).color(C.gray).lineHeight(1.5),
        Text("• ការធានា 12 ខែ / 12-month warranty included on all deliverables.")
          .font(FONT).size(11).color(C.gray).lineHeight(1.5),
      ).gap(4),
    )
      .gap(8)
      .paddingLeft(32)
      .paddingRight(32)
      .paddingBottom(32),
  ).bg(C.white).width(PAGE_WIDTH);
}
