# Guidelines gap audit

Audit of all 31 principles in `liquid-glass-design-guidelines.md` against this repository, after the motion and Three.js work. Status means what the kit actually does.

- **implemented** — a reusable behavior exists in CSS, JS, a template, and a check where the behavior is testable.
- **partial** — a real example or helper exists, and a product would still have to finish the workflow.
- **doc-only** — the guide states the rule and this repo does not execute it.
- **missing** — neither code nor a usable doc path covers it.

Motion is a repository rule on top of principle 28 and §5: every page needs an entrance, a state transition, hover or press feedback, and a page transition. Hero and sign-in pages also mount the Three.js field. Reduced motion keeps opacity fades. See the mandatory section at the top of the guidelines.

| # | Principle | Status | Evidence | Still missing |
| --- | --- | --- | --- | --- |
| 01 | Hick's Law | partial | `kit/template-app.html` has one `.btn-primary` and a More actions disclosure. `references/checklist.md` repeats the one-primary rule. | No command search. No separate always-visible emergency control, because this repo is not a plant console. |
| 02 | Miller's Law | partial | The monitor template groups a reading, a table, and a review instead of one flat list. Asset id `P-204` is visible in the data well. | No multi-step calibration flow that enforces a chunk limit. |
| 03 | Paradox of Choice | partial | The primary action is New item. Export and Acknowledge sit in the disclosure, and Acknowledge says why it is disabled. | Choices are sample labels. There is no recommended preset backed by a domain. |
| 04 | Occam's Razor | partial | Pages reuse `kit/` classes instead of new visual systems. Readings are text in the DOM. The scene is marked decorative. | No automated complexity budget. Agents can still add extra surfaces. |
| 05 | Pareto Principle | doc-only | The principle is in the guidelines. The checklist does not invent usage percentages. | No product analytics, so the kit cannot rank real tasks by frequency. |
| 06 | Cognitive Load Theory | partial | Units sit next to values (`6.2 bar`). Status is a word plus a badge. Body text is 16 px. Muted ink is checked against white in `scripts/check-guidelines.cjs`. | Abbreviations are not expanded everywhere. There is no operator glossary. |
| 07 | Goal-Gradient Effect | implemented | `LiquidGlass.formatProgress` and the 3-of-5 meter in `template-app.html`. Unknown totals stay indeterminate. Covered by `scripts/check-guidelines.cjs` and the browser check. | No real multi-step job whose end state comes from a server. |
| 08 | Parkinson's Law | partial | Templates do not show countdown pressure or fake deadlines. | Drafts are not saved on a timer, and there is no server policy for how long a draft lives. |
| 09 | Peak-End Rule | partial | `commandLabel` ends on verified or failed text in `kit/liquid-glass-ops.js` and `kit/demo-system.html`. The review dialog ends on Save and Cancel. | No batch receipt and no measured peak-end study. |
| 10 | Serial Position Effect | partial | The page head carries the identity. Dialog actions sit at the end of the review. | No general layout engine that places identity and commitment for every future screen. |
| 11 | Zeigarnik Effect | partial | `template-app.html` shows an unsaved-draft banner without a pulsing badge. | The draft is static. Reloading does not restore it. |
| 12 | Fitts's Law | implemented | Standalone controls are at least 44 px, and 48 px for coarse pointers, in `kit/liquid-glass.css`. The browser check measures `#open-dialog`. | `.btn-sm` remains a dense exception and must not be the only path to a primary action. |
| 13 | Doherty Threshold | partial | The command demo paints "Requesting" on the same click, before acceptance. `kit/demo-system.js`. | No backend, so the 400 ms budget is not measured against a real round trip. |
| 14 | Tesler's Law | doc-only | The guidelines say derived values need provenance. | The kit does not compute or label a derived sampling interval. A product has to show the source. |
| 15 | Postel's Law | partial | `parsePressureBar` and `normalizeIdentifier` reject ambiguous input and are unit-tested. | Dates, unit conversion, and free-text notes are not parsed. |
| 16 | Jakob's Law | partial | Native `<dialog>`, Escape, a skip link, and ordinary links. Browser check covers keyboard close and focus return. | No history stack that restores scroll and filters. |
| 17 | Progressive Disclosure | implemented | More actions uses `<details>`. The glass menu becomes a disclosure under 760 px and is tested with keyboard and touch. | Advanced inspectors beyond that disclosure are left to the product. |
| 18 | Gestalt Proximity | partial | The reading, its unit, asset id, and status sit in one `.data-well`. | Grouping is an example, not a generator for new telemetry. |
| 19 | Gestalt Similarity | partial | Badges share shape. Status color is paired with a word. `references/charts.md` holds the series palette. | No chart component renders those series. |
| 20 | Gestalt Closure | doc-only | `references/charts.md` says a missing sample is a gap, not a zero. | There is no chart runtime that draws that gap. |
| 21 | Gestalt Continuity | doc-only | The guidelines describe drill-down and return. | No route, scroll restoration, or selection continuity. |
| 22 | Von Restorff Effect | partial | One KPI is bad; the others are not. Decorative pulses stop under reduced motion and reduced effects. | Nothing stops a future page from highlighting every card. |
| 23 | Aesthetic-Usability Effect | partial | `.glass-opaque`, `.glass-lite`, and `data-effects="reduced"` remove blur and keep the same controls. The browser check reads `backdrop-filter: none`. | No study compares the pretty and plain versions. |
| 24 | Law of Prägnanz | partial | The reading separates value, unit, asset, and status instead of one encoded glyph. | The template is one screen, not a pattern library of separated marks. |
| 25 | Gestalt Common Region | partial | Page head, data well, table card, and dialog are separate regions with headings. | Dialog scope text is generic sample copy. |
| 26 | Gestalt Uniform Connectedness | doc-only | The guidelines describe relationship lines. | No graph or connected-node view exists. |
| 27 | Affordance | implemented | Actions are `<button>` and `<a>`. The scene canvas is `aria-hidden` and `pointer-events` stay on the DOM. Glass press feedback does not move the hit target (`kit/liquid-glass-buttons.js`). | A product can still draw a fake control. The checklist forbids it; the kit cannot prevent it. |
| 28 | Feedback | partial | Command phases, `role="status"`, login `role="alert"`, and mandatory motion (`LiquidGlass.feedback`, entrances, press opacity). Browser check asserts reduced motion uses a fade with no translation. | Toasts are styled, not wired to a live event source. Login errors only cover empty fields. |
| 29 | Anchoring Effect | doc-only | The guidelines warn against a single unlabeled number. | No baseline or threshold series is rendered. |
| 30 | Endowment Effect | doc-only | The guidelines cover personal layouts and export. | Nothing saves or exports a user arrangement. |
| 31 | Framing Effect | partial | KPI tiles show a denominator ("3 of 12"). Dialog verbs are Save and Cancel review. | Frame text is sample copy. There is no gain/loss experiment. |

