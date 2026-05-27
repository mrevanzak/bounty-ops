# Workflow

## 1. Scan

Run `modes/scan.md` to discover candidates from configured sources. Raw findings should go under `data/discoveries/`; normalized candidates go into `data/bounties.tsv`.

## 2. Evaluate

Run `modes/evaluate.md` for each promising bounty. Create or update a dossier and fill the scoring rubric.

## 3. Rank

Run `modes/rank.md` to sort by expected value and execution confidence. Prefer one active bounty at a time.

## 4. Start

Run `modes/start.md` before doing implementation work in an external repo. Confirm issue state, payment path, competition, and acceptance criteria.

## 5. Work

Use a separate worktree or clone for the target repo. Keep `bounty-hunter` as the operating system and the target repo as the implementation workspace.

## 6. Submit and follow up

Agents may draft PR bodies and comments, but the user must approve posting and submission.
