export type Role = '経営者' | '役員' | '管理職' | '一般従業員' | '研修受講者' | 'その他';

export type CompanySize = '1〜10名' | '11〜50名' | '51〜300名' | '301名以上';

export type AIExperience = '未経験' | '少し使ったことがある' | '業務で使っている';

export type AIUsageFrequency = 'ほぼ使っていない' | '月に数回使っている' | '週に数回使っている' | 'ほぼ毎日使っている';

export type CompanyAIRule = '特に決まっていない' | '社内ルールがある' | '業務利用は禁止されている' | 'わからない';

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
  companyName: string; // 必須に変更
  departmentName?: string;
  role: Role;
  otherRoleText?: string;
  industry: string;
  companySize: CompanySize;
  aiExperience: AIExperience;
  aiUsageFrequency: AIUsageFrequency;
  companyAIRules: CompanyAIRule;
  toolsUsed: string[];
  otherToolsText?: string;
  expectations: string[];
  otherExpectationsText?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  categoryId: CategoryId;
  hoursPerTime: number; 
  frequencyId: FrequencyId;
  outputs: string[]; // 複数選択に変更
  otherOutputText?: string;
  tools: string[]; // 複数選択に変更
  otherToolsText?: string;
  painPoints: string[]; // 複数選択に変更
  otherPainPointsText?: string;
  confidentiality: ConfidentialityLevel;
  notes?: string;
}

export interface DiagnosisData {
  basicInfo: BasicInfo;
  selectedTools: AIToolId[];
  toolPlans: Record<AIToolId, string>;
  tasks: TaskItem[];
}

export interface DiagnosisResult {
  totalSavingsMonthly: number;
  totalSavingsYearly: number;
  taskResults: {
    taskId: string;
    savingsMonthly: number;
    savingsYearly: number;
    score: number;
  }[];
}
