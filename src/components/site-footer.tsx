export function SiteFooter() {
  return (
    <footer className="mt-auto shrink-0 border-t border-border/80 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 text-sm text-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-mono text-xs tracking-wide">
          Stripe test mode · Next.js App Router
        </p>
        <p>ローカル検証用のサンプルです。</p>
      </div>
    </footer>
  );
}
