import { Column, Row, Span, Text } from "../../src/core";
import { writeCanvasToFile } from "./utils.ts";

// Certificate Header with ornate styling
function CertificateHeader() {
  return Column(
    // Decorative top border pattern
    Row(
      Text("◆").size(24).color("#d4af37"),
      Text("◇").size(18).color("#b8860b").margin(0, 4),
      Text("◆").size(24).color("#d4af37"),
      Text("◇").size(18).color("#b8860b").margin(0, 4),
      Text("◆").size(24).color("#d4af37"),
      Text("◇").size(18).color("#b8860b").margin(0, 4),
      Text("◆").size(24).color("#d4af37"),
      Text("◇").size(18).color("#b8860b").margin(0, 4),
      Text("◆").size(24).color("#d4af37"),
    )
      .alignItems("center")
      .justifyContent("center")
      .marginBottom(20),

    // Main title with gradient and shadow
    Text("SONE CERTIFIED ACADEMY")
      .size(42)
      .weight("bold")
      .font("Inter Khmer")
      .color("linear-gradient(45deg, #d4af37, #ffd700, #b8860b)")
      .align("center")
      .dropShadow("3px 3px 6px rgba(0,0,0,0.3)")
      .strokeColor("#8b4513")
      .strokeWidth(1)
      .marginBottom(8),

    // Subtitle with elegant styling
    Text("CERTIFICATE OF ACHIEVEMENT")
      .size(16)
      .weight("500")
      .font("Inter Khmer")
      .color("#8b4513")
      .align("center")
      .letterSpacing(3)
      .marginBottom(4),

    // Year badge
    Text("2025")
      .size(20)
      .weight("bold")
      .font("Inter Khmer")
      .color("white")
      .bg("linear-gradient(135deg, #8b4513, #a0522d)")
      .padding(8, 16)
      .rounded(12)
      .alignSelf("center")
      .borderColor("#d4af37")
      .borderWidth(2)
      .dropShadow("2px 2px 4px rgba(0,0,0,0.2)"),
  );
}

// Decorative seal/emblem
function CertificateSeal() {
  return Column(
    // Outer ring
    Text("★")
      .size(80)
      .color("linear-gradient(45deg, #d4af37, #ffd700)")
      .alignSelf("center")
      .dropShadow("4px 4px 8px rgba(0,0,0,0.3)")
      .strokeColor("#8b4513")
      .strokeWidth(2),

    // Academy emblem text
    Text("SONE")
      .size(18)
      .weight("bold")
      .font("Inter Khmer")
      .color("#8b4513")
      .align("center")
      .offsetY(-45),

    Text("ACADEMY")
      .size(10)
      .weight("500")
      .font("Inter Khmer")
      .color("#8b4513")
      .align("center")
      .offsetY(-40)
      .letterSpacing(1),
  );
}

