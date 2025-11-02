import { html } from 'hono/html';
import type { Post } from '../db/schema';

export const homePage = (posts: Post[]) => {
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
        <div>${tagsHtml}</div>
      </article>
    `;
  }).join('');

  return html`
    <h2>最新記事</h2>
    ${postsHtml || '<p>まだ記事がありません。</p>'}
  `;
};
