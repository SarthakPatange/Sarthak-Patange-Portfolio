/* ================================================
   SARTHAK PATANGE — PORTFOLIO SCRIPTS
   Premium Motorsport Engineering Portfolio
   ================================================ */

'use strict';

/* -------- HELPERS -------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ================================================
   NAV — scroll behaviour + mobile menu
   ================================================ */
(function initNav() {
  const nav       = $('#nav');
  const burger    = $('#navBurger');
  const mobileNav = $('#navMobile');
  const links     = $$('.nav-links a, .nav-mobile a');
  let mobileOpen  = false;

  /* Transparent → solid on scroll */
  const onScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    highlightActive();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile burger toggle */
  burger.addEventListener('click', () => {
    mobileOpen = !mobileOpen;
    mobileNav.style.display = mobileOpen ? 'flex' : '';
    const spans = $$('span', burger);
    if (mobileOpen) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  /* Close mobile nav on link click */
  $$('.nav-mobile a').forEach(link => {
    link.addEventListener('click', () => {
      mobileOpen = false;
      mobileNav.style.display = '';
      $$('span', burger).forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  /* Highlight active nav link */
  const sections = $$('section[id]');

  function highlightActive() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = $$(`.nav-links a[href="#${id}"]`);
      if (scrollY >= top && scrollY < top + height) {
        links.forEach(l => l.classList.remove('active'));
        link.forEach(l => l.classList.add('active'));
      }
    });
  }
})();


/* ================================================
   SMOOTH SCROLL — all anchor links
   ================================================ */
document.addEventListener('click', e => {
  const target = e.target.closest('a[href^="#"]');
  if (!target) return;
  const id = target.getAttribute('href');
  if (id === '#') return;
  const el = $(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: 'smooth' });
});


/* ================================================
   INTERSECTION OBSERVER — reveal on scroll
   ================================================ */
(function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          /* Stagger children within same parent slightly */
          const siblings = $$('.reveal', entry.target.parentElement);
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 0.06}s`;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  $$('.reveal').forEach(el => observer.observe(el));
})();


/* ================================================
   THEME TOGGLE — dark / light
   ================================================ */
(function initTheme() {
  const btn  = $('#themeToggle');
  const icon = btn.querySelector('.theme-icon');
  const root = document.documentElement;

  /* Persist preference */
  const saved = localStorage.getItem('sp-theme') || 'dark';
  root.setAttribute('data-theme', saved);
  icon.textContent = saved === 'dark' ? '☀' : '☽';

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    icon.textContent = next === 'dark' ? '☀' : '☽';
    localStorage.setItem('sp-theme', next);
  });
})();


/* ================================================
   SKILL BARS — animate on reveal
   The CSS handles the animation via .is-visible,
   but we also hook into the observer to ensure
   the bars animate after the card becomes visible.
   ================================================ */
(function initSkillBars() {
  /* Skill bars are inside .skill-group which is .reveal
     The CSS transition fires automatically via .is-visible class.
     Nothing extra needed — but we can enhance with a small delay. */
})();


/* ================================================
   PROJECT CARDS — subtle tilt on mouse move
   ================================================ */
(function initTilt() {
  $$('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = -dy * 3;
      const rotY   =  dx * 3;
      card.style.transform = `translateY(-6px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = '';
    });
  });
})();


/* ================================================
   PARALLAX — hero glows follow scroll gently
   ================================================ */
(function initParallax() {
  const glow1 = $('.hero-glow-1');
  const glow2 = $('.hero-glow-2');
  if (!glow1 || !glow2) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      glow1.style.transform = `translateY(${y * 0.15}px)`;
      glow2.style.transform = `translateY(${y * -0.1}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();


/* ================================================
   ACHIEVEMENT CARDS — counter animation
   ================================================ */
(function initCounters() {
  /* Animate stat numbers when they enter viewport */
  const statNums = $$('.stat-num');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const raw = el.textContent.trim();

      /* Extract number and suffix */
      const match = raw.match(/^([\d.]+)(.*)/);
      if (!match) return;

      const end    = parseFloat(match[1]);
      const suffix = match[2];
      const dur    = 1200;
      const start  = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / dur, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const val = end <= 10 ? (ease * end).toFixed(0) : Math.round(ease * end);
        el.textContent = `${val}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
})();


/* ================================================
   HERO GRID — mouse parallax (subtle)
   ================================================ */
(function initHeroMouseParallax() {
  const grid = $('.hero-grid');
  if (!grid) return;

  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    grid.style.transform = `translate(${x}px, ${y}px)`;
  }, { passive: true });
})();


/* ================================================
   CURSOR GLOW — optional subtle accent glow
   that follows the cursor on desktop
   ================================================ */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return; /* Skip mobile */

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(10,132,255,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
    top: 0; left: 0;
  `;
  document.body.appendChild(glow);

  let mx = 0, my = 0;
  let cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  function loop() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    glow.style.left = `${cx}px`;
    glow.style.top  = `${cy}px`;
    requestAnimationFrame(loop);
  }

  loop();

  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });
})();
