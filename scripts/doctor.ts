import fs from "node:fs";

const requiredFiles = [
  "AGENTS.md",
  "DATA_CONTRACT.md",
  "config/strategy.example.yml",
  "config/search.example.yml",
  "data/bounties.tsv",
  "templates/tracker-header.tsv",
  "templates/states.yml",
  "modes/scan.md",
  "modes/evaluate.md",
  "modes/rank.md",
  "modes/start.md",
  "modes/status.md",
];

let ok = true;

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`missing ${file}`);
    ok = false;
  }
}

if (fs.existsSync("data/bounties.tsv") && fs.existsSync("templates/tracker-header.tsv")) {
  const expectedHeader = fs.readFileSync("templates/tracker-header.tsv", "utf8").trim();
  const trackerText = fs.readFileSync("data/bounties.tsv", "utf8");
  const lines = trackerText.split(/\r?\n/).filter(Boolean);
  const actualHeader = lines[0]?.trim();

  if (actualHeader !== expectedHeader) {
    console.error("tracker header does not match templates/tracker-header.tsv");
    ok = false;
  }

  const expectedColumnCount = expectedHeader.split("\t").length;
  const validStates = new Set(
    fs
      .readFileSync("templates/states.yml", "utf8")
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*-\s+([a-z_]+)\s*$/)?.[1])
      .filter((state): state is string => Boolean(state)),
  );

  for (const [index, line] of lines.slice(1).entries()) {
    const lineNumber = index + 2;
    const columns = line.split("\t");

    if (columns.length !== expectedColumnCount) {
      console.error(
        `tracker row ${lineNumber} has ${columns.length} columns; expected ${expectedColumnCount}`,
      );
      ok = false;
    }

    const status = columns[1];
    if (status && !validStates.has(status)) {
      console.error(`tracker row ${lineNumber} has invalid status: ${status}`);
      ok = false;
    }
  }
}

if (!ok) process.exit(1);
console.log("bounty-ops doctor passed");
