// app/page.tsx — Zempotis Homepage

export const metadata = {
  title: "Zempotis – AI Agency for Growing Businesses",
};

const services = [
  {
    title: "Business Websites",
    desc: "Modern, responsive websites built to impress and convert — optimised for speed, SEO, and your specific audience.",
    href: "/services#websites",
    color: "#2563eb",
    gradient: "linear-gradient(135deg,#2563eb,#3b82f6)",
    shadow: "rgba(37,99,235,0.28)",
    icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
  },
  {
    title: "AI Chatbots",
    desc: "Intelligent chat agents trained on your business. Available 24/7 to answer questions, qualify leads, and book appointments.",
    href: "/services#chatbots",
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg,#0ea5e9,#38bdf8)",
    shadow: "rgba(14,165,233,0.28)",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    title: "AI Call Handlers",
    desc: "Never miss an inbound call. Our AI agents greet callers, collect details, route enquiries, and send you summaries instantly.",
    href: "/services#call-handlers",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)",
    shadow: "rgba(124,58,237,0.28)",
    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  },
  {
    title: "Custom Software",
    desc: "Bespoke tools built around your workflows — dashboards, CRMs, booking systems, internal portals and more.",
    href: "/services#software",
    color: "#059669",
    gradient: "linear-gradient(135deg,#059669,#34d399)",
    shadow: "rgba(5,150,105,0.28)",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    title: "Support Systems",
    desc: "Structured customer support infrastructure: ticketing, follow-up automation, and engagement tools that keep clients happy.",
    href: "/services#support",
    color: "#d97706",
    gradient: "linear-gradient(135deg,#d97706,#fbbf24)",
    shadow: "rgba(217,119,6,0.28)",
    icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
  },
];

const stats = [
  { value: "24/7",  label: "AI availability"         },
  { value: "3×",    label: "Faster response times"   },
  { value: "60%",   label: "Reduction in admin time" },
  { value: "100+",  label: "Businesses supported"    },
];

const howItWorks = [
  { step: "01", title: "Discovery",  desc: "We get to know your business, goals, pain points, and what a perfect outcome looks like for you." },
  { step: "02", title: "Build",      desc: "Our team designs and builds your custom stack — website, AI systems, and software working as one." },
  { step: "03", title: "Launch",     desc: "We deploy everything, walk you through it, and stay on hand so you're confident from day one." },
];

const testimonials = [
  { quote: "Since deploying the Zempotis chatbot, our enquiry response time dropped from hours to seconds. Our team is finally free to focus on delivery, not inboxes.", name: "Sarah T.",  role: "Operations Director, RetailFlow",    initial: "S" },
  { quote: "The AI call handler alone saved us two full days per week. It handles routine calls perfectly and only escalates what genuinely needs our attention.",         name: "Marcus D.", role: "Founder, BuildRight Contractors",     initial: "M" },
  { quote: "The website and support system Zempotis built gave us a professional edge we didn't have before. Clients comment on it constantly.",                           name: "Priya L.",  role: "CEO, Luminate Consulting",            initial: "P" },
];

const pricingTiers = [
  {
    name: "Starter", price: "£299", period: "/month",
    desc: "Perfect for small businesses ready to go digital and automate basic customer interactions.",
    features: ["Modern responsive website", "AI chatbot (up to 3 pages)", "Lead capture & notifications", "Monthly performance report", "Email support"],
    cta: "Start with Starter", featured: false,
  },
  {
    name: "Pro", price: "£699", period: "/month",
    desc: "For growing businesses that need a complete digital presence with full AI automation.",
    features: ["Everything in Starter", "Advanced AI chatbot (unlimited pages)", "AI inbound call handler", "Appointment booking integration", "Priority email & chat support", "Weekly performance reports"],
    cta: "Go Pro", featured: true,
  },
  {
    name: "Enterprise", price: "£1,499", period: "/month",
    desc: "Full-scale digital transformation with custom software and dedicated support.",
    features: ["Everything in Pro", "Custom software & systems", "Customer support system setup", "Dedicated account manager", "Priority phone support", "Custom integrations & API"],
    cta: "Talk to Us", featured: false,
  },
];

