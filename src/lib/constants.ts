import { 
  CategoryId, 
  FrequencyId, 
  AIToolId, 
  Role, 
  CompanySize, 
  AIExperience, 
  AIUsageFrequency, 
  CompanyAIRule, 
  ConfidentialityLevel 
} from './types';

export const ROLES: Role[] = ['経営者', '役員', '管理職', '一般従業員', '研修受講者', 'その他'];

export const COMPANY_SIZES: CompanySize[] = ['1〜10名', '11〜50名', '51〜300名', '301名以上'];

export const AI_EXPERIENCES: AIExperience[] = ['未経験', '少し使ったことがある', '業務で使っている'];

export const AI_USAGE_FREQUENCIES: AIUsageFrequency[] = [
  'ほぼ使っていない',
  '月に数回使っている',
  '週に数回使っている',
  'ほぼ毎日使っている'
];

export const COMPANY_AI_RULES: CompanyAIRule[] = [
  '特に決まっていない',
  '社内ルールがある',
  '業務利用は禁止されている',
  'わからない'
];

export const TOOLS_USED_GROUPS = [
  {
    label: 'Microsoft系',
    tools: ['Word', 'Excel', 'PowerPoint', 'Outlook', 'Teams', 'OneDrive / SharePoint']
  },
  {
    label: 'Google系',
    tools: ['Gmail', 'Google Docs', 'Google Sheets', 'Google Slides', 'Google Drive', 'Google Meet']
  },
  {
    label: 'コミュニケーション',
    tools: ['Zoom', 'Slack', 'Chatwork']
  },
  {
    label: 'その他業務ツール',
    tools: ['Notion', 'Canva', '会計・経理ソフト', 'CRM / SFA', 'その他']
  }
];

export const EXPECTATIONS = [
  '作業時間を減らしたい',
  '誤字脱字やミスを減らしたい',
  '資料や文章の質を上げたい',
  'アイデア出しに使いたい',
  'データ分析に使いたい',
  '業務の属人化を減らしたい',
  '情報収集を効率化したい',
  '会議や議事録を効率化したい',
  '顧客対応の品質を上げたい',
  '社内ナレッジを整理したい',
  'AIで何ができるか知りたい',
  'その他'
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

export interface PlanMetadata {
  label: string;
  description: string;
  diagnosisNote: string;
  isBusiness: boolean;
}

export const AI_PLANS_METADATA: Record<AIToolId, PlanMetadata[]> = {
  chatgpt: [
    { label: 'Free', description: '体験・軽作業向け。', diagnosisNote: '業務利用では一部機能に制限がある可能性があります。', isBusiness: false },
    { label: 'Go', description: '個人利用の実用ライン。', diagnosisNote: '基本的な業務活用を想定します。', isBusiness: false },
    { label: 'Plus', description: '高度なモデルを利用可能。', diagnosisNote: '実務での本格利用を想定します。', isBusiness: false },
    { label: 'Pro', description: 'より高速・高機能な個人向け。', diagnosisNote: '高度な実務活用を想定します。', isBusiness: false },
    { label: 'Business', description: '企業利用向け。', diagnosisNote: '業務利用や管理面を考慮した提案を行います。', isBusiness: true },
    { label: 'Enterprise', description: '大規模組織向け。', diagnosisNote: '高度なセキュリティと管理機能を前提とします。', isBusiness: true },
    { label: 'わからない', description: 'プラン不明。', diagnosisNote: '一般的な条件で注意付き診断を行います。', isBusiness: false },
  ],
  copilot: [
    { label: 'Copilot Chatのみ', description: 'ブラウザ上でのAIチャット利用。', diagnosisNote: '基本的なテキスト処理を想定します。', isBusiness: false },
    { label: 'Microsoft 365 Business Standardのみ', description: 'Officeアプリのみ（AIなし）。', diagnosisNote: 'AI未導入状態として診断します。', isBusiness: false },
    { label: 'Business Standard + Microsoft 365 Copilot', description: 'Officeアプリ連携AI。', diagnosisNote: 'Office業務の自動化を最大限考慮します。', isBusiness: true },
    { label: 'その他Microsoft 365プラン + Copilot', description: 'エンタープライズ等。', diagnosisNote: '企業環境での高度な連携を想定します。', isBusiness: true },
    { label: 'わからない', description: 'プラン不明。', diagnosisNote: '一般的な条件で注意付き診断を行います。', isBusiness: false },
  ],
  gemini: [
    { label: '無料版', description: '体験・個人利用。', diagnosisNote: '基本的な機能を前提とします。', isBusiness: false },
    { label: 'Google AIプラン', description: '個人向けプレミアム。', diagnosisNote: '高度なモデル利用を想定します。', isBusiness: false },
    { label: 'Google Workspace Business Starter', description: '小規模ビジネス向け。', diagnosisNote: '基本的なWorkspace連携を想定します。', isBusiness: true },
    { label: 'Google Workspace Business Standard以上', description: '標準ビジネス向け。', diagnosisNote: '実務での高度な連携を想定します。', isBusiness: true },
    { label: 'Google Workspace Business Plus / Enterprise', description: '大規模・高機能。', diagnosisNote: '高度な管理機能と連携を想定します。', isBusiness: true },
    { label: 'わからない', description: 'プラン不明。', diagnosisNote: '一般的な条件で注意付き診断を行います。', isBusiness: false },
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

export const TASK_SUGGESTIONS: { title: string; categoryId: CategoryId }[] = [
  { title: 'メール作成・返信', categoryId: 'document' },
  { title: '会議議事録作成', categoryId: 'meeting' },
  { title: '提案資料作成', categoryId: 'material' },
  { title: 'Excel集計', categoryId: 'data_organization' },
  { title: 'アンケート分析', categoryId: 'data_analysis' },
  { title: '顧客対応文作成', categoryId: 'customer_support' },
  { title: 'マニュアル作成', categoryId: 'document' },
  { title: '研修資料作成', categoryId: 'education' },
  { title: '情報収集', categoryId: 'info_gathering' },
  { title: 'アイデア出し', categoryId: 'planning' },
  { title: '報告書作成', categoryId: 'document' },
  { title: 'FAQ作成', categoryId: 'customer_support' },
];

export const OUTPUTS = [
  'メール', '資料', '表・データ', '議事録', '報告書', 
  'マニュアル', 'アイデア', '分析結果', '顧客対応文', 'その他'
];

export const PAIN_POINTS = [
  '時間がかかる', '誤字脱字が不安', '構成を考えるのが難しい', 
  '抜け漏れが不安', '分析や整理が大変', '毎回同じ作業をしている', 
  '品質にばらつきがある', 'その他'
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
