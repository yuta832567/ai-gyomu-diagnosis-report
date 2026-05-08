'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Legend
} from 'recharts';
import { 
  Download, 
  Share2, 
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
  BarChart3 as BarChartIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiagnosisResult, AIToolId, TaskDiagnosisResult } from '@/lib/types';
import { AI_TOOLS, CATEGORIES } from '@/lib/constants';

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

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
        <p className="text-cyan-800 font-bold">レポートを生成中...</p>
      </div>
    </div>
  );

  const { inputData, kpis, taskResults, radarData, categoryDistribution, overallScore, overallComment, actionPlan } = result;
  const { basicInfo } = inputData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 pb-20 font-sans print:bg-white print:pb-0">
      
      {/* ナビゲーション (印刷時は非表示) */}
      <div className="max-w-5xl mx-auto pt-6 px-4 flex justify-between items-center mb-8 print:hidden">
        <button 
          onClick={() => router.push('/diagnose')}
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-cyan-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          診断に戻る
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            PDFとして保存
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-2xl font-bold hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100">
            <Share2 className="w-4 h-4" />
            結果を共有
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-12">
        
        {/* 1. 表紙エリア */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 md:p-20 rounded-[3rem] shadow-2xl shadow-cyan-100/50 border border-white relative overflow-hidden text-center"
        >
          <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
            <Sparkles className="w-96 h-96 text-cyan-600" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-cyan-50 text-cyan-600 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8">
            <Sparkles className="w-4 h-4" />
            AI Business Diagnosis Report
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">
            AI業務活用<br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">診断レポート</span>
          </h1>

          <div className="max-w-lg mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-12">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target User</p>
              <p className="text-xl font-black text-slate-800">{basicInfo.name} <span className="text-sm font-bold text-slate-400 tracking-normal">様</span></p>
              <p className="text-sm font-bold text-cyan-600">{basicInfo.companyName}</p>
              {basicInfo.departmentName && <p className="text-xs font-bold text-slate-400">{basicInfo.departmentName}</p>}
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis Date</p>
              <p className="text-xl font-black text-slate-800">{result.generatedAt}</p>
              <div className="flex gap-2 pt-1">
                {inputData.selectedTools.map(id => (
                  <span key={id} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded-md border border-slate-200">
                    {AI_TOOLS.find(t => t.id === id)?.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-center gap-4 text-slate-400 font-bold text-sm">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-500" /> 入力完了</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-500" /> モックエンジンによる診断済</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-500" /> 2026年最新基準適応</span>
          </div>
        </motion.div>

        {/* 2. 総合診断 & KPI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* スコアカード */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Overall Score</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-7xl font-black">{overallScore}</span>
                <span className="text-xl font-bold opacity-40">/ 5.0</span>
              </div>
              <div className="flex gap-1 mb-10">
                {[1, 2, 3, 4, 5].map(s => (
                  <div key={s} className={cn("h-2 flex-1 rounded-full", s <= overallScore ? "bg-cyan-400" : "bg-white/10")} />
                ))}
              </div>
              <p className="text-sm font-bold text-cyan-100/80 leading-relaxed italic">
                「{overallComment}」
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10">
              <TrendingUp className="w-64 h-64 text-white" />
            </div>
          </motion.div>

          {/* KPIカード */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Savings</p>
                <h3 className="text-sm font-black text-slate-800">月間削減時間</h3>
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black text-cyan-600">{kpis.totalSavingsMonthly.toFixed(1)}</span>
                <span className="text-xl font-black text-slate-300">h</span>
              </div>
              <p className="mt-4 text-xs font-bold text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 1回あたり平均 {(kpis.totalSavingsPerTime / kpis.totalTasks).toFixed(1)}h 削減
              </p>
            </div>

            <div className="bg-cyan-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-cyan-100 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Yearly Savings</p>
                <h3 className="text-sm font-black text-white">年間削減時間</h3>
              </div>
              <div className="mt-6 flex items-baseline gap-2 text-white">
                <span className="text-5xl font-black">{Math.round(kpis.totalSavingsYearly)}</span>
                <span className="text-xl font-black opacity-40">h</span>
              </div>
              <p className="mt-4 text-xs font-bold text-cyan-100/60 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> 年間約 {Math.round(kpis.totalSavingsYearly / 8)} 日分の自由時間を創出
              </p>
            </div>
          </motion.div>
        </div>

        {/* 3. グラフセクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 棒グラフ: 業務別削減時間 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-cyan-500" />
              業務別の月間削減時間
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskResults.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="title" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="savingsMonthly" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* レーダーチャート: AI活用度 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-500" />
              AI活用ポテンシャル分析
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                  <Radar name="Potential" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* 4. 業務別ランキング */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8 px-4">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-cyan-500" />
              削減効果ランキング
            </h2>
            <p className="text-xs font-bold text-slate-400">※効果の高い順に表示</p>
          </div>
          
          <div className="space-y-4">
            {taskResults.map((task, index) => (
              <div key={task.taskId} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <span className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-2xl text-lg font-black shadow-lg",
                    index === 0 ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white" : 
                    index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-400 text-white" :
                    index === 2 ? "bg-gradient-to-br from-orange-300 to-orange-400 text-white" : "bg-slate-50 text-slate-400"
                  )}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-800 leading-tight">{task.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400">{CATEGORIES.find(c => c.id === task.categoryId)?.label}</p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                  <div className="text-center md:text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Score</p>
                    <div className="flex items-center justify-center md:justify-start gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={cn("w-2 h-2 rounded-full", s <= task.score ? "bg-cyan-500" : "bg-slate-100")} />
                      ))}
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Monthly</p>
                    <p className="font-black text-cyan-600">{task.savingsMonthly.toFixed(1)}h</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Yearly</p>
                    <p className="font-black text-slate-800">{Math.round(task.savingsYearly)}h</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Recommended</p>
                    <div className="flex gap-1 justify-center md:justify-start">
                      {task.recommendedTools.map(id => (
                        <span key={id} className="text-[9px] font-black px-2 py-0.5 bg-cyan-50 text-cyan-600 rounded-md">
                          {AI_TOOLS.find(t => t.id === id)?.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden md:block">
                  <ChevronRight className="w-5 h-5 text-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 5. 業務別詳細アドバイス */}
        <div className="space-y-12">
          <h2 className="text-2xl font-black text-slate-800 px-4">業務別AI活用ガイド</h2>
          {taskResults.map((task) => (
            <motion.div 
              key={task.taskId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[3.5rem] shadow-xl border border-white overflow-hidden"
            >
              <div className="p-10 md:p-12">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-[10px] font-black rounded-full tracking-wider uppercase">
                        {CATEGORIES.find(c => c.id === task.categoryId)?.label}
                      </span>
                      {task.score >= 4 && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3" /> 高ポテンシャル
                        </span>
                      )}
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{task.title}</h3>
                    <p className="text-slate-500 font-medium">{task.advice}</p>
                  </div>
                  <div className="w-full md:w-auto p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Recommended Tool</p>
                    <div className="flex gap-2 justify-center">
                      {task.recommendedTools.map(id => (
                        <div key={id} className="flex flex-col items-center gap-1">
                          <div className="p-3 bg-white rounded-2xl shadow-sm text-cyan-600">
                            {id === 'chatgpt' && <MessageSquare className="w-6 h-6" />}
                            {id === 'copilot' && <Briefcase className="w-6 h-6" />}
                            {id === 'gemini' && <Zap className="w-6 h-6" />}
                          </div>
                          <span className="text-[9px] font-black text-slate-600">{AI_TOOLS.find(t => t.id === id)?.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="bg-cyan-50/50 p-8 rounded-[2.5rem] border border-cyan-50">
                      <h4 className="font-black text-cyan-700 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" /> 品質向上のポイント
                      </h4>
                      <ul className="space-y-3">
                        {task.qualityPointers.map((p, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                            <span className="mt-1 w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50/50 p-8 rounded-[2.5rem] border border-orange-50">
                      <h4 className="font-black text-orange-700 mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" /> 注意点
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

                  <div className="space-y-8">
                    <div>
                      <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-cyan-500" /> 明日からのアクション
                      </h4>
                      <div className="space-y-3">
                        {task.actionItems.map((item, i) => (
                          <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 text-sm font-bold text-slate-700 transition-all hover:bg-white hover:shadow-sm">
                            <span className="w-6 h-6 bg-cyan-500 text-white rounded-lg flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -top-3 left-6 px-4 py-1 bg-slate-900 text-white text-[10px] font-black rounded-full z-10">PROMPT EXAMPLE</div>
                      <div className="p-8 pt-10 bg-slate-50 border-2 border-slate-200 border-dashed rounded-[2.5rem] text-sm font-medium text-slate-600 italic leading-relaxed">
                        「{task.promptExample}」
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 6. 注意が必要な業務 & 明日からのアクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-[3rem] border-2 border-orange-100 shadow-xl shadow-orange-50/50"
          >
            <h3 className="text-xl font-black text-orange-700 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              慎重な判断が必要な業務
            </h3>
            <div className="space-y-4">
              {taskResults.filter(t => t.score <= 2 || t.precautions.some(p => p.includes('機密') || p.includes('人事'))).map(t => (
                <div key={t.taskId} className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-4">
                  <ShieldAlert className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-black text-orange-800">{t.title}</p>
                    <p className="text-[10px] font-bold text-orange-600/70">コンプライアンスや機密保持に留意が必要です。</p>
                  </div>
                </div>
              ))}
              {taskResults.filter(t => t.score <= 2).length === 0 && (
                <p className="text-sm font-bold text-slate-400 italic">特になし</p>
              )}
            </div>
            <p className="mt-8 text-xs font-bold text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <Info className="w-4 h-4 inline-block mr-1 text-slate-400" />
              AIは業務を補助するためのツールです。最終判断や最終承認は必ず人間が行ってください。
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-200"
          >
            <h3 className="text-xl font-black text-cyan-400 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6" />
              明日からのアクション
            </h3>
            <div className="space-y-4">
              {actionPlan.map((action, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-cyan-400 font-black text-sm flex-shrink-0">{i + 1}</div>
                  <p className="text-sm font-bold text-slate-200 pt-1 leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 7. 免責文 */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-slate-100/50 p-10 rounded-[3rem] text-center"
        >
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Disclaimer / 免責文</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed max-w-3xl mx-auto text-left md:text-center font-medium">
            本レポートに記載されている削減時間・効率化率は、入力内容と一般的なAI活用パターンをもとにした予測値です。
            実際の削減効果は、業務内容、利用するAIツールのプラン、社内ルール、利用者の習熟度、データ整備状況によって変動します。
            記載された効果を保証するものではありません。<br /><br />
            また、AIの出力結果は必ず人間が確認し、最終判断・最終承認は利用者または責任者が行ってください。
            個人情報・機密情報・契約情報・人事評価・法務判断などを扱う場合は、社内ルールや専門家の確認を前提にしてください。
          </p>
        </motion.div>

        {/* フッター */}
        <div className="text-center pb-12 pt-8 border-t border-slate-100 print:hidden">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">AI Business Diagnosis v1.0</p>
        </div>

      </div>
    </div>
  );
}
