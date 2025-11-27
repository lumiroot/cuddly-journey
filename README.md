# SvelteKit Template Monorepo

재사용 가능한 SvelteKit 기반 템플릿 프로젝트입니다. 모듈화된 아키텍처로 Core 기능과 Feature 패키지를 플러그인 형태로 제공합니다.

## 프로젝트 구조

```
├── apps/
│   └── web/              # SvelteKit 메인 애플리케이션
├── packages/
│   ├── core/             # 핵심 기능 (인증, 권한, 사용자 관리)
│   ├── db-postgresql/    # PostgreSQL 데이터베이스 플러그인
│   ├── db-sqlite/        # SQLite 데이터베이스 플러그인
│   └── feature-board/    # 게시판 기능 패키지 (예제)
```

## 주요 기능

### Core Package (`packages/core`)

사용자, 권한, 인증에 대한 공통 기능을 제공합니다.

- **Types**: User, Role, Permission, Session 등 핵심 타입 정의
- **Auth**: ID/Password 기반 기본 인증 구현
- **Permissions**: 역할 기반 권한 검사 (RBAC)
- **User Management**: 사용자 CRUD 및 관리 기능

### Database Plugins

데이터베이스를 선택적으로 사용할 수 있는 플러그인 방식:

- **PostgreSQL** (`@db/postgresql`): Drizzle ORM을 사용한 PostgreSQL 어댑터
- **SQLite** (`@db/sqlite`): Drizzle ORM을 사용한 SQLite 어댑터

### Feature Packages

독립적인 기능 모듈을 패키지로 제공:

- **Board** (`@feature/board`): 게시판 기능
  - 데이터 스키마
  - 비즈니스 로직 (Services)
  - UI 컴포넌트 (Svelte)
  - 권한 체크 통합

## 기술 스택

- **Framework**: SvelteKit 2.x
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

### 새로운 Feature 패키지 만들기

1. `packages/` 디렉토리에 새 폴더 생성
2. 다음 구조로 구성:
   - `schema/`: 데이터 타입 정의
   - `services/`: 비즈니스 로직
   - `components/`: UI 컴포넌트 (Svelte)
   - `routes/`: 라우트 (선택사항)

3. `package.json` 예시:

```json
{
  "name": "@feature/your-feature",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@core/types": "workspace:*"
  }
}
```

### 인증 사용 예제

```typescript
import { BasicAuthProvider } from '@core/types';
import { PostgresUserRepository } from '@db/postgresql';

// 데이터베이스 연결
const db = drizzle(client);
const userRepo = new PostgresUserRepository(db);

// 인증 provider 생성
const authProvider = new BasicAuthProvider(userRepo);

// 로그인
const result = await authProvider.authenticate({
  username: 'user@example.com',
  password: 'password123'
});

if (result.success) {
  console.log('로그인 성공:', result.user);
  console.log('세션 ID:', result.session?.id);
}
```

### 권한 검사 예제

```typescript
import { BasicPermissionChecker } from '@core/types';

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
import { BoardService, PostService } from '@feature/board';
import { BasicPermissionChecker } from '@core/types';

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

## 플러그인 확장

### SSO 인증 플러그인 추가

새로운 SSO 인증 방식을 추가하려면:

1. `packages/auth-sso-provider/` 생성
2. `AuthProvider` 인터페이스 구현
3. 메인 앱에서 사용

```typescript
import type { AuthProvider } from '@core/types';

export class SSOProvider implements AuthProvider {
  async authenticate(credentials) {
    // SSO 인증 로직
  }

  async validateSession(sessionId) {
    // 세션 검증 로직
  }

  async destroySession(sessionId) {
    // 세션 삭제 로직
  }
}
```

### 새로운 데이터베이스 어댑터 추가

1. `packages/db-yourdatabase/` 생성
2. Drizzle 스키마 정의
3. `UserRepository` 인터페이스 구현

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
