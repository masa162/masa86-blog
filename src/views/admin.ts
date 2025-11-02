import { html } from 'hono/html';
import type { Post } from '../db/schema';

export const adminPage = (posts: Post[]) => {
  const postsTable = posts.map(post => {
    const tags = Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags as string);
    const tagsStr = tags.join(', ');
    return `
      <tr>
        <td>${post.slug}</td>
        <td>${post.title}</td>
        <td>${tagsStr}</td>
        <td>${new Date(post.createdAt).toLocaleDateString('ja-JP')}</td>
        <td>
          <button onclick="editPost('${post.slug}')" class="primary">編集</button>
          <button onclick="deletePost('${post.slug}')" class="danger">削除</button>
        </td>
      </tr>
    `;
  }).join('');

  return html`
    <h2>記事管理</h2>

    <!-- 記事作成・編集フォーム -->
    <div id="editor" style="display: none; background: #f8f8f8; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
      <h3 id="editorTitle">新規記事作成</h3>
      <form id="postForm" onsubmit="savePost(event)">
        <input type="hidden" id="editingSlug" value="">

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Slug (URL識別子)</label>
          <input type="text" id="slug" required
                 style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                 placeholder="例: 0004">
          <small style="color: #666;">半角英数字とハイフン、アンダースコアのみ</small>
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">タイトル</label>
          <input type="text" id="title" required
                 style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                 placeholder="記事のタイトル">
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">タグ（カンマ区切り）</label>
          <input type="text" id="tags"
                 style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                 placeholder="例: 技術, ブログ, JavaScript">
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">本文（Markdown）</label>
          <textarea id="content" required rows="15"
                    style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;"
                    placeholder="# 見出し&#10;&#10;本文をMarkdown形式で書いてください。"></textarea>
        </div>

        <div style="display: flex; gap: 1rem;">
          <button type="submit" class="primary">保存</button>
          <button type="button" onclick="cancelEdit()" class="secondary">キャンセル</button>
        </div>
      </form>
    </div>

    <div style="margin-bottom: 1rem;">
      <button onclick="showNewPostForm()" class="primary">新規記事作成</button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Slug</th>
          <th>タイトル</th>
          <th>タグ</th>
          <th>作成日</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${postsTable || '<tr><td colspan="5">記事がありません</td></tr>'}
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
      const ADMIN_USERNAME = 'mn';
      let cachedPassword = null;

      function getAuthHeader() {
        if (!cachedPassword) {
          cachedPassword = prompt('パスワードを入力してください:');
          if (!cachedPassword) return null;
        }
        return 'Basic ' + btoa(ADMIN_USERNAME + ':' + cachedPassword);
      }

      function showNewPostForm() {
        document.getElementById('editor').style.display = 'block';
        document.getElementById('editorTitle').textContent = '新規記事作成';
        document.getElementById('postForm').reset();
        document.getElementById('editingSlug').value = '';
        document.getElementById('slug').disabled = false;
      }

      function cancelEdit() {
        document.getElementById('editor').style.display = 'none';
        document.getElementById('postForm').reset();
      }

      async function editPost(slug) {
        try {
          const response = await fetch(\`/api/posts/\${slug}\`);
          if (!response.ok) throw new Error('記事の取得に失敗しました');

          const data = await response.json();
          const post = data.post;

          document.getElementById('editor').style.display = 'block';
          document.getElementById('editorTitle').textContent = '記事編集';
          document.getElementById('editingSlug').value = slug;
          document.getElementById('slug').value = post.slug;
          document.getElementById('slug').disabled = true;
          document.getElementById('title').value = post.title;
          document.getElementById('content').value = post.content;

          const tags = Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags);
          document.getElementById('tags').value = tags.join(', ');

          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
          alert('記事の読み込みに失敗しました: ' + err.message);
        }
      }

      async function savePost(event) {
        event.preventDefault();

        const authHeader = getAuthHeader();
        if (!authHeader) return;

        const editingSlug = document.getElementById('editingSlug').value;
        const slug = document.getElementById('slug').value;
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const tagsInput = document.getElementById('tags').value;
        const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);

        const isEdit = !!editingSlug;
        const url = isEdit ? \`/api/posts/\${editingSlug}\` : '/api/posts';
        const method = isEdit ? 'PUT' : 'POST';

        const body = isEdit
          ? { title, content, tags }
          : { slug, title, content, tags };

        try {
          const response = await fetch(url, {
            method,
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          });

          if (response.ok) {
            alert(isEdit ? '記事を更新しました' : '記事を作成しました');
            location.reload();
          } else {
            const error = await response.json();
            alert('保存に失敗しました: ' + (error.error || 'Unknown error'));
            if (response.status === 401) {
              cachedPassword = null;
            }
          }
        } catch (err) {
          alert('保存に失敗しました: ' + err.message);
        }
      }

      async function deletePost(slug) {
        if (!confirm('本当に削除しますか？')) return;

        const authHeader = getAuthHeader();
        if (!authHeader) return;

        try {
          const response = await fetch(\`/api/posts/\${slug}\`, {
            method: 'DELETE',
            headers: {
              'Authorization': authHeader
            }
          });

          if (response.ok) {
            alert('削除しました');
            location.reload();
          } else {
            const error = await response.json();
            alert('削除に失敗しました: ' + (error.error || 'Unknown error'));
            if (response.status === 401) {
              cachedPassword = null;
            }
          }
        } catch (err) {
          alert('削除に失敗しました: ' + err.message);
        }
      }
    </script>
  `;
};
