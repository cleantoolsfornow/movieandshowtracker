# Media Tracker Refactor Spec

## Purpose

Refactor the current media tracking app so it cleanly supports:

- solo users using the app by themselves
- two-person households
- future multi-user households without breaking the data model

The current implementation works for a narrow `memberOne / memberTwo / together` model, but that structure is too rigid and mixes individual state with shared state. This refactor should normalize the model, simplify the mental model, and make the UI/API easier to reason about.

---

## Problem Summary

### Current issue
The current tracking model uses placeholder household member slots:

```ts
watchedBy: {
  memberOne: boolean
  memberTwo: boolean
  together: boolean
}

wantToWatchBy: {
  memberOne: boolean
  memberTwo: boolean
  together: boolean
}
```

### Why this is a problem
- Assumes exactly two tracked people in the UI model
- Makes solo usage feel awkward
- Couples user identity to field names instead of real user IDs
- Mixes individual user state and shared household state in the same shape
- Makes future growth harder
- Forces the UI to guess names from household member ordering

### What we want instead
The system should support two separate layers:

1. **Per-user title state**
   - I want to watch this
   - I watched this
   - optional date/rating/notes

2. **Per-household title state**
   - the household wants to watch this
   - the household watched this together

Additionally, the app should derive summary states such as:
- all household members watched
- some household members watched
- multiple members want to watch

---

## Product Goals

### Required goals
1. A user can sign in and create or join a household.
2. A household with only one member must be fully supported.
3. Each user can independently track:
   - want to watch
   - watched
4. The household can also track shared intent and shared experience:
   - household wants to watch
   - watched together
5. Household-level summary states should be derived from the member list and per-user statuses.
6. The data model must not depend on `memberOne`, `memberTwo`, or fixed member slots.

### Non-goals for this refactor
- Complex household permission roles
- Public social features
- Generalized organization/team features
- Multi-household membership for a single user

---

## Locked Product Decisions

These decisions are now locked for the refactor and should be treated as implementation constraints, not open design questions.

### 1. Migration
- Do not build a complex migration.
- If backfill is needed, map old `memberOne/memberTwo` to the current `household.memberIds[0]` and `household.memberIds[1]` as best effort only.
- Ambiguous historical records can be skipped and logged.

### 2. Canonical UI response
- Keep normalized Firestore storage.
- Add a single canonical UI-facing `TitleViewModel` / resolved title shape used by both list and detail endpoints.
- Screens should not consume raw normalized Firestore docs directly.

### 3. Cross-user editing
- Allow household members to update each other’s personal watched / wants-to-watch status within the same household.
- Search quick actions should default to current-user actions plus household-level actions.
- Full per-member editing controls should live primarily on the title detail page.

### 4. Household size behavior
- Optimize UX for 1-2 members.
- Support 3+ members in the data model without changing the model again.
- For 3+ member households, cards should show aggregate summaries such as watched count / wants-to-watch count instead of full per-member chips.

### 5. Derived rules
- Derived fields such as `allMembersWatched` must use current household membership.
- `watchedTogether` remains an explicit separate flag and must never be inferred.

### 6. Query strategy
- Refactor `GET /api/titles/list` to bulk-fetch household-scoped `titles`, `titleUserStatuses`, `titleHouseholdStatuses`, and members, then group in memory by `titleId`.
- Do not keep the current one-status-fetch-per-title pattern.

---

## Core Mental Model

### Household
A household is the shared container for users and their media data.

A household may contain:
- 1 user
- 2 users
- potentially more users later

### Titles
A title is a movie or TV show saved into a household’s library.

### User title state
Each user has their own relationship with a title.

Examples:
- Matt watched Dune
- Jessica wants to watch Dune

### Household title state
The household also has a shared relationship with a title.

Examples:
- the household wants to watch Dune
- the household watched Dune together

### Derived household summaries
Some household-level states should not be stored as primary truth. They should be derived.

Examples:
- all household members watched Dune
- some household members watched Dune

---

## Updated User and Household Flow

### Account states

#### 1. Unauthenticated visitor
- Can view sign-in page only
- Protected routes redirect to sign-in

#### 2. Authenticated user without household
- Sent to onboarding
- Can create a household
- Can join a household with invite code or link

#### 3. Authenticated user with household
- Can access app
- All data is scoped to household

