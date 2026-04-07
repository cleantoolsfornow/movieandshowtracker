# Public Marketing Site Plan

## Purpose

Define a polished, public-facing experience for visitors who land on the site before authentication, while keeping the existing authenticated tracker app intact.

This document is intentionally grounded in the current codebase, not a generic marketing-site template.

## Current Project Understanding

Based on the current repository:

- The app uses Next.js `16.2.2` with the App Router.
- The root route `/` currently redirects to `/home` in `app/page.tsx`.
- The authenticated app lives under `app/(app)/...` and is wrapped by `HouseholdGuard` via `app/(app)/layout.tsx`.
- Sign-in lives at `/sign-in` in `app/(auth)/sign-in/page.tsx`.
- The sign-in form already supports both sign-in and sign-up modes in a single UI via `components/auth/sign-in-form.tsx`.
- Auth state is currently client-managed through Firebase in `components/auth/auth-provider.tsx`.
- The app already has a clean visual system in `app/globals.css`, plus reusable primitives like `Button`, `PageCard`, and `SectionHeader`.
- The product is a private media-tracking app for solo users and households, not a public social network.

## Recommendation

Yes, this project should have a proper public marketing layer.

Recommended public routes:

- `/` = marketing home page
- `/features` = feature overview page
- `/donate` = support page linking to Ko-fi
- `/sign-in` = auth entry point with both sign-in and sign-up available

Recommended top-right header actions:

- `Sign in`
- `Create account`

If the user is already authenticated, those actions should become a single strong CTA:

- `Open app`

## Product Positioning

The public site should sell this app as:

- a sleek personal and household movie/TV tracker
- fast to start
- visually satisfying to use
- especially good for shared decision-making
- equally valid for solo use

It should not feel like:

- a corporate SaaS page
- a public social network
- an open-source project homepage
- a pricing site

## Goals

- Make the first impression feel cinematic, premium, and exciting.
- Explain what the app is in seconds.
- Show why it is useful before asking for auth.
- Give new visitors a clear path into account creation.
- Give returning visitors an obvious path to sign in.
- Add a tasteful support path through a donate page.

## Non-Goals

- No pricing page.
- No heavy discussion of monetization or future paid plans.
- No attempt to explain every implementation detail of the app.
- No public community/social features.
- No rewrite of the authenticated app shell as part of this effort.

## Recommended Information Architecture

### 1. Home (`/`)

This should be the main marketing page and the default landing route.

Primary sections:

- Hero
- Core value proposition
- How it works
- Key feature highlights
- Solo + household flexibility
- Visual product tease
- Final CTA

Suggested hero direction:

- Headline: short, punchy, cinematic
- Supporting copy: clear explanation in one or two sentences
- Primary CTA: `Create account`
- Secondary CTA: `Sign in`
- Optional tertiary text link: `See features`

Example messaging direction:

- "Know what to watch next."
- "Track movies and shows for yourself or your household."
- "Save the maybes, celebrate the shared picks, and keep every watch decision in one beautiful place."

### 2. Features (`/features`)

This should be a cleaner, more structured page that expands on the promise made on the home page.

Suggested sections:

- Fast capture and search
- Shared household tracking
- Solo mode that still feels intentional
- Poster-first library experience
- Quick decisions and watchlist clarity
- Title detail and status tracking

This page should answer:

- What can I do with this?
- Is this just for couples, or can I use it myself?
- What makes this better than a plain notes app or spreadsheet?

### 3. Donate (`/donate`)

This page should be simple, sincere, and lightweight.

Primary content:

- why support helps
- a prominent external button to Ko-fi
- small copy about helping keep the project running

Target donation link:

