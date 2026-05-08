'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  Lightbulb, 
  ShieldAlert,
  Zap,
  ChevronRight,
  Printer,
  Info,
  Laptop,
  Briefcase,
  Target,
  FileText,
  UserCheck,
  Cpu,
  Lock,
  ArrowRight,
  Share2,
  BarChart3 as BarChartIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiagnosisResult, AIToolId, TaskDiagnosisResult } from '@/lib/types';
import { AI_TOOLS, CATEGORIES, AI_PLANS_METADATA } from '@/lib/constants';

export default function ReportPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('diagnosis_result');
    if (saved) {
      setResult(JSON.parse(saved));
    } else {
      router.push('/diagnose');
    }
  }, [router]);

  if (!result) return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-cyan-800 font-bold">レポートを解析中...</p>
      </div>
    </div>
  );

  const { inputData, kpis, taskResults, radarData, overallScore, overallComment, actionPlan, sensitiveTasks } = result;
  const { basicInfo } = inputData;

  const handlePrint = () => {
    window.print();
  };

  // スコアの意味
  const getScoreText = (score: number) => {
    if (score >= 5) return 'とても活用しやすい';
    if (score >= 4) return '活用しやすい';
    if (score >= 3) return '一部活用できる';
    if (score >= 2) return '条件付きで活用できる';
    return '慎重に判断';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans print:bg-white print:pb-0 text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 leading-relaxed">
      
      {/* 印刷用ヘッダー */}
      <div className="hidden print:flex justify-between items-center mb-8 border-b pb-4">
        <div className="font-black text-xl text-cyan-600 italic tracking-tighter">AI業務活用診断レポート</div>
        <div className="text-xs text-slate-400 font-bold">診断日: {result.generatedAt}</div>
      </div>

      {/* ナビゲーション */}
      <div className="max-w-6xl mx-auto pt-6 px-4 flex justify-between items-center mb-8 print:hidden">
        <button 
          onClick={() => router.push('/diagnose')}
          className="group flex items-center gap-2 text-slate-400 font-bold hover:text-cyan-600 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:border-cyan-200 group-hover:shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </div>
          診断に戻る
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">印刷・PDF保存</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-2xl font-bold hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100 active:scale-95">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">共有</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-12">
        
        {/* 1. 表紙・ヒーローエリア */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-16 rounded-[3.5rem] shadow-2xl shadow-cyan-100/30 border border-white relative overflow-hidden print:shadow-none print:border-slate-100 print:p-12"
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-50 print:hidden" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 text-cyan-600 rounded-full text-[11px] font-black tracking-[0.1em] mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI業務活用診断レポート
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                  AI業務活用<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">診断レポート</span>
                </h1>
                <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-xl">
                  {basicInfo.name} 様の業務環境に基づいた、<br className="hidden md:block" />AI導入による最適化ロードマップをご提案します。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100/50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">会社名</p>
                  <p className="text-lg font-black text-slate-800">{basicInfo.companyName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">氏名</p>
                  <p className="text-lg font-black text-slate-800">{basicInfo.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">業種・会社規模</p>
                  <p className="text-base font-black text-slate-800">{basicInfo.industry} / {basicInfo.companySize}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">役職</p>
                  <p className="text-base font-black text-slate-800">{basicInfo.role}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">診断対象ツール・プラン</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {inputData.selectedTools.map(id => (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700">
                        {AI_TOOLS.find(t => t.id === id)?.label} ({inputData.toolPlans[id]})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">診断日</p>
                  <p className="text-base font-black text-slate-800">{result.generatedAt}</p>
                </div>
              </div>
            </div>

            {/* スコア表示サークル */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 print:hidden">
                  <circle
                    cx="50%" cy="50%" r="45%"
                    className="stroke-slate-100 fill-none"
                    strokeWidth="12"
                  />
                  <motion.circle
                    cx="50%" cy="50%" r="45%"
                    className="stroke-cyan-500 fill-none"
                    strokeWidth="12"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 1000" }}
                    animate={{ strokeDasharray: `${(overallScore / 5) * 282}% 1000%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute hidden print:block w-full h-full border-8 border-cyan-500 rounded-full" />
                
                <div className="absolute flex flex-col items-center text-center px-6">
                  <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-1">AI活用ポテンシャル</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-7xl md:text-8xl font-black text-slate-900 leading-none">{overallScore}</span>
                    <span className="text-xl md:text-2xl font-black text-slate-300">/5</span>
                  </div>
                  <div className="mt-4 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black tracking-widest uppercase">
                    {getScoreText(overallScore)}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[10px] font-bold text-slate-400 text-center max-w-[200px]">
                5段階評価で、AIを活用しやすい業務がどれくらいあるかを示しています。
              </p>
            </div>
          </div>
        </motion.div>

        {/* 2. KPIインパクト・サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> 月間削減時間
              </p>
              <h3 className="text-3xl font-black text-slate-800 mb-1 leading-none">{kpis.totalSavingsMonthly.toFixed(1)}<span className="text-sm ml-1 text-slate-400">時間 / 月</span></h3>
              <p className="text-[10px] font-bold text-slate-400 mt-2">入力内容に基づく予測値です</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-cyan-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-cyan-100 relative overflow-hidden group"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black text-cyan-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> 年間削減時間
              </p>
              <h3 className="text-3xl font-black mb-1 leading-none">{Math.round(kpis.totalSavingsYearly)}<span className="text-sm ml-1 text-cyan-200">時間 / 年</span></h3>
              <p className="text-[10px] font-bold text-cyan-100/70 mt-2">年間で {Math.round(kpis.totalSavingsYearly / 8)} 日分の自由時間を創出</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> まず取り組む業務
              </p>
              <h3 className="text-2xl font-black text-slate-800 mb-1 leading-tight">{taskResults[0]?.title || 'なし'}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-2">最も削減効果が高い業務です</p>
            </div>
          </motion.div>
        </div>

        {/* 3. 総評 & ツール別注意表示 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-500" />
              総合診断アドバイス
            </h3>
            <p className="text-slate-600 font-bold leading-relaxed mb-8">
              {overallComment}
            </p>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">すぐ試せるアクション</p>
              {actionPlan.map((action, i) => {
                // 選択ツールに応じたアクションのみを表示
                const isCopilotAction = action.includes('Copilot');
                const isGeminiAction = action.includes('Gemini');
                const hasCopilot = inputData.selectedTools.includes('copilot');
                const hasGemini = inputData.selectedTools.includes('gemini');
                
                if (isCopilotAction && !hasCopilot) return null;
                if (isGeminiAction && !hasGemini) return null;

                return (
                  <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</div>
                    <p className="text-sm font-bold text-slate-700">{action}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* ツール固有の注意表示 */}
            {inputData.selectedTools.map(toolId => {
              const plans = AI_PLANS_METADATA[toolId];
              const selectedPlan = plans.find(p => p.label === inputData.toolPlans[toolId]);
              
              let warningText = "";
              if (toolId === 'chatgpt') warningText = "ChatGPTの利用可能機能はプランによって異なります。ファイル読解、データ分析、画像生成などは利用プランや提供状況により変わる場合があります。";
              if (toolId === 'copilot') warningText = "Copilot Chat と Microsoft 365 Copilot では、利用できる機能が異なります。Word、Excel、PowerPoint、Outlook、Teams内でのCopilot機能は、ライセンスや管理者設定によって利用可否が変わります。";
              if (toolId === 'gemini') warningText = "Gemini Chat と Gemini for Google Workspace では、利用できる機能が異なります。Gmail、Google Docs、Sheets、Slides、Drive内での機能は、プランや管理者設定によって利用可否が変わります。";

              return (
                <div key={toolId} className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/10 rounded-xl">
                      {toolId === 'chatgpt' && <MessageSquare className="w-5 h-5 text-cyan-400" />}
                      {toolId === 'copilot' && <Briefcase className="w-5 h-5 text-blue-400" />}
                      {toolId === 'gemini' && <Zap className="w-5 h-5 text-yellow-400" />}
                    </div>
                    <div>
                      <h4 className="font-black text-sm">{AI_TOOLS.find(t => t.id === toolId)?.label}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{selectedPlan?.label}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-[11px] font-bold text-slate-300 leading-relaxed mb-2 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      {warningText}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* 4. 削減効果ランキング */}
        <section>
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <BarChartIcon className="w-6 h-6 text-cyan-500" />
              削減効果ランキング
            </h2>
            <p className="text-[10px] font-bold text-slate-400 hidden sm:block">※削減時間の多い順に表示しています</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            {taskResults.slice(0, 5).map((task, index) => (
              <motion.div 
                key={task.taskId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row items-center gap-6"
              >
                <div className="flex items-center gap-4 w-full lg:w-[30%]">
                  <div className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-2xl text-lg font-black shadow-lg flex-shrink-0",
                    index === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" : 
                    index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white" :
                    index === 2 ? "bg-gradient-to-br from-orange-300 to-orange-400 text-white" : "bg-slate-50 text-slate-400"
                  )}>
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-800 leading-tight truncate">{task.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded uppercase">
                        {CATEGORIES.find(c => c.id === task.categoryId)?.label}
                      </span>
                      {task.hasSensitivity && <span className="text-orange-500 flex items-center gap-1 text-[9px] font-black"><ShieldAlert className="w-3 h-3" /> 要注意</span>}
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-6 w-full py-4 border-y lg:border-y-0 lg:py-0">
                  <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-tighter">AI活用スコア</p>
                    <div className="flex items-center justify-center lg:justify-start gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={cn("w-2 h-2 rounded-full", s <= task.score ? "bg-cyan-500" : "bg-slate-100")} />
                      ))}
                    </div>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-tighter">月間削減時間</p>
                    <p className="font-black text-cyan-600 text-lg">{task.savingsMonthly.toFixed(1)}<span className="text-[10px] ml-0.5 text-slate-400">時間</span></p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-tighter">年間削減時間</p>
                    <p className="font-black text-slate-800 text-lg">{Math.round(task.savingsYearly)}<span className="text-[10px] ml-0.5 text-slate-400">時間</span></p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-tighter">おすすめAI</p>
                    <div className="flex gap-1 justify-center lg:justify-start">
                      {task.recommendedTools.map(id => (
                        <div key={id} className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                          {id === 'chatgpt' && <MessageSquare className="w-3.5 h-3.5" />}
                          {id === 'copilot' && <Briefcase className="w-3.5 h-3.5" />}
                          {id === 'gemini' && <Zap className="w-3.5 h-3.5" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[15%] text-right">
                  <span className="text-[10px] font-black text-cyan-600 block mb-1">まずやること</span>
                  <p className="text-[11px] font-bold text-slate-700 line-clamp-1">{task.actionItems[0]}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 5. 業務別AI活用ガイド */}
        <section className="space-y-12">
          <div className="px-4">
            <h2 className="text-3xl font-black text-slate-800 mb-2">業務別AI活用ガイド</h2>
            <p className="text-slate-400 font-bold">明日からすぐに実践できる具体的な活用プラン</p>
          </div>
          
          {taskResults.slice(0, 8).map((task, index) => (
            <motion.div 
              key={task.taskId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-white rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden group"
            >
              <div className="p-10 md:p-14">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-14">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-4 py-1.5 bg-cyan-50 text-cyan-700 text-[11px] font-black rounded-full border border-cyan-100">
                        {CATEGORIES.find(c => c.id === task.categoryId)?.label}
                      </span>
                      <span className="px-4 py-1.5 bg-gradient-to-r from-orange-400 to-yellow-500 text-white text-[11px] font-black rounded-full flex items-center gap-1 shadow-sm">
                        活用優先度: {getScoreText(task.score)}
                      </span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-cyan-600 transition-colors">{task.title}</h3>
                    <p className="text-lg text-slate-500 font-bold leading-relaxed">{task.advice}</p>
                  </div>
                  
                  <div className="w-full md:w-auto min-w-[220px]">
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">おすすめAI</p>
                      <div className="flex gap-3 justify-center mb-4">
                        {task.recommendedTools.map(id => (
                          <div key={id} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-800">
                            {id === 'chatgpt' && <MessageSquare className="w-6 h-6" />}
                            {id === 'copilot' && <Briefcase className="w-6 h-6" />}
                            {id === 'gemini' && <Zap className="w-6 h-6" />}
                          </div>
                        ))}
                      </div>
                      <p className="text-[11px] font-black text-slate-800">
                        {task.recommendedTools.map(id => AI_TOOLS.find(t => t.id === id)?.label).join(' / ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI vs Human Roles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
                  <div className="p-8 bg-cyan-50/50 rounded-[2.5rem] border border-cyan-100">
                    <h4 className="font-black text-cyan-700 mb-4 flex items-center gap-2">
                      <Cpu className="w-5 h-5" /> AIに任せやすい部分
                    </h4>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{task.aiRole}</p>
                  </div>
                  <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
                    <h4 className="font-black text-blue-700 mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5" /> 人間が確認すべき部分
                    </h4>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{task.humanRole}</p>
                  </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-5 space-y-8">
                    <div>
                      <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-cyan-500" /> 品質向上のポイント
                      </h4>
                      <ul className="space-y-3">
                        {task.qualityPointers.map((p, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-orange-500" /> 注意点
                      </h4>
                      <ul className="space-y-3">
                        {task.precautions.map((p, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6 bg-red-50 border border-red-100 rounded-3xl">
                      <h4 className="font-black text-red-700 mb-3 flex items-center gap-2 text-sm">
                        <Lock className="w-4 h-4" /> 入力してはいけない情報
                      </h4>
                      <p className="text-xs font-bold text-red-600 leading-relaxed">
                        {task.doNotInput}
                        <br />
                        <span className="mt-2 block opacity-70">※機密情報、個人情報、顧客情報をそのまま入力しないようご注意ください。</span>
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-10">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-yellow-500" /> 明日からのアクション
                      </h4>
                      <div className="space-y-4">
                        {task.actionItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 text-sm font-bold text-slate-700 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative group/prompt">
                      <div className="absolute -top-3 left-8 px-4 py-1.5 bg-slate-900 text-white text-[11px] font-black rounded-full z-10 shadow-lg">プロンプト例</div>
                      <div className="p-8 pt-12 bg-slate-900 rounded-[2.5rem] text-sm md:text-base font-medium text-slate-300 leading-relaxed italic border border-white/10">
                        「{task.promptExample}」
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* 7. 免責文・フッター */}
        <footer className="space-y-12">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="bg-slate-100 p-10 md:p-16 rounded-[3.5rem] border border-slate-200"
          >
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-slate-400" />
              ご利用上の注意
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <p className="text-[13px] text-slate-600 leading-relaxed font-bold">
                このレポートの削減時間や効率化率は、入力内容をもとにした予測値です。<br />
                実際の効果は、業務内容、社内ルール、利用プラン、AIの使い方によって変わります。効果を保証するものではありません。<br /><br />
                AIツールに入力してよい情報・入力してはいけない情報を社内ルールに沿って確認しましょう。
              </p>
              <p className="text-[13px] text-slate-600 leading-relaxed font-bold">
                AIの出力結果は必ず人間が確認し、最終判断・最終承認は利用者または責任者が行ってください。<br />
                個人情報、機密情報、契約情報、人事評価、法務判断などを扱う場合は、社内ルールや専門家の確認を前提にしてください。
              </p>
            </div>
          </motion.div>

          <div className="text-center pt-8 border-t border-slate-200 print:hidden">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">AI業務活用診断レポート v1.2</p>
            <div className="flex justify-center gap-6 text-slate-300">
              <Laptop className="w-5 h-5" />
              <Briefcase className="w-5 h-5" />
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
