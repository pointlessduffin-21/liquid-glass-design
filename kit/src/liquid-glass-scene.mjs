/* Decorative Liquid Glass field. Bundled with Three.js into kit/liquid-glass-scene.js.
 * The scene is a background, never the place where numbers or commands live.
 * Reduced motion renders one still frame. The OS preference cannot be overridden.
 */
import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PMREMGenerator,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const FIELD = 0xeef3ee;

function motionReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.dataset.motion === 'reduced';
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'))
      || !!canvas.getContext('webgl');
  } catch (error) {
    return false;
  }
}

export function mount(host, { preset = 'field', mode = 'background' } = {}) {
  if (!(host instanceof HTMLElement)) throw new TypeError('Scene host must be an element.');
  host._lgScene?.dispose();
  const reducedAtStart = motionReduced();
  const narrow = () => Math.min(host.clientWidth || window.innerWidth, window.innerWidth) < 760;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const effectsReduced = document.documentElement.dataset.effects === 'reduced';
  let tier = (narrow() || coarse || saveData || effectsReduced) ? 'low' : 'high';
  let disposed = false;
  let playing = !reducedAtStart;
  let visible = true;
  let frame = 0;
  let frames = 0;
  let last = 0;
  let elapsed = 0;
  let slow = 0;
  let lockedStill = false;
  const panes = [];
  const orbs = [];
  const geometries = [];
  const materials = [];
  let environment = null;
  let pmrem = null;
  let room = null;

  host.classList.add(mode === 'inline' ? 'lg-scene-inline' : 'lg-scene');
  host.dataset.sceneState = 'starting';
  host.dataset.sceneFrames = '0';
  host.dataset.sceneTier = tier;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.tabIndex = -1;
  host.replaceChildren(canvas);

  const controls = document.createElement('div');
  controls.className = 'lg-scene-controls';
  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'btn lg-scene-pause';
  const note = document.createElement('p');
  note.className = 'lg-scene-note';
  note.setAttribute('role', 'status');
  note.hidden = true;
  controls.append(pause, note);
  document.body.append(controls);

  function setNote(text) {
    note.hidden = !text;
    note.textContent = text || '';
  }
  function paintPause() {
    const reduced = motionReduced();
    if (reduced || lockedStill) {
      pause.textContent = 'Background still';
      pause.setAttribute('aria-pressed', 'true');
      pause.disabled = reduced;
      if (reduced) setNote(note.hidden ? '' : note.textContent);
      return;
    }
    pause.disabled = false;
    pause.textContent = playing ? 'Pause background' : 'Play background';
    pause.setAttribute('aria-pressed', playing ? 'false' : 'true');
  }
  function mark(state) {
    host.dataset.sceneState = state;
    host.dataset.sceneFrames = String(frames);
    host.dataset.sceneTier = tier;
  }

  function fail(message) {
    if (disposed) return;
    playing = false;
    cancelAnimationFrame(frame);
    frame = 0;
    canvas.remove();
    mark('fallback');
    pause.hidden = true;
    setNote(message);
  }

  if (!supportsWebGL()) {
    fail('Decorative scene unavailable. You can keep using this page.');
    paintPause();
    return { dispose() { controls.remove(); disposed = true; }, setPlaying() {} };
  }

  let renderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: tier === 'high',
      alpha: false,
      powerPreference: tier === 'low' ? 'low-power' : 'default',
      failIfMajorPerformanceCaveat: false,
    });
  } catch (error) {
    fail('Decorative scene unavailable. You can keep using this page.');
    paintPause();
    return { dispose() { controls.remove(); disposed = true; }, setPlaying() {} };
  }
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setClearColor(FIELD, 1);

  const scene = new Scene();
  scene.background = new Color(FIELD);
  scene.fog = null;
  const camera = new PerspectiveCamera(30, 1, 0.1, 40);
  camera.position.set(0, 0.35, preset === 'hero' ? 7.2 : 8.4);

  const hemi = new HemisphereLight(0xf7fbf4, 0xb7d7b0, 1.35);
  const key = new DirectionalLight(0xffffff, 1.55);
  key.position.set(-4.5, 7.5, 4);
  const fill = new DirectionalLight(0xe7f6d8, 0.45);
  fill.position.set(3, 2, -2);
  scene.add(hemi, key, fill);

  function track(material) { materials.push(material); return material; }
  function paneMaterial() {
    if (tier === 'low') {
      return track(new MeshStandardMaterial({
        color: 0xf7fbf8, roughness: 0.28, metalness: 0.02, transparent: true, opacity: 0.78,
      }));
    }
    return track(new MeshPhysicalMaterial({
      color: 0xf8fcf8,
      roughness: 0.14,
      metalness: 0,
      transmission: 0.82,
      thickness: 0.85,
      ior: 1.42,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18,
      transparent: true,
      attenuationColor: new Color(0xd5ebc8),
      attenuationDistance: 1.4,
      envMapIntensity: 0.85,
    }));
  }
  function orbMaterial(color) {
    return track(new MeshStandardMaterial({
      color, roughness: 0.72, metalness: 0, transparent: true, opacity: tier === 'low' ? 0.38 : 0.5,
      depthWrite: false,
    }));
  }

  if (tier === 'high') {
    try {
      pmrem = new PMREMGenerator(renderer);
      room = new RoomEnvironment();
      environment = pmrem.fromScene(room, 0.04).texture;
      scene.environment = environment;
    } catch (error) {
      tier = 'low';
    }
  }

  const paneCount = tier === 'low' ? 3 : 5;
  const paneGeo = new RoundedBoxGeometry(1.7, 1.05, 0.12, tier === 'low' ? 2 : 4, 0.16);
  geometries.push(paneGeo);
  for (let index = 0; index < paneCount; index += 1) {
    const mesh = new Mesh(paneGeo, paneMaterial());
    const angle = (index / paneCount) * Math.PI * 2 + 0.4;
    const radius = preset === 'hero' ? 2.5 : 3.15;
    const y = preset === 'hero' ? 0.85 + Math.sin(angle) * 0.55 : Math.sin(angle) * 0.7;
    mesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * 0.85);
    mesh.rotation.set(0.08, angle, index % 2 ? 0.12 : -0.08);
    mesh.userData = { angle, radius, y, spin: index % 2 ? 0.05 : -0.04, phase: index * 1.3 };
    scene.add(mesh);
    panes.push(mesh);
  }

  const orbCount = tier === 'low' ? 4 : 7;
  const colors = [0xa8cc4a, 0x5fae52, 0xd7efc4, 0x8fbf6a];
  for (let index = 0; index < orbCount; index += 1) {
    const geo = new SphereGeometry(0.28 + (index % 3) * 0.12, tier === 'low' ? 16 : 28, tier === 'low' ? 12 : 20);
    geometries.push(geo);
    const mesh = new Mesh(geo, orbMaterial(colors[index % colors.length]));
    const angle = (index / orbCount) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * 4.1, 0.2 + (index % 4) * 0.45, Math.sin(angle) * 1.4 - 0.6);
    mesh.userData = { base: mesh.position.clone(), phase: index * 0.9 };
    scene.add(mesh);
    orbs.push(mesh);
  }

  function dprCap() {
    return Math.min(window.devicePixelRatio || 1, tier === 'low' || narrow() ? 1.25 : 1.5);
  }
  function resize() {
    const width = Math.max(1, host.clientWidth || window.innerWidth);
    const height = Math.max(1, host.clientHeight || window.innerHeight);
    if (width <= 1 || height <= 1) return;
    renderer.setPixelRatio(dprCap());
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  function layout(time) {
    for (const mesh of panes) {
      const data = mesh.userData;
      mesh.position.y = data.y + Math.sin(time * 0.35 + data.phase) * 0.12;
      mesh.rotation.y = data.angle + time * data.spin;
    }
    for (const mesh of orbs) {
      const data = mesh.userData;
      mesh.position.y = data.base.y + Math.sin(time * 0.45 + data.phase) * 0.16;
      mesh.position.x = data.base.x + Math.sin(time * 0.2 + data.phase) * 0.08;
    }
  }
  function renderNow() {
    layout(elapsed);
    renderer.render(scene, camera);
    frames += 1;
    host.dataset.sceneFrames = String(frames);
  }
  function stopLoop() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }
  function dropQuality(reason) {
    if (tier === 'high') {
      tier = 'low';
      for (const mesh of panes) {
        const next = paneMaterial();
        mesh.material = next;
      }
      renderer.setPixelRatio(dprCap());
      setNote('Simpler scene, to keep this page responsive.');
      mark(playing ? 'playing' : 'still');
      slow = 0;
      return;
    }
    playing = false;
    lockedStill = true;
    stopLoop();
    setNote(reason);
    mark('still');
    paintPause();
  }
  function loop(now) {
    frame = 0;
    if (disposed || !playing || motionReduced() || lockedStill || !visible || document.hidden) return;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    elapsed += dt;
    const started = performance.now();
    renderNow();
    const cost = performance.now() - started;
    if (frames > 40) {
      if (cost > 33) slow += 1;
      else slow = 0;
      if (slow >= 60) dropQuality('Background paused because this device was too busy.');
    }
    if (playing && !lockedStill) frame = requestAnimationFrame(loop);
  }
  function start() {
    if (disposed || motionReduced() || lockedStill || !visible || document.hidden || frame) return;
    playing = true;
    mark('playing');
    paintPause();
    frame = requestAnimationFrame(loop);
  }
  function setPlaying(value) {
    if (motionReduced() || lockedStill) {
      playing = false;
      stopLoop();
      mark('still');
      paintPause();
      return;
    }
    playing = !!value;
    if (playing) {
      setNote('');
      start();
    } else {
      stopLoop();
      mark('paused');
      setNote('Background paused.');
      paintPause();
    }
  }

  resize();
  renderNow();
  if (reducedAtStart) {
    playing = false;
    mark('still');
    setNote('Reduced motion keeps this background still.');
  } else {
    mark('playing');
    start();
  }
  paintPause();

  const onResize = () => { resize(); renderNow(); };
  const onVisibility = () => {
    if (document.hidden) stopLoop();
    else if (playing && !motionReduced()) start();
  };
  const onMotion = () => {
    if (motionReduced()) {
      playing = false;
      stopLoop();
      elapsed = 0;
      renderNow();
      mark('still');
      setNote('Reduced motion keeps this background still.');
      paintPause();
    }
  };
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', onMotion);
  const motionObserver = new MutationObserver(onMotion);
  motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion', 'data-effects'] });
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', onResize);
  const observed = new ResizeObserver(onResize);
  observed.observe(host);
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting !== false;
    if (!visible) stopLoop();
    else if (playing && !motionReduced()) start();
  });
  intersection.observe(host);
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    fail('The decorative scene stopped. You can keep using this page.');
  });
  pause.addEventListener('click', () => setPlaying(!playing));

  function dispose() {
    if (disposed) return;
    disposed = true;
    playing = false;
    stopLoop();
    preference.removeEventListener('change', onMotion);
    motionObserver.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('resize', onResize);
    observed.disconnect();
    intersection.disconnect();
    controls.remove();
    for (const material of materials) material.dispose();
    for (const geometry of geometries) geometry.dispose();
    environment?.dispose?.();
    room?.dispose?.();
    pmrem?.dispose();
    renderer.dispose();
    renderer.forceContextLoss?.();
    if (host._lgScene === api) host._lgScene = null;
  }
  const api = { dispose, setPlaying };
  host._lgScene = api;
  return api;
}

function boot() {
  for (const host of document.querySelectorAll('[data-lg-scene]')) {
    if (host.dataset.sceneState) continue;
    mount(host, {
      preset: host.dataset.lgScene || 'field',
      mode: host.dataset.lgSceneMode || 'background',
    });
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
