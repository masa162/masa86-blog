import { Hono } from 'hono';
import { basicAuth } from '../middleware/auth';
import * as postService from '../services/posts';
import { adminLayout } from '../views/layout';
import { adminPage } from '../views/admin';
import { adminNotesPage } from '../views/admin-notes';
import type { Env } from '../types';

const admin = new Hono<{ Bindings: Env }>();

// 管理画面（認証必須）- 検索・フィルター・ページネーション対応
admin.get('/', basicAuth, async (c) => {
  try {
    // 検索・フィルターパラメータを取得
    const keyword = c.req.query('keyword') || undefined;
    const tag = c.req.query('tag') || undefined;
    const slug = c.req.query('slug') || undefined;
    const createdStart = c.req.query('createdStart') || undefined;
    const createdEnd = c.req.query('createdEnd') || undefined;
    const updatedStart = c.req.query('updatedStart') || undefined;
    const updatedEnd = c.req.query('updatedEnd') || undefined;
    const page = parseInt(c.req.query('page') || '1');
    const perPage = 20;

    // searchPostsを使用してフィルター適用
    const result = await postService.searchPosts(c.env.DB, {
      keyword,
      tag,
      slug,
      startDate: createdStart,
      endDate: createdEnd,
      updatedStartDate: updatedStart,
      updatedEndDate: updatedEnd,
      limit: perPage,
      offset: (page - 1) * perPage
    });

    // タグ一覧を取得（ドロップダウン用）
    const allTags = await postService.getAllTags(c.env.DB);

    const content = adminPage(result.posts, {
      page,
      totalPages: Math.ceil(result.total / perPage),
      total: result.total,
      keyword,
      tag,
      slug,
      createdStart,
      createdEnd,
      updatedStart,
      updatedEnd,
      tags: allTags
    });

    return c.html(adminLayout('管理画面', content));
  } catch (error) {
    console.error('[ERROR] GET /admin:', error);
    return c.html(adminLayout('エラー', '<h2>記事の取得に失敗しました</h2>'), 500);
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
    return c.html(adminLayout('特記事項', content));
  } catch (error) {
    console.error('[ERROR] GET /admin/notes:', error);
    return c.html(adminLayout('エラー', '<h2>ページの表示に失敗しました</h2>'), 500);
  }
});

export default admin;
