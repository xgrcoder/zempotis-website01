"use client";
// app/portal/dashboard/invoices/page.tsx

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useTheme } from "@/lib/theme-context";

type Invoice = {
  id: string; client_id: string; amount: number;
  status: string; due_date: string; description: string; created_at: string;
};

const STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  paid:    { bg: "rgba(5,150,105,0.08)",  text: "#059669", dot: "#10b981" },
  pending: { bg: "rgba(217,119,6,0.08)",  text: "#d97706", dot: "#f59e0b" },
  overdue: { bg: "rgba(220,38,38,0.08)",  text: "#dc2626", dot: "#ef4444" },
};

export default function ClientInvoices() {
  const supabase = createClient();
  const { isDark, card, text, muted, border, inputBg } = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [filter,   setFilter]   = useState<"all" | "pending" | "paid" | "overdue">("all");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: cl } = await supabase.from("clients").select("id").eq("email", user.email).single();
      if (!cl) return;
      const { data } = await supabase.from("invoices").select("*").eq("client_id", cl.id).order("created_at", { ascending: false });
      setInvoices(data ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = invoices.filter(i => filter === "all" ? true : i.status === filter);
  const totalPaid    = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  const summaryCards = [
    { label: "Total Paid",    value: totalPaid,    from: "#059669", to: "#34d399", icon: "M5 13l4 4L19 7" },
    { label: "Pending",       value: totalPending, from: "#d97706", to: "#fbbf24", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Overdue",       value: totalOverdue, from: "#dc2626", to: "#f87171", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
  ];

  const fmt = (ts: string) => new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>

      {/* ── Header ── */}
      <div>
        <div style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: muted, fontStyle: "italic", marginBottom: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Billing
        </div>
        <h1 style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.6rem", color: text }}>
          Invoices
        </h1>
        <p style={{ fontFamily: "DM Sans", fontSize: "0.875rem", color: muted, marginTop: 4 }}>
          {invoices.length} invoices · £{(totalPaid + totalPending + totalOverdue).toLocaleString()} total
        </p>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {summaryCards.map(({ label, value, from, to, icon }) => (
          <div key={label} style={{
            borderRadius: 16, background: card,
            border: `1px solid ${border}`,
            padding: "22px 24px",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center", gap: 16,
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 32px rgba(37,99,235,0.11)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(37,99,235,0.05)"; }}
          >
            <div style={{
              width: 50, height: 50, borderRadius: 14, flexShrink: 0,
              background: `linear-gradient(135deg,${from},${to})`,
              boxShadow: `0 4px 14px ${from}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon} />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.65rem", color: text, lineHeight: 1 }}>
                £{value.toLocaleString()}
              </div>
              <div style={{ fontFamily: "Sora", fontWeight: 600, fontSize: "0.8rem", color: muted, marginTop: 5 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter + table ── */}
      <div style={{ borderRadius: 16, background: card, border: `1px solid ${border}`, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>

        {/* Table toolbar */}
        <div style={{
          padding: "16px 24px", borderBottom: `1px solid ${border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: isDark ? "rgba(255,255,255,0.03)" : "linear-gradient(135deg,#f8faff,#f0f6ff)",
          flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.9rem", color: text }}>
            All Invoices
          </div>
          <div style={{ display: "flex", gap: 4, background: isDark ? "rgba(255,255,255,0.06)" : "#e8edf6", borderRadius: 10, padding: 3 }}>
            {(["all", "pending", "paid", "overdue"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "Sora", fontWeight: 600, fontSize: "0.75rem",
                transition: "all 0.14s",
                background: filter === f ? card : "transparent",
                color: filter === f ? "#1d4ed8" : muted,
                boxShadow: filter === f ? "0 1px 6px rgba(37,99,235,0.12)" : "none",
                textTransform: "capitalize",
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 140px 110px 120px 100px",
          padding: "11px 24px", borderBottom: `1px solid ${border}`,
          background: isDark ? "rgba(255,255,255,0.02)" : "#fafbff",
        }}>
          {["Description", "Amount", "Status", "Due Date", "Issued"].map(h => (
            <div key={h} style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.67rem", color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "56px", textAlign: "center", color: muted, fontFamily: "DM Sans" }}>Loading invoices…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "64px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 14 }}>💳</div>
            <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.95rem", color: muted }}>No invoices found</div>
          </div>
        ) : (
          filtered.map((inv, i) => {
            const c = STATUS[inv.status] ?? STATUS.pending;
            const isSelected = selected?.id === inv.id;
            return (
              <div
                key={inv.id}
                onClick={() => setSelected(isSelected ? null : inv)}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 140px 110px 120px 100px",
                  padding: "15px 24px", cursor: "pointer",
                  borderBottom: i < filtered.length - 1 ? `1px solid ${border}` : "none",
                  background: isSelected ? "rgba(37,99,235,0.06)" : card,
                  transition: "background 0.12s",
                  alignItems: "center",
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(37,99,235,0.018)"; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = card; }}
              >
                {/* Description */}
                <div>
                  <div style={{ fontFamily: "Sora", fontWeight: 600, fontSize: "0.875rem", color: text }}>{inv.description || "Invoice"}</div>
                  <div style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: muted, marginTop: 2, fontStyle: "italic" }}>#{inv.id.slice(0, 8).toUpperCase()}</div>
                </div>
                {/* Amount */}
                <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.05rem", color: text }}>
                  £{inv.amount.toLocaleString()}
                </div>
                {/* Status */}
                <div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontFamily: "Sora", fontSize: "0.72rem", fontWeight: 700, padding: "4px 11px", borderRadius: 999,
                    background: c.bg, color: c.text, textTransform: "capitalize",
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, display: "block" }} />
                    {inv.status}
                  </span>
                </div>
                {/* Due date */}
                <div style={{ fontFamily: "DM Sans", fontSize: "0.82rem", color: inv.status === "overdue" ? "#dc2626" : muted, fontWeight: inv.status === "overdue" ? 600 : 400 }}>
                  {inv.due_date ? fmt(inv.due_date) : "—"}
                </div>
                {/* Issued */}
                <div style={{ fontFamily: "DM Sans", fontSize: "0.82rem", color: muted }}>
                  {fmt(inv.created_at)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Invoice detail sheet ── */}
      {selected && (() => {
        const c = STATUS[selected.status] ?? STATUS.pending;
        return (
          <div style={{
            borderRadius: 18, background: card,
            border: `1px solid ${border}`,
            boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}>
            {/* Receipt header */}
            <div style={{
              background: "linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 50%,#0284c7 100%)",
              padding: "30px 36px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "2rem", color: "#fff" }}>
                    £{selected.amount.toLocaleString()}
                  </div>
                  <div style={{ fontFamily: "DM Sans", fontSize: "0.875rem", color: "rgba(255,255,255,0.65)", marginTop: 4, fontStyle: "italic" }}>
                    {selected.description || "Invoice"}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999,
                    padding: "6px 14px",
                    fontFamily: "Sora", fontWeight: 700, fontSize: "0.78rem", color: "#fff",
                    textTransform: "capitalize",
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, boxShadow: `0 0 8px ${c.dot}`, display: "block" }} />
                    {selected.status}
                  </span>
                  <button onClick={() => setSelected(null)} style={{
                    background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8, padding: "5px 14px", cursor: "pointer",
                    fontFamily: "Sora", fontWeight: 600, fontSize: "0.75rem", color: "rgba(255,255,255,0.7)",
                  }}>
                    Close ×
                  </button>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div style={{ padding: "28px 36px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px 32px" }}>
              {[
                { label: "Invoice ID",   value: `#${selected.id.slice(0, 8).toUpperCase()}` },
                { label: "Amount",       value: `£${selected.amount.toLocaleString()}` },
                { label: "Status",       value: selected.status.charAt(0).toUpperCase() + selected.status.slice(1) },
                { label: "Due Date",     value: selected.due_date ? new Date(selected.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                { label: "Issued",       value: new Date(selected.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
                { label: "Description",  value: selected.description || "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: "Sora", fontSize: "0.7rem", fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontFamily: "DM Sans", fontSize: "0.9rem", color: text, fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Footer CTA */}
            {selected.status !== "paid" && (
              <div style={{ padding: "0 36px 28px" }}>
                <div style={{ borderTop: `1px solid ${border}`, paddingTop: 20, display: "flex", justifyContent: "flex-end" }}>
                  <a href="mailto:hello@zempotis.com?subject=Invoice Query" style={{
                    display: "inline-block",
                    background: "linear-gradient(135deg,#2563eb,#0ea5e9)",
                    color: "#fff", borderRadius: 10, padding: "11px 24px",
                    fontFamily: "Sora", fontWeight: 700, fontSize: "0.875rem",
                    textDecoration: "none",
                    boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                  }}>
                    Query this invoice →
                  </a>
                </div>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}