import { Column, Text } from "../../src/node.ts";
import { writeCanvasToFile } from "./utils.ts";

const T = 380;

function entry(title: string, page: number) {
  return Text(`${title}\t${page}`).tabStops(T).tabLeader(".").size(13);
}

function partHeading(label: string) {
  return Text(label)
    .size(11)
    .weight("bold")
    .color("#888888")
    .marginTop(14)
    .marginBottom(2);
}

const root = Column(
  // Book title block
  Column(
    Text("The Art of Quiet Design").size(22).weight("bold").color("#1a1a2e"),
    Text("A Practitioner's Handbook").size(12).color("#555555").marginTop(2),
  ).marginBottom(24),

  Text("CONTENTS")
    .size(14)
    .weight("bold")
    .color("#000")
    .letterSpacing(3)
    .marginBottom(12),

  // Front matter
  partHeading("FRONT MATTER"),
  entry("   Foreword", 7),
  entry("   Preface", 9),
  entry("   How to Use This Book", 11),

  // Part I
  partHeading("PART I — FOUNDATIONS"),
  Text("1. The Principle of Reduction\t15")
    .tabStops(T)
    .tabLeader(".")
    .size(13)
    .weight("bold"),
  entry("   Less as a Strategy", 18),
  entry("   The Cost of Complexity", 22),
  entry("   Quiet vs. Minimal", 26),
  Text("2. Visual Hierarchy\t31")
    .tabStops(T)
    .tabLeader(".")
    .size(13)
    .weight("bold"),
  entry("   Type Scale and Rhythm", 34),
  entry("   Spacing as Structure", 38),
  entry("   Colour and Weight", 43),
  Text("3. Typography at Rest\t49")
    .tabStops(T)
    .tabLeader(".")
    .size(13)
    .weight("bold"),
  entry("   Choosing a Typeface", 52),
  entry("   Line Length and Leading", 57),
  entry("   Punctuation and Detail", 62),

  // Part II
  partHeading("PART II — PROCESS"),
  Text("4. Constraints as Creativity\t69")
    .tabStops(T)
    .tabLeader(".")
    .size(13)
    .weight("bold"),
  entry("   The Brief as Canvas", 72),
  entry("   Working Within Limits", 76),
  Text("5. Iteration and Restraint\t83")
    .tabStops(T)
    .tabLeader(".")
    .size(13)
    .weight("bold"),
  entry("   When to Stop", 86),
  entry("   Editing for Silence", 91),

  // Part III
  partHeading("PART III — PRACTICE"),
  Text("6. Print and Page\t99")
    .tabStops(T)
    .tabLeader(".")
    .size(13)
    .weight("bold"),
  entry("   Grids and White Space", 102),
  entry("   Paper and Ink", 108),
  Text("7. Screen and Motion\t115")
    .tabStops(T)
    .tabLeader(".")
    .size(13)
    .weight("bold"),
  entry("   Density and Scroll", 118),
  entry("   Animation with Purpose", 124),
  Text("8. Systems and Tokens\t131")
    .tabStops(T)
    .tabLeader(".")
    .size(13)
    .weight("bold"),
  entry("   Design Tokens in Practice", 135),
  entry("   Consistency Without Rigidity", 141),

  // Back matter
  partHeading("BACK MATTER"),
  entry("   Notes", 149),
  entry("   Bibliography", 153),
  entry("   Index", 159),
  entry("   About the Author", 163),
)
  .padding(40)
  .width(520)
  .gap(4)
  .bg("white");

await writeCanvasToFile(root, import.meta.url);
