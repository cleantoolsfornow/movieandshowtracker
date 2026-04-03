# Shared Movie & TV Tracker — Product Spec

## 1. Overview

Build a private web app for two authenticated users to track:

* Movies watched by **Matt**
* Movies watched by **Jessica**
* Movies watched **together**
* Movies Matt wants to watch
* Movies Jessica wants to watch
* Movies both want to watch together
* The same for **TV shows**

The app should feel highly polished, low-friction, visually appealing, and easy to keep updated. The core goal is to make it faster and more enjoyable to log titles than to ignore the app.

This is not a public social platform. It is a lightweight shared household app for two people.

---

## 2. Product Goals

### Primary goals

1. Make it extremely easy to add a movie or TV show.
2. Let both users clearly track **who watched what** and **who wants to watch what**.
3. Make shared watching feel special and rewarding.
4. Use rich metadata (posters, backdrops, overview, genres, year, etc.) so the experience feels beautiful.
5. Keep setup and infrastructure simple.

### Secondary goals

1. Make browsing enjoyable.
2. Support quick filtering and discovery of shared watch options.
3. Allow the app to grow later into ratings, notes, stats, and recommendations.

### Non-goals for v1

* Public profiles
* Social feeds
* Reviews visible to strangers
* Complex recommendation engine
* Multi-household or family plans

---

## 3. Recommended Tech Stack

## Front end

* React
* TypeScript
* Tailwind CSS
* Recommended app framework: **Next.js**

## Backend / platform

* **Firebase Authentication**
* **Cloud Firestore**
* Firebase Hosting or Vercel for deployment

## Metadata provider

* **TMDb API** for movie and TV search/details

## Why this stack

* Easy sign-in
* Easy setup
* Minimal backend complexity
* Good fit for a two-user shared app
* Rich media metadata for attractive UI
* Fast for Codex to scaffold and build

---

## 4. Core Product Concept

The app revolves around a single shared space for two users.

Each title can have one or more relationship states tied to named people, not generic labels.

### Important change from earlier concept

Instead of using a vague `solo` flag, the app should use **explicit names**.

For example:

* Watched by Matt
* Watched by Jessica
* Watched together
* Want to watch: Matt
* Want to watch: Jessica
* Want to watch together

This is clearer, more human, and much easier to understand in the UI.

---

## 5. Key UX Principles

1. **One-step logging whenever possible**

   * Search a title
   * Tap it
   * Pick one action
   * Done

2. **Poster-first interface**

   * Rich imagery should make the app feel pleasant and collectible

3. **Named states, not abstract states**

   * Use Matt / Jessica / Together directly in the UI

4. **Fast filters over deep menus**

   * The user should be able to jump to a relevant view in one or two taps

5. **Low typing burden**

   * Pull metadata automatically
   * Avoid manual entry unless optional

6. **Shared moments should feel rewarding**

   * Watching together should feel special, not identical to an individual watch log

7. **TV and movies should feel unified**

   * One product, one system, with a clear type indicator

---

## 6. Users

### Primary users

* Matt
* Jessica

### User model assumptions

* Both users have their own accounts
* Both belong to one shared household / shared space
* Both can add, edit, and browse titles in that shared space

---

## 7. Core User Stories

### Authentication

* As a user, I want to sign in securely so my data is saved.
* As a user, I want the sign-in process to be simple and low-friction.

### Search and add

* As a user, I want to search for a movie or TV show and immediately see posters and metadata.
* As a user, I want to add a title with one or two taps.

### Status tracking

* As a user, I want to mark a title as watched by Matt, watched by Jessica, or watched together.
* As a user, I want to mark a title as something Matt wants to watch, Jessica wants to watch, or both want to watch together.

### Browsing

* As a user, I want to browse watched and wanted titles in a visually pleasing way.
* As a user, I want to filter by person, shared status, type, and category.

### Details

