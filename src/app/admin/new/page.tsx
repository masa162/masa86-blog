'use client';

/**
 * Admin New Post Page
 * Create a new post
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PREDEFINED_TAGS = ['日常', '読書', '技術', '映画', '音楽', '旅行', '食べ物', '考察'];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      const response = await fetch('/api/posts', {
        method: 'POST',
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
        setError(data.message || '記事の作成に失敗しました');
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
      console.error('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      <h2 className="text-2xl font-bold mb-6">新規記事作成</h2>

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
            {isSubmitting ? '作成中...' : '作成'}
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

