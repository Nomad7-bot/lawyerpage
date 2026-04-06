# Project Rules — 법률사무소 홈페이지

> 본 문서는 PRD v1.0 (2026-04-05) 기반 프로젝트 규칙입니다.
> 모든 작업은 이 문서의 규칙을 기준으로 수행합니다.

---

## 1. 프로젝트 개요

- **목적**: 법률사무소 신뢰도 전달 + 온라인 상담예약 + 로컬 SEO(GEO/AEO) 최적화 홈페이지
- **핵심 KPI**: 상담 예약 전환율, 오가닉 트래픽, 지역 검색 노출(Google Business), AI 검색엔진(ChatGPT/Perplexity) 인용
- **타깃 사용자**: 법률 자문이 필요한 일반인·기업 담당자 (주로 한국어, 모바일 비중 70% 추정)
- **주요 페이지**: 메인, 소개, 업무분야, 변호사, 인사이트, 예약, 예약확인, 문의, 관리자(CMS)

---

## 2. 기술 스택 (고정 — 변경 금지)

| 영역 | 스택 |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3.x (config 기반) |
| Backend/DB | Supabase (Postgres + Auth + Storage) |
| Client State | Zustand |
| Server State | @tanstack/react-query |
| Validation | Zod |
| Date | date-fns |
| Icons | lucide-react |
| 폰트 | Pretendard (CDN) |

**금지 사항**:
- Tailwind v4 업그레이드 금지 (`tailwind.config.ts` 기반 유지)
- Next.js 16+ 업그레이드 금지 (PRD 기준 15 유지)
- 다른 UI 라이브러리(MUI, Chakra 등) 도입 금지 — Tailwind + 자체 컴포넌트로 구현
- CSS-in-JS (styled-components, emotion 등) 사용 금지

---

## 3. 폴더 구조 (PRD §9 준수)

```
src/
  app/
    (public)/              # Header/Footer 공통 레이아웃이 적용되는 공개 페이지
    admin/                 # 관리자 CMS (별도 레이아웃, Phase 3에서 auth guard)
    api/                   # Route Handlers
    layout.tsx             # 루트 레이아웃 (HTML/metadata/폰트)
    globals.css
  components/
    ui/                    # 재사용 원자 컴포넌트 (Button, Input, Card 등)
    layout/                # Header, Footer, Breadcrumb, MobileNav
    sections/              # 페이지별 섹션 컴포넌트
    reservation/           # 예약 플로우 전용 컴포넌트
    admin/                 # 관리자 전용 컴포넌트
  lib/
    supabase/              # client.ts (브라우저), server.ts (서버)
    utils/                 # cn.ts 등 유틸
    schemas/               # Zod 스키마
  hooks/                   # 커스텀 훅
  types/                   # 공통 타입
  constants/               # site.ts (NAP), 상수
```

**규칙**:
- Route Group `(public)` 내부 페이지는 Header/Footer 자동 포함
- `admin/` 하위 페이지는 독립 레이아웃 — 공개 레이아웃과 분리
- 동적 라우트는 `params: Promise<{ slug: string }>` (Next.js 15 async params 패턴)
- 새 페이지 추가 시 반드시 PRD §4 사이트맵과 대조

---

## 4. 디자인 토큰 (Tailwind — 하드코딩 금지)

모든 스타일은 `tailwind.config.ts` 토큰만 사용한다. 색/폰트/크기 하드코딩(`#ffffff`, `text-[18px]` 등) 금지.

### 색상
| Token | Hex | 용도 |
|---|---|---|
| `primary` | #1B2A4A | 메인 브랜드, 헤더, CTA |
| `primary-light` | #2E5C8A | 호버, 보조 |
| `accent` | #C4A265 | 포인트, 강조 |
| `accent-light` | #D4C5A0 | 보조 포인트 |
| `text-main` | #2D2D2D | 본문 |
| `text-sub` | #666666 | 보조 텍스트 |
| `bg-light` | #F5F5F5 | 섹션 배경 |
| `bg-white` | #FFFFFF | 기본 배경 |
| `success` / `error` / `warning` | 상태 색상 |

### 타이포그래피
- `text-h1` (40px/1.2, 700) — 페이지 타이틀
- `text-h2` (32px/1.3, 700) — 섹션 제목
- `text-h3` (24px/1.4, 600) — 서브 섹션
- `text-h4` (20px/1.4, 600) — 카드 제목
- `text-body` (16px/1.6, 400) — 본문
- `text-caption` (14px/1.5, 400) — 캡션/메타

