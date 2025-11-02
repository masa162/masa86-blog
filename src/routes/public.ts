import { Hono } from 'hono';
import * as postService from '../services/posts';
import { layout, type SEOMetadata } from '../views/layout';
import { homePage } from '../views/home';
import { postPage } from '../views/post';
import type { Env } from '../types';

const publicRoutes = new Hono<{ Bindings: Env }>();

// ホーム画面（検索・フィルタリング・ページネーション対応）
publicRoutes.get('/', async (c) => {
  try {
    const keyword = c.req.query('keyword');
    const tag = c.req.query('tag');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const page = parseInt(c.req.query('page') || '1');
    const limit = 10;

    const result = await postService.searchPosts(c.env.DB, {
      keyword,
      tag,
      startDate,
      endDate,
      limit,
      offset: (page - 1) * limit
    });

    const tags = await postService.getAllTags(c.env.DB);
    const content = homePage(result.posts, {
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
      keyword,
      tag,
      startDate,
      endDate,
      tags
    });

    const seo: SEOMetadata = {
      title: 'masa86 Blog - ホーム',
      description: 'シンプルで高速なブログシステム。技術、プログラミング、その他様々なトピックを扱います。',
      keywords: ['ブログ', '技術', 'プログラミング', ...tags.slice(0, 5)],
      ogUrl: 'https://masa86-blog.belong2jazz.workers.dev',
      type: 'website'
    };

    return c.html(layout('ホーム', content, seo));
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

    const tags = Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags as string);
    const description = post.content.substring(0, 160).replace(/\n/g, ' ') + '...';

    const seo: SEOMetadata = {
      title: `${post.title} | masa86 Blog`,
      description,
      keywords: tags,
      ogUrl: `https://masa86-blog.belong2jazz.workers.dev/posts/${slug}`,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt
    };

    return c.html(layout(post.title, content, seo));
  } catch (error) {
    console.error('[ERROR] GET /posts/:slug:', error);
    return c.html(layout('エラー', '<h2>記事の取得に失敗しました</h2>'), 500);
  }
});

// サイトマップ
publicRoutes.get('/sitemap.xml', async (c) => {
  try {
    const posts = await postService.getAllPosts(c.env.DB);
    const baseUrl = 'https://masa86-blog.belong2jazz.workers.dev';

    const urls = [
      { loc: baseUrl, lastmod: new Date().toISOString(), priority: '1.0' },
      ...posts.map(post => ({
        loc: `${baseUrl}/posts/${post.slug}`,
        lastmod: post.updatedAt,
        priority: '0.8'
      }))
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return c.text(sitemap, 200, { 'Content-Type': 'application/xml' });
  } catch (error) {
    console.error('[ERROR] GET /sitemap.xml:', error);
    return c.text('Error generating sitemap', 500);
  }
});

// robots.txt
publicRoutes.get('/robots.txt', (c) => {
  const robots = `User-agent: *
Allow: /

Sitemap: https://masa86-blog.belong2jazz.workers.dev/sitemap.xml`;

  return c.text(robots, 200, { 'Content-Type': 'text/plain' });
});

// アーカイブページ
publicRoutes.get('/archive', async (c) => {
  try {
    const archives = await postService.getArchives(c.env.DB);

    const content = `
      <h2>記事アーカイブ</h2>
      <div style="background: white; padding: 2rem; border-radius: 8px; margin-top: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ${archives.map(archive => `
          <div style="margin-bottom: 1rem; padding: 1rem; border-bottom: 1px solid #eee;">
            <a href="/archive/${archive.year}/${archive.month}" style="font-size: 1.1rem; color: #0066cc; text-decoration: none;">
              ${archive.label} (${archive.count}件)
            </a>
          </div>
        `).join('')}
      </div>
    `;

    return c.html(layout('アーカイブ', content));
  } catch (error) {
    console.error('[ERROR] GET /archive:', error);
    return c.html(layout('エラー', '<h2>アーカイブの取得に失敗しました</h2>'), 500);
  }
});

// 年月別アーカイブ
publicRoutes.get('/archive/:year/:month', async (c) => {
  try {
    const year = parseInt(c.req.param('year'));
    const month = parseInt(c.req.param('month'));

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return c.html(layout('エラー', '<h2>無効な年月です</h2><a href="/archive" class="back-link">← アーカイブに戻る</a>'), 400);
    }

    const posts = await postService.getPostsByYearMonth(c.env.DB, year, month);

    const postsHtml = posts.map(post => {
      const tags = Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags as string);
      const tagsHtml = tags.map((tag: string) =>
        `<span class="tag">${tag}</span>`
      ).join('');

      return `
        <article>
          <h2><a href="/posts/${post.slug}">${post.title}</a></h2>
          <div class="post-meta">
            ${new Date(post.createdAt).toLocaleDateString('ja-JP')}
          </div>
          <div style="margin-bottom: 0.5rem;">${tagsHtml}</div>
          <div class="content" style="max-height: 150px; overflow: hidden;">
            ${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}
          </div>
          <a href="/posts/${post.slug}">続きを読む →</a>
        </article>
      `;
    }).join('');

    const content = `
      <h2>${year}年${month}月の記事 (${posts.length}件)</h2>
      <a href="/archive" class="back-link" style="display: inline-block; margin-bottom: 1rem;">← アーカイブ一覧に戻る</a>
      ${postsHtml || '<p>この月の記事はありません。</p>'}
    `;

    return c.html(layout(`${year}年${month}月の記事`, content));
  } catch (error) {
    console.error('[ERROR] GET /archive/:year/:month:', error);
    return c.html(layout('エラー', '<h2>記事の取得に失敗しました</h2>'), 500);
  }
});

export default publicRoutes;
