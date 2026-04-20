/* ========================================================================
   Career — careers.json 을 읽어 #job-list 에 렌더
   - 다국어: 현재 body[data-lang] 에 따라 텍스트 선택
   - 언어 전환 시 재렌더 (langchange 이벤트 구독)
   - 비어있으면 문의 안내 표시
   - 렌더 완료 후 'career:rendered' CustomEvent 발행 (animations.js 구독)
   ======================================================================== */
(function () {
  'use strict';

  const DATA_URL = 'data/careers.json';
  const CONTACT = 'contact@ivecompany.kr';

  const STRINGS = {
    ko: {
      deadlineLabel: '마감',
      deptLabel: '부서',
      typeLabel: '형태',
      deadlineUnit: '까지',
      empty: '현재 모집중인 포지션이 없습니다.',
      emptyBody: '관심 직군은 언제든 문의해주세요.',
      contact: 'Contact',
      apply: '지원',
    },
    en: {
      deadlineLabel: 'Deadline',
      deptLabel: 'Team',
      typeLabel: 'Type',
      deadlineUnit: '',
      empty: 'No open positions at the moment.',
      emptyBody: 'Feel free to reach out anytime.',
      contact: 'Contact',
      apply: 'Apply',
    },
  };

  let jobsCache = null;

  function currentLang() {
    return document.body.getAttribute('data-lang') === 'en' ? 'en' : 'ko';
  }

  function pick(field, lang) {
    if (field == null) return '';
    if (typeof field === 'string') return field;
    return field[lang] ?? field.ko ?? '';
  }

  function daysLeft(deadline) {
    const d = new Date(deadline + 'T23:59:59');
    if (Number.isNaN(d.getTime())) return null;
    const diff = d.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
  }

  function renderEmpty(list, lang) {
    const t = STRINGS[lang];
    list.innerHTML = `
      <div class="job-empty">
        <p class="job-empty-head">${escapeHTML(t.empty)}</p>
        <p class="job-empty-sub">${escapeHTML(t.emptyBody)}</p>
        <a class="contact-pill" href="mailto:${CONTACT}" aria-label="Contact IVE Company via email">
          <span>${escapeHTML(t.contact)}</span>
          <span class="contact-pill-arrow" aria-hidden="true">→</span>
        </a>
      </div>
    `;
  }

  function renderJobs(list, jobs, lang) {
    const t = STRINGS[lang];
    list.innerHTML = jobs.map((job) => {
      const title = escapeHTML(pick(job.title, lang));
      const dept  = escapeHTML(pick(job.dept, lang));
      const type  = escapeHTML(pick(job.type, lang));
      const deadline = escapeHTML(job.deadline || '');
      const remain = daysLeft(job.deadline);
      const urgent = remain !== null && remain <= 7 ? 'urgent' : '';
      const link = job.link || `mailto:${CONTACT}`;
      return `
        <a class="job-item" href="${escapeHTML(link)}" aria-label="${title} — ${t.apply}">
          <span class="job-title">${title}</span>
          <span class="job-meta"><span class="meta-label">${escapeHTML(t.deptLabel)}</span>${dept}</span>
          <span class="job-meta"><span class="meta-label">${escapeHTML(t.typeLabel)}</span>${type}</span>
          <span class="job-meta job-deadline ${urgent}"><span class="meta-label">${escapeHTML(t.deadlineLabel)}</span>${deadline}${escapeHTML(t.deadlineUnit)}</span>
          <span class="job-arrow" aria-hidden="true">→</span>
        </a>
      `;
    }).join('');
  }

  function render() {
    const list = document.getElementById('job-list');
    if (!list) return;
    const lang = currentLang();

    if (!jobsCache || !jobsCache.length) {
      renderEmpty(list, lang);
    } else {
      renderJobs(list, jobsCache, lang);
    }
    document.dispatchEvent(new CustomEvent('career:rendered'));
  }

  async function loadJobs() {
    const list = document.getElementById('job-list');
    if (!list) return;

    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      jobsCache = Array.isArray(data.jobs) ? data.jobs : [];
    } catch (err) {
      // file:// 에서 fetch 실패 시에도 빈 상태로 자연스럽게 표시
      console.warn('[career] careers.json 로드 실패:', err);
      jobsCache = [];
    }
    render();
  }

  function boot() {
    loadJobs();
    document.addEventListener('langchange', () => {
      if (jobsCache !== null) render();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
