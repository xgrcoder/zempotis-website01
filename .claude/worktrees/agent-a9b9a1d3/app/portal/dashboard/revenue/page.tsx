"use client";
// app/portal/dashboard/revenue/page.tsx

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useTheme } from "@/lib/theme-context";

const F = "'IBM Plex Sans', system-ui, sans-serif";

interface Invoice {
  id: string;
  client_id: string;
  amount: number;
  status: string;
  description: string;
  due_date: string;
  created_at: string;
}

interface Entry {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CAT_COLORS = ["#2563eb","#0ea5e9","#7c3aed","#059669","#f59e0b"];
const CATEGORIES = ["Sales","Services","Marketing","Rent","Salaries","Software","Other"];

function fmt(n: number): string {
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function RevenuePage() {
  const supabase = createClient();
  const { accent, card, text, muted, border, inputBg } = useTheme();

  const [invoices, setInvoices]     = useState<Invoice[]>([]);
  const [entries, setEntries]       = useState<Entry[]>([]);
  const [clientId, setClientId]     = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [loading, setLoading]       = useState(true);

  // Modal form state
  const [mType, setMType]         = useState<"income"|"expense">("expense");
  const [mAmount, setMAmount]     = useState("");
  const [mCategory, setMCategory] = useState("Other");
  const [mDesc, setMDesc]         = useState("");
  const [mDate, setMDate]         = useState(new Date().toISOString().slice(0,10));

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const cid = user.user_metadata?.client_id as string;
      setClientId(cid);

      const { data: inv } = await supabase
        .from("invoices")
        .select("*")
        .eq("client_id", cid)
        .order("created_at", { ascending: false });
      setInvoices((inv as Invoice[]) ?? []);

      // Load localStorage entries
      const stored = localStorage.getItem(`zempotis_entries_${cid}`);
      if (stored) {
        try { setEntries(JSON.parse(stored) as Entry[]); } catch { /* ignore */ }
      }

      setLoading(false);
    })();
  }, []);

  function saveEntries(next: Entry[]) {
    setEntries(next);
    if (clientId) localStorage.setItem(`zempotis_entries_${clientId}`, JSON.stringify(next));
  }

  function addEntry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const amt = parseFloat(mAmount);
    if (!amt || isNaN(amt)) return;
    const newEntry: Entry = {
      id:          Date.now().toString(36),
      type:        mType,
      amount:      amt,
      category:    mCategory,
      description: mDesc || mCategory,
      date:        mDate,
    };
    const next = [newEntry, ...entries];
    saveEntries(next);
    setShowModal(false);
    setMAmount(""); setMDesc(""); setMCategory("Other"); setMDate(new Date().toISOString().slice(0,10)); setMType("expense");
  }

  function removeEntry(id: string) {
    saveEntries(entries.filter(en => en.id !== id));
  }

  // Computed
  const totalRevenue   = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.amount ?? 0), 0);
  const totalExpenses  = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const netProfit      = totalRevenue - totalExpenses;
  const year           = new Date().getFullYear();

  const thisMonthStr = new Date().toISOString().slice(0,7);
  const thisMonthRev = invoices
    .filter(i => i.status === "paid" && i.created_at?.slice(0,7) === thisMonthStr)
    .reduce((s, i) => s + (i.amount ?? 0), 0);

  const monthlyData = MONTHS.map((label, idx) => {
    const mStr = `${year}-${String(idx+1).padStart(2,"0")}`;
    const rev  = invoices
      .filter(i => i.status === "paid" && i.created_at?.slice(0,7) === mStr)
      .reduce((s, i) => s + (i.amount ?? 0), 0);
    const exp  = entries
      .filter(e => e.type === "expense" && e.date?.slice(0,7) === mStr)
      .reduce((s, e) => s + e.amount, 0);
    return { label, rev, exp };
  });
  const maxMonthly = Math.max(...monthlyData.map(m => Math.max(m.rev, m.exp)), 1);

  // Donut chart data
  const expensesByCategory: Record<string, number> = {};
  entries.filter(e => e.type === "expense").forEach(e => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] ?? 0) + e.amount;
  });
  const catEntries = Object.entries(expensesByCategory)
    .sort((a,b) => b[1]-a[1])
    .slice(0,5);

  // Build conic-gradient for donut
  let conicParts: string[] = [];
  let runningDeg = 0;
  catEntries.forEach(([,amt], i) => {
    const deg = totalExpenses > 0 ? (amt / totalExpenses) * 360 : 0;
    conicParts.push(`${CAT_COLORS[i % CAT_COLORS.length]} ${runningDeg}deg ${runningDeg + deg}deg`);
    runningDeg += deg;
  });
  if (conicParts.length === 0) conicParts = ["#e5e7eb 0deg 360deg"];
  const donutGradient = `conic-gradient(${conicParts.join(", ")})`;

  // Invoice status breakdown
  const statusGroups: Record<string, number> = {};
  invoices.forEach(i => {
    statusGroups[i.status] = (statusGroups[i.status] ?? 0) + 1;
  });

  // Recent entries list (invoices as income + manual entries), sorted by date desc
  type ListRow = { id: string; isManual: boolean; type: "income"|"expense"; description: string; category: string; amount: number; date: string };
  const listRows: ListRow[] = [
    ...invoices.slice(0,20).map(i => ({
      id:          i.id,
      isManual:    false,
      type:        "income" as const,
      description: i.description || "Invoice",
      category:    "Invoice",
      amount:      i.amount ?? 0,
      date:        i.created_at?.slice(0,10) ?? "",
    })),
    ...entries.map(e => ({
      id:          e.id,
      isManual:    true,
      type:        e.type,
      description: e.description,
      category:    e.category,
      amount:      e.amount,
      date:        e.date,
    })),
  ]
    .sort((a,b) => b.date.localeCompare(a.date))
    .slice(0,10);


  const statCards = [
    {
      label:    "Total Revenue",
      value:    fmt(totalRevenue),
      sub:      `${invoices.filter(i=>i.status==="paid").length} paid invoices`,
      iconGrad: "linear-gradient(135deg, #059669, #047857)",
      accent:   "#059669",
      iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label:    "Total Expenses",
      value:    fmt(totalExpenses),
      sub:      `${entries.filter(e=>e.type==="expense").length} expense entries`,
      iconGrad: "linear-gradient(135deg, #dc2626, #b91c1c)",
      accent:   "#dc2626",
      iconPath: "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6",
    },
    {
      label:    "Net Profit",
      value:    fmt(netProfit),
      sub:      netProfit >= 0 ? "Profitable" : "Loss",
      iconGrad: netProfit >= 0 ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "linear-gradient(135deg, #dc2626, #b91c1c)",
      accent:   netProfit >= 0 ? "#2563eb" : "#dc2626",
      iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    },
    {
      label:    "This Month Revenue",
      value:    fmt(thisMonthRev),
      sub:      new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"}),
      iconGrad: "linear-gradient(135deg, #7c3aed, #5b21b6)",
      accent:   "#7c3aed",
      iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
  ];

  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:muted, fontFamily:F }}>
        Loading revenue data…
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .rev-stat-grid   { grid-template-columns: 1fr 1fr !important; }
          .rev-bottom-row  { flex-direction: column !important; }
        }
        @media (max-width: 768px) {
          .rev-chart-wrap  { overflow-x: auto; }
          .rev-donut-row   { flex-direction: column !important; }
        }
        .rev-del-btn { opacity: 0; transition: opacity 0.15s; }
        .rev-entry-row:hover .rev-del-btn { opacity: 1; }
        .rev-month-col:hover > div { opacity: 1 !important; }
      `}</style>

      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexDirection:"column", gap:20, fontFamily:F }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div>
            <h1 style={{ fontSize:"1.4rem", fontWeight:700, color:text, margin:0 }}>Revenue &amp; Expenses</h1>
            <div style={{ fontSize:"0.78rem", color:muted, marginTop:4 }}>Track income, expenses, and profitability</div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding:"9px 18px", borderRadius:8, border:"none", cursor:"pointer",
              background:`linear-gradient(135deg, ${accent}, #1d4ed8)`,
              color:"#fff", fontSize:"0.82rem", fontWeight:600, fontFamily:F,
              display:"flex", alignItems:"center", gap:7,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Add Entry
          </button>
        </div>

        {/* Stat Cards */}
        <div className="rev-stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {statCards.map((s, i) => (
            <div key={i} style={{
              background:card, borderRadius:10,
              borderLeft:`3px solid ${s.accent}22`,
              borderTop:`1px solid ${border}`, borderRight:`1px solid ${border}`, borderBottom:`1px solid ${border}`,
              padding:"16px 18px", display:"flex", flexDirection:"column", gap:10,
              boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div style={{ width:32, height:32, borderRadius:8, background:s.iconGrad, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.iconPath}/>
                  </svg>
                </div>
              </div>
              <div>
                <div style={{ fontSize:"1.5rem", fontWeight:700, color: i === 2 ? (netProfit >= 0 ? "#059669" : "#dc2626") : text, lineHeight:1, fontVariantNumeric:"tabular-nums" }}>
                  {s.value}
                </div>
                <div style={{ fontSize:"0.72rem", fontWeight:500, color:muted, marginTop:3 }}>{s.label}</div>
              </div>
              <div style={{ fontSize:"0.72rem", color:muted }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Monthly Bar Chart */}
        <div style={{ background:card, borderRadius:10, border:`1px solid ${border}`, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", padding:"20px 20px 16px" }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
            <div>
              <div style={{ fontSize:"0.875rem", fontWeight:600, color:text }}>Monthly Overview</div>
              <div style={{ fontSize:"0.72rem", color:muted, marginTop:2 }}>Income vs Expenses — {year}</div>
            </div>
            <div style={{ display:"flex", gap:14 }}>
              {[{color:"#2563eb",label:"Revenue"},{color:"#f43f5e",label:"Expenses"}].map(l => (
                <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:l.color }} />
                  <span style={{ fontSize:"0.68rem", color:muted }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rev-chart-wrap">
            <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:120, minWidth:560 }}>
              {monthlyData.map((m, idx) => {
                const rH = Math.round((m.rev / maxMonthly) * 100);
                const eH = Math.round((m.exp / maxMonthly) * 100);
                const isCurrent = idx === new Date().getMonth();
                return (
                  <div key={m.label} className="rev-month-col" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                    <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:104, width:"100%" }}>
                      <div style={{ flex:1, height:`${Math.max(rH,2)}%`, background:"#2563eb", opacity:isCurrent ? 1 : 0.4, borderRadius:"3px 3px 0 0", transition:"height 0.4s ease", minHeight:2 }} />
                      <div style={{ flex:1, height:`${Math.max(eH,2)}%`, background:"#f43f5e", opacity:isCurrent ? 1 : 0.4, borderRadius:"3px 3px 0 0", transition:"height 0.4s ease", minHeight:2 }} />
                    </div>
                    <div style={{ fontSize:"0.6rem", color:isCurrent ? accent : muted, fontWeight:isCurrent ? 600 : 400 }}>{m.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Donut + Revenue Breakdown Row */}
        <div className="rev-donut-row" style={{ display:"flex", gap:12 }}>

          {/* Expense Donut */}
          <div style={{ flex:"1 1 0", background:card, borderRadius:10, border:`1px solid ${border}`, padding:"20px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize:"0.875rem", fontWeight:600, color:text, marginBottom:4 }}>Expense Breakdown</div>
            <div style={{ fontSize:"0.72rem", color:muted, marginBottom:20 }}>By category</div>

            {catEntries.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:muted, fontSize:"0.8rem" }}>No expense data yet</div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
                  <div style={{ position:"relative", width:120, height:120 }}>
                    <div style={{ width:120, height:120, borderRadius:"50%", background:donutGradient }} />
                    <div style={{
                      position:"absolute", inset:20, borderRadius:"50%",
                      background:card,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      flexDirection:"column", gap:1,
                    }}>
                      <div style={{ fontSize:"0.7rem", fontWeight:700, color:text, lineHeight:1 }}>{fmt(totalExpenses)}</div>
                      <div style={{ fontSize:"0.55rem", color:muted }}>total</div>
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {catEntries.map(([cat, amt], i) => (
                    <div key={cat} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <div style={{ width:8, height:8, borderRadius:2, background:CAT_COLORS[i % CAT_COLORS.length], flexShrink:0 }} />
                        <span style={{ fontSize:"0.75rem", color:text }}>{cat}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:"0.72rem", fontWeight:600, color:text }}>{fmt(amt)}</span>
                        <span style={{ fontSize:"0.65rem", color:muted }}>{totalExpenses > 0 ? Math.round((amt/totalExpenses)*100) : 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Revenue Breakdown */}
          <div style={{ flex:"1 1 0", background:card, borderRadius:10, border:`1px solid ${border}`, padding:"20px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize:"0.875rem", fontWeight:600, color:text, marginBottom:4 }}>Revenue Breakdown</div>
            <div style={{ fontSize:"0.72rem", color:muted, marginBottom:20 }}>Invoice status overview</div>

            {invoices.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:muted, fontSize:"0.8rem" }}>No invoices yet</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  { key:"paid",    label:"Paid",    color:"#059669", bg:"rgba(5,150,105,0.08)" },
                  { key:"pending", label:"Pending", color:"#f59e0b", bg:"rgba(245,158,11,0.08)" },
                  { key:"overdue", label:"Overdue", color:"#dc2626", bg:"rgba(220,38,38,0.08)" },
                ].map(st => {
                  const inv = invoices.filter(i => i.status === st.key);
                  const total = inv.reduce((s,i) => s + (i.amount??0), 0);
                  return (
                    <div key={st.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", borderRadius:8, background:st.bg, border:`1px solid ${st.color}20` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:st.color }} />
                        <span style={{ fontSize:"0.8rem", fontWeight:500, color:text }}>{st.label}</span>
                        <span style={{ fontSize:"0.68rem", color:muted, background:"rgba(0,0,0,0.04)", padding:"1px 6px", borderRadius:999 }}>{inv.length}</span>
                      </div>
                      <span style={{ fontSize:"0.8rem", fontWeight:700, color:st.color }}>{fmt(total)}</span>
                    </div>
                  );
                })}

                <div style={{ marginTop:8, padding:"12px", borderRadius:8, background:"rgba(0,0,0,0.02)", border:`1px solid ${border}` }}>
                  <div style={{ fontSize:"0.72rem", color:muted, marginBottom:4 }}>All time revenue</div>
                  <div style={{ fontSize:"1.1rem", fontWeight:700, color:text }}>{fmt(invoices.reduce((s,i)=>s+(i.amount??0),0))}</div>
                  <div style={{ fontSize:"0.68rem", color:muted, marginTop:2 }}>{invoices.length} total invoices</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Entries */}
        <div style={{ background:card, borderRadius:10, border:`1px solid ${border}`, boxShadow:"0 1px 3px rgba(0,0,0,0.05)", overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:"0.875rem", fontWeight:600, color:text }}>Recent Entries</div>
              <div style={{ fontSize:"0.72rem", color:muted, marginTop:2 }}>Invoices and manual entries</div>
            </div>
            <span style={{ fontSize:"0.72rem", color:muted, background:"rgba(0,0,0,0.04)", padding:"3px 8px", borderRadius:6 }}>
              Last 10
            </span>
          </div>

          {listRows.length === 0 ? (
            <div style={{ padding:"32px 20px", textAlign:"center", color:muted, fontSize:"0.8rem" }}>
              No entries yet. Add your first entry or invoices will appear here automatically.
            </div>
          ) : (
            <div>
              {listRows.map((row, i) => (
                <div key={row.id} className="rev-entry-row" style={{
                  display:"flex", alignItems:"center", gap:12, padding:"11px 20px",
                  borderBottom: i < listRows.length-1 ? `1px solid ${border}` : "none",
                }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background: row.type === "income" ? "#059669" : "#dc2626" }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"0.8rem", fontWeight:500, color:text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {row.description}
                    </div>
                    <div style={{ fontSize:"0.68rem", color:muted, marginTop:2 }}>{row.date}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                    <span style={{ fontSize:"0.68rem", fontWeight:600, color: row.type === "income" ? "#059669" : "#dc2626", background: row.type === "income" ? "rgba(5,150,105,0.08)" : "rgba(220,38,38,0.08)", padding:"2px 7px", borderRadius:999 }}>
                      {row.category}
                    </span>
                    <span style={{ fontSize:"0.82rem", fontWeight:700, color: row.type === "income" ? "#059669" : "#dc2626" }}>
                      {row.type === "income" ? "+" : "−"}{fmt(row.amount)}
                    </span>
                    {row.isManual && (
                      <button
                        className="rev-del-btn"
                        onClick={() => removeEntry(row.id)}
                        style={{ background:"none", border:"none", cursor:"pointer", color:"#dc2626", fontSize:"1rem", fontFamily:F, lineHeight:1, padding:"0 2px" }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Add Entry Modal */}
      {showModal && (
        <div style={{
          position:"fixed", inset:0, zIndex:100,
          background:"rgba(0,0,0,0.45)", backdropFilter:"blur(3px)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:16,
        }}>
          <div style={{
            background:card, borderRadius:14, padding:"28px", width:"100%", maxWidth:460,
            boxShadow:"0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
              <div style={{ fontSize:"1rem", fontWeight:700, color:text }}>Add Entry</div>
              <button onClick={() => setShowModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:muted, fontSize:"1.3rem", lineHeight:1, fontFamily:F }}>×</button>
            </div>

            <form onSubmit={addEntry} style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Type toggle */}
              <div>
                <div style={{ fontSize:"0.72rem", fontWeight:600, color:muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Type</div>
                <div style={{ display:"flex", gap:0, borderRadius:8, overflow:"hidden", border:`1px solid ${border}` }}>
                  {(["income","expense"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setMType(t)} style={{
                      flex:1, padding:"8px 0", border:"none", cursor:"pointer", fontFamily:F,
                      fontSize:"0.82rem", fontWeight:600, transition:"background 0.15s, color 0.15s",
                      background: mType === t ? (t === "income" ? "#059669" : "#dc2626") : inputBg,
                      color:      mType === t ? "#ffffff" : muted,
                    }}>
                      {t === "income" ? "Income" : "Expense"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label style={{ fontSize:"0.72rem", fontWeight:600, color:muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Amount</label>
                <div style={{ display:"flex", alignItems:"center", border:`1px solid ${border}`, borderRadius:8, overflow:"hidden" }}>
                  <span style={{ padding:"9px 12px", background:inputBg, borderRight:`1px solid ${border}`, fontSize:"0.82rem", color:muted, fontWeight:600 }}>£</span>
                  <input
                    type="number" step="0.01" min="0" required value={mAmount}
                    onChange={e => setMAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ flex:1, padding:"9px 12px", border:"none", outline:"none", fontSize:"0.9rem", fontFamily:F, color:text, background:inputBg }}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize:"0.72rem", fontWeight:600, color:muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Category</label>
                <select value={mCategory} onChange={e => setMCategory(e.target.value)} style={{
                  width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${border}`,
                  fontSize:"0.82rem", fontFamily:F, color:text, background:inputBg, outline:"none",
                }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize:"0.72rem", fontWeight:600, color:muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Description</label>
                <input
                  type="text" value={mDesc} onChange={e => setMDesc(e.target.value)}
                  placeholder="Optional description"
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${border}`, fontSize:"0.82rem", fontFamily:F, color:text, outline:"none", boxSizing:"border-box" }}
                />
              </div>

              {/* Date */}
              <div>
                <label style={{ fontSize:"0.72rem", fontWeight:600, color:muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Date</label>
                <input
                  type="date" required value={mDate} onChange={e => setMDate(e.target.value)}
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${border}`, fontSize:"0.82rem", fontFamily:F, color:text, outline:"none", boxSizing:"border-box" }}
                />
              </div>

              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex:1, padding:"10px", borderRadius:8, border:`1px solid ${border}`,
                  background:inputBg, color:muted, fontSize:"0.82rem", fontWeight:600, fontFamily:F, cursor:"pointer",
                }}>
                  Cancel
                </button>
                <button type="submit" style={{
                  flex:1, padding:"10px", borderRadius:8, border:"none",
                  background:`linear-gradient(135deg, ${accent}, #1d4ed8)`,
                  color:"#fff", fontSize:"0.82rem", fontWeight:600, fontFamily:F, cursor:"pointer",
                }}>
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
