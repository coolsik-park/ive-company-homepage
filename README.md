# IVE Company — Official Homepage

순수 HTML / CSS / Vanilla JavaScript 로 구축된 IVE Company 공식 홈페이지.

## Stack
- HTML5 / CSS3 / Vanilla JavaScript (프레임워크 없음)
- GSAP 3.12 + ScrollTrigger (CDN)
- Google Fonts (Inter, Pretendard)

## Structure
```
src/
├── index.html            # 단일 페이지 (모든 섹션 포함)
├── css/                  # 섹션별 스타일 (style, nav, hero, about, team, career, footer)
├── js/                   # 모듈별 스크립트 (lang, nav, tabs, career, animations, main)
├── data/
│   └── careers.json      # 채용공고 데이터 (직접 수정)
└── assets/
    ├── images/           # 로고 / 히어로 폴백
    ├── videos/           # 히어로 동영상 (MP4)
    └── fonts/            # 로컬 폰트 (선택)
```

## 로컬 실행
`fetch('data/careers.json')` 때문에 `file://` 로는 동작하지 않습니다. 로컬 서버 필요.

```bash
# Python
python3 -m http.server 8000

# Node (http-server)
npx http-server -p 8000
```

브라우저에서 http://localhost:8000 열기.

## 배포
GitHub Pages / Netlify / 웹호스팅 (정적 파일) 중 택1.

## 채용공고 수정
`data/careers.json` 파일만 수정하면 즉시 반영됩니다.

## 언어
국문(`ko`) / 영문(`en`) — 우측 상단 언어 토글. 설정은 `localStorage.ive.lang` 에 저장.

---
© 2026 IVE Company LTD. ALL RIGHTS RESERVED