export default function HomePage() {
  return (
    <>
      <style>{`
        .service-card-wrap { text-decoration: none; display: block; height: 100%; }
        .service-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          height: 100%;
          transition: transform 260ms cubic-bezier(0.34,1.4,0.64,1), box-shadow 260ms ease, border-color 260ms ease;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .service-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(37,99,235,0.13); }
        .service-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          opacity: 0;
          transition: opacity 260ms ease;
        }
        .service-card:hover::before { opacity: 1; }
        .step-card {
          text-align: center;
          padding: 2.5rem 2rem;
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          transition: transform 260ms ease, box-shadow 260ms ease;
        }
        .step-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
        @media (max-width: 900px) {
          .hero-badges { justify-content: center !important; }
          .hero-cta { justify-content: center !important; }
        }
        @media (max-width: 600px) {
          .service-card { padding: 1.5rem; }
          .step-card { padding: 2rem 1.5rem; }
        }
      `}</style>

      <div>

        {/* ══════════ HERO ══════════ */}
        <section style={{ position: "relative", overflow: "hidden", padding: "7rem 0 6rem", background: "var(--gradient-hero)", textAlign: "center" }}>
          <div className="hero-grid" />
          <div className="glow-orb glow-orb-1" />
          <div className="glow-orb glow-orb-2" />

          <div className="container" style={{ position: "relative", zIndex: 1 }}>

            <div className="animate-fade-up section-label">✦ AI Agency</div>

            <h1
              className="animate-fade-up animate-delay-1"
              style={{
                fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
                fontWeight: 800,
                color: "var(--navy)",
                letterSpacing: "-0.03em",
                maxWidth: "860px",
                margin: "0 auto 1.5rem",
                lineHeight: 1.1,
              }}
            >
              Build a business that runs{" "}
              <span style={{ color: "#2563eb" }}>smarter</span>
              , not harder
            </h1>

            <p
              className="animate-fade-up animate-delay-2"
              style={{ fontSize: "1.1rem", color: "var(--slate-600)", maxWidth: "580px", margin: "0 auto 2.5rem", lineHeight: 1.75 }}
            >
              We build websites, AI chatbots, call handlers, and custom software for UK businesses — so your team spends less time on admin and more time on growth.
            </p>

            <div className="animate-fade-up animate-delay-3 hero-cta" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/contact" className="btn btn-primary btn-lg">Book a Free Consultation →</a>
              <a href="/services" className="btn btn-outline btn-lg">Explore Services</a>
            </div>

            <div className="animate-fade-up animate-delay-4 hero-badges" style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap", marginTop: "3rem" }}>
              {["No long-term lock-in", "UK-based team", "Setup in days, not months"].map((badge) => (
                <div key={badge} style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--slate-600)", fontSize: "0.875rem" }}>
                  <span style={{ color: "var(--blue-600)", fontWeight: 700 }}>✓</span> {badge}
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════════ STATS ══════════ */}
        <section className="stats-bar">
          <div className="container">
            <div className="grid-stats">
              {stats.map(({ value, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.5rem)", color: "white", lineHeight: 1 }}>{value}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.875rem", marginTop: "0.5rem" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ SERVICES ══════════ */}
        <section className="section" id="services">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div className="section-label">What We Build</div>
              <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", marginBottom: "1rem" }}>Every tool your business needs</h2>
              <p style={{ color: "var(--slate-600)", fontSize: "1.05rem", maxWidth: "520px", margin: "0 auto" }}>
                Five interconnected services. One cohesive system. Designed to save time, impress customers, and scale with you.
              </p>
            </div>

            <div className="grid-services-top" style={{ marginBottom: "1.5rem" }}>
              {services.slice(0, 3).map((s) => <ServiceCard key={s.title} {...s} />)}
            </div>
            <div className="grid-services-bottom">
              {services.slice(3).map((s) => <ServiceCard key={s.title} {...s} />)}
            </div>

            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <a href="/services" className="btn btn-outline">See All Services →</a>
            </div>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section className="section" style={{ background: "var(--off-white)" }} id="how">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div className="section-label">The Process</div>
              <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)" }}>Up and running in three steps</h2>
            </div>
            <div className="grid-steps">
              {howItWorks.map(({ step, title, desc }) => (
                <div key={step} className="step-card">
                  <div style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 48, height: 48, borderRadius: "50%",
                    background: "var(--gradient-blue)",
                    boxShadow: "var(--shadow-blue)",
                    fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "0.9rem", color: "white",
                    marginBottom: "1.5rem",
                  }}>
                    {step}
                  </div>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>{title}</h3>
                  <p style={{ color: "var(--slate-600)", lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <a href="/contact" className="btn btn-primary">Start Your Project →</a>
            </div>
          </div>
        </section>

        {/* ══════════ PRICING ══════════ */}
        <section className="section" id="pricing">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div className="section-label">Transparent Pricing</div>
              <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", marginBottom: "1rem" }}>Simple, honest plans</h2>
              <p style={{ color: "var(--slate-600)", fontSize: "1.05rem" }}>No hidden fees. Cancel anytime. Start with the plan that fits you now and scale up when you&apos;re ready.</p>
            </div>
            <div className="grid-pricing">
              {pricingTiers.map((tier) => <PricingCard key={tier.name} {...tier} />)}
            </div>
            <p style={{ textAlign: "center", color: "var(--slate-500)", fontSize: "0.875rem", marginTop: "2rem" }}>
              Not sure which plan is right for you?{" "}
              <a href="/contact" style={{ color: "var(--blue-600)", fontWeight: 600 }}>Talk to us →</a>
            </p>
          </div>
        </section>

        {/* ══════════ TESTIMONIALS ══════════ */}
        <section className="section" style={{ background: "var(--off-white)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <div className="section-label">Client Stories</div>
              <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)" }}>What our clients say</h2>
            </div>
            <div className="grid-testimonials">
              {testimonials.map((t) => <TestimonialCard key={t.name} {...t} />)}
            </div>
          </div>
        </section>

        {/* ══════════ CTA BANNER ══════════ */}
        <section style={{ padding: "6rem 0", background: "var(--gradient-dark)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-100px", right: "-100px", width: 400, height: 400, background: "radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <div className="section-label" style={{ color: "#93c5fd", background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}>Ready to get started?</div>
            <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.75rem)", color: "white", marginBottom: "1.25rem" }}>Let&apos;s build something great together</h2>
            <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: "500px", margin: "0 auto 2.5rem" }}>
              Book a free 30-minute consultation. We&apos;ll understand your business and show you exactly what we&apos;d build.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <a href="/contact" className="btn btn-white btn-lg">Book Free Consultation</a>
              <a href="/price-plans" className="btn btn-ghost btn-lg">View Pricing</a>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}

// ── Service Card ──────────────────────────────────────────────────
function ServiceCard({ title, desc, href, color, gradient, icon }: {
  title: string; desc: string; href: string;
  color: string; gradient: string; icon: string;
}) {
  return (
    <a href={href} className="service-card-wrap">
      <div className="service-card" style={{ borderTop: `3px solid ${color}` }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: gradient,
          boxShadow: `0 4px 16px ${color}44`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "1.25rem",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </div>

        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.6rem", color: "var(--navy)" }}>{title}</h3>
        <p style={{ color: "var(--slate-600)", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 1.25rem", flex: 1 }}>{desc}</p>

        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.82rem" }}>
          Explore
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </span>
      </div>
    </a>
  );
}

// ── Pricing Card ──────────────────────────────────────────────────
function PricingCard({ name, price, period, desc, features, cta, featured }: {
  name: string; price: string; period: string; desc: string;
  features: string[]; cta: string; featured: boolean;
}) {
  return (
    <div className={`pricing-card${featured ? " featured" : ""}`}>
      {featured && (
        <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: "var(--gradient-blue)", color: "white", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.75rem", padding: "5px 18px", borderRadius: "999px", letterSpacing: "0.06em", textTransform: "uppercase", boxShadow: "var(--shadow-blue)", whiteSpace: "nowrap" }}>
          Most Popular
        </div>
      )}
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase", color: featured ? "#93c5fd" : "var(--blue-600)", marginBottom: "0.5rem" }}>{name}</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
          <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "2.75rem", color: featured ? "white" : "var(--navy)", lineHeight: 1 }}>{price}</span>
          <span style={{ color: featured ? "#94a3b8" : "var(--slate-500)", fontSize: "0.9rem" }}>{period}</span>
        </div>
        <p style={{ color: featured ? "#94a3b8" : "var(--slate-600)", fontSize: "0.875rem", marginTop: "0.75rem", lineHeight: 1.6 }}>{desc}</p>
      </div>
      <ul className="feature-list" style={{ listStyle: "none", margin: "0 0 2rem", padding: 0 }}>
        {features.map((f) => <li key={f} style={{ color: featured ? "#e2e8f0" : "var(--navy-800)" }}>{f}</li>)}
      </ul>
      <a href="/contact" className={`btn ${featured ? "btn-primary" : "btn-outline"}`} style={{ width: "100%", justifyContent: "center" }}>{cta}</a>
    </div>
  );
}

// ── Testimonial Card ──────────────────────────────────────────────
function TestimonialCard({ quote, name, role, initial }: { quote: string; name: string; role: string; initial: string }) {
  return (
    <div className="testimonial-card">
      <div style={{ color: "var(--blue-500)", fontSize: "1.75rem", marginBottom: "0.75rem", fontFamily: "Georgia, serif", lineHeight: 1 }}>&ldquo;</div>
      <p style={{ color: "var(--navy-800)", lineHeight: 1.7, fontSize: "0.95rem", marginBottom: "1.5rem" }}>{quote}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: 40, height: 40, background: "var(--gradient-blue)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>{initial}</div>
        <div>
          <div style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "var(--navy)" }}>{name}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--slate-500)" }}>{role}</div>
        </div>
      </div>
    </div>
  );
}
