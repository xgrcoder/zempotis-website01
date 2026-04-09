"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

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

export default function AdminTranscripts() {
  const supabase = createClient();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selected, setSelected] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);

  useEffect(() => {
    async function fetchSessions() {
      const { data } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("started_at", { ascending: false });
      setSessions(data ?? []);
      setLoading(false);
    }
    fetchSessions();

    // Live: new conversations appear instantly
    const channel = supabase
      .channel("admin-sessions")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_sessions",
      }, payload => {
        setSessions(prev => [payload.new as Session, ...prev]);
      })
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      <div>
        <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.75rem", margin: "0 0 0.25rem" }}>
          Transcripts
        </h1>
        <p style={{ color: "var(--slate-500)", margin: 0, fontSize: "0.9rem" }}>
          {sessions.length} chat session{sessions.length !== 1 ? "s" : ""} across all clients
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: "1.5rem" }}>

        {/* Session list */}
        <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--slate-400)" }}>Loading…</div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💬</div>
              <p style={{ color: "var(--slate-400)", fontSize: "0.9rem" }}>No chat transcripts yet.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--off-white)", borderBottom: "1px solid var(--border)" }}>
                  {["Client", "Date", "Time", "Page", ""].map(h => (
                    <th key={h} style={{ padding: "0.875rem 1.25rem", textAlign: "left", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "var(--slate-500)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, i) => (
                  <tr
                    key={session.id}
                    onClick={() => openSession(session)}
                    style={{
                      borderBottom: i < sessions.length - 1 ? "1px solid var(--border)" : "none",
                      cursor: "pointer",
                      background: selected?.id === session.id ? "rgba(37,99,235,0.04)" : "white",
                      transition: "background 150ms",
                    }}
                  >
                    {/* Client ID badge */}
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{
                        background: "rgba(37,99,235,0.08)",
                        color: "#2563eb",
                        fontSize: "0.75rem", fontWeight: 700, padding: "4px 12px",
                        borderRadius: "999px", fontFamily: "Sora, sans-serif",
                        whiteSpace: "nowrap",
                      }}>
                        {session.client_id}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "var(--navy)" }}>
                        {new Date(session.started_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--slate-600)" }}>
                      {new Date(session.started_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", fontSize: "0.875rem", color: "var(--slate-500)", maxWidth: "200px" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {session.page_url ? new URL(session.page_url).pathname : "—"}
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <span style={{
                        background: "var(--off-white)",
                        color: "var(--slate-500)",
                        fontSize: "0.75rem", fontWeight: 700, padding: "4px 12px",
                        borderRadius: "999px", fontFamily: "Sora, sans-serif",
                      }}>
                        View →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Message thread */}
        {selected && (
          <div style={{ background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1rem", margin: 0 }}>
                💬 Chat Transcript
              </h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--slate-400)", fontSize: "1.25rem" }}>×</button>
            </div>

            {/* Client + date info */}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{
                background: "rgba(37,99,235,0.08)", color: "#2563eb",
                fontSize: "0.75rem", fontWeight: 700, padding: "4px 12px",
                borderRadius: "999px", fontFamily: "Sora, sans-serif",
              }}>
                {selected.client_id}
              </span>
              <span style={{ fontSize: "0.78rem", color: "var(--slate-400)", fontFamily: "Sora, sans-serif" }}>
                {new Date(selected.started_at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {" · "}
                {new Date(selected.started_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            {msgLoading ? (
              <div style={{ textAlign: "center", color: "var(--slate-400)", padding: "2rem" }}>Loading…</div>
            ) : messages.length === 0 ? (
              <p style={{ color: "var(--slate-400)", fontSize: "0.875rem" }}>No messages recorded.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "var(--radius-md)",
                    background: msg.role === "user" ? "rgba(37,99,235,0.06)" : "var(--off-white)",
                    border: `1px solid ${msg.role === "user" ? "rgba(37,99,235,0.15)" : "var(--border)"}`,
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "90%",
                  }}>
                    <div style={{ fontSize: "0.7rem", fontFamily: "Sora, sans-serif", fontWeight: 700, color: msg.role === "user" ? "var(--blue-600)" : "var(--slate-500)", marginBottom: "4px", textTransform: "capitalize" }}>
                      {msg.role === "user" ? "Visitor" : "Bot"}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--navy-800)", lineHeight: 1.6 }}>{msg.content}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--slate-400)", marginTop: "4px" }}>
                      {new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}