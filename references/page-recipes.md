# Page recipes

Reusable app layouts. Each starts with the page head (see
components.md) inside `.container`. Follow
`liquid-glass-design-guidelines.md` for task structure: global context, then
the work queue, then evidence, then an explicit action review. These recipes
keep the existing page types; the guidelines win if a recipe conflicts.

## Navigation: group by what people come to do

Four groups cover an operations app. Put them in the sidebar and use the same
group name as each page's `.eyebrow`:

| Group | Pages (example) |
| --- | --- |
| Overview | Live monitor, Reports |
| Production | Lines, Shifts, Anomalies, Digital twin |
| People | People, Appearances, Photos |
| System | Devices & cameras, Calibration, Model trainer, Users & access |

**Filter the nav by role.** Items a person can't use aren't shown, and a
group with nothing left disappears. Map detail pages back to their list page
(e.g. `/cycle/<id>` → Reports) so the sidebar always says where you are.

## Live monitor / wall display (`body.fit-viewport`)

Page head (filters and Refresh in `.page-actions`), then a KPI row, then the
hero media (camera feeds as `.card`s with a "Live" badge and a people count),
then the recent table. It fits one screen on a desk display, long regions
scroll inside their cards, and it scrolls normally on a phone.

**Live video: at most three MJPEG streams per page.** Browsers allow six
HTTP/1.1 connections per host, and every `<img src=…mjpg>` holds one for as
long as it plays. With six streams the page's own `fetch` calls queue forever.
Stream the first three; show the rest as snapshots refreshed every second,
badged as such, and promote them as slots free. (Over HTTP/2 the limit
disappears, but local and LAN access is usually HTTP/1.1.)

## Reports

Filters and Export (the one primary button) in the head. Then KPI tiles,
then charts in `.grid-2` cards, each with an empty state. **Don't use
dual-axis charts.** Split them into two charts that share an x-axis. See
charts.md.

## List / registry (People, Lines, Devices)

Head with the "Add …" primary action (role-gated). Then a KPI row of counts,
a toolbar row (search, filters, segmented view), and cards or a table. Give
every list an `.empty` state that says what to do. Selecting several items
shows a green border, a checkmark and a bulk-action bar.

## Detail (Cycle, Person)

A back link in `.page-actions`, then the identity in the head (photo or
initial + name; `#id` in accent), then KPI tiles, then the primary media
(player, timeline). On ≥ 1200 px put the companion panel beside it (e.g. a
zone timeline that scrolls with playback), with secondary cards below. An
unknown id gets a clear "not found" with the empty sections hidden.

## Settings / configuration (Calibration, Trainer)

Media or preview on the left, numbered steps on the right ("1 Capture,
2 Label, 3 Train & export"). Below admin, **disable** inputs rather than
hiding values, hide the Save/Run buttons, and show a "View only" note.
Without the data the page needs (no camera frame), say exactly where to get
it.

## Embedded 3D / canvas scene

The scene goes in an `<iframe title="…">` inside a glass `.card` with a
toolbar: Full screen, Open in new tab, Reload. Serve it **same-origin** (the
same host serves the scene's static bundle under a path), so neither
`frame-ancestors` nor `X-Frame-Options` needs loosening and its API calls
reach the same backend. The framed page uses `liquid-glass-overlay.css` and a
compact `?embed=1` mode: a status chip only, no keyboard capture until it's
clicked, no co-op join. On `load`, check same-origin
`iframe.contentDocument` for the scene's canvas, and show an honest empty
state if it isn't served.

## Users & access

Head with "Add user". Then three role cards (viewer, supervisor, admin, each
saying in one sentence what the role can do), then a users table (avatar +
name + username, role badge, status badge, last sign-in, actions). Add and
edit through a native `<dialog>`. Guard the last admin, and don't let people
delete themselves.

## Account

Name, username and a role badge in the head. A "Change password" card with
current, new and confirm fields, a `role="status"` message, and the result
inline.

## Roles in the UI

The server enforces access; the UI must not *offer* what the server will
refuse. In templates use `{% if can('supervisor') %}…{% endif %}`. For
JS-rendered controls, print a flag:
`const CAN_EDIT = {{ 'true' if can('supervisor') else 'false' }};`. A viewer
should be able to read every page and see no edit affordances.

## Writing

- Sentence case everywhere ("Recent cycles", "Add user"). Uppercase only
  through the mono label classes.
- Page subtitles are one sentence about purpose.
- Empty states are a bold one-liner plus the next step.
- Buttons are verbs: "Export CSV", "Arm the governor", "Change password".
- No emoji as icons. Use inline Feather SVGs at 18 px with `stroke` set to
  `currentColor`.
