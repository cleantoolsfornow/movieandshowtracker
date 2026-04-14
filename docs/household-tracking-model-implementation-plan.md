# Household Tracking Model Implementation Plan

Last updated: April 13, 2026

This plan replaces the current `wantsToWatch` / `watched` / `householdWantsToWatch` / `watchedTogether` model with a cleaner household tracking model built around:

- title metadata
- a household entry for that title
- per-member tracking
- explicit household intent (`For Us`)
- watch sessions as watch events, including solo watches

It is grounded in the current repo structure, especially:

- `lib/tracker/types.ts`
- `lib/tracker/shared.ts`
- `lib/tracker/view-model.ts`
- `lib/tracker/server.ts`
- `app/api/titles/*`
- `components/status/title-status-editor.tsx`
- `components/home/dashboard-page.tsx`
- `app/(app)/library/page.tsx`
- `components/search/search-result-card.tsx`

## 1. Product Decisions Locked In

These assumptions are part of this plan:

1. No migration work is needed.
2. No dual-read or dual-write period is needed.
3. Existing tracker data can be discarded during development.
4. Ratings and notes are public within the household.
5. The app still supports one household per user.
6. Episode-level and season-level progress remain out of scope for this refactor.

Practical implication:

- We should do a hard cutover on a branch, reset tracker collections, remove legacy compatibility code, and move the whole app to the new model in one pass.

## 2. Core Model

The target model is:

`CatalogTitle -> HouseholdTitle -> MemberState[] + WatchSession[]`

Where:

- `CatalogTitle` is the metadata record for the movie/show itself.
- `HouseholdTitle` is the household’s tracking record for that title.
- `MemberState` is one member’s relationship to that title.
- `WatchSession` is a watch event involving 1 or more household members.

Everything like `2/4 completed`, `3 members want this`, `watched together recently`, and `both completed` is derived at read time.

## 3. Current to Target Mapping

| Current concept | Target concept | Notes |
|---|---|---|
| `titles` | `catalogTitles` + `householdTitles` | Split canonical metadata from household-specific tracking |
| `titleUserStatuses.wantsToWatch` | `memberState.interest` | Use `none` / `want` |
| `titleUserStatuses.watched` | `memberState.progress` | Use `not_started` / `in_progress` / `completed` / `dropped` |
| `titleUserStatuses.rating` | `memberState.rating` | Public to household |
| `titleUserStatuses.notes` | `memberState.notes` | Public to household |
| `titleHouseholdStatuses.householdWantsToWatch` | `householdTitles.forUs` | Explicit shared plan, not overlap |
| `titleHouseholdStatuses.watchedTogether*` | `watchSessions` | Event history for solo watches, multi-participant watches, rewatches, and subsets |
| Derived “both want”, “all watched” | Derived summary fields | Never stored as primary state |

## 4. Firestore Target Schema

Use top-level collections so the current server patterns remain familiar, but separate concepts clearly.

## 4.1 `catalogTitles/{catalogTitleId}`

Canonical title metadata, keyed independently from households.

Recommended ID:

- `catalogTitleId = ${mediaType}_${tvdbId}`

Fields:

- `id`
- `tvdbId`
- `mediaType`
- `name`
- `originalName`
- `overview`
- `posterPath`
- `backdropPath`
- `releaseDate`
- `firstAirDate`
- `genres`
- `runtime`
- `numberOfSeasons`
- `voteAverage`
- `createdAt`
- `updatedAt`

Notes:

- This is the canonical metadata source.
- It is not household-specific.
- Writes should continue to happen through server routes only.

## 4.2 `householdTitles/{householdTitleId}`

The household’s record for tracking a title.

Recommended ID:

- `householdTitleId = ${householdId}_${catalogTitleId}`

Fields:

- `id`
- `householdId`
- `catalogTitleId`
- `addedBy`
- `createdAt`
- `updatedAt`
- `forUs` boolean
- `forUsUpdatedAt`
- `forUsUpdatedBy`
- `archived` boolean
- `archivedAt`
- `archivedBy`
- `lastActivityAt`
- `lastWatchSessionAt`
- `watchSessionCount`

Query-helper denormalized fields:

- `mediaType`
- `name`
- `posterPath`
- `releaseDate`
- `firstAirDate`

Notes:

