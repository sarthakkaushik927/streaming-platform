# SyncStream design system

This is how SyncStream looks and why, written down so anyone (including future me) can add a screen without breaking the look. The same poster style is also used on my portfolios, Neo-folio and the hire-me page, and the notes at the end cover the differences.

All the colour and type values live in `frontend/src/index.css`. If this file and that file ever disagree, the CSS is right and this file needs fixing.

---

## 1. The idea

The app is a place where people watch something together, so it looks like an old cinema: a movie poster, red velvet curtains, marquee light bulbs, paper tickets. Tall poster capitals for headlines, small typewriter caps for labels.

I picked this on purpose over a "clean SaaS" look. The first redesign used neutral greys and a blue accent, and it looked like every other generated dashboard. The poster style gives the app a personality that fits what it does.

Three rules hold the whole thing together:

1. **One accent per job.** Yellow (marquee) means "act here" or "this is the highlight". Red (curtain) means "attention", "stage" or decoration. Cream and black do everything else.
2. **Decoration only where it means something.** The curtain sits behind the video and the approval panel because those are the stage and the thing waiting on you. It is not sprinkled everywhere.
3. **Real content only.** No fake numbers, testimonials, status lights or placeholder rooms. See section 9.

---

## 2. Colour

### Theme tokens

Every colour in a component comes from a token. Never write a hex code in a component, except the fixed poster colours below.

| Token | Dark | Light (default) | Used for |
|---|---|---|---|
| `canvas` | `#0e0b08` cinema black | `#f4ebdd` ticket cream | page background |
| `card` | `#18130e` | `#fbf6ec` | cards, panels, modals |
| `subtle` | `#251d15` | `#eadfcb` | hover fills, chat bubbles, quiet blocks |
| `ink` | `#f4ebdd` | `#0e0b08` | main text |
| `muted` | `#b5a893` | `#5f5345` | secondary text, labels |
| `line` | cream at 14% | black at 16% | borders, dividers |
| `accent` | `#ffc531` yellow | `#b8231b` red | interactive things: primary buttons, links, focus ring |
| `accent-ink` | `#0e0b08` | `#fbf6ec` | text on an accent background |
| `danger` | `#ff7a6e` | `#b8231b` | destructive text and borders |
| `success`, `warning` | green, yellow | darker versions | status text |
| `screen` | `#000000` | `#0e0b08` | behind the video player |

`accent` changes between themes on purpose: yellow text on cream is unreadable, so in light mode the interactive colour is a deep red.

### Fixed poster colours

These stay the same in both themes, because they are printed decoration, not theme colours.

| Token | Value | Used for |
|---|---|---|
| `marquee` / `marquee-ink` | `#ffc531` / `#0e0b08` | bulbs, the host badge, yellow buttons on the curtain |
| `curtain` / `curtain-ink` | `#e5342b` / `#fbf6ec` | velvet curtain, stamps, the red offset shadow |
| `ticket` / `ticket-ink` / `ticket-muted` | cream paper on dark, inverted on light | room cards and other paper tickets |

### Contrast rules

These come from real mistakes, so follow them:

- **Never put yellow text on cream.** In light mode, use `accent` (red) or `ink` instead.
- **Never put cream or white text on yellow.** Text on `marquee` is always `marquee-ink` (black). This bit me twice: the old cyan buttons used the page text colour, which turned into cream-on-yellow.
- **Never put small yellow text on the red curtain.** It looks fine in a screenshot and is hard to read (about 2.3:1). Small text on the curtain is `curtain-ink`. Big headline numbers in yellow are fine.
- **Red text only when it is large or bold.** Small body text in `curtain` red is below 4.5:1 on black.
- Body text must reach 4.5:1 against its background. `muted` on `canvas` passes in both themes; don't go lighter.

### Atmosphere

The page background is not flat. One fixed layer behind everything (`body::before`) holds a warm projector glow from the top, a faint curtain glow in the corners, and light film grain. It is painted once and only composited, so it costs nothing while scrolling.

