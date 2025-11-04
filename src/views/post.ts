import { html } from 'hono/html';
import { marked } from 'marked';
import type { Post } from '../db/schema';

interface AdjacentPosts {
  prev: Post | null;
  next: Post | null;
}

export const postPage = (post: Post, adjacent?: AdjacentPosts) => {
  const tags = Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags as string);
  const tagsHtml = tags.map((tag: string) =>
    `<span class="tag">${tag}</span>`
  ).join('');

  // YouTube shortcode を iframe に変換（Markdown変換前に処理）
  // {{< youtube VIDEO_ID >}} → <iframe ... >
  let content = post.content.replace(
    /\{\{<\s*youtube\s+([a-zA-Z0-9_-]+)\s*>\}\}/g,
    '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 20px 0;"><iframe src="https://www.youtube.com/embed/$1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe></div>'
  );

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
