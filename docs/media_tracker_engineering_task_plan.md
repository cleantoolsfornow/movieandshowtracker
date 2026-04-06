# Media Tracker Refactor Engineering Task Plan

Companion to `docs/media_tracker_refactor_spec.md`.

This is the execution-oriented plan for implementing the refactor in this repository. It maps the spec to concrete files, recommended new modules, ordered work, and verification checkpoints.

## Working rules

1. Treat `docs/media_tracker_refactor_spec.md` as the product/source-of-truth contract.
2. Treat this file as the engineering sequence and file checklist.
3. Keep Firestore storage normalized.
4. Make all UI-facing title reads return the canonical `TitleViewModel`.
5. Remove `memberOne/memberTwo/together` assumptions completely from tracker code.
6. Optimize UX for 1-2 members, but keep the data model valid for 3+ members.

## Recommended new files

These are the only new code files I would plan for up front.

- `lib/tracker/view-model.ts`
  Purpose: build `TitleViewModel` from normalized title docs, household status docs, user status docs, and member docs.
- `tests/tracker-view-model.test.ts`
  Purpose: unit-test derived fields and resolved output for solo, two-member, and 3+ member households.
- `tests/tracker-client-api.test.ts`
  Purpose: cover the new client request/response contracts for add, list, get, patch, and refresh flows.
- `scripts/backfill-title-statuses.ts` or `scripts/backfill-title-statuses.mjs`
  Purpose: one-time best-effort migration from legacy `titleStatuses` into normalized collections.

If implementation stays small enough, `lib/tracker/view-model.ts` can be folded into `lib/tracker/server.ts`, but separating it will keep the read model easier to test.

## Implementation order

## 1. Prep and guardrails

Files:
- `docs/media_tracker_refactor_spec.md`
- `docs/media_tracker_engineering_task_plan.md`
- `node_modules/next/...` relevant docs for route handlers and app router behavior

Tasks:
- Re-read the refactor spec before coding each API/UI slice.
- Check the installed Next.js docs path in `node_modules` before touching route-handler or app-router patterns, per repo instructions.
- Do not start with UI edits. Lock the types and server read model first.

Exit criteria:
- The team agrees this task plan is the execution checklist.
- The `TitleViewModel` in the spec is the only UI contract for title reads.

## 2. Tracker types and shared helpers

Files to change:
- `lib/tracker/types.ts`
- `lib/tracker/shared.ts`

Files to add:
- `lib/tracker/view-model.ts`

Tasks in `lib/tracker/types.ts`:
- Remove slot-based types:
  - `StatusField`
  - `StatusPerson`
  - `StatusFlags`
  - `StatusPatch`
  - legacy `TitleStatus`
- Add normalized model types for:
  - `TitleDocument`
  - `TitleUserStatusDocument`
  - `TitleHouseholdStatusDocument`
  - `TitleDerivedSummary`
  - `TitleViewModel`
  - action payload types for add and patch routes
- Keep TMDb search result types, but align metadata field names with the spec where possible.

Tasks in `lib/tracker/shared.ts`:
- Keep `createTitleKey`.
- Add helper for deterministic user-status id creation.
- Remove `defaultStatusFlags` and `mergeStatusPatch`.
- Add pure helpers for:
  - normalizing missing household status
  - normalizing missing user status
  - computing derived summary counts
  - mapping member docs to `TitleViewModel.members`
  - extracting `currentUser`

Tasks in `lib/tracker/view-model.ts`:
- Add one exported builder that accepts:
  - title doc
  - current user id
  - member docs
  - user status docs
  - household status doc
- Return a fully resolved `TitleViewModel`.
- Ensure missing user status docs default to `wantsToWatch: false` and `watched: false`.
- Ensure `createdAt` and `updatedAt` are ISO strings.

Tests:
- Update `tests/tracker-shared.test.ts` to remove slot-based expectations.
- Add `tests/tracker-view-model.test.ts` for:
  - solo household
  - two-member household
  - 3+ household
  - `allMembersWatched`
  - `someMembersWatched`
  - `watchedTogether` staying explicit

Exit criteria:
- All tracker domain types are normalized or canonical-view-model based.
- No shared helper still references `memberOne`, `memberTwo`, or `together`.

## 3. Server read-path refactor

Files to change:
- `lib/tracker/server.ts`
- `app/api/households/me/route.ts`

Files to add:
- none required beyond `lib/tracker/view-model.ts`

