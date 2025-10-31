個人ブログを作ります。
https://github.com/masa162/masa86-blog

ローカルにクローンしました。
D:\github\masa86-blog
新規 レポジトリをgithubに作成しました。
nextjsフルスタックのフレームワーク。
デプロイ先は クラウド フレアです。クラウドフレア ページ 's Worker d1を使います。
- **アカウント**: Belong2jazz@gmail.com

管理画面から新規 記事の作成、編集 削除が行えるブログを作ります。


確認事項
1. どの仕様を参考にしますか？
c) 新しい仕様で作成
2. 既存記事のマイグレーションは必要ですか？
b) 不要（空のデータベースから開始）
3. 管理画面の認証情報は？
a) 他のプロジェクトと同じ（ID: mn / Pass: 39）
4. デプロイ先のCloudflare Pagesプロジェクト名は？
a) masa86-blog
番号と記号で回答していただければ（例：「1a, 2a, 3a, 4a」）、詳細な実装計画を作成いたします。


デプロイできました。
https://masa86-blog.pages.dev/
管理画面ではなく、フロントの方にも フロントのトップページにもベーシック認証が適用されてしまっています。管理画面にだけに ベーシック認証 を適用したいです。

https://masa86-blog.pages.dev/admin

Application error: a server-side exception has occurred while loading masa86-blog.pages.dev (see the server logs for more information).
Digest: 1451333353
