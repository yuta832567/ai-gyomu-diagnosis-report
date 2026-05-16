'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Clock, 
  BarChart3, 
  Wand2, 
  ShieldAlert, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight,
  MousePointer2,
  Cpu,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 leading-relaxed font-sans overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-40" />
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center text-center space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-cyan-100 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span className="text-[11px] font-black text-cyan-700 uppercase tracking-widest text-nowrap">AI業務活用診断</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              生成AI業務診断ツール
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl md:text-2xl font-bold text-cyan-600 tracking-tight max-w-2xl">
              あなたの業務に最適な活用方法を診断
            </motion.p>

            <motion.p variants={itemVariants} className="text-base md:text-lg text-slate-500 font-bold max-w-2xl leading-relaxed">
              業務内容やAI利用状況を入力すると、AI活用ポテンシャル、削減時間、推奨AIツール、明日から使えるプロンプト例を診断できます。
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-6 pt-4 w-full sm:w-auto">
              <Link 
                href="/diagnose"
                className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 group"
              >
                診断をはじめる
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section: What you can learn */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-black text-slate-900">このツールでわかること</h2>
            <p className="text-slate-500 font-bold">独自の分析エンジンにより、AI導入の具体的なメリットを可視化します</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MousePointer2 className="w-6 h-6" />}
              title="AI活用しやすい業務"
              desc="登録した業務の中から、AIが代行・補助できる可能性が高いものをピックアップします。"
              color="cyan"
            />
            <FeatureCard 
              icon={<Clock className="w-6 h-6" />}
              title="削減時間のシミュレーション"
              desc="月間・年間でどれくらいの時間が削減できるか、具体的な数値で算出します。"
              color="blue"
            />
            <FeatureCard 
              icon={<Cpu className="w-6 h-6" />}
              title="おすすめAIツール"
              desc="業務の性質（文章、コード、画像など）に合わせて、最適なAIツールを提案します。"
              color="indigo"
            />
            <FeatureCard 
              icon={<Wand2 className="w-6 h-6" />}
              title="業務別の活用アドバイス"
              desc="AIをどう使い分けるか、業務の質をどう上げるか、具体的な活用方法を助言します。"
              color="violet"
            />
            <FeatureCard 
              icon={<ShieldAlert className="w-6 h-6" />}
              title="注意が必要な情報"
              desc="個人情報や機密情報など、AIに入力してはいけない情報のリスクを指摘します。"
              color="rose"
            />
            <FeatureCard 
              icon={<FileText className="w-6 h-6" />}
              title="そのまま使えるプロンプト"
              desc="各業務ですぐに試せる、精度の高いプロンプト例（指示文）を生成します。"
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-black text-slate-900">診断の流れ</h2>
            <p className="text-slate-500 font-bold">準備は不要。5つのステップに答えるだけで完了します</p>
          </div>

          <div className="relative">
            {/* 接続線 (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2 -z-10" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              <StepItem number="1" title="基本情報を入力" desc="氏名、会社、役職などの基本的な属性を入力します。" />
              <StepItem number="2" title="AIツールを選択" desc="現在利用中、または興味のあるツールを選びます。" />
              <StepItem number="3" title="業務内容を登録" desc="普段行っている業務とその頻度・時間を入力します。" />
              <StepItem number="4" title="内容の最終確認" desc="入力内容に間違いがないか、確認画面でチェックします。" />
              <StepItem number="5" title="レポートの確認" desc="削減効果やプロンプト例が詰まったレポートが完成します。" />
            </div>
          </div>
        </div>
      </section>

      {/* Report Features Section */}
      <section className="py-24 bg-slate-900 text-white rounded-[3rem] mx-4 my-12 overflow-hidden relative shadow-2xl shadow-slate-200">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500 rounded-full blur-[150px] opacity-20" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-black leading-tight">直感的で、<br />すぐに行動に移せるレポート</h2>
              <p className="text-slate-400 font-bold text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                分析して終わりではありません。明日からの業務がどう変わるか、具体的なイメージが湧くレポートを提供します。
              </p>
              
              <ul className="space-y-6 text-left max-w-md mx-auto lg:mx-0">
                <ReportFeatureItem title="AI活用ポテンシャルスコア" desc="現在の業務がどれくらいAIと相性が良いかを5段階で判定します。" />
                <ReportFeatureItem title="業務別AI活用ガイド" desc="一つ一つの業務に対して、どのようにAIを使えば良いか詳細に解説します。" />
                <ReportFeatureItem title="共有と保存" desc="PDFとして保存したり、共有URLを発行して関係者へすぐに送ることができます。" />
              </ul>
            </div>
            
            <div className="relative max-w-md mx-auto w-full">
              <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-white">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">レポートサンプル</p>
                      <h3 className="text-xl font-black">業務効率化シミュレーション</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">月間削減時間</p>
                      <p className="text-3xl font-black text-cyan-400">42.5 h</p>
                    </div>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">総合スコア</p>
                      <p className="text-3xl font-black text-cyan-400">4.8</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="w-[85%] h-full bg-cyan-500" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">実行しやすい提案を自動生成</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-24 bg-[#f8fafc] border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3 text-slate-800">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-slate-500" />
              </div>
              <h3 className="font-black text-lg uppercase tracking-widest">ご利用にあたって</h3>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DisclaimerItem text="本レポートは入力内容をもとにした簡易診断です。" />
              <DisclaimerItem text="AIの出力結果は必ず人間が確認してください。" />
              <DisclaimerItem text="個人情報、機密情報、未公開情報の入力には注意してください。" />
            </ul>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30 blur-[100px]">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-50 to-blue-50" />
        </div>
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">さあ、あなたの業務の「AIポテンシャル」を<br className="hidden md:block" />確かめてみましょう</h2>
          <div className="flex flex-col items-center gap-6">
            <Link 
              href="/diagnose"
              className="px-12 py-6 bg-cyan-600 text-white rounded-[2.5rem] font-black text-xl hover:bg-cyan-700 transition-all shadow-2xl shadow-cyan-200 active:scale-95 flex items-center gap-4"
            >
              診断をはじめる
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="text-slate-400 font-bold text-sm tracking-tight">入力内容をもとに、すぐに診断レポートを確認できます</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-6 opacity-40">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span className="font-black text-sm tracking-tight">生成AI業務診断ツール</span>
        </div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">© 2026 AI Business Diagnosis Project</p>
      </footer>
    </div>
  );
}

/**
 * Components
 */
function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  const colorMap: Record<string, string> = {
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:border-cyan-100 group">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm", colorMap[color])}>
        {icon}
      </div>
      <h3 className="text-lg font-black text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-500 font-bold text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function StepItem({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 group">
      <div className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xl transition-all group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-600 group-hover:scale-110 shadow-sm">
        {number}
      </div>
      <div className="space-y-2">
        <h4 className="font-black text-slate-800">{title}</h4>
        <p className="text-[11px] font-bold text-slate-400 leading-relaxed px-4">{desc}</p>
      </div>
    </div>
  );
}

function ReportFeatureItem({ title, desc }: { title: string, desc: string }) {
  return (
    <li className="flex gap-4">
      <div className="w-6 h-6 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
        <CheckCircle2 className="w-4 h-4" />
      </div>
      <div>
        <h4 className="font-black text-white text-base mb-1">{title}</h4>
        <p className="text-slate-400 font-bold text-sm leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}

function DisclaimerItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-slate-400 font-bold text-[11px] leading-relaxed">
      <div className="w-1.5 h-1.5 bg-slate-200 rounded-full mt-1.5 flex-shrink-0" />
      {text}
    </li>
  );
}
