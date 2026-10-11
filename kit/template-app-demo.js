// Animated dialog wiring for template-app.html only.
const dialog = document.getElementById('item-dialog');
const trigger = document.getElementById('open-dialog');
let closing = false;
trigger?.addEventListener('click', () => {
  if (!dialog || dialog.open || closing) return;
  dialog.showModal();
  LiquidGlass.show(dialog, { effect: 'pop' });
});
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
