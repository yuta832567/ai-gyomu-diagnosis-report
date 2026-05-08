'use client';

import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ROLES, 
  COMPANY_SIZES, 
  AI_EXPERIENCES, 
  AI_TOOLS, 
  CATEGORIES, 
  FREQUENCIES 
} from '@/lib/constants';
import { Role, CompanySize, AIExperience, AIToolId, CategoryId, FrequencyId } from '@/lib/types';

// バリデーションスキーマ
const schema = z.object({
  basicInfo: z.object({
    name: z.string().min(1, '氏名を入力してください'),
    companyName: z.string().optional(),
    departmentName: z.string().optional(),
    role: z.enum(ROLES as [string, ...string[]]),
    industry: z.string().min(1, '業種を入力してください'),
    companySize: z.enum(COMPANY_SIZES as [string, ...string[]]),
    aiExperience: z.enum(AI_EXPERIENCES as [string, ...string[]]),
  }),
  selectedTools: z.array(z.string()).min(1, '少なくとも1つのツールを選択してください'),
  tasks: z.array(z.object({
    title: z.string().min(1, '業務名を入力してください'),
    categoryId: z.string().min(1, 'カテゴリを選択してください'),
    hoursPerTime: z.number().min(0.1, '0.1時間以上を入力してください'),
    frequencyId: z.string().min(1, '頻度を選択してください'),
    painPoint: z.string().optional(),
    hasConfidentialInfo: z.boolean().default(false),
  })).min(1, '少なくとも1つの業務を入力してください'),
});

type FormValues = z.infer<typeof schema>;

