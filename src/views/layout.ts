import { html } from 'hono/html';

export const layout = (title: string, content: string) => html`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | masa86 Blog</title>
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
    button {
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
    button:hover {
      background: #0052a3;
    }
    button.danger {
      background: #cc0000;
    }
    button.danger:hover {
      background: #a30000;
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
      <a href="/admin">管理画面</a>
    </nav>
  </header>
  <main>
    ${content}
  </main>
</body>
</html>`;
