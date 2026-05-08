export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <p className="mb-3 text-sm font-semibold text-slate-500">Admin</p>
        <h1 className="text-3xl font-bold text-slate-900">
          管理画面
        </h1>
        <p className="mt-4 text-slate-600">
          ここに診断結果一覧、会社別集計、診断ロジック管理、料金表管理を作成していきます。
        </p>
        <a
          href="/"
          className="mt-8 inline-block rounded-full bg-slate-900 px-6 py-3 font-semibold text-white"
        >
          トップへ戻る
        </a>
      </div>
    </main>
  );
}
