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

type Message = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

export default function ClientTranscripts() {
  const supabase = createClient();
  const { isDark, card, text, muted, border, inputBg, inputBdr } = useTheme();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const clientId = user.user_metadata?.client_id;
      const role = user.user_metadata?.role;

      let query = supabase
        .from("chat_sessions")
        .select("*")
        .order("started_at", { ascending: false });

      if (role !== "admin" && clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data } = await query;
      setSessions(data ?? []);
      setLoading(false);
    })();

    // Live updates
    const channel = supabase
      .channel("transcripts-sessions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_sessions" },
        payload => setSessions(prev => [payload.new as Session, ...prev]))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function openSession(session: Session) {
    setSelected(session);
    setMsgLoading(true);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", session.session_id)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
    setMsgLoading(false);
  }

  const filtered = sessions.filter(s =>
    search === "" ? true :
    s.page_url?.toLowerCase().includes(search.toLowerCase()) ||
    new Date(s.started_at).toLocaleDateString("en-GB").includes(search)
  );

  const formatDate = (ts: string) => new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: muted, fontStyle: "italic", marginBottom: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            AI Chatbot
          </div>
          <h1 style={{ fontFamily: "Sora", fontWeight: 800, fontSize: "1.6rem", color: text }}>
            Conversation Transcripts
          </h1>
          <p style={{ fontFamily: "DM Sans", fontSize: "0.875rem", color: muted, marginTop: 4 }}>
            {sessions.length} total conversation{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: muted }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by date or page…"
            style={{
              paddingLeft: 36, paddingRight: 16, paddingTop: 9, paddingBottom: 9,
              borderRadius: 10, border: `1px solid ${inputBdr}`,
              background: inputBg, fontFamily: "DM Sans", fontSize: "0.85rem",
              color: text, outline: "none", width: 240,
            }}
          />
        </div>
      </div>

      {/* ── Main panel ── */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: 20, alignItems: "start" }}>

        {/* ── Session list ── */}
        <div style={{ borderRadius: 16, background: card, border: `1px solid ${border}`, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 120px 100px 80px",
            padding: "12px 24px", borderBottom: `1px solid ${border}`,
            background: isDark ? "rgba(255,255,255,0.03)" : "linear-gradient(135deg,#f8faff,#f0f6ff)",
          }}>
            {["Conversation", "Date", "Time", ""].map(h => (
              <div key={h} style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.68rem", color: muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: "56px", textAlign: "center", color: muted, fontFamily: "DM Sans" }}>Loading conversations…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "64px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: 14 }}>💬</div>
              <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.95rem", color: muted }}>No conversations found</div>
              <div style={{ fontFamily: "DM Sans", fontSize: "0.82rem", color: muted, marginTop: 6 }}>
                {search ? "Try a different search." : "Conversations will appear here as your visitors chat."}
              </div>
            </div>
          ) : filtered.map((session, i) => (
            <div
              key={session.id}
              onClick={() => openSession(session)}
              style={{
                display: "grid", gridTemplateColumns: "1fr 120px 100px 80px",
                padding: "15px 24px",
                borderBottom: i < filtered.length - 1 ? "1px solid rgba(37,99,235,0.05)" : "none",
                cursor: "pointer",
                background: selected?.id === session.id ? "rgba(37,99,235,0.06)" : card,
                transition: "background 0.12s",
                alignItems: "center",
              }}
              onMouseEnter={e => { if (selected?.id !== session.id) (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(37,99,235,0.02)"; }}
              onMouseLeave={e => { if (selected?.id !== session.id) (e.currentTarget as HTMLElement).style.background = card; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#2563eb,#0ea5e9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Sora", fontWeight: 700, color: "#fff", fontSize: "0.82rem",
                }}>
                  💬
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "Sora", fontWeight: 600, fontSize: "0.87rem", color: text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Visitor conversation
                  </div>
                  <div style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: muted, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {session.page_url ? new URL(session.page_url).hostname : "—"}
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: "DM Sans", fontSize: "0.82rem", color: text }}>
                {formatDate(session.started_at)}
              </div>
              <div style={{ fontFamily: "DM Sans", fontSize: "0.82rem", color: muted }}>
                {formatTime(session.started_at)}
              </div>
              <div>
                <span style={{
                  fontFamily: "Sora", fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                  background: selected?.id === session.id ? "rgba(37,99,235,0.15)" : "rgba(37,99,235,0.08)",
                  color: "#2563eb",
                }}>
                  View →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Detail panel ── */}
        {selected && (
          <div style={{
            borderRadius: 16, background: card, border: `1px solid ${border}`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            display: "flex", flexDirection: "column",
            maxHeight: "78vh", overflow: "hidden",
            position: "sticky", top: 96,
          }}>
            <div style={{
              padding: "18px 22px", borderBottom: `1px solid ${border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: isDark ? "rgba(255,255,255,0.03)" : "linear-gradient(135deg,#f8faff,#f0f6ff)", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "linear-gradient(135deg,#2563eb,#0ea5e9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.1rem", boxShadow: "0 3px 10px rgba(37,99,235,0.3)",
                }}>💬</div>
                <div>
                  <div style={{ fontFamily: "Sora", fontWeight: 700, fontSize: "0.9rem", color: text }}>Visitor Conversation</div>
                  <div style={{ fontFamily: "DM Sans", fontSize: "0.75rem", color: muted, fontStyle: "italic" }}>
                    {formatDate(selected.started_at)} at {formatTime(selected.started_at)}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{
                width: 30, height: 30, borderRadius: "50%", border: `1px solid ${border}`,
                background: inputBg, cursor: "pointer", color: muted,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem", lineHeight: 1, transition: "all 0.15s",
              }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "18px", display: "flex", flexDirection: "column", gap: 12 }}>
              {msgLoading ? (
                <div style={{ textAlign: "center", color: muted, padding: "2rem", fontFamily: "DM Sans" }}>Loading messages…</div>
              ) : messages.length === 0 ? (
                <p style={{ fontFamily: "DM Sans", color: muted, fontSize: "0.875rem", textAlign: "center", marginTop: 24 }}>No messages recorded.</p>
              ) : messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
                    <div style={{ fontSize: "0.67rem", fontFamily: "Sora", fontWeight: 700, color: muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {isUser ? "Visitor" : "⚡ AI"}
                    </div>
                    <div style={{
                      maxWidth: "88%", padding: "10px 14px",
                      borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: isUser ? "linear-gradient(135deg,#2563eb,#0ea5e9)" : (isDark ? "rgba(255,255,255,0.06)" : "#f8fafc"),
                      border: isUser ? "none" : `1px solid ${border}`,
                      color: isUser ? "#fff" : text,
                      fontFamily: "DM Sans", fontSize: "0.855rem", lineHeight: 1.6,
                      boxShadow: isUser ? "0 3px 12px rgba(37,99,235,0.25)" : "none",
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: muted, marginTop: 3, fontFamily: "DM Sans" }}>
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "14px 22px", borderTop: `1px solid ${border}`, flexShrink: 0, background: isDark ? "rgba(255,255,255,0.03)" : "linear-gradient(135deg,#f8faff,#f0f6ff)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "DM Sans", fontSize: "0.78rem", color: muted, fontStyle: "italic" }}>
                  {messages.length} messages exchanged
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "block" }} />
                  <span style={{ fontFamily: "Sora", fontSize: "0.72rem", fontWeight: 700, color: "#059669" }}>Logged</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}