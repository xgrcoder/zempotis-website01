"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PortalLogin() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/portal/dashboard"), 1500);
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
        .login-card { animation: fadeUp .55s cubic-bezier(.34,1.2,.64,1) both; }
        .login-input {
          width: 100%; padding: 12px 16px;
          background: #f8fafc; border: 1.5px solid #e2e8f0;
          border-radius: 10px; font: 400 15px/1 Inter, sans-serif; color: #0f172a;
          outline: none; transition: border-color 180ms, box-shadow 180ms;
          box-sizing: border-box;
        }
        .login-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
        .login-input::placeholder { color: #94a3b8; }
        .sign-in-btn {
          width: 100%; padding: 13px;
          background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
          border: none; border-radius: 10px; cursor: pointer;
          font: 600 15px/1 Inter, sans-serif; color: white;
          transition: opacity 180ms, transform 180ms, box-shadow 180ms;
          box-shadow: 0 4px 18px rgba(37,99,235,.35);
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .sign-in-btn:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(37,99,235,.45); }
        .sign-in-btn:disabled { opacity: .75; cursor: not-allowed; transform: none; }
        .spinner {
          width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.35);
          border-top-color: white; border-radius: 50%;
          animation: spin .7s linear infinite; flex-shrink: 0;
        }
        .forgot-link { color: #2563eb; font: 400 13.5px/1 Inter, sans-serif; text-decoration: none; transition: opacity 150ms; }
        .forgot-link:hover { opacity: .75; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#0f172a",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "32px 20px",
        backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,.18) 0%, transparent 70%)",
      }}>

        {/* Logo */}
        <div style={{ marginBottom: "2.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: 52, height: 52,
            background: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
            borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(37,99,235,.4)",
          }}>
            <span style={{ color: "white", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.5rem" }}>Z</span>
          </div>
          <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1.55rem", letterSpacing: "-0.03em", color: "white" }}>
            Zempotis
          </span>
        </div>

        {/* Card */}
        <div className="login-card" style={{
          width: "100%", maxWidth: 420,
          background: "white", borderRadius: 20,
          padding: "40px 36px 32px",
          boxShadow: "0 32px 80px rgba(0,0,0,.35), 0 8px 24px rgba(0,0,0,.2)",
        }}>

          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1.55rem", color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Welcome back
            </h1>
            <p style={{ color: "#64748b", font: "400 14.5px/1.4 Inter, sans-serif", margin: 0 }}>
              Sign in to your Zempotis portal
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ font: "500 13px/1 Inter, sans-serif", color: "#374151" }}>Email address</label>
              <input
                className="login-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ font: "500 13px/1 Inter, sans-serif", color: "#374151" }}>Password</label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              className="sign-in-btn"
              type="submit"
              disabled={loading}
              style={{ marginTop: "6px" }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Signing in…
                </>
              ) : "Sign in"}
            </button>

          </form>

          <div style={{ textAlign: "center", marginTop: "18px" }}>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          <div style={{
            marginTop: "28px", paddingTop: "20px",
            borderTop: "1px solid #f1f5f9",
            textAlign: "center",
          }}>
            <p style={{ font: "400 11.5px/1 Inter, sans-serif", color: "#94a3b8", margin: 0 }}>
              Powered by <strong style={{ color: "#2563eb", fontWeight: 600 }}>Zempotis</strong>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
