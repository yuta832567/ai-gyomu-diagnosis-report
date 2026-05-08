'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Info,
  Laptop,
  Check,
  Sparkles,
  BarChart3,
  Users,
  Building2,
  Briefcase,
  History,
  Tool,
  ClipboardList,
  ShieldAlert,
  Search,
  MessageSquare,
  Zap,
  Target,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ROLES, 
  COMPANY_SIZES, 
  AI_EXPERIENCES, 
  AI_TOOLS, 
  AI_PLANS,
  CATEGORIES, 
  FREQUENCIES,
  TOOLS_USED,
  EXPECTATIONS,
  TASK_SUGGESTIONS,
  PAIN_POINTS,
  CONFIDENTIALITY_LEVELS
} from '@/lib/constants';
import { AIToolId, FrequencyId, CategoryId, ConfidentialityLevel } from '@/lib/types';

// バリデーションスキーマの更新
const schema = z.object({
  basicInfo: z.object({
    name: z.string().min(1, '氏名を入力してください'),
    companyName: z.string().optional(),
    departmentName: z.string().optional(),
    role: z.enum(ROLES as [string, ...string[]]),
    industry: z.string().min(1, '業種を入力してください'),
    companySize: z.enum(COMPANY_SIZES as [string, ...string[]]),
    aiExperience: z.enum(AI_EXPERIENCES as [string, ...string[]]),
    toolsUsed: z.array(z.string()).default([]),
    expectations: z.array(z.string()).default([]),
  }),
  selectedTools: z.array(z.string()).min(1, '少なくとも1つのツールを選択してください'),
  toolPlans: z.record(z.string(), z.string()).default({}),
  tasks: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, '業務名を入力してください'),
    categoryId: z.string().min(1, 'カテゴリを選択してください'),
    hoursPerTime: z.number().min(0.1, '時間を入力してください'),
    frequencyId: z.string().min(1, '頻度を選択してください'),
    output: z.string().optional(),
    tools: z.string().optional(),
    painPoint: z.string().optional(),
    confidentiality: z.enum(CONFIDENTIALITY_LEVELS as [string, ...string[]]),
    notes: z.string().optional(),
  })).min(1, '少なくとも1つの業務を入力してください').max(10, '最大10件までです'),
});

type FormValues = z.infer<typeof schema>;

const STEPS = [
  { name: '基本情報', icon: <Users className="w-4 h-4" /> },
  { name: 'AIツール', icon: <Sparkles className="w-4 h-4" /> },
  { name: 'プラン', icon: <Target className="w-4 h-4" /> },
  { name: '業務入力', icon: <ClipboardList className="w-4 h-4" /> },
  { name: '確認', icon: <CheckCircle2 className="w-4 h-4" /> }
];

