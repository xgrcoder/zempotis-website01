// app/services/page.tsx — Zempotis Services

export const metadata = {
  title: "Services – Everything You Need to Grow Smarter",
};

const services = [
  {
    id: "websites",
    badge: "Foundation",
    title: "Business Websites",
    subtitle: "Your digital shopfront — built to convert",
    desc: "A great website isn't just a brochure. It's your best salesperson, working around the clock. We design and build fast, modern, responsive websites that communicate your brand clearly and turn visitors into clients.",
    features: [
      "Fully responsive across all devices",
      "Speed-optimised (Core Web Vitals green)",
      "SEO-ready structure and metadata",
      "Custom design aligned with your brand",
      "Integrated enquiry forms",
      "CMS for easy content updates",
      "Analytics and conversion tracking",
    ],
    highlight: "Average client sees a 40% increase in enquiry rate after launch.",
    color: "#2563eb",
    gradient: "linear-gradient(135deg,#2563eb,#3b82f6)",
    icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
  },
  {
    id: "chatbots",
    badge: "AI Automation",
    title: "AI Chatbots",
    subtitle: "Conversations that never sleep",
    desc: "Your AI chatbot is trained on your specific business — your services, pricing, FAQs, and tone of voice. It handles enquiries instantly, qualifies leads, and seamlessly hands off to your team when a human touch is needed.",
    features: [
      "Trained on your business knowledge base",
      "Deployed on any website in minutes",
      "Handles FAQs, bookings, and lead capture",
      "Human handoff when needed",
      "Works 24/7 with zero downtime",
      "Escalation alerts to your inbox or Slack",
      "Conversation analytics dashboard",
    ],
    highlight: "Clients typically resolve 70% of inbound queries without human intervention.",
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg,#0ea5e9,#38bdf8)",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    id: "call-handlers",
    badge: "AI Automation",
    title: "AI Call Handlers",
    subtitle: "Every call answered, every time",
    desc: "Missed calls cost businesses thousands every year. Our AI call handler answers inbound calls professionally, collects the caller's details, understands their query, and sends you a clean summary — so no lead slips through the cracks.",
    features: [
      "Answers 100% of inbound calls",
      "Natural-sounding voice AI",
      "Collects caller name, query, and contact",
      "Routes urgent calls to a human instantly",
      "Sends call summaries by email or SMS",
      "Appointment booking integration",
      "Works with your existing phone number",
    ],
    highlight: "Our clients reclaim 6+ hours per week previously spent on routine call-handling.",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)",
    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  },
  {
    id: "software",
    badge: "Custom Build",
    title: "Custom Software & Systems",
    subtitle: "Software shaped around your workflow",
    desc: "Off-the-shelf software forces you to adapt your process to the tool. We flip that. We build custom platforms, dashboards, and internal tools that fit exactly how your business operates — eliminating friction and saving hours every week.",
    features: [
      "Custom CRM and pipeline tools",
      "Internal dashboards and reporting",
      "Booking and scheduling systems",
      "Client portals and login areas",
      "API integrations with existing tools",
      "Automated workflow and data processing",
      "Mobile-accessible interfaces",
    ],
    highlight: "Custom software pays for itself on average within 4 months through efficiency savings.",
    color: "#059669",
    gradient: "linear-gradient(135deg,#059669,#34d399)",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    id: "support",
    badge: "Operations",
    title: "Customer Support Systems",
    subtitle: "Never drop the ball with a client",
    desc: "Happy clients stay longer and refer others. We set up structured support infrastructure — ticketing systems, automated follow-up sequences, SLA tracking, and engagement tools — so your team consistently delivers excellent service.",
    features: [
      "Helpdesk and ticketing setup",
      "Automated follow-up sequences",
      "SLA tracking and alerts",
      "Client satisfaction surveys",
      "Support inbox routing and tagging",
      "Integration with your CRM",
      "Staff training and handover",
    ],
    highlight: "Structured support reduces client churn by up to 35%.",
    color: "#d97706",
    gradient: "linear-gradient(135deg,#d97706,#fbbf24)",
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
  },
];

