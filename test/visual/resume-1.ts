import { Column, Photo, Row, Span, Text } from "../../src/core";
import { writeCanvasToFile } from "./utils";

// Header section with name and contact info
function ResumeHeader() {
  return Column(
    // Profile photo
    Photo("./test/image/kouprey.jpg")
      .size(120)
      .scaleType("cover")
      .rounded(60)
      .borderColor("#2c3e50")
      .borderWidth(3)
      .alignSelf("center")
      .marginBottom(20)
      .shadow("0px 4px 8px rgba(0,0,0,0.2)"),

    // Name and title
    Text("សារ៉ា ចាន់")
      .size(48)
      .weight("bold")
      .font("Inter Khmer")
      .color("#2c3e50")
      .align("center")
      .marginBottom(8),

    Text("វិស្វកម្មកម្មវិធីជាន់ខ្ពស់")
      .size(20)
      .weight("500")
      .font("Inter Khmer")
      .color("#34495e")
      .align("center")
      .marginBottom(20),

    // Contact information
    Row(
      Text("📧 sarah.chan@email.com")
        .size(14)
        .color("#7f8c8d")
        .font("Inter Khmer"),
      Text("•").size(14).color("#bdc3c7").margin(0, 8),
      Text("📱 (855) 123-4567").size(14).color("#7f8c8d").font("Inter Khmer"),
      Text("•").size(14).color("#bdc3c7").margin(0, 8),
      Text("🔗 linkedin.com/in/sarachan")
        .size(14)
        .color("#7f8c8d")
        .font("Inter Khmer"),
      Text("•").size(14).color("#bdc3c7").margin(0, 8),
      Text("🌐 github.com/sarachan")
        .size(14)
        .color("#7f8c8d")
        .font("Inter Khmer"),
    )
      .justifyContent("center")
      .alignItems("center")
      .wrap("wrap")
      .gap(4),
  )
    .bg("linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)")
    .padding(40, 30)
    .borderWidth(0, 0, 2, 0)
    .borderColor("#e9ecef");
}

// Section header component
function SectionHeader(title: string) {
  return Column(
    Text(title)
      .size(18)
      .weight("bold")
      .font("Inter Khmer")
      .color("#2c3e50")
      .marginBottom(4),

    // Decorative underline
    Row()
      .height(3)
      .bg("linear-gradient(90deg, #3498db, #2980b9)")
      .width(60)
      .rounded(2),
  ).marginBottom(16);
}

// Professional summary section
function ProfessionalSummary() {
  return Column(
    SectionHeader("សង្ខេបវិជ្ជាជីវៈ"),

    Text(
      "វិស្វករកម្មវិធីដែលមានចំណង់ចំណូលចិត្ត និងផ្តោតលើលទ្ធផលជា ",
      Span("វិស្វកម្មកម្មវិធីជាន់ខ្ពស់").weight("bold").color("#2980b9"),
      " ដែលមានបទពិសោធន៍ ",
      Span("៨+ ឆ្នាំ").weight("bold").color("#e74c3c"),
      " ក្នុងការអភិវឌ្ឍន៍ពេញលេញ, ស្ថាបត្យកម្ម cloud និងការដឹកនាំក្រុម។ ",
      "មានកំណត់ត្រាបង្ហាញពីការផ្តល់ដំណោះស្រាយដែលអាចពង្រីកបានដែលជំរុញការលូតលាស់ពាណិជ្ជកម្ម និងកែលម្អបទពិសោធន៍អ្នកប្រើប្រាស់។ ",
      "ជំនាញក្នុងបច្ចេកវិទ្យាបណ្តាញទំនើបជាមួយនឹងមូលដ្ឋានរឹងមាំក្នុង ",
      Span("ស្ថាបត្យកម្ម microservices").weight("bold").color("#27ae60"),
      " និង ",
      Span("ការអនុវត្ត DevOps").weight("bold").color("#27ae60"),
      "។",
    )
      .size(15)
      .font("Inter Khmer")
      .color("#34495e")
      .lineHeight(1.6)
      .align("justify"),
  );
}

