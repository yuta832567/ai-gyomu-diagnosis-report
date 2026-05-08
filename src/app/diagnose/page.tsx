export default function DiagnosePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <p className="mb-3 text-sm font-semibold text-cyan-600">Step 1</p>
        <h1 className="text-3xl font-bold text-slate-900">
          診断フォーム
        </h1>
        <p className="mt-4 text-slate-600">
          ここに基本情報入力、AIツール選択、業務入力のステップ画面を作成していきます。
        </p>
        <a
          href="/"
          className="mt-8 inline-block rounded-full bg-cyan-600 px-6 py-3 font-semibold text-white"
        >
          トップへ戻る
        </a>
      </div>
    </main>
  );
}
