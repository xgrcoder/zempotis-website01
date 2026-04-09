"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useTheme } from "@/lib/theme-context";

type PageView = {
  id: string;
  client_id: string;
  page_url: string;
  referrer: string;
  user_agent: string;
  visited_at: string;
};

// ── Collapsible ─────────────────────────────────────────────────
function CollapsibleSection({ title, subtitle, children, defaultOpen = true, card, text, muted, border }: {
  title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean;
  card: string; text: string; muted: string; border: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderRadius: 14, background: card, border: `1px solid ${border}`, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        fontFamily: "system-ui, sans-serif", textAlign: "left",
        borderBottom: open ? `1px solid ${border}` : "none",
      }}>
        <div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: text, letterSpacing: "-0.02em" }}>{title}</div>
          {subtitle && <div style={{ fontSize: "0.72rem", color: muted, marginTop: 2 }}>{subtitle}</div>}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ── SVG Pie Chart ────────────────────────────────────────────────
function PieChart({ segments, size = 110, bgColor = "white" }: { segments: { value: number; color: string; label: string }[]; size?: number; bgColor?: string }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}><circle cx={size/2} cy={size/2} r={size/2-8} fill="none" stroke="#e5e7eb" strokeWidth={10} /><text x={size/2} y={size/2+4} textAnchor="middle" fontSize="10" fill="#9ca3af">No data</text></svg>;
  const cx = size/2, cy = size/2, r = size/2 - 10;
  let start = -Math.PI / 2;
  const paths: React.ReactElement[] = [];
  segments.forEach((seg, i) => {
    if (seg.value === 0) return;
    const angle = (seg.value / total) * 2 * Math.PI;
    const end = start + angle;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
    paths.push(<path key={i} d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${angle>Math.PI?1:0} 1 ${x2} ${y2}Z`} fill={seg.color} opacity="0.9" />);
    start = end;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths}
      <circle cx={cx} cy={cy} r={r*0.52} fill={bgColor} />
    </svg>
  );
}

function lighten(hex: string, amt = 40): string {
  const r = Math.min(255, parseInt(hex.slice(1,3),16) + amt);
  const g = Math.min(255, parseInt(hex.slice(3,5),16) + amt);
  const b = Math.min(255, parseInt(hex.slice(5,7),16) + amt);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

export default function AnalyticsPage() {
  const supabase = createClient();
  const { accent, card, text, muted, border } = useTheme();
  const [views, setViews] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const cid = user.user_metadata?.client_id || "";

      const { data } = await supabase
        .from("page_views")
        .select("*")
        .eq("client_id", cid)
        .order("visited_at", { ascending: false });

      setViews(data ?? []);
      setLoading(false);
    })();
  }, []);

  // ── Derived stats ────────────────────────────────────────────
  const now = new Date();
  const todayViews = views.filter(v => new Date(v.visited_at).toDateString() === now.toDateString());
  const weekViews  = views.filter(v => new Date(v.visited_at) >= new Date(Date.now() - 7 * 86400000));
  const monthViews = views.filter(v => {
    const d = new Date(v.visited_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // 7-day bar chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-GB", { weekday: "short" });
    const count = views.filter(v => new Date(v.visited_at).toDateString() === d.toDateString()).length;
    return { label, count, date: d.toDateString() };
  });
  const maxDay = Math.max(...last7Days.map(d => d.count), 1);

  // Hourly heatmap (0-23)
  const hourCounts = Array.from({ length: 24 }, (_, h) => {
    const count = weekViews.filter(v => new Date(v.visited_at).getHours() === h).length;
    return { hour: h, count };
  });
  const maxHour = Math.max(...hourCounts.map(h => h.count), 1);

  // Top pages
  const pageCounts = views.reduce((acc: Record<string, number>, v) => {
    try {
      const p = new URL(v.page_url).pathname || "/";
      acc[p] = (acc[p] || 0) + 1;
    } catch {}
    return acc;
  }, {});
  const topPages = Object.entries(pageCounts).sort((a,b) => b[1]-a[1]).slice(0, 6);
  const maxPage = topPages[0]?.[1] || 1;

  // Top referrers
  const refCounts = views.reduce((acc: Record<string, number>, v) => {
    let ref = "Direct";
    try { if (v.referrer) ref = new URL(v.referrer).hostname.replace("www.", ""); } catch {}
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {});
  const topRefs = Object.entries(refCounts).sort((a,b) => b[1]-a[1]).slice(0, 5);

  const stats = [
    { label: "Today", value: todayViews.length, sub: "visitors today" },
    { label: "This Week", value: weekViews.length, sub: "last 7 days" },
    { label: "This Month", value: monthViews.length, sub: new Date().toLocaleDateString("en-GB", { month: "long" }) },
    { label: "All Time", value: views.length, sub: "total visitors" },
  ];

  const Skeleton = ({ w = "100%", h = 16, r = 6 }: { w?: string; h?: number; r?: number }) => (
    <div style={{ width: w, height: h, borderRadius: r, background: border }} />
  );

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .bar-fill { transition: height 0.6s cubic-bezier(0.16,1,0.3,1); }
        .stat-card:hover { transform: translateY(-2px); }
        .page-row:hover { background: rgba(0,0,0,0.02); }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: "0.68rem", fontWeight: 600, color: muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              Website Analytics
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: text, letterSpacing: "-0.03em", margin: 0 }}>
              Visitor Insights
            </h1>
            <p style={{ fontSize: "0.8125rem", color: muted, marginTop: 4 }}>
              Real-time data from your chatbot embed
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 999,
            background: `${accent}10`, border: `1px solid ${accent}25`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "block" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: accent }}>
              {loading ? "Loading…" : `${views.length} total visits tracked`}
            </span>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {stats.map(({ label, value, sub }) => (
            <div key={label} className="stat-card" style={{
              borderRadius: 12, padding: "18px 20px",
              background: card,
              border: `1px solid ${border}`,
              transition: "transform 0.15s ease",
            }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 600, color: muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                {label}
              </div>
              {loading ? <Skeleton h={32} r={4} /> : (
                <div style={{ fontSize: "2rem", fontWeight: 700, color: accent, lineHeight: 1, letterSpacing: "-0.04em" }}>
                  {value.toLocaleString()}
                </div>
              )}
              <div style={{ fontSize: "0.72rem", color: muted, marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ── 7-day bar chart ── */}
        <div style={{ borderRadius: 14, background: card, border: `1px solid ${border}`, overflow: "hidden" }}>
          <div style={{
            padding: "18px 20px 14px",
            borderBottom: `1px solid ${border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: text, letterSpacing: "-0.02em" }}>Daily Visitors</div>
              <div style={{ fontSize: "0.72rem", color: muted, marginTop: 2 }}>Last 7 days</div>
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: accent, letterSpacing: "-0.03em" }}>
              {weekViews.length}
            </div>
          </div>
          <div style={{ padding: "20px 20px 16px" }}>
            {loading ? (
              <div style={{ height: 120, display: "flex", alignItems: "flex-end", gap: 8 }}>
                {[60,80,40,90,70,50,85].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "4px 4px 0 0", background: border }} />
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
                {last7Days.map(({ label, count }) => {
                  const pct = maxDay > 0 ? (count / maxDay) * 100 : 0;
                  const isToday = label === new Date().toLocaleDateString("en-GB", { weekday: "short" });
                  return (
                    <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 600, color: count > 0 ? accent : border }}>
                        {count > 0 ? count : ""}
                      </div>
                      <div
                        className="bar-fill"
                        style={{
                          width: "100%",
                          height: `${Math.max(pct, count > 0 ? 4 : 2)}%`,
                          borderRadius: "4px 4px 0 0",
                          background: isToday ? accent : `${accent}40`,
                          minHeight: 3,
                          transition: "height 0.6s cubic-bezier(0.16,1,0.3,1)",
                        }}
                      />
                      <div style={{ fontSize: "0.65rem", color: isToday ? accent : muted, fontWeight: isToday ? 600 : 400 }}>
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Heatmap + Top Pages ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          <CollapsibleSection title="Peak Hours" subtitle="When visitors are most active" card={card} text={text} muted={muted} border={border}>
            <div style={{ padding: "16px 20px 20px" }}>
              {loading ? <Skeleton h={80} /> : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 4, marginBottom: 8 }}>
                    {hourCounts.slice(0, 12).map(({ hour, count }) => {
                      const intensity = maxHour > 0 ? count / maxHour : 0;
                      return <div key={hour} title={`${hour}:00 — ${count} visits`} style={{ height: 28, borderRadius: 4, background: count === 0 ? "rgba(0,0,0,0.04)" : accent, opacity: count === 0 ? 1 : 0.2 + intensity * 0.8 }} />;
                    })}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 4 }}>
                    {hourCounts.slice(12).map(({ hour, count }) => {
                      const intensity = maxHour > 0 ? count / maxHour : 0;
                      return <div key={hour} title={`${hour}:00 — ${count} visits`} style={{ height: 28, borderRadius: 4, background: count === 0 ? "rgba(0,0,0,0.04)" : accent, opacity: count === 0 ? 1 : 0.2 + intensity * 0.8 }} />;
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ fontSize: "0.62rem", color: muted }}>12am</span>
                    <span style={{ fontSize: "0.62rem", color: muted }}>12pm</span>
                    <span style={{ fontSize: "0.62rem", color: muted }}>11pm</span>
                  </div>
                  {hourCounts.length > 0 && (
                    <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: accent, opacity: 0.9 }} />
                      <span style={{ fontSize: "0.68rem", color: muted }}>
                        Busiest: {hourCounts.reduce((a, b) => b.count > a.count ? b : a).hour}:00
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Top Pages" subtitle="Most visited pages" card={card} text={text} muted={muted} border={border}>
            <div style={{ padding: "8px 0" }}>
              {loading ? (
                <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1,2,3,4].map(i => <Skeleton key={i} h={14} />)}
                </div>
              ) : topPages.length === 0 ? (
                <div style={{ padding: "32px 20px", textAlign: "center", color: muted, fontSize: "0.8125rem" }}>No page data yet</div>
              ) : topPages.map(([page, count], i) => (
                <div key={page} className="page-row" style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: i < topPages.length - 1 ? `1px solid ${border}` : "none", transition: "background 0.1s" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: `${accent}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 700, color: accent }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 500, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page}</div>
                    <div style={{ marginTop: 3, height: 3, borderRadius: 999, background: border, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(count / maxPage) * 100}%`, background: accent, borderRadius: 999, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: accent, flexShrink: 0 }}>{count}</div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>

        {/* ── Traffic Sources + Pie ── */}
        <CollapsibleSection title="Traffic Sources" subtitle="Where your visitors come from" card={card} text={text} muted={muted} border={border}>
          <div style={{ padding: "16px 20px 20px" }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[1,2,3].map(i => <Skeleton key={i} h={14} />)}</div>
            ) : topRefs.length === 0 ? (
              <div style={{ textAlign: "center", color: muted, fontSize: "0.8125rem", padding: "16px 0" }}>No referrer data yet</div>
            ) : (
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                <PieChart size={120} bgColor={card} segments={topRefs.map(([ref, count], i) => ({
                  value: count,
                  label: ref,
                  color: [accent, `${accent}cc`, `${accent}88`, `${accent}55`, `${accent}33`][i] ?? "#e5e7eb",
                }))} />
                <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 10 }}>
                  {topRefs.map(([ref, count], i) => {
                    const pct = Math.round((count / views.length) * 100);
                    return (
                      <div key={ref} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, flexShrink: 0, background: [accent, `${accent}cc`, `${accent}88`, `${accent}55`, `${accent}33`][i] ?? "#e5e7eb" }} />
                        <div style={{ fontSize: "0.78rem", fontWeight: 500, color: text, width: 90, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ref}</div>
                        <div style={{ flex: 1, height: 5, borderRadius: 999, background: border, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, ${lighten(accent, 30)})`, borderRadius: 999, transition: "width 0.6s ease" }} />
                        </div>
                        <div style={{ fontSize: "0.72rem", fontWeight: 600, color: text, width: 32, textAlign: "right", flexShrink: 0 }}>{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        {/* ── Recent Visits ── */}
        <CollapsibleSection title="Recent Visits" subtitle="Live — last 10 page views" card={card} text={text} muted={muted} border={border}>
          <div>
            {loading ? (
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {[1,2,3,4,5].map(i => <Skeleton key={i} h={14} />)}
              </div>
            ) : views.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "0.8125rem", color: muted }}>No visits recorded yet. Make sure your chatbot script is installed.</div>
              </div>
            ) : views.slice(0, 10).map((v, i) => {
              let page = v.page_url;
              let referrer = "Direct";
              try { page = new URL(v.page_url).pathname; } catch {}
              try { if (v.referrer) referrer = new URL(v.referrer).hostname.replace("www.", ""); } catch {}
              return (
                <div key={v.id} className="page-row" style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 20px", borderBottom: i < Math.min(views.length, 10) - 1 ? `1px solid ${border}` : "none", transition: "background 0.1s" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: i === 0 ? "#10b981" : `${accent}40` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 500, color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page}</div>
                    <div style={{ fontSize: "0.68rem", color: muted, marginTop: 1 }}>via {referrer}</div>
                  </div>
                  <div style={{ fontSize: "0.68rem", color: muted, flexShrink: 0 }}>
                    {new Date(v.visited_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    {" · "}
                    {new Date(v.visited_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleSection>

      </div>
    </>
  );
}