# Dynamic Island and Liquid Glass motion integration plan

Status: island integration proposed. Interactive button highlights ship in
`kit/liquid-glass-buttons.js`. The highlight follows the pointer; the hit
target does not move. Theme and pop/fade/slide APIs ship in
`liquid-glass-theme.js` and `liquid-glass-motion.js`. No island runtime ships yet.
Do not add one that pulses over alarms or chases the cursor with its controls.

## Intended experience

A compact activity island above the app content shows background tasks such as
uploads, exports, timers, and connection status. Expanding it reveals progress,
context, and relevant actions. Glass controls respond subtly to input; changes
in shape and content preserve continuity. Keep large content surfaces calm.

This is a web adaptation. Apple's guidance describes a dynamic glass material
and accessibility settings; the implementation here will approximate these
principles with CSS and browser animation APIs. References:
[Liquid Glass overview](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass),
[adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass),
and [Live Activities](https://developer.apple.com/design/human-interface-guidelines/live-activities).

## Stage 1 — Material and motion foundations

Extend the shipped `kit/liquid-glass-motion.js` and shared CSS motion tokens
for island-specific transitions rather than duplicating the existing motion API.
Introduce scoped tokens for short feedback (120–180 ms), content transitions
(180–260 ms), and island expansion (300–420 ms). These are initial design targets,
to tune in the demo. Define one restrained spring-like expansion curve, a
settling curve, and shared elevation, opacity, border, and highlight tokens.

Keep existing CSS imports working. Use layered gradients and a static blur for
small floating controls. Animate transform and opacity primarily; avoid blur,
filter, and shadow interpolation. Provide opaque surfaces without backdrop
filter and retain the existing no-blur WebGL overlay path. Do not apply a moving
specular highlight across every panel.

Deliverable: a material comparison page with normal, opaque, reduced motion,
and WebGL-safe variants, plus press, hover, focus, and dialog transitions.

## Stage 2 — Activity island component

Add `kit/liquid-glass-island.css`, `kit/liquid-glass-island.js`, and a standalone
`kit/demo-island.html`. Keep the API dependency-free and wrap it for React/Vue/
Svelte only after the core behavior is stable.

Proposed interface (not currently available):

```js
const island = createActivityIsland(host);
island.upsert({ id: 'export', label: 'Exporting report', progress: 0.4 });
island.complete('export', { label: 'Report ready' });
island.dismiss('export');
island.destroy();
```

Separate activity lifecycle (`running`, `success`, `error`, `dismissed`) from
presentation (`hidden`, `compact`, `expanded`). An error persists until dismissed;
a successful task can settle into a compact confirmation and dismiss after a
configurable delay. Expansion happens by click, Enter, or Space; Escape collapses.
Explicit dismissal must not cancel the underlying task. Define cancellation as a
separate action supplied by the host app.

Use stable activity IDs to merge updates. Keep an ordered queue with errors ahead
of routine progress, preserve user-selected activity, and show an overflow count.
Do not interrupt an open interaction on every incoming event. Throttle progress
announcements and avoid announcing every percentage change.

Position above content on desktop and within viewport/safe-area margins on
mobile. Reserve space so it does not cover page actions. Support long text,
localization, multiple tasks, touch targets of at least 44 px, and 200% zoom.

## Stage 3 — Fluid transitions and input feedback

Measure compact/expanded bounds at transition boundaries; use FLIP-style transform
animation or a wrapper with controlled size changes. Crossfade inner content
separately so text is not visibly stretched. Interrupt an in-flight transition
from its current visual position; cancel stale completion callbacks on updates.

Use the Web Animations API when available with a CSS/static fallback. Track
ResizeObserver changes for content and viewport changes. Scope pointer-driven
highlights to fine-pointer devices, update them through requestAnimationFrame,
and stop them offscreen. Touch gets brief press feedback instead of hover.

Integrate optional island events with the shell health status. Keep sidebar and
login behavior independent. Pair toast and island usage deliberately to avoid
duplicate notifications. Release timers, observers, listeners, and animation
handles on destroy, and honor preference changes during the session.

## Stage 4 — Accessibility, performance, and release

Use a real button for expansion with `aria-expanded` and `aria-controls`.
Expanded content is a non-modal region; it does not trap focus. Restore focus
when collapsing would hide the active element. Use a separate polite live region
for lifecycle changes and explicit alert semantics for actionable errors.

With `prefers-reduced-motion`, remove spring, translation, scale, and pointer
tracking; use immediate state changes or short opacity fades. Honor reduced
transparency where supported and expose an explicit opaque mode for other
browsers. Keep keyboard focus visible and validate text contrast against the
actual composited surface.

Validate in current Chrome, Safari, and Firefox at 390 px and 1440 px, plus zoom,
keyboard, touch, reduced motion, opaque mode, and WebGL overlays. Test rapid
updates, interrupted transitions, queued tasks, errors, background tabs,
resizes, and repeated mount/destroy. Profile on representative mobile hardware;
target 60 fps with no sustained layout work per animation frame. If profiling
misses that target, disable pointer highlights and simplify material layers.

Release criteria:

- Existing templates and shell behavior continue to work with motion disabled.
- No clipped text, covered actions, hidden focus, or duplicate announcements.
- Cancellation, completion, and dismissal behave correctly under rapid updates.
- Unsupported effects fall back to usable opaque/static UI.
- Demos and references clearly document implemented APIs and opt-in imports.

Implement in four reviewable changes: foundations, island state and markup,
fluid motion and shell integration, then cross-browser verification and docs.
