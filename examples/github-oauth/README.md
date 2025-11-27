# GitHub OAuth Example

GitHub OAuth 인증을 사용하는 Brixkit 예제입니다.

## 기능

- GitHub OAuth 2.0 인증
- Lucia 세션 기반 인증
- 역할 기반 권한 관리 (RBAC)
- TailwindCSS + shadcn UI

## 시작하기

### 1. GitHub OAuth App 생성

1. GitHub에서 [New OAuth App](https://github.com/settings/applications/new) 생성
2. **Application name**: 원하는 이름
3. **Homepage URL**: `http://localhost:5173`
4. **Authorization callback URL**: `http://localhost:5173/auth/github/callback`
5. Client ID와 Client Secret 복사

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
DATABASE_URL=./data/db.sqlite
NODE_ENV=development

# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:5173/auth/github/callback
```

### 3. 의존성 설치

```bash
pnpm install
```

### 4. 데이터베이스 마이그레이션

```bash
# SQLite 사용
cd ../../packages/db-sqlite
pnpm db:generate
pnpm db:migrate
cd ../../examples/github-oauth
```

### 5. 개발 서버 시작

```bash
pnpm dev
```

## 인증 흐름

1. 사용자가 "Login with GitHub" 버튼 클릭
2. GitHub 로그인 페이지로 리다이렉트
3. 사용자가 GitHub에서 권한 승인
4. GitHub가 콜백 URL로 리다이렉트
5. 서버에서 GitHub 사용자 정보 가져오기
6. 사용자 찾기 또는 생성
7. Lucia 세션 생성
8. 쿠키 설정 및 로그인 완료

## 라우트 구조

```
src/routes/
├── +page.svelte                    # 메인 페이지
├── auth/
│   └── github/
│       ├── +server.ts              # OAuth 시작
│       └── callback/
│           └── +server.ts          # OAuth 콜백
└── dashboard/
    └── +page.svelte                # 로그인 후 대시보드
```

## 사용된 Brixkit 패키지

- `@brixkit/core` - 인증, 권한, 사용자 관리
- `@brixkit/auth-github` - GitHub OAuth 플러그인
- `@brixkit/feature-board` - 게시판 기능 (예제)
- `@brixkit/db-sqlite` - SQLite 어댑터 (또는 PostgreSQL)
