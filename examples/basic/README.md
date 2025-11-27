# Basic Example - ID/Password Authentication

기본 ID/Password 인증을 사용하는 Brixkit 예제입니다.

## 기능

- Lucia 세션 기반 인증
- Argon2id 비밀번호 해싱
- 역할 기반 권한 관리 (RBAC)
- TailwindCSS + shadcn UI

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
DATABASE_URL=./data/db.sqlite
NODE_ENV=development
```

### 3. 데이터베이스 마이그레이션

```bash
# SQLite 사용
cd ../../packages/db-sqlite
pnpm db:generate
pnpm db:migrate
cd ../../examples/basic
```

### 4. 개발 서버 시작

```bash
pnpm dev
```

## 프로젝트 구조

```
examples/basic/
├── src/
│   ├── lib/
│   │   ├── components/ui/  # shadcn UI 컴포넌트
│   │   └── utils/          # 유틸리티 함수
│   ├── routes/
│   │   ├── +layout.svelte  # 공통 레이아웃
│   │   └── +page.svelte    # 메인 페이지
│   ├── app.css             # TailwindCSS 스타일
│   └── app.html            # HTML 템플릿
├── package.json
└── README.md
```

## 사용된 Brixkit 패키지

- `@brixkit/core` - 인증, 권한, 사용자 관리
- `@brixkit/feature-board` - 게시판 기능 (예제)
- `@brixkit/db-sqlite` - SQLite 어댑터 (또는 PostgreSQL)
