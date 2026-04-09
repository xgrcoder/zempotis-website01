"use client";
// app/components/ZempotisChat.tsx
// Static contact-prompt widget — no API dependencies

import { useState } from "react";
import Link from "next/link";

const PRIMARY  = "#2563eb";
const ACCENT   = "#0ea5e9";
const GRADIENT = `linear-gradient(135deg,${PRIMARY} 0%,${ACCENT} 100%)`;
const RGB      = "37,99,235";

export default function ZempotisChat() {
  const [open, setOpen]       = useState(false);
  const [showNotif, setNotif] = useState(true);

  function toggle() {
    setOpen(o => !o);
    setNotif(false);
  }

  return (
    <>
      <style>{`
        @keyframes zc-glow{0%,100%{box-shadow:0 8px 32px rgba(${RGB},.28),0 2px 8px rgba(0,0,0,.14)}50%{box-shadow:0 8px 56px rgba(${RGB},.62),0 4px 16px rgba(0,0,0,.2)}}
        @keyframes zc-pop{from{opacity:0;transform:translateY(22px) scale(.93)}to{opacity:1;transform:none}}
        .zc-trig{animation:zc-glow 3s ease-in-out infinite}
        .zc-trig.on{animation:none}
        .zc-trig:hover{transform:scale(1.1)!important}
        .zc-btn{display:inline-block;padding:11px 24px;border-radius:10px;background:${GRADIENT};color:white;font:600 14px/1 Inter,sans-serif;text-decoration:none;text-align:center;transition:opacity 150ms,transform 150ms}
        .zc-btn:hover{opacity:.9;transform:translateY(-1px)}
      `}</style>

      {/* Trigger button */}
      <button
        className={`zc-trig${open ? " on" : ""}`}
        onClick={toggle}
        aria-label={open ? "Close chat" : "Chat with us"}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          width: 62, height: 62, borderRadius: "50%", border: "none",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, background: GRADIENT,
          transition: "transform 220ms cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            {showNotif && (
              <span style={{ position: "absolute", top: 0, right: 0, width: 15, height: 15, borderRadius: "50%", background: "#ef4444", border: "2.5px solid white" }}/>
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 104, right: 28, zIndex: 9998,
          width: 360, maxWidth: "calc(100vw - 44px)",
          borderRadius: 24, overflow: "hidden",
          border: "1px solid rgba(255,255,255,.55)",
          boxShadow: "0 28px 80px rgba(0,0,0,.18),0 8px 28px rgba(0,0,0,.12)",
          background: "rgba(248,250,252,.96)",
          backdropFilter: "blur(28px) saturate(1.9)",
          WebkitBackdropFilter: "blur(28px) saturate(1.9)",
          animation: "zc-pop .38s cubic-bezier(.34,1.2,.64,1) both",
          transformOrigin: "bottom right",
        }}>
          {/* Header */}
          <div style={{ padding: "13px 15px", background: GRADIENT, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.22)", border: "2px solid rgba(255,255,255,.38)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 17px/1 Inter,sans-serif", color: "white", flexShrink: 0 }}>
              Z
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ font: "700 14.5px/1.2 Inter,sans-serif", color: "#fff" }}>Zempotis AI</div>
              <div style={{ font: "400 11px/1 Inter,sans-serif", color: "rgba(255,255,255,.8)", display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px rgba(74,222,128,.85)", flexShrink: 0 }}/>
                &nbsp;Online · here to help
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Greeting bubble */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: GRADIENT, display: "flex", alignItems: "center", justifyContent: "center", font: "700 14px/1 Inter,sans-serif", color: "white", flexShrink: 0 }}>
                Z
              </div>
              <div style={{ background: "white", border: "1px solid rgba(0,0,0,.07)", borderRadius: "16px 16px 16px 4px", padding: "11px 14px", font: "400 13.5px/1.6 Inter,sans-serif", color: "#1e293b", boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
                Hi there! 👋 I&apos;m the Zempotis assistant. Have a question about our services?<br/><br/>
                Send us a message and we&apos;ll get back to you quickly.
              </div>
            </div>

            {/* CTA */}
            <div style={{ paddingLeft: 44 }}>
              <Link href="/contact" className="zc-btn" onClick={() => setOpen(false)}>
                Get in touch →
              </Link>
            </div>
          </div>

          <p style={{ textAlign: "center", font: "400 10.5px/1 Inter,sans-serif", color: "rgba(148,163,184,.8)", padding: "0 0 14px" }}>
            Powered by <strong style={{ color: PRIMARY, fontWeight: 600 }}>Zempotis AI</strong>
          </p>
        </div>
      )}
    </>
  );
}
