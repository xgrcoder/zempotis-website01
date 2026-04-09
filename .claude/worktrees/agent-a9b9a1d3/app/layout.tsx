import "./globals.css";
import Link from "next/link";
import SiteShell from "./components/SiteShell";

export const metadata = {
  title: { default: "Zempotis – Smarter Digital Solutions", template: "%s | Zempotis" },
  description:
    "Zempotis helps businesses streamline operations with modern websites, AI chatbots, AI call handlers, custom software, and customer support systems.",
  keywords: ["AI chatbot", "AI call handler", "business website", "custom software", "digital solutions"],
};

const footerServices = [
  { href: "/services#websites",      label: "Business Websites" },
  { href: "/services#chatbots",      label: "AI Chatbots"       },
  { href: "/services#call-handlers", label: "AI Call Handlers"  },
  { href: "/services#software",      label: "Custom Software"   },
  { href: "/services#support",       label: "Support Systems"   },
];

const footer = (
  <footer style={{ background: "var(--navy)", color: "white", marginTop: 0 }}>
    <div className="container" style={{ padding: "5rem 1.5rem 3rem" }}>
      <div className="grid-footer">
        <div className="footer-brand-col">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
            <div style={{
              width: 36, height: 36,
              background: "var(--gradient-blue)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "white", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1rem" }}>Z</span>
            </div>
            <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>Zempotis</span>
          </div>
          <p style={{ color: "#94a3b8", lineHeight: 1.7, fontSize: "0.9rem", maxWidth: "300px" }}>
            Smarter digital solutions for modern businesses. We build the technology that lets your team focus on what they do best.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            {[
              { href: "https://instagram.com/zempotis",        label: "Instagram" },
              { href: "https://linkedin.com/company/zempotis", label: "LinkedIn"  },
              { href: "https://twitter.com/zempotis",          label: "Twitter"   },
            ].map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Zempotis on ${label}`}
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94a3b8",
                  fontSize: "0.8rem",
                  fontFamily: "Sora, sans-serif",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.9rem", marginBottom: "1.25rem", color: "white" }}>Services</h4>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {footerServices.map(({ href, label }) => (
              <li key={href}>
                <a href={href} style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.875rem" }}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.9rem", marginBottom: "1.25rem", color: "white" }}>Company</h4>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { href: "/about",       label: "About Us" },
              { href: "/price-plans", label: "Pricing"  },
              { href: "/contact",     label: "Contact"  },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.875rem" }}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: "0.9rem", marginBottom: "1.25rem", color: "white" }}>Legal</h4>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { href: "/privacy", label: "Privacy Policy"     },
              { href: "/terms",   label: "Terms & Conditions" },
              { href: "/cookies", label: "Cookie Policy"      },
            ].map(({ href, label }) => (
              <li key={href}>
                <a href={href} style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.875rem" }}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="container footer-bottom-bar" style={{ padding: "1.25rem 1.5rem" }}>
        <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>&copy; {new Date().getFullYear()} Zempotis Ltd. All rights reserved.</p>
        <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>Smarter Digital Solutions</p>
      </div>
    </div>
  </footer>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-THRB5T385E');
            `,
          }}
        />
      </head>
      <body>
        <SiteShell footer={footer}>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}