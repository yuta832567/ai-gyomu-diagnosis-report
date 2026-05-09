'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Building2, 
  Clock, 
  Calendar, 
  Target, 
  Search, 
  Filter, 
  ExternalLink, 
  AlertCircle,
  ArrowUpDown,
  Laptop,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Database,
  BarChart3,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiagnosisRecord } from '@/lib/types';
import { getAllReports } from '@/lib/reportStorage';
import { AI_TOOLS } from '@/lib/constants';

export default function AdminDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // フィルター用ステート
  const [searchCompany, setSearchCompany] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterTool, setFilterTool] = useState('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 環境変数のチェック（簡易的）
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
          setError('Supabaseが未設定、または接続できないため、保存済み診断一覧を表示できません。');
          setLoading(false);
          return;
        }

        const data = await getAllReports();
        setReports(data);
      } catch (err) {
        setError('データの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // フィルタリング処理
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchCompany = report.company_name.toLowerCase().includes(searchCompany.toLowerCase());
      const matchIndustry = filterIndustry === 'all' || report.industry === filterIndustry;
      const matchTool = filterTool === 'all' || report.selected_tools.includes(filterTool);
      return matchCompany && matchIndustry && matchTool;
    });
  }, [reports, searchCompany, filterIndustry, filterTool]);

  // CSVエクスポート処理
  const handleExportCSV = () => {
    if (filteredReports.length === 0) {
      alert('出力できる診断結果がありません。');
      return;
    }

    const headers = [
      '診断日時',
      '氏名',
      '会社名',
      '部署名',
      '役職',
      '業種',
      '会社規模',
      '選択AIツール',
      '登録業務数',
      '月間削減時間',
      '年間削減時間',
      'AI活用スコア',
      '共有URL'
    ];

    const rows = filteredReports.map(report => {
      const date = new Date(report.created_at).toLocaleString('ja-JP');
      const tools = report.selected_tools.map(id => AI_TOOLS.find(t => t.id === id)?.label).join(' / ');
      const shareUrl = `${window.location.origin}/report/${report.share_id}`;
      
      return [
        date,
        report.name,
        report.company_name,
        report.department_name || '',
        report.role,
        report.industry,
        report.company_size,
        tools,
        report.input_data.tasks.length,
        report.report_data.kpis.totalSavingsMonthly.toFixed(1),
        Math.round(report.report_data.kpis.totalSavingsYearly),
        report.report_data.overallScore,
        shareUrl
      ].map(val => `"${String(val).replace(/"/g, '""')}"`); // カンマやクォートの対策
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Excel対応のためUTF-8 BOMを付与
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ai-gyomu-diagnosis-reports_${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 集計データ
  const stats = useMemo(() => {
    if (filteredReports.length === 0) return {
      total: 0,
      uniqueCompanies: 0,
      totalMonthlySavings: 0,
      totalYearlySavings: 0,
      avgScore: 0
    };

    const companies = new Set(filteredReports.map(r => r.company_name));
    const totalMonthly = filteredReports.reduce((acc, r) => acc + (r.report_data.kpis?.totalSavingsMonthly || 0), 0);
    const totalYearly = filteredReports.reduce((acc, r) => acc + (r.report_data.kpis?.totalSavingsYearly || 0), 0);
    const avgScore = filteredReports.reduce((acc, r) => acc + (r.report_data.overallScore || 0), 0) / filteredReports.length;

    return {
      total: filteredReports.length,
      uniqueCompanies: companies.size,
      totalMonthlySavings: totalMonthly,
      totalYearlySavings: totalYearly,
      avgScore: avgScore
    };
  }, [filteredReports]);

  // ユニークな業種の抽出
  const industries = useMemo(() => {
    const set = new Set(reports.map(r => r.industry));
    return Array.from(set).sort();
  }, [reports]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold text-sm">管理データを読み込み中...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 leading-relaxed font-sans">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-100">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight">管理ダッシュボード</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnosis Results Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <p className="text-[11px] font-bold text-amber-700">
                本番運用時はログイン認証が必要です
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 pt-8 space-y-8">
        
        {error ? (
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Database className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-4">接続エラー</h2>
            <p className="text-slate-500 font-bold max-w-md mx-auto leading-relaxed">
              {error}
            </p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatCard label="総診断件数" value={`${stats.total} 件`} icon={<Users className="w-5 h-5" />} color="cyan" />
              <StatCard label="会社数" value={`${stats.uniqueCompanies} 社`} icon={<Building2 className="w-5 h-5" />} color="blue" />
              <StatCard label="月間削減時間（合計）" value={`${stats.totalMonthlySavings.toFixed(1)} h`} icon={<Clock className="w-5 h-5" />} color="indigo" />
              <StatCard label="年間削減時間（合計）" value={`${Math.round(stats.totalYearlySavings)} h`} icon={<Calendar className="w-5 h-5" />} color="violet" />
              <StatCard label="平均AI活用スコア" value={`${stats.avgScore.toFixed(1)} / 5`} icon={<Target className="w-5 h-5" />} color="rose" />
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex-1 min-w-[300px] relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="会社名で検索..."
                    value={searchCompany}
                    onChange={(e) => setSearchCompany(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
                <div className="flex items-center flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select 
                      value={filterIndustry}
                      onChange={(e) => setFilterIndustry(e.target.value)}
                      className="bg-slate-50 border-none rounded-xl text-sm font-bold py-3 pl-4 pr-10 focus:ring-2 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="all">すべての業種</option>
                      {industries.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  <select 
                    value={filterTool}
                    onChange={(e) => setFilterTool(e.target.value)}
                    className="bg-slate-50 border-none rounded-xl text-sm font-bold py-3 pl-4 pr-10 focus:ring-2 focus:ring-cyan-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">すべてのAIツール</option>
                    {AI_TOOLS.map(tool => (
                      <option key={tool.id} value={tool.id}>{tool.label}</option>
                    ))}
                  </select>

                  <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden sm:block" />

                  <button
                    onClick={handleExportCSV}
                    disabled={filteredReports.length === 0}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all active:scale-95",
                      filteredReports.length > 0 
                        ? "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200" 
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    <Download className="w-4 h-4" />
                    CSVをダウンロード
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">診断日時</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">基本情報</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">AIツール</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">業務数</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">月間削減</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">スコア</th>
                      <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.length > 0 ? (
                      filteredReports.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-6">
                            <p className="text-xs font-bold text-slate-800">{new Date(report.created_at).toLocaleDateString('ja-JP')}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{new Date(report.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-cyan-600 transition-all">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800">{report.company_name}</p>
                                <p className="text-[11px] font-bold text-slate-500">{report.name} · {report.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex justify-center gap-1">
                              {report.selected_tools.map(toolId => (
                                <div key={toolId} className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                  {toolId === 'chatgpt' && <p className="text-[9px] font-black">GPT</p>}
                                  {toolId === 'copilot' && <p className="text-[9px] font-black">MS</p>}
                                  {toolId === 'gemini' && <p className="text-[9px] font-black">G</p>}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[11px] font-black text-slate-600">
                              {report.input_data.tasks.length}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <p className="text-sm font-black text-cyan-600">{report.report_data.kpis.totalSavingsMonthly.toFixed(1)} h</p>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black tracking-widest">
                              {report.report_data.overallScore}
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <button 
                              onClick={() => router.push(`/report/${report.share_id}`)}
                              className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-cyan-500 hover:text-cyan-600 transition-all active:scale-95"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-20 text-center">
                          <p className="text-slate-400 font-bold">
                            まだ診断結果が保存されていません。<br />
                            /diagnose から診断を実行すると、ここに結果が表示されます。
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Footer info */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-6 text-slate-300">
            <Laptop className="w-5 h-5" />
            <Briefcase className="w-5 h-5" />
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">AI Diagnosis Admin Dashboard v1.0</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  const colorMap: Record<string, string> = {
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-start gap-4 transition-all hover:shadow-md hover:border-cyan-100 group">
      <div className={cn("p-3 rounded-2xl border transition-all group-hover:scale-110", colorMap[color])}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