---

## 3. Type

| Role | Font | Where |
|---|---|---|
| Display | **Anton** (`font-display`) | every `h1`, `h2`, `h3`, the logo, big numbers, stamps |
| Text | **Archivo** (`font-sans`) | body copy, buttons, inputs |
| Labels | **Space Mono** (`font-mono`, `.label-caps`) | small caps labels, IDs, ticket text, timestamps |

Rules:

- Headings use Anton automatically (set in the base layer). Don't override the font on a heading.
- Anton has one weight. Never add `font-bold` to it.
- **Only decorative text is forced to uppercase.** Labels, stamps and tickets use `.label-caps` or `uppercase`. Headings that hold real data (a room name, "I'm Sarthak", a company name) keep their normal case. The text looks better in mixed-case Anton, and tests that read `innerText` see what users see.
- Big headlines use `clamp()` so they scale with the screen, and on desktop heroes they use `min(vw, vh)` so they also fit the screen height.
- Line length for paragraphs stays around `max-w-xl` to `max-w-2xl`.

---

## 4. Layout and spacing

- **One container: `.page-x`.** It is wide (`max-width: 108rem`) with side padding that grows with the screen (`clamp(1rem, 3.5vw, 4rem)`). Don't use `max-w-7xl mx-auto px-4`; that left big empty bands on wide or zoomed-out windows.
- **Section spacing is tight on purpose:** `py-10 md:py-14` for most sections. Huge gaps between sections looked padded and "AI-made".
- **Heroes fit one screen on desktop.** They size from their content, not `min-h-screen`, and their type uses viewport units so they fit at 80%, 100% and 125% zoom.
- **The navbar is fixed and its height is a token**, `--nav-h` (`4rem + 11px`: bulb strip, bar, border). Full-height pages, like the room, use `calc(100svh - var(--nav-h))`.
- **Radius is small:** `rounded-sm` almost everywhere. Posters and tickets have sharp corners. Avatars and dots are the only round things.
- **Touch targets are at least 44px** (`min-h-11`, `size-11`).

### Same look at any zoom

On desktop (64rem and up) the root font size follows the window width:

```css
html { font-size: clamp(13px, calc(100vw / 96), 24px); }
```

Because everything is sized in rem, the whole page keeps its proportions whether the browser is at 80%, 100% or 125%. A 1536px-wide window (a 1920px screen at 125%) gets the normal 16px. Phones keep the default size.

The catch: on desktop, browser zoom no longer makes text bigger, which matters for people who zoom to read. This was a deliberate choice; revisit it if accessibility becomes a priority. Because of this rule, **use rem, not px**, for sizes in components. Pixel sizes stay small while everything else scales.

---

## 5. Signature pieces

These are what make it look like a cinema. Each is a small utility in `index.css`.

| Piece | Class | What it is | Where it's used |
|---|---|---|---|
| Curtain | `.curtain` | red velvet with vertical folds | room title bar, video stage, approval panel, landing hero poster, closing call to action, splash, hire-me poster |
| Marquee bulbs | `.marquee-bulbs` | a 10px strip of bulbs that slowly chase | top of the navbar, edges of curtains |
| Ticket | `.ticket` + `<Ticket>` | paper with half-circle notches where the stub tears off | room cards, sign-in box, "how to get in" steps |
| Perforation | `.perforation` | dashed tear line | between a ticket and its stub |
| Spotlight | `.spotlight` | soft yellow light from above | inside curtain panels behind headlines |
| Stamp | inline | rotated block of poster type ("NOW SHOWING", "STARRING") | landing hero, hire-me photo |
| Film strip | `.film-strip` | black strip with sprocket holes | experience timeline |
| Screen | `bg-screen` | pure black | behind the YouTube player |
| Red offset shadow | `shadow-[3px_3px_0_var(--curtain)]` | a misregistered-print look | primary buttons, hovered tickets |

