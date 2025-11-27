/**
 * Authentication setup
 */

import { createLucia } from '@brixkit/db-sqlite';
import { AuthService } from '@brixkit/core';
import { SqliteUserRepository } from '@brixkit/db-sqlite';
import { db } from './db';

// Create Lucia instance
export const lucia = createLucia(db, process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV');

// Create user repository
export const userRepo = new SqliteUserRepository(db);

// Create auth service
export const authService = new AuthService(userRepo);
authService.initializeLucia(lucia);
