/* Pop/fade/slide transitions and responsive navigation; no per-frame JS loop.
 * Reduced motion follows the OS preference. An in-app "reduced" choice can
 * only strengthen that preference; it cannot turn OS reduced motion back on.
 */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const MOTION_KEY = 'liquid-glass.pref.motion';
  const EFFECTS_KEY = 'liquid-glass.pref.effects';
  const active = new WeakMap();
  const running = new Set();
  const effects = {
    pop: { transform: 'translateY(8px) scale(.94)', opacity: 0 },
    fade: { transform: 'none', opacity: 0 },
    slide: { transform: 'translateY(16px)', opacity: 0 },
  };
  const readStored = (key) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  };
  const writeStored = (key, value) => {
    try { localStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
  };
  function motionOff() {
    return preference.matches || document.documentElement.dataset.motion === 'reduced';
  }
  function applyMotionPreference() {
    const stored = readStored(MOTION_KEY) === 'reduced' ? 'reduced' : 'system';
    const reduced = preference.matches || stored === 'reduced';
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'system';
    if (reduced) finishAll();
    return document.documentElement.dataset.motion;
  }
  function applyEffectsPreference() {
    const reduced = readStored(EFFECTS_KEY) === 'reduced';
    document.documentElement.dataset.effects = reduced ? 'reduced' : 'full';
    return document.documentElement.dataset.effects;
  }
  async function transition(el, visible, { effect = 'pop', duration, focusTarget } = {}) {
    if (!(el instanceof HTMLElement)) throw new TypeError('Motion target must be an HTML element.');
    if (!effects[effect]) throw new TypeError('Unknown motion effect.');
    if (duration !== undefined && (!Number.isFinite(duration) || duration < 0)) throw new TypeError('Invalid duration.');
    const previous = active.get(el);
    const current = previous ? { opacity: getComputedStyle(el).opacity, transform: getComputedStyle(el).transform } : null;
    const originalWillChange = previous?.originalWillChange ?? el.style.willChange;
    previous?.animation.cancel();
    if (!visible && el.hidden && !previous) return { cancelled: false };
    const focusInside = !visible && el.contains(document.activeElement);
    if (visible) el.inert = false;
    else el.inert = true;
    el.hidden = false;
    const style = getComputedStyle(el);
    const ms = duration ?? (parseFloat(style.getPropertyValue('--motion-duration')) || 200);
    const from = current || (visible ? effects[effect] : { opacity: style.opacity, transform: style.transform });
    const to = visible ? { opacity: 1, transform: 'none' } : effects[effect];
    const finishVisibility = () => {
      if (!visible && focusInside) {
        if (focusTarget instanceof HTMLElement && focusTarget.isConnected) focusTarget.focus();
        else if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      }
      el.hidden = !visible;
      if (visible) el.inert = false;
    };
    if (motionOff() || !el.animate || ms === 0 || document.hidden) {
      active.delete(el);
      el.style.willChange = originalWillChange;
      finishVisibility();
      return { cancelled: false };
    }
    el.style.willChange = 'transform, opacity';
    const animation = el.animate([from, to], {
      duration: ms,
      easing: visible ? 'cubic-bezier(.2,.8,.2,1)' : 'cubic-bezier(.4,0,1,1)',
      fill: 'both',
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
  function finishAll() { for (const animation of running) animation.finish(); }
  function stagger(elements, visible, options = {}) {
    const list = Array.from(elements || []).filter((el) => el instanceof HTMLElement).slice(0, 6);
    const gap = Math.min(35, Math.max(20, Number.isFinite(options.gap) ? options.gap : 28));
    const reduced = motionOff();
    return Promise.all(list.map((el, index) => {
      const delay = reduced ? 0 : Math.min(150, index * gap);
      return new Promise((resolve) => setTimeout(resolve, delay)).then(() => transition(el, visible, options));
    }));
  }
  preference.addEventListener('change', applyMotionPreference);
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  applyMotionPreference();
  applyEffectsPreference();
  window.LiquidGlass = Object.assign(window.LiquidGlass || {}, {
    show: (el, options) => transition(el, true, options),
    hide: (el, options) => transition(el, false, options),
    stagger: (elements, options) => stagger(elements, true, options),
    setMotion(value) {
      writeStored(MOTION_KEY, value === 'reduced' ? 'reduced' : 'system');
      return applyMotionPreference();
    },
    setEffects(value) {
      writeStored(EFFECTS_KEY, value === 'reduced' ? 'reduced' : 'full');
      return applyEffectsPreference();
    },
    prefersReducedMotion: motionOff,
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
