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
    <div style="padding: 20px 0; margin-bottom: 30px; border-bottom: 1px solid #eeeeee;">
      <h2 style="font-size: 18px; margin-bottom: 15px;">記事を検索</h2>
      <form method="GET" action="/">
        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 5px;">キーワード</label>
          <input type="text" name="keyword" value="${options.keyword || ''}"
                 style="width: 100%;"
                 placeholder="タイトルまたは本文を検索">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <div>
            <label style="display: block; margin-bottom: 5px;">タグ</label>
            <select name="tag" style="width: 100%;">
              <option value="">すべて</option>
              ${options.tags.map(t =>
                `<option value="${t}" ${options.tag === t ? 'selected' : ''}>${t}</option>`
              ).join('')}
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px;">開始日</label>
            <input type="date" name="startDate" value="${options.startDate || ''}" style="width: 100%;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px;">終了日</label>
            <input type="date" name="endDate" value="${options.endDate || ''}" style="width: 100%;">
          </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          <button type="submit" class="primary">検索</button>
          <a href="/" class="secondary" style="padding: 8px 15px; display: inline-block;">クリア</a>
          ${options.total > 0 ? `<span style="margin-left: 10px; color: #999; font-size: 12px;">${options.total}件</span>` : ''}
        </div>
      </form>
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
        <div class="post-meta">
          ${new Date(post.createdAt).toLocaleDateString('ja-JP')}
        </div>
        <h2><a href="/posts/${post.slug}">${post.title}</a></h2>
        <div style="margin-bottom: 10px;">${tagsHtml}</div>
        <div class="content" style="color: #888; font-size: 13px; line-height: 1.6; margin-bottom: 10px;">
          ${post.content.substring(0, 150).replace(/\n/g, ' ')}${post.content.length > 150 ? '...' : ''}
        </div>
        <a href="/posts/${post.slug}" style="font-size: 12px;">続きを読む →</a>
      </article>
    `;
  }).join('');

  // ページネーション
  const paginationHtml = options && options.totalPages > 1 ? html`
    <div style="display: flex; justify-content: center; gap: 12px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eeeeee;">
      ${options.page > 1
        ? `<a href="/?page=${options.page - 1}${buildQueryString(options)}" style="padding: 6px 12px; font-size: 12px;">← 前へ</a>`
        : '<span style="padding: 6px 12px; font-size: 12px; color: #ccc;">← 前へ</span>'
      }
      <span style="padding: 6px 12px; font-size: 12px; color: #999;">
        ${options.page} / ${options.totalPages}
      </span>
      ${options.page < options.totalPages
        ? `<a href="/?page=${options.page + 1}${buildQueryString(options)}" style="padding: 6px 12px; font-size: 12px;">次へ →</a>`
        : '<span style="padding: 6px 12px; font-size: 12px; color: #ccc;">次へ →</span>'
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
