import { DiagnosisData, DiagnosisResult, TaskDiagnosisResult, CategoryId, AIToolId } from './types';
import { calculateTaskSavings, calculateTaskScore, recommendTools } from './calculations';
import { CATEGORIES } from './constants';

/**
 * 業務カテゴリ別のメタデータ（アドバイス、プロンプト例など）
 */
const CATEGORY_ADVICE: Record<CategoryId, {
  advice: string;
  aiRole: string;
  humanRole: string;
  qualityPointers: string[];
  precautions: string[];
  actionItems: string[];
  promptExample: string;
}> = {
  material: {
    advice: 'AIに構成案を作成させ、スライドの各ページの要点を書き出させることで、作成時間を大幅に短縮できます。',
    aiRole: '骨子作成、スライドタイトル案、箇条書きの要約、図解構成の提案',
    humanRole: 'デザインの最終調整、社内固有事例の追加、メッセージの強弱付け',
    qualityPointers: ['多角的な視点での構成案', '分かりやすい見出しの提案', '論理構成のチェック'],
    precautions: ['最新の市場データは人間が確認', 'デザインの最終調整', '機密情報の伏せ字化'],
    actionItems: ['資料の目次案をAIに作成させる', 'ターゲットに刺さるキャッチコピーを5案出させる'],
    promptExample: 'あなたは熟練の営業資料作成者です。[業務内容]のためのプレゼン資料の構成案を、ターゲットが[ターゲット層]であることを考慮して作成してください。'
  },
  document: {
    advice: '下書きの作成、誤字脱字チェック、敬語の変換などを得意とします。まずは箇条書きで内容を伝え、整形させましょう。',
    aiRole: '下書き生成、文体変換（敬語・簡潔化）、校正・校閲、翻訳',
    humanRole: '事実関係の最終確認（ファクトチェック）、署名・形式の最終確認、承認',
    qualityPointers: ['読みやすい文章へのリライト', 'トーン＆マナーの統一', '構成の論理性の向上'],
    precautions: ['事実関係（ファクトチェック）', '固有名詞の誤り', '不自然な日本語の修正'],
    actionItems: ['メールの返信案を3パターン作成させる', '箇条書きのメモから正式な報告書を作成させる'],
    promptExample: '以下の箇条書きの内容をもとに、[相手]に向けた丁寧な[文書の種類]を作成してください。トーンは[希望のトーン]でお願いします。'
  },
  meeting: {
    advice: '録音データの文字起こしを要約させたり、決定事項とNext Actionを抽出させることで、議事録作成が数分で終わります。',
    aiRole: '重要事項の抽出、決定事項・宿題事項の整理、要約作成',
    humanRole: 'ニュアンスの微調整、発言者の正確な紐付け、関係者への展開',
    qualityPointers: ['議論の論点整理', '決定事項の明確化', 'Next Actionの漏れ防止'],
    precautions: ['発言者の取り違え', '専門用語の誤変換', '機密性の高い会議での利用ルール'],
    actionItems: ['文字起こしテキストを箇条書きで要約させる', '会議のアジェンダ案を事前に作成させる'],
    promptExample: '以下の会議の文字起こしデータから、1.決定事項、2.保留事項、3.Next Action（担当者含む）を抽出して整理してください。'
  },
  info_gathering: {
    advice: '膨大なWebページや資料から、必要な情報だけを抽出・比較・要約させることができます。',
    aiRole: '大量情報の要約、特定視点での比較表作成、専門用語の解説',
    humanRole: '情報の信憑性確認、自社への適応可能性判断、最新情報の補足',
    qualityPointers: ['情報の多角的な整理', '要点のクイックな把握', 'トレンドの傾向分析'],
    precautions: ['情報の鮮度（ハルシネーション）', '参照元の信頼性確認', '回答の裏付け（ファクトチェック）'],
    actionItems: ['特定トピックに関するメリット・デメリットを整理させる', '長い記事の要約を作成させる'],
    promptExample: '[トピック]について、現在の一般的な傾向と、主要な3つのアプローチを比較表の形式でまとめてください。'
  },
  data_organization: {
    advice: '不揃いなデータ形式の統一や、特定のルールに基づいた分類、テキストの抽出を自動化できます。',
    aiRole: '表記ゆれの統一、リストの分類・ラベリング、特定項目の抽出',
    humanRole: '分類ルールの定義、例外パターンの判定、最終データの整合性確認',
    qualityPointers: ['データの整合性向上', '表記ゆれの解消', '分類ミスの低減'],
    precautions: ['計算結果の正確性', '個人情報の取り扱い', '特殊なフォーマットの崩れ'],
    actionItems: ['住所データから都道府県を抽出させる', '自由記述アンケートをカテゴリ別に分類させる'],
    promptExample: '以下のリストに含まれる項目を、[分類基準]に基づいてカテゴリ分けしてください。'
  },
  data_analysis: {
    advice: '数値データの背後にある傾向を読み取ったり、仮説の立案をサポートさせることができます。',
    aiRole: 'データの傾向分析、仮説のブレインストーミング、図解案の提示',
    humanRole: '分析結果の解釈、背景事情の加味、次の施策の最終決定',
    qualityPointers: ['新しい切り口の発見', '仮説精度の向上', 'データのビジュアル化案の提示'],
    precautions: ['複雑な統計計算の誤り', 'データの代表性', '解釈の偏り'],
    actionItems: ['アンケート結果から主要な不満要因を分析させる', '売上減少の可能性のある要因をブレストさせる'],
    promptExample: '以下の[データ内容]の結果を見て、考えられる3つの主要な課題と、その解決策の仮説を提案してください。'
  },
  customer_support: {
    advice: '過去のFAQに基づいた返信案の作成や、顧客の感情に配慮した丁寧な文章への書き換えに活用できます。',
    aiRole: '返信メールの下書き作成、FAQ案の生成、クレームへの初期対応案',
    humanRole: '例外対応の判断、感情面の最終確認、個別の状況に応じた調整',
    qualityPointers: ['返信スピードの向上', '対応品質の均一化', '顧客の不満に寄り添う表現'],
    precautions: ['定型文すぎる回答', '誤った情報の提供', '感情的な対応の回避'],
    actionItems: ['問い合わせ内容への初期回答案を作成させる', 'FAQの項目を具体化させる'],
    promptExample: 'お客様からの[問い合わせ内容]に対し、[自社のポリシー]を踏まえた、丁寧で誠実な返信案を3パターン作成してください。'
  },
  sales: {
    advice: '顧客の事前リサーチや、相手の課題に合わせた提案の切り口をブレストさせるのに有効です。',
    aiRole: '顧客情報の要約、ニーズの想定、提案構成案の作成、ロールプレイ',
    humanRole: '信頼関係の構築（対面）、交渉の最終決断、具体的な価格調整',
    qualityPointers: ['提案の具体性向上', '顧客ニーズへの合致', 'トークスクリプトの磨き込み'],
    precautions: ['競合他社の不正確な情報', '自社の強みの過剰表現', '最新情報の欠如'],
    actionItems: ['訪問先企業の課題を想定し、解決策をブレストする', '架電用スクリプトの練習相手（ロールプレイ）をさせる'],
    promptExample: '[業種]の[役職]の方に[自社製品]を提案する際、相手が抱えていそうな悩みと、それを解決する訴求ポイントを整理してください。'
  },
  planning: {
    advice: '企画の種となるアイデアを大量に出させたり、企画書の論理構成を壁打ち相手としてブラッシュアップできます。',
    aiRole: '大量のアイデア出し、ネーミング案作成、市場調査要約、壁打ち',
    humanRole: 'コンセプトの取捨選択、リソース配分の判断、社内調整、実現可能性確認',
    qualityPointers: ['アイデアの幅の拡大', '多角的な検証', 'コンセプトの明確化'],
    precautions: ['実現可能性の検討', '著作権や既知のアイデアとの類似性', '市場ニーズとの最終整合'],
    actionItems: ['新機能のネーミング案を20個出させる', '企画の弱点を指摘（レッドチーム）させる'],
    promptExample: '[目的]のための新しいイベント企画案を、[ターゲット]を惹きつける面白い切り口で3つ提案してください。'
  },
  hr: {
    advice: '求人票の作成、面接質問の設計、社内研修資料の構成案作成などを効率化できます。',
    aiRole: '求人票の作成、面接の質問案作成、社内規定の構成案、研修資料作成',
    humanRole: '採用の最終判断、個人情報を含む評価、社内文化への適合性判断',
    qualityPointers: ['魅力的な求人表現', '評価基準の明確化', '教育カリキュラムの構造化'],
    precautions: ['個人情報の厳禁', 'バイアスの排除', '法的規制（労働法等）の遵守'],
    actionItems: ['求める人物像に基づいた面接質問リストを作成する', '研修の理解度テストを作成させる'],
    promptExample: '[職種]を採用するための求人票を作成します。[会社の魅力]と[求めるスキル]を盛り込んだ、魅力的な紹介文を作成してください。'
  },
  accounting: {
    advice: '規程の下書き作成や、複雑な処理の一般的な手順の確認、注意点の洗い出しに活用できます。',
    aiRole: '規定案の作成、経費項目の自動分類、一般的な会計基準の確認',
    humanRole: '仕訳の最終確定、税務判断の最終確認、資金繰りの意思決定',
    qualityPointers: ['規定の網羅性向上', '専門用語の分かりやすい解説', 'チェックリストの作成'],
    precautions: ['最新の法令・税制との不一致', '計算の正確性（必ず人間が確認）', '社内固有ルールの欠落'],
    actionItems: ['経費精算ルールの解説文を分かりやすく書き換えさせる', '法改正に伴う影響範囲のヒントを出させる'],
    promptExample: '[法律名]の改正に伴い、一般的な企業が対応すべき事項をチェックリストの形式でまとめてください。'
  },
  education: {
    advice: '業務マニュアルの構成、研修のシナリオ作成、理解度を測るためのクイズ作成などを得意とします。',
    aiRole: 'マニュアル構成案、テスト問題作成、ロープレ台本、用語解説作成',
    humanRole: '教え方の指導、進捗管理、受講者のモチベーション管理、実地評価',
    qualityPointers: ['分かりやすい説明構造', '図解の構成案作成', '学習ステップの最適化'],
    precautions: ['古い手順の記載', '教え方の適切さ', '実機での動作確認の省略'],
    actionItems: ['新人向けマニュアルの目次案を作成させる', '特定の業務手順をステップバイステップで説明させる'],
    promptExample: '[業務名]の未経験者向けに、この業務を5つのステップで説明するマニュアルの構成案を作成してください。'
  },
  others: {
    advice: '幅広い業務に対し、最初の取っ掛かりとしての壁打ちや整理、翻訳などに活用できます。',
    aiRole: '情報の要約、翻訳、アイデア出し、壁打ち相手',
    humanRole: '最終的な意思決定、責任の所在確認、クリエイティブな最終調整',
    qualityPointers: ['思考の整理', '新しい視点の獲得', '多言語対応'],
    precautions: ['事実確認', 'コンプライアンス遵守', '専門家への確認'],
    actionItems: ['考えがまとまらない時に、質問を投げかけさせて整理する', '英文メールを自然な日本語に翻訳させる'],
    promptExample: '私は[現在の悩み]を解決したいと考えています。思考を整理するために、私に3つの質問をしてください。'
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

  // カテゴリ分布データの作成
  const categoryCount: Record<string, number> = {};
  taskResults.forEach(res => {
    const label = CATEGORIES.find(c => c.id === res.categoryId)?.label || 'その他';
    categoryCount[label] = (categoryCount[label] || 0) + 1;
  });
  const categoryDistribution = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  // レーダーチャート用データの作成
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
    overallComment: 'あなたの業務にはAI活用による大きな効率化の余地があります。特にクリエイティブな下書き作成や、膨大な情報の要約・整理にAIを導入することで、年間で大きな「自由時間」を創出できるでしょう。',
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
      'M365 Copilot等、自社のプランでどこまで「社内データ」が参照できるかを確認しましょう。',
      '機密情報の扱いや、AI利用に関する社内規定（ガイドライン）を再度確認しましょう。',
      '成果物の最終責任は常に「人間」にあることを意識し、AIを優秀なアシスタントとして使いこなしましょう。'
    ],
    sensitiveTasks
  };
};
