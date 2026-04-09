"use client";
// app/portal/admin/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

type Stats = {
  totalClients: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingTasks: number;
  newEnquiries: number;
  totalTranscripts: number;
};
type Client  = { id: string; name: string; email: string; plan: string; status: string; created_at: string; };
type Enquiry = { id: string; first_name: string; last_name: string; email: string; reason: string; created_at: string; status: string; };

const PLAN: Record<string, { bg: string; color: string }> = {
  starter:    { bg: "rgba(37,99,235,0.08)",  color: "#2563eb" },
  pro:        { bg: "rgba(124,58,237,0.08)", color: "#7c3aed" },
  enterprise: { bg: "rgba(5,150,105,0.08)",  color: "#059669" },
};
const ENQ_STATUS: Record<string, { bg: string; color: string }> = {
  new:       { bg: "rgba(37,99,235,0.08)",   color: "#2563eb" },
  contacted: { bg: "rgba(217,119,6,0.08)",   color: "#d97706" },
  converted: { bg: "rgba(5,150,105,0.08)",   color: "#059669" },
  closed:    { bg: "rgba(100,116,139,0.08)", color: "#64748b" },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboard() {
  const supabase = createClient();
  const router   = useRouter();

  const [stats,           setStats]           = useState<Stats>({ totalClients: 0, totalRevenue: 0, activeSubscriptions: 0, pendingTasks: 0, newEnquiries: 0, totalTranscripts: 0 });
  const [recentClients,   setRecentClients]   = useState<Client[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    (async () => {
      const [
        { data: clients },
        { data: invoices },
        { data: enquiries },
        { data: chatbot },
        { data: calls },
      ] = await Promise.all([
        supabase.from("clients").select("*").order("created_at", { ascending: false }),
        supabase.from("invoices").select("*"),
        supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("chatbot_transcripts").select("id"),
        supabase.from("call_transcripts").select("id"),
      ]);

      const totalRevenue       = invoices?.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0) ?? 0;
      const activeSubscriptions = clients?.filter(c => c.status === "active").length ?? 0;
      // pending tasks = pending invoices + new enquiries
      const pendingInvoices    = invoices?.filter(i => i.status === "pending").length ?? 0;
      const newEnquiries       = enquiries?.filter(e => e.status === "new").length ?? 0;
      const pendingTasks       = pendingInvoices + newEnquiries;

      setStats({
        totalClients:        clients?.length ?? 0,
        totalRevenue,
        activeSubscriptions,
        pendingTasks,
        newEnquiries,
        totalTranscripts: (chatbot?.length ?? 0) + (calls?.length ?? 0),
      });

      setRecentClients((clients ?? []).slice(0, 6));
      setRecentEnquiries((enquiries ?? []).slice(0, 5));
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 28, height: 28, border: "2px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#94a3b8", fontFamily: "Sora, sans-serif", fontSize: "0.85rem" }}>Loading dashboard…</p>
      </div>
    </div>
  );

  const statCards = [
    {
      label: "Total Clients",
      value: stats.totalClients,
      sub: `${stats.activeSubscriptions} active subscriptions`,
      icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
      from: "#2563eb", to: "#60a5fa", href: "/portal/admin/clients",
      trend: "+2 this month",
    },
    {
      label: "Total Revenue",
      value: `£${stats.totalRevenue.toLocaleString()}`,
      sub: "Paid invoices only",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      from: "#059669", to: "#34d399", href: "/portal/admin/invoices",
      trend: "View all invoices",
    },
    {
      label: "Active Subscriptions",
      value: stats.activeSubscriptions,
      sub: `of ${stats.totalClients} total clients`,
      icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
      from: "#7c3aed", to: "#a78bfa", href: "/portal/admin/clients",
      trend: "Recurring monthly",
    },
    {
      label: "Pending Tasks",
      value: stats.pendingTasks,
      sub: `${stats.newEnquiries} enquiries · invoices due`,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      from: "#d97706", to: "#fbbf24", href: "/portal/admin/enquiries",
      trend: "Needs attention",
    },
  ];

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* ── Welcome Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #0284c7 100%)",
        borderRadius: 20, padding: "26px 30px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: 120, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "Sora, sans-serif", fontSize: "0.68rem", fontWeight: 600, color: "rgba(147,197,253,0.8)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>
            {today}
          </div>
          <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.55rem", color: "white", margin: "0 0 5px", letterSpacing: "-0.02em" }}>
            {greeting()}, Admin 👋
          </h1>
          <p style={{ color: "rgba(148,163,184,0.85)", margin: 0, fontSize: "0.88rem", fontFamily: "Sora, sans-serif" }}>
            Here&apos;s your Zempotis business at a glance.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            {[
              { href: "/portal/admin/clients",  label: "Add Client",    primary: true },
              { href: "/portal/admin/invoices",  label: "New Invoice",   primary: false },
              { href: "/portal/admin/stripe",    label: "View Stripe",   primary: false },
              { href: "/portal/admin/activity",  label: "Activity Log",  primary: false },
            ].map(({ href, label, primary }) => (
              <a key={href} href={href} style={{
                display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none",
                background: primary ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${primary ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)"}`,
                color: primary ? "white" : "rgba(255,255,255,0.72)",
                borderRadius: 9, padding: "7px 14px",
                fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.8rem",
                transition: "background 0.15s",
              }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {statCards.map(({ label, value, sub, icon, from, to, href, trend }) => (
          <a key={label} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "white", borderRadius: 16, padding: "20px 20px 16px",
              border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 12px rgba(37,99,235,0.05)",
              transition: "all 0.18s", cursor: "pointer", height: "100%",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(37,99,235,0.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(37,99,235,0.05)"; }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: `linear-gradient(135deg, ${from}, ${to})`,
                  boxShadow: `0 4px 14px ${from}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon} />
                  </svg>
                </div>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.9rem", color: "#0f172a", lineHeight: 1 }}>{value}</div>
              <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "#0f172a", marginTop: 5 }}>{label}</div>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: 3, fontFamily: "Sora, sans-serif" }}>{sub}</div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(37,99,235,0.06)", fontSize: "0.68rem", color: from, fontFamily: "Sora, sans-serif", fontWeight: 600 }}>{trend}</div>
            </div>
          </a>
        ))}
      </div>

      {/* ── Two Column: Recent Clients + Recent Enquiries ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16 }}>

        {/* Recent Clients */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 14px rgba(37,99,235,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(37,99,235,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg,#f8faff,#f0f6ff)" }}>
            <div>
              <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#0f172a", margin: 0 }}>Recent Clients</h3>
              <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.68rem", color: "#94a3b8", margin: "2px 0 0" }}>Click any row to view full profile</p>
            </div>
            <a href="/portal/admin/clients" style={{ color: "#2563eb", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none", fontFamily: "Sora, sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
              All clients
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
          </div>
          <div>
            {recentClients.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem", fontFamily: "Sora, sans-serif" }}>
                No clients yet. <a href="/portal/admin/clients" style={{ color: "#2563eb", fontWeight: 600 }}>Add your first →</a>
              </div>
            ) : recentClients.map((client, i) => {
              const plan = PLAN[client.plan] ?? PLAN.starter;
              return (
                <div
                  key={client.id}
                  onClick={() => router.push(`/portal/admin/clients/${client.id}`)}
                  style={{ padding: "12px 20px", borderBottom: i < recentClients.length - 1 ? "1px solid rgba(37,99,235,0.05)" : "none", display: "flex", alignItems: "center", gap: 11, cursor: "pointer", transition: "background 0.12s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.02)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${plan.color}, ${plan.color}99)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.8rem" }}>
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.83rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{client.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{client.email}</div>
                  </div>
                  <span style={{ background: plan.bg, color: plan.color, fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "capitalize", fontFamily: "Sora, sans-serif", flexShrink: 0 }}>
                    {client.plan}
                  </span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 14px rgba(37,99,235,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(37,99,235,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg,#f8faff,#f0f6ff)" }}>
            <div>
              <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#0f172a", margin: 0 }}>Recent Enquiries</h3>
              <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.68rem", color: "#94a3b8", margin: "2px 0 0" }}>{stats.newEnquiries} new, awaiting reply</p>
            </div>
            <a href="/portal/admin/enquiries" style={{ color: "#2563eb", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none", fontFamily: "Sora, sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
              All enquiries
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
          </div>
          <div>
            {recentEnquiries.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem", fontFamily: "Sora, sans-serif" }}>No enquiries yet.</div>
            ) : recentEnquiries.map((enq, i) => {
              const s = ENQ_STATUS[enq.status] ?? ENQ_STATUS.new;
              return (
                <div
                  key={enq.id}
                  onClick={() => router.push("/portal/admin/enquiries")}
                  style={{ padding: "12px 20px", borderBottom: i < recentEnquiries.length - 1 ? "1px solid rgba(37,99,235,0.05)" : "none", display: "flex", alignItems: "center", gap: 11, cursor: "pointer", transition: "background 0.12s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.02)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "rgba(37,99,235,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.8rem" }}>
                    {enq.first_name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.83rem", color: "#0f172a" }}>{enq.first_name} {enq.last_name}</div>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{enq.reason}</div>
                  </div>
                  <span style={{ background: s.bg, color: s.color, fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "capitalize", fontFamily: "Sora, sans-serif", flexShrink: 0 }}>
                    {enq.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Quick Nav ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {[
          { href: "/portal/admin/clients",     label: "Clients",      desc: "View & manage all",     icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: "#2563eb" },
          { href: "/portal/admin/stripe",       label: "Stripe",       desc: "Revenue & payouts",     icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", color: "#059669" },
          { href: "/portal/admin/calls",        label: "AI Calls",     desc: "Call handler & logs",   icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", color: "#7c3aed" },
          { href: "/portal/admin/activity",     label: "Activity",     desc: "Platform event log",    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "#d97706" },
        ].map(({ href, label, desc, icon, color }) => (
          <a key={href} href={href} style={{ textDecoration: "none" }}>
            <div style={{ background: "white", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 1px 8px rgba(37,99,235,0.04)", transition: "all 0.15s", cursor: "pointer" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}33`; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.07)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}10`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
              </div>
              <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.845rem", color: "#0f172a", marginBottom: 2 }}>{label}</div>
              <div style={{ fontFamily: "Sora, sans-serif", fontSize: "0.7rem", color: "#94a3b8" }}>{desc}</div>
            </div>
          </a>
        ))}
      </div>

    </div>
  );
}
