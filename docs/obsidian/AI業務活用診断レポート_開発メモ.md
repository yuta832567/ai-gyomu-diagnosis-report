# AI業務活用診断レポート 開発メモ

## プロジェクト概要
AIツール（ChatGPT, Copilot, Gemini）を業務にどう活用できるかを診断し、月間の削減時間や具体的な活用アクションを提案するWebアプリケーション。

## 現在の実装状況
- [x] 診断フォーム (Step 1-5) の完成
- [x] 診断ロジック (reportGenerator) の実装
- [x] レポート表示画面 (ReportView) のコンポーネント化
- [x] Supabase による診断結果の永続化
- [x] 共有URL (/report/[shareId]) による閲覧機能
- [x] localStorage によるオフライン・保存失敗時のフォールバック
- [x] 管理画面 (/admin) による診断結果一覧・集計機能
- [x] Vercel 公開用デプロイチェックリストの作成
- [x] Vercel への初回デプロイと主要機能の動作確認済み

## 動作確認済みの内容（Vercel公開環境）
- [x] **/diagnose**: 診断フォームの入力からレポート生成まで正常動作。
- [x] **Supabase連携**: 診断結果が DB に正しく保存されることを確認。
- [x] **/report/[shareId]**: 生成された共有URLでレポートが正しく表示されることを確認。
- [x] **/admin**: 管理ダッシュボードの表示および簡易パスワード認証の動作を確認。
- [x] **CSV出力**: フィルター結果に基づいた CSV ダウンロードが動作することを確認。

### 診断フォーム (/diagnose)
- 5ステップ構成。
- 各ステップでのバリデーション実装済み。
- 「その他」選択時の入力フィールド復元済み。
- 業務候補チップの追加・重複防止機能。

### レポート画面 (/report)
- `ReportView` コンポーネントによる一貫したデザイン。
- KPI表示（月間/年間削減時間）、削減効果ランキング。
- 業務別AI活用ガイド（プロンプト例、品質向上ポイント等）。
- PDF保存、共有リンクコピー、プロンプトコピー機能。

## Supabase保存機能の仕様
- 保存タイミング: Step 5 の「診断レポートを生成する」クリック時。
- 保存先: `diagnoses` テーブル。
- 認証: `anon` ロールによる `INSERT` および `is_public = true` の `SELECT` を許可（RLS設定済み）。
- データ形式: 入力データおよび診断結果を `jsonb` で保持。集計用に属性項目（会社名、役職等）を個別カラムで保持。

## 共有URL (/report/[shareId]) の仕様
- 形式: `/report/rpt_[random_string]`
- 仕組み: クライアント側で事前に `share_id` を生成し、DB保存成功後にその ID を含む URL へリダイレクト。
- 永続性: DB に保存されているため、別端末やシークレットウィンドウからでも閲覧可能。

### 管理画面 (/admin)
- 目的: 診断データの蓄積・分析、および営業提案や社内DX診断への活用。
- 機能:
  - KPI集計（総件数、会社数、削減時間合計、平均スコア）。
  - 診断結果一覧（フィルタリング機能付き）。
  - CSVエクスポート機能（フィルター結果連動、UTF-8 BOM付きでExcel文字化け回避）。
  - 簡易パスワード認証（sessionStorage によるセッション管理）。
  - 検索項目: 会社名（部分一致）、業種（抽出）、AIツール（抽出）。
  - 共有レポートへの直接アクセス導線。
- 注意点: `NEXT_PUBLIC_ADMIN_PASSWORD` を環境変数に設定する必要があります。現在は開発用の簡易認証のため、本番運用時は Supabase Auth 等への移行を推奨します。

## localStorage fallback の仕様
- 保存順序: `localStorage` への保存を先に行い、その後に Supabase への非同期保存を実行。
- エラーハンドリング: Supabase への保存に失敗（または未設定）の場合でも、`/report` へ遷移して `localStorage` のデータを表示。アプリが止まらない設計。

## 環境変数の設定 (.env.local)
以下のキーを `Settings > API` から取得して設定が必要です。
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトの URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase の公開用 API キー (anon key)
※ `service_role` キーはセキュリティ上、フロントエンドでは使用しないでください。

## Supabase側で実施済みの内容
- `diagnoses` テーブル作成済み。
- `docs/supabase-setup.sql` を SQL Editor で実行し、インデックスと RLS ポリシーを適用済み。
- `share_id` が `rpt_...` 形式で正しく保存されることを確認済み。

## 今回解決した不具合
- **Supabase URLのタイプミス**: 接続エラーを解消。
- **/report にfallbackしてしまう問題**: 保存結果の success 判定を厳格化。
- **insert後のselect依存問題**: `insert().select().single()` をやめ、生成済み `share_id` を直接返すことで RLS 制限下でも確実に遷移できるよう改善。

## 動作確認済みの内容
- `npm run build` 成功。
- Supabase に診断データが正常に保存される。
- 診断完了後、`/report/rpt_...` に正しくリダイレクトされる。
- シークレットウィンドウでも共有URLの内容が表示される。

## 次に実装する候補
- [ ] **会社別・業種別集計**: より詳細なダッシュボード分析機能。
- [ ] **CSV/Excel出力**: 診断結果の一括ダウンロード機能。
- [ ] **Vercel公開**: 本番環境へのデプロイ。
- [ ] **管理画面ログイン認証**: Supabase Auth 等を利用した安全なアクセス制限。
- [ ] **OpenAI API (GPT-4o) 連携**: モックロジックから本物のAIによる診断生成への移行。

## GitHub保存コマンド
```bash
git add .
git commit -m "Update development memo"
git push
```

## Obsidian同期コマンド
本プロジェクトのドキュメントを Obsidian Vault へ同期するには、以下のコマンドを実行してください。

```bash
npm run sync:obsidian
```

### 実行方法
1. `docs/obsidian/AI業務活用診断レポート_開発メモ.md` を編集します。
2. ターミナルで `npm run sync:obsidian` を実行します。
3. 指定された Obsidian Vault パスに最新のメモがコピーされます。

### 注意点
- 同期スクリプト内の Vault パスは個人の PC 環境に依存します。パスを変更する場合は `scripts/sync-obsidian.js` を修正してください。
- 同期されるのは `docs/obsidian/` 内の特定ファイルのみです。
- 秘密情報（APIキー等）は絶対に Markdown に含めないでください。

---
最終更新日: 2026-05-09
