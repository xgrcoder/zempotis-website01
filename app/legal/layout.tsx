import LegalSubNav from "../components/LegalSubNav";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        /* ── Sub-nav scrollbar hiding ── */
        .legal-subnav::-webkit-scrollbar { display: none; }
        .legal-subnav { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── Prose typography ── */
        .legal-prose h2 {
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          font-weight: 700;
          color: var(--navy);
          margin: 2.5rem 0 0.75rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
          line-height: 1.3;
        }
        .legal-prose h2:first-of-type {
          border-top: none;
          padding-top: 0;
          margin-top: 0;
        }
        .legal-prose h3 {
          font-size: 0.975rem;
          font-weight: 600;
          color: var(--navy-800);
          margin: 1.75rem 0 0.5rem;
          line-height: 1.4;
        }
        .legal-prose p {
          color: var(--slate-600);
          line-height: 1.85;
          margin: 0 0 1rem;
        }
        .legal-prose ul {
          margin: 0.5rem 0 1.25rem;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .legal-prose ul li {
          color: var(--slate-600);
          line-height: 1.75;
          padding-left: 1.5rem;
          position: relative;
          font-size: 0.95rem;
        }
        .legal-prose ul li::before {
          content: "–";
          position: absolute;
          left: 0;
          color: var(--blue-600);
          font-weight: 700;
        }
        .legal-prose strong { color: var(--navy-800); font-weight: 600; }
        .legal-prose a { color: var(--blue-600); text-decoration: none; }
        .legal-prose a:hover { text-decoration: underline; }

        /* ── Tables ── */
        .legal-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin: 1rem 0 1.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }
        .legal-table-wrap table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          min-width: 480px;
        }
        .legal-table-wrap th {
          text-align: left;
          padding: 0.7rem 1rem;
          background: var(--off-white);
          color: var(--navy);
          font-weight: 600;
          border-bottom: 1px solid var(--border);
        }
        .legal-table-wrap th:not(:last-child),
        .legal-table-wrap td:not(:last-child) {
          border-right: 1px solid var(--border);
        }
        .legal-table-wrap td {
          padding: 0.7rem 1rem;
          color: var(--slate-600);
          border-bottom: 1px solid var(--border);
          vertical-align: top;
          line-height: 1.6;
        }
        .legal-table-wrap tr:last-child td { border-bottom: none; }
      `}</style>

      {/* ── Hero ── */}
      <section className="page-hero">
        <div className="hero-grid" />
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="section-label animate-fade-up">Legal</div>
          <h1
            className="animate-fade-up animate-delay-1"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              maxWidth: "600px",
              margin: "0 auto 1rem",
            }}
          >
            Legal Information
          </h1>
          <p
            className="animate-fade-up animate-delay-2"
            style={{
              color: "var(--slate-600)",
              fontSize: "1rem",
              maxWidth: "480px",
              margin: "0 auto",
              lineHeight: 1.75,
            }}
          >
            Our policies and legal documentation — written plainly so you know
            exactly where you stand.
          </p>
        </div>
      </section>

      {/* ── Sub-nav ── */}
      <LegalSubNav />

      {/* ── Prose content ── */}
      <div style={{ padding: "3rem 1.5rem 6rem" }}>
        <div
          className="legal-prose"
          style={{ maxWidth: "760px", margin: "0 auto" }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
