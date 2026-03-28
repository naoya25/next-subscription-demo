import type { Metadata } from "next";
import { PlanCheckoutButton } from "@/components/plan-checkout-button";
import { listSubscriptionPlans } from "@/lib/subscription-plans";

export const metadata: Metadata = {
  title: "プラン一覧",
  description: "Stripe テストモードのサブスクリプション価格一覧",
};

export const dynamic = "force-dynamic";

type PlansPageProps = {
  searchParams: Promise<{ canceled?: string }>;
};

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const query = await searchParams;
  const canceled = query.canceled === "1";

  let plans: Awaited<ReturnType<typeof listSubscriptionPlans>> = [];
  let errorMessage: string | null = null;

  try {
    plans = await listSubscriptionPlans();
  } catch (e) {
    errorMessage =
      e instanceof Error ? e.message : "プランの取得に失敗しました。";
  }

  return (
    <main className="relative flex flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,var(--accent-muted),transparent_55%)]"
      />
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-14 sm:px-8 sm:py-20">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Subscription
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            プラン一覧
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted">
            ダッシュボード（Test mode）で作成した定期課金 Price
            がここに並びます。商品や価格を変えたあと、再読み込みで反映されます。
          </p>
        </header>

        {canceled ? (
          <div
            role="status"
            className="mt-8 rounded-(--radius-card) border border-border bg-surface/80 px-4 py-3 text-sm text-muted backdrop-blur-sm"
          >
            決済をキャンセルしました。別のプランを選び直せます。
          </div>
        ) : null}

        <div className="mt-14">
          {errorMessage ? (
            <div
              role="alert"
              className="rounded-(--radius-card) border border-danger/30 bg-danger-surface px-5 py-5 text-sm text-fg"
            >
              <p className="font-semibold text-danger">読み込みエラー</p>
              <p className="mt-2 whitespace-pre-wrap text-muted">
                {errorMessage}
              </p>
              <p className="mt-4 text-xs text-faint">
                `.env.local` の `STRIPE_SECRET_KEY`（`sk_test_...`）と、Stripe
                ダッシュボードのプロジェクトが一致しているか確認してください。
              </p>
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-(--radius-card) border border-dashed border-border bg-surface/60 px-8 py-16 text-center backdrop-blur-sm">
              <p className="font-medium text-fg">
                表示できるプランがありません
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Product と recurring の Price
                を作成し、アクティブにしてください。
              </p>
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <li key={plan.priceId}>
                  <article className="flex h-full flex-col rounded-(--radius-card) border border-border bg-surface/80 p-6 shadow-[0_1px_0_0_color-mix(in_oklab,var(--border)_70%,transparent)] backdrop-blur-sm transition-[border-color,box-shadow] hover:border-faint hover:shadow-[0_18px_48px_-28px_color-mix(in_oklab,var(--fg)_28%,transparent)]">
                    <h2 className="text-base font-semibold tracking-tight text-fg">
                      {plan.name}
                    </h2>
                    {plan.description ? (
                      <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted">
                        {plan.description}
                      </p>
                    ) : null}
                    <div className="mt-8 flex flex-1 flex-col gap-0.5">
                      <p className="text-2xl font-semibold tracking-tight text-fg">
                        {plan.amountLabel}
                      </p>
                      <p className="text-sm text-muted">{plan.intervalLabel}</p>
                    </div>
                    <p className="mt-4 font-mono text-[11px] leading-normal text-faint">
                      {plan.priceId}
                    </p>
                    <PlanCheckoutButton priceId={plan.priceId} />
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
