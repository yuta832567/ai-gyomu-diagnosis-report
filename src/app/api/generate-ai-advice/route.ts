import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AIAdvice } from '@/lib/types';

// OpenAI SDKの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { diagnosisData, diagnosticResults } = body;

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const systemPrompt = `
あなたは経験豊富なAI導入コンサルタントおよびDXアドバイザーです。
「生成AI業務診断ツール」の一部として、ユーザーに寄り添った具体的なアドバイスとプロンプト例を生成してください。

【生成のガイドライン】
- 初心者にもわかりやすく、専門用語は控えめに。
- 優しく前向きなトーンで、ユーザーの挑戦を後押しする。
- 具体的で、明日からすぐに実務で使えるアクションを提案する。
- AIを過信させず、必ず人間による最終確認が必要であることを伝える。
- ユーザーの業種、職種、AI経験レベル（${diagnosisData.basicInfo.aiExperience}）に合わせた内容にする。

【出力形式】
JSON形式で出力してください。
`;

    const userPrompt = `
以下のユーザー情報と診断結果に基づいて、アドバイスを生成してください。

【ユーザー情報】
氏名：${diagnosisData.basicInfo.name}
会社名：${diagnosisData.basicInfo.companyName}
部署：${diagnosisData.basicInfo.departmentName || '未設定'}
役職：${diagnosisData.basicInfo.role}
業種：${diagnosisData.basicInfo.industry}
AI利用経験：${diagnosisData.basicInfo.aiExperience}
利用ツール：${diagnosisData.selectedTools.join(', ')}
社内ルール：${diagnosisData.basicInfo.companyAIRules}

【既存の診断結果（数値データ）】
月間削減時間：${diagnosticResults.totalSavingsMonthly}時間
年間削減時間：${diagnosticResults.totalSavingsYearly}時間
AI活用スコア：${diagnosticResults.overallScore}/5.0
活用効果が高い業務ランキング：
${diagnosticResults.taskRankings.map((r: any, i: number) => `${i + 1}. ${r.title} (スコア: ${r.score})`).join('\n')}

【登録された全業務の詳細】
${diagnosisData.tasks.map((t: any) => `
- 業務名: ${t.title}
  成果物: ${t.outputs.join(', ')}
  困りごと: ${t.painPoints.join(', ')}
  機密情報の有無: ${t.confidentiality}
`).join('\n')}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // コスト効率と性能のバランスが良いモデル
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ai_advice",
          strict: true,
          schema: {
            type: "object",
            properties: {
              overallAdvice: { type: "string" },
              priorityReason: { type: "string" },
              firstAction: { type: "string" },
              taskAdvices: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    taskTitle: { type: "string" },
                    advice: { type: "string" },
                    promptExample: { type: "string" },
                    riskNote: { type: "string" }
                  },
                  required: ["taskTitle", "advice", "promptExample", "riskNote"],
                  additionalProperties: false
                }
              },
              nextActions: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["overallAdvice", "priorityReason", "firstAction", "taskAdvices", "nextActions"],
            additionalProperties: false
          }
        }
      },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('OpenAI response is empty');
    }

    const aiAdvice: AIAdvice = JSON.parse(content);
    return NextResponse.json(aiAdvice);

  } catch (error: any) {
    console.error('Error in generate-ai-advice:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
