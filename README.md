# 組立QR — 画面をGitHub、データ処理をGASで管理

指示書・標準図・特図・パラメータ・寸法・マーキングを扱う既存アプリの画面です。

## 開く

入口： https://hikarukitami.github.io/kumitateqr/

「アプリを開く」から、従来のGoogleアカウントで開きます。Google側のアクセス制限は維持しています。GASの公開範囲が「自分のみ」の間は所有者のみ利用できます。

このリポジトリには画面コードだけを置きます。指示書、担当者データ、図面PDF、暗証番号、GASの業務処理コードはアップロードしません。

## 構成

- `src/index.html`：編集する画面のソース（従来の機能を維持）
- `scripts/build.cjs`：画面をGitHub Pages配信用に変換するビルド
- `docs/app.js`・`docs/app.css`：GitHubから配信する画面本体
- `docs/index.html`：利用者向け入口
- `gas/index.html`：GASに置く小さな起動用HTML
- `deployment.json`：公開URLと画面バージョン。秘密情報は入れない
- `tests/build.test.cjs`：起動・二重読み込み・既存API呼び出し維持の検証

GASでGoogleアカウントを確認した後、GitHub Pagesの画面コードを読み込みます。画面は既存の `google.script.run` でGASを呼び、同じスプレッドシートとDriveを使います。公開されたGAS APIや、HTMLに共有パスワードを埋め込む方式は採用していません。

## 今後の画面更新

1. `src/index.html` を編集する
2. `deployment.json` の `version` を更新する
3. Node.jsで `npm run build` → `npm test` を実行する（npm install不要）
4. ソースと生成された `docs/` の変更を `main` にコミットする
5. Pagesの公開完了後、アプリを再読み込みする。画面変更のみならGASの再デプロイは不要

GitHub画面でソースだけを書き換えても生成物は変わりません。ここで更新を依頼する際はビルドと公開確認まで行います。

## 初回の配置

Pagesの公開元を `main` / `/docs` に設定します。
GASでは既存 `Code.gs` をそのまま保持し、`index.html` に `gas/index.html` の内容を配置して新しいバージョンを公開します。シートの初期化関数は実行不要です。

バックエンドの機能を変更したときは、従来どおりGASの新バージョン公開が必要です。GitHubの画面を編集できる人はアプリの動作を変えられるため、共同編集者は管理者が管理してください。

## 復旧

移行前のGASデプロイバージョンへ戻すと、元のGAS内の画面に戻せます。データを移動していないためデータの戻し作業はありません。

## 検証範囲

移行用の起動テストに加え、検証用GASと本番で一覧・標準図ルール画面を確認します。元からある図面03/13の選定条件、個別寸法や印の位置、PC自動取り込みの追加権限、タブレット実機の指操作は、この画面移行によって検証済みになるものではありません。

## 参考

- [GAS HTML Serviceの制限](https://developers.google.com/apps-script/guides/html/restrictions)
- [GitHub Pagesの公開元設定](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
