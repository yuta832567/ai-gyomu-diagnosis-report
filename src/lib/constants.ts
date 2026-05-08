import { CategoryId, FrequencyId, AIToolId, Role, CompanySize, AIExperience } from './types';

export const ROLES: Role[] = ['経営者', '役員', '管理職', '一般従業員', '研修受講者', 'その他'];

export const COMPANY_SIZES: CompanySize[] = ['1〜10名', '11〜50名', '51〜300名', '301名以上'];

export const AI_EXPERIENCES: AIExperience[] = ['未経験', '少し使ったことがある', '業務で使っている'];

export const CATEGORIES: { id: CategoryId; label: string; description: string; suggestions: string[] }[] = [
  { id: 'material', label: '資料作成', description: 'スライド、チラシ、提案資料など', suggestions: ['プレゼン構成案作成', '営業資料の下書き'] },
  { id: 'document', label: '文書作成', description: 'メール、報告書、議事録清書など', suggestions: ['お礼メール作成', '週報の下書き作成'] },
  { id: 'info_gathering', label: '情報収集', description: 'リサーチ、競合調査など', suggestions: ['業界トレンド調査', '特定トピックの要約'] },
  { id: 'data_organization', label: 'データ整理', description: 'Excel整形、リスト作成など', suggestions: ['名簿の整理', 'データのクレンジング'] },
  { id: 'data_analysis', label: 'データ分析', description: '数値分析、傾向把握など', suggestions: ['売上データの分析', 'アンケートの集計分析'] },
  { id: 'meeting', label: '会議関連', description: 'アジェンダ作成、録音の要約など', suggestions: ['会議アジェンダ作成', '議事録の要約'] },
  { id: 'customer_support', label: '顧客対応', description: '問い合わせ返信、FAQ作成など', suggestions: ['FAQ下書き作成', 'クレーム対応文面案'] },
  { id: 'sales', label: '営業活動', description: 'テレアポ台本、顧客リサーチなど', suggestions: ['営業スクリプト作成', '訪問先企業の事前調査'] },
  { id: 'planning', label: '企画・アイデア出し', description: '新規事業、キャンペーン企画など', suggestions: ['キャッチコピー案作成', '新商品の企画案'] },
  { id: 'hr', label: '人事・採用', description: '求人票、面接質問作成など', suggestions: ['求人票の作成', '面接評価シートの作成'] },
  { id: 'accounting', label: '経理・総務', description: '規程作成、経費チェックなど', suggestions: ['社内規定の下書き', '福利厚生案の作成'] },
  { id: 'education', label: '教育・研修', description: 'マニュアル作成、研修カリキュラムなど', suggestions: ['業務マニュアル作成', '研修資料の構成案'] },
  { id: 'others', label: 'その他', description: 'その他の業務', suggestions: [] },
];

export const AI_TOOLS: { id: AIToolId; label: string; description: string }[] = [
  { id: 'chatgpt', label: 'ChatGPT', description: 'OpenAIが提供するAIチャット' },
  { id: 'copilot_chat', label: 'Copilot Chat', description: 'Microsoftの基本AIチャット' },
  { id: 'copilot_m365', label: 'Microsoft 365 Copilot', description: 'Officeアプリと連携するAI' },
  { id: 'gemini_chat', label: 'Gemini Chat', description: 'Googleの基本AIチャット' },
  { id: 'gemini_gw', label: 'Gemini for Google Workspace', description: 'Google Workspaceと連携するAI' },
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

// カテゴリごとのデフォルト削減率（モック用）
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
