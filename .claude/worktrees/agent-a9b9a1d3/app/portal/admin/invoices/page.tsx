"use client";
// app/portal/admin/invoices/page.tsx

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

type Invoice = {
  id: string;
  client_id: string;
  invoice_number: string | null;
  amount: number;
  status: string;
  due_date: string | null;
  description: string | null;
  created_at: string;
  clients?: { name: string; email: string } | null;
};
type Client = { id: string; name: string };

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  paid:    { bg: "rgba(5,150,105,0.08)",   color: "#059669", dot: "#10b981" },
  pending: { bg: "rgba(217,119,6,0.08)",   color: "#d97706", dot: "#f59e0b" },
  overdue: { bg: "rgba(220,38,38,0.08)",   color: "#dc2626", dot: "#ef4444" },
};

export default function AdminInvoices() {
  const supabase = createClient();

  const [invoices,   setInvoices]   = useState<Invoice[]>([]);
  const [clients,    setClients]    = useState<Client[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [sending,    setSending]    = useState<string | null>(null);
  const [sentIds,    setSentIds]    = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState("all");
  const [search,     setSearch]     = useState("");
  const [form, setForm] = useState({
    client_id: "", amount: "", description: "", status: "pending", due_date: "",
  });

  const fetchData = async () => {
    const [{ data: inv }, { data: cl }] = await Promise.all([
      supabase.from("invoices").select("*, clients(name, email)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name"),
    ]);
    setInvoices(inv ?? []);
    setClients(cl ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const nextNum = `INV-${String(invoices.length + 1).padStart(4, "0")}`;
    await supabase.from("invoices").insert([{
      ...form,
      amount: parseFloat(form.amount),
      invoice_number: nextNum,
    }]);
    await supabase.from("activity_log").insert([{
      event_type: "invoice_created",
      title: `Invoice created: ${nextNum}`,
      description: `£${form.amount} — ${form.description || "No description"}`,
      metadata: { amount: parseFloat(form.amount) },
    }]);
    setSaving(false);
    setShowModal(false);
    setForm({ client_id: "", amount: "", description: "", status: "pending", due_date: "" });
    fetchData();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("invoices").update({ status }).eq("id", id);
    if (status === "paid") {
      const inv = invoices.find(i => i.id === id);
      await supabase.from("activity_log").insert([{
        event_type: "payment_received",
        title: `Payment received: ${inv?.invoice_number ?? id}`,
        description: `£${inv?.amount ?? 0} from ${inv?.clients?.name ?? "client"}`,
        metadata: { invoice_id: id, amount: inv?.amount },
      }]);
    }
    fetchData();
  };

  const handleSend = async (invoiceId: string) => {
    setSending(invoiceId);
    try {
      const res  = await fetch("/api/admin/send-invoice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invoice_id: invoiceId }) });
      const json = await res.json();
      if (json.success) {
        setSentIds(prev => new Set([...prev, invoiceId]));
      } else {
        alert(`Failed to send: ${json.error}`);
      }
    } catch {
      alert("Network error — could not send invoice.");
    }
    setSending(null);
  };

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = (
      inv.clients?.name?.toLowerCase().includes(q) ||
      inv.description?.toLowerCase().includes(q) ||
      inv.invoice_number?.toLowerCase().includes(q)
    );
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPaid    = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.65rem", margin: "0 0 4px", color: "#0f172a" }}>Invoices</h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.845rem", fontFamily: "Sora, sans-serif" }}>{invoices.length} total invoices</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", fontSize: "0.85rem" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Invoice
        </button>
      </div>

      {/* Revenue Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "Total Paid",  value: totalPaid,    color: "#059669", from: "#059669", to: "#34d399", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Pending",     value: totalPending, color: "#d97706", from: "#d97706", to: "#fbbf24", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Overdue",     value: totalOverdue, color: "#dc2626", from: "#dc2626", to: "#f87171", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
        ].map(({ label, value, from, to, icon }) => (
          <div key={label} style={{ background: "white", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 12px rgba(37,99,235,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: `linear-gradient(135deg,${from},${to})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${from}44` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
              </div>
              <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "#475569" }}>{label}</div>
            </div>
            <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.9rem", color: "#0f172a", lineHeight: 1 }}>
              £{value.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="form-input" placeholder="Search client, description, ref…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 33 }} />
        </div>
        <div style={{ display: "flex", gap: 3, background: "#e8edf6", borderRadius: 9, padding: 3 }}>
          {["all", "pending", "paid", "overdue"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.73rem", background: filterStatus === s ? "white" : "transparent", color: filterStatus === s ? "#1d4ed8" : "#7c8db5", boxShadow: filterStatus === s ? "0 1px 6px rgba(37,99,235,0.12)" : "none", textTransform: "capitalize", transition: "all 0.12s" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(37,99,235,0.08)", boxShadow: "0 2px 16px rgba(37,99,235,0.05)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#f8faff,#f0f6ff)", borderBottom: "1px solid rgba(37,99,235,0.07)" }}>
                {["Ref", "Client", "Description", "Amount", "Due Date", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.65rem", color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontFamily: "Sora, sans-serif" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "4rem", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: 12 }}>🧾</div>
                  <p style={{ color: "#94a3b8", fontFamily: "Sora, sans-serif", fontSize: "0.875rem" }}>No invoices found.</p>
                </td></tr>
              ) : filtered.map((inv, i) => {
                const s = STATUS_STYLE[inv.status] ?? STATUS_STYLE.pending;
                const isSending = sending === inv.id;
                const wasSent   = sentIds.has(inv.id);
                return (
                  <tr key={inv.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(37,99,235,0.05)" : "none", transition: "background 0.12s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.02)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <td style={{ padding: "12px 18px", fontFamily: "Sora, sans-serif", fontSize: "0.78rem", color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {inv.invoice_number ?? `INV-${inv.id.substring(0, 8).toUpperCase()}`}
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.845rem", color: "#0f172a" }}>{inv.clients?.name ?? "—"}</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{inv.clients?.email}</div>
                    </td>
                    <td style={{ padding: "12px 18px", fontSize: "0.83rem", color: "#475569", fontFamily: "Sora, sans-serif", maxWidth: 200 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.description || "—"}</div>
                    </td>
                    <td style={{ padding: "12px 18px", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.92rem", color: "#0f172a", whiteSpace: "nowrap" }}>
                      £{inv.amount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: "#94a3b8", fontFamily: "Sora, sans-serif", whiteSpace: "nowrap" }}>
                      {inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, fontSize: "0.68rem", fontWeight: 700, padding: "3px 9px", borderRadius: 999, textTransform: "capitalize", fontFamily: "Sora, sans-serif" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "nowrap" }}>
                        {/* Send via email */}
                        <button
                          onClick={() => handleSend(inv.id)}
                          disabled={isSending || wasSent || !inv.clients?.email}
                          title={!inv.clients?.email ? "No client email" : wasSent ? "Invoice sent" : "Send via email"}
                          style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid rgba(37,99,235,0.2)", background: wasSent ? "rgba(5,150,105,0.08)" : "rgba(37,99,235,0.06)", color: wasSent ? "#059669" : "#2563eb", fontFamily: "Sora, sans-serif", fontSize: "0.7rem", fontWeight: 600, cursor: isSending || wasSent || !inv.clients?.email ? "default" : "pointer", opacity: !inv.clients?.email ? 0.4 : 1, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
                        >
                          {isSending ? (
                            <>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 0.7s linear infinite" }}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                              Sending…
                            </>
                          ) : wasSent ? (
                            <>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                              Sent
                            </>
                          ) : (
                            <>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                              Send
                            </>
                          )}
                        </button>
                        {/* Status change */}
                        <select
                          value={inv.status}
                          onChange={e => updateStatus(inv.id, e.target.value)}
                          style={{ fontSize: "0.72rem", padding: "4px 8px", borderRadius: 7, border: "1px solid rgba(37,99,235,0.15)", fontFamily: "Sora, sans-serif", cursor: "pointer", color: "#334155", background: "white" }}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </div>
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "28px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", margin: 0 }}>New Invoice</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="form-label">Client *</label>
                <select className="form-input" value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} required>
                  <option value="">Select client…</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="form-label">Amount (£) *</label>
                  <input className="form-input" type="number" min="0" step="0.01" placeholder="299.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Due Date</label>
                  <input className="form-input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="e.g. Pro Plan — April 2026" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1, justifyContent: "center", padding: "10px 16px", fontSize: "0.85rem" }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center", padding: "10px 16px", fontSize: "0.85rem" }}>
                  {saving ? "Creating…" : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
