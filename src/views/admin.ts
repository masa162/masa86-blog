import { html } from 'hono/html';
import type { Post } from '../db/schema';

export const adminPage = (posts: Post[]) => {
  const postsTable = posts.map(post => {
    return `
      <tr>
        <td>${post.slug}</td>
        <td>${post.title}</td>
        <td>${new Date(post.createdAt).toLocaleDateString('ja-JP')}</td>
        <td>
          <button onclick="deletePost('${post.slug}')" class="danger">削除</button>
        </td>
      </tr>
    `;
  }).join('');

  return html`
    <h2>記事管理</h2>
    <p>既存の記事一覧です。APIを使用して記事の作成・更新・削除ができます。</p>

    <table>
      <thead>
        <tr>
          <th>Slug</th>
          <th>タイトル</th>
          <th>作成日</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${postsTable || '<tr><td colspan="4">記事がありません</td></tr>'}
      </tbody>
    </table>

    <h3 style="margin-top: 2rem;">API使用例</h3>
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

    <script>
      async function deletePost(slug) {
        if (!confirm('本当に削除しますか？')) return;

        const username = '${process.env.ADMIN_USERNAME || 'admin'}';
        const password = prompt('パスワードを入力してください:');
        if (!password) return;

        try {
          const response = await fetch(\`/api/posts/\${slug}\`, {
            method: 'DELETE',
            headers: {
              'Authorization': 'Basic ' + btoa(username + ':' + password)
            }
          });

          if (response.ok) {
            alert('削除しました');
            location.reload();
          } else {
            const error = await response.json();
            alert('削除に失敗しました: ' + (error.error || 'Unknown error'));
          }
        } catch (err) {
          alert('削除に失敗しました: ' + err.message);
        }
      }
    </script>
  `;
};
