// Minimal client-side helper: marks the active mode link. Comments are
// rendered on the server, not here.
document.addEventListener('DOMContentLoaded', () => {
  const mode = document.body.className.replace('mode-', '');
  const active = document.getElementById('link-' + mode);
  if (active) active.setAttribute('aria-current', 'page');
});
