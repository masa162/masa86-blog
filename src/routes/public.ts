import { Hono } from 'hono';
import * as postService from '../services/posts';
import { layout } from '../views/layout';
import { homePage } from '../views/home';
import { postPage } from '../views/post';
import type { Env } from '../types';

const publicRoutes = new Hono<{ Bindings: Env }>();

// ホーム画面
publicRoutes.get('/', async (c) => {
  try {
    const posts = await postService.getAllPosts(c.env.DB);
    const content = homePage(posts);
    return c.html(layout('ホーム', content));
  } catch (error) {
    console.error('[ERROR] GET /:', error);
    return c.html(layout('エラー', '<h2>記事の取得に失敗しました</h2>'), 500);
  }
});

// 記事詳細
publicRoutes.get('/posts/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const post = await postService.getPostBySlug(c.env.DB, slug);

    if (!post) {
      return c.html(layout('Not Found', '<h2>記事が見つかりません</h2><a href="/" class="back-link">← ホームに戻る</a>'), 404);
    }

    const content = postPage(post);
    return c.html(layout(post.title, content));
  } catch (error) {
    console.error('[ERROR] GET /posts/:slug:', error);
    return c.html(layout('エラー', '<h2>記事の取得に失敗しました</h2>'), 500);
  }
});

export default publicRoutes;
