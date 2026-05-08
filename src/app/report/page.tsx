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

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans print:bg-white print:pb-0 text-slate-900 selection:bg-cyan-100 selection:text-cyan-900">
      
      {/* 印刷用ヘッダー (画面上は非表示) */}
      <div className="hidden print:flex justify-between items-center mb-8 border-b pb-4">
        <div className="font-black text-xl text-cyan-600 italic tracking-tighter">AI Business Diagnosis</div>
        <div className="text-xs text-slate-400 font-bold">診断日: {result.generatedAt}</div>
      </div>

      {/* ナビゲーション (印刷時は非表示) */}
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
          className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl shadow-cyan-100/30 border border-white relative overflow-hidden print:shadow-none print:border-slate-100 print:p-12"
        >
          {/* 装飾用背景要素 */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-50 print:hidden" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 print:hidden" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 text-cyan-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Business Utilization Report
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                  AI業務活用<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">診断レポート</span>
                </h1>
                <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-xl">
                  {basicInfo.name} 様の業務環境に基づいた、<br className="hidden md:block" />AI導入による最適化ロードマップをご提案します。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100/50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</p>
                  <p className="text-lg font-black text-slate-800">{basicInfo.companyName}</p>
                  <p className="text-xs font-bold text-slate-400">{basicInfo.departmentName || '部署未指定'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry & Size</p>
                  <p className="text-lg font-black text-slate-800">{basicInfo.industry}</p>
                  <p className="text-xs font-bold text-slate-400">{basicInfo.companySize} / {basicInfo.role}</p>
                </div>
              </div>
            </div>

            {/* スコア表示サークル */}
            <div className="lg:col-span-5 flex justify-center">
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
                {/* 印刷用スコア (SVGアニメーションの代わり) */}
                <div className="absolute hidden print:block w-full h-full border-8 border-cyan-500 rounded-full" />
                
                <div className="absolute flex flex-col items-center text-center">
                  <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Potential Score</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-7xl md:text-8xl font-black text-slate-900 leading-none">{overallScore}</span>
                    <span className="text-xl md:text-2xl font-black text-slate-300">/5</span>
                  </div>
                  <div className="mt-4 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black tracking-widest uppercase">
                    Level {overallScore === 5 ? 'Elite' : overallScore >= 4 ? 'Pro' : 'Beginner'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. KPIインパクト・サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Monthly Savings
              </p>
              <h3 className="text-3xl font-black text-slate-800 mb-1 leading-none">{kpis.totalSavingsMonthly.toFixed(1)}<span className="text-sm ml-1 text-slate-400">h / 月</span></h3>
              <p className="text-xs font-bold text-slate-400">月間で約 {Math.round(kpis.totalSavingsMonthly / 8 * 10) / 10} 日分を削減</p>
            </div>
            <div className="absolute -bottom-4 -right-4 text-cyan-50/50 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="w-24 h-24" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-cyan-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-cyan-100 relative overflow-hidden group active:scale-[0.98] transition-all"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black text-cyan-200 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Yearly Savings
              </p>
              <h3 className="text-3xl font-black mb-1 leading-none">{Math.round(kpis.totalSavingsYearly)}<span className="text-sm ml-1 text-cyan-200">h / 年</span></h3>
              <p className="text-xs font-bold text-cyan-100/70">年間で {Math.round(kpis.totalSavingsYearly / 8)} 日分の自由時間を創出</p>
            </div>
            <div className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-24 h-24" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target className="w-3.5 h-3.5" /> Focus Tasks
              </p>
              <h3 className="text-3xl font-black text-slate-800 mb-1 leading-none">{kpis.highPotentialTasks}<span className="text-sm ml-1 text-slate-400">件 / {kpis.totalTasks}件</span></h3>
              <p className="text-xs font-bold text-slate-400">即効性の高い「高ポテンシャル業務」</p>
            </div>
            <div className="absolute -bottom-4 -right-4 text-blue-50/50 group-hover:scale-110 transition-transform duration-500">
              <Zap className="w-24 h-24" />
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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Immediate Actions</p>
              {actionPlan.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-cyan-200 transition-all cursor-default">
                  <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</div>
                  <p className="text-sm font-bold text-slate-700">{action}</p>
                </div>
              ))}
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
                      {selectedPlan?.diagnosisNote}
                    </p>
                    {(toolId === 'copilot' || toolId === 'gemini') && (
                      <p className="text-[10px] text-slate-500 font-bold border-t border-white/5 pt-2 mt-2">
                        ※Office系ソフト連携や社内データ参照には上位プラン（Microsoft 365 Copilot等）が必要です。
                      </p>
                    )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            {taskResults.slice(0, 5).map((task, index) => (
              <motion.div 
                key={task.taskId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-cyan-100 transition-all flex flex-col lg:flex-row items-center gap-6"
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
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Score</p>
                    <div className="flex items-center justify-center lg:justify-start gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={cn("w-2 h-2 rounded-full", s <= task.score ? "bg-cyan-500" : "bg-slate-100")} />
                      ))}
                    </div>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Monthly</p>
                    <p className="font-black text-cyan-600 text-lg">{task.savingsMonthly.toFixed(1)}<span className="text-[10px] ml-0.5 text-slate-400">h</span></p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Yearly</p>
                    <p className="font-black text-slate-800 text-lg">{Math.round(task.savingsYearly)}<span className="text-[10px] ml-0.5 text-slate-400">h</span></p>
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">AI Tools</p>
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

                <div className="hidden lg:block w-10 text-right">
                  <ChevronRight className="w-5 h-5 text-slate-200" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 5. 注意が必要な業務セクション */}
        <AnimatePresence>
          {sensitiveTasks.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-orange-50 border-2 border-orange-100 rounded-[3.5rem] p-8 md:p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <ShieldAlert className="w-64 h-64 text-orange-600" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-orange-800 mb-6 flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                  ガバナンス上の注意が必要な業務
                </h3>
                <p className="text-orange-900/70 font-bold mb-8 max-w-2xl leading-relaxed">
                  以下の業務は機密情報、人事、または法務・財務上の重要判断を含んでいる可能性があります。AI利用時には特に以下の運用を徹底してください。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {sensitiveTasks.map((title, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/60 p-4 rounded-2xl border border-orange-200">
                      <Lock className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      <span className="text-sm font-black text-orange-900">{title}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-orange-200 pt-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Rule 1</p>
                    <p className="text-xs font-bold text-orange-800">プロンプトに個人情報、契約書、未公開情報を含めない。</p>
                  </div>
                  <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-orange-200 pt-4 sm:pt-0 sm:pl-6">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Rule 2</p>
                    <p className="text-xs font-bold text-orange-800">AIが出力した法規や財務的助言は必ず有資格者が確認する。</p>
                  </div>
                  <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-orange-200 pt-4 sm:pt-0 sm:pl-6">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Rule 3</p>
                    <p className="text-xs font-bold text-orange-800">オプトアウト設定（学習データに使用させない設定）を有効化する。</p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* 6. 業務別詳細AI活用ガイド */}
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
              className="bg-white rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden group hover:border-cyan-200 transition-all"
            >
              <div className="p-10 md:p-14">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-14">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-4 py-1.5 bg-cyan-50 text-cyan-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-cyan-100">
                        {CATEGORIES.find(c => c.id === task.categoryId)?.label}
                      </span>
                      {task.score >= 4 && (
                        <span className="px-4 py-1.5 bg-gradient-to-r from-orange-400 to-yellow-500 text-white text-[10px] font-black rounded-full flex items-center gap-1 shadow-sm">
                          <Zap className="w-3 h-3 fill-current" /> High Potential
                        </span>
                      )}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-cyan-600 transition-colors">{task.title}</h3>
                    <p className="text-lg text-slate-500 font-bold leading-relaxed">{task.advice}</p>
                  </div>
                  
                  <div className="w-full md:w-auto grid grid-cols-1 gap-4">
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center flex flex-col items-center justify-center min-w-[200px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Recommended AI</p>
                      <div className="flex gap-3 justify-center mb-4">
                        {task.recommendedTools.map(id => (
                          <div key={id} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-800">
                            {id === 'chatgpt' && <MessageSquare className="w-6 h-6" />}
                            {id === 'copilot' && <Briefcase className="w-6 h-6" />}
                            {id === 'gemini' && <Zap className="w-6 h-6" />}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                        {task.recommendedTools.map(id => AI_TOOLS.find(t => t.id === id)?.label).join(' / ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI vs Human Roles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
                  <div className="p-8 bg-cyan-50/50 rounded-[2.5rem] border border-cyan-100 relative overflow-hidden group/role">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-cyan-600 group-hover/role:scale-110 transition-transform">
                      <Cpu className="w-24 h-24" />
                    </div>
                    <h4 className="font-black text-cyan-700 mb-4 flex items-center gap-2">
                      <Cpu className="w-5 h-5" /> AIがリードすべき部分
                    </h4>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{task.aiRole}</p>
                  </div>
                  <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 relative overflow-hidden group/role">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-blue-600 group-hover/role:scale-110 transition-transform">
                      <UserCheck className="w-24 h-24" />
                    </div>
                    <h4 className="font-black text-blue-700 mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5" /> 人間が確認・判断すべき部分
                    </h4>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{task.humanRole}</p>
                  </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-5 space-y-8">
                    <div>
                      <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4 text-cyan-500" /> 品質向上のポイント
                      </h4>
                      <ul className="space-y-3">
                        {task.qualityPointers.map((p, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600 group/item hover:text-slate-900 transition-colors">
                            <span className="mt-1 w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0 group-hover/item:scale-125 transition-transform" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                        <AlertTriangle className="w-4 h-4 text-orange-500" /> 注意が必要な点
                      </h4>
                      <ul className="space-y-3">
                        {task.precautions.map((p, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                            <span className="mt-1 w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-10">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest">
                        <Zap className="w-4 h-4 text-yellow-500" /> 明日からのアクション
                      </h4>
                      <div className="space-y-4">
                        {task.actionItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 text-sm font-bold text-slate-700 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-cyan-200 transition-all active:scale-98 cursor-pointer">
                            <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative group/prompt">
                      <div className="absolute -top-3 left-8 px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-full z-10 shadow-lg group-hover/prompt:bg-cyan-600 transition-colors">PROMPT EXAMPLE</div>
                      <div className="p-8 pt-12 bg-slate-900 rounded-[2.5rem] text-sm md:text-base font-medium text-slate-300 leading-relaxed italic border border-white/10 group-hover/prompt:border-cyan-500/50 transition-all">
                        「{task.promptExample}」
                        <button className="absolute bottom-4 right-8 p-3 bg-white/10 rounded-xl text-white/40 hover:text-white hover:bg-white/20 transition-all opacity-0 group-hover/prompt:opacity-100">
                          <FileText className="w-5 h-5" />
                        </button>
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
            className="bg-slate-200/50 p-10 md:p-16 rounded-[3.5rem] text-center relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none w-full">
              <span className="text-[12rem] font-black tracking-tighter">DISCLAIMER</span>
            </div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Disclaimer / 免責事項</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-4xl mx-auto text-left font-bold bg-white/40 p-8 rounded-3xl backdrop-blur-sm border border-slate-100">
              本レポートに記載されている削減時間・効率化率は、入力内容と一般的なAI活用パターンをもとに算出した予測値であり、実際の成果を保証するものではありません。
              実際の削減効果は、業務の具体的内容、利用するAIツールのプラン、社内環境、データ整備状況、利用者の習熟度によって大きく変動します。<br /><br />
              また、AI（ChatGPT、Copilot、Gemini等）の出力結果は必ず人間が内容を確認し、最終判断・最終承認は利用者またはその責任者が行ってください。
              特に個人情報、機密情報、契約情報、人事評価、財務・法務判断などを扱う場合は、社内ガイドラインや専門家の確認を前提とした運用を徹底してください。
              本レポートの利用によって生じたいかなる損害についても、当方は一切の責任を負いません。
            </p>
          </motion.div>

          <div className="text-center pt-8 border-t border-slate-200 print:hidden">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">AI Business Diagnosis Report v1.2</p>
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
