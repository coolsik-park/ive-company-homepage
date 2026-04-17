/* ========================================================================
   main.js
   - 커스텀 커서 (데스크탑만)
   - 저작권 연도 자동 갱신
   - Footer form 간이 클라이언트 검증 (Formspree ID 미설정 시 mailto 폴백)
   ======================================================================== */
(function () {
  'use strict';

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wideEnough = window.matchMedia('(min-width: 1025px)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Custom Cursor ---------- */
  function initCursor() {
    if (!canHover || !wideEnough || prefersReduced) return;

    const ring = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    if (!ring || !dot) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX, ringY = targetY;
    let dotX = targetX, dotY = targetY;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      ring.classList.add('visible');
      dot.classList.add('visible');
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      ring.classList.remove('visible');
      dot.classList.remove('visible');
    });

    function frame() {
      // ring follows with easing, dot is exact
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      dotX = targetX; dotY = targetY;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      dot.style.transform  = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    const interactive = 'a, button, input, textarea, select, [role="button"], .portfolio-item, .team-card, .biz-card, .value-card, .job-item';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest && e.target.closest(interactive)) ring.classList.add('active');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest && e.target.closest(interactive)) ring.classList.remove('active');
    });
  }

  /* ---------- Copyright Year ---------- */
  function initYear() {
    const year = new Date().getFullYear();
    document.querySelectorAll('.footer-bottom span').forEach((span) => {
      if (span.textContent && span.textContent.includes('©')) {
        span.textContent = `© ${year} IVE Company LTD. ALL RIGHTS RESERVED`;
      }
    });
  }

  /* ---------- Footer Form ---------- */
  function initFooterForm() {
    const form = document.querySelector('.footer-form');
    if (!form) return;

    const action = form.getAttribute('action') || '';
    // Formspree ID 미설정 시 mailto 폴백
    const isPlaceholder = /xxxxx|YOUR_ID/i.test(action) || !action;

    form.addEventListener('submit', (e) => {
      if (!isPlaceholder) return; // 실제 Formspree 연동 시 기본 동작

      e.preventDefault();
      const name = (form.elements.name?.value || '').trim();
      const email = (form.elements.email?.value || '').trim();
      const message = (form.elements.message?.value || '').trim();
      if (!name || !email || !message) {
        form.reportValidity?.();
        return;
      }
      const lang = document.body.getAttribute('data-lang') === 'en' ? 'en' : 'ko';
      const subject = encodeURIComponent(
        lang === 'en' ? `[IVE] Contact from ${name}` : `[IVE] ${name}님의 문의`
      );
      const body = encodeURIComponent(
        `${message}\n\n— ${name} <${email}>`
      );
      window.location.href = `mailto:contact@ivecompany.kr?subject=${subject}&body=${body}`;
    });
  }

  function boot() {
    initCursor();
    initYear();
    initFooterForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
