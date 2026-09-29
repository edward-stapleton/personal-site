// Paged horizontal timeline.
//
// The document scrolls vertically over a column of full-height "stops" with
// mandatory scroll-snap, so wheel, trackpad, touch, keyboard and scrollbar all
// move exactly one page per gesture natively. The scene follows the scroll
// position at walking pace and maps it onto a horizontal camera over the
// track of worlds, while the walker (mini-Ed) is scrubbed along each world's
// route between stops. Between worlds, a dotted trail joins the road where it
// leaves one illustration to where it enters the next, and Ed follows it.

type Pt = { x: number; y: number };
type Route = { enter: Pt[]; seat: Pt; exit: Pt[] };

type World = {
  el: HTMLElement;
  id: string;
  bg: [number, number, number];
  route: Route;
  caption: HTMLElement;
  scene: HTMLElement;
  left: number;
  width: number;
};

type Stop = { world: number; cam: number };

/** Seconds for one page-to-page move: slower when Ed walks to the next world,
 *  so he can be followed, and quicker for a pan within one world. */
const WALK_SECONDS = 2.6;
const PAN_SECONDS = 1.3;
/** Longest a scroll across several pages may take. */
const JUMP_SECONDS = 2.5;
/** Fade out/in, in ms, for a rail jump of more than one world. */
const FADE_MS = 180;

/** Where, in % of the scene width, a road is joined to the trail: inside the
 *  feathered edge, so the dots fade in from the painted road. */
const EXIT_X = 96;
const ENTER_X = 4;

