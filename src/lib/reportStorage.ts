import { supabase } from './supabase';
import { DiagnosisData, DiagnosisResult, DiagnosisRecord, SaveDiagnosisResult } from './types';

// localStorageのキー
const STORAGE_INPUT_KEY = 'diagnosis_input';
const STORAGE_RESULT_KEY = 'diagnosis_result';

/**
 * 共有用のID (share_id) を生成する
 * 形式: rpt_[random_string]
 */
const generateShareId = () => {
  const randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `rpt_${randomStr}`;
};

/**
 * 診断結果を保存する
 * 1. 常にlocalStorageに保存
 * 2. Supabaseへの保存（insert）を試みる
 * 3. 事前に生成した share_id を返す
 */
export const saveReport = async (input: DiagnosisData, result: DiagnosisResult): Promise<SaveDiagnosisResult> => {
  // 常に最新データをlocalStorageに保存（オフライン・障害対策）
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_INPUT_KEY, JSON.stringify(input));
    localStorage.setItem(STORAGE_RESULT_KEY, JSON.stringify(result));
  }

  const shareId = generateShareId();

  // Supabaseへの保存試行
  try {
    // カラムとデータのマッピング
    const record = {
      share_id: shareId,
      name: input.basicInfo.name,
      company_name: input.basicInfo.companyName,
      department_name: input.basicInfo.departmentName || null,
      role: input.basicInfo.role === 'その他' ? input.basicInfo.otherRoleText : input.basicInfo.role,
      industry: input.basicInfo.industry,
      company_size: input.basicInfo.companySize,
      selected_tools: input.selectedTools,
      tool_plans: input.toolPlans,
      input_data: input,
      report_data: result,
      is_public: true
    };

    // insertのみ実行（select().single()に依存しない）
    const { error } = await supabase
      .from('diagnoses')
      .insert([record]);

    if (error) {
      console.error('Supabase insert failed:', error);
      return {
        success: false,
        shareId: null,
        error: error.message
      };
    }
    
    return {
      success: true,
      shareId,
      error: null
    };
  } catch (err) {
    console.error('Supabase save failed with exception:', err);
    return {
      success: false,
      shareId: null,
      error: err instanceof Error ? err.message : String(err)
    };
  }
};

/**
 * share_idから診断結果を取得する
 */
export const getReportByShareId = async (shareId: string): Promise<DiagnosisRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('share_id', shareId)
      .eq('is_public', true)
      .single();

    if (error) throw error;
    return data as DiagnosisRecord;
  } catch (err) {
    console.error('Failed to fetch report from Supabase:', err);
    return null;
  }
};

/**
 * localStorageから最新の診断結果を取得する
 */
export const getLocalReport = (): { input: DiagnosisData; result: DiagnosisResult } | null => {
  if (typeof window === 'undefined') return null;

  const inputStr = localStorage.getItem(STORAGE_INPUT_KEY);
  const resultStr = localStorage.getItem(STORAGE_RESULT_KEY);

  if (!inputStr || !resultStr) return null;

  try {
    return {
      input: JSON.parse(inputStr),
      result: JSON.parse(resultStr)
    };
  } catch (err) {
    console.error('Failed to parse local report:', err);
    return null;
  }
};
