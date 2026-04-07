# Shared Movie & TV Tracker - Implementation Plan

## 1. Plan Scope

This plan implements v1 from `projectspec.md` using:

- Next.js (App Router) + React + TypeScript + Tailwind CSS
- Firebase Authentication + Cloud Firestore
- TMDb API for movie/TV metadata search

Primary target: two authenticated users (Matt and Jessica) in one shared household with explicit named statuses.

## 2. Delivery Strategy

Build in vertical slices so each milestone is usable end-to-end:

1. Foundation + auth
2. Household creation/join
3. Search + save titles
4. Status tracking actions
5. Library + detail views
6. Polish + hardening + release

Each slice includes:

- UI
- Firestore data writes/reads
- Security rules validation
- Manual QA checklist

## 3. Technical Architecture

## 3.1 Frontend App

- Framework: Next.js App Router (`app/`)
- Rendering strategy:
- Authenticated app pages: client-side data hooks with optimistic updates where safe
- Public auth pages: mostly static/client hybrid
- State approach:
- Firebase auth state listener for user session
- React Query (or equivalent) for server-state caching and invalidation
- Local UI state for filters/modals/chips
- Styling:
- Tailwind CSS + reusable component primitives
- Poster-first cards, chip controls, and responsive layouts

## 3.2 Backend/Data

- Firebase Auth providers:
- Google
- Email/password
- Firestore collections:
- `users`
- `households`
- `titles`
- `titleStatuses`
- Access model:
- User must belong to household to read/write household-scoped docs
- Deny cross-household access by rules

## 3.3 External Integration

- TMDb API:
- Search endpoint for combined movie/TV results
- Detail endpoint to enrich saved title fields when needed
- Add server-side proxy route in Next.js to protect TMDb key and normalize response

## 4. Repository Setup Plan

## 4.1 Project Bootstrap

1. Initialize Next.js TypeScript app with Tailwind.
2. Add dependencies:

- `firebase`
- optional data cache lib (`@tanstack/react-query`)
- schema validation (`zod`)
- class utilities (`clsx`, `tailwind-merge`)

3. Add lint/format/test setup:

- ESLint
- Prettier
- Vitest + Testing Library

## 4.2 Environment Configuration

Add `.env.local` variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `TMDB_API_KEY` (server-only)
- `TMDB_BASE_URL` (optional override)

## 4.3 Folder Structure

Proposed layout:

```txt
app/
  (auth)/sign-in/page.tsx
  onboarding/page.tsx
  home/page.tsx
  library/page.tsx
  search/page.tsx
  title/[id]/page.tsx
  settings/page.tsx
  api/tmdb/search/route.ts
components/
  auth/
  layout/
  search/
  library/
  title/
  status/
lib/
  firebase/
  tmdb/
  firestore/
  auth/
  validation/
types/
```

## 5. Data Modeling Plan

## 5.1 Firestore Documents

Implement the spec-defined schema with explicit names:

- `users/{uid}`
- `households/{householdId}`
- `titles/{titleId}` (household-scoped cached metadata)
- `titleStatuses/{titleId}` (same key as title for straightforward joins)

## 5.2 Key Constraints

1. One title record per household + TMDb ID + media type.
2. Status doc kept separate from metadata doc.
3. `watchedBy.together` is independent from `watchedBy.matt` + `watchedBy.jessica`.
4. Allow multi-state coexistence (e.g., Matt watched + Jessica wants).

## 5.3 ID/Uniqueness Strategy

- Use deterministic doc id for `titles`:
- `titleKey = ${householdId}_${mediaType}_${tmdbId}`
- Reuse same key for `titleStatuses`
- This prevents duplicate adds and simplifies upserts.

## 6. Firestore Security & Index Plan

## 6.1 Security Rules

Implement rules for:

1. `users`: user can read/write only own doc.
2. `households`: allow read/update only if `request.auth.uid` in `memberIds`.
3. `titles` and `titleStatuses`:

- read/write only when `resource.data.householdId` matches signed-in user household membership
- enforce immutable ownership fields where needed (`householdId`, `tmdbId`, `mediaType`).

## 6.2 Indexes

Create composite indexes for library queries:

- `titles`: `householdId + mediaType + updatedAt desc`
- `titleStatuses`: `householdId + updatedAt desc`
- optional filter support indexes depending on query strategy

## 7. Feature Implementation Phases

## Phase 1 - Foundation & Authentication

### Build

1. Firebase app initialization utilities.
2. Auth provider wrapper and session listener.
3. `/sign-in` page:

- Google sign-in button
- Email/password sign-up and sign-in

4. Route guard middleware/layout redirect logic.

### Done criteria

- User can authenticate and session persists after reload.
- Unauthenticated users are redirected to `/sign-in`.

### Tests

- Unit tests for auth helpers.
- Basic auth page render + button action tests.

## Phase 2 - Household Onboarding

### Build

1. Create user doc on first sign-in.
2. `/onboarding` flow:

- Create household (first user)
- Join household by invite code/link (second user)

3. Persist `householdId` on user profile.
4. Add invite token generation and validation logic.

### Done criteria

- Two accounts can end up in same household.
- Existing household members visible in settings.

### Tests

- Firestore write tests for create/join logic.
- Guard tests: authenticated user with no household gets redirected to onboarding.

