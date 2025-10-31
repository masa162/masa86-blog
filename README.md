# masa86-blog

個人ブログシステム - Next.js 15 + Cloudflare Pages + D1

## 概要

シンプルで堅牢な個人ブログシステム。記事の作成・編集・削除を管理画面から行えます。

### 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **ランタイム**: React 19
- **言語**: TypeScript
- **スタイリング**: TailwindCSS 4
- **インフラ**: Cloudflare Pages + Workers + D1
- **認証**: Basic認証

## 機能

### 公開サイト

- トップページ（最新10件の記事表示）
- 記事詳細ページ（Markdownレンダリング）
- タグページ（タグ別記事一覧）
- レスポンシブデザイン
- ダークモード対応

### 管理画面（`/admin`）

- Basic認証で保護
- 記事一覧表示
- 新規記事作成（自動slug割り当て）
- 記事編集
- 記事削除

## ローカル開発

### 前提条件

- Node.js 20以上
- npm
- Cloudflare アカウント
- Wrangler CLI

### セットアップ

1. **依存関係のインストール**

```bash
npm install
```

2. **D1データベースの作成**

```bash
npx wrangler d1 create masa86-blog-db
```

作成されたデータベースIDをメモしてください。

3. **データベースのマイグレーション**

```bash
npx wrangler d1 execute masa86-blog-db --local --file=./db/migrations/0000_create_posts_table.sql
```

本番環境用:

```bash
npx wrangler d1 execute masa86-blog-db --remote --file=./db/migrations/0000_create_posts_table.sql
```

4. **環境変数の設定（ローカル開発）**

`.dev.vars`ファイルを作成:

```
BASIC_AUTH_USER=mn
BASIC_AUTH_PASS=39
```

5. **wrangler.tomlの更新**

`wrangler.toml`のdatabase_idを実際のIDに更新:

```toml
[[d1_databases]]
binding = "DB"
database_name = "masa86-blog-db"
database_id = "your-database-id-here"
```

6. **ローカル開発サーバーの起動**

```bash
npm run dev
```

または、Cloudflare環境でのプレビュー:

```bash
npm run preview
```

## デプロイ

### Cloudflare Pagesへのデプロイ

#### 1. D1データベースの作成（本番環境）

```bash
npx wrangler d1 create masa86-blog-db
```

#### 2. マイグレーション実行

```bash
npx wrangler d1 execute masa86-blog-db --remote --file=./db/migrations/0000_create_posts_table.sql
```

#### 3. Cloudflare Dashboard設定

1. **Pagesプロジェクト作成**
   - Workers & Pages → Create application → Pages → Connect to Git
   - リポジトリ: `masa162/masa86-blog`
   - Production branch: `main`

2. **ビルド設定**
   - Build command: `npx @cloudflare/next-on-pages`
   - Build output directory: `.vercel/output/static`
   - Root directory: (空欄)

3. **環境変数の設定**
   - Settings → Environment variables
   ```
   BASIC_AUTH_USER = mn
   BASIC_AUTH_PASS = 39
   ```

4. **D1バインディング**
   - Settings → Functions → D1 database bindings
   - Variable name: `DB`
   - D1 database: `masa86-blog-db`

5. **Compatibility flags**
   - Settings → Functions → Compatibility flags
   - `nodejs_compat`を追加

#### 4. デプロイ

GitHubにプッシュすると自動デプロイされます:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

または、Wranglerから直接デプロイ:

```bash
npm run deploy
```

## プロジェクト構成

```
masa86-blog/
├── db/
│   └── migrations/          # D1マイグレーションSQL
├── docs/
│   └── memo.md              # メモ
├── src/
│   ├── app/
│   │   ├── [slug]/          # 記事詳細ページ
│   │   ├── admin/           # 管理画面
│   │   ├── api/posts/       # Posts API
│   │   ├── tags/[tag]/      # タグページ
│   │   ├── layout.tsx       # ルートレイアウト
│   │   ├── page.tsx         # トップページ
│   │   └── globals.css      # グローバルCSS
│   ├── lib/
│   │   ├── d1.ts            # D1データベースクライアント
│   │   └── utils.ts         # ユーティリティ関数
│   ├── types/
│   │   ├── cloudflare.ts    # Cloudflare型定義
│   │   └── database.ts      # データベース型定義
│   └── middleware.ts        # Basic認証
├── next.config.ts
├── package.json
├── tsconfig.json
└── wrangler.toml
```

## データベーススキーマ

### postsテーブル

| カラム名    | 型      | 説明                      |
| ----------- | ------- | ------------------------- |
| id          | INTEGER | 主キー（自動採番）        |
| slug        | TEXT    | URL用識別子（0001-9999）  |
| title       | TEXT    | 記事タイトル              |
| content     | TEXT    | 本文（Markdown）          |
| tags        | TEXT    | タグ（JSON配列）          |
| created_at  | TEXT    | 作成日時（ISO8601）       |
| updated_at  | TEXT    | 更新日時（ISO8601）       |

## API仕様

### GET /api/posts

記事一覧の取得

**クエリパラメータ:**
- `limit`: 取得件数（デフォルト: 10）
- `tag`: タグでフィルタ
- `search`: タイトル・本文で検索

### GET /api/posts/[id]

記事詳細の取得

### POST /api/posts

記事の作成（要認証）

**リクエストボディ:**
```json
{
  "title": "記事タイトル",
  "content": "本文（Markdown）",
  "tags": ["タグ1", "タグ2"]
}
```

### PUT /api/posts/[id]

記事の更新（要認証）

### DELETE /api/posts/[id]

記事の削除（要認証）

## 使い方

### 記事の作成

1. `/admin`にアクセス
2. Basic認証でログイン（ID: mn / Pass: 39）
3. 「新規作成」ボタンをクリック
4. タイトル、本文、タグを入力して保存
5. slugは自動で割り当てられます（0001, 0002, ...）

### 記事の編集・削除

1. 管理画面の記事一覧から「編集」ボタンをクリック
2. 内容を変更して「更新」ボタン
3. 削除する場合は「削除」ボタン

## トラブルシューティング

### ビルドエラー

```bash
npm run build
```

でエラーが出る場合、TypeScriptの型エラーを確認してください。

### D1接続エラー

- Cloudflare Dashboardでバインディングが正しく設定されているか確認
- `wrangler.toml`のdatabase_idが正しいか確認

### 認証が通らない

- 環境変数`BASIC_AUTH_USER`と`BASIC_AUTH_PASS`が設定されているか確認
- Cloudflare Dashboard → Settings → Environment variablesで確認

## ライセンス

MIT

## 作成者

masa86 (Belong2jazz@gmail.com)

## 参考

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)

