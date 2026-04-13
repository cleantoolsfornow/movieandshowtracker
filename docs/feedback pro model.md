I read through the handoff. The product idea is strong, and the architecture is actually ahead of the UI challenge. The biggest opportunity is to make the app feel much simpler than the model behind it.

Right now the risk is not “missing features.” It is that users may end up feeling the complexity of personal status, household status, watched-together state, member focus, and household-size variations too directly. The clean version of FilmPickle should make all of that feel obvious in one glance.

The three biggest UX risks I see are:
	1.	Too much of the data model may be exposed in the UI.
	2.	Search and library can easily become “too many actions on every card.”
	3.	Solo, 2-person, and 3+ household modes can drift into feeling like three different apps.

A good cleanup pass should make each screen do one job:
	•	Home helps me decide.
	•	Search helps me add.
	•	Library helps me browse.
	•	Title detail helps me edit.
	•	Settings helps me manage.

The highest-impact changes I would make

1. Make the entire app revolve around two user-facing concepts: Mine and Ours

This is the biggest improvement.

Internally, your personal vs household split is smart. Externally, the UI should simplify it into very human language:
	•	wantsToWatch becomes My watchlist or Save
	•	householdWantsToWatch becomes Our list
	•	watchedTogether becomes We watched this

Use the word household mostly in onboarding and settings. In the main app, “household” feels administrative. “Mine” and “Ours” feels natural.

On every title surface, users should immediately understand:
	•	What is my status?
	•	What is our status?
	•	Who else is involved?

That one change alone will make the app feel much cleaner.

⸻

2. Stop calling the main screen “Dashboard” in the UI

“Dashboard” sounds analytical. Your app is entertainment and decision-making.

Keep the route as /dashboard if you want, but label it Home in the shell.

Then redesign that page so it answers one question first: What should we watch tonight?

Instead of leading with summary metrics, lead with action-first shelves:
	•	Tonight’s picks
	•	From my watchlist
	•	From our list
	•	Recently watched together
	•	Recently added

Metrics can still exist, but they should be secondary and tappable. A card like “Both want to watch: 12” should deep-link into Library with that filter already applied.

For different household sizes:
	•	Solo: My watchlist, recently watched, continue rating
	•	2 people: Both want this, only you want this, watched together
	•	3+ people: Everyone wants this, 2+ people want this, subgroup watched together

That makes the app feel like it understands context without changing its whole personality.

Files to hit first: components/home/dashboard-page.tsx

⸻

3. Search should be a fast add flow, not a mini control center

Search result cards are the easiest place for clutter to creep in.

Right now, based on the handoff, result cards can show personal actions, shared actions, and a participant picker in some cases. That is powerful, but it can get busy very quickly.

A cleaner rule:
	•	Search card = add fast
	•	Title page = edit deeply

On search cards, I would show:
	•	poster
	•	title + year + media type
	•	small status chips if already added
	•	one strong primary action: Save
	•	one secondary action: Mark watched
	•	one overflow or sheet for shared/together actions

For 2-person households, “We watched this” can be one tap.
For 3+ households, tapping that should open a bottom sheet with avatar chips and disabled confirm until at least 2 are selected.

Also make the search bar sticky and preserve the query + scroll state when returning from a title page. That kind of stability makes the app feel polished.

⸻

4. Turn Library into smart views, not a filter puzzle

Your current library supports media filters, view filters, member focus, sort, and context-aware empty states. That is good power, but too much visible filtering can make the experience feel tool-like instead of friendly.

I would make the top of Library opinionated and simple:
	•	All
	•	Mine
	•	Ours
	•	Watched

Then put advanced filters behind a drawer or modal.

For household-aware smart chips, use defaults like:
	•	Solo: Watchlist, Watched, Rated, Notes
	•	2 people: Both want, Only you want, Only they want, Watched together
	•	3+ people: Everyone wants, 2+ want, Watched together, Partially watched

Also add a list view in addition to the poster grid. Posters are great for browsing, but list view is better when someone wants to scan quickly.

And very important: member filters should be avatar chips, not dry filter controls. That makes the app feel much more alive.

Files to hit: app/(app)/library/page.tsx

⸻

5. Rebuild TitleStatusEditor around progressive disclosure

This is probably the single best UI refactor for your flight.

The title page is the right place for full editing, but it still needs hierarchy.

I would structure it like this:

Above the fold
	•	poster/backdrop
	•	title metadata
	•	quick action row

Card 1: My status
	•	Save / in my watchlist
	•	Watched
	•	Rating
	•	Private note

Card 2: Our status
	•	In our list
	•	We watched this
	•	who watched together

Card 3: Notes and details
	•	expandable or collapsed by default

A few key details:
	•	Put a small “Only visible to you” label next to rating/notes
	•	Put a small “Visible to your group” label next to shared state
	•	Hide the TMDB refresh button inside an overflow menu; it reads like a debug/admin action, not a consumer action
	•	On mobile, make the main action row sticky at the bottom or keep it high enough to stay visible

Also consider a smart cleanup rule: when something is marked watched, offer to remove it from the relevant watchlist with undo. That keeps libraries clean.

