# Skill: bounty-ops

Use this skill when operating the bounty-hunting command center in this repository.

## Required context

1. Read `AGENTS.md` first and follow its non-negotiables.
2. Treat `data/bounties.tsv` as the source of truth.
3. Use Bun as the primary runtime for all scripts.
4. Do not post GitHub comments, claim bounties, submit PRs, or contact maintainers without explicit user approval.

## Command routing

- “scan” / “find bounties” → follow `modes/scan.md`
- “evaluate this” → follow `modes/evaluate.md`
- “rank” / “what should I work on” → follow `modes/rank.md`
- “start BNTY-…” → follow `modes/start.md`
- “status” / “pipeline” → follow `modes/status.md`
- unclear “bounty ops” requests → follow `modes/bounty-ops.md`

## Script commands

```bash
bun run scan:github
bun run import
bun run status
bun run verify
```

After any tracker edit, run:

```bash
bun run normalize
bun run score
bun run doctor
```

## Operating discipline

- Prefer research and scoring over racing to claim.
- Mark uncertain items as `researching`, never fabricate facts.
- Preserve payout evidence in dossiers under `data/dossiers/` before work starts.
- If scripts fail, report the failure and do not claim the pipeline is healthy.
