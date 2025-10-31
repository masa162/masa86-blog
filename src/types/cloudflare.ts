/**
 * Cloudflare environment bindings
 */

import { D1Database } from '@cloudflare/workers-types';

export interface CloudflareEnv {
  DB: D1Database;
  BASIC_AUTH_USER?: string;
  BASIC_AUTH_PASS?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB?: D1Database;
      BASIC_AUTH_USER?: string;
      BASIC_AUTH_PASS?: string;
    }
  }
}

