import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">404 - ページが見つかりません</h1>
      <p className="text-[var(--muted)] mb-8">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link 
        href="/" 
        className="inline-block px-6 py-2 bg-[var(--link)] text-white rounded hover:bg-[var(--link-hover)] transition-colors"
      >
        トップページに戻る
      </Link>
    </div>
  );
}

