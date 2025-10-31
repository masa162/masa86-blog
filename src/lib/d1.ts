/**
 * Cloudflare D1 Database Client
 * 
 * This module provides access to the Cloudflare D1 database.
 * In production (Cloudflare Pages), bindings are available via process.env.
 * In development, you need to use wrangler for local bindings.
 */

import { D1Database } from '@cloudflare/workers-types';

/**
 * Get the D1 database instance from the current request context
 * This should be called within API routes or server components
 * 
 * In Cloudflare Pages, bindings are automatically set in process.env at runtime
 */
export function getD1(): D1Database {
  // Cloudflare Pages automatically sets process.env.DB at runtime
  if (process.env.DB) {
    return process.env.DB as unknown as D1Database;
  }

  // Build time: return mock to prevent build errors
  if (typeof window === 'undefined') {
    return createMockD1();
  }

  throw new Error('D1 Database binding not configured');
}

/**
 * Create a mock D1 database for build time
 */
function createMockD1(): D1Database {
  return {
    prepare: () => ({
      bind: () => ({
        all: async () => ({ results: [], success: true, meta: {} }),
        first: async () => null,
        run: async () => ({ success: true, meta: { duration: 0, last_row_id: 0, changes: 0, served_by: '', internal_stats: null } }),
        raw: async () => [],
      }),
      all: async () => ({ results: [], success: true, meta: {} }),
      first: async () => null,
      run: async () => ({ success: true, meta: { duration: 0, last_row_id: 0, changes: 0, served_by: '', internal_stats: null } }),
      raw: async () => [],
    }),
    dump: async () => new ArrayBuffer(0),
    batch: async () => [],
    exec: async () => ({ count: 0, duration: 0 }),
  } as any;
}

/**
 * Utility function to execute a prepared statement
 * Includes error handling and logging
 */
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<{ results: T[]; success: boolean; error?: string }> {
  try {
    const db = getD1();
    const stmt = db.prepare(query);
    
    if (params.length > 0) {
      const { results } = await stmt.bind(...params).all<T>();
      return { results: results || [], success: true };
    } else {
      const { results } = await stmt.all<T>();
      return { results: results || [], success: true };
    }
  } catch (error) {
    console.error('Database query error:', error);
    return {
      results: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

