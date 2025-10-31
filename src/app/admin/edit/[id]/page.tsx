'use client';

/**
 * Admin Edit Post Page
 * Edit an existing post
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

const PREDEFINED_TAGS = ['日常', '読書', '技術', '映画', '音楽', '旅行', '食べ物', '考察'];

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPostPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setTitle(data.data.title);
          setContent(data.data.content);
          setSelectedTags(data.data.tags || []);
        } else {
          setError('記事の取得に失敗しました');
        }
      } catch (err) {
        setError('ネットワークエラーが発生しました');
        console.error('Error fetching post:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('タイトルと本文は必須です');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags: selectedTags,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.message || '記事の更新に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Error updating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('この記事を削除してもよろしいですか？')) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.message || '記事の削除に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Error deleting post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-[var(--muted)]">読み込み中...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link 
          href="/admin" 
          className="text-sm text-[var(--muted)] hover:text-[var(--link)]"
        >
          ← 記事一覧に戻る
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-6">記事編集</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block mb-2 font-semibold">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--link)]"
            placeholder="記事のタイトルを入力"
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">タグ</label>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`px-4 py-2 rounded transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-[var(--link)] text-white'
                    : 'bg-[var(--tag-bg)] hover:bg-[var(--border)]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block mb-2 font-semibold">
            本文（Markdown） <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--link)] font-mono text-sm"
            rows={20}
            placeholder="Markdown形式で本文を入力"
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[var(--link)] text-white rounded hover:bg-[var(--link-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '更新中...' : '更新'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            削除
          </button>
          <Link
            href="/admin"
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}