Tasks in `lib/tracker/server.ts`:
- Keep `getHouseholdIdForUid`.
- Add reusable loaders for:
  - household doc
  - household members
  - titles by household
  - title user statuses by household
  - title household statuses by household
  - single title with all related docs
- Add helper to validate that a target `userId` belongs to the same household as the acting user.
- Replace `mapTitleRecord`, `getTitleRecordById`, and `applyStatusPatch`.
- Add new read methods that return `TitleViewModel`:
  - `getTitleViewModelById(...)`
  - `listTitleViewModels(...)`
- Refactor list logic to bulk-fetch household-scoped docs and group in memory by `titleId`.

Tasks in `app/api/households/me/route.ts`:
- Keep household/member payload structure unless a UI need forces expansion.
- Ensure response still gives enough member data for avatars and dynamic labels.
- Do not add title view-model logic here.

Tests:
- Prefer helper-level tests over route-handler integration if route tests are not already in place.
- Add or extend tests around server-side grouping and membership validation.

Exit criteria:
- There is one server-side read assembler for title data.
- List reads no longer perform one status fetch per title.

## 4. Mutation routes and client API contract

Files to change:
- `app/api/titles/add/route.ts`
- `app/api/titles/[titleId]/route.ts`
- `app/api/titles/[titleId]/refresh/route.ts`
- `lib/tracker/client-api.ts`

Tasks in `app/api/titles/add/route.ts`:
- Replace `statusPatch` schema with explicit action-based input.
- Create title doc if missing.
- Create or update one `titleUserStatuses` doc for user-level actions.
- Create or update one `titleHouseholdStatuses` doc for household-level actions.
- Default target user to current user when omitted.
- Return `TitleViewModel`.

Tasks in `app/api/titles/[titleId]/route.ts`:
- Replace raw patch schema with action-based schema.
- Support:
  - `set_user_wants_to_watch`
  - `set_user_watched`
  - `set_household_wants_to_watch`
  - `set_watched_together`
  - `set_user_rating`
  - `set_user_notes`
- Validate target user belongs to the same household.
- Allow cross-user watched/wants-to-watch edits within the household.
- Do not allow this route to edit user profile/account data.
- Return `TitleViewModel` for both `GET` and `PATCH`.

Tasks in `app/api/titles/[titleId]/refresh/route.ts`:
- Keep TMDb refresh logic.
- After updating title metadata, return `TitleViewModel`, not a legacy record shape.

Tasks in `lib/tracker/client-api.ts`:
- Remove `TitleRecord` and `StatusPatch` usage.
- Make `addTitle`, `listTitles`, `getTitleById`, `patchTitleStatus`, and `refreshTitleMetadata` use `TitleViewModel`.
- Replace positional filter options with current-user / household / derived-state filters.
- Add explicit request types for add and patch actions.

Tests:
- Add `tests/tracker-client-api.test.ts`.
- Update any tests expecting `{ record: TitleRecord }` to expect the new shape.

Exit criteria:
- All title mutations use explicit action semantics.
- All title reads/mutations return `TitleViewModel`.

## 5. Search and title-detail UI

Files to change:
- `components/search/search-result-card.tsx`
- `components/status/title-status-editor.tsx`
- `components/status/status-chip-group.tsx`
- `app/(app)/title/[id]/page.tsx`

Tasks in `components/search/search-result-card.tsx`:
- Remove fixed quick actions for `memberOne/memberTwo/together`.
- Default actions to:
  - add title only
  - add to my watchlist
  - mark as watched
  - add to household watchlist
  - mark watched together
- Hide or simplify actions based on solo-household context.
- Keep advanced member-targeting out of the default quick flow.

Tasks in `components/status/title-status-editor.tsx`:
- Rebuild around `TitleViewModel`.
- Split editing UI into:
  - household actions
  - current-user actions
  - per-member editing controls
- Make this the primary place for cross-user status edits.
- Keep optimistic updates if practical, but do them against the new action responses.

Tasks in `components/status/status-chip-group.tsx`:
- Either generalize it to dynamic members or remove it if the old abstraction becomes awkward.
- Do not preserve it just to match the old slot model.

Tasks in `app/(app)/title/[id]/page.tsx`:
- Update render logic to consume `TitleViewModel`.
- Separate display into:
  - metadata
  - household state
  - member state
- Hide or downplay `watchedTogether` in solo households.
- Ensure 3+ member households remain readable.

Tests:
- Update `tests/title-status-editor.test.tsx` to stop mocking slot labels.
- Add tests for current-user and cross-user edit flows if component complexity warrants them.

