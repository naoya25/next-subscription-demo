import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_55%_at_50%_-8%,var(--accent-muted),transparent_58%),radial-gradient(ellipse_70%_45%_at_100%_15%,var(--accent-muted),transparent_48%),radial-gradient(ellipse_50%_35%_at_0%_40%,var(--accent-muted),transparent_55%)]"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-24 sm:px-8 sm:py-32">
        <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.12] tracking-tight text-fg sm:text-5xl sm:leading-[1.1]">
          サブスクリプションの流れを、
          <span className="text-muted">ローカルで検証する。</span>
        </h1>

        <Link
          href="/plans"
          className="mt-14 w-fit text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          プランを見る →
        </Link>
      </div>
    </main>
  );
}
