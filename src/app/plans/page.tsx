import type { Metadata } from "next";
import Link from "next/link";
import { listSubscriptionPlans } from "@/lib/subscription-plans";

export const metadata: Metadata = {
  title: "プラン一覧",
  description: "Stripe テストモードのサブスクリプション価格一覧",
};

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  let plans: Awaited<ReturnType<typeof listSubscriptionPlans>> = [];
  let errorMessage: string | null = null;

  try {
    plans = await listSubscriptionPlans();
  } catch (e) {
    errorMessage =
      e instanceof Error ? e.message : "プランの取得に失敗しました。";
  }

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16 sm:px-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            サブスクリプション
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            プラン一覧
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Stripe ダッシュボードのテストモードで作成した
            定期課金プリセットがここに表示されます。商品や価格を追加・変更すると、次の読み込みで反映されます。
          </p>
          <Link
            href="/"
            className="mt-1 w-fit text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
          >
            ← トップへ
          </Link>
        </header>

        {errorMessage ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100"
          >
            <p className="font-medium">読み込みエラー</p>
            <p className="mt-2 whitespace-pre-wrap opacity-90">{errorMessage}</p>
            <p className="mt-3 text-xs opacity-80">
              `.env.local` に `STRIPE_SECRET_KEY`（`sk_test_...`）が設定されているか、Stripe
              CLI のターゲットと同じプロジェクトか確認してください。
            </p>
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-950">
            <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
              表示できるプランがありません
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              Stripe ダッシュボード（Test mode）で Product と recurring
              Price を作成し、アクティブにしてください。
            </p>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <li key={plan.priceId}>
                <article className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {plan.name}
                  </h2>
                  {plan.description ? (
                    <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {plan.description}
                    </p>
                  ) : null}
                  <div className="mt-6 flex flex-1 flex-col gap-1">
                    <p className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {plan.amountLabel}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {plan.intervalLabel}
                    </p>
                  </div>
                  <p className="mt-6 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                    {plan.priceId}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
