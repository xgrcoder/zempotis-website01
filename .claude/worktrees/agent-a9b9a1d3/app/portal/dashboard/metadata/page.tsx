"use client";
// app/portal/dashboard/metadata/page.tsx

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-client";

type PageView = {
  id: string; client_id: string; page_url: string;
  referrer: string; user_agent: string; visited_at: string;
};
type Session = {
  id: string; session_id: string; client_id: string;
  started_at: string; page_url: string;
};

const MONO = "'IBM Plex Mono', 'Courier New', monospace";

function fmt(ts: string) {
  return new Date(ts).toISOString().replace("T", " ").slice(0, 19) + "Z";
}
function shortId(id: string) { return id.slice(0, 8).toUpperCase(); }
function parseDevice(ua: string): string {
  if (/Mobile|Android|iPhone|iPad/i.test(ua)) return "MOB";
  if (/Tablet/i.test(ua)) return "TAB";
  return "DSK";
}
function parseBrowser(ua: string): string {
  if (/Chrome/i.test(ua) && !/Edge|OPR/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Edge/i.test(ua)) return "Edge";
  return "Other";
}

function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(v => !v)}
        style={{
          width: 12, height: 12, borderRadius: "50%",
          border: "1px solid rgba(0,255,128,0.25)",
          background: "rgba(0,255,128,0.05)",
          color: "rgba(0,255,128,0.5)",
          fontFamily: MONO, fontSize: "0.5rem", fontWeight: 700,
          cursor: "pointer", display: "inline-flex",
          alignItems: "center", justifyContent: "center",
          lineHeight: 1, flexShrink: 0, padding: 0,
          transition: "all 0.15s",
        }}
      >?</button>
      {show && (
        <span style={{
          position: "fixed",
          background: "#0f1420", border: "1px solid rgba(0,255,128,0.3)",
          borderRadius: 4, padding: "8px 10px",
          fontFamily: MONO, fontSize: "0.58rem", color: "rgba(255,255,255,0.85)",
          lineHeight: 1.65, whiteSpace: "normal",
          width: 190, zIndex: 9999,
          boxShadow: "0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,255,128,0.1)",
          pointerEvents: "none",
          left: "50%", transform: "translateX(-50%) translateY(-110%)",
        }}>
          {text}
        </span>
      )}
    </span>
  );
}

function CollapsibleSection({ label, tip, children, defaultOpen = true }: { label: string; tip: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: "1px solid rgba(0,255,128,0.1)", borderRadius: 4, overflow: "hidden" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(v => !v)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(v => !v); } }}
        className="collapse-btn"
        style={{
          width: "100%", padding: "10px 14px",
          background: open ? "rgba(0,255,128,0.03)" : "rgba(0,255,128,0.015)",
          borderBottom: open ? "1px solid rgba(0,255,128,0.1)" : "none",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: "#00ff80", letterSpacing: "0.15em" }}>{label}</span>
          <InfoTip text={tip} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "rgba(0,255,128,0.4)", flexShrink: 0, marginLeft: 8 }}>{open ? "▲ COLLAPSE" : "▼ EXPAND"}</span>
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

