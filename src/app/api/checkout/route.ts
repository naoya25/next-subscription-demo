import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { getStripe } from "@/lib/stripe";

function isValidPriceId(id: string): boolean {
  return /^price_[a-zA-Z0-9]+$/.test(id);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON が不正です" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("priceId" in body)) {
    return NextResponse.json({ error: "priceId が必要です" }, { status: 400 });
  }

  const priceId = (body as { priceId: unknown }).priceId;
  if (typeof priceId !== "string" || !isValidPriceId(priceId)) {
    return NextResponse.json(
      { error: "priceId の形式が不正です" },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  let price: Stripe.Price;
  try {
    price = await stripe.prices.retrieve(priceId);
  } catch {
    return NextResponse.json(
      { error: "価格が見つかりません" },
      { status: 404 },
    );
  }

  if (!price.active || price.type !== "recurring") {
    return NextResponse.json(
      { error: "この価格は購読に利用できません" },
      { status: 400 },
    );
  }

  const base = getAppBaseUrl(request);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/plans?canceled=1`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "チェックアウト URL を取得できませんでした" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout]", e);
    const message =
      e instanceof Error ? e.message : "チェックアウトの作成に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
