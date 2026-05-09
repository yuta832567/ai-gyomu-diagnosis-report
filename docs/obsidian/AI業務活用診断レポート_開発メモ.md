# AI業務活用診断レポート 開発メモ

## 現在の実装状況
- [x] 診断フォーム (Step 1-5) の完成
- [x] 診断ロジック (reportGenerator) の実装
- [x] レポート表示画面 (ReportView) のコンポーネント化
- [x] Supabase による診断結果の永続化
- [x] 共有URL (/report/[shareId]) による閲覧機能
- [x] localStorage によるオフライン・保存失敗時のフォールバック

## Supabase保存の仕様
### テーブル: `diagnoses`
- `share_id`: `rpt_` から始まるランダム文字列。共有URLに使用。
- `is_public`: true のもののみ外部から閲覧可能。
- `input_data`, `report_data`: JSONB形式で全データを保存。
- 分析用個別カラム: `name`, `company_name`, `role`, `industry`, `company_size` など。

### 保存ロジック
1. クライアント側で `share_id` を生成。
2. `localStorage` に保存（即時性確保）。
3. Supabase に `insert`。
4. 成功時は `/report/[shareId]` へ、失敗時は `/report`（localStorage参照）へ遷移。

## /report と /report/[shareId] の違い
- **/report**: `localStorage` に保存された「最新の診断結果」を表示。別端末やシークレットウィンドウでは閲覧不可。
- **/report/[shareId]**: Supabase DB から取得した「特定の診断結果」を表示。URLを知っている人は誰でも閲覧可能。

## 今回の不具合原因
- `saveReport` 関数内で `insert` 直後に `.select('share_id').single()` を実行していた。
- RLSの設定やタイミングにより `select` が失敗し、`shareId` が返らなかったため、常に `/report` へフォールバックしてしまっていた。

## 今回の修正内容
- `insert` 後の `select` 依存を廃止し、事前に生成した `shareId` を直接返すように変更。
- `saveReport` の戻り値を `{ success, shareId, error }` の形式に統一し、呼び出し側でのエラーハンドリングを強化。
- `ReportView` のフッターメッセージをより具体的に修正。

## 次に確認すること
- [ ] 診断実行後、URLが `/report/rpt_...` になっているか。
- [ ] 共有URLをシークレットウィンドウで開いて表示されるか。
- [ ] RLSポリシーが正しく動作しているか（SELECTが可能か）。

## GitHub保存コマンド
```bash
git add .
git commit -m "Fix navigation to shared URL and add development notes for Obsidian"
git push
```
