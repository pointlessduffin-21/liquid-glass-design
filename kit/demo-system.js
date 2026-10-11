const byId = id => document.getElementById(id);
let themeFrame = 0;
function updateTheme() {
  cancelAnimationFrame(themeFrame);
  themeFrame = requestAnimationFrame(() => {
    LiquidGlass.setTheme({ accent: byId('accent').value, background: byId('background').value, field: byId('field').checked });
    byId('theme-status').textContent = `Accent ${byId('accent').value} · Background ${byId('background').value}`;
  });
}
for (const id of ['accent', 'background', 'field']) byId(id).addEventListener('input', updateTheme);
for (const id of ['opaque', 'lite']) byId(id).addEventListener('change', () => document.body.classList.toggle(`glass-${id}`, byId(id).checked));
const sample = byId('sample');
let request = 0;
for (const action of ['show', 'hide', 'replay']) {
  byId(action).addEventListener('click', async () => {
    const token = ++request;
    const options = { effect: byId('effect').value, focusTarget: byId(action) };
    if (action === 'replay') {
      await LiquidGlass.hide(sample, options);
      if (token !== request) return;
    }
    const result = await LiquidGlass[action === 'hide' ? 'hide' : 'show'](sample, options);
    if (token === request && !result.cancelled) byId('motion-status').textContent = `${options.effect} ${action === 'hide' ? 'out' : 'in'} complete.`;
  });
}
