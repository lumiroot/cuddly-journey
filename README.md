# Brixkit

**Modular SvelteKit building blocks for rapid development**

Brixkit는 재사용 가능한 SvelteKit 기반 템플릿 프로젝트입니다. 모듈화된 아키텍처로 Core 기능과 Feature 패키지를 플러그인 형태로 제공하여 빠른 개발을 지원합니다.

## 프로젝트 구조

```
├── apps/
│   └── web/                    # SvelteKit 메인 애플리케이션
├── packages/
│   ├── core/                   # 핵심 기능 (인증, 권한, 사용자 관리)
│   ├── db-postgresql/          # PostgreSQL 데이터베이스 플러그인
│   ├── db-sqlite/              # SQLite 데이터베이스 플러그인
│   └── feature-board/          # 게시판 기능 패키지 (예제)
```

## 주요 기능

### Core Package (`@brixkit/core`)

사용자, 권한, 인증에 대한 공통 기능을 제공합니다.

- **Types**: User, Role, Permission, Session 등 핵심 타입 정의
- **Auth**: Lucia 기반 세션 인증 (Argon2id 해싱)
- **Permissions**: 역할 기반 권한 검사 (RBAC)
- **User Management**: 사용자 CRUD 및 관리 기능

### Database Plugins

데이터베이스를 선택적으로 사용할 수 있는 플러그인 방식:

- **PostgreSQL** (`@brixkit/db-postgresql`): Drizzle ORM + Lucia adapter
- **SQLite** (`@brixkit/db-sqlite`): Drizzle ORM + Lucia adapter

### Feature Packages

독립적인 기능 모듈을 패키지로 제공:

- **Board** (`@brixkit/feature-board`): 게시판 기능
  - 데이터 스키마
  - 비즈니스 로직 (Services)
  - UI 컴포넌트 (Svelte)
  - 권한 체크 통합

## 기술 스택

- **Framework**: SvelteKit 2.x
- **Authentication**: Lucia v3 (세션 기반 인증)
- **Password Hashing**: Argon2id (oslo)
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL, SQLite (선택 가능)
- **Styling**: TailwindCSS + shadcn-svelte
- **TypeScript**: 전체 프로젝트 타입 안전성
- **Monorepo**: pnpm workspace
- **Code Formatting**: Prettier

## 시작하기

### 사전 요구사항

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 설치

```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev
```

### 데이터베이스 설정

#### PostgreSQL 사용

```bash
# 환경 변수 설정
cp .env.example .env
# DATABASE_URL을 PostgreSQL 연결 문자열로 설정

# 마이그레이션 생성
cd packages/db-postgresql
pnpm db:generate

# 마이그레이션 실행
pnpm db:migrate
```

#### SQLite 사용

```bash
# 환경 변수 설정
cp .env.example .env
# DATABASE_URL을 SQLite 파일 경로로 설정 (예: ./data/db.sqlite)

# 마이그레이션 생성
cd packages/db-sqlite
pnpm db:generate

# 마이그레이션 실행
pnpm db:migrate
```

## 사용 방법

### Lucia 인증 설정

#### 1. DB 연결 및 Lucia 초기화

```typescript
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createLucia, PostgresUserRepository } from '@brixkit/db-postgresql';
import { AuthService } from '@brixkit/core';

// 데이터베이스 연결
const client = postgres(DATABASE_URL);
const db = drizzle(client);

// Lucia 인스턴스 생성
const lucia = createLucia(db, import.meta.env.PROD ? 'PROD' : 'DEV');

// UserRepository 생성
const userRepo = new PostgresUserRepository(db);

// AuthService 초기화
const authService = new AuthService(userRepo);
authService.initializeLucia(lucia);
```

#### 2. 사용자 등록

```typescript
// 비밀번호 해싱
const passwordHash = await authService.hashPassword('mypassword123');

// 사용자 생성
const user = await userRepo.create({
	email: 'user@example.com',
	username: 'johndoe',
	passwordHash,
	isActive: true,
	roles: []
});
```

#### 3. 로그인

```typescript
const result = await authService.authenticate({
	username: 'johndoe',
	password: 'mypassword123'
});

if (result.success) {
	console.log('로그인 성공!');
	console.log('사용자:', result.user);
	console.log('세션:', result.session);

	// 세션 쿠키 생성
	const sessionCookie = authService.createSessionCookie(result.session.id);
	// 응답 헤더에 Set-Cookie 추가
}
```

#### 4. 세션 검증

```typescript
const result = await authService.validateSession(sessionId);

if (result) {
	console.log('유효한 세션');
	console.log('사용자:', result.user);
	console.log('세션:', result.session);
}
```

#### 5. 로그아웃

```typescript
await authService.invalidateSession(sessionId);

// 빈 쿠키로 세션 제거
const blankCookie = authService.createBlankSessionCookie();
// 응답 헤더에 Set-Cookie 추가
```

### 권한 검사 예제

```typescript
import { BasicPermissionChecker } from '@brixkit/core';

const permissionChecker = new BasicPermissionChecker();

// 특정 권한 확인
if (permissionChecker.hasPermission(user, 'post', 'create')) {
	// 포스트 생성 허용
}

// 역할 확인
if (permissionChecker.hasRole(user, 'admin')) {
	// 관리자 기능 허용
}
```

### Feature 패키지 사용 예제 (게시판)

```typescript
import { BoardService, PostService } from '@brixkit/feature-board';
import { BasicPermissionChecker } from '@brixkit/core';

const permissionChecker = new BasicPermissionChecker();
const boardService = new BoardService(boardRepo, permissionChecker);
const postService = new PostService(postRepo, permissionChecker);

// 게시판 생성
const board = await boardService.createBoard(user, {
	title: 'General Discussion',
	description: 'General discussion board',
	createdBy: user.id,
	isActive: true
});

// 포스트 작성
const post = await postService.createPost(user, {
	boardId: board.id,
	title: 'Hello World',
	content: 'This is my first post',
	authorId: user.id,
	isPublished: true
});
```

### 새로운 Feature 패키지 만들기

1. `packages/` 디렉토리에 새 폴더 생성
2. 다음 구조로 구성:
   - `schema/`: 데이터 타입 정의
   - `services/`: 비즈니스 로직
   - `components/`: UI 컴포넌트 (Svelte)

3. `package.json` 예시:

```json
{
  "name": "@brixkit/feature-your-feature",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@brixkit/core": "workspace:*"
  }
}
```

## 플러그인 확장

### SSO 인증 플러그인 추가

Lucia는 다양한 OAuth provider를 지원합니다:

```typescript
import { GitHub } from 'arctic';
import { generateState } from 'oslo/oauth2';

const github = new GitHub(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// OAuth 로그인 URL 생성
const state = generateState();
const url = await github.createAuthorizationURL(state, {
	scopes: ['user:email']
});
```

### 새로운 데이터베이스 어댑터 추가

1. `packages/db-yourdatabase/` 생성
2. Drizzle 스키마 정의
3. `UserRepository` 인터페이스 구현
4. Lucia adapter 생성

## 스크립트

```bash
# 개발 서버
pnpm dev

# 전체 빌드
pnpm build

# 코드 포맷팅
pnpm format

# 포맷팅 검사
pnpm format:check
```

## 라이선스

MIT
