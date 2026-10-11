# Liquid Glass design

A reusable, framework-independent agent skill for light glass web interfaces: dashboards, admin tools, sign-in screens, and overlays over live WebGL scenes. Includes CSS tokens, dependency-free shell JavaScript, HTML starters, Flask/Jinja templates, and design references. Brand accents are configurable; no company logos are bundled.

## Install

Install the **whole folder**, including `SKILL.md`, `kit/`, and `references/`. This is an agent skill, not an npm package. Use a new destination; if already installed, update the existing checkout with `git pull --ff-only`.

### Codex

Personal installation, available across projects:

```sh
mkdir -p ~/.agents/skills
git clone https://github.com/pointlessduffin-21/liquid-glass-design.git ~/.agents/skills/liquid-glass-design
```

For one project, run from its root:

```sh
mkdir -p .agents/skills
git clone https://github.com/pointlessduffin-21/liquid-glass-design.git .agents/skills/liquid-glass-design
```

Start a new Codex session and request: `Use $liquid-glass-design to build a dashboard.` See the [official skill discovery guide](https://learn.chatgpt.com/docs/build-skills).

### GitHub Copilot

Personal installation:

```sh
mkdir -p ~/.copilot/skills
git clone https://github.com/pointlessduffin-21/liquid-glass-design.git ~/.copilot/skills/liquid-glass-design
```

For one project, use `.github/skills/liquid-glass-design` instead. Copilot also accepts project skills under `.agents/skills`, so an existing Codex project install can be shared. Start a new agent session and request: `Use the liquid-glass-design skill to style this app.` See [GitHub's agent skill installation guide](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills).

### Claude Code

Personal installation:

```sh
mkdir -p ~/.claude/skills
git clone https://github.com/pointlessduffin-21/liquid-glass-design.git ~/.claude/skills/liquid-glass-design
```

For one project, use `.claude/skills/liquid-glass-design` instead. Start Claude Code in your project and invoke `/liquid-glass-design Build a glass dashboard`. See [Claude Code's skill guide](https://code.claude.com/docs/en/skills).

For a checked-in team installation, copy `SKILL.md`, `kit/`, and `references/` into the chosen skill directory instead of creating a nested Git checkout. Keep the relative directory structure intact.

## Use the kit

Copy `kit/` into your application's static assets directory. The starters assume these assets are served at `/static/`; change URLs for your framework. Import `liquid-glass.css` once, then load `liquid-glass.js` with `defer`. Use `liquid-glass-overlay.css` for a live canvas/WebGL HUD. The HTML templates expect app routes and backend authentication; they are not a complete server.

- [Skill instructions](SKILL.md): layout, typography, tokens, and integration workflow.
- [Components](references/components.md): available classes.
- [Ship checklist](references/checklist.md): responsive and accessibility checks.
- [Dynamic Island and motion plan](references/dynamic-island-plan.md): proposed integration stages and acceptance criteria.

## Interactive glass buttons

Use `<button class="btn btn-glass" type="button">Continue</button>` and load
`liquid-glass-buttons.js` with `defer` after the stylesheet. Add `btn-primary`
for tinted glass. The starters already include the script and opt in their buttons.

Holding and moving bends the surface toward the pointer, tracks a highlight, and
settles on release. Movement beyond 8 px suppresses activation; a normal tap or
keyboard activation keeps native behavior. Vertical touch scrolling stays enabled.
Disabled controls stay inactive. Reduced motion removes deformation; add
`glass-opaque` to a parent for opaque surfaces. These are browser approximations,
not physical refraction or Apple's native material renderer. Use clear buttons
over calm backgrounds and verify label contrast for your content.

Open [the button playground](kit/demo-buttons.html) directly in a browser, or serve
this folder with `python3 -m http.server 8000` and visit
`http://localhost:8000/kit/demo-buttons.html`.

The kit includes glass buttons, configurable colors, glass menu bars, and pop/fade/slide transitions. Dynamic Island components are **planned**, not implemented. Web effects will be inspired by Apple's material and motion principles; native Apple Liquid Glass APIs are not available as CSS features.

## Backgrounds, accents, menus, and motion

Load `liquid-glass-theme.js` and `liquid-glass-motion.js` with `defer`.

```js
LiquidGlass.setTheme({ accent: '#6366f1', background: '#eef0ff', field: true });
await LiquidGlass.show(panel, { effect: 'pop' });
await LiquidGlass.hide(panel, { effect: 'fade', focusTarget: trigger });
```

Choose `pop`, `fade`, or `slide` for entrances and exits. Backgrounds also accept
custom gradients/images through the CSS `--background-image` token. Glass menu
bars use `.glass-menubar` and collapse into a mobile disclosure navigation.
See [the full API and markup guide](references/themes-and-motion.md) and open
[the theme and motion playground](kit/demo-system.html).

Animations prioritize transform and opacity, clean up resources, and honor
reduced motion. Use `.glass-lite` for lower rendering cost or `.glass-opaque`
for opaque surfaces. The kit targets 60 fps; actual frame rate depends on the
device, composited content, and concurrent rendering work.

## Browser verification

The kit has no runtime npm dependencies. To run development checks:

```sh
npm ci
npx playwright install chromium firefox webkit
npm run test:browser
BROWSER=firefox npm run test:browser
BROWSER=webkit npm run test:browser
```

For an installed Google Chrome, use `CHROME_CHANNEL=chrome npm run test:browser`.
Checks cover themes, interrupted animations, focus, reduced motion, menu
behavior, mobile overflow, and button regression. Screenshots go to the ignored
`artifacts/` directory.
