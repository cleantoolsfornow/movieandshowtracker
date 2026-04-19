Haiku Method for Codex

This is a project-local Codex bridge for the upstream Haiku Method:

- [Docs](https://haikumethod.ai/docs/)
- [Repository](https://github.com/gigsmart/haiku-method)

Upstream status on April 18, 2026:

- Official install/docs still target Claude Code via `/install gigsmart/haiku-method`
- The upstream source includes harness support for `cursor`, `windsurf`, `gemini-cli`, `kiro`, and `opencode`
- The upstream source does not currently ship a native Codex harness or Codex plugin manifest

What this repo-local setup does:

- Registers a local Codex plugin through `.agents/plugins/marketplace.json`
- Exposes a `$haiku` skill tailored to Codex's tool model
- Initializes `.haiku/settings.yml` plus repo-specific runbook guidance for this project

What it does not do:

- It does not install Claude slash commands like `/haiku:start` or `/haiku:pickup`
- It does not claim official upstream Codex support that is not documented by GigSmart

Use it in this repo by asking Codex to use `$haiku`.
