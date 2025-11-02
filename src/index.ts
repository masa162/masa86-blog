import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import api from './routes/api';
import admin from './routes/admin';
import publicRoutes from './routes/public';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// ミドルウェア
app.use('/*', logger());
app.use('/*', cors());

// ルート統合
app.route('/api', api);
app.route('/admin', admin);
app.route('/', publicRoutes);

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'masa86-blog'
  });
});

export default app;
