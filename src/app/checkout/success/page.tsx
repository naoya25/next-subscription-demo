import type { Metadata } from "next";
import Link from "next/link";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "決済完了",
  description: "サブスクリプションのお申し込みが完了しました",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const q = await searchParams;
  const sessionId = q.session_id;

  let title = "お申し込みを受け付けました";
  let body =
    "Stripe のホスト型 Checkout で決済が完了しました。サブスクリプションの状態は Stripe ダッシュボード（Test mode）で確認できます。";

  if (sessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (
        session.payment_status === "paid" ||
        session.payment_status === "no_payment_required"
      ) {
        title = "決済が完了しました";
      } else if (session.status === "open") {
        title = "セッションは未完了です";
        body =
          "まだ Checkout が完了していない可能性があります。料金の支払い画面から再度お試しください。";
      }
    } catch {
      title = "決済フローを完了した可能性があります";
      body =
        "セッション情報を表示用に読み取れませんでした。Stripe ダッシュボードで Subscription が作成されているかご確認ください。";
    }
  }

  return (
    <main className="relative flex flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,var(--accent-muted),transparent_55%)]"
      />
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-16 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Checkout
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          {title}
        </h1>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted sm:text-base">
          {body}
        </p>
        <Link
          href="/plans"
          className="mt-10 w-fit text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          プラン一覧へ戻る →
        </Link>
      </div>
    </main>
  );
}