Files to hit: components/status/title-status-editor.tsx

⸻

6. Make onboarding solo-first and invite-later

This is a major activation improvement.

Right now the app’s core loop is: sign in → create/join household → search/add titles. That works, but it adds friction before the user sees value.

A cleaner flow:
	•	Sign in
	•	Choose: Using this alone, Joining someone, or Creating a shared space
	•	If alone, create a solo household automatically and move on
	•	Show invite later as a celebratory next step, not a gate

Your product already supports solo households, so the UX should lean into that.

I would also improve the join flow by replacing “enter invite code” as the primary experience with a shareable invite link that pre-fills the code. Keep the raw code as fallback.

Also preserve next through onboarding. If someone signs in because they tried to open a title page, finishing onboarding should take them back there.

Files to hit: onboarding route and sign-in surface

⸻

7. Add a real mobile-first app shell

This app is exactly the kind of product people will use on their phone while sitting on a couch.

A top-only nav is not enough.

I would add a bottom tab bar for mobile:
	•	Home
	•	Search
	•	Library
	•	Settings or Profile

Keep desktop top nav if you like, but mobile should be thumb-friendly, respect safe-area insets, and avoid making people reach for the top of the screen.

Also, “Profile(Settings)” is too awkward as a primary label. Use an avatar icon or just Settings.

Files to hit: app/(app)/layout.tsx, AppShell

⸻

8. Create a very small design system and use it everywhere

This is where “clean” actually comes from.

Before adding new features, build and reuse a few primitives:
	•	PageHeader
	•	SectionCard
	•	PosterCard
	•	StatusChip
	•	MemberAvatarStack
	•	EmptyState
	•	FilterBar
	•	SkeletonCard

A title should not feel like a different object on Home, Search, Library, and Title Detail. The visual grammar should be consistent across all of them.

A few design rules worth enforcing:
	•	one primary action per surface
	•	secondary actions hidden in menus/sheets
	•	consistent chip styles
	•	consistent poster aspect ratio
	•	generous spacing
	•	cinematic visuals only in hero areas, not everywhere

That last point matters: backdrop art is great on Home and Title Detail. Everywhere else, keep it simple and utility-first.

⸻

9. Polish empty, loading, and success states

This is one of the fastest ways to make the app feel premium.

Every major screen should have a deliberate state for:
	•	first use
	•	no results
	•	no titles yet
	•	filtered-to-zero
	•	loading
	•	failed action
	•	successful action

Examples:
	•	Home empty: “Start your watchlist with 3 titles”
	•	Shared empty: “Invite someone and start a shared list”
	•	Library zero-state: “No titles match these filters” with a clear reset
	•	Search no results: “Try a different title or broader search”
	•	Mutation success: small toast, no full-page refresh
	•	Mutation failure: inline retry, preserve local edits

Also, avoid blank auth flashes while AuthProvider and HouseholdGuard resolve. Show a branded loading state instead of a jumpy redirect feel.

⸻

10. Use avatars and counts more, text labels less

The handoff makes it clear that member-aware behavior is central. Make that visual.

Instead of saying a lot of words like “multiple members want this,” show:
	•	avatar stack
	•	count chip
	•	one short sentence

Examples:
	•	“3 people want this”
	•	“Watched together by Alex and Sam”
	•	“Only you want this”
	•	“Everyone wants this”

For 2-person households, lean very hard into overlap language:
	•	Both want this
	•	Only you want this
	•	Only they watched this

That is much more emotionally legible than generic household copy.

⸻

11. Tighten Settings so the product feels trustworthy

Even if some management features are still missing, the app should still feel complete and safe.

Split Settings into clear sections:
	•	Profile
	•	Household
	•	Data & privacy
	•	Support

Even before full self-serve flows exist, put clear affordances in place for:
	•	leave household
	•	rename household
	•	regenerate invite code
	•	export data
	•	delete account

If some are not built yet, add honest copy and a support fallback. Silent absence feels worse than a visible “coming soon” path.

Also: notes are personal-only. Make that privacy boundary explicit in the UI.

⸻

12. Simplify the marketing site to one sharp promise

Your marketing pages sound thorough, but they may be too spread out for a small product.

The home page should mostly say:

Stop endless scrolling. Save what you want, see where you overlap, and decide what to watch together.

Then show real screenshots. Screenshot placeholders are one of the biggest “unfinished product” signals.

Best simple structure:
	•	Hero with one strong CTA
	•	3-step explanation: Save → Compare → Decide
	•	“Works solo / for couples / for groups”
	•	real product screenshots
	•	FAQ below the fold

I would also make Donate much softer. “Support the project” in the footer feels cleaner than giving it equal visual weight too early.

⸻

13. Build a fixture-powered preview route before you do the visual pass

Because you’re on a flight, this is probably the smartest single move.

You may not want to depend on live Firebase/TMDB while redesigning. Build a local fixture system with representative TitleViewModel states:
	•	solo household
	•	2-person household
	•	3+ household
	•	everyone wants this
	•	only one member wants this
	•	watched together by subgroup
	•	no poster
	•	long title
	•	empty library
	•	first-time onboarding

