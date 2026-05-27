# Scan Mode

Goal: discover paid open-source bounty candidates without spamming maintainers or fabricating details.

## Inputs

- `config/strategy.yml`
- `config/search.yml`
- Existing `data/bounties.tsv`

## Procedure

1. Read strategy and search configuration.
2. Search configured bounty platforms and GitHub issue queries.
3. Collect only issues with credible paid-bounty signals.
4. Deduplicate against `data/bounties.tsv` by issue URL and bounty URL.
5. Add new candidates with status `discovered`.
6. Preserve unknowns as blanks, not guesses.
7. Run:

```bash
bun run normalize
bun run score
bun run doctor
```

## Evidence requirements

For each candidate, capture:

- issue URL
- repo
- title
- bounty platform or source evidence
- stated amount if available
- labels
- first next action

## Output

Summarize:

- number scanned
- number added
- number skipped as duplicates
- top 5 candidates by expected value
- any sources that failed