### Important rule
A household with one user is valid and should feel like a first-class use case, not an edge case.

---

## Updated Information Architecture

```txt
/
└─ redirects to /home or /sign-in based on auth state

/sign-in
└─ if signed in:
   ├─ no household -> /onboarding
   └─ has household -> /home

/onboarding
├─ create household
└─ join household

/home
├─ recent titles
├─ my watchlist
├─ household watchlist
├─ recently watched
└─ links to /search and /library

/search
├─ search TMDb
└─ quick add actions

/library
├─ all titles
├─ filters
└─ sorting

/title/[id]
├─ metadata
├─ per-user states
├─ household states
└─ derived summaries

/settings
├─ account info
├─ household info
├─ invite code / invite link
└─ sign out
```

---

## Refactored Data Model

## 1. users/{uid}

```ts
users/{uid} {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  avatarDataUrl?: string
  householdId?: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Notes
- A user may belong to at most one household
- `householdId` is nullable until onboarding is complete

---

## 2. households/{householdId}

```ts
households/{householdId} {
  id: string
  name: string
  inviteCode: string
  memberIds: string[]
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Notes
- `memberIds` is the source of truth for membership
- No UI/API logic should depend on the order of `memberIds`
- No “memberOne/memberTwo” assumptions

---

## 3. titles/{titleId}

Each saved title exists once per household.

### ID strategy
Continue using deterministic IDs:

```txt
{householdId}_{mediaType}_{tmdbId}
```

### Shape

```ts
titles/{titleId} {
  id: string
  householdId: string
  tmdbId: number
  mediaType: 'movie' | 'tv'

  name: string
  originalName?: string
  overview?: string
  posterPath?: string
  backdropPath?: string
  releaseDate?: string
  firstAirDate?: string
  genres?: { id: number; name: string }[]
  runtime?: number
  numberOfSeasons?: number
  voteAverage?: number

  createdAt: Timestamp
  createdBy: string
  updatedAt: Timestamp
}
```

### Notes
- Title metadata is cached when the title is added
- Titles should not be duplicated within the same household

---

## 4. titleUserStatuses/{statusId}

Each document represents one user’s relationship to one title inside one household.

### ID strategy
Use a deterministic composite key:

```txt
{householdId}_{titleId}_{userId}
```

### Shape

```ts
titleUserStatuses/{statusId} {
  id: string
  householdId: string
  titleId: string
  userId: string

  wantsToWatch: boolean
  watched: boolean

  watchedAt?: string
  rating?: number
  notes?: string

  createdAt: Timestamp
  updatedAt: Timestamp
  updatedBy: string
}
```

### Notes
- This is the primary truth for individual user tracking
- This fully replaces `memberOne/memberTwo`

---

## 5. titleHouseholdStatuses/{titleId}

Each document represents household-level shared state for a title.

### Shape

```ts
titleHouseholdStatuses/{titleId} {
  titleId: string
  householdId: string

  householdWantsToWatch: boolean
  watchedTogether: boolean
  watchedTogetherAt?: string

  createdAt: Timestamp
  updatedAt: Timestamp
  updatedBy: string
}
```

### Notes
- `householdWantsToWatch` is explicit
- `watchedTogether` is explicit and should not be inferred from all members watched
- This document may be created lazily only when needed

---

## Derived Summary Model

The following are **derived values**, not primary stored truth:

```ts
{
  memberCount: number
  watchedCount: number
  wantsToWatchCount: number

  allMembersWatched: boolean
  someMembersWatched: boolean
  noMembersWatched: boolean

  someMembersWantToWatch: boolean
  multipleMembersWantToWatch: boolean
}
```

### Derivation rules

#### allMembersWatched
True when:
- household member count > 0
- every current household member has `watched = true`

#### someMembersWatched
True when:
- at least one member has `watched = true`
- but not all members

#### multipleMembersWantToWatch
True when:
- two or more members have `wantsToWatch = true`

### Important distinction
These are different concepts:

- **all members watched** = everyone has seen it individually at some point
- **watched together** = shared viewing event, explicitly marked

Do not collapse these into one boolean.

---

## Updated Product Rules

1. A title may exist in the household library even if only one user has interacted with it.
2. A user can independently mark a title as watched and/or wants to watch.
3. The household can independently mark a title as household-wanted.
4. `watchedTogether` must be explicit.
5. `allMembersWatched` must be derived.
6. No logic should rely on the first two household members returned from Firestore.
7. A solo household should show simple language like:
   - Want to watch
   - Watched
   - In household watchlist
8. A multi-user household should show member names dynamically using user documents, not positional placeholders.
9. Household members may update each other’s per-user `watched` / `wantsToWatch` title state within the same household.
10. Household members may not edit another user’s profile or account data.

---

## API Refactor Requirements

The exact endpoint naming can stay close to the current structure, but the handlers must use the new model.

## Canonical UI View Model

All UI-facing title endpoints should return the same canonical `TitleViewModel` shape.

```ts
type TitleViewModel = {
  id: string
  householdId: string
  tmdbId: number
  mediaType: 'movie' | 'tv'
  name: string
  overview?: string
  posterPath?: string
  backdropPath?: string
  releaseDate?: string
  firstAirDate?: string
  genres?: { id: number; name: string }[]
  runtime?: number
  numberOfSeasons?: number
  voteAverage?: number

  household: {
    wantsToWatch: boolean
    watchedTogether: boolean
    watchedTogetherAt?: string
    allMembersWatched: boolean
    someMembersWatched: boolean
    watchedCount: number
    wantsToWatchCount: number
    memberCount: number
  }

  members: Array<{
    userId: string
    displayName?: string
    photoURL?: string
    avatarDataUrl?: string
    wantsToWatch: boolean
    watched: boolean
    watchedAt?: string
    rating?: number
    notes?: string
  }>

  currentUser: {
    userId: string
    wantsToWatch: boolean
    watched: boolean
    watchedAt?: string
    rating?: number
    notes?: string
  }

  createdAt: string
  updatedAt: string
}
```

- Firestore storage remains normalized.
- API responses should be denormalized into this single canonical UI-facing shape.
- Both list and detail endpoints should use this same base contract.
- Detail endpoints may include extra fields later, but must preserve this base shape.
- The UI should not consume raw normalized Firestore documents directly.

## Keep / update these endpoints

### POST /api/households/create
Creates a household and assigns current user to it.

### POST /api/households/join
Joins current user to an existing household using invite code.

### GET /api/households/me
Returns:
- household metadata
- member summaries
- invite code

Suggested response:

```ts
{
  household: {
    id: string,
    name: string,
    inviteCode: string,
    memberIds: string[]
  },
  members: [
    {
      uid: string,
      displayName?: string,
      photoURL?: string,
      avatarDataUrl?: string
    }
  ]
}
```

---

## Search flow

### GET /api/tmdb/search?q=...
No major conceptual change.

Search returns movie and TV results from TMDb.

---

## Add flow

### POST /api/titles/add
This endpoint needs to be reworked.

### Returns
`TitleViewModel`

### Responsibilities
1. Validate current user and household membership
2. Create title in `titles/{titleId}` if missing
3. Optionally create/update that user’s `titleUserStatuses` doc depending on action
4. Optionally create/update `titleHouseholdStatuses/{titleId}` if action is household-level
5. Return the canonical `TitleViewModel` needed by the UI

### Supported action types
Suggested server action types:

```ts
'mark_user_wants_to_watch'
'mark_user_watched'
'mark_household_wants_to_watch'
'mark_watched_together'
'add_title_only'
```

### Example payload

```ts
{
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  action: 'mark_user_wants_to_watch',
  targetUserId?: string
}
```

### Notes
- `targetUserId` should default to current user unless explicitly provided and allowed by UI
- Do not use `memberOne/memberTwo/together`

---

## Title detail endpoints

### GET /api/titles/[titleId]
Returns `TitleViewModel`.

This endpoint should not introduce a separate detail-only response schema.

Return a canonical resolved shape assembled from normalized storage, combining:
- title metadata
- household members
- per-user statuses
- household status
- derived summary

The server should build a canonical UI-facing `TitleViewModel` from normalized storage and return that resolved shape consistently.

---

### PATCH /api/titles/[titleId]
This endpoint should become action-based instead of toggling fields tied to fixed member slots.

### Supported operations
Suggested actions:

```ts
set_user_wants_to_watch
set_user_watched
set_household_wants_to_watch
set_watched_together
set_user_rating
set_user_notes
```

### Example payloads

```ts
{
  action: 'set_user_wants_to_watch',
  userId: 'abc123',
  value: true
}
```

```ts
{
  action: 'set_user_watched',
  userId: 'abc123',
  value: true,
  watchedAt: '2026-04-06'
}
```

```ts
{
  action: 'set_household_wants_to_watch',
  value: true
}
```

```ts
{
  action: 'set_watched_together',
  value: true,
  watchedTogetherAt: '2026-04-06'
}
```

### Notes
- UI should not directly PATCH raw Firestore-shaped fields
- Use explicit action semantics
- The server should return the same canonical `TitleViewModel` shape after mutations so screens can stay consistent

---

### GET /api/titles/list
Returns `TitleViewModel[]`.

This endpoint should return household-scoped titles using the same canonical `TitleViewModel` shape as title detail, and support filter/sort using normalized + derived data.

### Query strategy
- Bulk-fetch household-scoped `titles`
- Bulk-fetch household-scoped `titleUserStatuses`
- Bulk-fetch household-scoped `titleHouseholdStatuses`
- Load household members once
- Group records in memory by `titleId`
- Do not fetch one status document per title

### Recommended filters
- mediaType = movie | tv
- my_wants_to_watch
- my_watched
- household_wants_to_watch
- watched_together
- all_members_watched
- watched_by_anyone
- not_watched_by_me

### Recommended sort
- recently_added
- recently_updated
- alphabetical
- release_date

---

### POST /api/titles/[titleId]/refresh
Keep this endpoint.

Responsibility:
- re-fetch TMDb metadata
- update `titles/{titleId}`
- do not alter user or household tracking state

---

## UI Refactor Requirements

## Core UI principle
The UI should render member names dynamically from household member data.

Do not hardcode `memberOne` or `memberTwo` labels anywhere.

---

## Search / Add UI

### Current problem
Quick actions likely map to fixed member slots.

### New behavior
When a user adds a title from search results, show action choices based on current household context.

#### For solo households
Show:
- Add to my watchlist
- Mark as watched
- Add to household watchlist
- Add title only

#### For multi-user households
Show:
- Add to my watchlist
- Mark as watched
- Add to household watchlist
- Mark watched together
- Add title only

Default quick actions should stay focused on the signed-in user plus household-level actions.

Optional advanced action menu:
- choose another member to mark watched/wants-to-watch

### Important note
Do not force the user to pick a target member for the common search flow.

---

## Home page

### For solo households
Show sections like:
- My watchlist
- Recently watched
- Recently added

### For multi-user households
Show sections like:
- Household watchlist
- Recently watched together
- My watchlist
- Recently watched
- Recently added

Optional future sections:
- Jessica’s watchlist
- Matt’s watchlist

---

## Library page

### Goal
A unified library that can be filtered using normalized states.

### Filters
For all households:
- All
- Movies
- TV Shows
- My watchlist
- Watched by me
- Household watchlist
- Watched together

For multi-user households only:
- Watched by [member name]
- Wants to watch: [member name]
- All members watched

### Important note
Filters should be generated dynamically from household member data.

For 3+ member households, prefer aggregate filters and summary labels over rendering a chip for every member on every card.

---

## Title detail page

### Current issue
The page likely expects `memberOne/memberTwo/together` booleans.

### New structure
The page should render 3 clear sections:

#### 1. Metadata
- poster
- backdrop
- title
- year
- type
- overview
- genres

#### 2. Household state
- In household watchlist: yes/no
- Watched together: yes/no
- All household members watched: yes/no

#### 3. Member state
For each member:
- wants to watch: yes/no
- watched: yes/no
- watchedAt if present
- rating if present
- notes if present

### Example rendering for 2 members

```txt
Household
- Household wants to watch: Yes
- Watched together: No
- All members watched: No

Members
- Matt
  - Wants to watch: Yes
  - Watched: No

- Jessica
  - Wants to watch: No
  - Watched: Yes
```

### Example rendering for solo user

```txt
You
- Want to watch: Yes
- Watched: No

Household
- Household wants to watch: Yes
- Watched together: Not applicable / hidden
- All members watched: No
```

### Important UX note
Hide or downplay `watchedTogether` for solo households.
For 3+ member households, this page remains the primary place for full per-member editing controls.

---

## Settings page

### Keep
- display name/avatar update
- sign out
- household details

### Add / improve
- clear household member list
- invite code / invite link presentation
- clarify that one-person households are supported

---

## Derived Data Logic

This can be implemented in the API layer first.

### Pseudocode

```ts
const memberCount = household.memberIds.length
const watchedCount = userStatuses.filter(s => s.watched).length
const wantsToWatchCount = userStatuses.filter(s => s.wantsToWatch).length

const allMembersWatched = memberCount > 0 && watchedCount === memberCount
const someMembersWatched = watchedCount > 0 && watchedCount < memberCount
const noMembersWatched = watchedCount === 0
const multipleMembersWantToWatch = wantsToWatchCount >= 2
```

### Important note
Derived fields should use **current** household membership, not historic membership.

---

## Firestore Security Rule Requirements

Rules must ensure:

1. A signed-in user can read/write only their own `users/{uid}` document.
2. A signed-in user can read household docs only if their `auth.uid` belongs to that household.
3. A signed-in user can read titles only if `title.householdId` matches their household.
4. A signed-in user can read/write `titleUserStatuses` only within their household.
5. If you allow editing another user’s status from the UI, rules and server endpoints must explicitly govern that behavior.

### Recommendation
For now, allow status changes only through server routes that validate household membership and payload rules.

---

## Concrete Implementation Plan

Proceed in this order.

### 1. Data model / types
1. Add normalized server-side model types for:
   - `Title`
   - `TitleUserStatus`
   - `TitleHouseholdStatus`
   - derived summary data
2. Define a canonical UI-facing `TitleViewModel` / resolved title shape that includes:
   - title metadata
   - household summary
   - resolved member list
   - per-user statuses
   - household status
   - derived fields
3. Replace `memberOne/memberTwo/together` tracker types in shared code with:
   - user-keyed status records
   - explicit household-level fields
   - aggregate summary helpers
4. Add mapper utilities that build `TitleViewModel` from normalized documents.
5. Preserve deterministic `titleId` generation for `titles/{titleId}`.
6. Add deterministic helpers for `titleUserStatuses/{householdId}_{titleId}_{userId}`.

### 2. API contracts
1. Update `POST /api/titles/add` to accept explicit action semantics:
   - `add_title_only`
   - `mark_user_wants_to_watch`
   - `mark_user_watched`
   - `mark_household_wants_to_watch`
   - `mark_watched_together`
2. Update `PATCH /api/titles/[titleId]` to be action-based rather than raw field-patch based.
3. Make both `GET /api/titles/list` and `GET /api/titles/[titleId]` return the same canonical `TitleViewModel` shape.
4. Keep `GET /api/households/me`, but ensure it returns enough member data for dynamic labels and avatars.
5. Keep `POST /api/titles/[titleId]/refresh`, returning the same canonical `TitleViewModel` after refresh.
6. Define list filters in terms of current-user, household, and derived-state concepts rather than positional member slots.

### 3. Server logic
1. Build reusable server helpers to load household membership and validate that requested `userId` targets belong to the same household.
2. Implement shared read-path assembly:
   - load title docs
   - load member docs
   - load user status docs
   - load household status docs
   - derive summaries
   - return `TitleViewModel`
3. Refactor `POST /api/titles/add` to:
   - create the `titles` doc if missing
   - create or update one `titleUserStatuses` doc when the action is user-level
   - create or update one `titleHouseholdStatuses` doc when the action is household-level
   - return canonical view data
4. Refactor `PATCH /api/titles/[titleId]` to support cross-user edits within the same household, with server-side household membership validation.
5. Refactor `GET /api/titles/list` to bulk-fetch household-scoped `titles`, `titleUserStatuses`, `titleHouseholdStatuses`, and member docs, then group in memory by `titleId`.
6. Remove the current per-title status fetch pattern and remove all server assumptions about member ordering except inside best-effort migration logic.

### 4. Migration approach
1. Do not build a complex migration framework.
2. Stop writing new data to legacy `titleStatuses`.
3. If existing data needs to be preserved, run a one-time best-effort backfill:
   - read old `titleStatuses`
   - map `memberOne` to `household.memberIds[0]`
   - map `memberTwo` to `household.memberIds[1]`
   - map `together` into explicit household-level fields only where the old meaning is clear
4. Skip and log ambiguous records instead of trying to infer historical truth.
5. Prefer simplicity over perfect historical fidelity.
6. After the new UI and routes are live, remove fallback reads from `titleStatuses` rather than carrying dual-read logic long-term.

### 5. UI refactor sequence
1. Replace household context APIs that expose `personLabels.memberOne/memberTwo` with dynamic member data plus helpers for:
   - current user
   - other members
   - aggregate household summaries
2. Update search quick actions first:
   - solo and 2-member UX optimized for current-user plus household actions
   - no forced target-member picker in the common flow
3. Refactor title detail page next:
   - render household state explicitly
   - render per-member state from resolved members
   - make this the primary surface for cross-user editing
4. Refactor poster cards and list item summaries:
   - 1-2 member households can show specific member chips
   - 3+ member households should show aggregate counts instead of full per-member chips
5. Refactor home page sections around current-user, household, and derived summaries rather than `memberOne/memberTwo/together`.
6. Refactor library filters last to consume the new list contract and generate member-specific filters dynamically where appropriate.

### 6. Acceptance checklist
- No shared tracker type or UI component depends on `memberOne`, `memberTwo`, or `together`.
- Normalized Firestore storage is used for writes.
- Both list and detail endpoints return the same canonical `TitleViewModel` shape.
- `POST /api/titles/add` and `PATCH /api/titles/[titleId]` use action-based semantics.
- Cross-user editing works only for members of the same household and is enforced server-side.
- Solo households feel first-class in search, home, library, and title detail.
- Two-member households retain fast, legible per-member UX.
- Three-plus-member households work without schema changes and use aggregate card summaries.
- `watchedTogether` is explicit and never inferred.
- Derived fields use current household membership.
- `GET /api/titles/list` bulk-fetches household-scoped data and does not do one status lookup per title.
- Legacy `titleStatuses` writes are removed.
- Best-effort backfill skips and logs ambiguous legacy records instead of inventing data.

---

## Acceptance Criteria

1. A single-user household can fully use the app without awkward two-person assumptions.
2. A two-person household can track per-user watched and want-to-watch states.
3. A household can explicitly mark a title as household-wanted.
4. A household can explicitly mark a title as watched together.
5. The app correctly derives `allMembersWatched`.
6. No UI labels depend on `memberOne/memberTwo`.
7. API responses return canonical resolved title data assembled from normalized user and household status docs.
8. Search/add flow still feels fast and low-friction.
9. The title detail page clearly separates household state from member state.
10. Firestore writes use the new normalized structure.

---

## Implementation Guidance for Codex

### High priority
- Prioritize correctness of the normalized model
- Keep the UX low-friction
- Default actions to current user where appropriate
- Dynamically render member names from real user records

### Important product distinction
Do not treat these as equivalent:
- all members watched
- watched together
- household wants to watch

They are separate concepts and should remain separate in both data and UI.

### Refactor mandate
The app must no longer be shaped around a fixed two-member household, even if the initial UI experience is optimized for one or two users.

---

## Suggested Codex Prompt

```md
Refactor the current media tracker app from a fixed `memberOne / memberTwo / together` title status model into a normalized household-aware model.

Requirements:
- Keep the current auth and onboarding flow: signed-in users with no household go to onboarding, where they can create or join a household.
- A one-person household must be fully supported.
- A household may contain multiple users.
- Replace the current `titleStatuses` structure with:
  - `titleUserStatuses` for per-user title state
  - `titleHouseholdStatuses` for household-level title state
- Per-user state must support:
  - `wantsToWatch`
  - `watched`
  - optional `watchedAt`, `rating`, `notes`
- Household-level state must support:
  - `householdWantsToWatch`
  - `watchedTogether`
  - optional `watchedTogetherAt`
- Derived values such as `allMembersWatched` must be computed from household membership and per-user statuses.
- Remove all UI and API assumptions tied to `memberOne/memberTwo` or household member ordering.
- Update `/api/titles/add`, `/api/titles/[titleId]`, `/api/titles/list`, and the title detail/search/library/home UI to use the new normalized model.
- Keep title metadata in `titles/{titleId}` and scope all data by `householdId`.
- Default quick actions to the current signed-in user unless a household-level action is selected.
- Make the UI feel natural for both solo users and two-person households.
```