const STEPS = [
  '基本情報',
  'AIツール',
  'プラン',
  '業務入力',
  '確認'
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
      },
      selectedTools: [],
      tasks: [
        { title: '', categoryId: 'document', hoursPerTime: 1, frequencyId: 'weekly_1', hasConfidentialInfo: false }
      ],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks"
  });

  const selectedTools = watch('selectedTools');
  const watchedTasks = watch('tasks');

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = (data: FormValues) => {
    console.log('Diagnosis Data:', data);
    alert('診断を開始します（レポート画面は次のステップで実装します）');
    // TODO: 診断結果画面へ遷移
  };

  const progress = (step / 5) * 100;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-cyan-600">Step {step} / 5</span>
            <span className="text-sm text-slate-500 font-medium">{STEPS[step - 1]}</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {/* Step 1: 基本情報 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-cyan-500 w-6 h-6" />
                    基本情報を入力してください
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">氏名 <span className="text-red-500">*</span></label>
                      <input 
                        {...register('basicInfo.name')}
                        className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                        placeholder="山田 太郎"
                      />
                      {errors.basicInfo?.name && <p className="text-red-500 text-xs mt-1">{errors.basicInfo.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">会社名</label>
                        <input 
                          {...register('basicInfo.companyName')}
                          className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none"
                          placeholder="株式会社サンプル"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">部署名</label>
                        <input 
                          {...register('basicInfo.departmentName')}
                          className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none"
                          placeholder="営業部"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">役職 <span className="text-red-500">*</span></label>
                      <select 
                        {...register('basicInfo.role')}
                        className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none"
                      >
                        {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">業種 <span className="text-red-500">*</span></label>
                      <input 
                        {...register('basicInfo.industry')}
                        className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none"
                        placeholder="製造業、サービス業など"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">会社規模 <span className="text-red-500">*</span></label>
                        <select 
                          {...register('basicInfo.companySize')}
                          className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none"
                        >
                          {COMPANY_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">AI利用経験 <span className="text-red-500">*</span></label>
                        <select 
                          {...register('basicInfo.aiExperience')}
                          className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none"
                        >
                          {AI_EXPERIENCES.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                        </select>
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
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Laptop className="text-cyan-500 w-6 h-6" />
                    活用したいAIツールを選択
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">複数選択可能です</p>

                  <div className="grid grid-cols-1 gap-3">
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
                            "cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                            isSelected 
                              ? "border-cyan-500 bg-cyan-50" 
                              : "border-slate-100 hover:border-cyan-200"
                          )}
                        >
                          <div>
                            <p className="font-bold text-slate-700">{tool.label}</p>
                            <p className="text-xs text-slate-500">{tool.description}</p>
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            isSelected ? "bg-cyan-500 border-cyan-500" : "border-slate-200"
                          )}>
                            {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {errors.selectedTools && <p className="text-red-500 text-xs mt-2">{errors.selectedTools.message}</p>}
                </div>
              </motion.div>
            )}

            {/* Step 3: プラン選択 (簡易表示) */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">ツールの詳細（プラン）</h2>
                  <p className="text-sm text-slate-500 mb-4">選択したツールのプランを確認してください（初期実装では自動選択）</p>
                  
                  <div className="space-y-3">
                    {selectedTools.map(id => {
                      const tool = AI_TOOLS.find(t => t.id === id);
                      return (
                        <div key={id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                          <CheckCircle2 className="text-green-500" />
                          <span className="font-bold text-slate-700">{tool?.label}</span>
                          <span className="text-xs bg-white px-2 py-1 rounded-full border border-slate-200 text-slate-500 ml-auto">標準プラン</span>
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
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-slate-800 px-2">診断したい業務を教えてください</h2>
                
                {fields.map((field, index) => (
                  <div key={field.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500" />
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-cyan-100 text-cyan-700 text-xs font-bold px-2 py-1 rounded-md">業務 {index + 1}</span>
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">具体的な業務名</label>
                        <input 
                          {...register(`tasks.${index}.title`)}
                          className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none"
                          placeholder="例：議事録の要約、顧客メール作成"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">カテゴリ</label>
                          <select 
                            {...register(`tasks.${index}.categoryId`)}
                            className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none"
                          >
                            {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">頻度</label>
                          <select 
                            {...register(`tasks.${index}.frequencyId`)}
                            className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none"
                          >
                            {Object.entries(FREQUENCIES).map(([id, val]) => (
                              <option key={id} value={id}>{val.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">1回あたりの作業時間 (時間)</label>
                        <input 
                          type="number"
                          step="0.1"
                          {...register(`tasks.${index}.hoursPerTime`, { valueAsNumber: true })}
                          className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input 
                          type="checkbox"
                          id={`confidential-${index}`}
                          {...register(`tasks.${index}.hasConfidentialInfo`)}
                          className="w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                        />
                        <label htmlFor={`confidential-${index}`} className="text-sm text-slate-600 flex items-center gap-1">
                          機密情報を含む <Info className="w-3 h-3 text-slate-400" />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => append({ title: '', categoryId: 'document', hoursPerTime: 1, frequencyId: 'weekly_1', hasConfidentialInfo: false })}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-3xl text-slate-500 font-bold flex items-center justify-center gap-2 hover:border-cyan-300 hover:text-cyan-500 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  業務を追加する
                </button>
              </motion.div>
            )}

            {/* Step 5: 確認画面 */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <h2 className="text-xl font-bold text-slate-800 mb-6">入力内容を確認してください</h2>
                  
                  <div className="space-y-6 text-sm">
                    <div>
                      <h3 className="font-bold text-slate-500 mb-2 border-b pb-1">基本情報</h3>
                      <p className="flex justify-between"><span>氏名:</span> <span className="font-medium">{watch('basicInfo.name')}</span></p>
                      <p className="flex justify-between"><span>役職:</span> <span className="font-medium">{watch('basicInfo.role')}</span></p>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-500 mb-2 border-b pb-1">選択したAIツール</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedTools.map(id => (
                          <span key={id} className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full font-bold">
                            {AI_TOOLS.find(t => t.id === id)?.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-500 mb-2 border-b pb-1">入力された業務 ({watchedTasks.length}件)</h3>
                      <div className="space-y-2">
                        {watchedTasks.map((task, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-xl">
                            <p className="font-bold text-slate-700">{task.title || '(未入力)'}</p>
                            <p className="text-xs text-slate-500">
                              {CATEGORIES.find(c => c.id === task.categoryId)?.label} | 
                              {FREQUENCIES[task.frequencyId as FrequencyId]?.label} | 
                              {task.hoursPerTime}時間
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                    <p className="text-xs text-orange-700 leading-relaxed">
                      ※この診断は入力されたデータに基づくシミュレーションです。実際の導入効果は環境やスキルの習熟度により異なります。
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 固定フッターナビゲーション */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                戻る
              </button>
            )}
            
            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-[2] py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-200 hover:shadow-cyan-300 transition-all active:scale-95"
              >
                次へ進む
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex-[2] py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-200 hover:shadow-cyan-300 transition-all active:scale-95"
              >
                診断を開始する
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
