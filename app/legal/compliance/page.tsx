export const metadata = {
  title: "Legal & Compliance",
};

const disclaimer = (
  <div
    style={{
      padding: "1rem 1.25rem",
      background: "rgba(37,99,235,0.04)",
      border: "1px solid rgba(37,99,235,0.12)",
      borderLeft: "3px solid var(--blue-600)",
      borderRadius: "var(--radius-md)",
      marginBottom: "2.5rem",
    }}
  >
    <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.75, color: "var(--slate-600)" }}>
      <strong style={{ color: "var(--navy-800)" }}>Please note:</strong> This
      page is provided in good faith. For specific legal advice tailored to
      your situation, please consult a qualified solicitor.
    </p>
  </div>
);

export default function CompliancePage() {
  return (
    <article>
      <p style={{ fontSize: "0.825rem", color: "var(--slate-500)", marginBottom: "1.5rem" }}>
        Last updated: 19 April 2026
      </p>

      {disclaimer}

      <p>
        This page provides a reference overview of Zempotis Ltd&apos;s legal
        and compliance posture. It is intended to assist clients and prospective
        clients in conducting due diligence. For documentation requests or
        compliance enquiries, please contact us at{" "}
        <a href="mailto:hello@zempotis.co.uk">hello@zempotis.co.uk</a>.
      </p>

      <h2>1. UK GDPR and Data Protection Act 2018</h2>
      <p>
        Zempotis Ltd is committed to complying with the UK General Data
        Protection Regulation (UK GDPR) and the Data Protection Act 2018 in
        all aspects of our data processing activities. Our approach includes:
      </p>
      <ul>
        <li>
          Processing personal data only for specified, explicit, and legitimate
          purposes
        </li>
        <li>
          Collecting only the minimum data necessary for those purposes (data
          minimisation)
        </li>
        <li>
          Keeping personal data accurate, up to date, and securely stored
        </li>
        <li>
          Retaining data only for as long as necessary, in accordance with our
          data retention schedule
        </li>
        <li>
          Implementing appropriate technical and organisational security
          measures
        </li>
        <li>
          Honouring data subject rights as required by law, including the rights
          of access, rectification, erasure, and objection
        </li>
        <li>
          Entering into Data Processing Agreements (DPAs) with sub-processors
          where required
        </li>
      </ul>
      <p>
        Full details of our data processing practices are set out in our{" "}
        <a href="/legal/privacy">Privacy Policy</a>.
      </p>

      <h2>2. ICO Registration</h2>
      <p>
        Our Information Commissioner&apos;s Office (ICO) registration status
        is: <strong>[to be confirmed]</strong>.
      </p>
      <p>
        This section will be updated once registration is in place. You can
        verify the registration status of any UK organisation via the ICO&apos;s
        public register at{" "}
        <a
          href="https://ico.org.uk/ESDWebPages/Search"
          target="_blank"
          rel="noopener noreferrer"
        >
          ico.org.uk
        </a>
        .
      </p>

      <h2>3. Data Processors and Sub-Processors</h2>
      <p>
        We use the following third-party data processors and sub-processors in
        the delivery of our website and services. All processors operate under
        appropriate contractual safeguards.
      </p>
      <div className="legal-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Role</th>
              <th>Data processed</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vercel</td>
              <td>Website hosting and infrastructure</td>
              <td>IP addresses, access logs, request metadata</td>
              <td>USA (SCCs in place)</td>
            </tr>
            <tr>
              <td>Resend</td>
              <td>Transactional email delivery</td>
              <td>Contact form data, recipient email address</td>
              <td>USA (SCCs in place)</td>
            </tr>
            <tr>
              <td>Google Analytics</td>
              <td>Website analytics</td>
              <td>Anonymised usage and session data</td>
              <td>USA (SCCs in place)</td>
            </tr>
            <tr>
              <td>[Chatbot provider]</td>
              <td>AI chatbot functionality</td>
              <td>Chatbot conversation data</td>
              <td>[To be confirmed]</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        A complete and current sub-processor list is available on request.
        Contact us at{" "}
        <a href="mailto:hello@zempotis.co.uk">hello@zempotis.co.uk</a>.
      </p>

      <h2>4. Data Retention Periods</h2>
      <p>
        We retain personal data in accordance with the following schedule.
        Brackets indicate values that are pending confirmation and will be
        updated once finalised.
      </p>
      <div className="legal-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data type</th>
              <th>Retention period</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Contact form enquiries (non-client)</td>
              <td>[X months] from date of enquiry</td>
            </tr>
            <tr>
              <td>Client records — financial</td>
              <td>
                [7 years] in accordance with HMRC requirements
              </td>
            </tr>
            <tr>
              <td>Client project records</td>
              <td>[X years] from end of engagement</td>
            </tr>
            <tr>
              <td>Website analytics data</td>
              <td>
                [X months] as configured in Google Analytics
              </td>
            </tr>
            <tr>
              <td>Server access logs</td>
              <td>[X days] as retained by Vercel</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Retention periods may be extended where data is required to defend or
        pursue legal claims.
      </p>

      <h2>5. Data Breach Procedure</h2>
      <p>
        In the event of a personal data breach, Zempotis Ltd will follow the
        following procedure:
      </p>
      <ul>
        <li>
          Identify, contain, and assess the breach as quickly as reasonably
          practicable
        </li>
        <li>
          Assess the likely risk and impact on affected individuals&apos; rights
          and freedoms
        </li>
        <li>
          Notify the ICO within 72 hours if the breach is likely to result in a
          risk to individuals&apos; rights and freedoms, in accordance with UK
          GDPR Article 33
        </li>
        <li>
          Notify affected individuals without undue delay if the breach is
          likely to result in a high risk to their rights and freedoms, in
          accordance with UK GDPR Article 34
        </li>
        <li>
          Document the breach, our assessment, and all remediation steps taken
          in our internal breach register
        </li>
      </ul>
      <p>
        To report a suspected data security concern, contact us immediately at{" "}
        <a href="mailto:hello@zempotis.co.uk">hello@zempotis.co.uk</a>.
      </p>

      <h2>6. Due Diligence Documentation</h2>
      <p>
        The following documentation is available to clients and prospective
        clients on written request:
      </p>
      <ul>
        <li>
          <strong>Data Processing Agreement (DPA)</strong> — for engagements
          where Zempotis processes personal data on your behalf as a data
          processor
        </li>
        <li>
          <strong>Sub-processor list</strong> — a current, itemised list of all
          third-party providers we use in the delivery of our services
        </li>
        <li>
          <strong>Security overview</strong> — a summary of our technical and
          organisational security measures
        </li>
      </ul>
      <p>
        To request any of these documents, please contact{" "}
        <a href="mailto:hello@zempotis.co.uk">hello@zempotis.co.uk</a> with
        the subject line &ldquo;Due Diligence Request&rdquo;. We aim to respond
        within [5] business days.
      </p>

      <h2>7. Business Continuity</h2>
      <p>
        We take reasonable measures to ensure the continued availability and
        resilience of our services. Our website infrastructure is provided by
        Vercel, which operates a globally distributed, high-availability
        platform with built-in redundancy.
      </p>
      <p>
        In the event of a significant service disruption affecting clients, we
        will communicate with affected parties without undue delay, providing
        details of the issue and our remediation steps.
      </p>

      <h2>8. Professional Standards and Ethical AI Use</h2>
      <p>
        Zempotis designs, builds, and deploys AI-powered tools on behalf of
        clients. We are committed to the following principles in all AI
        implementations:
      </p>
      <ul>
        <li>
          <strong>Transparency:</strong> End users are informed — either via
          interface design or explicit disclosure — when they are interacting
          with an AI system rather than a human
        </li>
        <li>
          <strong>Accuracy:</strong> AI systems are trained, tested, and
          monitored for quality, relevance, and appropriateness to their
          intended use
        </li>
        <li>
          <strong>Human oversight:</strong> All AI deployments include defined
          escalation paths to human agents for situations the AI cannot or
          should not handle autonomously
        </li>
        <li>
          <strong>Data minimisation:</strong> AI systems are configured to
          collect only the data necessary for their intended function
        </li>
        <li>
          <strong>No harmful use:</strong> We do not build AI systems intended
          for deceptive, discriminatory, or unlawful purposes, and reserve the
          right to decline engagements that conflict with these principles
        </li>
      </ul>

      <h2>9. Compliance Enquiries and DPA Requests</h2>
      <p>
        For all compliance-related enquiries, data subject access requests, or
        to request a Data Processing Agreement, please contact:
      </p>
      <ul>
        <li>
          <strong>Company:</strong> Zempotis Ltd
        </li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:hello@zempotis.co.uk">hello@zempotis.co.uk</a>
        </li>
      </ul>
      <p>
        We aim to acknowledge all compliance enquiries within [2] business days
        and to respond fully within [5] business days.
      </p>
    </article>
  );
}
