import { describe, expect, test } from "bun:test";
import {
  buildSearchConfig,
  buildStrategyConfig,
  defaultOnboardingAnswers,
  mergeOnboardingAnswers,
  planConfigWrite,
} from "./onboarding-config";

describe("onboarding config generation", () => {
  test("builds strategy config from answers", () => {
    const answers = mergeOnboardingAnswers({
      minimumAmountUsd: 250,
      preferredAmountUsd: 750,
      maxActiveBounties: 2,
      maxExpectedFixHours: 8,
      prefer: ["Rust bugs", "CLI fixes"],
      avoid: ["crowded issues"],
    });

    expect(buildStrategyConfig(answers)).toContain("minimum_amount_usd: 250");
    expect(buildStrategyConfig(answers)).toContain("preferred_amount_usd: 750");
    expect(buildStrategyConfig(answers)).toContain("max_active_bounties: 2");
    expect(buildStrategyConfig(answers)).toContain("max_expected_fix_hours: 8");
    expect(buildStrategyConfig(answers)).toContain("- Rust bugs");
    expect(buildStrategyConfig(answers)).toContain("- crowded issues");
  });

  test("builds search config from answers", () => {
    const answers = mergeOnboardingAnswers({
      githubQueries: [{ name: "rust-bounties", query: "is:issue is:open label:bounty language:Rust", limit: 25 }],
      includeLanguages: ["Rust", "TypeScript"],
      excludeRepos: ["owner/noisy-repo"],
      minimumSearchAmountUsd: 150,
      enabledPlatforms: ["algora", "polar"],
    });

    const yaml = buildSearchConfig(answers);

    expect(yaml).toContain("- name: rust-bounties");
    expect(yaml).toContain("query: 'is:issue is:open label:bounty language:Rust'");
    expect(yaml).toContain("limit: 25");
    expect(yaml).toContain("- Rust");
    expect(yaml).toContain("- owner/noisy-repo");
    expect(yaml).toContain("minimum_amount_usd: 150");
    expect(yaml).toContain("algora:\n    enabled: true");
    expect(yaml).toContain("issuehunt:\n    enabled: false");
  });

  test("preserves existing configs by default", () => {
    expect(planConfigWrite("config/strategy.yml", true, "preserve")).toEqual({ action: "skip", path: "config/strategy.yml" });
    expect(planConfigWrite("config/search.yml", false, "preserve")).toEqual({ action: "write", path: "config/search.yml" });
  });

  test("defaults are complete enough for first run", () => {
    const defaults = defaultOnboardingAnswers();

    expect(defaults.githubQueries.length).toBeGreaterThan(0);
    expect(defaults.prefer.length).toBeGreaterThan(0);
    expect(defaults.avoid.length).toBeGreaterThan(0);
    expect(defaults.enabledPlatforms).toContain("algora");
  });
});
