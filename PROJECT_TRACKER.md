# Project Tracker Link

This repo reports to the central Project Hub tracker.

Central tracker repo path:

`../projecttrackingtool`

Project record path inside the tracker:

`projects/movieandshowtracker/README.md`

Resolved project record path from this repo:

`../projecttrackingtool/projects/movieandshowtracker/README.md`

After meaningful changes in this repo, update the linked Project Hub record so future work can restart with current context.

## What Counts As Meaningful Work

Update the tracker when one of these is true:

- a feature or bug fix landed
- architecture or project direction changed
- project status changed
- the next action changed
- a blocker appeared or was resolved
- deployment, domain, repo, or local path information changed
- the work produced context that would be expensive to rediscover later

Do not update the tracker for trivial formatting, throwaway experiments, dependency churn with no project impact, or changes that do not affect restart context.

## Allowed Routine Updates

You may update only these parts during routine tracker maintenance:

- `last_touched` frontmatter field
- `## Current state`
- `## Next action`
- `## Current blockers`
- `## Open questions`, only when the session changed a decision or unknown
- `## Last session handoff`
- optional dated session note under `projects/movieandshowtracker/sessions/`

## Update Modes

### Light Update

Use after a small meaningful change.

Allowed changes:

- update `last_touched`
- update `## Next action`
- update `## Last session handoff`

### Full Session Update

Use after a substantial work session.

Allowed changes:

- update `last_touched`
- update `## Current state`
- update `## Current blockers`
- update `## Open questions`, only if the session changed them
- update `## Next action`
- update `## Last session handoff`
- add one dated session note under `projects/movieandshowtracker/sessions/`

### Structural Update

Use only with explicit human approval.

Do not make these changes without approval:

- rename a project
- change a slug
- move project files
- change frontmatter schema
- edit templates
- change parser behavior
- change dashboard data shape
- rewrite large parts of a project record
- edit unrelated project records

## What Not To Update

- Do not rename markdown headings.
- Do not reorder sections.
- Do not edit unrelated sections in the linked record.
- Do not edit other project records.
- Do not invent repo URLs, local paths, domains, deployment links, or private details.
- Do not hand-edit `dashboard/data/projects.json`.
- Do not add automation, scripts, scheduled jobs, GitHub API sync, or cross-repo commit behavior unless explicitly requested.

## Required Post-Update Commands

After updating the central tracker, run these in the tracker repo:

```bash
npm run validate
npm run build
```

If dashboard behavior might be affected, also run:

```bash
npm run test:e2e
```

Then inspect the tracker diff before summarizing:

```bash
git diff -- projects/movieandshowtracker/README.md projects/movieandshowtracker/sessions dashboard/data/projects.json
```

## When To Ask For Human Approval

Ask before changing anything structural, ambiguous, or sensitive:

- the project slug or title should change
- the schema or headings seem wrong
- the linked tracker path is missing or points to the wrong repo
- the update would affect multiple project records
- private URLs, local paths, customer names, or credentials are involved
- the right project status or next action is unclear

## Good Handoff Format

- what changed
- current state
- exact next action
- known blocker or risk
- command to run next, if relevant
