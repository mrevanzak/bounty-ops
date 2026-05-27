# Bounty-Ops

Agent-operated pipeline for finding, evaluating, tracking, and working paid open-source bounties across public GitHub repositories.

Inspired by `career-ops`, this repo is a local command center: open it with OpenCode, Claude Code, Gemini CLI, or another coding agent and let the agent run the workflow from the files in this project.

## What this does

- **Searches** public bounty sources and GitHub issues
- **Scores** opportunities with a repeatable rubric
- **Tracks** every target in one canonical pipeline
- **Prepares** work plans, repo notes, PR strategy, and follow-up logs
- **Keeps humans in control**: agents recommend and draft; you decide, claim, submit, and communicate

## Quick start

```bash
bun install
cp config/strategy.example.yml config/strategy.yml
cp config/search.example.yml config/search.yml
bun run doctor
```

Then open this directory in OpenCode and ask:

```text
/bounty-ops scan
/bounty-ops rank
/bounty-ops evaluate https://github.com/owner/repo/issues/123
/bounty-ops start BNTY-0001
/bounty-ops status
```

## Project structure

```text
bounty-hunter/
├── AGENTS.md                         # Canonical instructions for coding agents
├── DATA_CONTRACT.md                  # Data model and tracker schema
├── config/
│   ├── strategy.example.yml          # Bounty selection rules and risk policy
│   └── search.example.yml            # Discovery queries, platforms, filters
├── data/
│   ├── bounties.tsv                  # Canonical tracker
│   ├── discoveries/                  # Raw scan results
│   ├── dossiers/                     # Per-bounty research notes
│   └── worklog/                      # Daily work and follow-up logs
├── docs/
│   ├── SETUP.md
│   ├── WORKFLOW.md
│   └── plans/
├── modes/                            # Agent-readable workflows
│   ├── bounty-ops.md
│   ├── scan.md
│   ├── evaluate.md
│   ├── rank.md
│   ├── start.md
│   └── status.md
├── scripts/
│   ├── doctor.ts
│   ├── normalize-tracker.ts
│   └── score-bounties.ts
└── templates/
    ├── bounty-dossier.md
    ├── bounty-evaluation.md
    ├── states.yml
    └── tracker-header.tsv
```

## Workflow

1. **Discover** bounty candidates from configured sources.
2. **Normalize** candidates into `data/bounties.tsv`.
3. **Evaluate** each bounty using the scoring rubric.
4. **Rank** by expected value, fit, and execution confidence.
5. **Start** one bounty at a time with a dossier and work plan.
6. **Submit** PRs manually after review.
7. **Follow up** until merged, rejected, stale, or paid.

## Philosophy

This is not a spam tool. It is a filter and operating system for high-quality bounty work. Prefer fewer, better-targeted issues where you can produce credible, maintainable PRs.
