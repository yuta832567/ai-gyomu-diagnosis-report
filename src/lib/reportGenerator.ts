import { DiagnosisData, DiagnosisResult, TaskDiagnosisResult, CategoryId, AIToolId } from './types';
import { calculateTaskSavings, calculateTaskScore, recommendTools } from './calculations';
import { CATEGORIES } from './constants';

/**
 * 業務カテゴリ別のメタデータ
 */
const CATEGORY_ADVICE: Record<CategoryId, {
  advice: string;
  aiRole: string;
  humanRole: string;
  qualityPointers: string[];
  precautions: string[];
  actionItems: string[];
  promptExample: string;
  doNotInput: string;
}> = {
  material: {
    advice: 'AIに構成案を作成させ、スライドの各ページの要点を書き出させることで、作成時間を大幅に短縮できます。',
    aiRole: '骨子作成、タイトル案、要約、図解の提案',
    humanRole: 'デザイン調整、社内事例の追加、メッセージの強弱付け',
    qualityPointers: ['多角的な視点での構成案', '分かりやすい見出しの提案', '論理構成のチェック'],
    precautions: ['最新データは人間が確認', 'デザインの最終調整', '機密情報の伏せ字化'],
    actionItems: ['資料の目次案をAIに作成させる', 'キャッチコピーを5案出させる'],
    promptExample: 'あなたは熟練の営業資料作成者です。[業務内容]のためのプレゼン資料の構成案を、ターゲット層を考慮して作成してください。',
    doNotInput: '未発表の製品仕様、顧客固有の経営課題、個人名など。'
  },
  document: {
    advice: '下書き作成、誤字脱字チェック、敬語変換を得意とします。箇条書きから文章を整形させましょう。',
    aiRole: '下書き生成、文体変換、校正・校閲、翻訳',
    humanRole: '事実関係の確認、署名・形式の確認、最終承認',
    qualityPointers: ['読みやすい文章へのリライト', 'トーン＆マナーの統一', '構成の論理性向上'],
    precautions: ['ファクトチェックの徹底', '固有名詞の誤り', '不自然な日本語の修正'],
    actionItems: ['メール返信案を3パターン作成させる', '箇条書きメモから報告書を作成させる'],
    promptExample: '以下の内容をもとに、[相手]に向けた丁寧な[文書の種類]を作成してください。',
    doNotInput: '契約金額、特定の取引先名、社外秘のプロジェクト名など。'
  },
  meeting: {
    advice: '文字起こしデータの要約や、決定事項の抽出をAIに任せることで、議事録作成が数分で終わります。',
    aiRole: '重要事項の抽出、宿題事項の整理、要約作成',
    humanRole: 'ニュアンスの微調整、発言者の正確な紐付け、関係者への展開',
    qualityPointers: ['議論の論点整理', '決定事項の明確化', 'Next Actionの漏れ防止'],
    precautions: ['発言者の取り違え', '専門用語の誤変換', '機密性の高い会議での利用ルール'],
    actionItems: ['文字起こしを箇条書きで要約させる', '会議のアジェンダ案を事前に作成させる'],
    promptExample: '以下の会議録から、1.決定事項、2.宿題事項、3.Next Actionを抽出して整理してください。',
    doNotInput: '人事評価に関わる発言、未公開の経営判断、インサイダー情報など。'
  },
  info_gathering: {
    advice: '膨大なWebページや資料から、必要な情報だけを抽出・比較・要約させることができます。',
    aiRole: '大量情報の要約、比較表作成、専門用語の解説',
    humanRole: '情報の信憑性確認、自社への適応判断、最新情報の補足',
    qualityPointers: ['情報の多角的な整理', '要点のクイックな把握', 'トレンドの傾向分析'],
    precautions: ['情報の鮮度（ハルシネーション）', '参照元の信頼性確認', '回答の裏付け確認'],
    actionItems: ['特定トピックのメリット・デメリットを整理させる', '長い記事の要約を作成させる'],
    promptExample: '[トピック]について、現在の一般的な傾向と主要なアプローチを比較表でまとめてください。',
    doNotInput: '社内独自のノウハウ、特定の競合他社との秘密裏の交渉内容など。'
  },
  data_organization: {
    advice: '不揃いなデータ形式の統一や、特定のルールに基づいた分類、テキスト抽出を自動化できます。',
    aiRole: '表記ゆれの統一、リストの分類、特定項目の抽出',
    humanRole: '分類ルールの定義、例外パターンの判定、最終整合性確認',
    qualityPointers: ['データの整合性向上', '表記ゆれの解消', '分類ミスの低減'],
    precautions: ['計算結果の正確性', '個人情報の取り扱い', '特殊フォーマットの崩れ'],
    actionItems: ['住所から都道府県を抽出させる', '自由記述アンケートをカテゴリ分けさせる'],
    promptExample: '以下のリストを、[分類基準]に基づいてカテゴリ分けしてください。',
    doNotInput: '顧客のメールアドレス、電話番号、住所、社員番号などの個人情報。'
  },
  data_analysis: {
    advice: '数値データの背後にある傾向を読み取ったり、仮説立案をサポートさせることができます。',
    aiRole: 'データの傾向分析、仮説の提案、図解案の提示',
    humanRole: '分析結果の解釈、背景事情の加味、次の施策の決定',
    qualityPointers: ['新しい切り口の発見', '仮説精度の向上', 'ビジュアル化案の提示'],
    precautions: ['複雑な統計計算の誤り', 'データの代表性', '解釈の偏り'],
    actionItems: ['不満要因を分析させる', '売上減少の要因をブレストさせる'],
    promptExample: '以下の結果を見て、考えられる3つの課題と解決策の仮説を提案してください。',
    doNotInput: '詳細な財務諸表、個別の給与データ、戦略的な原価情報など。'
  },
  customer_support: {
    advice: '過去のFAQに基づいた返信案作成や、感情に配慮した丁寧な文章への書き換えに活用できます。',
    aiRole: '返信メールの下書き、FAQ案の生成、初期対応案',
    humanRole: '例外対応の判断、感情面の最終確認、個別状況の調整',
    qualityPointers: ['返信スピードの向上', '対応品質の均一化', '顧客に寄り添う表現'],
    precautions: ['定型文すぎる回答', '誤った情報の提供', '感情的対応の回避'],
    actionItems: ['問い合わせへの初期回答案を作成させる', 'FAQ項目を具体化させる'],
    promptExample: 'お客様からの[問い合わせ内容]に対し、誠実な返信案を3パターン作成してください。',
    doNotInput: '顧客の購入履歴、クレームの詳細（個人特定可能なもの）、ログイン情報。'
  },
  sales: {
    advice: '顧客リサーチや、課題に合わせた提案の切り口をブレストさせるのに有効です。',
    aiRole: '顧客情報の要約、ニーズ想定、提案構成案、ロールプレイ',
    humanRole: '信頼関係の構築、交渉の最終決断、具体的な価格調整',
    qualityPointers: ['提案の具体性向上', '顧客ニーズへの合致', 'トークスクリプトの磨き込み'],
    precautions: ['不正確な情報', '自社の強みの過剰表現', '最新情報の欠如'],
    actionItems: ['訪問先の課題を想定しブレストする', 'ロールプレイの相手をさせる'],
    promptExample: '[業種]の[役職]の方に提案する際、相手が抱えていそうな悩みと解決策を整理してください。',
    doNotInput: '見積書、個別の契約条件、競合他社への対抗策（秘密事項）。'
  },
  planning: {
    advice: '企画の種となるアイデア出しや、企画書の構成を壁打ち相手としてブラッシュアップできます。',
    aiRole: '大量のアイデア出し、ネーミング案、市場要約、壁打ち',
    humanRole: '取捨選択、リソース配分の判断、社内調整、実現可能性確認',
    qualityPointers: ['アイデアの幅の拡大', '多角的な検証', 'コンセプトの明確化'],
    precautions: ['実現可能性の検討', '著作権や類似性', '市場ニーズとの整合'],
    actionItems: ['ネーミング案を20個出させる', '企画の弱点を指摘させる'],
    promptExample: '[目的]のための新しいイベント企画案を、面白い切り口で3つ提案してください。',
    doNotInput: '特許出願前のアイデア、独自のビジネスモデル詳細、予算の内訳。'
  },
  hr: {
    advice: '求人票作成、面接質問の設計、研修資料の構成案作成などを効率化できます。',
    aiRole: '求人票作成、面接質問案、規定の構成案、研修資料',
    humanRole: '採用の最終判断、個人を含む評価、社内文化への適合判断',
    qualityPointers: ['魅力的な求人表現', '評価基準の明確化', 'カリキュラムの構造化'],
    precautions: ['個人情報の厳禁', 'バイアスの排除', '法的規制の遵守'],
    actionItems: ['面接質問リストを作成する', '研修の理解度テストを作成させる'],
    promptExample: '[職種]を採用するための、魅力的な求人紹介文を作成してください。',
    doNotInput: '応募者の履歴書、評価シートの結果、個別の給与提示額。'
  },
  accounting: {
    advice: '規程の下書き作成や、複雑な処理の手順確認、注意点の洗い出しに活用できます。',
    aiRole: '規定案作成、経費項目の自動分類、会計基準の確認',
    humanRole: '仕訳の確定、税務判断の確認、資金繰りの意思決定',
    qualityPointers: ['規定の網羅性向上', '用語の分かりやすい解説', 'チェックリスト作成'],
    precautions: ['最新法令との不一致', '計算の正確性確認', '社内ルールの欠落'],
    actionItems: ['ルール解説文を書き換えさせる', '法改正の影響範囲を考えさせる'],
    promptExample: '[法律名]の改正に伴い、一般的な企業が対応すべき事項をチェックリストにしてください。',
    doNotInput: '銀行口座番号、法人カード情報、具体的な資金調達条件。'
  },
  education: {
    advice: 'マニュアルの構成、研修シナリオ、理解度クイズ作成などを得意とします。',
    aiRole: 'マニュアル構成案、テスト問題、ロープレ台本、用語解説',
    humanRole: '実地の指導、進捗管理、モチベーション管理、実地評価',
    qualityPointers: ['分かりやすい説明構造', '図解の構成案', '学習ステップの最適化'],
    precautions: ['古い手順の記載', '教え方の適切さ', '実機での動作確認'],
    actionItems: ['マニュアルの目次案を作成させる', '業務手順をステップ分けさせる'],
    promptExample: '[業務名]の未経験者向けに、5つのステップで説明するマニュアル案を作成してください。',
    doNotInput: '社内のパスワード設定ルール、システムへのアクセス権限情報。'
  },
  others: {
    advice: '幅広い業務に対し、思考の整理、翻訳、最初の取っ掛かりに活用できます。',
    aiRole: '要約、翻訳、アイデア出し、壁打ち',
    humanRole: '最終意思決定、責任の所在確認、最終調整',
    qualityPointers: ['思考の整理', '新しい視点の獲得', '多言語対応'],
    precautions: ['事実確認', 'コンプライアンス遵守', '専門家への確認'],
    actionItems: ['質問を投げかけさせて思考を整理する', '英文メールを自然に翻訳させる'],
    promptExample: '私は[悩み]を解決したいです。整理するために、私に3つの質問をしてください。',
    doNotInput: 'パスワード、社内の機密プロジェクトに関連する固有名詞。'
  }
};

