import fs from "node:fs/promises";
import { Column, Row, Span, Svg, Table, TableRow, Text, loadSvg } from "sonejs";

const colors = {
  primary: "#222831",
  white: "#fff",
  green: "#00AF50",
  red: "#FF0101",
  orange: "#E9A319",
  black: "#333",
  gray: "rgba(0,0,0,.2)",
};

const svgSrc = loadSvg(await fs.readFile("sone.svg", "utf8"));

function StatusIndicator(text, color) {
  return Row(
    Row(Text(text).size(20).weight(500)).grow(1),
    Row().size(60, 18).bg(color),
  );
}

function Header(project) {
  const KeyItem = (label) => Text(label).size(22).color(colors.white);
  const ValueItem = (label) => Text(label).size(22).weight("bold");

  return Row(
    Row(
      Row(
        Row(Svg(svgSrc).size(90).scaleType("contain"))
          .alignSelf("center")
          .padding(38, 34),
        Column(
          KeyItem("Project Name"),
          KeyItem("Project Manager"),
          KeyItem("Status Date"),
        )
          .gap(18)
          .padding(10)
          .alignSelf("center"),
      ).bg(colors.primary),
      Column(
        ValueItem(project.name),
        ValueItem(project.manager),
        ValueItem(project.date),
      )
        .gap(18)
        .padding(10)
        .alignSelf("center"),
    )
      .gap(10)
      .grow(1),
    Column(
      Row(Text("Overall Status").size(22).weight("bold"))
        .padding(15, 18)
        .grow(1)
        .alignItems("center"),
      Row(
        Column(
          StatusIndicator("On Target", colors.green),
          StatusIndicator("Risk", colors.orange),
          StatusIndicator("Delay", colors.red),
        )
          .padding(10, 18)
          .strokeColor(colors.primary)
          .strokeWidth(4)
          .gap(8)
          .grow(1),
        Row(
          Row()
            .bg(project.status)
            .size(56)
            .cornerRadius(56)
            .alignSelf("center"),
        )
          .padding(10)
          .justifyContent("center")
          .aspectRatio(1)
          .strokeColor(colors.primary)
          .strokeWidth(4),
      ),
    )
      .minWidth(350)
      .strokeColor(colors.primary)
      .strokeWidth(4),
  )
    .strokeWidth(4)
    .strokeColor(colors.primary)
    .margin(44, 44, 0, 44);
}

function Achievement(info) {
  return [
    Column(Text("Achievement for This Week").size(22).color(colors.white))
      .bg(colors.primary)
      .padding(24, 14)
      .strokeColor(colors.primary)
      .strokeWidth(4),
    Column(Text(info).lineHeight(1.4).size(18).color(colors.black))
      .padding(24)
      .strokeColor(colors.primary)
      .strokeWidth(4)
      .grow(1),
  ];
}

function NextPlan(info) {
  return [
    Column(Text("Plan for Next Week").size(22).color(colors.white))
      .bg(colors.primary)
      .padding(24, 14)
      .strokeColor(colors.primary)
      .strokeWidth(4),
    Column(Text(info).lineHeight(1.4).size(18).color(colors.black))
      .padding(24)
      .strokeColor(colors.primary)
      .strokeWidth(4)
      .grow(1),
  ];
}

function IssueItem(issue, solution) {
  return TableRow(
    Row(Text(issue).size(20).color(colors.black)).padding(8, 10),
    Row(Text(solution).size(20).color(colors.black)).padding(8, 10),
  );
}

function IssueOrRisk(items) {
  const IssueHeaderCell = (label) =>
    Row(Text(label).color(colors.white).size(20))
      .bg(colors.primary)
      .padding(8, 10);

  return Column(
    Table(
      TableRow(
        IssueHeaderCell(`Issue or Risk (${items.length})`),
        IssueHeaderCell("Suggest Solution"),
      ),
      ...items.map((item) => IssueItem(item.issue, item.solution)),
    )
      .strokeColor(colors.gray)
      .strokeWidth(2),
  )
    .strokeColor(colors.primary)
    .strokeWidth(4);
}

