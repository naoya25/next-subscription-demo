/**
 * Checkout の success/cancel URL 用。ローカルはリクエストの Origin、本番は環境変数を優先。
 */
export function getAppBaseUrl(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) {
    return fromEnv;
  }

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }

  const origin = request.headers.get("origin")?.replace(/\/$/, "");
  if (origin) {
    return origin;
  }

  return new URL(request.url).origin;
}
