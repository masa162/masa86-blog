import { html } from 'hono/html';
import type { Post } from '../db/schema';

export const postPage = (post: Post) => {
  const tags = Array.isArray(post.tags) ? post.tags : JSON.parse(post.tags as string);
  const tagsHtml = tags.map((tag: string) =>
    `<span class="tag">${tag}</span>`
  ).join('');

  return html`
    <article>
      <h2>${post.title}</h2>
      <div class="post-meta">
        ${new Date(post.createdAt).toLocaleDateString('ja-JP')}
      </div>
      <div style="margin-bottom: 1rem">${tagsHtml}</div>
      <div class="content">
        ${post.content}
      </div>
    </article>
    <a href="/" class="back-link">← 一覧に戻る</a>
  `;
};