* As a user, I want to open a title and see its poster, overview, year, genres, and my tracking state.

### Maintenance

* As a user, I want updating the app to feel easy enough that I actually keep doing it.

---

## 8. Information Architecture

## Top-level navigation

### 1. Home

Landing page after sign-in. Shows useful sections and quick actions.

### 2. Library

Unified browsing experience for all tracked titles.

### 3. Search / Add

Search page or modal for finding new movies and shows.

### 4. Title Detail

Per-title page showing metadata and tracking states.

### 5. Profile / Settings

Account info and household settings.

Optional in v1.5 or v2:

* Stats
* Recommendations
* Notes / ratings

---

## 9. Core Screens

## 9.1 Sign-in / Onboarding

### Purpose

Get both users authenticated and into the same shared household.

### Requirements

* Support Google sign-in
* Support email/password sign-in
* Minimal visual clutter
* Clear welcome message
* If first user signs in, allow creation of household
* If second user signs in, allow joining existing household by invite code or invite link

### UX notes

* Keep onboarding short
* Avoid asking for unnecessary data
* Show profile name and avatar if available

---

## 9.2 Home Dashboard

### Purpose

Provide a fast, useful overview and encourage continued use.

### Suggested sections

* Continue browsing
* Recently added
* Recently watched together
* Our watchlist
* Matt’s watchlist
* Jessica’s watchlist
* Quick add button

### Optional stat snippets

* Total movies watched together
* Total shows watched together
* Number of shared watchlist items

### UX notes

* Poster-rich, not text-heavy
* Make this feel warm and inviting
* Prioritize quick paths into relevant content

---

## 9.3 Search / Add Flow

### Purpose

Make logging titles extremely fast.

### Search input behavior

* Global search bar
* Search both movies and TV shows
* Show results quickly as cards or rows

### Search result content

Each result should show:

* Poster
* Title
* Year
* Media type (movie or TV)
* Short overview

### Add interaction

When a result is tapped, show a compact action sheet or modal with options:

#### Watch states

* Mark as watched by Matt
* Mark as watched by Jessica
* Mark as watched together

#### Watchlist states

* Add to Matt’s watchlist
* Add to Jessica’s watchlist
* Add to our watchlist

### Important UX rule

The user should not have to open a full detail page just to log a title.

### Optional v1 enhancement

Allow multiple actions from one modal, e.g.:

* Add to our watchlist
* Mark as watched together

---

## 9.4 Library

### Purpose

Browse everything already tracked.

### Content model

A unified library containing both movies and TV shows.

### Filters

* All
* Movies
* TV Shows
* Watched by Matt
* Watched by Jessica
* Watched together
* Matt wants to watch
* Jessica wants to watch
* Want to watch together

### Sort options

* Recently added
* Recently updated
* Release date
* Alphabetical

### View modes

* Poster grid (default)
* Compact list view

### UX notes

* Filters must be extremely quick to use
* Avoid deep nested menus
* The poster grid should feel like a streaming library or collection shelf

---

## 9.5 Title Detail Page

### Purpose

Show rich metadata and all saved relationship states for a single title.

### Content

* Poster
* Backdrop
* Title
* Year
* Media type
* Overview
* Genres
* Runtime or number of seasons
* Status chips / sections

### Status section example

#### Watched

* Matt: Yes / No
* Jessica: Yes / No
* Together: Yes / No

#### Want to watch

* Matt: Yes / No
* Jessica: Yes / No
* Together: Yes / No

### Actions

* Mark watched by Matt
* Mark watched by Jessica
* Mark watched together
* Add/remove from Matt’s watchlist
* Add/remove from Jessica’s watchlist
* Add/remove from shared watchlist

### Optional later additions

* Personal rating
* Notes
* Date watched
* “Where to watch” data

---

## 9.6 Settings / Household

### Purpose

Allow basic shared-space management.

### Features

* View signed-in user
* Household name
* Household members
* Invite other user
* Sign out

