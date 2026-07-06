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
