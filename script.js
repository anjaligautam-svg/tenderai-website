/* Scribe landing — progressive enhancement only.
   The page is fully readable and navigable without JavaScript;
   this script adds the mobile menu, scroll reveal, and demo-form feedback. */
(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('mobileMenu');

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    // Close after choosing a destination
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Scroll reveal (motion-safe) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reveals.length && 'IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.dataset.staggerDelay) || 0;
          var el = entry.target;
          setTimeout(function () { el.classList.add('in'); }, delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    // No observer / reduced motion: show everything immediately
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Demo request form ---------- */
  var form = document.getElementById('demoForm');
  var ok = document.getElementById('formOk');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Use native constraint validation for accessible inline errors
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (ok) {
        ok.classList.add('show');
        ok.focus && ok.focus();
      }
      form.reset();
      // NOTE: front-end only. Wire this to a backend / email endpoint before launch.
    });
  }
})();

/* ── DTA Scan Animation ─────────────────────────────────────────────────── */
/* Sine-wave easing for smooth, stutter-free back-and-forth scanning.
   Cycle (8 s): sweep paper→digital · hold · sweep digital→paper · hold */
(function () {
  var doc   = document.getElementById('dtaDoc');
  var toast = document.getElementById('dtaToast');
  if (!doc) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    doc.style.setProperty('--scan-x', '50%');
    if (toast) toast.style.opacity = '1';
    return;
  }

  var PAPER   = 8;    /* paper shows on right — scan-x small = tiny digital strip */
  var DIGITAL = 92;   /* digital fills left  — scan-x large = full digital reveal */
  var CYCLE   = 8000; /* ms per full loop */

  /* Sinusoidal ease — smoother endpoints than cubic polynomial */
  function sinEase(t) { return (1 - Math.cos(Math.PI * t)) / 2; }

  /*
   * Normalised phase within the 8 s cycle:
   *  0.00 – 0.50  sweep forward  (paper → digital)   4 s
   *  0.50 – 0.65  hold digital                        1.2 s
   *  0.65 – 0.90  sweep back     (digital → paper)    2 s
   *  0.90 – 1.00  hold paper                          0.8 s
   */
  var t0 = null;

  function tick(now) {
    if (t0 === null) t0 = now;
    var phase = ((now - t0) % CYCLE) / CYCLE;
    var x, toastOpacity;

    if (phase < 0.50) {
      x            = PAPER + (DIGITAL - PAPER) * sinEase(phase / 0.50);
      toastOpacity = 0;
    } else if (phase < 0.65) {
      x            = DIGITAL;
      var h        = (phase - 0.50) / 0.15;
      toastOpacity = h > 0.2 ? Math.min(1, (h - 0.2) / 0.3) : 0;
    } else if (phase < 0.90) {
      x            = DIGITAL + (PAPER - DIGITAL) * sinEase((phase - 0.65) / 0.25);
      toastOpacity = 0;
    } else {
      x            = PAPER;
      toastOpacity = 0;
    }

    doc.style.setProperty('--scan-x', x + '%');
    if (toast) toast.style.opacity = toastOpacity.toString();
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();

/* ── Journey Stage Auto-Switcher (tracking stepper) ─────────────────────── */
/* Steps tick off left to right; the connector after the active step fills
   over the stage duration, then the next stage begins. Hover/focus pauses. */
(function () {
  var steps  = document.querySelectorAll('.journey-step');
  var panels = document.querySelectorAll('.journey-panel');
  var segs   = document.querySelectorAll('.journey-track__seg i');
  if (!steps.length || !panels.length) return;

  var current  = 0;
  var DURATION = 4000;
  var rafId    = null;
  var startTs  = null;
  var paused   = false;
  var pausedAt = 0; /* fraction 0-1 of the current stage elapsed */

  function paint() {
    steps.forEach(function (s, i) {
      s.classList.toggle('active', i === current);
      s.classList.toggle('done', i < current);
      s.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
    panels.forEach(function (p, i) { p.classList.toggle('active', i === current); });
    segs.forEach(function (f, i) { f.style.width = i < current ? '100%' : '0%'; });
  }

  function goTo(idx) {
    current = idx;
    paint();
    startFill(0);
  }

  /* Sine ease-in-out — the fill leaves a node gently and lands gently */
  function ease(t) { return (1 - Math.cos(Math.PI * t)) / 2; }

  function startFill(from) {
    if (rafId) cancelAnimationFrame(rafId);
    var seg = segs[current] || null; /* connector after the active node; none on the last stage */
    if (seg) seg.style.width = (ease(from) * 100) + '%';
    startTs = null;
    var elapsed0 = from * DURATION;

    function tick(now) {
      if (paused) return;
      if (!startTs) startTs = now - elapsed0;
      var pct = Math.min(1, (now - startTs) / DURATION);
      pausedAt = pct;
      if (seg) seg.style.width = (ease(pct) * 100) + '%';
      if (pct < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        goTo((current + 1) % steps.length);
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    if (paused) return;
    paused = true;
    if (rafId) cancelAnimationFrame(rafId);
  }

  function resume() {
    if (!paused) return;
    paused = false;
    startFill(pausedAt);
  }

  steps.forEach(function (step, i) {
    step.addEventListener('click', function () {
      if (i !== current) { paused = false; goTo(i); }
    });
  });

  var section = document.querySelector('.journey-section');
  if (section) {
    section.addEventListener('mouseenter', pause);
    section.addEventListener('mouseleave', resume);
    section.addEventListener('focusin',    pause);
    section.addEventListener('focusout',   resume);
  }

  paint();
  startFill(0);
})();

/* ── Container-Scroll tilt (Meet Scribe bento shell) ────────────────────── */
/* The dark shell starts tilted back 20° in 3D and straightens to flat as
   the section scrolls into view; the header drifts up slightly. */
(function () {
  var card = document.getElementById('csCard');
  var head = document.getElementById('csHead');
  if (!card) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; /* CSS reduce block pins transform: none */

  var section = card.closest('.bento-section');
  var ticking = false;

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function update() {
    ticking = false;
    var rect = section.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    /* 0 when the section top touches the viewport bottom,
       1 when it has risen to 15% from the top */
    var p = clamp01((vh - rect.top) / (vh * 0.85));
    var isMobile = window.innerWidth <= 768;
    var rot = lerp(20, 0, p);
    var sc  = isMobile ? lerp(0.7, 0.9, p) : lerp(1.05, 1, p);
    card.style.transform = 'rotateX(' + rot + 'deg) scale(' + sc + ')';
    if (head) head.style.transform = 'translateY(' + lerp(0, -40, p) + 'px)';
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();
