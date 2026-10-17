# Implementation status

`liquid-glass-design-guidelines.md` (v1.0, 17 October 2026) is authoritative.
This note maps those rules onto the kit as of that adoption. It is not a
conformance claim for WCAG, Web Vitals, or any physical system.

The kit stays a light, dependency-free design system. Pattern P1's dark
palette in the guidelines is an example of token shape, not a restyle. React,
Motion, and Three.js examples in the guide were adapted to the existing CSS
and vanilla JavaScript rather than adding those runtimes.

## In the kit

| Area | Where | What changed |
| --- | --- | --- |
| Material | `kit/liquid-glass.css`, `kit/liquid-glass-overlay.css` | Opaque `--well` for readings, tables, toasts, and reviews. Nested glass drops its blur. KPI tiles are wells. Overlay still has no `backdrop-filter`. |
| Type and spacing | `liquid-glass.css` | Body text 16 px. Spacing scale 4–48 px. Muted ink clears 4.5:1 on white. Status text uses `-ink` tokens; status graphics clear 3:1. |
| Targets and focus | `liquid-glass.css`, overlay | Standalone controls 44 px, coarse pointers 48 px. Focus ring 3 px. Clipped shells use an inset ring. `scroll-padding-top` and `scroll-margin-top` are set. |
| Motion | `liquid-glass-motion.js` | 200 ms default, ease-out arrivals, ease-in exits. In-flight motion is interrupted. Exit sets `inert` immediately and returns focus. Stagger is capped at six items and 150 ms. No per-frame loop. |
| Preferences | `setMotion`, `setEffects` | OS reduced motion wins. The in-app setting can only add reduction. Reduced effects clear blur via `data-effects="reduced"`. Forced colors and reduced transparency remain. |
| Press feedback | `liquid-glass-buttons.js` | Highlight tracks the pointer. The button box does not translate, scale, or tilt. An 8 px drag still cancels activation. |
| Input and commands | `liquid-glass-ops.js` | `parsePressureBar`, `normalizeIdentifier`, `readingStatus`, `formatProgress`, `commandReducer`, `commandLabel`. Missing samples are not zero. Acceptance is not verification. A timeout stays unknown until the same request id is reconciled. |
| Templates | `template-app.html`, `template-login.html`, demos | One primary action, secondary disclosure, disabled reason, stale reading, draft banner, determinate progress, opaque review dialog. The operations demo shows command phases. |
| Checks | `scripts/check-guidelines.cjs`, `scripts/check-browser.cjs` | Parser and reducer contracts, contrast tokens, static guards, keyboard, 320/390 overflow, reduced motion, and preference behavior. |

Principles with a direct kit behavior: 01 (one primary plus disclosure), 02 and 06 (grouped wells, units, asset id), 07 (real progress), 09 and 13 and 28 (command labels), 11 (draft text, no pulse), 12 and 27 (targets, stable hit area, real buttons), 15 (parser), 16 (native dialog, Escape, links), 17 (disclosure), 18 and 25 (grouped readings and regions), 19 and 22 and 24 (status word plus token), 23 (effects-off path), 31 (denominators on the monitor KPIs).

## Documentation only

These need a product backend, a chart library, a model pipeline, or a person at a device. The kit records the requirement and does not fake the system.

| Topic | Why it is not code here |
| --- | --- |
| 03, 05, 08, 14, 29, 30 | Presets, frequency evidence, drafts that persist to a server, derived-value provenance, baselines, and exportable personal layouts need a real domain store. |
| 20, 21, 26 | Missing-data chart gaps, drill-down scroll restoration, and relationship graphs. `references/charts.md` states the gap rule. There is no chart or twin runtime in this repo. |
| 04, 10 | Reuse is a review rule. Serial position is reflected in the template's header and review, not a general framework. |
| P7 twin viewport | No Three.js dependency. `liquid-glass-overlay.css` remains the no-blur HUD. Canvas elements must be `aria-hidden` with a DOM equivalent; the kit does not ship a model loader, quality ladder, or GPU disposal loop. |
| React and Motion examples | The repository is vanilla. Springs are not installed. Do not add a motion library for a hover. |
| Scroll storytelling, scrubbed video, view transitions | Rejected for operational views by the guide. Not built. |
| Alarm center, batch fleet, shift handover, idempotent command transport | Component contracts live in the guidelines. The reducer is a client state fragment only. Server authorization, interlocks, and request-id reconciliation are not implemented. |
| 10k-row virtualization, axe-core, field Web Vitals, screen-reader sessions, glove-sized hardware tests | Not run. `npm run test:browser` is a desktop browser automation pass, not an assistive-technology or field-performance audit. |
| Dynamic Island | Still a plan. See `references/dynamic-island-plan.md`. |

## Recorded choices

- Light identity stays. The guide says to preserve the repository's material system and to treat P1's dark sample as a starting illustration.
- `.btn-sm` remains a 32 px inline control on fine pointers, above the WCAG 24 px minimum, and grows to 48 px for coarse pointers. Standalone `.btn` is 44 px.
- Sidebar `overflow: hidden` still clips the rail during collapse. Focus rings inside it are inset so the whole outline stays visible.
- The validated chart series in `references/charts.md` was not recolored. `#98a69d` (`--zone-other`) can miss 3:1 as a thin mark on white; labels stay mandatory. Whether to replace that swatch is open.
- `parsePressureBar` uses the guide's 0–20 bar fixture. It is not an equipment limit.
- Blur remains on the sidebar, menu bar, top-level cards, auth card, and opt-in glass buttons. The operations budget is two blurred shells. `template-app.html` uses the sidebar plus one card; metrics and the review are opaque. The theme playground shows more than one card so the material can be inspected.
