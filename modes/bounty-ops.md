# Bounty-Ops Mode

Use this when the user says `/bounty-ops`, “bounty ops”, or gives an ambiguous bounty workflow request.

## Triage

Route intent:

- Find opportunities → `modes/scan.md`
- Evaluate one URL → `modes/evaluate.md`
- Choose what to work on → `modes/rank.md`
- Start a specific bounty → `modes/start.md`
- Show pipeline → `modes/status.md`

## Default response

If no intent is clear, show:

1. Current tracker status.
2. Top 5 next actions.
3. Suggested command.

Do not modify tracker unless the user asks for a workflow that requires it.
