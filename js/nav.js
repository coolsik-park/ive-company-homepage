/* ========================================================================
   Navigation
   - 스크롤 시 nav.scrolled 토글
   - IntersectionObserver 로 현재 섹션 active 표시
   - 햄버거 메뉴 토글 (모바일)
   ======================================================================== */
(function () {
  'use strict';

  const SCROLL_THRESHOLD = 40;

  function initScrollState() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrolled = window.scrollY > SCROLL_THRESHOLD;
        nav.classList.toggle('scrolled', scrolled);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initActiveSection() {
    const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    if (!links.length) return;

    const linkMap = new Map();
    links.forEach((a) => {
      const id = (a.getAttribute('href') || '').slice(1);
      if (id) linkMap.set(id, a);
    });

    const sections = Array.from(linkMap.keys())
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          links.forEach((a) => a.classList.remove('active'));
          const match = linkMap.get(id);
          if (match) match.classList.add('active');
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  function initHamburger() {
    const btn = document.querySelector('.hamburger');
    const body = document.body;
    if (!btn) return;

    function close() {
      body.classList.remove('nav-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', () => {
      const open = !body.classList.contains('nav-open');
      body.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });

    // 링크 클릭 시 닫기
    document.querySelectorAll('.nav-links a').forEach((a) => {
      a.addEventListener('click', close);
    });

    // ESC 로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // 리사이즈로 데스크탑 복귀 시 닫기
    let lastWide = window.matchMedia('(min-width: 1025px)').matches;
    window.addEventListener('resize', () => {
      const wide = window.matchMedia('(min-width: 1025px)').matches;
      if (wide && !lastWide) close();
      lastWide = wide;
    });
  }

  function boot() {
    initScrollState();
    initActiveSection();
    initHamburger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