// Technical skills section
function TechnicalSkills() {
  return Column(
    SectionHeader("ជំនាញបច្ចេកទេស"),

    Row(
      Column(
        Text("ភាសា និង Framework")
          .size(14)
          .weight("bold")
          .font("Inter Khmer")
          .color("#2c3e50")
          .marginBottom(8),

        Column(
          Text("• JavaScript, TypeScript, Python")
            .size(13)
            .color("#34495e")
            .marginBottom(4)
            .font("Inter Khmer"),
          Text("• React, Vue.js, Node.js, Express")
            .size(13)
            .color("#34495e")
            .marginBottom(4)
            .font("Inter Khmer"),
          Text("• Next.js, Nuxt.js, Django")
            .size(13)
            .color("#34495e")
            .marginBottom(4)
            .font("Inter Khmer"),
          Text("• GraphQL, REST APIs")
            .size(13)
            .color("#34495e")
            .font("Inter Khmer"),
        ),
      ).flex(1),

      Column(
        Text("Cloud និង DevOps")
          .size(14)
          .weight("bold")
          .font("Inter Khmer")
          .color("#2c3e50")
          .marginBottom(8),

        Column(
          Text("• AWS, Azure, Google Cloud")
            .size(13)
            .color("#34495e")
            .marginBottom(4)
            .font("Inter Khmer"),
          Text("• Docker, Kubernetes, Terraform")
            .size(13)
            .color("#34495e")
            .marginBottom(4)
            .font("Inter Khmer"),
          Text("• CI/CD, Jenkins, GitHub Actions")
            .size(13)
            .color("#34495e")
            .marginBottom(4)
            .font("Inter Khmer"),
          Text("• Monitoring: Datadog, New Relic")
            .size(13)
            .color("#34495e")
            .font("Inter Khmer"),
        ),
      ).flex(1),

      Column(
        Text("មូលដ្ឋានទិន្នន័យ និងឧបករណ៍")
          .size(14)
          .weight("bold")
          .font("Inter Khmer")
          .color("#2c3e50")
          .marginBottom(8),

        Column(
          Text("• PostgreSQL, MongoDB, Redis")
            .size(13)
            .color("#34495e")
            .marginBottom(4)
            .font("Inter Khmer"),
          Text("• Git, Jira, Figma")
            .size(13)
            .color("#34495e")
            .marginBottom(4)
            .font("Inter Khmer"),
          Text("• Testing: Jest, Cypress, Playwright")
            .size(13)
            .color("#34495e")
            .marginBottom(4)
            .font("Inter Khmer"),
          Text("• Agile, Scrum, Code Review")
            .size(13)
            .color("#34495e")
            .font("Inter Khmer"),
        ),
      ).flex(1),
    ).gap(30),
  );
}

