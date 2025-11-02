import { Hono } from 'hono';
import { basicAuth } from '../middleware/auth';
import * as postService from '../services/posts';
import { layout } from '../views/layout';
import { adminPage } from '../views/admin';
import type { Env } from '../types';

const admin = new Hono<{ Bindings: Env }>();

// 管理画面（認証必須）
admin.get('/', basicAuth, async (c) => {
  try {
    const posts = await postService.getAllPosts(c.env.DB);
    const content = adminPage(posts);
    return c.html(layout('管理画面', content));
  } catch (error) {
    console.error('[ERROR] GET /admin:', error);
    return c.html(layout('エラー', '<h2>記事の取得に失敗しました</h2>'), 500);
  }
});

export default admin;
