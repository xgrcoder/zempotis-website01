"use client";
// app/portal/admin/clients/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

type Client = {
  id: string; name: string; email: string; company: string;
  phone: string; website_url: string; plan: string; status: string; created_at: string;
};

const PLAN: Record<string, { bg: string; color: string }> = {
  starter:    { bg: "rgba(37,99,235,0.08)",  color: "#2563eb" },
  pro:        { bg: "rgba(124,58,237,0.08)", color: "#7c3aed" },
  enterprise: { bg: "rgba(5,150,105,0.08)",  color: "#059669" },
};
const STATUS: Record<string, { bg: string; color: string; dot: string }> = {
  active:   { bg: "rgba(5,150,105,0.08)",   color: "#059669", dot: "#10b981" },
  inactive: { bg: "rgba(100,116,139,0.08)", color: "#64748b", dot: "#94a3b8" },
  pending:  { bg: "rgba(217,119,6,0.08)",   color: "#d97706", dot: "#f59e0b" },
};

const PAGE_SIZE = 10;

export default function AdminClients() {
  const supabase = createClient();
  const router   = useRouter();

  const [clients,     setClients]     = useState<Client[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [search,      setSearch]      = useState("");
  const [filterPlan,  setFilterPlan]  = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page,        setPage]        = useState(1);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", company: "", phone: "", website_url: "", plan: "starter", status: "active",
  });

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleAdd = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from("clients").insert([form]);
    // log activity
    await supabase.from("activity_log").insert([{
      event_type: "client_signup",
      title: `New client added: ${form.name}`,
      description: `${form.company || form.email} — ${form.plan} plan`,
      metadata: { plan: form.plan, status: form.status },
    }]);
    setSaving(false);
    setShowModal(false);
    setForm({ name: "", email: "", company: "", phone: "", website_url: "", plan: "starter", status: "active" });
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("clients").delete().eq("id", id);
    setDeleteId(null);
    fetchClients();
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
    const matchPlan   = filterPlan   === "all" || c.plan   === filterPlan;
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeCount = clients.filter(c => c.status === "active").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.65rem", margin: "0 0 4px", color: "#0f172a" }}>Clients</h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.845rem", fontFamily: "Sora, sans-serif" }}>
            {clients.length} total · {activeCount} active
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", fontSize: "0.85rem" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Client
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 340 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            className="form-input"
            placeholder="Search name, email, company, phone…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Plan filter */}
        <div style={{ display: "flex", gap: 3, background: "#e8edf6", borderRadius: 9, padding: 3, flexShrink: 0 }}>
          {["all", "starter", "pro", "enterprise"].map(p => (
            <button key={p} onClick={() => { setFilterPlan(p); setPage(1); }} style={{
              padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
              fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.73rem",
              background: filterPlan === p ? "white" : "transparent",
              color: filterPlan === p ? "#1d4ed8" : "#7c8db5",
              boxShadow: filterPlan === p ? "0 1px 6px rgba(37,99,235,0.12)" : "none",
              textTransform: "capitalize", transition: "all 0.12s",
            }}>
              {p}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: "flex", gap: 3, background: "#e8edf6", borderRadius: 9, padding: 3, flexShrink: 0 }}>
          {["all", "active", "pending", "inactive"].map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }} style={{
              padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer",
              fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.73rem",
              background: filterStatus === s ? "white" : "transparent",
              color: filterStatus === s ? "#1d4ed8" : "#7c8db5",
              boxShadow: filterStatus === s ? "0 1px 6px rgba(37,99,235,0.12)" : "none",
              textTransform: "capitalize", transition: "all 0.12s",
            }}>
              {s}
            </button>
          ))}
        </div>

        {(search || filterPlan !== "all" || filterStatus !== "all") && (
          <button onClick={() => { setSearch(""); setFilterPlan("all"); setFilterStatus("all"); setPage(1); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.8rem", fontFamily: "Sora, sans-serif", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(37,99,235,0.08)", boxShadow: "0 2px 16px rgba(37,99,235,0.05)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#f8faff,#f0f6ff)", borderBottom: "1px solid rgba(37,99,235,0.07)" }}>
                {["Client / Business", "Website", "Phone", "Plan", "Status", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.65rem", color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontFamily: "Sora, sans-serif" }}>Loading…</td></tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "4rem", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 12 }}>👥</div>
                    <p style={{ color: "#94a3b8", fontFamily: "Sora, sans-serif", fontSize: "0.875rem" }}>No clients found.</p>
                  </td>
                </tr>
              ) : paginated.map((client, i) => {
                const plan   = PLAN[client.plan]     ?? PLAN.starter;
                const status = STATUS[client.status] ?? STATUS.inactive;
                return (
                  <tr
                    key={client.id}
                    style={{ borderBottom: i < paginated.length - 1 ? "1px solid rgba(37,99,235,0.05)" : "none", transition: "background 0.12s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.02)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    {/* Client / Business */}
                    <td style={{ padding: "13px 18px", cursor: "pointer" }} onClick={() => router.push(`/portal/admin/clients/${client.id}`)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                        <div style={{ width: 34, height: 34, background: `linear-gradient(135deg, ${plan.color}, ${plan.color}99)`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.83rem", flexShrink: 0 }}>
                          {client.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.845rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>{client.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>{client.company || client.email}</div>
                        </div>
                      </div>
                    </td>
                    {/* Website */}
                    <td style={{ padding: "13px 18px" }}>
                      {client.website_url ? (
                        <a href={client.website_url.startsWith("http") ? client.website_url : `https://${client.website_url}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: "0.78rem", fontFamily: "Sora, sans-serif", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                          onClick={e => e.stopPropagation()}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                          {client.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "").substring(0, 22)}
                        </a>
                      ) : (
                        <span style={{ color: "#cbd5e1", fontSize: "0.78rem" }}>—</span>
                      )}
                    </td>
                    {/* Phone */}
                    <td style={{ padding: "13px 18px", fontSize: "0.8rem", color: "#475569", fontFamily: "Sora, sans-serif", whiteSpace: "nowrap" }}>
                      {client.phone || <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>
                    {/* Plan */}
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{ background: plan.bg, color: plan.color, fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999, textTransform: "capitalize", fontFamily: "Sora, sans-serif" }}>
                        {client.plan}
                      </span>
                    </td>
                    {/* Status */}
                    <td style={{ padding: "13px 18px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: status.bg, color: status.color, fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999, textTransform: "capitalize", fontFamily: "Sora, sans-serif" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.dot, display: "block" }} />
                        {client.status}
                      </span>
                    </td>
                    {/* Joined */}
                    <td style={{ padding: "13px 18px", fontSize: "0.78rem", color: "#94a3b8", fontFamily: "Sora, sans-serif", whiteSpace: "nowrap" }}>
                      {new Date(client.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "13px 18px" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/portal/admin/clients/${client.id}`); }}
                          style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(37,99,235,0.2)", background: "rgba(37,99,235,0.05)", color: "#2563eb", fontFamily: "Sora, sans-serif", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                          View
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteId(client.id); }}
                          style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.05)", color: "#dc2626", fontFamily: "Sora, sans-serif", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(37,99,235,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#f8faff,#f0f6ff)" }}>
            <span style={{ fontFamily: "Sora, sans-serif", fontSize: "0.75rem", color: "#94a3b8" }}>
              Page {page} of {totalPages} · {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "5px 14px", borderRadius: 7, border: "1px solid rgba(37,99,235,0.15)", background: "white", color: page === 1 ? "#cbd5e1" : "#2563eb", fontFamily: "Sora, sans-serif", fontSize: "0.78rem", fontWeight: 600, cursor: page === 1 ? "default" : "pointer" }}>
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "5px 14px", borderRadius: 7, border: "1px solid rgba(37,99,235,0.15)", background: "white", color: page === totalPages ? "#cbd5e1" : "#2563eb", fontFamily: "Sora, sans-serif", fontSize: "0.78rem", fontWeight: 600, cursor: page === totalPages ? "default" : "pointer" }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "30px", width: "100%", maxWidth: "540px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", margin: 0 }}>Add New Client</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 6 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleAdd} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" placeholder="Jane Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" placeholder="jane@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                <div>
                  <label className="form-label">Business Name</label>
                  <input className="form-input" placeholder="Acme Ltd" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="+44 7700 000000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="form-label">Website URL</label>
                <input className="form-input" placeholder="https://www.example.com" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                <div>
                  <label className="form-label">Plan</label>
                  <select className="form-input" value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}>
                    <option value="starter">Starter — £299/mo</option>
                    <option value="pro">Pro — £699/mo</option>
                    <option value="enterprise">Enterprise — £1,499/mo</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1, justifyContent: "center", padding: "10px 16px", fontSize: "0.85rem" }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center", padding: "10px 16px", fontSize: "0.85rem" }}>
                  {saving ? "Saving…" : "Add Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", borderRadius: 18, padding: "28px", width: "100%", maxWidth: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(220,38,38,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </div>
            <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0f172a", marginBottom: 8 }}>Delete Client?</h3>
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.82rem", color: "#94a3b8", marginBottom: 20 }}>
              This will permanently delete the client and all associated data. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setDeleteId(null)} className="btn btn-outline" style={{ flex: 1, justifyContent: "center", padding: "10px 16px", fontSize: "0.85rem" }}>
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "none", background: "#dc2626", color: "white", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