const faqs = [
  {
    q: "How long does it take to set everything up?",
    a: "A basic website and chatbot can be live within 5–10 business days. Custom software projects take longer depending on scope — we'll give you a clear timeline during your consultation.",
  },
  {
    q: "Do I need to provide anything for the AI to be trained?",
    a: "We ask for key information about your business — services, FAQs, tone, and goals. Most clients just share an existing website or document. We handle the rest.",
  },
  {
    q: "Can Zempotis integrate with my existing tools?",
    a: "Yes. We integrate with CRMs, email platforms, Slack, calendars, and most mainstream business tools via API or webhook.",
  },
  {
    q: "What happens if something breaks?",
    a: "All plans include support. Pro and Enterprise clients get priority response times and a dedicated point of contact.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <style>{`
        .svc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
        }
        .svc-visual {
          border-radius: var(--radius-xl);
          padding: 3rem 2.5rem;
          text-align: center;
        }
        .faq-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          transition: background 200ms ease, border-color 200ms ease;
        }
        .faq-card:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(37,99,235,0.4);
        }
        @media (max-width: 900px) {
          .svc-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            direction: ltr !important;
          }
          .svc-visual { padding: 2rem 1.5rem; }
          .svc-text { direction: ltr !important; }
        }
      `}</style>

      <div>

        {/* ══ Hero ══ */}
        <section className="page-hero">
          <div className="hero-grid" />
          <div className="glow-orb glow-orb-1" />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <div className="section-label animate-fade-up">Our Services</div>
            <h1 className="animate-fade-up animate-delay-1" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", maxWidth: "700px", margin: "0 auto 1.25rem" }}>
              Everything your business needs in one place
            </h1>
            <p className="animate-fade-up animate-delay-2" style={{ color: "var(--slate-600)", fontSize: "1.1rem", maxWidth: "540px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
              Five interconnected services designed to streamline your operations, save time, and help you scale confidently.
            </p>
            <a href="/contact" className="btn btn-primary btn-lg animate-fade-up animate-delay-3">
              Get a Free Quote →
            </a>
          </div>
        </section>

        {/* ══ Services ══ */}
        {services.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className="section"
            style={{ background: i % 2 === 0 ? "var(--white)" : "var(--off-white)" }}
          >
            <div className="container" style={{ padding: "0 1.5rem" }}>
              <div
                className="svc-grid"
                style={{ direction: i % 2 === 0 ? "ltr" : "rtl" }}
              >

                {/* ── Text side ── */}
                <div className="svc-text" style={{ direction: "ltr" }}>

                  {/* Badge */}
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: `${s.color}12`, color: s.color,
                    border: `1px solid ${s.color}28`,
                    fontSize: "0.72rem", fontWeight: 700, padding: "4px 14px",
                    borderRadius: 999, letterSpacing: "0.08em", textTransform: "uppercase",
                    fontFamily: "Sora, sans-serif", marginBottom: "1rem",
                  }}>
                    {s.badge}
                  </span>

                  <h2 style={{ fontSize: "clamp(1.6rem,3.5vw,2.25rem)", marginBottom: "0.5rem" }}>{s.title}</h2>
                  <p style={{ color: s.color, fontFamily: "Sora, sans-serif", fontWeight: 600, marginBottom: "1.25rem", fontSize: "1rem" }}>
                    {s.subtitle}
                  </p>
                  <p style={{ color: "var(--slate-600)", lineHeight: 1.8, marginBottom: "1.75rem" }}>{s.desc}</p>

                  {/* Feature list */}
                  <ul style={{ listStyle: "none", margin: "0 0 1.75rem", padding: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                    {s.features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 20, height: 20, minWidth: 20, borderRadius: "50%",
                          background: `${s.color}14`, marginTop: "1px",
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </span>
                        <span style={{ fontSize: "0.9rem", color: "var(--navy-800)", lineHeight: 1.6 }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Highlight */}
                  <div style={{
                    background: `${s.color}0d`,
                    border: `1px solid ${s.color}22`,
                    borderLeft: `3px solid ${s.color}`,
                    borderRadius: "var(--radius-md)",
                    padding: "1rem 1.25rem",
                    marginBottom: "1.75rem",
                  }}>
                    <p style={{ color: "var(--navy)", fontWeight: 600, fontSize: "0.875rem", margin: 0 }}>
                      💡 {s.highlight}
                    </p>
                  </div>

                  <a href="/contact" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: s.gradient,
                    color: "white", borderRadius: "var(--radius-md)",
                    padding: "13px 26px", textDecoration: "none",
                    fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.9rem",
                    boxShadow: `0 4px 20px ${s.color}30`,
                    transition: "transform 200ms ease, box-shadow 200ms ease",
                  }}>
                    Get Started with {s.title}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </a>
                </div>

                {/* ── Visual side ── */}
                <div style={{ direction: "ltr" }}>
                  <div
                    className="svc-visual"
                    style={{
                      background: `linear-gradient(135deg, ${s.color}0f 0%, ${s.color}06 100%)`,
                      border: `1px solid ${s.color}20`,
                      borderTop: `3px solid ${s.color}`,
                    }}
                  >
                    {/* Icon badge */}
                    <div style={{
                      width: 80, height: 80, borderRadius: 22, margin: "0 auto 1.5rem",
                      background: s.gradient,
                      boxShadow: `0 8px 28px ${s.color}38`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={s.icon} />
                      </svg>
                    </div>

                    <h3 style={{ fontSize: "1.35rem", marginBottom: "0.5rem", color: "var(--navy)" }}>{s.title}</h3>
                    <p style={{ color: s.color, fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.875rem", marginBottom: "1.75rem" }}>{s.subtitle}</p>

                    {/* Top 3 features as chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginBottom: "1.75rem" }}>
                      {s.features.slice(0, 3).map((f) => (
                        <span key={f} style={{
                          background: `${s.color}12`, color: s.color,
                          border: `1px solid ${s.color}22`,
                          fontSize: "0.72rem", fontWeight: 600,
                          padding: "4px 12px", borderRadius: 999,
                          fontFamily: "Sora, sans-serif",
                        }}>
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* Highlight stat */}
                    <div style={{
                      background: `${s.color}10`,
                      border: `1px solid ${s.color}20`,
                      borderRadius: "var(--radius-md)",
                      padding: "0.875rem 1rem",
                    }}>
                      <p style={{ color: "var(--navy)", fontWeight: 600, fontSize: "0.82rem", margin: 0, lineHeight: 1.5 }}>
                        💡 {s.highlight}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        ))}

        {/* ══ FAQ ══ */}
        <section className="section" style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #0f172a 100%)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "-100px", right: "-100px", width: 400, height: 400, background: "radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: 300, height: 300, background: "radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />

          <div className="container" style={{ padding: "0 1.5rem", position: "relative", zIndex: 1 }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="section-label" style={{ color: "#93c5fd", background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.18)" }}>
                FAQ
              </div>
              <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)", color: "white" }}>Common questions</h2>
            </div>

            <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {faqs.map(({ q, a }) => (
                <div key={q} className="faq-card">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0, marginTop: "1px",
                      background: "rgba(37,99,235,0.25)", border: "1px solid rgba(37,99,235,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ color: "white", fontFamily: "Sora, sans-serif", fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.95rem" }}>
                        {q}
                      </h4>
                      <p style={{ color: "#94a3b8", margin: 0, lineHeight: 1.75, fontSize: "0.875rem" }}>{a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <a href="/contact" className="btn btn-white btn-lg">Book a Free Consultation →</a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
