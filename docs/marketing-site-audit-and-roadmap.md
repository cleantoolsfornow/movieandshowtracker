# Marketing Site Audit and Roadmap

## Why this document exists

This is a current-state review of the public marketing pages in the repo, plus recommendations for:

- copy that should be tightened
- structure that should be improved
- pages that should be added
- promises that should be adjusted to better match the actual product today

This is based on the current public routes and shared marketing components in the codebase.

## Current marketing surface

Current public pages:

- `/`
- `/features`
- `/donate`
- `/sign-in`

Current shared public components:

- sticky public header
- sticky/floating public auth CTA
- public footer
- shared CTA rows
- shared marketing layout and decorative design system

## Overall assessment

The marketing site is visually strong and much more polished than a generic SaaS landing page. It has personality, a clear visual direction, and a stronger emotional point of view than most early product sites.

The main problem is not presentation quality.

The main problem is message accuracy and conversion architecture:

- some copy promises features the app does not fully have yet
- some sections describe outcomes more concretely than the product can currently deliver
- the site is light on proof, trust, and support pages
- the page set is too thin for a product that wants to feel real and credible

In short:

- design quality is good
- brand voice is good
- information architecture is incomplete
- positioning is slightly ahead of the product

## What is already working

- The brand feels distinct.
- The site avoids generic "productivity app" language.
- The solo + household angle is clear.
- The CTAs are simple and understandable.
- The visual system is cohesive across home, features, donate, and sign-in.
- The product promise is emotionally legible:
  - save titles quickly
  - keep things organized
  - make deciding what to watch easier

That foundation is good and worth keeping.

## Biggest issues

## 1. The marketing copy is ahead of the product

This is the biggest issue.

The site repeatedly talks as if FilmPickle already has:

- a real shortlist system
- clear front-runners
- household momentum
- tonight decision support
- rewatch queue behavior
- stronger progress tracking than the app currently supports

But the actual app today is closer to:

- shared watchlist
- personal watched/want state
- watched-together event tracking
- basic library filters
- title-level movie/show tracking

That means the site is sometimes describing the product as if it already has a dedicated decision engine, richer TV progress, and stronger household intelligence.

That gap should be reduced.

## 2. The site does not clearly separate "available now" from "coming soon"

The product vision is strong, but the marketing site currently blends:

- current capabilities
- implied capabilities
- aspirational future capabilities

This is risky because users can feel misled after sign-up, even if the product is still good.

## 3. There are too few trust and support pages

For a real product using sign-in and household data, the public site should not stop at:

- Home
- Features
- Donate

It needs some combination of:

- privacy
- terms
- contact/support
- FAQ
- about
- changelog or roadmap

Without these, the product feels more like a concept or side project than a trustworthy app people can commit to.

## 4. The public site is missing proof

There are no real screenshots or grounded proof artifacts.

The site relies heavily on stylized mock panels and conceptual claims. That makes it attractive, but not fully convincing.

It would benefit from:

- real screenshots from the current app
- annotated product walkthroughs
- "what it actually looks like" sections
- clearer examples of solo use and household use

## 5. Donate is too prominent relative to trust/support depth

`/donate` is a valid page, but right now it exists before more foundational public pages do.

That can make the site feel slightly out of order.

Suggested principle:

- trust pages before support/funding pages

## Page-by-page audit

## `/`

### What is good

- Strong visual design
- Strong first impression
- Good articulation of the solo + household concept
- CTA placement is solid
- Good emotional framing around reducing watch-night friction

### What should change

- Tone down claims around shortlist and front-runner logic unless the app actually has those product surfaces.
- Replace some speculative mock labels with more current-feature-accurate examples.
- Add at least one section that clearly shows the real current product:
  - search and add
  - dashboard
  - title detail
  - household-aware statuses
- Consider a clearer "what you can do today" section.

### Specific copy risk areas

These concepts are stronger than the current app supports and should either be softened or turned into explicit future-facing language:

- `shared shortlist`
- `clear front-runner`
- `household pulse`
- `everyone is pointed at the same few options`
- `open a shortlist and pick`

Those are excellent product goals, but they are not yet fully backed by the current app model.

## `/features`

### What is good

- The page is organized clearly.
- The feature buckets are sensible.
- It reinforces the main promise well.

### What should change

- Make the features page more literal and less atmospheric.
- Use this page as the "truth page" for actual capabilities.
- Break features into:
  - available now
  - planned next

### Suggested structure

- `Available now`
  - search and save titles
  - personal watchlist and watched tracking
  - shared household watchlist
  - watched together events
  - ratings and notes
  - poster-first browsing
- `Coming next`
  - richer TV progress
  - better watch-night picker
  - shortlist mode
  - smarter household decision support

Right now the page is attractive, but it reads more like positioning than documentation.

## `/donate`

### What is good

- The tone is respectful and not pushy.
- The rationale for support is reasonable.
- The page fits the rest of the brand.

### What should change

- Keep the page, but de-emphasize it in the public nav until more trust pages exist.
- Move it out of the top-tier nav or make it less primary than:
  - FAQ
  - Privacy
  - Contact
  - About

### Suggested nav treatment

Better in footer than in the main top nav for now.

## `/sign-in`

### What is good

- The page looks polished.
- It keeps the brand tone coherent.
- The solo + household positioning comes through clearly.

### What should change

- Reduce or remove copy that implies mature shortlist/intelligence features that do not yet exist.
- Make the preview panel feel closer to the actual app.
- Add one small line reinforcing what happens after sign-up:
  - create your personal tracker
  - or join a household with an invite

