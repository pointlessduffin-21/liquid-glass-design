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
byId('reduce-motion').addEventListener('change', () => {
  LiquidGlass.setMotion(byId('reduce-motion').checked ? 'reduced' : 'system');
});
byId('reduce-effects').addEventListener('change', () => {
  LiquidGlass.setEffects(byId('reduce-effects').checked ? 'reduced' : 'full');
});
let command = { phase: 'idle' };
const phase = byId('command-phase');
function paintCommand() {
  phase.textContent = LiquidGlass.commandLabel(command);
  byId('command-submit').disabled = command.phase === 'submitting' || command.phase === 'accepted' || command.phase === 'unknown';
  LiquidGlass.feedback(phase);
}
byId('command-submit').addEventListener('click', () => {
  phase.textContent = 'Requesting';
  command = LiquidGlass.commandReducer(command, { type: 'submit', requestId: 'r1', assetId: 'ST-05' });
  paintCommand();
});
byId('command-accept').addEventListener('click', () => {
  command = LiquidGlass.commandReducer(command, { type: 'accepted', requestId: 'r1' });
  paintCommand();
});
byId('command-timeout').addEventListener('click', () => {
  command = LiquidGlass.commandReducer(command, { type: 'timeout', requestId: 'r1' });
  paintCommand();
});
byId('command-verify').addEventListener('click', () => {
  command = LiquidGlass.commandReducer(command, { type: 'verified', requestId: 'r1', verifiedAt: '2026-10-17T11:05:00Z' });
  paintCommand();
});
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
