import { describe, expect, test } from "bun:test";
import { shouldKeepDiscovery, type DiscoveryFilterConfig } from "./discovery-filter";

const baseConfig: DiscoveryFilterConfig = {
  excludeRepos: ["SecureBananaLabs/bug-bounty"],
  excludeTerms: ["synthetic", "human submissions are not wanted", "developer skills challenge"],
  rejectReserved: true,
  rejectAssigned: true,
  requireExplicitUsdAmount: true,
  maxIssueAgeDays: 180,
  requireUpdatedWithinDays: 45,
};

const now = new Date("2026-05-27T12:00:00Z");

function discovery(overrides: Record<string, unknown> = {}) {
  return {
    repo: "real/project",
    title: "Fix login bug",
    labels: ["bounty"],
    amount_usd: "250",
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-26T00:00:00Z",
    body: "Clear reproduction and payout.",
    ...overrides,
  };
}

describe("shouldKeepDiscovery", () => {
  test("rejects known synthetic bounty repositories", () => {
    const result = shouldKeepDiscovery(discovery({ repo: "SecureBananaLabs/bug-bounty" }), baseConfig, now);

    expect(result.keep).toBe(false);
    expect(result.reason).toContain("excluded repo");
  });

  test("rejects stale issues even when the bounty amount is high", () => {
    const result = shouldKeepDiscovery(
      discovery({ created_at: "2024-01-01T00:00:00Z", updated_at: "2024-02-01T00:00:00Z", amount_usd: "1000" }),
      baseConfig,
      now,
    );

    expect(result.keep).toBe(false);
    expect(result.reason).toContain("older than 180 days");
  });

  test("rejects abandoned issues without recent maintainer activity", () => {
    const result = shouldKeepDiscovery(
      discovery({ created_at: "2026-01-01T00:00:00Z", updated_at: "2026-03-01T00:00:00Z" }),
      baseConfig,
      now,
    );

    expect(result.keep).toBe(false);
    expect(result.reason).toContain("not updated within 45 days");
  });

  test("rejects reserved or assigned bounty work", () => {
    const reserved = shouldKeepDiscovery(discovery({ labels: ["bounty", "Reserved"] }), baseConfig, now);
    const assigned = shouldKeepDiscovery(discovery({ body: "This bounty is assigned to another contributor." }), baseConfig, now);

    expect(reserved.keep).toBe(false);
    expect(reserved.reason).toContain("reserved");
    expect(assigned.keep).toBe(false);
    expect(assigned.reason).toContain("assigned");
  });

  test("keeps recent unassigned USD bounties", () => {
    const result = shouldKeepDiscovery(discovery(), baseConfig, now);

    expect(result).toEqual({ keep: true });
  });
});