// Work experience section
function WorkExperience() {
  return Column(
    SectionHeader("បទពិសោធន៍ការងារ"),

    // Job 1
    Column(
      Row(
        Column(
          Text("វិស្វកម្មកម្មវិធីជាន់ខ្ពស់")
            .size(16)
            .weight("bold")
            .font("Inter Khmer")
            .color("#2c3e50"),
          Text("ក្រុមហុន TechFlow Solutions")
            .size(14)
            .weight("500")
            .font("Inter Khmer")
            .color("#7f8c8d"),
        ).flex(1),

        Text("មករា 2022 - ស្ទាប់នោះ")
          .size(14)
          .font("Inter Khmer")
          .color("#7f8c8d")
          .style("italic"),
      )
        .alignItems("flex-start")
        .marginBottom(12),

      Column(
        Text(
          "• ដឹកនាំការអភិវឌ្ឍន៍ស្ថាបត្យកម្ម microservices ដែលមានអ្នកប្រើប្រាស់ពិសេស 2 លាននាក់ក្នុងមួយថ្ងៃ",
        )
          .size(13)
          .color("#34495e")
          .marginBottom(6)
          .font("Inter Khmer"),
        Text(
          "• កម្ហយពេលវេលាដំណោះរង់របស់ API ដល់ 40% តាមរយៈការបង្ហាញប្រសិទ្ធផាពមូលដ្ឋានទិន្នន័យ និងយុទ្ធសាស្ត្រ caching",
        )
          .size(13)
          .color("#34495e")
          .marginBottom(6)
          .font("Inter Khmer"),
        Text("• ការបន្តុះបន្ធាលវិស្វករកំណត់ទាប 5 នាក់ និងបង្កើតវិធីសាស្ត្ររង់ទ្ធពិនិត្យកោដ")
          .size(13)
          .color("#34495e")
          .marginBottom(6)
          .font("Inter Khmer"),
        Text(
          "• អនុវត្ត CI/CD pipeline ប្រំកម្ហយពេលវេលា deployment ពី 2 ម៉ោងទៅដល់ 15 នាទី",
        )
          .size(13)
          .color("#34495e")
          .font("Inter Khmer"),
      ),
    ).marginBottom(20),

    // Job 2
    Column(
      Row(
        Column(
          Text("វិស្វករ Full Stack")
            .size(16)
            .weight("bold")
            .font("Inter Khmer")
            .color("#2c3e50"),
          Text("ក្រុមហុន Digital Innovations Inc.")
            .size(14)
            .weight("500")
            .font("Inter Khmer")
            .color("#7f8c8d"),
        ).flex(1),

        Text("មីនា 2020 - ធ្នូ 2021")
          .size(14)
          .font("Inter Khmer")
          .color("#7f8c8d")
          .style("italic"),
      )
        .alignItems("flex-start")
        .marginBottom(12),

      Column(
        Text(
          "• បង្កើតវំបប្រើប្រាស់វ៉ែប responsive ដោយប្រើ React និង Node.js សម្រាប់អទិធជនទៅជាង 50+ រំទាម",
        )
          .size(13)
          .color("#34495e")
          .marginBottom(6)
          .font("Inter Khmer"),
        Text("• សរបរការជាមួយក្រុម UX ដើម្បីកែលម្អការចូលរួមរបស់អ្នកប្រើប្រាស់ដល់ 35%")
          .size(13)
          .color("#34495e")
          .marginBottom(6)
          .font("Inter Khmer"),
        Text("• អភិវឌ្ឍន៍ RESTful APIs និងទំនាក់ទំនងរបវត្ថបន្តុប្រាក់របស់រៀបាស់ទីបី")
          .size(13)
          .color("#34495e")
          .marginBottom(6)
          .font("Inter Khmer"),
        Text("• ចូលរួមក្នុងបិធី Agile និងការត្រាប់ទ្រង់ sprint សម្រាប់ក្រុមផ្ងេរជំនាញជ្រះរាល")
          .size(13)
          .color("#34495e")
          .font("Inter Khmer"),
      ),
    ).marginBottom(20),

    // Job 3
    Column(
      Row(
        Column(
          Text("វិស្វករកម្មវិធី")
            .size(16)
            .weight("bold")
            .font("Inter Khmer")
            .color("#2c3e50"),
          Text("ក្រុមហុន StartupVenture Labs")
            .size(14)
            .weight("500")
            .font("Inter Khmer")
            .color("#7f8c8d"),
        ).flex(1),

        Text("មិថុនា 2018 - កុម្ភះ 2020")
          .size(14)
          .font("Inter Khmer")
          .color("#7f8c8d")
          .style("italic"),
      )
        .alignItems("flex-start")
        .marginBottom(12),

      Column(
        Text("• អភិវឌ្ឍន៍ MVP សម្រាប់ម៉ន្ត platform ទិញដែលប្រើ Vue.js និង Python/Django")
          .size(13)
          .color("#34495e")
          .marginBottom(6)
          .font("Inter Khmer"),
        Text("• អនុវត្តការផ្ទាត់ព្រះអត្តសញ្ញាណអ្នកប្រើ ការឋាក់ប្រាក់ និងបាកាបែលពេលវេលាពិត")
          .size(13)
          .color("#34495e")
          .marginBottom(6)
          .font("Inter Khmer"),
        Text("• បង្ហាញប្រសិទ្ធផាព query មូលដ្ឋានទិន្នន័យដែលផ្តល់កែលម្អពេលផ្ទាត់ទំព័រដល់ 60%")
          .size(13)
          .color("#34495e")
          .font("Inter Khmer"),
      ),
    ),
  );
}

