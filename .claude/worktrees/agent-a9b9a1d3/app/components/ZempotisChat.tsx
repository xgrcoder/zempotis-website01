"use client";
// app/components/ZempotisChat.tsx
// ─── Only change: clientId prop added to the component signature.
// ─── Your own site uses clientId="zempotis" (default).
// ─── EBS Barbers site uses <ZempotisChat clientId="ebs-barbers" />

import { useState, useRef, useEffect, useCallback } from "react";

interface Message { id: string; role: "user" | "assistant"; content: string; time: string; }
interface QuickReply { label: string; value: string; }
interface LeadFormData { name: string; email: string; company: string; phone: string; requirement: string; }

function now() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function uid() { return Math.random().toString(36).slice(2, 9); }

function LeadForm({ onSubmit }: { onSubmit: (data: LeadFormData) => void }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", requirement: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: false }));
  };
  const submit = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.name.trim()) newErrors.name = true;
    if (!form.email.trim()) newErrors.email = true;
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    onSubmit(form);
  };
  return (
    <div style={styles.leadForm}>
      <p style={styles.leadFormTitle}>Book your free strategy call</p>
      <div style={styles.leadGrid}>
        <input name="name" value={form.name} onChange={handle} placeholder="Full name *" style={{ ...styles.leadInput, ...(errors.name ? styles.inputError : {}) }} />
        <input name="company" value={form.company} onChange={handle} placeholder="Company" style={styles.leadInput} />
        <input name="email" value={form.email} onChange={handle} placeholder="Email address *" style={{ ...styles.leadInput, gridColumn: "1 / -1", ...(errors.email ? styles.inputError : {}) }} />
        <input name="phone" value={form.phone} onChange={handle} placeholder="Phone (optional)" style={{ ...styles.leadInput, gridColumn: "1 / -1" }} />
      </div>
      <textarea name="requirement" value={form.requirement} onChange={handle} placeholder="What do you need help with?" style={styles.leadTextarea} rows={3} />
      <button onClick={submit} style={styles.leadSubmit}>Request Free Consultation →</button>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={styles.typingWrap}>
      <div style={styles.botAvatar}>⚡</div>
      <div style={styles.typingBubble}>
        {[0, 1, 2].map((i) => <span key={i} style={{ ...styles.dot, animationDelay: `${i * 0.2}s` }} />)}
      </div>
    </div>
  );
}

