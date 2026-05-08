import { DiagnosisData, DiagnosisResult, TaskItem, TaskDiagnosisResult, AIToolId, CategoryId } from './types';
import { FREQUENCIES, REDUCTION_RATES } from './constants';

/**
 * AIによる削減時間の計算
 */
export const calculateTaskSavings = (task: TaskItem) => {
  const baseRate = REDUCTION_RATES[task.categoryId] || 0.2;
  const monthlyMultiplier = FREQUENCIES[task.frequencyId].monthlyMultiplier;
  
  const savingsPerTime = task.hoursPerTime * baseRate;
  const savingsMonthly = savingsPerTime * monthlyMultiplier;
  const savingsYearly = savingsMonthly * 12;

  return {
    savingsPerTime,
    savingsMonthly,
    savingsYearly,
  };
};

/**
 * 業務に対するAI活用ポテンシャルスコアの算出 (1-5)
 */
export const calculateTaskScore = (task: TaskItem): number => {
  let score = 3; // デフォルト: 一部活用できる

  // カテゴリによる補正
  const highPotentialCategories: CategoryId[] = ['document', 'meeting', 'material', 'planning'];
  if (highPotentialCategories.includes(task.categoryId)) score += 1;

  // 機密情報・リスクによる補正
  if (task.confidentiality === '多く含む') score -= 2;
  else if (task.confidentiality === '一部あり') score -= 1;

  // 特定カテゴリのリスク補正
  const riskyCategories: CategoryId[] = ['hr', 'accounting', 'others'];
  if (riskyCategories.includes(task.categoryId)) score -= 1;

  return Math.max(1, Math.min(5, score));
};

/**
 * おすすめAIツールの判定
 */
export const recommendTools = (task: TaskItem, selectedTools: AIToolId[]): AIToolId[] => {
  const recommendations: AIToolId[] = [];

  // カテゴリと選択済みツールに基づく判定
  const chatGptSuited: CategoryId[] = ['document', 'info_gathering', 'planning', 'education', 'data_analysis'];
  const copilotSuited: CategoryId[] = ['material', 'data_organization', 'meeting'];
  
  // ユーザーが選択しているツールの中から最適なものを選ぶ
  if (selectedTools.includes('chatgpt') && chatGptSuited.includes(task.categoryId)) {
    recommendations.push('chatgpt');
  }
  
  if (selectedTools.includes('copilot') && (copilotSuited.includes(task.categoryId) || task.tools?.includes('Word') || task.tools?.includes('Excel'))) {
    recommendations.push('copilot');
  }

  if (selectedTools.includes('gemini') && (task.tools?.includes('Gmail') || task.tools?.includes('Google Docs'))) {
    recommendations.push('gemini');
  }

  // 何も該当しない場合は、選択ツールの中から先頭を表示、またはChatGPTを推奨
  if (recommendations.length === 0) {
    if (selectedTools.length > 0) recommendations.push(selectedTools[0]);
    else recommendations.push('chatgpt');
  }

  return recommendations;
};
