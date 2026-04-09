"use client";
// app/contact/page.tsx

import { useState } from "react";

const contactDetails = [
  { icon: "✉️", label: "Email", value: "hello@zempotis.co.uk", href: "mailto:hello@zempotis.co.uk" },
  { icon: "📍", label: "Based in", value: "United Kingdom", href: null },
  { icon: "⏱", label: "Response time", value: "Within 1 business day", href: null },
];

const reasons = [
  "I want a new website",
  "I'm interested in AI chatbots",
  "I need an AI call handler",
  "I want custom software",
  "I want to know more about pricing",
  "Something else",
];

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", company: "",
    reason: "", message: "", budget: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", company: "", reason: "", message: "", budget: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      <section className="page-hero">
        <div className="hero-grid" />
        <div className="glow-orb glow-orb-1" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-label animate-fade-up">Contact Us</div>
          <h1 className="animate-fade-up animate-delay-1" style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", maxWidth: "620px", margin: "0 auto 1.25rem" }}>
            Let's talk about your business
          </h1>
          <p className="animate-fade-up animate-delay-2" style={{ color: "var(--slate-600)", fontSize: "1.05rem", maxWidth: "500px", margin: "0 auto" }}>
            Book a free 30-minute consultation or send us a message. No commitment — just an honest conversation about what you need.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ padding: "0 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "5rem", alignItems: "start" }}>

            <div>
              <h2 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>Get in touch</h2>
              <p style={{ color: "var(--slate-600)", lineHeight: 1.75, marginBottom: "2.5rem" }}>
                Whether you know exactly what you want or just know something needs to change — we're here to help. Fill out the form and we'll be in touch within one business day.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "3rem" }}>
                {contactDetails.map(({ icon, label, value, href }) => (
                  <div key={label} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                    <div className="icon-badge" style={{ fontSize: "1.25rem" }}>{icon}</div>
                    <div>
                      <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "var(--slate-500)", marginBottom: "2px" }}>{label}</p>
                      {href ? (
                        <a href={href} style={{ color: "var(--blue-600)", fontWeight: 500, textDecoration: "none", fontSize: "0.95rem" }}>{value}</a>
                      ) : (
                        <p style={{ color: "var(--navy)", fontWeight: 500, margin: 0, fontSize: "0.95rem" }}>{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--gradient-blue)", borderRadius: "var(--radius-lg)", padding: "2rem", color: "white" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>📅</div>
                <h3 style={{ color: "white", fontSize: "1.1rem", marginBottom: "0.5rem" }}>Free 30-min consultation</h3>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.875rem", lineHeight: 1.65, margin: "0 0 1.25rem" }}>
                  Book a video call and we'll walk through your goals, answer questions, and put together a custom recommendation — completely free.
                </p>
                <a href="mailto:hello@zempotis.co.uk?subject=Book%20Free%20Consultation" className="btn btn-white" style={{ fontSize: "0.875rem", padding: "10px 20px" }}>
                  Book via Email →
                </a>
              </div>
            </div>

            <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "2.5rem", boxShadow: "var(--shadow-md)" }}>
              {status === "success" ? (
                <div style={{ textAlign: "center", padding: "3.5rem 1.5rem" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                    boxShadow: "0 8px 28px rgba(37,99,235,0.25)",
                    margin: "0 auto 2rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "var(--navy)", lineHeight: 1.5, maxWidth: "360px", margin: "0 auto 0" }}>
                    Message sent! Thanks for reaching out. We'll be in touch within one business day.
                  </h3>
                  <div style={{ width: 36, height: 2, background: "linear-gradient(90deg, #2563eb, #3b82f6)", borderRadius: 2, margin: "1.25rem auto" }} />
                  <p style={{ color: "var(--slate-500)", fontSize: "0.875rem", lineHeight: 1.75, maxWidth: "300px", margin: "0 auto 2.25rem" }}>
                    Check your inbox — you should have a confirmation email too.
                  </p>
                  <button onClick={() => setStatus("idle")} className="btn btn-outline">Send Another Message</button>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>Send us a message</h3>
                  <p style={{ color: "var(--slate-500)", fontSize: "0.875rem", marginBottom: "2rem" }}>We typically respond within one business day.</p>

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label htmlFor="firstName" className="form-label">First Name <span style={{ color: "#ef4444" }}>*</span></label>
                        <input id="firstName" name="firstName" className="form-input" placeholder="Jane" value={form.firstName} onChange={handleChange} required />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="form-label">Last Name <span style={{ color: "#ef4444" }}>*</span></label>
                        <input id="lastName" name="lastName" className="form-input" placeholder="Smith" value={form.lastName} onChange={handleChange} required />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="form-label">Email Address <span style={{ color: "#ef4444" }}>*</span></label>
                      <input id="email" name="email" type="email" className="form-input" placeholder="jane@company.com" value={form.email} onChange={handleChange} required />
                    </div>

                    <div>
                      <label htmlFor="company" className="form-label">Company <span style={{ color: "var(--slate-400)", fontWeight: 400 }}>(optional)</span></label>
                      <input id="company" name="company" className="form-input" placeholder="Acme Ltd" value={form.company} onChange={handleChange} />
                    </div>

                    <div>
                      <label htmlFor="reason" className="form-label">What are you looking for? <span style={{ color: "#ef4444" }}>*</span></label>
                      <select id="reason" name="reason" className="form-input" value={form.reason} onChange={handleChange} required style={{ cursor: "pointer" }}>
                        <option value="" disabled>Select an option…</option>
                        {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="form-label">Tell us more <span style={{ color: "#ef4444" }}>*</span></label>
                      <textarea id="message" name="message" className="form-input" placeholder="What's your biggest operational challenge right now?" rows={5} value={form.message} onChange={handleChange} required style={{ resize: "vertical" }} />
                    </div>

                    <div>
                      <label htmlFor="budget" className="form-label">Monthly budget <span style={{ color: "var(--slate-400)", fontWeight: 400 }}>(optional)</span></label>
                      <select id="budget" name="budget" className="form-input" value={form.budget} onChange={handleChange} style={{ cursor: "pointer" }}>
                        <option value="">Prefer not to say</option>
                        <option value="Under £299/month">Under £299/month</option>
                        <option value="£299–£699/month">£299–£699/month</option>
                        <option value="£699–£1,499/month">£699–£1,499/month</option>
                        <option value="£1,499+/month">£1,499+/month</option>
                      </select>
                    </div>

                    {status === "error" && (
                      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius-md)", padding: "1rem", color: "#dc2626", fontSize: "0.875rem" }}>
                        Something went wrong. Please try again or email us directly at hello@zempotis.co.uk
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={status === "loading"} style={{ width: "100%", justifyContent: "center", opacity: status === "loading" ? 0.7 : 1 }}>
                      {status === "loading" ? "Sending…" : "Send Message →"}
                    </button>

                    <p style={{ textAlign: "center", color: "var(--slate-400)", fontSize: "0.78rem", margin: 0 }}>
                      By submitting you agree to our <a href="/privacy" style={{ color: "var(--blue-600)" }}>Privacy Policy</a>. We'll never share your data.
                    </p>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
