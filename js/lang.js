/* ========================================================================
   Language Switcher (KO / EN)
   - data-ko / data-en 속성 기반 텍스트 전환
   - data-ko-placeholder / data-en-placeholder 로 input placeholder 전환
   - body[data-lang] 속성으로 CSS도 선택자 연동
   - localStorage 에 마지막 선택 저장
   ======================================================================== */
(function () {
  'use strict';

  const STORAGE_KEY = 'ive.lang';
  const DEFAULT_LANG = 'ko';
  const SUPPORTED = ['ko', 'en'];

  function applyLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;

    document.documentElement.setAttribute('lang', lang);
    document.body.setAttribute('data-lang', lang);

    // 텍스트 치환 (innerHTML — <br> 허용, 단 데이터는 모두 신뢰 가능한 정적 속성)
    document.querySelectorAll('[data-ko], [data-en]').forEach((el) => {
      const value = el.dataset[lang];
      if (typeof value === 'string') el.innerHTML = value;
    });

    // placeholder 치환
    document.querySelectorAll('[data-ko-placeholder], [data-en-placeholder]').forEach((el) => {
      const value = el.dataset[`${lang}Placeholder`];
      if (typeof value === 'string') el.setAttribute('placeholder', value);
    });

    // meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      const value = metaDesc.dataset[lang];
      if (typeof value === 'string') metaDesc.setAttribute('content', value);
    }

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) { /* ignore */ }

    // 다른 모듈에 알림
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }

  function initLangToggle() {
    const btn = document.getElementById('lang-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const current = document.body.getAttribute('data-lang') || DEFAULT_LANG;
      applyLang(current === 'ko' ? 'en' : 'ko');
    });
  }

  function initialLang() {
    let stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (_) { /* ignore */ }
    if (stored && SUPPORTED.includes(stored)) return stored;

    const htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (htmlLang.startsWith('en')) return 'en';
    if (htmlLang.startsWith('ko')) return 'ko';

    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('en')) return 'en';
    return DEFAULT_LANG;
  }

  function boot() {
    applyLang(initialLang());
    initLangToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // 전역 노출 (다른 스크립트가 수동 호출할 때)
  window.IVE = window.IVE || {};
  window.IVE.setLang = applyLang;
})();
