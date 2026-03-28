import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Column, PageBreak, Row, sone, Text } from "../../src/node.ts";

const dir = path.dirname(fileURLToPath(import.meta.url));

// ── Palette ───────────────────────────────────────────────────────────────────
const INK = "#0f172a";
const MUTED = "#64748b";
const ACCENT = "#2563eb";
const RULE = "#e2e8f0";

// ── Helpers ───────────────────────────────────────────────────────────────────
const heading = (t: string) =>
  Text(t).size(16).weight("bold").color(INK).marginBottom(6);

const body = (t: string) => Text(t).size(13).color("#334155").lineHeight(1.65);

const label = (t: string) =>
  Row(Text(t).size(10).weight("bold").color("white"))
    .bg(ACCENT)
    .padding(3, 8)
    .rounded(4)
    .alignSelf("flex-start");

// ── Sections ─────────────────────────────────────────────────────────────────

// Section A: fills most of the first page so the long paragraph below straddles
const sectionA = Column(
  label("SECTION A"),
  heading("Background & Motivation"),
  body(
    "The rapid advancement of distributed computing has introduced new paradigms for " +
      "data processing at scale. Modern enterprises routinely handle petabyte-scale " +
      "workloads that span dozens of geographic regions, requiring sophisticated " +
      "orchestration layers capable of tolerating partial failures while maintaining " +
      "strict consistency guarantees.",
  ),
  body(
    "Traditional monolithic architectures struggle to accommodate these requirements " +
      "because the coupling between compute, storage, and network resources creates " +
      "cascading failure modes that are difficult to reason about in isolation. Micro-" +
      "service decomposition offers a partial solution but introduces its own complexity " +
      "around service discovery, load balancing, and distributed tracing.",
  ),
  body(
    "This report surveys the current landscape of coordination protocols — from classic " +
      "two-phase commit to modern consensus algorithms — and evaluates their suitability " +
      "for deployment in heterogeneous, multi-cloud environments where latency can vary " +
      "by orders of magnitude and network partitions must be treated as normal operating " +
      "conditions rather than exceptional events.",
  ),
)
  .bg("white")
  .padding(24, 28)
  .gap(10)
  .borderWidth(1)
  .borderColor(RULE);

// Section B: a long paragraph that will straddle the page boundary
// The text rendering should split cleanly at a line boundary — no half-lines
const sectionB = Column(
  label("SECTION B"),
  heading("Detailed Analysis — Consensus Protocols"),
  body(
    "The Paxos algorithm, originally described by Leslie Lamport in 1989, remains the " +
      "theoretical foundation for most production consensus systems. Its core insight — " +
      "that agreement can be reached in the presence of message loss and node failures " +
      "as long as a strict majority of nodes remain reachable — has proven remarkably " +
      "durable. However, Paxos in its basic form is notoriously difficult to implement " +
      "correctly, and the gap between the paper description and a production-ready " +
      "implementation is wide enough that most teams opt for higher-level abstractions.",
  ),
  body(
    "Raft, introduced by Ongaro and Ousterhout in 2014, was explicitly designed to be " +
      "more understandable than Paxos while providing equivalent safety guarantees. It " +
      "decomposes the consensus problem into three relatively independent sub-problems: " +
      "leader election, log replication, and safety. This decomposition makes it easier " +
      "to reason about each component in isolation, although the overall system is " +
      "still a complex piece of distributed machinery.",
  ),
  body(
    "Multi-Paxos, used internally by Google's Chubby and Spanner services, extends " +
      "basic Paxos with a persistent leader that can skip the first phase for subsequent " +
      "log entries, significantly reducing message complexity in the common case. The " +
      "challenge with multi-Paxos is that leader failures require a full view change " +
      "that can take hundreds of milliseconds to complete, during which writes are " +
      "blocked. For latency-sensitive workloads this is often unacceptable.",
  ),
  body(
    "Byzantine fault-tolerant protocols such as PBFT and HotStuff offer stronger " +
      "guarantees by tolerating malicious nodes in addition to crash failures. These " +
      "are primarily used in permissioned blockchain networks and financial settlement " +
      "systems where the threat model includes adversarial participants. The message " +
      "complexity of BFT protocols grows quadratically with the number of replicas, " +
      "which limits practical deployment to relatively small clusters of trusted nodes.",
  ),
)
  .bg("white")
  .padding(24, 28)
  .gap(10)
  .borderWidth(1)
  .borderColor(RULE);

// Section C: after a forced break
const sectionC = Column(
  label("SECTION C"),
  heading("Implementation Considerations"),
  body(
    "When selecting a consensus algorithm for a new system, the choice should be " +
      "driven primarily by the failure model and the acceptable trade-offs between " +
      "consistency, availability, and partition tolerance. There is no universally " +
      "correct answer — the CAP theorem guarantees that trade-offs must be made.",
  ),
  body(
    "For most OLTP workloads, Raft provides the best balance of correctness, " +
      "understandability, and operational simplicity. Libraries such as etcd's raft " +
      "package and HashiCorp's raft library have been production-hardened over many " +
      "years and are generally preferred over custom implementations.",
  ),
  Row(
    Column(
      Text("Latency (p99)").size(11).color(MUTED).marginBottom(4),
      Text("< 5 ms").size(22).weight("bold").color(ACCENT),
    )
      .bg("#eff6ff")
      .padding(14, 18)
      .flex(1),
    Column(
      Text("Throughput").size(11).color(MUTED).marginBottom(4),
      Text("180k ops/s").size(22).weight("bold").color(INK),
    )
      .bg("#f8fafc")
      .padding(14, 18)
      .flex(1),
    Column(
      Text("Replicas").size(11).color(MUTED).marginBottom(4),
      Text("3 → 5 → 7").size(22).weight("bold").color(INK),
    )
      .bg("#f8fafc")
      .padding(14, 18)
      .flex(1),
  ).gap(8),
)
  .bg("white")
  .padding(24, 28)
  .gap(10)
  .borderWidth(1)
  .borderColor(RULE);

// ── Root ──────────────────────────────────────────────────────────────────────
const root = Column(sectionA, sectionB, PageBreak(), sectionC)
  .width(680)
  .bg("#f8fafc")
  .gap(2);

// ── Render ────────────────────────────────────────────────────────────────────
const PAGE_HEIGHT = 700;

const header = Row(
  Text("Distributed Systems Review — Confidential")
    .size(11)
    .weight("bold")
    .color("white"),
  Text("Internal Draft")
    .size(10)
    .color("rgba(255,255,255,0.6)")
    .alignSelf("center"),
)
  .bg("#1e3a5f")
  .padding(10, 20)
  .justifyContent("space-between");

const footer = Row(
  Text("For internal use only. Do not distribute.").size(10).color(MUTED),
  Text("© 2025 Atlas Meridian").size(10).color(MUTED),
)
  .bg("#f1f5f9")
  .padding(8, 20)
  .justifyContent("space-between")
  .borderWidth(1, 0, 0, 0)
  .borderColor(RULE);

const pages = await sone(root, {
  pageHeight: PAGE_HEIGHT,
  header,
  footer,
}).pages();

for (let i = 0; i < pages.length; i++) {
  const buf = await pages[i].toBuffer("jpg", { density: 1 });
  const outPath = path.join(dir, `pages-3-p${i + 1}.jpg`);
  await fs.writeFile(outPath, buf);
  console.log(
    `  page ${i + 1}: ${pages[i].width}×${pages[i].height}  →  ${outPath}`,
  );
}

console.log(`\nTotal: ${pages.length} pages`);
