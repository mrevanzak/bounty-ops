import fs from "node:fs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  type BountyPlatform,
  type GitHubQuery,
  type OnboardingAnswers,
  buildSearchConfig,
  buildStrategyConfig,
  defaultOnboardingAnswers,
  planConfigWrite,
} from "./onboarding-config";

const rl = readline.createInterface({ input, output });

async function main() {
  console.log("Bounty-Ops setup wizard");
  console.log("Press Enter to accept defaults. Existing config files are preserved by default.\n");

  const defaults = defaultOnboardingAnswers();
  const answers: OnboardingAnswers = {
    ...defaults,
    minimumAmountUsd: await askNumber("Minimum bounty amount USD", defaults.minimumAmountUsd),
    preferredAmountUsd: await askNumber("Preferred bounty amount USD", defaults.preferredAmountUsd),
    maxActiveBounties: await askNumber("Max active bounties", defaults.maxActiveBounties),
    maxResearchMinutesBeforeDecision: await askNumber(
      "Max research minutes before deciding",
      defaults.maxResearchMinutesBeforeDecision,
    ),
    maxExpectedFixHours: await askNumber("Max expected fix hours", defaults.maxExpectedFixHours),
    defaultDecisionThreshold: await askNumber("Default decision threshold", defaults.defaultDecisionThreshold),
    prefer: await askList("Preferred work types", defaults.prefer),
    avoid: await askList("Avoid work types", defaults.avoid),
    enabledPlatforms: await askPlatforms(defaults.enabledPlatforms),
    githubQueries: await askQueries(defaults.githubQueries),
    includeRepos: await askList("Include repos filter", defaults.includeRepos),
    excludeRepos: await askList("Exclude repos filter", defaults.excludeRepos),
    includeLanguages: await askList("Include languages filter", defaults.includeLanguages),
    excludeLanguages: await askList("Exclude languages filter", defaults.excludeLanguages),
    minimumSearchAmountUsd: await askNumber("Discovery minimum amount USD", defaults.minimumSearchAmountUsd),
  };

  await writeConfig("config/strategy.yml", buildStrategyConfig(answers));
  await writeConfig("config/search.yml", buildSearchConfig(answers));

  console.log("\nSetup finished. Run: bun run doctor");
  rl.close();
}

async function askNumber(label: string, defaultValue: number): Promise<number> {
  const answer = await rl.question(`${label} [${defaultValue}]: `);
  if (!answer.trim()) return defaultValue;
  const value = Number(answer);
  if (Number.isFinite(value) && value >= 0) return value;
  console.log("Enter a non-negative number.");
  return askNumber(label, defaultValue);
}

async function askList(label: string, defaultValue: string[]): Promise<string[]> {
  const shown = defaultValue.length ? defaultValue.join(", ") : "none";
  const answer = await rl.question(`${label} comma-separated [${shown}]: `);
  if (!answer.trim()) return defaultValue;
  if (answer.trim().toLowerCase() === "none") return [];
  return answer
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function askPlatforms(defaultValue: BountyPlatform[]): Promise<BountyPlatform[]> {
  const valid: BountyPlatform[] = ["algora", "polar", "issuehunt", "gitcoin"];
  const answer = await rl.question(`Enabled bounty platforms comma-separated [${defaultValue.join(", ")}]: `);
  if (!answer.trim()) return defaultValue;
  const selected = answer
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is BountyPlatform => valid.includes(item as BountyPlatform));
  if (selected.length > 0) return selected;
  console.log(`Choose one or more of: ${valid.join(", ")}`);
  return askPlatforms(defaultValue);
}

async function askQueries(defaultValue: GitHubQuery[]): Promise<GitHubQuery[]> {
  const answer = await rl.question("Use default GitHub discovery queries? [Y/n]: ");
  if (!answer.trim() || answer.trim().toLowerCase().startsWith("y")) return defaultValue;

  const queries: GitHubQuery[] = [];
  while (true) {
    const name = await rl.question("Query name (blank to finish): ");
    if (!name.trim()) break;
    const query = await rl.question("GitHub issue search query: ");
    if (!query.trim()) {
      console.log("Query text is required.");
      continue;
    }
    const limit = await askNumber("Result limit", 50);
    queries.push({ name: name.trim(), query: query.trim(), limit });
  }

  return queries.length ? queries : defaultValue;
}

async function writeConfig(path: string, contents: string) {
  fs.mkdirSync("config", { recursive: true });
  const exists = fs.existsSync(path);
  let overwrite = false;

  if (exists) {
    const answer = await rl.question(`${path} exists. Preserve it? [Y/n]: `);
    overwrite = answer.trim().toLowerCase().startsWith("n");
  }

  const plan = planConfigWrite(path, exists, overwrite ? "overwrite" : "preserve");
  if (plan.action === "skip") {
    console.log(`kept ${path}`);
    return;
  }

  if (exists) {
    const backupPath = `${path}.bak-${new Date().toISOString().replaceAll(":", "-")}`;
    fs.copyFileSync(path, backupPath);
    console.log(`backed up ${path} to ${backupPath}`);
  }

  fs.writeFileSync(path, contents);
  console.log(`wrote ${path}`);
}

main().catch((error) => {
  rl.close();
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
