# Components (liquid-glass.css)

Every class below ships in `kit/liquid-glass.css`. Use them as-is; a page's own
`<style>` holds layout only. If you need a component that isn't here, build it
from the tokens and add it to the kit rather than restyling per page.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--ink` / `--ink-2` / `--ink-3` / `--ink-4` | `#10241a` `#3f5248` `#6b7c72` `#98a69d` | Text, body copy, labels/meta, disabled/placeholder |
| `--brand-deep` `--brand-green` `--brand-mid` `--brand-lime` | `#0f4f34` `#1a6f3a` `#5fae52` `#a8cc4a` | Brand: logo greens. Primary button gradient, active nav, avatar |
| `--accent` | `#127942` | Links, focus ring, selected states, "Actual" badge |
| `--ok` `--warn` `--err` `--info` (+ `-soft`) | `#1aa34a` `#c98a12` `#d2453c` `#2f6fb3` | **Status only**, always with a word |
| `--bg` | `#eef3ee` | Page ground under the green field |
| `--glass` / `--glass-strong` / `--glass-flat` | white gradients | Panels / sidebar, dialogs, auth card / quiet surfaces |
| `--glass-blur` | `blur(22px) saturate(170%)` | The frosting (app pages only; never over a live 3D scene) |
| `--hairline` / `--hairline-2` | ink at 9% / 16% | Borders, table rules |
| `--shadow` / `--shadow-lift` | inset highlight + soft green shadow | Resting / floating surfaces |
| `--zone-left/center/right/other` | `#2a78d6` `#127942` `#eb6834` `#98a69d` | Categorical chart series (validated); see charts.md |
| `--r-lg` 18 · `--r` 14 · `--r-sm` 10 · `--r-pill` 999 | | Cards · tiles/inputs · controls · buttons, badges |
| `--ease` | `cubic-bezier(.2,.7,.2,1)` | All transitions |

The body paints a fixed, soft green field from four radial gradients. Glass
reads as glass only over it, so don't give `body` or `.app-main` a flat
background.

## Shell

- `#app-sidebar` holds a floating glass rail 12 px from the window edges.
  Inside it:
  - `.sb-brand`: `.sb-logo` (wordmark + `.sb-product`), `.sb-mark-only`
    (shown when collapsed) and `#sb-collapse`.
  - `.sb-nav`: `.sb-group` → `.sb-group-label` + `.sb-item`. `.active`
    plus `aria-current="page"`; the active item gets a lime-to-green
    indicator bar.
  - `.sb-foot`: `.sb-status` (`#connection-dot.dot-on|dot-off`,
    `#status-badge`), `.sb-user` (`.avatar`, name/role, account and sign-out
    actions), `.sb-client` (the client slot).
- `body.sb-collapsed` sets the rail to 60 px. It's remembered per browser by
  `liquid-glass.js`, and forced below 760 px wide.
- `.app-main` holds the content beside the rail. Wrap it in `.container`
  (max 1600 px, 28 px gutters, 14 px on phones).
- `body.fit-viewport` is for wall displays. The page fits the screen, and
  long regions scroll inside their own card. It's released on phones.
- `.banner` is an amber notice above the page (e.g. a default password). It
  takes an optional `.btn` at the end.
- `.skip-link` must be the first thing in `<body>`.

## Page head

```html
<header class="page-head">
  <div>
    <div class="eyebrow">Overview</div>        <!-- the nav group -->
    <h1>Live monitor</h1>                       <!-- sentence case -->
    <p class="page-sub">One sentence: what this page is for.</p>
  </div>
  <div class="page-actions">… at most one .btn-primary …</div>
</header>
```

## Surfaces

- `.card` / `.glass` is the frosted panel (18 px radius, 18 px padding).
  - `.card-head` is a flex row containing `.card-title` and `.card-sub`.
  - `.card-pad-0` is for a table or media edge to edge.
  - `.card-flat` is a quieter surface with no shadow.
- `.grid` with `.grid-2`, `.grid-3` or `.grid-4` collapses to 2, then 1
  column. `.stack` is a vertical 16 px rhythm, `.row` an inline cluster, and
  `.spacer` pushes items apart.
- Cards stacked vertically get 16 px between them automatically. Inside any
  `.grid`, `.row`, `.stack`, `*-grid` or `*-row` container they don't.

## KPI tiles