### Non-goals for v1

* Complex permissions
* Role systems beyond what is necessary

---

## 10. Core Domain Model

The app should separate:

1. **Title metadata**
2. **User relationship/status data**

This is important.

TMDb provides metadata about the title.
Your database stores what Matt and Jessica have done with that title.

---

## 11. Data Model (Recommended)

## 11.1 Users Collection

```ts
users/{uid} {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  createdAt: Timestamp
  householdId?: string
}
```

## 11.2 Households Collection

```ts
households/{householdId} {
  id: string
  name: string
  memberIds: string[]
  createdAt: Timestamp
  createdBy: string
}
```

## 11.3 Titles Collection

Store cached metadata for titles that have been added.

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

## 11.4 Title Status Collection

A single per-title status document can work well for a two-person app.

```ts
titleStatuses/{titleId} {
  titleId: string
  householdId: string

  watchedBy: {
    matt: boolean
    jessica: boolean
    together: boolean
  }

  wantToWatchBy: {
    matt: boolean
    jessica: boolean
    together: boolean
  }

  watchedDates?: {
    matt?: string
    jessica?: string
    together?: string
  }

  personalRatings?: {
    matt?: number
    jessica?: number
  }

  notes?: {
    matt?: string
    jessica?: string
    shared?: string
  }

  createdAt: Timestamp
  updatedAt: Timestamp
  updatedBy: string
}
```

### Why this shape works

For only two users, this structure is simpler than over-generalizing too early.
It is easy to render, easy to query, and easy to understand.

---

## 12. Important Product Rules

1. A title may exist in multiple states.

   * Example: A movie can be in Jessica’s watchlist and also already watched by Matt.

2. “Watched together” is not the same as both individual flags being true.

   * It should be stored distinctly because it represents a shared experience.

3. A title should only be added once per household.

   * The app should merge status updates into the same title entry rather than duplicating entries.

4. Search results from TMDb should create a title record only when saved.

5. Metadata should be cached in Firestore after add.

---

## 13. Authentication & Access Model

## Auth providers

* Google
* Email/password

## Access model

* User must be signed in to view or modify household data
* Users may only access data for the household they belong to

## Firestore security requirements

* Users can read/write only their own user document
* Users can read/write only household data tied to their householdId
* Users cannot access other households

---

## 14. Search & Metadata Integration

## Provider

TMDb API

## Search requirements

* Search movies and TV shows
* Query by title
* Return poster and basic metadata

## Metadata to store when saving

* TMDb ID
* Media type
* Name
* Overview
* Poster path
* Backdrop path
* Release year/date
* Genre list
* Runtime or season count when available
* Vote average if desired

## Optional later enrichment

* Watch provider data
* Trailer links
* Cast

---

## 15. UX Details That Matter

## 15.1 Quick status chips

Use friendly chips/buttons such as:

* Watched by Matt
* Watched by Jessica
* Watched together
* Matt wants to watch
* Jessica wants to watch
* Want to watch together

These should feel tappable, clear, and immediate.

## 15.2 Empty states

Examples:

* “No shared watchlist yet. Add something you both want to watch.”
* “Nothing watched together yet. Your next movie night starts here.”

## 15.3 Shared experience delight

When marking something as watched together:

* Subtle success animation
* Nice confirmation copy
* Potential visual emphasis on shared events

## 15.4 Reduce friction everywhere

* Pre-fill all metadata automatically
* Minimize form fields
* Use inline actions instead of forcing full-page editing

---

## 16. Visual Design Direction

### Desired feel

* Warm
* Clean
* Premium
* Cinematic
* Slightly playful, but not cheesy

### UI characteristics

* Large posters and backdrops
* Rounded cards
* Soft shadows
* Clear type hierarchy
* Spacious layout
* Great mobile and desktop experience

### Inspiration direction

Blend the clarity of a modern streaming app with the warmth of a shared personal journal.

