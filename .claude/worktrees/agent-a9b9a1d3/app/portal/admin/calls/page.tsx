"use client";
// app/portal/admin/calls/page.tsx

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

type Call = {
  id: string;
  assistant_name: string;
  phone_number: string | null;
  caller_number: string | null;
  duration_seconds: number;
  status: string;
  summary: string | null;
  transcript: string | null;
  recording_url: string | null;
  created_at: string;
  client_id: string | null;
  clients?: { name: string; company: string } | null;
};

type AssistantStats = {
  name: string;
  phone: string;
  totalCalls: number;
  successRate: number;
  avgDuration: number;
  lastCall: string | null;
};

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  completed:   { bg: "rgba(5,150,105,0.08)",   color: "#059669", dot: "#10b981" },
  "in-progress": { bg: "rgba(37,99,235,0.08)", color: "#2563eb", dot: "#3b82f6" },
  failed:      { bg: "rgba(220,38,38,0.08)",   color: "#dc2626", dot: "#ef4444" },
  "no-answer": { bg: "rgba(100,116,139,0.08)", color: "#64748b", dot: "#94a3b8" },
};

function fmtDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function AdminCalls() {
  const supabase = createClient();

  const [calls,        setCalls]        = useState<Call[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected,     setSelected]     = useState<Call | null>(null);
  const [assistants,   setAssistants]   = useState<AssistantStats[]>([]);

  const fetchCalls = async () => {
    const { data } = await supabase
      .from("calls")
      .select("*, clients(name, company)")
      .order("created_at", { ascending: false })
      .limit(200);
    const rows = data ?? [];
    setCalls(rows);

    // derive assistant stats
    const map: Record<string, { calls: Call[] }> = {};
    for (const c of rows) {
      const key = c.assistant_name;
      if (!map[key]) map[key] = { calls: [] };
      map[key].calls.push(c);
    }
    const stats: AssistantStats[] = Object.entries(map).map(([name, { calls: cs }]) => {
      const done     = cs.filter(c => c.status === "completed");
      const success  = cs.length ? Math.round((done.length / cs.length) * 100) : 0;
      const avgDur   = done.length ? Math.round(done.reduce((s, c) => s + (c.duration_seconds ?? 0), 0) / done.length) : 0;
      const lastCall = cs[0]?.created_at ?? null;
      const phone    = cs[0]?.phone_number ?? "—";
      return { name, phone, totalCalls: cs.length, successRate: success, avgDuration: avgDur, lastCall };
    });
    setAssistants(stats);
    setLoading(false);
  };

  useEffect(() => { fetchCalls(); }, []);

  const filtered = calls.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = (
      c.assistant_name?.toLowerCase().includes(q) ||
      c.phone_number?.toLowerCase().includes(q) ||
      c.caller_number?.toLowerCase().includes(q) ||
      c.clients?.name?.toLowerCase().includes(q)
    );
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalCalls   = calls.length;
  const successCalls = calls.filter(c => c.status === "completed").length;
  const successRate  = totalCalls ? Math.round((successCalls / totalCalls) * 100) : 0;
  const avgDuration  = successCalls
    ? Math.round(calls.filter(c => c.status === "completed").reduce((s, c) => s + (c.duration_seconds ?? 0), 0) / successCalls)
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.65rem", margin: "0 0 4px", color: "#0f172a" }}>AI Call Handler</h1>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.845rem", fontFamily: "Sora, sans-serif" }}>
          Vapi assistants linked to clients — call logs, success rates &amp; recordings
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total Calls",      value: totalCalls,                  sub: "All time",              from: "#2563eb", to: "#60a5fa", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
          { label: "Success Rate",     value: `${successRate}%`,           sub: `${successCalls} completed`, from: "#059669", to: "#34d399", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Avg Duration",     value: fmtDuration(avgDuration),    sub: "Completed calls",       from: "#7c3aed", to: "#a78bfa", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Active Assistants", value: assistants.length,          sub: "Unique assistants",     from: "#d97706", to: "#fbbf24", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2" },
        ].map(({ label, value, sub, from, to, icon }) => (
          <div key={label} style={{ background: "white", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 12px rgba(37,99,235,0.05)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg, ${from}, ${to})`, boxShadow: `0 4px 12px ${from}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
              </div>
            </div>
            <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#0f172a", lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.78rem", color: "#0f172a", marginTop: 4 }}>{label}</div>
            <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 2, fontFamily: "Sora, sans-serif" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Assistants Overview */}
      {assistants.length > 0 && (
        <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 14px rgba(37,99,235,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(37,99,235,0.07)", background: "linear-gradient(135deg,#f8faff,#f0f6ff)" }}>
            <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#0f172a", margin: 0 }}>Assistants Overview</h3>
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.68rem", color: "#94a3b8", margin: "2px 0 0" }}>Vapi assistants linked to client accounts</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(37,99,235,0.06)" }}>
                  {["Assistant Name", "Phone Number", "Total Calls", "Success Rate", "Avg Duration", "Last Call"].map(h => (
                    <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.65rem", color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assistants.map((a, i) => (
                  <tr key={a.name} style={{ borderBottom: i < assistants.length - 1 ? "1px solid rgba(37,99,235,0.05)" : "none" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.02)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-2"/></svg>
                        </div>
                        <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.845rem", color: "#0f172a" }}>{a.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 18px", fontFamily: "Sora, sans-serif", fontSize: "0.8rem", color: "#475569" }}>{a.phone}</td>
                    <td style={{ padding: "12px 18px", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{a.totalCalls}</td>
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden", maxWidth: 80 }}>
                          <div style={{ height: "100%", width: `${a.successRate}%`, background: a.successRate >= 70 ? "#10b981" : a.successRate >= 40 ? "#f59e0b" : "#ef4444", borderRadius: 3, transition: "width 0.3s" }} />
                        </div>
                        <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.8rem", color: a.successRate >= 70 ? "#059669" : a.successRate >= 40 ? "#d97706" : "#dc2626" }}>{a.successRate}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 18px", fontFamily: "Sora, sans-serif", fontSize: "0.8rem", color: "#475569" }}>{fmtDuration(a.avgDuration)}</td>
                    <td style={{ padding: "12px 18px", fontFamily: "Sora, sans-serif", fontSize: "0.78rem", color: "#94a3b8" }}>
                      {a.lastCall ? new Date(a.lastCall).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Call Log */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 14px rgba(37,99,235,0.05)", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(37,99,235,0.07)", background: "linear-gradient(135deg,#f8faff,#f0f6ff)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#0f172a", margin: 0 }}>Call Log</h3>
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.68rem", color: "#94a3b8", margin: "2px 0 0" }}>{filtered.length} call{filtered.length !== 1 ? "s" : ""} shown</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                placeholder="Search assistant, phone, client…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, borderRadius: 9, border: "1px solid rgba(37,99,235,0.15)", fontSize: "0.8rem", fontFamily: "Sora, sans-serif", color: "#0f172a", outline: "none", width: 220 }}
              />
            </div>
            <div style={{ display: "flex", gap: 3, background: "#e8edf6", borderRadius: 9, padding: 3 }}>
              {["all", "completed", "failed", "no-answer"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.7rem", background: filterStatus === s ? "white" : "transparent", color: filterStatus === s ? "#1d4ed8" : "#7c8db5", boxShadow: filterStatus === s ? "0 1px 6px rgba(37,99,235,0.12)" : "none", textTransform: "capitalize", transition: "all 0.12s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(37,99,235,0.06)" }}>
                {["Assistant", "Client", "Called Number", "Duration", "Status", "Date", ""].map(h => (
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
                <tr>
                  <td colSpan={7} style={{ padding: "4rem", textAlign: "center" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📞</div>
                    <p style={{ color: "#94a3b8", fontFamily: "Sora, sans-serif", fontSize: "0.875rem", marginBottom: 6 }}>No calls found.</p>
                    <p style={{ color: "#c0cbdf", fontFamily: "Sora, sans-serif", fontSize: "0.78rem" }}>Calls will appear here once the Vapi integration is active.</p>
                  </td>
                </tr>
              ) : filtered.map((call, i) => {
                const s = STATUS_STYLE[call.status] ?? STATUS_STYLE["no-answer"];
                return (
                  <tr key={call.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(37,99,235,0.05)" : "none", transition: "background 0.12s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.02)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <td style={{ padding: "12px 18px", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.83rem", color: "#0f172a" }}>{call.assistant_name}</td>
                    <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: "#475569", fontFamily: "Sora, sans-serif" }}>
                      {call.clients?.name ?? <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: "#475569", fontFamily: "Sora, sans-serif" }}>
                      {call.phone_number ?? call.caller_number ?? <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>
                    <td style={{ padding: "12px 18px", fontFamily: "Sora, sans-serif", fontSize: "0.8rem", color: "#475569" }}>
                      {fmtDuration(call.duration_seconds)}
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, fontSize: "0.68rem", fontWeight: 700, padding: "3px 9px", borderRadius: 999, textTransform: "capitalize", fontFamily: "Sora, sans-serif" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
                        {call.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 18px", fontSize: "0.78rem", color: "#94a3b8", fontFamily: "Sora, sans-serif", whiteSpace: "nowrap" }}>
                      {new Date(call.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      {(call.transcript || call.summary || call.recording_url) && (
                        <button
                          onClick={() => setSelected(call)}
                          style={{ padding: "4px 12px", borderRadius: 7, border: "1px solid rgba(37,99,235,0.2)", background: "rgba(37,99,235,0.05)", color: "#2563eb", fontFamily: "Sora, sans-serif", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call Detail Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", borderRadius: 20, padding: "28px", width: "100%", maxWidth: "600px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <h2 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0f172a", margin: 0 }}>{selected.assistant_name}</h2>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.72rem", color: "#94a3b8", margin: "3px 0 0" }}>
                  {new Date(selected.created_at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {fmtDuration(selected.duration_seconds)}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4, borderRadius: 6 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {selected.summary && (
              <div style={{ background: "rgba(37,99,235,0.05)", borderRadius: 12, padding: 16, marginBottom: 14, border: "1px solid rgba(37,99,235,0.1)" }}>
                <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Summary</div>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.845rem", color: "#334155", margin: 0, lineHeight: 1.6 }}>{selected.summary}</p>
              </div>
            )}
            {selected.transcript && (
              <div>
                <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Transcript</div>
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, maxHeight: 300, overflowY: "auto", fontFamily: "monospace", fontSize: "0.8rem", color: "#334155", lineHeight: 1.7, border: "1px solid rgba(37,99,235,0.06)", whiteSpace: "pre-wrap" }}>
                  {selected.transcript}
                </div>
              </div>
            )}
            {selected.recording_url && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Recording</div>
                <audio controls src={selected.recording_url} style={{ width: "100%", borderRadius: 8 }} />
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
