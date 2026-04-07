# UI/UX Improvement Suggestions

This project has a solid foundation. The data model is already richer than the UI, so the biggest opportunity is not necessarily adding more features, but making the existing experience feel more cinematic, personal, and rewarding. Right now it reads as a clean utility app; it could become a much more lovable shared space.

## Highest-Impact Suggestions

### 1. Give the app a stronger visual identity

The current look is clean, but very neutral. It feels closer to an admin dashboard than a media product.

- Introduce a more distinctive typography system.
- Replace the mostly-slate palette with a more intentional brand direction.
- Use layered backgrounds, gradients, and richer surfaces.
- Let posters and backdrops do more visual work across the app.

Key files:

- `app/globals.css`
- `components/layout/app-shell.tsx`

### 2. Make Home feel alive, not just functional

The home page currently works as a utility overview, but it does not yet create much excitement.

- Add a hero section such as "Tonight's pick" or "Continue deciding."
- Surface shared-focused content like "Both want to watch" and "Recently watched together."
- Add lightweight stats such as watched together this month or remaining shared watchlist items.
- Make the first screen feel like a shared media space, not just a launchpad.

Key file:

- `app/(app)/home/page.tsx`

### 3. Make Search the fastest, most satisfying flow

Search is central to the product, so it should feel especially polished.

- Use more human action copy like "Save for later," "I watched this," and "We watched this."
- Add recent searches or quick suggestions.
- Add stronger inline success feedback after adding a title.
- Consider keyboard-friendly selection and action flows to reduce friction.

Key files:

- `app/(app)/search/page.tsx`
- `components/search/search-result-card.tsx`

### 4. Replace dropdown-heavy browsing with faster filters

The library works, but three selects make it feel more utilitarian than inviting.

- Use filter chips or segmented controls instead of relying so heavily on dropdowns.
- Add more emotionally meaningful views like "Mine," "Ours," "Date night," or "Neither watched."
- Consider curated shelves in addition to a plain grid.

Key file:

- `app/(app)/library/page.tsx`

### 5. Make title pages more cinematic

The title detail page has access to richer metadata than it currently shows.

- Use `backdropPath` in the page hero.
- Show more metadata such as runtime, seasons, and vote average.
- Make ratings and notes more visible and rewarding to use.
- Present watched dates and household activity more clearly.

Key files:

- `app/(app)/title/[id]/page.tsx`
- `components/status/title-status-editor.tsx`

### 6. Celebrate shared watching more

The product spec is right that shared watching should feel special. Right now that state exists, but it is not especially celebrated in the UI.

- Give shared titles a more distinctive visual treatment.
- Show watched-together dates where available.
- Create a dedicated shared shelf or highlight rail.
- Add subtle celebratory feedback when both members mark the same title.

Key files:

- `components/library/poster-card.tsx`
- `components/status/title-status-editor.tsx`

### 7. Polish onboarding and household settings

These flows are clear, but still visually plain relative to the product goal.

- Make household creation and join flows feel more branded and guided.
- Add copy/share invite actions for invite codes.
- Consider a QR code for joining.
- Show household members as cards instead of a simple list.

Key files:

- `components/onboarding/onboarding-form.tsx`
- `app/(app)/settings/page.tsx`

### 8. Improve perceived speed and app feel

A lot of the major pages fetch on the client after mount, which can make the app feel slower than necessary even when it is working correctly.

- Move more initial page data work to the server where practical.
- Add route-level `loading.tsx` files for smoother transitions.
- Use better loading states to make navigation feel more premium.

Key files:

- `app/(app)/home/page.tsx`
- `app/(app)/library/page.tsx`
- `app/(app)/search/page.tsx`
- `app/(app)/title/[id]/page.tsx`
- `app/(app)/settings/page.tsx`

## Best First Three Upgrades

If choosing the highest-value first steps, these are the three I would prioritize:

1. Create a stronger cinematic visual system.
2. Redesign Home to tell a better story about the household and shared activity.
3. Make Search/Add dramatically faster and more delightful.

## Detailed Implementation Plan

This plan is organized to minimize rework. It starts with shared foundations that affect every screen, then moves into the highest-value product surfaces, then finishes with deeper polish and architectural improvements.

The best execution order is:

1. Establish visual and interaction foundations.
2. Improve the highest-frequency user flows.
3. Upgrade the most emotionally important screens.
4. Finish with system-wide speed, consistency, and polish.

## Household Modes We Must Design For

This app should be treated as supporting three first-class household modes, not one "main" mode plus edge cases.

### 1. Solo household

This is not a degraded version of the app. It is a legitimate primary use case.

The experience should feel like:

- a polished personal tracker
- simple and low-friction
- never cluttered by irrelevant shared-state language

Rules:

- Prefer language like "My watchlist," "Watched," and "My notes."
- Hide or downplay shared-only concepts when they do not apply.
- Do not show "watched together" as a dead or awkward state on key screens.
- Empty states should feel intentional for a solo user, not like they are waiting for another member.

### 2. Two-member household

This is the clearest shared experience, but it should not define the whole product.

The experience should support:

- what I watched
- what the other member watched
- what we both watched independently
- what we watched together as a shared event
- what I want to watch
- what the other member wants to watch
- what both of us want to watch

Rules:

- It is okay to use more personal language here, including "both" or "we," if the household really has two members.
- The UI should clearly distinguish:
  - all members watched
  - watched together
  - only some members watched

### 3. Three-or-more-member household

This must feel deliberate, not like a stretched couples app.

The experience should support:

- per-member watched and want-to-watch state
- derived group summaries
- member counts and participant visibility
- shared watch activity without assuming only two people matter

Rules:

- Avoid couple-specific language like "both" unless exactly two members exist.
- Prefer labels like "Shared watchlist," "All members watched," "3 members watched," or "2 members want to watch."
- Use member summaries, stacked avatars, counts, and expandable participant lists instead of trying to show every member the same way in every compact card.

## Product/Engineering Decision: `watchedTogether` For 3+ Households

Decision status: accepted (documentation-level decision, no model migration in this step).

Decision:

- Long-term target: move to a true participant-aware shared-watch event model for 3+ household correctness.
- Short-term implementation path: introduce participant-aware shared-watch metadata on the current household status model as a minimal compatibility step.
- Keep the existing boolean as a compatibility field during migration.

### Current model and route reality (as implemented now)

- Data model:
  - `TitleHouseholdStatusDocument` stores `watchedTogether: boolean` and optional `watchedTogetherAt` (`lib/tracker/types.ts`).
  - No participant IDs and no event history exist in the canonical status model.
- API routes:
  - `POST /api/titles/add` supports `mark_watched_together` and only writes household-level boolean/date (`app/api/titles/add/route.ts`).
  - `PATCH /api/titles/[titleId]` supports `set_watched_together` and only writes household-level boolean/date (`app/api/titles/[titleId]/route.ts`).
  - No route accepts participant lists for a shared-watch action.
- View model:
  - `allMembersWatched` and `someMembersWatched` are derived from per-member watched statuses.
  - `watchedTogether` is separate and explicit (`lib/tracker/view-model.ts`, `lib/tracker/shared.ts`).
- UI usage:
  - Search quick action exposes `Mark watched together` for any non-solo household (`components/search/search-result-card.tsx`).
  - Title editor shows a single `Watched together` toggle (`components/status/title-status-editor.tsx`).
  - Detail page and cards surface `Watched together` as a single flag (`app/(app)/title/[id]/page.tsx`, `components/library/poster-card.tsx`).