---

## 17. Functional Requirements

## Must-have for v1

* Sign in / sign up
* Shared household creation/joining
* Search TMDb for movies and TV shows
* Add title to app
* Mark watched by Matt
* Mark watched by Jessica
* Mark watched together
* Mark want-to-watch for Matt
* Mark want-to-watch for Jessica
* Mark want-to-watch together
* View unified library
* Filter library by state and type
* View title detail page

## Nice-to-have for v1

* Recently added carousel
* Recently watched together section
* Poster grid + list toggle

## Later features

* Ratings
* Notes
* Date watched
* Streaming availability
* Recommendations
* Stats dashboard

---

## 18. Non-Functional Requirements

* Responsive on mobile and desktop
* Fast page loads
* Smooth interactions
* Clear loading states
* No confusing state duplication
* Simple deployment
* Maintainable codebase for future iteration

---

## 19. Suggested Routes

```txt
/
/sign-in
/onboarding
/home
/library
/search
/title/[id]
/settings
```

Optional modal routes or overlays may be used for search/add.

---

## 20. Suggested UI Components

* App shell / navigation
* Search bar
* Filter chip row
* Poster card
* Title list row
* Status chip group
* Add action sheet / modal
* Recently added carousel
* Empty state card
* Household invite card
* Auth buttons

---

## 21. v1 Build Plan

## Phase 1 — Foundation

* Set up React/Next.js project
* Configure Tailwind
* Configure Firebase Auth
* Configure Firestore
* Set up environment variables
* Build sign-in page

## Phase 2 — Shared model

* Create user document on sign-in
* Create household model
* Support invite/join flow
* Protect routes

## Phase 3 — Metadata search

* Integrate TMDb search
* Build search results UI
* Save selected title metadata to Firestore
* Prevent duplicates per household

## Phase 4 — Tracking state

* Build title status model
* Add one-tap watch / watchlist actions
* Render status chips in library and detail page

## Phase 5 — Browsing

* Build home dashboard
* Build unified library
* Add filters and sorting
* Add title detail page

## Phase 6 — Polish

* Empty states
* Smooth loading states
* Delightful transitions
* Responsive refinement
* Basic stats cards if time allows

---

## 22. Acceptance Criteria for v1

1. Two users can sign in.
2. Both users can belong to the same shared household.
3. A user can search for movies and TV shows.
4. A user can save a title from search results.
5. A saved title stores metadata and appears in the library.
6. A user can mark a title as watched by Matt, watched by Jessica, or watched together.
7. A user can mark a title as wanted by Matt, Jessica, or together.
8. The library can be filtered by those states.
9. A title detail page clearly shows metadata and all saved states.
10. The experience feels fast and visually polished on both desktop and mobile.

---

## 23. Future Opportunities

* Ratings and reviews
* Watch history timeline
* Streaming provider availability
* Suggestions based on shared watchlist
* “Pick for us” randomizer
* Seasonal collections
* Import/export
* Letterboxd / Trakt integrations
* Push notifications or reminders

---

## 24. Implementation Guidance for Codex

### Key implementation priorities

1. Optimize for low-friction interactions first.
2. Keep data model simple and readable.
3. Avoid over-engineering for more than two users.
4. Build reusable UI for both movies and TV.
5. Prioritize a delightful, premium-feeling interface.

### Important instruction

Do not model this app around generic solo/shared states. Model it around explicit named statuses for the two users and together.

### Example UI labels

* Watched by Matt
* Watched by Jessica
* Watched together
* Matt wants to watch
* Jessica wants to watch
* Want to watch together

These labels should be treated as first-class UI concepts throughout the product.

---

## 25. Final Product Vision

A beautiful, shared media-tracking app that feels like a mix of a watchlist, a relationship scrapbook, and a premium streaming companion. It should be so easy and pleasant to use that both people naturally keep it updated over time.
