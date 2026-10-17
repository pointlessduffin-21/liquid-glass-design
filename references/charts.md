# Charts on glass

Charts sit on light frosted cards, so they're styled for a light background.
Load the `dataviz` skill before designing a new chart type; this page records
the shared palette and chart conventions.

## Series colours

Categorical, colour-blind validated (dataviz validator), in this order:

```js
const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100',
                '#e87ba4', '#008300', '#4a3aa7', '#e34948'];
```

Three-way splits (zones, left / centre / right) use the tokens:
`--zone-left #2a78d6`, `--zone-center #127942` (brand green),
`--zone-right #eb6834`, `--zone-other #98a69d`.

- **Never use red/green/blue for categories.** They read as status. The TMS
  zones were red/green/blue until this was caught.
- Put the label beside the colour every time: legends, chips (`.chip` with a
  7 px swatch), axis labels. Never colour alone.
- Status colours (`--ok --warn --err`) are for status, never for series.

## Chart.js defaults

```js
const INK_3 = '#4a5c54', GRID = 'rgba(16,36,26,.08)';
Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
Chart.defaults.color = INK_3;
const axisX = { grid: { display: false }, border: { color: 'rgba(16,36,26,.18)' },
                ticks: { color: INK_3, maxRotation: 0, autoSkipPadding: 12 } };
const axisY = (title) => ({ beginAtZero: true, grid: { color: GRID }, border: { display: false },
                ticks: { color: INK_3 }, title: { display: !!title, text: title, color: INK_3 } });
// Tooltips: white glass, ink text.
const tooltip = { backgroundColor: 'rgba(255,255,255,.96)', titleColor: '#10241a',
                  bodyColor: '#3f5248', borderColor: 'rgba(16,36,26,.12)', borderWidth: 1,
                  padding: 10, cornerRadius: 10, boxPadding: 4 };
```

## Rules

- **One measure per chart.** If you're tempted by a second y-axis, make a
  second chart that shares the x-axis.
- **Bars start at zero.** Lines may not, but say so.
- **Every chart has an empty state** (`.empty` inside the card) instead of
  blank axes.
- **Tables stay the source of truth.** A chart summarises; the numbers are
  available beside or below it, with units, the time window, the source, and
  a legend. Missing samples are a gap plus a "Missing data" label. Do not
  draw a connecting line across an outage or tween an uncertain value into
  extra samples.
- **A percentage names its denominator and window.** Equivalent success and
  failure views have to reconcile.
- **Doughnuts only for parts of a whole** with ≤ 4 parts. Put the values in
  the legend (e.g. "Center · 25.9 s").
