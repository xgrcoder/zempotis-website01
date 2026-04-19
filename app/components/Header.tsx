"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/",                 label: "Home"     },
  { href: "/services",         label: "Services" },
  { href: "/price-plans",      label: "Pricing"  },
  { href: "/about",            label: "About"    },
  { href: "/legal/compliance", label: "Legal"    },
  { href: "/contact",          label: "Contact"  },
  { href: "/portal",           label: "Login"    },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 20px rgba(15,23,42,0.06)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          height: "72px",
        }}
      >
        {/* ── Logo ── */}
        <Link
          href="/"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}
        >
          <div
            style={{
              width: 36, height: 36,
              background: "var(--gradient-blue)",
              borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow-blue)",
            }}
          >
            <span style={{ color: "white", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1rem" }}>Z</span>
          </div>
          <span style={{ fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "var(--navy)", letterSpacing: "-0.02em" }}>
            Zempotis
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="nav-desktop" aria-label="Main navigation">
          <ul style={{ display: "flex", gap: "2rem", listStyle: "none", margin: 0, padding: 0 }}>
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  style={{
                    fontFamily: "Sora, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    color: "var(--navy-700)",
                    textDecoration: "none",
                    padding: "6px 2px",
                    borderBottom: "2px solid transparent",
                    transition: "color 150ms, border-color 150ms",
                  }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Desktop CTA ── */}
        <Link
          href="/contact"
          className="btn btn-primary nav-cta-desktop"
          style={{ padding: "10px 22px", fontSize: "0.875rem" }}
        >
          Get Started →
        </Link>

        {/* ── Hamburger ── */}
        <button
          className="nav-hamburger"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span style={{ transform: open ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
          <span style={{ opacity: open ? 0 : 1, transform: open ? "translateX(-10px)" : "none" }} />
          <span style={{ transform: open ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
        </button>
      </div>

      {/* ── Mobile Dropdown ── */}
      <nav
        className={`nav-mobile-menu${open ? " open" : ""}`}
        aria-label="Mobile navigation"
      >
        {navLinks.map(({ href, label }) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </Link>
        ))}
        <Link
          href="/contact"
          className="btn btn-primary nav-mobile-cta"
          onClick={() => setOpen(false)}
        >
          Get Started →
        </Link>
      </nav>
    </header>
  );
}
