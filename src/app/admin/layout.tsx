export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-8 pb-4 border-b border-[var(--border)]">
        <h1 className="text-3xl font-bold mb-2">管理画面</h1>
        <p className="text-[var(--muted)]">記事の作成・編集・削除を行います</p>
      </div>
      {children}
    </div>
  );
}

