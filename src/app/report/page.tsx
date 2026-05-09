'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiagnosisResult } from '@/lib/types';
import ReportView from '@/components/report/ReportView';

export default function ReportPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    // localStorageから最新の診断結果を取得
    const saved = localStorage.getItem('diagnosis_result');
    if (saved) {
      try {
        setResult(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved diagnosis result:', err);
        router.push('/diagnose');
      }
    } else {
      router.push('/diagnose');
    }
  }, [router]);

  if (!result) return (
    <div className="min-h-screen flex items-center justify-center bg-cyan-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-cyan-800 font-bold text-sm tracking-wider">レポートを解析中...</p>
      </div>
    </div>
  );

  return (
    <ReportView 
      result={result} 
      onBackToDiagnose={() => router.push('/diagnose')}
    />
  );
}
