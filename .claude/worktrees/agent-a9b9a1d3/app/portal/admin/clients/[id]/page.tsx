"use client";
// app/portal/admin/clients/[id]/page.tsx

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";

type Client = {
  id: string; name: string; email: string; company: string;
  phone: string; plan: string; status: string; created_at: string;
};
type Invoice = {
  id: string; amount: number; status: string; due_date: string;
  description: string; created_at: string;
};
type Enquiry = {
  id: string; first_name: string; last_name: string; email: string;
  company: string; reason: string; message: string; budget: string;
  status: string; created_at: string;
};

const PLAN: Record<string, { bg: string; color: string; label: string }> = {
  starter:    { bg: "rgba(37,99,235,0.08)",  color: "#2563eb", label: "Starter" },
  pro:        { bg: "rgba(124,58,237,0.08)", color: "#7c3aed", label: "Pro" },
  enterprise: { bg: "rgba(5,150,105,0.08)",  color: "#059669", label: "Enterprise" },
};
const STATUS: Record<string, { bg: string; color: string; dot: string }> = {
  active:   { bg: "rgba(5,150,105,0.08)",   color: "#059669", dot: "#10b981" },
  pending:  { bg: "rgba(217,119,6,0.08)",   color: "#d97706", dot: "#f59e0b" },
  inactive: { bg: "rgba(100,116,139,0.08)", color: "#64748b", dot: "#94a3b8" },
};
const INV_STATUS: Record<string, { bg: string; color: string; dot: string }> = {
  paid:    { bg: "rgba(5,150,105,0.08)",   color: "#059669", dot: "#10b981" },
  pending: { bg: "rgba(217,119,6,0.08)",   color: "#d97706", dot: "#f59e0b" },
  overdue: { bg: "rgba(220,38,38,0.08)",   color: "#dc2626", dot: "#ef4444" },
};

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function ClientDetail() {
  const params  = useParams();
  const router  = useRouter();
  const supabase = createClient();
  const id = params?.id as string;

  const [client,    setClient]    = useState<Client | null>(null);
  const [invoices,  setInvoices]  = useState<Invoice[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "enquiries">("overview");

  const [editPlan,   setEditPlan]   = useState(false);
  const [editStatus, setEditStatus] = useState(false);

  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [savingInvoice,  setSavingInvoice]  = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ amount: "", description: "", due_date: "", status: "pending" });

  useEffect(() => { if (id) fetchAll(); }, [id]);

  async function fetchAll() {
    setLoading(true);
    const { data: cl } = await supabase.from("clients").select("*").eq("id", id).single();
    if (!cl) { router.push("/portal/admin/clients"); return; }
    setClient(cl);

    const [{ data: inv }, { data: enq }] = await Promise.all([
      supabase.from("invoices").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("enquiries").select("*").eq("email", cl.email).order("created_at", { ascending: false }),
    ]);
    setInvoices(inv ?? []);
    setEnquiries(enq ?? []);
    setLoading(false);
  }

  async function updateField(field: string, value: string) {
    await supabase.from("clients").update({ [field]: value }).eq("id", id);
    setClient(prev => prev ? { ...prev, [field]: value } : prev);
    setEditPlan(false);
    setEditStatus(false);
  }

  async function addInvoice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingInvoice(true);
    await supabase.from("invoices").insert([{
      client_id: id,
      amount: parseFloat(invoiceForm.amount),
      description: invoiceForm.description,
      due_date: invoiceForm.due_date || null,
      status: invoiceForm.status,
    }]);
    setSavingInvoice(false);
    setShowAddInvoice(false);
    setInvoiceForm({ amount: "", description: "", due_date: "", status: "pending" });
    fetchAll();
  }

  async function updateInvoiceStatus(invoiceId: string, status: string) {
    await supabase.from("invoices").update({ status }).eq("id", invoiceId);
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status } : i));
  }

  async function deleteClient() {
    if (!confirm(`Delete ${client?.name}? This cannot be undone.`)) return;
    await supabase.from("clients").delete().eq("id", id);
    router.push("/portal/admin/clients");
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#94a3b8", fontFamily: "Sora, sans-serif", fontSize: "0.85rem" }}>Loading client…</p>
      </div>
    </div>
  );
  if (!client) return null;

  const plan      = PLAN[client.plan]   ?? PLAN.starter;
  const statusC   = STATUS[client.status] ?? STATUS.inactive;
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPend = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/portal/admin/clients" style={{ display: "flex", alignItems: "center", gap: 4, color: "#94a3b8", fontFamily: "Sora, sans-serif", fontSize: "0.82rem" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Clients
        </Link>
        <span style={{ color: "#e2e8f0", fontSize: "0.82rem" }}>/</span>
        <span style={{ color: "#0f172a", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.82rem" }}>{client.name}</span>
      </div>

      {/* ── Client Profile Card ── */}
      <div style={{ background: "white", borderRadius: 18, border: "1px solid rgba(37,99,235,0.08)", boxShadow: "0 2px 20px rgba(37,99,235,0.06)", overflow: "hidden" }}>
        <div style={{ height: 5, background: `linear-gradient(90deg, ${plan.color}, ${plan.color}66)` }} />
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>

            {/* Avatar + info */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{
                width: 62, height: 62, borderRadius: 18, flexShrink: 0,
                background: `linear-gradient(135deg, ${plan.color}, ${plan.color}99)`,
                boxShadow: `0 6px 22px ${plan.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "white",
              }}>
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.45rem", color: "#0f172a", margin: "0 0 5px" }}>
                  {client.name}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                  <a href={`mailto:${client.email}`} style={{ fontFamily: "Sora, sans-serif", fontSize: "0.845rem", color: "#64748b", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    {client.email}
                  </a>
                  {client.company && <span style={{ color: "#94a3b8", fontSize: "0.845rem" }}>· {client.company}</span>}
                  {client.phone   && <span style={{ color: "#94a3b8", fontSize: "0.845rem" }}>· {client.phone}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {/* Plan — click to edit */}
                  {editPlan ? (
                    <select autoFocus value={client.plan} onChange={e => updateField("plan", e.target.value)} onBlur={() => setEditPlan(false)}
                      style={{ fontSize: "0.75rem", padding: "3px 8px", borderRadius: 999, border: "1px solid #cbd5e1", fontFamily: "Sora, sans-serif", cursor: "pointer" }}>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  ) : (
                    <button onClick={() => setEditPlan(true)} title="Click to change plan" style={{
                      background: plan.bg, color: plan.color, border: `1px solid ${plan.color}30`,
                      fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                      textTransform: "capitalize", fontFamily: "Sora, sans-serif", cursor: "pointer",
                    }}>
                      {plan.label}
                    </button>
                  )}
                  {/* Status — click to edit */}
                  {editStatus ? (
                    <select autoFocus value={client.status} onChange={e => updateField("status", e.target.value)} onBlur={() => setEditStatus(false)}
                      style={{ fontSize: "0.75rem", padding: "3px 8px", borderRadius: 999, border: "1px solid #cbd5e1", fontFamily: "Sora, sans-serif", cursor: "pointer" }}>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <button onClick={() => setEditStatus(true)} title="Click to change status" style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: statusC.bg, color: statusC.color, border: `1px solid ${statusC.color}30`,
                      fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                      textTransform: "capitalize", fontFamily: "Sora, sans-serif", cursor: "pointer",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusC.dot, display: "block" }} />
                      {client.status}
                    </button>
                  )}
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "Sora, sans-serif" }}>
                    Joined {fmt(client.created_at)}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#c7d2e0", fontFamily: "Sora, sans-serif" }}>· Click plan or status to edit</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`mailto:${client.email}?subject=Update from Zempotis`} style={{
                display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none",
                background: "#2563eb", color: "white", borderRadius: 10, padding: "9px 16px",
                fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.82rem",
                boxShadow: "0 2px 12px rgba(37,99,235,0.28)",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Email
              </a>
              <button onClick={deleteClient} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.14)",
                borderRadius: 10, padding: "9px 14px",
                fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
              }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total Paid",    value: `£${totalPaid.toLocaleString()}`, color: "#059669", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Outstanding",   value: `£${totalPend.toLocaleString()}`, color: "#d97706", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Total Invoices",value: invoices.length,                  color: "#2563eb", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
          { label: "Enquiries",     value: enquiries.length,                 color: "#7c3aed", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
        ].map(({ label, value, color, icon }) => (
          <div key={label} style={{
            background: "white", borderRadius: 14, padding: "18px 20px",
            border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 1px 10px rgba(37,99,235,0.04)",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: `${color}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
            </div>
            <div>
              <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#0f172a", lineHeight: 1 }}>{value}</div>
              <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 500, fontSize: "0.72rem", color: "#94a3b8", marginTop: 4 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 16px rgba(37,99,235,0.04)", overflow: "hidden" }}>

        {/* Tab bar */}
        <div style={{ borderBottom: "1px solid rgba(37,99,235,0.07)", padding: "0 24px", display: "flex", alignItems: "center", background: "linear-gradient(135deg,#f8faff,#f0f6ff)" }}>
          {([
            { id: "overview",   label: "Overview" },
            { id: "invoices",   label: `Invoices (${invoices.length})` },
            { id: "enquiries",  label: `Enquiries (${enquiries.length})` },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "13px 18px", border: "none", background: "none", cursor: "pointer",
              fontFamily: "Sora, sans-serif", fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: "0.875rem", color: activeTab === tab.id ? "#1d4ed8" : "#94a3b8",
              borderBottom: activeTab === tab.id ? "2px solid #2563eb" : "2px solid transparent",
              marginBottom: -1, transition: "all 0.12s",
            }}>
              {tab.label}
            </button>
          ))}
          {activeTab === "invoices" && (
            <button onClick={() => setShowAddInvoice(true)} style={{
              marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
              background: "#2563eb", color: "white", border: "none", borderRadius: 8,
              padding: "6px 14px", fontFamily: "Sora, sans-serif", fontWeight: 700,
              fontSize: "0.78rem", cursor: "pointer",
            }}>
              + Add Invoice
            </button>
          )}
        </div>

        <div style={{ padding: "24px" }}>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>

              {/* Recent Invoices */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.875rem", color: "#0f172a", margin: 0 }}>Recent Invoices</h3>
                  <button onClick={() => setActiveTab("invoices")} style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.75rem", fontFamily: "Sora, sans-serif", fontWeight: 600, cursor: "pointer" }}>View all →</button>
                </div>
                {invoices.length === 0 ? (
                  <div style={{ padding: "28px 0", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", fontFamily: "Sora, sans-serif", background: "rgba(37,99,235,0.02)", borderRadius: 10, border: "1px dashed rgba(37,99,235,0.12)" }}>
                    No invoices yet
                  </div>
                ) : invoices.slice(0, 4).map((inv, i) => {
                  const ic = INV_STATUS[inv.status] ?? INV_STATUS.pending;
                  return (
                    <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < Math.min(invoices.length, 4) - 1 ? "1px solid rgba(37,99,235,0.06)" : "none" }}>
                      <div>
                        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>{inv.description || "Invoice"}</div>
                        <div style={{ fontFamily: "Sora, sans-serif", fontSize: "0.7rem", color: "#94a3b8", marginTop: 2 }}>{fmt(inv.created_at)}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>£{inv.amount.toLocaleString()}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: ic.bg, color: ic.color, fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, fontFamily: "Sora, sans-serif", textTransform: "capitalize" }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: ic.dot, display: "block" }} />{inv.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Enquiries */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.875rem", color: "#0f172a", margin: 0 }}>Enquiries</h3>
                  <button onClick={() => setActiveTab("enquiries")} style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.75rem", fontFamily: "Sora, sans-serif", fontWeight: 600, cursor: "pointer" }}>View all →</button>
                </div>
                {enquiries.length === 0 ? (
                  <div style={{ padding: "28px 0", textAlign: "center", color: "#94a3b8", fontSize: "0.85rem", fontFamily: "Sora, sans-serif", background: "rgba(37,99,235,0.02)", borderRadius: 10, border: "1px dashed rgba(37,99,235,0.12)" }}>
                    No enquiries from {client.email}
                  </div>
                ) : enquiries.slice(0, 4).map((enq, i) => (
                  <div key={enq.id} style={{ padding: "12px 0", borderBottom: i < Math.min(enquiries.length, 4) - 1 ? "1px solid rgba(37,99,235,0.06)" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>{enq.reason}</div>
                      <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "Sora, sans-serif", whiteSpace: "nowrap", marginLeft: 8 }}>{fmt(enq.created_at)}</span>
                    </div>
                    <div style={{ fontFamily: "Sora, sans-serif", fontSize: "0.78rem", color: "#64748b", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {enq.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── INVOICES TAB ── */}
          {activeTab === "invoices" && (
            invoices.length === 0 ? (
              <div style={{ padding: "52px 0", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>💳</div>
                <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, color: "#475569", fontSize: "0.95rem" }}>No invoices yet</p>
                <button onClick={() => setShowAddInvoice(true)} style={{
                  marginTop: 14, background: "#2563eb", color: "white", border: "none", borderRadius: 10,
                  padding: "10px 20px", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
                }}>Add First Invoice</button>
              </div>
            ) : (
              <div style={{ border: "1px solid rgba(37,99,235,0.07)", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 130px 120px", padding: "10px 20px", background: "#fafbff", borderBottom: "1px solid rgba(37,99,235,0.07)" }}>
                  {["Description", "Amount", "Status", "Due Date", "Update"].map(h => (
                    <div key={h} style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.67rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
                  ))}
                </div>
                {invoices.map((inv, i) => {
                  const ic = INV_STATUS[inv.status] ?? INV_STATUS.pending;
                  return (
                    <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 130px 120px", padding: "14px 20px", alignItems: "center", borderBottom: i < invoices.length - 1 ? "1px solid rgba(37,99,235,0.05)" : "none", background: "white" }}>
                      <div>
                        <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "#0f172a" }}>{inv.description || "Invoice"}</div>
                        <div style={{ fontFamily: "Sora, sans-serif", fontSize: "0.67rem", color: "#94a3b8", marginTop: 2 }}>#{inv.id.slice(0, 8).toUpperCase()}</div>
                      </div>
                      <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "#0f172a" }}>£{inv.amount.toLocaleString()}</div>
                      <div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: ic.bg, color: ic.color, fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999, fontFamily: "Sora, sans-serif", textTransform: "capitalize" }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: ic.dot, display: "block" }} />{inv.status}
                        </span>
                      </div>
                      <div style={{ fontFamily: "Sora, sans-serif", fontSize: "0.82rem", color: "#64748b" }}>
                        {inv.due_date ? fmt(inv.due_date) : "—"}
                      </div>
                      <select value={inv.status} onChange={e => updateInvoiceStatus(inv.id, e.target.value)}
                        style={{ fontSize: "0.75rem", padding: "5px 8px", borderRadius: 8, border: "1px solid rgba(37,99,235,0.15)", fontFamily: "Sora, sans-serif", cursor: "pointer", color: "#0f172a", background: "white" }}>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── ENQUIRIES TAB ── */}
          {activeTab === "enquiries" && (
            enquiries.length === 0 ? (
              <div style={{ padding: "52px 0", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📬</div>
                <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, color: "#475569", fontSize: "0.95rem" }}>No enquiries found</p>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.82rem", color: "#94a3b8", marginTop: 6 }}>Matched by email: {client.email}</p>
              </div>
            ) : enquiries.map((enq, i) => (
              <div key={enq.id} style={{ padding: "20px 0", borderBottom: i < enquiries.length - 1 ? "1px solid rgba(37,99,235,0.06)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{enq.reason}</div>
                    {enq.budget && <div style={{ fontFamily: "Sora, sans-serif", fontSize: "0.72rem", color: "#94a3b8", marginTop: 3 }}>Budget: {enq.budget}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "Sora, sans-serif" }}>{fmt(enq.created_at)}</span>
                  </div>
                </div>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.85rem", color: "#475569", lineHeight: 1.7, margin: 0, background: "rgba(37,99,235,0.02)", borderRadius: 10, padding: "12px 16px", border: "1px solid rgba(37,99,235,0.07)" }}>
                  {enq.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Add Invoice Modal ── */}
      {showAddInvoice && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "32px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
            <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", marginBottom: 20 }}>Add Invoice — {client.name}</h2>
            <form onSubmit={addInvoice} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: 5 }}>Description</label>
                <input className="form-input" placeholder="e.g. Pro Plan — April 2026" value={invoiceForm.description} onChange={e => setInvoiceForm({ ...invoiceForm, description: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: 5 }}>Amount (£) *</label>
                  <input className="form-input" type="number" placeholder="699" value={invoiceForm.amount} onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: 5 }}>Due Date</label>
                  <input className="form-input" type="date" value={invoiceForm.due_date} onChange={e => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: 5 }}>Status</label>
                <select className="form-input" value={invoiceForm.status} onChange={e => setInvoiceForm({ ...invoiceForm, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => setShowAddInvoice(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(37,99,235,0.14)", background: "white", color: "#64748b", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingInvoice} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#2563eb", color: "white", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 2px 10px rgba(37,99,235,0.28)" }}>
                  {savingInvoice ? "Saving…" : "Add Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
