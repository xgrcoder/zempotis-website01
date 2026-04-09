// app/about/page.tsx — Zempotis About

export const metadata = {
  title: "About – The Team Behind Zempotis",
};

const values = [
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Speed over perfection",
    desc: "We ship fast, iterate based on real feedback, and keep moving. Waiting months for a website is unnecessary.",
    color: "#2563eb",
    gradient: "linear-gradient(135deg,#2563eb,#3b82f6)",
  },
  {
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    title: "Everything connected",
    desc: "We don't build isolated tools. Every solution we create is designed to integrate with the others seamlessly.",
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg,#0ea5e9,#38bdf8)",
  },
  {
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    title: "Outcomes, not outputs",
    desc: "We measure success by what it does for your business — time saved, leads generated, revenue grown.",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)",
  },
  {
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
    title: "Honest partnership",
    desc: "We'll tell you when something isn't right for you. Long-term trust matters more than short-term sales.",
    color: "#059669",
    gradient: "linear-gradient(135deg,#059669,#34d399)",
  },
];

const whyUs = [
  { stat: "5+",   label: "Years building digital products",  color: "#2563eb" },
  { stat: "100+", label: "Businesses served across the UK",  color: "#0ea5e9" },
  { stat: "48hr", label: "Average time to first prototype",  color: "#7c3aed" },
  { stat: "98%",  label: "Client retention after 6 months",  color: "#059669" },
];

export default function AboutPage() {
  return (
    <>
      <style>{`
        .about-mission-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
        }
        .values-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .value-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          text-align: center;
          transition: transform 260ms ease, box-shadow 260ms ease, border-color 260ms ease;
        }
        .value-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        @media (max-width: 900px) {
          .about-mission-grid { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .values-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .values-grid { grid-template-columns: 1fr !important; }
          .why-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div>

        {/* ══ Hero ══ */}
        <section className="page-hero">
          <div className="hero-grid" />
          <div className="glow-orb glow-orb-1" />
          <div className="glow-orb glow-orb-2" />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <div className="section-label animate-fade-up">About Zempotis</div>
            <h1 className="animate-fade-up animate-delay-1" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", maxWidth: "680px", margin: "0 auto 1.25rem" }}>
              We build the digital infrastructure modern businesses run on
            </h1>
            <p className="animate-fade-up animate-delay-2" style={{ color: "var(--slate-600)", fontSize: "1.1rem", maxWidth: "540px", margin: "0 auto", lineHeight: 1.75 }}>
              Zempotis was founded with one idea: businesses shouldn&apos;t need an in-house tech team to compete online. We bring the tools, expertise, and strategy — you bring the vision.
            </p>
          </div>
        </section>

        {/* ══ Mission ══ */}
        <section className="section">
          <div className="container" style={{ padding: "0 1.5rem" }}>
            <div className="about-mission-grid">

              {/* Text */}
              <div>
                <div className="section-label">Our Mission</div>
                <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.25rem)", marginBottom: "1.25rem" }}>
                  Making enterprise-level technology accessible to every business
                </h2>
                <p style={{ color: "var(--slate-600)", lineHeight: 1.85, marginBottom: "1.25rem" }}>
                  Large corporations have always had the advantage of custom software, dedicated teams, and AI infrastructure. Zempotis changes that. We package the same power into clear, affordable solutions built specifically for the businesses that need them most.
                </p>
                <p style={{ color: "var(--slate-600)", lineHeight: 1.85, marginBottom: "2rem" }}>
                  Whether you&apos;re a sole trader, a growing SME, or an established company ready to modernise — we meet you where you are and build what your business actually needs.
                </p>
                <a href="/contact" className="btn btn-primary">Work with Us →</a>
              </div>

              {/* Stats */}
              <div className="why-grid">
                {whyUs.map(({ stat, label, color }) => (
                  <div key={label} style={{
                    background: "white",
                    border: `1px solid ${color}20`,
                    borderTop: `3px solid ${color}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "1.75rem 1.5rem",
                    textAlign: "center",
                    boxShadow: `0 4px 20px ${color}0f`,
                  }}>
                    <div style={{
                      fontFamily: "Sora, sans-serif", fontWeight: 800,
                      fontSize: "clamp(1.75rem,4vw,2.5rem)",
                      color, lineHeight: 1,
                    }}>
                      {stat}
                    </div>
                    <p style={{ color: "var(--slate-600)", marginTop: "0.6rem", fontSize: "0.85rem", lineHeight: 1.5, margin: "0.6rem 0 0" }}>{label}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ══ Values ══ */}
        <section className="section" style={{ background: "var(--off-white)" }}>
          <div className="container" style={{ padding: "0 1.5rem" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="section-label">How We Work</div>
              <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)" }}>Our values</h2>
            </div>

            <div className="values-grid">
              {values.map(({ icon, title, desc, color, gradient }) => (
                <div key={title} className="value-card" style={{ borderTop: `3px solid ${color}` }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, margin: "0 auto 1.25rem",
                    background: gradient,
                    boxShadow: `0 4px 16px ${color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", color: "var(--navy)" }}>{title}</h3>
                  <p style={{ color: "var(--slate-600)", fontSize: "0.875rem", lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ Story ══ */}
        <section className="section">
          <div className="container" style={{ padding: "0 1.5rem" }}>
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>
              <div className="section-label">Our Story</div>
              <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)", marginBottom: "1.5rem" }}>Why we built Zempotis</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {[
                  "Zempotis started from a simple frustration: watching business owners juggle missed calls, slow website enquiries, and repetitive admin — while the tools to fix all of it already existed. They just weren't packaged in a way that made sense for real businesses.",
                  "We set out to change that. By combining modern web development, AI automation, and custom software into one coherent offering, we give businesses the infrastructure they need to operate efficiently and compete online — without hiring a full tech department.",
                  "Today, Zempotis serves businesses across the UK — from independent tradespeople to multi-site service companies. What stays constant is our commitment: build things that genuinely work, charge fairly for them, and always be honest with our clients.",
                ].map((para, i) => (
                  <div key={i} style={{
                    padding: "1.5rem 1.75rem",
                    background: i === 0 ? "rgba(37,99,235,0.04)" : i === 1 ? "rgba(14,165,233,0.04)" : "rgba(5,150,105,0.04)",
                    border: `1px solid ${i === 0 ? "rgba(37,99,235,0.1)" : i === 1 ? "rgba(14,165,233,0.1)" : "rgba(5,150,105,0.1)"}`,
                    borderLeft: `3px solid ${i === 0 ? "#2563eb" : i === 1 ? "#0ea5e9" : "#059669"}`,
                    borderRadius: "var(--radius-md)",
                  }}>
                    <p style={{ color: "var(--slate-600)", lineHeight: 1.85, margin: 0, fontSize: "1.05rem" }}>{para}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section style={{
          padding: "6rem 0",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #0f172a 100%)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "-100px", right: "-100px", width: 400, height: 400, background: "radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: 300, height: 300, background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
          <div className="container" style={{ padding: "0 1.5rem", textAlign: "center", position: "relative", zIndex: 1 }}>
            <div className="section-label" style={{ color: "#93c5fd", background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.18)" }}>
              Ready to work together?
            </div>
            <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", color: "white", marginBottom: "1rem" }}>
              Let&apos;s build something great together
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "420px", margin: "0 auto 2.5rem", lineHeight: 1.75 }}>
              Start with a free consultation — no commitment, just a conversation about what you need.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/contact" className="btn btn-white btn-lg">Get in Touch</a>
              <a href="/services" className="btn btn-ghost btn-lg">Our Services</a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
