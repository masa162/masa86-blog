/**
 * Admin Posts List Page
 * Displays all posts with edit/delete actions
 */

import { getD1 } from '@/lib/d1';
import { postRowToPost } from '@/lib/utils';
import type { PostRow } from '@/types/database';
import type { Post } from '@/types/database';
import Link from 'next/link';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  let posts: Post[] = [];
  let error: string | null = null;
  
  try {
    const db = getD1();
    
    const { results } = await db
      .prepare('SELECT * FROM posts ORDER BY created_at DESC')
      .all<PostRow>();
    
    posts = (results || []).map(postRowToPost);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Admin page error:', e);
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold mb-2">Error Loading Posts</h3>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Check if D1 binding is configured in Cloudflare Dashboard</p>
        </div>
      )}
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link 
            href="/" 
            className="text-sm text-[var(--muted)] hover:text-[var(--link)] mr-4"
          >
            ← サイトに戻る
          </Link>
        </div>
        <Link
          href="/admin/new"
          className="px-6 py-2 bg-[var(--link)] text-white rounded hover:bg-[var(--link-hover)] transition-colors"
        >
          新規作成
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted)]">
          <p className="mb-4">まだ記事がありません。</p>
          <Link
            href="/admin/new"
            className="inline-block px-6 py-2 bg-[var(--link)] text-white rounded hover:bg-[var(--link-hover)] transition-colors"
          >
            最初の記事を作成
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--tag-bg)]">
                <th className="border border-[var(--border)] px-4 py-2 text-left">Slug</th>
                <th className="border border-[var(--border)] px-4 py-2 text-left">タイトル</th>
                <th className="border border-[var(--border)] px-4 py-2 text-left">タグ</th>
                <th className="border border-[var(--border)] px-4 py-2 text-left">作成日</th>
                <th className="border border-[var(--border)] px-4 py-2 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-[var(--tag-bg)]">
                  <td className="border border-[var(--border)] px-4 py-2 font-mono text-sm">
                    {post.slug}
                  </td>
                  <td className="border border-[var(--border)] px-4 py-2">
                    <Link href={`/${post.slug}`} className="hover:underline" target="_blank">
                      {post.title}
                    </Link>
                  </td>
                  <td className="border border-[var(--border)] px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-[var(--tag-bg)] rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="border border-[var(--border)] px-4 py-2 text-sm">
                    {new Date(post.created_at).toLocaleDateString('ja-JP')}
                  </td>
                  <td className="border border-[var(--border)] px-4 py-2">
                    <div className="flex gap-2 justify-center">
                      <Link
                        href={`/admin/edit/${post.id}`}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        編集
                      </Link>
                      <form
                        action={`/admin/delete/${post.id}`}
                        method="post"
                        onSubmit={(e) => {
                          if (!confirm(`「${post.title}」を削除してもよろしいですか？`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <button
                          type="submit"
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          削除
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

