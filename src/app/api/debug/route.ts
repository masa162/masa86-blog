/**
 * Debug API - Check D1 binding and environment
 */

export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function GET() {
  const debug: any = {
    timestamp: new Date().toISOString(),
    env_DB_type: typeof process.env.DB,
    env_DB_exists: !!process.env.DB,
    env_keys: Object.keys(process.env).filter(k => !k.startsWith('npm_')),
    runtime: 'edge',
  };

  try {
    // Try to access DB
    if (process.env.DB) {
      const db = process.env.DB as any;
      const result = await db.prepare('SELECT 1 as test').first();
      debug.db_test = result;
      debug.db_accessible = true;
    } else {
      debug.db_accessible = false;
      debug.error = 'process.env.DB is undefined';
    }
  } catch (error) {
    debug.db_accessible = false;
    debug.error = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(debug, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