### Why this is ambiguous in 3+ households

With only a household-level boolean:

- We cannot represent which members participated.
- We cannot represent multiple shared watch sessions over time.
- We cannot distinguish:
  - "all members watched together once"
  - "some members watched together"
  - "someone toggled together but members later changed"
- A 3+ UI cannot truthfully show participant-level statements.

### Option analysis

| Option | Pros | Cons |
| --- | --- | --- |
| Keep boolean semantics | Simple implementation, no schema migration, low write/query cost | 3+ ambiguity persists, blocks truthful participant UI, limits history/features, high risk of misleading copy |
| Participant-aware shared-watch event model | Truthful for 3+, supports participant chips/counts/history, aligns with first-class 3+ requirement, enables richer recommendations | Requires schema + API changes, migration/backfill plan, more complex write paths and UI states |

### Recommendation details

Adopt participant-aware shared-watch events as the long-term product truth.

Implementation should happen in two layers:

1. MVP compatibility layer:
   - extend the current household status model with participant-aware together metadata
   - support truthful 3+ UI for the current or most recent together-watch state
   - do not claim event-history support yet
2. Later full event model:
   - support multiple shared-watch events over time
   - support richer shared-watch history and timelines
   - decouple shared-watch events from the single current household status document

Suggested target concept:

- A shared-watch event includes:
  - `titleId`
  - `householdId`
  - `participantUserIds[]`
  - `watchedAt` (event date/time)
  - optional `createdBy`, `notes`
- Keep `allMembersWatched` derived from per-user watched statuses.
- Do not redefine `allMembersWatched` to mean togetherness.
- During migration, keep current `watchedTogether` boolean as a compatibility summary (`hasSharedWatchEvent`) until all read surfaces are updated.

### UI truth boundaries by approach

If we keep boolean-only semantics:

- UI can truthfully imply:
  - "This title has been marked as a household together watch moment."
- UI cannot truthfully imply:
  - exactly who watched together
  - how many watched together
  - whether all members were present
  - more than one together event

If we adopt participant-aware events:

- UI can truthfully imply:
  - who watched together
  - counts like "3 members watched together"
  - event history/timeline ("watched together on ...")
  - partial-participation patterns for 3+ households
- UI still must not imply:
  - all members participated unless participant set size equals household size at event time

### Short-term guardrails before migration

- Keep current separation: `watchedTogether` != `allMembersWatched`.
- In 3+ UI, avoid participant-specific copy until event model lands.
- Prefer wording like `Watched together (household event)` over claims about specific members.

### MVP Implementation Proposal: Participant-Aware `watchedTogether` Compatibility Layer (Minimum Viable)

Goal: resolve subgroup ambiguity for 3+ households with the smallest possible change to the current model and routes.

Non-goals for MVP:

- full event history
- multiple shared-watch sessions per title
- a separate shared-watch events collection

This MVP stores one explicit participant set for the current or most recent together-watch state. It is not the final event model by itself.

#### 1) Smallest schema change

Keep the existing `titleHouseholdStatuses` document and add one optional field:

```ts
type TitleHouseholdStatusDocument = {
  titleId: string;
  householdId: string;
  householdWantsToWatch: boolean;
  watchedTogether: boolean;
  watchedTogetherAt?: string;
  watchedTogetherParticipantUserIds?: string[]; // NEW (optional)
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
  updatedBy?: string;
};
```

MVP semantics:

- `watchedTogether === false`
  - no together event is active
  - `watchedTogetherAt` and `watchedTogetherParticipantUserIds` should be cleared
- `watchedTogether === true` and `watchedTogetherParticipantUserIds` present
  - explicit participant-aware shared watch event
- `watchedTogether === true` and participant field missing
  - legacy/unknown participants (backward-compatibility state only)

Why this is minimal:

- No new collection
- No cross-document joins beyond current model
- Backward-compatible with existing boolean writes

#### 2) Required API changes

Files:

- `app/api/titles/add/route.ts`
- `app/api/titles/[titleId]/route.ts`
- `lib/tracker/types.ts` (`AddTitleRequest`, `PatchTitleAction`)

API contract additions:

- Add optional `participantUserIds?: string[]` when action is `mark_watched_together` / `set_watched_together`.

Validation rules:

- IDs must belong to the same household.
- Deduplicate and sort IDs server-side before persisting.
- If `watchedTogether` is set to true and participant IDs are provided, require at least 2 unique participants.
- If `watchedTogether` is set to false, clear participant IDs and `watchedTogetherAt`.

Backward compatibility behavior:

- Keep accepting current boolean-only together writes for now.
- For boolean-only writes in 3+ households, persist legacy/unknown participant state (do not fabricate participant IDs).

#### 3) Required view-model changes

Files:

- `lib/tracker/types.ts` (`TitleViewModel.household`)
- `lib/tracker/shared.ts` (`normalizeHouseholdStatus`)
- `lib/tracker/view-model.ts`

Add to `TitleViewModel.household`:

```ts
{
  watchedTogether: boolean;
  watchedTogetherAt?: string;
  watchedTogetherParticipantUserIds?: string[]; // NEW
  watchedTogetherParticipantCount: number; // NEW derived
  watchedTogetherParticipantsKnown: boolean; // NEW derived
}
```

Derived logic:

- `watchedTogetherParticipantsKnown = watchedTogether && Array.isArray(participantUserIds)`
- `watchedTogetherParticipantCount = participantUserIds?.length ?? 0`

Why add known/count:

- Keeps UI truthful without repeatedly re-deriving ambiguity checks.

#### 4) UI implications (minimum)

Files impacted first:

- `components/status/title-status-editor.tsx`
- `components/search/search-result-card.tsx`
- `app/(app)/title/[id]/page.tsx`
- `components/library/poster-card.tsx`
- `app/(app)/home/page.tsx` (shared rails labels)

MVP UI behavior:

- Solo:
  - hide together controls
- Two-member:
  - keep one-tap together action
  - client can auto-send both member IDs
- Three-or-more-member:
  - together action must collect participant selection before submit
  - render count-aware text when participants are known (example: `Watched together (3 members)`)
  - render fallback text when participants unknown (example: `Watched together (participants not recorded)`)

Truth boundary:

- UI may list participant names only when `watchedTogetherParticipantsKnown === true`.

#### 5) Migration and fallback considerations

Migration strategy (safe and minimal):

1. Deploy schema + API + view-model support for participant IDs (backward compatible).
2. Backfill existing records conservatively:
   - if `watchedTogether === true`, do not fabricate participant IDs unless historical membership at event time can be proven from trustworthy data.
   - in the expected current state of this app, treat most legacy rows as participant-unknown.
   - if `watchedTogether === true` and historical participant certainty is unavailable, leave participant IDs unset (unknown), even for 2-member households.
3. Update UI to send participant IDs for 3+ flows.
4. After UI rollout, optionally make participant IDs required for 3+ together writes.

Fallback behavior during rollout:

- Old clients continue functioning with boolean-only together writes.
- New UI handles unknown legacy rows explicitly and avoids participant claims.

Testing updates required:

- Route tests for together writes with and without participant IDs.
- View-model tests for known vs unknown participant states.
- UI tests for:
  - 2-member auto-selection behavior
  - 3+ participant picker behavior
  - legacy unknown participant rendering

### Phase 0: Prep and Alignment

Goal: create a clean implementation path before changing UI behavior.

Tasks:

- Create a short design direction note at the top of this file or in a companion doc with:
  - intended visual tone
  - color direction
  - typography direction
  - rules for cards, chips, buttons, spacing, and motion
- Capture screenshots of the current major screens for before/after comparison:
  - sign-in
  - onboarding
  - home
  - search
  - library
  - title detail
  - settings
- Decide whether to keep the app fully light-mode for now or support a dark theme later.
- Review current components and identify which ones should become reusable primitives instead of one-off page markup.
- Create a household-mode UX matrix covering:
  - solo household
  - two-member household
  - three-or-more-member household
- For each major screen, define:
  - what appears in solo mode
  - what appears in two-member mode
  - what changes in 3+ mode
- Define copy rules for:
  - "my"
  - "our"
  - "both"
  - "all members"
  - "watched together"
  - "shared watchlist"
- Decide whether larger households need participant-aware shared watch events now or in a later phase.

Suggested outputs:

- One short design brief
- One checklist of shared primitives to create or refactor
- One household-mode behavior matrix

### Phase 0 Deliverable: Current-Code Household-Mode Matrix (Code Audit)

Audit basis (current implementation):

- `app/(auth)/sign-in/page.tsx`
- `components/auth/sign-in-form.tsx`
- `app/onboarding/page.tsx`
- `components/onboarding/onboarding-form.tsx`
- `app/(app)/home/page.tsx`
- `app/(app)/search/page.tsx`
- `app/(app)/library/page.tsx`
- `components/search/search-result-card.tsx`
- `components/library/poster-card.tsx`
- `app/(app)/title/[id]/page.tsx`
- `components/status/title-status-editor.tsx`
- `app/(app)/settings/page.tsx`
- `lib/tracker/types.ts`
- `app/api/titles/add/route.ts`
- `app/api/titles/[titleId]/route.ts`

#### Data-model reality check before UI polish

The current data model is not sufficient for a smooth participant-aware 3+ household "watched together" experience.

- `watchedTogether` is a single household-level boolean (`TitleHouseholdStatusDocument.watchedTogether`).
- `watchedTogetherAt` is a single optional date.
- There is no participant list, no subgroup representation, and no multiple shared-watch events per title.
- `allMembersWatched` is correctly derived from per-member watched flags and is separate from `watchedTogether`.

Because of this, any 3+ UI that implies "which members watched together" would be inaccurate today.

#### Screen Matrix

#### 1) Sign-in
Files: `app/(auth)/sign-in/page.tsx`, `components/auth/sign-in-form.tsx`

| Household mode | What appears | Copy changes by mode | Hidden / downplayed / emphasized |
| --- | --- | --- | --- |
| Solo | Same sign-in/sign-up form, Google auth, email auth. | Current copy is generic shared-language ("shared movie and TV tracker"). Keep product-level copy, but add solo-inclusive hint (example: "for your household, including just you"). | No household state shown yet; keep mode-specific UI hidden until after auth. |
| Two-member | Same as solo. | Keep shared language; avoid pair-specific promises on sign-in itself. | Household-specific CTAs remain hidden here. |
| Three-or-more-member | Same as solo. | Keep neutral "household" language; avoid pair framing. | Household-specific detail remains hidden until household context exists. |

Current app already handles this correctly:

- No pair-only wording like "both" in sign-in UI.
- Sign-in flow routes to onboarding or home based on actual profile household state.

Current assumptions that still need fixes:

- Sign-up helper text ("visible to members in your household") is slightly awkward before household context exists and should use neutral pre-household wording instead.

#### 2) Onboarding
Files: `app/onboarding/page.tsx`, `components/onboarding/onboarding-form.tsx`

| Household mode | What appears | Copy changes by mode | Hidden / downplayed / emphasized |
| --- | --- | --- | --- |
| Solo | Create and join cards are both shown. | Change create-path helper copy to explicitly support solo setup ("Start with just you; invite later"). | Downplay join card for first-time solo path; emphasize create path. |
| Two-member | Same create/join cards. | Keep "Create household" and "Join household"; pair-specific examples can be shown only when household size is known to be 2. | Emphasize invite-code sharing immediately after create/join. |
| Three-or-more-member | Same create/join cards. | Keep "household" language; avoid pair wording. Add "invite multiple members" language. | Emphasize invite management for ongoing growth. |

Current app already handles this correctly:

- Create/join flows are household-size-agnostic and do not hardcode couple language.
- Join supports invite query param prefill and normalized invite code handling.

Current assumptions that still need fixes:

- Placeholder `"Our Household"` is pair-coded and should be neutral.
- Created invite code UI now supports immediate copy/share actions before navigating to `/home`.

#### 3) Home
Files: `app/(app)/home/page.tsx`

| Household mode | What appears | Copy changes by mode | Hidden / downplayed / emphasized |
| --- | --- | --- | --- |
| Solo | `My watchlist`, `Recently watched`, `Recently added`. | Current copy is mostly correct for solo ("My ..."). Keep this. | Correctly hide shared rails (`Household watchlist`, `Recently watched together`). Emphasize personal next actions. |
| Two-member | Shared rails plus personal rails. | Allow pair-specific language only here (example future rename of `Household watchlist` to `Shared watchlist` or pair-specific variant). | Emphasize shared rails and together activity above personal rails. |
| Three-or-more-member | Currently same as two-member mode. | Use count-aware shared language ("Shared watchlist", "All members watched", "Partially watched"). | Downplay pair framing; emphasize group summaries and count-driven rails. |

Current app already handles this correctly:

- Solo mode has intentional branch (`isSoloHousehold`) and hides together-specific sections.
- Shared sections are shown only when member count is greater than 1.

Current assumptions that still need fixes:

- Two-member and 3+ modes currently share the same section strategy; 3+ needs additional group-summary sections.
- "Recently watched together" for 3+ is powered by a boolean that does not capture participants.

#### 4) Search
Files: `app/(app)/search/page.tsx`, `components/search/search-result-card.tsx`

| Household mode | What appears | Copy changes by mode | Hidden / downplayed / emphasized |
| --- | --- | --- | --- |
| Solo | Search input, add button, quick actions without `Mark watched together`. | Prefer personal-action copy ("Add to my watchlist", "Mark as watched"). | Correctly hide together action in solo mode. |
| Two-member | Includes together quick action. | Pair-appropriate action labels can be used only here for shared watch actions. | Emphasize one-tap shared actions. |
| Three-or-more-member | Currently same quick actions as two-member mode. | Keep neutral group wording; avoid implying all members participated when using together action. | Downplay "together" as precision state until participant-aware model exists. |

Current app already handles this correctly:

- Solo households do not see the `Mark watched together` quick action.
- Add/search flow is mode-safe at a baseline level (no forced pair copy).

Current assumptions that still need fixes:

- 3+ mode still gets the same together action semantics as two-member mode, but model cannot represent subgroup participants.
- Page-level copy does not yet adapt by household size.

#### 5) Library
Files: `app/(app)/library/page.tsx`, `components/library/poster-card.tsx`

| Household mode | What appears | Copy changes by mode | Hidden / downplayed / emphasized |
| --- | --- | --- | --- |
| Solo | Standard filter list; poster cards effectively personal. | Prefer personal-first labels where possible ("My watchlist", "Watched"). | Downplay shared-only filters when member count is 1. |
| Two-member | Full shared filters plus member-specific filters (`Watched by {member}`, `Wants to watch: {member}`). Poster cards show per-member badges. | Pair-safe shared labels are fine here. | Emphasize per-member clarity and together states. |
| Three-or-more-member | Member-specific dropdown options are hidden; cards switch to aggregate `Watched x/y`, `Wants x/y`. | Use count-aware labels for group views. | Correctly downplays crowded per-member chips on cards; should emphasize group and member drill-down filters. |

