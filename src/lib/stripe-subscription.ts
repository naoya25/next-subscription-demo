import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

const ACCESS_STATUSES = new Set<Stripe.Subscription.Status>([
  "active",
  "trialing",
]);

/**
 * 都度 Stripe を参照し、顧客に「コンテンツ提供してよい」状態のサブスクがあるか。
 * DB のミラーを持たない方針用。
 */
export async function customerHasEligibleSubscription(
  stripeCustomerId: string,
): Promise<boolean> {
  const stripe = getStripe();
  const list = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    limit: 20,
  });
  return list.data.some((s) => ACCESS_STATUSES.has(s.status));
}
