import { Hono } from 'hono';
import { basicAuth } from '../middleware/auth';
import * as postService from '../services/posts';
import type { Env, PostCreateRequest, PostUpdateRequest } from '../types';

const api = new Hono<{ Bindings: Env }>();

// 記事一覧取得
api.get('/posts', async (c) => {
  try {
    const posts = await postService.getAllPosts(c.env.DB);
    return c.json({ posts });
  } catch (error) {
    console.error('[ERROR] GET /api/posts:', error);
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

// 記事詳細取得
api.get('/posts/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const post = await postService.getPostBySlug(c.env.DB, slug);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    return c.json({ post });
  } catch (error) {
    console.error('[ERROR] GET /api/posts/:slug:', error);
    return c.json({ error: 'Failed to fetch post' }, 500);
  }
});

// 検索API（キーワード、タグ、日付範囲、ページネーション）
api.get('/search', async (c) => {
  try {
    const keyword = c.req.query('keyword');
    const tag = c.req.query('tag');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');

    const result = await postService.searchPosts(c.env.DB, {
      keyword,
      tag,
      startDate,
      endDate,
      limit,
      offset: (page - 1) * limit
    });

    return c.json({
      posts: result.posts,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    });
  } catch (error) {
    console.error('[ERROR] GET /api/search:', error);
    return c.json({ error: 'Failed to search posts' }, 500);
  }
});

// タグ一覧取得
api.get('/tags', async (c) => {
  try {
    const tags = await postService.getAllTags(c.env.DB);
    return c.json({ tags });
  } catch (error) {
    console.error('[ERROR] GET /api/tags:', error);
    return c.json({ error: 'Failed to fetch tags' }, 500);
  }
});

// 記事作成（認証必須）
api.post('/posts', basicAuth, async (c) => {
  try {
    const body = await c.req.json<PostCreateRequest>();

    // バリデーション
    if (!body.slug || !body.title || !body.content) {
      return c.json({ error: 'Missing required fields: slug, title, content' }, 400);
    }

    const newPost = await postService.createPost(c.env.DB, {
      slug: body.slug,
      title: body.title,
      content: body.content,
      tags: JSON.stringify(body.tags || [])
    });

    return c.json({ post: newPost }, 201);
  } catch (error: any) {
    console.error('[ERROR] POST /api/posts:', error);

    // UNIQUE制約違反の場合
    if (error.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Post with this slug already exists' }, 409);
    }

    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// 記事更新（認証必須）
api.put('/posts/:slug', basicAuth, async (c) => {
  try {
    const slug = c.req.param('slug');
    const body = await c.req.json<PostUpdateRequest>();

    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.content) updateData.content = body.content;
    if (body.tags) updateData.tags = JSON.stringify(body.tags);

    const updated = await postService.updatePost(c.env.DB, slug, updateData);

    if (!updated) {
      return c.json({ error: 'Post not found' }, 404);
    }

    return c.json({ post: updated });
  } catch (error) {
    console.error('[ERROR] PUT /api/posts/:slug:', error);
    return c.json({ error: 'Failed to update post' }, 500);
  }
});

// 記事削除（認証必須）
api.delete('/posts/:slug', basicAuth, async (c) => {
  try {
    const slug = c.req.param('slug');
    const deleted = await postService.deletePost(c.env.DB, slug);

    if (!deleted) {
      return c.json({ error: 'Post not found' }, 404);
    }

    return c.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('[ERROR] DELETE /api/posts/:slug:', error);
    return c.json({ error: 'Failed to delete post' }, 500);
  }
});

export default api;
