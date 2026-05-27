import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { parseDiscoveryFilterConfig, shouldKeepDiscovery } from "./discovery-filter";

type SearchQuery = {
  name: string;
  query: string;
  limit: number;
};

type Discovery = {
  source: "github";
  query_name: string;
  query: string;
  title: string;
  repo: string;
  issue_url: string;
  labels: string[];
  state: string;
  created_at: string;
  updated_at: string;
  bounty_url: string;
  amount_usd: string;
  body: string;
};

const configPath = fs.existsSync("config/search.yml")
  ? "config/search.yml"
  : "config/search.example.yml";
const discoveriesDir = "data/discoveries";

function parseQueries(yaml: string): SearchQuery[] {
  const lines = yaml.split(/\r?\n/);
  const queries: SearchQuery[] = [];
  let inQueries = false;
  let current: Partial<SearchQuery> | null = null;

  for (const line of lines) {
    if (line.startsWith("github_issue_queries:")) {
      inQueries = true;
      continue;
    }

    if (inQueries && /^\S/.test(line) && !line.startsWith("github_issue_queries:")) break;
    if (!inQueries) continue;

    const name = line.match(/^\s*-\s+name:\s*(.+)\s*$/)?.[1];
    if (name) {
      if (current?.name && current.query) queries.push({ name: current.name, query: current.query, limit: current.limit ?? 50 });
      current = { name: unquote(name), limit: 50 };
      continue;
    }

    const query = line.match(/^\s+query:\s*(.+)\s*$/)?.[1];
    if (query && current) {
      current.query = unquote(query);
      continue;
    }

    const limit = line.match(/^\s+limit:\s*(\d+)\s*$/)?.[1];
    if (limit && current) current.limit = Number(limit);
  }

  if (current?.name && current.query) queries.push({ name: current.name, query: current.query, limit: current.limit ?? 50 });
  return queries;
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function extractRepo(url: string): string {
  const match = url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\//);
  return match?.[1] ?? "";
}

function extractBountyUrl(text: string): string {
  return text.match(/https?:\/\/[^\s)]+(?:algora|polar|issuehunt|gitcoin)[^\s)]*/i)?.[0] ?? "";
}

function extractAmount(text: string): string {
  const amount = text.match(/(?:\$|USD\s*)(\d[\d,]*(?:\.\d{1,2})?)/i)?.[1];
  return amount ? amount.replaceAll(",", "") : "";
}

function normalizeGhIssue(raw: unknown, query: SearchQuery): Discovery | null {
  if (!raw || typeof raw !== "object") return null;
  const issue = raw as Record<string, unknown>;
  const url = String(issue.url ?? "");
  const title = String(issue.title ?? "");
  const body = String(issue.body ?? "");
  const labels = Array.isArray(issue.labels)
    ? issue.labels.map((label) => String(label)).filter(Boolean)
    : [];

  if (!url || !title) return null;

  const searchableText = `${title}\n${body}\n${labels.join(" ")}`;
  return {
    source: "github",
    query_name: query.name,
    query: query.query,
    title,
    repo: extractRepo(url),
    issue_url: url,
    labels,
    state: String(issue.state ?? ""),
    created_at: String(issue.createdAt ?? issue.created_at ?? ""),
    updated_at: String(issue.updatedAt ?? issue.updated_at ?? ""),
    bounty_url: extractBountyUrl(searchableText),
    amount_usd: extractAmount(searchableText),
    body,
  };
}

function ghAvailable(): boolean {
  return spawnSync("gh", ["--version"], { encoding: "utf8" }).status === 0;
}

if (!ghAvailable()) {
  console.error("GitHub scanner requires the gh CLI. Install/authenticate gh, then run bun run scan:github.");
  process.exit(2);
}

const queries = parseQueries(fs.readFileSync(configPath, "utf8"));
const filterConfig = parseDiscoveryFilterConfig(fs.readFileSync(configPath, "utf8"));
if (queries.length === 0) {
  console.error(`no github_issue_queries found in ${configPath}`);
  process.exit(1);
}

fs.mkdirSync(discoveriesDir, { recursive: true });
const outputPath = `${discoveriesDir}/${today()}-github.jsonl`;
const seen = new Set<string>();
const discoveries: Discovery[] = [];
let filtered = 0;

for (const query of queries) {
  const result = spawnSync(
    "gh",
    [
      "search",
      "issues",
      query.query,
      "--json",
      "title,url,labels,state,createdAt,updatedAt,body",
      "--limit",
      String(query.limit),
    ],
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    console.error(`gh search failed for ${query.name}: ${result.stderr.trim() || result.stdout.trim()}`);
    process.exit(result.status ?? 1);
  }

  const issues = JSON.parse(result.stdout || "[]") as unknown[];
  for (const issue of issues) {
    const discovery = normalizeGhIssue(issue, query);
    if (!discovery || seen.has(discovery.issue_url)) continue;
    const filterResult = shouldKeepDiscovery(discovery, filterConfig);
    if (!filterResult.keep) {
      filtered += 1;
      continue;
    }
    seen.add(discovery.issue_url);
    discoveries.push(discovery);
  }
}

fs.writeFileSync(outputPath, discoveries.map((discovery) => JSON.stringify(discovery)).join("\n") + (discoveries.length ? "\n" : ""));
console.log(`wrote ${discoveries.length} GitHub discoveries to ${outputPath} (${filtered} filtered)`);
