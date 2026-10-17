---
name: liquid-glass-design
description: Build and restyle web apps, dashboards, admin panels, and WebGL overlays with a light Liquid Glass design system. Use when the user asks for liquid glass or this kit; includes CSS tokens, accessible app and sign-in templates, and a no-blur overlay variant.
---

# Liquid Glass design

Light, calm and professional: frosted white surfaces over a soft green field,
with product-neutral templates and configurable brand accents.

## Authoritative guidelines

Read `references/liquid-glass-design-guidelines.md` before building or
reviewing a screen. It is the authoritative UI/UX design engineering guide
(v1.0, 17 October 2026): the user's 31 principles, written for implementers
and reviewers. **MUST** items are release requirements. **SHOULD** items need
a recorded reason to skip.

Where that guide conflicts with this skill or another reference, the guide
wins. Keep the kit map, class names, and recipes in this folder when they do
not conflict. `references/implementation-status.md` records which principles
are implemented in the kit and which stay documentation because this
repository has no application backend, chart runtime, or 3D engine.

The guide's dark token sample in pattern P1 is a reference shape, not a
restyle. This kit stays light. Map its rules onto the classes below: glass
for navigation and one outer shell, opaque data wells for readings, tables,
forms, alarms, and confirmation reviews.

Do not manipulate people with dark patterns. Operational safety, truthful
state, and informed choice outrank engagement and decoration. This UI does
not replace a certified safety system.

## When it applies

- The user requests Liquid Glass or this design kit.
- The project already uses `liquid-glass.css` or its tokens.
- Preserve the user's chosen design system on unrelated projects.

## The kit: copy, don't re-derive

`kit/` next to this file holds working files. Copy them into the project's
static folder and build on them.

| File | Use |
| --- | --- |
| `liquid-glass.css` | Tokens, base, the app shell (floating glass sidebar, collapsed rail, account chip, client slot), banner, page head, cards, KPI tiles, buttons, fields, tables, badges (incl. **Simulated / Actual**), tabs and segmented control, dialogs, toasts, empty and loading states, auth pages, reduced-transparency/motion, phone layout |
| `liquid-glass-overlay.css` | The same tokens for panels **over a live WebGL/canvas scene**: no `backdrop-filter`, faked glass, collapsible blocks, read-outs, pills, keys, embed mode |
| `liquid-glass.js` | Sidebar collapse (remembered), server status dot from a health URL, 401 → sign-in redirect. No dependencies |
| `liquid-glass-buttons.js` | Opt-in `.btn-glass` hold/drag surface feedback; movement over 8 px cancels activation, reduced-motion support |
| `liquid-glass-theme.js` | Custom background/accent colors with derived tints and primary-label contrast |
| `liquid-glass-motion.js` | Interruptible pop/fade/slide show/hide APIs, responsive glass navigation, and reduced-motion / reduced-effects preferences. The OS reduced-motion preference cannot be overridden. |
| `liquid-glass-ops.js` | Truthful command phases, pressure parsing, identifier normalization, reading freshness, and determinate progress |
| `demo-system.html` | Theme, glass menu, animation, and mobile playground |
| `demo-buttons.html` | Standalone clear/tinted button playground |
| `template-app.html` | A complete app page in the correct structure |
| `template-login.html` | Sign-in page with the client slot |
| `jinja/base.html` | The production Flask/Jinja shell: role-filtered grouped nav, account chip, default-password banner |

In React, Vue or Svelte, import `liquid-glass.css` once at the root and use the
class names. Use `LiquidGlass.setTheme` for customization; keep CSS tokens as the shared source of truth.

## Tokens (defaults; customize deliberately)

| Token | Value | Role |
| --- | --- | --- |
| `--ink` / `--ink-2` / `--ink-3` | `#10241a` / `#3f5248` / `#4a5c54` | Text / body / labels and meta. Muted text clears 4.5:1 on white |
| `--brand-deep` `--brand-green` `--brand-mid` `--brand-lime` | `#0f4f34` `#1a6f3a` `#5fae52` `#a8cc4a` | Default brand palette: primary button, active nav, avatar |
| `--accent` | `#127942` | Links, focus ring, selection, "Actual" |
| `--ok` `--warn` `--err` `--info` | `#188a3c` `#9a6808` `#d2453c` `#2f6fb3` | **Status graphics**, always with a word. Text uses `--ok-ink` `--warn-ink` `--err-ink` `--info-ink` |
| `--bg` + field | `#eef3ee` + four soft radial greens, fixed | Default background field; customize or disable it |
| Glass | white 74→54% gradient, `blur(22px) saturate(170%)`, 1px white edge, inset top highlight, soft green shadow | Navigation and outer shells. Readings use opaque `--well` (`#f7faf7`) |

