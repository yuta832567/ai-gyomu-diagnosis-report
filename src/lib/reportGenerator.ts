import { DiagnosisData, DiagnosisResult, TaskDiagnosisResult, CategoryId, AIToolId } from './types';
import { calculateTaskSavings, calculateTaskScore, recommendTools } from './calculations';
import { CATEGORIES } from './constants';

/**
 * 業務カテゴリ別のメタデータ（アドバイス、プロンプト例など）
 */
const CATEGORY_ADVICE: Record<CategoryId, {
  advice: string;
  qualityPointers: string[];
  precautions: string[];
  actionItems: string[];
  promptExample: string;
}> = {
  material: {
    advice: 'AIに構成案を作成させ、スライドの各ページの要点を書き出させることで、作成時間を大幅に短縮できます。',
    qualityPointers: ['多角的な視点での構成案', '分かりやすい見出しの提案', '論理構成のチェック'],
    precautions: ['最新の市場データは人間が確認', 'デザインの最終調整', '機密情報の伏せ字化'],
    actionItems: ['資料の目次案をAIに作成させる', 'ターゲットに刺さるキャッチコピーを5案出させる'],
    promptExample: 'あなたは熟練の営業資料作成者です。[業務内容]のためのプレゼン資料の構成案を、ターゲットが[ターゲット層]であることを考慮して作成してください。'
  },
  document: {
    advice: '下書きの作成、誤字脱字チェック、敬語の変換などを得意とします。まずは箇条書きで内容を伝え、整形させましょう。',
    qualityPointers: ['読みやすい文章へのリライト', 'トーン＆マナーの統一', '構成の論理性の向上'],
    precautions: ['事実関係（ファクトチェック）', '固有名詞の誤り', '不自然な日本語の修正'],
    actionItems: ['メールの返信案を3パターン作成させる', '箇条書きのメモから正式な報告書を作成させる'],
    promptExample: '以下の箇条書きの内容をもとに、[相手]に向けた丁寧な[文書の種類]を作成してください。トーンは[希望のトーン]でお願いします。'
  },
  meeting: {
    advice: '録音データの文字起こしを要約させたり、決定事項とNext Actionを抽出させることで、議事録作成が数分で終わります。',
    qualityPointers: ['議論の論点整理', '決定事項の明確化', 'Next Actionの漏れ防止'],
    precautions: ['発言者の取り違え', '専門用語の誤変換', '機密性の高い会議での利用ルール'],
    actionItems: ['文字起こしテキストを箇条書きで要約させる', '会議のアジェンダ案を事前に作成させる'],
    promptExample: '以下の会議の文字起こしデータから、1.決定事項、2.保留事項、3.Next Action（担当者含む）を抽出して整理してください。'
  },
  info_gathering: {
    advice: '膨大なWebページや資料から、必要な情報だけを抽出・比較・要約させることができます。',
    qualityPointers: ['情報の多角的な整理', '要点のクイックな把握', 'トレンドの傾向分析'],
    precautions: ['情報の鮮度（ハルシネーション）', '参照元の信頼性確認', '回答の裏付け（ファクトチェック）'],
    actionItems: ['特定トピックに関するメリット・デメリットを整理させる', '長い記事の要約を作成させる'],
    promptExample: '[トピック]について、現在の一般的な傾向と、主要な3つのアプローチを比較表の形式でまとめてください。'
  },
  data_organization: {
    advice: '不揃いなデータ形式の統一や、特定のルールに基づいた分類、テキストの抽出を自動化できます。',
    qualityPointers: ['データの整合性向上', '表記ゆれの解消', '分類ミスの低減'],
    precautions: ['計算結果の正確性', '個人情報の取り扱い', '特殊なフォーマットの崩れ'],
    actionItems: ['住所データから都道府県を抽出させる', '自由記述アンケートをカテゴリ別に分類させる'],
    promptExample: '以下のリストに含まれる項目を、[分類基準]に基づいてカテゴリ分けしてください。'
  },
  data_analysis: {
    advice: '数値データの背後にある傾向を読み取ったり、仮説の立案をサポートさせることができます。',
    qualityPointers: ['新しい切り口の発見', '仮説精度の向上', 'データのビジュアル化案の提示'],
    precautions: ['複雑な統計計算の誤り', 'データの代表性', '解釈の偏り'],
    actionItems: ['アンケート結果から主要な不満要因を分析させる', '売上減少の可能性のある要因をブレストさせる'],
    promptExample: '以下の[データ内容]の結果を見て、考えられる3つの主要な課題と、その解決策の仮説を提案してください。'
  },
  customer_support: {
    advice: '過去のFAQに基づいた返信案の作成や、顧客の感情に配慮した丁寧な文章への書き換えに活用できます。',
    qualityPointers: ['返信スピードの向上', '対応品質の均一化', '顧客の不満に寄り添う表現'],
    precautions: ['定型文すぎる回答', '誤った情報の提供', '感情的な対応の回避'],
    actionItems: ['問い合わせ内容への初期回答案を作成させる', 'FAQの項目を具体化させる'],
    promptExample: 'お客様からの[問い合わせ内容]に対し、[自社のポリシー]を踏まえた、丁寧で誠実な返信案を3パターン作成してください。'
  },
  sales: {
    advice: '顧客の事前リサーチや、相手の課題に合わせた提案の切り口をブレストさせるのに有効です。',
    qualityPointers: ['提案の具体性向上', '顧客ニーズへの合致', 'トークスクリプトの磨き込み'],
    precautions: ['競合他社の不正確な情報', '自社の強みの過剰表現', '最新情報の欠如'],
    actionItems: ['訪問先企業の課題を想定し、解決策をブレストする', '架電用スクリプトの練習相手（ロールプレイ）をさせる'],
    promptExample: '[業種]の[役職]の方に[自社製品]を提案する際、相手が抱えていそうな悩みと、それを解決する訴求ポイントを整理してください。'
  },
  planning: {
    advice: '企画の種となるアイデアを大量に出させたり、企画書の論理構成を壁打ち相手としてブラッシュアップできます。',
    qualityPointers: ['アイデアの幅の拡大', '多角的な検証', 'コンセプトの明確化'],
    precautions: ['実現可能性の検討', '著作権や既知のアイデアとの類似性', '市場ニーズとの最終整合'],
    actionItems: ['新機能のネーミング案を20個出させる', '企画の弱点を指摘（レッドチーム）させる'],
    promptExample: '[目的]のための新しいイベント企画案を、[ターゲット]を惹きつける面白い切り口で3つ提案してください。'
  },
  hr: {
    advice: '求人票の作成、面接質問の設計、社内研修資料の構成案作成などを効率化できます。',
    qualityPointers: ['魅力的な求人表現', '評価基準の明確化', '教育カリキュラムの構造化'],
    precautions: ['個人情報の厳禁', 'バイアスの排除', '法的規制（労働法等）の遵守'],
    actionItems: ['求める人物像に基づいた面接質問リストを作成する', '研修の理解度テストを作成させる'],
    promptExample: '[職種]を採用するための求人票を作成します。[会社の魅力]と[求めるスキル]を盛り込んだ、魅力的な紹介文を作成してください。'
  },
  accounting: {
    advice: '規程の下書き作成や、複雑な処理の一般的な手順の確認、注意点の洗い出しに活用できます。',
    qualityPointers: ['規定の網羅性向上', '専門用語の分かりやすい解説', 'チェックリストの作成'],
    precautions: ['最新の法令・税制との不一致', '計算の正確性（必ず人間が確認）', '社内固有ルールの欠落'],
    actionItems: ['経費精算ルールの解説文を分かりやすく書き換えさせる', '法改正に伴う影響範囲のヒントを出させる'],
    promptExample: '[法律名]の改正に伴い、一般的な企業が対応すべき事項をチェックリストの形式でまとめてください。'
  },
  education: {
    advice: '業務マニュアルの構成、研修のシナリオ作成、理解度を測るためのクイズ作成などを得意とします。',
    qualityPointers: ['分かりやすい説明構造', '図解の構成案作成', '学習ステップの最適化'],
    precautions: ['古い手順の記載', '教え方の適切さ', '実機での動作確認の省略'],
    actionItems: ['新人向けマニュアルの目次案を作成させる', '特定の業務手順をステップバイステップで説明させる'],
    promptExample: '[業務名]の未経験者向けに、この業務を5つのステップで説明するマニュアルの構成案を作成してください。'
  },
  others: {
    advice: '幅広い業務に対し、最初の取っ掛かりとしての壁打ちや整理、翻訳などに活用できます。',
    qualityPointers: ['思考の整理', '新しい視点の獲得', '多言語対応'],
    precautions: ['事実確認', 'コンプライアンス遵守', '専門家への確認'],
    actionItems: ['考えがまとまらない時に、質問を投げかけさせて整理する', '英文メールを自然な日本語に翻訳させる'],
    promptExample: '私は[現在の悩み]を解決したいと考えています。思考を整理するために、私に3つの質問をしてください。'
  }
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

    return {
      taskId: task.id,
      title: task.title,
      categoryId: task.categoryId,
      savingsMonthly,
      savingsYearly,
      savingsPerTime,
      score,
      recommendedTools,
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

  // レーダーチャート用データの作成 (簡易的な集計)
  const radarData = [
    { subject: '効率化', A: Math.min(100, (totalSavingsMonthly / 10) * 100), fullMark: 100 },
    { subject: '文書作成', A: taskResults.some(r => r.categoryId === 'document') ? 90 : 20, fullMark: 100 },
    { subject: 'アイデア', A: taskResults.some(r => r.categoryId === 'planning') ? 85 : 30, fullMark: 100 },
    { subject: '分析', A: taskResults.some(r => r.categoryId === 'data_analysis') ? 80 : 10, fullMark: 100 },
    { subject: '対応力', A: 70, fullMark: 100 },
  ];

  return {
    inputData: data,
    generatedAt: new Date().toLocaleDateString('ja-JP'),
    overallScore: Math.round(taskResults.reduce((sum, res) => sum + res.score, 0) / taskResults.length),
    overallComment: 'あなたの業務はAI活用による大きな伸び代があります。特に定型的な文書作成や会議関連の業務から着手することで、即効性の高い効果が期待できます。',
    kpis: {
      totalTasks: taskResults.length,
      highPotentialTasks: taskResults.filter(r => r.score >= 4).length,
      totalSavingsMonthly,
      totalSavingsYearly,
      totalSavingsPerTime
    },
    taskResults: taskResults.sort((a, b) => b.savingsYearly - a.savingsYearly), // 削減時間順
    categoryDistribution,
    radarData,
    actionPlan: [
      'まずはメール文面の下書き作成から試してみましょう',
      '会議議事録の要約をAIに依頼し、修正するスタイルを取り入れましょう',
      '提案資料の構成案をAIに作成させ、骨子を固める時間を短縮しましょう',
      '機密情報を入力しない運用ルールをチーム内で共有しましょう',
      'AIの回答をそのまま使わず、必ず人間が内容を確認する習慣をつけましょう'
    ]
  };
};
