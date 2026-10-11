document.getElementById('opaque').addEventListener('change', event => {
  document.body.classList.toggle('glass-opaque', event.target.checked);
});
for (const id of ['clear', 'tinted']) {
  document.getElementById(id).addEventListener('click', () => {
    document.getElementById('feedback').textContent = `${id === 'clear' ? 'Clear' : 'Tinted'} glass activated at ${new Date().toLocaleTimeString()}.`;
  });
}
