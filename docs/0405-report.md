# 作業報告書 2026-04-05

**プロジェクト**: 中山雑記 / masa86-blog  
**担当**: masa162  
**作業時間**: 2026-04-05

---

## 作業概要

半年ぶりのメンテナンス。画像CDNのURL変更に伴うリンク切れ修正をメインに、コード改善・環境更新・デプロイまで実施。

---

## 実施作業

### 1. 本番D1 画像URL一括置換

画像CDNのリブランドにより全記事の画像が非表示になっていた問題を修正。

| 旧URL | 新URL | 修正記事数 |
|---|---|---|
| `img.be2nd.com` | `img.masa86.com` | 9記事 |
| `img.unbelong.xyz` | `img.tokyo86.com` | 9記事 |

**合計18記事** の画像リンクを復旧。SQLite の `REPLACE()` 関数を使い wrangler d1 execute --remote で直接本番DBに適用。

修正確認: 旧URL残数 = **0**

### 2. パッケージ更新

| パッケージ | 旧バージョン | 新バージョン |
|---|---|---|
| `wrangler` | 4.38.0 | **4.80.0** |
| `@cloudflare/workers-types` | 4.20251014.0 | **4.20260405.1** |

### 3. コードリファクタリング（3件）

**src/utils/shortcodes.ts**
- `escapeHtml` 関数がamazon・audioショートコード内に重複定義されていた
- モジュールレベルに1つに集約

**src/services/posts.ts**
- `parseTags()` ヘルパー追加: `JSON.parse(tags)` を全10箇所で置換。try-catchにより malformed JSON でのクラッシュを防止
- `createDb()` ヘルパー追加: 全関数で繰り返されていた `drizzle(db)` 呼び出しを一元管理

### 4. ファイル整理

移行スクリプト群（Hugo → D1 移行時の残骸）を `scripts/archive/` に移動:
- `migrate-from-hugo.js`
- `migration-data.sql`（旧URLも修正済み）
- `migration-mapping.json`
- `migration-mapping-test.json`

### 5. wrangler.toml 記録追記

カスタムドメイン `blog.masa86.com` の設定場所（Cloudflare Dashboard）をコメントで記録。

### 6. デプロイ

- **Version ID**: `29f1a2eb-2381-4791-b7e3-a836b17a99cf`
- **Workers URL**: https://masa86-blog.belong2jazz.workers.dev
- **カスタムドメイン**: https://blog.masa86.com

---

## 環境評価サマリー

| 項目 | 評価 |
|---|---|
| 技術スタック（Hono + Cloudflare Workers + D1） | 2026年基準でも現代的で適切 ✓ |
| セキュリティ基本設定（Basic Auth, Drizzle ORM） | 問題なし ✓ |
| パッケージバージョン | 今回更新済み ✓ |
| コード品質（個人ブログ用途） | 7/10 → 今回修正で改善 |

---

## 今後のアドバイス（PMビュー）

1. **月次DBバックアップ**: `npx wrangler d1 export masa86-blog-db --remote --output=backups/YYYYMMDD.sql`
2. **AI記事アシスト**: 管理画面にClaude API連携の下書き生成ボタン追加（高インパクト）
3. **自動タグ付け**: 投稿時にコンテンツからタグをサジェスト
4. **marked を 17.x にアップ**: `npx wrangler deploy` 前に `pnpm update marked`
5. **デプロイコマンド**: `pnpm deploy` はworkspace制限でエラーになるため `npx wrangler deploy` を使用

---

## Git

- **コミット**: `427213b` — maint: 2026-04-05 半年ぶりメンテ
- **ブランチ**: main
- **リモート**: push済み
