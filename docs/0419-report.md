# 作業報告書 2026-04-19

**プロジェクト**: 中山雑記 / masa86-blog  
**担当**: masa162  
**作業時間**: 2026-04-19

---

## 作業概要

画像CDN移行（`img.be2long.com` → `img.tokyo86.com`）の抜け漏れ修正と、旧パス形式のリンク切れ画像行の一括削除。

---

## 実施作業

### 1. 旧CDNドメイン置換（抜け漏れ分）

2026-04-05 のメンテで `img.be2nd.com` / `img.unbelong.xyz` は修正済みだったが、`img.be2long.com` が未対応のまま残っていた。

| 旧URL | 新URL | 修正記事数 |
|---|---|---|
| `img.be2long.com` | `img.tokyo86.com` | 14記事・28行 |

```sql
UPDATE posts
SET content = REPLACE(content, 'img.be2long.com', 'img.tokyo86.com')
WHERE content LIKE '%img.be2long.com%';
```

修正確認: 旧URL残数 = **0**

### 2. 旧パス形式リンク切れ画像行の削除

`img.be2long.com` 時代は `/img/YYYY/MMDD/NNN.webp` というディレクトリ構造で運用していたが、現在の `img.tokyo86.com` Worker は `/{batchId}/{seq}` と `/{id}` の2パターンしか処理しない。旧パスの画像は Cloudflare Images に移行されておらず、永続的に404となるため削除を選択。

| 記事 | 削除枚数 |
|---|---|
| 0033 〜 0048（14記事） | 計 **97枚** |

Node.jsスクリプトで正規表現 `!\[.*?\]\(https://img\.tokyo86\.com\/img\/[^\)]+\)` にマッチする行を除去し、各記事を個別 UPDATE。

削除確認: 残数 = **0**

---

## 根本原因

CDN移行を繰り返す過程でドメインが複数生まれ（`be2long.com` / `be2nd.com` / `unbelong.xyz`）、一括置換のたびに1ドメインずつ抜け漏れが発生していた。

---

## 今後の運用方針

画像は必ず **tokyo86img 管理画面でアップロード → `img.tokyo86.com/{slug}` 形式のURLを取得 → 記事に貼る** の順で行う。

Cloudflare Images の画像IDはUUID固定のため、Worker名・ドメイン変更があってもURLは不変。同様の問題は再発しない。

---

## 技術メモ

- `img.tokyo86.com` Worker のパスパターン: `/{batchId6文字}/{seq3桁}` または `/{id}`
- `/img/YYYY/MMDD/` 形式は Worker 非対応（マッチするルートなし）
- tokyo86-db `images` テーブル: 87件（全てCloudflare Images UUID形式）

---

## Git

変更なし（本番D1への直接SQLのみ）