export function initTimeline() {
  const root = document.getElementById('timeline');
  if (!root) return;

  const stopsEl = root.querySelector<HTMLElement>('.tl__stops')!;
  const viewport = root.querySelector<HTMLElement>('.tl__viewport')!;
  const track = root.querySelector<HTMLElement>('.tl__track')!;
  const walker = root.querySelector<HTMLElement>('.walker')!;
  const trails = root.querySelector<SVGSVGElement>('.tl__trails')!;
  const railItems = [...document.querySelectorAll<HTMLAnchorElement>('.rail__item')];
  const railFill = document.querySelector<HTMLElement>('.rail__fill');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const worlds: World[] = [...track.querySelectorAll<HTMLElement>('.chapter')].map((el) => ({
    el,
    id: el.dataset.chapter!,
    bg: hexToRgb(el.dataset.bg!),
    route: JSON.parse(el.dataset.route!),
    caption: el.querySelector<HTMLElement>('.chapter__caption')!,
    scene: el.querySelector<HTMLElement>('.chapter__scene')!,
    left: 0,
    width: 0,
  }));

  let stops: Stop[] = [];
  let stopH = 1;
  let vw = 1;
  let lastX = 0;
  let lastY = 0;
  let odometer = 0;
  let facing: 'left' | 'right' = 'right';
  let dir: 'up' | 'down' = 'down';
  let frameQueued = false;
  let settleTimer = 0;
  let activeWorld = -1;
  /** Page-space walk from world i's road end to world i + 1's road start. */
  let bridges: Pt[][] = [];

  function layout() {
    vw = viewport.clientWidth;
    stops = [];
    worlds.forEach((w, i) => {
      w.left = w.el.offsetLeft;
      w.width = w.el.offsetWidth;
      const pages = w.width <= vw + 1 ? 1 : Math.min(3, Math.ceil(w.width / vw - 0.05));
      for (let k = 0; k < pages; k++) {
        const pan = pages === 1 ? (w.width - vw) / 2 : ((w.width - vw) * k) / (pages - 1);
        stops.push({ world: i, cam: w.left + pan });
      }
    });

    if (stopsEl.children.length !== stops.length) {
      stopsEl.replaceChildren(
        ...stops.map(() => {
          const d = document.createElement('div');
          d.className = 'tl__stop';
          return d;
        }),
      );
    }
    const first = stopsEl.children[0] as HTMLElement;
    stopH = first.offsetHeight || innerHeight;
    drawTrails();
  }

  // A gentle S-curve between two road ends, sampled so Ed can walk it.
  function drawTrails() {
    bridges = worlds.slice(0, -1).map((wa, i) => {
      const wb = worlds[i + 1];
      const a = scenePoint(wa, exitSplit(wa.route).cross);
      const b = scenePoint(wb, enterSplit(wb.route).cross);
      const dx = (b.x - a.x) * 0.45;
      const c1 = { x: a.x + dx, y: a.y };
      const c2 = { x: b.x - dx, y: b.y };
      return Array.from({ length: 21 }, (_, k) => bezier(a, c1, c2, b, k / 20));
    });
    trails.setAttribute('width', String(track.scrollWidth));
    trails.setAttribute('height', String(viewport.clientHeight));
    const dot = Math.max(3, (worlds[0].scene.offsetHeight || 400) * 0.008);
    trails.style.setProperty('--dot', `${dot}px`);
    trails.replaceChildren(
      ...bridges.map((pts) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M' + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('L'));
        return path;
      }),
    );
  }

  function progress() {
    return clamp((scrollY - stopsEl.offsetTop) / stopH, 0, stops.length - 1);
  }

  // The native snap glide is quick (~300ms). The scene instead follows the
  // scroll position at walking pace, so each transition reads as Ed walking
  // over; big rail jumps speed up to cover the distance in ~2.5s.
  let shown = 0;
  let lastTime = 0;

  function tick(now: number) {
    frameQueued = false;
    const target = progress();
    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0;
    lastTime = now;
    const diff = target - shown;
    if (reduceMotion.matches || Math.abs(diff) < 0.001) {
      shown = target;
    } else {
      const from = diff > 0 ? Math.floor(shown) : Math.ceil(shown);
      const to = clamp(from + Math.sign(diff), 0, stops.length - 1);
      const pace = stops[from]?.world === stops[to]?.world ? PAN_SECONDS : WALK_SECONDS;
      const speed = Math.max(1 / pace, Math.abs(diff) / JUMP_SECONDS);
      shown += Math.sign(diff) * Math.min(Math.abs(diff), speed * dt);
    }
    render(shown);
    if (shown !== target) {
      frameQueued = true;
      requestAnimationFrame(tick);
    } else {
      lastTime = 0;
    }
  }

  function render(raw: number) {
    if (!stops.length) return;
    // Ease each page-to-page move so the camera sets off and arrives softly.
    const base = Math.floor(raw);
    const f = base + smoothstep(raw - base);
    const i = Math.min(Math.floor(f), stops.length - 1);
    const j = Math.min(i + 1, stops.length - 1);
    const t = f - i;
    const a = stops[i];
    const b = stops[j];

    const cam = lerp(a.cam, b.cam, t);
    track.style.transform = `translate3d(${-cam}px,0,0)`;

    // Captions stay pinned in view while the camera pans within a world, and
    // slide away with their world between worlds.
    for (const w of worlds) {
      const capX = clamp(cam - w.left, 0, Math.max(0, w.width - vw));
      w.caption.style.transform = `translate3d(${capX}px,0,0)`;
    }

    const wa = worlds[a.world];
    const wb = worlds[b.world];
    viewport.style.setProperty('--scene-bg', rgb(mix(wa.bg, wb.bg, t)));

    placeWalker(a.world, b.world, t);

    const nearest = stops[Math.round(f)].world;
    if (nearest !== activeWorld) {
      activeWorld = nearest;
      railItems.forEach((el) => {
        if (el.dataset.go === worlds[nearest].id) el.setAttribute('aria-current', 'step');
        else el.removeAttribute('aria-current');
      });
      railItems
        .find((el) => el.dataset.go === worlds[nearest].id)
        ?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
    if (railFill) railFill.style.transform = `scaleX(${f / Math.max(1, stops.length - 1)})`;
    root!.classList.toggle('tl--moved', f > 0.05);
    document.documentElement.classList.toggle('tl--moved', f > 0.05);
  }

  function scenePoint(w: World, p: Pt): Pt {
    const s = w.scene;
    return {
      x: w.left + s.offsetLeft + (p.x / 100) * s.offsetWidth,
      y: s.offsetTop + (p.y / 100) * s.offsetHeight,
    };
  }

  function placeWalker(from: number, to: number, t: number) {
    const wa = worlds[from];
    let pos: Pt;
    let walking = false;

    if (from === to || reduceMotion.matches) {
      const w = worlds[reduceMotion.matches && t > 0.5 ? to : from];
      pos = scenePoint(w, w.route.seat);
    } else {
      const wb = worlds[to];
      const ra = wa.route;
      const rb = wb.route;
      const out = exitSplit(ra);
      const into = enterSplit(rb);
      const path = [ra.seat, ...out.before]
        .map((p) => scenePoint(wa, p))
        .concat(bridges[from] ?? [scenePoint(wa, out.cross), scenePoint(wb, into.cross)])
        .concat([...into.after, rb.seat].map((p) => scenePoint(wb, p)));
      // Ease so Ed lingers getting up and sitting down.
      const e = t < 0.04 ? 0 : t > 0.96 ? 1 : (t - 0.04) / 0.92;
      pos = along(path, e);
      walking = e > 0 && e < 1;
    }

    if (Math.abs(pos.x - lastX) > 0.5) facing = pos.x > lastX ? 'right' : 'left';
    // Up-screen legs show his back; a near-level stretch keeps the last view.
    if (Math.abs(pos.y - lastY) > 0.25 * Math.abs(pos.x - lastX)) dir = pos.y < lastY ? 'up' : 'down';
    odometer += Math.hypot(pos.x - lastX, pos.y - lastY);
    lastX = pos.x;
    lastY = pos.y;
    // Legs advance with distance covered, so the stride matches the pace.
    const step = Math.max(8, (worlds[0].scene.offsetHeight || 400) * 0.018);
    walker.dataset.state = walking ? 'walk' : 'sit';
    walker.dataset.frame = String(Math.floor(odometer / step) % 2);
    walker.dataset.facing = walking ? facing : 'right';
    walker.dataset.dir = dir;
    walker.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`;
  }

  function queue() {
    if (!frameQueued) {
      frameQueued = true;
      requestAnimationFrame(tick);
    }
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(settle, 160);
  }

  function settle() {
    const w = worlds[stops[Math.round(progress())].world];
    const hash = `#${w.id}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }

  function goToStop(index: number, smooth = true) {
    const i = clamp(index, 0, stops.length - 1);
    window.scrollTo({
      top: stopsEl.offsetTop + i * stopH,
      behavior: smooth && !reduceMotion.matches ? 'smooth' : 'instant',
    });
  }

  function goToWorld(id: string, smooth = true) {
    const w = worlds.findIndex((x) => x.id === id);
    if (w < 0) return false;
    const stop = stops.findIndex((s) => s.world === w);
    const here = stops[Math.round(shown)]?.world ?? w;
    if (smooth && Math.abs(w - here) > 1 && !reduceMotion.matches) jumpToStop(stop);
    else goToStop(stop, smooth);
    return true;
  }

  // Walking past every world in between is slow, so a longer jump fades out,
  // cuts straight to the destination with Ed already at his desk, and fades in.
  let jumpTimer = 0;
  function jumpToStop(index: number) {
    clearTimeout(jumpTimer);
    root!.classList.add('tl--jumping');
    jumpTimer = window.setTimeout(() => {
      goToStop(index, false);
      shown = progress();
      render(shown);
      requestAnimationFrame(() => root!.classList.remove('tl--jumping'));
    }, FADE_MS);
  }

  // Rail, header and any in-page link to a world.
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    if (goToWorld(a.getAttribute('href')!.slice(1))) e.preventDefault();
  });

  addEventListener('hashchange', () => goToWorld(location.hash.slice(1)));

  addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return;
    if ((e.target as HTMLElement).closest('input, textarea, select, dialog')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      goToStop(Math.round(progress()) + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });

  let resizeTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    const keep = worlds[stops[Math.round(progress())]?.world ?? 0].id;
    resizeTimer = window.setTimeout(() => {
      layout();
      goToWorld(keep, false);
      shown = progress();
      render(shown);
    }, 120);
  });

  addEventListener('scroll', queue, { passive: true });

  initHotspots();
  initSignCycles(() => worlds[activeWorld]?.el);

  // The URL hash decides where we start, not the browser's remembered scroll.
  history.scrollRestoration = 'manual';
  layout();
  const initial = location.hash.slice(1);
  if (initial) goToWorld(initial, false);
  shown = progress();
  render(shown);
  document.fonts?.ready.then(() => {
    const keep = worlds[stops[Math.round(progress())].world].id;
    layout();
    goToWorld(keep, false);
    shown = progress();
    render(shown);
  });
}