- `forUs` is the explicit household pick.
- `archived` controls whether the title is active history or still in the active library.
- The denormalized metadata fields are deliberate. Firestore cannot join on `catalogTitles`, so list filters and sorts need a household-queryable snapshot.
- Canonical truth for metadata still lives in `catalogTitles`.
- The denormalized snapshot fields are best-effort cached UI fields, but the product should keep them closely synchronized in normal use.
- `updatedAt` should mean any write to the `householdTitles` record.
- `lastActivityAt` should mean meaningful household-visible activity only.

Metadata refresh rule:

- when a title is first added, refresh canonical metadata and write both `catalogTitles` and household snapshot fields
- when metadata is manually refreshed from an external source, update both `catalogTitles` and household snapshot fields
- when a title is viewed after a stale threshold, the server may refresh canonical metadata and re-sync household snapshot fields
- list and detail UI should not intentionally show conflicting metadata for the same title

## 4.3 `householdTitleMemberStates/{memberStateId}`

One per household title per user.

Recommended ID:

- `memberStateId = ${householdTitleId}_${userId}`

Fields:

- `id`
- `householdId`
- `householdTitleId`
- `catalogTitleId`
- `userId`
- `interest` enum: `none | want`
- `progress` enum: `not_started | in_progress | completed | dropped`
- `rating` optional number
- `notes` optional string
- `createdAt`
- `updatedAt`
- `updatedBy`

Notes:

- This replaces the current mutually-exclusive `wantsToWatch` and `watched` booleans.
- `interest` and `progress` are intentionally separate.
- Member state intentionally does not carry `startedAt` or `completedAt`.
- Watch history should live in `householdTitleWatchSessions`, not in duplicated member-state timestamps.
- Ratings and notes are readable by any household member.
- Direct writes should still go through server routes, even though the data is public inside the household.

## 4.4 `householdTitleWatchSessions/{sessionId}`

One record per watch event.

Recommended ID:

- Use Firestore auto IDs, plus indexed identifying fields.

Fields:

- `id`
- `householdId`
- `householdTitleId`
- `catalogTitleId`
- `occurredAt` timestamp
- `occurredOnLocalDate` string date
- `participantUserIds` string array
- `participantSnapshots` array
- `progressEffect` enum: `none | in_progress | completed`
- `note` optional string
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

Notes:

- A session can represent a solo watch, pair watch, or larger group watch.
- A session is an event, not a permanent status.
- Rewatches are just additional session documents.
- Sessions can include a subset of household members.
- `occurredAt` is the source for ordering and history.
- `occurredOnLocalDate` exists for display, grouping, and timezone-stable UI copy.
- `participantSnapshots` should always preserve at least display names for historical rendering if membership changes later.
- `progressEffect` lets the server update participant member states in a predictable way.
- For movies, `completed` will be the default effect.
- For shows, `in_progress` should be the default effect unless the user explicitly marks the session as finishing the title.

Timezone rule:

- `occurredAt` is canonical
- `occurredOnLocalDate` is derived using the acting user’s timezone at time of creation unless explicitly overridden by a custom date/time flow
- if a custom date/time flow allows manual timezone-sensitive entry, the server should still persist one canonical `occurredAt`

`participantSnapshots` shape:

- `userId`
- `displayName`
- optional `photoURL`

Implementation note:

- do not store `avatarDataUrl` in session snapshots by default
- keep session snapshots lightweight to avoid unnecessary document growth over time

## 4.5 ID Naming Rules

To avoid ambiguity after the split, the code and API should use explicit IDs:

- `catalogTitleId` for metadata-layer records
- `householdTitleId` for household tracking records
- `sessionId` for watch events

Avoid using generic `titleId` in new APIs unless the route is intentionally scoped to the household title record.

## 5. Stored vs Derived State

Do store:

- title metadata
- household membership to a title
- explicit `forUs`
- archive lifecycle
- per-member `interest`, `progress`, `rating`, `notes`
- watch-event history
- lightweight query helpers like `lastWatchSessionAt`

Do not store:

- `watchedTogether` boolean
- `householdWantsToWatch` plus derived overlap in the same field
- `both watched`
- `3 members want this`
- `watched together recently`
- `all members completed`

Those should come from the read model.

## 6. Watch History and Member State Rules

The app should have one canonical watch-history system:

- `householdTitleWatchSessions` is the canonical watch-history record for all actual watching
- sessions may have 1 participant or many participants
- solo watches, pair watches, and group watches all use the same session model

This means:

