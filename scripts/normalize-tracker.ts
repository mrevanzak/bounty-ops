import fs from "node:fs";

const trackerPath = "data/bounties.tsv";
const header = fs.readFileSync("templates/tracker-header.tsv", "utf8").trim();
const headerColumns = header.split("\t");

if (!fs.existsSync(trackerPath)) {
  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync(trackerPath, `${header}\n`);
  process.exit(0);
}

const lines = fs.readFileSync(trackerPath, "utf8").split(/\r?\n/).filter(Boolean);
const rows = lines[0] === header ? lines.slice(1) : lines;
const seen = new Set<string>();
const normalized: string[] = [];

for (const row of rows) {
  const columns = row.split("\t");
  const id = columns[0] ?? "";
  const issueUrl = columns[5] ?? "";
  const key = issueUrl || id || row;

  if (seen.has(key)) continue;
  seen.add(key);

  while (columns.length < headerColumns.length) columns.push("");
  normalized.push(columns.slice(0, headerColumns.length).join("\t"));
}

fs.writeFileSync(
  trackerPath,
  `${header}\n${normalized.join("\n")}${normalized.length ? "\n" : ""}`,
);
console.log(`normalized ${normalized.length} bounty rows`);
