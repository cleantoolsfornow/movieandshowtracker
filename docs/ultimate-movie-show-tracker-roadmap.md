# Ultimate Movie and Show Tracker Roadmap

## Why this document exists

This is a product and UX audit based on the current app in this repo, not a generic wishlist.

The goal is to turn the app into the best possible movie and show tracker for:

- a single person tracking what they watched, want to watch, and might watch next
- a household with 2 or more people who need shared context without losing personal preferences

The ideal end state is low-friction, fast, visually satisfying, and good enough that keeping it updated feels fun instead of like homework.

## Current app snapshot

The app already has a real foundation:

- Next.js 16 App Router app with Firebase auth, Firestore, React Query, and TMDB-backed search/metadata
- onboarding supports creating a solo household or joining a shared household with an invite code
- data model already separates:
  - `titles`
  - `titleUserStatuses`
  - `titleHouseholdStatuses`
- each household can have 1, 2, 3, or more members
- each title supports:
  - personal `wantsToWatch`
  - personal `watched`
  - personal `rating`
  - personal `notes`
  - shared watchlist flag
  - watched-together household event with optional participant IDs
- the dashboard, library, title detail, and settings pages already adapt copy for solo, two-member, and 3+ households
- automated test coverage is solid for the current model and currently passes cleanly

This means the app is not starting from zero. It already understands the difference between "my state" and "household state," which is the right core idea.

## What is already good

- The household-aware copy is thoughtful and avoids forcing couple-only language onto larger households.
- The split between personal status and shared household status is strong.
- Poster-first browsing is much better than a plain list-based tracker.
- Search-to-add is quick and conceptually simple.
- Shared watch events are already modeled separately from "all members watched," which is correct.
- The current codebase is cleaner and more scalable than the older two-person tracker shape.

## Biggest current product gaps

These are the most important things holding the app back from feeling "ultimate."

### 1. TV tracking is still title-level, not progress-level

Right now a show is basically treated like a movie with a season count attached.

That is not enough for real TV behavior. The app needs:

- season progress
- episode progress
- "currently watching"
- "up to date"
- "waiting for next episode"
- partial household progress on a show
- the ability for one person to be ahead of another without the data model getting awkward

Without this, the app can track interest in shows, but not actual TV watching behavior.

### 2. The status model is too binary

Current state is mostly:

- want to watch
- watched
- watched together

That is a good start, but not enough. The app needs richer status states such as:

- planning to watch
- actively watching
- paused
- dropped
- rewatching
- finished
- not interested
- waiting for household

A boolean model is too blunt for how people actually decide what to watch.

### 3. There is no true "what should we watch tonight?" mode

The marketing promises easier watch-night decisions, but the current product is still mostly a tracker and library browser.

The app needs a dedicated decision layer:

- shortlist mode
- tie-breaking
- filters for runtime, mood, genre, release era, and who is available
- overlap-first ranking for households
- "surprise us" or "pick for us" mode
- a fast way to answer "what can we both watch right now?"

This is a major opportunity.

### 4. Solo users still have to think in "household" terms

The current architecture uses a one-person household, which is fine internally.

The product should hide that complexity for solo users much more aggressively:

- solo users should feel like they have a personal tracker, not a household of one
- the UI should only surface household concepts when they matter
- inviting others should feel like an upgrade path, not part of the default mental model

### 5. Library hygiene is weak

There is no obvious full lifecycle management for titles.

The app needs:

- archive
- remove from library
- hide
- mark as not interested
- re-add later
- bulk cleanup
- duplicate prevention and duplicate resolution

Without cleanup tools, every watchlist eventually becomes cluttered and less useful.

### 6. Notes, ratings, and watch history are too light

Current notes are a single-line input and ratings are just a number field.

That is functional, but not delightful. The app should support:

- proper multiline notes
- fast star or half-star rating UI
- review snippets
- multiple watch dates for rewatches
- "why we saved this" or "who recommended this"
- watch history timeline

### 7. Household management is underpowered

The app needs much better shared-account operations:

- owner/admin/member roles
- remove member
- leave household
- transfer ownership
- regenerate invite code
- invalidate old invite code
- deep-link invite flows
- invite by link and not just code
- rename household

Right now the tracking model is more mature than the household administration model.

## Product principles for the ultimate version

Every major change should support these principles:

- The fastest path should be "capture it before I forget."
- The second-fastest path should be "help me pick something right now."
- Solo mode should feel first-class, not like a reduced household mode.
- Shared mode should make coordination easier without making status updates annoying.
- The product should reward small updates with satisfying feedback.
- Most actions should take one tap, not a form.
- The app should prefer smart defaults over asking users to configure everything.

## Priority roadmap

## P0: Must fix to become truly great

### A. Expand the data model beyond title-level booleans

- Add show progress entities:
  - season progress
  - episode progress
  - last watched episode
  - next episode to watch
- Add richer personal statuses:
  - plan to watch
  - watching
  - paused
  - finished
  - dropped
  - rewatching
  - not interested
- Add watch history events:
  - watched alone
  - watched together
  - rewatch
  - watch date
  - optional notes per watch event
- Add list membership entities:
  - watchlist
  - shortlist
  - custom lists
  - archive

### B. Redesign the information architecture

The app should have clearer jobs per main area:

- `Home`
  - what matters now
  - continue watching
  - tonight suggestions
  - household overlap
  - unfinished items
- `Search`
  - capture new titles fast
  - detect duplicates immediately
  - one-tap save paths
- `Library`
  - full catalog management
  - filters, tags, history, cleanup, bulk actions
- `Decide`
  - dedicated watch-night mode
  - shortlist, picker, filters, household consensus
- `Settings`
  - account, household management, notifications, privacy

Right now `Dashboard` and `Library` do useful things, but the product still lacks a dedicated decision surface.

### C. Remove friction from title capture

- Detect if a title is already in the library and show current status instead of silently re-adding or just overwriting metadata.
- Support one-tap "save for me," "save for household," and "watching now."
- Auto-enrich TMDB metadata in the background after add.
- Stop making manual metadata refresh a normal user task.
- Add paste-friendly search and keyboard-first flows.
- Add "recommended by" capture when saving a title.

## P1: Make solo mode excellent

### A. Treat solo as a first-class product mode

- Replace "solo household" product language with "personal tracker" in most of the UI.
- Make the dashboard feel more personal:
  - continue watching
  - because you saved this
  - recently watched
  - watch next
  - abandoned but maybe worth revisiting
- Add personal custom lists:
  - comfort rewatches
  - awards watchlist
  - horror month
  - kids-safe

### B. Improve personal tracking depth

- Add rewatch support instead of a single watched boolean.
- Let users edit watch dates.
- Add "where did I leave off?" for TV.
- Add reminder options:
  - remind me this weekend
  - remind me when new episodes air
  - remind me if this sits untouched for 30 days

## P1: Make household mode genuinely special

### A. Introduce household decision mechanics

- Add a shared shortlist that is separate from the broader shared watchlist.
- Add soft voting:
  - yes
  - maybe
  - not tonight
- Add availability filters:
  - everyone here
  - only these members are watching
  - kid-safe tonight
  - under 2 hours
- Add "best overlap" ranking for titles the most relevant people want.
- Add a "pick something for us" mode that surfaces a few strong options instead of the whole library.

### B. Respect differences between members

- Some households want fully shared visibility.
- Some want private notes and private ratings.
- Some want only shared shortlist visibility.

The app should support privacy controls such as:

- ratings visible only to self
- notes visible only to self
- household-visible notes on a separate shared layer
- optional member preference profiles

### C. Add household activity and momentum

- activity feed:
  - Casey added `Dune`
  - Jordan marked `Severance` watched
  - 3 members now want to watch `Arrival`
- shared watch-night history
- recently gaining momentum
- neglected shared titles worth revisiting

This is how the app starts feeling alive.

## P1: Fix obvious UX limitations

### A. Notes and ratings