Radii are 18 px (cards), 14 (tiles, inputs), 10 (controls) and 999 (buttons,
badges). Entry easing is `cubic-bezier(.2,.8,.2,1)`; departures use
`cubic-bezier(.4,0,1,1)`; state changes use `cubic-bezier(.4,0,.2,1)`.
Default motion is 200 ms (inspector or disclosure) and decorative motion stays
within 240 ms. Surfaces are light; backgrounds and accents are customizable.
Body text is 16 px. Standalone controls are at least 44×44 px, and 48×48 px
for coarse pointers.

## Type

- System stack: `-apple-system, "SF Pro Text", "Segoe UI", Inter, sans-serif`.
  It looks native on the Macs and iPads these demos run on, and loads nothing.
- Display: 26 px / 700 / −0.02em for page titles; 28 px for KPI values.
- `--mono` is only for small uppercase labels: `.eyebrow`, `.kpi-label`,
  table headers, nav group labels.
- Tabular numerals everywhere.
- Sentence case for every heading, button and label.

## Rules that make it read as professional

1. **One page head, everywhere:** eyebrow (the nav group) → h1 → a
   one-sentence subtitle on the left; actions on the right, **at most one
   primary**.
2. **Group the navigation** by what people come to do (Overview, Production,
   People, System). Filter it by role, and map detail pages to their list
   page.
3. **Hierarchy per screen:** KPI row → the primary content → the secondary
   content. Filters go in one toolbar row. 16 px rhythm.
4. **Status is a badge or dot plus a word.** Brand green is not "ok".
5. **Simulated vs actual is unmistakable.** Digital-twin or seeded data gets
   `.badge-sim` "Simulated" (striped, dashed blue); real data gets
   `.badge-accent` "Actual". Pages that aggregate say at the top which they're
   showing.
6. **Every list and chart has an `.empty` state** that names the next step.
7. **Roles shape the UI:** viewers see everything and no edit affordances.
   Below admin, configuration inputs are disabled rather than hidden.
8. **Keep decorative effects restrained and use SVG icons.** Icons are inline Feather SVGs,
   18 px, `stroke` set to `currentColor`.

## Over a 3D scene

Use `liquid-glass-overlay.css`, **never `backdrop-filter`**. Blur cost scales with panel area and can compete with scene rendering.
Fake the glass, and put a faint white base under long panels.

When the scene is embedded in an app page:
- serve it same-origin under a path;
- give it a compact `?embed=1` mode: a status chip, no keyboard capture
  until clicked;
- give the frame a toolbar (full screen, new tab, reload);
- show an honest empty state if the scene isn't served.

## Customization and motion

Use `references/themes-and-motion.md` when adding custom backgrounds/accents,
glass menu bars, entrances/exits, or mobile navigation. Animate wrappers using
transform/opacity; reserve blur for small static material layers. Target 60 fps
and profile on representative devices, with `.glass-lite` and `.glass-opaque`
fallbacks. Honor reduced motion and preserve keyboard focus on exit.

## Read next

- `references/components.md`: every class, token and how to use it.
- `references/page-recipes.md`: live monitor and wall display, reports,
  lists, detail pages, settings, the embedded 3D scene, users and account
  pages, roles in the UI, writing.
- `references/charts.md`: the validated series palette and Chart.js defaults.
- `references/cobranding.md`: the client slot, fetching client logos safely,
  and what not to do with them.
- `references/themes-and-motion.md`: implemented theme API, navigation markup, motion lifecycle, and optimization guidance.
- `references/dynamic-island-plan.md`: planned activity island and fluid motion integration; these components are not implemented yet.
- `references/liquid-glass-design-guidelines.md`: authoritative 31-principle guide.
- `references/implementation-status.md`: what the kit implements, and what remains doc-only.
- `references/checklist.md`: the pre-ship checks (320 and 390 px, roles, MJPEG
  limits, proxy headers), each from a real defect or a guideline requirement.

## Restyling an existing app onto it

1. Copy `liquid-glass.css` and `liquid-glass.js`. Put the shell in one base template.
   Delete every page's own dark theme and `body` rules, and its per-page
   copies of buttons, tables and modals.
2. Map components onto the kit classes. Keep every `id`, `name`, `data-*`,
   API call and JS behaviour; update only the classes and colours that JS
   emits.
3. Add the page head, empty states and role gating to each page.
4. Run `references/checklist.md`: screenshots at 1440 and 390, as admin and
   as viewer.
