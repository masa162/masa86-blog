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
      font-family: 'Helvetica Neue', Arial, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333333;
      max-width: 860px;
      margin: 0 auto;
      padding: 20px;
      background: #ffffff;
    }
    header {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e0e0e0;
    }
    h1 {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #333333;
    }
    h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #2d4a3a;
    }
    nav {
      margin-top: 15px;
    }
    nav a {
      margin-right: 1.5rem;
      text-decoration: none;
      color: #0066cc;
      font-size: 14px;
    }
    nav a:hover {
      color: #004499;
      text-decoration: underline;
    }
    article {
      background: #ffffff;
      padding: 15px;
      margin-bottom: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    article:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    article h2 {
      margin: 0 0 6px 0;
    }
    article h2 a {
      text-decoration: none;
      color: #333333;
      font-size: 16px;
      font-weight: 600;
    }
    article h2 a:hover {
      color: #0066cc;
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
      color: #333333;
      line-height: 1.6;
    }
    .content h1 {
      color: #2d4a3a;
      font-size: 28px;
      font-weight: 700;
      margin: 30px 0 20px 0;
      padding-bottom: 8px;
      border-bottom: 3px solid #2d4a3a;
    }
    .content h2 {
      color: #2d4a3a;
      font-size: 24px;
      font-weight: 600;
      margin: 30px 0 15px 0;
      padding-bottom: 5px;
      border-bottom: 2px solid #e0e0e0;
    }
    .content h3 {
      color: #2d4a3a;
      font-size: 20px;
      font-weight: 600;
      margin: 25px 0 10px 0;
    }
    .content p {
      margin: 15px 0;
    }
    .content blockquote {
      margin: 15px 0;
      padding: 15px 20px;
      background-color: #f9f9f9;
      border-left: 4px solid #0066cc;
      font-style: italic;
      color: #666666;
    }
    .content code {
      font-family: 'Courier New', monospace;
      background-color: #f4f4f4;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 14px;
    }
    .content pre {
      background-color: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 15px 0;
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
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      color: #004499;
      text-decoration: underline;
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
      background: #0066cc;
      color: #ffffff;
      border-color: #0066cc;
    }
    button.primary:hover {
      background: #004499;
      border-color: #004499;
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
      color: #0066cc;
      text-decoration: none;
      font-size: 13px;
    }
    .back-link:hover {
      color: #004499;
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