### 레이아웃
- 최대 컨텐츠 너비: `max-w-content` (1280px)
- 컨테이너 유틸: `.container-content` (globals.css에 정의됨)
- 브레이크포인트: `sm:768px`, `md:1024px`, `lg:1280px`
- 모바일 우선 — 기본 스타일은 모바일, `sm:`/`md:`/`lg:` 로 확장

### 간격 / 기타
- 8px 그리드 시스템 (Tailwind 기본 spacing + 확장 `18`(72px), `22`(88px))
- Border radius: `rounded-none`(0), `rounded-card`(8px) — 카드/버튼은 기본 `rounded-card`
- 그림자는 Tailwind 기본 유지 (필요시 추후 토큰 추가)

---

## 5. Supabase 규칙

### 클라이언트 분리
- **브라우저용**: `src/lib/supabase/client.ts` — `createBrowserClient` from `@supabase/ssr`
- **서버용**: `src/lib/supabase/server.ts` — `createServerClient` + Next.js `cookies()` 연동
- Server Component / Route Handler / Server Action 에서는 **반드시 server.ts** 사용
- 'use client' 컴포넌트에서는 **반드시 client.ts** 사용
- 두 파일을 혼용하거나 한 쪽에서 다른 쪽을 import 하지 않는다

### 보안
- Service Role Key는 절대 클라이언트로 노출 금지 (서버에서만 사용, 필요시 별도 env 추가)
- 모든 테이블은 RLS (Row Level Security) 활성화
- 사용자 입력은 항상 Zod 로 검증 후 DB 접근

---

## 6. 코딩 컨벤션

### 언어
- 모든 진행 과정, 설명, 답변은 **한국어**로 출력한다
- UI 텍스트, 에러 메시지, 주석: **한국어** 우선 (사용자는 한국인)
- 코드(변수명/함수명/파일명): 영어 camelCase/PascalCase
- 주석은 "왜"를 설명 — "무엇"은 코드가 말하도록
- 전문 용어는 영어 그대로 쓰되, 처음 등장할 때 괄호로 설명을 붙인다
   예: `Server Action (서버에서 실행되는 함수)`

### 네이밍
- 컴포넌트 파일: `PascalCase.tsx` (예: `ReservationForm.tsx`)
- 유틸/훅/스키마: `camelCase.ts` (예: `formatDate.ts`, `useReservation.ts`)
- 훅: `use` 접두사 필수
- 타입: `PascalCase`, 인터페이스 `I` 접두사 붙이지 않음

### import 순서
1. React / Next.js
2. 외부 라이브러리
3. `@/components`, `@/lib`, `@/hooks`, `@/types`, `@/constants` (절대경로)
4. 상대경로
5. 타입 import 는 `import type` 사용

### 컴포넌트
- 기본은 **Server Component** — 인터랙션/브라우저 API 필요할 때만 `'use client'`
- props 타입은 컴포넌트 바로 위에 `type XxxProps` 로 정의
- 이벤트 핸들러는 `handleXxx`, prop 은 `onXxx`
- 조건부 className 은 `cn()` 헬퍼 (`@/lib/utils/cn`) 사용

---

## 7. 예약/폼 규칙 (PRD §6 예약 플로우)

- **필수 입력값**: 성함, 연락처, 상담분야, 희망일시, 개인정보 동의
- 모든 폼 스키마는 `src/lib/schemas/` 에 Zod 스키마로 정의 후 재사용
- 개인정보 동의 체크박스는 **보내기 전 필수 검증**
- 예약번호 체계: 사용자가 식별 가능하도록 간결하게 (예: `YYMMDD-XXXX`)
- 예약 상태: `pending | confirmed | cancelled | completed` — `src/types/index.ts` 의 `ReservationStatus` 유니온 사용

---

## 8. SEO / AEO / GEO 규칙 (PRD §7 핵심)

이 프로젝트의 **핵심 차별화 요소**. 모든 페이지 작업 시 반드시 고려.

### 공통
- 모든 페이지는 `generateMetadata` (동적) 또는 `metadata` (정적) 필수 export
- title/description/openGraph/canonical 누락 금지
- 이미지는 `next/image` 사용 + `alt` 필수

### AEO (Answer Engine Optimization)
- 콘텐츠는 **질문-답변 구조** 선호 (FAQPage, HowTo schema)
- 첫 문단에 핵심 답변 요약 (AI 인용 대비)
- JSON-LD 구조화 데이터: LegalService, Person(변호사), Article, FAQPage, BreadcrumbList

