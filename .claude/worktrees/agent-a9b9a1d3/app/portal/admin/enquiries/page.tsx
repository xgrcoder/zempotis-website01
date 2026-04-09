"use client";
// app/portal/admin/enquiries/page.tsx

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

type Enquiry = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  reason: string;
  message: string;
  budget: string;
  status: string;
  created_at: string;
};

const statusOptions = ["new", "contacted", "converted", "closed"];
const statusColors: Record<string, { bg: string; color: string }> = {
  new:       { bg: "rgba(37,99,235,0.1)",  color: "#2563eb" },
  contacted: { bg: "rgba(217,119,6,0.1)",  color: "#d97706" },
  converted: { bg: "rgba(5,150,105,0.1)",  color: "#059669" },
  closed:    { bg: "rgba(100,116,139,0.1)", color: "#64748b" },
};

export default function AdminEnquiries() {
  const supabase = createClient();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Enquiry | null>(null);

  const fetchEnquiries = async () => {
    const { data } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false });
    setEnquiries(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchEnquiries(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("enquiries").update({ status }).eq("id", id);
    fetchEnquiries();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      <div>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.75rem", margin: "0 0 0.25rem" }}>Enquiries</h1>
        <p style={{ color: "var(--slate-500)", margin: 0, fontSize: "0.9rem" }}>{enquiries.filter(e => e.status === "new").length} new enquiries</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 400px" : "1fr", gap: "1.5rem" }}>

        {/* Table */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--off-white)", borderBottom: "1px solid var(--border)" }}>
                {["From", "Reason", "Budget", "Status", "Date"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "var(--slate-500)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--slate-400)" }}>Loading…</td></tr>
              ) : enquiries.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--slate-400)" }}>No enquiries yet.</td></tr>
              ) : enquiries.map((enq, i) => (
                <tr
                  key={enq.id}
                  onClick={() => setSelected(enq)}
                  style={{
                    borderBottom: i < enquiries.length - 1 ? "1px solid var(--border)" : "none",
                    cursor: "pointer",
                    background: selected?.id === enq.id ? "rgba(37,99,235,0.04)" : "white",
                    transition: "background 150ms",
                  }}
                >
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "var(--navy)" }}>
                      {enq.first_name} {enq.last_name}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--slate-500)" }}>{enq.email}</div>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--navy-700)", maxWidth: "200px" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{enq.reason}</div>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--slate-600)" }}>{enq.budget || "—"}</td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      background: statusColors[enq.status]?.bg,
                      color: statusColors[enq.status]?.color,
                      fontSize: "0.75rem", fontWeight: 700, padding: "4px 12px",
                      borderRadius: "999px", textTransform: "capitalize", fontFamily: "Sora, sans-serif",
                    }}>
                      {enq.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--slate-500)" }}>
                    {new Date(enq.created_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>Enquiry Detail</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", fontSize: "1.25rem", lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "Name",    value: `${selected.first_name} ${selected.last_name}` },
                { label: "Email",   value: selected.email },
                { label: "Company", value: selected.company || "—" },
                { label: "Reason",  value: selected.reason },
                { label: "Budget",  value: selected.budget || "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: "0.75rem", fontFamily: "Sora, sans-serif", fontWeight: 600, color: "var(--slate-500)", marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--navy)", fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", fontFamily: "Sora, sans-serif", fontWeight: 600, color: "var(--slate-500)", marginBottom: "6px" }}>Message</div>
              <div style={{ background: "var(--off-white)", borderRadius: "var(--radius-md)", padding: "1rem", fontSize: "0.875rem", color: "var(--navy-800)", lineHeight: 1.7, border: "1px solid var(--border)" }}>
                {selected.message}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.75rem", fontFamily: "Sora, sans-serif", fontWeight: 600, color: "var(--slate-500)", marginBottom: "6px" }}>Update Status</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {statusOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    style={{
                      padding: "6px 14px", borderRadius: "999px", cursor: "pointer",
                      fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.75rem",
                      border: "none", textTransform: "capitalize",
                      background: selected.status === s ? statusColors[s]?.color : statusColors[s]?.bg,
                      color: selected.status === s ? "white" : statusColors[s]?.color,
                      transition: "all 150ms",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <a
              href={`mailto:${selected.email}?subject=Re: Your Zempotis Enquiry`}
              className="btn btn-primary"
              style={{ justifyContent: "center", textDecoration: "none" }}
            >
              Reply via Email →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
