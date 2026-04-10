// app/price-plans/page.tsx — Zempotis Pricing

export const metadata = {
  title: "Pricing – Simple, Transparent Plans",
};

const tiers = [
  {
    name: "Starter",
    price: "£299",
    period: "/month",
    tagline: "Get online and start automating",
    desc: "The complete foundation for small businesses. A professional website paired with an AI chatbot to handle enquiries around the clock.",
    features: [
      "Modern responsive website (up to 5 pages)",
      "AI chatbot — deployed on your website",
      "Trained on your business FAQs",
      "Lead capture with email notifications",
      "Contact & enquiry forms",
      "Google Analytics setup",
      "Monthly performance report",
      "Email support (48hr response)",
    ],
    cta: "Get Started",
    ctaHref: "/contact?plan=starter",
    featured: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "£699",
    period: "/month",
    tagline: "Full automation for growing businesses",
    desc: "Everything in Starter, plus a powerful AI call handler and deeper chatbot capabilities. Built for businesses that can't afford to miss a lead.",
    features: [
      "Everything in Starter",
      "Advanced AI chatbot (unlimited pages)",
      "AI inbound call handler",
      "Appointment booking integration",
      "CRM integration (HubSpot, Pipedrive etc.)",
      "Slack / email escalation alerts",
      "Conversation & call analytics",
      "Priority support (24hr response)",
      "Weekly performance reports",
    ],
    cta: "Go Pro",
    ctaHref: "/contact?plan=pro",
    featured: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "£1,499",
    period: "/month",
    tagline: "Full-scale digital transformation",
    desc: "A complete digital overhaul. Custom software, all AI systems, customer support infrastructure, and a dedicated account manager.",
    features: [
      "Everything in Pro",
      "Custom software & internal tools",
      "Customer support system (ticketing + SLA)",
      "Automated follow-up sequences",
      "Custom API integrations",
      "Mobile-accessible dashboards",
      "Dedicated account manager",
      "Priority phone support",
      "Custom onboarding & staff training",
      "Quarterly strategy reviews",
    ],
    cta: "Talk to Us",
    ctaHref: "/contact?plan=enterprise",
    featured: false,
    badge: null,
  },
];

const addons = [
  { title: "Extra Website Pages", price: "£49/page", desc: "Add additional pages beyond your plan limit." },
  { title: "Additional Chatbot Training", price: "£149 one-off", desc: "Deep-train your chatbot on new content or products." },
  { title: "Second Language Support", price: "£99/month", desc: "Serve customers in a second language via chatbot." },
  { title: "Custom Branding & Animations", price: "From £299", desc: "Bespoke motion design and advanced UI polish." },
];

const comparisonRows = [
  { feature: "Website",                  starter: "Up to 5 pages", pro: "Unlimited",     enterprise: "Custom build" },
  { feature: "AI Chatbot",               starter: "✓ Basic",       pro: "✓ Advanced",    enterprise: "✓ Advanced" },
  { feature: "AI Call Handler",          starter: "—",             pro: "✓",             enterprise: "✓" },
  { feature: "Appointment Booking",      starter: "—",             pro: "✓",             enterprise: "✓" },
  { feature: "Custom Software",          starter: "—",             pro: "—",             enterprise: "✓" },
  { feature: "Support System",           starter: "—",             pro: "—",             enterprise: "✓" },
  { feature: "CRM Integration",          starter: "—",             pro: "✓",             enterprise: "✓" },
  { feature: "Account Manager",          starter: "—",             pro: "—",             enterprise: "✓" },
  { feature: "Support Response",         starter: "48 hours",      pro: "24 hours",      enterprise: "Phone priority" },
  { feature: "Reporting",                starter: "Monthly",       pro: "Weekly",        enterprise: "Weekly + Quarterly" },
];

