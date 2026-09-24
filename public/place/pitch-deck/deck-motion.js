// Subtle animations for the web pitch deck, powered by Motion
// (motion.dev, MIT licence; the v13.4.2 UMD build is vendored at vendor/motion.js).
//
// index.html imports this only after a successful unlock, so the password
// screen never waits on it. If Motion fails to load, the deck still renders
// in full: elements are only hidden once the library is ready.
//
// Markup hooks (in private/deck.html):
//   data-motion="rise"     the element fades up when it scrolls into view
//   data-motion="stagger"  its children fade up in sequence; nested .stack,
//                          .grid, .flow, .cols, .logos and .points are
//                          flattened so each card or line arrives on its own
//   data-count="55.5"      counts up to the value once in view, with optional
//                          data-prefix, data-suffix and data-decimals

const MOTION_SRC = 'vendor/motion.js';
const EASE = [0.22, 1, 0.36, 1]; // ease-out-quint: quick start, soft landing
const DURATION = 0.6;
const RISE = 16; // px
const STAGGER = 0.07; // s between items entering together
const GROUPS = '.stack, .grid, .flow, .cols, .logos, .points';
const IN_VIEW = { margin: '0px 0px -8% 0px' };

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function loadMotion() {
  if (window.Motion) return Promise.resolve(window.Motion);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MOTION_SRC;
    script.onload = () => (window.Motion ? resolve(window.Motion) : reject(new Error('motion')));
    script.onerror = () => reject(new Error('motion'));
    document.head.appendChild(script);
  });
}

// Each item inside a stagger container that animates on its own, in document order.
function flatten(group) {
  return [...group.children].flatMap((c) => (c.matches(GROUPS) ? flatten(c) : [c]));
}

// Tables animate row by row rather than as one block.
function expand(el) {
  if (el.matches('.table-wrap')) return [...el.querySelectorAll('tr')];
  return [el];
}

// The starting pose for each kind of element.
function fromPose(el) {
  if (el.matches('hr.rule')) return { scaleX: [0, 1] };
  if (el.matches('.arrow')) return { x: [-RISE / 2, 0] };
  if (el.matches('tr')) return {}; // transforms on table rows are unreliable; fade only
  return { y: [RISE, 0] };
}

function hide(el) {
  el.style.opacity = '0';
}

// Clear the inline styles Motion leaves behind, handing control back to CSS
// (e.g. the card hover lift). The scroll cue keeps its CSS centring transform.
function settle(el) {
  el.style.opacity = '';
  if (!el.matches('.scroll-cue')) el.style.transform = '';
}

// Browsers pause animations in tabs that aren't being painted. Content must never
// depend on an animation finishing, so snap to the end state if one overruns.
function play(M, el, keyframes, options) {
  const controls = M.animate(el, keyframes, options);
  const deadline = ((options.delay || 0) + options.duration) * 1000 + 800;
  const fallback = setTimeout(() => {
    controls.stop();
    settle(el);
  }, deadline);
  controls.then(() => {
    clearTimeout(fallback);
    settle(el);
  });
}

function formatter(el) {
  const decimals = Number(el.dataset.decimals || 0);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  return (n) =>
    prefix + n.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
}

export async function prepareDeckMotion(root) {
  const bar = root.querySelector('.progress');

  if (reducedMotion()) {
    // No entrance motion at all; the progress bar is scroll-linked, not animated.
    const M = await loadMotion().catch(() => null);
    return { start: () => M && linkProgress(M, root, bar) };
  }

  const M = await loadMotion();
  const { animate, inView } = M;

  const cover = root.querySelector('#cover');
  const coverParts = cover ? [...cover.querySelectorAll('.wordmark, .tagline, .rule, .date, .scroll-cue')] : [];
  coverParts.forEach(hide);

  const hooks = [...root.querySelectorAll('[data-motion]')];
  const targets = hooks.flatMap((h) => (h.dataset.motion === 'stagger' ? flatten(h) : [h])).flatMap(expand);
  targets.forEach(hide);

  const counters = [...root.querySelectorAll('[data-count]')];

  function playCover() {
    coverParts.forEach((el, i) => {
      const pose = el.matches('.rule') ? { scaleX: [0, 1] } : el.matches('.date, .scroll-cue') ? {} : { y: [24, 0] };
      const delay = [0.05, 0.2, 0.4, 0.55, 0.9][i] ?? 0;
      play(M, el, { opacity: [0, 1], ...pose }, { duration: 0.8, delay, ease: EASE });
    });
  }

  // Items that enter the viewport in the same frame are staggered top-to-bottom, left-to-right.
  let queue = [];
  let scheduled = false;
  function enqueue(el) {
    queue.push(el);
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      const batch = queue.sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return Math.round(ra.top - rb.top) || ra.left - rb.left;
      });
      queue = [];
      scheduled = false;
      batch.forEach((item, i) => reveal(item, i * STAGGER));
    });
  }

  function reveal(el, delay) {
    const emphasis = el.matches('tr.us') ? 0.15 : 0; // the Place row settles a beat later
    play(M, el, { opacity: [0, 1], ...fromPose(el) }, { duration: DURATION, delay: delay + emphasis, ease: EASE });
  }

  function countUp(el) {
    const target = Number(el.dataset.count);
    const final = el.textContent;
    const format = formatter(el);
    // Reserve the final width so neighbouring text doesn't shift while counting.
    el.style.display = 'inline-block';
    el.style.minWidth = `${el.getBoundingClientRect().width}px`;
    el.textContent = format(0);
    inView(el, () => {
      const controls = animate(0, target, { duration: 1.2, ease: EASE, onUpdate: (v) => (el.textContent = format(v)) });
      const fallback = setTimeout(() => {
        controls.stop();
        el.textContent = final;
      }, 2000);
      controls.then(() => {
        clearTimeout(fallback);
        el.textContent = final;
      });
    }, IN_VIEW);
  }

  return {
    start() {
      playCover();
      targets.forEach((el) => inView(el, () => enqueue(el), IN_VIEW));
      counters.forEach(countUp);
      linkProgress(M, root, bar);
    },
  };
}

function linkProgress(M, root, bar) {
  if (!bar) return;
  M.scroll((progress) => {
    bar.style.transform = `scaleX(${progress})`;
  });
  // Swap to Deep Teal while an orange slide sits under the bar (full Teal never sits on orange).
  M.inView(root.querySelectorAll('.slide.orange'), () => {
    bar.classList.add('on-orange');
    return () => bar.classList.remove('on-orange');
  }, { margin: '0px 0px -99% 0px' });
}
