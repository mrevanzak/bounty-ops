# Onboard Mode

Use this when the user says `/bounty-ops onboard`, “setup bounty ops”, “configure bounty ops”, or asks to configure the pipeline interactively.

## Goal

Configure `config/strategy.yml` and `config/search.yml` without requiring the user to manually edit YAML.

## Agent workflow

Ask one question at a time with the ask/question tool. Prefer defaults when the user is unsure. Preserve existing config files by default.

### Questions

1. Minimum bounty amount in USD. Default: `100`.
2. Preferred bounty amount in USD. Default: `500`.
3. Max active bounties. Default: `1`.
4. Max research minutes before deciding. Default: `30`.
5. Max expected fix hours. Default: `12`.
6. Preferred work types. Default: small reproducible bugs, failing tests, CLI/tooling fixes, TypeScript/JavaScript/Python issues.
7. Work types to avoid. Default: unclear payout terms, crowded issues, inactive maintainers, large rewrites, speculative feature requests.
8. Enabled bounty platforms. Default: Algora, Polar, IssueHunt. Gitcoin stays disabled unless explicitly requested.
9. GitHub discovery queries. Default: use the built-in bounty queries unless the user wants custom queries.
10. Include/exclude repo filters. Default: none.
11. Include/exclude language filters. Default: none.
12. Discovery minimum amount in USD. Default: `0`.
13. Existing config policy. Default: preserve existing files; if overwriting, back up first.

## Writing config

- Use `scripts/onboarding-config.ts` as the source of truth for defaults and YAML shape.
- If files do not exist, write `config/strategy.yml` and `config/search.yml` from the collected answers.
- If files exist, ask before overwriting. When overwriting, create a timestamped `.bak-*` backup first.
- After edits, run:

```bash
bun run normalize
bun run score
bun run doctor
```

If scripts fail, report the failure and do not claim the pipeline is healthy.

## CLI fallback

If the user prefers terminal prompts instead of agent questions, run:

```bash
bun run setup
```
