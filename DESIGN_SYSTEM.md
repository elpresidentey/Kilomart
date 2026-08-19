# Premium Farm-Fresh Design System

This document defines the UI/UX design language for the Fresh from the Farm (Kilomart)
marketplace. Follow it for every page you touch.

## 1. Brand direction

"Premium farm-fresh": an organic, trustworthy, premium feel. Deep forest green + fresh
leaf green accents + warm stone neutrals + occasional warm amber. Soft depth, generous
whitespace, refined typography, subtle motion.

## 2. Colors (Tailwind tokens)

- **Primary green** — the brand color. `primary-50..950`. Used for buttons, links,
  active nav, success badges, accents. CTA buttons use `from-primary-600 to-primary-700`.
- **Leaf green** — fresh accent. `leaf-50..900`. Use for secondary buttons
  (`bg-leaf-100 text-leaf-900`), freshness highlights, gradients
  (`from-primary-600 to-leaf-600`).
- **Stone** — neutrals (Tailwind default). Text: `text-stone-900/700/500`. Borders:
  `border-stone-200/300`. Muted bg: `bg-stone-50`, `bg-stone-100`.
- **Amber** — warnings / trust highlights (Tailwind default `amber-*`).
- **Earth** — warm sand tints (rare, decorative only).

Usage rules:
- Background of app: `bg-stone-50`. Cards: `bg-white`.
- Page accent glows use blurred blobs: `rounded-full blur-3xl` with `bg-primary-200/40` etc.
- Dark sections (topbar, footer, dark CTA): `bg-primary-950` with `text-primary-100/80` and
  gradient blobs in `bg-primary-600/20`.

## 3. Typography

- **Display / headings**: `font-display` = **Fraunces** (organic serif). Use for h1/h2/h3,
  hero headlines, big numbers. e.g. `font-display text-4xl font-semibold tracking-tight`.
  Base layer already maps all `h1-h6` to Fraunces.
- **Body / UI**: `font-sans` = **Inter**. Base layer already sets it.
- Eyebrow labels: `eyebrow` class — small uppercase tracking label with a leading dash.
- Gradient headline accent: `gradient-text` class (green→leaf→amber gradient clipped to text).
  Use sparingly on a key word.

## 4. Core components (use from `src/components/ui`)

## 5. Utility classes (defined in `src/index.css`)

- `.eyebrow` — uppercase tracking label with dash.
- `.gradient-text` — green→leaf→amber text gradient.
- `.glass` — `bg-white/70 backdrop-blur-xl border-white/60`.
- `.bg-dots` — faint green dot pattern.
- `.bg-grid` — faint green grid pattern.
- `.table-head` / `.table-cell` — consistent dashboard table cells.
- `.fade-up`, `.fade-up-delay-1..3` — entrance animation.
- `.motion-lift` / `.motion-press` — hover lift / press.
- `.float-soft`, `.pulse-soft` — ambient animations.
- Tailwind: `animate-fade-in-up`, `animate-scale-in`, `animate-page-enter`, `animate-float`,
  `animate-float-slow`, `shadow-soft/card/float/overlay/glow-primary`.

## 6. Page composition rules

- Every page keeps its existing component logic, data fetching, i18n keys, and routing.
  **You restyle, restructure the layout, and polish UX — you do NOT change business logic,
  API calls, or i18n key contracts.**
- Page container: `<Layout>` already provides the max-width wrapper + header + footer.
  Pages with `<Layout>` should NOT add their own outer `max-w-*` wrapper (Cart/Checkout
  already add their own inner `max-w-6xl` — keep a single inner wrapper).
- Section rhythm: `py-14 lg:py-20` between sections; `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Section headers: use `SectionHeading` (eyebrow + title + subtitle).
- Premium section backgrounds alternate: plain `bg-stone-50` (default), subtle tinted
  `bg-gradient-to-br from-primary-50/40 to-transparent`, or dark `bg-primary-950` for CTA.
- Empty states: centered icon in a soft rounded square (`rounded-2xl bg-stone-100`),
  heading, sub-text, CTA button.
- Loading states: skeleton cards with `animate-pulse` blocks + `animate-shimmer` overlay.
- Buttons inside page hero: `size="lg"` primary with icon + `ArrowRight` that translates
  on hover (`group-hover:translate-x-1`).
- Icons from `lucide-react` only. Brand icons (Facebook/Twitter/Instagram) are NOT
  available in lucide-react v1.7 — use `AtSign`, `Camera`, `ThumbsUp`, `MessageCircle`.
- Do not introduce new npm packages.

## 7. Dashboard stat cards (Buyer/Farmer dashboards)

Use a 2/4-column grid of `Card` stat tiles:
```
<Card padding="md" className="flex items-center gap-4">
  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 ring-1 ring-inset ring-primary-600/10">
    <Icon className="h-6 w-6" />
  </div>
  <div className="min-w-0">
    <p className="text-sm font-medium text-stone-500">{label}</p>
    <p className="text-2xl font-bold tabular-nums text-stone-900">{value}</p>
  </div>
</Card>
```

## 8. Headers / footers

- Header is managed by `Layout` (glassy sticky header + dark topbar). Do not duplicate.
- Shared `Footer` is already rendered by `Layout` — dark `bg-primary-950` with gradient
  blobs, brand column, link columns, bottom bar.
- The Landing page has its own full-width header (hero needs full-bleed). It should use
  the shared `<Footer />` at the end (import `{ Footer } from '../components/Footer'`).

## 9. Motion

- Wrap hover micro-interactions in `motion-safe:` variants.
- Entrance animations: `fade-up` + `fade-up-delay-N` or `animate-fade-in-up`.
- Buttons: `motion-safe:hover:-translate-y-px motion-safe:active:scale-[0.98]`.
- Cards: `motion-lift` or Card `interactive`.
- Always honor `prefers-reduced-motion` (the base stylesheet handles it).


- **Button**: `variant` = `primary | secondary | outline | ghost | danger | success`;
  `size` = `sm | md | lg`; supports `isLoading`.
- **Card**: `bg-white rounded-2xl border border-stone-100 shadow-card`; `interactive` adds
  premium hover (lift + green shadow). `padding` = `none|sm|md|lg`.
- **Input**: supports `label`, `error`, `helperText`, `icon`.
- **Select**: styled dropdown with `label`, `error`, `helperText`.
- **Badge**: `variant` = `default|success|warning|error|info`; optional `dot` status dot.
- **Modal**: `open`, `onClose`, `title`, `children`, `footer`, `size`.
- **SectionHeading**: `eyebrow`, `title`, `subtitle`, `align` — for premium section headers.
