"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { getTokens } from "@/lib/theme-context";

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [clientId, setClientId]     = useState("");
  const [displayName, setDisplayName] = useState("");
  const [colourMode, setColourMode]   = useState("light");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [email, setEmail]           = useState("");
  const [socialLinks, setSocialLinks] = useState({ facebook: "", instagram: "", linkedin: "", twitter: "", whatsapp: "" });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");
      const cid = user.user_metadata?.client_id || "";
      setClientId(cid);
      setDisplayName(user.user_metadata?.business_name || "");

      const { data } = await supabase
        .from("client_settings")
        .select("display_name,colour_mode,email_notifications,social_links")
        .eq("client_id", cid)
        .single();

      if (data) {
        if (data.display_name) setDisplayName(data.display_name);
        if (data.colour_mode)  setColourMode(data.colour_mode);
        if (data.email_notifications !== null) setEmailNotifs(data.email_notifications);
        if (data.social_links) setSocialLinks({ facebook: "", instagram: "", linkedin: "", twitter: "", whatsapp: "", ...data.social_links });
      }

      setLoading(false);
    })();
  }, []);

  async function save() {
    setSaving(true);
    await supabase.from("client_settings").upsert({
      client_id: clientId,
      display_name: displayName,
      colour_mode: colourMode,
      email_notifications: emailNotifs,
      social_links: socialLinks,
      updated_at: new Date().toISOString(),
    }, { onConflict: "client_id" });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // Settings page uses local colourMode for preview (not context)
  const isDark = colourMode === "dark";
  const { card, text, muted, border, inputBg, inputBdr } = getTokens(isDark);
  const sectionHdrBg = isDark ? "rgba(255,255,255,0.03)" : "linear-gradient(135deg,#f8faff,#f0f6ff)";
  const sectionBorderColor = isDark ? border : "rgba(37,99,235,0.08)";
  const sectionHdrBorder = isDark ? border : "rgba(37,99,235,0.07)";

  if (loading) return <div style={{ padding: "2rem", color: muted, fontFamily: "DM Sans" }}>Loading settings…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 720 }}>

      {/* Header */}
      <div>
        <div style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: muted, fontStyle: "italic", marginBottom: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Portal
        </div>
        <h1 style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.6rem", color: text }}>Settings</h1>
        <p style={{ fontFamily: "DM Sans", fontSize: "0.875rem", color: muted, marginTop: 4 }}>
          Manage your portal preferences and display options
        </p>
      </div>

      {/* Profile */}
      <div style={{ borderRadius: 16, background: card, border: `1px solid ${sectionBorderColor}`, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${sectionHdrBorder}`, background: sectionHdrBg }}>
          <h2 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.95rem", color: text }}>Profile</h2>
          <p style={{ fontFamily: "DM Sans", fontSize: "0.78rem", color: muted, marginTop: 2 }}>How your business appears in the portal</p>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontFamily: "Sora", fontSize: "0.8rem", fontWeight: 600, color: isDark ? muted : "#475569", display: "block", marginBottom: 8 }}>
                Display Name
              </label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your business name"
                style={{
                  width: "100%", padding: "10px 14px",
                  borderRadius: 10, border: `1px solid ${inputBdr}`,
                  fontFamily: "DM Sans", fontSize: "0.9rem", color: text,
                  outline: "none", background: inputBg,
                  transition: "border-color 150ms",
                }}
              />
            </div>
            <div>
              <label style={{ fontFamily: "Sora", fontSize: "0.8rem", fontWeight: 600, color: isDark ? muted : "#475569", display: "block", marginBottom: 8 }}>
                Email Address
              </label>
              <input
                value={email}
                disabled
                style={{
                  width: "100%", padding: "10px 14px",
                  borderRadius: 10, border: `1px solid ${border}`,
                  fontFamily: "DM Sans", fontSize: "0.9rem", color: muted,
                  outline: "none", background: isDark ? "rgba(255,255,255,0.03)" : "#f1f5f9", cursor: "not-allowed",
                }}
              />
              <p style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: muted, marginTop: 4 }}>
                Contact support to change your email address
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div style={{ borderRadius: 16, background: card, border: `1px solid ${sectionBorderColor}`, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${sectionHdrBorder}`, background: sectionHdrBg }}>
          <h2 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.95rem", color: text }}>Appearance</h2>
          <p style={{ fontFamily: "DM Sans", fontSize: "0.78rem", color: muted, marginTop: 2 }}>Customise how the portal looks</p>
        </div>
        <div style={{ padding: "24px" }}>
          {/* Colour mode */}
          <div>
            <label style={{ fontFamily: "Sora", fontSize: "0.8rem", fontWeight: 600, color: isDark ? muted : "#475569", display: "block", marginBottom: 12 }}>
              Colour Mode
            </label>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { value: "light", label: "☀️ Light", desc: "Clean white interface" },
                { value: "dark",  label: "🌙 Dark",  desc: "Easy on the eyes" },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setColourMode(value)}
                  style={{
                    flex: 1, padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                    border: colourMode === value ? "2px solid #2563eb" : `1.5px solid ${border}`,
                    background: colourMode === value ? "rgba(37,99,235,0.08)" : inputBg,
                    textAlign: "left", transition: "all 150ms",
                  }}
                >
                  <div style={{ fontFamily: "Sora", fontWeight: 600, fontSize: "0.875rem", color: colourMode === value ? "#2563eb" : text }}>{label}</div>
                  <div style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: muted, marginTop: 2 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ borderRadius: 16, background: card, border: `1px solid ${sectionBorderColor}`, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${sectionHdrBorder}`, background: sectionHdrBg }}>
          <h2 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.95rem", color: text }}>Notifications</h2>
          <p style={{ fontFamily: "DM Sans", fontSize: "0.78rem", color: muted, marginTop: 2 }}>Choose what you get notified about</p>
        </div>
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "Sora", fontWeight: 600, fontSize: "0.875rem", color: text }}>Email notifications</div>
              <div style={{ fontFamily: "DM Sans", fontSize: "0.78rem", color: muted, marginTop: 2 }}>Get notified when a new chat conversation starts</div>
            </div>
            <button
              onClick={() => setEmailNotifs(v => !v)}
              style={{
                width: 48, height: 26, borderRadius: 999, border: "none",
                background: emailNotifs ? "#2563eb" : (isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0"),
                cursor: "pointer", position: "relative", transition: "background 200ms",
                flexShrink: 0,
              }}
            >
              <span style={{
                position: "absolute", top: 3,
                left: emailNotifs ? 25 : 3,
                width: 20, height: 20, borderRadius: "50%",
                background: "white", transition: "left 200ms",
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }} />
            </button>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div style={{ borderRadius: 16, background: card, border: `1px solid ${sectionBorderColor}`, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${sectionHdrBorder}`, background: sectionHdrBg }}>
          <h2 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.95rem", color: text }}>Social Media</h2>
          <p style={{ fontFamily: "DM Sans", fontSize: "0.78rem", color: muted, marginTop: 2 }}>Connect your business social profiles</p>
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {([
            { key: "facebook",  label: "Facebook",  placeholder: "https://facebook.com/yourbusiness",  color: "#1877f2", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
            { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourbusiness", color: "#e1306c", icon: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01M7.55 2h8.9A5.55 5.55 0 0122 7.55v8.9A5.55 5.55 0 0116.45 22H7.55A5.55 5.55 0 012 16.45V7.55A5.55 5.55 0 017.55 2z" },
            { key: "linkedin",  label: "LinkedIn",  placeholder: "https://linkedin.com/company/yourbusiness", color: "#0a66c2", icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm2-3a2 2 0 100-4 2 2 0 000 4z" },
            { key: "twitter",   label: "X / Twitter", placeholder: "https://x.com/yourbusiness",       color: isDark ? "#aaaaaa" : "#000000", icon: "M4 4l16 16M4 20L20 4" },
            { key: "whatsapp",  label: "WhatsApp",  placeholder: "https://wa.me/447700000000",         color: "#25d366", icon: "M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" },
          ] as const).map(({ key, label, placeholder, color, icon }) => (
            <div key={key}>
              <label style={{ fontFamily: "Sora", fontSize: "0.8rem", fontWeight: 600, color: isDark ? muted : "#475569", display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon} />
                  </svg>
                </span>
                {label}
                {socialLinks[key] && (
                  <a href={socialLinks[key]} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", fontSize: "0.7rem", color: color, fontFamily: "DM Sans" }}>
                    Connected ✓
                  </a>
                )}
              </label>
              <input
                value={socialLinks[key]}
                onChange={e => setSocialLinks(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                style={{
                  width: "100%", padding: "9px 13px",
                  borderRadius: 9, border: socialLinks[key] ? `1.5px solid ${color}40` : `1px solid ${inputBdr}`,
                  fontFamily: "DM Sans", fontSize: "0.85rem", color: text,
                  outline: "none", background: socialLinks[key] ? `${color}08` : inputBg,
                  transition: "border-color 150ms, background 150ms",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Account info */}
      <div style={{ borderRadius: 16, background: card, border: `1px solid ${sectionBorderColor}`, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${sectionHdrBorder}`, background: sectionHdrBg }}>
          <h2 style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.95rem", color: text }}>Account</h2>
        </div>
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Client ID", value: clientId },
            { label: "Portal Access", value: "Active" },
            { label: "Support", value: "hello@zempotis.com" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${border}` }}>
              <span style={{ fontFamily: "Sora", fontSize: "0.82rem", fontWeight: 600, color: muted }}>{label}</span>
              <span style={{ fontFamily: "DM Sans", fontSize: "0.82rem", color: text }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12 }}>
        {saved && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 999, background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "block" }} />
            <span style={{ fontFamily: "Sora", fontSize: "0.78rem", fontWeight: 700, color: "#059669" }}>Saved successfully</span>
          </div>
        )}
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: "12px 28px", borderRadius: 10, border: "none",
            background: saving ? "#94a3b8" : "linear-gradient(135deg,#2563eb,#0ea5e9)",
            color: "white", fontFamily: "Sora", fontWeight: 600, fontSize: "0.875rem",
            cursor: saving ? "default" : "pointer",
            boxShadow: saving ? "none" : "0 4px 16px rgba(37,99,235,0.3)",
            transition: "all 150ms",
          }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
