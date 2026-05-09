-- AI業務活用診断レポート データベースセットアップ

-- 1. 診断結果テーブルの作成
CREATE TABLE IF NOT EXISTS diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    department_name TEXT,
    role TEXT NOT NULL,
    industry TEXT NOT NULL,
    company_size TEXT NOT NULL,
    selected_tools JSONB NOT NULL DEFAULT '[]',
    tool_plans JSONB NOT NULL DEFAULT '{}',
    input_data JSONB NOT NULL,
    report_data JSONB NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_diagnoses_share_id ON diagnoses(share_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON diagnoses(created_at);

-- 3. RLS (Row Level Security) の設定
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

-- 4. ポリシーの設定

-- INSERT: 匿名ユーザー（診断受験者）による保存を許可
CREATE POLICY "Enable insert for anonymous users" 
ON diagnoses FOR INSERT 
WITH CHECK (true);

-- SELECT: 公開設定 (is_public = true) のもののみ、誰でも閲覧可能（共有機能用）
CREATE POLICY "Enable read access for all users for public reports" 
ON diagnoses FOR SELECT 
USING (is_public = true);

-- UPDATE/DELETE: 匿名ユーザーによる更新・削除は禁止（管理画面実装時に別途管理者ポリシーを設定）

-- 5. 更新日時自動更新用の関数とトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_diagnoses_updated_at
    BEFORE UPDATE ON diagnoses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