- [Ko-fi](https://ko-fi.com/cleantoolsfornow)

Suggested page tone:

- warm
- appreciative
- not pushy
- not guilt-based

## Routing and Auth Behavior

### Recommended behavior

- `/` should stop redirecting to `/home`.
- `/home` remains the authenticated in-app dashboard.
- Marketing pages should remain publicly accessible.
- Authenticated app routes should keep using the existing `HouseholdGuard`.
- `/sign-in` remains the single auth destination.

### Recommendation for authenticated visitors who hit `/`

Because auth is currently client-managed through Firebase, a forced redirect from `/` to `/home` would likely introduce either:

- a flash of public content before redirect, or
- an unnecessary loading gate for first-time visitors

Recommended v1 behavior:

- always render the marketing home at `/`
- swap CTAs client-side once auth state resolves
- if authenticated, show `Open app` instead of `Sign in` / `Create account`

This is the cleanest experience with the current architecture.

If the project later adds server-readable auth/session cookies, we can revisit a true authenticated server redirect from `/`.

## Next.js 16 Notes Relevant To This Plan

- Keep the existing top-level `app/layout.tsx` as the single root layout.
- Use route groups for organization, not multiple root layouts.
- A route group like `app/(marketing)` does not change the URL path.
- Pages are Server Components by default, so only opt into `"use client"` where interaction is needed.
- If any new server page reads `searchParams` or `params`, remember those props are promises in this Next version.

## Recommended Route/Layout Structure

```txt
app/
  layout.tsx
  (marketing)/
    layout.tsx
    page.tsx
    features/page.tsx
    donate/page.tsx
  (auth)/
    sign-in/page.tsx
  (app)/
    layout.tsx
    home/page.tsx
    search/page.tsx
    library/page.tsx
    title/[id]/page.tsx
    settings/page.tsx
```

Recommended component area:

```txt
components/
  marketing/
    marketing-layout.tsx
    public-header.tsx
    public-footer.tsx
    hero-section.tsx
    feature-grid.tsx
    how-it-works.tsx
    social-proof-strip.tsx
    donate-cta-card.tsx
```

## UX Recommendation

### Header

Public header nav:

- Home
- Features
- Donate

Top-right actions:

- signed out: `Sign in` + `Create account`
- signed in: `Open app`

Implementation detail:

- `Sign in` should link to `/sign-in`
- `Create account` should link to `/sign-in?mode=sign-up`
- `Open app` should link to `/home` or `/onboarding` depending on household state if that state is already available client-side

### Footer

Recommended footer links:

- Home
- Features
- Donate
- Sign in

Optional footer note:

- a short one-line description of the product

### Mobile behavior

- Keep navigation simple
- Prefer a compact menu button or stacked header layout
- Keep both auth CTAs reachable without scrolling

## Messaging Strategy

The best public copy will likely work if it follows this order:

1. Immediate value
2. Shared use case
3. Solo use case
4. Speed and low friction
5. Clear CTA

Messaging themes to lean into:

- stop forgetting what you wanted to watch
- stop losing track of shared picks
- make watch decisions feel easy
- keep everything in one elegant place
- useful alone, better together

Messaging themes to avoid:

- startup jargon
- productivity buzzwords
- fake social proof
- aggressive scarcity
- overly technical explanations

## Visual Direction

The authenticated app already has a clean light visual system. The public site should feel more dramatic and expressive while still belonging to the same product family.

Recommended direction:

- cinematic gradients and layered background shapes
- strong display typography
- large, editorial hero spacing
- premium-looking glass/surface cards
- subtle reveal/stagger motion
- rich content blocks that hint at posters and media browsing

Important:

- do not make the public site look like a generic SaaS landing page
- do not default to purple gradients
- do not make it feel disconnected from the product

## Page-by-Page Content Spec

### Home page sections

### Hero

Goal:

- explain the app fast
- create emotional lift
- get the user to act

Include:

- eyebrow/kicker
- bold headline
- short supporting paragraph
- primary and secondary CTA
- visual mock product frame or layered stats cards

### Why it matters

Goal:

- turn the abstract idea into relatable pain relief

Possible cards:

- Stop losing track of what you want to watch
- Keep shared watchlists clear
- Make tonight's pick easier

### How it works

Three simple steps:

1. Sign in
2. Add movies or shows
3. Track what you want and what you watched

### Feature highlight rail

Possible highlights:

- Household-aware tracking
- Solo-friendly from day one
- Fast search and quick add
- Poster-first library
- Shared watch moments

### Household modes section

Explain that the app works for:

- just you
- two people
- a bigger household

This matters because the current product already supports solo and shared states, and the marketing layer should reinforce that inclusivity.

### Final CTA

Primary:

- `Create account`

Secondary:

- `See features`

### Features page sections

### Hero

- crisp headline
- short supporting explanation

### Feature blocks

Use 5-7 blocks with stronger detail than the home page.

Suggested blocks:

- Search and add in seconds
- Shared household visibility
- Personal watch intent and watched state
- A library that feels visual, not spreadsheet-like
- Title details with rich metadata
- Onboarding into a household without friction
- Account access with email/password or Google

### Use-case comparison

A simple comparison row could help:

- Solo
- Household

Not pricing, just usage framing.

### Final CTA

- `Create account`
- `Sign in`

### Donate page sections

### Hero

- short thank-you framing
- clear support button

### Why support helps

Suggested reasons:

- hosting and infrastructure
- continued polish and upkeep
- keeping the project healthy

### Support card

Main action:

- `Support on Ko-fi`

Implementation note:

- open the Ko-fi link in a new tab
- clearly indicate it is external

## Detailed Implementation Plan

### Phase 1: Routing and layout foundation

### Objective

Create a public marketing section without disturbing the protected app.

### Tasks

1. Retire the current redirect in `app/page.tsx`.
2. Create `app/(marketing)/layout.tsx` for the public site shell.
3. Create the public root page at `app/(marketing)/page.tsx`.
4. Add `app/(marketing)/features/page.tsx`.
5. Add `app/(marketing)/donate/page.tsx`.
6. Leave `app/(app)/layout.tsx` and all protected routes untouched.

### Notes

- Keep `app/layout.tsx` as the single root layout.
- Do not create multiple root layouts for this feature.
- The marketing layout should not wrap protected app routes.
- Do not keep both `app/page.tsx` and `app/(marketing)/page.tsx`; they would conflict on `/`.

### Phase 2: Public-site shared components

### Objective

Build reusable public-facing structure before styling individual pages.

### Tasks

1. Create `components/marketing/public-header.tsx`.
2. Create `components/marketing/public-footer.tsx`.
3. Create `components/marketing/marketing-layout.tsx` if a wrapper component improves reuse.
4. Create a lightweight auth-aware CTA component that reads from `useAuth()`.
5. Reuse `Button` where it helps, but allow a slightly bolder public variant if needed.

### Acceptance criteria

- Public pages share one consistent header/footer.
- Header nav works on mobile and desktop.
- Top-right CTA state changes based on auth status.

### Phase 3: Home page build

### Objective

Ship the main public landing experience.

### Tasks

1. Build a strong hero section.
2. Add supporting value-prop cards.
3. Add a three-step "how it works" section.
4. Add a feature highlight section.
5. Add a solo/household positioning section.
6. Add a final CTA band near the bottom.

### Design notes

- Use expressive type scale and spacing.
- Use layered backgrounds or shaped gradients.
- Add subtle motion only where it improves perceived polish.
- Keep the page fast and readable on mobile.

### Acceptance criteria

- A new visitor can understand the product within one screenful.
- The page feels premium and intentional.
- The main CTA is visible without hunting.

### Phase 4: Features page build

### Objective

Turn the product promise into a more complete explanation.

### Tasks

1. Create a features hero.
2. Add 5-7 feature blocks with concise explanations.
3. Add a solo-vs-household usage framing section.
4. Add closing CTAs.

### Acceptance criteria

- The page explains what makes the app useful.
- The page reinforces that the product supports both solo and shared use.

### Phase 5: Donate page build

### Objective

Provide a clean support path without making the site feel monetization-heavy.

### Tasks

1. Create a simple donate hero.
2. Add a support explanation card or section.
3. Add a prominent Ko-fi button.
4. Add optional FAQ-style reassurance copy.

### Acceptance criteria

- The support option is clear.
- The page feels appreciative, not pushy.
- External linking behavior is explicit and polished.

### Phase 6: Auth CTA refinement

### Objective

Make sign-in and sign-up entry points smoother from the marketing site.

### Tasks

1. Update `components/auth/sign-in-form.tsx` to optionally initialize mode from a query param.
2. Support `/sign-in?mode=sign-up` for create-account CTA flows.
3. Keep `/sign-in` defaulted to sign-in mode.
4. Preserve current `next` redirect behavior.

### Acceptance criteria

- `Create account` lands the visitor in sign-up mode immediately.
- `Sign in` lands the visitor in sign-in mode.
- Existing auth flow behavior is not broken.

### Phase 7: Metadata and discoverability

### Objective

Make the new public site present well in tabs, search results, and shared links.

### Tasks

1. Add route-level metadata for `/`, `/features`, and `/donate`.
2. Update the top-level site title/description if needed to reflect the broader public experience.
3. Add stronger page-specific titles and descriptions.
4. Consider adding Open Graph images later as a follow-up.

### Acceptance criteria

- Marketing pages have clear titles and descriptions.
- Browser tabs and shared previews read like a polished product.

### Phase 8: QA and polish

### Objective

Make sure the new public layer feels production-ready.

### Tasks

1. Verify public navigation across desktop and mobile.
2. Verify CTA behavior for:
   - signed-out user
   - signed-in user without household
   - signed-in user with household
3. Verify protected routes still redirect correctly.
4. Verify the donate link opens correctly.
5. Verify visual hierarchy, spacing, and readability on narrow screens.
6. Run lint.
7. Run relevant tests or add coverage for any new behavior-heavy components.

### Acceptance criteria

- No regressions in auth or app routing.
- Public pages look intentional on mobile and desktop.
- Auth CTAs always lead somewhere sensible.

## Proposed File-Level Worklist

Likely files to add:

- `app/(marketing)/layout.tsx`
- `app/(marketing)/page.tsx`
- `app/(marketing)/features/page.tsx`
- `app/(marketing)/donate/page.tsx`
- `components/marketing/public-header.tsx`
- `components/marketing/public-footer.tsx`
- `components/marketing/...` section components as needed

Likely files to update:

- `app/layout.tsx`
- `app/globals.css`
- `components/auth/sign-in-form.tsx`

Likely files to remove or replace:

- `app/page.tsx` redirect implementation

Likely files to leave alone:

- `app/(app)/layout.tsx`
- `components/auth/household-guard.tsx`
- core tracker pages under `app/(app)/...`

## Suggested Delivery Order

1. Routing + layout setup
2. Public header/footer
3. Home page
4. Features page
5. Donate page
6. Sign-up CTA refinement
7. Metadata and polish

## Acceptance Criteria For The Whole Initiative

- Visiting `/` shows a polished public landing page instead of redirecting immediately to `/home`.
- Visitors can clearly understand the product without signing in first.
- Public navigation includes Home, Features, and Donate.
- Sign-in and sign-up are always easy to reach from the top-right header.
- Existing authenticated app flows still work.
- The visual design feels meaningfully more "sizzle-heavy" than the current utility-first public experience.

## Risks and Watchouts

- Avoid making the marketing site visually so different that it feels like a different product.
- Avoid forcing auth-dependent redirects on `/` until server-readable auth exists.
- Avoid copy that overcommits to couples-only usage, since the app already supports solo and broader household modes.
- Avoid letting the donate page dominate the main user journey.

## Open Product Decisions

These are not blockers, but someone implementing this should confirm them if possible:

- Should authenticated users who hit `/` stay on the marketing page with an `Open app` CTA, or eventually auto-redirect after auth resolves?
- Should the home-page CTA text say `Create account`, `Get started`, or `Start tracking`?
- Should the donate page live in the main header at all times, or just in the footer plus occasional CTA blocks?

## Recommended Default Answers

If no further direction is given, implement with these defaults:

- authenticated users may remain on `/`, with `Open app` shown prominently
- primary CTA text = `Create account`
- donate link appears in both header nav and footer

## Summary

This is a strong addition for the project.

The current app already has solid authenticated utility and a decent design foundation. What it lacks is a first impression that sells the product before login. A public marketing layer at `/`, supported by `/features` and `/donate`, is the right next step and can be added cleanly without disturbing the protected app architecture.
