"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-client";
import { useTheme } from "@/lib/theme-context";

const F = "'IBM Plex Sans', system-ui, sans-serif";

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: "£299",
    period: "/month",
    tagline: "Get online and start automating",
    color: "#2563eb",
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
  },
  {
    key: "pro",
    name: "Pro",
    price: "£699",
    period: "/month",
    tagline: "Full automation for growing businesses",
    color: "#7c3aed",
    featured: true,
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
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "£1,499",
    period: "/month",
    tagline: "Full-scale digital transformation",
    color: "#0f172a",
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
  },
];

const TIER_ORDER: Record<string, number> = { starter: 0, pro: 1, enterprise: 2 };

export default function PlansPage() {
  const supabase = createClient();
  const { isDark, accent, card, text, muted, border } = useTheme();
  const [currentPlan, setCurrentPlan] = useState("starter");
  const [name, setName] = useState("Client");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const cid = user.user_metadata?.client_id ?? "";
      setName(user.user_metadata?.business_name ?? "Client");
      const { data: s } = await supabase
        .from("client_settings")
        .select("display_name,plan")
        .eq("client_id", cid)
        .single();
      if (s?.display_name) setName(s.display_name);
      if (s?.plan) setCurrentPlan(s.plan.toLowerCase());
    })();
  }, []);

  const currentTierIdx = TIER_ORDER[currentPlan] ?? 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .plan-card { animation: fadein 0.3s ease both; transition: box-shadow 0.2s, transform 0.2s; }
        .plan-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important; }
        .feat-item::before { content: "✓"; font-weight:700; margin-right:8px; flex-shrink:0; }
        @media (max-width: 900px) {
          .plans-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", fontFamily: F }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Link href="/portal/dashboard" style={{ fontSize: "0.75rem", color: muted, textDecoration: "none" }}>
              Overview
            </Link>
            <span style={{ color: muted, fontSize: "0.75rem" }}>›</span>
            <span style={{ fontSize: "0.75rem", color: muted }}>Plans</span>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: text, margin: 0 }}>Your Plan</h1>
          <p style={{ fontSize: "0.875rem", color: muted, marginTop: 4 }}>
            Currently on <strong style={{ color: text, textTransform: "capitalize" }}>{currentPlan}</strong>. All plans are monthly rolling — no lock-in contracts.
          </p>
        </div>

        {/* Current plan banner */}
        <div style={{
          borderRadius: 12, padding: "16px 22px", marginBottom: 28,
          background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
          boxShadow: `0 4px 20px ${accent}33`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 500, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Active Plan
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", textTransform: "capitalize" }}>
              {currentPlan} — {PLANS.find(p => p.key === currentPlan)?.price}/mo
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "6px 14px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "block" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff" }}>Active</span>
          </div>
        </div>

        {/* Plan cards */}
        <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 32 }}>
          {PLANS.map((plan, i) => {
            const isCurrent = plan.key === currentPlan;
            const isUpgrade = TIER_ORDER[plan.key] > currentTierIdx;
            const isDowngrade = TIER_ORDER[plan.key] < currentTierIdx;

            return (
              <div key={plan.key} className="plan-card" style={{
                animationDelay: `${i * 0.07}s`,
                borderRadius: 14,
                background: isCurrent ? `linear-gradient(160deg, ${plan.color}08, ${plan.color}03)` : card,
                border: isCurrent ? `2px solid ${plan.color}40` : `1px solid ${border}`,
                boxShadow: isCurrent ? `0 4px 24px ${plan.color}15` : "0 1px 4px rgba(0,0,0,0.04)",
                padding: "24px 22px",
                position: "relative",
                overflow: "hidden",
              }}>
                {isCurrent && (
                  <div style={{
                    position: "absolute", top: 0, right: 0,
                    background: plan.color, color: "#fff",
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
                    padding: "4px 12px", borderRadius: "0 14px 0 8px",
                    textTransform: "uppercase",
                  }}>
                    Current
                  </div>
                )}
                {plan.featured && !isCurrent && (
                  <div style={{
                    position: "absolute", top: 0, right: 0,
                    background: "linear-gradient(135deg, #7c3aed, #5b21b6)", color: "#fff",
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em",
                    padding: "4px 12px", borderRadius: "0 14px 0 8px",
                    textTransform: "uppercase",
                  }}>
                    Most Popular
                  </div>
                )}

                {/* Plan name & price */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `${plan.color}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: plan.color }}>
                        {plan.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{plan.name}</div>
                      <div style={{ fontSize: "0.7rem", color: muted, fontStyle: "italic" }}>{plan.tagline}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginTop: 10 }}>
                    <span style={{ fontSize: "2rem", fontWeight: 800, color: text, lineHeight: 1 }}>{plan.price}</span>
                    <span style={{ fontSize: "0.85rem", color: muted }}>{plan.period}</span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(0,0,0,0.06)", marginBottom: 16 }} />

                {/* Features */}
                <ul style={{ listStyle: "none", margin: "0 0 20px", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.features.map(f => (
                    <li key={f} className="feat-item" style={{
                      display: "flex", alignItems: "flex-start",
                      fontSize: "0.78rem", lineHeight: 1.4,
                      color: isCurrent ? text : muted,
                    }}>
                      <span style={{ color: plan.color, marginRight: 8, flexShrink: 0, fontWeight: 700 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div style={{
                    textAlign: "center", padding: "10px", borderRadius: 8,
                    background: `${plan.color}10`, border: `1px solid ${plan.color}20`,
                    fontSize: "0.78rem", fontWeight: 600, color: plan.color,
                  }}>
                    ✓ Your current plan
                  </div>
                ) : (
                  <a href={`/contact?plan=${plan.key}&upgrade=true`} style={{
                    display: "block", textAlign: "center", padding: "10px 16px",
                    borderRadius: 8, border: `1.5px solid ${plan.color}`,
                    fontSize: "0.78rem", fontWeight: 600,
                    color: isUpgrade ? "#fff" : plan.color,
                    background: isUpgrade ? plan.color : "transparent",
                    textDecoration: "none",
                    transition: "opacity 0.15s",
                  }}>
                    {isUpgrade ? `Upgrade to ${plan.name} →` : `Switch to ${plan.name}`}
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Info strip */}
        <div style={{
          borderRadius: 10, padding: "16px 20px",
          background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc", border: `1px solid ${border}`,
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: text, marginBottom: 3 }}>Need to change your plan?</div>
            <div style={{ fontSize: "0.75rem", color: muted, lineHeight: 1.5 }}>
              Contact your account manager at <a href="mailto:hello@zempotis.com" style={{ color: "#2563eb", textDecoration: "none" }}>hello@zempotis.com</a> or use the upgrade buttons above.
              All plan changes take effect from the next billing cycle. No long-term contracts — cancel anytime with 30 days&apos; notice.
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
