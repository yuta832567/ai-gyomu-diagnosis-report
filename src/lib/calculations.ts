import { DiagnosisData, DiagnosisResult, TaskItem } from './types';
import { FREQUENCIES, REDUCTION_RATES } from './constants';

/**
 * 特定のタスクの削減時間を計算する
 */
export const calculateTaskSavings = (task: TaskItem) => {
  const reductionRate = REDUCTION_RATES[task.categoryId] || 0.2;
  const monthlyMultiplier = FREQUENCIES[task.frequencyId].monthlyMultiplier;
  
  const savingsPerTime = task.hoursPerTime * reductionRate;
  const monthlySavings = savingsPerTime * monthlyMultiplier;
  const yearlySavings = monthlySavings * 12;

  // 1-5のスコアを計算（削減時間が長いほど高スコアとする簡易ロジック）
  let score = 1;
  if (monthlySavings > 10) score = 5;
  else if (monthlySavings > 5) score = 4;
  else if (monthlySavings > 2) score = 3;
  else if (monthlySavings > 0.5) score = 2;

  return {
    monthlySavings,
    yearlySavings,
    score,
  };
};

/**
 * 全体の診断結果を計算する
 */
export const calculateDiagnosis = (data: DiagnosisData): DiagnosisResult => {
  const taskResults = data.tasks.map((task) => {
    const { monthlySavings, yearlySavings, score } = calculateTaskSavings(task);
    return {
      taskId: task.id,
      savingsMonthly: monthlySavings,
      savingsYearly: yearlySavings,
      score,
    };
  });

  const totalSavingsMonthly = taskResults.reduce((sum, res) => sum + res.savingsMonthly, 0);
  const totalSavingsYearly = taskResults.reduce((sum, res) => sum + res.savingsYearly, 0);

  return {
    totalSavingsMonthly,
    totalSavingsYearly,
    taskResults,
  };
};
