"use client";

import { useState } from "react";

type Props = {
  priceId: string;
};

export function PlanCheckoutButton({ priceId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
        return;
      }
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setError("決済画面の URL を取得できませんでした");
    } catch {
      setError("サーバーに接続できませんでした");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_65%,transparent)] transition-[background,opacity] hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#0a090b]"
      >
        {loading ? "接続中…" : "このプランで決済へ"}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
