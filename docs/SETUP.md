# Setup

## Requirements

- Bun 1.1+
- GitHub CLI (`gh`) recommended for authenticated searches
- A coding agent such as OpenCode, Claude Code, or Gemini CLI

## Configure

```bash
bun install
bun run setup
bun run doctor
```

The setup wizard asks questions and writes `config/strategy.yml` and `config/search.yml`. Existing config files are preserved by default. To configure through an agent instead, ask `/bounty-ops onboard`; the agent should ask one question at a time and write the same config files.

## GitHub auth

For higher rate limits and private notes on public issues:

```bash
gh auth login
gh auth status
```

The system should not post comments, claim issues, or submit PRs without explicit approval.
