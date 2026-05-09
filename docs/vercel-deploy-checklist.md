# Vercel デプロイ前チェックリスト

Vercel に公開し、外部から診断フォームや共有レポートを確認できるようにするための最終確認項目です。

## 1. Vercel 環境変数の設定
Vercel のプロジェクト設定（Project Settings > Environment Variables）に以下の項目を必ず設定してください。

| キー名 | 説明 | 備考 |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL | Project Settings > API より取得 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon key | Project Settings > API より取得 |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | 管理画面 (/admin) のパスワード | 任意の文字列を設定 |

> [!WARNING]
> **セキュリティに関する注意**
> `NEXT_PUBLIC_ADMIN_PASSWORD` による認証は、フロントエンド側での簡易的なパスワード保護です。ブラウザのソースコードからパスワードが特定されるリスクがあるため、機密性の高いデータを扱う本番運用では **Supabase Auth** 等による本格的なログイン認証への移行を強く推奨します。

## 2. Supabase 側の設定確認
- [ ] `diagnoses` テーブルが作成されているか。
- [ ] `docs/supabase-setup.sql` の RLS ポリシーが適用されているか。
    - `INSERT`: 認証なし（anon）で許可されているか。
    - `SELECT`: `is_public = true` の場合に認証なし（anon）で許可されているか。
- [ ] `share_id` カラムに重複がないか（ユニーク制約）。

## 3. 機能動作確認項目
デプロイ後、以下の項目を実機（またはブラウザ）で確認してください。

### /diagnose (診断フォーム)
- [ ] ステップ 1〜5 まで正常に進めるか。
- [ ] 診断完了後、`/report/rpt_...` へ正常にリダイレクトされるか。
- [ ] Supabase のテーブルに新しいレコードが追加されているか。

### /report/[shareId] (共有レポート)
- [ ] 診断結果が正しく表示されるか。
- [ ] 共有リンクのコピー、PDF保存、プロンプトコピーが動作するか。
- [ ] **シークレットウィンドウ**で開き、ログインなしで閲覧できるか。

### /admin (管理ダッシュボード)
- [ ] 設定したパスワードでログインできるか。
- [ ] 診断結果一覧が表示され、フィルター（検索・抽出）が動作するか。
- [ ] CSV出力が実行でき、Excel で文字化けせず開けるか。

## 4. 注意点
- **Vercel のリージョン**: Supabase のデータベースリージョンに近い場所（東京など）を選択することを推奨します。
- **ビルドエラー**: ローカルで `npm run build` が成功することを確認してからプッシュしてください。
- **URL**: デプロイ後の本番 URL を確認し、共有リンクなどの挙動に問題がないか確認してください。