function KeyMilestone(items) {
  const HeaderCell = (label) =>
    Row(Text(label).weight("bold").color(colors.white).size(18))
      .bg(colors.primary)
      .padding(8, 10);

  const RowItem = (info, date, percent, color) =>
    TableRow(
      Row(Text(info).size(18).color("#333")).padding(4, 8),
      Row(Text(date).size(18).color("#333")).padding(4, 8),
      Row(Text(percent).size(18).color("#333"))
        .justifyContent("center")
        .padding(4, 8),
      Row(Row().size(18).cornerRadius(18).bg(color).alignSelf("center"))
        .padding(4, 8)
        .justifyContent("center"),
    );

  return Table(
    TableRow(
      HeaderCell("Key Milestones"),
      HeaderCell("Due date"),
      HeaderCell("Complete"),
      HeaderCell("Status"),
    ),
    ...items.map((values) => RowItem(...values)),
  )
    .strokeWidth(3)
    .strokeColor("rgba(0,0,0,.1)");
}

export function ReportDocument(data) {
  const ProjectTimelineHeaderCell = (label) =>
    Row(Text(label).size(18).weight(500)).padding(6, 12).bg(colors.gray);

  const TrackBar = (start, end, color) =>
    Row().size(end, 14).left(start).bg(color).cornerRadius(14);

  return Column(
    Header(data.project).opacity(Math.min(10*(data.progress/100), 1)),
    Row(
      Column(
        ...Achievement(data.achivements.join("\n")),
        ...NextPlan(data.plans.join("\n")),
        IssueOrRisk(data.risks),
      ),
      Column(
        Column(Text("Project Timeline - 2025").size(22).color(colors.white))
          .bg(colors.primary)
          .padding(8, 20),
        Table(
          TableRow(
            ...["Mar", "Apr", "May", "June"].map((value) =>
              ProjectTimelineHeaderCell(value),
            ),
          ),
        )
          .marginTop(10)
          .strokeColor("#fff")
          .strokeWidth(4),
        Row(
          Column(
            ...data.tracks.map(({ start, end, color }) =>
              TrackBar(`${start}%`, `${end - start}%`, color),
            ),
          )
            .grow(1)
            .marginTop(8)
            .gap(8),
          Column(
            Row().size(3, 150).bg("rgba(255,0,0,.6)").cornerRadius(4),
            Text("We are here ", Span("🔥").offsetY(-4))
              .size(18)
              .color(colors.red),
          )
            .alignItems("center")
            .gap(8)
            .position("absolute")
            .top(10)
            .width(150)
            .left(-150 / 2)
            .marginLeft(`${data.progress}%`),
        ).height(200 * Math.min(1, 8 * (data.progress / 100))),
        KeyMilestone(data.milestones),
      ).grow(1),
    )
      .margin(14, 44, 44, 44)
      .grow(1)
      .gap(14)
      .opacity(Math.min(1.0, (data.progress * 16) / 100)),
  )
    .minWidth(1280)
    .minHeight(720)
    .bg("#fff");
}

export const defaultData = {
  project: {
    manager: "Seanghay",
    name: "Project Name",
    date: "01/05/2025 - 12:00 AM",
    status: colors.green,
  },
  achivements: [
    "- Had an internal meeting with Donald Trump",
    "- Meeting and meeting",
  ],
  plans: ["- Rocket Launch", "- Build something useful"],
  risks: [
    { issue: "Issue 1", solution: "Solution 1" },
    { issue: "Issue 2", solution: "Solution 2" },
    { issue: "Issue 3", solution: "Solution 3" },
  ],
  milestones: [
    ["Project Study", "", "", ""],
    ["Initial Meeting 0", "20/01/2025", "100%", colors.green],
    ["Initial Meeting 1", "20/01/2025", "100%", colors.red],
    ["Initial Meeting 2", "20/01/2025", "100%", colors.orange],
  ],
  tracks: [
    { start: 0, end: 20, color: colors.gray },
    { start: 20, end: 40, color: colors.gray },
    { start: 30, end: 60, color: colors.gray },
    { start: 50, end: 80, color: colors.gray },
    { start: 70, end: 100, color: colors.green },
  ],
  progress: 80,
};