export default function DiagnosePage() {
  const [step, setStep] = useState(1);
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      basicInfo: {
        role: '一般従業員',
        companySize: '11〜50名',
        aiExperience: '少し使ったことがある',
        toolsUsed: [],
        expectations: [],
      },
      selectedTools: [],
      toolPlans: {},
      tasks: [
        { 
          id: Math.random().toString(36).substr(2, 9),
          title: '', 
          categoryId: 'document', 
          hoursPerTime: 1, 
          frequencyId: 'weekly_1', 
          confidentiality: 'なし' 
        }
      ],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks"
  });

  const selectedTools = watch('selectedTools') as AIToolId[];
  const watchedTasks = watch('tasks');
  const basicInfo = watch('basicInfo');

  const nextStep = () => {
    // バリデーション等のチェックをここで行うことも可能
    setStep(s => Math.min(s + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = (data: FormValues) => {
    console.log('Final Diagnosis Data:', data);
    alert('診断データを生成しました。レポート画面の構築に進みます。');
  };

  const progress = (step / 5) * 100;

  // 業務追加（チップからの呼び出し）
  const addSuggestedTask = (title: string) => {
    if (fields.length >= 10) return;
    append({ 
      id: Math.random().toString(36).substr(2, 9),
      title, 
      categoryId: 'document', 
      hoursPerTime: 1, 
      frequencyId: 'weekly_1', 
      confidentiality: 'なし' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 pb-32 pt-6 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* ステップナビゲーション */}
        <div className="mb-10 bg-white/60 backdrop-blur-md p-4 rounded-[2rem] border border-white shadow-sm">
          <div className="flex justify-between items-center mb-3 px-2">
            <div>
              <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-0.5">Step {step} of 5</p>
              <h3 className="text-lg font-black text-slate-800">{STEPS[step - 1].name}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remaining</p>
              <p className="text-sm font-black text-slate-600">{5 - step} Steps</p>
            </div>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]"
            />
          </div>
          <div className="flex justify-between mt-3 px-1">
            {STEPS.map((s, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex flex-col items-center gap-1",
                  i + 1 <= step ? "text-cyan-600" : "text-slate-300"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                  i + 1 === step ? "bg-cyan-500 text-white scale-110 shadow-lg shadow-cyan-200" : 
                  i + 1 < step ? "bg-cyan-100 text-cyan-600" : "bg-slate-50 text-slate-300"
                )}>
                  {i + 1 < step ? <Check className="w-4 h-4" strokeWidth={3} /> : s.icon}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* Step 1: 基本情報 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-cyan-100/50 border border-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Users className="w-24 h-24 text-cyan-500" />
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                    <span className="p-2 bg-cyan-100 rounded-2xl">
                      <Users className="text-cyan-600 w-6 h-6" />
                    </span>
                    あなたについて教えてください
                  </h2>
                  <p className="text-slate-500 text-sm mb-8 font-medium">最適な診断レポートを作成するための基本項目です。</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">氏名 <span className="text-red-400">*</span></label>
                      <input 
                        {...register('basicInfo.name')}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-cyan-400 focus:bg-white transition-all outline-none text-slate-800 font-medium"
                        placeholder="山田 太郎"
                      />
                      {errors.basicInfo?.name && <p className="text-red-500 text-xs mt-2 ml-1">{errors.basicInfo.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">会社名</label>
                        <input 
                          {...register('basicInfo.companyName')}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-cyan-400 focus:bg-white transition-all outline-none"
                          placeholder="株式会社サンプル"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">部署名</label>
                        <input 
                          {...register('basicInfo.departmentName')}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-cyan-400 focus:bg-white transition-all outline-none"
                          placeholder="営業推進部"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">役職 <span className="text-red-400">*</span></label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ROLES.map(role => (
                          <div 
                            key={role}
                            onClick={() => setValue('basicInfo.role', role)}
                            className={cn(
                              "cursor-pointer p-3 rounded-xl border-2 text-center text-xs font-bold transition-all",
                              basicInfo.role === role 
                                ? "bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-100" 
                                : "bg-white border-slate-100 text-slate-500 hover:border-cyan-200"
                            )}
                          >
                            {role}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">業種 <span className="text-red-400">*</span></label>
                        <input 
                          {...register('basicInfo.industry')}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-cyan-400 focus:bg-white transition-all outline-none"
                          placeholder="IT、商社、サービス業など"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">会社規模 <span className="text-red-400">*</span></label>
                        <select 
                          {...register('basicInfo.companySize')}
                          className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-cyan-400 focus:bg-white transition-all outline-none appearance-none"
                        >
                          {COMPANY_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* 普段使っている業務ツール */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                        普段使っている業務ツール
                        <span className="text-[10px] text-slate-400 font-normal ml-2">複数選択可</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {TOOLS_USED.map(tool => {
                          const isSelected = basicInfo.toolsUsed?.includes(tool);
                          return (
                            <div 
                              key={tool}
                              onClick={() => {
                                const current = basicInfo.toolsUsed || [];
                                setValue('basicInfo.toolsUsed', isSelected ? current.filter(t => t !== tool) : [...current, tool]);
                              }}
                              className={cn(
                                "cursor-pointer px-4 py-2 rounded-full border text-xs font-bold transition-all",
                                isSelected 
                                  ? "bg-cyan-100 border-cyan-400 text-cyan-700 shadow-sm" 
                                  : "bg-white border-slate-200 text-slate-500 hover:border-cyan-300"
                              )}
                            >
                              {tool}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 ml-1 italic">※迷った場合は、普段よく使うものだけ選べば大丈夫です。</p>
                    </div>

                    {/* 期待すること */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">AI活用で期待すること</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {EXPECTATIONS.map(exp => {
                          const isSelected = basicInfo.expectations?.includes(exp);
                          return (
                            <div 
                              key={exp}
                              onClick={() => {
                                const current = basicInfo.expectations || [];
                                setValue('basicInfo.expectations', isSelected ? current.filter(e => e !== exp) : [...current, exp]);
                              }}
                              className={cn(
                                "cursor-pointer p-3 rounded-xl border-2 text-sm font-bold transition-all flex items-center gap-2",
                                isSelected 
                                  ? "bg-blue-50 border-blue-400 text-blue-700" 
                                  : "bg-white border-slate-50 text-slate-500 hover:border-blue-200"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded-md border flex items-center justify-center transition-colors",
                                isSelected ? "bg-blue-500 border-blue-500" : "bg-white border-slate-200"
                              )}>
                                {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                              </div>
                              {exp}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: AIツール選択 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-cyan-100/50 border border-white">
                  <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                    <span className="p-2 bg-cyan-100 rounded-2xl">
                      <Sparkles className="text-cyan-600 w-6 h-6" />
                    </span>
                    活用したいAIツールを選択
                  </h2>
                  <p className="text-slate-500 text-sm mb-8 font-medium">現在使っている、または導入予定のツールを選んでください。</p>

                  <div className="grid grid-cols-1 gap-4">
                    {AI_TOOLS.map((tool) => {
                      const isSelected = selectedTools.includes(tool.id);
                      return (
                        <div 
                          key={tool.id}
                          onClick={() => {
                            const current = [...selectedTools];
                            if (isSelected) {
                              setValue('selectedTools', current.filter(id => id !== tool.id));
                            } else {
                              setValue('selectedTools', [...current, tool.id]);
                            }
                          }}
                          className={cn(
                            "cursor-pointer p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden group",
                            isSelected 
                              ? "border-cyan-500 bg-cyan-50/50 shadow-inner" 
                              : "border-slate-100 bg-slate-50/30 hover:border-cyan-200 hover:bg-white"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                              isSelected ? "bg-cyan-500 text-white shadow-lg shadow-cyan-200" : "bg-white text-slate-400 border border-slate-100"
                            )}>
                              {tool.id === 'chatgpt' && <MessageSquare className="w-8 h-8" />}
                              {tool.id === 'copilot' && <Briefcase className="w-8 h-8" />}
                              {tool.id === 'gemini' && <Zap className="w-8 h-8" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <h3 className="font-black text-lg text-slate-800">{tool.label}</h3>
                                {isSelected && (
                                  <div className="bg-cyan-500 text-white p-1 rounded-full">
                                    <Check className="w-4 h-4" strokeWidth={3} />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 mb-3 font-medium leading-relaxed">{tool.description}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {tool.tags.map(tag => (
                                  <span key={tag} className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-md font-bold",
                                    isSelected ? "bg-cyan-200 text-cyan-800" : "bg-slate-100 text-slate-400"
                                  )}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {errors.selectedTools && (
                    <div className="mt-4 p-3 bg-red-50 rounded-xl flex items-center gap-2 text-red-500 text-xs font-bold border border-red-100">
                      <ShieldAlert className="w-4 h-4" />
                      {errors.selectedTools.message}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: プラン選択 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-cyan-100/50 border border-white">
                  <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                    <span className="p-2 bg-blue-100 rounded-2xl">
                      <Target className="text-blue-600 w-6 h-6" />
                    </span>
                    ツールのプランを選択
                  </h2>
                  <p className="text-slate-500 text-sm mb-8 font-medium">プランによって利用できる機能が異なります。</p>
                  
                  <div className="space-y-8">
                    {selectedTools.map(toolId => (
                      <div key={toolId} className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <span className="w-2 h-6 bg-cyan-500 rounded-full" />
                          <h3 className="font-black text-slate-700">{AI_TOOLS.find(t => t.id === toolId)?.label} のプラン</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {AI_PLANS[toolId].map(plan => {
                            const isSelected = watch(`toolPlans.${toolId}`) === plan;
                            return (
                              <div 
                                key={plan}
                                onClick={() => setValue(`toolPlans.${toolId}`, plan)}
                                className={cn(
                                  "cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                                  isSelected 
                                    ? "bg-white border-cyan-500 shadow-md ring-4 ring-cyan-50" 
                                    : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                                )}
                              >
                                <span className={cn("font-bold text-sm", isSelected ? "text-cyan-700" : "text-slate-600")}>{plan}</span>
                                {isSelected && <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" strokeWidth={4} /></div>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-cyan-50 border border-cyan-100 rounded-2xl flex gap-3">
                    <Info className="w-5 h-5 text-cyan-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-cyan-700 leading-relaxed font-medium">
                      プランがわからない場合は「わからない」を選んでも診断できます。結果では注意付きで一般的な提案を表示します。
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: 業務入力 */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* 業務候補チップ */}
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white">
                  <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-cyan-500" />
                    よくある業務から追加
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {TASK_SUGGESTIONS.map(suggest => (
                      <button
                        key={suggest}
                        type="button"
                        onClick={() => addSuggestedTask(suggest)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-600 hover:shadow-sm transition-all active:scale-95"
                      >
                        + {suggest}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center px-2">
                  <h2 className="text-xl font-black text-slate-800">診断する業務 ({fields.length} / 10件)</h2>
                  <p className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-tighter">Max 10 Tasks</p>
                </div>
                
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <motion.div 
                      key={field.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-7 rounded-[2.5rem] shadow-lg shadow-blue-100/30 border border-white relative group"
                    >
                      <div className="absolute top-0 left-8 w-8 h-1.5 bg-cyan-400 rounded-b-full" />
                      
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 bg-slate-900 text-white text-xs font-black flex items-center justify-center rounded-xl">{index + 1}</span>
                          <span className="font-black text-slate-800 tracking-tight">業務内容を入力</span>
                        </div>
                        {fields.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => remove(index)} 
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">具体的な業務名</label>
                          <input 
                            {...register(`tasks.${index}.title`)}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-cyan-400 focus:bg-white transition-all outline-none font-bold text-slate-700"
                            placeholder="例：週次の売上報告書作成"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">カテゴリ</label>
                            <select 
                              {...register(`tasks.${index}.categoryId`)}
                              className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-600 appearance-none"
                            >
                              {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">頻度</label>
                            <select 
                              {...register(`tasks.${index}.frequencyId`)}
                              className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-600 appearance-none"
                            >
                              {Object.entries(FREQUENCIES).map(([id, val]) => (
                                <option key={id} value={id}>{val.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">1回あたりの時間</label>
                            <div className="relative">
                              <select 
                                {...register(`tasks.${index}.hoursPerTime`, { valueAsNumber: true })}
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-600 appearance-none"
                              >
                                <option value={0.25}>15分</option>
                                <option value={0.5}>30分</option>
                                <option value={1}>1時間</option>
                                <option value={2}>2時間</option>
                                <option value={4}>半日 (4h)</option>
                                <option value={8}>1日以上 (8h~)</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">機密情報</label>
                            <select 
                              {...register(`tasks.${index}.confidentiality`)}
                              className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold text-slate-600 appearance-none"
                            >
                              {CONFIDENTIALITY_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">主な成果物 / 困りごと (任意)</label>
                          <textarea 
                            {...register(`tasks.${index}.notes`)}
                            rows={2}
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-medium text-sm text-slate-600 resize-none"
                            placeholder="例：構成を考えるのに時間がかかる、Excelの関数が複雑でミスが不安..."
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {fields.length < 10 && (
                  <button
                    type="button"
                    onClick={() => addSuggestedTask('')}
                    className="w-full py-6 bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black flex items-center justify-center gap-3 hover:border-cyan-300 hover:text-cyan-500 hover:bg-cyan-50/30 transition-all active:scale-95 group"
                  >
                    <div className="p-1.5 bg-slate-50 group-hover:bg-cyan-100 rounded-xl transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                    業務を追加する
                  </button>
                )}

                <div className="p-6 bg-white/40 rounded-3xl border border-white flex gap-3">
                  <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                    ※すべて正確に入力しなくても大丈夫です。まずは思いつく範囲で入力してください。
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 5: 確認画面 */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-cyan-200/40 border border-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <CheckCircle2 className="w-40 h-40 text-cyan-600" />
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-800 mb-2">診断準備が整いました！</h2>
                  <p className="text-slate-500 text-sm mb-8 font-medium">ご入力いただいた内容のサマリーです。</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Diagnosis User</p>
                      <p className="text-lg font-black text-slate-800">{watch('basicInfo.name')} <span className="text-sm font-bold text-slate-500">様</span></p>
                      <p className="text-xs font-bold text-cyan-600 mt-1">{watch('basicInfo.role')}</p>
                    </div>
                    <div className="p-5 bg-cyan-50 rounded-3xl border border-cyan-100">
                      <p className="text-[10px] font-black text-cyan-500 uppercase mb-1">Registered Tasks</p>
                      <p className="text-lg font-black text-cyan-700">{watchedTasks.length} <span className="text-sm font-bold opacity-70">件の業務</span></p>
                      <p className="text-xs font-bold text-cyan-600 mt-1">機密情報あり: {watchedTasks.filter(t => t.confidentiality !== 'なし').length}件</p>
                    </div>
                  </div>

                  <div className="space-y-6 mb-10">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 mb-1">診断後にわかること</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-500 font-bold">
                          <li className="flex items-center gap-2">✓ 業務別のAI活用可能性</li>
                          <li className="flex items-center gap-2">✓ 削減時間の詳細シミュレーション</li>
                          <li className="flex items-center gap-2">✓ 品質向上ポイント</li>
                          <li className="flex items-center gap-2">✓ あなたに最適なAIツール</li>
                          <li className="flex items-center gap-2">✓ 明日からのアクション</li>
                          <li className="flex items-center gap-2">✓ 即戦力のプロンプト例</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-cyan-100 rounded-2xl text-cyan-600">
                        <Laptop className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 mb-1">選択中のツール</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedTools.map(id => (
                            <span key={id} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black border border-slate-200">
                              {AI_TOOLS.find(t => t.id === id)?.label} ({watch(`toolPlans.${id}`) || '未設定'})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[11px] text-slate-400 mb-4 font-bold">「診断を開始する」ボタンを押して、シミュレーション結果を確認しましょう。</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* フッターナビゲーション */}
          <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-white via-white to-white/0 backdrop-blur-[2px] flex flex-col gap-4">
            <div className="max-w-2xl mx-auto w-full flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-5 px-6 bg-white border-2 border-slate-100 text-slate-400 rounded-3xl font-black flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">戻る</span>
                </button>
              )}
              
              {step < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-[3] py-5 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl shadow-cyan-200 hover:shadow-cyan-300 hover:translate-y-[-2px] transition-all active:scale-95"
                >
                  {STEPS[step]?.name}へ進む
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex-[3] py-5 px-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-3xl font-black flex items-center justify-center gap-2 shadow-xl shadow-orange-200 hover:shadow-orange-300 hover:translate-y-[-2px] transition-all animate-pulse active:scale-95"
                >
                  診断レポートを生成する
                  <Sparkles className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* エラーや補足メッセージ */}
            {Object.keys(errors).length > 0 && (
              <div className="max-w-2xl mx-auto w-full">
                <p className="text-center text-red-400 text-[10px] font-bold bg-red-50 py-1 rounded-full border border-red-100">
                  入力が不足している項目があります。確認してください。
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
