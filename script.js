/* TenderAI landing — progressive enhancement only.
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
          entry.target.classList.add('in');
          io.unobserve(entry.target);
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