- if a user records “I started this” from a primary watch action, create a 1-participant session with `progressEffect=in_progress`
- if a user records “I completed this” from a primary watch action, create a 1-participant session with `progressEffect=completed`
- `Recently Watched` and personal watch history should come from sessions, not inferred member-state changes

Because sessions are the history source:

- member state does not need `startedAt` or `completedAt`
- `set_progress` should be treated as a manual correction / override path, not the primary way the product records watch activity
- normal watch flows must not quietly use `set_progress` as a substitute for creating watch events

## 6.1 State Normalization

The two-field `interest + progress` model only works cleanly if it is normalized on the server.

Default state:

- `interest=none`
- `progress=not_started`

Allowed meanings:

- `interest=want` is only meaningful when `progress=not_started`
- `progress=in_progress|completed|dropped` means the user is no longer in a pre-watch “want” state

Server normalization rules:

1. Setting `progress` to `in_progress`, `completed`, or `dropped` clears `interest` to `none`.
2. Setting `interest` to `want` while `progress` is anything other than `not_started` should either:
   - reset `progress` to `not_started`, or
   - be rejected by the API.

Recommended implementation:

- allow `interest=want` only when `progress=not_started`
- if the client sends `interest=want` with any progressed state, normalize to:
  - `interest=want`
  - `progress=not_started`

Invalid long-lived combinations to avoid:

- `interest=want` + `progress=completed`
- `interest=want` + `progress=dropped`
- `interest=want` + `progress=in_progress`

This should be enforced in API handlers, not just in the UI.

## 7. Member State Creation and Missing Docs

Member-state docs should be lazy.

Rules:

- Create a `householdTitleMemberStates` doc only when a member actually interacts with the title.
- On reads, synthesize default state for missing members:
  - `interest=none`
  - `progress=not_started`
  - `rating=undefined`
  - `notes=undefined`

Why:

- fewer writes
- simpler add-title flow
- easier handling when household membership changes

Membership edge cases:

- when a new member joins, they simply read all existing titles with synthesized default member state until they interact
- if a member leaves, old member-state docs and old sessions may still exist for historical accuracy unless a later product rule says otherwise
- old sessions must still render sensibly even if a participant is no longer in the current household member list

## 8. View Model Target

Replace the current `TitleViewModel` with a shape that reflects the new domain instead of the old booleans.

Recommended read model sections:

### 8.1 `catalog`

- canonical title metadata

### 8.2 `householdEntry`

- `forUs`
- `archived`
- `addedBy`
- `createdAt`
- `updatedAt`
- `lastWatchSessionAt`
- `watchSessionCount`

### 8.3 `members`

Per member:

- `userId`
- `displayName`
- `photoURL`
- `avatarDataUrl`
- `interest`
- `progress`
- `rating`
- `notes`

### 8.4 `currentUser`

- current user’s member-state projection

### 8.5 `summary`

Derived, household-size-aware primitives:

- `memberCount`
- `wantCount`
- `completedCount`
- `inProgressCount`
- `droppedCount`
- `recentWatchSession`
- `hasAnyWatchSessions`
- `allCompleted`
- `someCompleted`
- `multipleWant`
- `forUsAndUnstartedCount` when useful for dashboard sections
- `watchedTogetherRecently` derived from recent sessions with 2+ participants

### 8.6 `sessions`

Only on title detail reads, or as a separately-fetched payload if the list payload becomes too heavy:

- recent session list
- `occurredAt`
- `occurredOnLocalDate`
- participant IDs
- participant labels
- participant snapshots
- session note
- progress effect

Important rule:

- List pages should use a light summary view model.
- Title detail can load the full session history.

## 9. API Design Changes

The current title mutation API is a single discriminated union that keeps growing. For this refactor, split mutation endpoints by resource type instead of continuing to pile more actions into `PATCH /api/titles/[householdTitleId]`.

## 9.1 Read Endpoints

Keep the current broad shape, but point it at the new view model:

- `GET /api/titles/list`
- `GET /api/titles/[householdTitleId]`

Add optional list filters:

- `scope=mine`
- `scope=for_us`
- `scope=watching`
- `scope=completed`
- `scope=history`
- `scope=all`

## 9.2 Add Title

Replace the current action-driven add route with a cleaner create payload:

- `POST /api/titles/add`

Payload:

