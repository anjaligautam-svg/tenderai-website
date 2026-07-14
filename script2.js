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

/* ── Hero Scene: chat → tender → bids → evaluation → award ──────────────── */
/* Story loop driven by data-act on #heroScene plus per-element classes.
   setTimeout-based so the story keeps time even when the tab is
   backgrounded and requestAnimationFrame is throttled. */
(function () {
  var scene = document.getElementById('heroScene');
  if (!scene) return;

  var chat     = scene.querySelector('.hs__chat');
  var chatBits = [].slice.call(scene.querySelectorAll('.hs__chat [data-bit]'));
  var rows    = [].slice.call(scene.querySelectorAll('.hs__row'));
  var pen     = scene.querySelector('.hs__pen');
  var caption = document.getElementById('hsCaption');
  var bids    = [].slice.call(scene.querySelectorAll('.hs-bid'));
  var evalTag  = scene.querySelector('.hs__eval-tag');
  var evalTxt  = scene.querySelector('.hs__eval-txt');

  var CAPS = {
    chat:   'Start with a chat — describe the work',
    draft:  'Drafts every clause. Runs every check.',
    ready:  'Audit-ready in hours, not months',
    scan:   'Published — the portal opens for bids',
    bids:   'Sealed bids arrive, time-stamped',
    eval:   'Evaluated in minutes — L1 ranked, every score logged',
    award:  'Awarded. The file was audit-ready all along.'
  };

  function setAct(act) { scene.setAttribute('data-act', act); }

  function say(text) {
    if (!caption || caption.textContent === text) return;
    caption.classList.add('is-swap');
    setTimeout(function () {
      caption.textContent = text;
      caption.classList.remove('is-swap');
    }, 240);
  }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    /* Static final frame: drafted tender, checks passed */
    setAct('ready');
    rows.forEach(function (r) { r.classList.add('is-on'); });
    if (caption) caption.textContent = CAPS.ready;
    return;
  }

  var timers = [];
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

  function movePen(row) {
    if (!pen || !row) return;
    pen.style.top = (row.offsetTop + row.offsetHeight - 2) + 'px';
  }

  function bit(name, cls) {
    var el = chat ? chat.querySelector('[data-bit="' + name + '"]') : null;
    if (el) el.classList.add(cls || 'is-in');
  }

  function evalSay(text) {
    if (!evalTag || !evalTxt) return;
    evalTag.classList.add('is-swap');
    setTimeout(function () {
      evalTxt.textContent = text;
      evalTag.classList.remove('is-swap');
    }, 220);
  }

  function cycle() {
    timers.forEach(clearTimeout);
    timers = [];

    /* ACT 1 · chat — describe the work to Scribe */
    setAct('chat');
    say(CAPS.chat);
    scene.classList.remove('is-awarded');
    chatBits.forEach(function (el) { el.classList.remove('is-in', 'is-out'); });
    rows.forEach(function (r) { r.classList.remove('is-on'); });
    bids.forEach(function (b) { b.classList.remove('is-up'); });
    if (evalTxt) evalTxt.textContent = 'Evaluating bids…';
    if (evalTag) evalTag.classList.remove('is-swap');
    if (pen) pen.style.top = '62px';

    at(350,  function () { bit('user'); });
    at(1150, function () { bit('typing'); });
    at(2250, function () { bit('typing', 'is-out'); bit('ai'); });
    at(3250, function () { bit('status'); });

    /* ACT 3 · the tender drafts itself, clause by clause */
    at(4150, function () { setAct('draft'); say(CAPS.draft); });
    rows.forEach(function (r, i) {
      at(4650 + i * 680, function () {
        r.classList.add('is-on');
        movePen(r);
      });
    });

    /* Payoff — checks pass, chips float in, time badge lands. Held long. */
    at(7550, function () { setAct('ready'); say(CAPS.ready); });

    /* ACT 4 · publish — a scan beam seals the drafted tender */
    at(10500, function () { setAct('scan'); say(CAPS.scan); });

    /* ACT 5 · sealed bids upload against it */
    at(12500, function () { setAct('bids'); say(CAPS.bids); });
    bids.forEach(function (b, i) {
      at(12750 + i * 700, function () { b.classList.add('is-up'); });
    });

    /* ACT 6 · evaluation — reorder to rank, scores fill, L1 crowned */
    at(16100, function () { setAct('eval'); say(CAPS.eval); });
    at(17700, function () { evalSay('Generating comparative statement…'); });
    at(19100, function () { evalSay('Comparative statement — auto-built'); });

    /* the award lands — winner sealed */
    at(19500, function () { scene.classList.add('is-awarded'); say(CAPS.award); });

    /* Dissolve and tell it again */
    at(21500, function () { setAct('reset'); });
    at(22300, cycle);
  }

  cycle();
})();

