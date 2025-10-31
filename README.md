# masa86-blog

個人ブログシステム - Next.js 15 + Cloudflare D1

## 概要

Next.js 15とCloudflare D1を使用したフルスタックブログシステム。
管理画面から記事の作成・編集・削除が可能です。

## 技術スタック

- **フレームワーク**: Next.js 15.5 + Edge Runtime
- **データベース**: Cloudflare D1 (SQLite)
- **デプロイ**: Cloudflare Pages
- **認証**: Basic認証（管理画面のみ）

## Cloudflare Pages デプロイ設定

### ⚠️ 重要: wrangler.tomlを使用しない

このプロジェクトでは、**wrangler.tomlファイルを使用しません**。
すべての設定をCloudflare Dashboardで管理します。

理由:
- wrangler.tomlがあると、Dashboardの設定が上書きされてしまう
- 特にcompatibility_flagsが毎回外れる問題が発生
- Dashboardでの管理の方が安定している

### Cloudflare Dashboard設定

#### 1. ビルド設定
- **Build command**: `npx @cloudflare/next-on-pages`
- **Build output directory**: `.vercel/output/static`

#### 2. D1データベースバインディング
- Settings → Functions → D1 database bindings
- **Variable name**: `DB`
- **D1 database**: `masa86-blog-db`

#### 3. Compatibility Flags（重要）
- Settings → Functions → Compatibility Flags
- **Production**: `nodejs_compat` を追加
- **Preview**: `nodejs_compat` を追加

#### 4. 環境変数（Basic認証）
- Settings → Environment variables
- **BASIC_AUTH_USER**: `mn`
- **BASIC_AUTH_PASS**: `39`

## ローカル開発

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# Cloudflare Pages用ビルド（ローカルテスト）
npm run pages:build

# ローカルプレビュー
npm run preview
```

## データベース

### postsテーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | INTEGER | 主キー |
| slug | TEXT | URL用スラッグ |
| title | TEXT | タイトル |
| content | TEXT | 本文（Markdown） |
| tags | TEXT | タグ（JSON配列） |
| created_at | TEXT | 作成日時 |
| updated_at | TEXT | 更新日時 |

### スキーマ適用

```bash
# リモートD1にスキーマを適用
wrangler d1 execute masa86-blog-db --remote --file=db/migrations/0000_create_posts_table.sql

# ローカルD1にスキーマを適用
wrangler d1 execute masa86-blog-db --file=db/migrations/0000_create_posts_table.sql
```

## 機能

### 公開機能
- トップページ: 最新10件の記事一覧
- 記事詳細ページ: Markdownレンダリング
- タグページ: タグ別記事一覧

### 管理機能（/admin）
- **認証**: Basic認証（ID: mn, Pass: 39）
- 記事一覧: 全記事の管理
- 新規作成: Markdownエディタ
- 編集: 既存記事の編集
- 削除: 記事の削除

## トラブルシューティング

詳細は `docs/TROUBLESHOOTING.md` を参照してください。

### よくある問題

1. **管理画面で500エラー**
   - D1バインディングが設定されているか確認
   - Compatibility flags（`nodejs_compat`）が設定されているか確認

2. **Compatibility flagsが外れる**
   - wrangler.tomlファイルを削除してください
   - すべての設定をDashboardで管理します

3. **トップページにも認証が適用される**
   - middleware.tsのmatcherが`['/admin/:path*']`になっているか確認
   - Dashboardでキャッシュをクリアして再デプロイ

## ライセンス

Private

## 作成者

masa86