## Phase 3 - TMDb Search & Add

### Build

1. `/search` page with debounced input.
2. Server route `/api/tmdb/search`:

- Query TMDb for movie and TV
- Normalize response fields for UI

3. Search result cards (poster, title, year, type, overview).
4. Tap result opens action sheet:

- Watched by Matt/Jessica/Together
- Want Matt/Jessica/Together

5. Save flow:

- Upsert `titles/{titleKey}`
- Upsert `titleStatuses/{titleKey}` with selected state(s)

### Done criteria

- User can search and add movie/TV from results in 1-2 taps.
- Duplicate titles are prevented per household.

### Tests

- API route normalization tests.
- Add flow tests including duplicate prevention.

## Phase 4 - Status Tracking System

### Build

1. Reusable `StatusChipGroup` component with explicit labels.
2. Action handlers for toggles:

- `watchedBy.matt | jessica | together`
- `wantToWatchBy.matt | jessica | together`

3. Optimistic UI updates with rollback on failure.
4. Status summary badges for cards/list rows.

### Done criteria

- Status changes feel immediate and remain consistent after refresh.
- Together flags remain independent fields.

### Tests

- Unit tests for status update reducers/helpers.
- Integration tests for optimistic toggle + error rollback.

## Phase 5 - Library & Detail Experience

### Build

1. `/library` unified browsing screen:

- Poster grid default
- Optional compact list mode
- Filters: all, type, watched states, want states
- Sorting: recently added/updated, release date, alpha

2. `/title/[id]` detail page:

- Full metadata and all status sections
- Same action controls as search action sheet

3. `/home` dashboard:

- Recently added
- Recently watched together
- Our watchlist
- Matt/Jessica watchlists

### Done criteria

- Library filtering is fast and clear.
- Detail page fully reflects stored metadata + states.

### Tests

- Filter/sort logic tests.
- Page-level integration tests for detail read/write actions.

## Phase 6 - Settings, Polish, Release Readiness

### Build

1. `/settings` page:

- signed-in account info
- household name/members
- invite controls
- sign out

2. Empty states and loading/skeleton states.
3. Shared-action delight:

- subtle success animation on "watched together"

4. Responsive refinements for mobile + desktop.
5. Accessibility pass (keyboard + labels + color contrast).

### Done criteria

- End-to-end acceptance criteria from spec all pass.
- App is stable and visually polished across target devices.

### Tests

- Smoke e2e flows (auth -> search -> add -> status -> library filter).
- Accessibility checks on key screens.

## 8. Component Build List

Prioritized reusable components:

1. `AppShell` (nav/header/layout)
2. `SearchBar`
3. `FilterChipRow`
4. `PosterCard`
5. `TitleListRow`
6. `StatusChipGroup`
7. `AddActionSheet`
8. `EmptyStateCard`
9. `LoadingSkeletons`
10. `HouseholdInviteCard`

## 9. Testing Plan

## 9.1 Unit Tests

- Data mappers (TMDb -> app model)
- Deterministic title key generation
- Status toggle/update helpers
- Invite code parsing/validation

## 9.2 Integration Tests

- Firestore repository methods (mocked/emulator)
- Route guard behavior by auth/household state
- Search-add-status workflow in app UI

## 9.3 End-to-End Tests

Core scenarios:

1. User A signs in and creates household.
2. User B joins household.
3. Search movie, add to shared watchlist.
4. Mark same title watched together.
5. Filter library by watched together.
6. Open detail page and verify status persistence.

## 10. Observability & Quality Gates

Before release candidate:

1. No critical console/runtime errors on key flows.
2. Error boundaries added for top-level app segments.
3. Structured logging for failed search/add/status operations.
4. Basic performance checks:

- Search latency acceptable
- Library render smooth for expected data volume

## 11. Deployment Plan

## 11.1 Environments

- `dev`: local + Firebase emulator where feasible
- `staging`: deployed preview with staging Firebase project
- `prod`: final deployment on Vercel or Firebase Hosting

## 11.2 Release Checklist

1. Env vars configured in hosting provider.
2. Firestore rules/indexes deployed and verified.
3. TMDb key restricted and validated.
4. Acceptance criteria walkthrough completed with both user personas.

## 12. Risks & Mitigations

1. Risk: Firestore query/index mismatch causing slow/failed filters.

- Mitigation: lock query patterns early; add indexes in Phase 3-4.

2. Risk: Duplicate title race conditions on concurrent adds.

- Mitigation: deterministic document ids + transactional upsert.

3. Risk: Auth/onboarding state complexity.

- Mitigation: single source-of-truth user profile fetch and route guards.

4. Risk: TMDb rate limits/network failures.

- Mitigation: debounce search, cache responses briefly, graceful empty/error states.

## 13. Definition of Done (v1)

v1 is complete when all are true:

1. Two users can authenticate and share a household.
2. Search supports movies and TV with poster-rich results.
3. Save from search creates cached metadata without duplicates.
4. Explicit named statuses are editable from quick actions and detail page.
5. Library supports required filters and remains responsive.
6. Desktop/mobile experience is polished with clear loading and empty states.
7. Firestore rules prevent cross-household data access.
8. Core e2e smoke tests pass in staging.
