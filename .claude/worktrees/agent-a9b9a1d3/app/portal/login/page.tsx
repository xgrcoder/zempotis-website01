"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    // Check if admin
    if (email === "abdulworkspace@outlook.com") {
      router.push("/portal/admin");
    } else {
      router.push("/portal/dashboard");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--gradient-hero)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
    }}>
      <div className="hero-grid" />
      <div className="glow-orb glow-orb-1" />

      <div style={{
        background: "white",
        borderRadius: "var(--radius-xl)",
        padding: "3rem",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "var(--shadow-xl)",
        border: "1px solid var(--border)",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 48, height: 48,
            background: "var(--gradient-blue)",
            borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem",
            boxShadow: "var(--shadow-blue)",
          }}>
            <span style={{ color: "white", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.25rem" }}>Z</span>
          </div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>Welcome back</h1>
          <p style={{ color: "var(--slate-500)", fontSize: "0.9rem" }}>Sign in to your Zempotis portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          <div>
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "var(--radius-md)",
              padding: "0.875rem 1rem",
              color: "#dc2626",
              fontSize: "0.875rem",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>

        </form>

        <p style={{ textAlign: "center", color: "var(--slate-400)", fontSize: "0.8rem", marginTop: "1.5rem" }}>
          Need access? <a href="/contact" style={{ color: "var(--blue-600)", fontWeight: 600 }}>Contact Zempotis</a>
        </p>

      </div>
    </div>
  );
}
