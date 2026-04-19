export const metadata = {
  title: "Privacy Policy",
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
      policy is provided in good faith. For specific legal advice tailored to
      your situation, please consult a qualified solicitor.
    </p>
  </div>
);

export default function PrivacyPage() {
  return (
    <article>
      <p style={{ fontSize: "0.825rem", color: "var(--slate-500)", marginBottom: "1.5rem" }}>
        Last updated: 19 April 2026
      </p>

      {disclaimer}

      <h2>1. Introduction</h2>
      <p>
        This Privacy Policy explains how Zempotis Ltd ("Zempotis", "we", "us",
        or "our") collects, uses, stores, and protects your personal data when
        you visit our website or use our services. We are committed to
        protecting your personal information and your right to privacy in
        accordance with the UK General Data Protection Regulation (UK GDPR) and
        the Data Protection Act 2018.
      </p>
      <p>
        If you have any questions or concerns about this policy or how we handle
        your data, please contact us at{" "}
        <a href="mailto:hello@zempotis.co.uk">hello@zempotis.co.uk</a>.
      </p>

      <h2>2. Who We Are</h2>
      <p>
        Zempotis Ltd is a company registered in England and Wales. For the
        purposes of UK data protection law, we are the data controller for
        personal data collected through this website and our services.
      </p>
      <ul>
        <li>
          <strong>Company:</strong> Zempotis Ltd
        </li>
        <li>
          <strong>Email:</strong> hello@zempotis.co.uk
        </li>
        <li>
          <strong>Location:</strong> United Kingdom
        </li>
      </ul>

      <h2>3. What Data We Collect</h2>

      <h3>3.1 Contact form submissions</h3>
      <p>When you complete our contact form, we collect:</p>
      <ul>
        <li>Your first and last name</li>
        <li>Your email address</li>
        <li>Your company name (if provided)</li>
        <li>The nature of your enquiry and your message</li>
        <li>Your stated budget range (if provided)</li>
      </ul>

      <h3>3.2 Analytics and usage data</h3>
      <p>
        We use Google Analytics to collect anonymised information about how
        visitors use our website. This may include pages visited, time spent on
        the site, your geographic region (country or region level), device type
        and browser, referring website, and session duration. This data is
        aggregated and does not directly identify you.
      </p>

      <h3>3.3 Cookies</h3>
      <p>
        We use cookies and similar tracking technologies to operate and improve
        our website. Please see our{" "}
        <a href="/legal/cookies">Cookie Policy</a> for full details of the
        cookies we use and how you can control them.
      </p>

      <h3>3.4 Chatbot interactions</h3>
      <p>
        Our website includes an AI-powered chatbot widget. If you interact with
        this chatbot, your messages and any personal details you share during
        the conversation may be collected and processed by the chatbot provider.
        Please refer to Section 7 for details of our third-party providers.
      </p>

      <h3>3.5 Technical data</h3>
      <p>
        When you visit our website, our hosting provider (Vercel) may
        automatically collect certain technical data, including your IP address
        and server access logs, for security and operational purposes.
      </p>

      <h2>4. How We Use Your Data</h2>
      <p>We use the personal data we collect to:</p>
      <ul>
        <li>Respond to your enquiries and provide information about our services</li>
        <li>Fulfil our contractual obligations to you as a client</li>
        <li>Improve our website and understand how visitors use it</li>
        <li>Comply with our legal and regulatory obligations</li>
        <li>Protect our legitimate business interests</li>
      </ul>
      <p>
        We will not use your data for automated decision-making that produces
        significant legal or similarly significant effects on you without first
        obtaining your explicit consent.
      </p>

      <h2>5. Legal Basis for Processing (UK GDPR)</h2>
      <p>
        Under the UK GDPR and the Data Protection Act 2018, we must have a
        valid legal basis for each processing activity. The bases we rely on
        are:
      </p>
      <ul>
        <li>
          <strong>Contract — Article 6(1)(b):</strong> Processing necessary to
          perform a contract with you, or to take steps at your request before
          entering into a contract. This applies when we process your details
          to deliver our services.
        </li>
        <li>
          <strong>Legitimate interests — Article 6(1)(f):</strong> Processing
          necessary for our legitimate business interests, such as responding
          to general enquiries and improving our website. We have assessed that
          this does not override your fundamental rights and freedoms.
        </li>
        <li>
          <strong>Consent — Article 6(1)(a):</strong> Where we rely on consent
          — for example, for non-essential cookies — we will ask for your
          explicit permission. You may withdraw consent at any time without
          affecting the lawfulness of prior processing.
        </li>
        <li>
          <strong>Legal obligation — Article 6(1)(c):</strong> Where we are
          required to process your data to comply with a legal obligation.
        </li>
      </ul>

      <h2>6. How Long We Keep Your Data</h2>
      <p>
        We retain personal data only for as long as necessary for the purposes
        for which it was collected:
      </p>
      <ul>
        <li>
          <strong>Contact form enquiries:</strong> [X months] from the date of
          your enquiry, unless an ongoing client relationship is formed
        </li>
        <li>
          <strong>Client records:</strong> [X years] from the end of the client
          relationship, in accordance with HMRC requirements
        </li>
        <li>
          <strong>Analytics data:</strong> Governed by Google Analytics&apos;
          data retention settings, currently configured to [X months] in our
          account
        </li>
        <li>
          <strong>Server access logs:</strong> [X days] as retained by Vercel
          for operational and security purposes
        </li>
      </ul>
      <p>
        Retention periods may be extended where necessary to defend or pursue
        legal claims.
      </p>

      <h2>7. Who We Share Your Data With</h2>
      <p>
        We do not sell your personal data. We share data only with trusted
        third-party service providers who process it on our behalf, under
        appropriate data processing agreements:
      </p>
      <div className="legal-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Purpose</th>
              <th>Privacy information</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Resend</td>
              <td>Delivery of contact form email notifications</td>
              <td>resend.com/privacy</td>
            </tr>
            <tr>
              <td>Google Analytics</td>
              <td>Website analytics and usage measurement</td>
              <td>policies.google.com/privacy</td>
            </tr>
            <tr>
              <td>Vercel</td>
              <td>Website hosting and infrastructure</td>
              <td>vercel.com/legal/privacy-policy</td>
            </tr>
            <tr>
              <td>[Chatbot provider]</td>
              <td>AI chatbot functionality on our website</td>
              <td>[To be confirmed]</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Each provider is required to handle your data only as instructed by us
        and in accordance with applicable data protection law.
      </p>

      <h2>8. International Data Transfers</h2>
      <p>
        Some of our service providers process data outside the United Kingdom.
        Where this occurs, we ensure that appropriate safeguards are in place —
        such as Standard Contractual Clauses (SCCs) approved by the UK
        Information Commissioner&apos;s Office (ICO), or equivalent transfer
        mechanisms. If you would like further information about international
        transfers, please contact us.
      </p>

      <h2>9. Your Rights Under UK GDPR</h2>
      <p>Under UK data protection law, you have the following rights:</p>
      <ul>
        <li>
          <strong>Right of access:</strong> Request a copy of the personal data
          we hold about you.
        </li>
        <li>
          <strong>Right to rectification:</strong> Ask us to correct inaccurate
          or incomplete data.
        </li>
        <li>
          <strong>Right to erasure:</strong> Ask us to delete your personal data
          in certain circumstances (the &ldquo;right to be forgotten&rdquo;).
        </li>
        <li>
          <strong>Right to restriction:</strong> Ask us to restrict how we
          process your data in certain circumstances.
        </li>
        <li>
          <strong>Right to data portability:</strong> In certain circumstances,
          request that we provide your data in a structured, commonly used, and
          machine-readable format.
        </li>
        <li>
          <strong>Right to object:</strong> Object to the processing of your
          data where we rely on legitimate interests as our legal basis.
        </li>
        <li>
          <strong>Rights relating to automated decision-making:</strong> The
          right not to be subject to a decision based solely on automated
          processing where it produces a significant effect on you.
        </li>
        <li>
          <strong>Right to withdraw consent:</strong> Where processing is based
          on consent, you may withdraw it at any time.
        </li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{" "}
        <a href="mailto:hello@zempotis.co.uk">hello@zempotis.co.uk</a>. We will
        respond within one calendar month. There is no charge for making a
        request unless requests are manifestly unfounded or excessive.
      </p>
      <p>
        You also have the right to lodge a complaint with the ICO at{" "}
        <a
          href="https://ico.org.uk"
          target="_blank"
          rel="noopener noreferrer"
        >
          ico.org.uk
        </a>{" "}
        or by calling 0303 123 1113.
      </p>

      <h2>10. Data Security</h2>
      <p>
        We take appropriate technical and organisational measures to protect
        your personal data against accidental loss, unauthorised access, use,
        alteration, or disclosure. Our website is served over HTTPS, and access
        to personal data is restricted to authorised personnel only.
      </p>
      <p>
        No transmission of data over the internet is completely secure. While
        we take reasonable precautions, we cannot guarantee the absolute
        security of information you transmit to us.
      </p>

      <h2>11. Children&apos;s Data</h2>
      <p>
        Our services are not directed at children under the age of 16. We do
        not knowingly collect or process personal data from anyone under 16. If
        you believe a child has provided personal data to us, please contact us
        and we will take steps to delete it promptly.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Any material
        changes will be reflected on this page with an updated &ldquo;Last
        updated&rdquo; date. We encourage you to review this policy
        periodically to stay informed about how we protect your information.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        For any questions about this Privacy Policy or to exercise your data
        protection rights, please contact:
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
    </article>
  );
}