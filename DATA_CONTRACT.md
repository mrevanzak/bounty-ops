# Data Contract

`data/bounties.tsv` is the canonical source of truth. It is intentionally TSV so agents can edit it safely and humans can inspect diffs.

## Tracker columns

Columns must appear in this exact order:

```tsv
id	status	priority	title	repo	issue_url	bounty_url	platform	amount_usd	currency	labels	language	difficulty	fit_score	payout_score	repo_score	competition_score	timebox_score	expected_value	discovered_at	updated_at	next_action	notes
```

## Field rules

- `id`: stable identifier, `BNTY-0001`, `BNTY-0002`, etc.
- `status`: one of `templates/states.yml`.
- `priority`: `P0`, `P1`, `P2`, `P3`, or blank.
- `title`: concise issue title.
- `repo`: `owner/name`.
- `issue_url`: canonical GitHub issue URL.
- `bounty_url`: bounty platform URL if different from issue URL.
- `platform`: `github`, `algora`, `polar`, `issuehunt`, `gitcoin`, `drips`, `other`.
- `amount_usd`: numeric USD estimate. Use blank if unknown.
- `currency`: original currency if known.
- `labels`: comma-separated normalized labels.
- `language`: primary language or stack.
- `difficulty`: `low`, `medium`, `high`, `unknown`.
- `fit_score`: 1-5.
- `payout_score`: 1-5.
- `repo_score`: 1-5.
- `competition_score`: 1-5 where 5 means low competition.
- `timebox_score`: 1-5.
- `expected_value`: computed by `scripts/score-bounties.ts`.
- `discovered_at`: ISO date, `YYYY-MM-DD`.
- `updated_at`: ISO date, `YYYY-MM-DD`.
- `next_action`: short imperative action.
- `notes`: compact free text. Put detailed notes in dossier files.

## Expected value formula

Initial formula:

```text
expected_value =
  amount_weight +
  fit_score * 2.0 +
  payout_score * 1.5 +
  repo_score * 1.2 +
  competition_score * 1.2 +
  timebox_score * 1.4

amount_weight = min(10, amount_usd / 100)
```

If `amount_usd` is blank, `amount_weight = 0` and `payout_score` should be conservative.

## Dossier contract

Each active bounty should have:

```text
data/dossiers/BNTY-XXXX.md
```

The dossier records repository facts, issue facts, acceptance criteria, risks, proposed implementation, communication drafts, and payment follow-up.
