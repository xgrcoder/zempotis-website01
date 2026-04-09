"use client";
// app/portal/dashboard/page.tsx

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { useTheme } from "@/lib/theme-context";

const F = "'IBM Plex Sans', system-ui, sans-serif";

interface Session {
  id: string;
  session_id: string;
  client_id: string;
  started_at: string;
  page_url: string;
}

interface PageView {
  id: string;
  client_id: string;
  page_url: string;
  visited_at: string;
  referrer: string;
}

function darkenColour(hex: string, pct: number): string {
  const clean = hex.replace("#", "");
  const n = parseInt(clean, 16);
  const r = Math.max(0, (n >> 16) - Math.round(2.55 * pct));
  const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(2.55 * pct));
  const b = Math.max(0, (n & 0xff) - Math.round(2.55 * pct));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function useCountUp(target: number, enabled: boolean): number {
  const [val, setVal] = useState(0);
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!enabled) return;
    setVal(0);
    if (target === 0) return;
    const steps = Math.ceil(800 / 16);
    let current = 0;
    rafRef.current = setInterval(() => {
      current += 1;
      setVal(Math.round(target * Math.min(current / steps, 1)));
      if (current >= steps) { setVal(target); if (rafRef.current) clearInterval(rafRef.current); }
    }, 16);
    return () => { if (rafRef.current) clearInterval(rafRef.current); };
  }, [target, enabled]);
  return val;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getPathLabel(url: string): string {
  try { return new URL(url).pathname || "/"; } catch { return url || "/"; }
}

// ── SVG Pie Chart ─────────────────────────────────────────────────────────────
function PieChart({ segments, size = 120, bgColor = "white" }: { segments: { value: number; color: string; label: string }[]; size?: number; bgColor?: string }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={size/2 - 6} fill="none" stroke="#e5e7eb" strokeWidth={12} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize="11" fill="#9ca3af" fontFamily={F}>No data</text>
    </svg>
  );
  const cx = size / 2, cy = size / 2, r = size / 2 - 10;
  let startAngle = -Math.PI / 2;
  const paths: React.ReactElement[] = [];
  segments.forEach((seg, i) => {
    if (seg.value === 0) return;
    const angle = (seg.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    paths.push(
      <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={seg.color} opacity="0.9" />
    );
    startAngle = endAngle;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r + 6} fill={bgColor} />
      {paths}
      <circle cx={cx} cy={cy} r={r * 0.52} fill={bgColor} />
    </svg>
  );
}

