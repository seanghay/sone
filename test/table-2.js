import fs from "node:fs/promises";
import {
  Column,
  Row,
  Span,
  Svg,
  Table,
  TableRow,
  Text,
  loadSvg,
  renderAsImageBuffer,
  renderAsPdfBuffer,
} from "../src/sone.js";

async function Document() {
  const colors = {
    primary: "#3A0519",
    white: "#fff",
    green: "#00AF50",
    red: "#FF0101",
    orange: "#E9A319",
    black: "#333",
    gray: "rgba(0,0,0,.2)",
  };

  const svgSrc = loadSvg(await fs.readFile("test/sone-white.svg", "utf8"));

  return Column(
    Row(
      Row(
        Row(
          Row(Svg(svgSrc).size(90).scaleType("contain"))
            .alignSelf("center")
            .padding(38, 34),
          Column(
            Text("Project Name").size(22).color(colors.white),
            Text("Project Manager").size(22).color(colors.white),
            Text("Status Date").size(22).color(colors.white),
          )
            .gap(18)
            .padding(10)
            .alignSelf("center"),
        ).bg(colors.primary),
        Column(
          Text("Project Title").size(22).weight("bold"),
          Text("Seanghay").size(22).weight("bold"),
          Text("01/05/2024 - 12:00 AM").size(22).weight("bold"),
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
            Row(
              Row(Text("On Target").size(20).weight(500)).grow(1),
              Row().size(60, 18).bg(colors.green),
            ),
            Row(
              Row(Text("Risk").size(20).weight(500)).grow(1),
              Row().size(60, 18).bg(colors.orange),
            ),
            Row(
              Row(Text("Delay").size(20).weight(500)).grow(1),
              Row().size(60, 18).bg(colors.red),
            ),
          )
            .padding(10, 18)
            .strokeColor(colors.primary)
            .strokeWidth(4)
            .gap(8)
            .grow(1),
          Row(
            Row()
              .bg(colors.green)
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
      .margin(44, 44, 0, 44),

    Row(
      Column(
        // section 1
        Column(
          Text("Achievement for This Week")
            .size(22)
            .color(colors.white),
        )
          .bg(colors.primary)
          .padding(24, 14)
          .strokeColor(colors.primary)
          .strokeWidth(4),
        Column(
          Text(
            "- Had an internal meeting with Donald Trump\n- Meeting and meeting",
          )
            .lineHeight(1.4)
            .size(18)
            .color(colors.black),
        )
          .padding(24)
          .strokeColor(colors.primary)
          .strokeWidth(4)
          .grow(1),
        // section 2
        Column(Text("Plan for Next Week").size(22).color(colors.white))
          .bg(colors.primary)
          .padding(24, 14)
          .strokeColor(colors.primary)
          .strokeWidth(4),
        Column(
          Text("- Rocket Launch\n- Build something useful")
            .lineHeight(1.4)
            .size(18)
            .color(colors.black),
        )
          .padding(24)
          .strokeColor(colors.primary)
          .strokeWidth(4)
          .grow(1),
        // section 3
        Column(
          Table(
            TableRow(
              Row(Text("Issue or Risk").color(colors.white).size(20))
                .bg(colors.primary)
                .padding(8, 10),
              Row(Text("Suggest Solution").color(colors.white).size(20))
                .bg(colors.primary)
                .padding(8, 10),
            ),
            TableRow(
              Row(Text("Issue 1").size(20).color(colors.black)).padding(8, 10),
              Row(Text("Solution 1").size(20).color(colors.black)).padding(
                8,
                10,
              ),
            ),
            TableRow(
              Row(Text("Issue 2").size(20).color(colors.black)).padding(8, 10),
              Row(Text("Solution 2").size(20).color(colors.black)).padding(
                8,
                10,
              ),
            ),
            TableRow(
              Row(Text("Issue 3").size(20).color(colors.black)).padding(8, 10),
              Row(Text("Solution 3").size(20).color(colors.black)).padding(
                8,
                10,
              ),
            ),
          )
            .strokeColor(colors.gray)
            .strokeWidth(2),
        )
          .strokeColor(colors.primary)
          .strokeWidth(4),
      ),
      // Project timeline
      Column(
        Column(Text("Project Timeline - 2025").size(22).color(colors.white))
          .bg(colors.primary)
          .padding(8, 20),
        Table(
          TableRow(
            Row(Text("Mar").size(18).weight(500))
              .padding(6, 12)
              .bg(colors.gray),
            Row(Text("Apr").size(18).weight(500))
              .padding(6, 12)
              .bg(colors.gray),
            Row(Text("May").size(18).weight(500))
              .padding(6, 12)
              .bg(colors.gray),
            Row(Text("June").size(18).weight(500))
              .padding(6, 12)
              .bg(colors.gray),
          ),
        )
          .marginTop(10)
          .strokeColor("#fff")
          .strokeWidth(4),
        Row(
          Column(
            Row().size(300, 14).bg(colors.gray).cornerRadius(0),
            Row()
              .size(340, 14)
              .bg(colors.orange)
              .cornerRadius(0)
              .marginLeft(50),
            Row()
              .size(400, 14)
              .marginLeft(100)
              .bg(colors.green)
              .cornerRadius(0),
            Row().size(300, 14).marginLeft(200).bg(colors.red).cornerRadius(0),
            Row()
              .size(320, 14)
              .marginLeft(300)
              .bg(colors.primary)
              .cornerRadius(0),
          )
            .marginTop(8)
            .gap(8),
          Column(
            Row().size(3, 150).bg("rgba(255,0,0,.6)"),
            Text("We are here ", Span("🔥").offsetY(-4))
              .size(18)
              .color(colors.red),
          )
            .alignItems("center")
            .gap(8)
            .position("absolute")
            .top(10)
            .left(440),
        ).height(200),
        Table(
          TableRow(
            Row(
              Text("Key Milestones")
                .weight("bold")
                .color(colors.white)
                .size(18),
            )
              .bg(colors.primary)
              .padding(8, 10),
            Row(Text("Due date").weight("bold").color(colors.white).size(18))
              .bg(colors.primary)
              .padding(8, 10),
            Row(Text("Complete").weight("bold").color(colors.white).size(18))
              .bg(colors.primary)
              .padding(8, 10),
            Row(Text("Status").weight("bold").color(colors.white).size(18))
              .bg(colors.primary)
              .padding(8, 10),
          ),
          TableRow(
            Row(Text("Project Study").size(18).color("#333")).padding(4, 8),
          ),
          TableRow(
            Row(Text("- Initial Meeting").size(18).color("#333")).padding(4, 8),
            Row(Text("20/01/2024").size(18).color("#333")).padding(4, 8),
            Row(Text("100%").size(18).color("#333"))
              .justifyContent("center")
              .padding(4, 8),
            Row(
              Row()
                .size(18)
                .cornerRadius(18)
                .bg(colors.green)
                .alignSelf("center"),
            )
              .padding(4, 8)
              .justifyContent("center"),
          ),
          TableRow(
            Row(Text("- Initial Meeting").size(18).color("#333")).padding(4, 8),
            Row(Text("20/01/2024").size(18).color("#333")).padding(4, 8),
            Row(Text("100%").size(18).color("#333"))
              .justifyContent("center")
              .padding(4, 8),
            Row(
              Row()
                .size(18)
                .cornerRadius(18)
                .bg(colors.green)
                .alignSelf("center"),
            )
              .padding(4, 8)
              .justifyContent("center"),
          ),
          TableRow(
            Row(Text("- Initial Meeting").size(18).color("#333")).padding(4, 8),
            Row(Text("20/01/2024").size(18).color("#333")).padding(4, 8),
            Row(Text("100%").size(18).color("#333"))
              .justifyContent("center")
              .padding(4, 8),
            Row(
              Row()
                .size(18)
                .cornerRadius(18)
                .bg(colors.orange)
                .alignSelf("center"),
            )
              .padding(4, 8)
              .justifyContent("center"),
          ),
          TableRow(
            Row(Text("- Initial Meeting").size(18).color("#333")).padding(4, 8),
            Row(Text("20/01/2024").size(18).color("#333")).padding(4, 8),
            Row(Text("100%").size(18).color("#333"))
              .justifyContent("center")
              .padding(4, 8),
            Row(
              Row()
                .size(18)
                .cornerRadius(18)
                .bg(colors.red)
                .alignSelf("center"),
            )
              .padding(4, 8)
              .justifyContent("center"),
          ),

          TableRow(
            Row(Text("- Initial Meeting").size(18).color("#333")).padding(4, 8),
            Row(Text("20/01/2024").size(18).color("#333")).padding(4, 8),
            Row(Text("100%").size(18).color("#333"))
              .justifyContent("center")
              .padding(4, 8),
            Row(
              Row()
                .size(18)
                .cornerRadius(18)
                .bg(colors.red)
                .alignSelf("center"),
            )
              .padding(4, 8)
              .justifyContent("center"),
          ),
        )
          .strokeWidth(3)
          .strokeColor("rgba(0,0,0,.1)"),
      ).grow(1),
    )
      .margin(14, 44, 44, 44)
      .grow(1)
      .gap(14),
  )
    .minWidth(1280)
    .minHeight(720)
    .bg("#fff");
}

await fs.writeFile("test/table-2.jpg", renderAsImageBuffer(await Document()));
await fs.writeFile("test/table-2.pdf", renderAsPdfBuffer(await Document()));