/* ── Journey Stage Auto-Switcher (pill tracker with traveling ball) ─────── */
/* Each stage holds, then a lit ball rides the connector to the next pill
   and ignites it (SquareBoat crewmate pattern). Click jumps directly;
   hover/focus pauses the hold. Ball + fill animate transforms only. */
(function () {
  var steps  = document.querySelectorAll('.journey-step');
  var panels = document.querySelectorAll('.journey-panel');
  var segs   = document.querySelectorAll('.journey-track__seg');
  if (!steps.length || !panels.length) return;

  var reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOLD    = 4000; /* ms a stage stays before the ball departs */
  var TRAVEL  = 650;  /* ms the ball rides the connector — matches the CSS */
  var current = 0;
  var holdTimer = null, travelTimer = null;
  var holdStart = 0, holdLeft = HOLD;
  var paused = false, traveling = false;

  function paint() {
    steps.forEach(function (s, i) {
      s.classList.toggle('active', i === current);
      s.classList.toggle('done', i < current);
      s.setAttribute('aria-selected', i === current ? 'true' : 'false');
    });
    panels.forEach(function (p, i) { p.classList.toggle('active', i === current); });
    segs.forEach(function (seg, i) {
      seg.classList.remove('travel');
      seg.querySelector('i').style.transform = i < current ? 'scaleX(1)' : 'scaleX(0)';
    });
  }

  function schedule(ms) {
    clearTimeout(holdTimer);
    holdLeft  = ms;
    holdStart = Date.now();
    holdTimer = setTimeout(depart, ms);
  }

  function depart() {
    if (paused) return;
    var next = (current + 1) % steps.length;
    var seg  = segs[current];
    if (reduce || next === 0 || !seg) {
      /* wrap-around or reduced motion: no travel, just start over */
      goTo(next);
      return;
    }
    traveling = true;
    seg.style.setProperty('--segw', seg.offsetWidth + 'px');
    seg.querySelector('i').style.transform = ''; /* let .travel take over */
    seg.classList.add('travel');
    travelTimer = setTimeout(function () {
      traveling = false;
      current = next;
      paint(); /* the pill ignites as the ball lands */
      if (paused) { holdLeft = HOLD; holdStart = Date.now(); }
      else { schedule(HOLD); }
    }, TRAVEL);
  }

  function goTo(idx) {
    clearTimeout(holdTimer);
    clearTimeout(travelTimer);
    traveling = false;
    current = idx;
    paint();
    schedule(HOLD);
  }

  function pause() {
    if (paused) return;
    paused = true;
    if (!traveling) {
      clearTimeout(holdTimer);
      holdLeft = Math.max(0, holdLeft - (Date.now() - holdStart));
    }
  }

  function resume() {
    if (!paused) return;
    paused = false;
    if (!traveling) schedule(holdLeft > 200 ? holdLeft : HOLD);
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
  schedule(HOLD);
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

/* ── Spotlight grid (How it works + closing CTA/footer backgrounds) ─────── */
/* Grid lines brighten in a circle around the pointer; a soft glow follows.
   Position is written as CSS vars on each host; rAF-throttled. */
(function () {
  var hosts = document.querySelectorAll('.journey-section, .ai-section, .close-wrap');
  if (!hosts.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; /* spotlight stays at its CSS default position */

  hosts.forEach(function (sec) {
    var lx = 0, ly = 0, ticking = false;

    function apply() {
      ticking = false;
      var r = sec.getBoundingClientRect();
      sec.style.setProperty('--jx', ((lx - r.left) / r.width * 100) + '%');
      sec.style.setProperty('--jy', ((ly - r.top) / r.height * 100) + '%');
    }

    function onMove(e) {
      var t = e.touches ? e.touches[0] : e;
      if (!t) return;
      lx = t.clientX;
      ly = t.clientY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    }

    sec.addEventListener('mousemove', onMove);
    sec.addEventListener('touchmove', onMove, { passive: true });
  });
})();

/* ── AI card stack (AI at every step) ───────────────────────────────────── */
/* Four AI-moment cards fan out in 3D; the front card swaps every 3.4s.
   Pills jump to a card, hover pauses, pointer-drag swipes. */
(function () {
  var stage = document.getElementById('aiStage');
  if (!stage) return;

  var cards = Array.prototype.slice.call(stage.querySelectorAll('.ai-card'));
  var dots  = document.querySelectorAll('.ai-dot');
  var total = cards.length;
  if (!total) return;

  var reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = 0;
  var timer   = null;

  var POSES = [
    { t: 'translate3d(0,0,0) rotateY(0deg) scale(1)',              o: '1',   z: '30', f: 'none' },
    { t: 'translate3d(38%,4%,-40px) rotateY(-8deg) scale(.92)',    o: '.55', z: '20', f: 'blur(1px) brightness(.8)' },
    { t: 'translate3d(64%,8%,-90px) rotateY(-14deg) scale(.84)',   o: '.22', z: '10', f: 'blur(2px) brightness(.6)' },
    { t: 'translate3d(80%,12%,-140px) rotateY(-18deg) scale(.76)', o: '0',   z: '0',  f: 'blur(3px)' }
  ];

  function render() {
    cards.forEach(function (c, i) {
      var off = (i - current + total) % total;
      var p = POSES[Math.min(off, POSES.length - 1)];
      c.style.transform = p.t;
      c.style.opacity   = p.o;
      c.style.zIndex    = p.z;
      c.style.filter    = p.f;
    });
    dots.forEach(function (d) {
      var on = Number(d.dataset.go) === current;
      d.classList.toggle('active', on);
      d.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function go(i)  { current = ((i % total) + total) % total; render(); }
  function next() { go(current + 1); }

  function startAuto() { if (!reduce && !timer) timer = setInterval(next, 3400); }
  function stopAuto()  { clearInterval(timer); timer = null; }

  dots.forEach(function (d) {
    d.addEventListener('click', function () {
      stopAuto();
      go(Number(d.dataset.go));
      startAuto();
    });
  });

  stage.addEventListener('mouseenter', stopAuto);
  stage.addEventListener('mouseleave', startAuto);

  /* pointer-drag to swipe */
  var startX = null;
  stage.addEventListener('pointerdown', function (e) { startX = e.clientX; stopAuto(); });
  stage.addEventListener('pointerup', function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 40) { if (dx < 0) { next(); } else { go(current - 1); } }
    startX = null;
    startAuto();
  });

  render();
  startAuto();
})();

/* ── V2: Walkthrough slideshow (WebP cross-fade, replaces the GIF) ──────── */
(function () {
  var box = document.getElementById('pgSlides');
  if (!box) return;
  var slides = box.querySelectorAll('img');
  var dots = box.querySelectorAll('.pg-slides__dots i');
  if (slides.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var i = 0, timer = null;
  function show(n) {
    slides[i].classList.remove('is-on');
    if (dots[i]) dots[i].classList.remove('is-on');
    i = n % slides.length;
    slides[i].classList.add('is-on');
    if (dots[i]) dots[i].classList.add('is-on');
  }
  function start() { stop(); timer = setInterval(function () { show(i + 1); }, 3400); }
  function stop() { if (timer) clearInterval(timer); timer = null; }
  box.addEventListener('mouseenter', stop);
  box.addEventListener('mouseleave', start);
  start();
})();

/* ── V2: Count-up numerals when stats scroll into view ──────────────────── */
(function () {
  var els = document.querySelectorAll('.stat-item__num, .pain-stat');
  if (!els.length || !('IntersectionObserver' in window)) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate(el) {
    var t = el.firstChild;
    if (!t || t.nodeType !== 3) return;
    var m = t.textContent.trim().match(/^(\d+)(\+?)$/);
    if (!m) return;
    var target = parseInt(m[1], 10), suffix = m[2];
    if (reduce) { t.textContent = target + suffix; return; }
    var t0 = Date.now(), DUR = 900;
    var iv = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / DUR);
      var eased = 1 - Math.pow(1 - p, 3);
      t.textContent = Math.round(target * eased) + suffix;
      if (p >= 1) clearInterval(iv);
    }, 30);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  els.forEach(function (el) { io.observe(el); });
})();
