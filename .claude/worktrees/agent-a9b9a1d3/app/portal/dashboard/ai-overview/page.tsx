"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useTheme } from "@/lib/theme-context";

type Session = {
  id: string;
  session_id: string;
  client_id: string;
  started_at: string;
  page_url: string;
};

function darken(hex: string, amt = 50): string {
  const r = Math.max(0, parseInt(hex.slice(1,3),16) - amt);
  const g = Math.max(0, parseInt(hex.slice(3,5),16) - amt);
  const b = Math.max(0, parseInt(hex.slice(5,7),16) - amt);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

function lighten(hex: string, amt = 30): string {
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + amt);
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + amt);
  const b = Math.min(255, parseInt(hex.slice(5,7),16) + amt);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

export default function AIOverviewPage() {
  const supabase = createClient();
  const { accent, card, text, muted } = useTheme();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState("");
  const [generated, setGenerated] = useState(false);
  const [businessName, setBusinessName] = useState("Client");
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const cid = user.user_metadata?.client_id ?? "";
      const bname = user.user_metadata?.business_name ?? "Client";
      setClientId(cid);
      setBusinessName(bname);

      const { data: settings } = await supabase
        .from("client_settings")
        .select("display_name")
        .eq("client_id", cid)
        .single();

      if (settings?.display_name) setBusinessName(settings.display_name);

      const { data } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("client_id", cid)
        .order("started_at", { ascending: false });

      setSessions(data ?? []);
      setLoading(false);
    })();
  }, []);

  const todaySessions = sessions.filter(s => new Date(s.started_at).toDateString() === new Date().toDateString());
  const thisWeek = sessions.filter(s => new Date(s.started_at) >= new Date(Date.now() - 7 * 86400000));
  const thisMonth = sessions.filter(s => {
    const d = new Date(s.started_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const busiest = sessions.reduce((acc: Record<string, number>, s) => {
    try {
      const day = new Date(s.started_at).toLocaleDateString("en-GB", { weekday: "long" });
      acc[day] = (acc[day] || 0) + 1;
    } catch {}
    return acc;
  }, {});
  const busiestDay = Object.entries(busiest).sort((a,b) => b[1]-a[1])[0];

  const pages = sessions.reduce((acc: Record<string, number>, s) => {
    try {
      const p = new URL(s.page_url).pathname || "/";
      acc[p] = (acc[p] || 0) + 1;
    } catch {}
    return acc;
  }, {});
  const topPage = Object.entries(pages).sort((a,b) => b[1]-a[1])[0];

  const dark  = darken(accent, 50);
  const light = lighten(accent, 30);

  async function generate() {
    setGenerating(true);
    setSummary("");
    setGenerated(false);

    const now = new Date();
    const hour = now.getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    const prevWeekCount = sessions.length - thisWeek.length;
    const growth = prevWeekCount > 0 ? Math.round(((thisWeek.length - prevWeekCount) / prevWeekCount) * 100) : 0;

    const prompt = `You are a premium AI business analyst. Write a sharp, intelligent business summary for ${businessName}. Be specific with the numbers provided. Write in 4-5 sentences. Sound like a senior McKinsey consultant giving a morning briefing. Use "your" not "the client". Today is ${now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} ${timeOfDay}.

Data:
- Total chatbot conversations: ${sessions.length}
- Today: ${todaySessions.length}
- This week: ${thisWeek.length}
- This month: ${thisMonth.length}
- Busiest day: ${busiestDay ? `${busiestDay[0]} (${busiestDay[1]} chats)` : "not enough data"}
- Most visited page via chatbot: ${topPage ? `${topPage[0]} (${topPage[1]} chats)` : "homepage"}
- Week-on-week growth: ${growth > 0 ? `+${growth}%` : growth === 0 ? "flat" : `${growth}%`}

Start with the most interesting insight. End with one specific action they should take. No bullet points. No markdown. Plain flowing text only.`;

    try {
      const res = await fetch("/api/ai-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const text = data.text || "Unable to generate summary right now.";
      setSummary(text);
      setGenerated(true);
    } catch {
      setSummary("Unable to connect right now. Please try again in a moment.");
      setGenerated(true);
    }

    setGenerating(false);
  }

  const stats = [
    { label: "Today", value: todaySessions.length, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "This Week", value: thisWeek.length, icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { label: "This Month", value: thisMonth.length, icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { label: "All Time", value: sessions.length, icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap');
        @keyframes ai-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ai-fade-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ai-pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes ai-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes ai-typewriter { from { opacity:0; } to { opacity:1; } }
        .ai-spin { animation: ai-spin 1.2s linear infinite; }
        .ai-fade-up { animation: ai-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .ai-pulse-ring { animation: ai-pulse-ring 1.5s ease-out infinite; }
        .ai-dot-1 { animation: ai-dot 1.4s ease-in-out infinite; }
        .ai-dot-2 { animation: ai-dot 1.4s ease-in-out 0.2s infinite; }
        .ai-dot-3 { animation: ai-dot 1.4s ease-in-out 0.4s infinite; }
        .gen-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 40px ${accent}55 !important; }
        .gen-btn:active { transform: scale(0.97) !important; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px ${accent}18 !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        {/* ── Header ── */}
        <div>
          <div style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: muted, fontStyle: "italic", marginBottom: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Powered by Groq AI
          </div>
          <h1 style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.6rem", color: text }}>AI Overview</h1>
          <p style={{ fontFamily: "DM Sans", fontSize: "0.875rem", color: muted, marginTop: 4 }}>
            Intelligent business insights generated from your live chatbot data
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
          {stats.map(({ label, value, icon }) => (
            <div key={label} className="stat-card" style={{
              borderRadius: 14, padding: "18px 20px", background: card,
              border: `1px solid ${accent}14`,
              boxShadow: `0 2px 12px ${accent}08`,
              transition: "all 200ms ease",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontFamily: "Sora", fontSize: "0.7rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${accent}14`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icon}/></svg>
                </div>
              </div>
              <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.8rem", color: loading ? "#e2e8f0" : accent, lineHeight: 1 }}>
                {loading ? "—" : value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Main generate panel ── */}
        <div style={{
          borderRadius: 20,
          background: `linear-gradient(135deg, ${dark} 0%, ${accent} 60%, ${light} 100%)`,
          boxShadow: `0 12px 48px ${accent}33`,
          padding: "48px 40px",
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", position: "relative", overflow: "hidden",
          gap: 28,
        }}>
          {/* Background orbs */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

          {/* Orb */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {generating && (
              <>
                <div className="ai-pulse-ring" style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)" }} />
                <div className="ai-pulse-ring" style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", animationDelay: "0.5s" }} />
              </>
            )}
            <div className={generating ? "ai-spin" : ""} style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(12px)",
            }}>
              {generating ? (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              )}
            </div>
          </div>

          <div>
            <h2 style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.4rem", color: "white", margin: "0 0 8px" }}>
              {generating ? "Analysing your data…" : generated ? "Overview ready" : "Generate your AI Overview"}
            </h2>
            <p style={{ fontFamily: "DM Sans", fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", margin: 0, maxWidth: 420 }}>
              {generating
                ? "Our AI is reviewing your chatbot conversations and building your business intelligence report."
                : generated
                  ? "Your personalised business summary is ready below. Click refresh to generate a new one."
                  : `${sessions.length} conversations ready to analyse. Get a personalised business intelligence summary in seconds.`
              }
            </p>
          </div>

          <button
            className="gen-btn"
            onClick={generate}
            disabled={generating || loading}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "16px 36px", borderRadius: 14,
              background: "rgba(255,255,255,0.18)",
              border: "1.5px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(8px)",
              color: "white", fontFamily: "Sora", fontWeight: 700, fontSize: "1rem",
              cursor: generating || loading ? "default" : "pointer",
              transition: "all 200ms ease",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            {generating ? (
              <>
                <span className="ai-dot-1" style={{ width: 8, height: 8, borderRadius: "50%", background: "white", display: "block" }} />
                <span className="ai-dot-2" style={{ width: 8, height: 8, borderRadius: "50%", background: "white", display: "block" }} />
                <span className="ai-dot-3" style={{ width: 8, height: 8, borderRadius: "50%", background: "white", display: "block" }} />
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                {generated ? "↻ Regenerate" : "Generate Overview"}
              </>
            )}
          </button>
        </div>

        {/* ── Summary result ── */}
        {generated && summary && (
          <div className="ai-fade-up" style={{
            borderRadius: 18, background: card,
            border: `1px solid ${accent}22`,
            boxShadow: `0 4px 32px ${accent}12`,
            overflow: "hidden",
          }}>
            {/* Result header */}
            <div style={{
              padding: "18px 28px",
              background: `linear-gradient(135deg,${dark}08,${accent}08)`,
              borderBottom: `1px solid ${accent}12`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: `linear-gradient(135deg,${dark},${accent})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 12px ${accent}44`,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.9rem", color: text }}>
                    AI Business Summary · {businessName}
                  </div>
                  <div style={{ fontFamily: "DM Sans", fontSize: "0.72rem", color: muted, marginTop: 1 }}>
                    Generated {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · Powered by Groq AI
                  </div>
                </div>
              </div>
            </div>

            {/* Summary text */}
            <div style={{ padding: "32px 28px" }}>
              <p style={{
                fontFamily: "DM Sans", fontSize: "1.05rem", color: text,
                lineHeight: 1.9, margin: 0, fontWeight: 400,
              }}>
                {summary}
              </p>
            </div>

            {/* Data strip */}
            <div style={{
              padding: "16px 28px",
              background: `${accent}06`,
              borderTop: `1px solid ${accent}10`,
              display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center",
            }}>
              {[
                { label: "Today", value: todaySessions.length },
                { label: "This week", value: thisWeek.length },
                { label: "This month", value: thisMonth.length },
                { label: "All time", value: sessions.length },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.3rem", color: accent }}>{value}</div>
                  <div style={{ fontFamily: "DM Sans", fontSize: "0.7rem", color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                </div>
              ))}
              {busiestDay && (
                <div style={{ marginLeft: "auto" }}>
                  <div style={{ fontFamily: "Sora", fontSize: "0.72rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Busiest Day</div>
                  <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.9rem", color: accent }}>{busiestDay[0]} · {busiestDay[1]} chats</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Insights grid ── */}
        {!loading && sessions.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              {
                title: "Busiest Day",
                value: busiestDay ? busiestDay[0] : "Not enough data",
                sub: busiestDay ? `${busiestDay[1]} conversations on ${busiestDay[0]}s` : "Keep chatting to see patterns",
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
              },
              {
                title: "Top Page",
                value: topPage ? topPage[0] : "/",
                sub: topPage ? `${topPage[1]} conversations started here` : "Homepage is most active",
                icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
              },
              {
                title: "Week Growth",
                value: `${thisWeek.length - (sessions.length - thisWeek.length) > 0 ? "+" : ""}${thisWeek.length - (sessions.length - thisWeek.length)}`,
                sub: "Conversations vs previous period",
                icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
              },
            ].map(({ title, value, sub, icon }) => (
              <div key={title} style={{
                borderRadius: 14, padding: "20px 22px", background: card,
                border: `1px solid ${accent}10`,
                boxShadow: `0 2px 12px ${accent}06`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}14`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icon}/></svg>
                  </div>
                  <span style={{ fontFamily: "Sora", fontSize: "0.75rem", fontWeight: 600, color: muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</span>
                </div>
                <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "1.1rem", color: text, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
                <div style={{ fontFamily: "DM Sans", fontSize: "0.78rem", color: muted }}>{sub}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}