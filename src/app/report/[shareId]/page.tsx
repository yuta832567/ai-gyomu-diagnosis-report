'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DiagnosisResult } from '@/lib/types';
import { getReportByShareId } from '@/lib/reportStorage';
import ReportView from '@/components/report/ReportView';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function SharedReportPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params?.shareId as string;
  
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      if (!shareId) return;
      
      setLoading(true);
      const record = await getReportByShareId(shareId);
      
      if (record) {
        setResult(record.report_data);
        setError(null);
      } else {
        setError('診断レポートが見つかりませんでした。URLが正しいか確認してください。');
      }
      setLoading(false);
    }

    loadReport();
  }, [shareId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-cyan-800 font-bold text-sm tracking-wider">レポートを読み込み中...</p>
      </div>
    </div>
  );

  if (error || !result) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center"
      >
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-800 mb-4">レポートが見つかりません</h2>
        <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
          {error || 'お探しの診断レポートは削除されたか、URLが間違っている可能性があります。'}
        </p>
        <button 
          onClick={() => router.push('/diagnose')}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          新しく診断を始める
        </button>
      </motion.div>
    </div>
  );

  return (
    <ReportView 
      result={result} 
      shareId={shareId}
    />
  );
}