- metadata needed to identify the title
- optional initial personal state
- optional `forUs`
- optional initial 1-participant watch session when the add flow represents actual watching

Recommended create semantics:

- Ensure `catalogTitles/{catalogTitleId}` exists or is refreshed.
- Ensure `householdTitles/{householdTitleId}` exists.
- Optionally seed the current user’s member state.
- Optionally set `forUs`.
- If the add flow is `Start Watching` or `Complete`, create an initial 1-participant session as part of the same server transaction or request workflow.

Important rule:

- generic “add only” flows should not create sessions
- watch-intent actions should create sessions

## 9.3 Member State Routes

Add dedicated member-state mutations:

- `PATCH /api/titles/[householdTitleId]/member-state`
- `POST /api/titles/[householdTitleId]/member-state/clear`

Supported actions:

- `set_interest`
- `set_progress`
- `set_rating`
- `set_notes`

Rules:

- A user can update only their own member state directly.
- Server-side watch-session creation may also update participant states.
- `set_progress` is for explicit correction/manual override flows.
- Primary watch-recording UI should use watch-session routes instead of relying on `set_progress` alone.

`clear my tracking` behavior:

- resets only the current user’s member state for that household title
- clears `interest`, `progress`, `rating`, and `notes` back to synthesized defaults
- does not remove the household title
- does not affect other members’ states
- does not delete watch history
- past watch events involving that user remain visible as historical events

UX wording rule:

- this action should be described as resetting current personal status, not erasing history
- `Reset my status` may be clearer user-facing copy than `Clear my tracking`

## 9.4 Household Entry Routes

Add dedicated household-entry mutations:

- `PATCH /api/titles/[householdTitleId]/household`
- `DELETE /api/titles/[householdTitleId]`

Supported actions:

- `set_for_us`
- `set_archived`

Rules:

- Any household member can toggle `forUs`.
- Any household member can archive/unarchive for now.
- If later needed, owner/admin roles can refine this.

`remove from household` behavior:

- this is a destructive household-level delete, not a substitute for clearing personal tracking
- strongly confirm in the UI
- allow only when all of the following are true:
  - no watch sessions exist
  - the current user has `interest=none`
  - the current user has `progress=not_started`
  - the current user has no rating
  - the current user has no notes
  - no other member has `interest=want`
  - no other member has `progress != not_started`
  - no other member has a rating
  - no other member has notes
- otherwise direct the user to archive the title or clear their own tracking instead

Practical meaning:

- household delete is for undoing an effectively empty or accidental title entry
- if the current user still has meaningful personal state, they should use `Reset my status` first

## 9.5 Watch Session Routes

Add explicit session resources:

- `POST /api/titles/[householdTitleId]/watch-sessions`
- `PATCH /api/titles/[householdTitleId]/watch-sessions/[sessionId]`
- `DELETE /api/titles/[householdTitleId]/watch-sessions/[sessionId]`

Create/edit payload:

- `occurredAt`
- `occurredOnLocalDate`
- `participantUserIds`
- `progressEffect`
- `note`

Permissions and defaults:

- quick watch actions default to the current user only
- adding other participants must be explicit in the UI
- any household member may create a session that includes themselves
- adding sessions for other members without including yourself should require the explicit multi-person logging flow
- session edit/delete permissions should default to:
  - creator can edit date/note
  - creator can delete their own session
  - broader household edit/delete permissions can come later if needed

Server behavior:

1. Validate all participants are in the household.
2. Allow `participantUserIds.length >= 1`.
3. Create or update the session.
4. Update `householdTitles.lastWatchSessionAt`, `watchSessionCount`, and `lastActivityAt`.
5. Apply progress changes to participants when `progressEffect` is not `none`.

Derived session-field rule:

- on session delete, and on edits that affect ordering or existence, recompute `watchSessionCount` and `lastWatchSessionAt` from remaining sessions rather than blindly decrementing or overwriting

Progress rules:

- `completed` sets participant `progress` to `completed`.
- `in_progress` sets participant `progress` to `in_progress` unless already `completed`.
- Session writes should not automatically clear ratings or notes.

Important source-of-truth rule:

- `memberState` is the source of truth for current personal status
- `watchSessions` are event history
- creating a session may update member state
- editing or deleting a session should not try to rewind member state automatically

Recommended edit policy:

- allow editing session `occurredAt`, `occurredOnLocalDate`, and `note`
- avoid trying to reverse participant or `progressEffect` changes automatically
- if participant or progress meaning was wrong, prefer creating a corrected replacement session over complex rollback logic

