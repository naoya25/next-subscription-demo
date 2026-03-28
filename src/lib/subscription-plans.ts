import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

export type SubscriptionPlan = {
  priceId: string;
  name: string;
  description: string | null;
  amountLabel: string;
  intervalLabel: string;
};

function formatStripeUnitAmount(
  unitAmount: number | null,
  currency: string,
): string {
  if (unitAmount === null) {
    return "—";
  }
  const curr = currency.toLowerCase();
  const major = ZERO_DECIMAL_CURRENCIES.has(curr)
    ? unitAmount
    : unitAmount / 100;
  try {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(major);
  } catch {
    return `${major} ${currency.toUpperCase()}`;
  }
}

function intervalLabelJa(
  interval: Stripe.Price.Recurring.Interval,
  count: number,
): string {
  const n = count > 1 ? `${count}` : "";
  switch (interval) {
    case "month":
      return count === 1 ? "月額" : `${count} ヶ月ごと`;
    case "year":
      return count === 1 ? "年額" : `${n} 年ごと`.trim();
    case "week":
      return count === 1 ? "週額" : `${n} 週ごと`.trim();
    case "day":
      return count === 1 ? "日額" : `${n} 日ごと`.trim();
    default:
      return interval;
  }
}

function planNameFromPrice(price: Stripe.Price): string {
  if (price.nickname) {
    return price.nickname;
  }
  const product = price.product;
  if (product && typeof product === "object" && !product.deleted) {
    return product.name;
  }
  return price.id;
}

function descriptionFromPrice(price: Stripe.Price): string | null {
  const product = price.product;
  if (product && typeof product === "object" && !product.deleted) {
    return product.description;
  }
  return null;
}

/**
 * ダッシュボード上のアクティブな「定期課金」価格を列挙（Product 名・説明を展開）。
 */
export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const stripe = getStripe();
  const prices = await stripe.prices.list({
    active: true,
    type: "recurring",
    expand: ["data.product"],
    limit: 50,
  });

  const recurring = prices.data.filter(
    (p): p is Stripe.Price & { recurring: Stripe.Price.Recurring } =>
      Boolean(p.recurring),
  );
  recurring.sort(
    (a, b) => (a.unit_amount ?? 0) - (b.unit_amount ?? 0),
  );

  return recurring.map((price) => ({
    priceId: price.id,
    name: planNameFromPrice(price),
    description: descriptionFromPrice(price),
    amountLabel: formatStripeUnitAmount(price.unit_amount, price.currency),
    intervalLabel: intervalLabelJa(
      price.recurring.interval,
      price.recurring.interval_count,
    ),
  }));
}
