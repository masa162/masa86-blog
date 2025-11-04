import { Hono } from 'hono';
import { basicAuth } from '../middleware/auth';
import * as postService from '../services/posts';
import { layout } from '../views/layout';
import { adminPage } from '../views/admin';
import { adminNotesPage } from '../views/admin-notes';
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

// 次のSlug番号を取得（認証必須）
admin.get('/next-slug', basicAuth, async (c) => {
  try {
    const nextSlug = await postService.getNextSlugNumber(c.env.DB);
    return c.json({ nextSlug });
  } catch (error) {
    console.error('[ERROR] GET /admin/next-slug:', error);
    return c.json({ error: 'Failed to get next slug' }, 500);
  }
});

// 特記事項ページ（認証必須）
admin.get('/notes', basicAuth, async (c) => {
  try {
    const content = adminNotesPage();
    return c.html(layout('特記事項', content));
  } catch (error) {
    console.error('[ERROR] GET /admin/notes:', error);
    return c.html(layout('エラー', '<h2>ページの表示に失敗しました</h2>'), 500);
  }
});

export default admin;