export default function ZempotisChat({ clientId = "zempotis" }: { clientId?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [hasOpened, setHasOpened] = useState(false);
  const [showNotif, setShowNotif] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const sessionIdRef = useRef<string>(uid() + uid());

  const logMessage = useCallback(async (role: "user" | "assistant", content: string) => {
    try {
      await fetch("/api/chat-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, session_id: sessionIdRef.current, role, content, page_url: window.location.href }),
      });
    } catch (err) { console.error("[ZEMPOTIS LOG ERROR]", err); }
  }, [clientId]);

  const scroll = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scroll(); }, [messages, loading, showLeadForm]);

  useEffect(() => {
    if (open && !hasOpened) {
      setHasOpened(true);
      setShowNotif(false);
      const greeting = "Hi there! 👋 I'm Zara, Zempotis's AI assistant. I'm here to help you find the right solution for your business.\n\nWhat brings you here today?";
      setMessages([{ id: uid(), role: "assistant", content: greeting, time: now() }]);
      historyRef.current = [{ role: "assistant", content: greeting }];
      setQuickReplies([
        { label: "Tell me about your services", value: "Tell me about your services" },
        { label: "I want to book a call", value: "I want to book a free consultation call" },
        { label: "How much does it cost?", value: "What are your pricing plans?" },
        { label: "I need a chatbot", value: "I'm interested in an AI chatbot for my business" },
      ]);
      logMessage("assistant", greeting);
    }
  }, [open, hasOpened, logMessage]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput(""); setQuickReplies([]); setShowLeadForm(false);
    const userMsg: Message = { id: uid(), role: "user", content: msg, time: now() };
    setMessages((m) => [...m, userMsg]);
    historyRef.current = [...historyRef.current, { role: "user", content: msg }];
    logMessage("user", msg);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: historyRef.current }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      const botMsg: Message = { id: uid(), role: "assistant", content: data.content, time: now() };
      setMessages((m) => [...m, botMsg]);
      historyRef.current = [...historyRef.current, { role: "assistant", content: data.content }];
      logMessage("assistant", data.content);
      const bookingTriggers = ["book", "schedule", "consultation", "call", "appointment", "strategy"];
      if (!leadDone && bookingTriggers.some((k) => data.content.toLowerCase().includes(k))) setTimeout(() => setShowLeadForm(true), 400);
      if (data.leadCaptured) setLeadDone(true);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages((m) => [...m, { id: uid(), role: "assistant", content: `Sorry, I ran into an issue. Please try again or email us at hello@zempotis.com. (${errorMsg})`, time: now() }]);
    }
    setLoading(false);
  }, [input, loading, leadDone, logMessage]);

  const handleLeadSubmit = (data: LeadFormData) => {
    setShowLeadForm(false); setLeadDone(true);
    sendMessage(`My details — Name: ${data.name}, Email: ${data.email}, Company: ${data.company || "N/A"}, Phone: ${data.phone || "N/A"}, Requirement: ${data.requirement}`);
  };
  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const clearChat = () => { setMessages([]); setHasOpened(false); setShowLeadForm(false); setLeadDone(false); setQuickReplies([]); historyRef.current = []; sessionIdRef.current = uid() + uid(); };

  return (
    <>
      <style>{`
        @keyframes zc-bounce{0%,60%,100%{transform:translateY(0);opacity:.35}30%{transform:translateY(-5px);opacity:1}}
        @keyframes zc-in{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes zc-window{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes zc-notif{0%,70%,100%{transform:scale(1)}35%{transform:scale(1.35)}}
        .zc-msg{animation:zc-in .25s cubic-bezier(.34,1.56,.64,1) both}
        .zc-qr:hover{background:rgba(37,99,235,0.08)!important;border-color:rgba(37,99,235,0.35)!important;color:#2563eb!important}
        .zc-send:hover{opacity:.88}.zc-send:active{transform:scale(.93)}
        .zc-trigger:hover{transform:scale(1.08)!important;box-shadow:0 14px 40px rgba(37,99,235,.5),0 4px 12px rgba(15,23,42,.25)!important}
        .zc-hdr-btn:hover{background:rgba(37,99,235,0.06)!important;border-color:rgba(37,99,235,0.2)!important;color:#2563eb!important}
        .zc-input-wrap:focus-within{border-color:#3b82f6!important;box-shadow:0 0 0 3px rgba(37,99,235,.1)!important}
      `}</style>

      <button className="zc-trigger" onClick={() => setOpen((v) => !v)} style={styles.trigger} aria-label={open ? "Close chat" : "Open chat"}>
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>{showNotif && <span style={styles.notifDot}/>}</>
        )}
      </button>

      {open && (
        <div style={styles.window}>
          <div style={styles.header}>
            <div style={styles.headerAvatar}>⚡</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={styles.headerName}>Zempotis AI</div>
              <div style={styles.headerStatus}><span style={styles.statusDot}/>Online · replies instantly</div>
            </div>
            <button className="zc-hdr-btn" onClick={clearChat} style={styles.hdrBtn} title="Clear chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
            </button>
          </div>
          <div style={styles.messages}>
            {messages.map((m) => (
              <div key={m.id} className="zc-msg" style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", gap: 2 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                  <div style={m.role === "assistant" ? styles.botAvatar : styles.userAvatar}>{m.role === "assistant" ? "⚡" : "U"}</div>
                  <div style={m.role === "assistant" ? styles.botBubble : styles.userBubble}>
                    {m.content.split("\n").map((line, i) => <span key={i}>{line}{i < m.content.split("\n").length - 1 && <br/>}</span>)}
                  </div>
                </div>
                <div style={{ ...styles.msgTime, textAlign: m.role === "user" ? "right" : "left", marginLeft: m.role === "assistant" ? 36 : 0, marginRight: m.role === "user" ? 36 : 0 }}>{m.time}</div>
              </div>
            ))}
            {loading && <TypingDots/>}
            {quickReplies.length > 0 && !loading && (
              <div className="zc-msg" style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 36 }}>
                {quickReplies.map((qr) => <button key={qr.value} className="zc-qr" onClick={() => { setQuickReplies([]); sendMessage(qr.value); }} style={styles.quickReply}>{qr.label}</button>)}
              </div>
            )}
            {showLeadForm && !leadDone && !loading && <div className="zc-msg"><LeadForm onSubmit={handleLeadSubmit}/></div>}
            <div ref={bottomRef}/>
          </div>
          <div style={styles.footer}>
            <div className="zc-input-wrap" style={styles.inputWrap}>
              <textarea ref={inputRef} value={input} onChange={(e) => { setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,96)+"px"; }} onKeyDown={handleKey} placeholder="Ask me anything…" rows={1} style={styles.textarea} aria-label="Message"/>
              <button className="zc-send" onClick={() => sendMessage()} disabled={!input.trim()||loading} style={{ ...styles.sendBtn, opacity: input.trim()&&!loading?1:0.4 }} aria-label="Send">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <p style={styles.footerNote}>Powered by <strong style={{ color:"#2563eb", fontWeight:600 }}>Zempotis AI</strong></p>
          </div>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  trigger: { position:"fixed", bottom:28, right:28, zIndex:9999, width:58, height:58, borderRadius:"50%", border:"none", background:"linear-gradient(135deg,#2563eb 0%,#0ea5e9 100%)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 32px rgba(37,99,235,0.35),0 2px 8px rgba(15,23,42,0.2)", transition:"transform 200ms cubic-bezier(0.34,1.56,0.64,1),box-shadow 200ms ease" },
  notifDot: { position:"absolute", top:2, right:2, width:12, height:12, borderRadius:"50%", background:"#ef4444", border:"2px solid white", animation:"zc-notif 3s ease-in-out 2s infinite" },
  window: { position:"fixed", bottom:98, right:28, zIndex:9998, width:380, maxWidth:"calc(100vw - 40px)", height:580, maxHeight:"calc(100vh - 130px)", background:"white", borderRadius:20, border:"1px solid #e2e8f0", boxShadow:"0 20px 60px rgba(15,23,42,0.15),0 8px 24px rgba(15,23,42,0.10)", display:"flex", flexDirection:"column", overflow:"hidden", animation:"zc-window .3s cubic-bezier(0.34,1.56,0.64,1) both" },
  header: { padding:"14px 18px", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:12, background:"white", flexShrink:0 },
  headerAvatar: { width:38, height:38, borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,#2563eb 0%,#0ea5e9 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 },
  headerName: { fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:14, color:"#0f172a", letterSpacing:"-0.01em" },
  headerStatus: { fontSize:11.5, color:"#64748b", display:"flex", alignItems:"center", gap:5, marginTop:2 },
  statusDot: { width:6, height:6, borderRadius:"50%", background:"#22c55e", flexShrink:0 },
  hdrBtn: { width:30, height:30, borderRadius:8, border:"1px solid #e2e8f0", background:"transparent", color:"#64748b", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 150ms ease", flexShrink:0 },
  messages: { flex:1, overflowY:"auto", padding:"18px 16px", display:"flex", flexDirection:"column", gap:10, scrollBehavior:"smooth" },
  botAvatar: { width:26, height:26, borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,#2563eb 0%,#0ea5e9 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 },
  userAvatar: { width:26, height:26, borderRadius:"50%", flexShrink:0, background:"#f1f5f9", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#64748b", fontFamily:"Sora,sans-serif" },
  botBubble: { maxWidth:"78%", padding:"10px 14px", borderRadius:"14px 14px 14px 4px", background:"#f8fafc", border:"1px solid #e2e8f0", fontSize:13.5, color:"#1e293b", lineHeight:1.65, fontFamily:"DM Sans,sans-serif", wordBreak:"break-word" },
  userBubble: { maxWidth:"78%", padding:"10px 14px", borderRadius:"14px 14px 4px 14px", background:"linear-gradient(135deg,#2563eb 0%,#0ea5e9 100%)", fontSize:13.5, color:"white", lineHeight:1.65, fontFamily:"DM Sans,sans-serif", wordBreak:"break-word" },
  msgTime: { fontSize:11, color:"#94a3b8" },
  typingWrap: { display:"flex", gap:8, alignItems:"center" },
  typingBubble: { padding:"12px 16px", borderRadius:"14px 14px 14px 4px", background:"#f8fafc", border:"1px solid #e2e8f0", display:"flex", gap:4, alignItems:"center" },
  dot: { width:6, height:6, background:"#94a3b8", borderRadius:"50%", display:"inline-block" },
  quickReply: { padding:"6px 13px", borderRadius:999, border:"1.5px solid #e2e8f0", background:"white", color:"#475569", fontSize:12.5, fontFamily:"DM Sans,sans-serif", fontWeight:500, cursor:"pointer", transition:"all 150ms ease", whiteSpace:"nowrap" },
  leadForm: { background:"white", border:"1.5px solid #e2e8f0", borderRadius:14, padding:16 },
  leadFormTitle: { fontFamily:"Sora,sans-serif", fontWeight:700, fontSize:13, color:"#0f172a", marginBottom:12 },
  leadGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 },
  leadInput: { padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:10, background:"#f8fafc", fontFamily:"DM Sans,sans-serif", fontSize:13, color:"#0f172a", outline:"none", width:"100%", transition:"border-color 150ms ease" },
  inputError: { borderColor:"#ef4444" },
  leadTextarea: { padding:"9px 12px", width:"100%", border:"1.5px solid #e2e8f0", borderRadius:10, background:"#f8fafc", fontFamily:"DM Sans,sans-serif", fontSize:13, color:"#0f172a", outline:"none", resize:"none", marginBottom:10, lineHeight:1.6 },
  leadSubmit: { width:"100%", padding:"11px", background:"linear-gradient(135deg,#2563eb 0%,#0ea5e9 100%)", border:"none", borderRadius:10, color:"white", fontFamily:"Sora,sans-serif", fontWeight:600, fontSize:13.5, cursor:"pointer", boxShadow:"0 8px 24px rgba(37,99,235,0.25)", transition:"transform 150ms ease,box-shadow 150ms ease" },
  footer: { padding:"12px 16px 14px", borderTop:"1px solid #e2e8f0", flexShrink:0 },
  inputWrap: { display:"flex", alignItems:"flex-end", gap:8, border:"1.5px solid #e2e8f0", borderRadius:14, padding:"10px 12px", background:"white", transition:"border-color 200ms ease,box-shadow 200ms ease" },
  textarea: { flex:1, background:"transparent", border:"none", outline:"none", resize:"none", fontFamily:"DM Sans,sans-serif", fontSize:14, color:"#0f172a", lineHeight:1.5, maxHeight:96 },
  sendBtn: { width:34, height:34, borderRadius:10, border:"none", background:"linear-gradient(135deg,#2563eb 0%,#0ea5e9 100%)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"opacity 150ms ease,transform 150ms ease" },
  footerNote: { textAlign:"center", fontSize:11, color:"#94a3b8", marginTop:8, fontFamily:"DM Sans,sans-serif" },
};