// Sign panels with several logos take turns showing each one. Only the world
// in view cycles, and nothing runs while the tab is hidden.
const SIGN_SECONDS = 3;

function initSignCycles(active: () => HTMLElement | undefined) {
  setInterval(() => {
    if (document.hidden) return;
    for (const group of active()?.querySelectorAll('.sign__logos') ?? []) {
      const logos = [...group.children];
      if (logos.length < 2) continue;
      const i = logos.findIndex((el) => el.classList.contains('is-on'));
      logos[i]?.classList.remove('is-on');
      logos[(i + 1) % logos.length].classList.add('is-on');
    }
  }, SIGN_SECONDS * 1000);
}

function initHotspots() {
  const dialog = document.querySelector<HTMLDialogElement>('dialog.panel');
  if (!dialog) return;
  const title = dialog.querySelector<HTMLElement>('[data-panel-title]')!;
  const body = dialog.querySelector<HTMLElement>('[data-panel-body]')!;
  const chapter = dialog.querySelector<HTMLElement>('[data-panel-chapter]')!;
  const count = dialog.querySelector<HTMLElement>('[data-panel-count]')!;
  const roleWrap = dialog.querySelector<HTMLElement>('[data-panel-role-wrap]')!;
  const role = dialog.querySelector<HTMLElement>('[data-panel-role]')!;
  const links = dialog.querySelector<HTMLUListElement>('[data-panel-links]')!;
  let current: HTMLButtonElement | null = null;

  function show(btn: HTMLButtonElement) {
    current = btn;
    title.textContent = btn.dataset.label ?? '';
    body.textContent = btn.dataset.body ?? '';
    chapter.textContent = btn.dataset.chapter ?? '';
    count.textContent = `${btn.dataset.index} of ${btn.dataset.total}`;
    role.textContent = btn.dataset.role ?? '';
    roleWrap.hidden = !btn.dataset.role;
    const items: { label: string; href: string }[] = btn.dataset.links ? JSON.parse(btn.dataset.links) : [];
    links.replaceChildren(
      ...items.map(({ label, href }) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = label;
        li.append(a);
        return li;
      }),
    );
    links.hidden = items.length === 0;
    links.scrollTop = 0;
    if (!dialog!.open) dialog!.showModal();
  }

  // Step through a world's hotspots in story order, wrapping at either end.
  function step(delta: number) {
    if (!current) return;
    const all = [...current.closest('.chapter')!.querySelectorAll<HTMLButtonElement>('.hotspot')];
    show(all[(all.indexOf(current) + delta + all.length) % all.length]);
  }

  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.hotspot');
    if (btn) show(btn);
  });
  dialog.querySelector('[data-panel-prev]')!.addEventListener('click', () => step(-1));
  dialog.querySelector('[data-panel-next]')!.addEventListener('click', () => step(1));
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  // Click on the backdrop closes.
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}

