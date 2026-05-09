import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 環境変数が不足している場合、開発時に警告を出すが、ビルド自体は止めない構成
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Supabaseの環境変数が設定されていません。DB機能は無効化され、localStorageが使用されます。');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
