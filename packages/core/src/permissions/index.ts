/**
 * Permission and authorization checking
 */

import type { User, PermissionChecker } from '../types/index.ts';

export class BasicPermissionChecker implements PermissionChecker {
	hasPermission(user: User, resource: string, action: string): boolean {
		if (!user.isActive) {
			return false;
		}

		for (const role of user.roles) {
			const hasPermission = role.permissions.some(
				(perm) => perm.resource === resource && perm.action === action
			);

			if (hasPermission) {
				return true;
			}

			// Check for wildcard permissions
			const hasWildcard = role.permissions.some(
				(perm) =>
					(perm.resource === '*' && perm.action === action) ||
					(perm.resource === resource && perm.action === '*') ||
					(perm.resource === '*' && perm.action === '*')
			);

			if (hasWildcard) {
				return true;
			}
		}

		return false;
	}

	hasRole(user: User, roleName: string): boolean {
		if (!user.isActive) {
			return false;
		}

		return user.roles.some((role) => role.name === roleName);
	}

	hasAnyRole(user: User, roleNames: string[]): boolean {
		if (!user.isActive) {
			return false;
		}

		return roleNames.some((roleName) => this.hasRole(user, roleName));
	}

	hasAllRoles(user: User, roleNames: string[]): boolean {
		if (!user.isActive) {
			return false;
		}

		return roleNames.every((roleName) => this.hasRole(user, roleName));
	}
}

/**
 * Decorator for permission checks (can be used with methods)
 */
export function requiresPermission(resource: string, action: string) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (this: any, user: User, ...args: any[]) {
			const checker = new BasicPermissionChecker();

			if (!checker.hasPermission(user, resource, action)) {
				throw new Error(`Permission denied: ${action} on ${resource}`);
			}

			return originalMethod.apply(this, [user, ...args]);
		};

		return descriptor;
	};
}

/**
 * Decorator for role checks
 */
export function requiresRole(roleName: string) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (this: any, user: User, ...args: any[]) {
			const checker = new BasicPermissionChecker();

			if (!checker.hasRole(user, roleName)) {
				throw new Error(`Role required: ${roleName}`);
			}

			return originalMethod.apply(this, [user, ...args]);
		};

		return descriptor;
	};
}
