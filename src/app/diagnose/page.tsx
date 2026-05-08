'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
  Briefcase,
  History,
  ClipboardList,
  ShieldAlert,
  MessageSquare,
  Zap,
  Target,
  Wand2,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ROLES, 
  COMPANY_SIZES, 
  AI_EXPERIENCES, 
  AI_USAGE_FREQUENCIES,
  COMPANY_AI_RULES,
  TOOLS_USED_GROUPS,
  AI_TOOLS, 
  AI_PLANS_METADATA,
  CATEGORIES, 
  FREQUENCIES,
  EXPECTATIONS,
  TASK_SUGGESTIONS,
  CONFIDENTIALITY_LEVELS,
  OUTPUTS,
  PAIN_POINTS
} from '@/lib/constants';
import { AIToolId, FrequencyId, CategoryId, ConfidentialityLevel, DiagnosisData } from '@/lib/types';
import { generateDiagnosisReport } from '@/lib/reportGenerator';

// バリデーションスキーマの定義 (Step別のチェックを含む)
// ... (schema definition remains the same)
const schema = z.object({
  basicInfo: z.object({
    name: z.string().min(1, '氏名を入力してください'),
    companyName: z.string().min(1, '会社名を入力してください。個人の方は「個人」と入力してください。'),
    departmentName: z.string().optional(),
    role: z.enum(ROLES as [string, ...string[]]),
    otherRoleText: z.string().optional(),
    industry: z.string().min(1, '業種を入力してください'),
    companySize: z.enum(COMPANY_SIZES as [string, ...string[]]),
    aiExperience: z.enum(AI_EXPERIENCES as [string, ...string[]]),
    aiUsageFrequency: z.enum(AI_USAGE_FREQUENCIES as [string, ...string[]]),
    companyAIRules: z.enum(COMPANY_AI_RULES as [string, ...string[]]),
    toolsUsed: z.array(z.string()).default([]),
    otherToolsText: z.string().optional(),
    expectations: z.array(z.string()).default([]),
    otherExpectationsText: z.string().optional(),
  }).superRefine((val, ctx) => {
    if (val.role === 'その他' && (!val.otherRoleText || val.otherRoleText.trim() === '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: '具体的な役職を入力してください', path: ['otherRoleText'] });
    }
    if (val.toolsUsed.includes('その他') && (!val.otherToolsText || val.otherToolsText.trim() === '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'その他のツール名を入力してください', path: ['otherToolsText'] });
    }
    if (val.expectations.includes('その他') && (!val.otherExpectationsText || val.otherExpectationsText.trim() === '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'その他の期待内容を入力してください', path: ['otherExpectationsText'] });
    }
  }),
  selectedTools: z.array(z.string()).min(1, '診断に使うAIツールを1つ以上選んでください。'),
  toolPlans: z.record(z.string(), z.string()).default({}),
  tasks: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, '業務名を入力してください'),
    categoryId: z.string().min(1, 'カテゴリを選択してください'),
    hoursPerTime: z.number().min(0.1, '作業時間を入力してください'),
    frequencyId: z.string().min(1, '頻度を選択してください'),
    outputs: z.array(z.string()).default([]),
    otherOutputText: z.string().optional(),
    tools: z.array(z.string()).default([]),
    otherToolsText: z.string().optional(),
    painPoints: z.array(z.string()).default([]),
    otherPainPointsText: z.string().optional(),
    confidentiality: z.enum(CONFIDENTIALITY_LEVELS as [string, ...string[]]),
    notes: z.string().optional(),
  })).min(1, '診断する業務を1件以上入力してください。').superRefine((val, ctx) => {
    val.forEach((task, index) => {
      if (task.outputs.includes('その他') && (!task.otherOutputText || task.otherOutputText.trim() === '')) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: '具体的な成果物を入力してください', path: [index, 'otherOutputText'] });
      }
      if (task.painPoints.includes('その他') && (!task.otherPainPointsText || task.otherPainPointsText.trim() === '')) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: '具体的な困りごとを入力してください', path: [index, 'otherPainPointsText'] });
      }
    });
  }),
}).superRefine((val, ctx) => {
  // Step 3 のプラン漏れチェック
  val.selectedTools.forEach(toolId => {
    if (!val.toolPlans[toolId]) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'プランを選択してください', path: ['toolPlans', toolId] });
    }
  });
});