// Main certificate content
function CertificateContent() {
  return Column(
    // "This is to certify that" text
    Text("This is to certify that")
      .size(18)
      .font("Inter Khmer")
      .color("#2c2c2c")
      .align("center")
      .style("italic")
      .marginBottom(20),

    // Student name field with decorative underline
    Column(
      Text("LEAV CHANDARA")
        .size(36)
        .weight("bold")
        .font("Inter Khmer")
        .color("linear-gradient(45deg, #1e3a8a, #3b82f6)")
        .align("center")
        .dropShadow("2px 2px 4px rgba(0,0,0,0.2)")
        .marginBottom(8),

      // Decorative underline
      Row(
        Text("―").size(24).color("#d4af37"),
        Text("―").size(24).color("#d4af37"),
        Text("◆").size(16).color("#8b4513"),
        Text("―").size(24).color("#d4af37"),
        Text("―").size(24).color("#d4af37"),
        Text("◆").size(16).color("#8b4513"),
        Text("―").size(24).color("#d4af37"),
        Text("―").size(24).color("#d4af37"),
      )
        .justifyContent("center")
        .gap(2),
    ).marginBottom(25),

    // Achievement description
    Text(
      "has successfully completed the comprehensive program in",
      Span(" Advanced Software Architecture & Design Patterns")
        .weight("bold")
        .color("#8b4513")
        .highlight("rgba(255, 215, 0, 0.2)"),
      " and has demonstrated exceptional proficiency in modern development methodologies, ",
      Span("system design principles").weight("bold").color("#8b4513"),
      ", and leadership skills required for senior-level software engineering roles.",
    )
      .size(16)
      .font("Inter Khmer")
      .color("#2c2c2c")
      .align("center")
      .lineHeight(1.5)
      .maxWidth(600)
      .alignSelf("center")
      .marginBottom(30),

    // Skills and competencies section
    Column(
      Text("CORE COMPETENCIES ACHIEVED:")
        .size(14)
        .weight("bold")
        .font("Inter Khmer")
        .color("#8b4513")
        .align("center")
        .letterSpacing(1)
        .marginBottom(12),

      Row(
        Column(
          Text("• Microservices Architecture").size(12).color("#2c2c2c"),
          Text("• Cloud-Native Development").size(12).color("#2c2c2c"),
          Text("• DevOps & CI/CD Pipelines").size(12).color("#2c2c2c"),
          Text("• Database Design & Optimization").size(12).color("#2c2c2c"),
        )
          .gap(4)
          .flex(1),

        Column(
          Text("• API Design & Documentation").size(12).color("#2c2c2c"),
          Text("• Security Best Practices").size(12).color("#2c2c2c"),
          Text("• Performance Optimization").size(12).color("#2c2c2c"),
          Text("• Technical Leadership").size(12).color("#2c2c2c"),
        )
          .gap(4)
          .flex(1),
      )
        .gap(40)
        .justifyContent("center"),
    )
      .bg("rgba(255, 255, 255, 0.8)")
      .padding(20)
      .rounded(12)
      .borderColor("#d4af37")
      .borderWidth(1)
      .marginBottom(30),
  );
}

// Certificate footer with signatures and date
function CertificateFooter() {
  return Column(
    // Date and location
    Row(
      Column(
        Text("Issued on this day").size(12).color("#666").align("center"),
        Text("March 15, 2025")
          .size(16)
          .weight("bold")
          .color("#8b4513")
          .align("center"),
      ).flex(1),

      Column(
        Text("At").size(12).color("#666").align("center"),
        Text("Sone Academy Headquarters")
          .size(16)
          .weight("bold")
          .color("#8b4513")
          .align("center"),
      ).flex(1),
    ).marginBottom(30),

    // Signature section
    Row(
      Column(
        Text("Dr. Seanghay Yath")
          .size(16)
          .weight("bold")
          .color("#2c2c2c")
          .align("center"),
        Text("―――――――――――").size(14).color("#8b4513").align("center"),
        Text("Academy Director").size(12).color("#666").align("center"),
      ).flex(1),

      // Seal placement
      CertificateSeal(),

      Column(
        Text("Prof. Torn Kanan")
          .size(16)
          .weight("bold")
          .color("#2c2c2c")
          .align("center"),
        Text("―――――――――――").size(14).color("#8b4513").align("center"),
        Text("Chief Technology Officer").size(12).color("#666").align("center"),
      ).flex(1),
    ),

    // Certificate ID
    Text("Certificate ID: SCA-2025-ADV-001247")
      .size(10)
      .color("#999")
      .align("center")
      .marginTop(20)
      .font("Inter Khmer"),

    // Bottom decorative border
    Row(
      Text("◆").size(20).color("#d4af37"),
      Text("◇").size(16).color("#b8860b").margin(0, 3),
      Text("◆").size(20).color("#d4af37"),
      Text("◇").size(16).color("#b8860b").margin(0, 3),
      Text("◆").size(20).color("#d4af37"),
      Text("◇").size(16).color("#b8860b").margin(0, 3),
      Text("◆").size(20).color("#d4af37"),
    )
      .alignItems("center")
      .justifyContent("center")
      .marginTop(20),
  );
}

// Main certificate layout
const certificate = Column(
  CertificateHeader(),
  CertificateContent(),
  CertificateFooter(),
)
  .size(1200, 900)
  .bg("linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #f8f9fa 100%)")
  .padding(60)
  .borderColor("#d4af37")
  .borderWidth(8)
  .rounded(16)
  .cornerSmoothing(0.6);

await writeCanvasToFile(certificate, import.meta.url);
