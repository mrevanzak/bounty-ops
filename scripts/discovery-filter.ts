export type DiscoveryLike = {
  repo?: string;
  title?: string;
  labels?: string[];
  amount_usd?: string;
  created_at?: string;
  updated_at?: string;
  body?: string;
};

export type DiscoveryFilterConfig = {
  excludeRepos: string[];
  excludeTerms: string[];
  rejectReserved: boolean;
  rejectAssigned: boolean;
  requireExplicitUsdAmount: boolean;
  maxIssueAgeDays?: number;
  requireUpdatedWithinDays?: number;
};

export type DiscoveryFilterResult = { keep: true } | { keep: false; reason: string };

const DAY_MS = 24 * 60 * 60 * 1000;

export function shouldKeepDiscovery(
  discovery: DiscoveryLike,
  config: DiscoveryFilterConfig,
  now = new Date(),
): DiscoveryFilterResult {
  const repo = discovery.repo?.trim() ?? "";
  if (repo && config.excludeRepos.some((excluded) => sameText(excluded, repo))) {
    return { keep: false, reason: `excluded repo: ${repo}` };
  }

  const text = searchableText(discovery);
  const excludedTerm = config.excludeTerms.find((term) => term && text.includes(term.toLowerCase()));
  if (excludedTerm) return { keep: false, reason: `excluded term: ${excludedTerm}` };

  if (config.rejectReserved && /\breserv(?:ed|ation)\b/i.test(text)) {
    return { keep: false, reason: "reserved bounty" };
  }

  if (config.rejectAssigned && /\b(assign(?:ed|ment)?|claimed)\b/i.test(text)) {
    return { keep: false, reason: "assigned or claimed bounty" };
  }

  if (config.requireExplicitUsdAmount && !Number(discovery.amount_usd ?? 0)) {
    return { keep: false, reason: "missing explicit USD amount" };
  }

  const createdAt = parseDate(discovery.created_at);
  if (createdAt && config.maxIssueAgeDays !== undefined && ageDays(createdAt, now) > config.maxIssueAgeDays) {
    return { keep: false, reason: `issue older than ${config.maxIssueAgeDays} days` };
  }

  const updatedAt = parseDate(discovery.updated_at);
  if (updatedAt && config.requireUpdatedWithinDays !== undefined && ageDays(updatedAt, now) > config.requireUpdatedWithinDays) {
    return { keep: false, reason: `issue not updated within ${config.requireUpdatedWithinDays} days` };
  }

  return { keep: true };
}

export function parseDiscoveryFilterConfig(yaml: string): DiscoveryFilterConfig {
  const filters = sectionLines(yaml, "filters");
  return {
    excludeRepos: parseList(filters, "exclude_repos"),
    excludeTerms: parseList(filters, "exclude_terms"),
    rejectReserved: parseBoolean(filters, "reject_reserved", false),
    rejectAssigned: parseBoolean(filters, "reject_assigned", false),
    requireExplicitUsdAmount: parseBoolean(filters, "require_explicit_usd_amount", false),
    maxIssueAgeDays: parseNumber(filters, "max_issue_age_days"),
    requireUpdatedWithinDays: parseNumber(filters, "require_updated_within_days"),
  };
}

function searchableText(discovery: DiscoveryLike): string {
  return [discovery.title, discovery.body, ...(discovery.labels ?? [])]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

function sameText(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date;
}

function ageDays(then: Date, now: Date): number {
  return Math.floor((now.valueOf() - then.valueOf()) / DAY_MS);
}

function sectionLines(yaml: string, section: string): string[] {
  const lines = yaml.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `${section}:`);
  if (start === -1) return [];
  const result: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line) && line.trim().endsWith(":")) break;
    result.push(line);
  }
  return result;
}

function parseList(lines: string[], key: string): string[] {
  const start = lines.findIndex((line) => line.trim() === `${key}:`);
  if (start === -1) return [];
  const values: string[] = [];
  for (const line of lines.slice(start + 1)) {
    const item = line.match(/^\s+-\s+(.+)\s*$/)?.[1];
    if (item) {
      values.push(unquote(item));
      continue;
    }
    if (/^\s{2}\S/.test(line)) break;
  }
  return values;
}

function parseBoolean(lines: string[], key: string, fallback: boolean): boolean {
  const value = scalar(lines, key);
  if (value === undefined) return fallback;
  return value === "true";
}

function parseNumber(lines: string[], key: string): number | undefined {
  const value = scalar(lines, key);
  if (value === undefined || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function scalar(lines: string[], key: string): string | undefined {
  const value = lines.find((line) => line.trim().startsWith(`${key}:`))?.split(":").slice(1).join(":").trim();
  return value === undefined ? undefined : unquote(value);
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
