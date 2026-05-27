import fs from "node:fs";

const trackerPath = "data/bounties.tsv";

if (!fs.existsSync(trackerPath)) {
  console.error("missing data/bounties.tsv");
  process.exit(1);
}

const text = fs.readFileSync(trackerPath, "utf8").trimEnd();
const lines = text ? text.split(/\r?\n/) : [];
if (lines.length === 0) process.exit(0);

const header = lines[0]!.split("\t");
const columnIndex = Object.fromEntries(header.map((name, index) => [name, index])) as Record<
  string,
  number
>;

function numeric(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const rows = lines.slice(1).map((line) => {
  const columns = line.split("\t");
  while (columns.length < header.length) columns.push("");

  const amount = numeric(columns[columnIndex.amount_usd]);
  const amountWeight = Math.min(10, amount / 100);
  const score =
    amountWeight +
    numeric(columns[columnIndex.fit_score]) * 2.0 +
    numeric(columns[columnIndex.payout_score]) * 1.5 +
    numeric(columns[columnIndex.repo_score]) * 1.2 +
    numeric(columns[columnIndex.competition_score]) * 1.2 +
    numeric(columns[columnIndex.timebox_score]) * 1.4;

  columns[columnIndex.expected_value] = score ? score.toFixed(2) : "";
  return columns.join("\t");
});

fs.writeFileSync(trackerPath, `${header.join("\t")}\n${rows.join("\n")}${rows.length ? "\n" : ""}`);
console.log(`scored ${rows.length} bounty rows`);
