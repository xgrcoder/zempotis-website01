// app/api/admin/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") ?? "overview";

  try {
    const stripe = getStripe();

    if (action === "overview") {
      // Fetch balance, recent charges, and payouts
      const [balance, charges, payouts] = await Promise.all([
        stripe.balance.retrieve(),
        stripe.charges.list({ limit: 20 }),
        stripe.payouts.list({ limit: 10 }),
      ]);

      const availableGBP = balance.available.find(b => b.currency === "gbp")?.amount ?? 0;
      const pendingGBP   = balance.pending.find(b => b.currency === "gbp")?.amount   ?? 0;

      return NextResponse.json({
        balance: {
          available: availableGBP / 100,
          pending:   pendingGBP   / 100,
          currency:  "gbp",
        },
        charges: charges.data.map(c => ({
          id:          c.id,
          amount:      c.amount / 100,
          currency:    c.currency,
          status:      c.status,
          description: c.description ?? c.metadata?.description ?? "—",
          customer:    typeof c.customer === "string" ? c.customer : c.customer?.id ?? null,
          created:     c.created,
          receipt_url: c.receipt_url,
        })),
        payouts: payouts.data.map(p => ({
          id:          p.id,
          amount:      p.amount / 100,
          currency:    p.currency,
          status:      p.status,
          arrival_date: p.arrival_date,
          description: p.description ?? "Bank transfer",
        })),
      });
    }

    if (action === "connect-link") {
      // Create a Stripe Connect account link for onboarding
      const accountId = searchParams.get("account_id");
      if (!accountId) {
        return NextResponse.json({ error: "account_id required" }, { status: 400 });
      }
      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/portal/admin/stripe?refresh=1`,
        return_url:  `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/portal/admin/stripe?connected=1`,
        type: "account_onboarding",
      });
      return NextResponse.json({ url: link.url });
    }

    if (action === "create-account") {
      // Create a Stripe Connect Express account (UK bank)
      const account = await stripe.accounts.create({
        type: "express",
        country: "GB",
        capabilities: { transfers: { requested: true }, card_payments: { requested: true } },
      });
      return NextResponse.json({ account_id: account.id });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Stripe error";
    // If Stripe key is not configured, return a graceful response
    if (message.includes("STRIPE_SECRET_KEY")) {
      return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
    }
    console.error("Stripe API error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