`.kpi-grid` (auto-fit, min 170 px) → `.kpi` → `.kpi-label` (mono caps),
`.kpi-value` (display 28 px; `<small>` for units), `.kpi-note`. Tint the
value with `.kpi-good`, `.kpi-warn` or `.kpi-bad`, and only when it means
something.

## Buttons

- `.btn` is the default, a white glass pill.
- `.btn-primary` is the green gradient, **one per view**.
- `.btn-danger` is for destructive actions, `.btn-ghost` for tertiary ones.
- Sizes: `.btn-sm`, `.btn-lg`, and `.btn-icon` (square).
- Disabled uses the `disabled` attribute or `aria-disabled="true"`.
- On phones every `.btn` grows to 44 px.

## Fields

- `.field` contains a `<label>`, the control, and an optional `.hint`.
  Consecutive fields get 12 px between them.
- Bare controls use `.input`, `.select` or `.textarea`.
- Focus is a green ring.
- `:disabled` is visibly flat. Use it for view-only roles rather than hiding
  values.
- On phones, inputs are 16 px so iOS doesn't zoom.

## Tables

```html
<section class="card card-pad-0">
  <div class="table-wrap">           <!-- scrolls sideways, the page never does -->
    <table class="table"> … <th class="num"> … <td class="num"> …
```

- Headers are sticky, frosted, mono caps.
- Rows get a hover tint.
- Numbers go right-aligned with `.num`, on both `th` and `td`.

## Badges, chips, dots

- **`.badge`** comes in `-ok`, `-warn`, `-err`, `-info` and `-accent`
  variants. Status is always a badge or dot **plus a word**, never coloured
  text alone.
- **`.badge-sim`** is the striped, dashed blue badge that says
  **"Simulated"**. Use it for digital-twin or seeded data, and label real data
  `.badge-accent` **"Actual"**. A viewer must never mistake a simulation for
  production.
- **`.chip`** is a neutral tag, for roster names or filters.
- **`.dot`** comes in `-ok`, `-warn` and `-err`. `.dot-live` pulses, and the
  pulse is honoured by reduced motion.

## Tabs and segmented control

`.tabs` → `.tab` for navigation within a page (`aria-selected`). `.seg` →
`button` for a choice of view or filter (`aria-pressed`). Both are pill
groups; the selected item is solid white.

## Dialogs

- Use a native `<dialog class="modal">` with `showModal()`, styled by
  `::backdrop`. Give it a width with something like
  `width: min(460px, calc(100vw - 32px))`.
- Legacy overlays: `body .modal-overlay` is already z-index 200 (above the
  sidebar), blurred and tinted.

## Feedback

- `.toast-stack` holds `.toast`, with `.toast-ok` and `.toast-err` variants
  (a left rule).
- `.empty` is for empty and loading states. Put a `<strong>` one-liner first,
  then a hint that says what to do next.
- `.skeleton` is a shimmer placeholder.

## Auth

`.auth-page` → `.auth-card` → `.auth-logo`, `.auth-title`, `.auth-sub`,
`.auth-error` (with `role="alert"`), `.field`s, a full-width `.btn-primary`,
and an optional `.auth-client` slot and `.auth-foot`. See
`kit/template-login.html`.

## Utilities

`[hidden]` always wins. `.sr-only` is for labels only screen readers need.
`.num` gives tabular, right-aligned numbers. The whole document uses
`font-variant-numeric: tabular-nums`.

## Interactive glass buttons

Add `.btn-glass` to `.btn` and load `liquid-glass-buttons.js` with `defer`.
Use `.btn-primary` for tinted glass. Hold and move for bounded surface stretch
and a pointer highlight; release settles it. The label remains unscaled.
A drag over 8 px suppresses the click; a fresh tap and keyboard activation work
normally. Vertical touch scrolling is preserved. `.glass-opaque` on a parent
disables transparency. Reduced motion removes elastic movement. Avoid nesting
interactive glass buttons on blurred glass surfaces; use ordinary buttons there.
See `kit/demo-buttons.html` for a standalone example.

## Theme, navigation, and motion components

See `references/themes-and-motion.md` for custom colors/backgrounds,
`.glass-menubar` navigation, and interruptible `LiquidGlass.show` / `hide`
transitions. Use `.glass-lite` or `.glass-opaque` on a containing element
for lower-cost or opaque material rendering.
