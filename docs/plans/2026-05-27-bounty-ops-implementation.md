# Bounty-Ops Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a robust local, agent-operated pipeline for finding, scoring, tracking, and working paid open-source GitHub bounties.

**Architecture:** Use a repo-as-operating-system design. Markdown mode files guide agents, TSV stores canonical bounty state, YAML stores bounty strategy/search configuration, and small Bun TypeScript scripts enforce tracker integrity.

**Tech Stack:** Bun 1.1+, TypeScript, Markdown, YAML, TSV, GitHub CLI optional.

---

### Task 1: Harden tracker validation

**Files:**
- Modify: `scripts/doctor.ts`
- Test manually with: `bun run doctor`

**Step 1: Add row-level validation**

Validate every row has the exact header column count and all non-empty statuses appear in `templates/states.yml`.

**Step 2: Run validation**

Run: `bun run doctor`
Expected: PASS with `bounty-ops doctor passed`.

**Step 3: Commit**

```bash
git add scripts/doctor.ts
git commit -m "feat: validate bounty tracker rows"
```

### Task 2: Add GitHub scan script

**Files:**
- Create: `scripts/scan-github.ts`
- Modify: `package.json`

**Step 1: Implement a conservative scanner**

Use `gh search issues` when available. Read query strings from `config/search.yml`, output raw JSONL to `data/discoveries/YYYY-MM-DD-github.jsonl`, and do not modify the tracker directly in v1.

**Step 2: Add script**

Add `"scan:github": "bun run scripts/scan-github.ts"` to `package.json`.

**Step 3: Verify**

Run: `bun run scan:github`
Expected: creates a raw discovery file or reports missing `gh`/auth clearly.

**Step 4: Commit**

```bash
git add scripts/scan-github.ts package.json data/discoveries/.gitkeep
git commit -m "feat: add github bounty scanner"
```

### Task 3: Add discovery import workflow

**Files:**
- Create: `scripts/import-discoveries.ts`
- Modify: `package.json`

**Step 1: Parse raw discovery JSONL**

Map issue fields into tracker columns. Preserve unknown amounts as blank. Deduplicate by `issue_url`.

**Step 2: Generate stable IDs**

Find the highest existing `BNTY-XXXX` and increment.

**Step 3: Add script**

Add `"import": "bun run scripts/import-discoveries.ts"`.

**Step 4: Verify**

Run: `bun run import && bun run verify`
Expected: new rows added only for non-duplicates.

**Step 5: Commit**

```bash
git add scripts/import-discoveries.ts package.json data/bounties.tsv
git commit -m "feat: import bounty discoveries"
```

### Task 4: Add terminal status report

**Files:**
- Create: `scripts/status.ts`
- Modify: `package.json`

**Step 1: Implement grouped status output**

Read `data/bounties.tsv`, group by status, show top expected value rows and stale next actions.

**Step 2: Add script**

Add `"status": "bun run scripts/status.ts"`.

**Step 3: Verify**

Run: `bun run status`
Expected: readable pipeline summary.

**Step 4: Commit**

```bash
git add scripts/status.ts package.json
git commit -m "feat: add bounty status report"
```

### Task 5: Add first agent skill wrapper

**Files:**
- Create: `.agents/skills/bounty-ops/SKILL.md`

**Step 1: Wrap mode routing as an installable skill**

Write a skill that tells agents to read `AGENTS.md`, then route to `modes/*.md`.

**Step 2: Verify manually**

Open the repo in OpenCode and ask `bounty ops status`.

Expected: agent follows `modes/status.md`.

**Step 3: Commit**

```bash
git add .agents/skills/bounty-ops/SKILL.md
git commit -m "feat: add bounty ops agent skill"
```
