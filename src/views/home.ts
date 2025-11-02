import { html } from 'hono/html';
import type { Post } from '../db/schema';

interface PaginationOptions {
  total: number;
  page: number;
  totalPages: number;
  keyword?: string;
  tag?: string;
  startDate?: string;
  endDate?: string;
  tags: string[];
}

export const homePage = (posts: Post[], options?: PaginationOptions) => {
  // 検索フォーム
  const searchFormHtml = options ? html`
    <div style="background: white; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="margin-bottom: 1rem;">記事を検索</h2>
      <form method="GET" action="/">
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">キーワード</label>
          <input type="text" name="keyword" value="${options.keyword || ''}"
                 style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;"
                 placeholder="タイトルまたは本文を検索">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">タグ</label>
            <select name="tag" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
              <option value="">すべて</option>
              ${options.tags.map(t =>
                `<option value="${t}" ${options.tag === t ? 'selected' : ''}>${t}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">開始日</label>
            <input type="date" name="startDate" value="${options.startDate || ''}"
                   style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">終了日</label>
            <input type="date" name="endDate" value="${options.endDate || ''}"
                   style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
          </div>
        </div>

        <div style="display: flex; gap: 1rem;">
          <button type="submit" class="primary">検索</button>
          <a href="/" style="padding: 0.5rem 1rem; background: #666; color: white; text-decoration: none; border-radius: 4px; display: inline-block;">クリア</a>
        </div>
      </form>

      ${options.total > 0 ? `<p style="margin-top: 1rem; color: #666;">${options.total}件の記事が見つかりました</p>` : ''}
    </div>
  ` : '';

  // 記事一覧
  const postsHtml = posts.map(post => {
    const tags = Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags as string);
    const tagsHtml = tags.map((tag: string) =>
      `<span class="tag">${tag}</span>`
    ).join('');

    return html`
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

  // ページネーション
  const paginationHtml = options && options.totalPages > 1 ? html`
    <div style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 2rem;">
      ${options.page > 1
        ? `<a href="/?page=${options.page - 1}${buildQueryString(options)}" style="padding: 0.5rem 1rem; background: #0066cc; color: white; text-decoration: none; border-radius: 4px;">← 前へ</a>`
        : ''
      }
      <span style="padding: 0.5rem 1rem; background: white; border-radius: 4px;">
        ${options.page} / ${options.totalPages}
      </span>
      ${options.page < options.totalPages
        ? `<a href="/?page=${options.page + 1}${buildQueryString(options)}" style="padding: 0.5rem 1rem; background: #0066cc; color: white; text-decoration: none; border-radius: 4px;">次へ →</a>`
        : ''
      }
    </div>
  ` : '';

  return html`
    ${searchFormHtml}
    ${postsHtml || '<p>記事がまだありません。</p>'}
    ${paginationHtml}
  `;
};

function buildQueryString(options: PaginationOptions): string {
  const params: string[] = [];
  if (options.keyword) params.push(`keyword=${encodeURIComponent(options.keyword)}`);
  if (options.tag) params.push(`tag=${encodeURIComponent(options.tag)}`);
  if (options.startDate) params.push(`startDate=${options.startDate}`);
  if (options.endDate) params.push(`endDate=${options.endDate}`);
  return params.length > 0 ? '&' + params.join('&') : '';
}
