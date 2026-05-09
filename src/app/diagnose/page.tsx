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
  Check,
  Sparkles,
  BarChart3,
  Users,
  Briefcase,
  Target,
  ClipboardList,
  ShieldAlert,
  MessageSquare,
  Zap,
  Wand2,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  FileText,
  AlertTriangle,
  Clock,
  Lock,
  UserCheck,
  Cpu,
  ArrowLeft
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

// バリデーションスキーマ
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
    toolsUsed: z.array(z.string()),
    otherToolsText: z.string().optional(),
    expectations: z.array(z.string()),
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
  toolPlans: z.record(z.string(), z.string()),
  tasks: z.array(z.object({
    id: z.string(),
    title: z.string().min(1, '業務名を入力してください'),
    categoryId: z.string().min(1, 'カテゴリを選択してください'),
    hoursPerTime: z.number().min(0.1, '作業時間を入力してください'),
    frequencyId: z.string().min(1, '頻度を選択してください'),
    outputs: z.array(z.string()),
    otherOutputText: z.string().optional(),
    tools: z.array(z.string()),
    otherToolsText: z.string().optional(),
    painPoints: z.array(z.string()),
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

const TOOL_TAGS: Record<AIToolId, string[]> = {
  chatgpt: ['文章作成', '壁打ち', 'データ分析', 'ファイル読解'],
  copilot: ['Word', 'Excel', 'PowerPoint', 'Teams'],
  gemini: ['Gmail', 'Docs', 'Sheets', 'Slides']
};

export default function DiagnosePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showStepError, setShowStepError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { register, control, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      basicInfo: {
        name: '',
        companyName: '',
        departmentName: '',
        industry: '',
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
  const toolPlans = watch('toolPlans');

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
    if (step !== 5) return;
    const result = generateDiagnosisReport(data as DiagnosisData);
    localStorage.setItem('diagnosis_result', JSON.stringify(result));
    router.push('/report');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 pb-40 pt-6 px-4 font-sans" onKeyDown={handleKeyDown}>
      <div className="max-w-2xl mx-auto">
        
        {/* ステップナビ */}
        <div className="mb-8 bg-white/80 backdrop-blur-md p-5 rounded-[2.5rem] border border-white shadow-sm">
          <div className="flex justify-between items-center mb-4 px-2">
            <div>
              <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1">ステップ {step} / 5</p>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{STEPS[step - 1].name}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">進捗</p>
              <p className="text-sm font-black text-slate-600">{Math.round(progress)}%完了</p>
            </div>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
            />
          </div>
        </div>

        <AnimatePresence>
          {showStepError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-3xl flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl text-orange-600"><AlertTriangle className="w-5 h-5" /></div>
                <p className="text-sm font-bold text-orange-700">入力が完了していない項目があります。上から順に確認してください。</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            
            {/* Step 1: 基本情報 */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl border border-white">
                  <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                    <span className="p-2.5 bg-cyan-100 rounded-2xl"><Users className="text-cyan-600 w-6 h-6" /></span>
                    基本情報を教えてください
                  </h2>
                  
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> あなたの情報</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">氏名 <span className="text-orange-500">*</span></label>
                          <input {...register('basicInfo.name')} aria-invalid={!!errors.basicInfo?.name} className={cn("w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold", errors.basicInfo?.name ? "border-orange-200 bg-orange-50/30" : "border-transparent focus:border-cyan-400 focus:bg-white")} placeholder="山田 太郎" />
                          <ErrorMsg message={errors.basicInfo?.name?.message} />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">会社名 <span className="text-orange-500">*</span></label>
                          <input {...register('basicInfo.companyName')} aria-invalid={!!errors.basicInfo?.companyName} className={cn("w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold", errors.basicInfo?.companyName ? "border-orange-200 bg-orange-50/30" : "border-transparent focus:border-cyan-400 focus:bg-white")} placeholder="例：株式会社サンプル (個人の方は「個人」)" />
                          <ErrorMsg message={errors.basicInfo?.companyName?.message} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">部署名</label>
                          <input {...register('basicInfo.departmentName')} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-cyan-400 focus:bg-white outline-none font-bold transition-all" placeholder="例：営業部、企画開発課など" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">業種 <span className="text-orange-500">*</span></label>
                          <input {...register('basicInfo.industry')} aria-invalid={!!errors.basicInfo?.industry} className={cn("w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold", errors.basicInfo?.industry ? "border-orange-200 bg-orange-50/30" : "border-transparent focus:border-cyan-400 focus:bg-white")} placeholder="IT、製造、サービス業など" />
                          <ErrorMsg message={errors.basicInfo?.industry?.message} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">会社規模 <span className="text-orange-500">*</span></label>
                          <select {...register('basicInfo.companySize')} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 appearance-none">{COMPANY_SIZES.map(size => <option key={size} value={size}>{size}</option>)}</select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">役職 <span className="text-orange-500">*</span></label>
                          <select {...register('basicInfo.role')} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 appearance-none">{ROLES.map(role => <option key={role} value={role}>{role}</option>)}</select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> AI利用状況</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">AI利用経験 <span className="text-orange-500">*</span></label>
                          <select {...register('basicInfo.aiExperience')} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 appearance-none">{AI_EXPERIENCES.map(e => <option key={e} value={e}>{e}</option>)}</select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">AI利用頻度 <span className="text-orange-500">*</span></label>
                          <select {...register('basicInfo.aiUsageFrequency')} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 appearance-none">{AI_USAGE_FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}</select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">会社でのAI利用ルール <span className="text-orange-500">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {COMPANY_AI_RULES.map(rule => <Chip key={rule} label={rule} isSelected={basicInfo.companyAIRules === rule} onClick={() => setValue('basicInfo.companyAIRules', rule)} />)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" /> 業務環境</h3>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">普段使っている業務ツール</label>
                        {TOOLS_USED_GROUPS.map(group => (
                          <div key={group.label} className="mb-4">
                            <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{group.label}</p>
                            <div className="flex flex-wrap gap-2">
                              {group.tools.map(tool => {
                                const isSelected = basicInfo.toolsUsed.includes(tool);
                                return <Chip key={tool} label={tool} isSelected={isSelected} onClick={() => {
                                  const current = basicInfo.toolsUsed;
                                  setValue('basicInfo.toolsUsed', isSelected ? current.filter(t => t !== tool) : [...current, tool]);
                                }} />;
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">AI活用で期待すること</label>
                        <div className="flex flex-wrap gap-2">
                          {EXPECTATIONS.map(exp => {
                            const isSelected = basicInfo.expectations.includes(exp);
                            return <Chip key={exp} label={exp} isSelected={isSelected} color="blue" onClick={() => {
                              const current = basicInfo.expectations;
                              setValue('basicInfo.expectations', isSelected ? current.filter(e => e !== exp) : [...current, exp]);
                            }} />;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: AIツール選択 */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white">
                  <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                    <span className="p-2.5 bg-cyan-100 rounded-2xl"><Sparkles className="text-cyan-600 w-6 h-6" /></span>
                    診断対象のAIツールを選択
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {AI_TOOLS.map((tool) => {
                      const isSelected = selectedTools.includes(tool.id);
                      return (
                        <div key={tool.id} onClick={() => {
                          const current = selectedTools;
                          const newVal = isSelected ? current.filter(id => id !== tool.id) : [...current, tool.id];
                          setValue('selectedTools', newVal);
                          trigger('selectedTools');
                        }} className={cn("cursor-pointer p-6 rounded-[2.5rem] border-2 transition-all group", isSelected ? "border-cyan-500 bg-cyan-50/50" : "border-slate-100 bg-slate-50/30 hover:border-cyan-200")}>
                          <div className="flex items-start gap-5">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", isSelected ? "bg-cyan-500 text-white" : "bg-white text-slate-400 border border-slate-100")}>
                              {tool.id === 'chatgpt' && <MessageSquare className="w-8 h-8" />}
                              {tool.id === 'copilot' && <Briefcase className="w-8 h-8" />}
                              {tool.id === 'gemini' && <Zap className="w-8 h-8" />}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-black text-lg text-slate-800 mb-1">{tool.label}</h3>
                              <p className="text-sm text-slate-600 font-bold mb-3">{tool.description}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {TOOL_TAGS[tool.id].map(tag => <span key={tag} className="px-2 py-0.5 rounded-lg text-[10px] font-black border border-slate-100 bg-white text-slate-400">{tag}</span>)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <ErrorMsg message={errors.selectedTools?.message} />
                </div>
              </motion.div>
            )}

            {/* Step 3: プラン選択 */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white">
                  <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-3">
                    <span className="p-2.5 bg-blue-100 rounded-2xl"><Target className="text-blue-600 w-6 h-6" /></span>
                    ツールのプランを選択
                  </h2>
                  <div className="space-y-12">
                    {selectedTools.map(toolId => (
                      <div key={toolId} className="space-y-4">
                        <h3 className="font-black text-xl text-slate-800 border-l-4 border-cyan-500 pl-3">{AI_TOOLS.find(t => t.id === toolId)?.label}</h3>
                        <div className="grid grid-cols-1 gap-3">
                          {AI_PLANS_METADATA[toolId].map(plan => {
                            const isSelected = toolPlans[toolId] === plan.label;
                            return (
                              <div key={plan.label} onClick={() => { setValue(`toolPlans.${toolId}`, plan.label); trigger(`toolPlans.${toolId}`); }} className={cn("cursor-pointer p-5 rounded-[2rem] border-2 transition-all", isSelected ? "bg-cyan-50 border-cyan-500" : "bg-slate-50 border-transparent hover:bg-slate-100")}>
                                <div className="flex justify-between items-center"><span className="font-black text-base">{plan.label}</span>{isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-500" />}</div>
                                <p className="text-xs text-slate-500 font-bold">{plan.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: 業務入力 */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="bg-white/70 backdrop-blur-md p-7 rounded-[2.5rem] border border-white shadow-sm">
                  <h3 className="text-sm font-black text-slate-800 mb-5 flex items-center gap-2"><Wand2 className="w-4 h-4 text-cyan-500" />よくある業務から追加</h3>
                  <div className="flex flex-wrap gap-2">
                    {TASK_SUGGESTIONS.map(suggest => <button key={suggest.title} type="button" onClick={() => addSuggestedTask(suggest)} className="px-4 py-2 bg-white border-2 border-slate-50 rounded-2xl text-xs font-bold text-slate-600 hover:border-cyan-300 hover:text-cyan-600 transition-all">+ {suggest.title}</button>)}
                  </div>
                </div>

                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <motion.div key={field.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-white relative">
                      <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3"><span className="w-10 h-10 bg-slate-900 text-white text-sm font-black flex items-center justify-center rounded-2xl">{index + 1}</span><span className="font-black text-xl text-slate-800">業務詳細</span></div>
                        <button type="button" onClick={() => remove(index)} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 rounded-full transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                      <div className="space-y-8">
                        <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">業務名 <span className="text-orange-500">*</span></label>
                          <input {...register(`tasks.${index}.title`)} aria-invalid={!!errors.tasks?.[index]?.title} className={cn("w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold", errors.tasks?.[index]?.title ? "border-orange-200" : "border-transparent focus:border-cyan-400 focus:bg-white")} placeholder="例：週次の売上報告書作成" />
                          <ErrorMsg message={errors.tasks?.[index]?.title?.message} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">カテゴリ</label>
                            <select {...register(`tasks.${index}.categoryId`)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold appearance-none">{CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}</select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">機密情報</label>
                            <select {...register(`tasks.${index}.confidentiality`)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold appearance-none">{CONFIDENTIALITY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">1回あたりの作業時間</label>
                            <select {...register(`tasks.${index}.hoursPerTime`, { valueAsNumber: true })} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold appearance-none">
                              <option value={0.25}>15分</option><option value={0.5}>30分</option><option value={1}>1時間</option><option value={2}>2時間</option><option value={4}>4時間</option><option value={8}>8時間以上</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">頻度</label>
                            <select {...register(`tasks.${index}.frequencyId`)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold appearance-none">{Object.entries(FREQUENCIES).map(([id, val]) => <option key={id} value={id}>{val.label}</option>)}</select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">主な成果物</label>
                          <div className="flex flex-wrap gap-2">{OUTPUTS.map(o => <Chip key={o} label={o} isSelected={watchedTasks[index]?.outputs?.includes(o)} color="blue" onClick={() => {
                            const current = watchedTasks[index].outputs || [];
                            setValue(`tasks.${index}.outputs`, current.includes(o) ? current.filter(x => x !== o) : [...current, o]);
                          }} />)}</div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">その他メモ</label>
                          <textarea {...register(`tasks.${index}.notes`)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold h-24 outline-none resize-none" placeholder="補足事項があれば入力してください" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <button type="button" onClick={() => addSuggestedTask()} className="w-full p-8 rounded-[3rem] border-4 border-dashed border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/30 transition-all flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-300 shadow-sm"><Plus className="w-6 h-6" /></div>
                    <div className="text-center"><p className="text-base font-black text-slate-800">＋ 業務を1つ追加する</p><p className="text-[10px] font-bold text-slate-400 mt-1">最大10件まで登録できます。</p></div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: 確認画面 */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
                <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-50 text-cyan-600 rounded-full text-[11px] font-black tracking-widest mb-4">FINAL CHECK</div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">診断前の確認</h2>
                    <p className="text-slate-500 font-bold leading-relaxed">以下の内容で診断レポートを作成します。<br />内容に誤りがないか確認してください。</p>
                  </div>

                  <div className="space-y-12">
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 bg-cyan-400 rounded-full" />基本情報</h3>
                        <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black text-cyan-600 hover:underline flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> 基本情報を修正する</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm font-bold">
                        <p><span className="text-slate-400 mr-2">氏名:</span> {basicInfo.name}</p>
                        <p><span className="text-slate-400 mr-2">会社名:</span> {basicInfo.companyName}</p>
                        <p><span className="text-slate-400 mr-2">部署名:</span> {basicInfo.departmentName || '未入力'}</p>
                        <p><span className="text-slate-400 mr-2">業種:</span> {basicInfo.industry}</p>
                        <p><span className="text-slate-400 mr-2">規模:</span> {basicInfo.companySize}</p>
                        <p><span className="text-slate-400 mr-2">役職:</span> {basicInfo.role}</p>
                        <p><span className="text-slate-400 mr-2">経験:</span> {basicInfo.aiExperience}</p>
                        <p><span className="text-slate-400 mr-2">頻度:</span> {basicInfo.aiUsageFrequency}</p>
                        <p className="sm:col-span-2"><span className="text-slate-400 mr-2">AIルール:</span> {basicInfo.companyAIRules}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 bg-cyan-400 rounded-full" />AIツール・プラン</h3>
                        <button type="button" onClick={() => setStep(2)} className="text-[10px] font-black text-cyan-600 hover:underline flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> AIツールを修正する</button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {selectedTools.map(id => (
                          <div key={id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-sm font-black text-slate-800">{AI_TOOLS.find(t => t.id === id)?.label}</p>
                            <p className="text-[10px] font-bold text-cyan-600 mt-1">{toolPlans[id]}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 bg-cyan-400 rounded-full" />業務情報 ({watchedTasks.length}件)</h3>
                        <button type="button" onClick={() => setStep(4)} className="text-[10px] font-black text-cyan-600 hover:underline flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> 業務内容を修正する</button>
                      </div>
                      <div className="space-y-4">
                        {watchedTasks.map((task, i) => (
                          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-base font-black text-slate-800">{task.title}</p>
                              <span className="text-[10px] font-black px-2 py-1 bg-slate-50 rounded-lg text-slate-400">{CATEGORIES.find(c => c.id === task.categoryId)?.label}</span>
                            </div>
                            <div className="flex flex-wrap gap-y-1 gap-x-4 text-[11px] font-bold text-slate-500">
                              <p>1回 {task.hoursPerTime}h</p>
                              <p>{FREQUENCIES[task.frequencyId as FrequencyId]?.label}</p>
                              <p className={task.confidentiality === 'なし' ? 'text-slate-400' : 'text-orange-500'}>機密: {task.confidentiality}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-cyan-600 p-10 rounded-[3rem] text-white shadow-xl shadow-cyan-100">
                      <h4 className="text-xl font-black mb-8 flex items-center gap-2"><BarChart3 className="w-6 h-6" /> 診断後にわかること</h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          '業務別のAI活用可能性', '月間・年間の削減時間', 'おすすめAIツール',
                          '注意が必要な業務', '明日から試せるアクション', 'そのまま使えるプロンプト例'
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm font-bold text-cyan-50">
                            <CheckCircle2 className="w-5 h-5 text-cyan-200" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 固定下部アクションボタン */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent backdrop-blur-sm z-40">
            <div className="max-w-2xl mx-auto flex gap-4">
              {step > 1 && (
                <button type="button" onClick={prevStep} className="flex-1 py-5 px-6 bg-white border-2 border-slate-100 text-slate-400 rounded-3xl font-black flex items-center justify-center gap-2 hover:border-cyan-200 hover:text-cyan-600 transition-all shadow-lg">
                  <ChevronLeft className="w-5 h-5" /> 戻る
                </button>
              )}
              {step < 5 ? (
                <button type="button" onClick={handleNext} className="flex-[2] py-5 px-6 bg-slate-900 text-white rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-2xl">
                  {step === 4 ? '入力内容を確認する' : '次へ進む'} <ChevronRight className="w-6 h-6" />
                </button>
              ) : (
                <button type="submit" className="flex-[2] py-5 px-6 bg-cyan-600 text-white rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-cyan-700 transition-all shadow-2xl shadow-cyan-200">
                  診断レポートを生成する <ArrowRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
