"use client";
// app/portal/dashboard/layout.tsx

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { ThemeContext, getTokens, ACCENT } from "@/lib/theme-context";

const NAV = [
  { href: "/portal/dashboard",              label: "Overview",     icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/portal/dashboard/ai-overview",  label: "AI Overview",  icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { href: "/portal/dashboard/analytics",    label: "Analytics",    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/portal/dashboard/revenue",      label: "Revenue",      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/portal/dashboard/employees",    label: "Team",         icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/portal/dashboard/metadata",     label: "Metadata",     icon: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" },
  { href: "/portal/dashboard/transcripts",  label: "Transcripts",  icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { href: "/portal/dashboard/invoices",     label: "Invoices",     icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/portal/dashboard/settings",     label: "Settings",     icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const [name, setName]         = useState("Client");
  const [mob,  setMob]          = useState(false);
  const accent                  = ACCENT;
  const [darkMode, setDarkMode] = useState(false);
  const [plan, setPlan]         = useState("starter");
  const [clientId, setClientId] = useState("");

  type Notif = { id: string; type: string; title: string; message: string; read: boolean; created_at: string; invoice_id: string | null };
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [notifOpen, setNotifOpen]         = useState(false);
  const notifRef                          = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/portal/login");
      const cid = user.user_metadata?.client_id || "";
      setClientId(cid);
      setName(user.user_metadata?.business_name || "Client");
      const { data: s } = await supabase
        .from("client_settings")
        .select("display_name,colour_mode,plan")
        .eq("client_id", cid)
        .single();
      if (s?.display_name) setName(s.display_name);
      if (s?.colour_mode === "dark") setDarkMode(true);
      if (s?.plan) setPlan(s.plan);
      if (cid) {
        const { data: notifs } = await supabase
          .from("client_notifications")
          .select("*")
          .eq("client_id", cid)
          .order("created_at", { ascending: false })
          .limit(20);
        setNotifications((notifs as Notif[]) ?? []);
      }
    })();
  }, []);

  useEffect(() => {
    if (!clientId) return;
    const ch = supabase.channel("rt-notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "client_notifications", filter: `client_id=eq.${clientId}` },
        (payload) => { setNotifications(p => [payload.new as Notif, ...p]); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [clientId]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const currentPage = NAV.find(n => n.href === pathname);
  const isMetadata = pathname === "/portal/dashboard/metadata";
  const unreadCount = notifications.filter(n => !n.read).length;

  async function openNotifications() {
    setNotifOpen(v => !v);
    if (unreadCount > 0) {
      setNotifications(p => p.map(n => ({ ...n, read: true })));
      await supabase.from("client_notifications").update({ read: true }).eq("client_id", clientId).eq("read", false);
    }
  }
  const F = "'IBM Plex Sans', system-ui, sans-serif";

  const dk      = darkMode;
  const bg      = dk ? "#13100e" : "#f7f8fa";
  const sidebar = dk ? "#1c1814" : "#ffffff";
  const topbar  = isMetadata ? "rgba(6,8,16,0.98)" : dk ? "rgba(19,16,14,0.96)" : "rgba(255,255,255,0.96)";
  const text    = dk ? "#f0ebe5" : "#0f172a";
  const muted   = dk ? "#8a7b71" : "#9ca3af";
  const border  = dk ? "rgba(255,210,170,0.08)" : "rgba(0,0,0,0.065)";
  const metaBorder = "rgba(0,255,128,0.15)";

  return (
    <ThemeContext.Provider value={getTokens(darkMode)}>
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-font-smoothing: antialiased; }
        body { font-family: 'IBM Plex Sans', system-ui, sans-serif; background: ${isMetadata ? "#060810" : bg}; color: ${isMetadata ? "#e2e8f0" : text}; transition: background 0.2s; }
        a { text-decoration: none; color: inherit; }

        .znav {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 10px; border-radius: 6px;
          font-size: 0.84rem; font-weight: 500;
          color: ${dk ? "#6b7280" : "#6b7280"};
          transition: color 0.1s, background 0.1s; cursor: pointer;
        }
        .znav:hover { color: ${dk ? "#e5e7eb" : "#111827"}; background: ${dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"}; }
        .znav.active { color: ${accent}; background: ${dk ? `${accent}14` : `${accent}0c`}; font-weight: 600; }
        .znav.active .pip { opacity: 1; }
        .znav .pip { width: 4px; height: 4px; border-radius: 50%; background: ${accent}; margin-left: auto; opacity: 0; transition: opacity 0.1s; flex-shrink: 0; }

        .znav-meta { color: rgba(0,255,128,0.5) !important; }
        .znav-meta:hover { color: #00ff80 !important; background: rgba(0,255,128,0.05) !important; }
        .znav-meta.active { color: #00ff80 !important; background: rgba(0,255,128,0.08) !important; font-family: 'IBM Plex Mono', monospace !important; }
        .znav-meta .pip { background: #00ff80 !important; }

        .zsignout {
          display: flex; align-items: center; gap: 9px;
          width: 100%; padding: 8px 10px; border-radius: 6px;
          border: none; background: none; cursor: pointer;
          font-size: 0.84rem; font-weight: 500; font-family: 'IBM Plex Sans', system-ui, sans-serif;
          color: ${dk ? "#6b7280" : "#9ca3af"};
          transition: color 0.1s, background 0.1s;
        }
        .zsignout:hover { color: #ef4444; background: rgba(239,68,68,0.05); }

        @keyframes pagein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .zpage { animation: pagein 0.2s ease both; }

        @keyframes live-blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.7)} }
        .live-dot { animation: live-blink 1.8s ease-in-out infinite; }
        @keyframes live-blink-meta { 0%,100%{opacity:1;box-shadow:0 0 6px #00ff80} 50%{opacity:0.3;box-shadow:0 0 18px #00ff80,0 0 30px rgba(0,255,128,0.4)} }
        .live-dot-meta { animation: live-blink-meta 1.4s ease-in-out infinite; }
        .zbadge-btn { display:flex;align-items:center;gap:9px;padding:8px 10px;margin-bottom:2px;width:100%;background:none;border:none;cursor:pointer;border-radius:6px;text-align:left;transition:background 0.12s; }
        .zbadge-btn:hover { background:${dk?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"}; }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${border}; border-radius: 3px; }

        .zbell { background:none;border:none;cursor:pointer;padding:5px;border-radius:6px;display:flex;align-items:center;justify-content:center;position:relative;transition:background 0.12s; }
        .zbell:hover { background:${dk?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.05)"}; }
        .znotif-dropdown { position:absolute;top:calc(100% + 8px);right:0;width:320px;background:${dk?"#221e1b":"#ffffff"};border:1px solid ${dk?"rgba(255,210,170,0.08)":"rgba(0,0,0,0.08)"};border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.18);z-index:200;overflow:hidden; }
        .znotif-item { padding:12px 16px;border-bottom:1px solid ${dk?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"};cursor:default;transition:background 0.1s; }
        .znotif-item:last-child { border-bottom:none; }
        .znotif-item:hover { background:${dk?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.025)"}; }

        .zham { display: none !important; background: none; border: none; cursor: pointer; color: ${isMetadata ? "rgba(0,255,128,0.6)" : muted}; padding: 6px; border-radius: 6px; align-items: center; }

        @media (max-width: 768px) {
          .zsidebar { transform: translateX(-248px); transition: transform 0.25s ease; }
          .zsidebar.open { transform: translateX(0); box-shadow: 8px 0 32px rgba(0,0,0,0.3) !important; }
          .zmain { margin-left: 0 !important; }
          .zham { display: flex !important; }
          .zoverlay-el { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 49; }
          .zmain-content { padding: 16px !important; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>

        {mob && <div className="zoverlay-el" onClick={() => setMob(false)} />}

        <aside className={`zsidebar${mob ? " open" : ""}`} style={{
          width: 240, flexShrink: 0,
          background: isMetadata ? "#0a0c14" : sidebar,
          borderRight: `1px solid ${isMetadata ? metaBorder : border}`,
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
          display: "flex", flexDirection: "column",
          overflowY: "auto", overflowX: "hidden",
          transition: "background 0.2s, border-color 0.2s",
        }}>

          <div style={{ padding: "20px 16px", borderBottom: `1px solid ${isMetadata ? metaBorder : border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: isMetadata ? "transparent" : accent,
                border: isMetadata ? "1px solid rgba(0,255,128,0.4)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: isMetadata ? "#00ff80" : "#fff", fontWeight: 700, fontSize: "0.8rem", fontFamily: isMetadata ? "'IBM Plex Mono', monospace" : F }}>Z</span>
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: isMetadata ? "#ffffff" : text, lineHeight: 1, fontFamily: isMetadata ? "'IBM Plex Mono', monospace" : F }}>
                  {isMetadata ? "ZEMPOTIS" : "Zempotis"}
                </div>
                <div style={{ fontSize: "0.62rem", color: isMetadata ? "rgba(0,255,128,0.5)" : muted, marginTop: 2, fontFamily: isMetadata ? "'IBM Plex Mono', monospace" : F, letterSpacing: isMetadata ? "0.08em" : 0 }}>
                  {isMetadata ? "INTEL_PORTAL" : "Client Portal"}
                </div>
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: "12px 8px" }}>
            <div style={{
              padding: "2px 8px 8px", fontSize: "0.6rem", fontWeight: 600,
              color: isMetadata ? "rgba(0,255,128,0.4)" : muted,
              letterSpacing: "0.12em", textTransform: "uppercase",
              fontFamily: isMetadata ? "'IBM Plex Mono', monospace" : F,
            }}>
              {isMetadata ? "NAVIGATION" : "Menu"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {NAV.map(({ href, label, icon }) => {
                const active = pathname === href;
                const isMeta = href === "/portal/dashboard/metadata";
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`znav${active ? " active" : ""}${isMeta ? " znav-meta" : ""}`}
                    onClick={() => setMob(false)}
                    style={isMeta ? { fontFamily: active ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', system-ui, sans-serif" } : {}}
                  >
                    <NavIcon d={icon} />
                    {isMeta && active ? label.toUpperCase() : label}
                    <span className="pip" />
                  </Link>
                );
              })}
            </div>
          </nav>

          <div style={{ padding: "10px 8px 16px", borderTop: `1px solid ${isMetadata ? metaBorder : border}` }}>
            <Link href="/portal/dashboard/plans" onClick={() => setMob(false)} className="zbadge-btn" title="View plans & upgrade"
              style={isMetadata ? { fontFamily: "'IBM Plex Mono', monospace" } : {}}>
              <div style={{
                width: 28, height: 28, borderRadius: isMetadata ? 3 : "50%", flexShrink: 0,
                background: isMetadata ? "rgba(0,255,128,0.08)" : `${accent}18`,
                border: isMetadata ? "1px solid rgba(0,255,128,0.2)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 600,
                color: isMetadata ? "#00ff80" : accent,
                fontFamily: isMetadata ? "'IBM Plex Mono', monospace" : F,
              }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: isMetadata ? "#e2e8f0" : text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: isMetadata ? "'IBM Plex Mono', monospace" : F, letterSpacing: isMetadata ? "0.03em" : 0 }}>
                  {isMetadata ? name.toUpperCase() : name}
                </div>
                <div style={{ fontSize: "0.62rem", color: isMetadata ? "rgba(0,255,128,0.4)" : muted, textTransform: "uppercase", marginTop: 1, fontFamily: isMetadata ? "'IBM Plex Mono', monospace" : F, letterSpacing: "0.06em" }}>
                  {plan} · <span style={{ opacity: 0.7 }}>view plans</span>
                </div>
              </div>
            </Link>
            <button className="zsignout" onClick={async () => { await supabase.auth.signOut(); router.push("/portal/login"); }}
              style={isMetadata ? { color: "rgba(0,255,128,0.4)", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.05em" } : {}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              {isMetadata ? "DISCONNECT" : "Sign out"}
            </button>
          </div>
        </aside>

        <div className="zmain" style={{ marginLeft: 240, flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <header style={{
            height: 54, padding: "0 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: topbar,
            borderBottom: `1px solid ${isMetadata ? metaBorder : border}`,
            position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(12px)",
            transition: "background 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="zham" onClick={() => setMob(v => !v)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <div>
                <div style={{
                  fontSize: "0.875rem", fontWeight: 600,
                  color: isMetadata ? "#ffffff" : text,
                  fontFamily: isMetadata ? "'IBM Plex Mono', monospace" : F,
                  letterSpacing: isMetadata ? "0.05em" : 0,
                }}>
                  {isMetadata ? (currentPage?.label ?? "METADATA").toUpperCase() : (currentPage?.label ?? "Dashboard")}
                </div>
                <div style={{
                  fontSize: "0.65rem", marginTop: 1,
                  color: isMetadata ? "rgba(0,255,128,0.5)" : muted,
                  fontFamily: isMetadata ? "'IBM Plex Mono', monospace" : F,
                  letterSpacing: isMetadata ? "0.08em" : 0,
                }}>
                  {isMetadata ? new Date().toISOString().slice(0, 10) + " // CLASSIFIED" : today}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isMetadata ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 3, background: "rgba(0,255,128,0.06)", border: "1px solid rgba(0,255,128,0.2)" }}>
                  <span className="live-dot-meta" style={{ width: 5, height: 5, borderRadius: "50%", background: "#00ff80", display: "block", boxShadow: "0 0 6px #00ff80" }} />
                  <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "#00ff80", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em" }}>LIVE</span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)" }}>
                  <span className="live-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", display: "block" }} />
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#10b981", fontFamily: F }}>Live</span>
                </div>
              )}
              <div style={{ width: 1, height: 16, background: isMetadata ? "rgba(0,255,128,0.15)" : border }} />

              {/* ── Notification Bell ── */}
              <div ref={notifRef} style={{ position: "relative" }}>
                <button className="zbell" onClick={openNotifications} title="Notifications"
                  style={{ color: isMetadata ? "rgba(0,255,128,0.6)" : muted }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span style={{
                      position: "absolute", top: 2, right: 2,
                      width: 16, height: 16, borderRadius: "50%",
                      background: "#ef4444", color: "#fff",
                      fontSize: "0.55rem", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: F, lineHeight: 1,
                      boxShadow: "0 1px 4px rgba(239,68,68,0.5)",
                    }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="znotif-dropdown">
                    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${dk ? "rgba(255,210,170,0.08)" : "rgba(0,0,0,0.06)"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: dk ? "#f0ebe5" : "#0f172a", fontFamily: F }}>Notifications</span>
                      {notifications.length > 0 && (
                        <span style={{ fontSize: "0.7rem", color: muted, fontFamily: F }}>{notifications.length} total</span>
                      )}
                    </div>
                    <div style={{ maxHeight: 320, overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: "24px 16px", textAlign: "center", color: muted, fontSize: "0.8rem", fontFamily: F }}>
                          No notifications yet
                        </div>
                      ) : notifications.map(n => (
                        <div key={n.id} className="znotif-item">
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: n.type === "invoice" ? "rgba(37,99,235,0.1)" : `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                              {n.type === "invoice" ? (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                              ) : (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: dk ? "#f0ebe5" : "#0f172a", fontFamily: F, lineHeight: 1.3 }}>{n.title}</div>
                              <div style={{ fontSize: "0.72rem", color: muted, fontFamily: F, marginTop: 2, lineHeight: 1.4 }}>{n.message}</div>
                              <div style={{ fontSize: "0.65rem", color: dk ? "rgba(240,235,229,0.3)" : "#cbd5e1", fontFamily: F, marginTop: 4 }}>
                                {new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {notifications.length > 0 && (
                      <div style={{ padding: "10px 16px", borderTop: `1px solid ${dk ? "rgba(255,210,170,0.08)" : "rgba(0,0,0,0.06)"}`, textAlign: "center" }}>
                        <a href="/portal/dashboard/invoices" style={{ fontSize: "0.75rem", fontWeight: 600, color: accent, fontFamily: F, textDecoration: "none" }}>
                          View all invoices →
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ width: 1, height: 16, background: isMetadata ? "rgba(0,255,128,0.15)" : border }} />
              <div style={{
                width: 30, height: 30,
                borderRadius: isMetadata ? 3 : "50%",
                background: isMetadata ? "rgba(0,255,128,0.08)" : `${accent}15`,
                border: isMetadata ? "1px solid rgba(0,255,128,0.25)" : `1px solid ${accent}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.68rem", fontWeight: 700,
                color: isMetadata ? "#00ff80" : accent,
                cursor: "pointer",
                fontFamily: isMetadata ? "'IBM Plex Mono', monospace" : F,
              }}>
                {name.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <main className="zpage zmain-content" style={{ padding: "24px 20px", flex: 1 }}>
            {children}
          </main>
        </div>
      </div>
    </>
    </ThemeContext.Provider>
  );
}
