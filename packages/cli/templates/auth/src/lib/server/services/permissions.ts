/**
 * Permission checking utilities
 * Role-based access control (RBAC)
 */

import type { User, PermissionChecker } from '../types/auth.ts';

/**
 * Basic permission checker implementation
 */
export class BasicPermissionChecker implements PermissionChecker {
	/**
	 * Check if user has a specific permission
	 */
	hasPermission(user: User, resource: string, action: string): boolean {
		// Check all roles
		for (const role of user.roles) {
			// Check all permissions in the role
			for (const permission of role.permissions) {
				if (permission.resource === resource && permission.action === action) {
					return true;
				}

				// Support wildcard permissions
				if (permission.resource === '*' || permission.action === '*') {
					if (permission.resource === '*' || permission.resource === resource) {
						if (permission.action === '*' || permission.action === action) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	/**
	 * Check if user has a specific role
	 */
	hasRole(user: User, roleName: string): boolean {
		return user.roles.some((role) => role.name === roleName);
	}

	/**
	 * Check if user has any of the specified roles
	 */
	hasAnyRole(user: User, roleNames: string[]): boolean {
		return user.roles.some((role) => roleNames.includes(role.name));
	}

	/**
	 * Check if user has all of the specified roles
	 */
	hasAllRoles(user: User, roleNames: string[]): boolean {
		return roleNames.every((roleName) => this.hasRole(user, roleName));
	}

	/**
	 * Get all permissions for a user
	 */
	getAllPermissions(user: User): Array<{ resource: string; action: string }> {
		const permissions: Array<{ resource: string; action: string }> = [];
		const seen = new Set<string>();

		for (const role of user.roles) {
			for (const permission of role.permissions) {
				const key = `${permission.resource}:${permission.action}`;
				if (!seen.has(key)) {
					seen.add(key);
					permissions.push({
						resource: permission.resource,
						action: permission.action
					});
				}
			}
		}

		return permissions;
	}
}