Correction flow guidance:

- if a session was wrong in a way that affects participants or progress meaning, the UI should prompt for manual member-state correction rather than implying automatic rollback
- keep participant/progress-effect edits behind a more advanced correction flow, not the default edit path
- editing a session means editing the historical event, not automatically correcting current status
- deleting a session means deleting the historical event, not automatically undoing current member status

Session ownership rule:

- for v1, the creator owns the session, even for multi-participant sessions
- the creator may edit or delete that session within the allowed policy above
- other participants do not implicitly gain edit/delete rights just because they were included
- if this creates friction later, broader participant permissions can be revisited as a product decision

## 10. Security and Visibility Rules

Keep the app’s current pattern:

- client reads can be allowed where useful
- writes stay behind Next.js API routes using verified Firebase ID tokens and Admin SDK

Visibility rules:

- `catalogTitles`: readable by authenticated users; writes blocked from client
- `householdTitles`: readable only by household members
- `householdTitleMemberStates`: readable only by household members
- `householdTitleWatchSessions`: readable only by household members

Write rules inside API handlers:

- direct member-state edits can only target `request.auth.uid`
- session creation can update multiple participants because the server is applying a household event
- ratings and notes are public to the household, but only editable by the owning member

## 11. Query Strategy and Index Plan

Do not make `householdTitles` the default entry point for every scope. Query based on the question the UI is asking.

Recommended query entry points:

- `mine`, `my watching`, `my completed`
  - query the current user’s `householdTitleMemberStates` first
  - then fetch matching `householdTitles`
- `for_us`, `all titles`, `recently added`
  - query `householdTitles` first
- `history`, `recently watched`
  - query `householdTitleWatchSessions` or use `householdTitles.lastWatchSessionAt`

Recommended default sorts:

- `Mine`: sort by the current user’s member-state `updatedAt desc`
- `For Us`: sort by `householdTitles.lastActivityAt desc`
- `Library`: sort by `householdTitles.lastActivityAt desc`
- `History`: sort by watch-session `occurredAt desc`
- `Recently Added`: sort by `householdTitles.createdAt desc`

Important history rule:

- `recently watched` should be driven by session recency, not by plain member-state progress updates

Required indexes will change with the new collections.

Create indexes for:

- `householdTitles`: `householdId + archived + lastActivityAt desc`
- `householdTitles`: `householdId + archived + forUs + lastActivityAt desc`
- `householdTitles`: `householdId + archived + mediaType + lastActivityAt desc`
- `householdTitles`: `householdId + archived + lastWatchSessionAt desc`
- `householdTitleMemberStates`: `householdId + userId + interest + updatedAt desc`
- `householdTitleMemberStates`: `householdId + userId + progress + updatedAt desc`
- `householdTitleWatchSessions`: `householdId + householdTitleId + occurredAt desc`
- `householdTitleWatchSessions`: `householdId + occurredAt desc`

Implementation note:

- use `occurredOnLocalDate` only for grouping/display helpers, not canonical recency ordering
- keep `updatedAt` indexes only where they support explicit maintenance/debugging workflows; product-facing default sorts should follow `lastActivityAt` or `occurredAt`

## 12. Household Entry Lifecycle Rules

Lock these behaviors before implementation:

1. Archive is manual only.
2. Setting `forUs=true` should automatically unarchive the title.
3. Archived titles should not remain in active `For Us`.
   - implementation: setting `archived=true` also clears `forUs`
4. Completing a title does not auto-archive it.
5. Add a separate “remove from household” action for accidental adds.
   - this is distinct from archive
6. Add a separate `clear my tracking` action for personal reset.
   - this is distinct from both archive and remove from household
7. `lastActivityAt` should only change for household-relevant state changes:
   - add title
   - toggle `forUs`
   - archive/unarchive
   - create watch session
   - edit watch session metadata
   - metadata refresh that changes denormalized household snapshot fields
8. Personal member-state updates should affect `lastActivityAt` only when they change household-visible intent or status.
   - `interest=want`
   - `progress=in_progress`
   - `progress=completed`
   - `progress=dropped`
   - clearing personal status back to defaults
   - rating and note edits should still not bump `lastActivityAt`

Do not let these bump `lastActivityAt` by default:

- rating edits
- note edits
- passive view/read events

