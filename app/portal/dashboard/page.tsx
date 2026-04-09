"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .dash-card { animation: fadeUp .5s cubic-bezier(.34,1.2,.64,1) both; }
        .signout-btn {
          padding: 10px 24px;
          border: 1.5px solid rgba(255,255,255,.15); border-radius: 9px;
          background: rgba(255,255,255,.06); color: #94a3b8;
          font: 500 14px/1 Inter, sans-serif; cursor: pointer;
          transition: background 160ms, border-color 160ms, color 160ms;
        }
        .signout-btn:hover { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.28); color: white; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#0f172a",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "32px 20px",
        backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,.18) 0%, transparent 70%)",
      }}>

        <div className="dash-card" style={{
          width: "100%", maxWidth: 480,
          background: "#1e293b",
          border: "1px solid rgba(255,255,255,.07)",
          borderRadius: 22,
          padding: "48px 40px",
          boxShadow: "0 32px 80px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.25)",
          textAlign: "center",
        }}>

          {/* Logo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "36px" }}>
            <div style={{
              width: 48, height: 48,
              background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
              borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 24px rgba(37,99,235,.38)",
            }}>
              <span style={{ color: "white", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.35rem" }}>Z</span>
            </div>
            <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1.3rem", letterSpacing: "-0.03em", color: "white" }}>
              Zempotis
            </span>
          </div>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 13px", borderRadius: 99,
            background: "rgba(37,99,235,.15)", border: "1px solid rgba(37,99,235,.3)",
            marginBottom: "20px",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#60a5fa", flexShrink: 0 }} />
            <span style={{ font: "500 12px/1 Inter, sans-serif", color: "#93c5fd" }}>Client Portal</span>
          </div>

          <h1 style={{
            fontFamily: "Sora, sans-serif", fontWeight: 700,
            fontSize: "1.75rem", letterSpacing: "-0.03em",
            color: "white", margin: "0 0 12px",
          }}>
            Dashboard coming soon
          </h1>

          <p style={{
            font: "400 15px/1.65 Inter, sans-serif",
            color: "#64748b", margin: "0 0 36px",
            maxWidth: 340, marginLeft: "auto", marginRight: "auto",
          }}>
            Your personalised dashboard is being set up. We&apos;ll notify you when it&apos;s ready.
          </p>

          <button className="signout-btn" onClick={() => router.push("/portal")}>
            Sign out
          </button>

          <p style={{ font: "400 11.5px/1 Inter, sans-serif", color: "#334155", margin: "28px 0 0" }}>
            Powered by <strong style={{ color: "#2563eb", fontWeight: 600 }}>Zempotis</strong>
          </p>

        </div>
      </div>
    </>
  );
}