/**
 * 注意が必要なキーワードの判定
 */
const isSensitiveTask = (title: string, categoryId: CategoryId, confidentiality: string): boolean => {
  const sensitiveKeywords = ['人事', '評価', '給与', '契約', '法務', '法規', '財務', '資金', 'パスワード', '顧客情報', '個人情報', '秘密', 'インサイダー'];
  const isKeywordMatch = sensitiveKeywords.some(key => title.includes(key));
  const isSensitiveCategory = ['hr', 'accounting'].includes(categoryId);
  const isConfidential = confidentiality === '多く含む' || confidentiality === '一部あり';
  
  return isKeywordMatch || isSensitiveCategory || isConfidential;
};

/**
 * 診断データの生成
 */
export const generateDiagnosisReport = (data: DiagnosisData): DiagnosisResult => {
  const taskResults: TaskDiagnosisResult[] = data.tasks.map((task) => {
    const { savingsPerTime, savingsMonthly, savingsYearly } = calculateTaskSavings(task);
    const score = calculateTaskScore(task);
    const recommendedTools = recommendTools(task, data.selectedTools);
    const adviceMeta = CATEGORY_ADVICE[task.categoryId] || CATEGORY_ADVICE.others;
    const hasSensitivity = isSensitiveTask(task.title, task.categoryId, task.confidentiality);

    return {
      taskId: task.id,
      title: task.title,
      categoryId: task.categoryId,
      savingsMonthly,
      savingsYearly,
      savingsPerTime,
      score,
      recommendedTools,
      hasSensitivity,
      ...adviceMeta
    };
  });

  const totalSavingsMonthly = taskResults.reduce((sum, res) => sum + res.savingsMonthly, 0);
  const totalSavingsYearly = taskResults.reduce((sum, res) => sum + res.savingsYearly, 0);
  const totalSavingsPerTime = taskResults.reduce((sum, res) => sum + res.savingsPerTime, 0);

  // カテゴリ分布
  const categoryCount: Record<string, number> = {};
  taskResults.forEach(res => {
    const label = CATEGORIES.find(c => c.id === res.categoryId)?.label || 'その他';
    categoryCount[label] = (categoryCount[label] || 0) + 1;
  });
  const categoryDistribution = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  // レーダーチャート
  const radarData = [
    { subject: '効率化', A: Math.min(100, (totalSavingsMonthly / 20) * 100), fullMark: 100 },
    { subject: '文書作成', A: taskResults.some(r => r.categoryId === 'document' || r.categoryId === 'material') ? 95 : 40, fullMark: 100 },
    { subject: 'アイデア', A: taskResults.some(r => r.categoryId === 'planning' || r.categoryId === 'sales') ? 90 : 30, fullMark: 100 },
    { subject: '分析', A: taskResults.some(r => r.categoryId === 'data_analysis' || r.categoryId === 'data_organization') ? 85 : 20, fullMark: 100 },
    { subject: 'ガバナンス', A: taskResults.filter(r => r.hasSensitivity).length > 0 ? 60 : 95, fullMark: 100 },
  ];

  const sensitiveTasks = taskResults.filter(r => r.hasSensitivity).map(r => r.title);

  return {
    inputData: data,
    generatedAt: new Date().toLocaleDateString('ja-JP'),
    overallScore: Math.round(taskResults.reduce((sum, res) => sum + res.score, 0) / taskResults.length),
    overallComment: '今回入力いただいた業務は、AIを使うことで作業時間の短縮や品質向上が期待できます。特に、文章の下書き作成、情報整理、チェック作業はAIと相性が良い領域です。まずはリスクの低い業務から小さく試し、AIの出力を人間が確認する形で活用していきましょう。',
    kpis: {
      totalTasks: taskResults.length,
      highPotentialTasks: taskResults.filter(r => r.score >= 4).length,
      totalSavingsMonthly,
      totalSavingsYearly,
      totalSavingsPerTime
    },
    taskResults: taskResults.sort((a, b) => b.savingsYearly - a.savingsYearly),
    categoryDistribution,
    radarData,
    actionPlan: [
      'まずは「非機密情報」を扱う定型業務の下書き作成からAIを導入しましょう。',
      'AIの回答を鵜呑みにせず、必ず人間が最終確認（ファクトチェック）を行う運用を徹底してください。',
      'AIツールに入力してよい情報・入力してはいけない情報を社内ルールに沿って確認しましょう。',
      '機密情報の扱いや、AI利用に関する社内規定（ガイドライン）を再度確認しましょう。',
      '成果物の最終責任は常に「人間」にあることを意識し、AIを優秀なアシスタントとして使いこなしましょう。'
    ],
    sensitiveTasks
  };
};
