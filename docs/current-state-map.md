# Current State: Website Map, Accounts, and Household Structure

## Website Map (Pages + Main Flow)

```txt
/
└─ redirects to /home

/sign-in
└─ if already signed in:
   ├─ has householdId -> /home
   └─ no householdId  -> /onboarding

/onboarding (signed-in only)
├─ Create household  -> POST /api/households/create -> /home
└─ Join household    -> POST /api/households/join   -> /home
   (if not signed in -> /sign-in?next=/onboarding)
   (if already in household -> /home)

APP AREA (all wrapped by HouseholdGuard)
(any /home, /search, /library, /title/[id], /settings)
├─ if not signed in -> /sign-in?next=<current path>
├─ if signed in but no householdId -> /onboarding
└─ else allowed in

/home
├─ loads household-scoped titles (recent + watchlist sections)
└─ links to /search and /library

/search
├─ GET /api/tmdb/search?q=...
└─ add/quick-action -> POST /api/titles/add

/library
└─ GET /api/titles/list (filters + sort)

/title/[id]
├─ GET /api/titles/[titleId]
├─ PATCH /api/titles/[titleId] (toggle watched/want flags)
└─ POST /api/titles/[titleId]/refresh (refresh TMDB metadata)

/settings
├─ update display name / avatar
├─ sign out
└─ GET /api/households/me (name, invite code, members)
```

## Account Types / States (Current Behavior)

```txt
1) Unauthenticated visitor
   - Can only effectively use sign-in flow
   - Protected app pages redirect to sign-in

2) Authenticated user WITHOUT household
   - lands in /onboarding
   - can create household or join by invite code

3) Authenticated user WITH household membership
   - full app access (/home, /search, /library, /title/[id], /settings)
   - all title data is scoped to their householdId
```

## Household Structure and Account Relationships

```txt
users/{uid}
- uid
- email/displayName/photoURL/avatarDataUrl
- householdId (nullable)

households/{householdId}
- name
- inviteCode
- memberIds[]   <-- source of membership
- createdBy     <-- tracked, but no special role logic in UI/API

titles/{titleId}
- householdId
- tmdb metadata fields...
- titleId is deterministic: householdId_mediaType_tmdbId

titleStatuses/{titleId}
- householdId
- watchedBy:    { memberOne, memberTwo, together }
- wantToWatchBy:{ memberOne, memberTwo, together }

Relationship summary:
- One user -> at most one householdId
- One household -> many users in memberIds
- One household -> many titles
- One title -> one status doc (same id)
```

## Important Current Nuance

```txt
UI status model is "memberOne/memberTwo/together".
Labels come from the first two household members returned.
So the household document supports multiple memberIds, but the tracking UI is effectively built for 2 named people + together.
```