export default function MetadataPage() {
  const supabase = createClient();
  const [views, setViews] = useState<PageView[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<"visits" | "sessions">("visits");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const cid = user.user_metadata?.client_id || "";
      setClientId(cid);
      setBusinessName(user.user_metadata?.business_name || cid.toUpperCase());

      const [{ data: v }, { data: s }] = await Promise.all([
        supabase.from("page_views").select("*").eq("client_id", cid).order("visited_at", { ascending: false }).limit(200),
        supabase.from("chat_sessions").select("*").eq("client_id", cid).order("started_at", { ascending: false }).limit(200),
      ]);
      setViews(v ?? []);
      setSessions(s ?? []);
      setLoading(false);
    })();

    const ch = supabase.channel("meta-live")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_views" }, p => {
        const row = p.new as PageView;
        setViews(prev => [row, ...prev]);
        setHighlighted(row.id);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setHighlighted(null), 2000);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_sessions" }, p => {
        setSessions(prev => [p.new as Session, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); clearTimeout(timerRef.current); };
  }, []);

  const now = new Date();
  const todayViews = views.filter(v => new Date(v.visited_at).toDateString() === now.toDateString());
  const todaySessions = sessions.filter(s => new Date(s.started_at).toDateString() === now.toDateString());
  const weekViews = views.filter(v => new Date(v.visited_at) >= new Date(Date.now() - 7 * 86400000));

  const devices = views.reduce((a: Record<string,number>, v) => { const d = parseDevice(v.user_agent); a[d] = (a[d]||0)+1; return a; }, {});
  const browsers = views.reduce((a: Record<string,number>, v) => { const b = parseBrowser(v.user_agent); a[b] = (a[b]||0)+1; return a; }, {});
  const topPages = Object.entries(views.reduce((a: Record<string,number>, v) => { try { const p = new URL(v.page_url).pathname; a[p]=(a[p]||0)+1; } catch {} return a; }, {})).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const topRefs = Object.entries(views.reduce((a: Record<string,number>, v) => { let r = "DIRECT"; try { if(v.referrer) r = new URL(v.referrer).hostname.toUpperCase().replace("WWW.",""); } catch {} a[r]=(a[r]||0)+1; return a; }, {})).sort((a,b)=>b[1]-a[1]).slice(0,5);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .meta-wrap { background: #060810; min-height: 100vh; padding: 0; margin: -28px; }
        .meta-inner { padding: 20px 24px; display: flex; flex-direction: column; gap: 10px; }
        .meta-table-row { transition: background 0.15s; }
        .meta-table-row:hover { background: rgba(0,255,128,0.03) !important; }
        .meta-table-row.flash { background: rgba(0,255,128,0.08) !important; }
        .blink { animation: blink-anim 1s step-end infinite; }
        @keyframes blink-anim { 0%,100%{opacity:1} 50%{opacity:0} }
        .tab-btn { background: none; border: none; cursor: pointer; transition: all 0.15s; }
        .tab-btn:hover { color: #00ff80 !important; }
        .data-row { border-bottom: 1px solid rgba(255,255,255,0.04); }
        .data-row:last-child { border-bottom: none; }
        .collapse-btn:hover { background: rgba(0,255,128,0.06) !important; }
        @media (max-width: 768px) {
          .meta-inner { padding: 12px; gap: 8px; }
          .meta-grid-4 { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .meta-grid-2 { grid-template-columns: 1fr !important; }
          .meta-table-scroll { overflow-x: auto; }
          .meta-hide-mobile { display: none !important; }
          .meta-topbar { flex-direction: column !important; gap: 10px !important; }
          .meta-topbar-right { text-align: left !important; }
        }
      `}</style>

      <div className="meta-wrap">
        <div className="meta-inner">

          {/* ── TOP BAR ── */}
          <div className="meta-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, flexWrap: "wrap", gap: 12, borderBottom: "1px solid rgba(0,255,128,0.1)", paddingBottom: 16 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: "#00ff80", letterSpacing: "0.2em", marginBottom: 6, opacity: 0.7 }}>▶ ZEMPOTIS INTELLIGENCE NETWORK — CLASSIFIED</div>
              <div style={{ fontFamily: MONO, fontSize: "1.1rem", fontWeight: 600, color: "#ffffff", letterSpacing: "0.05em" }}>
                {businessName.toUpperCase()} <span style={{ color: "#00ff80" }}>// METADATA</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                CLIENT_ID: {clientId.toUpperCase()} · CLEARANCE: LEVEL-3
              </div>
            </div>
            <div className="meta-topbar-right" style={{ textAlign: "right" }}>
              <div style={{ fontFamily: MONO, fontSize: "0.7rem", color: "#00ff80", letterSpacing: "0.1em" }}>
                {now.toISOString().replace("T", " ").slice(0, 19)} <span className="blink">█</span>
              </div>
              <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
                RECORDS: {views.length + sessions.length} · STATUS: {loading ? "LOADING" : "NOMINAL"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginTop: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff80", display: "block", boxShadow: "0 0 8px #00ff80" }} />
                <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: "#00ff80", letterSpacing: "0.1em" }}>LIVE FEED ACTIVE</span>
              </div>
            </div>
          </div>

          {/* ── STAT GRID ── */}
          <div className="meta-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[
              { label: "TOTAL_VISITS", value: loading ? "——" : views.length, sub: `+${todayViews.length} TODAY`, tip: "Total number of times anyone has visited your website since tracking began." },
              { label: "CHAT_SESSIONS", value: loading ? "——" : sessions.length, sub: `+${todaySessions.length} TODAY`, tip: "Total number of times a visitor opened and used the AI chatbot on your site." },
              { label: "WEEK_ACTIVITY", value: loading ? "——" : weekViews.length, sub: "LAST 7 DAYS", tip: "How many website visitors you had in the last 7 days." },
              { label: "DEVICE_TYPES", value: loading ? "——" : Object.keys(devices).length, sub: Object.entries(devices).map(([k,v])=>`${k}:${v}`).join(" · ") || "—", tip: "Number of different device types (mobile, desktop, tablet) visiting your site." },
            ].map(({ label, value, sub, tip }) => (
              <div key={label} style={{ border: "1px solid rgba(0,255,128,0.12)", background: "rgba(0,255,128,0.02)", borderRadius: 4, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontFamily: MONO, fontSize: "0.58rem", color: "rgba(0,255,128,0.6)", letterSpacing: "0.15em" }}>{label}</span>
                  <InfoTip text={tip} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: "1.6rem", fontWeight: 600, color: "#00ff80", lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</div>
                <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: "rgba(255,255,255,0.25)", marginTop: 5, letterSpacing: "0.1em" }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* ── TOP ENTRY POINTS ── */}
          <CollapsibleSection
            label="TOP_ENTRY_POINTS"
            tip="The pages on your website that get the most visits. For example /services appearing 12 times means 12 people visited that page."
          >
            <div style={{ padding: "4px 0" }}>
              {topPages.length === 0 ? (
                <div style={{ padding: "20px 14px", fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.2)" }}>NO_DATA</div>
              ) : topPages.map(([page, count], i) => (
                <div key={page} className="data-row" style={{ padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: "0.55rem", color: "rgba(0,255,128,0.4)", flexShrink: 0 }}>0{i+1}</span>
                    <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page}</span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: "0.7rem", fontWeight: 600, color: "#00ff80", flexShrink: 0, marginLeft: 8 }}>{count}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ── SIGNAL ORIGIN ── */}
          <CollapsibleSection
            label="SIGNAL_ORIGIN"
            tip="Where your visitors came from before landing on your site. DIRECT means they typed your URL or bookmarked it. Google means they found you via search."
          >
            <div style={{ padding: "4px 0" }}>
              {topRefs.length === 0 ? (
                <div style={{ padding: "20px 14px", fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.2)" }}>NO_DATA</div>
              ) : topRefs.map(([ref, count], i) => (
                <div key={ref} className="data-row" style={{ padding: "9px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: MONO, fontSize: "0.55rem", color: "rgba(0,255,128,0.4)", flexShrink: 0 }}>0{i+1}</span>
                    <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.7)" }}>{ref}</span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: "0.7rem", fontWeight: 600, color: "#00ff80" }}>{count}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* ── CLIENT AGENTS + HARDWARE CLASS ── */}
          <div className="meta-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

            <CollapsibleSection
              label="CLIENT_AGENTS"
              tip="Which web browser your visitors are using — Chrome, Safari, Firefox or Edge."
            >
              <div style={{ padding: "4px 0" }}>
                {Object.entries(browsers).sort((a,b)=>b[1]-a[1]).map(([browser, count]) => {
                  const pct = Math.round((count / Math.max(views.length, 1)) * 100);
                  return (
                    <div key={browser} className="data-row" style={{ padding: "9px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.7)" }}>{browser.toUpperCase()}</span>
                        <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "#00ff80" }}>{pct}% ({count})</span>
                      </div>
                      <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "#00ff80", opacity: 0.6, borderRadius: 1, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(browsers).length === 0 && (
                  <div style={{ padding: "20px 14px", fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.2)" }}>NO_DATA</div>
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              label="HARDWARE_CLASS"
              tip="Whether visitors are on a mobile phone (MOB), desktop computer (DSK), or tablet (TAB)."
            >
              <div style={{ padding: "4px 0" }}>
                {Object.entries(devices).sort((a,b)=>b[1]-a[1]).map(([device, count]) => {
                  const pct = Math.round((count / Math.max(views.length, 1)) * 100);
                  const labels: Record<string,string> = { MOB: "MOBILE", DSK: "DESKTOP", TAB: "TABLET" };
                  return (
                    <div key={device} className="data-row" style={{ padding: "9px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.7)" }}>{labels[device] || device}</span>
                        <span style={{ fontFamily: MONO, fontSize: "0.65rem", color: "#00ff80" }}>{pct}% ({count})</span>
                      </div>
                      <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "#00ff80", opacity: 0.6, borderRadius: 1, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(devices).length === 0 && (
                  <div style={{ padding: "20px 14px", fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.2)" }}>NO_DATA</div>
                )}
              </div>
            </CollapsibleSection>
          </div>

          {/* ── RAW DATA TABLE ── */}
          <CollapsibleSection
            label={`RAW_DATA · ${activeTab === "visits" ? `PAGE_VISITS [${views.length}]` : `CHAT_SESSIONS [${sessions.length}]`}`}
            tip={activeTab === "visits" ? "Every individual page view on your website — when it happened, which page, what device, and where the visitor came from." : "Every time a visitor opened your AI chatbot."}
            defaultOpen={false}
          >
            {/* Tab switcher */}
            <div style={{ padding: "0 14px", borderBottom: "1px solid rgba(0,255,128,0.08)", background: "rgba(0,255,128,0.015)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex" }}>
                {([["visits", `PAGE_VISITS [${views.length}]`], ["sessions", `CHAT_SESSIONS [${sessions.length}]`]] as const).map(([id, label]) => (
                  <button key={id} className="tab-btn" onClick={() => setActiveTab(id)} style={{
                    fontFamily: MONO, fontSize: "0.6rem", letterSpacing: "0.12em",
                    color: activeTab === id ? "#00ff80" : "rgba(255,255,255,0.3)",
                    padding: "10px 16px", borderBottom: activeTab === id ? "2px solid #00ff80" : "2px solid transparent",
                    marginBottom: -1,
                  }}>
                    {label}
                  </button>
                ))}
              </div>
              <span style={{ fontFamily: MONO, fontSize: "0.55rem", color: "rgba(255,255,255,0.2)", padding: "0 4px" }}>LAST 50 RECORDS</span>
            </div>

            <div className="meta-table-scroll">
              {activeTab === "visits" ? (
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(0,255,128,0.08)" }}>
                      {[
                        { h: "TIMESTAMP", tip: "Exact date and time of the visit in UTC." },
                        { h: "PAGE", tip: "Which page on your site they visited." },
                        { h: "ORIGIN", tip: "Where they came from — DIRECT, Google, social media etc." },
                        { h: "DEVICE", tip: "MOB = mobile phone, DSK = desktop, TAB = tablet." },
                        { h: "BROWSER", tip: "Which browser they used." },
                        { h: "ID", tip: "Unique identifier for this visit record." },
                      ].map(({ h, tip }) => (
                        <th key={h} style={{ padding: "8px 14px", textAlign: "left", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontFamily: MONO, fontSize: "0.55rem", color: "rgba(0,255,128,0.5)", letterSpacing: "0.12em", fontWeight: 600 }}>{h}</span>
                            <InfoTip text={tip} />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} style={{ padding: "32px 14px", textAlign: "center", fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.2)" }}>LOADING RECORDS…</td></tr>
                    ) : views.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: "32px 14px", textAlign: "center", fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.2)" }}>NO RECORDS FOUND</td></tr>
                    ) : views.slice(0, 50).map((v, i) => {
                      let page = "—"; let ref = "DIRECT";
                      try { page = new URL(v.page_url).pathname; } catch {}
                      try { if (v.referrer) ref = new URL(v.referrer).hostname.replace("www.", "").toUpperCase(); } catch {}
                      return (
                        <tr key={v.id} className={`meta-table-row${highlighted === v.id ? " flash" : ""}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                          <td style={{ padding: "7px 14px", fontFamily: MONO, fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>{fmt(v.visited_at)}</td>
                          <td style={{ padding: "7px 14px", fontFamily: MONO, fontSize: "0.62rem", color: "rgba(255,255,255,0.8)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page}</td>
                          <td style={{ padding: "7px 14px", fontFamily: MONO, fontSize: "0.62rem", color: "rgba(0,255,128,0.7)", whiteSpace: "nowrap" }}>{ref}</td>
                          <td style={{ padding: "7px 14px", whiteSpace: "nowrap" }}>
                            <span style={{ fontFamily: MONO, fontSize: "0.55rem", color: "rgba(255,255,255,0.5)", padding: "2px 6px", border: "1px solid rgba(0,255,128,0.2)", borderRadius: 2 }}>{parseDevice(v.user_agent)}</span>
                          </td>
                          <td style={{ padding: "7px 14px", fontFamily: MONO, fontSize: "0.62rem", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>{parseBrowser(v.user_agent)}</td>
                          <td style={{ padding: "7px 14px", fontFamily: MONO, fontSize: "0.58rem", color: "rgba(255,255,255,0.2)", whiteSpace: "nowrap" }}>{shortId(v.id)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(0,255,128,0.08)" }}>
                      {[
                        { h: "TIMESTAMP", tip: "When the chat session started." },
                        { h: "PAGE", tip: "Which page the visitor was on when they started chatting." },
                        { h: "SESSION_ID", tip: "Unique ID for this chat conversation." },
                        { h: "STATUS", tip: "LOGGED means the conversation was successfully recorded." },
                      ].map(({ h, tip }) => (
                        <th key={h} style={{ padding: "8px 14px", textAlign: "left", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontFamily: MONO, fontSize: "0.55rem", color: "rgba(0,255,128,0.5)", letterSpacing: "0.12em", fontWeight: 600 }}>{h}</span>
                            <InfoTip text={tip} />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={4} style={{ padding: "32px 14px", textAlign: "center", fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.2)" }}>LOADING RECORDS…</td></tr>
                    ) : sessions.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: "32px 14px", textAlign: "center", fontFamily: MONO, fontSize: "0.65rem", color: "rgba(255,255,255,0.2)" }}>NO RECORDS FOUND</td></tr>
                    ) : sessions.slice(0, 50).map((s, i) => {
                      let page = "—";
                      try { page = new URL(s.page_url).pathname; } catch {}
                      return (
                        <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                          <td style={{ padding: "7px 14px", fontFamily: MONO, fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>{fmt(s.started_at)}</td>
                          <td style={{ padding: "7px 14px", fontFamily: MONO, fontSize: "0.62rem", color: "rgba(255,255,255,0.8)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page}</td>
                          <td style={{ padding: "7px 14px", fontFamily: MONO, fontSize: "0.62rem", color: "rgba(0,255,128,0.7)", whiteSpace: "nowrap" }}>{shortId(s.session_id)}</td>
                          <td style={{ padding: "7px 14px" }}>
                            <span style={{ fontFamily: MONO, fontSize: "0.55rem", padding: "2px 8px", border: "1px solid rgba(0,255,128,0.3)", borderRadius: 2, color: "#00ff80", letterSpacing: "0.1em" }}>LOGGED</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(0,255,128,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: "0.55rem", color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em" }}>
                ZEMPOTIS INTELLIGENCE · ENCRYPTED · {now.toUTCString().toUpperCase()}
              </span>
              <span style={{ fontFamily: MONO, fontSize: "0.55rem", color: "rgba(0,255,128,0.4)", letterSpacing: "0.1em" }}>▶ REAL-TIME SYNC ACTIVE</span>
            </div>
          </CollapsibleSection>

        </div>
      </div>
    </>
  );
}
