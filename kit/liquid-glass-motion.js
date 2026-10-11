/* Pop/fade/slide transitions and responsive navigation; no per-frame JS loop. */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new WeakMap();
  const running = new Set();
  const effects = {
    pop: { transform: 'translateY(8px) scale(.94)', opacity: 0 },
    fade: { transform: 'none', opacity: 0 },
    slide: { transform: 'translateY(16px)', opacity: 0 },
  };
  async function transition(el, visible, { effect = 'pop', duration, focusTarget } = {}) {
    if (!(el instanceof HTMLElement)) throw new TypeError('Motion target must be an HTML element.');
    if (!effects[effect]) throw new TypeError('Unknown motion effect.');
    if (duration !== undefined && (!Number.isFinite(duration) || duration < 0)) throw new TypeError('Invalid duration.');
    const previous = active.get(el);
    const current = previous ? { opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform } : null;
    const originalWillChange = previous?.originalWillChange ?? el.style.willChange;
    previous?.animation.cancel();
    if (!visible && el.hidden && !previous) return { cancelled: false };
    el.hidden = false;
    const style = getComputedStyle(el);
    const ms = duration ?? (parseFloat(style.getPropertyValue('--motion-duration')) || 240);
    const from = current || (visible ? effects[effect] : { opacity: style.opacity, transform: style.transform });
    const to = visible ? { opacity: 1, transform: 'none' } : effects[effect];
    const finishVisibility = () => {
      if (!visible && el.contains(document.activeElement)) {
        if (focusTarget instanceof HTMLElement && focusTarget.isConnected) focusTarget.focus();
        else document.activeElement.blur();
      }
      el.hidden = !visible;
    };
    if (preference.matches || !el.animate || ms === 0 || document.hidden) {
      active.delete(el);
      el.style.willChange = originalWillChange;
      finishVisibility();
      return { cancelled: false };
    }
    el.style.willChange = 'transform, opacity';
    const animation = el.animate([from, to], {
      duration: ms, easing: visible && effect === 'pop' ? 'cubic-bezier(.16,1,.3,1)' : 'cubic-bezier(.2,.7,.2,1)', fill: 'both',
    });
    const state = { animation, originalWillChange };
    active.set(el, state); running.add(animation);
    try {
      await animation.finished;
      if (active.get(el) !== state) return { cancelled: true };
      finishVisibility();
      return { cancelled: false };
    } catch {
      return { cancelled: true };
    } finally {
      running.delete(animation);
      if (active.get(el) === state) {
        active.delete(el); el.style.willChange = originalWillChange; animation.cancel();
      }
    }
  }
  const finishAll = () => { for (const animation of running) animation.finish(); };
  preference.addEventListener('change', () => { if (preference.matches) finishAll(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  window.LiquidGlass = Object.assign(window.LiquidGlass || {}, {
    show: (el, options) => transition(el, true, options),
    hide: (el, options) => transition(el, false, options),
  });
  // Disclosure navigation: normal links, not an ARIA menu requiring arrow keys.
  for (const toggle of document.querySelectorAll('[data-glass-menu]')) {
    const panel = document.getElementById(toggle.dataset.glassMenu);
    if (!panel) continue;
    const mobile = matchMedia('(max-width: 760px)');
    let open = false;
    const setOpen = on => {
      open = on; toggle.setAttribute('aria-expanded', String(on));
      transition(panel, !mobile.matches || on, { effect: 'pop', focusTarget: toggle });
    };
    toggle.addEventListener('click', () => setOpen(!open));
    panel.addEventListener('click', event => { if (mobile.matches && event.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && mobile.matches && open) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('pointerdown', event => {
      if (mobile.matches && open && !panel.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });
    const sync = () => { open = false; toggle.setAttribute('aria-expanded', 'false'); transition(panel, !mobile.matches, { duration: 0, focusTarget: toggle }); };
    mobile.addEventListener('change', sync); sync();
  }
})();
