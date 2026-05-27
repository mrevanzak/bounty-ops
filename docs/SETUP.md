# Setup

## Requirements

- Bun 1.1+
- GitHub CLI (`gh`) recommended for authenticated searches
- A coding agent such as OpenCode, Claude Code, or Gemini CLI

## Configure

```bash
bun install
cp config/strategy.example.yml config/strategy.yml
cp config/search.example.yml config/search.yml
bun run doctor
```

Edit `config/strategy.yml` with bounty selection rules, time limits, and risk policy. Edit `config/search.yml` with GitHub queries, bounty platforms, and filters.

## GitHub auth

For higher rate limits and private notes on public issues:

```bash
gh auth login
gh auth status
```

The system should not post comments, claim issues, or submit PRs without explicit approval.