## Motion rule

| Requirement | Status | Evidence | Still missing |
| --- | --- | --- | --- |
| Entrance on kit pages | implemented | `html.lg-motion` reveals `.page-head`, `.card`, `.kpi`, `.auth-card`, `.hero-panel`, `.empty`, and `[data-lg-reveal]` in `kit/liquid-glass.css`. Templates set the class. | A product page that omits the class and the helper will not animate until someone adds them. |
| State transitions | implemented | `LiquidGlass.show`, `hide`, `reveal`, and `feedback`. The app dialog and the command demo use them. | New screens must call the helpers. CSS does not know every custom state. |
| Hover and press | implemented | `.btn` opacity and background transitions. `.btn-glass` adds a highlight without moving the box. Reduced motion keeps the opacity change. | Keyboard hover does not exist; focus uses the 3 px ring instead. |
| Page transitions | partial | `a[data-lg-transition]` fades the body, then navigates. Hero links use it. | App-shell links are server routes, not wired with the attribute. |
| Three.js on hero and sign-in | implemented | `kit/src/liquid-glass-scene.mjs` bundled to `kit/liquid-glass-scene.js`. `template-hero.html` and `template-login.html` mount it. Still frame, pause, offscreen pause, hidden-tab pause, DPR cap, and text fallback are in the module. | It is not a twin viewer, model loader, or overlay for live telemetry. |
| Reduced motion keeps fades | implemented | `liquid-glass-motion.js` forces the fade effect. CSS uses `lg-fade` and does not zero every animation. | Spatial motion inside a future custom animation is the author's job to gate. |

## What this pass did not pretend to finish

Server authorization, interlocks, idempotent command transport, chart gaps, drill-down restoration, relationship graphs, baselines, and personal layout export stay documentation. They need a product backend or a chart runtime this repository does not have.
