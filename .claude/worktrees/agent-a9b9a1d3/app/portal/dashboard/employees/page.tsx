"use client";
// app/portal/dashboard/employees/page.tsx

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useTheme } from "@/lib/theme-context";

const F = "'IBM Plex Sans', system-ui, sans-serif";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: "active" | "away" | "offline";
}

const DEPT_COLORS: Record<string, string> = {
  Engineering:  "#2563eb",
  Marketing:    "#7c3aed",
  Sales:        "#059669",
  Design:       "#0ea5e9",
  Operations:   "#d97706",
  HR:           "#e11d48",
  Finance:      "#6366f1",
  Other:        "#6b7280",
};

const DEPARTMENTS = Object.keys(DEPT_COLORS);

const STATUS_CONFIG = {
  active:  { color: "#10b981", label: "Active",  bg: "rgba(16,185,129,0.08)" },
  away:    { color: "#f59e0b", label: "Away",    bg: "rgba(245,158,11,0.08)" },
  offline: { color: "#9ca3af", label: "Offline", bg: "rgba(156,163,175,0.08)" },
};

export default function EmployeesPage() {
  const supabase = createClient();
  const { accent, card, text, muted, border, inputBg, inputBdr } = useTheme();

  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [clientId, setClientId]     = useState("");
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [filterDept, setFilterDept] = useState("All");

  // Modal form state
  const [mName,   setMName]   = useState("");
  const [mRole,   setMRole]   = useState("");
  const [mDept,   setMDept]   = useState("Engineering");
  const [mEmail,  setMEmail]  = useState("");
  const [mPhone,  setMPhone]  = useState("");
  const [mStatus, setMStatus] = useState<"active"|"away"|"offline">("active");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const cid = user.user_metadata?.client_id as string;
      setClientId(cid);

      // Try Supabase first
      let loaded = false;
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("*")
          .eq("client_id", cid)
          .order("name", { ascending: true });
        if (!error && data && data.length > 0) {
          setEmployees(data as Employee[]);
          loaded = true;
        }
      } catch { /* table may not exist */ }

      if (!loaded) {
        const stored = localStorage.getItem(`zempotis_team_${cid}`);
        if (stored) {
          try { setEmployees(JSON.parse(stored) as Employee[]); } catch { /* ignore */ }
        }
      }

      setLoading(false);
    })();
  }, []);

  function saveEmployees(next: Employee[]) {
    setEmployees(next);
    if (clientId) {
      localStorage.setItem(`zempotis_team_${clientId}`, JSON.stringify(next));
      // Best-effort Supabase save (fire and forget)
      supabase.from("employees").upsert(next.map(e => ({ ...e, client_id: clientId }))).then(() => {});
    }
  }

  function addMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!mName.trim()) return;
    const newEmp: Employee = {
      id:         Date.now().toString(36),
      name:       mName.trim(),
      role:       mRole.trim(),
      department: mDept,
      email:      mEmail.trim(),
      phone:      mPhone.trim(),
      status:     mStatus,
    };
    saveEmployees([...employees, newEmp]);
    setShowModal(false);
    setMName(""); setMRole(""); setMDept("Engineering"); setMEmail(""); setMPhone(""); setMStatus("active");
  }

  function removeEmployee(id: string) {
    saveEmployees(employees.filter(e => e.id !== id));
  }

  function initials(name: string): string {
    return name.split(" ").map(p => p[0]).join("").slice(0,2).toUpperCase();
  }

  const deptColor = (dept: string) => DEPT_COLORS[dept] ?? "#6b7280";

  const uniqueDepts = Array.from(new Set(employees.map(e => e.department)));
  const filtered    = filterDept === "All" ? employees : employees.filter(e => e.department === filterDept);
  const activeCount = employees.filter(e => e.status === "active").length;


  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:200, color:muted, fontFamily:F }}>
        Loading team data…
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes status-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.5); }
        }
        .status-pulse { animation: status-pulse 2s ease-in-out infinite; }
        .emp-card { transition: box-shadow 0.15s, transform 0.15s; }
        .emp-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.09) !important; transform: translateY(-2px); }
        .emp-card:hover .emp-del { opacity: 1 !important; }
        .emp-del { opacity: 0; transition: opacity 0.15s; }
        .dept-tab { transition: background 0.15s, color 0.15s; }
        @media (max-width: 640px) {
          .emp-grid { grid-template-columns: 1fr !important; }
          .emp-stats-row { flex-direction: column !important; gap: 8px !important; }
        }
        @media (max-width: 900px) {
          .emp-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexDirection:"column", gap:20, fontFamily:F }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <h1 style={{ fontSize:"1.4rem", fontWeight:700, color:text, margin:0 }}>Our Team</h1>
              <span style={{ fontSize:"0.72rem", fontWeight:700, color:accent, background:`${accent}12`, padding:"2px 9px", borderRadius:999 }}>
                {employees.length} {employees.length === 1 ? "member" : "members"}
              </span>
            </div>
            <div style={{ fontSize:"0.78rem", color:muted, marginTop:4 }}>Manage your team directory</div>
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
            Add Member
          </button>
        </div>

        {/* Stats Row */}
        <div className="emp-stats-row" style={{ display:"flex", gap:12 }}>
          {[
            { label:"Total Members",  value: employees.length,    icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: accent },
            { label:"Departments",    value: uniqueDepts.length,  icon:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "#7c3aed" },
            { label:"Active Now",     value: activeCount,         icon:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "#059669" },
          ].map((s, i) => (
            <div key={i} style={{
              flex:"1 1 0", background:card, borderRadius:10, padding:"14px 18px",
              border:`1px solid ${border}`, boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
              display:"flex", alignItems:"center", gap:12,
            }}>
              <div style={{ width:36, height:36, borderRadius:9, background:`${s.color}12`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.icon}/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:"1.4rem", fontWeight:700, color:text, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:"0.72rem", color:muted, marginTop:3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Department Filter Tabs */}
        {employees.length > 0 && (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["All", ...uniqueDepts].map(dept => {
              const isActive = filterDept === dept;
              const dc = dept === "All" ? accent : deptColor(dept);
              return (
                <button
                  key={dept}
                  className="dept-tab"
                  onClick={() => setFilterDept(dept)}
                  style={{
                    padding:"6px 14px", borderRadius:999, border:"none", cursor:"pointer",
                    fontFamily:F, fontSize:"0.78rem", fontWeight:600,
                    background: isActive ? (dept === "All" ? accent : dc) : `${dc}10`,
                    color:      isActive ? "#ffffff" : dc,
                  }}
                >
                  {dept}
                </button>
              );
            })}
          </div>
        )}

        {/* Employee Grid */}
        {filtered.length === 0 ? (
          <div style={{ background:card, borderRadius:12, border:`1px solid ${border}`, padding:"56px 24px", textAlign:"center" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:`${accent}10`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div style={{ fontSize:"0.9rem", fontWeight:600, color:text, marginBottom:6 }}>
              {filterDept !== "All" ? `No team members in ${filterDept}` : "No team members yet"}
            </div>
            <div style={{ fontSize:"0.78rem", color:muted, maxWidth:320, margin:"0 auto" }}>
              {filterDept === "All"
                ? "Add your first team member to get started."
                : `Try selecting a different department filter.`}
            </div>
          </div>
        ) : (
          <div className="emp-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {filtered.map(emp => {
              const dc  = deptColor(emp.department);
              const st  = STATUS_CONFIG[emp.status] ?? STATUS_CONFIG.offline;
              return (
                <div key={emp.id} className="emp-card" style={{
                  background:card, borderRadius:12, padding:"20px",
                  border:`1px solid ${border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
                  position:"relative", display:"flex", flexDirection:"column", gap:14,
                }}>
                  {/* Delete button */}
                  <button
                    className="emp-del"
                    onClick={() => removeEmployee(emp.id)}
                    style={{
                      position:"absolute", top:12, right:12,
                      width:24, height:24, borderRadius:"50%",
                      background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.15)",
                      color:"#dc2626", fontSize:"0.9rem", lineHeight:1,
                      cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:F,
                    }}
                  >
                    ×
                  </button>

                  {/* Avatar + Status */}
                  <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                    <div style={{ position:"relative", flexShrink:0 }}>
                      <div style={{
                        width:52, height:52, borderRadius:"50%",
                        background:`${dc}20`,
                        border:`2px solid ${dc}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"1rem", fontWeight:700, color:dc, letterSpacing:"0.02em",
                      }}>
                        {initials(emp.name)}
                      </div>
                      <div style={{
                        position:"absolute", bottom:1, right:1,
                        width:11, height:11, borderRadius:"50%",
                        background:st.color,
                        border:`2px solid ${card}`,
                      }}>
                        {emp.status === "active" && (
                          <div className="status-pulse" style={{ width:"100%", height:"100%", borderRadius:"50%", background:st.color, opacity:0.6 }} />
                        )}
                      </div>
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"0.95rem", fontWeight:700, color:text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {emp.name}
                      </div>
                      <div style={{ fontSize:"0.78rem", color:muted, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {emp.role || "No role set"}
                      </div>
                      <div style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:6 }}>
                        <span style={{ fontSize:"0.65rem", fontWeight:600, color:dc, background:`${dc}12`, padding:"2px 8px", borderRadius:999 }}>
                          {emp.department}
                        </span>
                        <span style={{ fontSize:"0.65rem", fontWeight:600, color:st.color, background:st.bg, padding:"2px 8px", borderRadius:999, display:"flex", alignItems:"center", gap:4 }}>
                          <span style={{ width:5, height:5, borderRadius:"50%", background:st.color, display:"block" }} />
                          {st.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div style={{ display:"flex", flexDirection:"column", gap:6, paddingTop:12, borderTop:`1px solid ${border}` }}>
                    {emp.email && (
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        <span style={{ fontSize:"0.72rem", color:muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {emp.email}
                        </span>
                      </div>
                    )}
                    {emp.phone && (
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                        <span style={{ fontSize:"0.72rem", color:muted }}>
                          {emp.phone}
                        </span>
                      </div>
                    )}
                    {!emp.email && !emp.phone && (
                      <span style={{ fontSize:"0.7rem", color:muted, fontStyle:"italic" }}>No contact info</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div style={{
          position:"fixed", inset:0, zIndex:100,
          background:"rgba(0,0,0,0.45)", backdropFilter:"blur(3px)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:16,
        }}>
          <div style={{
            background:card, borderRadius:14, padding:"28px",
            width:"100%", maxWidth:480,
            boxShadow:"0 20px 60px rgba(0,0,0,0.2)",
            maxHeight:"90vh", overflowY:"auto",
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
              <div style={{ fontSize:"1rem", fontWeight:700, color:text }}>Add Team Member</div>
              <button onClick={() => setShowModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color: muted, fontSize:"1.3rem", lineHeight:1, fontFamily:F }}>×</button>
            </div>

            <form onSubmit={addMember} style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Full Name */}
              <div>
                <label style={{ fontSize:"0.72rem", fontWeight:600, color:muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Full Name *</label>
                <input
                  type="text" required value={mName} onChange={e => setMName(e.target.value)}
                  placeholder="e.g. Sarah Johnson"
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${inputBdr}`, fontSize:"0.85rem", fontFamily:F, color:text, background:inputBg, outline:"none", boxSizing:"border-box" }}
                />
              </div>

              {/* Role */}
              <div>
                <label style={{ fontSize:"0.72rem", fontWeight:600, color:muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Role / Title</label>
                <input
                  type="text" value={mRole} onChange={e => setMRole(e.target.value)}
                  placeholder="e.g. Senior Developer"
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${inputBdr}`, fontSize:"0.85rem", fontFamily:F, color:text, background:inputBg, outline:"none", boxSizing:"border-box" }}
                />
              </div>

              {/* Department */}
              <div>
                <label style={{ fontSize:"0.72rem", fontWeight:600, color:muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Department</label>
                <select value={mDept} onChange={e => setMDept(e.target.value)} style={{
                  width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${inputBdr}`,
                  fontSize:"0.85rem", fontFamily:F, color:text, background:inputBg, outline:"none",
                }}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize:"0.72rem", fontWeight:600, color:muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Email</label>
                <input
                  type="email" value={mEmail} onChange={e => setMEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${inputBdr}`, fontSize:"0.85rem", fontFamily:F, color:text, background:inputBg, outline:"none", boxSizing:"border-box" }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize:"0.72rem", fontWeight:600, color:muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Phone</label>
                <input
                  type="tel" value={mPhone} onChange={e => setMPhone(e.target.value)}
                  placeholder="+44 7xxx xxxxxx"
                  style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:`1px solid ${inputBdr}`, fontSize:"0.85rem", fontFamily:F, color:text, background:inputBg, outline:"none", boxSizing:"border-box" }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize:"0.72rem", fontWeight:600, color:muted, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>Status</label>
                <div style={{ display:"flex", gap:0, borderRadius:8, overflow:"hidden", border:`1px solid ${border}` }}>
                  {(["active","away","offline"] as const).map(st => {
                    const cfg = STATUS_CONFIG[st];
                    return (
                      <button key={st} type="button" onClick={() => setMStatus(st)} style={{
                        flex:1, padding:"8px 0", border:"none", cursor:"pointer", fontFamily:F,
                        fontSize:"0.78rem", fontWeight:600, transition:"background 0.15s, color 0.15s",
                        background: mStatus === st ? cfg.color : inputBg,
                        color:      mStatus === st ? "#ffffff" : muted,
                      }}>
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
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
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
