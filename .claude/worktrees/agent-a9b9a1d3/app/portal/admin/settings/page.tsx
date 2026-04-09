"use client";
// app/portal/admin/settings/page.tsx

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

type Profile = { name: string; email: string; phone: string; bio: string; };
type Notifs  = { new_client: boolean; new_enquiry: boolean; invoice_paid: boolean; call_completed: boolean; weekly_report: boolean; };
type ApiKeys = { vapi: string; twilio_sid: string; twilio_token: string; resend: string; supabase_url: string; groq: string; stripe: string; };

function MaskInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        className="form-input"
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? "Enter key…"}
        style={{ paddingRight: 42, fontFamily: show ? "monospace" : undefined, fontSize: show ? "0.82rem" : undefined }}
        autoComplete="off"
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2 }}
      >
        {show ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        )}
      </button>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{ width: 42, height: 24, borderRadius: 12, background: checked ? "#2563eb" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
    >
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: checked ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

export default function AdminSettings() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile>({ name: "", email: "", phone: "", bio: "" });
  const [notifs,  setNotifs]  = useState<Notifs>({ new_client: true, new_enquiry: true, invoice_paid: true, call_completed: false, weekly_report: true });
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ vapi: "", twilio_sid: "", twilio_token: "", resend: "", supabase_url: "", groq: "", stripe: "" });

  const [saving,         setSaving]         = useState<string | null>(null);
  const [saved,          setSaved]          = useState<string | null>(null);
  const [activeSection,  setActiveSection]  = useState<"profile" | "notifications" | "api-keys">("profile");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          name:  user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Admin",
          email: user.email ?? "",
          phone: user.user_metadata?.phone ?? "",
          bio:   user.user_metadata?.bio ?? "",
        });
      }
    })();
  }, []);

  const saveSection = async (section: string) => {
    setSaving(section);
    if (section === "profile") {
      await supabase.auth.updateUser({
        data: { full_name: profile.name, phone: profile.phone, bio: profile.bio },
      });
      await supabase.from("activity_log").insert([{
        event_type: "settings_updated",
        title: "Admin profile updated",
        description: `Name: ${profile.name}`,
        metadata: {},
      }]);
    }
    // For notifications and API keys, store in localStorage (client-side) or a settings table
    if (section === "notifications") {
      localStorage.setItem("admin_notifs", JSON.stringify(notifs));
    }
    if (section === "api-keys") {
      // Note: In production, API keys should be stored server-side / .env.local
      // This section guides the admin on which keys are needed
      await supabase.from("activity_log").insert([{
        event_type: "settings_updated",
        title: "API key settings reviewed",
        description: "Admin reviewed API key configuration",
        metadata: {},
      }]);
    }
    setSaving(null);
    setSaved(section);
    setTimeout(() => setSaved(null), 2500);
  };

  const SECTION_TABS = [
    { id: "profile",       label: "Profile",        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: "notifications", label: "Notifications",  icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
    { id: "api-keys",      label: "API Keys",       icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" },
  ] as const;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.65rem", margin: "0 0 4px", color: "#0f172a" }}>Settings</h1>
        <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.845rem", fontFamily: "Sora, sans-serif" }}>
          Admin profile, notifications &amp; API key management
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>

        {/* Sidebar Tabs */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 10px rgba(37,99,235,0.04)", overflow: "hidden" }}>
          {SECTION_TABS.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setActiveSection(id)} style={{
              display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "13px 16px",
              border: "none", background: activeSection === id ? "linear-gradient(135deg,rgba(37,99,235,0.07),rgba(14,165,233,0.04))" : "transparent",
              borderLeft: activeSection === id ? "3px solid #2563eb" : "3px solid transparent",
              cursor: "pointer", transition: "all 0.12s",
              fontFamily: "Sora, sans-serif", fontSize: "0.845rem", fontWeight: activeSection === id ? 700 : 500,
              color: activeSection === id ? "#1d4ed8" : "#64748b",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon} />
              </svg>
              {label}
            </button>
          ))}
        </div>

        {/* Main Panel */}
        <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(37,99,235,0.07)", boxShadow: "0 2px 14px rgba(37,99,235,0.05)", overflow: "hidden" }}>

          {/* ── Profile Section ── */}
          {activeSection === "profile" && (
            <div>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(37,99,235,0.07)", background: "linear-gradient(135deg,#f8faff,#f0f6ff)" }}>
                <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.92rem", color: "#0f172a", margin: 0 }}>Admin Profile</h3>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.72rem", color: "#94a3b8", margin: "3px 0 0" }}>Your name and contact information</p>
              </div>
              <div style={{ padding: "24px" }}>
                {/* Avatar */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora", fontWeight: 700, fontSize: "1.5rem", color: "white", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}>
                    {profile.name.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div>
                    <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>{profile.name || "Admin"}</div>
                    <div style={{ fontFamily: "Sora, sans-serif", fontSize: "0.78rem", color: "#94a3b8" }}>{profile.email}</div>
                    <span style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb", fontFamily: "Sora", fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.04em" }}>Super Admin</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Admin" />
                    </div>
                    <div>
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" value={profile.email} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+44 7700 000000" />
                  </div>
                  <div>
                    <label className="form-label">Bio</label>
                    <textarea className="form-input" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Short bio or notes…" rows={3} style={{ resize: "vertical" }} />
                  </div>
                  <div>
                    <button
                      onClick={() => saveSection("profile")}
                      disabled={saving === "profile"}
                      className="btn btn-primary"
                      style={{ padding: "10px 24px", fontSize: "0.85rem" }}
                    >
                      {saving === "profile" ? "Saving…" : saved === "profile" ? "✓ Saved!" : "Save Profile"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Notifications Section ── */}
          {activeSection === "notifications" && (
            <div>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(37,99,235,0.07)", background: "linear-gradient(135deg,#f8faff,#f0f6ff)" }}>
                <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.92rem", color: "#0f172a", margin: 0 }}>Notification Preferences</h3>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.72rem", color: "#94a3b8", margin: "3px 0 0" }}>Choose which events trigger notifications</p>
              </div>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { key: "new_client"      as const, label: "New client signup",      desc: "When a new client is added to the portal" },
                  { key: "new_enquiry"     as const, label: "New enquiry received",   desc: "When a contact form enquiry comes in" },
                  { key: "invoice_paid"    as const, label: "Invoice paid",           desc: "When an invoice is marked as paid" },
                  { key: "call_completed"  as const, label: "AI call completed",      desc: "When a Vapi assistant completes a call" },
                  { key: "weekly_report"   as const, label: "Weekly summary report",  desc: "Sunday evening overview of the week's activity" },
                ].map(({ key, label, desc }, i, arr) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(37,99,235,0.06)" : "none" }}>
                    <div>
                      <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#0f172a" }}>{label}</div>
                      <div style={{ fontFamily: "Sora, sans-serif", fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>{desc}</div>
                    </div>
                    <Toggle checked={notifs[key]} onChange={v => setNotifs({ ...notifs, [key]: v })} />
                  </div>
                ))}
                <div style={{ marginTop: 20 }}>
                  <button onClick={() => saveSection("notifications")} disabled={saving === "notifications"} className="btn btn-primary" style={{ padding: "10px 24px", fontSize: "0.85rem" }}>
                    {saving === "notifications" ? "Saving…" : saved === "notifications" ? "✓ Saved!" : "Save Preferences"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── API Keys Section ── */}
          {activeSection === "api-keys" && (
            <div>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(37,99,235,0.07)", background: "linear-gradient(135deg,#f8faff,#f0f6ff)" }}>
                <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.92rem", color: "#0f172a", margin: 0 }}>API Keys</h3>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.72rem", color: "#94a3b8", margin: "3px 0 0" }}>Manage integration keys for Vapi, Twilio, Resend &amp; Supabase</p>
              </div>

              {/* Warning banner */}
              <div style={{ margin: "20px 24px 0", background: "rgba(217,119,6,0.06)", border: "1px solid rgba(217,119,6,0.18)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.78rem", color: "#92400e", margin: 0, lineHeight: 1.5 }}>
                  <strong>Security note:</strong> Store API keys in <code style={{ background: "rgba(217,119,6,0.12)", padding: "1px 5px", borderRadius: 3 }}>.env.local</code> for production. This panel shows your current configuration and serves as a reference for which keys are needed.
                </p>
              </div>

              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  {
                    section: "Vapi",
                    color: "#7c3aed",
                    items: [
                      { key: "vapi" as const, label: "Vapi API Key", placeholder: "vapi_...", hint: "Found in app.vapi.ai → Account → API Keys" },
                    ]
                  },
                  {
                    section: "Twilio",
                    color: "#e11d48",
                    items: [
                      { key: "twilio_sid"   as const, label: "Twilio Account SID",   placeholder: "ACxxxxxxxxxx", hint: "Found in Twilio Console dashboard" },
                      { key: "twilio_token" as const, label: "Twilio Auth Token",     placeholder: "Auth token…",  hint: "Found in Twilio Console → Account Info" },
                    ]
                  },
                  {
                    section: "Resend",
                    color: "#0ea5e9",
                    items: [
                      { key: "resend" as const, label: "Resend API Key", placeholder: "re_...", hint: "Found in resend.com → API Keys" },
                    ]
                  },
                  {
                    section: "Supabase",
                    color: "#059669",
                    items: [
                      { key: "supabase_url" as const, label: "Supabase Project URL", placeholder: "https://xxxx.supabase.co", hint: "Found in Supabase → Project Settings → API" },
                    ]
                  },
                  {
                    section: "Groq",
                    color: "#f59e0b",
                    items: [
                      { key: "groq" as const, label: "Groq API Key", placeholder: "gsk_...", hint: "Found in console.groq.com → API Keys" },
                    ]
                  },
                  {
                    section: "Stripe",
                    color: "#635bff",
                    items: [
                      { key: "stripe" as const, label: "Stripe Secret Key", placeholder: "sk_live_...", hint: "Found in Stripe Dashboard → Developers → API Keys" },
                    ]
                  },
                ].map(({ section, color, items }) => (
                  <div key={section} style={{ borderRadius: 12, border: "1px solid rgba(37,99,235,0.07)", overflow: "hidden" }}>
                    <div style={{ padding: "11px 16px", background: `${color}08`, borderBottom: "1px solid rgba(37,99,235,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                      <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.8rem", color: "#334155" }}>{section}</span>
                    </div>
                    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                      {items.map(({ key, label, placeholder, hint }) => (
                        <div key={key}>
                          <label className="form-label">{label}</label>
                          <MaskInput
                            value={apiKeys[key]}
                            onChange={v => setApiKeys({ ...apiKeys, [key]: v })}
                            placeholder={placeholder}
                          />
                          <p style={{ fontFamily: "Sora, sans-serif", fontSize: "0.7rem", color: "#94a3b8", margin: "5px 0 0" }}>{hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid rgba(37,99,235,0.06)" }}>
                  <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.78rem", color: "#334155", marginBottom: 8 }}>Add to .env.local</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#334155", lineHeight: 2, background: "#f1f5f9", borderRadius: 8, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
                    VAPI_API_KEY=...<br/>
                    TWILIO_ACCOUNT_SID=...<br/>
                    TWILIO_AUTH_TOKEN=...<br/>
                    RESEND_API_KEY=...<br/>
                    NEXT_PUBLIC_SUPABASE_URL=...<br/>
                    GROQ_API_KEY=...<br/>
                    STRIPE_SECRET_KEY=...<br/>
                    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
                  </div>
                </div>

                <div>
                  <button onClick={() => saveSection("api-keys")} disabled={saving === "api-keys"} className="btn btn-primary" style={{ padding: "10px 24px", fontSize: "0.85rem" }}>
                    {saving === "api-keys" ? "Saving…" : saved === "api-keys" ? "✓ Acknowledged!" : "Save / Acknowledge"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
