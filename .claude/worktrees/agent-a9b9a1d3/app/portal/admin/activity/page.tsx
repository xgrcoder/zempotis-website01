"use client";
// app/portal/admin/activity/page.tsx

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-client";

type ActivityEvent = {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const EVENT_CONFIG: Record<string, { bg: string; color: string; icon: string; label: string }> = {
  client_signup:   { bg: "rgba(37,99,235,0.08)",   color: "#2563eb", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z", label: "New Client" },
  call_made:       { bg: "rgba(124,58,237,0.08)",  color: "#7c3aed", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", label: "Call Made" },
  payment_received: { bg: "rgba(5,150,105,0.08)",  color: "#059669", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Payment" },
  invoice_sent:    { bg: "rgba(14,165,233,0.08)",  color: "#0ea5e9", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Invoice Sent" },
  invoice_created: { bg: "rgba(217,119,6,0.08)",  color: "#d97706", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Invoice" },
  enquiry_new:     { bg: "rgba(236,72,153,0.08)",  color: "#ec4899", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Enquiry" },
  settings_updated: { bg: "rgba(100,116,139,0.08)", color: "#64748b", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", label: "Settings" },
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function AdminActivity() {
  const supabase = createClient();

  const [events,      setEvents]      = useState<ActivityEvent[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filterType,  setFilterType]  = useState("all");
  const [search,      setSearch]      = useState("");
  const [isLive,      setIsLive]      = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setEvents(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();

    // Real-time subscription
    const channel = supabase
      .channel("activity_log_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, payload => {
        setEvents(prev => [payload.new as ActivityEvent, ...prev].slice(0, 200));
      })
      .subscribe();
    channelRef.current = channel;

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = events.filter(ev => {
    const q = search.toLowerCase();
    const matchSearch = (
      ev.title?.toLowerCase().includes(q) ||
      ev.description?.toLowerCase().includes(q) ||
      ev.event_type?.toLowerCase().includes(q)
    );
    const matchType = filterType === "all" || ev.event_type === filterType;
    return matchSearch && matchType;
  });

  // Counts per type
  const typeCounts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] ?? 0) + 1;
    return acc;
  }, {});

  const today    = events.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString()).length;
  const payments = events.filter(e => e.event_type === "payment_received").length;
  const calls    = events.filter(e => e.event_type === "call_made").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.65rem", margin: "0 0 4px", color: "#0f172a" }}>Activity Log</h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.845rem", fontFamily: "Sora, sans-serif" }}>
            Real-time platform events — clients, calls, payments, invoices
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: isLive ? "rgba(5,150,105,0.07)" : "rgba(100,116,139,0.07)", borderRadius: 999, border: `1px solid ${isLive ? "rgba(5,150,105,0.2)" : "rgba(100,116,139,0.2)"}` }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: isLive ? "#10b981" : "#94a3b8", boxShadow: isLive ? "0 0 6px #10b981" : "none", display: "block" }} />
            <span style={{ fontFamily: "Sora, sans-serif", fontSize: "0.72rem", fontWeight: 700, color: isLive ? "#059669" : "#64748b" }}>{isLive ? "Live" : "Paused"}</span>
          </div>
          <button
            onClick={fetchEvents}
            style={{ background: "white", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 9, padding: "7px 14px", color: "#2563eb", fontFamily: "Sora, sans-serif", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total Events",    value: events.length,   sub: "All time",        from: "#2563eb", to: "#60a5fa" },
          { label: "Today",           value: today,           sub: "Events today",    from: "#059669", to: "#34d399" },
          { label: "Payments",        value: payments,        sub: "Received",        from: "#d97706", to: "#fbbf24" },
          { label: "AI Calls",        value: calls,           sub: "Logged",          from: "#7c3aed", to: "#a78bfa" },
        ].map(({ label, value, sub, from, to }) => (
          <div key={label} style={{ background: "white", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 10px rgba(37,99,235,0.04)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: `linear-gradient(135deg,${from},${to})`, marginBottom: 10 }} />
            <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "#0f172a", lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.78rem", color: "#0f172a", marginTop: 4 }}>{label}</div>
            <div style={{ fontSize: "0.67rem", color: "#94a3b8", marginTop: 2, fontFamily: "Sora, sans-serif" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 300 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="form-input" placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 33 }} />
        </div>
        <div style={{ display: "flex", gap: 3, background: "#e8edf6", borderRadius: 9, padding: 3, flexWrap: "wrap" }}>
          {[
            { value: "all",              label: "All" },
            { value: "client_signup",    label: "Clients" },
            { value: "call_made",        label: "Calls" },
            { value: "payment_received", label: "Payments" },
            { value: "invoice_sent",     label: "Invoices" },
          ].map(({ value, label }) => (
            <button key={value} onClick={() => setFilterType(value)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.73rem", background: filterType === value ? "white" : "transparent", color: filterType === value ? "#1d4ed8" : "#7c8db5", boxShadow: filterType === value ? "0 1px 6px rgba(37,99,235,0.12)" : "none", transition: "all 0.12s" }}>
              {label} {value !== "all" && typeCounts[value] ? `(${typeCounts[value]})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Event Table */}
      <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 14px rgba(37,99,235,0.05)", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(37,99,235,0.07)", background: "linear-gradient(135deg,#f8faff,#f0f6ff)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#0f172a", margin: 0 }}>Event Stream</h3>
            <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.68rem", color: "#94a3b8", margin: "2px 0 0" }}>{filtered.length} event{filtered.length !== 1 ? "s" : ""} · updates in real-time</p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontFamily: "Sora, sans-serif", fontSize: "0.875rem" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
            <p style={{ color: "#94a3b8", fontFamily: "Sora, sans-serif", fontSize: "0.875rem", marginBottom: 6 }}>No events yet.</p>
            <p style={{ color: "#c0cbdf", fontFamily: "Sora, sans-serif", fontSize: "0.78rem" }}>Events are logged automatically as you use the platform.</p>
          </div>
        ) : (
          <div>
            {filtered.map((ev, i) => {
              const cfg = EVENT_CONFIG[ev.event_type] ?? EVENT_CONFIG.settings_updated;
              return (
                <div
                  key={ev.id}
                  style={{ padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(37,99,235,0.05)" : "none", display: "flex", alignItems: "flex-start", gap: 14, transition: "background 0.12s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.015)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                >
                  {/* Icon */}
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: cfg.bg, border: `1px solid ${cfg.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={cfg.color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d={cfg.icon} />
                    </svg>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.855rem", color: "#0f172a" }}>{ev.title}</span>
                      <span style={{ background: cfg.bg, color: cfg.color, fontSize: "0.62rem", fontWeight: 700, padding: "1px 7px", borderRadius: 999, fontFamily: "Sora, sans-serif", flexShrink: 0 }}>
                        {cfg.label}
                      </span>
                    </div>
                    {ev.description && (
                      <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.78rem", color: "#64748b", margin: "3px 0 0" }}>{ev.description}</p>
                    )}
                  </div>

                  {/* Time */}
                  <div style={{ fontFamily: "Sora, sans-serif", fontSize: "0.72rem", color: "#94a3b8", flexShrink: 0, textAlign: "right" }}>
                    <div>{timeAgo(ev.created_at)}</div>
                    <div style={{ fontSize: "0.65rem", color: "#c0cbdf", marginTop: 2 }}>
                      {new Date(ev.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
