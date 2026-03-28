import Link from "next/link";

const nav = [
  { href: "/", label: "ホーム" },
  { href: "/plans", label: "プラン" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 h-14 shrink-0 border-b border-border/80 bg-canvas/80 backdrop-blur-md supports-backdrop-filter:bg-canvas/65">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 text-fg no-underline"
        >
          <span
            aria-hidden
            className="size-2 rounded-full bg-accent shadow-[0_0_12px_-2px] shadow-accent/80"
          />
          <span className="text-sm font-semibold tracking-tight">
            Subscription Demo
          </span>
        </Link>
        <nav aria-label="メイン" className="flex items-center gap-1">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-fg"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
