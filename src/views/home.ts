import { html } from 'hono/html';
import { marked } from 'marked';
import { processShortcodes } from '../utils/shortcodes';
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
    <div style="padding: 15px; margin-bottom: 20px; background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 4px;">
      <h2 style="font-size: 16px; margin-bottom: 15px; color: #333333;">記事を検索</h2>
      <form method="GET" action="/">
        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 5px; font-size: 12px;">キーワード</label>
          <input type="text" name="keyword" value="${options.keyword || ''}"
                 style="width: 100%;"
                 placeholder="タイトルまたは本文を検索">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 12px;">タグ</label>
            <select name="tag" style="width: 100%;">
              <option value="">すべて</option>
              ${options.tags.map(t =>
    `<option value="${t}" ${options.tag === t ? 'selected' : ''}>${t}</option>`
  ).join('')}
            </select>
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 12px;">開始日</label>
            <input type="date" name="startDate" value="${options.startDate || ''}" style="width: 100%;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-size: 12px;">終了日</label>
            <input type="date" name="endDate" value="${options.endDate || ''}" style="width: 100%;">
          </div>
        </div>

        <div style="display: flex; gap: 8px; align-items: center;">
          <button type="submit" class="primary">検索</button>
          <a href="/" class="secondary" style="padding: 8px 15px; display: inline-block; border: 1px solid #dddddd; border-radius: 4px; background: #ffffff; color: #666666;">クリア</a>
          ${options.total > 0 ? `<span style="margin-left: 10px; color: #666666; font-size: 12px;">${options.total}件</span>` : ''}
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

    // ショートコード処理してからMarkdownをHTMLに変換
    const processedContent = processShortcodes(post.content);
    const htmlContent = marked.parse(processedContent) as string;

    // サムネイル画像を抽出（最初の画像またはYouTube）
    let thumbnailHtml = '';

    // 画像を探す
    const imgMatch = htmlContent.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
    if (imgMatch) {
      thumbnailHtml = `<div style="margin: 10px 0;"><img src="${imgMatch[1]}" alt="" style="max-width: 100%; height: auto; border-radius: 4px;"></div>`;
    } else {
      // YouTubeショートコードを探す
      const youtubeMatch = post.content.match(/\{\{<\s*youtube\s+([a-zA-Z0-9_-]+)\s*>\}\}/);
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        thumbnailHtml = `<div style="margin: 10px 0;"><img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="YouTube" style="max-width: 100%; height: auto; border-radius: 4px;"></div>`;
      }
    }

    // プレーンテキストを抽出
    const plainText = htmlContent.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
    const preview = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');

    return `
      <article>
        <h2><a href="/posts/${post.slug}">${post.title}</a></h2>
        <div class="post-meta" style="display: block; background: transparent; color: #666666; font-size: 12px; margin: 6px 0;">
          ${new Date(post.createdAt).toLocaleDateString('ja-JP')}
        </div>
        ${thumbnailHtml}
        <div class="content" style="color: #333333; font-size: 13px; line-height: 1.5; margin-bottom: 10px;">
          ${preview}
        </div>
        <div style="margin-bottom: 10px;">${tagsHtml}</div>
      </article>
    `;
  }).join('');

  // ページネーション
  const paginationHtml = options && options.totalPages > 1 ? html`
    <div style="display: flex; justify-content: center; gap: 15px; margin-top: 30px; padding: 15px 0; align-items: center;">
      ${options.page > 1
      ? html`<a href="/?page=${options.page - 1}${buildQueryString(options)}" style="padding: 8px 16px; font-size: 14px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px;">← 前へ</a>`
      : html`<span style="padding: 8px 16px; font-size: 14px; color: #cccccc; border: 1px solid #f0f0f0; border-radius: 4px; background: #fafafa;">← 前へ</span>`
    }
      <span style="padding: 8px 16px; font-size: 14px; color: #666666; font-weight: 600;">
        ${options.page} / ${options.totalPages}
      </span>
      ${options.page < options.totalPages
      ? html`<a href="/?page=${options.page + 1}${buildQueryString(options)}" style="padding: 8px 16px; font-size: 14px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px;">次へ →</a>`
      : html`<span style="padding: 8px 16px; font-size: 14px; color: #cccccc; border: 1px solid #f0f0f0; border-radius: 4px; background: #fafafa;">次へ →</span>`
    }
    </div>
  ` : '';

  return html`
    ${html([postsHtml]) || '<p>記事がまだありません。</p>'}
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