Use them where they mean something. A curtain says "stage" or "needs you". Bulbs say "show". A ticket says "a way in". If a new screen doesn't have one of those meanings, it doesn't need the decoration.

---

## 6. Components

All shared pieces are in `frontend/src/components/shared/`. Build new screens out of these instead of styling raw elements.

### Buttons

`Button`, `LinkButton` and `buttonClasses()` share one set of variants:

| Variant | Looks like | Use for |
|---|---|---|
| `primary` | accent fill, red offset shadow | the one main action on a screen |
| `outline` | thin border, turns accent on hover | secondary actions |
| `ghost` | text only, soft hover | toolbar and low-priority actions |
| `danger` | red border and text, fills red on hover | destructive actions (Sign Out, Delete) |
| `marquee` | yellow in both themes, black shadow | primary action on the red curtain |
| `curtain-outline` | cream border on the curtain | secondary action on the curtain |
| `curtain-ghost` | cream text, darker hover | toolbar buttons on the curtain |

One primary button per area. Icon-only buttons use `IconButton`, which requires a `label` (it becomes the accessible name and tooltip).

### Other pieces

| Component | Use it for |
|---|---|
| `Card` | any boxed panel (card background, thin line border) |
| `Ticket` | anything that is "a way in": a room, the sign-in form. `interactive` adds the hover lift and red shadow; turn it off for forms |
| `Input` | every text field: label in small caps, optional icon, error or hint text wired up for screen readers |
| `Modal` | dialogs. Yellow top edge, poster title, closes on backdrop click |
| `Toast` | short confirmations. Yellow left edge |
| `PageHeader` | the big title and actions at the top of a page |
| `EmptyState` | "nothing here yet". A dashed empty screen with one poster line |
| `RoleBadge` | Host (yellow), Moderator (accent outline), Participant (quiet outline) |
| `Avatar` | first letter in Anton on a subtle square |
| `Navbar` | rendered once by the router, not by pages |
| `SplashScreen` | the opening curtain, once per session |
| `PageLayout`, `AuthLayout` | page frames, so pages only describe their own content |

### Rules

- **Pages stay thin.** Logic lives in stores, hooks and services; components only render. The redesign changed how everything looks without touching a single store or service.
- **One job per component.** If a component is styling a room card and fetching data, split it.
- **Names in tests are part of the contract.** Button labels like "Create Room", "Approve" and "Transfer Host" are used by tests and screen readers. Change them only on purpose.

---

## 7. Motion

Animations use Framer Motion. Shared settings are in `motionPresets.ts` and `Motion.tsx`.

| Preset | What it does |
|---|---|
| `EASE_OUT` `[0.22, 1, 0.36, 1]` | the one easing curve: quick start, soft landing |
| `PageTransition` | pages fade and rise 14px in (0.35s), fade out (0.15s) |
| `Reveal` | rises 28px into place the first time it scrolls into view (0.6s) |
| `staggerOnScroll` / `staggerOnMount` + `staggerItem` | children reveal one after another, 0.09s apart |
| `hoverLift` | a springy 6px lift on hover |
| `IN_VIEW` | reveal once, slightly before fully on screen |

Rules, most of them learned the hard way:

- **Respect reduced motion.** `MotionConfig reducedMotion="user"` wraps the app, the CSS cuts animation time for those users, and the splash is skipped entirely.
- **Animate transform and opacity only.** The sync bars on the landing poster used to animate `width`, which redoes layout every frame. They use `scaleX` now.
- **Never put a `layoutId` on something that appears more than once on screen.** The splash title shared a `layoutId` with the logo, and the logo also appears in the footer. The navbar logo kept sliding to the footer. A `layoutId` must be unique on screen.
- **Nothing expensive that repaints the whole screen.** No `background-attachment: fixed` (it repaints on every scroll) and no `backdrop-blur` on the sticky navbar. Both made the page slow when zoomed out.
- **Motion serves a purpose.** Reveals guide the eye down the page; the sliding nav tab shows where you went; the curtain opening says "the show starts". No motion for its own sake, and nothing that loops forever except the bulbs and the sync demo.
- **Keep it quick.** Most transitions are 0.15 to 0.6 seconds. The splash is the only long one, and it plays once per session.

