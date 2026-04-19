---
name: haiku
description: Use when the user wants to work in this repository with the Haiku Method lifecycle: start, pickup, refine, operate, reflect, or gate-review.
---

# Haiku Method for Codex

This is a **project-local Codex bridge** for the upstream Haiku Method.

Important boundaries:

- Upstream Haiku docs currently describe a Claude Code plugin workflow with `/haiku:*` commands.
- In this repository, there are **no installed `/haiku:*` slash commands**.
- Upstream source currently ships harness configs for Cursor, Windsurf, Gemini CLI, Kiro, and OpenCode, but not Codex.
- Use this skill when the user asks for Haiku Method, H·AI·K·U, studios, stages, active intents, or structured lifecycle execution.

## Sources in this repo

- Project settings: `.haiku/settings.yml`
- Repo-specific runbook: `.haiku/knowledge/RUNBOOK.md`
- Plugin readme: `plugins/haiku/README.md`

## Operating model

Map common Haiku actions onto Codex like this:

1. **Setup / Context**

- Read `.haiku/settings.yml` before starting.
- Read `.haiku/knowledge/RUNBOOK.md` before creating or modifying an intent.
- Respect the repo's real quality gates from settings instead of inventing new ones.

2. **Start**

- Create a new intent under `.haiku/intents/<intent-slug>/`.
- Write `intent.md` with frontmatter that includes at least:
  - `title`
  - `studio`
  - `stages`
  - `mode`
  - `active_stage`
  - `status`
  - `started_at`
- Default this repository to the `software` studio unless the request clearly points elsewhere.
- For software work, use the upstream stage order:
  - `inception`
  - `design`
  - `product`
  - `development`
  - `operations`
  - `security`

3. **Pickup**

- Work one unit at a time unless the user explicitly requests parallel agent work.
- Inspect `.haiku/intents/` for active work and continue the current `active_stage`.
- Within a stage, keep the work artifact-oriented and unit-based.
- If the user explicitly authorizes subagents, use them to mirror stage hats with disjoint ownership.
- Run the configured quality gates before marking software work complete.

4. **Reflection**

- For completed intents, write `.haiku/intents/<intent-slug>/reflection.md`.
- Capture what changed, what worked, what failed, and what should change in future elaboration or execution.

5. **Operate / Gate Review**

- For delivery or post-delivery tasks, keep artifacts under the active intent directory.
- Use gate-style review before calling work complete.
- Prefer repository evidence, tests, build output, and code review findings over generic status claims.

## Intent conventions

`intent.md` should usually include frontmatter like:

```yaml
---
title: Improve household invite flow
studio: software
stages: [inception, design, product, development, operations, security]
mode: continuous
active_stage: inception
status: active
started_at: 2026-04-18T00:00:00Z
completed_at:
---
```

Then include:

- Problem
- Outcome
- Scope
- Constraints
- Success Criteria
- Current Stage Notes

## Stage and unit conventions

For software work, keep stage state under:

```text
.haiku/intents/<intent-slug>/stages/<stage>/state.json
```

Keep unit specs near the stage or intent they belong to, for example:

```text
.haiku/intents/<intent-slug>/stages/development/unit-01-<slug>.md
```

Unit files should usually include frontmatter like:

```yaml
---
status: pending
bolt: 0
hat: planner
branch: ""
discipline: ""
---
```

Then include:

- Goal
- Scope
- Constraints
- Success Criteria
- Verification

## Repo-specific defaults

- This is a `next@16.2.2` App Router project.
- If you touch app code, read the relevant guide under `node_modules/next/dist/docs/` first.
- Default quality gates for this repo are:
  - `npm run lint`
  - `npm test`
  - `npm run build`
- Prefer tests for changed behavior, especially in `tests/`.
- Preserve the existing UI and app structure unless the user asks for a broader redesign.

## Studio selection

Default studio for this repo:

- `software`

Only deviate if the user is explicitly using Haiku for a non-software track.

## Practical invocation examples

- "Use `$haiku` to start an intent for improving household invites."
- "Use `$haiku` to pick up the active intent in this repo."
- "Use `$haiku` to reflect on the last completed intent."
