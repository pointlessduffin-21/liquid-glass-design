# Themes, glass navigation, and motion

## Custom colors and backgrounds

Load `liquid-glass-theme.js` with `defer` and call:

```js
LiquidGlass.setTheme({ accent: '#6366f1', background: '#eef0ff', field: true });
```

The API accepts #rgb or #rrggbb values. Each call sets a complete theme, with
omitted values returning to defaults. It derives brand shades, selection and
focus colors, and readable text for primary actions. It darkens accent text
independently of the material tint. Status and chart palettes are unchanged.
The default material stays light even over a dark/custom backdrop; this is not
a complete dark-mode theme. Check contrast on your actual composited content.

To scope a theme to a preview or container, pass it as the second argument.
Give the container `.glass-theme` to paint its background using the scoped
tokens. Scoped accents and background colors inherit within the container.

CSS-only customization is also supported. Define the full accent family if
changing it without JavaScript:

```css
:root {
  --bg: #eef0ff;
  --accent: #4338ca;           /* Links and focus, readable on light glass */
  --accent-tint: #6366f1;      /* Material and primary button tint */
  --on-accent: #fff;
  --brand-green: #6366f1;
  --brand-deep: #3730a3;
  --brand-mid: #818cf8;
  --brand-lime: #c7d2fe;
  --accent-soft: rgba(99, 102, 241, .1);
  --accent-line: rgba(99, 102, 241, .32);
  --background-image: linear-gradient(125deg, #e0e7ff, #fce7f3);
}
```

Set `--background-image: none` for a flat fill, or use a CSS gradient / your own
`url(...)` image. Images should be optimized and served from an approved asset
origin. Theme color input values should come from the app's settings; the kit
does not persist them automatically.

## Glass menu bars

```html
<header class="glass-menubar">
  <a class="glass-menubar-brand" href="/">Product</a>
  <button class="btn glass-menu-toggle" type="button"
          data-glass-menu="main-nav" aria-controls="main-nav"
          aria-expanded="false">Menu</button>
  <nav class="glass-menu-links" id="main-nav" aria-label="Main">
    <a href="/" aria-current="page">Overview</a>
    <a href="/reports">Reports</a>
  </nav>
</header>
```

Load `liquid-glass-motion.js` with `defer` after markup is available. The bar is
sticky and respects safe-area insets. At 760 px and below, its links become an
expandable column. Enter/Space opens the disclosure, Tab navigates links, Escape
closes it and returns focus. Outside pointer input and link selection close it.
Resizing restores the appropriate desktop/mobile visibility. IDs must be unique.
Without JavaScript the navigation links stay visible.

Use normal links/buttons inside the glass bar. Avoid applying `.btn-glass` on
the same glass surface: stacked backdrop blur increases cost and weakens the
material hierarchy. The navigation uses normal disclosure semantics, not
`role="menu"`, so there is no custom arrow-key navigation requirement.

## Pop, fade, and slide

```js
await LiquidGlass.show(panel, { effect: 'pop' });
await LiquidGlass.hide(panel, { effect: 'fade', focusTarget: trigger });
await LiquidGlass.show(panel, { effect: 'slide', duration: 300 });
```

All three effects work in both directions. `show` removes `hidden`; `hide` sets
it after the transition, so exited content leaves layout and the tab order.
The promise returns `{ cancelled: true }` if a newer transition interrupts it.
A new transition picks up the current opacity and transform. Animation handles
and temporary `will-change` hints are cleaned up after settling. Supply a focus
return target when hiding focused content. These functions do not manage modal
semantics or scroll locking: use native `<dialog>` for dialogs, as the starter does.

The transition target should be a wrapper without an existing transform. Put
transformed children, interactive glass buttons, or positioned motion content
inside it. `--motion-duration: 200ms` is the default inspector/disclosure
duration; explicit `duration` is in milliseconds. Arrivals use ease-out
(`cubic-bezier(.2,.8,.2,1)`); departures use ease-in
(`cubic-bezier(.4,0,1,1)`). A hide makes the subtree `inert` immediately so it
stops taking input, then returns focus to `focusTarget`.

`LiquidGlass.stagger(elements, options)` reveals at most the first six items,
20–35 ms apart, with at most 150 ms of extra delay. Do not stagger alarms,
data rows, or focusable controls that the task needs immediately.

```js
LiquidGlass.setMotion('reduced'); // or 'system'
LiquidGlass.setEffects('reduced'); // or 'full'
```

`setMotion('reduced')` strengthens the OS preference and is remembered in
`localStorage` under `liquid-glass.pref.motion`. Passing any other value
stores `system`. If the OS asks for reduced motion, the document stays
`data-motion="reduced"` anyway. `setEffects` sets `data-effects` to `reduced`
or `full` and removes backdrop blur when reduced. The API honors reduced
motion, missing animation APIs, and hidden browser tabs with immediate
visibility changes. Preference changes finish in-flight effects rather than
leaving half-visible content.

## Rendering cost and mobile behavior

Target 60 fps; validate on the hardware and content your app actually serves.
The kit does not guarantee a frame rate across devices. Pop/fade/slide use
transform and opacity, without per-frame JavaScript or animated layout/blur.
Loading shimmer and live status rings also animate transform/opacity.
Button highlights are small repainted areas with pointer writes coalesced to
one requestAnimationFrame; they stop on release, cancellation, and reduced
motion. The control's border box does not move.

Use `.glass-lite` on a parent to remove backdrop blur from material surfaces
and buttons, and stop decorative loading/status animation. `.glass-opaque` additionally makes material surfaces opaque.
No `will-change` hints remain after transitions; avoid adding them permanently
across large card grids. Over a live WebGL scene, retain the dedicated no-blur
overlay stylesheet. Avoid animating many blurred surfaces at once.

Mobile navigation and controls use 44 px targets, safe-area spacing, flexible
rows, internal modal scrolling, and a scrolling background instead of a costly
fixed field. Input text is 16 px to avoid iOS focus zoom. Touch scrolling remains
native. Validate long labels, 200% zoom, and landscape layouts in your app.

The standalone `kit/demo-system.html` exposes color controls, quality modes,
responsive menus, and transition choices. Browser checks live in
`scripts/check-browser.cjs` and capture local frame timing as diagnostic output,
not as a portable performance benchmark.
