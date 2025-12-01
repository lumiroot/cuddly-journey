# Auth Template

Authentication system with users, sessions, roles, and permissions.

## What's Included

### Schema
- **Users** - Email, username, password hash
- **Sessions** - Session management with expiration and inactivity timeout
- **Roles** - Role definitions
- **Permissions** - Resource-action permissions
- **User Roles** - Many-to-many relationship
- **Role Permissions** - Many-to-many relationship

### Services
- **AuthService** - Login, session creation, validation
- **SessionManager** - Token-based session management
- **UserService** - User CRUD operations
- **PermissionChecker** - Role-based access control (RBAC)

### Types
Complete TypeScript types for all entities and interfaces

## Usage

### Setup

After adding this component, you'll need to:

1. **Generate and run migrations**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

2. **Create the database and repository implementations**
   (This is done automatically if you use `brixkit add db-sqlite`)

### Creating Users

```typescript
import { UserService } from '$lib/server/services/user';
import { drizzleUserRepo } from '$lib/server/db'; // Your repo implementation

const userService = new UserService(drizzleUserRepo);

const user = await userService.createUser({
	email: 'user@example.com',
	username: 'johndoe',
	password: 'securepassword123'
});
```

### Authentication

```typescript
import { AuthService } from '$lib/server/services/auth';
import { drizzleUserRepo, drizzleSessionRepo } from '$lib/server/db';

const authService = new AuthService(drizzleUserRepo, drizzleSessionRepo, {
	expiresIn: 1000 * 60 * 60 * 24 * 30, // 30 days
	cookieName: 'auth_session'
});

// Login
const result = await authService.authenticate({
	username: 'johndoe',
	password: 'securepassword123'
});

if (result.success) {
	const { user, session, token } = result;
	// Set cookie with token
}
```

### Session Validation (in hooks.server.ts)

```typescript
import type { Handle } from '@sveltejs/kit';
import { authService } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const cookieName = authService.getSessionCookieName();
	const token = event.cookies.get(cookieName);

	if (!token) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const result = await authService.validateSessionToken(token);

	if (!result) {
		event.cookies.delete(cookieName, { path: '/' });
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	event.locals.user = result.user;
	event.locals.session = result.session;

	return resolve(event);
};
```

### Permission Checking

```typescript
import { BasicPermissionChecker } from '$lib/server/services/permissions';

const permissionChecker = new BasicPermissionChecker();

// Check permission
if (permissionChecker.hasPermission(user, 'post', 'create')) {
	// User can create posts
}

// Check role
if (permissionChecker.hasRole(user, 'admin')) {
	// User is admin
}
```

## Configuration

The auth system supports the following configuration options:

```typescript
{
	expiresIn: number;           // Session absolute timeout (default: 30 days)
	inactivityTimeout: number;   // Inactivity timeout (default: 2 hours)
	cookieName: string;          // Cookie name (default: 'auth_session')
	cookie: {
		secure: boolean;         // HTTPS only (default: true)
		httpOnly: boolean;       // HttpOnly flag (default: true)
		sameSite: string;        // SameSite policy (default: 'lax')
		path: string;            // Cookie path (default: '/')
		domain?: string;         // Cookie domain
	}
}
```

## Security Features

- **Argon2id** password hashing
- **Token-based sessions** with SHA-256
- **Absolute expiration** (default 30 days)
- **Inactivity timeout** (default 2 hours)
- **Automatic session refresh** when approaching expiration
- **HttpOnly cookies** by default
- **RBAC** with wildcard permission support