Current app already handles this correctly:

- Poster cards intentionally switch to aggregate summaries for 3+ to avoid badge clutter.
- `all_members_watched` and other derived-state filters are available and separate from `watched_together`.

Current assumptions that still need fixes:

- `isCompactHousehold = members.length <= 2` hides member-specific filters entirely for 3+, which blocks key 3+ workflows.
- Library filter UX still assumes small-household patterns for the richest member-specific controls.

#### 6) Title Detail
Files: `app/(app)/title/[id]/page.tsx`, `components/status/title-status-editor.tsx`

| Household mode | What appears | Copy changes by mode | Hidden / downplayed / emphasized |
| --- | --- | --- | --- |
| Solo | Household summary plus status editor; watched-together toggle hidden. | Keep personal wording in editor fields ("My rating", "My notes"). | Correctly hide watched-together control in solo mode. |
| Two-member | Household summary and full member toggles; together toggle visible. | Pair-appropriate clarification can be used only here when needed. | Emphasize distinction between `all members watched` and `watched together`. |
| Three-or-more-member | Same editor pattern as two-member: flat member chips + together toggle. | Use count-aware and participant-precision-safe copy. | Downplay participant precision claims for together status until model supports it. |

Current app already handles this correctly:

- `watchedTogether` is kept separate from `allMembersWatched` in both UI and model.
- Solo mode hides together controls and avoids dead toggles.

Current assumptions that still need fixes:

- 3+ together UI suggests a single shared-event state but cannot show participant subset.
- Single `watchedTogetherAt` date cannot represent repeated group events.
- Solo detail currently shows a full "Members" section in addition to "Current User", which is redundant.

#### 7) Settings
Files: `app/(app)/settings/page.tsx`

| Household mode | What appears | Copy changes by mode | Hidden / downplayed / emphasized |
| --- | --- | --- | --- |
| Solo | Account card + household card + single-member list. | Change "shown to other members in your household" copy to solo-aware wording when no other members exist. | Emphasize invite actions so solo users can grow household later. |
| Two-member | Household card with invite code and members list. | Shared language is fine; avoid pair-only wording unless exactly two members. | Emphasize member identity and invite share controls. |
| Three-or-more-member | Same structure as two-member mode. | Use group-management language ("members", counts, invite tools). | Emphasize scalable member presentation (cards, avatars, counts) over plain list. |

Current app already handles this correctly:

- Household data is rendered from actual member array and scales to any count.
- No hardcoded pair-only copy in settings sections.

Current assumptions that still need fixes:

- Settings member presentation is a plain text list; it does not scale gracefully for larger households.
- Invite code is visible but not optimized for share/copy workflows.

### Phase 0 Deliverable: Household-Size Copy Spec

This section defines deterministic copy rules for household-size-sensitive language so developers and AI agents use the same terms consistently.

#### Runtime Inputs

- `memberCount = household.members.length`
- `isSolo = memberCount === 1`
- `isTwoMember = memberCount === 2`
- `isThreePlus = memberCount >= 3`
- `allMembersWatched = record.household.allMembersWatched`
- `watchedTogether = record.household.watchedTogether`
- `watchedCount = record.household.watchedCount`
- `someMembersWatched = record.household.someMembersWatched`
- `householdWatchlist = record.household.wantsToWatch`

#### Rule 1: `my`

- Use for current-user-only scope in every household size.
- Use with fields derived from `record.currentUser` or one-member personal actions.
- Examples:
  - `My watchlist`
  - `Watched by me`
  - `My rating`
- Do not use for household-level booleans or derived multi-member states.

#### Rule 2: `our`

- Use only for household-level scope when `memberCount >= 2`.
- Do not use in solo mode.
- Prefer more explicit labels (`Shared watchlist`, `Household`) when ambiguity is possible.
- In solo mode, replace with `my` or remove collective language.

#### Rule 3: `both`

- Use only when `isTwoMember` is true.
- Use only when the statement semantically means exactly 2 of 2 members.
- Examples:
  - `Both want to watch`
  - `Both watched`
- Never use when `memberCount !== 2`.
- Never use as shorthand for "all members" in 3+ households.

#### Rule 4: `all members`

- Use when `memberCount >= 2`.
- Must map to derived all-member completion (`allMembersWatched` or equivalent all-member derived state).
- Example:
  - `All members watched`
- In solo mode, hide or replace with personal wording (`Watched`), because `all members` is tautological/noisy.

#### Rule 5: `watched together`

- Use only when `memberCount >= 2`.
- Must map to explicit `watchedTogether` state.
- Must never be inferred from `allMembersWatched`.
- For 3+ households in current model, do not imply participant-level precision.
- Allowed 3+ explanatory copy:
  - `Watched together (household event)`
  - `Participants are not tracked yet`
- In solo mode, hide this state rather than rendering "hidden for solo household" text.

#### Rule 6: `shared watchlist`

- Preferred label for household-level watchlist when `memberCount >= 2`.
- Must map to explicit household-level watchlist state (`householdWatchlist`).
- Keep distinct from "multiple members want to watch" unless the UI explicitly says it is count-derived.
- In solo mode, replace with `My watchlist`.

#### Rule 7: `partially watched`

- Use only when `memberCount >= 2` and `someMembersWatched === true`.
- Must mean:
  - at least one member watched
  - not all members watched
- Do not use as a synonym for "watched together."

#### Rule 8: `watched by anyone`

- Use only when `memberCount >= 2`.
- Must map to `watchedCount > 0`.
- In solo mode, replace with `Watched` or `Watched by me`.
- Do not use when the intent is member-specific filtering.

#### Rule 9: `watched by specific member`

- Use format: `Watched by {memberLabel}`.
- `{memberLabel}` should come from household member label resolution (`You` for current user where appropriate).
- Available for `memberCount >= 2`, including 3+ households.
- Do not gate this to only two-member households.

#### Quick Mapping Table

| Intended meaning | Solo | Two-member | Three-or-more-member |
| --- | --- | --- | --- |
| Current user wants list | `My watchlist` | `My watchlist` | `My watchlist` |
| Household-level wants list | Hide or fold into personal | `Shared watchlist` (or `Our watchlist`) | `Shared watchlist` |
| Exactly all members done | Hide/downplay | `Both watched` or `All members watched` | `All members watched` |
| Explicit shared event | Hide | `Watched together` | `Watched together (household event)` |
| Some but not all watched | Hide | `Partially watched` | `Partially watched` |
| At least one watched | `Watched` | `Watched by anyone` | `Watched by anyone` |
| Member-specific watch filter | Optional (`Watched by me`) | `Watched by {member}` | `Watched by {member}` |

### Current Code Audit: Concrete Copy Changes Backlog

These are concrete places in the current code where copy should eventually change to match the spec above.