Archived discoverability rules:

- archived titles are hidden by default from active views
- archived titles remain discoverable through a dedicated archived filter or archived section inside `Library`
- titles can be unarchived from title detail or list view
- archive should feel reversible, not like a soft delete

## 13. UI and Information Architecture Changes

The product should keep one model and vary presentation by household size.

## 13.1 Primary App Navigation

Change the main entry points to:

- `Mine`
- `Watching`
- `History`
- `Library`
- `For Us` for pair and 3+ households only

This can be implemented first as dashboard sections and library scopes before changing the top-level nav labels.

Solo rule:

- hide `For Us` entirely when `memberCount=1`

IA decision:

- `History` is the session-driven surface
- `Completed` should be a filter/scope within `Mine` or `Library`, not a top-level primary navigation item

## 13.2 Search Result Actions

Search cards should not expose the full model directly.

Use:

- one primary action
- one overflow / secondary actions menu

Recommended primary action copy:

- `Want to Watch`

Recommended secondary actions:

- `Start Watching`
- `Complete`
- `Add to For Us` for pair and 3+ households only

On add:

- create the household title entry
- optionally seed the current user state
- optionally set `forUs`
- if the user chooses `Start Watching` or `Complete`, create a 1-participant watch session in the same flow

Write-order rule:

- if a create flow includes both seeded member state and an initial watch event, the watch event is authoritative for progress
- the server should apply the initial session last, or otherwise normalize the final member state from the session result

Do not try to expose every household member’s state from the search result card.

Quick logging rule:

- one-tap watch logging should assume:
  - participant = current user
  - date = now
  - note = empty
- a separate `Log Watch...` flow should handle:
  - multiple participants
  - custom date/time
  - optional note
  - explicit `in_progress` vs `completed` session effect

Show-tracking language rule:

- because episode and season tracking are out of scope, avoid copy that implies episode-level precision
- prefer labels like `Started watching`, `Watched again`, and `Finished series` where useful for TV titles

## 13.3 Title Detail Page

This becomes the main place for full household detail.

Sections:

1. Title header + quick actions
2. My tracking
3. Household summary
4. Household member states
5. Watch history

Quick actions:

- primary personal watch actions live near the title header
- `For Us` should be a compact household toggle in the header/quick-actions area, not a full heavyweight section
- in solo mode, hide `For Us`

`My tracking` controls:

- `Want to Watch`
- `Start`
- `Complete`
- `Drop`
- rating
- notes

Important UI rule:

- the UI should feel like one personal status control with sensible actions
- it should not present `interest` and `progress` as two equal permanent toggles, even though that is how the model is stored

Primary watch-action guidance:

- the main `Start` and `Complete` controls should create watch sessions
- direct progress editing should be secondary UI for correction/manual override cases

Notes UX:

- notes are public to the household
- show a small “visible to household” hint near the editor
- collapse long notes by default
- consider spoiler-style reveal treatment on display
- keep other members’ notes collapsed by default

`Household summary` shows:

- `2/4 completed`
- `3/4 want`
- `watched together recently`
- `in For Us`

`Household member states` should show:

- avatar
- display name
- personal status chip
- rating inline
- notes expandable

UI vocabulary rule:

- use `watch history`, `watched together`, and `you watched this on...` in product UI
- keep `watch session` as an internal/docs/code term

## 13.4 List Cards

Do not show every dimension at once.

Use:

- one primary badge
- one secondary summary line

Examples:

- `For Us` / `You want it • Maya completed it`
- `Watching` / `3/5 in progress • watched together recently`
- `Completed` / `4/5 completed • 2 sessions`

Badge priority rules:

1. In `For Us` views, primary badge is always `For Us`.
2. In `Mine`, primary badge is always the current user’s personal status.
3. In `Watching`, primary badge is always in-progress state.
4. In `Completed`, primary badge is always completion/history-related.
5. Secondary line carries the best compact supporting summary.

For pair households:

- use named comparisons more often

For 3+ member households:

- default to counts first
- expand to names on detail pages

Empty-state guidance:

- solo: no `For Us` and no household language
- pair: invite comparison and shared planning language such as “Add titles for both of you”
- 3+: emphasize household tracking language such as “Track what the household wants and who has started watching”

## 13.5 Dashboard

Refactor the dashboard away from the old shared-watchlist and watched-together sections.

Recommended sections:

- `Mine`
- `For Us`
- `Watching`
- `Recently Watched`
- `Recently Added`

Derived section logic:

- `Mine`: current user has `interest=want` or `progress` in `in_progress | completed | dropped`
- `For Us`: `householdTitle.forUs=true` and `archived=false`
- `Watching`: any member `progress=in_progress` or recent session with `in_progress`
- `Recently Watched`: recent watch sessions, optionally grouped into title summaries

Dashboard overlap rule:

- full-scope pages may overlap
- dashboard rails should be de-duplicated by priority to avoid the same title appearing everywhere

Recommended dashboard priority:

1. `Watching`
2. `For Us`
3. `Mine`
4. `Recently Watched`
5. `Recently Added`

History rail rule:

- dashboard `Recently Watched` should use title-grouped session summaries, not raw session rows
- the dedicated `History` view can show fuller event-level history

Sort guidance inside dashboard rails:

- `Watching`: `lastWatchSessionAt desc`, then `lastActivityAt desc`
- `For Us`: `lastActivityAt desc`
- `Mine`: current user member-state `updatedAt desc`
- `Recently Watched`: watch-session `occurredAt desc`
- `Recently Added`: `createdAt desc`

## 14. UI Presentation Acceptance Rules

These should be treated as explicit acceptance criteria, not just design guidance:

1. If `memberCount=1`, show only My tracking and personal history by default.
2. If `memberCount=1`, hide household summary, member list, `watched together` language, and `For Us`.
3. If `memberCount=2`, default to named-person comparisons.
4. If `memberCount>=3`, default to counts first and make names secondary/expandable.
5. List cards stay compact across all household sizes.
6. Full member-by-member detail belongs on the title detail page.
7. UI labels should use `Library`, `Completed`, and `History` rather than ambiguous `All titles` / `Watched` wording.
8. `History` is the top-level activity view; `Completed` is a filter/scope, not a competing top-level activity view.
9. `Clear my tracking` is available as a personal reset action and is distinct from household-level removal.

## 15. Implementation Phases

## Phase 1: Replace the Domain Types

Files:

- `lib/tracker/types.ts`
- `lib/tracker/shared.ts`

Tasks:

1. Remove `wantsToWatch`, `watched`, `householdWantsToWatch`, and `watchedTogether` types.
2. Add `CatalogTitleDocument`, `HouseholdTitleDocument`, `HouseholdTitleMemberStateDocument`, and `HouseholdTitleWatchSessionDocument`.
3. Add `Interest`, `Progress`, and `SessionProgressEffect` enums/unions.
4. Replace old add/patch request types with resource-specific request shapes.
5. Add helper types for `catalogTitleId`, `householdTitleId`, and session timestamps.
6. Document that member-state progress does not carry canonical watch history.

Done when:

- old tracker booleans are gone from shared types
- helper functions normalize new enums and session payloads

## Phase 2: Rebuild the Server Read Layer

Files:

- `lib/tracker/server.ts`
- `lib/tracker/view-model.ts`

Tasks:

1. Add mappers for all four new collections.
2. Replace the current title join logic with `catalog + householdTitle + memberStates + summary`.
3. Add session-summary builders for list pages.
4. Keep full session history off the list view model unless specifically requested.
5. Synthesize default member states for missing member docs.

Done when:

- `getTitleViewModelById` and `listTitlesForHousehold` read only from the new schema
- current summary badges can be reproduced from derived data without legacy fields

## Phase 3: Replace Mutations and Remove Legacy Actions

Files:

- `app/api/titles/add/route.ts`
- `app/api/titles/[householdTitleId]/route.ts`
- new route files under `app/api/titles/[householdTitleId]/member-state/`
- new route files under `app/api/titles/[householdTitleId]/household/`
- new route files under `app/api/titles/[householdTitleId]/watch-sessions/`

Tasks:

1. Simplify add-title behavior.
2. Move member-state edits out of the all-purpose title patch route.
3. Move `forUs` and `archived` into a household-entry route.
4. Create explicit watch-session routes.
5. Delete the old `mark_*` and `set_*watched_together*` action unions.
6. Enforce server-side normalization for `interest + progress`.
7. Ensure user-facing `Start Watching` and `Complete` flows create sessions, including 1-participant sessions.

Done when:

- there is no API action named `wants_to_watch`, `watched_together`, or `household_wants_to_watch`
- session writes are event-based and support rewatches

