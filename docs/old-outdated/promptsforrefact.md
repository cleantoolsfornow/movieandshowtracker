Paste these one at a time, in order. Wait for Codex to finish each step before sending the next.

1. Phase 1: tracker types + view model

```text
Read docs/media_tracker_refactor_spec.md and docs/media_tracker_engineering_task_plan.md fully, then implement Phase 1 only: tracker types and shared helpers.

Scope:
- Update lib/tracker/types.ts
- Update lib/tracker/shared.ts
- Add lib/tracker/view-model.ts if needed
- Add/update tests for this phase only

Requirements:
- Follow the spec exactly, especially the canonical TitleViewModel contract.
- Remove memberOne/memberTwo/together assumptions from tracker domain types/helpers.
- Keep Firestore storage normalized.
- Do not start server route refactors or UI refactors yet unless required to keep this phase compiling.
- Before changing Next.js-related patterns, read the relevant installed Next.js docs in node_modules as required by AGENTS.md.
- Use focused changes only.
- Run the relevant tests for changed files.
- At the end, tell me:
  1. what changed
  2. what tests you ran
  3. what phase should come next
  4. any blockers or ambiguities
```

2. Phase 2: server read-path refactor

```text
Read docs/media_tracker_refactor_spec.md and docs/media_tracker_engineering_task_plan.md again, then implement Phase 2 only: server read-path refactor.

Scope:
- Refactor lib/tracker/server.ts
- Update app/api/households/me/route.ts only if needed for member data support
- Add/update server/helper tests for this phase

Requirements:
- Build reusable server-side loaders that assemble the canonical TitleViewModel.
- Refactor reads so list and single-title loading use normalized storage and a shared read path.
- GET /api/titles/list must be designed around bulk-fetch + in-memory grouping, not one status fetch per title.
- Do not refactor mutation routes yet.
- Do not start the broader UI refactor yet.
- Keep changes limited to this phase unless small compile fixes are required.
- Before changing Next.js route-handler patterns, read the relevant installed Next.js docs in node_modules as required by AGENTS.md.
- Run the relevant tests for changed files.

At the end, tell me:
1. what changed
2. what tests you ran
3. whether the new read path already produces TitleViewModel cleanly
4. what phase should come next
```

3. Phase 3: mutation routes

```text
Read docs/media_tracker_refactor_spec.md and docs/media_tracker_engineering_task_plan.md again, then implement Phase 3 only: title add/patch/refresh API refactor.

Scope:
- app/api/titles/add/route.ts
- app/api/titles/[titleId]/route.ts
- app/api/titles/[titleId]/refresh/route.ts
- any supporting server helpers needed
- tests for the changed API/server behavior

Requirements:
- Replace legacy patch/statusPatch semantics with explicit action-based semantics from the spec.
- POST /api/titles/add must return the canonical TitleViewModel.
- GET /api/titles/[titleId] must return TitleViewModel and must not introduce a separate detail-only response schema.
- PATCH /api/titles/[titleId] must use action-based semantics and return TitleViewModel.
- Allow household members to update each other’s per-user watched / wantsToWatch state within the same household.
- Do not allow editing another user’s profile/account data.
- Keep Firestore storage normalized.
- Do not do client API or UI refactors yet except minimal compile fixes.
- Before changing Next.js route-handler patterns, read the relevant installed Next.js docs in node_modules as required by AGENTS.md.
- Run the relevant tests for changed files.

At the end, tell me:
1. what changed
2. what tests you ran
3. the exact add/patch action contracts now implemented
4. what phase should come next
```

4. Phase 4: client API contract

```text
Read docs/media_tracker_refactor_spec.md and docs/media_tracker_engineering_task_plan.md again, then implement Phase 4 only: client API contract update.

Scope:
- lib/tracker/client-api.ts
- related client API tests
- any small shared type imports needed

Requirements:
- Remove old TitleRecord/StatusPatch client usage.
- Make addTitle, listTitles, getTitleById, patchTitleStatus, and refreshTitleMetadata use TitleViewModel.
- Align request payloads with the action-based API contract from the spec.
- Keep changes focused; do not start the broader UI refactor yet unless required for compilation.
- Run the relevant tests for changed files.

At the end, tell me:
1. what changed
2. what tests you ran
3. whether any UI files are now expecting outdated types
4. what phase should come next
```

5. Phase 5: title detail + search UI

