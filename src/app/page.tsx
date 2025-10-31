/**
 * Home Page
 * Displays the latest 10 posts
 */

import { getD1 } from '@/lib/d1';
import { postRowToPost, truncateText, markdownToPlainText } from '@/lib/utils';
import type { PostRow } from '@/types/database';
import Link from 'next/link';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const db = getD1();
  
  const { results } = await db
    .prepare('SELECT * FROM posts ORDER BY created_at DESC LIMIT 10')
    .all<PostRow>();
  
  const posts = (results || []).map(postRowToPost);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">最新の記事</h1>
      
      {posts.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted)]">
          <p>まだ記事がありません。</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const preview = truncateText(markdownToPlainText(post.content), 200);
            
            return (
              <article 
                key={post.id}
                className="border border-[var(--border)] rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <Link href={`/${post.slug}`} className="block no-underline">
                  <h2 className="text-2xl font-semibold mb-2 hover:text-[var(--link)]">
                    {post.title}
                  </h2>
                  <div className="text-sm text-[var(--muted)] mb-3">
                    {new Date(post.created_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-[var(--tag-bg)] rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[var(--muted)]">{preview}</p>
                </Link>
              </article>
            );
          })}
        </div>
      )}
      
      <div className="mt-12 text-center">
        <Link 
          href="/admin" 
          className="inline-block px-6 py-2 bg-[var(--link)] text-white rounded hover:bg-[var(--link-hover)] transition-colors"
        >
          管理画面
        </Link>
      </div>
    </div>
  );
}