// Education and certifications
function EducationCertifications() {
  return Row(
    Column(
      SectionHeader("ការសិក្សា"),

      Column(
        Text("ម៉ាស្ធ័រវិទ្យាសាស្ត្រក្នុងខេតវិទ្យាសាស្ត្រកំភ្យូទ័រ")
          .size(14)
          .weight("bold")
          .font("Inter Khmer")
          .color("#2c3e50")
          .marginBottom(4),
        Text("សកលវិទ្យាល័យ Stanford")
          .size(13)
          .font("Inter Khmer")
          .color("#7f8c8d")
          .marginBottom(4),
        Text("2016 - 2018")
          .size(12)
          .font("Inter Khmer")
          .color("#95a5a6")
          .style("italic"),
      ).marginBottom(16),

      Column(
        Text("បក្កាលោរីគេវិទ្យាសាស្ត្រក្នុងខេតវិស្វកម្មកម្មវិធី")
          .size(14)
          .weight("bold")
          .font("Inter Khmer")
          .color("#2c3e50")
          .marginBottom(4),
        Text("សកលវិទ្យាល័យ California, Berkeley")
          .size(13)
          .font("Inter Khmer")
          .color("#7f8c8d")
          .marginBottom(4),
        Text("2012 - 2016")
          .size(12)
          .font("Inter Khmer")
          .color("#95a5a6")
          .style("italic"),
      ),
    ).flex(1),

    Column(
      SectionHeader("វិណ្ណបត្រ"),

      Column(
        Text("• AWS Solutions Architect Professional")
          .size(13)
          .color("#34495e")
          .marginBottom(6)
          .font("Inter Khmer"),
        Text("• វិណ្ណបត្រអ្នកគ្រប់គ្រង់ Kubernetes (CKA)")
          .size(13)
          .color("#34495e")
          .marginBottom(6)
          .font("Inter Khmer"),
        Text("• Google Cloud Professional Developer")
          .size(13)
          .color("#34495e")
          .marginBottom(6)
          .font("Inter Khmer"),
        Text("• វិណ្ណបត្រ Scrum Master (SMC)")
          .size(13)
          .color("#34495e")
          .font("Inter Khmer"),
      ),
    ).flex(1),
  ).gap(40);
}

// Key achievements section
function KeyAchievements() {
  return Column(
    SectionHeader("សម្រេចកម្មសំខាន់"),

    Row(
      Column(Text("🏆").size(24).alignSelf("center")).width(40),

      Column(
        Text("រង្វាន់នួគររម្ម 2023")
          .size(14)
          .weight("bold")
          .font("Inter Khmer")
          .color("#2c3e50")
          .marginBottom(4),
        Text(
          "ដឹកនាំការអភិវឌ្ឍន៍ប្រព័ន្ធបក្តិភ្ញាបសំណើរដោយ AI ដែលកែលម្អការរក្សាទុកអ្នកប្រើប្រាស់ដល់ 45%",
        )
          .size(13)
          .font("Inter Khmer")
          .color("#34495e"),
      ).flex(1),
    )
      .alignItems("flex-start")
      .marginBottom(12),

    Row(
      Column(Text("🚀").size(24).alignSelf("center")).width(40),

      Column(
        Text("ទ្ធផលប្រសិទ្ធផាពល្អអង់ 2022")
          .size(14)
          .weight("bold")
          .font("Inter Khmer")
          .color("#2c3e50")
          .marginBottom(4),
        Text(
          "រចនាស្ថាបត្យកម្មយុទ្ធសាស្ត្រប្តិនៅ cloud ដែលសេចក្តីប្រាក់ក្រុមហុនដល់ $200K ក្នុងមួយឆ្នាំសម្រាប់ចំណាយវិញទើសកម្ម",
        )
          .size(13)
          .font("Inter Khmer")
          .color("#34495e"),
      ).flex(1),
    )
      .alignItems("flex-start")
      .marginBottom(12),

    Row(
      Column(Text("👥").size(24).alignSelf("center")).width(40),

      Column(
        Text("ស្ងាណ់សម្រាប់ការដឹកនាំក្រុម 2021")
          .size(14)
          .weight("bold")
          .font("Inter Khmer")
          .color("#2c3e50")
          .marginBottom(4),
        Text("គ្រប់គ្រង់ក្រុមផ្ងេរជំនាញជ្រះរាលដោយជោគជ័យ 12 នាក់នៅក្រសួងពេលវេលាច្រើន 3 តំបន់")
          .size(13)
          .font("Inter Khmer")
          .color("#34495e"),
      ).flex(1),
    ).alignItems("flex-start"),
  );
}

// Main resume layout
const resume = Column(
  ResumeHeader(),

  Column(
    ProfessionalSummary(),
    TechnicalSkills(),
    WorkExperience(),
    EducationCertifications(),
    KeyAchievements(),
  )
    .gap(24)
    .padding(30),
)
  .size(850, "auto")
  .bg("white")
  .borderColor("#e9ecef")
  .borderWidth(1)
  .rounded(8);

console.log(JSON.stringify(resume, null, 2));

await writeCanvasToFile(resume, import.meta.url);
