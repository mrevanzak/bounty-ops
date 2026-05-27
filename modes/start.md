# Start Mode

Goal: safely begin work on one bounty.

## Required input

`BNTY-XXXX`

## Pre-flight checklist

Before implementation:

1. Read the tracker row and dossier.
2. Re-check issue is still open.
3. Re-check bounty is still active.
4. Check for recent PRs that solve it.
5. Confirm acceptance criteria.
6. Confirm repo setup and tests.
7. Draft a small implementation plan.
8. Ask the user before posting a claim/comment.

## Workspace rule

Use a separate clone or git worktree for the target repo. Keep this `bounty-hunter` repo clean as the operations tracker.

## Tracker updates

- `researching` while verifying feasibility.
- `claimed` only after user-approved claim is posted.
- `working` once implementation begins.
- `blocked` if acceptance criteria or setup is unclear.
