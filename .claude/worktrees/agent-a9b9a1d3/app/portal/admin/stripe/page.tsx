"use client";
// app/portal/admin/stripe/page.tsx

import { useEffect, useState } from "react";

type StripeBalance = { available: number; pending: number; currency: string };
type StripeCharge  = { id: string; amount: number; currency: string; status: string; description: string; created: number; receipt_url: string | null; };
type StripePayout  = { id: string; amount: number; currency: string; status: string; arrival_date: number; description: string; };

type StripeData = {
  balance: StripeBalance;
  charges: StripeCharge[];
  payouts: StripePayout[];
};

const CHARGE_STATUS: Record<string, { bg: string; color: string }> = {
  succeeded: { bg: "rgba(5,150,105,0.08)",   color: "#059669" },
  pending:   { bg: "rgba(217,119,6,0.08)",   color: "#d97706" },
  failed:    { bg: "rgba(220,38,38,0.08)",   color: "#dc2626" },
};
const PAYOUT_STATUS: Record<string, { bg: string; color: string; dot: string }> = {
  paid:        { bg: "rgba(5,150,105,0.08)",   color: "#059669", dot: "#10b981" },
  pending:     { bg: "rgba(217,119,6,0.08)",   color: "#d97706", dot: "#f59e0b" },
  in_transit:  { bg: "rgba(37,99,235,0.08)",   color: "#2563eb", dot: "#3b82f6" },
  failed:      { bg: "rgba(220,38,38,0.08)",   color: "#dc2626", dot: "#ef4444" },
  canceled:    { bg: "rgba(100,116,139,0.08)", color: "#64748b", dot: "#94a3b8" },
};

function fmt(amount: number, currency = "gbp"): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: currency.toUpperCase() }).format(amount);
}

