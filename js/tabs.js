/* ========================================================================
   Tabs
   - About 사업 부문 탭 (IVE / Skyblue / TripnJoy) — ARIA tabs pattern
   - Team 지역 필터 (All / Korea / Vietnam)
   ======================================================================== */
(function () {
  'use strict';

  /* ---------- About: 사업 부문 탭 ---------- */
  function initBizTabs() {
    const tablist = document.querySelector('.biz-tablist');
    const panelsContainer = document.querySelector('.biz-panels');
    if (!tablist || !panelsContainer) return;

    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = Array.from(panelsContainer.querySelectorAll('.biz-panel'));
    if (!tabs.length || !panels.length) return;

    const slideMQ = window.matchMedia('(max-width: 640px)');
    /* 모바일에서는 모든 패널을 펼쳐 좌우 슬라이드 → hidden 제거 */
    function syncHidden() {
      if (slideMQ.matches) {
        panels.forEach((p) => p.removeAttribute('hidden'));
      }
    }
    syncHidden();
    slideMQ.addEventListener?.('change', syncHidden);

    function scrollToPanel(panel) {
      if (!slideMQ.matches) return;
      const left = panel.offsetLeft - panelsContainer.offsetLeft;
      panelsContainer.scrollTo({ left, behavior: 'smooth' });
    }

    function setActive(targetName, opts) {
      opts = opts || {};
      const targetTab = tabs.find((t) => t.dataset.tab === targetName);
      const targetPanel = panels.find((p) => p.dataset.panel === targetName);
      if (!targetTab || !targetPanel) return;

      tabs.forEach((t) => {
        const active = t === targetTab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
        t.setAttribute('tabindex', active ? '0' : '-1');
      });

      panels.forEach((p) => {
        const match = p === targetPanel;
        p.classList.toggle('is-active', match);
        if (!slideMQ.matches) p.hidden = !match; /* 데스크탑은 기존처럼 감춤 */
      });

      if (opts.scroll !== false) scrollToPanel(targetPanel);
      if (opts.focus) targetTab.focus();
    }

    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => setActive(tab.dataset.tab));
      tab.addEventListener('keydown', (e) => {
        let nextIdx = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') nextIdx = 0;
        else if (e.key === 'End') nextIdx = tabs.length - 1;
        if (nextIdx !== null) {
          e.preventDefault();
          setActive(tabs[nextIdx].dataset.tab, { focus: true });
        }
      });
    });

    /* 스와이프/스크롤 → 가장 많이 보이는 패널을 active 로 */
    let scrollSyncTimer = null;
    panelsContainer.addEventListener('scroll', () => {
      if (!slideMQ.matches) return;
      clearTimeout(scrollSyncTimer);
      scrollSyncTimer = setTimeout(() => {
        const containerRect = panelsContainer.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;
        let best = null;
        let bestDist = Infinity;
        panels.forEach((p) => {
          const r = p.getBoundingClientRect();
          const panelCenter = r.left + r.width / 2;
          const dist = Math.abs(panelCenter - centerX);
          if (dist < bestDist) {
            bestDist = dist;
            best = p;
          }
        });
        if (best && !best.classList.contains('is-active')) {
          setActive(best.dataset.panel, { scroll: false });
        }
      }, 90);
    }, { passive: true });
  }

  /* ---------- Team: 지역 필터 ---------- */
  function initTeamFilter() {
    const filter = document.querySelector('.team-filter');
    const grid = document.querySelector('.team-grid');
    if (!filter || !grid) return;

    const tabs = Array.from(filter.querySelectorAll('[data-filter]'));
    const cards = Array.from(grid.querySelectorAll('.team-card'));
    if (!tabs.length || !cards.length) return;

    // 실제 데이터에 따라 카운트 재계산 (HTML 하드코딩된 수 덮어쓰기)
    const counts = { all: cards.length };
    cards.forEach((card) => {
      const c = (card.dataset.country || '').trim().toLowerCase();
      if (!c) return;
      counts[c] = (counts[c] || 0) + 1;
    });
    filter.querySelectorAll('[data-count-for]').forEach((el) => {
      const key = el.dataset.countFor;
      if (counts[key] != null) el.textContent = String(counts[key]);
    });

    function apply(target, tab) {
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
        t.setAttribute('tabindex', active ? '0' : '-1');
      });

      grid.setAttribute('data-active-filter', target);
      cards.forEach((card) => {
        const c = (card.dataset.country || '').toLowerCase();
        const show = target === 'all' || c === target;
        card.classList.toggle('is-hidden', !show);
        card.setAttribute('aria-hidden', String(!show));
      });

      // 애니메이션 재실행을 위한 ScrollTrigger refresh (GSAP 로드된 경우)
      if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
        window.ScrollTrigger.refresh();
      }
    }

    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => apply(tab.dataset.filter, tab));
      tab.addEventListener('keydown', (e) => {
        let nextIdx = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') nextIdx = 0;
        else if (e.key === 'End') nextIdx = tabs.length - 1;
        if (nextIdx !== null) {
          e.preventDefault();
          const next = tabs[nextIdx];
          apply(next.dataset.filter, next);
          next.focus();
        }
      });
    });
  }

  function boot() {
    initBizTabs();
    initTeamFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
