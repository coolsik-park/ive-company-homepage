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

  function boot() {
    initBizTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
