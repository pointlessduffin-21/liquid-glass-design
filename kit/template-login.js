const form = document.querySelector('.auth-card');
const error = document.getElementById('auth-error');
form?.addEventListener('submit', (event) => {
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  if (!error || !username || !password) return;
  if (username.value.trim() && password.value) {
    error.hidden = true;
    return;
  }
  event.preventDefault();
  error.hidden = false;
  error.textContent = 'Enter both your username and password. Nothing was sent.';
  window.LiquidGlass?.feedback(error);
  (username.value.trim() ? password : username).focus();
});