Then create a local preview page and render the important states there.

This gives you three huge wins:
	1.	You can redesign offline
	2.	Codex can refactor safely against stable fixtures
	3.	You can capture beautiful, consistent marketing screenshots from the same fixtures

This is exactly the kind of thing worth doing on a plane.

⸻

14. Ship “decision help” before bigger roadmap features

Episode progress, import/export, and deep household admin matter, but they will not make the app feel cleaner tomorrow.

A lightweight Pick for tonight module would.

Even a basic version would be great:
	•	only from unwatched titles
	•	weighted toward shared interest
	•	separate options for solo / duo / group
	•	filters like movie only, show only, under 2 hours

That feature aligns perfectly with your current product promise and makes Home feel purposeful instead of just informative.

⸻

15. One non-UI sanity check from the handoff

This is not a design note, but it is important enough to mention.

The handoff describes per-household title state as titleHouseholdStatuses/{titleId}. If that is literal, it would collide across households for the same title. It should be household-scoped in the key or path.

That might just be shorthand in the doc, but it is worth double-checking because it would create trust-destroying cross-household bugs.

⸻

Best use of the 9-hour flight

Because you may be working with limited connectivity, I would not spend the flight on Firebase-heavy or TMDB-heavy work. I would do this in order:
	1.	Create local fixtures + a UI preview route
	2.	Build shared primitives (StatusChip, PosterCard, EmptyState, MemberAvatarStack, SectionCard)
	3.	Refactor AppShell + mobile nav
	4.	Redesign Home to be decision-first
	5.	Rebuild TitleStatusEditor with progressive disclosure
	6.	Simplify Search cards and convert Library into smart views
	7.	Use the fixture pages to capture real screenshots for marketing
	8.	Add/update tests for solo, duo, and group UI states

I would actively avoid spending that flight on:
	•	episode/season tracking
	•	import/export
	•	provider integration
	•	complex admin/permissions flows
	•	broad backend rewrites

Those are important later, but they will not make the app feel immediately cleaner.

Copy-paste prompts for Codex

1. Fixture and design-system pass

Create a local fixture-driven UI preview for FilmPickle so I can redesign the app offline.

Requirements:
- Add fixtures for solo, two-member, and 3+ member households.
- Include representative TitleViewModel states: everyone wants, only one member wants, watched together by subset, watched by me only, empty library, no poster, long title, recent activity.
- Build a local preview route that renders Home, Search cards, Library cards, Title detail/editor, and key empty/loading states using those fixtures.
- Create or refactor shared UI primitives: PageHeader, SectionCard, PosterCard, StatusChip, MemberAvatarStack, EmptyState, SkeletonCard.
- Preserve existing API/data model behavior. This is a UI refactor and fixture layer, not a backend rewrite.

2. Home + app shell pass

Refactor the protected FilmPickle app shell and home screen to feel mobile-first and decision-first.

Requirements:
- Change the user-facing nav label from Dashboard to Home.
- Add a mobile bottom tab bar for Home, Search, Library, and Settings/Profile.
- Keep desktop navigation usable.
- Redesign the Home screen so it prioritizes what to watch next instead of summary metrics.
- Add shelves like Tonight’s picks, My watchlist, Our list, Recently watched together, and Recently added.
- Make the shelves household-aware: solo, two-person, and 3+ should reuse the same visual system but surface different shelves/copy.
- Summary cards should deep-link into Library with pre-applied filters.
- Keep the existing route structure and household guards intact.

3. Search + Library cleanup

Refactor FilmPickle Search and Library to reduce UI clutter and make them faster to use.

Requirements:
- Search cards should focus on quick add actions, not full editing.
- Show compact status chips when a title already exists in the user/group context.
- Keep one strong primary action on search cards, one secondary action, and move advanced/shared actions into an overflow or bottom sheet.
- For 2-person households, allow one-tap "We watched this".
- For 3+ households, open a participant picker sheet and require at least 2 selected members.
- Preserve search query and scroll position when navigating back from a title page.
- Turn Library into smart views with simple top-level tabs and move advanced filters into a drawer/modal.
- Add member avatar chips for member-focused filtering.
- Add a list view in addition to poster grid.

4. Title detail + onboarding pass

Refactor FilmPickle title detail and onboarding to feel simpler and more human.

Requirements:
- Rebuild TitleStatusEditor with progressive disclosure.
- Above the fold: title metadata and quick actions.
- Separate sections for My status, Our status, and private notes/rating.
- Label private fields clearly as only visible to me.
- Label shared fields clearly as visible to the group.
- Move the TMDB refresh action into an overflow menu.
- On mobile, keep primary title actions easy to reach.
- Redesign onboarding to be solo-first and invite-later.
- Let users choose: using alone, joining someone, or creating a shared space.
- Auto-create the solo path quickly.
- Support invite links in addition to raw invite codes.
- Preserve sanitized next-path behavior through onboarding.

Start with the fixture route and the TitleStatusEditor/Home refactor. Those two changes will make the rest of the app fall into place much faster.