## Phase 4: Refactor Client API and Editor UI

Files:

- `lib/tracker/client-api.ts`
- `components/status/title-status-editor.tsx`
- `components/status/status-chip-group.tsx`

Tasks:

1. Replace boolean toggles with simplified personal action UI that maps to interest/progress rules.
2. Add public ratings/notes display assumptions to the UI.
3. Replace “watched together” controls with session creation and session history UI.
4. Move `For Us` to a compact header quick action instead of a heavyweight title-page section.
5. Make note visibility obvious in the editor UI.
6. Keep `watch session` terminology out of user-facing copy.

Done when:

- the title page reads like personal tracking plus shared household context
- there is no UI control labeled like a permanent `watched together` status

## Phase 5: Refactor Search, Library, and Dashboard

Files:

- `components/search/search-result-card.tsx`
- `components/home/dashboard-page.tsx`
- `app/(app)/library/page.tsx`
- `components/library/poster-card.tsx`
- `app/(app)/title/[householdTitleId]/page.tsx`

Tasks:

1. Update search result actions to primary action + overflow semantics.
2. Rebuild library filters around scopes like `mine`, `for_us`, `watching`, `completed`, and `history`.
3. Change card summaries to primary badge + secondary line with deterministic badge priority.
4. Use counts first for group households and named comparisons for pairs.
5. Make solo mode explicitly hide household-only presentation.
6. Use `History` as the top-level activity surface, keep `Completed` as a filter/scope, and prefer `Library` over `All titles`.
7. De-duplicate dashboard rails by priority.

Done when:

- the list UI no longer tries to surface every member signal simultaneously
- `For Us` is visually distinct from personal interest overlap

## Phase 6: Cleanup, Reset, and Documentation

Files:

- `scripts/reset-tracker-data.mjs`
- `lib/tracker/legacy-backfill.ts`
- outdated docs in `docs/`

Tasks:

1. Update reset scripts to clear the new collections.
2. Delete obsolete backfill/normalization logic and unused scripts.
3. Update docs that describe the current tracking model after the code lands.
4. Remove legacy naming from comments, helpers, and empty states.

Done when:

- tracker reset scripts understand the new collections
- no legacy booleans remain in active code paths

## 16. Recommended Execution Strategy

Because there is no migration requirement, the safest and fastest path is:

1. Implement the new schema and read layer.
2. Replace write APIs.
3. Refactor the title detail editor.
4. Refactor search, dashboard, and library.
5. Reset tracker data.
6. Remove legacy code.

Do not spend time on:

- backfills
- bridging adapters
- temporary dual-mode view models
- compatibility with the old Firestore shape

If we want to reduce ambiguity even further before coding starts, the three highest-value pre-build checks are:

1. Confirm that watch sessions are the only watch-history system, including solo watches.
2. Confirm the server-side normalization rules for `interest + progress`.
3. Confirm the archive / remove / `For Us` lifecycle behavior.

## 17. Acceptance Criteria

This refactor is complete when all of the following are true:

1. A title can exist as a catalog record and a separate household entry.
2. Personal state is modeled as `interest` plus `progress`, not `want` plus `watched` booleans.
3. `For Us` is an explicit household-level toggle, not a derived overlap signal.
4. Watch activity is stored as one or more watch sessions, including solo watches.
5. Rewatches are represented by multiple sessions, not overwritten status fields.
6. Ratings and notes are visible to all household members on the title detail page.
7. Pair and group households use the same underlying model, with different presentation.
8. List cards show compact summaries, while member-by-member detail lives on title detail.
9. No live code path depends on `titleHouseholdStatuses.watchedTogether` or `titleUserStatuses.wantsToWatch`.
10. Missing member-state docs read as synthesized defaults rather than requiring eager writes.
11. Session edits do not attempt automatic rollback of current member progress.
12. Solo, pair, and 3+ households each render the intended presentation defaults.
13. Primary “started” and “completed” user flows create watch sessions, so recently watched history stays consistent.

## 18. Explicit Non-Goals for This Refactor

These can come later:

- episode-level watch tracking
- season-level completion
- a `pass` / `not interested` member state
- household roles and permissions beyond current member-level access
- recommendation logic based on overlap or ratings

If we want a small extension after this refactor settles, the best next addition is:

- `interest: none | want | pass`

That would let the app distinguish “hasn’t decided” from “actively not interested” without changing the overall structure.
