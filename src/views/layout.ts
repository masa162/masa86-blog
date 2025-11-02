import { html } from 'hono/html';

export interface SEOMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogUrl?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
}

export const layout = (title: string, content: string, seo?: SEOMetadata) => {
  const fullTitle = seo?.title || `${title} | masa86 Blog`;
  const description = seo?.description || 'シンプルで高速なブログシステム powered by Hono + Drizzle + Cloudflare Workers';
  const keywords = seo?.keywords?.join(', ') || 'ブログ, 技術, プログラミング';
  const ogUrl = seo?.ogUrl || 'https://masa86-blog.belong2jazz.workers.dev';
  const ogImage = seo?.ogImage || 'https://masa86-blog.belong2jazz.workers.dev/og-image.png';
  const ogType = seo?.type || 'website';

  return html`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>

  <!-- SEO Meta Tags -->
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="masa86">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${ogUrl}">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:site_name" content="masa86 Blog">
  ${seo?.publishedTime ? `<meta property="article:published_time" content="${seo.publishedTime}">` : ''}
  ${seo?.modifiedTime ? `<meta property="article:modified_time" content="${seo.modifiedTime}">` : ''}

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${ogUrl}">
  <meta property="twitter:title" content="${fullTitle}">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="${ogImage}">

  <!-- Canonical URL -->
  <link rel="canonical" href="${ogUrl}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
      background: #f5f5f5;
    }
    header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #333;
    }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; margin-bottom: 1rem; }
    nav a { margin-right: 1rem; text-decoration: none; color: #0066cc; }
    nav a:hover { text-decoration: underline; }
    article {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    article h2 a {
      text-decoration: none;
      color: #333;
    }
    article h2 a:hover {
      color: #0066cc;
    }
    .post-meta {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    .tag {
      display: inline-block;
      background: #e0e0e0;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.85rem;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .content {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    th, td {
      padding: 0.5rem;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f0f0f0;
      font-weight: bold;
    }
    button, .primary, .secondary {
      padding: 0.5rem 1rem;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
      border: none;
      border-radius: 4px;
      background: #0066cc;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
    }
    button:hover, .primary:hover {
      background: #0052a3;
    }
    button.primary {
      background: #0066cc;
    }
    button.secondary {
      background: #666;
    }
    button.secondary:hover {
      background: #444;
    }
    button.danger {
      background: #cc0000;
    }
    button.danger:hover {
      background: #a30000;
    }
    input[type="text"], textarea {
      font-size: 1rem;
    }
    input:disabled {
      background: #f0f0f0;
      cursor: not-allowed;
    }
    .back-link {
      display: inline-block;
      margin-top: 1rem;
      color: #0066cc;
      text-decoration: none;
    }
    .back-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <header>
    <h1>masa86 Blog</h1>
    <nav>
      <a href="/">ホーム</a>
      <a href="/archive">アーカイブ</a>
      <a href="/admin">管理画面</a>
    </nav>
  </header>
  <main>
    ${content}
  </main>
</body>
</html>`;
};
