# Rank Mode

Goal: recommend what to work on next.

## Procedure

1. Run `bun run score`.
2. Read `data/bounties.tsv`.
3. Exclude terminal states: `paid`, `lost`, `stale`, `ignored`.
4. Penalize candidates with missing payout evidence or stale next actions.
5. Rank by expected value, then fit, then time-box score.

## Output format

```markdown
## Recommended next bounty

1. BNTY-XXXX — title
   - Why now:
   - Risk:
   - Next action:

## Top alternatives

...

## Do not work yet

...
```

If the best candidate is weak, say so and recommend scanning instead.
