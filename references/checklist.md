# Ship checklist

Run through this before calling a liquid-glass page done. Each item caught a real
defect in the TMS.

## Visual

- [ ] Screenshot at **1440×900** and **390×844**, and look at both.
- [ ] No horizontal page scroll at 390 px:
      `document.documentElement.scrollWidth > innerWidth` is false. Wide
      tables scroll inside `.table-wrap`.
- [ ] No leftover dark theme: grep the page for `#0f1117`, `#1a1d27`,
      `#2a2d3a`, `#e0e0e0`, and for `body {` rules setting colour, background
      or font.
- [ ] The page head has eyebrow (nav group) + h1 + one-sentence subtitle;
      at most one `.btn-primary` per view.
- [ ] Sentence case throughout; uppercase only through mono label classes.
- [ ] Status uses a badge or dot **plus a word**. Simulated data carries
      `.badge-sim` "Simulated", real data `.badge-accent` "Actual".
- [ ] Every list or chart has an `.empty` state with a next step.
- [ ] Side-by-side cards don't get stacking margins (they shouldn't, inside
      `*-grid` / `*-row`).
- [ ] Number columns are right-aligned (`.num` on `th` **and** `td`).

## Behaviour

- [ ] Every original element `id`, `name`, `data-*`, API call and JS flow
      still works. Grep the page's own `<script>` before renaming anything.
- [ ] JS that builds HTML escapes server-provided strings (names, ids)
      before putting them in `innerHTML`.
- [ ] Dialogs open above the sidebar (`body .modal-overlay` / `<dialog>`).
- [ ] **Roles:** sign in as a viewer and confirm no edit controls are shown.
      Server refusals aren't the UI.
- [ ] An expired session on an API call goes to sign-in (`liquid-glass.js`).
- [ ] No more than 3 live MJPEG `<img>` streams per page (HTTP/1.1 six
      connections per host).
- [ ] Sidebar status reflects the server on every page (`data-health-url`),
      not only pages with a socket.

## Accessibility

- [ ] Skip link first; a real `<nav>`; `aria-current="page"` on the active
      item.
- [ ] A visible focus ring (green); tap targets ≥ 44 px on phones.
- [ ] `role="status"` for things that change; `role="alert"` for errors;
      `aria-pressed` / `aria-selected` on toggles and tabs; `aria-expanded`
      on collapsibles.
- [ ] `prefers-reduced-transparency` gives opaque panels;
      `prefers-reduced-motion` stops pulses and transitions (both built in).
- [ ] Form inputs ≥ 16 px on phones.

## Over a 3D scene

- [ ] `liquid-glass-overlay.css`, **no `backdrop-filter`** (measured 6 ms/frame).
- [ ] Long panels have the faint white base so scenery doesn't bleed through
      the numbers.
- [ ] Headless screenshots need the GPU flags
      (`--use-gl=angle --use-angle=metal --ignore-gpu-blocklist` on macOS).
      Software WebGL hangs the page, and a same-origin iframe hangs its
      parent with it.

## Behind a proxy

- [ ] The proxy forwards the browser's `Host` **with its port** (`$http_host`
      in nginx). An Origin-vs-Host CSRF check refuses every sign-in when
      the port is dropped.
- [ ] Any nginx `location` that sets its own `proxy_set_header` or
      `add_header` repeats the server-level ones. It inherits **none** of
      them otherwise.
