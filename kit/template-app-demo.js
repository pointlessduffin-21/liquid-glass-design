// Animated dialog wiring for template-app.html only.
const dialog = document.getElementById('item-dialog');
const trigger = document.getElementById('open-dialog');
let closing = false;
trigger?.addEventListener('click', () => {
  if (!dialog || dialog.open || closing) return;
  dialog.inert = false;
  dialog.showModal();
  const title = document.getElementById('dlg-title');
  if (title) title.focus();
  LiquidGlass.show(dialog, { effect: 'pop' });
});
document.getElementById('refresh')?.addEventListener('click', () => {
  const status = document.getElementById('refresh-status');
  if (status) status.textContent = 'Refresh requested. This starter has no live feed, so the table is unchanged.';
});
const progress = document.getElementById('check-progress');
const meter = document.getElementById('check-meter');
if (progress && window.LiquidGlass.formatProgress) {
  const state = LiquidGlass.formatProgress(3, 5);
  progress.textContent = state.label;
  if (meter && state.determinate) { meter.max = state.max; meter.value = state.value; }
}
async function closeDialog(value = '') {
  if (closing || !dialog?.open) return;
  closing = true;
  await LiquidGlass.hide(dialog, { effect: 'pop', focusTarget: trigger });
  dialog.close(value);
  trigger?.focus(); // External controls are focusable only after the modal closes.
  dialog.hidden = false; // A closed dialog uses its native display rule.
  closing = false;
}
dialog?.addEventListener('cancel', event => { event.preventDefault(); closeDialog(); });
dialog?.querySelector('form')?.addEventListener('submit', event => {
  event.preventDefault(); closeDialog(event.submitter?.value || '');
});