/** Where a world's exit route crosses EXIT_X, and the route points before it. */
function exitSplit(r: Route): { before: Pt[]; cross: Pt } {
  const pts = r.exit;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p, q] = [pts[i], pts[i + 1]];
    if (p.x <= EXIT_X && q.x >= EXIT_X) {
      return { before: pts.slice(0, i + 1), cross: at(p, q, (EXIT_X - p.x) / (q.x - p.x || 1)) };
    }
  }
  return { before: pts.slice(0, -1), cross: pts[pts.length - 1] };
}

/** Where a world's enter route crosses ENTER_X, and the route points after it. */
function enterSplit(r: Route): { after: Pt[]; cross: Pt } {
  const pts = r.enter;
  for (let i = pts.length - 1; i > 0; i--) {
    const [p, q] = [pts[i - 1], pts[i]];
    if (p.x <= ENTER_X && q.x >= ENTER_X) {
      return { after: pts.slice(i), cross: at(p, q, (ENTER_X - p.x) / (q.x - p.x || 1)) };
    }
  }
  return { after: pts.slice(1), cross: pts[0] };
}

const at = (p: Pt, q: Pt, k: number): Pt => ({ x: lerp(p.x, q.x, k), y: lerp(p.y, q.y, k) });

function bezier(a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
}

function along(path: Pt[], t: number): Pt {
  const lens = path.slice(1).map((p, i) => Math.hypot(p.x - path[i].x, p.y - path[i].y));
  const total = lens.reduce((s, l) => s + l, 0) || 1;
  let d = t * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const k = lens[i] ? Math.min(1, d / lens[i]) : 0;
      return { x: lerp(path[i].x, path[i + 1].x, k), y: lerp(path[i].y, path[i + 1].y, k) };
    }
    d -= lens[i];
  }
  return path[path.length - 1];
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

function mix(a: [number, number, number], b: [number, number, number], t: number) {
  return a.map((v, i) => Math.round(lerp(v, b[i], t))) as [number, number, number];
}

const rgb = (c: [number, number, number]) => `rgb(${c.join(',')})`;