// ── Mini Calendar ─────────────────────────────────────────────────────────────
function MiniCalendar({ activeDates, accent }: { activeDates: Set<string>; accent: string }) {
  const [offset, setOffset] = useState(0);
  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const todayStr = today.toISOString().slice(0, 10);

  return (
    <div style={{ fontFamily: F }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button onClick={() => setOffset(o => o - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px 6px", borderRadius: 4, fontSize: "1rem" }}>‹</button>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>{monthName}</span>
        <button onClick={() => setOffset(o => o + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px 6px", borderRadius: 4, fontSize: "1rem" }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center" }}>
        {["M","T","W","T","F","S","S"].map((d, i) => (
          <div key={i} style={{ fontSize: "0.6rem", fontWeight: 600, color: "#9ca3af", padding: "2px 0" }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = ds === todayStr;
          const hasActivity = activeDates.has(ds);
          return (
            <div key={i} style={{
              fontSize: "0.68rem", fontWeight: isToday ? 700 : 400,
              color: isToday ? "#fff" : hasActivity ? accent : "#6b7280",
              background: isToday ? accent : hasActivity ? `${accent}15` : "transparent",
              borderRadius: "50%", width: 24, height: 24, lineHeight: "24px",
              margin: "0 auto", cursor: "default",
              boxShadow: isToday ? `0 2px 8px ${accent}50` : "none",
              position: "relative",
            }}>
              {day}
              {hasActivity && !isToday && (
                <span style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: accent, display: "block" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Collapsible Section ────────────────────────────────────────────────────────
function CollapsibleSection({ title, subtitle, children, defaultOpen = true, border, card, text, muted }: {
  title: string; subtitle?: string; children: React.ReactNode;
  defaultOpen?: boolean; border: string; card: string; text: string; muted: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: card, borderRadius: 10, border: `1px solid ${border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        fontFamily: F, textAlign: "left",
        borderBottom: open ? `1px solid ${border}` : "none",
      }}>
        <div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: text }}>{title}</div>
          {subtitle && <div style={{ fontSize: "0.72rem", color: muted, marginTop: 2 }}>{subtitle}</div>}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div style={{ padding: "18px 20px" }}>{children}</div>}
    </div>
  );
}

export default function OverviewPage() {
  const supabase = createClient();
  const { accent, card, text, muted, border } = useTheme();
  const [sessions, setSessions]           = useState<Session[]>([]);
  const [views, setViews]                 = useState<PageView[]>([]);
  const [name, setName]                   = useState("Client");
  const [clientId, setClientId]           = useState<string>("");
  const [loaded, setLoaded]               = useState(false);
  const [clock, setClock]                 = useState("");
  const [pendingInvoices, setPendingInvoices] = useState<Array<{ id: string; invoice_number: string | null; amount: number; due_date: string | null }>>([]);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const cid = user.user_metadata?.client_id as string;
      setClientId(cid);
      setName(user.user_metadata?.business_name || "Client");
      const { data: s } = await supabase.from("client_settings").select("display_name").eq("client_id", cid).single();
      if (s?.display_name) setName(s.display_name);
      const [{ data: sessData }, { data: viewData }, { data: invData }] = await Promise.all([
        supabase.from("chat_sessions").select("*").eq("client_id", cid).order("started_at", { ascending: false }),
        supabase.from("page_views").select("*").eq("client_id", cid).order("visited_at", { ascending: false }),
        supabase.from("invoices").select("id,invoice_number,amount,due_date").eq("client_id", cid).eq("status", "pending").order("due_date", { ascending: true }),
      ]);
      setSessions((sessData as Session[]) ?? []);
      setViews((viewData as PageView[]) ?? []);
      setPendingInvoices((invData as typeof pendingInvoices) ?? []);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!clientId) return;
    const ch1 = supabase.channel("rt-sessions").on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions", filter: `client_id=eq.${clientId}` },
      (payload) => { if (payload.eventType === "INSERT") setSessions(p => [payload.new as Session, ...p]); }).subscribe();
    const ch2 = supabase.channel("rt-views").on("postgres_changes", { event: "*", schema: "public", table: "page_views", filter: `client_id=eq.${clientId}` },
      (payload) => { if (payload.eventType === "INSERT") setViews(p => [payload.new as PageView, ...p]); }).subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, [clientId]);

  // ── Derived stats ─────────────────────────────────────────────
  const todayStr   = new Date().toISOString().slice(0, 10);
  const todaySess  = sessions.filter(s => s.started_at?.slice(0, 10) === todayStr);
  const todayViews = views.filter(v => v.visited_at?.slice(0, 10) === todayStr);
  const weekAgo    = new Date(Date.now() - 7 * 864e5);
  const prevWeekAgo= new Date(Date.now() - 14 * 864e5);
  const thisWeek   = sessions.filter(s => new Date(s.started_at) >= weekAgo);
  const lastWeek   = sessions.filter(s => new Date(s.started_at) >= prevWeekAgo && new Date(s.started_at) < weekAgo);
  const weekGrowth = lastWeek.length === 0 ? 100 : Math.round(((thisWeek.length - lastWeek.length) / lastWeek.length) * 100);

  const thisMonthSess = sessions.filter(s => {
    const d = new Date(s.started_at), now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const chartDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 864e5);
    const ds = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString("en-GB", { weekday: "short" }), ds, isToday: ds === todayStr,
      sessions: sessions.filter(s => s.started_at?.slice(0, 10) === ds).length,
      views: views.filter(v => v.visited_at?.slice(0, 10) === ds).length };
  });
  const maxChart = Math.max(...chartDays.map(d => Math.max(d.sessions, d.views)), 1);

  type FeedItem = { id: string; type: "chat" | "view"; label: string; path: string; time: string; };
  const feed: FeedItem[] = [
    ...sessions.slice(0, 20).map(s => ({ id: "s-" + s.id, type: "chat" as const, label: "Chat session", path: getPathLabel(s.page_url), time: s.started_at })),
    ...views.slice(0, 20).map(v => ({ id: "v-" + v.id, type: "view" as const, label: "Page view", path: getPathLabel(v.page_url), time: v.visited_at })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 12);

  // Pie chart: session distribution
  const pieSegments = [
    { value: todaySess.length,      color: accent,    label: "Today" },
    { value: thisWeek.length - todaySess.length, color: `${accent}88`, label: "This week" },
    { value: sessions.length - thisWeek.length, color: "#e5e7eb", label: "Older" },
  ];

  // Calendar: dates with activity
  const activeDates = new Set([
    ...sessions.map(s => s.started_at?.slice(0, 10)),
    ...views.map(v => v.visited_at?.slice(0, 10)),
  ].filter(Boolean) as string[]);

  const totalCount = useCountUp(sessions.length, loaded);
  const weekCount  = useCountUp(thisWeek.length, loaded);
  const viewCount  = useCountUp(todayViews.length, loaded);

  const accentLight = `${accent}12`;
  const accentDark  = darkenColour(accent, 10);

  const quickActions = [
    { href: "/portal/dashboard/transcripts", label: "Transcripts", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", color: "#7c3aed" },
    { href: "/portal/dashboard/analytics",   label: "Analytics",   icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "#0ea5e9" },
    { href: "/portal/dashboard/ai-overview", label: "AI Overview", icon: "M13 10V3L4 14h7v7l9-11h-7z", color: "#f59e0b" },
    { href: "/portal/dashboard/revenue",     label: "Revenue",     icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "#059669" },
  ];

  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.35;transform:scale(1.8)} }
        .pulse-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .qa-tile:hover { box-shadow:0 6px 20px rgba(0,0,0,0.1) !important; border-color:rgba(0,0,0,0.1) !important; transform:translateY(-2px); }
        .session-row:hover { background:rgba(0,0,0,0.015) !important; }
        .chart-bar { transition: height 0.6s cubic-bezier(.34,1.56,.64,1); }
        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .qa-grid   { grid-template-columns: 1fr 1fr !important; }
          .bottom-row { flex-direction: column !important; }
        }
        @media (max-width: 900px) {
          .chart-feed-row { flex-direction: column !important; }
          .feed-col       { flex: unset !important; width: 100% !important; }
          .calendar-pie-row { flex-direction: column !important; }
          .calendar-box, .pie-box { flex: unset !important; width: 100% !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18, fontFamily: F }}>

        {/* ── Pending Invoice Banner ── */}
        {pendingInvoices.length > 0 && (
          <div style={{ borderRadius: 12, padding: "14px 20px", background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.18)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e40af", fontFamily: F }}>
                  {pendingInvoices.length === 1 ? "You have 1 outstanding invoice" : `You have ${pendingInvoices.length} outstanding invoices`}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#3b82f6", fontFamily: F, marginTop: 2 }}>
                  {pendingInvoices.map(inv => {
                    const ref = inv.invoice_number ?? `INV-${inv.id.substring(0, 8).toUpperCase()}`;
                    const amt = `£${Number(inv.amount).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    const due = inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "on receipt";
                    return `${ref} · ${amt} due ${due}`;
                  }).join("  ·  ")}
                </div>
              </div>
            </div>
            <a href="/portal/dashboard/invoices" style={{ padding: "8px 18px", borderRadius: 8, background: "#2563eb", color: "#fff", fontSize: "0.78rem", fontWeight: 700, fontFamily: F, textDecoration: "none", flexShrink: 0, boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
              View Invoices →
            </a>
          </div>
        )}

        {/* ── Welcome Banner ── */}
        <div style={{
          borderRadius: 14, padding: "22px 28px",
          background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 60%, ${darkenColour(accent, 25)} 100%)`,
          boxShadow: `0 6px 28px ${accent}35`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 75% 50%, rgba(255,255,255,0.07) 0%, transparent 55%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, position: "relative" }}>
            <div>
              <div style={{ fontSize: "0.7rem", fontWeight: 500, color: "rgba(255,255,255,0.6)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>Welcome back</div>
              <h1 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#ffffff", margin: "0 0 6px", lineHeight: 1.2 }}>{name}</h1>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
                <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", display: "block" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#ffffff" }}>Chatbot Online</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.7rem", fontWeight: 300, color: "#ffffff", fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em", lineHeight: 1 }}>{clock}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginTop: 5 }}>
                {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Hero Stats ── */}
        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { label: "Total Conversations", value: totalCount, staticVal: null as string|null, sub: `${todaySess.length} today`, subColor: muted, iconGrad: `linear-gradient(135deg, ${accent}, ${accentDark})`, iconPath: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", borderColor: accent },
            { label: "This Week", value: weekCount, staticVal: null as string|null, sub: weekGrowth >= 0 ? `↑ ${weekGrowth}% vs last week` : `↓ ${Math.abs(weekGrowth)}% vs last week`, subColor: weekGrowth >= 0 ? "#059669" : "#dc2626", iconGrad: "linear-gradient(135deg, #7c3aed, #5b21b6)", iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", borderColor: "#7c3aed" },
            { label: "Page Views Today", value: viewCount, staticVal: null as string|null, sub: "visitors today", subColor: muted, iconGrad: "linear-gradient(135deg, #0ea5e9, #0284c7)", iconPath: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", borderColor: "#0ea5e9" },
            { label: "Chatbot Uptime", value: 0, staticVal: "99.9%", sub: "this month", subColor: muted, iconGrad: "linear-gradient(135deg, #059669, #047857)", iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", borderColor: "#059669" },
          ].map((stat, i) => (
            <div key={i} style={{ background: card, borderRadius: 10, padding: "16px 18px", borderLeft: `3px solid ${stat.borderColor}22`, border: `1px solid ${border}`, borderLeftWidth: 3, borderLeftColor: `${stat.borderColor}22`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: stat.iconGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={stat.iconPath} /></svg>
              </div>
              <div>
                <div style={{ fontSize: "1.7rem", fontWeight: 700, color: text, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{stat.staticVal ?? stat.value}</div>
                <div style={{ fontSize: "0.72rem", fontWeight: 500, color: muted, marginTop: 3 }}>{stat.label}</div>
              </div>
              <div style={{ fontSize: "0.72rem", fontWeight: 500, color: stat.subColor }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Chart + Feed Row ── */}
        <CollapsibleSection title="Weekly Activity" subtitle={`${thisWeek.length} conversations in the last 7 days`} border={border} card={card} text={text} muted={muted}>
          <div className="chart-feed-row" style={{ display: "flex", gap: 16 }}>
            {/* Bar chart */}
            <div style={{ flex: "1 1 0" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 110 }}>
                {chartDays.map(day => {
                  const vH = Math.round((day.views / maxChart) * 100);
                  const sH = Math.round((day.sessions / maxChart) * 100);
                  return (
                    <div key={day.ds} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 90, width: "100%" }}>
                        <div className="chart-bar" style={{ flex: 1, height: `${Math.max(vH, 3)}%`, background: accent, opacity: day.isToday ? 1 : 0.28, borderRadius: "3px 3px 0 0" }} />
                        <div className="chart-bar" style={{ flex: 1, height: `${Math.max(sH, 3)}%`, background: "#0ea5e9", opacity: day.isToday ? 1 : 0.28, borderRadius: "3px 3px 0 0" }} />
                      </div>
                      <div style={{ fontSize: "0.6rem", color: day.isToday ? accent : muted, fontWeight: day.isToday ? 700 : 400 }}>{day.label}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
                {[{ color: accent, label: "Page Views" }, { color: "#0ea5e9", label: "Sessions" }].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                    <span style={{ fontSize: "0.68rem", color: muted }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live feed */}
            <div className="feed-col" style={{ flex: "0 0 290px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: text }}>Live Activity</span>
                <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "block" }} />
              </div>
              {feed.length === 0 ? (
                <div style={{ color: muted, fontSize: "0.8rem", textAlign: "center", padding: "20px 0" }}>No activity yet</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", maxHeight: 200, overflowY: "auto" }}>
                  {feed.map((item, i) => (
                    <div key={item.id} className="session-row" style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: i < feed.length - 1 ? `1px solid ${border}` : "none" }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", marginTop: 4, flexShrink: 0, background: item.type === "chat" ? accent : "#7c3aed" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: item.type === "chat" ? accent : "#7c3aed" }}>{item.label}</span>
                          <span style={{ fontSize: "0.62rem", color: muted, flexShrink: 0 }}>{timeAgo(item.time)}</span>
                        </div>
                        <div style={{ fontSize: "0.68rem", color: muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.path}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>

        {/* ── Calendar + Pie Row ── */}
        <div className="calendar-pie-row" style={{ display: "flex", gap: 18 }}>
          {/* Mini Calendar */}
          <div className="calendar-box" style={{ flex: "0 0 260px", background: card, borderRadius: 10, border: `1px solid ${border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", padding: "18px 20px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: text, marginBottom: 2 }}>Activity Calendar</div>
            <div style={{ fontSize: "0.7rem", color: muted, marginBottom: 14 }}>Days with chatbot activity</div>
            <MiniCalendar activeDates={activeDates} accent={accent} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
                <span style={{ fontSize: "0.65rem", color: muted }}>Activity</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent, boxShadow: `0 0 4px ${accent}` }} />
                <span style={{ fontSize: "0.65rem", color: muted }}>Today</span>
              </div>
            </div>
          </div>

          {/* Pie Chart: session distribution */}
          <div className="pie-box" style={{ flex: "1 1 0", background: card, borderRadius: 10, border: `1px solid ${border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", padding: "18px 20px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: text, marginBottom: 2 }}>Conversation Distribution</div>
            <div style={{ fontSize: "0.7rem", color: muted, marginBottom: 16 }}>Sessions breakdown by time period</div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <PieChart segments={pieSegments} size={130} bgColor={card} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Today",     value: todaySess.length,                              color: accent },
                  { label: "This Week", value: Math.max(0, thisWeek.length - todaySess.length), color: `${accent}88` },
                  { label: "This Month",value: Math.max(0, thisMonthSess.length - thisWeek.length), color: "#d1d5db" },
                  { label: "All Time",  value: sessions.length,                               color: "#e5e7eb", isTotal: true },
                ].map(({ label, value, color, isTotal }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {!isTotal && <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />}
                    {isTotal  && <div style={{ width: 10, height: 10, borderRadius: 3, border: `1.5px solid #d1d5db`, flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.7rem", color: muted }}>{label}</div>
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: isTotal ? muted : text, lineHeight: 1.2 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Week growth card */}
          <div style={{ flex: "0 0 180px", background: card, borderRadius: 10, border: `1px solid ${border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)", padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Week on Week</div>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: weekGrowth >= 0 ? "#059669" : "#dc2626", lineHeight: 1 }}>
                {weekGrowth >= 0 ? "+" : ""}{weekGrowth}%
              </div>
              <div style={{ fontSize: "0.72rem", color: muted, marginTop: 4 }}>vs previous 7 days</div>
            </div>
            <div style={{ marginTop: 16, padding: "10px 12px", borderRadius: 8, background: weekGrowth >= 0 ? "rgba(5,150,105,0.06)" : "rgba(220,38,38,0.06)", border: `1px solid ${weekGrowth >= 0 ? "rgba(5,150,105,0.14)" : "rgba(220,38,38,0.14)"}` }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, color: weekGrowth >= 0 ? "#059669" : "#dc2626" }}>{thisWeek.length} this week</div>
              <div style={{ fontSize: "0.65rem", color: muted, marginTop: 1 }}>{lastWeek.length} last week</div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="qa-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {quickActions.map(qa => (
            <Link key={qa.href} href={qa.href} style={{ textDecoration: "none" }}>
              <div className="qa-tile" style={{ background: card, borderRadius: 10, padding: "14px 16px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "box-shadow 0.15s, border-color 0.15s, transform 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: `${qa.color}12`, border: `1px solid ${qa.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={qa.color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={qa.icon} /></svg>
                </div>
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: text }}>{qa.label}</div>
                  <div style={{ fontSize: "0.68rem", color: muted, marginTop: 1 }}>View →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Recent Conversations (collapsible) ── */}
        <CollapsibleSection title="Recent Conversations" subtitle={`${sessions.length} total sessions recorded`} border={border} card={card} text={text} muted={muted}>
          {sessions.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${accent}10`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <div style={{ fontSize: "0.82rem", fontWeight: 500, color: muted }}>No conversations yet</div>
              <div style={{ fontSize: "0.72rem", color: muted, marginTop: 4 }}>Sessions will appear here once your chatbot receives messages.</div>
            </div>
          ) : (
            <div>
              {sessions.slice(0, 8).map((s, i) => {
                let path = "/";
                try { path = new URL(s.page_url).pathname; } catch { path = s.page_url || "/"; }
                return (
                  <div key={s.id} className="session-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < Math.min(sessions.length, 8) - 1 ? `1px solid ${border}` : "none", transition: "background 0.1s" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 500, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        Session {(s.session_id ?? s.id).slice(0, 8)}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{path}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "0.68rem", color: muted }}>{timeAgo(s.started_at)}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ marginTop: 14, textAlign: "center" }}>
                <Link href="/portal/dashboard/transcripts" style={{ fontSize: "0.78rem", fontWeight: 600, color: accent, textDecoration: "none", padding: "7px 18px", background: accentLight, borderRadius: 6, display: "inline-block" }}>
                  View all conversations →
                </Link>
              </div>
            </div>
          )}
        </CollapsibleSection>

      </div>
    </>
  );
}
