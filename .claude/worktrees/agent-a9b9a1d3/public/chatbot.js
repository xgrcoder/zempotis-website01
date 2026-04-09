(function () {
  "use strict";

  const scriptTag = document.currentScript ||
    [...document.querySelectorAll("script")].find(s => s.src && s.src.includes("chatbot.js"));
  const clientId = new URL(scriptTag.src).searchParams.get("client");
  if (!clientId) return console.warn("[Zempotis] No client ID found.");

  const API_BASE = "https://www.zempotis.com";
  const sessionId = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

  let config = null;
  let historyRef = [];
  let isOpen = false;
  let isLoading = false;
  let hasOpened = false;

  // ── Silent page view tracker ─────────────────────────────────
  function trackPageView() {
    fetch(API_BASE + '/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        page_url: location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      }),
    }).catch(() => {});
  }

  // ── Log chat message ─────────────────────────────────────────
  function logMessage(role, content) {
    fetch(API_BASE + '/api/chat-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, session_id: sessionId, role, content, page_url: location.href }),
    }).catch(() => {});
  }

  // Track immediately on load
  trackPageView();

  const host = document.createElement("div");
  host.id = "zmp-host";
  host.style.cssText = "position:fixed;bottom:28px;right:28px;z-index:2147483647;display:flex;flex-direction:column;align-items:flex-end;gap:12px;";
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes zc-bounce { 0%,60%,100%{transform:translateY(0);opacity:.35} 30%{transform:translateY(-5px);opacity:1} }
    @keyframes zc-in { from{opacity:0;transform:translateY(10px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes zc-window { from{opacity:0;transform:translateY(16px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes zc-notif { 0%,70%,100%{transform:scale(1)} 35%{transform:scale(1.35)} }
    #trigger {
      width: 58px; height: 58px; border-radius: 50%; border: none;
      background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 32px rgba(37,99,235,0.35), 0 2px 8px rgba(15,23,42,0.2);
      transition: transform 200ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease;
      position: relative; flex-shrink: 0;
    }
    #trigger:hover { transform: scale(1.08); }
    #notif-dot {
      position: absolute; top: 2px; right: 2px;
      width: 12px; height: 12px; border-radius: 50%;
      background: #ef4444; border: 2px solid white;
      animation: zc-notif 3s ease-in-out 2s infinite;
    }
    #window {
      width: 380px; max-width: calc(100vw - 48px);
      height: 580px; max-height: calc(100vh - 130px);
      background: white; border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 20px 60px rgba(15,23,42,0.15), 0 8px 24px rgba(15,23,42,0.10);
      display: flex; flex-direction: column; overflow: hidden;
      animation: zc-window .3s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    #header {
      padding: 14px 18px; border-bottom: 1px solid #e2e8f0;
      display: flex; align-items: center; gap: 12px;
      background: white; flex-shrink: 0;
    }
    #hdr-avatar {
      width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
      display: flex; align-items: center; justify-content: center; font-size: 16px;
    }
    #hdr-info { flex: 1; min-width: 0; }
    #hdr-name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14px; color: #0f172a; letter-spacing: -0.01em; }
    #hdr-status { font-family: 'DM Sans', sans-serif; font-size: 11.5px; color: #64748b; display: flex; align-items: center; gap: 5px; margin-top: 2px; }
    #status-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
    #clear-btn {
      width: 30px; height: 30px; border-radius: 8px;
      border: 1px solid #e2e8f0; background: transparent; color: #64748b; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 150ms ease; flex-shrink: 0;
    }
    #clear-btn:hover { background: rgba(37,99,235,0.06); border-color: rgba(37,99,235,0.2); color: #2563eb; }
    #messages {
      flex: 1; overflow-y: auto; padding: 18px 16px;
      display: flex; flex-direction: column; gap: 10px;
      scroll-behavior: smooth; background: white;
    }
    #messages::-webkit-scrollbar { width: 4px; }
    #messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
    .msg-row { display: flex; flex-direction: column; gap: 2px; animation: zc-in .25s cubic-bezier(.34,1.56,.64,1) both; }
    .msg-row.bot { align-items: flex-start; }
    .msg-row.user { align-items: flex-end; }
    .msg-inner { display: flex; gap: 8px; align-items: flex-end; max-width: 82%; }
    .msg-row.user .msg-inner { flex-direction: row-reverse; }
    .bot-avatar {
      width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
      display: flex; align-items: center; justify-content: center; font-size: 12px;
    }
    .user-avatar {
      width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
      background: #f1f5f9; border: 1px solid #e2e8f0;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: #64748b; font-family: 'Sora', sans-serif;
    }
    .bot-bubble {
      padding: 10px 14px; border-radius: 14px 14px 14px 4px;
      background: #f8fafc; border: 1px solid #e2e8f0;
      font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #1e293b; line-height: 1.65;
      word-break: break-word; overflow-wrap: break-word;
    }
    .user-bubble {
      padding: 10px 14px; border-radius: 14px 14px 4px 14px;
      background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
      font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: white; line-height: 1.65;
      word-break: break-word; overflow-wrap: break-word;
    }
    .msg-time { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #94a3b8; }
    .msg-row.bot .msg-time { margin-left: 34px; }
    .msg-row.user .msg-time { margin-right: 34px; text-align: right; }
    #typing { display: flex; gap: 8px; align-items: center; }
    .typing-bubble {
      padding: 12px 16px; border-radius: 14px 14px 14px 4px;
      background: #f8fafc; border: 1px solid #e2e8f0;
      display: flex; gap: 4px; align-items: center;
    }
    .dot { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; display: inline-block; animation: zc-bounce 1.4s ease-in-out infinite; }
    .dot:nth-child(2) { animation-delay: .2s; }
    .dot:nth-child(3) { animation-delay: .4s; }
    #qr-row { display: flex; gap: 6px; flex-wrap: wrap; padding-left: 34px; animation: zc-in .25s ease both; }
    .qr {
      padding: 6px 13px; border-radius: 999px;
      border: 1.5px solid #e2e8f0; background: white; color: #475569; font-size: 12.5px;
      font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer; transition: all 150ms ease; white-space: nowrap;
    }
    .qr:hover { background: rgba(37,99,235,0.08); border-color: rgba(37,99,235,0.35); color: #2563eb; }
    #footer { padding: 12px 16px 14px; border-top: 1px solid #e2e8f0; flex-shrink: 0; background: white; }
    #input-wrap {
      display: flex; align-items: flex-end; gap: 8px;
      border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 10px 12px; background: white;
      transition: border-color 200ms ease, box-shadow 200ms ease;
    }
    #input-wrap:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
    #input {
      flex: 1; background: transparent; border: none; outline: none; resize: none;
      font-family: 'DM Sans', sans-serif; font-size: 14px; color: #0f172a; line-height: 1.5; max-height: 96px; overflow-y: auto;
    }
    #input::placeholder { color: #94a3b8; }
    #send {
      width: 34px; height: 34px; border-radius: 10px; border: none;
      background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: opacity 150ms ease, transform 150ms ease;
    }
    #send:hover { opacity: .88; }
    #send:active { transform: scale(.93); }
    #send:disabled { opacity: .4; cursor: default; }
    #footer-note { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 8px; font-family: 'DM Sans', sans-serif; }
    #footer-note strong { color: #2563eb; font-weight: 600; }
    @media (max-width: 420px) { #window { width: calc(100vw - 32px); height: 72vh; } }
  `;
  shadow.appendChild(style);

  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div id="window" style="display:none">
      <div id="header">
        <div id="hdr-avatar">⚡</div>
        <div id="hdr-info">
          <div id="hdr-name">AI Assistant</div>
          <div id="hdr-status"><span id="status-dot"></span> Online · replies instantly</div>
        </div>
        <button id="clear-btn" title="Clear chat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          </svg>
        </button>
      </div>
      <div id="messages"></div>
      <div id="footer">
        <div id="input-wrap">
          <textarea id="input" placeholder="Ask me anything…" rows="1"></textarea>
          <button id="send" disabled>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p id="footer-note">Powered by <strong>Zempotis AI</strong></p>
      </div>
    </div>
    <button id="trigger">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
      <span id="notif-dot"></span>
    </button>
  `;
  shadow.appendChild(wrap);

  const $ = (id) => shadow.getElementById(id);
  const win      = $("window");
  const trigger  = $("trigger");
  const clearBtn = $("clear-btn");
  const msgList  = $("messages");
  const input    = $("input");
  const sendBtn  = $("send");
  const hdrName  = $("hdr-name");
  const notifDot = $("notif-dot");

  function nowTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  function scrollBottom() { msgList.scrollTop = msgList.scrollHeight; }

  function applyColours(primary, accent) {
    const gradient = `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`;
    trigger.style.background = gradient;
    const hdrAvatar = $("hdr-avatar");
    if (hdrAvatar) hdrAvatar.style.background = gradient;
    if (sendBtn) sendBtn.style.background = gradient;
    const updated = style.textContent
      .replace(/linear-gradient\(135deg, #2563eb 0%, #0ea5e9 100%\)/g, gradient)
      .replace(/#2563eb/g, primary)
      .replace(/#0ea5e9/g, accent)
      .replace(/rgba\(37,99,235,([^)]+)\)/g, (_, alpha) => {
        const r = parseInt(primary.slice(1, 3), 16);
        const g = parseInt(primary.slice(3, 5), 16);
        const b = parseInt(primary.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
      });
    style.textContent = updated;
  }

  trigger.addEventListener("click", () => isOpen ? closeChat() : openChat());
  clearBtn.addEventListener("click", clearChat);

  function openChat() {
    isOpen = true;
    win.style.display = "flex";
    notifDot.style.display = "none";
    const p = config?.primaryColor || "#2563eb";
    const a = config?.accentColor || "#0ea5e9";
    trigger.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    trigger.style.background = `linear-gradient(135deg, ${p} 0%, ${a} 100%)`;
    if (!hasOpened) { hasOpened = true; greet(); }
    setTimeout(() => input.focus(), 300);
  }

  function closeChat() {
    isOpen = false;
    win.style.display = "none";
    const p = config?.primaryColor || "#2563eb";
    const a = config?.accentColor || "#0ea5e9";
    trigger.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><span id="notif-dot" style="display:none"></span>`;
    trigger.style.background = `linear-gradient(135deg, ${p} 0%, ${a} 100%)`;
  }

  function clearChat() {
    historyRef = [];
    hasOpened = false;
    msgList.innerHTML = "";
    greet();
  }

  function addMessage(role, text) {
    hideTyping();
    removeQR();
    const row = document.createElement("div");
    row.className = `msg-row ${role}`;
    const avatarHtml = role === "bot"
      ? `<div class="bot-avatar">⚡</div>`
      : `<div class="user-avatar">U</div>`;
    const bubbleHtml = role === "bot"
      ? `<div class="bot-bubble">${text.replace(/\n/g, "<br>")}</div>`
      : `<div class="user-bubble">${text.replace(/\n/g, "<br>")}</div>`;
    row.innerHTML = `<div class="msg-inner">${avatarHtml}${bubbleHtml}</div><div class="msg-time">${nowTime()}</div>`;
    msgList.appendChild(row);
    if (isLoading) showTyping();
    scrollBottom();
  }

  function showTyping() {
    if (shadow.getElementById("typing")) return;
    removeQR();
    const t = document.createElement("div");
    t.id = "typing";
    t.innerHTML = `<div class="bot-avatar">⚡</div><div class="typing-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
    msgList.appendChild(t);
    scrollBottom();
  }

  function hideTyping() {
    const t = shadow.getElementById("typing");
    if (t) t.remove();
  }

  function removeQR() {
    const qr = shadow.getElementById("qr-row");
    if (qr) qr.remove();
  }

  function renderQR(replies) {
    removeQR();
    if (!replies || !replies.length) return;
    const row = document.createElement("div");
    row.id = "qr-row";
    replies.forEach(qr => {
      const btn = document.createElement("button");
      btn.className = "qr";
      btn.textContent = qr.label;
      btn.onclick = () => { removeQR(); sendMessage(qr.value); };
      row.appendChild(btn);
    });
    msgList.appendChild(row);
    scrollBottom();
  }

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 96) + "px";
    sendBtn.disabled = !input.value.trim() || isLoading;
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  sendBtn.addEventListener("click", () => sendMessage());

  async function sendMessage(text) {
    const msg = (text || input.value).trim();
    if (!msg || isLoading) return;
    if (!text) { input.value = ""; input.style.height = "auto"; }
    removeQR();
    historyRef.push({ role: "user", content: msg });
    addMessage("user", msg);
    logMessage("user", msg);
    isLoading = true;
    sendBtn.disabled = true;
    showTyping();
    try {
      const res = await fetch(`${API_BASE}/api/client/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyRef }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't get a response.";
      hideTyping();
      isLoading = false;
      historyRef.push({ role: "assistant", content: reply });
      addMessage("bot", reply);
      logMessage("assistant", reply);
    } catch (err) {
      hideTyping();
      isLoading = false;
      addMessage("bot", `Sorry, something went wrong. Please contact ${config?.name || "us"} directly.`);
    }
    sendBtn.disabled = !input.value.trim();
  }

  function greet() {
    if (!config) return;
    const greeting = config.greeting || `Hi! How can I help you today?`;
    historyRef = [{ role: "assistant", content: greeting }];
    addMessage("bot", greeting);
    logMessage("assistant", greeting);
    if (config.quickReplies?.length) setTimeout(() => renderQR(config.quickReplies), 100);
  }

  async function init() {
    try {
      const res = await fetch(`${API_BASE}/api/client/${clientId}`);
      if (res.ok) {
        config = await res.json();
        if (config.name) hdrName.textContent = config.name + " AI";
        const primary = config.primaryColor || "#2563eb";
        const accent  = config.accentColor  || "#0ea5e9";
        applyColours(primary, accent);
      }
    } catch (e) {
      config = { name: "Assistant", greeting: "Hi! How can I help you today?", quickReplies: [] };
    }
  }

  init();
})();