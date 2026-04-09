"use client";
// app/portal/admin/layout.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

const NAV_SECTIONS = [
  {
    label: "Core",
    items: [
      { href: "/portal/admin",             label: "Overview",      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      { href: "/portal/admin/clients",     label: "Clients",       icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
      { href: "/portal/admin/enquiries",   label: "Enquiries",     icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/portal/admin/invoices",    label: "Invoices",      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      { href: "/portal/admin/stripe",      label: "Stripe",        icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    ],
  },
  {
    label: "AI & Comms",
    items: [
      { href: "/portal/admin/calls",       label: "AI Calls",      icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
      { href: "/portal/admin/transcripts", label: "Transcripts",   icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/portal/admin/activity",    label: "Activity Log",  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
      { href: "/portal/admin/settings",    label: "Settings",      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
    ],
  },
];

// flat list for active detection
const ALL_NAV = NAV_SECTIONS.flatMap(s => s.items);

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();
  const [mob, setMob] = useState(false);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/portal/login");
    })();
  }, []);

  const currentLabel = ALL_NAV.find(n => n.href === pathname)?.label ?? "Admin";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f0f6ff; }
        a { text-decoration: none; }

        .znav { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 9px; border: 1px solid transparent; color: #7c8db5; font-family: 'Sora', sans-serif; font-size: 0.83rem; font-weight: 500; transition: all 0.15s ease; }
        .znav:hover { background: rgba(37,99,235,0.06); color: #2563eb; border-color: rgba(37,99,235,0.1); }
        .znav.active { background: linear-gradient(135deg,rgba(37,99,235,0.1),rgba(14,165,233,0.07)); color: #1d4ed8; border-color: rgba(37,99,235,0.18); font-weight: 600; }
        .znav.active .znavdot { opacity: 1; transform: scale(1); }
        .znavdot { width: 5px; height: 5px; border-radius: 50%; background: #2563eb; margin-left: auto; opacity: 0; transform: scale(0); transition: all 0.2s; }

        .zsignout { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border-radius: 9px; border: 1px solid transparent; background: transparent; cursor: pointer; color: #7c8db5; font-family: 'Sora', sans-serif; font-size: 0.83rem; font-weight: 500; transition: all 0.15s ease; }
        .zsignout:hover { background: rgba(220,38,38,0.06); color: #dc2626; border-color: rgba(220,38,38,0.12); }

        .znav-section { padding: 0 6px 6px; font-family: 'Sora', sans-serif; font-size: 0.6rem; font-weight: 700; color: #c0cbdf; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 6px; }

        @keyframes zfade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .zpage { animation: zfade 0.35s ease both; }

        .zham { display: none; background: none; border: none; cursor: pointer; color: #7c8db5; padding: 6px; border-radius: 8px; }
        .zoverlay { display: none; }
        @media (max-width: 768px) {
          .zsidebar { transform: translateX(-280px) !important; transition: transform 0.28s cubic-bezier(0.4,0,0.2,1) !important; }
          .zsidebar.open { transform: translateX(0) !important; }
          .zmain { margin-left: 0 !important; }
          .zham { display: flex; }
          .zoverlay { display: block; position: fixed; inset: 0; background: rgba(15,23,42,0.45); backdrop-filter: blur(3px); z-index: 49; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>

        {mob && <div className="zoverlay" onClick={() => setMob(false)} />}

        {/* ── Sidebar ── */}
        <aside className={`zsidebar${mob ? " open" : ""}`} style={{
          width: 260, flexShrink: 0,
          background: "white",
          borderRight: "1px solid rgba(37,99,235,0.08)",
          boxShadow: "4px 0 32px rgba(37,99,235,0.055)",
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
          display: "flex", flexDirection: "column",
          overflowX: "hidden", overflowY: "auto",
        }}>

          {/* Logo */}
          <div style={{ padding: "18px 18px 0", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg,#2563eb 0%,#0ea5e9 100%)",
                boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#fff", fontFamily: "Sora", fontWeight: 800, fontSize: "1rem" }}>Z</span>
              </div>
              <div>
                <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.92rem", color: "#0f172a", lineHeight: 1.2 }}>Zempotis</div>
                <div style={{ fontFamily: "Sora", fontSize: "0.65rem", color: "#94a3b8", letterSpacing: "0.02em" }}>Admin Portal</div>
              </div>
            </div>

            {/* Admin identity card */}
            <div style={{
              borderRadius: 12, padding: "12px 14px",
              background: "linear-gradient(135deg,#eff6ff 0%,#f0f9ff 100%)",
              border: "1px solid rgba(37,99,235,0.12)",
              marginBottom: 4, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -24, right: -24, width: 70, height: 70, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#2563eb 0%,#0ea5e9 100%)",
                  boxShadow: "0 3px 10px rgba(37,99,235,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Sora", fontWeight: 700, color: "#fff", fontSize: "0.95rem",
                }}>A</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "Sora", fontWeight: 600, fontSize: "0.84rem", color: "#0f172a" }}>Admin</div>
                  <span style={{ background: "rgba(37,99,235,0.12)", color: "#2563eb", fontFamily: "Sora", fontSize: "0.62rem", fontWeight: 700, padding: "1px 8px", borderRadius: 999, letterSpacing: "0.03em", textTransform: "uppercase" }}>
                    Super Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(37,99,235,0.1),transparent)", margin: "12px 0 8px", flexShrink: 0 }} />

          {/* Nav */}
          <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_SECTIONS.map((section, si) => (
              <div key={section.label}>
                <div className="znav-section" style={{ marginTop: si === 0 ? 0 : 8 }}>{section.label}</div>
                {section.items.map(({ href, label, icon }) => {
                  const active = pathname === href;
                  return (
                    <Link key={href} href={href} className={`znav${active ? " active" : ""}`} onClick={() => setMob(false)}>
                      <NavIcon d={icon} />
                      <span>{label}</span>
                      <span className="znavdot" />
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Divider */}
          <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(37,99,235,0.1),transparent)", margin: "10px 0", flexShrink: 0 }} />

          {/* Sign out */}
          <div style={{ padding: "0 10px 18px", flexShrink: 0 }}>
            <button className="zsignout" onClick={async () => { await supabase.auth.signOut(); router.push("/portal/login"); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="zmain" style={{ marginLeft: 260, flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

          {/* Topbar */}
          <header style={{
            height: 64, padding: "0 26px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(255,255,255,0.88)", backdropFilter: "blur(18px)",
            borderBottom: "1px solid rgba(37,99,235,0.07)",
            boxShadow: "0 1px 20px rgba(37,99,235,0.05)",
            position: "sticky", top: 0, zIndex: 40,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button className="zham" onClick={() => setMob(v => !v)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <div>
                <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>{currentLabel}</div>
                <div style={{ fontFamily: "DM Sans", fontSize: "0.72rem", color: "#94a3b8", fontStyle: "italic" }}>{today}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a href="/portal/admin/activity" style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "rgba(5,150,105,0.07)", borderRadius: 999, border: "1px solid rgba(5,150,105,0.18)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", display: "block" }} />
                  <span style={{ fontFamily: "Sora", fontSize: "0.7rem", fontWeight: 700, color: "#059669" }}>Live</span>
                </div>
              </a>
              <a href="/portal/admin/settings" style={{ textDecoration: "none" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg,#2563eb,#0ea5e9)",
                  boxShadow: "0 2px 10px rgba(37,99,235,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Sora", fontWeight: 700, color: "#fff", fontSize: "0.88rem",
                }}>A</div>
              </a>
            </div>
          </header>

          {/* Page content */}
          <main className="zpage" style={{ padding: "26px", flex: 1 }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
