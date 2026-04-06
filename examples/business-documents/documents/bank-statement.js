import { Column, Row, Table, TableCell, TableRow, Text, TextDefault } from "sone";
import { Header, Label, Value } from "../components.js";
import { C, COL_BANK, FONT, PAGE_WIDTH, TBW } from "../constants.js";

const TRANSACTIONS = [
  { date: "01/03/2026", kh: "ប្រាក់ចូលពីអ្នកទិញ",        en: "Customer Payment - INV-041",  type: "credit", amount: 2400 },
  { date: "03/03/2026", kh: "ចំណាយទូទាត់ Office",        en: "Office Supplies Payment",      type: "debit",  amount: 320  },
  { date: "07/03/2026", kh: "ចំណូលពី Project A",          en: "Project A Milestone",          type: "credit", amount: 5000 },
  { date: "10/03/2026", kh: "ថ្លៃជួលការិយាល័យ",          en: "Office Rent - March",          type: "debit",  amount: 1200 },
  { date: "14/03/2026", kh: "ប្រាក់ចូលពី Client B",       en: "Client B Retainer Fee",        type: "credit", amount: 1800 },
  { date: "18/03/2026", kh: "ប្រាក់ខែបុគ្គលិក",          en: "Payroll - March Salaries",     type: "debit",  amount: 8500 },
  { date: "22/03/2026", kh: "ចំណូល Consulting",           en: "Consulting Services",           type: "credit", amount: 3200 },
  { date: "27/03/2026", kh: "ថ្លៃអ៊ីនធឺណេត + ទូរស័ព្ទ",  en: "Internet & Phone Bills",       type: "debit",  amount: 180  },
  { date: "30/03/2026", kh: "ចំណូលពី Maintenance",       en: "Maintenance Contract",          type: "credit", amount: 1500 },
  { date: "31/03/2026", kh: "ថ្លៃ Software License",      en: "Software Subscriptions",       type: "debit",  amount: 450  },
];

const OPENING_BALANCE = 24560;

function buildRows(transactions) {
  let running = OPENING_BALANCE;
  return transactions.map((tx) => {
    running += tx.type === "credit" ? tx.amount : -tx.amount;
    return { ...tx, balance: running };
  });
}

function TransactionRow(tx, index) {
  return TableRow(
    TableCell(Text(tx.date).color(C.gray)).width(COL_BANK.date),
    TableCell(
      Column(
        Text(tx.kh).weight(500),
        Text(tx.en).size(10).color(C.gray),
      ).gap(2),
    ).width(COL_BANK.desc),
    TableCell(
      tx.type === "credit"
        ? Text(`+$${tx.amount.toLocaleString()}`).color(C.green).weight(600).align("right")
        : Text("—").color(C.border).align("right"),
    ).width(COL_BANK.credit),
    TableCell(
      tx.type === "debit"
        ? Text(`-$${tx.amount.toLocaleString()}`).color(C.red).weight(600).align("right")
        : Text("—").color(C.border).align("right"),
    ).width(COL_BANK.debit),
    TableCell(
      Text(`$${tx.balance.toLocaleString()}`).weight(600).align("right"),
    ).width(COL_BANK.balance),
  ).bg(index % 2 === 1 ? C.lightGray : C.white);
}

function TransactionTable(rows) {
  return Column(
    TextDefault(
      Table(
        TableRow(
          TextDefault(
            TableCell(Text("កាលបរិច្ឆេទ\nDATE")).width(COL_BANK.date),
            TableCell(Text("ការពិពណ៌នា / DESCRIPTION")).width(COL_BANK.desc),
            TableCell(Text("ចំណូល\nCREDIT").align("right")).width(COL_BANK.credit),
            TableCell(Text("ចំណាយ\nDEBIT").align("right")).width(COL_BANK.debit),
            TableCell(Text("សមតុល្យ\nBALANCE").align("right")).width(COL_BANK.balance),
          ).color(C.white).weight(700),
        ).bg(C.accent),
        ...rows.map(TransactionRow),
      )
        .bg(C.white)
        .borderWidth(TBW)
        .borderColor(C.border)
        .spacing(14, 8),
    ).font(FONT).size(12).color(C.black),
  )
    .paddingLeft(32)
    .paddingRight(32)
    .paddingTop(20)
    .paddingBottom(32);
}

function SummaryBar({ openingBalance, totalCredit, totalDebit, closingBalance }) {
  const Separator = () => Column().width(1).bg(C.border);

  return Row(
    Column(
      Label("សមតុល្យដើម / Opening Balance"),
      Text(`$${openingBalance.toLocaleString()}`).font(FONT).size(18).color(C.black).weight(700),
    ).gap(4).padding(20).grow(1),

    Separator(),

    Column(
      Label("ចំណូលសរុប / Total Credits"),
      Text(`+$${totalCredit.toLocaleString()}`).font(FONT).size(18).color(C.green).weight(700),
    ).gap(4).padding(20).grow(1),

    Separator(),

    Column(
      Label("ចំណាយសរុប / Total Debits"),
      Text(`-$${totalDebit.toLocaleString()}`).font(FONT).size(18).color(C.red).weight(700),
    ).gap(4).padding(20).grow(1),

    Separator(),

    Column(
      Label("សមតុល្យចុងក្រោយ / Closing Balance"),
      Text(`$${closingBalance.toLocaleString()}`).font(FONT).size(18).color(C.accent).weight(700),
    ).gap(4).padding(20).grow(1),
  )
    .marginLeft(32)
    .marginRight(32)
    .borderWidth(1)
    .borderColor(C.border)
    .rounded(8)
    .marginTop(20);
}

export function BankStatementDocument() {
  const rows = buildRows(TRANSACTIONS);
  const closingBalance = rows.at(-1).balance;
  const totalCredit = TRANSACTIONS.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebit  = TRANSACTIONS.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  return Column(
    Header({
      title: "របាយការណ៍ធនាគារ",
      subtitle: "BANK STATEMENT · MARCH 2026",
      date: "រយៈពេល: 01 – 31 មីនា 2026",
      number: "BS-2026-03",
      numberLabel: "លេខ",
    }),

    Row(
      Column(Label("ឈ្មោះគណនី / ACCOUNT NAME"), Value("Sone Corp Co., Ltd.")).gap(4),
      Column(Label("លេខគណនី / ACCOUNT NO."),    Value("KH •••• •••• 4892")).gap(4),
      Column(Label("ធនាគារ / BANK"),             Value("ABA Bank · Phnom Penh")).gap(4),
      Column(Label("រូបិយប័ណ្ណ / CURRENCY"),     Value("USD")).gap(4),
    )
      .padding(20, 32)
      .justifyContent("space-between")
      .bg(C.lightGray),

    SummaryBar({ openingBalance: OPENING_BALANCE, totalCredit, totalDebit, closingBalance }),
    TransactionTable(rows),
  ).bg(C.white).width(PAGE_WIDTH);
}