Exit criteria:
- Search no longer surfaces positional quick actions.
- Title detail is the main editing surface for per-member state.

## 6. Household context, cards, home, and library

Files to change:
- `components/household/household-context.tsx`
- `components/library/poster-card.tsx`
- `app/(app)/home/page.tsx`
- `app/(app)/library/page.tsx`

Tasks in `components/household/household-context.tsx`:
- Stop exposing `personLabels.memberOne/memberTwo`.
- Expose:
  - household summary
  - current user
  - ordered member list for display only
  - member lookup helpers
- Keep avatar/name resolution logic, but make it user-id based.

Tasks in `components/library/poster-card.tsx`:
- Consume `TitleViewModel`.
- For 1-2 member households:
  - show concise per-member watched summaries
- For 3+ households:
  - show aggregate counts instead of one chip per member
- Keep card density compact.

Tasks in `app/(app)/home/page.tsx`:
- Replace old sections based on `wantToWatchBy.memberOne/memberTwo/together`.
- Build sections from:
  - current user
  - household state
  - derived counts
- Keep solo and two-member UX simple.

Tasks in `app/(app)/library/page.tsx`:
- Replace positional filters with the canonical filters from the spec.
- Generate member-specific filters dynamically only when helpful.
- Prefer aggregate behavior for 3+ households.

Tests:
- Add page/component tests only where logic is non-trivial.
- Prioritize unit tests for filter helpers over brittle page render snapshots.

Exit criteria:
- No user-facing page depends on member slot ordering.
- Cards and lists behave differently but sensibly for 1-2 versus 3+ households.

## 7. Migration script and legacy cleanup

Files to change:
- `lib/tracker/server.ts`
- `app/api/titles/add/route.ts`
- `app/api/titles/[titleId]/route.ts`
- `app/api/titles/list/route.ts`

Files to add:
- `scripts/backfill-title-statuses.ts` or `scripts/backfill-title-statuses.mjs`

Tasks:
- Stop all new writes to legacy `titleStatuses`.
- Keep the backfill script intentionally simple:
  - iterate households
  - iterate legacy `titleStatuses`
  - map `memberOne` to `memberIds[0]`
  - map `memberTwo` to `memberIds[1]`
  - map `together` to explicit household-level flags only where meaning is clear
  - skip ambiguous records
  - log skipped records
- After the new routes and UI are working, remove legacy fallback reads rather than supporting both forever.

Verification:
- Run the migration only against controlled data first.
- Confirm repeated runs are idempotent or clearly documented as one-time.

Exit criteria:
- New app behavior does not depend on `titleStatuses`.
- Legacy backfill path is best-effort, not overengineered.

## 8. Test pass and regression checklist

Files to change:
- `tests/tracker-shared.test.ts`
- `tests/title-status-editor.test.tsx`
- `tests/household-client-api.test.ts`

Files to add:
- `tests/tracker-view-model.test.ts`
- `tests/tracker-client-api.test.ts`

Recommended test coverage:
- `TitleViewModel` builder:
  - derived counts
  - current user extraction
  - missing status defaults
  - solo / two-member / 3+ behavior
- client API:
  - add returns canonical type
  - list returns canonical type array
  - get/patch/refresh return canonical type
- title detail editing:
  - optimistic update rollback still works
  - cross-user edit request is formed correctly
- household context:
  - current user and member helpers remain stable when profile data updates

Manual QA checklist:
- Solo household can search, add, watch, and browse without awkward second-person UI.
- Two-member household can edit each other’s watched/wants-to-watch title state.
- A household member cannot edit another user’s account/profile data.
- 3+ member household renders aggregate summaries on cards.
- Library filters work with the new server contract.
- Title detail and list views show consistent data for the same title.

## Suggested commit slices

If implementing in multiple commits/PRs, use this order:

1. `tracker types + TitleViewModel builder`
2. `server read-path refactor`
3. `title add/patch/refresh API refactor`
4. `client API contract update`
5. `title detail + search UI refactor`
6. `home/library/cards/household context refactor`
7. `legacy migration script + cleanup`
8. `test sweep + polish`

## Ready-to-start checklist

- `TitleViewModel` exists in code and matches the spec exactly.
- No remaining tracker types reference positional member slots.
- Server read helpers can produce `TitleViewModel` for one title and many titles.
- Add/list/detail/patch/refresh routes all speak the same title contract.
- UI components have a clear migration order and file map.
- Best-effort migration is defined as a script, not an application runtime dependency.