That makes first-run expectations clearer.

## Shared component audit

## Header

### Current issue

Top nav is too sparse for a product site.

Current links:

- Home
- Features
- Donate

Recommended top-level nav instead:

- Home
- Features
- How it works
- FAQ
- Sign in / Create account

Optional later:

- About
- Changelog

`Donate` should likely move to the footer for now.

## Footer

### Current issue

Footer is missing essential product/legal/support destinations.

Recommended footer links:

- Home
- Features
- FAQ
- Privacy
- Terms
- Contact / Support
- About
- Changelog or Roadmap
- Sign in
- Donate

## CTA system

### Current issue

CTAs are clean, but a little too generic.

The site would benefit from more context-specific CTA labels, such as:

- `Create your personal tracker`
- `Start with a solo account`
- `Open household dashboard`
- `See what the app does today`

That would make the value proposition clearer than just `Create account` in every context.

## Recommended pages to add

These are the highest-value missing pages.

## P0 pages to add

### 1. `/how-it-works`

Purpose:

- explain the actual flow clearly
- reduce ambiguity
- connect marketing promise to product reality

Should cover:

- create account
- create or join household
- search and save titles
- mark watched / want to watch
- use personal and shared tracking together

This page should be concrete and screenshot-heavy.

### 2. `/faq`

Purpose:

- remove friction before sign-up
- answer solo-vs-household questions
- answer "what does it do right now?" honestly

Suggested questions:

- Can I use FilmPickle by myself?
- Do I need to create a household?
- Can I invite someone later?
- Does it support couples and roommates?
- Can each person track their own watch status?
- Does it support TV progress?
  If not yet, say so clearly.
- Is it free?

### 3. `/privacy`

Essential if the product is using sign-in, user profiles, and household data.

Should explain:

- what is stored
- what auth provider is used
- what TMDB data is used
- what is shared inside a household
- what is private to the account

### 4. `/terms`

Basic product/legal hygiene.

### 5. `/support` or `/contact`

Users need a clear place to go for:

- bugs
- questions
- account help
- household issues

## P1 pages to add

### 6. `/about`

Purpose:

- make the project feel human
- explain why the product exists
- reinforce trust and intent

### 7. `/changelog` or `/roadmap`

Purpose:

- show progress
- make early product status feel active and intentional
- let you safely talk about future features without pretending they already exist

This page is especially valuable because the product vision is strong and still evolving.

### 8. `/compare` or `/why-film-pickle`

Purpose:

- explain what makes FilmPickle different from:
  - notes apps
  - spreadsheets
  - generic watchlists
  - private-only trackers

This would sharpen positioning.

## Messaging changes I would recommend

## Keep

- solo + household positioning
- low-friction capture
- poster-first browsing
- easier watch-night decisions as the north star

## Tone down for now

- shortlist language as if it already exists as a first-class feature
- front-runner / momentum / pulse language as if the app computes that today
- rewatch language beyond what the product actually stores
- deeper progress language for TV

## Replace with more accurate current messaging

Instead of:

- `Your household's watchlist, finally handled.`

Consider:

- `Track what you want to watch and what you've watched, solo or with your household.`
- `A cleaner movie and show tracker for personal queues and shared watch decisions.`

Instead of:

- `Turn a messy maybe-list into a real tonight list.`

Consider:

- `Keep shared picks visible so deciding what to watch gets easier.`

That still sells the direction without claiming the final system is already there.

## Recommended homepage structure

This would be a stronger version of the current public home page:

### Section 1. Hero

- clear product category
- solo + household support
- primary CTA
- secondary CTA
- one grounded screenshot or realistic product composite

### Section 2. What it does today

- save titles quickly
- track personal watch status
- keep shared household context
- browse visually

### Section 3. Why it feels better

- cleaner than notes/spreadsheets/text threads
- better for deciding together
- designed for low-friction updates

### Section 4. Use cases

- solo
- two people
- 3+ household

### Section 5. Real product preview

- real UI screenshots, not just conceptual cards

### Section 6. FAQ preview

- answer the top 3-5 sign-up objections

### Section 7. CTA

- create account
- learn how it works

## Visual recommendations

The overall visual direction should stay.

Suggested improvements:

- add at least a few real app screenshots
- keep the stylized mock cards, but pair them with grounded proof
- use captioned screenshots with explicit labels like:
  - `Dashboard`
  - `Search and add`
  - `Household title detail`
- consider lighter motion/staggering tied to actual information reveal

The site already looks good. It mostly needs more truth, more structure, and more proof.

## Priority roadmap

## P0

- add `FAQ`
- add `Privacy`
- add `Terms`
- add `Support/Contact`
- remove `Donate` from top nav
- tighten homepage and features page copy so it matches actual current functionality
- add at least one real screenshot section

## P1

- add `How it works`
- add `About`
- add `Changelog` or `Roadmap`
- improve CTA labels by page context
- split features into `Available now` and `Coming next`

## P2

- add comparison/positioning page
- add richer onboarding explanation pages
- add lightweight proof elements:
  - testimonials later
  - product updates
  - usage examples

## Bottom line

The marketing site is already stylish, cohesive, and much better than average visually.

What it needs now is not a visual reinvention.

It needs:

- tighter honesty around current features
- stronger public-site information architecture
- more trust/support/legal pages
- more grounded proof
- a clearer distinction between present capability and future roadmap

If those changes are made, the site will feel not just attractive, but credible and conversion-ready.
