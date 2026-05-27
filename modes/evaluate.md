# Evaluate Mode

Goal: deeply evaluate one bounty and decide whether to ignore, shortlist, research, or claim.

## Procedure

1. Identify or create the `BNTY-XXXX` tracker row.
2. Create/update `data/dossiers/BNTY-XXXX.md` from `templates/bounty-dossier.md`.
3. Verify issue state: open/closed, assignee, recent maintainer comments, linked PRs.
4. Verify bounty state: amount, payment platform, payout terms, claimant rules.
5. Inspect repo health: recent commits, CI, contribution guide, test setup.
6. Score using `templates/bounty-evaluation.md`.
7. Update tracker fields and `next_action`.
8. Run tracker integrity scripts.

## Decision rules

- `ignored`: no clear payout, stale repo, solved already, bad fit, or high ambiguity.
- `shortlisted`: promising but needs more evidence.
- `researching`: actively investigating implementation feasibility.
- `claimed`: user approved claim/comment and claim was made.

Never mark `claimed` unless the user confirms the claim happened.
