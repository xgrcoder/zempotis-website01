"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const legalLinks = [
  { href: "/legal/privacy",    label: "Privacy Policy"     },
  { href: "/legal/terms",      label: "Terms & Conditions" },
  { href: "/legal/cookies",    label: "Cookie Policy"      },
  { href: "/legal/compliance", label: "Legal & Compliance" },
];

export default function LegalSubNav() {
  const pathname = usePathname();

  return (
    <div
      style={{
        background: "white",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 8px rgba(15,23,42,0.04)",
      }}
    >
      <div
        className="legal-subnav container"
        style={{ padding: "0 1.5rem", overflowX: "auto" }}
      >
        <nav aria-label="Legal sub-navigation" style={{ display: "flex", justifyContent: "center" }}>
          {legalLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "1rem 1.25rem",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--blue-600)" : "var(--slate-600)",
                  textDecoration: "none",
                  borderBottom: isActive
                    ? "2px solid var(--blue-600)"
                    : "2px solid transparent",
                  transition: "color 150ms ease, border-color 150ms ease",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
