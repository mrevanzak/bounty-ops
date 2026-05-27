import fs from "node:fs";

const trackerPath = "data/bounties.tsv";

if (!fs.existsSync(trackerPath)) {
  console.error("missing data/bounties.tsv");
  process.exit(1);
}

const lines = fs.readFileSync(trackerPath, "utf8").trimEnd().split(/\r?\n/).filter(Boolean);
if (lines.length === 0) {
  console.log("No bounty tracker found.");
  process.exit(0);
}

const header = lines[0]!.split("\t");
const columnIndex = Object.fromEntries(header.map((name, index) => [name, index])) as Record<string, number>;
const rows = lines.slice(1).map((line) => {
  const columns = line.split("\t");
  while (columns.length < header.length) columns.push("");
  return columns;
});

function value(row: string[], column: string): string {
  return row[columnIndex[column]] ?? "";
}

function numeric(row: string[], column: string): number {
  const parsed = Number(value(row, column));
  return Number.isFinite(parsed) ? parsed : 0;
}

function shortTitle(title: string, max = 70): string {
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

const grouped = new Map<string, string[][]>();
for (const row of rows) {
  const status = value(row, "status") || "unknown";
  const existing = grouped.get(status) ?? [];
  existing.push(row);
  grouped.set(status, existing);
}

console.log("Bounty Ops Status");
console.log("=================");
console.log(`Total tracked: ${rows.length}`);

if (rows.length === 0) {
  console.log("Next action: run bun run scan:github, then bun run import.");
  process.exit(0);
}

console.log("\nBy status:");
for (const [status, statusRows] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  console.log(`- ${status}: ${statusRows.length}`);
}

const topRows = [...rows]
  .sort((a, b) => numeric(b, "expected_value") - numeric(a, "expected_value"))
  .slice(0, 5);

console.log("\nTop expected value:");
for (const row of topRows) {
  const expectedValue = value(row, "expected_value") || "n/a";
  const amount = value(row, "amount_usd") ? `$${value(row, "amount_usd")}` : "amount unknown";
  console.log(
    `- ${value(row, "id")} [${value(row, "status")}] EV ${expectedValue}, ${amount}: ${shortTitle(value(row, "title"))}`,
  );
}

const staleRows = rows
  .filter((row) => value(row, "next_action"))
  .sort((a, b) => value(a, "updated_at").localeCompare(value(b, "updated_at")))
  .slice(0, 5);

console.log("\nNext actions:");
for (const row of staleRows) {
  console.log(`- ${value(row, "id")}: ${value(row, "next_action")}`);
}