```text
Read docs/media_tracker_refactor_spec.md and docs/media_tracker_engineering_task_plan.md again, then implement Phase 5 only: search and title-detail UI refactor.

Scope:
- components/search/search-result-card.tsx
- components/status/title-status-editor.tsx
- components/status/status-chip-group.tsx if still needed
- app/(app)/title/[id]/page.tsx
- related tests

Requirements:
- Search quick actions should default to current-user actions plus household-level actions.
- Full per-member editing controls should live primarily on the title detail page.
- Remove fixed memberOne/memberTwo/together UI assumptions.
- Consume TitleViewModel everywhere in this phase.
- Keep solo-household UX simple.
- Do not refactor home/library/cards/household context yet except for minimal compile fixes.
- Run the relevant tests for changed files.

At the end, tell me:
1. what changed
2. what tests you ran
3. how cross-user editing works in the title detail UI now
4. what phase should come next
```

6. Phase 6: household context + cards + home + library

```text
Read docs/media_tracker_refactor_spec.md and docs/media_tracker_engineering_task_plan.md again, then implement Phase 6 only: household context, cards, home, and library refactor.

Scope:
- components/household/household-context.tsx
- components/library/poster-card.tsx
- app/(app)/home/page.tsx
- app/(app)/library/page.tsx
- related tests

Requirements:
- Remove remaining memberOne/memberTwo/together assumptions.
- Household context should expose dynamic member data and current-user-aware helpers, not positional labels.
- For 1-2 member households, cards can show concise per-member summaries.
- For 3+ member households, cards should show aggregate summaries like watched count / wantsToWatch count instead of full per-member chips.
- Home and library should use current-user, household, and derived-summary concepts from the spec.
- Keep changes focused to this phase.
- Run the relevant tests for changed files.

At the end, tell me:
1. what changed
2. what tests you ran
3. how 1-2 member behavior differs from 3+ member behavior now
4. what phase should come next
```

7. Phase 7: migration script + cleanup

```text
Read docs/media_tracker_refactor_spec.md and docs/media_tracker_engineering_task_plan.md again, then implement Phase 7 only: migration script and legacy cleanup.

Scope:
- add the one-time best-effort backfill script described in the plan
- remove legacy titleStatuses writes
- remove legacy fallback reads if the app no longer depends on them
- add/update any tests that make sense for this phase

Requirements:
- Do not build a complex migration framework.
- Best-effort mapping only:
  - memberOne -> household.memberIds[0]
  - memberTwo -> household.memberIds[1]
- Ambiguous historical records should be skipped and logged.
- Keep Firestore storage normalized.
- Do not invent historical truth.
- Document how to run the migration script if needed.
- Run the relevant tests for changed files.

At the end, tell me:
1. what changed
2. what tests you ran
3. whether legacy titleStatuses is now fully removed from runtime behavior
4. any migration caveats I should know
```

8. Phase 8: test sweep + polish

```text
Read docs/media_tracker_refactor_spec.md and docs/media_tracker_engineering_task_plan.md again, then implement Phase 8 only: test sweep and polish.

Scope:
- fix remaining type issues, lint issues, test gaps, and small polish issues caused by the refactor
- add or update tests where coverage is still obviously missing
- do not introduce new product changes

Requirements:
- Run the relevant test suite and lint/format checks for the refactor.
- Fix regressions discovered during verification.
- Keep behavior aligned with the spec.
- Do not expand scope beyond stabilization and cleanup.

At the end, give me:
1. a concise summary of all completed phases
2. all tests/checks run and their results
3. any known limitations still remaining
4. whether the refactor is implementation-complete against the spec
```

9. Final review pass

```text
Now do a final review of the completed refactor against docs/media_tracker_refactor_spec.md and docs/media_tracker_engineering_task_plan.md.

Requirements:
- Review for spec compliance, regressions, and missing pieces.
- List findings first, ordered by severity, with file references.
- If there are no findings, say that explicitly.
- After findings, give a short summary of:
  - what was completed
  - any residual risks
  - whether this is ready for real use
- Do not make further code changes unless you identify a concrete issue that should be fixed immediately.
```

If you want a stronger safety version, add this line to every prompt:

```text
If you discover a significant ambiguity or a decision with non-obvious consequences, stop and ask before proceeding further.
```

If you want, I can also give you a shorter “copy/paste checklist version” with just one-line prompts for each phase.
