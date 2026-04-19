Haiku Project Files

This directory stores project-local Haiku Method state and conventions for Codex use in `movieandshowtracker`.

Files initialized here:

- `settings.yml`: project defaults and quality gates
- `knowledge/RUNBOOK.md`: repo-specific guidance for future Haiku sessions

Expected runtime structure as work begins:

- `intents/<intent-slug>/intent.md`
- `intents/<intent-slug>/stages/<stage>/state.json`
- stage-specific unit markdown files

The upstream Haiku docs use Claude slash commands. In this repo, use the local Codex skill instead by asking for `$haiku`.