export default function AdminStripe() {
  const [data,        setData]        = useState<StripeData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [connecting,  setConnecting]  = useState(false);
  const [activeTab,   setActiveTab]   = useState<"transactions" | "payouts">("transactions");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stripe?action=overview");
      const json = await res.json();
      if (json.error === "stripe_not_configured") {
        setError("not_configured");
      } else if (json.error) {
        setError(json.error);
      } else {
        setData(json);
        setError(null);
      }
    } catch {
      setError("fetch_failed");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Step 1: create account
      const res1 = await fetch("/api/admin/stripe?action=create-account");
      const { account_id } = await res1.json();
      // Step 2: get onboarding link
      const res2 = await fetch(`/api/admin/stripe?action=connect-link&account_id=${account_id}`);
      const { url } = await res2.json();
      if (url) window.location.href = url;
    } catch {
      setConnecting(false);
    }
  };

  const totalRevenue = data?.charges.filter(c => c.status === "succeeded").reduce((s, c) => s + c.amount, 0) ?? 0;
  const pendingPayouts = data?.payouts.filter(p => p.status === "pending" || p.status === "in_transit").reduce((s, p) => s + p.amount, 0) ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.65rem", margin: "0 0 4px", color: "#0f172a" }}>Stripe</h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.845rem", fontFamily: "Sora, sans-serif" }}>
            Revenue, transactions &amp; UK bank payouts via Stripe Connect
          </p>
        </div>
        <button
          onClick={handleConnect}
          disabled={connecting}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#635bff,#7c69ff)", color: "white", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.85rem", cursor: connecting ? "default" : "pointer", boxShadow: "0 4px 16px rgba(99,91,255,0.35)", opacity: connecting ? 0.7 : 1 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          {connecting ? "Redirecting…" : "Connect UK Bank"}
        </button>
      </div>

      {/* Not configured warning */}
      {error === "not_configured" && (
        <div style={{ background: "rgba(217,119,6,0.07)", border: "1px solid rgba(217,119,6,0.2)", borderRadius: 14, padding: "18px 22px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#92400e", marginBottom: 6 }}>Stripe not configured</div>
              <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.82rem", color: "#b45309", margin: "0 0 10px" }}>
                Add your Stripe keys to <code style={{ background: "rgba(217,119,6,0.12)", padding: "1px 6px", borderRadius: 4 }}>.env.local</code> to enable this feature.
              </p>
              <div style={{ background: "rgba(217,119,6,0.1)", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: "0.78rem", color: "#92400e", lineHeight: 1.8 }}>
                STRIPE_SECRET_KEY=sk_live_...<br/>
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...<br/>
                NEXT_PUBLIC_BASE_URL=https://yourdomain.com
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Available Balance", value: data ? fmt(data.balance.available) : "—",    sub: "Ready to payout",         from: "#059669", to: "#34d399" },
          { label: "Pending Balance",   value: data ? fmt(data.balance.pending) : "—",      sub: "Processing",              from: "#d97706", to: "#fbbf24" },
          { label: "Total Revenue",     value: data ? fmt(totalRevenue) : "—",              sub: "Successful charges",      from: "#2563eb", to: "#60a5fa" },
          { label: "Pending Payouts",   value: data ? fmt(pendingPayouts) : "—",            sub: "In transit to bank",      from: "#7c3aed", to: "#a78bfa" },
        ].map(({ label, value, sub, from, to }) => (
          <div key={label} style={{ background: "white", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 12px rgba(37,99,235,0.05)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: `linear-gradient(135deg,${from},${to})`, marginBottom: 12, boxShadow: `0 0 8px ${from}66` }} />
            <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.65rem", color: "#0f172a", lineHeight: 1 }}>
              {loading ? <span style={{ display: "inline-block", width: 80, height: 28, background: "#f1f5f9", borderRadius: 6 }} /> : value}
            </div>
            <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.78rem", color: "#0f172a", marginTop: 5 }}>{label}</div>
            <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 2, fontFamily: "Sora, sans-serif" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs: Transactions / Payouts */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 14px rgba(37,99,235,0.05)", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(37,99,235,0.07)", background: "linear-gradient(135deg,#f8faff,#f0f6ff)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 3, background: "#e8edf6", borderRadius: 9, padding: 3 }}>
            {(["transactions", "payouts"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "6px 16px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.78rem", background: activeTab === t ? "white" : "transparent", color: activeTab === t ? "#1d4ed8" : "#7c8db5", boxShadow: activeTab === t ? "0 1px 6px rgba(37,99,235,0.12)" : "none", textTransform: "capitalize", transition: "all 0.12s" }}>
                {t === "transactions" ? "Transactions" : "Payouts"}
              </button>
            ))}
          </div>
          <button onClick={fetchData} style={{ background: "none", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 8, padding: "6px 12px", color: "#2563eb", fontFamily: "Sora, sans-serif", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
        </div>

        {activeTab === "transactions" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(37,99,235,0.06)" }}>
                  {["Description", "Amount", "Status", "Date", "Receipt"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.65rem", color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontFamily: "Sora, sans-serif" }}>Loading…</td></tr>
                ) : !data || data.charges.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 12 }}>💳</div>
                    <p style={{ color: "#94a3b8", fontFamily: "Sora, sans-serif", fontSize: "0.875rem" }}>No transactions yet.</p>
                  </td></tr>
                ) : data.charges.map((charge, i) => {
                  const s = CHARGE_STATUS[charge.status] ?? CHARGE_STATUS.pending;
                  return (
                    <tr key={charge.id} style={{ borderBottom: i < data.charges.length - 1 ? "1px solid rgba(37,99,235,0.05)" : "none" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.02)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      <td style={{ padding: "12px 18px", fontFamily: "Sora, sans-serif", fontSize: "0.83rem", color: "#334155", maxWidth: 240 }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{charge.description || charge.id}</div>
                      </td>
                      <td style={{ padding: "12px 18px", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>
                        {fmt(charge.amount, charge.currency)}
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ background: s.bg, color: s.color, fontSize: "0.68rem", fontWeight: 700, padding: "3px 9px", borderRadius: 999, textTransform: "capitalize", fontFamily: "Sora, sans-serif" }}>
                          {charge.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: "0.78rem", color: "#94a3b8", fontFamily: "Sora, sans-serif", whiteSpace: "nowrap" }}>
                        {new Date(charge.created * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        {charge.receipt_url ? (
                          <a href={charge.receipt_url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: "0.75rem", fontFamily: "Sora, sans-serif", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                            View
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                          </a>
                        ) : (
                          <span style={{ color: "#cbd5e1", fontSize: "0.75rem" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "payouts" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(37,99,235,0.06)" }}>
                  {["Description", "Amount", "Status", "Arrival Date"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.65rem", color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontFamily: "Sora, sans-serif" }}>Loading…</td></tr>
                ) : !data || data.payouts.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: "3rem", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 12 }}>🏦</div>
                    <p style={{ color: "#94a3b8", fontFamily: "Sora, sans-serif", fontSize: "0.875rem" }}>No payouts yet.</p>
                    <p style={{ color: "#c0cbdf", fontFamily: "Sora, sans-serif", fontSize: "0.78rem", marginTop: 4 }}>Connect a UK bank account to start receiving payouts.</p>
                  </td></tr>
                ) : data.payouts.map((payout, i) => {
                  const s = PAYOUT_STATUS[payout.status] ?? PAYOUT_STATUS.pending;
                  return (
                    <tr key={payout.id} style={{ borderBottom: i < data.payouts.length - 1 ? "1px solid rgba(37,99,235,0.05)" : "none" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.02)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      <td style={{ padding: "12px 18px", fontFamily: "Sora, sans-serif", fontSize: "0.83rem", color: "#334155" }}>{payout.description}</td>
                      <td style={{ padding: "12px 18px", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#0f172a" }}>
                        {fmt(payout.amount, payout.currency)}
                      </td>
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, fontSize: "0.68rem", fontWeight: 700, padding: "3px 9px", borderRadius: 999, textTransform: "capitalize", fontFamily: "Sora, sans-serif" }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
                          {payout.status.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: "0.78rem", color: "#94a3b8", fontFamily: "Sora, sans-serif", whiteSpace: "nowrap" }}>
                        {new Date(payout.arrival_date * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stripe Connect Info */}
      <div style={{ background: "linear-gradient(135deg,#1a1560,#2d27a0)", borderRadius: 16, padding: "24px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,91,255,0.4) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1rem", color: "white", margin: "0 0 6px" }}>Stripe Connect — UK Bank Account</h3>
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.82rem", color: "rgba(199,194,255,0.85)", margin: "0 0 14px", lineHeight: 1.6 }}>
              Connect your UK bank account to receive direct payouts from Stripe. Funds are transferred automatically on your chosen schedule. Stripe Connect Express is recommended for sole traders and limited companies.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={handleConnect} disabled={connecting} style={{ padding: "8px 18px", borderRadius: 9, border: "none", background: "white", color: "#1a1560", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: connecting ? "default" : "pointer", opacity: connecting ? 0.7 : 1 }}>
                {connecting ? "Redirecting…" : "Set up payouts"}
              </button>
              <a href="https://stripe.com/gb/connect" target="_blank" rel="noopener noreferrer" style={{ padding: "8px 18px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: "rgba(255,255,255,0.85)", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.82rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}>
                Learn more
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