---

## 8. Accessibility

- Focus ring: a 2px accent outline on `:focus-visible`, never removed.
- Every icon-only button has a name (`IconButton` enforces it).
- Inputs have real labels; errors are linked with `aria-describedby`.
- Dialogs use `role="dialog"` and `aria-modal`; the phone menu closes with Escape.
- Decorative pieces (bulbs, stamps, grain, perforations) are `aria-hidden`.
- Contrast follows section 2; reduced motion follows section 7.
- Touch targets are at least 44px.

---

## 9. Writing and "not AI" rules

The first redesign looked machine-made, and most of that came from patterns, not colours. Avoid these:

**Layout patterns to avoid**
- The small spaced-out caps label with a dash in front of every heading ("— TONIGHT'S FEATURE"). It's the most common generated-site pattern. All of them were removed.
- A big empty gap between every section.
- A row of three identical icon cards with a one-line blurb each, repeated down the page.
- Gradient blobs, glassmorphism, glowing borders.
- A narrow centred column on a wide screen.

**Words to avoid**
- Filler: seamless, robust, leverage, cutting-edge, effortless, comprehensive, delve, elevate, unlock, empower.
- Heavy use of em dashes.
- Exclamation marks in product copy.

**Content rules**
- No fake data. No invented stats, testimonials, "live" indicators, made-up rooms or placeholder people presented as real. The "Interstellar Watch Party" room with 12 fake participants was removed for this reason, and so were fake playback logs and a fake status panel.
- No claims I can't back up. Numbers on the hire-me page come from my resume.
- Plain, specific sentences: say what a thing does ("Paste any YouTube link and watch together."), not how amazing it is.
- Buttons say what happens: "Create Room", "Send Verification Code", "Approve".
- Sentence case for body copy; poster caps only for decoration.

---

## 10. Themes

- **Light is the default** for SyncStream: a matinee printed on ticket cream. The saved preference uses a new key (`syncstream-theme-v2`), so everyone starts on light once, even if an earlier visit saved dark.
- **Dark** is the cinema at night: same layout, `accent` becomes marquee yellow, tickets turn into cream paper.
- Every new colour needs a value in both themes, or must be one of the fixed poster colours.

---

## 11. Checklist before shipping a screen

- [ ] Only tokens and shared components, no stray hex codes or one-off buttons
- [ ] Readable in both themes, especially text on yellow and on the curtain
- [ ] Sizes in rem; looks the same at 80%, 100% and 125% zoom
- [ ] Works at phone width with no sideways scrolling
- [ ] Animations are transform/opacity only, respect reduced motion, no repeated `layoutId`
- [ ] No fake data, no filler words, no dash-label eyebrows
- [ ] Icon buttons have labels, inputs have labels, focus is visible
- [ ] Typecheck, lint and build pass, and the browser tests still pass

---

## 12. Other projects using this look

**Neo-folio** (`milimalist-portfolio/Neo-folio`) uses the same poster palette and fonts, with a few differences:
- Light is its default theme.
- In dark mode the curtain is a deeper velvet (`#861F18`), so it doesn't glare against black. The highlighted headline uses `--hit`: red on cream, yellow on black.
- Its older neo-brutalist structure (thick borders, hard offset shadows) is kept, with the shadows switched to curtain red.
- The splash says "SARTHAK" and parts like a curtain; the hero is a split screen; links are ticket stubs.

**Hire-me page** (inside SyncStream) is a one-sheet movie poster: name on the curtain, photo framed with a "STARRING" stamp, real stats, and a credits line built from the resume data in `frontend/src/data/profile.ts`.

**Mac portfolio** keeps its own macOS look; only its content was updated.
