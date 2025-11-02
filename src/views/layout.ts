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
      font-family: 'Trebuchet MS', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #666666;
      max-width: 860px;
      margin: 0 auto;
      padding: 10px 40px;
      background: #ffffff;
    }
    header {
      margin-bottom: 45px;
      padding-bottom: 20px;
      border-bottom: 1px solid #dddddd;
    }
    h1 {
      font-family: Arial, sans-serif;
      font-size: 40px;
      font-weight: normal;
      margin-bottom: 10px;
      color: #666666;
    }
    h2 {
      font-size: 22px;
      font-weight: normal;
      margin-bottom: 15px;
      color: #666666;
    }
    nav {
      margin-top: 15px;
    }
    nav a {
      margin-right: 1.5rem;
      text-decoration: none;
      color: #2288bb;
      font-size: 13px;
    }
    nav a:hover {
      color: #33aaff;
      text-decoration: underline;
    }
    nav a:visited {
      color: #888888;
    }
    article {
      background: transparent;
      padding: 15px 0;
      margin-bottom: 30px;
      border-bottom: 1px solid #eeeeee;
    }
    article h2 {
      margin-top: 5px;
      margin-bottom: 8px;
    }
    article h2 a {
      text-decoration: none;
      color: #666666;
      font-size: 22px;
    }
    article h2 a:hover {
      color: #2288bb;
    }
    .post-meta {
      display: inline-block;
      background: #bbbbbb;
      color: #ffffff;
      font-size: 11px;
      padding: 5px 10px;
      margin-bottom: 10px;
    }
    .tag {
      display: inline-block;
      background: #eeeeee;
      color: #666666;
      padding: 3px 8px;
      font-size: 11px;
      margin-right: 5px;
      margin-bottom: 5px;
    }
    .content {
      white-space: pre-wrap;
      word-wrap: break-word;
      color: #666666;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    th, td {
      padding: 8px 10px;
      text-align: left;
      border-bottom: 1px solid #dddddd;
    }
    th {
      background: #eeeeee;
      font-weight: bold;
      color: #666666;
      font-size: 12px;
    }
    a {
      color: #2288bb;
      text-decoration: none;
    }
    a:hover {
      color: #33aaff;
      text-decoration: underline;
    }
    a:visited {
      color: #888888;
    }
    button, .primary, .secondary {
      padding: 8px 15px;
      margin-right: 8px;
      margin-bottom: 8px;
      border: 1px solid #dddddd;
      background: #ffffff;
      color: #666666;
      cursor: pointer;
      font-size: 12px;
      font-family: inherit;
    }
    button:hover, .primary:hover {
      background: #eeeeee;
    }
    button.primary {
      background: #2288bb;
      color: #ffffff;
      border-color: #2288bb;
    }
    button.primary:hover {
      background: #33aaff;
      border-color: #33aaff;
    }
    button.secondary {
      background: #ffffff;
      color: #666666;
      border-color: #dddddd;
    }
    button.secondary:hover {
      background: #eeeeee;
    }
    button.danger {
      background: #cc0000;
      color: #ffffff;
      border-color: #cc0000;
    }
    button.danger:hover {
      background: #dd0000;
    }
    input[type="text"], input[type="date"], select, textarea {
      font-size: 13px;
      font-family: inherit;
      color: #666666;
      border: 1px solid #dddddd;
      padding: 6px 8px;
    }
    input:disabled {
      background: #eeeeee;
      cursor: not-allowed;
    }
    label {
      font-size: 12px;
      color: #666666;
    }
    .back-link {
      display: inline-block;
      margin-top: 15px;
      color: #2288bb;
      text-decoration: none;
      font-size: 13px;
    }
    .back-link:hover {
      color: #33aaff;
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
