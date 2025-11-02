import { Context, Next } from 'hono';
import type { Env } from '../types';

export async function basicAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return c.json({ error: 'Unauthorized' }, 401, {
      'WWW-Authenticate': 'Basic realm="Admin Area"'
    });
  }

  const base64Credentials = authHeader.substring(6);
  const credentials = atob(base64Credentials);
  const [username, password] = credentials.split(':');

  // 環境変数から認証情報を取得
  const validUsername = c.env.ADMIN_USERNAME;
  const validPassword = c.env.ADMIN_PASSWORD;

  if (username !== validUsername || password !== validPassword) {
    return c.json({ error: 'Invalid credentials' }, 401, {
      'WWW-Authenticate': 'Basic realm="Admin Area"'
    });
  }

  await next();
}
