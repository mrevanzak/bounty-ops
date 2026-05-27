import fs from "node:fs";
import path from "node:path";
import { parseDiscoveryFilterConfig, shouldKeepDiscovery } from "./discovery-filter";

type Discovery = {
  title?: string;
  repo?: string;
  issue_url?: string;
  bounty_url?: string;
  source?: string;
  labels?: string[];
  amount_usd?: string;
  body?: string;
  created_at?: string;
  updated_at?: string;
};

const trackerPath = "data/bounties.tsv";
const headerPath = "templates/tracker-header.tsv";
const discoveriesDir = "data/discoveries";
const searchConfigPath = fs.existsSync("config/search.yml") ? "config/search.yml" : "config/search.example.yml";
const header = fs.readFileSync(headerPath, "utf8").trim();
const filterConfig = parseDiscoveryFilterConfig(fs.readFileSync(searchConfigPath, "utf8"));
const columns = header.split("\t");
const columnIndex = Object.fromEntries(columns.map((name, index) => [name, index])) as Record<string, number>;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function readTracker(): string[][] {
  if (!fs.existsSync(trackerPath)) return [];
  const lines = fs.readFileSync(trackerPath, "utf8").trimEnd().split(/\r?\n/).filter(Boolean);
  const rows = lines[0] === header ? lines.slice(1) : lines;
  return rows.map((row) => {
    const values = row.split("\t");
    while (values.length < columns.length) values.push("");
    return values.slice(0, columns.length);
  });
}

function listDiscoveryFiles(): string[] {
  if (!fs.existsSync(discoveriesDir)) return [];
  return fs
    .readdirSync(discoveriesDir)
    .filter((file) => file.endsWith(".jsonl"))
    .sort()
    .map((file) => path.join(discoveriesDir, file));
}

function readDiscoveries(): Discovery[] {
  const discoveries: Discovery[] = [];
  for (const file of listDiscoveryFiles()) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
    for (const [index, line] of lines.entries()) {
      try {
        discoveries.push(JSON.parse(line) as Discovery);
      } catch (error) {
        throw new Error(`invalid JSON in ${file}:${index + 1}: ${(error as Error).message}`);
      }
    }
  }
  return discoveries;
}

function nextId(rows: string[][]): string {
  const highest = rows.reduce((max, row) => {
    const match = row[columnIndex.id]?.match(/^BNTY-(\d{4})$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `BNTY-${String(highest + 1).padStart(4, "0")}`;
}

function priorityForAmount(amount: string | undefined): string {
  const value = Number(amount ?? 0);
  if (value >= 500) return "high";
  if (value >= 100) return "medium";
  return "low";
}

function rowFromDiscovery(discovery: Discovery, id: string): string[] {
  const row = Array.from({ length: columns.length }, () => "");
  row[columnIndex.id] = id;
  row[columnIndex.status] = "discovered";
  row[columnIndex.priority] = priorityForAmount(discovery.amount_usd);
  row[columnIndex.title] = sanitize(discovery.title ?? "");
  row[columnIndex.repo] = sanitize(discovery.repo ?? "");
  row[columnIndex.issue_url] = sanitize(discovery.issue_url ?? "");
  row[columnIndex.bounty_url] = sanitize(discovery.bounty_url ?? "");
  row[columnIndex.platform] = sanitize(discovery.source ?? "github");
  row[columnIndex.amount_usd] = sanitize(discovery.amount_usd ?? "");
  row[columnIndex.currency] = discovery.amount_usd ? "USD" : "";
  row[columnIndex.labels] = sanitize((discovery.labels ?? []).join(","));
  row[columnIndex.discovered_at] = today();
  row[columnIndex.updated_at] = today();
  row[columnIndex.next_action] = "evaluate payout clarity, issue scope, repo health, and competition";
  row[columnIndex.notes] = discovery.updated_at ? `github updated ${discovery.updated_at}` : "imported from github discovery";
  return row;
}

function sanitize(value: string): string {
  return value.replace(/[\t\r\n]+/g, " ").trim();
}

const rows = readTracker();
const seenIssueUrls = new Set(rows.map((row) => row[columnIndex.issue_url]).filter(Boolean));
let nextNumericId = Number(nextId(rows).slice("BNTY-".length));
let imported = 0;
let filtered = 0;

for (const discovery of readDiscoveries()) {
  const issueUrl = discovery.issue_url?.trim();
  if (!issueUrl || seenIssueUrls.has(issueUrl)) continue;
  const filterResult = shouldKeepDiscovery(discovery, filterConfig);
  if (!filterResult.keep) {
    filtered += 1;
    continue;
  }

  const id = `BNTY-${String(nextNumericId).padStart(4, "0")}`;
  nextNumericId += 1;
  rows.push(rowFromDiscovery(discovery, id));
  seenIssueUrls.add(issueUrl);
  imported += 1;
}

fs.writeFileSync(trackerPath, `${header}\n${rows.map((row) => row.join("\t")).join("\n")}${rows.length ? "\n" : ""}`);
console.log(`imported ${imported} bounty discoveries (${filtered} filtered)`);
