/**
 * Tag Page
 * Displays posts filtered by tag
 */

import { getD1 } from '@/lib/d1';
import { postRowToPost, truncateText, markdownToPlainText } from '@/lib/utils';
import type { PostRow } from '@/types/database';
import Link from 'next/link';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    tag: string;
  }>;
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  const db = getD1();
  
  const { results } = await db
    .prepare('SELECT * FROM posts WHERE tags LIKE ? ORDER BY created_at DESC')
    .bind(`%"${decodedTag}"%`)
    .all<PostRow>();
  
  const posts = (results || []).map(postRowToPost);

  return (
    <div>
      <div className="mb-8">
        <Link 
          href="/" 
          className="text-sm text-[var(--muted)] hover:text-[var(--link)]"
        >
          ← トップに戻る
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        タグ: <span className="text-[var(--link)]">{decodedTag}</span>
      </h1>
      <p className="text-[var(--muted)] mb-8">{posts.length}件の記事</p>
      
      {posts.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted)]">
          <p>このタグの記事はまだありません。</p>
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
                      {post.tags.map((t) => (
                        <span
                          key={t}
                          className={`px-3 py-1 rounded-full text-sm ${
                            t === decodedTag 
                              ? 'bg-[var(--link)] text-white' 
                              : 'bg-[var(--tag-bg)]'
                          }`}
                        >
                          {t}
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
    </div>
  );
}

