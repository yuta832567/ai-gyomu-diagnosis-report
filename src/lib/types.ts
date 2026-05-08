export type Role = '経営者' | '役員' | '管理職' | '一般従業員' | '研修受講者' | 'その他';

export type CompanySize = '1〜10名' | '11〜50名' | '51〜300名' | '301名以上';

export type AIExperience = '未経験' | '少し使ったことがある' | '業務で使っている';

export type AIToolId = 'chatgpt' | 'copilot' | 'gemini';

export type CategoryId =
  | 'material'
  | 'document'
  | 'info_gathering'
  | 'data_organization'
  | 'data_analysis'
  | 'meeting'
  | 'customer_support'
  | 'sales'
  | 'planning'
  | 'hr'
  | 'accounting'
  | 'education'
  | 'others';

export type FrequencyId =
  | 'daily'
  | 'weekly_3'
  | 'weekly_2'
  | 'weekly_1'
  | 'monthly_2'
  | 'monthly_1'
  | 'yearly_few';

export type ConfidentialityLevel = 'なし' | '一部あり' | '多く含む' | 'わからない';

export interface BasicInfo {
  name: string;
  companyName?: string;
  departmentName?: string;
  role: Role;
  industry: string;
  companySize: CompanySize;
  aiExperience: AIExperience;
  toolsUsed: string[]; // 新規追加
  expectations: string[]; // 新規追加
}

export interface TaskItem {
  id: string;
  title: string;
  categoryId: CategoryId;
  hoursPerTime: number; 
  frequencyId: FrequencyId;
  output?: string; // 新規追加
  tools?: string; // 新規追加
  painPoint?: string;
  confidentiality: ConfidentialityLevel; // 変更: boolean -> string
  notes?: string; // 新規追加
}

export interface DiagnosisData {
  basicInfo: BasicInfo;
  selectedTools: AIToolId[];
  toolPlans: Record<AIToolId, string>; // 新規追加: ツールごとのプラン
  tasks: TaskItem[];
}

export interface DiagnosisResult {
  totalSavingsMonthly: number;
  totalSavingsYearly: number;
  taskResults: {
    taskId: string;
    savingsMonthly: number;
    savingsYearly: number;
    score: number; // 1-5
  }[];
}