type FormValues = z.infer<typeof schema>;

const STEPS = [
  { id: 1, name: '基本情報', icon: <Users className="w-4 h-4" /> },
  { id: 2, name: 'AIツール', icon: <Sparkles className="w-4 h-4" /> },
  { id: 3, name: 'プラン', icon: <Target className="w-4 h-4" /> },
  { id: 4, name: '業務入力', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 5, name: '確認', icon: <CheckCircle2 className="w-4 h-4" /> }
];

export default function DiagnosePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showStepError, setShowStepError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { register, control, handleSubmit, watch, setValue, trigger, formState: { errors, isValid } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      basicInfo: {
        role: '一般従業員',
        companySize: '11〜50名',
        aiExperience: '少し使ったことがある',
        aiUsageFrequency: '月に数回使っている',
        companyAIRules: 'わからない',
        toolsUsed: [],
        expectations: [],
      },
      selectedTools: [],
      toolPlans: {},
      tasks: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks"
  });

  const selectedTools = watch('selectedTools') as AIToolId[];
  const watchedTasks = watch('tasks');
  const basicInfo = watch('basicInfo');

  // ステップ遷移バリデーション
  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['basicInfo'];
    if (step === 2) fieldsToValidate = ['selectedTools'];
    if (step === 3) fieldsToValidate = ['toolPlans'];
    if (step === 4) fieldsToValidate = ['tasks'];

    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setShowStepError(false);
      setStep(s => Math.min(s + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowStepError(true);
      // 最初のエラー箇所へスクロール
      setTimeout(() => {
        const firstError = document.querySelector('[aria-invalid="true"]');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const prevStep = () => {
    setShowStepError(false);
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = (data: FormValues) => {
    // 1. 診断結果を生成
    const result = generateDiagnosisReport(data as DiagnosisData);
    
    // 2. localStorageに保存
    localStorage.setItem('diagnosis_result', JSON.stringify(result));
    
    // 3. /report に遷移
    router.push('/report');
  };

  // 業務追加（自動分類付き）
  const addSuggestedTask = (suggestion?: typeof TASK_SUGGESTIONS[0]) => {
    if (fields.length >= 10) return;
    append({ 
      id: Math.random().toString(36).substr(2, 9),
      title: suggestion?.title || '', 
      categoryId: suggestion?.categoryId || 'document', 
      hoursPerTime: 1, 
      frequencyId: 'weekly_1', 
      outputs: [],
      tools: [],
      painPoints: [],
      confidentiality: 'なし' 
    });
    setShowStepError(false);
  };

  const progress = (step / 5) * 100;

  // 補助コンポーネント: エラーメッセージ
  const ErrorMsg = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <motion.p 
        initial={{ opacity: 0, y: -5 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-[10px] font-bold text-orange-600 mt-1.5 flex items-center gap-1 ml-1"
      >
        <AlertCircle className="w-3 h-3" />
        {message}
      </motion.p>
    );
  };

  // 補助コンポーネント: チップ
  const Chip = ({ label, isSelected, onClick, color = "cyan" }: { label: string, isSelected: boolean, onClick: () => void, color?: "cyan" | "blue" | "orange" }) => (
    <div 
      onClick={onClick}
      className={cn(
        "cursor-pointer px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-2",
        isSelected 
          ? color === "cyan" ? "bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-100" 
            : color === "blue" ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-100"
            : "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100"
          : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
      )}
    >
      {isSelected && <Check className="w-3 h-3" strokeWidth={4} />}
      {label}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 pb-40 pt-6 px-4 font-sans" ref={scrollRef}>
      <div className="max-w-2xl mx-auto">
        
        {/* ステップナビ */}
        <div className="mb-8 bg-white/80 backdrop-blur-md p-5 rounded-[2.5rem] border border-white shadow-sm">
          <div className="flex justify-between items-center mb-4 px-2">
            <div>
              <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">Step {step} / 5</p>
              <h3 className="text-xl font-black text-slate-800">{STEPS[step - 1].name}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
              <p className="text-sm font-black text-slate-600">{Math.round(progress)}%</p>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
            />
          </div>
        </div>

        {/* やさしいエラー通知 */}
        <AnimatePresence>
          {showStepError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-3xl flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-orange-700">
                  入力がまだ完了していない項目があります。上から順に確認してください。
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* Step 1: 基本情報 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl shadow-cyan-100/30 border border-white relative">
                  <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                    <span className="p-2.5 bg-cyan-100 rounded-2xl"><Users className="text-cyan-600 w-6 h-6" /></span>
                    基本情報を教えてください
                  </h2>
                  <p className="text-slate-500 text-sm mb-10 font-medium leading-relaxed">
                    あなたの役職・業務環境に合わせて、AIを活用しやすい業務や注意点を診断します。わかる範囲で入力してください。
                  </p>
                  
                  <div className="space-y-12">
                    {/* Section: あなたの情報 */}
                    <div className="space-y-6">
                      <h3 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> あなたの情報</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">氏名 <span className="text-orange-500">*</span></label>
                          <input 
                            {...register('basicInfo.name')}
                            aria-invalid={!!errors.basicInfo?.name}
                            className={cn(
                              "w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold transition-all",
                              errors.basicInfo?.name ? "border-orange-200 bg-orange-50/30" : "border-transparent focus:border-cyan-400 focus:bg-white"
                            )}
                            placeholder="山田 太郎"
                          />
                          <ErrorMsg message={errors.basicInfo?.name?.message} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">会社名 <span className="text-orange-500">*</span></label>
                          <input 
                            {...register('basicInfo.companyName')}
                            aria-invalid={!!errors.basicInfo?.companyName}
                            className={cn(
                              "w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold transition-all",
                              errors.basicInfo?.companyName ? "border-orange-200 bg-orange-50/30" : "border-transparent focus:border-cyan-400 focus:bg-white"
                            )}
                            placeholder="例：株式会社サンプル (個人の方は「個人」)"
                          />
                          <ErrorMsg message={errors.basicInfo?.companyName?.message} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">業種 <span className="text-orange-500">*</span></label>
                          <input 
                            {...register('basicInfo.industry')}
                            aria-invalid={!!errors.basicInfo?.industry}
                            className={cn(
                              "w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold transition-all",
                              errors.basicInfo?.industry ? "border-orange-200 bg-orange-50/30" : "border-transparent focus:border-cyan-400 focus:bg-white"
                            )}
                            placeholder="IT、製造、サービス業など"
                          />
                          <ErrorMsg message={errors.basicInfo?.industry?.message} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">会社規模 <span className="text-orange-500">*</span></label>
                          <select 
                            {...register('basicInfo.companySize')}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-cyan-400 focus:bg-white transition-all outline-none font-bold appearance-none"
                          >
                            {COMPANY_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">役職 <span className="text-orange-500">*</span></label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ROLES.map(role => (
                            <Chip 
                              key={role} 
                              label={role} 
                              isSelected={basicInfo.role === role} 
                              onClick={() => { setValue('basicInfo.role', role); trigger('basicInfo.role'); }} 
                            />
                          ))}
                        </div>
                        <AnimatePresence>
                          {basicInfo.role === 'その他' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 overflow-hidden">
                              <input 
                                {...register('basicInfo.otherRoleText')}
                                aria-invalid={!!errors.basicInfo?.otherRoleText}
                                className={cn(
                                  "w-full p-4 bg-cyan-50/30 border-2 rounded-2xl outline-none font-bold",
                                  errors.basicInfo?.otherRoleText ? "border-orange-200" : "border-cyan-100 focus:border-cyan-400"
                                )}
                                placeholder="例：個人事業主、派遣社員など"
                              />
                              <ErrorMsg message={errors.basicInfo?.otherRoleText?.message} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Section: AI利用状況 */}
                    <div className="space-y-6">
                      <h3 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> AI利用状況</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">利用頻度 <span className="text-orange-500">*</span></label>
                          <select 
                            {...register('basicInfo.aiUsageFrequency')}
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 outline-none appearance-none"
                          >
                            {AI_USAGE_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">現在のスキル感 <span className="text-orange-500">*</span></label>
                          <select 
                            {...register('basicInfo.aiExperience')}
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 outline-none appearance-none"
                          >
                            {AI_EXPERIENCES.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section: 業務環境 */}
                    <div className="space-y-6">
                      <h3 className="flex items-center gap-2 text-sm font-black text-slate-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> 業務環境</h3>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">会社でのAI利用ルール <span className="text-orange-500">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {COMPANY_AI_RULES.map(rule => (
                            <Chip 
                              key={rule} 
                              label={rule} 
                              isSelected={basicInfo.companyAIRules === rule} 
                              onClick={() => setValue('basicInfo.companyAIRules', rule)} 
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">普段使っている業務ツール</label>
                        <p className="text-[10px] text-slate-400 mb-4 ml-1">AIツールとの相性を診断するために使います。</p>
                        <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                          {TOOLS_USED_GROUPS.map(group => (
                            <div key={group.label}>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">{group.label}</p>
                              <div className="flex flex-wrap gap-2">
                                {group.tools.map(tool => {
                                  const isSelected = basicInfo.toolsUsed.includes(tool);
                                  return (
                                    <Chip 
                                      key={tool} 
                                      label={tool} 
                                      isSelected={isSelected} 
                                      onClick={() => {
                                        const current = basicInfo.toolsUsed;
                                        setValue('basicInfo.toolsUsed', isSelected ? current.filter(t => t !== tool) : [...current, tool]);
                                        trigger('basicInfo.toolsUsed');
                                      }} 
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        <AnimatePresence>
                          {basicInfo.toolsUsed.includes('その他') && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 overflow-hidden">
                              <input 
                                {...register('basicInfo.otherToolsText')}
                                aria-invalid={!!errors.basicInfo?.otherToolsText}
                                className={cn(
                                  "w-full p-4 bg-cyan-50/30 border-2 rounded-2xl outline-none font-bold",
                                  errors.basicInfo?.otherToolsText ? "border-orange-200" : "border-cyan-100 focus:border-cyan-400"
                                )}
                                placeholder="例：Notion、Slack、会計ソフトなど"
                              />
                              <ErrorMsg message={errors.basicInfo?.otherToolsText?.message} />
                            </motion.div>
                          )}
                        </AnimatePresence>
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white">
                  <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                    <span className="p-2.5 bg-cyan-100 rounded-2xl"><Sparkles className="text-cyan-600 w-6 h-6" /></span>
                    活用したいAIツールを選択
                  </h2>
                  <p className="text-slate-500 text-sm mb-8 font-medium">診断に使うAIツールを1つ以上選んでください。</p>

                  <div className="grid grid-cols-1 gap-4">
                    {AI_TOOLS.map((tool) => {
                      const isSelected = selectedTools.includes(tool.id);
                      return (
                        <div 
                          key={tool.id}
                          onClick={() => {
                            const current = selectedTools;
                            const newVal = isSelected ? current.filter(id => id !== tool.id) : [...current, tool.id];
                            setValue('selectedTools', newVal);
                            trigger('selectedTools');
                          }}
                          className={cn(
                            "cursor-pointer p-6 rounded-[2.5rem] border-2 transition-all group",
                            isSelected 
                              ? "border-cyan-500 bg-cyan-50/50" 
                              : "border-slate-100 bg-slate-50/30 hover:border-cyan-200"
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
                                {isSelected && <Check className="w-5 h-5 text-cyan-500" strokeWidth={4} />}
                              </div>
                              <p className="text-sm text-slate-600 font-medium leading-relaxed">{tool.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {errors.selectedTools && (
                    <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center gap-2 text-orange-700 text-xs font-bold">
                      <AlertCircle className="w-4 h-4" />
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white">
                  <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                    <span className="p-2.5 bg-blue-100 rounded-2xl"><Target className="text-blue-600 w-6 h-6" /></span>
                    ツールのプランを選択
                  </h2>
                  <p className="text-slate-500 text-sm mb-10 font-medium">選択した各AIツールのプランを教えてください。</p>
                  
                  <div className="space-y-12">
                    {selectedTools.map(toolId => {
                      const tool = AI_TOOLS.find(t => t.id === toolId);
                      return (
                        <div key={toolId} className="space-y-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-7 bg-cyan-500 rounded-full" />
                            <h3 className="font-black text-xl text-slate-800">{tool?.label}</h3>
                          </div>
                          
                          {/* 注意ラベル */}
                          {toolId === 'copilot' && (
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-[10px] font-bold text-blue-700 flex items-center gap-2">
                              <Info className="w-3.5 h-3.5" />
                              Copilot ChatとMicrosoft 365 Copilotでは、使える機能が異なります。
                            </div>
                          )}
                          {toolId === 'gemini' && (
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-[10px] font-bold text-blue-700 flex items-center gap-2">
                              <Info className="w-3.5 h-3.5" />
                              Gemini ChatとGoogle Workspace連携機能では、使える範囲が異なります。
                            </div>
                          )}

                          <div className="grid grid-cols-1 gap-3">
                            {AI_PLANS_METADATA[toolId].map(plan => {
                              const isSelected = watch(`toolPlans.${toolId}`) === plan.label;
                              return (
                                <div 
                                  key={plan.label}
                                  onClick={() => { setValue(`toolPlans.${toolId}`, plan.label); trigger(`toolPlans.${toolId}`); }}
                                  className={cn(
                                    "cursor-pointer p-5 rounded-[2rem] border-2 transition-all flex flex-col gap-1",
                                    isSelected 
                                      ? "bg-cyan-50 border-cyan-500 shadow-md" 
                                      : "bg-slate-50 border-transparent hover:bg-slate-100"
                                  )}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className={cn("font-black text-base", isSelected ? "text-cyan-700" : "text-slate-700")}>{plan.label}</span>
                                    {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-500" />}
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium">{plan.description}</p>
                                  <p className="text-[10px] text-cyan-600 font-bold mt-1 opacity-70 italic">
                                    {plan.diagnosisNote}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                          <ErrorMsg message={errors.toolPlans?.[toolId]?.message} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: 業務入力 */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* 候補チップ */}
                <div className="bg-white/70 backdrop-blur-md p-7 rounded-[2.5rem] border border-white shadow-sm">
                  <h3 className="text-sm font-black text-slate-800 mb-5 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-cyan-500" />
                    よくある業務から選ぶ
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {TASK_SUGGESTIONS.map(suggest => (
                      <button
                        key={suggest.title}
                        type="button"
                        onClick={() => addSuggestedTask(suggest)}
                        className="px-4 py-2 bg-white border-2 border-slate-50 rounded-2xl text-xs font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-600 transition-all active:scale-95 shadow-sm"
                      >
                        + {suggest.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center px-4">
                  <h2 className="text-2xl font-black text-slate-800">登録業務 ({fields.length} / 10件)</h2>
                </div>
                
                {fields.length === 0 ? (
                  <div className="bg-white/40 p-16 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6">
                      <ClipboardList className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-400 mb-2">まだ業務が登録されていません</h3>
                    <p className="text-sm text-slate-400 font-medium mb-8">よくある業務から選ぶか、自分で業務を追加してください。</p>
                    <button
                      type="button"
                      onClick={() => addSuggestedTask()}
                      className="py-4 px-8 bg-cyan-500 text-white rounded-3xl font-black flex items-center gap-3 shadow-xl shadow-cyan-100 hover:bg-cyan-600 transition-all active:scale-95"
                    >
                      <PlusCircle className="w-6 h-6" />
                      最初の業務を追加する
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {fields.map((field, index) => (
                      <motion.div key={field.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-white relative group">
                        <div className="absolute top-0 left-10 w-10 h-2 bg-cyan-400 rounded-b-2xl" />
                        <div className="flex justify-between items-center mb-8">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 bg-slate-900 text-white text-sm font-black flex items-center justify-center rounded-2xl shadow-lg">{index + 1}</span>
                            <span className="font-black text-xl text-slate-800 tracking-tight">業務詳細</span>
                          </div>
                          <button type="button" onClick={() => remove(index)} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-8">
                          {/* 業務名 */}
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">具体的な業務名 <span className="text-orange-500">*</span></label>
                            <input 
                              {...register(`tasks.${index}.title`)}
                              aria-invalid={!!errors.tasks?.[index]?.title}
                              className={cn(
                                "w-full p-5 bg-slate-50 border-2 rounded-[1.5rem] outline-none font-bold text-slate-700 transition-all",
                                errors.tasks?.[index]?.title ? "border-orange-200 bg-orange-50/30" : "border-transparent focus:border-cyan-400 focus:bg-white"
                              )}
                              placeholder="例：週次の売上報告書作成"
                            />
                            <ErrorMsg message={errors.tasks?.[index]?.title?.message} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">カテゴリ <span className="text-orange-500">*</span></label>
                              <select {...register(`tasks.${index}.categoryId`)} className="w-full p-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-slate-600 appearance-none">
                                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">頻度 <span className="text-orange-500">*</span></label>
                              <select {...register(`tasks.${index}.frequencyId`)} className="w-full p-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-slate-600 appearance-none">
                                {Object.entries(FREQUENCIES).map(([id, val]) => (
                                  <option key={id} value={id}>{val.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">1回あたりの作業時間 <span className="text-orange-500">*</span></label>
                              <select {...register(`tasks.${index}.hoursPerTime`, { valueAsNumber: true })} className="w-full p-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-slate-600 appearance-none">
                                <option value={0.25}>15分</option>
                                <option value={0.5}>30分</option>
                                <option value={1}>1時間</option>
                                <option value={2}>2時間</option>
                                <option value={4}>半日 (4h)</option>
                                <option value={8}>1日以上 (8h~)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">機密情報の有無 <span className="text-orange-500">*</span></label>
                              <select {...register(`tasks.${index}.confidentiality`)} className="w-full p-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-bold text-slate-600 appearance-none">
                                {CONFIDENTIALITY_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                              </select>
                            </div>
                          </div>

                          {/* 成果物チップ */}
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">主な成果物</label>
                            <div className="flex flex-wrap gap-2">
                              {OUTPUTS.map(output => {
                                const isSelected = watchedTasks[index]?.outputs?.includes(output);
                                return (
                                  <Chip 
                                    key={output} label={output} isSelected={isSelected} color="blue"
                                    onClick={() => {
                                      const current = watchedTasks[index].outputs || [];
                                      setValue(`tasks.${index}.outputs`, isSelected ? current.filter(o => o !== output) : [...current, output]);
                                    }}
                                  />
                                );
                              })}
                            </div>
                            <AnimatePresence>
                              {watchedTasks[index]?.outputs?.includes('その他') && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 overflow-hidden">
                                  <input 
                                    {...register(`tasks.${index}.otherOutputText`)}
                                    aria-invalid={!!errors.tasks?.[index]?.otherOutputText}
                                    className={cn("w-full p-4 bg-blue-50/30 border-2 rounded-2xl outline-none font-bold text-sm", errors.tasks?.[index]?.otherOutputText ? "border-orange-200" : "border-blue-100 focus:border-blue-400")}
                                    placeholder="例：プレゼン資料、プログラムコードなど"
                                  />
                                  <ErrorMsg message={errors.tasks?.[index]?.otherOutputText?.message} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* 困りごとチップ */}
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">困りごと</label>
                            <div className="flex flex-wrap gap-2">
                              {PAIN_POINTS.map(pain => {
                                const isSelected = watchedTasks[index]?.painPoints?.includes(pain);
                                return (
                                  <Chip 
                                    key={pain} label={pain} isSelected={isSelected} color="orange"
                                    onClick={() => {
                                      const current = watchedTasks[index].painPoints || [];
                                      setValue(`tasks.${index}.painPoints`, isSelected ? current.filter(p => p !== pain) : [...current, pain]);
                                    }}
                                  />
                                );
                              })}
                            </div>
                            <AnimatePresence>
                              {watchedTasks[index]?.painPoints?.includes('その他') && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 overflow-hidden">
                                  <input 
                                    {...register(`tasks.${index}.otherPainPointsText`)}
                                    aria-invalid={!!errors.tasks?.[index]?.otherPainPointsText}
                                    className={cn("w-full p-4 bg-orange-50/30 border-2 rounded-2xl outline-none font-bold text-sm", errors.tasks?.[index]?.otherPainPointsText ? "border-orange-200" : "border-orange-100 focus:border-orange-400")}
                                    placeholder="例：専門知識が必要で時間がかかる、毎回違う指示が来るなど"
                                  />
                                  <ErrorMsg message={errors.tasks?.[index]?.otherPainPointsText?.message} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* メモ */}
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">その他メモ (任意)</label>
                            <textarea 
                              {...register(`tasks.${index}.notes`)}
                              rows={2}
                              className="w-full p-5 bg-slate-50 border-none rounded-[1.5rem] outline-none font-medium text-sm text-slate-600 resize-none"
                              placeholder="例：社内資料をもとに作成する、顧客情報を含む場合があるなど"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {fields.length < 10 && (
                      <button
                        type="button"
                        onClick={() => addSuggestedTask()}
                        className="w-full py-10 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-300 font-black flex flex-col items-center gap-3 hover:border-cyan-200 hover:text-cyan-400 hover:bg-cyan-50/20 transition-all group active:scale-95 shadow-sm"
                      >
                        <div className="p-3 bg-slate-50 group-hover:bg-cyan-100 rounded-2xl transition-colors">
                          <Plus className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-lg">業務を1つ追加する</p>
                          <p className="text-[10px] font-bold opacity-60">思いつく業務からで大丈夫です。最大10件まで登録できます。</p>
                        </div>
                      </button>
                    )}
                  </div>
                )}
                <ErrorMsg message={errors.tasks?.root?.message || (errors.tasks as any)?.message} />
              </motion.div>
            )}

            {/* Step 5: 確認 */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-cyan-200/40 border border-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <CheckCircle2 className="w-48 h-48 text-cyan-600" />
                  </div>
                  
                  <h2 className="text-3xl font-black text-slate-800 mb-2">診断準備が整いました！</h2>
                  <p className="text-slate-500 text-sm mb-12 font-medium">ご入力いただいた内容の最終確認です。</p>
                  
                  <div className="space-y-10">
                    {/* ユーザーサマリー */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="p-7 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">User Profile</p>
                        <p className="text-xl font-black text-slate-800 mb-1">{basicInfo.name} <span className="text-sm font-bold text-slate-500">様</span></p>
                        <p className="text-sm font-black text-cyan-600 mb-4">{basicInfo.companyName}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500">{basicInfo.role}</span>
                          <span className="text-[10px] font-bold bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500">{basicInfo.aiUsageFrequency}</span>
                        </div>
                      </div>
                      <div className="p-7 bg-cyan-50 rounded-[2.5rem] border border-cyan-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-black text-cyan-500 uppercase mb-2 tracking-widest">Diagnosis Info</p>
                        <p className="text-2xl font-black text-cyan-700">{watchedTasks.length} <span className="text-sm font-bold opacity-70 tracking-normal">件の業務</span></p>
                        <div className="flex gap-3 mt-4">
                          <div className="flex-1 text-center bg-white/60 p-2 rounded-2xl border border-cyan-200">
                            <p className="text-[9px] font-black text-cyan-400">機密情報あり</p>
                            <p className="text-lg font-black text-cyan-600">{watchedTasks.filter(t => t.confidentiality !== 'なし').length}</p>
                          </div>
                          <div className="flex-1 text-center bg-white/60 p-2 rounded-2xl border border-cyan-200">
                            <p className="text-[9px] font-black text-cyan-400">AIツール</p>
                            <p className="text-lg font-black text-cyan-600">{selectedTools.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ツールとプラン */}
                    <div>
                      <h4 className="font-black text-slate-800 mb-4 ml-2 flex items-center gap-2"><Laptop className="w-5 h-5 text-cyan-500" /> 活用ツール</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedTools.map(id => (
                          <div key={id} className="px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-slate-700">{AI_TOOLS.find(t => t.id === id)?.label}</span>
                            <span className="text-xs font-black bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full">{watch(`toolPlans.${id}`) || '未設定'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 業務リスト */}
                    <div>
                      <h4 className="font-black text-slate-800 mb-4 ml-2 flex items-center gap-2"><FileText className="w-5 h-5 text-cyan-500" /> 業務リスト</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {watchedTasks.map((task, i) => (
                          <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-4">
                            <span className="w-6 h-6 bg-slate-100 text-slate-400 text-[10px] font-black flex items-center justify-center rounded-lg">{i + 1}</span>
                            <div className="flex-1">
                              <p className="text-sm font-black text-slate-700">{task.title}</p>
                              <p className="text-[10px] font-bold text-slate-400">
                                {CATEGORIES.find(c => c.id === task.categoryId)?.label} | {FREQUENCIES[task.frequencyId as FrequencyId]?.label} | {task.hoursPerTime}h
                              </p>
                            </div>
                            {task.confidentiality !== 'なし' && <ShieldAlert className="w-4 h-4 text-orange-400" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 入力チェック結果 */}
                    <div className="p-6 rounded-[2rem] border-2 border-transparent transition-all">
                      {isValid ? (
                        <div className="bg-green-50 border border-green-100 p-5 rounded-[2rem] flex items-center gap-4">
                          <div className="p-3 bg-green-500 text-white rounded-2xl shadow-lg shadow-green-100"><Check className="w-6 h-6" strokeWidth={4} /></div>
                          <div>
                            <p className="text-green-800 font-black">入力チェック完了！</p>
                            <p className="text-xs text-green-600 font-bold tracking-tight">すべての必須項目が正しく入力されています。</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-orange-50 border border-orange-100 p-5 rounded-[2rem] space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-100"><AlertTriangle className="w-6 h-6" /></div>
                            <div>
                              <p className="text-orange-800 font-black">入力が不足しています</p>
                              <p className="text-xs text-orange-600 font-bold tracking-tight">診断を開始するには、すべての必須項目を入力してください。</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {errors.basicInfo && <button type="button" onClick={() => setStep(1)} className="px-4 py-2 bg-white text-orange-600 text-[10px] font-bold rounded-full border border-orange-200 hover:bg-orange-100 transition-all">Step 1 を確認</button>}
                            {errors.selectedTools && <button type="button" onClick={() => setStep(2)} className="px-4 py-2 bg-white text-orange-600 text-[10px] font-bold rounded-full border border-orange-200 hover:bg-orange-100 transition-all">Step 2 を確認</button>}
                            {errors.toolPlans && <button type="button" onClick={() => setStep(3)} className="px-4 py-2 bg-white text-orange-600 text-[10px] font-bold rounded-full border border-orange-200 hover:bg-orange-100 transition-all">Step 3 を確認</button>}
                            {errors.tasks && <button type="button" onClick={() => setStep(4)} className="px-4 py-2 bg-white text-orange-600 text-[10px] font-bold rounded-full border border-orange-200 hover:bg-orange-100 transition-all">Step 4 を確認</button>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 固定フッターナビ */}
          <div className="fixed bottom-0 left-0 right-0 p-4 pb-12 bg-gradient-to-t from-white via-white to-transparent backdrop-blur-[1px] z-50">
            <div className="max-w-2xl mx-auto w-full flex gap-3">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="flex-1 py-5 px-6 bg-white border-2 border-slate-100 text-slate-400 rounded-3xl font-black flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">戻る</span>
                </button>
              )}
              
              {step < 5 ? (
                <button type="button" onClick={handleNext} className="flex-[3] py-5 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl shadow-cyan-100 hover:shadow-cyan-200 hover:translate-y-[-2px] transition-all active:scale-95 group">
                  {STEPS[step]?.name}へ進む
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button type="submit" disabled={!isValid} className={cn("flex-[3] py-5 px-6 rounded-3xl font-black flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95", isValid ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-orange-200 animate-pulse cursor-pointer" : "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed opacity-60")}>
                  診断レポートを生成する
                  <Sparkles className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