- Replace the single-line notes input with a multiline field.
- Replace raw numeric rating entry with a faster rating control.
- Add lightweight reactions such as:
  - loved it
  - liked it
  - fine
  - not for me

### B. Cleanup and lifecycle

- Add archive and delete flows.
- Add bulk actions in library view.
- Add duplicate handling.
- Add undo after destructive actions.
- Add "mark all episodes watched through here" for TV.

### C. Better empty states and success feedback

- Use smarter empty states based on whether the user is solo or in a household.
- Celebrate useful updates:
  - both of you want this now
  - everyone watched this
  - new shared pick for tonight
- Make progress feel rewarding without turning the app into gimmicky gamification.

## P2: Metadata and discovery upgrades

- Add streaming provider availability.
- Add trailers.
- Add cast, crew, and "if you liked this" recommendations.
- Add release-state awareness:
  - upcoming
  - now streaming
  - in theaters
  - returning soon
- Add filters for runtime, genre, year, language, network, and rating.
- Add saved searches and smart collections.

## P2: Improve invitation and membership flow

- Support invite links in addition to invite codes.
- Let an owner approve or reject joins if desired.
- Let households regenerate invite links/codes.
- Show who invited a member and when.
- Allow leaving a household safely.
- Support splitting a solo user out into a new personal tracker without data loss.

## P2: Technical and architectural improvements

These are important if the product grows.

### A. Data and performance

- The current `list` route loads all household titles and all title status docs, then filters in memory.
- That is acceptable early, but it will become a bottleneck as libraries grow.
- Add proper query-driven reads, pagination, and precomputed aggregates where needed.
- Add denormalized dashboard summaries for fast home loading.
- Add background metadata refresh jobs instead of relying on manual refresh.

### B. Domain modeling

- Introduce explicit entities for:
  - watch events
  - episode progress
  - lists
  - shortlist entries
  - member roles
  - notification preferences
  - recommendation source
- Keep personal state, household state, and watch events clearly separated.
- Do not overload one status document to do everything.

### C. Quality and safety

- Add end-to-end tests for the main flows.
- Add accessibility audits for keyboard and screen-reader use.
- Add mobile interaction testing for dense card layouts and chips.
- Add concurrency tests for households editing the same title at once.
- Add analytics to understand:
  - save rate
  - update rate
  - shortlist usage
  - watch-night decision completion

## Specific things to change or remove

- Remove household-heavy wording from solo-first flows.
- Remove the need for users to manually refresh metadata in normal usage.
- Remove the single-line notes input.
- Remove the assumption that "watched" is the only meaningful completion state.
- Remove title-only tracking as the main model for TV.
- Remove friction around keeping the library clean.
- Remove ambiguity around whether users are editing their own status or someone else's status.

## Recommended target feature set

If the app eventually has all of the following, it will feel much closer to "ultimate":

- personal watch tracking
- household watch coordination
- season and episode progress
- watch history and rewatches
- shared shortlist and picker mode
- member overlap ranking
- archive and cleanup tools
- custom lists and tags
- rich discovery metadata
- streaming availability
- reminders and release awareness
- private and shared note layers
- robust household admin
- delightful mobile-first flows

## Suggested implementation order

### Phase 1

- richer status model
- archive/delete cleanup flows
- multiline notes and better ratings
- solo-mode copy cleanup
- household admin basics

### Phase 2

- TV season and episode progress
- watch history model
- continue watching surfaces
- automatic metadata enrichment

### Phase 3

- shortlist and decision mode
- overlap ranking
- household activity feed
- privacy controls for ratings and notes

### Phase 4

- streaming providers
- reminders
- release awareness
- recommendation intelligence
- deeper personalization

## Bottom line

The app already has the right backbone: personal state, household state, and household-size-aware UI.

To become truly excellent, it now needs to evolve from a clean title tracker into a full watch decision system:

- better progress tracking
- better library hygiene
- stronger solo mode
- richer household coordination
- a real "what should we watch tonight?" experience

That is the path from "good tracker" to "app people genuinely love using."