| File | Current copy | Why it should change | Target copy behavior |
| --- | --- | --- | --- |
| `components/onboarding/onboarding-form.tsx:133` | `Our Household` (placeholder) | Uses `our` by default before household size is known; pair-coded default | Use neutral placeholder like `Household name` or `My household`; avoid automatic `our` |
| `components/auth/sign-in-form.tsx:142` | `This name will be visible to members in your household.` | Household size is not knowable yet on sign-up, so household-mode-conditional wording is premature | Use neutral helper text at sign-up time, such as `This is the name shown in your account and household.` Household-size-specific wording can happen after onboarding |
| `app/(app)/home/page.tsx:136` | `Household watchlist` | Spec prefers `shared watchlist` for `memberCount >= 2` | Rename by mode: solo hidden, 2+ `Shared watchlist` |
| `app/(app)/home/page.tsx:138` | `Recently watched together` | For 3+, current model lacks participants; copy can imply precision | Keep for 2-member; for 3+ add household-event wording or explanatory helper |
| `app/(app)/library/page.tsx:147` | `Household watchlist` | Inconsistent with preferred term | Rename to `Shared watchlist` for `memberCount >= 2` |
| `app/(app)/library/page.tsx:149` | `Watched together` | 3+ needs explicit non-participant-aware phrasing | Keep for 2-member; 3+ use `Watched together (household event)` or equivalent helper |
| `app/(app)/library/page.tsx:150` | `All members watched` shown unconditionally | Noisy/tautological in solo mode | Hide/downplay in solo mode |
| `app/(app)/library/page.tsx:151` | `Watched by anyone` shown unconditionally | In solo mode this is equivalent to `Watched by me` | Hide in solo or relabel to `Watched` |
| `app/(app)/library/page.tsx:153-168` | Member-specific filters only when `members.length <= 2` | 3+ households need member-specific copy/filters too | Enable `Watched by {member}` and `Wants to watch: {member}` for 3+ as well |
| `components/search/search-result-card.tsx:39` | `Add to household watchlist` | Inconsistent with preferred shared term | Use `Add to shared watchlist` for 2+ |
| `components/search/search-result-card.tsx:45` | `Mark watched together` | For 3+, implies participant-level certainty not stored in model | Keep for 2-member; for 3+ use household-event wording and/or explanatory hint |
| `app/(app)/title/[id]/page.tsx:189` | `Household watchlist: Yes/No` | Inconsistent household-level label | Use `Shared watchlist` label for 2+ |
| `app/(app)/title/[id]/page.tsx:192-197` | `Watched together: Hidden for solo household` | Exposes implementation detail as user copy | Hide this row entirely for solo; do not render hidden-state text |
| `app/(app)/title/[id]/page.tsx:200-201` | `All members watched` always shown | Tautological in solo mode | Hide/downplay in solo mode |
| `components/status/title-status-editor.tsx:217` | `In household watchlist` | Inconsistent term with spec | Use `In shared watchlist` for 2+; in solo, prefer personal wording or hide household toggle |
| `components/status/title-status-editor.tsx:233` | `Watched together` | 3+ semantics are ambiguous in current model | 2-member unchanged; 3+ add household-event clarification text |
| `components/status/title-status-editor.tsx:238-239` | `All members watched: Yes/No` shown in all modes | Not useful in solo mode | Hide/downplay in solo mode |
| `components/status/title-status-editor.tsx:244` | `Current User` | Less natural than current-user copy conventions | Rename to `My status` |
| `components/status/title-status-editor.tsx:297` | `Members` shown in solo mode | Redundant when only one member exists | Hide members section in solo mode or relabel appropriately |
| `app/(app)/settings/page.tsx:162` | `shown to other members in your household` | Assumes other members exist | Conditional solo-safe wording |
| `app/(app)/settings/page.tsx:215` | `Members` heading in solo | Singular/plural mismatch for solo | Use `Member` in solo or keep list hidden until 2+ |

### Phase 0.5: Domain and Copy Audit

Goal: remove hidden couple assumptions before visual redesign work starts.

Why here:

- It is cheaper to fix wording and product rules before redesigning screens around the wrong assumptions.
- This phase reduces the risk of making polished UI that still breaks down for solo or 3+ households.

Tasks:

- Audit product copy and replace household-size-specific language unless it is conditionally rendered.
- Document when to use:
  - "Both want to watch"
  - "Shared watchlist"
  - "All members watched"
  - "Watched together"
- Identify UI logic that changes at `members.length <= 2` and decide whether each case is:
  - appropriate simplification
  - or an assumption that should be redesigned
- Review whether compact card patterns still work for 3+ households.
- Define fallback summary patterns for larger households:
  - avatar stack plus count
  - watched count
  - wants count
  - expandable member list

Suggested areas to review:

- `components/library/poster-card.tsx`
- `app/(app)/library/page.tsx`
- `app/(app)/home/page.tsx`
- `components/search/search-result-card.tsx`
- `components/status/title-status-editor.tsx`

Acceptance criteria:

- No key screen relies on couple language unless the household actually has two members.
- Solo and 3+ behavior is intentionally defined before redesign implementation begins.

### Phase 1: Build the Shared Visual System

Goal: define the app's look once so later screen work stays consistent.

Why first:

- Every later screen upgrade depends on color, typography, surface styles, and interaction patterns.
- Doing this first avoids redesigning each page multiple times.

Tasks:

- Update `app/globals.css`:
  - replace the current flat palette with a fuller token set
  - define surface, text, accent, border, muted, success, and shared-watch colors
  - add richer background treatments
  - define reusable radius and shadow conventions
- Update root typography in `app/layout.tsx` if adding custom fonts.
- Refactor `components/layout/app-shell.tsx`:
  - improve header hierarchy
  - add a more premium shell background
  - tighten nav spacing and active state styling
  - improve mobile behavior if needed
- Create or refactor shared component patterns for:
  - primary button
  - secondary button
  - pill or chip
  - section header
  - page shell card
  - empty state
  - loading skeleton
- Add subtle motion rules:
  - card hover treatment
  - page section reveal
  - selected chip transitions
  - success-state transitions

Suggested files to touch:

- `app/globals.css`
- `app/layout.tsx`
- `components/layout/app-shell.tsx`
- `components/common/empty-state-card.tsx`
- `components/common/loading-skeleton.tsx`
- optionally new shared UI component files under `components/common/`

Acceptance criteria:

- All major pages share a consistent visual language.
- Buttons, cards, chips, and empty states no longer look like unrelated pieces.
- The app feels recognizably like a media product rather than a generic dashboard.

### Phase 2: Upgrade Poster and Media Presentation

Goal: make media artwork carry more of the experience.

Why second:

- Poster and backdrop treatment influences Home, Library, Search, and Title pages.
- This work compounds the value of the visual system immediately.

Tasks:

- Refactor `components/library/poster-card.tsx`:
  - improve poster framing and hover behavior
  - add gradient overlays or richer footer styling
  - improve metadata hierarchy
  - give shared/together items a visually distinct treatment
- Define card variants by household size:
  - solo card presentation
  - two-member compact status presentation
  - 3+ summary presentation
- Upgrade member badges:
  - make watched vs wanted states clearer
  - improve avatar rendering and fallback states
  - reduce visual clutter while keeping status understandable
- For 3+ households, prefer summary patterns over rendering every member identically in very small spaces.
- Introduce optional backdrop usage for featured sections and title heroes.
- Audit all places where posters are shown and ensure fallback states still look intentional.

Suggested files to touch:

- `components/library/poster-card.tsx`
- any helper component extracted from poster-card
- `lib/tracker/shared.ts` only if helper formatting utilities are needed

Acceptance criteria:

- Poster cards feel collectible and premium.
- Shared titles are easy to identify at a glance.
- Missing-poster states still look designed, not broken.

### Phase 3: Redesign Home Around Household Storytelling

