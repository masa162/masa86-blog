import { html } from 'hono/html';
import { marked } from 'marked';
import { processShortcodes } from '../utils/shortcodes';
import type { Post } from '../db/schema';

interface AdjacentPosts {
  prev: Post | null;
  next: Post | null;
}

export const postPage = (
  post: Post,
  adjacent?: AdjacentPosts,
  primaryTag?: string | null,
  adjacentByTag?: AdjacentPosts
) => {
  const tags = Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags as string);
  const tagsHtml = tags.map((tag: string) =>
    `<a href="/?tag=${encodeURIComponent(tag)}" class="tag" style="text-decoration: none;">${tag}</a>`
  ).join('');

  // ショートコード処理（YouTube、Amazonなど）
  let content = processShortcodes(post.content);

  // MarkdownをHTMLに変換
  let htmlContent = marked.parse(content) as string;

  // 外部リンクに target="_blank" と rel="noopener noreferrer" を追加
  // http:// または https:// で始まるリンクを外部リンクとして扱う
  htmlContent = htmlContent.replace(
    /<a\s+href="(https?:\/\/[^"]+)"([^>]*)>/gi,
    '<a href="$1"$2 target="_blank" rel="noopener noreferrer">'
  );

  // タイトルを20文字で切り詰める関数
  const truncateTitle = (title: string, maxLength: number = 20) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  // 同タグ前後セクション
  const relatedByTagHtml = (adjacentByTag && primaryTag && (adjacentByTag.prev || adjacentByTag.next))
    ? html`
      <div style="margin-bottom: 20px; padding: 12px 16px; background: #f5f8f5; border: 1px solid #d0e0d0; border-radius: 6px;">
        <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
          タグ「<a href="/?tag=${encodeURIComponent(primaryTag)}" style="color: #2d7a3a; text-decoration: none;">${primaryTag}</a>」の関連記事
        </div>
        <div style="display: flex; gap: 15px; font-size: 13px;">
          ${adjacentByTag.prev ? html`
            <a href="/posts/${adjacentByTag.prev.slug}" style="color: #0066cc; text-decoration: none; flex: 1;">
              ← ${truncateTitle(adjacentByTag.prev.title)}
            </a>
          ` : html`<span style="color: #cccccc; flex: 1;">← なし</span>`}
          ${adjacentByTag.next ? html`
            <a href="/posts/${adjacentByTag.next.slug}" style="color: #0066cc; text-decoration: none; flex: 1; text-align: right;">
              ${truncateTitle(adjacentByTag.next.title)} →
            </a>
          ` : html`<span style="color: #cccccc; flex: 1; text-align: right;">なし →</span>`}
        </div>
      </div>
    `
    : '';

  return html`
    <article>
      <h2>${post.title}</h2>
      <div class="post-meta">
        ${new Date(post.createdAt).toLocaleDateString('ja-JP')}
      </div>
      <div style="margin-bottom: 1rem">${html([tagsHtml])}</div>
      <div class="content">
        ${html([htmlContent])}
      </div>
    </article>
    <div style="margin-top: 30px;">
      <div style="margin-bottom: 15px;">
        <a href="/" class="back-link" style="font-size: 14px;">← 一覧に戻る</a>
      </div>
      ${html([relatedByTagHtml as string])}
      ${adjacent ? html`
        <div style="display: flex; gap: 20px; font-size: 14px;">
          ${adjacent.prev ? html`
            <a href="/posts/${adjacent.prev.slug}" style="color: #0066cc; text-decoration: none;">
              ← ${truncateTitle(adjacent.prev.title)}
            </a>
          ` : html`<span style="color: #cccccc;">← 前の記事なし</span>`}
          ${adjacent.next ? html`
            <a href="/posts/${adjacent.next.slug}" style="color: #0066cc; text-decoration: none;">
              ${truncateTitle(adjacent.next.title)} →
            </a>
          ` : html`<span style="color: #cccccc;">次の記事なし →</span>`}
        </div>
      ` : ''}
    </div>
  `;
};
