# Status Mode

Goal: show the current bounty pipeline clearly.

## Procedure

1. Run `bun run doctor` if possible.
2. Read `data/bounties.tsv`.
3. Group by status.
4. Highlight stale rows where `updated_at` is older than 14 days and not terminal.
5. List next actions.

## Output

Keep it concise:

- tracker health
- counts by status
- top next actions
- stale/blocked items
- suggested command
