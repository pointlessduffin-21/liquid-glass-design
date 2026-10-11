// Demo wiring for template-app.html only: opens the example dialog.
document.getElementById('open-dialog')?.addEventListener('click', () => {
  document.getElementById('item-dialog')?.showModal();
});