Goal: make the home page feel like the emotional center of the app.

Why here:

- Home is one of the best leverage points once the visual system and card styles exist.
- It should become the clearest expression of what the product is for.

Tasks:

- Redesign the top hero in `app/(app)/home/page.tsx`:
  - add a stronger headline
  - add a clearer household-oriented subhead
  - use larger, more visual CTAs
- Add featured sections such as:
  - both want to watch for exactly two-member households
  - shared watchlist for any household size
  - household watchlist
  - recently watched together
  - recently added
  - because only one of you watched it
- Add lightweight summary cards:
  - total tracked titles
  - shared watchlist count
  - watched together count
  - unwatched shared picks
- Ensure section naming adapts by household size:
  - solo: "My watchlist"
  - two members: "Both want to watch" can be used where appropriate
  - 3+: use "Shared watchlist" or count-driven language
- Consider a "Tonight's pick" section powered by a simple heuristic:
  - household wants to watch
  - not watched by all members
  - maybe favor recent additions
- Ensure solo-household behavior still looks intentional and not like a broken shared view.

Suggested files to touch:

- `app/(app)/home/page.tsx`
- `components/library/poster-card.tsx`
- optionally new home-specific components under `components/home/`

Acceptance criteria:

- The home page immediately communicates the shared nature of the app.
- It surfaces meaningful next actions without feeling cluttered.
- A user landing on Home can quickly answer "what should we watch or update next?"

### Phase 4: Rebuild Search/Add for Speed and Satisfaction

Goal: make adding titles feel faster and more rewarding than ignoring the app.

Why now:

- Search/Add is the most important maintenance flow.
- Improving this early has a direct product payoff.

Tasks:

- Redesign `app/(app)/search/page.tsx`:
  - make the search input more prominent
  - add guidance or starter suggestions when empty
  - add recent searches stored locally if desired
  - improve result layout spacing and density
- Refactor `components/search/search-result-card.tsx`:
  - replace generic action copy with natural language
  - make primary action clearer
  - simplify or redesign "Quick actions"
  - show success state after add, without forcing the user to guess whether it worked
- Make actions adapt by household size:
  - solo: "Add to my watchlist," "Mark as watched"
  - two members: allow direct shared-event action
  - 3+: avoid implying only one shared mode if the data cannot represent subgroup participation
- Add optimistic feedback patterns:
  - temporary success chip
  - inline confirmation message
  - optional "View title" shortcut after add
- Consider keyboard usability:
  - arrow through results
  - enter to trigger default action
  - escape to collapse actions
- If helpful, separate "search result card" from "quick action tray" into smaller components.

Suggested files to touch:

- `app/(app)/search/page.tsx`
- `components/search/search-result-card.tsx`
- optionally new components under `components/search/`

Acceptance criteria:

- A user can search and add a title with minimal thought.
- Search results feel responsive and rewarding.
- Action labels match real household language rather than backend concepts.

### Phase 5: Redesign Library as a Browsing Experience

Goal: make the library inviting to explore, not just filter.

Why after search:

- Search keeps the dataset growing.
- Library improvements are easier once shared card styles and search language are established.

Tasks:

- Replace the current dropdown-heavy controls in `app/(app)/library/page.tsx` with:
  - media-type chips or tabs
  - high-value filter chips
  - a cleaner sort control
- Introduce better default views:
  - all
  - mine
  - ours or shared, depending on household size
  - watched together
  - not watched by me
  - other member wants to watch
- Add 3+ appropriate views:
  - all members watched
  - partially watched
  - multiple members want to watch
  - watched by specific member
- Optionally group results into shelves or named sections instead of always rendering one flat grid.
- Improve empty states so each filter has more contextual messaging.
- If useful, move filter definitions into a config object so they are easier for an AI or dev to extend.

Suggested files to touch:

- `app/(app)/library/page.tsx`
- `components/library/poster-card.tsx`
- optionally a new `components/library/library-filters.tsx`

Acceptance criteria:

- Users can change views quickly without parsing dropdowns.
- The library feels more like browsing a collection than querying a dataset.
- Important shared views are easier to discover.

### Phase 6: Turn Title Detail Into a Premium Screen

Goal: make title pages the richest, most satisfying place in the app.

Why here:

- By this point the shared UI system and card styles already exist.
- The detail page can now become the flagship experience without inventing new visual rules from scratch.

Tasks:

- Redesign `app/(app)/title/[id]/page.tsx`:
  - add a backdrop-based hero when available
  - improve title, year, type, and metadata hierarchy
  - show runtime, season count, genres, and vote average where available
  - improve spacing and visual density
- Refactor `components/status/title-status-editor.tsx`:
  - make household actions feel clearer and less form-like
  - separate current-user actions from full-household state more cleanly
  - improve rating and notes UI
  - show watched dates or recent status changes
- Add mode-aware state presentation:
  - solo: simplify to personal status and optional future-watch intent
  - two members: clearly differentiate "both watched" versus "watched together"
  - 3+: show participant summaries and group-derived statuses
- Make notes and rating feel worth using:
  - consider a larger notes field
  - consider star or chip-style rating UI if desired
- Surface more household context:
  - who watched
  - who wants to watch
  - whether it is a good shared candidate
  - when it was watched together

Suggested files to touch:

- `app/(app)/title/[id]/page.tsx`
- `components/status/title-status-editor.tsx`
- `components/status/status-chip-group.tsx`

Acceptance criteria:

- Title pages feel cinematic and informative.
- Household state is easy to understand at a glance.
- Ratings and notes feel like real features rather than hidden fields.

### Phase 7: Celebrate Shared Watching Explicitly

Goal: make "together" feel special throughout the experience.

Why after detail work:

- The key shared-state surfaces already exist by now.
- This phase focuses on emotional differentiation, not baseline usability.

Tasks:

- Add a dedicated visual language for shared/together states:
  - color accent
  - icon treatment
  - section labeling
- Surface watched-together dates where available.
- If participant-aware shared events are added, surface the participant list cleanly.
- Add a shared shelf or callout on Home and/or Library.
- Add subtle celebratory feedback when a title becomes shared:
  - status animation
  - badge reveal
  - lightweight confetti only if it matches the tone
- Audit all labels to ensure "together" language is consistent across the app.

Suggested files to touch:

- `components/library/poster-card.tsx`
- `components/status/title-status-editor.tsx`
- `app/(app)/home/page.tsx`
- `app/(app)/library/page.tsx`

Acceptance criteria:

- Shared titles are visually and emotionally distinct.
- The app reinforces the product's core relationship value.
- "Watched together" no longer feels like just another boolean flag.

### Phase 8: Improve Onboarding and Settings

Goal: make setup and household management feel polished and trustworthy.

Why later:

- These are important, but less central than Home, Search, Library, and Title.
- By now the shared design system can be applied quickly and consistently.

Tasks:

- Redesign `components/auth/sign-in-form.tsx`:
  - improve hierarchy and warmth
  - make the value proposition clearer
  - polish segmented auth mode controls
- Redesign `components/onboarding/onboarding-form.tsx`:
  - give create/join paths stronger visual separation
  - improve invite code presentation
  - add copy/share button
  - optionally add QR support if desired
- Upgrade `app/(app)/settings/page.tsx`:
  - present members as cards with avatars
  - improve household section layout
  - make invite code more prominent and usable
  - polish account management states

Suggested files to touch:

- `components/auth/sign-in-form.tsx`
- `app/(auth)/sign-in/page.tsx`
- `components/onboarding/onboarding-form.tsx`
- `app/(app)/settings/page.tsx`

Acceptance criteria:

- Sign-in and onboarding feel intentional and branded.
- Invite and household management feel easier and more trustworthy.
- Settings feel like part of the same product, not an afterthought.

### Phase 9: Improve Perceived Speed and Architecture

Goal: make the app feel smoother and reduce avoidable client-side loading.

Why near the end:

- This work is easier to do once UI structure is more settled.
- It helps lock in the premium feel after the visual and UX improvements land.

Tasks:

- Audit current client-only page data loading:
  - `home`
  - `library`
  - `search`
  - `title/[id]`
  - `settings`
- Move initial data loading server-side where practical and safe.
- Introduce `loading.tsx` files for route groups or key routes to enable better transitions.
- Improve skeleton quality so loading states resemble final layouts.
- Reduce layout shift where possible.
- Review whether some components can remain client components while receiving server-fetched initial data.
- Keep Next.js 16 conventions in mind while doing this work.
- While refactoring, preserve household-size-aware rendering so server-driven pages do not accidentally flatten solo, 2-member, and 3+ experiences into one generic layout.

Suggested files to touch:

- `app/(app)/home/page.tsx`
- `app/(app)/library/page.tsx`
- `app/(app)/search/page.tsx`
- `app/(app)/title/[id]/page.tsx`
- `app/(app)/settings/page.tsx`
- new `loading.tsx` files as needed
- server/client helpers under `lib/`

Acceptance criteria:

- The app feels faster even before backend performance changes.
- Route transitions feel smoother and more intentional.
- Users see fewer blank or sudden-loading states.

### Phase 10: QA, Accessibility, and Final Cleanup

Goal: make sure the improved product is stable, consistent, and easy to maintain.

Tasks:

- Run a full visual QA pass across desktop and mobile.
- Check keyboard navigation on:
  - nav
  - search
  - filter chips
  - title status controls
  - forms
- Review color contrast after visual changes.
- Ensure loading, empty, error, and success states all feel consistent.
- Update tests where interaction patterns changed.
- Add new tests for any extracted shared logic or new UI states.
- Update `README.md` or docs if navigation or major flows changed substantially.
- Add explicit QA coverage for:
  - solo household flows
  - two-member household flows
  - three-or-more-member household flows
  - all members watched vs watched together
  - shared watchlist vs personal watchlist
  - member-specific filtering

Acceptance criteria:

- Solo users never feel like they are in an incomplete household.
- Two-member households get the clearest shared experience without defining the whole product.
- 3+ households feel intentional and scalable, not like a stretched couple app.
- Shared-state wording always matches actual household size and data precision.

Additional recommended tests:

- Unit tests for derived summaries with:
  - 1 member
  - 2 members
  - 3 members
  - 4+ members
- Component tests for:
  - poster card rendering by household size
  - library filters by household size
  - title detail summaries by household size
  - search quick actions by household size

## Suggested Work Breakdown for a Dev or AI

If one person or one agent is doing the work, the best chunking is:

1. Phase 1 and Phase 2 together
2. Phase 3
3. Phase 4
4. Phase 5
5. Phase 6 and Phase 7 together
6. Phase 8
7. Phase 9
8. Phase 10

If multiple people or agents are working in parallel, a good split is:

- Track A: design system, shared primitives, shell, poster card
- Track B: Home and Library
- Track C: Search/Add and Title detail
- Track D: Onboarding, Sign-in, Settings
- Track E: loading states, server/client data flow cleanup, QA

## Execution Checklist and Priority Order

This section translates the plan into a concrete implementation checklist. It is ordered to reduce rework and to make sure solo, two-member, and 3+-member households are all explicitly covered.

### P0: Product Rules and Household-Mode Coverage

These items should be completed before major UI redesign work starts.

- [ ] Create a household-mode matrix covering:
  - solo household
  - two-member household
  - three-or-more-member household
- [ ] For each major screen, define expected behavior in each household mode:
  - sign-in
  - onboarding
  - home
  - search
  - library
  - title detail
  - settings
- [ ] Define copy rules for household-size-sensitive wording:
  - `my`
  - `our`
  - `both`
  - `all members`
  - `watched together`
  - `shared watchlist`
- [ ] Audit current couple-specific or compact-household assumptions in the codebase and mark each one as:
  - keep
  - redesign
  - remove
- [ ] Decide the product meaning of `watchedTogether` for 3+ households.
- [ ] Decide whether `watchedTogether` remains a boolean or becomes a participant-aware event model.

Suggested files and areas:

- `docs/ui-ux-improvement-suggestions.md`
- `docs/projectspec.md`
- `components/library/poster-card.tsx`
- `app/(app)/home/page.tsx`
- `app/(app)/library/page.tsx`
- `components/search/search-result-card.tsx`
- `components/status/title-status-editor.tsx`

Definition of done:

- No core product rule is ambiguous for solo or 3+ households.
- The team has a clear answer for how `watched together` works beyond couples.

### P1: Shared Design System and Core UI Primitives

- [ ] Replace the current minimal global token setup with a fuller token system in `app/globals.css`.
- [ ] Define shared tokens for:
  - background
  - surface
  - elevated surface
  - text hierarchy
  - border
  - accent
  - success
  - warning
  - shared-watch state
- [ ] Add typography rules and update root font setup if needed.
- [ ] Refactor shell styles in `components/layout/app-shell.tsx`.
- [ ] Create or refactor reusable UI primitives for:
  - primary button
  - secondary button
  - chips and pills
  - page cards
  - section headers
  - empty states
  - skeleton states
- [ ] Define motion rules for hover, selection, and success states.

Definition of done:

- The app has one consistent visual system that later screens can reuse.

### P1: Household-Size-Aware Rendering Patterns

- [ ] Define shared rendering rules for compact versus expanded member summaries.
- [ ] Establish how cards should render in:
  - solo households
  - two-member households
  - 3+ households
- [ ] Define reusable patterns for:
  - stacked avatars
  - watched count summaries
  - wants count summaries
  - expandable member lists
- [ ] Ensure these patterns do not assume only two people matter.

Suggested files:

- `components/library/poster-card.tsx`
- `components/status/status-chip-group.tsx`
- `components/household/household-context.tsx`

Definition of done:

- The app has a consistent way to represent member state without breaking down at 3+ members.

### P1: Derived-State and Model Validation

- [ ] Review `lib/tracker/shared.ts` derived summaries against all household sizes.
- [ ] Confirm UI language and data usage for:
  - `allMembersWatched`
  - `someMembersWatched`
  - `multipleMembersWantToWatch`
  - `watchedTogether`
- [ ] If needed, add or expose additional derived summaries that make 3+ households easier to render.
- [ ] If `watchedTogether` needs more precision for 3+ households, define the required model changes before proceeding.

Suggested files:

- `lib/tracker/shared.ts`
- `lib/tracker/types.ts`
- `lib/tracker/view-model.ts`
- relevant API routes if model changes are required

Definition of done:

- Derived summaries are trustworthy across solo, 2-member, and 3+ households.

### P2: Poster Cards and Media Presentation

- [ ] Redesign `components/library/poster-card.tsx` around the new visual system.
- [ ] Add stronger hierarchy for poster, title, metadata, and status.
- [ ] Create distinct state treatments for:
  - personal watched
  - personal wants
  - shared watchlist
  - watched together
  - all members watched