export default function PricingPage() {
  return (
    <div style={{ overflowX: "hidden" }}>
      <style>{`
        @media (max-width: 900px) {
          .pricing-grid { grid-template-columns: 1fr !important; max-width: 480px; margin: 0 auto; }
          .addons-grid  { grid-template-columns: 1fr 1fr !important; }
          .compare-table { font-size: 0.8rem !important; }
          .compare-table th, .compare-table td { padding: 0.75rem 1rem !important; }
        }
        @media (max-width: 600px) {
          .addons-grid { grid-template-columns: 1fr !important; }
          .compare-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        }
      `}</style>
      {/* ══ Hero ══ */}
      <section className="page-hero">
        <div className="hero-grid" />
        <div className="glow-orb glow-orb-1" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-label animate-fade-up">Pricing</div>
          <h1 className="animate-fade-up animate-delay-1" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", maxWidth: "680px", margin: "0 auto 1.25rem" }}>
            Transparent pricing. Zero surprises.
          </h1>
          <p className="animate-fade-up animate-delay-2" style={{ color: "var(--slate-600)", fontSize: "1.1rem", maxWidth: "520px", margin: "0 auto 1rem" }}>
            All plans are monthly rolling — no lock-in contracts. Scale up or down whenever your business needs it.
          </p>
        </div>
      </section>

      {/* ══ Pricing cards ══ */}
      <section className="section">
        <div className="container" style={{ padding: "0 1.5rem" }}>
          <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", alignItems: "start" }}>
            {tiers.map((tier) => (
              <div key={tier.name} className={`pricing-card${tier.featured ? " featured" : ""}`} style={{ position: "relative" }}>

                {tier.badge && (
                  <div style={{
                    position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
                    background: "var(--gradient-blue)", color: "white",
                    fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.72rem",
                    padding: "5px 18px", borderRadius: "999px", letterSpacing: "0.08em",
                    textTransform: "uppercase", boxShadow: "var(--shadow-blue)",
                    whiteSpace: "nowrap",
                  }}>
                    {tier.badge}
                  </div>
                )}

                <div style={{ marginBottom: "0.5rem" }}>
                  <p style={{
                    fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.8rem",
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: tier.featured ? "#93c5fd" : "var(--blue-600)", marginBottom: "0.4rem",
                  }}>
                    {tier.name}
                  </p>
                  <p style={{ color: tier.featured ? "#93c5fd" : "var(--blue-500)", fontSize: "0.85rem", margin: "0 0 1rem", fontStyle: "italic" }}>
                    {tier.tagline}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "2.75rem", color: tier.featured ? "white" : "var(--navy)", lineHeight: 1 }}>
                      {tier.price}
                    </span>
                    <span style={{ color: tier.featured ? "#94a3b8" : "var(--slate-500)", fontSize: "0.9rem" }}>{tier.period}</span>
                  </div>
                  <p style={{ color: tier.featured ? "#94a3b8" : "var(--slate-600)", fontSize: "0.875rem", marginTop: "0.75rem", lineHeight: 1.6 }}>
                    {tier.desc}
                  </p>
                </div>

                <div style={{ height: "1px", background: tier.featured ? "rgba(255,255,255,0.1)" : "var(--border)", margin: "1.5rem 0" }} />

                <ul className="feature-list" style={{ listStyle: "none", margin: "0 0 2rem", padding: 0 }}>
                  {tier.features.map((f) => (
                    <li key={f} style={{ color: tier.featured ? "#e2e8f0" : "var(--navy-800)" }}>{f}</li>
                  ))}
                </ul>

                <a
                  href={tier.ctaHref}
                  className={`btn ${tier.featured ? "btn-primary" : "btn-outline"}`}
                  style={{ width: "100%", justifyContent: "center", display: "flex" }}
                >
                  {tier.cta}
                </a>

              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", color: "var(--slate-500)", fontSize: "0.875rem", marginTop: "2rem" }}>
            All prices exclude VAT. Monthly rolling contract — cancel anytime with 30 days' notice.
          </p>
        </div>
      </section>

      {/* ══ Comparison table ══ */}
      <section className="section" style={{ background: "var(--off-white)", paddingTop: "4rem" }}>
        <div className="container" style={{ padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div className="section-label">Compare</div>
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)" }}>Plan comparison</h2>
          </div>

          <div className="compare-wrap" style={{ overflowX: "auto" }}>
            <table className="compare-table" style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)", minWidth: 520 }}>
              <thead>
                <tr style={{ background: "var(--navy)" }}>
                  <th style={{ textAlign: "left", padding: "1.25rem 1.5rem", color: "#94a3b8", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.85rem" }}>Feature</th>
                  {tiers.map((t) => (
                    <th key={t.name} style={{ padding: "1.25rem 1.5rem", color: t.featured ? "#60a5fa" : "white", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.95rem", textAlign: "center" }}>
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(({ feature, starter, pro, enterprise }, i) => (
                  <tr key={feature} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "white" : "var(--off-white)" }}>
                    <td style={{ padding: "1rem 1.5rem", fontFamily: "Sora, sans-serif", fontWeight: 500, fontSize: "0.9rem", color: "var(--navy)" }}>
                      {feature}
                    </td>
                    {[starter, pro, enterprise].map((val, j) => (
                      <td key={j} style={{ padding: "1rem 1.5rem", textAlign: "center", fontSize: "0.875rem", color: val === "—" ? "var(--slate-400)" : val.startsWith("✓") ? "var(--blue-600)" : "var(--navy-700)", fontWeight: val.startsWith("✓") ? 600 : 400 }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ Add-ons ══ */}
      <section className="section">
        <div className="container" style={{ padding: "0 1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <div className="section-label">Add-ons</div>
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)" }}>Optional extras</h2>
          </div>

          <div className="addons-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}>
            {addons.map(({ title, price, desc }) => (
              <div key={title} className="card" style={{ padding: "1.5rem" }}>
                <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, color: "var(--blue-600)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                  {price}
                </p>
                <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>{title}</h4>
                <p style={{ color: "var(--slate-600)", fontSize: "0.85rem", margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="pt-10 pb-10 md:pt-20 md:pb-20" style={{ background: "var(--gradient-dark)" }}>
        <div className="container" style={{ padding: "0 1.5rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "white", marginBottom: "1rem" }}>
            Not sure which plan is right?
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto 2rem" }}>
            Book a free consultation and we'll recommend the best fit for your business — no pressure, no sales tactics.
          </p>
          <a href="/contact" className="btn btn-white btn-lg">Book Free Consultation →</a>
        </div>
      </section>

    </div>
  );
}
