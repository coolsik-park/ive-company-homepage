/* ========================================================================
   Animations (GSAP + ScrollTrigger)
   - Hero 타이틀 마스크 슬라이드인
   - 섹션 진입 페이드인 (reveal)
   - 포트폴리오/카드 stagger
   - Numbers 카운트업
   - Hero overlay parallax
   - GSAP 없을 때도 CSS 폴백으로 보이도록 처리
   ======================================================================== */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

  function revealAllWithoutAnim() {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.hero-title .mask > span').forEach((el) => {
      el.style.transform = 'none';
      el.style.opacity = '1';
    });
  }

  /* ---------- Numbers (순수 JS로 항상 동작) ---------- */
  function initCountUp() {
    const values = document.querySelectorAll('.num-value[data-target]');
    if (!values.length) return;

    const format = (n, isPlain) => (isPlain ? String(n) : n.toLocaleString('ko-KR'));

    function animate(el) {
      const target = parseInt(el.dataset.target, 10);
      if (!Number.isFinite(target)) return;
      const isPlain = el.dataset.plain === 'true';
      if (prefersReduced) { el.textContent = format(target, isPlain); return; }

      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const p = Math.min(1, elapsed / duration);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - p, 3);
        const current = Math.round(target * eased);
        el.textContent = format(current, isPlain);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    values.forEach((el) => io.observe(el));
  }

  /* ---------- GSAP 기반 애니메이션 ---------- */
  function initGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero 타이틀 mask — 아래에서 위로 슬라이드인
    gsap.set('.hero-title .mask > span', { yPercent: 110 });
    gsap.to('.hero-title .mask > span', {
      yPercent: 0,
      duration: 1.1,
      ease: 'power4.out',
      stagger: 0.12,
      delay: 0.15,
    });

    gsap.from('.hero-label', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', delay: 0.05 });
    gsap.from('.hero-sub',   { opacity: 0, y: 20, duration: 0.9, ease: 'power3.out', delay: 0.55 });
    gsap.from('.hero-btns > *', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.75 });
    gsap.from('.scroll-indicator', { opacity: 0, duration: 1, delay: 1.2, ease: 'power2.out' });

    // Hero overlay parallax (스크롤에 따라 살짝 이동)
    const heroOverlay = document.querySelector('.hero-overlay');
    const heroVideo = document.querySelector('.hero-video');
    if (heroOverlay) {
      gsap.to(heroOverlay, {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
    if (heroVideo) {
      gsap.to(heroVideo, {
        yPercent: 10,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    // 섹션 공통 타이틀/설명 페이드인
    const commonTargets = [
      '.about .section-label', '.about .section-title', '.about .section-desc',
      '.team .section-label', '.team .section-title', '.team .team-filter',
      '.career .section-label', '.career .section-title',
      '.portfolio-head .section-label', '.portfolio-head .portfolio-title',
      '.job-head .section-label',
    ];
    commonTargets.forEach((sel) => {
      const el = document.querySelector(sel);
      if (!el) return;
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      });
    });

    // 그리드 stagger 애니메이션
    const staggerGroups = [
      { parent: '.biz-tabs', items: '.biz-tab' },
      { parent: '.biz-panel.is-active', items: '.biz-block' },
      { parent: '.portfolio-grid', items: '.portfolio-item' },
      { parent: '.team-grid', items: '.team-card' },
      { parent: '.values-grid', items: '.value-card' },
      { parent: '.numbers-grid', items: '.num-item' },
    ];
    staggerGroups.forEach(({ parent, items }) => {
      const container = document.querySelector(parent);
      if (!container) return;
      const targets = container.querySelectorAll(items);
      if (!targets.length) return;
      gsap.from(targets, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        /* 끝난 뒤 inline transform/opacity 제거 — 레이아웃 오프셋 잔존 방지 */
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: container,
          start: 'top 82%',
          /* 이미 뷰포트 안이면 즉시 재생, 한 번만 */
          once: true,
          toggleActions: 'play none none none',
        },
      });
    });

    // 채용공고 — career.js 렌더 이후 발생하는 이벤트 구독
    document.addEventListener('career:rendered', () => {
      const jobs = document.querySelectorAll('#job-list .job-item, #job-list .job-empty');
      if (!jobs.length) return;
      gsap.from(jobs, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: { trigger: '#job-list', start: 'top 85%' },
      });
    });

    // Footer 페이드인
    gsap.from('#footer .footer-top > *', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: { trigger: '#footer', start: 'top 85%' },
    });
  }

  function boot() {
    if (prefersReduced || !hasScrollTrigger) {
      revealAllWithoutAnim();
      initCountUp();
      return;
    }
    initGSAP();
    initCountUp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