- [ ] Ensure solo cards remain simple and uncluttered.
- [ ] Ensure 3+ cards summarize member participation instead of over-rendering badges.
- [ ] Improve missing-poster states.

Definition of done:

- Poster cards look premium and remain readable across all household sizes.

### P2: Home Redesign

- [ ] Redesign the top hero section in `app/(app)/home/page.tsx`.
- [ ] Add household-size-aware featured sections:
  - solo: `My watchlist`, `Recently watched`, `Recently added`
  - two members: `Both want to watch`, `Household watchlist`, `Recently watched together`
  - 3+: `Shared watchlist`, `All members watched`, `Recently watched together`, `Partially watched`
- [ ] Add summary cards for useful metrics.
- [ ] Add a "Tonight's pick" or equivalent recommendation block using existing heuristics.
- [ ] Ensure no section title sounds awkward in solo mode.

Definition of done:

- Home immediately feels useful and natural for any household size.

### P2: Search/Add Redesign

- [ ] Redesign `app/(app)/search/page.tsx` layout and empty state.
- [ ] Improve search input prominence and guidance.
- [ ] Add recent search or suggested search support if desired.
- [ ] Refactor `components/search/search-result-card.tsx` action language.
- [ ] Make add actions household-size-aware:
  - solo
  - two members
  - 3+ households
- [ ] Add strong inline success feedback.
- [ ] Add keyboard-friendly search result interaction if practical.
- [ ] Ensure action labels never imply data precision the model does not support.

Definition of done:

- Search/add feels fast, clear, and correct for all household sizes.

### P2: Library Redesign

- [ ] Replace dropdown-heavy browsing with a better filter system.
- [ ] Add high-value filter chips/tabs.
- [ ] Keep member-specific views possible without making the UI feel overloaded.
- [ ] Add 3+ appropriate filters such as:
  - all members watched
  - partially watched
  - multiple members want to watch
  - watched by specific member
- [ ] Improve empty-state messaging by filter and household size.
- [ ] Consider a config-based filter definition so future AI or dev work stays organized.

Definition of done:

- Library browsing feels intentional and scales well beyond couples.

### P2: Title Detail and Status Editor

- [ ] Redesign `app/(app)/title/[id]/page.tsx` hero and metadata layout.
- [ ] Surface more metadata such as runtime, seasons, and vote average.
- [ ] Refactor `components/status/title-status-editor.tsx` into clearer sections.
- [ ] Make personal actions, household actions, and member states more understandable.
- [ ] Explicitly differentiate:
  - watched together
  - all members watched
  - some members watched
- [ ] Add household-size-aware presentation for status summaries.
- [ ] Improve notes and ratings UI so they feel like intentional features.

Definition of done:

- The title page is rich, cinematic, and clear for solo, small-group, and larger-group households.

### P3: Shared-Watch Experience

- [ ] Define a visual language for shared-watch moments.
- [ ] Add shared-state callouts to Home and Library.
- [ ] Surface watched-together dates consistently where supported.
- [ ] If participant-aware shared events are added, display participants clearly.
- [ ] Add subtle celebratory feedback for meaningful shared-state changes.
- [ ] Ensure solo users do not see pointless shared-watch celebration UI.

Definition of done:

- Shared watching feels special without becoming couple-only or awkward for solo users.

### P3: Sign-In, Onboarding, and Settings

- [ ] Redesign `components/auth/sign-in-form.tsx`.
- [ ] Redesign `components/onboarding/onboarding-form.tsx`.
- [ ] Improve invite-code presentation and utility.
- [ ] Add copy/share affordances for invite flow.
- [ ] Consider QR support if desired.
- [ ] Redesign `app/(app)/settings/page.tsx` with stronger household presentation.
- [ ] Render member cards in a way that scales gracefully from 1 member to 3+ members.

Definition of done:

- Setup and household management feel polished and scale cleanly across household sizes.

### P3: Loading States and Perceived Performance

- [ ] Audit current client-side fetch-after-mount patterns.
- [ ] Move initial page data loading server-side where practical.
- [ ] Add route-level `loading.tsx` files where beneficial.
- [ ] Improve skeletons to resemble real layouts.
- [ ] Ensure speed improvements do not flatten household-aware behavior.

Definition of done:

- The app feels smoother without losing mode-specific UX quality.

### P4: QA, Testing, and Hardening

- [ ] Add or update unit tests for derived summaries in:
  - 1-member household
  - 2-member household
  - 3-member household
  - 4+ member household
- [ ] Add or update component tests for:
  - poster card rendering by household size
  - library filter behavior by household size
  - home section rendering by household size
  - title detail summaries by household size
  - search actions by household size
- [ ] Run visual QA on:
  - mobile
  - tablet
  - desktop
- [ ] Run keyboard and accessibility QA on the main flows.
- [ ] Verify copy throughout the app for household-size correctness.
- [ ] Verify no screen makes a solo user feel incomplete.
- [ ] Verify no screen makes a 3+ household feel like an overgrown couples mode.
- [ ] Update docs if product behavior changed.

Definition of done:

- The redesigned experience is coherent, accessible, and trustworthy for solo, 2-member, and 3+ households.

## Recommended Ticket Order

If turning this into actual tasks, this is the best sequence:

1. `P0-01` Household-mode matrix
2. `P0-02` Copy rules for solo, 2-member, and 3+ households
3. `P0-03` Decide `watchedTogether` meaning for 3+ households
4. `P0-04` Decide whether shared watch events need participant data
5. `P1-01` Visual system and token refactor
6. `P1-02` Shared UI primitives
7. `P1-03` Household-size-aware rendering patterns
8. `P1-04` Derived-state and model validation
9. `P2-01` Poster-card redesign
10. `P2-02` Home redesign
11. `P2-03` Search/add redesign
12. `P2-04` Library redesign
13. `P2-05` Title detail and status-editor redesign
14. `P3-01` Shared-watch experience polish
15. `P3-02` Sign-in, onboarding, and settings redesign
16. `P3-03` Loading-state and perceived-performance improvements
17. `P4-01` QA and tests for all household sizes

## Recommended "Must Not Miss" Items

These are the things most likely to get overlooked if people move too quickly:

- [ ] Never use `both` unless the household has exactly two members.
- [ ] Never assume `watchedTogether` means the same thing as `allMembersWatched`.
- [ ] Never make solo users feel like they are waiting for another member to complete the app.
- [ ] Never render 3+ households using UI that only works because there are at most two avatars.
- [ ] Never introduce polished UI copy that implies participant-level shared-watch data if the model only stores a boolean.
- [ ] Always test every major screen in solo, 2-member, and 3+ household states.

## Implementation Notes for AI Agents

To make this easier for an AI or new developer to execute:

- Prefer extracting reusable UI primitives instead of styling each page independently.
- Do not start with page-by-page redesign before defining global tokens and component patterns.
- Reuse the existing data model where possible before proposing schema changes.
- But if 3+ households need subgroup-level "watched together" precision, treat that as a legitimate schema or model change rather than papering over it in the UI.
- Treat "shared household" as the product center of gravity in copy and layout decisions.
- Maintain explicit support for solo, two-member, and 3+ households.
- Never use couple-specific language globally.
- Use conditional copy and layouts based on actual household size.
- Keep existing functionality intact while changing presentation and interaction design.

## Notes

- The production build passed cleanly at the time this review was written.
- The current product structure is good. Most of the opportunity is in presentation, emotional design, and surfacing capabilities the data model already supports.
