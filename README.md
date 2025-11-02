# masa86 Blog

シンプルで高速、堅牢なブログシステム

**Live URL**: https://masa86-blog.belong2jazz.workers.dev

## 技術スタック

- **Hono** v4 - 超高速Webフレームワーク (402k ops/sec)
- **Drizzle ORM** - 型安全なORM with D1サポート
- **Cloudflare Workers** - エッジコンピューティング
- **Cloudflare D1** - サーバーレスSQLite
- **TypeScript** - 型安全な開発

## なぜこの構成？

Next.js + OpenNext + Cloudflare Pagesでの構築を試みましたが、互換性問題で500エラーが頻発しました。

そこで、**シンプルさと安定性**を優先し、Hono + Drizzle + Cloudflare Workersに移行。

### メリット

- ✅ **高速**: Honoは超軽量、レスポンス時間 < 100ms
- ✅ **安定**: 複雑な抽象化なし、動く部品が少ない
- ✅ **堅牢**: エッジコンピューティングで99.9%稼働率
- ✅ **保守性**: コードがシンプルで理解しやすい

## プロジェクト構成

```
masa86-blog/
├── src/
│   ├── index.ts              # エントリーポイント
│   ├── routes/
│   │   ├── api.ts            # REST API
│   │   ├── admin.ts          # 管理画面
│   │   └── public.ts         # 公開ページ
│   ├── middleware/
│   │   └── auth.ts           # Basic認証
│   ├── services/
│   │   └── posts.ts          # ビジネスロジック
│   ├── db/
│   │   └── schema.ts         # Drizzleスキーマ
│   ├── views/
│   │   ├── layout.ts         # HTMLレイアウト
│   │   ├── home.ts           # ホーム画面
│   │   ├── post.ts           # 記事詳細
│   │   └── admin.ts          # 管理画面
│   └── types/
│       └── index.ts          # 型定義
├── docs/
│   ├── 要件定義書.md
│   └── 技術仕様書.md
├── wrangler.toml             # Cloudflare設定
├── schema.sql                # D1スキーマ
└── package.json
```

## 開発環境セットアップ

### 前提条件

- Node.js 20+
- pnpm
- Cloudflareアカウント

### インストール

```bash
# 依存関係インストール
pnpm install

# ローカル環境変数設定
cat > .dev.vars << 'EOF'
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password_here
EOF

# ローカルD1データベースにスキーマ適用
wrangler d1 execute masa86-blog-db --local --file=schema.sql

# 開発サーバー起動
pnpm dev
```

開発サーバー: http://localhost:8787

## API仕様

### 公開エンドポイント

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/posts` | 記事一覧取得 |
| GET | `/api/posts/:slug` | 記事詳細取得 |
| GET | `/api/tags` | タグ一覧取得 |
| GET | `/health` | ヘルスチェック |

### 認証必須エンドポイント

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/posts` | 記事作成 |
| PUT | `/api/posts/:slug` | 記事更新 |
| DELETE | `/api/posts/:slug` | 記事削除 |

### 使用例

```bash
# 記事一覧取得
curl https://masa86-blog.belong2jazz.workers.dev/api/posts

# 記事作成（要認証）
curl -X POST https://masa86-blog.belong2jazz.workers.dev/api/posts \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "new-post",
    "title": "新しい記事",
    "content": "# 内容\n\nMarkdown形式",
    "tags": ["技術", "ブログ"]
  }'

# 記事削除（要認証）
curl -X DELETE https://masa86-blog.belong2jazz.workers.dev/api/posts/new-post \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)"
```

## デプロイ

```bash
# 本番環境のパスワード設定（初回のみ）
echo "your_secure_password" | wrangler secret put ADMIN_PASSWORD

# デプロイ
wrangler deploy
```

## ページ

- **ホーム**: `/` - 記事一覧
- **記事詳細**: `/posts/:slug` - 個別記事
- **管理画面**: `/admin` - 記事管理（要認証）

## パフォーマンス

- API応答時間: **< 100ms**
- ページ表示: **< 200ms**
- D1クエリ: **< 50ms**
- Workers起動: **< 10ms**

## セキュリティ

- Basic認証（HTTPS強制）
- Drizzle ORMによるSQLインジェクション対策
- Honoの自動エスケープによるXSS対策
- Cloudflare自動DDoS保護

## ライセンス

MIT

## 作者

masa86

---

**Previous Attempts**:
- ❌ Next.js + @cloudflare/next-on-pages → Deprecated
- ❌ Next.js + OpenNext + Cloudflare Pages → 500 errors

**Current Solution**:
- ✅ Hono + Drizzle + Cloudflare Workers → **Stable & Fast**
