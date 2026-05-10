# masa86-blog 運用ノート

作業ログ・メンテ記録。docs/は廃止、ここに一本化。

---

## 2026-05-10

- sitemap.xml が `blog.masa86.com` から302リダイレクトしていた問題を修正
  - 原因: `src/routes/public.ts` のsitemap処理にカスタムドメイン→workers.devへのリダイレクトが残っていた
  - 対応: リダイレクト処理を削除、全ドメインから直接200で返すよう修正
  - デプロイ: `npx wrangler deploy`
- README.md を実態に合わせ更新（Live URL修正、運用メモ追加）
- Google Search Console にsitemap.xml を再登録

## デプロイ手順

```bash
cd /Users/nakayamamasayuki/Documents/GitHub/masa86-blog
npm install   # 初回またはpackage.json変更後のみ
npx wrangler deploy
```
