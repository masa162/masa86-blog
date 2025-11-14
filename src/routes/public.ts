import { Hono } from 'hono';
import { html } from 'hono/html';
import { marked } from 'marked';
import * as postService from '../services/posts';
import { layout, type SEOMetadata, type SidebarData } from '../views/layout';
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
    const hierarchicalArchives = await postService.getHierarchicalArchives(c.env.DB);

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

    const sidebar: SidebarData = {
      tags,
      hierarchicalArchives
    };

    return c.html(layout('ホーム', content, seo, sidebar));
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

    // 前後の記事を取得
    const adjacent = await postService.getAdjacentPosts(c.env.DB, slug);

    const content = postPage(post, adjacent);

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

    const allTags = await postService.getAllTags(c.env.DB);
    const hierarchicalArchives = await postService.getHierarchicalArchives(c.env.DB);

    const sidebar: SidebarData = {
      tags: allTags,
      hierarchicalArchives,
      currentSlug: slug
    };

    return c.html(layout(post.title, content, seo, sidebar));
  } catch (error) {
    console.error('[ERROR] GET /posts/:slug:', error);
    return c.html(layout('エラー', '<h2>記事の取得に失敗しました</h2>'), 500);
  }
});

// サイトマップ
publicRoutes.get('/sitemap.xml', async (c) => {
  try {
    const posts = await postService.getAllPosts(c.env.DB);
    const hierarchicalArchives = await postService.getHierarchicalArchives(c.env.DB);

    // カスタムドメインをハードコード（Google Search Console認識のため）
    const baseUrl = 'https://blog.masa86.com';

    // 最新の投稿日時を取得してホームページのlastmodに使用
    const latestPostDate = posts.length > 0
      ? posts.reduce((latest, post) => {
          const postDate = new Date(post.updatedAt);
          return postDate > latest ? postDate : latest;
        }, new Date(posts[0].updatedAt)).toISOString()
      : new Date().toISOString();

    const urls = [
      // ホームページ
      {
        loc: baseUrl,
        lastmod: latestPostDate,
        changefreq: 'daily',
        priority: '1.0'
      },
      // アーカイブページ
      {
        loc: `${baseUrl}/archive`,
        lastmod: latestPostDate,
        changefreq: 'weekly',
        priority: '0.7'
      },
      // 年月別アーカイブページ
      ...hierarchicalArchives.flatMap(yearData =>
        yearData.months.map(monthData => ({
          loc: `${baseUrl}/archive/${yearData.year}/${monthData.month}`,
          lastmod: monthData.posts.length > 0
            ? new Date(
                monthData.posts.reduce((latest, post) => {
                  const postDate = new Date(post.createdAt);
                  const latestDate = new Date(latest);
                  return postDate > latestDate ? post.createdAt : latest;
                }, monthData.posts[0].createdAt)
              ).toISOString()
            : new Date().toISOString(),
          changefreq: 'monthly',
          priority: '0.6'
        }))
      ),
      // 個別投稿ページ
      ...posts.map(post => ({
        loc: `${baseUrl}/posts/${post.slug}`,
        lastmod: new Date(post.updatedAt).toISOString(),
        changefreq: 'monthly',
        priority: '0.8'
      }))
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return c.text(sitemap, 200, {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600'
    });
  } catch (error) {
    console.error('[ERROR] GET /sitemap.xml:', error);
    return c.text('Error generating sitemap', 500);
  }
});

// robots.txt
publicRoutes.get('/robots.txt', (c) => {
  // カスタムドメインをハードコード（Google Search Console認識のため）
  const baseUrl = 'https://blog.masa86.com';

  const robots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;

  return c.text(robots, 200, {
    'Content-Type': 'text/plain; charset=UTF-8',
    'Cache-Control': 'public, max-age=86400'
  });
});

// HTML版サイトマップページ（人間が閲覧できる）
publicRoutes.get('/sitemap', async (c) => {
  try {
    const posts = await postService.getAllPosts(c.env.DB);
    const hierarchicalArchives = await postService.getHierarchicalArchives(c.env.DB);
    const tags = await postService.getAllTags(c.env.DB);

    const content = html`
      <h2>サイトマップ</h2>
      <p style="color: #666; margin-bottom: 30px;">中山雑記の全ページ一覧です。</p>

      <section style="margin-bottom: 40px;">
        <h3 style="font-size: 20px; margin-bottom: 15px; color: #2d4a3a;">主要ページ</h3>
        <ul style="line-height: 1.8;">
          <li><a href="/">ホーム</a> - トップページ</li>
          <li><a href="/archive">アーカイブ</a> - 年月別記事一覧</li>
          <li><a href="/sitemap">サイトマップ</a> - このページ</li>
          <li><a href="/sitemap.xml">XMLサイトマップ</a> - 検索エンジン用</li>
        </ul>
      </section>

      <section style="margin-bottom: 40px;">
        <h3 style="font-size: 20px; margin-bottom: 15px; color: #2d4a3a;">アーカイブ（年月別）</h3>
        <ul style="line-height: 1.8; list-style: none; padding: 0;">
          ${hierarchicalArchives.map(yearData => html`
            <li style="margin-bottom: 15px;">
              <strong>${yearData.year}年</strong>
              <ul style="margin-left: 20px; margin-top: 5px;">
                ${yearData.months.map(monthData => html`
                  <li>
                    <a href="/archive/${yearData.year}/${monthData.month}">${monthData.label}</a>
                    <span style="color: #999; font-size: 12px;">(${monthData.count}件)</span>
                  </li>
                `)}
              </ul>
            </li>
          `)}
        </ul>
      </section>

      <section style="margin-bottom: 40px;">
        <h3 style="font-size: 20px; margin-bottom: 15px; color: #2d4a3a;">タグ一覧</h3>
        <ul style="list-style: none; padding: 0;">
          ${tags.map(tag => html`
            <li style="display: inline-block; margin-right: 10px; margin-bottom: 5px;">
              <a href="/?tag=${encodeURIComponent(tag)}" style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; display: inline-block;">${tag}</a>
            </li>
          `)}
        </ul>
      </section>

      <section style="margin-bottom: 40px;">
        <h3 style="font-size: 20px; margin-bottom: 15px; color: #2d4a3a;">全記事一覧 (${posts.length}件)</h3>
        <ul style="line-height: 1.8;">
          ${posts.map(post => html`
            <li>
              <a href="/posts/${post.slug}">${post.title}</a>
              <span style="color: #999; font-size: 12px; margin-left: 10px;">
                (${new Date(post.createdAt).toLocaleDateString('ja-JP')})
              </span>
            </li>
          `)}
        </ul>
      </section>
    `;

    const seo: SEOMetadata = {
      title: 'サイトマップ | 中山雑記',
      description: '中山雑記の全ページ一覧です。記事、アーカイブ、タグなどサイト内のすべてのコンテンツにアクセスできます。',
      keywords: ['サイトマップ', '記事一覧', 'ブログ', ...tags.slice(0, 5)],
      ogUrl: `https://blog.masa86.com/sitemap`,
      type: 'website'
    };

    const sidebar: SidebarData = {
      tags,
      hierarchicalArchives
    };

    return c.html(layout('サイトマップ', content, seo, sidebar));
  } catch (error) {
    console.error('[ERROR] GET /sitemap:', error);
    return c.html(layout('エラー', '<h2>サイトマップの取得に失敗しました</h2>'), 500);
  }
});

// アーカイブページ
publicRoutes.get('/archive', async (c) => {
  try {
    const hierarchicalArchives = await postService.getHierarchicalArchives(c.env.DB);

    const archiveTreeHtml = hierarchicalArchives.map((yearData, yearIndex) => `
      <div class="archive-year" style="margin-bottom: 20px;">
        <div class="archive-year-header" onclick="toggleYear(${yearIndex})" style="font-size: 20px; font-weight: bold;">
          <span class="expand-icon" id="year-icon-${yearIndex}">▼</span>
          ${yearData.year}年
        </div>
        <div class="archive-months" id="year-${yearIndex}">
          ${yearData.months.map((monthData, monthIndex) => `
            <div class="archive-month">
              <div class="archive-month-header" onclick="toggleMonth(${yearIndex}, ${monthIndex})" style="font-size: 16px;">
                <span class="expand-icon" id="month-icon-${yearIndex}-${monthIndex}">▼</span>
                ${monthData.label} (${monthData.count}件)
              </div>
              <div class="archive-posts" id="month-${yearIndex}-${monthIndex}">
                ${monthData.posts.map(post =>
                  `<a href="/posts/${post.slug}" class="archive-post">・${post.title}</a>`
                ).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    const content = html`
      <h2>記事アーカイブ</h2>
      <div class="archive-tree" style="margin-top: 1.5rem;">
        ${html([archiveTreeHtml])}
      </div>
    `;

    const tags = await postService.getAllTags(c.env.DB);

    const sidebar: SidebarData = {
      tags,
      hierarchicalArchives
    };

    return c.html(layout('アーカイブ', content, undefined, sidebar));
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

      // MarkdownをHTMLに変換してプレーンテキストを抽出
      const htmlContent = marked.parse(post.content) as string;
      const plainText = htmlContent.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
      const preview = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

      return `
        <article>
          <h2><a href="/posts/${post.slug}">${post.title}</a></h2>
          <div class="post-meta">
            ${new Date(post.createdAt).toLocaleDateString('ja-JP')}
          </div>
          <div style="margin-bottom: 0.5rem;">${tagsHtml}</div>
          <div class="content" style="max-height: 150px; overflow: hidden;">
            ${preview}
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

    const tags = await postService.getAllTags(c.env.DB);
    const hierarchicalArchives = await postService.getHierarchicalArchives(c.env.DB);

    const sidebar: SidebarData = {
      tags,
      hierarchicalArchives
    };

    return c.html(layout(`${year}年${month}月の記事`, content, undefined, sidebar));
  } catch (error) {
    console.error('[ERROR] GET /archive/:year/:month:', error);
    return c.html(layout('エラー', '<h2>記事の取得に失敗しました</h2>'), 500);
  }
});

export default publicRoutes;