### GEO (지역 SEO)
- **NAP 일관성 절대 원칙**: 사이트 전체에서 상호/주소/전화번호 완전 동일 — `src/constants/site.ts` 의 `SITE` 객체만 참조, 하드코딩 금지
- footer, 연락처 페이지, 구조화 데이터 간 NAP 불일치 발생 시 즉시 수정
- LocalBusiness schema 필수

### 성능 (Core Web Vitals)
- LCP < 2.5s, CLS < 0.1, INP < 200ms 목표
- 이미지 최적화(`next/image`), 폰트 preconnect, 불필요한 client 컴포넌트 최소화

---

## 9. 접근성 (PRD §8.6)

- 색상 대비: WCAG AA (본문 4.5:1, 큰 텍스트 3:1)
- 모든 인터랙티브 요소: 키보드 접근 가능 + 포커스 링 표시
- `<img>` alt 필수, 장식 이미지는 `alt=""`
- form label/input 연결 필수 (`htmlFor` 또는 `aria-label`)
- 페이지 구조: 시맨틱 태그(`<main>`, `<section>`, `<nav>`, `<article>`) 사용

---

## 10. 반응형 (PRD §5.1 브레이크포인트)

- `< 768px`: 모바일 (1컬럼, 햄버거 메뉴)
- `768px–1023px` (`sm:`): 태블릿 (2컬럼)
- `1024px–1279px` (`md:`): 데스크톱 (풀 GNB)
- `≥ 1280px` (`lg:`): 와이드 (max-w-content 적용)

**모바일 우선 작성**: 기본 클래스는 모바일 → `sm:` → `md:` → `lg:` 순으로 확장.

---

## 11. 개발 명령어

```bash
npm run dev         # 개발 서버 (http://localhost:3000)
npm run build       # 프로덕션 빌드
npm run start       # 프로덕션 서버
npm run type-check  # tsc --noEmit
```

**작업 완료 전 체크**:
1. `npm run type-check` — 타입 에러 0
2. `npm run build` — 빌드 성공
3. 수정한 페이지는 개발 서버에서 실제 확인

---

## 12. 환경변수

`.env.local` 에 정의, `.env.example` 에 템플릿 유지:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

**주의**: `NEXT_PUBLIC_` 접두사가 있으면 클라이언트 번들에 포함 → 민감 정보는 절대 이 접두사 사용 금지. 서버 전용 키는 접두사 없이 정의.

---

## 13. Phase 진행 상태

- **Phase 1 (초기 세팅)**: ✅ 완료 — 스캐폴딩, 디자인 토큰, 라우팅, 플레이스홀더
- **Phase 2 (핵심 기능)**: 예약 시스템, 이메일 알림, 콘텐츠 게시판
- **Phase 3 (관리자 CMS)**: 인증, 예약 관리, 콘텐츠 관리
- **Phase 4 (SEO/AEO/GEO)**: 메타태그, 구조화 데이터, sitemap, robots
- **Phase 5 (QA/배포)**: Lighthouse 측정, 접근성 감사, 배포

**현재 Phase 외 작업 금지** — 사용자 명시적 요청 시에만 다음 Phase 진입.

---

## 14. 작업 흐름 규칙

- 새 기능은 **먼저 PRD 어느 섹션에 해당하는지 확인** 후 착수
- 컴포넌트 생성 전 `components/` 하위에 재사용 가능한 기존 컴포넌트가 있는지 확인
- 새 의존성 추가는 사용자 승인 필수 — 기존 스택으로 해결 시도 먼저
- 파일 생성보다 **기존 파일 수정 우선**
- 문서(.md) 파일은 사용자가 명시적으로 요청할 때만 생성

---

## 15. 에러 발생 시 설명 규칙 (Error Reporting Format)

코드에서 에러가 발생했을 경우, 반드시 아래 형식으로 설명한다.

```text
형식: [에러종류]: 한 줄 요약 (한국어)

🚨 에러 발생

[ 어떤 에러인가요? ]
에러 이름과 메시지를 한 줄로 요약

[ 왜 발생했나요? ]
초보자도 이해할 수 있도록 에러의 원인을 쉬운 말로 설명
기술적인 용어는 비유나 예시를 들어 풀어서 설명

[ 어떻게 발생했나요? (단계별 과정) ]
1. 어떤 코드가
2. 어떤 상황에서
3. 왜 문제를 일으켰는지
순서대로 설명

[ 해결 방법 ]
수정할 코드와 함께 해결 방법 제시
```
