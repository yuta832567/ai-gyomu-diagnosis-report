import { CategoryId, FrequencyId, AIToolId, Role, CompanySize, AIExperience, ConfidentialityLevel } from './types';

export const ROLES: Role[] = ['経営者', '役員', '管理職', '一般従業員', '研修受講者', 'その他'];

export const COMPANY_SIZES: CompanySize[] = ['1〜10名', '11〜50名', '51〜300名', '301名以上'];

export const AI_EXPERIENCES: AIExperience[] = ['未経験', '少し使ったことがある', '業務で使っている'];

export const TOOLS_USED = [
  'Word', 'Excel', 'PowerPoint', 'Outlook', 'Teams', 
  'Gmail', 'Google Docs', 'Google Sheets', 'Google Slides', 'その他'
];

export const EXPECTATIONS = [
  '作業時間を減らしたい',
  '誤字脱字やミスを減らしたい',
  '資料や文章の質を上げたい',
  'アイデア出しに使いたい',
  'データ分析に使いたい',
  '業務の属人化を減らしたい'
];

export const AI_TOOLS: { id: AIToolId; label: string; description: string; tags: string[] }[] = [
  { 
    id: 'chatgpt', 
    label: 'ChatGPT', 
    description: 'OpenAIが提供する世界で最も有名なAI',
    tags: ['文章作成', '壁打ち', 'ファイル読解', 'データ分析', '画像生成']
  },
  { 
    id: 'copilot', 
    label: 'Copilot', 
    description: 'Microsoft 365と深く連携するビジネスAI',
    tags: ['Word', 'Excel', 'PowerPoint', 'Outlook', 'Teams']
  },
  { 
    id: 'gemini', 
    label: 'Gemini', 
    description: 'Googleのエコシステムと連携する強力なAI',
    tags: ['Gmail', 'Google Docs', 'Sheets', 'Slides', 'Drive']
  },
];

export const AI_PLANS: Record<AIToolId, string[]> = {
  chatgpt: ['Free', 'Go', 'Plus', 'Pro', 'Business', 'Enterprise', 'わからない'],
  copilot: [
    'Copilot Chatのみ',
    'Microsoft 365 Business Standardのみ',
    'Business Standard + Microsoft 365 Copilot',
    'その他Microsoft 365プラン + Copilot',
    'わからない'
  ],
  gemini: [
    '無料版',
    'Google AIプラン',
    'Google Workspace Business Starter',
    'Google Workspace Business Standard以上',
    'Google Workspace Business Plus / Enterprise',
    'わからない'
  ]
};

export const CATEGORIES: { id: CategoryId; label: string; description: string; }[] = [
  { id: 'material', label: '資料作成', description: 'スライド、チラシ、提案資料など' },
  { id: 'document', label: '文書作成', description: 'メール、報告書、議事録清書など' },
  { id: 'info_gathering', label: '情報収集', description: 'リサーチ、競合調査など' },
  { id: 'data_organization', label: 'データ整理', description: 'Excel整形、リスト作成など' },
  { id: 'data_analysis', label: 'データ分析', description: '数値分析、傾向把握など' },
  { id: 'meeting', label: '会議関連', description: 'アジェンダ作成、録音の要約など' },
  { id: 'customer_support', label: '顧客対応', description: '問い合わせ返信、FAQ作成など' },
  { id: 'sales', label: '営業活動', description: 'テレアポ台本、顧客リサーチなど' },
  { id: 'planning', label: '企画・アイデア出し', description: '新規事業、キャンペーン企画など' },
  { id: 'hr', label: '人事・採用', description: '求人票、面接質問作成など' },
  { id: 'accounting', label: '経理・総務', description: '規程作成、経費チェックなど' },
  { id: 'education', label: '教育・研修', description: 'マニュアル作成、研修カリキュラムなど' },
  { id: 'others', label: 'その他', description: 'その他の業務' },
];

export const TASK_SUGGESTIONS = [
  'メール作成・返信', '会議議事録作成', '提案資料作成', 'Excel集計', 
  'アンケート分析', '顧客対応文作成', 'マニュアル作成', '研修資料作成', 
  '情報収集', 'アイデア出し', '報告書作成', 'FAQ作成'
];

export const FREQUENCIES: Record<FrequencyId, { label: string; monthlyMultiplier: number }> = {
  daily: { label: '毎日', monthlyMultiplier: 20 },
  weekly_3: { label: '週3回', monthlyMultiplier: 12 },
  weekly_2: { label: '週2回', monthlyMultiplier: 8 },
  weekly_1: { label: '週1回', monthlyMultiplier: 4 },
  monthly_2: { label: '月2回', monthlyMultiplier: 2 },
  monthly_1: { label: '月1回', monthlyMultiplier: 1 },
  yearly_few: { label: '年数回', monthlyMultiplier: 0.25 },
};

export const PAIN_POINTS = [
  '時間がかかる',
  '誤字脱字が不安',
  '構成を考えるのが難しい',
  '抜け漏れが不安',
  '分析や整理が大変',
  '毎回同じ作業をしている',
  '品質にばらつきがある'
];

export const CONFIDENTIALITY_LEVELS: ConfidentialityLevel[] = ['なし', '一部あり', '多く含む', 'わからない'];

export const REDUCTION_RATES: Record<CategoryId, number> = {
  material: 0.4,
  document: 0.5,
  info_gathering: 0.6,
  data_organization: 0.5,
  data_analysis: 0.4,
  meeting: 0.3,
  customer_support: 0.4,
  sales: 0.3,
  planning: 0.5,
  hr: 0.4,
  accounting: 0.3,
  education: 0.4,
  others: 0.2,
};
