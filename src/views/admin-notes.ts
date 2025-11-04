import { html } from 'hono/html';

export const adminNotesPage = () => {
  return html`
    <h2>特記事項</h2>

    <div style="background: #f8f8f8; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
      <h3>API使用例</h3>
      <pre style="background: #f0f0f0; padding: 1rem; border-radius: 4px; overflow-x: auto;">
# 記事一覧取得
curl https://masa86-blog.workers.dev/api/posts

# 記事詳細取得
curl https://masa86-blog.workers.dev/api/posts/0001

# 記事作成（要認証）
curl -X POST https://masa86-blog.workers.dev/api/posts \\
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \\
  -H "Content-Type: application/json" \\
  -d '{
    "slug": "0004",
    "title": "新しい記事",
    "content": "# 内容\\n\\nMarkdown形式で書けます",
    "tags": ["技術", "ブログ"]
  }'

# 記事更新（要認証）
curl -X PUT https://masa86-blog.workers.dev/api/posts/0004 \\
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "更新されたタイトル",
    "content": "更新された内容"
  }'

# 記事削除（要認証）
curl -X DELETE https://masa86-blog.workers.dev/api/posts/0004 \\
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)"
      </pre>
    </div>

    <div style="margin-top: 2rem;">
      <a href="/admin" style="color: #0066cc; text-decoration: none;">← 管理画面に戻る</a>
    </div>
  `;
};
