/**
 * Post Detail Page
 * Displays a single post by slug
 */

import { getD1 } from '@/lib/d1';
import { postRowToPost } from '@/lib/utils';
import type { PostRow } from '@/types/database';
import Link from 'next/link';
import { marked } from 'marked';
import { notFound } from 'next/navigation';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const db = getD1();
  
  const { results } = await db
    .prepare('SELECT * FROM posts WHERE slug = ?')
    .bind(slug)
    .all<PostRow>();
  
  if (!results || results.length === 0) {
    notFound();
  }

  const post = postRowToPost(results[0]);

  return (
    <article>
      <div className="mb-8">
        <Link 
          href="/" 
          className="text-sm text-[var(--muted)] hover:text-[var(--link)]"
        >
          ← トップに戻る
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
          <time dateTime={post.created_at}>
            作成: {new Date(post.created_at).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          {post.updated_at !== post.created_at && (
            <time dateTime={post.updated_at}>
              更新: {new Date(post.updated_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-[var(--tag-bg)] rounded-full text-sm hover:bg-[var(--border)] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div 
        className="markdown-content prose max-w-none"
        dangerouslySetInnerHTML={{ __html: marked(post.content) }}
      />

      <div className="mt-12 pt-8 border-t border-[var(--border)]">
        <Link 
          href="/" 
          className="text-[var(--link)] hover:text-[var(--link-hover)]"
        >
          ← トップに戻る
        </Link>
      </div>
    </article>
  );
}

