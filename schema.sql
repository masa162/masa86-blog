-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]', -- JSON array of tags
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

CREATE TRIGGER IF NOT EXISTS update_posts_updated_at
AFTER UPDATE ON posts
FOR EACH ROW
BEGIN
  UPDATE posts SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Sample data
INSERT OR IGNORE INTO posts (slug, title, content, tags, created_at, updated_at) VALUES
('0001', 'ブログ開設のお知らせ', '# ブログ開設のお知らせ

masa86ブログを開設しました。

このブログでは、技術的な学びや日々の開発で得た知識を記録・共有していきます。

## 技術スタック

- **Hono**: 超高速Webフレームワーク
- **Drizzle ORM**: 型安全なORM
- **Cloudflare Workers**: エッジコンピューティング
- **Cloudflare D1**: サーバーレスSQLite

シンプルで高速、堅牢なブログを目指しています。', '["お知らせ"]', datetime('now', '-2 days'), datetime('now', '-2 days')),

('0002', 'Hono + Drizzle + Cloudflare Workersでブログを構築', '# Hono + Drizzle + Cloudflare Workersでブログを構築

## なぜこの構成を選んだか

Next.jsでの構築を試みましたが、OpenNextとCloudflare Pagesの互換性問題に悩まされました。

そこで、よりシンプルで確実な構成として、Hono + Drizzle + Cloudflare Workersを採用しました。

## パフォーマンス

Honoは402,000 ops/secという驚異的なパフォーマンスを誇ります。

Cloudflare Workersのエッジコンピューティングと組み合わせることで、世界中どこからアクセスしても高速なレスポンスを実現できます。

## 開発体験

Drizzle ORMは型安全で、TypeScriptとの相性が抜群です。

D1との連携もスムーズで、開発効率が大幅に向上しました。', '["技術", "Cloudflare", "Hono"]', datetime('now', '-1 day'), datetime('now', '-1 day')),

('0003', 'シンプルさの重要性', '# シンプルさの重要性

## 複雑さとの戦い

モダンなWebフレームワークは機能豊富ですが、その分複雑さも増しています。

Next.jsは素晴らしいフレームワークですが、シンプルなブログには過剰な機能が多く含まれていました。

## ミニマリズムの追求

必要最小限の機能だけを持つシステムは、以下のメリットがあります:

- **高速**: 余分な処理がない
- **安定**: 動く部品が少ない
- **保守性**: コードが理解しやすい
- **デバッグ**: 問題の特定が容易

## 結論

技術選定では、派手さよりも「安定、高速、堅牢」を優先すべきです。', '["技術", "哲学"]', datetime('now'), datetime('now'));
